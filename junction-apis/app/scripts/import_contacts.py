import csv
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.client import Client

CSV_PATH = "./app/services/data/Synthetic_Contacts__2000_Buyers_.csv"

def parse_bool(val):
    return str(val).lower() in ("true", "1", "yes")

def parse_float(val):
    return float(val) if val not in ("", None) else None

def parse_int(val):
    return int(val) if val not in ("", None) else None

def main():
    db: Session = SessionLocal()
    existing_clients = set(row[0] for row in db.query(Client.client_id).all())

    print(f"📦 Existing clients in DB: {len(existing_clients)}")

    added_count = 0

    with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for i, row in enumerate(reader, start=1):
            client_id = str(row["client_id"])
            if client_id in existing_clients:
                continue

            try:
                client = Client(
                    client_id=client_id,
                    preferred_location=row.get("preferred_location"),
                    min_budget_DZD=parse_float(row.get("min_budget_DZD")),
                    max_budget_DZD=parse_float(row.get("max_budget_DZD")),
                    min_area=parse_int(row.get("min_area")),
                    max_area=parse_int(row.get("max_area")),
                    preferred_property_type=row.get("preferred_property_type"),
                    marital_status=row.get("marital_status"),
                    has_kids=parse_bool(row.get("has_kids")),
                    weight_location=parse_float(row.get("weight_location")),
                    weight_property_type=parse_float(row.get("weight_property_type")),
                    preferred_rooms=parse_int(row.get("preferred_rooms")),
                    weight_rooms=parse_float(row.get("weight_rooms")),
                    preferred_schools_nearby=parse_int(row.get("preferred_schools_nearby")),
                    weight_schools_nearby=parse_float(row.get("weight_schools_nearby")),
                    preferred_hospitals_nearby=parse_int(row.get("preferred_hospitals_nearby")),
                    weight_hospitals_nearby=parse_float(row.get("weight_hospitals_nearby")),
                    preferred_parks_nearby=parse_int(row.get("preferred_parks_nearby")),
                    weight_parks_nearby=parse_float(row.get("weight_parks_nearby")),
                    preferred_public_transport_score=parse_int(row.get("preferred_public_transport_score")),
                    weight_public_transport_score=parse_float(row.get("weight_public_transport_score"))
                )
                db.add(client)
                db.commit()
                added_count += 1
                print(f"✅ Added client {client_id} ({added_count} total)")
            except Exception as e:
                db.rollback()
                print(f"❌ Error adding client {client_id} at row {i}: {e}")

    db.close()
    print(f"✅ Done. Total clients added: {added_count}")

if __name__ == "__main__":
    main()
