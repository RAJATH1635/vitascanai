from pathlib import Path

# ==========================================
# Base Directories
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

PROJECT_DIR = BASE_DIR.parent

APP_MODELS = BASE_DIR / "app" / "models"

DATASETS = PROJECT_DIR / "Datasets"

OUTPUTS = BASE_DIR / "evaluation" / "outputs"

# ==========================================
# Disease Configurations
# ==========================================

DISEASES = {

    "malaria": {

        "type": "image",

        "model": APP_MODELS / "malaria_model.keras",

        "dataset": DATASETS / "malaria_dataset" / "cell_images",

        "image_size": (224,224),

        "batch_size": 32,

        "classes": [
            "Parasitized",
            "Uninfected"
        ]

    },

    "breast_cancer": {

        "type": "image",

        "model": APP_MODELS / "breast_cancer_model.keras",

        "dataset": DATASETS / "breast_dataset_clean",

        "image_size": (224,224),

        "batch_size": 16,

        "classes": [
            "benign",
            "malignant",
            "normal"
        ]

    },

    "dementia": {

        "type": "image",

        "model": APP_MODELS / "dementia_model.keras",

        "dataset": DATASETS / "Dementia_dataset" / "AugmentedAlzheimerDataset",

        "image_size": (160,160),

        "batch_size": 16,

        "classes": [
            "MildDemented",
            "ModerateDemented",
            "NonDemented",
            "VeryMildDemented"
        ]

    },

    "anemia": {

        "type": "tabular",

        "model": APP_MODELS / "anemia_model.pkl",

        "scaler": APP_MODELS / "anemia_scaler.pkl",

        "dataset": DATASETS / "anemia_dataset" / "anemia.csv",
        
        "target": "Result"

    }

}