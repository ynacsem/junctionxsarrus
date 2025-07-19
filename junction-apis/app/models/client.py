from sqlalchemy import Column, String, Integer, Float, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class Client(BaseModel):
    __tablename__ = "clients"
    
    # Client identification
    client_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Location preferences
    preferred_location = Column(String(200), nullable=False, index=True)
    
    # Budget preferences (in Algerian Dinar)
    min_budget_DZD = Column(Float, nullable=False)
    max_budget_DZD = Column(Float, nullable=False)
    
    # Area preferences (in square meters)
    min_area = Column(Integer, nullable=False)
    max_area = Column(Integer, nullable=False)
    
    # Property type preference (now as string)
    preferred_property_type = Column(String(50), nullable=False)
    
    # Personal information
    marital_status = Column(String(50), nullable=False)
    has_kids = Column(Boolean, default=False)
    
    
    #  new updates
    weight_location = Column(Float, nullable=True)
    weight_property_type = Column(Float, nullable=True)
    preferred_rooms = Column(Integer, nullable=True)
    weight_rooms = Column(Float, nullable=True)
    preferred_schools_nearby = Column(Integer, nullable=True)
    weight_schools_nearby = Column(Float, nullable=True)
    preferred_hospitals_nearby = Column(Integer, nullable=True)
    weight_hospitals_nearby = Column(Float, nullable=True)
    preferred_parks_nearby = Column(Integer, nullable=True)
    weight_parks_nearby = Column(Float, nullable=True)
    preferred_public_transport_score = Column(Integer, nullable=True)
    weight_public_transport_score = Column(Float, nullable=True)
    
def __repr__(self):
        return (
            f"<Client(id={self.id}, client_id='{self.client_id}', location='{self.preferred_location}')>"
        )