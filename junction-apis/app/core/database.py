from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

def get_database_url():
    """Get database URL with pg8000 driver"""
    db_url = settings.database_url
    
    # Replace postgresql:// with postgresql+pg8000://
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://")
    
    # Remove sslmode parameter if present (pg8000 doesn't use it)
    if "?sslmode=" in db_url:
        db_url = db_url.split("?sslmode=")[0]
    
    return db_url

def get_connect_args():
    """Get connection arguments for pg8000"""
    # Enable SSL for Render PostgreSQL
    if "render.com" in settings.database_url:
        return {"ssl_context": True}
    return {}

# Create engine with proper SSL configuration
engine = create_engine(
    get_database_url(),
    connect_args=get_connect_args(),
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()