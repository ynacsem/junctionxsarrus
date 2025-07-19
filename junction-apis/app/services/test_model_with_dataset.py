import os
import sys
import pandas as pd
import joblib
import numpy as np
from math import radians, cos, sin, asin, sqrt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from fpdf import FPDF
import os

new_contacts_df = pd.read_csv("app/services/data/Synthetic_Contacts__2000_Buyers_.csv")


# Coordinates of Algerian cities (Latitude, Longitude)
WILAYA_COORDS = {
    "Adrar": (27.8743, -0.2942),
    "Chlef": (36.1652, 1.3342),
    "Laghouat": (33.8005, 2.8736),
    "Oum El Bouaghi": (35.8689, 7.1135),
    "Batna": (35.5550, 6.1741),
    "Bejaia": (36.7509, 5.0567),
    "Biskra": (34.8481, 5.7249),
    "Bechar": (31.6238, -2.2164),
    "Blida": (36.4700, 2.8339),
    "Bouira": (36.3741, 3.9014),
    "Tamanrasset": (22.7850, 5.5228),
    "Tebessa": (35.4042, 8.1203),
    "Tlemcen": (34.8880, -1.3169),
    "Tiaret": (35.3713, 1.3160),
    "Tizi Ouzou": (36.7169, 4.0497),
    "Algiers": (36.7538, 3.0588),
    "Djelfa": (34.6694, 3.2581),
    "Jijel": (36.8191, 5.7660),
    "Setif": (36.1911, 5.4137),
    "Saida": (34.8325, 0.1517),
    "Skikda": (36.8791, 6.9063),
    "Sidi Bel Abbes": (35.2022, -0.6311),
    "Annaba": (36.9000, 7.7667),
    "Guelma": (36.4621, 7.4261),
    "Constantine": (36.3650, 6.6147),
    "Medea": (36.2647, 2.7667),
    "Mostaganem": (35.9404, 0.0898),
    "MSila": (35.7055, 4.5411),
    "Mascara": (35.3967, 0.1400),
    "Ouargla": (31.9522, 5.3333),
    "Oran": (35.6971, -0.6308),
    "El Bayadh": (33.6831, 1.0191),
    "Illizi": (26.4833, 8.4666),
    "Bordj Bou Arreridj": (36.0730, 4.7632),
    "Boumerdes": (36.7678, 3.4791),
    "El Tarf": (36.7670, 8.3131),
    "Tindouf": (27.6711, -8.1470),
    "Tissemsilt": (35.6071, 1.8104),
    "El Oued": (33.3683, 6.8674),
    "Khenchela": (35.4350, 7.1438),
    "Souk Ahras": (36.2822, 7.9511),
    "Tipaza": (36.5897, 2.4474),
    "Mila": (36.4500, 6.2644),
    "Ain Defla": (36.2590, 1.9640),
    "Naama": (33.2667, -0.3167),
    "Ain Temouchent": (35.3000, -1.1333),
    "Ghardaia": (32.4894, 3.6735),
    "Relizane": (35.7370, 0.5550),
    "El Mghair": (33.9536, 5.9211),
    "El Menia": (30.5667, 2.8833),
    "Ouled Djellal": (34.4167, 4.9697),
    "Bordj Badji Mokhtar": (21.3333, 0.9167),
    "Beni Abbes": (30.1333, -2.1333),
    "Timimoun": (29.2417, 0.2333),
    "Touggourt": (33.0992, 6.0609),
    "Djanet": (24.5543, 9.4820),
    "In Salah": (27.1989, 2.4731),
    "In Guezzam": (19.5631, 5.7740),
}

def print_with_flush(message):
    """Print message and flush output immediately for real-time display"""
    print(message)
    sys.stdout.flush()

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'item'):  # numpy scalar
        return obj.item()
    elif hasattr(obj, 'tolist'):  # numpy array
        return obj.tolist()
    else:
        return obj

def haversine_distance(city1, city2):
    """Calculate distance between two cities using Haversine formula"""
    coord1 = WILAYA_COORDS.get(city1)
    coord2 = WILAYA_COORDS.get(city2)

    if not coord1 or not coord2:
        return 9999  # Return large distance if city not found

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Earth radius in kilometers
    return round(c * r, 1)

def score_from_distance_km(distance_km):
    """Convert distance to a score between 0 and 1 (closer = higher score)"""
    MAX_DISTANCE = 1000  # Maximum distance for scoring
    scaled = max(0.0, 1 - (distance_km / MAX_DISTANCE))
    return round(scaled, 4)

