"""Train Pydantic schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.station import StationStop
from app.schemas.prediction import ExplanationFactor


class DelayEventOut(BaseModel):
    id: int
    train_id: str
    station_id: Optional[str] = None
    event_type: str
    delay_minutes: float
    description: str = ""
    occurred_at: datetime

    class Config:
        from_attributes = True


class TrainOut(BaseModel):
    id: str
    number: str
    name: str
    train_type: str
    corridor: str
    origin_station_id: str
    destination_station_id: str
    scheduled_departure: str
    scheduled_arrival: str
    direction: str
    color: str
    is_active: bool = True

    class Config:
        from_attributes = True


class TrainList(BaseModel):
    count: int
    trains: List[TrainOut]


class TrainLiveState(BaseModel):
    """Live snapshot of a train used by REST and WebSocket."""
    train_id: str
    number: str
    name: str
    train_type: str
    corridor: str
    color: str
    latitude: float
    longitude: float
    speed_kmph: float
    current_station_id: Optional[str] = None
    current_station_name: Optional[str] = None
    next_station_id: Optional[str] = None
    next_station_name: Optional[str] = None
    origin_station_id: str
    origin_name: str
    destination_station_id: str
    destination_name: str
    progress_to_next: float = 0.0
    route_progress: float = 0.0  # 0..1 along entire corridor
    delay_minutes: float = 0.0
    predicted_delay_min: float = 0.0
    confidence_low: float = 0.0
    confidence_high: float = 0.0
    predicted_eta: Optional[str] = None
    scheduled_arrival: str
    status: str = "on_time"
    explanation: List[str] = Field(default_factory=list)
    explanation_factors: List[ExplanationFactor] = Field(default_factory=list)
    last_event: Optional[str] = None
    updated_at: datetime


class TrainDetail(TrainLiveState):
    stops: List[StationStop] = Field(default_factory=list)
    delay_history: List[DelayEventOut] = Field(default_factory=list)
    direction: str = "up"
    scheduled_departure: str = "00:00"
