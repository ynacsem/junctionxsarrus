import os
import csv
import tempfile
import json
from fastapi import APIRouter, HTTPException, Depends, Body, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.property import Property
from app.models.client import Client
from app.services.test_model_with_dataset import (
    predict_matches,
    get_bulk_recommendations,
    recommend_houses_for_client,
    train_model
)
from fastapi import UploadFile, File

import pandas as pd
import numpy as np
from fastapi import Query

router = APIRouter()

@router.get("/recommendations/property/{property_id}")
async def recommend_contacts_for_property(
    property_id: str,
    db: Session = Depends(get_db)
):
    # Fetch the property from the DB
    property_obj = db.query(Property).filter(Property.property_id == property_id).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Fetch all clients from the DB
    clients = db.query(Client).all()
    if not clients:
        raise HTTPException(status_code=404, detail="No clients found in database")

    # Write clients to a temporary CSV file with all new fields
    client_fieldnames = [
        "client_id", "preferred_location", "min_budget_DZD", "max_budget_DZD",
        "min_area", "max_area", "preferred_property_type", "marital_status", "has_kids",
        "weight_location", "weight_property_type", "preferred_rooms", "weight_rooms",
        "preferred_schools_nearby", "weight_schools_nearby", "preferred_hospitals_nearby", "weight_hospitals_nearby",
        "preferred_parks_nearby", "weight_parks_nearby", "preferred_public_transport_score", "weight_public_transport_score"
    ]
    with tempfile.NamedTemporaryFile(mode="w+", newline='', suffix=".csv", delete=False) as tmpfile:
        writer = csv.DictWriter(tmpfile, fieldnames=client_fieldnames)
        writer.writeheader()
        for client in clients:
            writer.writerow({
                "client_id": client.client_id,
                "preferred_location": client.preferred_location,
                "min_budget_DZD": client.min_budget_DZD,
                "max_budget_DZD": client.max_budget_DZD,
                "min_area": client.min_area,
                "max_area": client.max_area,
                "preferred_property_type": client.preferred_property_type,
                "marital_status": client.marital_status,
                "has_kids": client.has_kids,
                "weight_location": client.weight_location,
                "weight_property_type": client.weight_property_type,
                "preferred_rooms": client.preferred_rooms,
                "weight_rooms": client.weight_rooms,
                "preferred_schools_nearby": client.preferred_schools_nearby,
                "weight_schools_nearby": client.weight_schools_nearby,
                "preferred_hospitals_nearby": client.preferred_hospitals_nearby,
                "weight_hospitals_nearby": client.weight_hospitals_nearby,
                "preferred_parks_nearby": client.preferred_parks_nearby,
                "weight_parks_nearby": client.weight_parks_nearby,
                "preferred_public_transport_score": client.preferred_public_transport_score,
                "weight_public_transport_score": client.weight_public_transport_score,
            })
        contacts_path = tmpfile.name

    # Prepare house_data from the property object
    house_data = {
        "location": property_obj.location,
        "price_DZD": property_obj.price_DZD,
        "area": property_obj.area,
        "property_type": property_obj.property_type,
        "rooms": property_obj.rooms,
        "schools_nearby": property_obj.schools_nearby,
        "hospitals_nearby": property_obj.hospitals_nearby,
        "parks_nearby": property_obj.parks_nearby,
        "public_transport_score": property_obj.public_transport_score
    }

    # Use the new predict_matches API
    model, expected_columns = train_model()
    results = predict_matches(
        model=model,
        expected_columns=expected_columns,
        house_data=house_data,
        contacts_df=pd.read_csv(contacts_path),
        top_n=10,
        include_explanations=True,
        return_json=True
    )

    try:
        os.remove(contacts_path)
    except Exception as e:
        print(f"Warning: could not delete temp file {contacts_path}: {e}")

    return results





