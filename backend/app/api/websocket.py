"""Native FastAPI WebSocket endpoint — live train positions + ETAs.

Clients subscribe once on load. The simulation engine pushes snapshots;
the frontend never polls.
"""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.simulation.engine import get_engine

router = APIRouter()


@router.websocket("/ws/trains")
async def trains_socket(ws: WebSocket):
    engine = get_engine()
    await engine.register(ws)
    try:
        while True:
            # Keep the socket open; clients may send pings / filter hints.
            msg = await ws.receive_text()
            if msg in {"ping", "heartbeat"}:
                await ws.send_text('{"type":"pong"}')
    except WebSocketDisconnect:
        engine.unregister(ws)
    except Exception:
        engine.unregister(ws)
