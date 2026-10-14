
import os
import shutil
import logging
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.ai.router import ai_router
from app.ai.validation import (
    validate_upload,
    ImageValidationError,
    DomainValidationError,
)
import uuid

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".csv"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

VALID_DISEASE_TYPES = {"dementia", "breast_cancer", "malaria", "anemia"}

class UploadService:
    def __init__(self):
        self.base_storage = "storage/uploads"

    def validate_file(self, file: UploadFile):
        """Stage 0: Basic file format and size validation."""
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Accepted formats: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
        
        if size == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
        return True

    def process_upload(self, db: Session, user_id: str, file: UploadFile, disease_type: str):
        """
        Complete upload pipeline:
        1. Validate file format/size
        2. Validate disease category
        3. Save file to disk
        4. Validate image integrity + domain suitability
        5. Run AI model inference
        6. Save prediction to database
        """

        # --- Step 1: Basic file validation ---
        self.validate_file(file)

        # --- Step 2: Validate disease category ---
        if disease_type.lower() not in VALID_DISEASE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid diagnostic category '{disease_type}'. "
                       f"Supported categories: {', '.join(VALID_DISEASE_TYPES)}"
            )

        # --- Step 3: Save file to disk ---
        target_dir = os.path.join(self.base_storage, disease_type.lower())
        os.makedirs(target_dir, exist_ok=True)

        safe_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(target_dir, safe_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # --- Step 4: Image integrity + domain validation (BEFORE inference) ---
        try:
            validation_result = validate_upload(file_path, disease_type)
            logger.info(f"Validation passed for {disease_type}: {validation_result}")
        except ImageValidationError as e:
            # Clean up saved file
            self._cleanup_file(file_path)
            logger.warning(f"Image validation failed: {e}")
            raise HTTPException(
                status_code=422,
                detail={
                    "error_type": "image_validation_error",
                    "message": str(e),
                    "suggestion": "Please upload a valid, non-corrupted medical image file."
                }
            )
        except DomainValidationError as e:
            # Clean up saved file
            self._cleanup_file(file_path)
            logger.warning(f"Domain validation failed: {e}")
            raise HTTPException(
                status_code=422,
                detail={
                    "error_type": "domain_validation_error",
                    "message": str(e),
                    "suggestion": "Please upload an image that matches the selected diagnostic category."
                }
            )

        # --- Step 5: Run AI model inference ---
        prediction_result = ai_router.process_and_predict(
            disease_type,
            file_path
        )

        # Check if inference itself failed
        if prediction_result.get("status") == "FAILED":
            self._cleanup_file(file_path)
            raise HTTPException(
                status_code=500,
                detail={
                    "error_type": "inference_error",
                    "message": f"AI model inference failed: {prediction_result.get('result_class', 'Unknown error')}",
                    "suggestion": "Please try again or contact support."
                }
            )

        # --- Step 6: Save prediction to database (ONLY on successful inference) ---
        from app.models.prediction import Prediction
        from app.core.timezone import utc_now, format_iso_utc

        prediction = Prediction(
            user_id=user_id,
            disease=disease_type,
            prediction=prediction_result.get("result_class", "Unknown"),
            confidence=prediction_result.get("confidence_score", 0.0),
            image_path=file_path,
            created_at=utc_now(),
        )

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return {
            "id": prediction.id,
            "disease": prediction.disease,
            "prediction": prediction.prediction,
            "confidence": prediction.confidence,
            "image_path": prediction.image_path,
            "created_at": format_iso_utc(prediction.created_at),
            "prediction_result": prediction_result,
            "validation": validation_result,
        }

    def _cleanup_file(self, file_path: str):
        """Remove a saved file that failed validation."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up rejected file: {file_path}")
        except Exception as e:
            logger.error(f"Failed to clean up file {file_path}: {e}")

upload_service = UploadService()

