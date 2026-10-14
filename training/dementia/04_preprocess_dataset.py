import tensorflow as tf

# ==========================================
# VitaScan AI - Dementia Dataset Preprocessing
# ==========================================

DATASET_PATH = r"E:\vita\vitascan\Datasets\Dementia_dataset\AugmentedAlzheimerDataset"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

print("=" * 60)
print("Loading Dataset...")
print("=" * 60)

# ------------------------------------------
# Training Dataset
# ------------------------------------------

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

# ------------------------------------------
# Validation Dataset
# ------------------------------------------

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE
)

# ------------------------------------------
# Normalize Images (0-255 --> 0-1)
# ------------------------------------------

normalization_layer = tf.keras.layers.Rescaling(1.0 / 255)

train_ds = train_ds.map(
    lambda x, y: (normalization_layer(x), y),
    num_parallel_calls=tf.data.AUTOTUNE
)

val_ds = val_ds.map(
    lambda x, y: (normalization_layer(x), y),
    num_parallel_calls=tf.data.AUTOTUNE
)

# ------------------------------------------
# Optimize Dataset
# ------------------------------------------

train_ds = train_ds.shuffle(500).prefetch(tf.data.AUTOTUNE)
val_ds = val_ds.prefetch(tf.data.AUTOTUNE)

# ------------------------------------------
# Display Information
# ------------------------------------------

print("\n" + "=" * 60)
print("Dataset preprocessing completed successfully!")
print("=" * 60)

print(f"Training Batches   : {len(train_ds)}")
print(f"Validation Batches : {len(val_ds)}")

print("\nImage Size :", IMG_SIZE)
print("Batch Size :", BATCH_SIZE)

print("\nReady for Model Training!")