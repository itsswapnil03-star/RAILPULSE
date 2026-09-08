from fastapi import FastAPI
from pydantic import BaseModel, Field

from model import PredictRequest, eta_model

app = FastAPI(
    title="RailPulse ETA Service",
    description="Lightweight ETA predictor for SIH26028. Simulated model — replace with trained LSTM/GBDT.",
    version="1.0.0",
)


class PredictIn(BaseModel):
    scheduled_epoch_ms: int
    now_epoch_ms: int
    distance_remaining_km: float = Field(ge=0)
    current_delay_min: float
    congestion_factor: float = Field(ge=0, le=1.5)
    weather_factor: float = Field(ge=0, le=1.5)
    cruise_speed_kmh: float = 75.0


class PredictOut(BaseModel):
    predicted_epoch_ms: int
    delay_minutes: float
    confidence_low_epoch_ms: int
    confidence_high_epoch_ms: int
    confidence_half_width_min: float
    model_name: str


@app.get("/health")
def health():
    return {"ok": True, "model": eta_model.name}


@app.post("/predict", response_model=PredictOut)
def predict(body: PredictIn):
    result = eta_model.predict(
        PredictRequest(
            scheduled_epoch_ms=body.scheduled_epoch_ms,
            now_epoch_ms=body.now_epoch_ms,
            distance_remaining_km=body.distance_remaining_km,
            current_delay_min=body.current_delay_min,
            congestion_factor=body.congestion_factor,
            weather_factor=body.weather_factor,
            cruise_speed_kmh=body.cruise_speed_kmh,
        )
    )
    return PredictOut(**result.__dict__)
