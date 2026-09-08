"""
RailPulse FastAPI application.

SIH26028 — Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains.
Ministry of Railways.

All live movement is SIMULATED. The simulation engine is structured so a
CRIS/RTIS feed can replace the tick loop with inbound position messages.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import predictions, trains, websocket
from app.core import Config
from app.simulation.engine import get_engine


def _ensure_model() -> None:
    """Train the XGBoost model on first boot if artifacts are missing."""
    model_path = Path(__file__).resolve().parent / "ml" / "models" / "xgboost_model.joblib"
    if model_path.exists():
        return
    try:
        from app.ml.training.train_model import train

        print("[railpulse] No persisted model found — training XGBoost on synthetic data…")
        train(n_rows=6000, seed=42)
    except Exception as exc:
        print(f"[railpulse] Training skipped ({exc}). Inference will use the heuristic fallback.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ensure_model()
    try:
        from app.database import init_db

        init_db()
    except Exception as exc:
        print(f"[railpulse] Database init skipped ({exc}). Simulation still runs in-memory.")
    engine = get_engine()
    engine.start()
    print(f"[railpulse] Simulation started with {len(engine.trains)} trains.")
    yield
    engine.stop()


app = FastAPI(
    title=Config.API_TITLE,
    version=Config.API_VERSION,
    description=Config.API_DESCRIPTION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trains.router, prefix="/api", tags=["trains"])
app.include_router(predictions.router, prefix="/api", tags=["predictions"])
app.include_router(websocket.router, tags=["realtime"])


@app.get("/")
def root():
    return {
        "name": "RailPulse",
        "problem": "SIH26028",
        "docs": "/docs",
        "ws": "/ws/trains",
        "health": "/api/health",
    }
