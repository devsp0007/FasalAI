"""
ML Model Service — Loads and runs inference on all 3 pre-trained models.

Models:
  1. Crop Recommendation (RandomForest) → top-3 crops with confidence
  2. Crop Yield Prediction (GradientBoosting/XGBoost) → Tonnes/Ha
  3. Crop Price Prediction (GradientBoosting/XGBoost) → Rs./Quintal
"""

import os
import joblib
import numpy as np
import pandas as pd
import random
from pathlib import Path

# ── Resolve model paths relative to project root ──────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = PROJECT_ROOT / "latest_model"

# Global model bundles (loaded once at startup)
_crop_rec_bundle = None
_yield_bundle = None
_price_bundle = None


def load_models():
    """Load all 3 ML model bundles from disk. Call once at startup."""
    global _crop_rec_bundle, _yield_bundle, _price_bundle

    crop_rec_path = MODEL_DIR / "crop_recommendation_rf.pkl"
    yield_path = MODEL_DIR / "crop_yield_xgboost.pkl"
    price_path = MODEL_DIR / "crop_price_xgboost.pkl"

    print(f"📂 Loading models from: {MODEL_DIR}")

    # Load Crop Recommendation model
    try:
        if crop_rec_path.exists():
            _crop_rec_bundle = joblib.load(crop_rec_path)
            print(f"  ✅ Crop Recommendation model loaded ({len(_crop_rec_bundle['class_names'])} crops)")
        else:
            print(f"  ⚠️  Crop Recommendation model not found at {crop_rec_path}")
    except Exception as e:
        print(f"  ❌ Failed to load Crop Recommendation model: {e}")

    # Load Yield Prediction model
    try:
        if yield_path.exists():
            _yield_bundle = joblib.load(yield_path)
            print(f"  ✅ Yield Prediction model loaded")
        else:
            print(f"  ⚠️  Yield Prediction model not found at {yield_path}")
    except Exception as e:
        print(f"  ❌ Failed to load Yield Prediction model: {e}")

    # Load Price Prediction model
    try:
        if price_path.exists():
            _price_bundle = joblib.load(price_path)
            print(f"  ✅ Price Prediction model loaded")
        else:
            print(f"  ⚠️  Price Prediction model not found at {price_path}")
    except Exception as e:
        print(f"  ⚠️  Price model failed to load (version mismatch, using mock): {e}")
        _price_bundle = None

    print("🚀 Model loading complete!")


def get_crop_list():
    """Return list of crops the recommendation model knows about."""
    if _crop_rec_bundle is None:
        return []
    return _crop_rec_bundle.get("class_names", [])


def get_yield_metadata():
    """Return metadata about what the yield model supports."""
    if _yield_bundle is None:
        return {}
    return {
        "crops": _yield_bundle.get("crops", []),
        "states": _yield_bundle.get("states", []),
        "seasons": _yield_bundle.get("seasons", []),
    }


def get_price_metadata():
    """Return metadata about what the price model supports."""
    if _price_bundle is None:
        return {"note": "Using mock predictions (model version mismatch)"}
    return {
        "commodities": _price_bundle.get("commodities", []),
        "states": _price_bundle.get("states", []),
    }


def recommend_crop(nitrogen: float, phosphorus: float, potassium: float,
                   temperature: float, humidity: float, ph: float,
                   rainfall: float, top_k: int = 3) -> list[dict]:
    """
    Run crop recommendation inference.
    Returns list of top-K crops with scores.
    """
    if _crop_rec_bundle is None:
        raise RuntimeError("Crop recommendation model not loaded")

    pipeline = _crop_rec_bundle["pipeline"]
    le = _crop_rec_bundle["label_encoder"]
    class_names = _crop_rec_bundle["class_names"]

    sample = pd.DataFrame([{
        "N": nitrogen,
        "P": phosphorus,
        "K": potassium,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall,
    }])

    proba = pipeline.predict_proba(sample)[0]
    top_indices = np.argsort(proba)[::-1][:top_k]

    results = []
    for rank, idx in enumerate(top_indices, 1):
        crop_name = class_names[idx]
        score = float(proba[idx])
        results.append({
            "rank": rank,
            "crop": crop_name,
            "score": round(score, 4),
            "confidence_pct": round(score * 100, 1),
        })

    return results


def predict_yield(state: str, district: str, crop: str,
                  season: str, area_ha: float, year: int = 2026) -> dict:
    """
    Predict crop yield in Tonnes/Hectare.
    """
    if _yield_bundle is None:
        raise RuntimeError("Yield prediction model not loaded")

    pipeline = _yield_bundle["pipeline"]

    sample = pd.DataFrame([{
        "State": state,
        "District": district,
        "Crop": crop,
        "Season": season,
        "log_area": np.log1p(area_ha),
        "year_num": year,
    }])

    pred = max(0, float(pipeline.predict(sample)[0]))

    return {
        "crop": crop,
        "state": state,
        "district": district,
        "season": season,
        "area_ha": area_ha,
        "predicted_yield_tonnes_per_ha": round(pred, 3),
        "predicted_total_tonnes": round(pred * area_ha, 2),
        "year": year,
    }


def predict_price(state: str, district: str, market: str,
                  commodity: str, variety: str, grade: str,
                  min_price: float, max_price: float,
                  month: int, year: int = 2026) -> dict:
    """
    Predict modal price in Rs./Quintal.
    Falls back to smart mock if model is unavailable.
    """
    price_spread = max_price - min_price

    if _price_bundle is not None:
        # Real model inference
        pipeline = _price_bundle["pipeline"]
        sample = pd.DataFrame([{
            "state": state,
            "district": district,
            "market": market,
            "commodity": commodity,
            "variety": variety,
            "grade": grade,
            "min_price": min_price,
            "max_price": max_price,
            "price_spread": price_spread,
            "month": month,
            "year": year,
        }])
        pred = float(pipeline.predict(sample)[0])
        model_used = "xgboost_v1"
    else:
        # Smart mock: modal price is typically between min and max,
        # weighted slightly toward the higher end
        pred = min_price + (price_spread * random.uniform(0.55, 0.75))
        model_used = "mock_fallback"

    return {
        "commodity": commodity,
        "state": state,
        "district": district,
        "market": market,
        "predicted_modal_price": round(pred, 2),
        "min_price": min_price,
        "max_price": max_price,
        "month": month,
        "year": year,
        "currency": "INR",
        "unit": "Rs./Quintal",
        "model_used": model_used,
    }
