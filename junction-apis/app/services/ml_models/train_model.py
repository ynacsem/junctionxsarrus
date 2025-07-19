import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
df = pd.read_csv("data/balanced_contacts_20k.csv")  # relative to ml_models/

# Prepare features and target
X = df.drop(columns=["client_id", "property_id", "match"])
y = df["match"]

# Convert categorical and boolean values to numeric
X = pd.get_dummies(X)
joblib.dump(X.columns, "ml_models/match_columns.pkl")

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, "ml_models/match_predictor.pkl")

print("✅ Model trained and saved to match_predictor.pkl")
