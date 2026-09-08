"""
Async simulation engine.

Advances ~120 coaching trains across Maharashtra corridors, injects
realistic delay events, runs XGBoost+SHAP inference, and broadcasts
live state over WebSocket.

SIMULATED — structured so a CRIS/RTIS position feed can replace the
tick loop with inbound messages of the same shape.
"""
from __future__ import annotations

import asyncio
import json
import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set

import numpy as np
from fastapi import WebSocket

from app.core import TRAIN_TYPES, CORRIDOR_TRAIN_NAMES, MAJOR_STATIONS
from app.core.maharashtra_stations import (
    CORRIDORS,
    JUNCTION_STATIONS,
    MAHARASHTRA_STATIONS,
    STATION_MAP,
    get_distance_between_stations,
)
from app.ml.inference.predict import predict_delay
from app.simulation.events import maybe_inject_delay

NUM_TRAINS = 120
TICK_SECONDS = 1.5
# Simulated minutes advanced per real tick (keeps demo lively)
SIM_MINUTES_PER_TICK = 0.9


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(h)))


def _hhmm(minutes_from_midnight: float) -> str:
    m = int(minutes_from_midnight) % (24 * 60)
    return f"{m // 60:02d}:{m % 60:02d}"


def _parse_hhmm(s: str) -> int:
    h, m = s.split(":")
    return int(h) * 60 + int(m)


