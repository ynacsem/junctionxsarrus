# app/schemas/client.py
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class PropertyType(str, Enum):
    apartment = "apartment"
    house = "house"
    villa = "villa"
    studio = "studio"
    duplex = "duplex"
    penthouse = "penthouse"

class MaritalStatus(str, Enum):
    single = "single"
    married = "married"
    divorced = "divorced"
    widowed = "widowed"

class ClientBase(BaseModel):
    client_id: str
    preferred_location: str
    min_budget_DZD: float
    max_budget_DZD: float
    min_area: int
    max_area: int
    preferred_property_type: str
    marital_status: str
    has_kids: bool = False
    
    
    # new updates
    # New weights and preferences
    weight_location: Optional[float] = None
    weight_property_type: Optional[float] = None
    preferred_rooms: Optional[int] = None
    weight_rooms: Optional[float] = None
    preferred_schools_nearby: Optional[int] = None
    weight_schools_nearby: Optional[float] = None
    preferred_hospitals_nearby: Optional[int] = None
    weight_hospitals_nearby: Optional[float] = None
    preferred_parks_nearby: Optional[int] = None
    weight_parks_nearby: Optional[float] = None
    preferred_public_transport_score: Optional[int] = None
    weight_public_transport_score: Optional[float] = None

    @validator('max_budget_DZD')
    def validate_budget_range(cls, v, values):
        if 'min_budget_DZD' in values and v < values['min_budget_DZD']:
            raise ValueError('max_budget_DZD must be greater than or equal to min_budget_DZD')
        return v

    @validator('max_area')
    def validate_area_range(cls, v, values):
        if 'min_area' in values and v < values['min_area']:
            raise ValueError('max_area must be greater than or equal to min_area')
        return v

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    client_id: Optional[str] = None
    preferred_location: Optional[str] = None
    min_budget_DZD: Optional[float] = None
    max_budget_DZD: Optional[float] = None
    min_area: Optional[int] = None
    max_area: Optional[int] = None
    preferred_property_type: Optional[str] = None
    marital_status: Optional[str] = None
    has_kids: Optional[bool] = None

    # New weights and preferences
    weight_location: Optional[float] = None
    weight_property_type: Optional[float] = None
    preferred_rooms: Optional[int] = None
    weight_rooms: Optional[float] = None
    preferred_schools_nearby: Optional[int] = None
    weight_schools_nearby: Optional[float] = None
    preferred_hospitals_nearby: Optional[int] = None
    weight_hospitals_nearby: Optional[float] = None
    preferred_parks_nearby: Optional[int] = None
    weight_parks_nearby: Optional[float] = None
    preferred_public_transport_score: Optional[int] = None
    weight_public_transport_score: Optional[float] = None
    
class Client(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        orm_mode = True  # For SQLAlchemy 1.4 compatibility