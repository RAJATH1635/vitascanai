import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

print("=" * 60)
print("VitaScan AI - Anemia Data Preprocessing")
print("=" * 60)

DATASET = Path(
    r"E:\vita\vitascan\Datasets\anemia_dataset\anemia.csv"
)

df = pd.read_csv(DATASET)

# ----------------------------
# Features and Target
# ----------------------------

X = df.drop("Result", axis=1)
y = df["Result"]

print("\nFeatures:")
print(X.columns.tolist())

print("\nTarget:")
print("Result")

# ----------------------------
# Train Test Split
# ----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Samples :", len(X_train))
print("Testing Samples  :", len(X_test))

# ----------------------------
# Feature Scaling
# ----------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ----------------------------
# Save Scaler
# ----------------------------

MODELS = Path("../models")
MODELS.mkdir(exist_ok=True)

joblib.dump(scaler, MODELS / "anemia_scaler.pkl")

print("\nScaler Saved Successfully!")

print("=" * 60)
print("Preprocessing Completed Successfully")
print("=" * 60)