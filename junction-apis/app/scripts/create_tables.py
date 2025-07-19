from app.core.database import Base, engine
from app.models.client import Client
from app.models.property import Property

if __name__ == "__main__":
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    print("🗑️ All tables dropped!")
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created!")