class SimulatedTrain:
    def __init__(self, spec: Dict[str, Any], rng: np.random.Generator):
        self.id: str = spec["id"]
        self.number: str = spec["number"]
        self.name: str = spec["name"]
        self.train_type: str = spec["train_type"]
        self.corridor: str = spec["corridor"]
        self.color: str = spec["color"]
        self.direction: str = spec["direction"]
        self.route: List[str] = list(spec["route"])
        self.segment_index: int = spec["segment_index"]
        self.progress: float = spec["progress"]  # 0..1 on current segment
        self.delay_minutes: float = spec["delay_minutes"]
        self.speed_kmph: float = spec["speed_kmph"]
        self.base_speed: float = spec["speed_kmph"]
        self.scheduled_departure: str = spec["scheduled_departure"]
        self.scheduled_arrival: str = spec["scheduled_arrival"]
        self.dwell_remaining: float = 0.0
        self.last_event: Optional[str] = None
        self.recent_delays: List[float] = [spec["delay_minutes"]]
        self.weather_flag: int = spec.get("weather_flag", 0)
        self.passenger_load: float = spec.get("passenger_load", 0.55)
        self.delay_events: List[Dict[str, Any]] = []
        self.prediction: Dict[str, Any] = {}
        self.updated_at: datetime = datetime.utcnow()
        self.looped: int = 0
        self._rng = rng
        self._refresh_prediction()

    @property
    def current_station_id(self) -> str:
        return self.route[min(self.segment_index, len(self.route) - 1)]

    @property
    def next_station_id(self) -> Optional[str]:
        if self.segment_index >= len(self.route) - 1:
            return None
        return self.route[self.segment_index + 1]

    @property
    def origin_id(self) -> str:
        return self.route[0]

    @property
    def dest_id(self) -> str:
        return self.route[-1]

    def latlon(self) -> tuple[float, float]:
        a = STATION_MAP[self.current_station_id]
        nxt = self.next_station_id
        if not nxt:
            return a["latitude"], a["longitude"]
        b = STATION_MAP[nxt]
        t = self.progress
        return _lerp(a["latitude"], b["latitude"], t), _lerp(a["longitude"], b["longitude"], t)

    def route_progress(self) -> float:
        if len(self.route) <= 1:
            return 1.0
        return min(1.0, (self.segment_index + self.progress) / (len(self.route) - 1))

    def distance_remaining_km(self) -> float:
        total = 0.0
        nxt = self.next_station_id
        if nxt:
            a = STATION_MAP[self.current_station_id]
            b = STATION_MAP[nxt]
            seg = _haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])
            total += seg * (1 - self.progress)
            idx = self.segment_index + 1
        else:
            return 0.0
        for i in range(idx, len(self.route) - 1):
            try:
                total += get_distance_between_stations(self.route[i], self.route[i + 1])
            except Exception:
                sa, sb = STATION_MAP[self.route[i]], STATION_MAP[self.route[i + 1]]
                total += _haversine_km(sa["latitude"], sa["longitude"], sb["latitude"], sb["longitude"])
        return total

    def segment_distance_km(self) -> float:
        nxt = self.next_station_id
        if not nxt:
            return 0.0
        try:
            return get_distance_between_stations(self.current_station_id, nxt)
        except Exception:
            a, b = STATION_MAP[self.current_station_id], STATION_MAP[nxt]
            return _haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])

    def status(self) -> str:
        if self.segment_index >= len(self.route) - 1 and self.progress >= 0.999:
            return "arrived"
        if self.delay_minutes >= 20:
            return "heavily_delayed"
        if self.delay_minutes >= 5:
            return "delayed"
        return "on_time"

    def _refresh_prediction(self) -> None:
        nxt = self.next_station_id
        nxt_name = STATION_MAP[nxt]["name"] if nxt else None
        congestion = 0.25
        if nxt in JUNCTION_STATIONS:
            congestion += 0.35
        if nxt in MAJOR_STATIONS:
            congestion += 0.15
        congestion = min(1.0, congestion + 0.01 * self.delay_minutes)
        state = {
            "hour_of_day": datetime.utcnow().hour,
            "day_of_week": datetime.utcnow().weekday(),
            "distance_remaining_km": self.distance_remaining_km(),
            "segment_distance_km": self.segment_distance_km(),
            "junction_congestion_score": congestion,
            "weather_flag": self.weather_flag,
            "is_junction_next": 1 if nxt in JUNCTION_STATIONS else 0,
            "is_major_next": 1 if nxt in MAJOR_STATIONS else 0,
            "recent_delay_trend": float(np.mean(self.recent_delays[-5:])),
            "current_delay_min": self.delay_minutes,
            "train_type": self.train_type,
            "speed_kmph": self.speed_kmph,
            "passenger_load": self.passenger_load,
            "scheduled_arrival": self.scheduled_arrival,
        }
        self.prediction = predict_delay(state, next_station_name=nxt_name)

    def tick(self, sim_minutes: float) -> Optional[Dict[str, Any]]:
        """Advance the train. Returns a delay event dict if one was injected."""
        event = None
        if self.dwell_remaining > 0:
            self.dwell_remaining = max(0.0, self.dwell_remaining - sim_minutes)
            self.updated_at = datetime.utcnow()
            return None

        nxt = self.next_station_id
        if not nxt:
            # Loop the service for a continuous demo
            self.route = list(reversed(self.route))
            self.segment_index = 0
            self.progress = 0.0
            self.direction = "down" if self.direction == "up" else "up"
            self.looped += 1
            self.delay_minutes = max(0.0, self.delay_minutes * 0.4)
            self._refresh_prediction()
            self.updated_at = datetime.utcnow()
            return None

        seg_km = max(1.0, self.segment_distance_km())
        hours = sim_minutes / 60.0
        frac = (self.speed_kmph * hours) / seg_km
        self.progress += frac

        if self.progress >= 1.0:
            self.progress = 0.0
            self.segment_index += 1
            arrived_id = self.current_station_id
            hour = datetime.utcnow().hour
            event = maybe_inject_delay(self._rng, arrived_id, hour, self.delay_minutes)
            if event:
                self.delay_minutes += event["delay_minutes"]
                self.last_event = f"{event['name']} (+{event['delay_minutes']:.0f} min)"
                self.delay_events.append(
                    {
                        "id": len(self.delay_events) + 1,
                        "train_id": self.id,
                        "station_id": arrived_id,
                        "event_type": event["event_type"],
                        "delay_minutes": event["delay_minutes"],
                        "description": event["description"],
                        "occurred_at": event["occurred_at"],
                    }
                )
                self.recent_delays.append(self.delay_minutes)
                if len(self.recent_delays) > 12:
                    self.recent_delays = self.recent_delays[-12:]
            # Dwell at station
            dwell = 1.2 if arrived_id not in JUNCTION_STATIONS else 2.4
            self.dwell_remaining = dwell
            self._refresh_prediction()

        # Gentle delay recovery on open track
        if event is None and self.delay_minutes > 0 and self._rng.random() < 0.08:
            self.delay_minutes = max(0.0, self.delay_minutes - 0.3)

        # Occasional weather flip
        if self._rng.random() < 0.004:
            self.weather_flag = 1 - self.weather_flag

        self.speed_kmph = max(35.0, self.base_speed * (0.82 if self.weather_flag else 1.0))
        self.updated_at = datetime.utcnow()
        return event

    def build_stops(self) -> List[Dict[str, Any]]:
        stops = []
        cum = 0.0
        dep_min = _parse_hhmm(self.scheduled_departure)
        pred_delay = float(self.prediction.get("predicted_delay_min", self.delay_minutes))
        for i, sid in enumerate(self.route):
            st = STATION_MAP[sid]
            if i > 0:
                try:
                    cum += get_distance_between_stations(self.route[i - 1], sid)
                except Exception:
                    a, b = STATION_MAP[self.route[i - 1]], st
                    cum += _haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])
            # Rough schedule: 1.1 min per km + dwell
            sched_min = dep_min + cum * 0.85 + i * 2
            if i == 0:
                status = "departed" if self.segment_index > 0 or self.progress > 0.02 else "current"
            elif i < self.segment_index:
                status = "departed"
            elif i == self.segment_index:
                status = "current"
            else:
                status = "upcoming"
            # Delay accrues along the remaining route
            frac = i / max(1, len(self.route) - 1)
            stop_delay = self.delay_minutes * min(1.0, 0.35 + 0.65 * frac)
            if i >= self.segment_index:
                stop_delay = max(stop_delay, pred_delay * ((i - self.segment_index + 1) / max(1, len(self.route) - self.segment_index)))
            expl = self.prediction.get("explanation", []) if i == self.segment_index + 1 else []
            stops.append(
                {
                    "station_id": sid,
                    "station_name": st["name"],
                    "station_code": st["code"],
                    "latitude": st["latitude"],
                    "longitude": st["longitude"],
                    "sequence": i,
                    "scheduled_arrival": _hhmm(sched_min) if i > 0 else self.scheduled_departure,
                    "predicted_arrival": _hhmm(sched_min + stop_delay),
                    "delay_minutes": round(float(stop_delay), 1),
                    "status": status,
                    "distance_from_origin_km": round(cum, 1),
                    "explanation": expl,
                }
            )
        return stops

    def to_live_state(self) -> Dict[str, Any]:
        lat, lon = self.latlon()
        cur = STATION_MAP[self.current_station_id]
        nxt_id = self.next_station_id
        nxt = STATION_MAP[nxt_id] if nxt_id else None
        origin = STATION_MAP[self.origin_id]
        dest = STATION_MAP[self.dest_id]
        pred = self.prediction or {}
        return {
            "train_id": self.id,
            "number": self.number,
            "name": self.name,
            "train_type": self.train_type,
            "corridor": self.corridor,
            "color": self.color,
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "speed_kmph": round(self.speed_kmph, 1),
            "current_station_id": self.current_station_id,
            "current_station_name": cur["name"],
            "next_station_id": nxt_id,
            "next_station_name": nxt["name"] if nxt else None,
            "origin_station_id": self.origin_id,
            "origin_name": origin["name"],
            "destination_station_id": self.dest_id,
            "destination_name": dest["name"],
            "progress_to_next": round(self.progress, 3),
            "route_progress": round(self.route_progress(), 3),
            "delay_minutes": round(self.delay_minutes, 1),
            "predicted_delay_min": pred.get("predicted_delay_min", round(self.delay_minutes, 1)),
            "confidence_low": pred.get("confidence_low", max(0, self.delay_minutes - 3)),
            "confidence_high": pred.get("confidence_high", self.delay_minutes + 3),
            "predicted_eta": pred.get("predicted_eta") or self.scheduled_arrival,
            "scheduled_arrival": self.scheduled_arrival,
            "status": self.status(),
            "explanation": pred.get("explanation", []),
            "explanation_factors": pred.get("explanation_factors", []),
            "last_event": self.last_event,
            "updated_at": self.updated_at.isoformat() + "Z",
        }

    def to_detail(self) -> Dict[str, Any]:
        live = self.to_live_state()
        live["stops"] = self.build_stops()
        live["delay_history"] = [
            {
                **e,
                "occurred_at": e["occurred_at"].isoformat() + "Z"
                if isinstance(e["occurred_at"], datetime)
                else e["occurred_at"],
            }
            for e in self.delay_events[-20:]
        ]
        live["direction"] = self.direction
        live["scheduled_departure"] = self.scheduled_departure
        return live


