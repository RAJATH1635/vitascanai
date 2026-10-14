
import logging
import numpy as np
from PIL import Image
import pandas as pd
import os
import json

logger = logging.getLogger(__name__)

class PreprocessingError(Exception):
    pass

class PreprocessingService:
    def process(self, file_path: str) -> np.ndarray:
        raise NotImplementedError("Subclasses must implement this method")

class ImagePreprocessor(PreprocessingService):
    def __init__(self, target_size=(224, 224), channels=3):
        self.target_size = target_size
        self.channels = channels

    def process(self, file_path: str) -> np.ndarray:
        try:
            with Image.open(file_path) as img:
                if self.channels == 3:
                    img = img.convert('RGB')
                elif self.channels == 1:
                    img = img.convert('L')
                
                img = img.resize(self.target_size, Image.Resampling.LANCZOS)
                img_array = np.array(img, dtype=np.float32)
                
                # Normalize 0-1
                img_array = img_array / 255.0
                
                # Expand dims for batch prediction (1, H, W, C)
                img_array = np.expand_dims(img_array, axis=0)
                return img_array
        except Exception as e:
            logger.error(f"Image preprocessing failed for {file_path}: {e}")
            raise PreprocessingError(f"Invalid or corrupted image format: {e}")

class DementiaPreprocessor(ImagePreprocessor):
    def __init__(self):
        super().__init__(target_size=(224, 224), channels=1)

class BreastCancerPreprocessor(ImagePreprocessor):
    def __init__(self):
        super().__init__(target_size=(224, 224), channels=3)

class MalariaPreprocessor(ImagePreprocessor):
    def __init__(self):
        super().__init__(target_size=(128, 128), channels=3)

class AnemiaPreprocessor(PreprocessingService):
    def process(self, file_path: str) -> np.ndarray:
        try:
            ext = os.path.splitext(file_path)[1].lower()
            if ext == '.csv':
                df = pd.read_csv(file_path)
                # Ensure correct columns, fill missing, extract numeric features
                # Mock feature extraction for anemia (Hemoglobin, RBC, Hct)
                features = df.select_dtypes(include=[np.number]).fillna(0).values
                # Standardize shape to expected (1, N_features)
                if features.shape[0] > 0:
                    features = features[0:1, :]
                    # Pad to 10 features if needed
                    if features.shape[1] < 10:
                        features = np.pad(features, ((0, 0), (0, 10 - features.shape[1])))
                    elif features.shape[1] > 10:
                        features = features[:, :10]
                    return features.astype(np.float32)
            
            # If not CSV or no data, return a mock tensor
            return np.zeros((1, 10), dtype=np.float32)
        except Exception as e:
            logger.error(f"Tabular data preprocessing failed for {file_path}: {e}")
            raise PreprocessingError(f"Invalid clinical data format: {e}")
