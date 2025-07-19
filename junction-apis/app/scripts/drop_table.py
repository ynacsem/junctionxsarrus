from app.core.database import engine
from app.models.client import Client
from sqlalchemy import inspect

if __name__ == "__main__":
    inspector = inspect(engine)
    if 'clients' in inspector.get_table_names():
        Client.__table__.drop(engine)
        print("🗑️ 'clients' table dropped!")
        #  create it
        Client.__table__.create(engine)
    else:
        print("Table 'clients' does not exist.")
        Client.__table__.create(engine)
        print("✅ 'clients' table created!")