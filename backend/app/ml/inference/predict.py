"""
Load the persisted XGBoost model + SHAP explainer and run inference.

Falls back to a transparent heuristic if the joblib artifacts are missing
(e.g. first boot before training). The heuristic uses the same features so
the API contract never changes.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.ml.training.dataset import FEATURE_COLUMNS, TRAIN_TYPE_CODES
from app.ml.inference.explain import shap_to_factors
from app.schemas.prediction import ExplanationFactor

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

_model = None
_explainer = None
_residual_std = 4.5
_loaded = False


def _try_load() -> None:
    global _model, _explainer, _residual_std, _loaded
    if _loaded:
        return
    _loaded = True
    try:
        import joblib
        import json

        model_path = MODEL_DIR / "xgboost_model.joblib"
        shap_path = MODEL_DIR / "shap_explainer.joblib"
        metrics_path = MODEL_DIR / "metrics.json"
        if model_path.exists():
            _model = joblib.load(model_path)
        if shap_path.exists():
            _explainer = joblib.load(shap_path)
        if metrics_path.exists():
            metrics = json.loads(metrics_path.read_text())
            _residual_std = float(metrics.get("residual_std", 4.5))
    except Exception as exc:  # pragma: no cover - defensive
        print(f"[ml] could not load artifacts, using heuristic: {exc}")
        _model = None
        _explainer = None


def features_from_state(state: Dict[str, Any]) -> Dict[str, float]:
    now = datetime.utcnow()
    hour = int(state.get("hour_of_day", now.hour))
    dow = int(state.get("day_of_week", now.weekday()))
    ttype = state.get("train_type", "express")
    tod_m = 1.5 if 7 <= hour < 10 else 1.4 if 17 <= hour < 20 else 0.8 if hour >= 22 or hour < 6 else 1.0
    dow_m = [1.2, 1.1, 1.1, 1.1, 1.3, 1.0, 0.9][dow % 7]
    return {
        "hour_of_day": hour,
        "day_of_week": dow,
        "distance_remaining_km": float(state.get("distance_remaining_km", 80)),
        "segment_distance_km": float(state.get("segment_distance_km", 20)),
        "junction_congestion_score": float(state.get("junction_congestion_score", 0.3)),
        "weather_flag": float(state.get("weather_flag", 0)),
        "is_junction_next": float(state.get("is_junction_next", 0)),
        "is_major_next": float(state.get("is_major_next", 0)),
        "recent_delay_trend": float(state.get("recent_delay_trend", 4)),
        "current_delay_min": float(state.get("current_delay_min", 0)),
        "train_type_code": float(TRAIN_TYPE_CODES.get(ttype, 0)),
        "speed_kmph": float(state.get("speed_kmph", 75)),
        "passenger_load": float(state.get("passenger_load", 0.55)),
        "time_of_day_multiplier": float(state.get("time_of_day_multiplier", tod_m)),
        "day_of_week_multiplier": float(state.get("day_of_week_multiplier", dow_m)),
    }


def _heuristic_predict(feats: Dict[str, float]) -> Tuple[float, np.ndarray]:
    """Deterministic stand-in that mirrors the synthetic data generating process."""
    delay = 1.5
    delay += 0.04 * feats["distance_remaining_km"]
    delay += 12.0 * feats["junction_congestion_score"]
    delay += 8.0 * feats["weather_flag"]
    delay += 0.35 * feats["recent_delay_trend"]
    delay += 0.25 * feats["current_delay_min"]
    delay += 16.0 * (feats["time_of_day_multiplier"] - 1.0)
    delay += 15.0 * (feats["day_of_week_multiplier"] - 1.0)
    delay += 3.5 * feats["is_junction_next"]
    delay += 2.0 * feats["is_major_next"]
    delay += 4.0 * feats["passenger_load"]
    delay = float(np.clip(delay, 0, 90))
    # Approximate SHAP-like attributions for the heuristic
    shap_like = np.array(
        [
            0.4 * (feats["hour_of_day"] - 12) / 6,
            1.5 * (feats["day_of_week_multiplier"] - 1.0) * 5,
            0.04 * feats["distance_remaining_km"] * 0.3,
            0.02 * feats["segment_distance_km"],
            12.0 * feats["junction_congestion_score"] * 0.7,
            8.0 * feats["weather_flag"],
            3.5 * feats["is_junction_next"],
            2.0 * feats["is_major_next"],
            0.35 * feats["recent_delay_trend"] * 0.6,
            0.25 * feats["current_delay_min"] * 0.5,
            -1.0 if feats["train_type_code"] == 1 else 0.4,
            (75 - feats["speed_kmph"]) * 0.05,
            4.0 * feats["passenger_load"] * 0.5,
            16.0 * (feats["time_of_day_multiplier"] - 1.0) * 0.6,
            15.0 * (feats["day_of_week_multiplier"] - 1.0) * 0.5,
        ]
    )
    return delay, shap_like


def predict_delay(
    state: Dict[str, Any],
    next_station_name: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Return predicted delay, confidence band, and SHAP explanations.
    """
    _try_load()
    feats = features_from_state(state)
    row = np.array([[feats[c] for c in FEATURE_COLUMNS]], dtype=float)

    if _model is not None:
        point = float(_model.predict(row)[0])
        if _explainer is not None:
            sv = _explainer.shap_values(row)
            shap_vec = np.array(sv[0] if np.array(sv).ndim > 1 else sv)
        else:
            _, shap_vec = _heuristic_predict(feats)
    else:
        point, shap_vec = _heuristic_predict(feats)

    point = float(np.clip(point, 0, 90))
    band = max(2.0, _residual_std * 0.85)
    low = float(max(0.0, point - band))
    high = float(min(90.0, point + band))

    factors, phrases = shap_to_factors(shap_vec, feats, next_station_name=next_station_name)

    scheduled = state.get("scheduled_arrival")
    predicted_eta = None
    if scheduled:
        predicted_eta = _shift_hhmm(scheduled, point)

    return {
        "predicted_delay_min": round(point, 1),
        "confidence_low": round(low, 1),
        "confidence_high": round(high, 1),
        "explanation": phrases,
        "explanation_factors": [f.model_dump() for f in factors],
        "predicted_eta": predicted_eta,
        "features": feats,
    }


def _shift_hhmm(hhmm: str, delay_min: float) -> str:
    try:
        h, m = [int(x) for x in hhmm.split(":")]
        dt = datetime(2000, 1, 1, h, m) + timedelta(minutes=int(round(delay_min)))
        return dt.strftime("%H:%M")
    except Exception:
        return hhmm
