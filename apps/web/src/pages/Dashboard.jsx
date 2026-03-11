import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWeather, getMarketPrices, healthCheck } from '../services/api'

export default function Dashboard() {
  const [weather, setWeather] = useState(null)
  const [prices, setPrices] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    healthCheck().then(setStatus).catch(() => setStatus({ status: 'offline' }))
    getWeather(25.3176, 82.9739).then(setWeather).catch(console.error)
    getMarketPrices('wheat', 'Varanasi', 7).then(setPrices).catch(console.error)
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Welcome banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)', color: 'white', marginBottom: 'var(--sp-6)' }}>
        <div className="card-body" style={{ padding: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--sp-2)' }}>
                🌾 Namaste, Farmer!
              </h1>
              <p style={{ opacity: 0.85, maxWidth: 500, fontSize: '0.9rem' }}>
                Welcome to SmartCrop Advisory — your AI-powered assistant for better crop decisions.
                Get personalized recommendations, track market prices, and plan rotations.
              </p>
              <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-3)' }}>
                <Link to="/recommend" className="btn" style={{ background: 'white', color: '#1B5E20', fontWeight: 700 }}>
                  🌱 Get Recommendation
                </Link>
                <Link to="/market" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  📈 View Prices
                </Link>
              </div>
            </div>
            <div style={{ fontSize: '4rem' }}>🧑‍🌾</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 animate-fade-in-up" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="stat-card stagger-1">
          <div className="stat-icon green">🌱</div>
          <div className="stat-info">
            <div className="stat-label">ML Models</div>
            <div className="stat-value">3</div>
            <div className="stat-change up">
              {status?.status === 'healthy' ? '✅ All Online' : '⏳ Loading...'}
            </div>
          </div>
        </div>
        <div className="stat-card stagger-2">
          <div className="stat-icon amber">🌾</div>
          <div className="stat-info">
            <div className="stat-label">Crops Covered</div>
            <div className="stat-value">22</div>
            <div className="stat-change up">RF Model Ready</div>
          </div>
        </div>
        <div className="stat-card stagger-3">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info">
            <div className="stat-label">Model Accuracy</div>
            <div className="stat-value">99.5%</div>
            <div className="stat-change up">↑ RF Classifier</div>
          </div>
        </div>
        <div className="stat-card stagger-4">
          <div className="stat-icon earth">📈</div>
          <div className="stat-info">
            <div className="stat-label">Latest Price</div>
            <div className="stat-value">₹{prices?.latest_price?.toLocaleString() || '...'}</div>
            <div className={`stat-change ${prices?.trend === 'rising' ? 'up' : 'down'}`}>
              {prices ? `${prices.trend_pct > 0 ? '↑' : '↓'} ${Math.abs(prices.trend_pct)}% ${prices.trend}` : '...'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        {/* Weather Widget */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-header">
            <h3>🌤️ 7-Day Weather Forecast</h3>
            <span className="badge badge-blue">Varanasi</span>
          </div>
          <div className="card-body">
            {weather ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--sp-2)' }}>
                {weather.forecast.map((day, i) => (
                  <div key={i} className="weather-day">
                    <div className="day-name">{day.day_name.slice(0, 3)}</div>
                    <div className="weather-icon">{day.icon}</div>
                    <div className="temp-high">{Math.round(day.temp_max)}°</div>
                    <div className="temp-low">{Math.round(day.temp_min)}°</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="loading-container" style={{ padding: 'var(--sp-8)' }}>
                <div className="spinner"></div>
                <span>Loading weather...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-fade-in-up stagger-3">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <Link to="/recommend" className="btn btn-primary btn-lg" style={{ justifyContent: 'flex-start' }}>
                🌱 Get Crop Recommendation
              </Link>
              <Link to="/yield" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                🌾 Predict Crop Yield
              </Link>
              <Link to="/market" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                📈 Check Market Prices
              </Link>
              <Link to="/planner" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                📅 Plan Crop Rotation
              </Link>
              <Link to="/fields" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                🗺️ Manage My Fields
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features summary */}
      <div className="card animate-fade-in-up stagger-4">
        <div className="card-header">
          <h3>🤖 AI-Powered Features</h3>
          <span className="badge badge-green">SIH 2025</span>
        </div>
        <div className="card-body">
          <div className="grid-3">
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>🧪</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>Soil Analysis</h4>
              <p className="text-sm text-secondary">Enter N, P, K, pH values to get AI-powered crop recommendations matching your soil conditions.</p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>📊</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>Yield Prediction</h4>
              <p className="text-sm text-secondary">Predict expected crop yield using XGBoost model trained on India's agriculture production data.</p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>💰</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>Price Forecasting</h4>
              <p className="text-sm text-secondary">Get market price predictions to optimize your sell decisions at local mandis.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
