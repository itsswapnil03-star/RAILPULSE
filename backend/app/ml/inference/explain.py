"""
Map SHAP feature contributions to plain-language delay explanations.

This is the product differentiator: every ETA is accompanied by 2–3
human-readable reasons that reach the frontend over REST and WebSocket.
"""
from __future__ import annotations

from typing import Dict, List, Tuple

import numpy as np

from app.ml.training.dataset import FEATURE_COLUMNS
from app.schemas.prediction import ExplanationFactor

FEATURE_PHRASES = {
    "hour_of_day": ("Evening / morning peak effect", "Off-peak time-of-day benefit"),
    "day_of_week": ("Weekday crowding effect", "Weekend traffic easing"),
    "distance_remaining_km": ("Long remaining haul", "Short remaining distance"),
    "segment_distance_km": ("Long next-segment run", "Short hop to next station"),
    "junction_congestion_score": ("Junction congestion", "Clear junction throughput"),
    "weather_flag": ("Weather slowdown", "Fair weather"),
    "is_junction_next": ("Next stop is a junction", "Next stop is a wayside station"),
    "is_major_next": ("Major-station passenger load", "Light next-stop boarding"),
    "recent_delay_trend": ("Recent delay trend carrying forward", "Improving recent punctuality"),
    "current_delay_min": ("Existing delay compounding", "Currently close to schedule"),
    "train_type_code": ("Train-type operating pattern", "Priority train recovery"),
    "speed_kmph": ("Reduced sectional speed", "Healthy sectional speed"),
    "passenger_load": ("Heavy passenger loading", "Light occupancy"),
    "time_of_day_multiplier": ("Peak-hour network pressure", "Quiet-hour recovery"),
    "day_of_week_multiplier": ("Busy-day network pressure", "Quiet-day recovery"),
}

STATION_AWARE = {
    "junction_congestion_score": "Congestion near {station}",
    "is_junction_next": "Junction operations at {station}",
    "is_major_next": "Platform crowding at {station}",
}


def shap_to_factors(
    shap_values: np.ndarray,
    feature_row: Dict[str, float],
    next_station_name: str | None = None,
    top_k: int = 3,
) -> Tuple[List[ExplanationFactor], List[str]]:
    """Convert a SHAP value vector into ranked plain-language factors."""
    values = np.array(shap_values).reshape(-1)
    pairs = []
    for i, feat in enumerate(FEATURE_COLUMNS):
        if i >= len(values):
            break
        contrib = float(values[i])
        if abs(contrib) < 0.35:
            continue
        pos_phrase, neg_phrase = FEATURE_PHRASES.get(feat, (feat, feat))
        if contrib >= 0:
            phrase = pos_phrase
            direction = "increase"
        else:
            phrase = neg_phrase
            direction = "decrease"
        if feat in STATION_AWARE and next_station_name and contrib > 0:
            phrase = STATION_AWARE[feat].format(station=next_station_name)
        minutes = abs(contrib)
        signed = f"+{minutes:.0f} min" if contrib >= 0 else f"−{minutes:.0f} min"
        full = f"{phrase} ({signed})"
        pairs.append(
            ExplanationFactor(
                feature=feat,
                contribution_min=round(contrib, 2),
                phrase=full,
                direction=direction,
            )
        )

    pairs.sort(key=lambda f: abs(f.contribution_min), reverse=True)
    top = pairs[:top_k]
    if not top:
        top = [
            ExplanationFactor(
                feature="baseline",
                contribution_min=0.0,
                phrase="Running close to the learned baseline delay",
                direction="increase",
            )
        ]
    return top, [f.phrase for f in top]
