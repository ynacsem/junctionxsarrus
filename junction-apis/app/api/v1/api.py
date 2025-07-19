from fastapi import APIRouter
from app.api.v1.endpoints import clients
from app.api.v1.endpoints import properties
from app.api.v1.endpoints import recommendations

api_router = APIRouter()

@api_router.get("/test")
async def test_endpoint():
    return {"message": "API v1 is working"}

# Include endpoint routers

api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(recommendations.router, tags=["recommendations"])