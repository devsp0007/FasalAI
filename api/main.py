"""
Smart Crop Advisory — FastAPI Backend
=====================================
Loads 3 ML models + disease detection models at startup and serves crop advisory APIs.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from ml_service import load_models
from disease_service import load_disease_models
from auth_service import init_db as init_auth_db
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB only at startup. Models are lazy-loaded on first request."""
    print("=" * 60)
    print("  🌾 Smart Crop Advisory — Starting Server")
    print("=" * 60)
    init_auth_db()
    print("  ℹ️  Models will be lazy-loaded on first request (saves RAM)")
    print("=" * 60)
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Smart Crop Advisory API",
    description="AI-powered crop recommendation, yield prediction, market price forecasting, and disease detection for Indian farmers.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "Smart Crop Advisory API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "features": [
            "Crop Recommendation (State-Aware)",
            "Yield Prediction",
            "Price Prediction",
            "Disease Detection (Potato, Corn, Rice, Sugarcane)",
        ],
    }
