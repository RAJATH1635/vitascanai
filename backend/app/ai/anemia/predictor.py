from pathlib import Path
import joblib
import numpy as np

# -------------------------------------------------------
# Load Model and Scaler
# -------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "anemia_model.pkl"
SCALER_PATH = BASE_DIR / "models" / "anemia_scaler.pkl"

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)


# -------------------------------------------------------
# Prediction Function
# -------------------------------------------------------

def predict_anemia(
    gender: int,
    hemoglobin: float,
    mch: float,
    mchc: float,
    mcv: float,
):
    """
    Predict Anemia

    Returns:
        prediction
        confidence
    """

    data = np.array([
        [
            gender,
            hemoglobin,
            mch,
            mchc,
            mcv,
        ]
    ])

    data = scaler.transform(data)

    prediction = model.predict(data)[0]

    probability = model.predict_proba(data)[0]

    confidence = float(np.max(probability) * 100)

    return {
        "prediction": "Anemia" if prediction == 1 else "Normal",
        "confidence": round(confidence, 2),
    }