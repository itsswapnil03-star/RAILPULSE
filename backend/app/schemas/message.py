"""WebSocket message schemas."""
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.prediction import NetworkSummary
from app.schemas.train import TrainLiveState


class WSTrainUpdate(BaseModel):
    type: Literal["train_update"] = "train_update"
    train: TrainLiveState


class WSSnapshot(BaseModel):
    type: Literal["snapshot"] = "snapshot"
    trains: List[TrainLiveState]
    summary: NetworkSummary
    sent_at: datetime


class WSSummary(BaseModel):
    type: Literal["summary"] = "summary"
    summary: NetworkSummary
    sent_at: datetime


class WSEvent(BaseModel):
    type: Literal["delay_event"] = "delay_event"
    train_id: str
    event_type: str
    delay_minutes: float
    description: str
    station_id: Optional[str] = None
    occurred_at: datetime


class WSMessage(BaseModel):
    type: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    sent_at: datetime
