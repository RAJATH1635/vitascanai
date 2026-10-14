
import logging
from app.ai.preprocessing.processors import (
    DementiaPreprocessor, BreastCancerPreprocessor, 
    MalariaPreprocessor, AnemiaPreprocessor, PreprocessingError
)
from app.ai.models.real_models import (
    DementiaModel, BreastCancerModel, 
    MalariaModel, AnemiaModel, ModelLoadError
)

logger = logging.getLogger(__name__)

class AIModelRouter:
    _instance = None
    
    # Singleton pattern to cache models globally
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIModelRouter, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.routes = {
            "dementia": {
                "preprocessor": DementiaPreprocessor(),
                "model": DementiaModel()
            },
            "breast_cancer": {
                "preprocessor": BreastCancerPreprocessor(),
                "model": BreastCancerModel()
            },
            "malaria": {
                "preprocessor": MalariaPreprocessor(),
                "model": MalariaModel()
            },
            "anemia": {
                "preprocessor": AnemiaPreprocessor(),
                "model": AnemiaModel()
            }
        }
        logger.info("AI Model Router Initialized. Models are ready for lazy loading.")

    def process_and_predict(self, disease_category: str, file_path: str):
        route = self.routes.get(disease_category.lower())
        if not route:
            raise ValueError(f"No AI route defined for category: {disease_category}")
        
        preprocessor = route["preprocessor"]
        model = route["model"]

        try:
            # 1. Preprocessing (Resize, Normalize, Tensor)
            tensor_data = preprocessor.process(file_path)
            
            # 2. Deep Learning Prediction
            prediction = model.predict(tensor_data)
            
            # 3. Softmax Confidence Gate (Out-of-Distribution Detection)
            # Threshold set to 60.0% probability. If the highest likelihood class
            # is beneath this threshold, the model is uncertain, implying the image 
            # is likely an anomaly, out of domain, or artifacted.
            confidence = prediction.get("confidence_score", 0.0)
            
            # Some predictors might return percentage (60) vs ratio (0.6). Scale accordingly.
            normalized_conf = confidence if confidence <= 1.0 else (confidence / 100.0)

            if normalized_conf < 0.60:
                logger.warning(
                    f"Prediction rejected due to weak confidence ({normalized_conf:.2f}). "
                    f"Possible OOD or artifact."
                )
                return {
                    "status": "FAILED", 
                    "result_class": "Inconclusive / Unrecognized Scan", 
                    "confidence_score": confidence, 
                    "processing_time_ms": prediction.get("processing_time_ms", 0)
                }

            return prediction
        except PreprocessingError as pe:
            logger.error(f"Pipeline error (Preprocessing): {pe}")
            return {"status": "FAILED", "result_class": "Invalid File Format", "confidence_score": 0.0, "processing_time_ms": 0}
        except ModelLoadError as me:
            logger.error(f"Pipeline error (Model Loading): {me}")
            return {"status": "FAILED", "result_class": "Model Load Error", "confidence_score": 0.0, "processing_time_ms": 0}
        except Exception as e:
            logger.error(f"Pipeline unexpected error: {e}")
            return {"status": "FAILED", "result_class": "Inference Error", "confidence_score": 0.0, "processing_time_ms": 0}

ai_router = AIModelRouter()
