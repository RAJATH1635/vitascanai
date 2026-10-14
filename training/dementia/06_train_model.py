import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from pathlib import Path

print("=" * 60)
print("VitaScan AI - Dementia Model Training")
print("=" * 60)

# -------------------------------------------------
# Dataset Path
# -------------------------------------------------

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\Dementia_dataset\AugmentedAlzheimerDataset"
)

IMG_SIZE = (160, 160)
BATCH_SIZE = 16

# -------------------------------------------------
# Load Dataset
# -------------------------------------------------

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names

print("\nClasses:")
print(class_names)

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# -------------------------------------------------
# Data Augmentation
# -------------------------------------------------

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1)
])

# -------------------------------------------------
# MobileNetV2 Base Model
# -------------------------------------------------

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(160,160,3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# -------------------------------------------------
# Build Model
# -------------------------------------------------

model = keras.Sequential([

    data_augmentation,

    layers.Rescaling(1./255),

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.3),

    layers.Dense(
        len(class_names),
        activation="softmax"
    )
])

# -------------------------------------------------
# Compile
# -------------------------------------------------

model.compile(

    optimizer="adam",

    loss="sparse_categorical_crossentropy",

    metrics=["accuracy"]

)

model.summary()

# -------------------------------------------------
# Callbacks
# -------------------------------------------------

checkpoint = keras.callbacks.ModelCheckpoint(

    filepath="../models/dementia_model.keras",

    save_best_only=True,

    monitor="val_accuracy"

)

early_stop = keras.callbacks.EarlyStopping(

    monitor="val_loss",

    patience=3,

    restore_best_weights=True

)

# -------------------------------------------------
# Train
# -------------------------------------------------

history = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=10,

    callbacks=[checkpoint, early_stop]

)

loss, accuracy = model.evaluate(val_ds, verbose=1)

print("=" * 50)
print(f"Validation Accuracy: {accuracy*100:.2f}%")
print(f"Validation Loss: {loss:.4f}")
print("=" * 50)

# -------------------------------------------------
# Save Final Model
# -------------------------------------------------

model.save("../models/dementia_model.keras")

print("\nModel Saved Successfully!")
print("../models/dementia_model.keras")