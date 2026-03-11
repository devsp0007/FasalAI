"""
API Routes — All endpoints for Smart Crop Advisory.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional
import time
import random

from ml_service import (
    recommend_crop, predict_yield, predict_price,
    get_crop_list, get_yield_metadata, get_price_metadata
)
from scoring_engine import apply_scoring

router = APIRouter(prefix="/api")


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


# ── Health ────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "ml_models": "loaded",
            "api": "running",
        }
    }


# ── Crop Recommendation ──────────────────────────────────

@router.post("/recommend/crop")
async def get_crop_recommendation(req: CropRecommendRequest):
    start = time.time()
    try:
        # Get base ML predictions
        base_results = recommend_crop(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            temperature=req.temperature,
            humidity=req.humidity,
            ph=req.ph,
            rainfall=req.rainfall,
            top_k=5,
        )

        # Apply scoring engine (constraints + bonuses)
        scored = apply_scoring(
            base_results=base_results,
            previous_crop=req.previous_crop,
            season=req.season,
            ph=req.ph,
            temperature=req.temperature,
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
        )

        inference_ms = int((time.time() - start) * 1000)

        return {
            "recommendations": scored[:3],
            "model_version": "rf-v1-20260301",
            "inference_ms": inference_ms,
            "input_summary": {
                "soil": {"N": req.nitrogen, "P": req.phosphorus, "K": req.potassium, "pH": req.ph},
                "weather": {"temperature": req.temperature, "humidity": req.humidity, "rainfall": req.rainfall},
                "season": req.season,
                "previous_crop": req.previous_crop,
            },
        }
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
