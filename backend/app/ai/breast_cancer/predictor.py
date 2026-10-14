import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from pathlib import Path

# Load model
MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "breast_cancer_model.keras"
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = ["benign", "malignant", "normal"]


def predict_breast_cancer(image_path: str):
    """
    Predict Breast Cancer class from an ultrasound image.
    """

    img = image.load_img(image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    prediction = model.predict(img_array, verbose=0)

    predicted_index = np.argmax(prediction)
    confidence = float(np.max(prediction) * 100)

    return {
        "prediction": CLASS_NAMES[predicted_index],
        "confidence": round(confidence, 2)
    }