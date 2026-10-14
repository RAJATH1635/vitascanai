from pathlib import Path
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "dementia_model.keras"

model = tf.keras.models.load_model(MODEL_PATH)

# Model expects 160x160 images
IMG_SIZE = (160, 160)


def predict_dementia(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = image.resize(IMG_SIZE)

    image = np.array(image, dtype=np.float32) / 255.0
    image = np.expand_dims(image, axis=0)

    prediction = model.predict(image, verbose=0)[0]

    class_names = [
        "Mild Demented",
        "Moderate Demented",
        "Non Demented",
        "Very Mild Demented"
    ]

    index = int(np.argmax(prediction))

    return {
        "prediction": class_names[index],
        "confidence": round(float(np.max(prediction)) * 100, 2)
    }