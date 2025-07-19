from app.core.database import Base, engine
from app.models.client import Client

def create_client_table():
    try:
        print("🔗 Creating Client table...")
        Client.__table__.create(bind=engine, checkfirst=True)
        print("✅ Client table created successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_client_table()