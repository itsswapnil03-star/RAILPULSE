"""Delay-event injection for the simulation engine.

All events are SIMULATED. A live CRIS/RTIS feed would replace
`maybe_inject_delay` with inbound incident messages.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

import numpy as np

from app.core import DELAY_EVENT_TYPES, MAJOR_STATIONS
from app.core.maharashtra_stations import JUNCTION_STATIONS


def maybe_inject_delay(
    rng: np.random.Generator,
    station_id: Optional[str],
    hour: int,
    current_delay: float,
) -> Optional[Dict[str, Any]]:
    """Possibly emit a delay event at a station stop."""
    # Base chance per stop
    p = 0.12
    if 7 <= hour < 10 or 17 <= hour < 20:
        p += 0.06
    if station_id in JUNCTION_STATIONS:
        p += 0.08
    if current_delay > 20:
        p += 0.04
    if rng.random() > p:
        return None

    # Weighted pick of event type, filtered by station class
    candidates = []
    for ev in DELAY_EVENT_TYPES:
        affected = ev["affected_stations"]
        if affected == "junctions" and station_id not in JUNCTION_STATIONS:
            continue
        if affected == "major" and station_id not in MAJOR_STATIONS:
            continue
        candidates.append(ev)
    if not candidates:
        candidates = DELAY_EVENT_TYPES

    weights = np.array([c["probability"] for c in candidates], dtype=float)
    weights = weights / weights.sum()
    ev = candidates[int(rng.choice(len(candidates), p=weights))]
    delay = float(rng.uniform(ev["min_delay"], ev["max_delay"]))
    if 7 <= hour < 10 or 17 <= hour < 20:
        delay *= 1.15
    delay = round(float(np.clip(delay, 1, 50)), 1)

    return {
        "event_type": ev["type"],
        "delay_minutes": delay,
        "description": ev["description"],
        "station_id": station_id,
        "occurred_at": datetime.utcnow(),
        "name": ev["name"],
    }
