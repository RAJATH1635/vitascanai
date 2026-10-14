import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

from xgboost import XGBClassifier

print("=" * 60)
print("VitaScan AI - Training Anemia Model")
print("=" * 60)

# -------------------------
# Load Dataset
# -------------------------

DATASET = Path(
    r"E:\vita\vitascan\Datasets\anemia_dataset\anemia.csv"
)

df = pd.read_csv(DATASET)

X = df.drop("Result", axis=1)
y = df["Result"]

# -------------------------
# Split
# -------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# -------------------------
# Scale
# -------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# -------------------------
# Model
# -------------------------

model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

print("\nTraining Model...\n")

model.fit(X_train, y_train)

# -------------------------
# Prediction
# -------------------------

pred = model.predict(X_test)

accuracy = accuracy_score(y_test, pred)

print("=" * 60)
print(f"Accuracy : {accuracy*100:.2f}%")
print("=" * 60)

print("\nClassification Report\n")

print(classification_report(y_test, pred))

# -------------------------
# Save Model
# -------------------------

MODELS = Path("../models")
MODELS.mkdir(exist_ok=True)

joblib.dump(model, MODELS / "anemia_model.pkl")

print("\nModel Saved Successfully!")

print(MODELS / "anemia_model.pkl")