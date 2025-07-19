from sqlalchemy import Column, String, Integer, Float
from .base import BaseModel

class Property(BaseModel):
    __tablename__ = "properties"

    property_id = Column(String(50), unique=True, index=True, nullable=False)
    location = Column(String(200), nullable=False)  # User-entered, free-form
    price_DZD = Column(Float, nullable=False)
    area = Column(Integer, nullable=False)
    property_type = Column(String(50), nullable=False)  # Also free-form if you want
    rooms = Column(Integer, nullable=False)
    schools_nearby = Column(Integer, nullable=True)
    hospitals_nearby = Column(Integer, nullable=True)
    parks_nearby = Column(Integer, nullable=True)
    public_transport_score = Column(Integer, nullable=True)
    match = Column(Integer, nullable=True)