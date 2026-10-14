from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

from config import DISEASES
from utils import (
    save_confusion_matrix,
    save_metrics_json,
    save_classification_report
)


def evaluate_tabular_model(model_name="anemia"):

    cfg = DISEASES[model_name]

    dataset_path = cfg["dataset"]
    model_path = cfg["model"]
    scaler_path = cfg["scaler"]
    target_column = cfg["target"]

    output_dir = Path("outputs") / model_name
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nEvaluating {model_name}")

    # -----------------------------------
    # Load dataset
    # -----------------------------------

    df = pd.read_csv(dataset_path)

    X = df.drop(columns=[target_column])
    y = df[target_column]

    # -----------------------------------
    # Recreate SAME train/test split
    # used during training
    # -----------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # -----------------------------------
    # Load scaler and trained model
    # -----------------------------------

    scaler = joblib.load(scaler_path)
    model = joblib.load(model_path)

    # -----------------------------------
    # Transform ONLY test data
    # -----------------------------------

    X_test_scaled = scaler.transform(X_test)

    # -----------------------------------
    # Predict ONLY test data
    # -----------------------------------

    predictions = model.predict(X_test_scaled)

    # -----------------------------------
    # Calculate metrics
    # -----------------------------------

    accuracy = accuracy_score(y_test, predictions)

    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    # -----------------------------------
    # Classification report
    # -----------------------------------

    report = classification_report(
        y_test,
        predictions,
        zero_division=0
    )

    # -----------------------------------
    # Confusion matrix
    # -----------------------------------

    cm = confusion_matrix(
        y_test,
        predictions
    )

    # -----------------------------------
    # Save metrics
    # -----------------------------------

    metrics = {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1)
    }

    save_metrics_json(
        metrics,
        output_dir / "metrics.json"
    )

    save_classification_report(
        report,
        output_dir / "classification_report.txt"
    )

    save_confusion_matrix(
        cm,
        ["Negative", "Positive"],
        output_dir / "confusion_matrix.png",
        title="Anemia"
    )

    print(json.dumps(metrics, indent=4))

    return metrics