"""
API Routes — All endpoints for Smart Crop Advisory.
"""

from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, Request
from pydantic import BaseModel, Field
from typing import Optional
import time
import random
import json
import os

from ml_service import (
    recommend_crop, predict_yield, predict_price,
    get_crop_list, get_yield_metadata, get_price_metadata,
    get_state_list, get_soil_types, get_state_crops, get_dataset_version
)
from scoring_engine import apply_scoring
from disease_service import detect_disease, get_supported_disease_crops
from auth_service import register_user, login_user, get_current_user
from profile_service import get_profile, save_profile, delete_profile

router = APIRouter(prefix="/api")

# ── Load state crop recommendations from JSON ────────────
STATE_RECS_PATH = os.path.join(os.path.dirname(__file__), "..", "datasets", "state_crop_recommendations.json")
_state_recs = {}
try:
    if os.path.exists(STATE_RECS_PATH):
        with open(STATE_RECS_PATH, "r", encoding="utf-8") as f:
            _state_recs = json.load(f)
        print(f"  ✅ State recommendations loaded ({len(_state_recs)} states)")
except Exception as e:
    print(f"  ⚠️  Failed to load state recommendations: {e}")


# ── Pydantic Models ───────────────────────────────────────

class CropRecommendRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=500, description="Nitrogen (N) in kg/ha")
    phosphorus: float = Field(..., ge=0, le=500, description="Phosphorus (P) in kg/ha")
    potassium: float = Field(..., ge=0, le=500, description="Potassium (K) in kg/ha")
    temperature: float = Field(..., ge=-10, le=60, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, le=5000, description="Rainfall in mm")
    season: str = Field(default="kharif", description="Season: kharif, rabi, or zaid")
    previous_crop: Optional[str] = Field(default=None, description="Previous crop name")
    state: Optional[str] = Field(default=None, description="State name for location-aware recommendation")
    soil_type: Optional[str] = Field(default=None, description="Soil type (e.g., Alluvial soil, Red soil)")


class YieldPredictionRequest(BaseModel):
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    crop: str = Field(..., description="Crop name")
    season: str = Field(default="Kharif", description="Season")
    area_ha: float = Field(..., gt=0, description="Area in hectares")
    year: int = Field(default=2026, description="Year")


class PricePredictionRequest(BaseModel):
    state: str = Field(..., description="State name")
    district: str = Field(..., description="District name")
    market: str = Field(..., description="Market/Mandi name")
    commodity: str = Field(..., description="Commodity/Crop name")
    variety: str = Field(default="Other", description="Variety")
    grade: str = Field(default="FAQ", description="Grade")
    min_price: float = Field(..., gt=0, description="Minimum price Rs./Quintal")
    max_price: float = Field(..., gt=0, description="Maximum price Rs./Quintal")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    year: int = Field(default=2026, description="Year")


class AuthRegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, description="Phone number")
    password: str = Field(..., min_length=4, description="Password")
    name: str = Field(default="", description="Full name")


class AuthLoginRequest(BaseModel):
    phone: str = Field(..., description="Phone number")
    password: str = Field(..., description="Password")


class ProfileRequest(BaseModel):
    name: str = ""
    district: str = ""
    state: str = ""
    language: str = "en"
    role: str = "farmer"
    farm_size: Optional[float] = None
    crops_grown: list = []
    notifications: dict = {}


