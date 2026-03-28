"""
Disease Detection Service — Loads .h5 TensorFlow models and JSON treatment data.

Supports 4 crops: Potato, Corn, Rice, Sugarcane
Each has a .h5 Keras model + .json treatment solutions.
"""

import os
import json
import numpy as np
from pathlib import Path
from io import BytesIO

# ── Resolve paths ──────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DISEASE_MODEL_DIR = PROJECT_ROOT / "latest_model" / "disease"

# Global disease model data
_disease_models = {}
_disease_solutions = {}

# Supported crops and their model files
DISEASE_CROPS = {
    "potato": {
        "model_file": "potato.h5",
        "solution_file": "potato.json",
        "display_name": "Potato",
        "classes": ["Potato___Early_Blight", "Potato___Healthy", "Potato___Late_Blight"],
    },
    "corn": {
        "model_file": "corn.h5",
        "solution_file": "corn.json",
        "display_name": "Corn / Maize",
        "classes": ["Corn___Common_Rust", "Corn___Gray_Leaf_Spot", "Corn___Healthy", "Corn___Northern_Leaf_Blight"],
    },
    "rice": {
        "model_file": "rice.h5",
        "solution_file": "rice.json",
        "display_name": "Rice",
        "classes": ["Rice___Brown_Spot", "Rice___Healthy", "Rice___Leaf_Blast", "Rice___Neck_Blast"],
    },
    "sugarcane": {
        "model_file": "sugarcane.h5",
        "solution_file": "sugar_cane.json",
        "display_name": "Sugarcane",
        "classes": ["Sugarcane___Bacterial_Blight", "Sugarcane___Healthy", "Sugarcane___Red_Rot"],
    },
}

# Default treatment when disease not in JSON
DEFAULT_TREATMENT = {
    "spray": "Consult a local agriculture expert",
    "dosage": "Based on expert recommendation",
    "interval": "As advised by expert",
}


def load_disease_models():
    """Load all disease detection .h5 models and .json solutions at startup."""
    global _disease_models, _disease_solutions

    print(f"🔬 Loading disease detection models from: {DISEASE_MODEL_DIR}")

    if not DISEASE_MODEL_DIR.exists():
        print(f"  ⚠️  Disease model directory not found: {DISEASE_MODEL_DIR}")
        return

    # Import tensorflow lazily to avoid startup crash if not installed
    try:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF info/warning logs
        import tensorflow as tf
        print(f"  TensorFlow version: {tf.__version__}")
    except ImportError:
        print("  ⚠️  TensorFlow not installed. Disease detection will not work.")
        print("  ℹ️  Install with: pip install tensorflow")
        return

    for crop_key, config in DISEASE_CROPS.items():
        model_path = DISEASE_MODEL_DIR / config["model_file"]
        solution_path = DISEASE_MODEL_DIR / config["solution_file"]

        # Load Keras model
        try:
            if model_path.exists():
                model = tf.keras.models.load_model(str(model_path), compile=False)
                _disease_models[crop_key] = model
                print(f"  ✅ {config['display_name']} model loaded (input: {model.input_shape})")
            else:
                print(f"  ⚠️  {config['display_name']} model not found: {model_path}")
        except Exception as e:
            print(f"  ❌ Failed to load {config['display_name']} model: {e}")

        # Load solutions JSON
        try:
            if solution_path.exists():
                with open(solution_path, "r") as f:
                    _disease_solutions[crop_key] = json.load(f)
                print(f"  ✅ {config['display_name']} solutions loaded ({len(_disease_solutions[crop_key])} entries)")
            else:
                print(f"  ⚠️  {config['display_name']} solution file not found: {solution_path}")
        except Exception as e:
            print(f"  ❌ Failed to load {config['display_name']} solutions: {e}")

    loaded = len(_disease_models)
    print(f"🔬 Disease models loaded: {loaded}/{len(DISEASE_CROPS)}")


def get_supported_disease_crops() -> list[dict]:
    """Return list of crops supported for disease detection."""
    result = []
    for crop_key, config in DISEASE_CROPS.items():
        result.append({
            "key": crop_key,
            "name": config["display_name"],
            "available": crop_key in _disease_models,
            "diseases": [c.replace("___", " — ").replace("_", " ") for c in config["classes"]],
        })
    return result


def detect_disease(crop: str, image_bytes: bytes) -> dict:
    """
    Detect disease from a leaf image.

    Args:
        crop: One of 'potato', 'corn', 'rice', 'sugarcane'
        image_bytes: Raw bytes of the uploaded image

    Returns:
        Dict with disease name, confidence, treatment info
    """
    crop_key = crop.lower().strip()

    if crop_key not in DISEASE_CROPS:
        return {
            "success": False,
            "error": f"Unsupported crop: {crop}. Supported: {list(DISEASE_CROPS.keys())}",
        }

    if crop_key not in _disease_models:
        return {
            "success": False,
            "error": f"Disease model for {crop} is not loaded. It may not be available on this server.",
        }

    config = DISEASE_CROPS[crop_key]
    model = _disease_models[crop_key]
    solutions = _disease_solutions.get(crop_key, {})

    try:
        # Import PIL for image processing
        from PIL import Image

        # Get model input shape
        input_shape = model.input_shape
        # input_shape is typically (None, height, width, channels)
        if len(input_shape) == 4:
            target_h = input_shape[1] or 224
            target_w = input_shape[2] or 224
        else:
            target_h = target_w = 224

        # Load and preprocess image
        img = Image.open(BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img = img.resize((target_w, target_h))
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Run inference
        predictions = model.predict(img_array, verbose=0)
        pred_proba = predictions[0]

        # Get predicted class
        pred_idx = int(np.argmax(pred_proba))
        confidence = float(pred_proba[pred_idx])

        classes = config["classes"]
        if pred_idx < len(classes):
            disease_key = classes[pred_idx]
        else:
            disease_key = f"Unknown_Class_{pred_idx}"

        # Format disease name for display
        disease_display = disease_key.replace("___", " — ").replace("_", " ")

        # Check if healthy
        is_healthy = "healthy" in disease_key.lower()

        # Get treatment from solutions JSON
        treatment = solutions.get(disease_key, DEFAULT_TREATMENT)

        # Build all predictions
        all_predictions = []
        for i, cls in enumerate(classes):
            all_predictions.append({
                "disease": cls.replace("___", " — ").replace("_", " "),
                "confidence": round(float(pred_proba[i]) * 100, 1) if i < len(pred_proba) else 0,
            })
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)

        return {
            "success": True,
            "crop": config["display_name"],
            "disease": disease_display,
            "disease_key": disease_key,
            "confidence": round(confidence * 100, 1),
            "is_healthy": is_healthy,
            "treatment": {
                "spray": treatment.get("spray", DEFAULT_TREATMENT["spray"]),
                "dosage": treatment.get("dosage", DEFAULT_TREATMENT["dosage"]),
                "interval": treatment.get("interval", DEFAULT_TREATMENT["interval"]),
            },
            "all_predictions": all_predictions,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing image: {str(e)}",
        }
