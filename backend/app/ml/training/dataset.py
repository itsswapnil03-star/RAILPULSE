"""
Synthetic historical dataset for Maharashtra coaching-train delays.

This is SIMULATED data for SIH prototype / demo. A production CRIS/RTIS
feed would replace generate_synthetic_dataset() with a real ingest job.
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import pandas as pd

from app.core.maharashtra_stations import (
    CORRIDORS,
    JUNCTION_STATIONS,
    MAHARASHTRA_STATIONS,
    get_distance_between_stations,
)
from app.core import DELAY_EVENT_TYPES, MAJOR_STATIONS

FEATURE_COLUMNS = [
    "hour_of_day",
    "day_of_week",
    "distance_remaining_km",
    "segment_distance_km",
    "junction_congestion_score",
    "weather_flag",
    "is_junction_next",
    "is_major_next",
    "recent_delay_trend",
    "current_delay_min",
    "train_type_code",
    "speed_kmph",
    "passenger_load",
    "time_of_day_multiplier",
    "day_of_week_multiplier",
]

TARGET_COLUMN = "delay_minutes"

TRAIN_TYPE_CODES = {
    "express": 0,
    "superfast": 1,
    "passenger": 2,
    "local": 3,
    "semi_fast": 4,
}


def _time_of_day_multiplier(hour: int) -> float:
    if 7 <= hour < 10:
        return 1.5
    if 17 <= hour < 20:
        return 1.4
    if hour >= 22 or hour < 6:
        return 0.8
    return 1.0


def _day_of_week_multiplier(dow: int) -> float:
    return [1.2, 1.1, 1.1, 1.1, 1.3, 1.0, 0.9][dow % 7]


def generate_synthetic_dataset(n_rows: int = 10000, seed: int = 42) -> pd.DataFrame:
    """Generate a statistically patterned delay dataset (~10k rows by default)."""
    rng = np.random.default_rng(seed)
    station_ids = [s["id"] for s in MAHARASHTRA_STATIONS]
    corridor_keys = list(CORRIDORS.keys())
    train_types = list(TRAIN_TYPE_CODES.keys())

    rows = []
    for _ in range(n_rows):
        corridor = corridor_keys[int(rng.integers(0, len(corridor_keys)))]
        route = CORRIDORS[corridor]
        if len(route) < 3:
            continue
        idx = int(rng.integers(0, len(route) - 1))
        current = route[idx]
        nxt = route[idx + 1]
        dest = route[-1]

        try:
            remaining = get_distance_between_stations(current, dest)
            segment = get_distance_between_stations(current, nxt)
        except Exception:
            remaining = float(rng.uniform(20, 400))
            segment = float(rng.uniform(8, 60))

        hour = int(rng.integers(0, 24))
        dow = int(rng.integers(0, 7))
        tod_m = _time_of_day_multiplier(hour)
        dow_m = _day_of_week_multiplier(dow)

        is_junc = 1 if nxt in JUNCTION_STATIONS else 0
        is_major = 1 if nxt in MAJOR_STATIONS else 0
        congestion = float(np.clip(rng.beta(2, 5) + 0.35 * is_junc + 0.15 * is_major, 0, 1))
        weather = int(rng.random() < 0.18)
        recent_trend = float(np.clip(rng.normal(4, 8), 0, 45))
        current_delay = float(np.clip(rng.normal(6, 10), 0, 80))
        ttype = train_types[int(rng.integers(0, len(train_types)))]
        speed = float(np.clip(rng.normal(75, 18), 35, 120))
        load = float(np.clip(rng.beta(2.2, 2.0), 0.1, 1.0))

        # Ground-truth delay with realistic additive effects
        delay = 1.5
        delay += 0.04 * remaining
        delay += 12.0 * congestion
        delay += 8.0 * weather
        delay += 0.35 * recent_trend
        delay += 0.25 * current_delay
        delay += 4.0 * (tod_m - 1.0) * 4
        delay += 3.0 * (dow_m - 1.0) * 5
        delay += 3.5 * is_junc
        delay += 2.0 * is_major
        delay += 6.0 * load * (1 if 7 <= hour < 10 or 17 <= hour < 20 else 0.4)
        if ttype == "local":
            delay += 2.0
        elif ttype == "superfast":
            delay -= 1.5
        delay += float(rng.normal(0, 3.5))
        delay = float(np.clip(delay, 0, 90))

        rows.append(
            {
                "corridor": corridor,
                "current_station": current,
                "next_station": nxt,
                "hour_of_day": hour,
                "day_of_week": dow,
                "distance_remaining_km": round(remaining, 2),
                "segment_distance_km": round(segment, 2),
                "junction_congestion_score": round(congestion, 3),
                "weather_flag": weather,
                "is_junction_next": is_junc,
                "is_major_next": is_major,
                "recent_delay_trend": round(recent_trend, 2),
                "current_delay_min": round(current_delay, 2),
                "train_type": ttype,
                "train_type_code": TRAIN_TYPE_CODES[ttype],
                "speed_kmph": round(speed, 1),
                "passenger_load": round(load, 3),
                "time_of_day_multiplier": tod_m,
                "day_of_week_multiplier": dow_m,
                "delay_minutes": round(delay, 2),
            }
        )

    return pd.DataFrame(rows)


def save_dataset(df: pd.DataFrame, path: str | Path | None = None) -> Path:
    path = Path(path or os.getenv("ML_DATASET_PATH", "app/ml/data/synthetic_dataset.csv"))
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return path


if __name__ == "__main__":
    df = generate_synthetic_dataset(10000)
    out = save_dataset(df)
    print(f"Wrote {len(df)} rows to {out}")
    print(df[TARGET_COLUMN].describe())
