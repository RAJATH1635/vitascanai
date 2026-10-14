import tensorflow as tf
from pathlib import Path

DATASET_PATH = r"E:\vita\vitascan\Datasets\Dementia_dataset\AugmentedAlzheimerDataset"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

print("=" * 60)
print("Loading MRI Dataset...")
print("=" * 60)

dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

print("\nClass Names:")
print(dataset.class_names)

print("\nTraining batches:", len(dataset))
print("Validation batches:", len(validation_dataset))