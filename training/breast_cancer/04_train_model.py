import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from pathlib import Path
import matplotlib.pyplot as plt
import os

print("=" * 60)
print("VitaScan AI - Breast Cancer Model Training")
print("=" * 60)

# =====================================================
# Dataset
# =====================================================

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\breast_dataset_clean"
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names

print("\nClasses:")
print(class_names)

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# =====================================================
# Data Augmentation
# =====================================================

data_augmentation = keras.Sequential([

    layers.RandomFlip("horizontal"),

    layers.RandomRotation(0.10),

    layers.RandomZoom(0.10),

    layers.RandomContrast(0.10)

])

# =====================================================
# MobileNetV2
# =====================================================

base_model = tf.keras.applications.MobileNetV2(

    input_shape=(224,224,3),

    include_top=False,

    weights="imagenet"

)

base_model.trainable = False

# =====================================================
# Build Model
# =====================================================

model = keras.Sequential([

    data_augmentation,

    layers.Rescaling(1./255),

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.30),

    layers.Dense(128, activation="relu"),

    layers.Dropout(0.20),

    layers.Dense(
        len(class_names),
        activation="softmax"
    )

])

model.compile(

    optimizer="adam",

    loss="sparse_categorical_crossentropy",

    metrics=["accuracy"]

)

model.summary()

# =====================================================
# Create folders
# =====================================================

os.makedirs("../models", exist_ok=True)
os.makedirs("../graphs", exist_ok=True)

# =====================================================
# Callbacks
# =====================================================

checkpoint = keras.callbacks.ModelCheckpoint(

    "../models/breast_cancer_model.keras",

    monitor="val_accuracy",

    save_best_only=True

)

early_stop = keras.callbacks.EarlyStopping(

    monitor="val_loss",

    patience=3,

    restore_best_weights=True

)

reduce_lr = keras.callbacks.ReduceLROnPlateau(

    monitor="val_loss",

    factor=0.2,

    patience=2,

    min_lr=1e-6

)

# =====================================================
# Train
# =====================================================

history = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=15,

    callbacks=[

        checkpoint,

        early_stop,

        reduce_lr

    ]

)

loss, accuracy = model.evaluate(val_ds, verbose=1)

print("=" * 50)
print(f"Validation Accuracy: {accuracy*100:.2f}%")
print(f"Validation Loss: {loss:.4f}")
print("=" * 50)

# =====================================================
# Save Final Model
# =====================================================

model.save("../models/breast_cancer_model.keras")

# =====================================================
# Plot Accuracy
# =====================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["accuracy"], label="Training")

plt.plot(history.history["val_accuracy"], label="Validation")

plt.title("Breast Cancer Accuracy")

plt.xlabel("Epoch")

plt.ylabel("Accuracy")

plt.legend()

plt.savefig("../graphs/breast_accuracy.png")

# =====================================================
# Plot Loss
# =====================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["loss"], label="Training")

plt.plot(history.history["val_loss"], label="Validation")

plt.title("Breast Cancer Loss")

plt.xlabel("Epoch")

plt.ylabel("Loss")

plt.legend()

plt.savefig("../graphs/breast_loss.png")

print("\n")
print("=" * 60)
print("Training Completed Successfully!")
print("=" * 60)
print("Model Saved : ../models/breast_cancer_model.keras")
print("Graphs Saved: ../graphs/")