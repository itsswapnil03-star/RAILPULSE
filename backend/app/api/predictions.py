"""REST routers for on-demand ETA predictions + SHAP explanations."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.maharashtra_stations import STATION_MAP
from app.ml.inference.predict import predict_delay
from app.simulation.engine import get_engine

router = APIRouter()


class PredictRequest(BaseModel):
    train_id: str | None = None
    hour_of_day: int | None = Field(default=None, ge=0, le=23)
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    distance_remaining_km: float | None = None
    segment_distance_km: float | None = None
    junction_congestion_score: float | None = Field(default=None, ge=0, le=1)
    weather_flag: int | None = Field(default=None, ge=0, le=1)
    is_junction_next: int | None = None
    is_major_next: int | None = None
    recent_delay_trend: float | None = None
    current_delay_min: float | None = None
    train_type: str | None = None
    speed_kmph: float | None = None
    passenger_load: float | None = Field(default=None, ge=0, le=1)
    next_station_name: str | None = None
    scheduled_arrival: str | None = None


@router.post("/predict")
def predict(req: PredictRequest):
    state = req.model_dump(exclude_none=True)
    train_id = state.pop("train_id", None)
    next_name = state.pop("next_station_name", None)

    if train_id:
        t = get_engine().get_train(train_id)
        if not t:
            raise HTTPException(status_code=404, detail="Train not found")
        live = t.to_live_state()
        # Merge live features with any overrides
        merged = {
            "current_delay_min": live["delay_minutes"],
            "speed_kmph": live["speed_kmph"],
            "train_type": live["train_type"],
            "scheduled_arrival": live["scheduled_arrival"],
            **state,
        }
        next_name = next_name or live.get("next_station_name")
        result = predict_delay(merged, next_station_name=next_name)
        result["train_id"] = t.id
        result["station_id"] = live.get("next_station_id")
        result["station_name"] = next_name
        return result

    result = predict_delay(state, next_station_name=next_name)
    return result


@router.get("/trains/{train_id}/prediction")
def train_prediction(train_id: str):
    t = get_engine().get_train(train_id)
    if not t:
        raise HTTPException(status_code=404, detail="Train not found")
    live = t.to_live_state()
    nxt = live.get("next_station_id")
    st = STATION_MAP.get(nxt) if nxt else None
    return {
        "train_id": t.id,
        "station_id": nxt,
        "station_name": st["name"] if st else live.get("next_station_name"),
        "predicted_delay_min": live["predicted_delay_min"],
        "confidence_low": live["confidence_low"],
        "confidence_high": live["confidence_high"],
        "predicted_eta": live["predicted_eta"],
        "explanation": live["explanation"],
        "explanation_factors": live["explanation_factors"],
    }
