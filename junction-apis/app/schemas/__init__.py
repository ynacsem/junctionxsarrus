# app/schemas/__init__.py
from .client import Client, ClientCreate, ClientUpdate, PropertyType, MaritalStatus
from .property import Property, PropertyCreate, PropertyUpdate


__all__ = [
    "Client", "ClientCreate", "ClientUpdate",
    "PropertyType", "MaritalStatus",
    "Property", "PropertyCreate", "PropertyUpdate"
]