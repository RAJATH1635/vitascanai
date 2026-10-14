import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "malaria_model.keras"
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = ["Parasitized", "Uninfected"]


def predict_malaria(image_path: str):
    img = image.load_img(image_path, target_size=(224, 224))
    img = image.img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = img / 255.0

    prediction = model.predict(img, verbose=0)

    predicted = np.argmax(prediction)
    confidence = float(np.max(prediction) * 100)

    return {
        "prediction": CLASS_NAMES[predicted],
        "confidence": round(confidence, 2)
    }