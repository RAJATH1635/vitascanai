import tensorflow as tf
from pathlib import Path

DATASET_PATH = Path(
    r"E:\vita\vitascan\Datasets\breast_dataset_clean"
)

IMG_SIZE = (224, 224)
BATCH_SIZE = 16

print("=" * 60)
print("Loading Breast Cancer Dataset...")
print("=" * 60)

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
)

print("\nClass Names:")
print(train_ds.class_names)

print(f"\nTraining batches : {len(train_ds)}")
print(f"Validation batches : {len(val_ds)}")