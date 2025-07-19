from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.client import Client
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate


router = APIRouter()

@router.post("/", response_model=ClientSchema)
async def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new client.
    """
    # Check if client_id already exists
    existing_client = db.query(Client).filter(Client.client_id == client.client_id).first()
    if existing_client:
        raise HTTPException(
            status_code=400,
            detail=f"Client with client_id '{client.client_id}' already exists"
        )
    
    # Create new client
    db_client = Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.get("/", response_model=List[ClientSchema])
async def get_clients(
    skip: int = Query(0, ge=0, description="Number of clients to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of clients to return"),
    location: Optional[str] = Query(None, description="Filter by preferred location"),
    property_type: Optional[str] = Query(None, description="Filter by property type"),
    min_budget: Optional[float] = Query(None, ge=0, description="Minimum budget filter"),
    max_budget: Optional[float] = Query(None, ge=0, description="Maximum budget filter"),
    has_kids: Optional[bool] = Query(None, description="Filter by has_kids status"),
    marital_status: Optional[str] = Query(None, description="Filter by marital status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve clients with optional filtering.
    """
    query = db.query(Client).filter(Client.is_active == True)
    
    # Apply filters
    if location:
        query = query.filter(Client.preferred_location.ilike(f"%{location}%"))
    
    if property_type:
        query = query.filter(Client.preferred_property_type == property_type)
    
    if min_budget is not None:
        query = query.filter(Client.max_budget_DZD >= min_budget)
    
    if max_budget is not None:
        query = query.filter(Client.min_budget_DZD <= max_budget)
    
    if has_kids is not None:
        query = query.filter(Client.has_kids == has_kids)
    
    if marital_status:
        query = query.filter(Client.marital_status == marital_status)
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=ClientSchema)
async def get_client(
    client_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific client by ID.
    """
    client = db.query(Client).filter(
        Client.client_id == client_id,
        Client.is_active == True
    ).first()
    
    if not client:
        raise HTTPException(
            status_code=404,
            detail=f"Client with ID {client_id} not found"
        )
    
    return client

@router.put("/{client_id}", response_model=ClientSchema)
async def update_client(
    client_id: int,
    client_update: ClientUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a client.
    """
    # Get existing client
    db_client = db.query(Client).filter(
        Client.id == client_id,
        Client.is_active == True
    ).first()
    
    if not db_client:
        raise HTTPException(
            status_code=404,
            detail=f"Client with ID {client_id} not found"
        )
    
    # Check if client_id is being updated and already exists
    if client_update.client_id and client_update.client_id != db_client.client_id:
        existing_client = db.query(Client).filter(
            Client.client_id == client_update.client_id,
            Client.id != client_id
        ).first()
        if existing_client:
            raise HTTPException(
                status_code=400,
                detail=f"Client with client_id '{client_update.client_id}' already exists"
            )
    
    # Update fields
    update_data = client_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_client, field, value)
    
    db.commit()
    db.refresh(db_client)
    
    return db_client

@router.delete("/{client_id}")
async def delete_client(
    client_id: int,
    permanent: bool = Query(False, description="Permanently delete (true) or soft delete (false)"),
    db: Session = Depends(get_db)
):
    """
    Delete a client (soft delete by default, permanent if specified).
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(
            status_code=404,
            detail=f"Client with ID {client_id} not found"
        )
    
    if permanent:
        # Permanent delete
        db.delete(client)
        message = f"Client {client_id} permanently deleted"
    else:
        # Soft delete
        client.is_active = False
        message = f"Client {client_id} deactivated"
    
    db.commit()
    
    return {"message": message}
