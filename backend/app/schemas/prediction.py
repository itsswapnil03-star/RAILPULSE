"""Prediction and network-summary Pydantic schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ExplanationFactor(BaseModel):
    """A single SHAP-derived contributing factor, in plain language."""
    feature: str
    contribution_min: float
    phrase: str
    direction: str = "increase"  # increase | decrease


class PredictionOut(BaseModel):
    train_id: str
    station_id: str
    station_name: Optional[str] = None
    predicted_delay_min: float
    confidence_low: float
    confidence_high: float
    predicted_eta: Optional[str] = None
    explanation: List[str] = Field(default_factory=list)
    explanation_factors: List[ExplanationFactor] = Field(default_factory=list)
    created_at: datetime


class NetworkSummary(BaseModel):
    active_trains: int
    on_time: int
    delayed: int
    heavily_delayed: int
    average_delay_min: float
    max_delay_min: float
    junctions_congested: int
    updated_at: datetime


class DelayTrendPoint(BaseModel):
    timestamp: datetime
    average_delay_min: float
    on_time: int
    delayed: int
    heavily_delayed: int
    active_trains: int
