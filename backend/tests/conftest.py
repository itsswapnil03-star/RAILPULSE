"""Pytest fixtures. Simulation runs in-process; DB uses SQLite if Postgres is down."""
from __future__ import annotations

import os

os.environ.setdefault("RAILPULSE_USE_SQLITE", "1")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.simulation.engine import SimulationEngine, get_engine


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def engine() -> SimulationEngine:
    return get_engine()
