import tensorflow as tf

IMG_SIZE = (224,224)
NUM_CLASSES = 4

print("="*60)
print("Building MobileNetV2 Model")
print("="*60)

# Load pretrained MobileNetV2
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224,224,3),
    include_top=False,
    weights="imagenet"
)

# Freeze pretrained layers
base_model.trainable = False

model = tf.keras.Sequential([

    tf.keras.layers.Input(shape=(224,224,3)),

    base_model,

    tf.keras.layers.GlobalAveragePooling2D(),

    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(
        128,
        activation="relu"
    ),

    tf.keras.layers.Dropout(0.2),

    tf.keras.layers.Dense(
        NUM_CLASSES,
        activation="softmax"
    )

])

model.compile(

    optimizer="adam",

    loss="sparse_categorical_crossentropy",

    metrics=["accuracy"]

)

model.summary()

print("\n")
print("="*60)
print("Model Built Successfully!")
print("="*60)python .\dementia\05_build_model.py