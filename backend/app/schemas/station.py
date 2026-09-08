"""Station Pydantic schemas."""
from typing import List, Optional

from pydantic import BaseModel, Field


class StationOut(BaseModel):
    id: str
    name: str
    code: str
    latitude: float
    longitude: float
    division: str
    is_junction: bool
    city: str
    platform_count: int = 4
    congestion_score: float = 0.3

    class Config:
        from_attributes = True


class StationList(BaseModel):
    count: int
    stations: List[StationOut]


class StationStop(BaseModel):
    """A stop on a train's route with scheduled vs predicted times."""
    station_id: str
    station_name: str
    station_code: str
    latitude: float
    longitude: float
    sequence: int
    scheduled_arrival: Optional[str] = None
    predicted_arrival: Optional[str] = None
    delay_minutes: float = 0.0
    status: str = "upcoming"  # departed, current, upcoming, arrived
    distance_from_origin_km: float = 0.0
    explanation: List[str] = Field(default_factory=list)
