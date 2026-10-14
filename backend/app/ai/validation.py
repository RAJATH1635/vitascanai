"""
VitaScan AI — Image Domain Validator

Validates uploaded images BEFORE they reach the disease classifier.
Checks:
1. File integrity — is it a valid, non-corrupted image?
2. Structural validity — dimensions, channels, format
3. Domain heuristics — does it resemble medical imaging for the selected category?
4. Rejects non-medical / out-of-distribution images early
"""

import logging
import os
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# ---------- Configuration per disease module ----------

DOMAIN_CONFIG = {
    "dementia": {
        "description": "MRI Brain Scan (grayscale medical imaging)",
        "min_dimension": 64,
        "max_dimension": 4096,
        "expected_channels": None,  # Accept both grayscale and RGB MRIs
        "max_color_saturation": 0.35,  # MRI scans are mostly grayscale
        "min_edge_density": 0.02,  # Medical images have structural edges
        "file_types": ["image"],
    },
    "breast_cancer": {
        "description": "Breast Ultrasound / Histopathology Image",
        "min_dimension": 64,
        "max_dimension": 4096,
        "expected_channels": None,
        "max_color_saturation": None,  # Histopathology can be colorful (H&E stain)
        "min_edge_density": 0.02,
        "file_types": ["image"],
    },
    "malaria": {
        "description": "Blood Smear Microscopy Image",
        "min_dimension": 64,
        "max_dimension": 4096,
        "expected_channels": None,
        "max_color_saturation": None,
        "min_edge_density": 0.02,
        "file_types": ["image"],
    },
    "anemia": {
        "description": "Clinical Tabular Data (CSV)",
        "file_types": ["csv"],
    },
}


class ImageValidationError(Exception):
    """Raised when image fails pre-inference validation."""
    pass


class DomainValidationError(Exception):
    """Raised when image does not match expected medical domain."""
    pass


def validate_image_integrity(file_path: str) -> dict:
    """
    Stage 1: Validate that the file is a readable, non-corrupted image.
    Returns image metadata if valid.
    """
    try:
        with Image.open(file_path) as img:
            img.verify()  # Verify integrity without loading full data

        # Re-open after verify (verify() makes the object unusable)
        with Image.open(file_path) as img:
            width, height = img.size
            mode = img.mode
            img_format = img.format

            return {
                "width": width,
                "height": height,
                "mode": mode,
                "format": img_format,
                "channels": len(img.getbands()),
            }
    except Exception as e:
        logger.warning(f"Image integrity check failed for {file_path}: {e}")
        raise ImageValidationError(
            f"The uploaded file is not a valid image or is corrupted. Details: {str(e)}"
        )


def validate_image_structure(file_path: str, disease_type: str) -> dict:
    """
    Stage 2: Validate image dimensions and structural properties
    against the requirements for the selected diagnostic module.
    """
    config = DOMAIN_CONFIG.get(disease_type.lower())
    if not config:
        raise ImageValidationError(f"Unknown diagnostic category: {disease_type}")

    # Anemia module expects CSV, not images
    if "image" not in config.get("file_types", []):
        ext = os.path.splitext(file_path)[1].lower()
        if ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"]:
            raise DomainValidationError(
                f"The {disease_type.replace('_', ' ').title()} module expects clinical tabular data (CSV format), "
                f"not an image file. Please upload a CSV file with the required blood test parameters."
            )
        return {"validation": "tabular", "status": "passed"}

    # For image-based modules
    meta = validate_image_integrity(file_path)

    min_dim = config.get("min_dimension", 32)
    max_dim = config.get("max_dimension", 8192)

    if meta["width"] < min_dim or meta["height"] < min_dim:
        raise ImageValidationError(
            f"Image is too small ({meta['width']}×{meta['height']}). "
            f"Minimum required dimension is {min_dim}×{min_dim} pixels for medical analysis."
        )

    if meta["width"] > max_dim or meta["height"] > max_dim:
        raise ImageValidationError(
            f"Image is too large ({meta['width']}×{meta['height']}). "
            f"Maximum supported dimension is {max_dim}×{max_dim} pixels."
        )

    return meta


