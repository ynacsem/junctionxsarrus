from pydantic import BaseModel
from typing import Optional

class PropertyBase(BaseModel):
    property_id: str
    location: str
    price_DZD: float
    area: int
    property_type: str
    rooms: int
    schools_nearby: Optional[int] = None
    hospitals_nearby: Optional[int] = None
    parks_nearby: Optional[int] = None
    public_transport_score: Optional[int] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    location: Optional[str] = None
    price_DZD: Optional[float] = None
    area: Optional[int] = None
    property_type: Optional[str] = None
    rooms: Optional[int] = None
    schools_nearby: Optional[int] = None
    hospitals_nearby: Optional[int] = None
    parks_nearby: Optional[int] = None
    public_transport_score: Optional[int] = None


class Property(PropertyBase):
    id: int

    class Config:
        orm_mode = True