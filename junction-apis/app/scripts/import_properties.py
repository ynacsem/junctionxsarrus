
import csv
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.property import Property
import time

CSV_PATH = "./app/services/data/synthetic_houses_200.csv" 

def parse_optional_int(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return None

def main():
    print("🏘️ Starting property import...")
    db: Session = SessionLocal()
    existing_properties = set(row[0] for row in db.query(Property.property_id).all())
    print(f"🔍 Found {len(existing_properties)} existing properties in DB.")

    added_count = 0
    skipped_count = 0
    start_time = time.time()

    with open(CSV_PATH, newline='', encoding='utf-8-sig') as csvfile:
        reader = csv.DictReader(csvfile)
    
        print("CSV columns:", reader.fieldnames)
        for i, row in enumerate(reader, start=1):
            print(f"Processing row {i}: {row}")  # Add this line
            property_id = str(row['property_id'])
            try:
                prop = Property(
                    property_id=property_id,
                    location=row["location"],
                    price_DZD=float(row["price_DZD"]),
                    area=int(row["area"]),
                    property_type=row["property_type"],
                    rooms=int(row["rooms"]),
                    schools_nearby=parse_optional_int(row["schools_nearby"]),
                    hospitals_nearby=parse_optional_int(row["hospitals_nearby"]),
                    parks_nearby=parse_optional_int(row["parks_nearby"]),
                    public_transport_score=parse_optional_int(row["public_transport_score"])
                )
                db.add(prop)
                db.commit()
                added_count += 1

                if added_count % 50 == 0:
                    print(f"✅ Inserted {added_count} properties...")

            except Exception as e:
                db.rollback()
                print(f"❌ Error at row {i} (property_id={property_id}): {e}")

    db.close()
    duration = time.time() - start_time

    print("\n✅ Property import complete")
    print(f"🧾 Total added: {added_count}")
    print(f"⏩ Skipped existing: {skipped_count}")
    print(f"⏱ Duration: {duration:.2f} seconds")

if __name__ == "__main__":
    main()