def simple_explanation(buyer_data, house_data, confidence, distance_km=None):
    """
    Simple explanation of why a buyer matches a house - includes ALL house parameters + distance!
    """
    explanations = []

    # Location match with distance
    if buyer_data['preferred_location'] == house_data['location']:
        explanations.append(f" Location match: {house_data['location']} (0 km)")
    else:
        if distance_km is not None:
            if distance_km <= 100:
                explanations.append(f" Location nearby: wants {buyer_data['preferred_location']}, house in {house_data['location']} ({distance_km} km away)")
            elif distance_km <= 300:
                explanations.append(f" Location moderate: wants {buyer_data['preferred_location']}, house in {house_data['location']} ({distance_km} km away)")
            else:
                explanations.append(f" Location far: wants {buyer_data['preferred_location']}, house in {house_data['location']} ({distance_km} km away)")
        else:
            explanations.append(f" Location mismatch: wants {buyer_data['preferred_location']}, house in {house_data['location']}")

    # Budget check
    house_price = house_data['price_DZD']
    min_budget = buyer_data['min_budget_DZD']
    max_budget = buyer_data['max_budget_DZD']

    if min_budget <= house_price <= max_budget:
        explanations.append(f" Budget fits: {house_price:,.0f} DZD within {min_budget:,.0f}-{max_budget:,.0f}")
    else:
        explanations.append(f" Budget issue: {house_price:,.0f} DZD outside {min_budget:,.0f}-{max_budget:,.0f}")

    # Area check
    house_area = house_data['area']
    min_area = buyer_data['min_area']
    max_area = buyer_data['max_area']

    if min_area <= house_area <= max_area:
        explanations.append(f" Area fits: {house_area}m² within {min_area}-{max_area}m²")
    else:
        explanations.append(f" Area issue: {house_area}m² outside {min_area}-{max_area}m²")

    # Property type
    if buyer_data['preferred_property_type'] == house_data['property_type']:
        explanations.append(f" Property type match: {house_data['property_type']}")
    else:
        explanations.append(f" Property type: wants {buyer_data['preferred_property_type']}, house is {house_data['property_type']}")

    # Number of rooms
    rooms = house_data.get('rooms', 0)
    explanations.append(f" Rooms: {rooms} bedrooms")

    # Schools nearby
    schools = house_data.get('schools_nearby', 0)
    if schools >= 2:
        explanations.append(f" Schools: {schools} schools nearby (excellent)")
    elif schools == 1:
        explanations.append(f" Schools: {schools} school nearby (good)")
    else:
        explanations.append(f" Schools: No schools nearby")

    # Hospitals nearby
    hospitals = house_data.get('hospitals_nearby', 0)
    if hospitals >= 2:
        explanations.append(f" Hospitals: {hospitals} hospitals nearby (excellent)")
    elif hospitals == 1:
        explanations.append(f" Hospitals: {hospitals} hospital nearby (good)")
    else:
        explanations.append(f" Hospitals: No hospitals nearby")

    # Parks nearby
    parks = house_data.get('parks_nearby', 0)
    if parks >= 2:
        explanations.append(f" Parks: {parks} parks nearby (excellent)")
    elif parks == 1:
        explanations.append(f" Parks: {parks} park nearby (good)")
    else:
        explanations.append(f" Parks: No parks nearby")

    # Public transport score
    transport = house_data.get('public_transport_score', 0)
    if transport >= 8:
        explanations.append(f" Transport: Excellent access (score: {transport}/10)")
    elif transport >= 6:
        explanations.append(f" Transport: Good access (score: {transport}/10)")
    elif transport >= 4:
        explanations.append(f" Transport: Fair access (score: {transport}/10)")
    else:
        explanations.append(f" Transport: Poor access (score: {transport}/10)")

    # Family considerations (if buyer has kids, amenities matter more)
    if buyer_data.get('has_kids', False):
        # Only show 'Great for kids' if there is at least 1 school or park nearby
        if schools > 0 or parks > 0:
            explanations.append(f" Family-friendly: Great for kids (buyer has children)")
        else:
            explanations.append(f" Not ideal for families with children (no schools or parks nearby)")

    return explanations