def _build_fleet(n: int, rng: np.random.Generator) -> List[SimulatedTrain]:
    corridor_keys = list(CORRIDORS.keys())
    type_cycle = ["superfast", "express", "express", "semi_fast", "passenger", "local"]
    trains: List[SimulatedTrain] = []
    used_numbers: Set[str] = set()

    for i in range(n):
        corridor = corridor_keys[i % len(corridor_keys)]
        route = list(CORRIDORS[corridor])
        # Skip tiny corridors
        if len(route) < 4:
            corridor = "mumbai_cst_nagpur"
            route = list(CORRIDORS[corridor])
        direction = "up" if i % 2 == 0 else "down"
        if direction == "down":
            route = list(reversed(route))
        ttype = type_cycle[i % len(type_cycle)]
        meta = TRAIN_TYPES[ttype]
        names = CORRIDOR_TRAIN_NAMES.get(corridor, ["Maharashtra Express"])
        name = names[i % len(names)]
        # Unique 5-digit train numbers in IR-like range
        number = str(11000 + i * 7 + (i % 13))
        while number in used_numbers:
            number = str(int(number) + 1)
        used_numbers.add(number)

        seg = int(rng.integers(0, max(1, len(route) - 1)))
        progress = float(rng.random())
        delay = float(max(0.0, rng.normal(7, 9)))
        speed = float(np.clip(rng.normal(meta["base_speed"], 8), 40, 110))
        dep = int(rng.integers(0, 24 * 60))
        # Rough total journey
        total_km = 0.0
        for k in range(len(route) - 1):
            try:
                total_km += get_distance_between_stations(route[k], route[k + 1])
            except Exception:
                a, b = STATION_MAP[route[k]], STATION_MAP[route[k + 1]]
                total_km += _haversine_km(a["latitude"], a["longitude"], b["latitude"], b["longitude"])
        arr = dep + int(total_km / max(40, speed) * 60) + len(route) * 2

        spec = {
            "id": f"T{i + 1:04d}",
            "number": number,
            "name": name,
            "train_type": ttype,
            "corridor": corridor,
            "color": meta["color"],
            "direction": direction,
            "route": route,
            "segment_index": seg,
            "progress": progress,
            "delay_minutes": round(delay, 1),
            "speed_kmph": speed,
            "scheduled_departure": _hhmm(dep),
            "scheduled_arrival": _hhmm(arr),
            "weather_flag": int(rng.random() < 0.12),
            "passenger_load": float(np.clip(rng.beta(2.2, 2.0), 0.15, 0.98)),
        }
        trains.append(SimulatedTrain(spec, rng))
    return trains