@router.get("/recommendations/client/{client_id}")
async def recommend_properties_for_client(
    client_id: str,
    db: Session = Depends(get_db)
):
    client_obj = db.query(Client).filter(Client.client_id == client_id).first()
    if not client_obj:
        raise HTTPException(status_code=404, detail="Client not found")

    properties = db.query(Property).all()
    if not properties:
        raise HTTPException(status_code=404, detail="No properties found in database")

    # Prepare buyers_df (single client) and houses_df (all properties)
    buyers_fieldnames = [
        "client_id", "preferred_location", "min_budget_DZD", "max_budget_DZD",
        "min_area", "max_area", "preferred_property_type", "marital_status", "has_kids",
        "weight_location", "weight_property_type", "preferred_rooms", "weight_rooms",
        "preferred_schools_nearby", "weight_schools_nearby", "preferred_hospitals_nearby", "weight_hospitals_nearby",
        "preferred_parks_nearby", "weight_parks_nearby", "preferred_public_transport_score", "weight_public_transport_score"
]
    houses_fieldnames = [
        "location", "price_DZD", "area", "property_type", "rooms",
        "schools_nearby", "hospitals_nearby", "parks_nearby", "public_transport_score"
    ]

    # Create DataFrames in memory
    buyers_df = pd.DataFrame([{
        "client_id": client_obj.client_id,
        "preferred_location": client_obj.preferred_location,
        "min_budget_DZD": client_obj.min_budget_DZD,
        "max_budget_DZD": client_obj.max_budget_DZD,
        "min_area": client_obj.min_area,
        "max_area": client_obj.max_area,
        "preferred_property_type": client_obj.preferred_property_type,
        "marital_status": client_obj.marital_status,
        "has_kids": client_obj.has_kids,
        "weight_location": client_obj.weight_location,
        "weight_property_type": client_obj.weight_property_type,
        "preferred_rooms": client_obj.preferred_rooms,
        "weight_rooms": client_obj.weight_rooms,
        "preferred_schools_nearby": client_obj.preferred_schools_nearby,
        "weight_schools_nearby": client_obj.weight_schools_nearby,
        "preferred_hospitals_nearby": client_obj.preferred_hospitals_nearby,
        "weight_hospitals_nearby": client_obj.weight_hospitals_nearby,
        "preferred_parks_nearby": client_obj.preferred_parks_nearby,
        "weight_parks_nearby": client_obj.weight_parks_nearby,
        "preferred_public_transport_score": client_obj.preferred_public_transport_score,
        "weight_public_transport_score": client_obj.weight_public_transport_score
    }])

    houses_df = pd.DataFrame([{
        "location": prop.location,
        "price_DZD": prop.price_DZD,
        "area": prop.area,
        "property_type": prop.property_type,
        "rooms": prop.rooms,
        "schools_nearby": prop.schools_nearby,
        "hospitals_nearby": prop.hospitals_nearby,
        "parks_nearby": prop.parks_nearby,
        "public_transport_score": prop.public_transport_score
    } for prop in properties])

    model, expected_columns = train_model()
    top_matches = recommend_houses_for_client(
        client_id,
        buyers_df,
        houses_df,
        model,
        expected_columns,
        top_n=10,
        include_explanations=True
    )
    # Convert numpy types to Python types
    top_matches = convert_numpy(top_matches)
    return {"client_id": client_id, "recommended_properties": top_matches}



