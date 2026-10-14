from pathlib import Path

import json
import numpy as np
import tensorflow as tf

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


def evaluate_image_model(model_name):

    cfg = DISEASES[model_name]

    model_path = cfg["model"]
    dataset_path = cfg["dataset"]
    image_size = cfg["image_size"]
    batch_size = cfg["batch_size"]
    class_names = cfg["classes"]

    output_dir = Path("outputs") / model_name
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nEvaluating {model_name}")

    dataset = tf.keras.utils.image_dataset_from_directory(

        dataset_path,

        labels="inferred",

        label_mode="int",

        image_size=image_size,

        batch_size=batch_size,

        shuffle=False

    )

    model = tf.keras.models.load_model(model_path)

    predictions = model.predict(dataset, verbose=1)

    if predictions.shape[1] == 1:

        predicted = (predictions > 0.5).astype(int).flatten()

    else:

        predicted = np.argmax(predictions, axis=1)

    true_labels = np.concatenate(
        [y.numpy() for _, y in dataset]
    )

    accuracy = accuracy_score(true_labels, predicted)

    precision = precision_score(
        true_labels,
        predicted,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        true_labels,
        predicted,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        true_labels,
        predicted,
        average="weighted",
        zero_division=0
    )

    report = classification_report(
        true_labels,
        predicted,
        target_names=class_names,
        zero_division=0
    )

    cm = confusion_matrix(
        true_labels,
        predicted
    )

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
        class_names,
        output_dir / "confusion_matrix.png",
        title=model_name
    )

    print(json.dumps(metrics, indent=4))

    return metrics