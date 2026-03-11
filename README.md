# 🌾 SmartCrop Advisory — SIH25010

**AI-powered Smart Crop Advisory System** for small & marginal farmers.  
Built for **Smart India Hackathon 2025** (Problem Statement ID: SIH25010).

---

## 🚀 Features

| Feature | Model | Description |
|---------|-------|-------------|
| 🌱 **Crop Recommendation** | RandomForest | Recommends top-3 crops based on soil (N, P, K, pH) and weather (temp, humidity, rainfall) |
| 🌾 **Yield Prediction** | GradientBoosting | Predicts crop yield (T/Ha) by state, district, crop, and season |
| 💰 **Price Forecasting** | XGBoost / Mock | Predicts modal mandi price (₹/Quintal) |
| 📅 **Rotation Planner** | Rule-based | Visual calendar grid for crop rotation planning |
| 🌤️ **Weather Forecast** | API / Mock | 7-day weather forecast for farm location |
| 📈 **Market Prices** | Mock Data | Price trend charts with interactive filters |

## 🏗️ Architecture

```
apps/
├── api/          ← FastAPI backend (Python)
│   ├── main.py           # App entry, CORS, model loading
│   ├── ml_service.py     # ML model loader & inference
│   ├── scoring_engine.py # Constraint penalties & bonuses
│   └── routes.py         # All API endpoints
│
└── web/          ← React + Vite frontend
    └── src/
        ├── index.css          # Design system
        ├── App.jsx            # Layout, routing, navigation
        ├── services/api.js    # API client
        └── pages/             # Dashboard, Recommend, Market,
                               # YieldPredict, Fields, Planner, Profile
```

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip packages: `fastapi uvicorn joblib scikit-learn pandas numpy`

### 1. Train models (first time)
```bash
cd apps/api
pip install -r requirements.txt
python retrain_models.py
```

### 2. Start Backend
```bash
cd apps/api
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🤖 ML Models

| Model | Algorithm | Input | Output | Accuracy |
|-------|-----------|-------|--------|----------|
| Crop Recommendation | RandomForest (200 trees) | N, P, K, temp, humidity, pH, rainfall | Top-3 crops + confidence | 99.5% |
| Yield Prediction | GradientBoosting (200 est.) | State, district, crop, season, area | Tonnes/Hectare | R²=0.85+ |
| Price Prediction | GradientBoosting | State, market, commodity, min/max price | Modal price ₹/Quintal | Mock fallback |

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/recommend/crop` | ML crop recommendation |
| POST | `/api/predict/yield` | Yield prediction |
| POST | `/api/predict/price` | Price prediction |
| GET | `/api/crops` | List of supported crops |
| GET | `/api/weather/{lat}/{lon}` | 7-day weather forecast |
| GET | `/api/market/prices` | Market price history |

## 🛠️ Tech Stack

- **Backend**: FastAPI, scikit-learn, pandas, numpy, joblib
- **Frontend**: React 19, Vite 7, Recharts, React Router
- **ML**: RandomForest, GradientBoosting (scikit-learn)
- **Design**: Custom CSS design system, Inter font, agricultural green palette

## 📄 License

Built for SIH 2025. Open source for educational purposes.
