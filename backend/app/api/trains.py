"""REST routers for trains, stations, network summary, and station boards."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.core.maharashtra_stations import MAHARASHTRA_STATIONS, STATION_MAP, CORRIDORS
from app.simulation.engine import get_engine

router = APIRouter()


@router.get("/health")
def health():
    engine = get_engine()
    return {
        "status": "ok",
        "service": "railpulse",
        "trains": len(engine.trains),
        "stations": len(MAHARASHTRA_STATIONS),
        "tick": engine.tick_count,
    }


@router.get("/stations")
def list_stations(city: str | None = None, junction: bool | None = None):
    stations = MAHARASHTRA_STATIONS
    if city:
        stations = [s for s in stations if s["city"].lower() == city.lower()]
    if junction is True:
        stations = [s for s in stations if s["is_junction"]]
    return {"count": len(stations), "stations": stations}


@router.get("/stations/{station_id}")
def get_station(station_id: str):
    st = STATION_MAP.get(station_id.upper()) or STATION_MAP.get(station_id)
    if not st:
        # try code match
        for s in MAHARASHTRA_STATIONS:
            if s["code"].upper() == station_id.upper() or s["id"].upper() == station_id.upper():
                st = s
                break
    if not st:
        raise HTTPException(status_code=404, detail="Station not found")
    return st


@router.get("/stations/{station_id}/board")
def station_board(station_id: str):
    st = STATION_MAP.get(station_id) or next(
        (s for s in MAHARASHTRA_STATIONS if s["code"].upper() == station_id.upper() or s["id"].upper() == station_id.upper()),
        None,
    )
    if not st:
        raise HTTPException(status_code=404, detail="Station not found")
    engine = get_engine()
    board = engine.station_board(st["id"])
    return {"station": st, "count": len(board), "trains": board}


@router.get("/corridors")
def list_corridors():
    return {
        "count": len(CORRIDORS),
        "corridors": {
            k: [{"id": sid, **STATION_MAP[sid]} for sid in v if sid in STATION_MAP]
            for k, v in CORRIDORS.items()
        },
    }


@router.get("/trains")
def list_trains(
    corridor: str | None = None,
    status: str | None = None,
    q: str | None = Query(default=None, description="Search number or name"),
    limit: int = Query(default=200, ge=1, le=500),
):
    engine = get_engine()
    trains = engine.snapshot()
    if corridor:
        trains = [t for t in trains if t["corridor"] == corridor]
    if status:
        trains = [t for t in trains if t["status"] == status]
    if q:
        ql = q.lower()
        trains = [
            t
            for t in trains
            if ql in t["number"].lower()
            or ql in t["name"].lower()
            or ql in t["train_id"].lower()
        ]
    return {"count": len(trains[:limit]), "trains": trains[:limit]}


@router.get("/trains/{train_id}")
def get_train(train_id: str):
    engine = get_engine()
    t = engine.get_train(train_id)
    if not t:
        raise HTTPException(status_code=404, detail="Train not found")
    return t.to_detail()


@router.get("/network/summary")
def network_summary():
    return get_engine().summary()


@router.get("/network/trend")
def network_trend():
    return {"points": get_engine().trend}
