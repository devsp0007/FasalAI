# 🌾 SmartCrop Advisory — SIH25010

**AI-powered Smart Crop Advisory System** for small & marginal farmers.  
Built for **Smart India Hackathon 2025** (Problem Statement ID: SIH25010).

---

## 🚀 Features

| Feature | Model / Tech | Description |
|---------|-------------|-------------|
| 🌱 **Crop Recommendation** | RandomForest (500 trees) | State-aware top-3 crop recommendations based on soil (N, P, K, pH), weather, and location |
| 🔬 **Disease Detection** | TensorFlow CNN (.h5) | Upload leaf images to detect diseases in Potato, Corn, Rice, Sugarcane |
| 🌾 **Yield Prediction** | GradientBoosting | Predicts crop yield (T/Ha) by state, district, crop, and season |
| 💰 **Price Forecasting** | GradientBoosting | Predicts modal mandi price (₹/Quintal) |
| 👤 **Multi-User Auth** | SQLite + JWT + bcrypt | Register/login with phone+password, persistent profiles |
| 📅 **Rotation Planner** | Rule-based | Visual calendar for crop rotation planning |
| 🌐 **Multilingual** | 11 Languages | Hindi, Tamil, Telugu, Bengali, Marathi, and more |
| 🤖 **AI Chatbot** | Gemini API | Voice-enabled agricultural chatbot |

## 🏗️ Architecture

```
SIH25010/
├── api/                  ← FastAPI backend (Python)
│   ├── main.py           # App entry, CORS, model + DB loading
│   ├── ml_service.py     # ML model loader & inference (state-aware)
│   ├── scoring_engine.py # Constraint penalties & bonuses
│   ├── disease_service.py# TensorFlow disease detection
│   ├── auth_service.py   # JWT auth + bcrypt + SQLite
│   ├── profile_service.py# User profile CRUD
│   ├── routes.py         # All API endpoints
│   └── retrain_models.py # Model retraining (runs on deploy)
│
├── apps/web/             ← React + Vite frontend
│   └── src/
│       ├── index.css          # Design system
│       ├── App.jsx            # Layout, auth, routing
│       ├── contexts/
│       │   ├── AuthContext.jsx    # Auth state management
│       │   └── LanguageContext.jsx # i18n
│       ├── services/api.js    # API client with JWT
│       └── pages/             # Dashboard, Recommend, Disease,
│                              # Market, Yield, Profile, Login, etc.
│
├── datasets/             ← Training datasets
├── latest_model/         ← Trained models + SQLite DB
│   ├── *.pkl             # ML models (auto-generated)
│   ├── disease/*.h5      # CNN disease models
│   └── smartcrop.db      # User profiles (auto-created)
│
├── render.yaml           ← Render Blueprint (one-click deploy)
├── render_build.sh       ← Render build script
├── vercel.json           ← Vercel frontend config
├── Procfile              ← Render start command
└── requirements.txt      ← Python dependencies
```

## ⚡ Quick Start (Local)

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Install & Train Models
```bash
pip install -r requirements.txt
cd api
python retrain_models.py
```

### 2. Start Backend
```bash
cd api
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:5173** → Register with phone & password → Start using!

---

## 🚀 Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `smartcrop-api` |
| **Region** | Oregon (or closest) |
| **Runtime** | Python |
| **Build Command** | `bash render_build.sh` |
| **Start Command** | `cd api && python -m uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | Free |

5. **Environment Variables** (Settings → Environment):

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.10.12` |
| `JWT_SECRET` | *(click Generate)* |
| `SKLEARN_ALLOW_DEPRECATED_SKLEARN_PACKAGE_INSTALL` | `True` |

6. **Disk** (Settings → Disks — **required for SQLite persistence**):

| Setting | Value |
|---------|-------|
| Name | `smartcrop-data` |
| Mount Path | `/opt/render/project/src/latest_model` |
| Size | 1 GB |

> ⚠️ Without a disk, the SQLite database (user profiles) will be lost on every deploy.

7. Click **Deploy** → Wait for build (~5-10 min on first deploy)
8. Your API will be at: `https://smartcrop-api.onrender.com`

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://smartcrop-api.onrender.com/api` |
| `VITE_GEMINI_API_KEY` | *(your Gemini API key)* |

5. Click **Deploy**
6. Your frontend will be at: `https://your-app.vercel.app`

> **Important**: Update `VITE_API_URL` to point to your actual Render backend URL.

---

## 🤖 ML Models

| Model | Algorithm | Input | Output |
|-------|-----------|-------|--------|
| Crop Recommendation | RandomForest (500 trees, state-aware) | N, P, K, temp, humidity, pH, rainfall, state, soil_type | Top-3 crops + confidence |
| Disease Detection | TensorFlow CNN | Leaf image | Disease name + treatment |
| Yield Prediction | GradientBoosting (200 est.) | State, district, crop, season, area | Tonnes/Hectare |
| Price Prediction | GradientBoosting | State, market, commodity, min/max price | Modal price ₹/Quintal |

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user (phone, password, name) |
| `POST` | `/api/auth/login` | ❌ | Login → returns JWT token |
| `GET` | `/api/profile` | ✅ | Get saved profile |
| `PUT` | `/api/profile` | ✅ | Save/update profile |
| `DELETE` | `/api/profile` | ✅ | Delete account |
| `GET` | `/api/health` | ❌ | Server health check |
| `POST` | `/api/recommend/crop` | ❌ | ML crop recommendation |
| `POST` | `/api/predict/yield` | ❌ | Yield prediction |
| `POST` | `/api/predict/price` | ❌ | Price prediction |
| `GET` | `/api/states` | ❌ | List of states |
| `GET` | `/api/crops/by-state/{state}` | ❌ | Crops for a state |
| `GET` | `/api/soil-types` | ❌ | Available soil types |
| `GET` | `/api/disease/crops` | ❌ | Supported disease crops |
| `POST` | `/api/disease/detect` | ❌ | Upload image → disease detection |

## 🛠️ Tech Stack

- **Backend**: FastAPI, scikit-learn, TensorFlow, pandas, SQLite, JWT, bcrypt
- **Frontend**: React 19, Vite 7, Recharts, React Router
- **ML**: RandomForest, GradientBoosting, TensorFlow CNN
- **Auth**: Phone + password, bcrypt hashing, JWT tokens
- **Design**: Custom CSS design system, Inter font, agricultural green palette
- **Deployment**: Render (backend) + Vercel (frontend)

## 📄 License

GPL-3.0 License — Built for SIH 2025 by ANKUR PRATAP SINGH.