def train_model(csv_path="./app/services/data/balanced_contacts_20k.csv", model_out="./app/services/ml_models/match_predictor.pkl", columns_out="./app/services/ml_models/match_columns.pkl"):
    # ✅ Check if model and column files already exist
    if os.path.exists(model_out) and os.path.exists(columns_out):
        print(f" Loading existing model from {model_out}")
        print(" Loading model file...")
        model = joblib.load(model_out)
        print(" Loading column definitions...")
        expected_columns = joblib.load(columns_out)
        print(" Model and columns loaded successfully!")
        return model, expected_columns

    print(" Loading dataset...")
    print(f" Reading CSV file: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f" Dataset loaded: {len(df)} records")

    print(" Preparing features and target variables...")
    # Calculate real distances for training data
    print(" Calculating distances for training data...")
    distances = []
    for i, row in df.iterrows():
        buyer_city = row["preferred_location"]
        house_city = row["location"]
        distance = haversine_distance(buyer_city, house_city)
        distances.append(distance)

        # Show progress every 5000 records
        if i % 5000 == 0 and i > 0:
            print(f"    Calculated distances for {i}/{len(df)} records...")

    df["distance_km"] = distances
    print(f" Distance calculation complete! Average distance: {sum(distances)/len(distances):.1f} km")

    # Drop location columns and use only distance
    print(" Removing categorical location features, keeping only distance...")
    X = df.drop(columns=["client_id", "property_id", "match", "preferred_location", "location"])
    y = df["match"]
    print(" Using distance-based features only (no city names)")

    print(" One-hot encoding categorical features...")
    X_encoded = pd.get_dummies(X)
    print(f" Features encoded: {X_encoded.shape[1]} total features")

    print(" Saving column definitions...")
    joblib.dump(X_encoded.columns, columns_out)

    print(" Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)
    print(f" Data split: {len(X_train)} training, {len(X_test)} testing samples")

    print(" Training RandomForest model...")
    print(" This may take a moment...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    print(" Model training complete!")

    print(" Saving trained model...")
    joblib.dump(model, model_out)
    print(f" Model saved to {model_out}")
    return model, X_encoded.columns

def predict_matches(model, expected_columns, house_data, contacts_df, top_n=10, include_explanations=False, return_json=True):
    # Prepare result structure for JSON output
    result_json = {
        "house_info": house_data,
        "processing_info": {
            "initial_buyers_count": len(contacts_df),
            "house_price": house_data["price_DZD"]
        },
        "filtering_results": {},
        "matches": [],
        "profit_analysis": []
    }

    if not return_json:
        print(f"\n Running predictions for this house:")
        for key, value in house_data.items():
            print(f"  {key}: {value}")
        print(f"\n Scoring {len(contacts_df)} buyers...")

    # Step 1: Filter buyers by budget BEFORE any processing
    house_price = house_data["price_DZD"]
    initial_count = len(contacts_df)

    # Remove buyers whose maximum budget is less than house price
    contacts_df = contacts_df[contacts_df["max_budget_DZD"] >= house_price].copy()
    filtered_count = len(contacts_df)
    excluded_count = initial_count - filtered_count

    # Update JSON result
    result_json["filtering_results"] = {
        "excluded_buyers": excluded_count,
        "remaining_buyers": filtered_count,
        "exclusion_reason": f"budget < {house_price:,.0f} DZD"
    }

    if not return_json:
        print(f" Budget filtering: {excluded_count} buyers excluded (budget < {house_price:,.0f} DZD)")
        print(f" Remaining buyers to evaluate: {filtered_count}")

    if filtered_count == 0:
        result_json["error"] = "No buyers have sufficient budget for this house"
        if not return_json:
            print(" ⚠️  No buyers have sufficient budget for this house!")
        return result_json if return_json else []

    # Step 2: Broadcast house data to all rows
    for key, value in house_data.items():
        contacts_df[key] = value

    # Step 3: Calculate distances and add to dataframe
    if not return_json:
        print(" Calculating distances between buyers and house...")

    distances = []
    for i, row in contacts_df.iterrows():
        buyer_city = row["preferred_location"]
        house_city = house_data["location"]
        distance = haversine_distance(buyer_city, house_city)
        distances.append(distance)

    contacts_df["distance_km"] = distances

    # Step 3: Drop location columns (keep only distance) and one-hot encode
    prediction_df = contacts_df.drop(columns=["preferred_location", "location"])
    input_df = pd.get_dummies(prediction_df)

    # Step 4: Ensure all expected columns are present
    for col in expected_columns:
        if col not in input_df:
            input_df[col] = 0
    input_df = input_df[expected_columns]

    # Step 5: Predict all at once
    probas = model.predict_proba(input_df)

    # Step 6: Create results with distance scoring
    results = []

    for i, prob in enumerate(probas):

        buyer_data = contacts_df.iloc[i]
        distance_km = contacts_df.iloc[i]["distance_km"]

        # Calculate different confidence scores
        confidence_model = round(prob[1], 4)  # ML model confidence
        confidence_distance = score_from_distance_km(distance_km)  # Distance-based score
        confidence_final = round(0.7 * confidence_model + 0.3 * confidence_distance, 4)  # Combined score

        result = {
            "client_id": buyer_data["client_id"],
            "preferred_location": buyer_data["preferred_location"],
            "distance_km": distance_km,
            "confidence_model": confidence_model,
            "confidence_distance": confidence_distance,
            "confidence": confidence_final
        }

        if include_explanations:
            # Simple explanation with distance information
            explanations = simple_explanation(buyer_data, house_data, confidence_final, distance_km)

            result.update({
                "explanations": explanations,
                "buyer_details": {
                    "budget_range": f"{buyer_data['min_budget_DZD']:,.0f} - {buyer_data['max_budget_DZD']:,.0f} DZD",
                    "area_range": f"{buyer_data['min_area']} - {buyer_data['max_area']} m²",
                    "property_type": buyer_data['preferred_property_type'],
                    "marital_status": buyer_data['marital_status'],
                    "has_kids": buyer_data['has_kids']
                }
            })

        results.append(result)

    # Step 6: Sort by confidence
    results = sorted(results, key=lambda x: x["confidence"], reverse=True)
    top_matches = results[:top_n]

    # Step 7: Display results by confidence (only if not returning JSON)
    if not return_json:
        print(f"\n🔍 Top {len(top_matches)} matched buyers (by confidence):")
        print("=" * 60)
        for i, r in enumerate(top_matches):
            print(f"{i+1:2d}. ID {r['client_id']} from {r['preferred_location']} ({r['distance_km']:.1f} km) — Confidence: {r['confidence']:.4f}")
            print(f"     ML={r['confidence_model']:.4f} | Dist={r['confidence_distance']:.4f}")
            if include_explanations and "explanations" in r:
                for explanation in r["explanations"]:
                    print(f"      {explanation}")
            print("-" * 60)

    # Step 8: Add price info for profit analysis
    for r in top_matches:
        r["price"] = house_data["price_DZD"]

    # Step 9: Profit analysis
    buyers_with_profit = []
    for r in top_matches:
        max_budget = contacts_df[contacts_df["client_id"] == r["client_id"]].iloc[0]["max_budget_DZD"]
        potential_margin = max(0, max_budget - r["price"])
        potential_margin_percent = round((potential_margin / max_budget) * 100, 2)
        commission_profit = round(r["price"] * 0.03)

        enriched = r.copy()
        enriched["potential_margin_DZD"] = potential_margin
        enriched["potential_margin_percent"] = potential_margin_percent
        enriched["commission_profit_DZD"] = commission_profit
        buyers_with_profit.append(enriched)

    # إعادة الترتيب حسب الربح
    buyers_with_profit = sorted(buyers_with_profit, key=lambda x: x["potential_margin_percent"], reverse=True)

    if not return_json:
        print(f"\n💰 Profit Analysis (Sorted by Potential Margin %):")
        for i, r in enumerate(buyers_with_profit):
            print(f"{i+1}. BUYER ID: {r['client_id']} | Location: {r['preferred_location']}")
            print(f"   💰 Potential Profit: {r['potential_margin_DZD']:,.0f} DZD ({r['potential_margin_percent']}%)")
            print(f"   🏦 Commission: {r['commission_profit_DZD']:,.0f} DZD | Confidence: {r['confidence']:.4f}")
            print("-" * 60)

    # Update JSON result
    result_json["matches"] = top_matches
    result_json["profit_analysis"] = buyers_with_profit
    result_json["summary"] = {
        "total_matches": len(top_matches),
        "top_confidence": top_matches[0]["confidence"] if top_matches else 0,
        "best_profit_margin": buyers_with_profit[0]["potential_margin_percent"] if buyers_with_profit else 0
    }

    # Convert numpy types to native Python types for JSON serialization
    if return_json:
        result_json = convert_numpy_types(result_json)

    return result_json if return_json else top_matches


def get_bulk_recommendations(
    properties_source,
    top_n=10,
    show_explanations=True,
    dataset_path="./app/services/data/balanced_contacts_20k.csv",
    model_path="./app/services/ml_models/match_predictor.pkl",
    columns_path="./app/services/ml_models/match_columns.pkl",
    contacts_path=None,
    return_json=True
):
    """
    Accepts either a list of property dicts or a CSV file path for properties_source.
    If a string is passed, it is treated as a CSV file path and loaded.
    Returns recommendations for multiple properties at once.
    If return_json=True, returns structured JSON data instead of printing.
    """
    import csv

    # Prepare JSON result structure
    bulk_result = {
        "processing_info": {
            "total_properties": 0,
            "model_path": model_path,
            "dataset_path": dataset_path
        },
        "properties_results": [],
        "summary": {}
    }

    # Load model and columns once for all properties (more efficient)
    if not return_json:
        print(" Loading ML model and training data...")
    model, expected_columns = train_model(dataset_path, model_path, columns_path)

    # Load contacts data once
    if contacts_path:
        contacts_df = pd.read_csv(contacts_path)
    else:
        contacts_df = pd.read_csv(dataset_path)

    bulk_result["processing_info"]["total_buyers"] = len(contacts_df)

    if not return_json:
        print(f" Loaded {len(contacts_df)} buyer contacts")

    # If properties_source is a string, treat as CSV file path
    if isinstance(properties_source, str):
        if not return_json:
            print(f" Loading properties from CSV file: {properties_source}")
        with open(properties_source, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            properties_list = [dict(row) for row in reader]

        # Convert numeric fields from str to int/float
        for prop in properties_list:
            prop["price_DZD"] = float(prop["price_DZD"])
            prop["area"] = int(prop["area"])
            prop["rooms"] = int(prop["rooms"])
            prop["schools_nearby"] = int(prop["schools_nearby"])
            prop["hospitals_nearby"] = int(prop["hospitals_nearby"])
            prop["parks_nearby"] = int(prop["parks_nearby"])
            prop["public_transport_score"] = int(prop["public_transport_score"])

        if not return_json:
            print(f" Loaded {len(properties_list)} properties from CSV")
    else:
        properties_list = properties_source
        if not return_json:
            print(f" Processing {len(properties_list)} properties from list")

    bulk_result["processing_info"]["total_properties"] = len(properties_list)

    if not return_json:
        print(f"\n🏠 BULK RECOMMENDATIONS: Processing {len(properties_list)} properties...")
        print("=" * 80)

    results = []
    for i, house_data in enumerate(properties_list, 1):
        if not return_json:
            print(f"\n📍 PROPERTY {i}/{len(properties_list)}: {house_data.get('location', 'Unknown')} - {house_data.get('price_DZD', 0):,.0f} DZD")
            print("-" * 60)

        # Use predict_matches directly with return_json parameter
        matches = predict_matches(
            model=model,
            expected_columns=expected_columns,
            house_data=house_data,
            contacts_df=contacts_df.copy(),  # Use copy to avoid modifying original
            top_n=top_n,
            include_explanations=show_explanations,
            return_json=return_json
        )

        # Add property info to results for easier tracking
        property_result = {
            "property_info": house_data,
            "prediction_result": matches,
            "property_index": i
        }
        results.append(property_result)

        if not return_json:
            print(f"✅ Completed property {i}/{len(properties_list)}")

    # Add results to bulk_result
    bulk_result["properties_results"] = results

    # Calculate summary statistics
    total_matches = sum(len(r["prediction_result"]["matches"]) if return_json and "matches" in r["prediction_result"]
                       else len(r["prediction_result"]) if not return_json else 0 for r in results)

    bulk_result["summary"] = {
        "total_properties_processed": len(results),
        "total_matches_found": total_matches,
        "average_matches_per_property": round(total_matches / len(results), 2) if results else 0
    }

    if not return_json:
        print(f"\n🎯 BULK PROCESSING COMPLETE!")
        print(f"📊 Processed {len(results)} properties successfully")
        print(f"📈 Total matches found: {total_matches}")
        print("=" * 80)

    # Convert numpy types to native Python types for JSON serialization
    if return_json:
        bulk_result = convert_numpy_types(bulk_result)

    return bulk_result if return_json else results


def test_bulk_recommendations():
    """
    Test function to demonstrate bulk recommendations with sample properties.
    """
    print("\n🧪 TESTING BULK RECOMMENDATIONS")
    print("=" * 50)

    # Sample properties for testing
    sample_properties = [
        {
            "location": "Algiers",
            "price_DZD": 12000000,
            "area": 120,
            "property_type": "apartment",
            "rooms": 3,
            "schools_nearby": 2,
            "hospitals_nearby": 1,
            "parks_nearby": 1,
            "public_transport_score": 9
        },
        {
            "location": "Oran",
            "price_DZD": 8500000,
            "area": 90,
            "property_type": "villa",
            "rooms": 2,
            "schools_nearby": 1,
            "hospitals_nearby": 2,
            "parks_nearby": 0,
            "public_transport_score": 6
        },
        {
            "location": "Constantine",
            "price_DZD": 15000000,
            "area": 150,
            "property_type": "villa",
            "rooms": 4,
            "schools_nearby": 3,
            "hospitals_nearby": 2,
            "parks_nearby": 2,
            "public_transport_score": 7
        }
    ]

    # Test bulk recommendations
    results = get_bulk_recommendations(
        properties_source=sample_properties,
        top_n=5,
        show_explanations=False  # Set to False for cleaner output during testing
    )

    print(f"\n📋 BULK RESULTS SUMMARY:")
    print("=" * 50)
    for i, result in enumerate(results, 1):
        prop_info = result["property_info"]
        matches_count = len(result["top_matches"])
        print(f"{i}. {prop_info['location']} ({prop_info['price_DZD']:,.0f} DZD) → {matches_count} matches found")

    return results


def test_json_output():
    """
    Test function to demonstrate JSON output functionality.
    """
    print("\n🧪 TESTING JSON OUTPUT")
    print("=" * 50)

    # Test single property prediction with JSON output
    house_data = {
        "location": "Algiers",
        "price_DZD": 12000000,
        "area": 120,
        "property_type": "apartment",
        "rooms": 3,
        "schools_nearby": 2,
        "hospitals_nearby": 1,
        "parks_nearby": 1,
        "public_transport_score": 9
    }

    # Load model and data
    model_path = "./app/services/ml_models/match_predictor.pkl"
    columns_path = "./app/services/ml_models/match_columns.pkl"
    dataset_path = "./app/services/data/balanced_contacts_20k.csv"

    model, expected_columns = train_model(dataset_path, model_path, columns_path)
    contacts_df = pd.read_csv(dataset_path)

    print("\n1️⃣ Testing single property JSON output...")
    json_result = predict_matches(
        model=model,
        expected_columns=expected_columns,
        house_data=house_data,
        contacts_df=contacts_df,
        top_n=5,
        include_explanations=True,
        return_json=True
    )

    print("✅ Single property JSON result structure:")
    print(f"   - House info: {bool(json_result.get('house_info'))}")
    print(f"   - Processing info: {bool(json_result.get('processing_info'))}")
    print(f"   - Filtering results: {bool(json_result.get('filtering_results'))}")
    print(f"   - Matches found: {len(json_result.get('matches', []))}")
    print(f"   - Profit analysis: {len(json_result.get('profit_analysis', []))}")

    # Test bulk recommendations with JSON output
    print("\n2️⃣ Testing bulk recommendations JSON output...")
    sample_properties = [house_data, {
        "location": "Oran",
        "price_DZD": 8500000,
        "area": 90,
        "property_type": "villa",
        "rooms": 2,
        "schools_nearby": 1,
        "hospitals_nearby": 2,
        "parks_nearby": 0,
        "public_transport_score": 6
    }]

    bulk_json_result = get_bulk_recommendations(
        properties_source=sample_properties,
        top_n=3,
        show_explanations=False,
        return_json=True
    )

    print("✅ Bulk recommendations JSON result structure:")
    print(f"   - Processing info: {bool(bulk_json_result.get('processing_info'))}")
    print(f"   - Properties processed: {len(bulk_json_result.get('properties_results', []))}")
    print(f"   - Summary: {bool(bulk_json_result.get('summary'))}")

    print(f"\n🎯 JSON testing completed successfully!")
    print("� JSON results are ready for use with other functions.")

    return json_result, bulk_json_result


def test_all_json_functions():
    """
    Test all functions with JSON output capability.
    """
    print("\n🧪 TESTING ALL JSON FUNCTIONS")
    print("=" * 60)

    # Load model and data once
    model_path = "./app/services/ml_models/match_predictor.pkl"
    columns_path = "./app/services/ml_models/match_columns.pkl"
    dataset_path = "./app/services/data/balanced_contacts_20k.csv"

    model, expected_columns = train_model(dataset_path, model_path, columns_path)
    contacts_df = pd.read_csv(dataset_path)
    houses_df = pd.read_csv("app/services/data/synthetic_houses_200.csv")

    # Test data
    house_data = {
        "location": "Algiers",
        "price_DZD": 12000000,
        "area": 120,
        "property_type": "apartment",
        "rooms": 3,
        "schools_nearby": 2,
        "hospitals_nearby": 1,
        "parks_nearby": 1,
        "public_transport_score": 9
    }

    print("\n1️⃣ Testing predict_matches with JSON...")
    predict_result = predict_matches(
        model=model,
        expected_columns=expected_columns,
        house_data=house_data,
        contacts_df=contacts_df,
        top_n=3,
        include_explanations=True,
        return_json=True
    )
    print(f"   ✅ predict_matches JSON: {len(predict_result.get('matches', []))} matches")

    print("\n2️⃣ Testing get_bulk_recommendations with JSON...")
    bulk_result = get_bulk_recommendations(
        properties_source=[house_data],
        top_n=3,
        show_explanations=False,
        return_json=True
    )
    print(f"   ✅ get_bulk_recommendations JSON: {len(bulk_result.get('properties_results', []))} properties")

    print("\n3️⃣ Testing recommend_houses_for_client with JSON...")
    # Get a client ID from the dataset
    sample_client_id = contacts_df.iloc[0]['client_id']
    client_result = recommend_houses_for_client(
        client_id=sample_client_id,
        buyers_df=contacts_df,
        houses_df=houses_df,
        model=model,
        expected_columns=expected_columns,
        top_n=3,
        include_explanations=True,
        return_json=True
    )
    print(f"   ✅ recommend_houses_for_client JSON: {len(client_result.get('recommendations', []))} recommendations")

    print("\n🎯 All JSON functions tested successfully!")

    return {
        "predict_matches": predict_result,
        "bulk_recommendations": bulk_result,
        "client_recommendations": client_result
    }


def predict_matches_with_display(model, expected_columns, house_data, contacts_df, top_n=10, include_explanations=False):
    """
    Wrapper function that calls predict_matches and displays results for interactive use.
    """
    result = predict_matches(model, expected_columns, house_data, contacts_df, top_n, include_explanations, return_json=True)

    # Display house info
    print(f"\n Running predictions for this house:")
    for key, value in result["house_info"].items():
        print(f"  {key}: {value}")

    # Display filtering results
    filtering = result["filtering_results"]
    print(f"\n Budget filtering: {filtering['excluded_buyers']} buyers excluded ({filtering['exclusion_reason']})")
    print(f" Remaining buyers to evaluate: {filtering['remaining_buyers']}")

    if "error" in result:
        print(f" ⚠️  {result['error']}")
        return []

    # Display matches
    matches = result["matches"]
    print(f"\n🔍 Top {len(matches)} matched buyers (by confidence):")
    print("=" * 60)
    for i, r in enumerate(matches):
        print(f"{i+1:2d}. ID {r['client_id']} from {r['preferred_location']} ({r['distance_km']:.1f} km) — Confidence: {r['confidence']:.4f}")
        print(f"     ML={r['confidence_model']:.4f} | Dist={r['confidence_distance']:.4f}")
        if include_explanations and "explanations" in r:
            for explanation in r["explanations"]:
                print(f"      {explanation}")
        print("-" * 60)

    # Display profit analysis
    profit_analysis = result["profit_analysis"]
    print(f"\n💰 Profit Analysis (Sorted by Potential Margin %):")
    for i, r in enumerate(profit_analysis):
        print(f"{i+1}. BUYER ID: {r['client_id']} | Location: {r['preferred_location']}")
        print(f"   💰 Potential Profit: {r['potential_margin_DZD']:,.0f} DZD ({r['potential_margin_percent']}%)")
        print(f"   🏦 Commission: {r['commission_profit_DZD']:,.0f} DZD | Confidence: {r['confidence']:.4f}")
        print("-" * 60)

    return matches


def get_bulk_recommendations_with_display(properties_source, top_n=10, show_explanations=True, dataset_path="./app/services/data/balanced_contacts_20k.csv", model_path="./app/services/ml_models/match_predictor.pkl", columns_path="./app/services/ml_models/match_columns.pkl", contacts_path=None):
    """
    Wrapper function that calls get_bulk_recommendations and displays results for interactive use.
    """
    result = get_bulk_recommendations(properties_source, top_n, show_explanations, dataset_path, model_path, columns_path, contacts_path, return_json=True)

    # Display processing info
    processing_info = result["processing_info"]
    print(f" Loaded {processing_info['total_buyers']} buyer contacts")
    print(f"\n🏠 BULK RECOMMENDATIONS: Processing {processing_info['total_properties']} properties...")
    print("=" * 80)

    # Display results for each property
    for i, prop_result in enumerate(result["properties_results"], 1):
        prop_info = prop_result["property_info"]
        prediction = prop_result["prediction_result"]

        print(f"\n📍 PROPERTY {i}/{processing_info['total_properties']}: {prop_info.get('location', 'Unknown')} - {prop_info.get('price_DZD', 0):,.0f} DZD")
        print("-" * 60)

        if "error" in prediction:
            print(f" ⚠️  {prediction['error']}")
        else:
            matches_count = len(prediction.get('matches', []))
            print(f" Found {matches_count} matches")

        print(f"✅ Completed property {i}/{processing_info['total_properties']}")

    # Display summary
    summary = result["summary"]
    print(f"\n🎯 BULK PROCESSING COMPLETE!")
    print(f"📊 Processed {summary['total_properties_processed']} properties successfully")
    print(f"📈 Total matches found: {summary['total_matches_found']}")
    print("=" * 80)

    return result["properties_results"]


def recommend_houses_for_client_with_display(client_id, buyers_df, houses_df, model, expected_columns, top_n=5, include_explanations=True):
    """
    Wrapper function that calls recommend_houses_for_client and displays results for interactive use.
    """
    result = recommend_houses_for_client(client_id, buyers_df, houses_df, model, expected_columns, top_n, include_explanations, return_json=True)

    if "error" in result:
        print(f" ⚠️  {result['error']}")
        return []

    # Display client info
    client_info = result["client_info"]
    print(f"\n Recommending houses for CLIENT ID {client_info['client_id']} from {client_info['preferred_location']}:")
    print(f"  Budget: {client_info['budget_range']}")
    print(f"  Area preference: {client_info['area_preference']}")
    print(f"  Type: {client_info['property_type']} | Has kids: {client_info['has_kids']}")

    # Display filtering results
    filtering = result["filtering_results"]
    print(f" Budget filtering: {filtering['excluded_houses']} houses excluded ({filtering['exclusion_reason']})")
    print(f" Remaining houses to evaluate: {filtering['remaining_houses']}")

    # Display recommendations
    recommendations = result["recommendations"]
    print(f"\n Top {len(recommendations)} recommended houses for client {client_id} (by confidence):\n" + "-"*60)
    for i, r in enumerate(recommendations):
        print(f"{i+1}. House in {r['location']} — {r['price']:,.0f} DZD, {r['area']}m², {r['type']}, {r['distance_km']:.1f} km")
        print(f"   Confidence: {r['confidence']:.4f} (Model={r['confidence_model']:.4f}, Dist={r['confidence_distance']:.4f})")
        if include_explanations and "explanations" in r:
            for ex in r["explanations"]:
                print(f"    {ex}")
        print("-" * 60)

    # Display profit analysis
    profit_analysis = result["profit_analysis"]
    print("\n💰 Profit Analysis (Sorted by Potential Margin %):")
    for i, r in enumerate(profit_analysis):
        print(f"{i+1}. {r['location']} | Price: {r['price']:,.0f} DZD | Potential Profit: {r['potential_margin_DZD']:,.0f} DZD ({r['potential_margin_percent']}%)")
        print(f"    Commission: {r['commission_profit_DZD']:,.0f} DZD | Confidence: {r['confidence']:.4f}")
        print("-" * 60)

    return recommendations


def test_explainability_only(top_n=5):
    """
    Test function to demonstrate explainability features only.
    You can specify how many results to show.
    """
    dataset_path = "./app/services/data/balanced_contacts_20k.csv"
    model_path = "./app/services/ml_models/match_predictor.pkl"
    columns_path = "./app/services/ml_models/match_columns.pkl"

    # Train model
    model, expected_columns = train_model(dataset_path, model_path, columns_path)

    # Load dataset
    df = pd.read_csv(dataset_path)

    # Pick a house (same format as Streamlit form)
    house = {
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

    print(f" TESTING EXPLAINABILITY FEATURES - TOP {top_n} RESULTS:")
    print("="*80)

    # Test with configurable number of matches
    matches = predict_matches(model, expected_columns, house_data=house, contacts_df=df, top_n=top_n, include_explanations=True)

    return matches

def recommend_houses_for_client(client_id, buyers_df, houses_df, model, expected_columns, top_n=5, include_explanations=True, return_json=True):
    # Prepare JSON result structure
    result_json = {
        "client_info": {},
        "processing_info": {
            "initial_houses_count": len(houses_df)
        },
        "filtering_results": {},
        "recommendations": [],
        "profit_analysis": []
    }

    # استخراج بيانات العميل المحدد
    client_row = buyers_df[buyers_df["client_id"] == client_id]
    if client_row.empty:
        error_msg = f"No client found with ID: {client_id}"
        if return_json:
            result_json["error"] = error_msg
            return result_json
        else:
            print(error_msg)
            return []

    buyer_data = client_row.iloc[0].to_dict()
    result_json["client_info"] = {
        "client_id": client_id,
        "preferred_location": buyer_data['preferred_location'],
        "budget_range": f"{buyer_data['min_budget_DZD']:,.0f} - {buyer_data['max_budget_DZD']:,.0f} DZD",
        "area_preference": f"{buyer_data['min_area']} - {buyer_data['max_area']} m²",
        "property_type": buyer_data['preferred_property_type'],
        "has_kids": buyer_data['has_kids']
    }

    if not return_json:
        print(f"\n Recommending houses for CLIENT ID {client_id} from {buyer_data['preferred_location']}:")
        print(f"  Budget: {buyer_data['min_budget_DZD']:,.0f} - {buyer_data['max_budget_DZD']:,.0f} DZD")
        print(f"  Area preference: {buyer_data['min_area']} - {buyer_data['max_area']} m²")
        print(f"  Type: {buyer_data['preferred_property_type']} | Has kids: {buyer_data['has_kids']}")

    # Filter houses by budget BEFORE any processing
    max_budget = buyer_data["max_budget_DZD"]
    initial_house_count = len(houses_df)

    # Remove houses that exceed buyer's maximum budget
    houses_filtered = houses_df[houses_df["price_DZD"] <= max_budget].copy()
    filtered_house_count = len(houses_filtered)
    excluded_house_count = initial_house_count - filtered_house_count

    result_json["filtering_results"] = {
        "excluded_houses": excluded_house_count,
        "remaining_houses": filtered_house_count,
        "exclusion_reason": f"price > {max_budget:,.0f} DZD"
    }

    if not return_json:
        print(f" Budget filtering: {excluded_house_count} houses excluded (price > {max_budget:,.0f} DZD)")
        print(f" Remaining houses to evaluate: {filtered_house_count}")

    if filtered_house_count == 0:
        error_msg = "No houses are within this buyer's budget!"
        if return_json:
            result_json["error"] = error_msg
            return result_json
        else:
            print(f" ⚠️  {error_msg}")
            return []

    # نسخ المنازل المفلترة وإضافة بيانات العميل بأعمدة جديدة بدون طمس بيانات المنزل
    houses_copy = houses_filtered.copy()
    for key, value in buyer_data.items():
        houses_copy[f"buyer_{key}"] = value

    # حساب المسافات بين كل منزل وموقع العميل
    distances = []
    for i, row in houses_copy.iterrows():
        house_city = row["location"]
        buyer_city = buyer_data["preferred_location"]
        distances.append(haversine_distance(buyer_city, house_city))
    houses_copy["distance_km"] = distances

    # تجهيز البيانات للتنبؤ
    prediction_df = houses_copy.drop(columns=[])  # لا تحذف أي عمود هنا إن لم يكن ضروريًا
    input_df = pd.get_dummies(prediction_df)

    # التأكد من وجود كل الأعمدة المطلوبة
    for col in expected_columns:
        if col not in input_df:
            input_df[col] = 0
    input_df = input_df[expected_columns]

    # التنبؤ
    probas = model.predict_proba(input_df)
    results = []
    for i, prob in enumerate(probas):
        house_data = houses_copy.iloc[i]
        distance_km = house_data["distance_km"]
        confidence_model = round(prob[1], 4)
        confidence_distance = score_from_distance_km(distance_km)
        confidence_final = round(0.7 * confidence_model + 0.3 * confidence_distance, 4)

        result = {
            "house_index": i,
            "location": house_data["location"],
            "price": house_data["price_DZD"],
            "area": house_data["area"],
            "type": house_data["property_type"],
            "distance_km": distance_km,
            "confidence_model": confidence_model,
            "confidence_distance": confidence_distance,
            "confidence": confidence_final
        }

        if include_explanations:
            explanations = simple_explanation(buyer_data, house_data, confidence_final, distance_km)
            result["explanations"] = explanations

        results.append(result)

    # ترتيب النتائج وإزالة التكرار بناءً على خصائص المنزل
    results = sorted(results, key=lambda x: x["confidence"], reverse=True)
    seen = set()
    unique_matches = []
    for r in results:
        key = (r['location'], r['price'], r['area'], r['type'])
        if key not in seen:
            seen.add(key)
            unique_matches.append(r)

    # 1. الترتيب حسب الثقة
    results = sorted(unique_matches, key=lambda x: x["confidence"], reverse=True)
    top_matches = results[:top_n]

    if not return_json:
        print(f"\n Top {top_n} recommended houses for client {client_id} (by confidence):\n" + "-"*60)
        for i, r in enumerate(top_matches):
            print(f"{i+1}. House in {r['location']} — {r['price']:,.0f} DZD, {r['area']}m², {r['type']}, {r['distance_km']:.1f} km")
            print(f"   Confidence: {r['confidence']:.4f} (Model={r['confidence_model']:.4f}, Dist={r['confidence_distance']:.4f})")
            if include_explanations:
                for ex in r["explanations"]:
                    print(f"    {ex}")
            print("-" * 60)

    # 2. التحليل حسب الربح
    profit_analysis = evaluate_profits(top_matches, buyer_data, return_json=return_json)

    # Update JSON result
    result_json["recommendations"] = top_matches
    result_json["profit_analysis"] = profit_analysis
    result_json["summary"] = {
        "total_recommendations": len(top_matches),
        "top_confidence": top_matches[0]["confidence"] if top_matches else 0,
        "best_profit_margin": profit_analysis[0]["potential_margin_percent"] if profit_analysis else 0
    }

    # Convert numpy types to native Python types for JSON serialization
    if return_json:
        result_json = convert_numpy_types(result_json)
        return result_json
    else:
        return top_matches


def evaluate_profits(top_matches, buyer_data=None, commission_rate=0.03, use_client_data=False, return_json=True):
    results_with_profit = []

    for match in top_matches:
        price = match["price"]

        # عند البحث عن منازل لعميل
        if not use_client_data:
            max_budget = buyer_data["max_budget_DZD"]
        else:
            max_budget = match["max_budget_DZD"]

        potential_margin = max(0, max_budget - price)
        potential_margin_percent = round((potential_margin / max_budget) * 100, 2)
        commission_profit = round(price * commission_rate)

        enriched = match.copy()
        enriched["potential_margin_DZD"] = potential_margin
        enriched["potential_margin_percent"] = potential_margin_percent
        enriched["commission_profit_DZD"] = commission_profit

        results_with_profit.append(enriched)

    results_sorted_by_profit = sorted(results_with_profit, key=lambda x: x["potential_margin_percent"], reverse=True)

    if not return_json:
        print("\n💰 Profit Analysis (Sorted by Potential Margin %):")
        for i, r in enumerate(results_sorted_by_profit):
            print(f"{i+1}. {r['location']} | Price: {r['price']:,.0f} DZD | Potential Profit: {r['potential_margin_DZD']:,.0f} DZD ({r['potential_margin_percent']}%)")
            print(f"    Commission: {r['commission_profit_DZD']:,.0f} DZD | Confidence: {r['confidence']:.4f}")
            print("-" * 60)

    return results_sorted_by_profit



def main(top_n=10, show_explanations=True, selected_client_id=None, test_bulk=False, test_json=False, test_all_json=False):
    # تحميل النموذج
    model_path = "./app/services/ml_models/match_predictor.pkl"
    columns_path = "./app/services/ml_models/match_columns.pkl"
    model, expected_cols = train_model(model_out=model_path, columns_out=columns_path)

    # تحميل بيانات العملاء والمنازل
    contacts_df = pd.read_csv("app/services/data/Synthetic_Contacts__2000_Buyers_.csv")
    houses_df = pd.read_csv("app/services/data/synthetic_houses_200.csv")  # 👈 ملف المنازل

    if test_all_json:
        # 🔹 اختبار جميع دوال JSON
        print("\n🧪 TESTING ALL JSON FUNCTIONS")
        print("=" * 60)
        return test_all_json_functions()

    elif test_json:
        # 🔹 اختبار مخرجات JSON
        print("\n🧪 TESTING JSON OUTPUT FUNCTIONALITY")
        print("=" * 60)
        return test_json_output()

    elif test_bulk:
        # 🔹 المرحلة الجديدة: اختبار التوصيات المجمعة
        print("\n🏠 TESTING BULK RECOMMENDATIONS")
        print("=" * 60)

        # عينة من المنازل للاختبار
        sample_properties = [
            {
                "location": "Algiers",
                "price_DZD": 12000000,
                "area": 120,
                "property_type": "apartment",
                "rooms": 3,
                "schools_nearby": 2,
                "hospitals_nearby": 1,
                "parks_nearby": 1,
                "public_transport_score": 9
            },
            {
                "location": "Oran",
                "price_DZD": 8500000,
                "area": 90,
                "property_type": "villa",
                "rooms": 2,
                "schools_nearby": 1,
                "hospitals_nearby": 2,
                "parks_nearby": 0,
                "public_transport_score": 6
            },
            {
                "location": "Constantine",
                "price_DZD": 15000000,
                "area": 150,
                "property_type": "villa",
                "rooms": 4,
                "schools_nearby": 3,
                "hospitals_nearby": 2,
                "parks_nearby": 2,
                "public_transport_score": 7
            }
        ]

        # تشغيل التوصيات المجمعة
        results = get_bulk_recommendations(
            properties_source=sample_properties,
            top_n=top_n,
            show_explanations=show_explanations
        )

        print(f"\n📋 BULK RESULTS SUMMARY:")
        print("=" * 50)
        for i, result in enumerate(results, 1):
            prop_info = result["property_info"]
            matches_count = len(result["top_matches"])
            print(f"{i}. {prop_info['location']} ({prop_info['price_DZD']:,.0f} DZD) → {matches_count} matches found")

        return results

    elif selected_client_id is None:
        # 🔹 المرحلة 1: عرض أفضل العملاء لعقار معين
        house_data = {
            "location": "Bordj Bou Arreridj",
            "price_DZD": 15500000,
            "area": 70,
            "property_type": "villa",
            "rooms": 2,
            "schools_nearby": 1,
            "hospitals_nearby": 1,
            "parks_nearby": 0,
            "public_transport_score": 4
        }

        matches = predict_matches_with_display(
            model=model,
            expected_columns=expected_cols,
            house_data=house_data,
            contacts_df=contacts_df,
            top_n=top_n,
            include_explanations=show_explanations
        )

        print("\n To view better house suggestions for a specific buyer, run:")
        print("    python test_model_with_dataset.py --client=CLIENT_ID")
        print("\n To test bulk recommendations, run:")
        print("    python test_model_with_dataset.py --bulk")

    else:
        # 🔹 المرحلة 2: عرض منازل للعميل المحدد
        selected_client = contacts_df[contacts_df["client_id"] == selected_client_id]

        if selected_client.empty:
            print(f"No client found with ID: {selected_client_id}")
            return

        buyer = selected_client.iloc[0].to_dict()

        recommend_houses_for_client_with_display(
            client_id=selected_client_id,
            buyers_df=contacts_df,
            houses_df=houses_df,
            model=model,
            expected_columns=expected_cols,
            top_n=top_n,
            include_explanations=show_explanations
        )




if __name__ == "__main__":
    import sys

    # الإعدادات الافتراضية
    top_n = 10
    show_explanations = True

    # التحقق من المعاملات
    if len(sys.argv) > 1:
        if sys.argv[1] == "--bulk":
            # تشغيل اختبار التوصيات المجمعة
            print("🚀 Starting BULK RECOMMENDATIONS test...")
            main(top_n=top_n, show_explanations=show_explanations, test_bulk=True)
            exit()
        elif sys.argv[1] == "--json":
            # تشغيل اختبار مخرجات JSON
            print("🧪 Starting JSON OUTPUT test...")
            main(top_n=top_n, show_explanations=show_explanations, test_json=True)
            exit()
        elif sys.argv[1] == "--all-json":
            # تشغيل اختبار جميع دوال JSON
            print("🧪 Starting ALL JSON FUNCTIONS test...")
            main(top_n=top_n, show_explanations=show_explanations, test_all_json=True)
            exit()

    # تحميل النموذج
    model_path = "./app/services/ml_models/match_predictor.pkl"
    columns_path = "./app/services/ml_models/match_columns.pkl"
    model, expected_cols = train_model(model_out=model_path, columns_out=columns_path)

    # تحميل البيانات
    contacts_df = pd.read_csv("app/services/data/Synthetic_Contacts__2000_Buyers_.csv")
    houses_df = pd.read_csv("app/services/data/synthetic_houses_200.csv")

    # المرحلة 1: عرض أفضل العملاء لعقار معيّن
    house_data = {
        "location": "Bordj Bou Arreridj",
        "price_DZD": 15500000,
        "area": 70,
        "property_type": "villa",
        "rooms": 2,
        "schools_nearby": 1,
        "hospitals_nearby": 1,
        "parks_nearby": 0,
        "public_transport_score": 4
    }

    matches = predict_matches_with_display(
        model=model,
        expected_columns=expected_cols,
        house_data=house_data,
        contacts_df=contacts_df,
        top_n=top_n,
        include_explanations=show_explanations
    )

    # المرحلة 2: اختيار عميل من المقترحين أو تجربة التوصيات المجمعة
    print("\n Choose an option:")
    print("1. Enter CLIENT ID to view matching houses")
    print("2. Test BULK RECOMMENDATIONS (type 'bulk')")
    print("3. Test JSON OUTPUT (type 'json')")
    print("4. Test ALL JSON FUNCTIONS (type 'all-json')")
    print("\nAvailable Client IDs from top matches:")

    suggested_ids = [contact["client_id"] for contact in matches if "client_id" in contact]
    if not suggested_ids:
        print(" No valid client IDs found in top matches.")
        exit()

    for i, contact in enumerate(matches):
        if "client_id" in contact:
            print(f"{i+1}. ID: {contact['client_id']} - From {contact.get('preferred_location', 'Unknown')}")

    user_input = input("\nEnter client ID, 'bulk', 'json', or 'all-json': ").strip()

    if user_input.lower() == 'bulk':
        print("\n🚀 Starting BULK RECOMMENDATIONS test...")
        main(top_n=top_n, show_explanations=show_explanations, test_bulk=True)
    elif user_input.lower() == 'json':
        print("\n🧪 Starting JSON OUTPUT test...")
        main(top_n=top_n, show_explanations=show_explanations, test_json=True)
    elif user_input.lower() == 'all-json':
        print("\n🧪 Starting ALL JSON FUNCTIONS test...")
        main(top_n=top_n, show_explanations=show_explanations, test_all_json=True)
    else:
        selected_client_id = user_input
        selected_client = contacts_df[contacts_df["client_id"] == selected_client_id]
        if selected_client.empty:
            print(f" No client found with ID: {selected_client_id}")
            exit()

        recommend_houses_for_client_with_display(
            client_id=selected_client_id,
            buyers_df=contacts_df,
            houses_df=houses_df,
            model=model,
            expected_columns=expected_cols,
            top_n=top_n,
            include_explanations=show_explanations
        )