router.post("/recommendations/properties/")
async def bulk_recommendations_for_properties(
    properties_list: list = Body(..., example=[
        {
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
    ]),
    db: Session = Depends(get_db)
):
    clients = db.query(Client).all()
    if not clients:
        raise HTTPException(status_code=404, detail="No clients found in database")

    # Write clients to a temporary CSV file with all new fields
    client_fieldnames = [
        "client_id", "preferred_location", "min_budget_DZD", "max_budget_DZD",
        "min_area", "max_area", "preferred_property_type", "marital_status", "has_kids",
        "weight_location", "weight_property_type", "preferred_rooms", "weight_rooms",
        "preferred_schools_nearby", "weight_schools_nearby", "preferred_hospitals_nearby", "weight_hospitals_nearby",
        "preferred_parks_nearby", "weight_parks_nearby", "preferred_public_transport_score", "weight_public_transport_score"
    ]
    with tempfile.NamedTemporaryFile(mode="w+", newline='', suffix=".csv", delete=False) as tmpfile:
        writer = csv.DictWriter(tmpfile, fieldnames=client_fieldnames)
        writer.writeheader()
        for client in clients:
            writer.writerow({
                "client_id": client.client_id,
                "preferred_location": client.preferred_location,
                "min_budget_DZD": client.min_budget_DZD,
                "max_budget_DZD": client.max_budget_DZD,
                "min_area": client.min_area,
                "max_area": client.max_area,
                "preferred_property_type": client.preferred_property_type,
                "marital_status": client.marital_status,
                "has_kids": client.has_kids,
                "weight_location": client.weight_location,
                "weight_property_type": client.weight_property_type,
                "preferred_rooms": client.preferred_rooms,
                "weight_rooms": client.weight_rooms,
                "preferred_schools_nearby": client.preferred_schools_nearby,
                "weight_schools_nearby": client.weight_schools_nearby,
                "preferred_hospitals_nearby": client.preferred_hospitals_nearby,
                "weight_hospitals_nearby": client.weight_hospitals_nearby,
                "preferred_parks_nearby": client.preferred_parks_nearby,
                "weight_parks_nearby": client.weight_parks_nearby,
                "preferred_public_transport_score": client.preferred_public_transport_score,
                "weight_public_transport_score": client.weight_public_transport_score,
            })
        contacts_path = tmpfile.name

    weight_location, weight_budget, weight_area, weight_model = 0.3, 0.3, 0.2, 0.2

    results = get_bulk_recommendations(
        properties_source=properties_list,
        top_n=10,
        show_explanations=True,
        contacts_path=contacts_path,
        weight_location=weight_location,
        weight_budget=weight_budget,
        weight_area=weight_area,
        weight_model=weight_model,
        return_json=True
    )

    try:
        os.remove(contacts_path)
    except Exception as e:
        print(f"Warning: could not delete temp file {contacts_path}: {e}")

    return results


@router.get("/recommendations/properties/")
async def bulk_recommendations_for_all_properties(
    db: Session = Depends(get_db)
):
    clients = db.query(Client).all()
    if not clients:
        raise HTTPException(status_code=404, detail="No clients found in database")

    properties = db.query(Property).all()
    if not properties:
        raise HTTPException(status_code=404, detail="No properties found in database")

    # Write properties to a temporary CSV file (use property fields, not client fields!)
    properties_fieldnames = [
        "location", "price_DZD", "area", "property_type", "rooms",
        "schools_nearby", "hospitals_nearby", "parks_nearby", "public_transport_score"
    ]
    with tempfile.NamedTemporaryFile(mode="w+", newline='', suffix=".csv", delete=False) as tmp_properties:
        writer = csv.DictWriter(tmp_properties, fieldnames=properties_fieldnames)
        writer.writeheader()
        for prop in properties:
            writer.writerow({
                "location": prop.location,
                "price_DZD": prop.price_DZD,
                "area": prop.area,
                "property_type": prop.property_type,
                "rooms": prop.rooms,
                "schools_nearby": prop.schools_nearby,
                "hospitals_nearby": prop.hospitals_nearby,
                "parks_nearby": prop.parks_nearby,
                "public_transport_score": prop.public_transport_score
            })
        properties_path = tmp_properties.name

    # Write clients to a temporary CSV file with all new fields
    clients_fieldnames = [
        "client_id", "preferred_location", "min_budget_DZD", "max_budget_DZD",
        "min_area", "max_area", "preferred_property_type", "marital_status", "has_kids",
        "weight_location", "weight_property_type", "preferred_rooms", "weight_rooms",
        "preferred_schools_nearby", "weight_schools_nearby", "preferred_hospitals_nearby", "weight_hospitals_nearby",
        "preferred_parks_nearby", "weight_parks_nearby", "preferred_public_transport_score", "weight_public_transport_score"
    ]
    with tempfile.NamedTemporaryFile(mode="w+", newline='', suffix=".csv", delete=False) as tmp_clients:
        writer = csv.DictWriter(tmp_clients, fieldnames=clients_fieldnames)
        writer.writeheader()
        for client in clients:
            writer.writerow({
                "client_id": client.client_id,
                "preferred_location": client.preferred_location,
                "min_budget_DZD": client.min_budget_DZD,
                "max_budget_DZD": client.max_budget_DZD,
                "min_area": client.min_area,
                "max_area": client.max_area,
                "preferred_property_type": client.preferred_property_type,
                "marital_status": client.marital_status,
                "has_kids": client.has_kids,
                "weight_location": client.weight_location,
                "weight_property_type": client.weight_property_type,
                "preferred_rooms": client.preferred_rooms,
                "weight_rooms": client.weight_rooms,
                "preferred_schools_nearby": client.preferred_schools_nearby,
                "weight_schools_nearby": client.weight_schools_nearby,
                "preferred_hospitals_nearby": client.preferred_hospitals_nearby,
                "weight_hospitals_nearby": client.weight_hospitals_nearby,
                "preferred_parks_nearby": client.preferred_parks_nearby,
                "weight_parks_nearby": client.weight_parks_nearby,
                "preferred_public_transport_score": client.preferred_public_transport_score,
                "weight_public_transport_score": client.weight_public_transport_score
            })
        contacts_path = tmp_clients.name

    # Call the bulk recommendation function
    results = get_bulk_recommendations(
        properties_source=properties_path,
        top_n=10,
        show_explanations=True,
        contacts_path=contacts_path,
        return_json=True
    )

    try:
        os.remove(contacts_path)
        os.remove(properties_path)
    except Exception as e:
        print(f"Warning: could not delete temp file: {e}")

    return results





@router.post("/recommendations/compare-properties/")
async def compare_properties_api(
    property_id_1: str = Body(..., embed=True, example="12122392382937"),
    property_id_2: str = Body(..., embed=True, example="12122392382938"),
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Compare two properties by their IDs and generate a PDF report.
    """
    # Fetch properties from DB
    prop1 = db.query(Property).filter(Property.property_id == property_id_1).first()
    prop2 = db.query(Property).filter(Property.property_id == property_id_2).first()
    if not prop1 or not prop2:
        raise HTTPException(status_code=404, detail="One or both properties not found")

    # Prepare house dicts
    house1 = {
        "property_id": prop1.property_id,
        "location": prop1.location,
        "price_DZD": prop1.price_DZD,
        "area": prop1.area,
        "property_type": prop1.property_type,
        "rooms": prop1.rooms,
        "schools_nearby": prop1.schools_nearby,
        "hospitals_nearby": prop1.hospitals_nearby,
        "parks_nearby": prop1.parks_nearby,
        "public_transport_score": prop1.public_transport_score
    }
    house2 = {
        "property_id": prop2.property_id,
        "location": prop2.location,
        "price_DZD": prop2.price_DZD,
        "area": prop2.area,
        "property_type": prop2.property_type,
        "rooms": prop2.rooms,
        "schools_nearby": prop2.schools_nearby,
        "hospitals_nearby": prop2.hospitals_nearby,
        "parks_nearby": prop2.parks_nearby,
        "public_transport_score": prop2.public_transport_score
    }

    # Load model and contacts
    from app.services.test_model_with_dataset import train_model
    import pandas as pd
    model, expected_columns = train_model()
    contacts = db.query(Client).all()
    contacts_df = pd.DataFrame([{
        "client_id": c.client_id,
        "preferred_location": c.preferred_location,
        "min_budget_DZD": c.min_budget_DZD,
        "max_budget_DZD": c.max_budget_DZD,
        "min_area": c.min_area,
        "max_area": c.max_area,
        "preferred_property_type": c.preferred_property_type,
        "marital_status": c.marital_status,
        "has_kids": c.has_kids,
        "weight_location": c.weight_location,
        "weight_property_type": c.weight_property_type,
        "preferred_rooms": c.preferred_rooms,
        "weight_rooms": c.weight_rooms,
        "preferred_schools_nearby": c.preferred_schools_nearby,
        "weight_schools_nearby": c.weight_schools_nearby,
        "preferred_hospitals_nearby": c.preferred_hospitals_nearby,
        "weight_hospitals_nearby": c.weight_hospitals_nearby,
        "preferred_parks_nearby": c.preferred_parks_nearby,
        "weight_parks_nearby": c.weight_parks_nearby,
        "preferred_public_transport_score": c.preferred_public_transport_score,
        "weight_public_transport_score": c.weight_public_transport_score
    } for c in contacts])

    # Compare and generate PDF using local functions
    comparison_df = compare_properties(model, expected_columns, house1, house2, contacts_df)
    filename = export_comparison_to_pdf(comparison_df)
    full_path = os.path.join("comparison_pdf", filename)
    background_tasks.add_task(os.remove, full_path)
    return FileResponse(full_path, media_type="application/pdf", filename=filename)




def convert_numpy(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    else:
        return obj


# --- Property Comparison Utilities ---
def compare_properties(model, expected_columns, house1, house2, contacts_df):
    import json
    def score_property(house):
        matches = predict_matches(model, expected_columns, house, contacts_df, top_n=10)
        # Always extract 'matches' if present (for return_json=True)
        if isinstance(matches, dict) and "matches" in matches:
            matches = matches["matches"]
        parsed_matches = []
        for m in matches:
            if isinstance(m, str):
                try:
                    parsed_matches.append(json.loads(m))
                except Exception:
                    continue
            else:
                parsed_matches.append(m)
        if not parsed_matches:
            return 0
        avg_conf = sum([m["confidence"] for m in parsed_matches]) / len(parsed_matches)
        return avg_conf

    def infrastructure_score(house):
        return sum([
            house.get("schools_nearby", 0),
            house.get("hospitals_nearby", 0),
            house.get("parks_nearby", 0),
            house.get("public_transport_score", 0)
        ])

    # Run predictions
    score1 = score_property(house1)
    score2 = score_property(house2)

    infra1 = infrastructure_score(house1)
    infra2 = infrastructure_score(house2)

    # Build comparison table
    comparison = pd.DataFrame([
        {
            "ID": house1["property_id"],
            "Location": house1["location"],
            "Price (DZD)": house1["price_DZD"],
            "Infrastructur Score": infra1,
            "Avg Buyer Score": round(score1, 4)
        },
        {
            "ID": house2["property_id"],
            "Location": house2["location"],
            "Price (DZD)": house2["price_DZD"],
            "Infrastructur Score": infra2,
            "Avg Buyer Score": round(score2, 4)
        }
    ])

    return comparison

def export_comparison_to_pdf(df):
    from fpdf import FPDF
    import os

    os.makedirs("comparison_pdf", exist_ok=True)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Title
    pdf.cell(200, 10, txt="Property Comparison Report", ln=True, align="C")
    pdf.ln(10)

    # Header row
    pdf.set_font("Arial", "B", size=11)
    num_cols = len(df.columns)
    col_widths = [190 / num_cols] * num_cols
    headers = df.columns.tolist()
    for i in range(num_cols):
        header = headers[i]
        if header == "Avg Buyer Score":
            header = "Avg Buyer Score (%)"
        pdf.cell(col_widths[i], 10, txt=str(header), border=1, align="C")
    pdf.ln()

    # Data rows
    pdf.set_font("Arial", size=10)
    for _, row in df.iterrows():
        for i, val in enumerate(row):
            if headers[i] == "Avg Buyer Score":
                val = f"{round(val * 100, 2)}%"
            pdf.cell(col_widths[i], 10, txt=str(val), border=1)
        pdf.ln()

    # Determine winning property
    df_sorted = df.sort_values(by="Avg Buyer Score", ascending=False)
    winner = df_sorted.iloc[0]

    # Add invoice-style summary
    pdf.ln(10)
    pdf.set_font("Arial", "B", size=12)
    pdf.cell(190, 10, txt="Recommended Property", ln=True)

    pdf.set_font("Arial", size=11)
    pdf.cell(190, 8, txt=f"Property ID: {winner['ID']}", ln=True)
    pdf.cell(190, 8, txt=f"Location: {winner['Location']}", ln=True)
    pdf.cell(190, 8, txt=f"Price (DZD): {winner['Price (DZD)']:,}", ln=True)
    pdf.cell(190, 8, txt=f"Infrastructure Score: {winner['Infrastructur Score']}", ln=True)
    pdf.cell(190, 8, txt=f"Avg Buyer Score: {round(winner['Avg Buyer Score'] * 100, 2)}%", ln=True)

    pdf.ln(5)
    pdf.set_font("Arial", "I", size=10)
    pdf.cell(190, 8, txt="This property is expected to attract more potential buyers based on the model's confidence scores.", ln=True)

    import uuid
    unique_id = uuid.uuid4().hex
    filename = f"{df.iloc[0]['ID']}{df.iloc[1]['ID']}_{unique_id}.pdf"
    full_path = f"comparison_pdf/{filename}"

    pdf.output(full_path)
    return filename
    
    