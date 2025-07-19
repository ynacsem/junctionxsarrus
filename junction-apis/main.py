from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A FastAPI application",
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Junction APIs",
        "version": settings.PROJECT_VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }
    
    
# Manual test block for matching function
if __name__ == "__main__":
    import json
    from app.services.test_model_with_dataset import get_top_matches

    house_data = {
        "location": "Bejaia",
        "price_DZD": 8500000,
        "area": 110,
        "property_type": "villa",
        "rooms": 4,
        "schools_nearby": 2,
        "hospitals_nearby": 1,
        "parks_nearby": 1,
        "public_transport_score": 8
    }

    # Use a different contacts dataset for testing
    contacts_path = "./app/services/data/test_contacts_2k.csv"

    # Enter custom weights for scoring
    print("Enter weights for scoring (sum should be 1.0, press Enter for defaults):")
    try:
        weight_location = float(input("Weight for location (default 0.3): ") or 0.3)
        weight_budget = float(input("Weight for budget (default 0.3): ") or 0.3)
        weight_area = float(input("Weight for area (default 0.2): ") or 0.2)
        weight_model = float(input("Weight for model probability (default 0.2): ") or 0.2)
    except Exception:
        print("Invalid input, using default weights.")
        weight_location, weight_budget, weight_area, weight_model = 0.3, 0.3, 0.2, 0.2

    results = get_top_matches(
        house_data,
        top_n=10,
        show_explanations=True,
        contacts_path=contacts_path,
        weight_location=weight_location,
        weight_budget=weight_budget,
        weight_area=weight_area,
        weight_model=weight_model
    )
    print(json.dumps(results, indent=2, ensure_ascii=False))