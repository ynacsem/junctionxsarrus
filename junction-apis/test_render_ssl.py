# test_render_ssl.py
from sqlalchemy import create_engine, text

def test_render_ssl_connection():
    """Test Render PostgreSQL with SSL using pg8000"""
    try:
        # Database URL without sslmode parameter (pg8000 handles SSL automatically for external connections)
        db_url = "postgresql+pg8000://junction_database_user:u7zBOps4rfMWLEfjqASt30fLOf1tzUN0@dpg-d1sqhnemcj7s73aqkku0-a.oregon-postgres.render.com/junction_database"
        
        print(f"🔗 Testing Render PostgreSQL with pg8000 (SSL auto-enabled)...")
        
        # Create engine with SSL configuration for pg8000
        engine = create_engine(
            db_url,
            connect_args={
                "ssl_context": True  # Enable SSL for pg8000
            }
        )
        
        with engine.connect() as connection:
            # Test basic connection
            result = connection.execute(text("SELECT 1 as test"))
            test_result = result.fetchone()[0]
            print(f"✅ SSL Database connection successful! Test result: {test_result}")
            
            # Test PostgreSQL version
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"PostgreSQL version: {version[:50]}...")
            
            # Test database name
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()[0]
            print(f"Connected to database: {db_name}")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_render_ssl_connection()