"""
SQLAlchemy database setup for RailPulse.
PostgreSQL is the primary store; SQLite is used as a fallback for local/dev
when DATABASE_URL is not set or Postgres is unavailable.
"""
from __future__ import annotations

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://railpulse:railpulse123@localhost:5432/railpulse",
)

# SQLite fallback for tests / machines without Docker
if os.getenv("RAILPULSE_USE_SQLITE", "").lower() in {"1", "true", "yes"}:
    DATABASE_URL = "sqlite:///./railpulse.db"

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Called on startup."""
    from app.models import train, station, prediction  # noqa: F401

    Base.metadata.create_all(bind=engine)
