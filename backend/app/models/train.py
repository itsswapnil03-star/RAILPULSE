"""Train, live position, and delay-event ORM models."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Train(Base):
    __tablename__ = "trains"

    id = Column(String(16), primary_key=True)
    number = Column(String(16), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    train_type = Column(String(32), nullable=False)  # express, superfast, passenger, local, semi_fast
    corridor = Column(String(64), nullable=False)
    origin_station_id = Column(String(16), ForeignKey("stations.id"), nullable=False)
    destination_station_id = Column(String(16), ForeignKey("stations.id"), nullable=False)
    scheduled_departure = Column(String(8), nullable=False)  # HH:MM
    scheduled_arrival = Column(String(8), nullable=False)
    direction = Column(String(16), default="up")  # up / down
    color = Column(String(16), default="#1a237e")
    is_active = Column(Boolean, default=True)

    positions = relationship("TrainPosition", back_populates="train", cascade="all, delete-orphan")
    delay_events = relationship("DelayEvent", back_populates="train", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="train", cascade="all, delete-orphan")


class TrainPosition(Base):
    __tablename__ = "train_positions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(String(16), ForeignKey("trains.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed_kmph = Column(Float, default=0.0)
    current_station_id = Column(String(16), ForeignKey("stations.id"), nullable=True)
    next_station_id = Column(String(16), ForeignKey("stations.id"), nullable=True)
    progress_to_next = Column(Float, default=0.0)  # 0..1 along current segment
    delay_minutes = Column(Float, default=0.0)
    status = Column(String(24), default="on_time")  # on_time, delayed, heavily_delayed, arrived
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    train = relationship("Train", back_populates="positions")


class DelayEvent(Base):
    __tablename__ = "delay_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(String(16), ForeignKey("trains.id"), nullable=False, index=True)
    station_id = Column(String(16), ForeignKey("stations.id"), nullable=True)
    event_type = Column(String(48), nullable=False)
    delay_minutes = Column(Float, nullable=False)
    description = Column(Text, default="")
    occurred_at = Column(DateTime, default=datetime.utcnow, index=True)

    train = relationship("Train", back_populates="delay_events")
