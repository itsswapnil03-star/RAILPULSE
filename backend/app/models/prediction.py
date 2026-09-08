"""Prediction and delay-history ORM models."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(String(16), ForeignKey("trains.id"), nullable=False, index=True)
    station_id = Column(String(16), ForeignKey("stations.id"), nullable=False)
    predicted_delay_min = Column(Float, nullable=False)
    confidence_low = Column(Float, nullable=False)
    confidence_high = Column(Float, nullable=False)
    explanation_json = Column(Text, default="[]")  # JSON list of SHAP phrases
    predicted_eta = Column(String(8), nullable=True)  # HH:MM
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    train = relationship("Train", back_populates="predictions")


class DelayHistory(Base):
    __tablename__ = "delay_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    network_avg_delay = Column(Float, default=0.0)
    on_time_count = Column(Integer, default=0)
    delayed_count = Column(Integer, default=0)
    heavily_delayed_count = Column(Integer, default=0)
    active_train_count = Column(Integer, default=0)
