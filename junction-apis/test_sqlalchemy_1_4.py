# test_sqlalchemy_1_4.py
from sqlalchemy import create_engine, text

def test_sqlalchemy_connection():
    """Test SQLAlchemy 1.4 with pg8000"""
    try:
        # Direct database URL
        db_url = "postgresql+pg8000://junction_database_user:u7zBOps4rfMWLEfjqASt30fLOf1tzUN0@dpg-d1sqhnemcj7s73aqkku0-a.oregon-postgres.render.com/junction_database"
        
        print(f"🔗 Testing SQLAlchemy 1.4 with pg8000...")
        
        engine = create_engine(db_url)
        
        with engine.connect() as connection:
            # Test basic connection
            result = connection.execute(text("SELECT 1 as test"))
            test_result = result.fetchone()[0]
            print(f"✅ Database connection successful! Test result: {test_result}")
            
            # Test PostgreSQL version
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"PostgreSQL version: {version[:50]}...")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_sqlalchemy_connection()