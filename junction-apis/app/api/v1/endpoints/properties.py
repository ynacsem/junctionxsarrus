from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.schemas.property import Property as PropertySchema, PropertyCreate, PropertyUpdate

router = APIRouter()

@router.post("/", response_model=PropertySchema)
async def create_property(
    property_in: PropertyCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Property).filter(Property.property_id == property_in.property_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Property with property_id '{property_in.property_id}' already exists")
    db_property = Property(**property_in.dict())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=List[PropertySchema])
async def get_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    location: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_area: Optional[int] = Query(None, ge=0),
    max_area: Optional[int] = Query(None, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price is not None:
        query = query.filter(Property.price_DZD >= min_price)
    if max_price is not None:
        query = query.filter(Property.price_DZD <= max_price)
    if min_area is not None:
        query = query.filter(Property.area >= min_area)
    if max_area is not None:
        query = query.filter(Property.area <= max_area)
    properties = query.offset(skip).limit(limit).all()
    return properties

@router.get("/{property_id}", response_model=PropertySchema)
async def get_property(
    property_id: str,
    db: Session = Depends(get_db)
):
    property_obj = db.query(Property).filter(Property.property_id == property_id).first()
    if not property_obj and property_id.isdigit():
        property_obj = db.query(Property).filter(Property.id == int(property_id)).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail=f"Property with property_id or id '{property_id}' not found")
    return property_obj

@router.put("/{property_id}", response_model=PropertySchema)
async def update_property(
    property_id: str,
    property_update: PropertyUpdate,
    db: Session = Depends(get_db)
):
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail=f"Property with property_id '{property_id}' not found")
    update_data = property_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_property, field, value)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.delete("/{property_id}")
async def delete_property(
    property_id: str,
    db: Session = Depends(get_db)
):
    db_property = db.query(Property).filter(Property.property_id == property_id).first()
    if not db_property:
        raise HTTPException(status_code=404, detail=f"Property with property_id '{property_id}' not found")
    db.delete(db_property)
    db.commit()
    return {"message": f"Property '{property_id}' deleted successfully"}