class SimulationEngine:
    def __init__(self, n_trains: int = NUM_TRAINS, seed: int = 7):
        self.rng = np.random.default_rng(seed)
        self.trains: List[SimulatedTrain] = _build_fleet(n_trains, self.rng)
        self.clients: Set[WebSocket] = set()
        self.trend: List[Dict[str, Any]] = []
        self._task: Optional[asyncio.Task] = None
        self._running = False
        self.tick_count = 0
        self._record_trend()

    def get_train(self, train_id: str) -> Optional[SimulatedTrain]:
        for t in self.trains:
            if t.id == train_id or t.number == train_id:
                return t
        return None

    def snapshot(self) -> List[Dict[str, Any]]:
        return [t.to_live_state() for t in self.trains]

    def summary(self) -> Dict[str, Any]:
        states = [t.status() for t in self.trains]
        delays = [t.delay_minutes for t in self.trains]
        congested = 0
        # Count junctions currently hosting a delayed train
        busy: Dict[str, int] = {}
        for t in self.trains:
            if t.current_station_id in JUNCTION_STATIONS and t.delay_minutes >= 5:
                busy[t.current_station_id] = busy.get(t.current_station_id, 0) + 1
        congested = sum(1 for v in busy.values() if v >= 1)
        return {
            "active_trains": len(self.trains),
            "on_time": states.count("on_time") + states.count("arrived"),
            "delayed": states.count("delayed"),
            "heavily_delayed": states.count("heavily_delayed"),
            "average_delay_min": round(float(np.mean(delays) if delays else 0), 1),
            "max_delay_min": round(float(np.max(delays) if delays else 0), 1),
            "junctions_congested": congested,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        }

    def _record_trend(self) -> None:
        s = self.summary()
        self.trend.append(
            {
                "timestamp": s["updated_at"],
                "average_delay_min": s["average_delay_min"],
                "on_time": s["on_time"],
                "delayed": s["delayed"],
                "heavily_delayed": s["heavily_delayed"],
                "active_trains": s["active_trains"],
            }
        )
        if len(self.trend) > 180:
            self.trend = self.trend[-180:]

    def station_board(self, station_id: str) -> List[Dict[str, Any]]:
        """Trains due at / passing a station, for the platform display."""
        board = []
        st = STATION_MAP.get(station_id)
        if not st:
            return board
        for t in self.trains:
            if station_id not in t.route:
                continue
            idx = t.route.index(station_id)
            if idx < t.segment_index:
                continue  # already departed this station
            stops = t.build_stops()
            stop = next((s for s in stops if s["station_id"] == station_id), None)
            if not stop:
                continue
            live = t.to_live_state()
            board.append(
                {
                    **live,
                    "due_scheduled": stop["scheduled_arrival"],
                    "due_predicted": stop["predicted_arrival"],
                    "stop_delay_minutes": stop["delay_minutes"],
                    "stop_status": stop["status"],
                    "platform": (hash(t.id + station_id) % 8) + 1,
                }
            )
        board.sort(key=lambda x: x.get("due_predicted") or "99:99")
        return board[:24]

    async def register(self, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.add(ws)
        await ws.send_text(
            json.dumps(
                {
                    "type": "snapshot",
                    "trains": self.snapshot(),
                    "summary": self.summary(),
                    "sent_at": datetime.utcnow().isoformat() + "Z",
                },
                default=str,
            )
        )

    def unregister(self, ws: WebSocket) -> None:
        self.clients.discard(ws)

    async def broadcast(self, message: Dict[str, Any]) -> None:
        if not self.clients:
            return
        data = json.dumps(message, default=str)
        dead = []
        for ws in list(self.clients):
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.clients.discard(ws)

    async def _loop(self) -> None:
        self._running = True
        while self._running:
            events = []
            for t in self.trains:
                ev = t.tick(SIM_MINUTES_PER_TICK)
                if ev:
                    events.append({"train_id": t.id, **ev, "occurred_at": ev["occurred_at"].isoformat() + "Z"})
            self.tick_count += 1
            if self.tick_count % 4 == 0:
                self._record_trend()
            payload = {
                "type": "snapshot",
                "trains": self.snapshot(),
                "summary": self.summary(),
                "events": events,
                "sent_at": datetime.utcnow().isoformat() + "Z",
            }
            await self.broadcast(payload)
            await asyncio.sleep(TICK_SECONDS)

    def start(self) -> None:
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._loop())

    def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None


_engine: Optional[SimulationEngine] = None


def get_engine() -> SimulationEngine:
    global _engine
    if _engine is None:
        _engine = SimulationEngine()
    return _engine
