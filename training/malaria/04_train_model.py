import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from pathlib import Path
import matplotlib.pyplot as plt
import os

print("=" * 60)
print("VitaScan AI - Malaria Model Training")
print("=" * 60)

# =====================================================
# DATASET
# =====================================================

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\malaria_dataset\cell_images"
)

IMG_SIZE = (224,224)
BATCH_SIZE = 32

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
# DATA AUGMENTATION
# =====================================================

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.10),
    layers.RandomZoom(0.10),
    layers.RandomContrast(0.10),
])

# =====================================================
# MOBILENETV2
# =====================================================

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224,224,3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# =====================================================
# MODEL
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

# =====================================================
# COMPILE
# =====================================================

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =====================================================
# OUTPUT FOLDERS
# =====================================================

os.makedirs("../models", exist_ok=True)
os.makedirs("../graphs", exist_ok=True)

# =====================================================
# CALLBACKS
# =====================================================

checkpoint = keras.callbacks.ModelCheckpoint(
    "../models/malaria_model.keras",
    monitor="val_accuracy",
    save_best_only=True,
    verbose=1
)

early_stop = keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=3,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.2,
    patience=2,
    min_lr=1e-6,
    verbose=1
)

# =====================================================
# TRAIN
# =====================================================

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=10,
    callbacks=[
        checkpoint,
        early_stop,
        reduce_lr
    ]
)

# =====================================================
# EVALUATE MODEL
# =====================================================

loss, accuracy = model.evaluate(val_ds, verbose=1)

print("=" * 50)
print(f"Validation Accuracy : {accuracy*100:.2f}%")
print(f"Validation Loss     : {loss:.4f}")
print("=" * 50)

# =====================================================
# SAVE MODEL
# =====================================================

model.save("../models/malaria_model.keras")

# =====================================================
# ACCURACY GRAPH
# =====================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["accuracy"], label="Training")
plt.plot(history.history["val_accuracy"], label="Validation")

plt.title("Malaria Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()

plt.savefig("../graphs/malaria_accuracy.png")

# =====================================================
# LOSS GRAPH
# =====================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["loss"], label="Training")
plt.plot(history.history["val_loss"], label="Validation")

plt.title("Malaria Model Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()

plt.savefig("../graphs/malaria_loss.png")

print("\n" + "="*60)
print("Training Completed Successfully!")
print("="*60)

print("Model Saved:")
print("../models/malaria_model.keras")

print("\nGraphs Saved:")
print("../graphs/malaria_accuracy.png")
print("../graphs/malaria_loss.png")