def validate_domain_heuristics(file_path: str, disease_type: str) -> dict:
    """
    Stage 3: Lightweight statistical heuristics to detect obviously
    non-medical images (landscapes, selfies, screenshots, etc.)
    
    This is NOT a clinical validator. It catches obvious mismatches
    like uploading a vacation photo for an MRI scan analysis.
    
    Uses:
    - Color saturation analysis (medical images tend to be lower saturation)
    - Edge density (medical images have characteristic structure)
    - Entropy analysis (natural photos vs medical scans differ)
    """
    config = DOMAIN_CONFIG.get(disease_type.lower())
    if not config or "image" not in config.get("file_types", []):
        return {"domain_check": "skipped", "reason": "non-image module"}

    try:
        with Image.open(file_path) as img:
            img_rgb = img.convert("RGB")
            img_resized = img_rgb.resize((128, 128), Image.Resampling.LANCZOS)
            img_array = np.array(img_resized, dtype=np.float32)

            # --- Color Saturation Check ---
            # Convert to HSV-like space to measure saturation
            r, g, b = img_array[:, :, 0], img_array[:, :, 1], img_array[:, :, 2]
            max_c = np.maximum(np.maximum(r, g), b)
            min_c = np.minimum(np.minimum(r, g), b)
            chroma = max_c - min_c

            # Average saturation ratio
            with np.errstate(divide='ignore', invalid='ignore'):
                saturation = np.where(max_c > 0, chroma / max_c, 0)
            avg_saturation = float(np.mean(saturation))

            # --- Edge Density Check ---
            # Simple Sobel-like edge detection on grayscale
            gray = np.mean(img_array, axis=2)
            # Horizontal and vertical gradients
            gx = np.abs(np.diff(gray, axis=1))
            gy = np.abs(np.diff(gray, axis=0))
            edge_density = float(
                (np.mean(gx > 30) + np.mean(gy > 30)) / 2
            )

            # --- Entropy Check ---
            # Higher entropy = more complex/random, lower = more uniform
            gray_uint8 = (gray / 255.0 * 255).astype(np.uint8) if gray.max() > 1 else (gray * 255).astype(np.uint8)
            hist, _ = np.histogram(gray_uint8.flatten(), bins=256, range=(0, 256))
            hist = hist / hist.sum()
            hist = hist[hist > 0]
            entropy = float(-np.sum(hist * np.log2(hist)))

            # --- Uniformity Check ---
            # Pure solid color / blank images
            std_dev = float(np.std(img_array))

            logger.info(
                f"Domain validation [{disease_type}]: "
                f"saturation={avg_saturation:.3f}, edges={edge_density:.3f}, "
                f"entropy={entropy:.2f}, std={std_dev:.1f}"
            )

            # ----- Decision Logic -----
            
            validation_warnings = []

            # Reject blank/solid color images
            if std_dev < 5.0:
                raise DomainValidationError(
                    "The uploaded image appears to be blank or a solid color. "
                    "Please upload an actual medical scan image."
                )

            # Reject extremely low-information images
            if entropy < 2.0:
                raise DomainValidationError(
                    "The uploaded image has very little information content and does not "
                    "appear to be a valid medical scan. Please upload a proper diagnostic image."
                )

            # For dementia (MRI) — reject colorful images, breast cancer scans, or non-MRI scans
            if disease_type.lower() == "dementia":
                # Check 1: Saturated color / stained tissue (e.g. breast cancer histopathology)
                if avg_saturation > 0.15:
                    raise DomainValidationError(
                        "You should upload clear or correct image. The uploaded image does not appear to be a grayscale brain MRI scan."
                    )

                # Check 2: Corner darkness and background ratio
                # Brain MRIs are centered head scans with dark background around the skull
                corners = [
                    np.mean(gray[:16, :16]),
                    np.mean(gray[:16, -16:]),
                    np.mean(gray[-16:, :16]),
                    np.mean(gray[-16:, -16:])
                ]
                corners_mean = float(np.mean(corners))
                dark_ratio = float(np.mean(gray < 35))

                # Check 3: Bilateral brain symmetry
                left_half = gray[:, :64]
                right_flipped = np.fliplr(gray[:, 64:])
                try:
                    left_std = np.std(left_half)
                    right_std = np.std(right_flipped)
                    if left_std > 0 and right_std > 0:
                        corr = float(np.corrcoef(left_half.flatten(), right_flipped.flatten())[0, 1])
                    else:
                        corr = 0.0
                except Exception:
                    corr = 0.0

                # Check 4: Detect breast ultrasound or non-MRI structures
                # (ultrasounds have bright corners/tissue throughout and lack brain symmetry)
                if (corners_mean > 50.0 and dark_ratio < 0.15) or (dark_ratio < 0.08) or (corr < 0.35 and corners_mean > 35.0):
                    is_breast_cancer = False
                    try:
                        from app.ai.breast_cancer.predictor import predict_breast_cancer
                        bc_res = predict_breast_cancer(file_path)
                        if bc_res and bc_res.get("confidence", 0) > 65.0:
                            is_breast_cancer = True
                    except Exception:
                        pass

                    if is_breast_cancer:
                        raise DomainValidationError(
                            "You should upload clear or correct image. The uploaded image appears to be a breast cancer ultrasound scan rather than a brain MRI."
                        )
                    else:
                        raise DomainValidationError(
                            "You should upload clear or correct image. The uploaded file does not appear to be a valid brain MRI scan."
                        )

            # For Breast Cancer (Ultrasound) - mostly grayscale, high texture/speckle
            elif disease_type.lower() == "breast_cancer":
                if avg_saturation > 0.35:
                    raise DomainValidationError(
                        "The uploaded image appears to be a color photograph rather than a breast ultrasound. "
                        "The Breast Cancer screening module expects grayscale ultrasound sonography images. "
                        "Please upload a compatible breast ultrasound scan."
                    )
                    
            # For Malaria (Blood Smear) - cell structures, highly stained (pink/purple)
            elif disease_type.lower() == "malaria":
                # Blood smears are chemically stained (Giemsa), rejecting raw grayscale or blank
                if avg_saturation < 0.10:
                    raise DomainValidationError(
                        "The uploaded image appears to be grayscale or lacks expected cellular staining. "
                        "The Malaria screening module expects stained blood-smear microscopy images. "
                        "Please upload a compatible malaria microscopy image."
                    )

            # General: reject images with unnaturally high saturation + low edges
            # (typical of cartoon/illustration/screenshot images)
            if avg_saturation > 0.6 and edge_density < 0.03:
                raise DomainValidationError(
                    "The uploaded image does not appear to be a medical scan. It may be "
                    "a screenshot, illustration, or non-medical photograph. "
                    f"Please upload a compatible {config['description']}."
                )

            # General: reject very high saturation natural photos
            if avg_saturation > 0.45 and entropy > 6.5:
                validation_warnings.append(
                    "Image has high color saturation unusual for medical imaging."
                )

            return {
                "domain_check": "passed",
                "saturation": avg_saturation,
                "edge_density": edge_density,
                "entropy": entropy,
                "std_dev": std_dev,
                "warnings": validation_warnings,
            }

    except DomainValidationError:
        raise
    except Exception as e:
        logger.warning(f"Domain heuristics check failed (non-fatal): {e}")
        # Don't block on heuristic failures — let the model attempt
        return {"domain_check": "warning", "reason": str(e)}


def validate_upload(file_path: str, disease_type: str) -> dict:
    """
    Master validation function. Runs all stages in order.
    Returns validation metadata on success.
    Raises ImageValidationError or DomainValidationError on failure.
    """
    logger.info(f"Starting upload validation: category={disease_type}, file={file_path}")

    # Stage 1 & 2: Structural validation
    structure_meta = validate_image_structure(file_path, disease_type)

    # Stage 3: Domain heuristics (only for image modules)
    domain_meta = validate_domain_heuristics(file_path, disease_type)

    result = {
        "validation_status": "passed",
        "structure": structure_meta,
        "domain": domain_meta,
    }

    logger.info(f"Upload validation passed for {disease_type}: {file_path}")
    return result
