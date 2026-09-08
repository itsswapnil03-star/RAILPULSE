"""Station ORM model."""
from sqlalchemy import Boolean, Column, Float, Integer, String
from app.database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(String(16), primary_key=True)
    name = Column(String(128), nullable=False)
    code = Column(String(16), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    division = Column(String(64), nullable=False)
    is_junction = Column(Boolean, default=False)
    city = Column(String(64), nullable=False)
    platform_count = Column(Integer, default=4)
    congestion_score = Column(Float, default=0.3)