def _extract_user(request: Request) -> dict:
    """Extract user from JWT token in Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated. Please login.")
    token = auth_header[7:]
    try:
        return get_current_user(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# ── Auth ──────────────────────────────────────────────────

@router.post("/auth/register")
async def api_register(req: AuthRegisterRequest):
    try:
        result = register_user(req.phone, req.password, req.name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auth/login")
async def api_login(req: AuthLoginRequest):
    try:
        result = login_user(req.phone, req.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


# ── Profile ───────────────────────────────────────────────

@router.get("/profile")
async def api_get_profile(request: Request):
    user = _extract_user(request)
    profile = get_profile(user["user_id"])
    if profile:
        # Add phone from token (not stored in profiles table)
        profile["phone"] = user["phone"]
        return {"profile": profile}
    return {"profile": {"name": user["name"], "phone": user["phone"]}}


@router.put("/profile")
async def api_save_profile(req: ProfileRequest, request: Request):
    user = _extract_user(request)
    saved = save_profile(user["user_id"], req.model_dump())
    if saved:
        saved["phone"] = user["phone"]
    return {"profile": saved, "message": "Profile saved successfully"}


@router.delete("/profile")
async def api_delete_profile(request: Request):
    user = _extract_user(request)
    delete_profile(user["user_id"])
    return {"message": "Profile and account deleted"}


# ── Health ────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "dataset_version": get_dataset_version(),
        "services": {
            "ml_models": "loaded",
            "disease_detection": "loaded",
            "api": "running",
        }
    }


# ── Crop Recommendation ──────────────────────────────────

@router.post("/recommend/crop")
async def get_crop_recommendation(req: CropRecommendRequest):
    start = time.time()
    try:
        # Get base ML predictions — get more candidates for scoring to filter
        base_results = recommend_crop(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            temperature=req.temperature,
            humidity=req.humidity,
            ph=req.ph,
            rainfall=req.rainfall,
            top_k=15,
            state=req.state,
            soil_type=req.soil_type,
        )

        # Get state-specific crop list for boosting
        state_crops_list = get_state_crops(req.state) if req.state else []

        # Apply scoring engine (constraints + bonuses + state boost)
        scored = apply_scoring(
            base_results=base_results,
            previous_crop=req.previous_crop,
            season=req.season,
            ph=req.ph,
            temperature=req.temperature,
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            state=req.state,
            state_crops=state_crops_list,
        )

        inference_ms = int((time.time() - start) * 1000)

        return {
            "recommendations": scored[:3],
            "model_version": f"rf-v2-state-aware" if get_dataset_version() == "v2_state_aware" else "rf-v1-legacy",
            "dataset_version": get_dataset_version(),
            "inference_ms": inference_ms,
            "input_summary": {
                "soil": {"N": req.nitrogen, "P": req.phosphorus, "K": req.potassium, "pH": req.ph},
                "weather": {"temperature": req.temperature, "humidity": req.humidity, "rainfall": req.rainfall},
                "season": req.season,
                "previous_crop": req.previous_crop,
                "state": req.state,
                "soil_type": req.soil_type,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── States & Location-Based Recommendations ──────────────

@router.get("/states")
async def list_states():
    """Return list of supported states."""
    model_states = get_state_list()
    all_state_names = sorted(set(model_states + list(_state_recs.keys())))
    return {
        "states": all_state_names,
        "model_states": model_states,
        "total": len(all_state_names),
    }


@router.get("/crops/by-state/{state}")
async def get_crops_by_state(state: str):
    """Return recommended crops for a state (before soil details are entered)."""
    # Get from dataset-trained model
    dataset_crops = get_state_crops(state)

    # Get from curated recommendations
    curated = _state_recs.get(state, {})
    curated_crops = curated.get("top_crops", [])

    # Merge: curated first, then dataset crops
    all_crops = []
    seen = set()
    for crop_info in curated_crops:
        if isinstance(crop_info, dict):
            all_crops.append(crop_info)
            seen.add(crop_info.get("name", "").lower())
        elif isinstance(crop_info, str):
            all_crops.append({"name": crop_info, "season": "Various"})
            seen.add(crop_info.lower())

    for crop_name in dataset_crops[:15]:
        if crop_name.lower() not in seen:
            all_crops.append({"name": crop_name, "season": "Various", "source": "dataset"})
            seen.add(crop_name.lower())

    return {
        "state": state,
        "crops": all_crops[:20],
        "soil_types": curated.get("soil_types", get_soil_types()),
        "climate": curated.get("climate", ""),
        "major_seasons": curated.get("major_seasons", ["Kharif", "Rabi", "Zaid"]),
    }


@router.get("/soil-types")
async def list_soil_types():
    """Return list of supported soil types."""
    return {"soil_types": get_soil_types()}


# ── Disease Detection ────────────────────────────────────

@router.get("/disease/crops")
async def disease_crops():
    """Return list of crops supported for disease detection."""
    return {"crops": get_supported_disease_crops()}


@router.post("/disease/detect")
async def disease_detect(
    crop: str = Form(..., description="Crop key: potato, corn, rice, sugarcane"),
    image: UploadFile = File(..., description="Leaf image file"),
):
    """Detect disease from a leaf image."""
    try:
        # Read image bytes
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")

        # Limit file size (10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image file too large (max 10MB)")

        result = detect_disease(crop=crop, image_bytes=image_bytes)

        if not result.get("success", False):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Yield Prediction ─────────────────────────────────────

@router.post("/predict/yield")
async def get_yield_prediction(req: YieldPredictionRequest):
    try:
        result = predict_yield(
            state=req.state,
            district=req.district,
            crop=req.crop,
            season=req.season,
            area_ha=req.area_ha,
            year=req.year,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Price Prediction ──────────────────────────────────────

@router.post("/predict/price")
async def get_price_prediction(req: PricePredictionRequest):
    try:
        result = predict_price(
            state=req.state,
            district=req.district,
            market=req.market,
            commodity=req.commodity,
            variety=req.variety,
            grade=req.grade,
            min_price=req.min_price,
            max_price=req.max_price,
            month=req.month,
            year=req.year,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Crops List ────────────────────────────────────────────

@router.get("/crops")
async def list_crops():
    return {
        "recommendation_crops": get_crop_list(),
        "yield_metadata": get_yield_metadata(),
        "price_metadata": get_price_metadata(),
        "dataset_version": get_dataset_version(),
    }


# ── Weather (Mock Data) ──────────────────────────────────

@router.get("/weather/{lat}/{lon}")
async def get_weather_forecast(lat: float, lon: float):
    """Return 7-day weather forecast (mock data for demo)."""
    import datetime
    conditions = ["sunny", "partly_cloudy", "cloudy", "light_rain", "sunny", "sunny", "partly_cloudy"]
    icons = ["☀️", "⛅", "☁️", "🌧️", "☀️", "☀️", "⛅"]
    base_date = datetime.date.today()

    forecast = []
    for i in range(7):
        d = base_date + datetime.timedelta(days=i)
        temp_min = round(random.uniform(18, 24), 1)
        temp_max = round(temp_min + random.uniform(8, 14), 1)
        forecast.append({
            "date": d.isoformat(),
            "day_name": d.strftime("%A"),
            "temp_min": temp_min,
            "temp_max": temp_max,
            "rainfall_mm": round(random.uniform(0, 5) if "rain" in conditions[i] else 0, 1),
            "humidity": random.randint(40, 80),
            "condition": conditions[i],
            "icon": icons[i],
        })

    return {
        "latitude": lat,
        "longitude": lon,
        "forecast": forecast,
        "source": "mock_data",
    }


# ── Market Prices (Mock Data) ────────────────────────────

@router.get("/market/prices")
async def get_market_prices(
    crop: str = Query(default="wheat", description="Crop name"),
    district: str = Query(default="Varanasi", description="District"),
    days: int = Query(default=7, ge=1, le=90, description="Number of days"),
):
    """Return market price history (mock data for demo)."""
    import datetime
    base_date = datetime.date.today()
    base_price_map = {
        "wheat": 2200, "rice": 2100, "maize": 1900, "cotton": 6500,
        "chickpea": 5200, "lentil": 4800, "banana": 2500, "mango": 4000,
        "potato": 1200, "tomato": 3000, "onion": 2800, "sugarcane": 3100,
    }
    base_price = base_price_map.get(crop.lower(), 2500)

    prices = []
    for i in range(days, 0, -1):
        d = base_date - datetime.timedelta(days=i)
        variation = random.uniform(-0.05, 0.06)
        price = round(base_price * (1 + variation), 2)
        prices.append({
            "date": d.isoformat(),
            "mandi": f"{district} Mandi",
            "price_per_quintal": price,
        })

    trend_pct = round(((prices[-1]["price_per_quintal"] - prices[0]["price_per_quintal"])
                       / prices[0]["price_per_quintal"]) * 100, 1)
    trend = "rising" if trend_pct > 0 else "falling" if trend_pct < 0 else "stable"

    return {
        "crop": crop,
        "district": district,
        "prices": prices,
        "trend": trend,
        "trend_pct": trend_pct,
        "latest_price": prices[-1]["price_per_quintal"] if prices else None,
    }
