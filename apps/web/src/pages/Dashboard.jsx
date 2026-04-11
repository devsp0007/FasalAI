import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWeather, getMarketPrices, healthCheck } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import { useLocation } from '../contexts/LocationContext'

export default function Dashboard() {
  const [weather, setWeather] = useState(null)
  const [prices, setPrices] = useState(null)
  const [status, setStatus] = useState(null)
  const [weatherAlerts, setWeatherAlerts] = useState([])
  const { t } = useLanguage()
  const { latitude, longitude, city, state: locState } = useLocation()

  useEffect(() => {
    healthCheck().then(setStatus).catch(() => setStatus({ status: 'offline' }))
  }, [])

  useEffect(() => {
    const lat = latitude || 25.3176
    const lon = longitude || 82.9739
    getWeather(lat, lon).then(data => {
      setWeather(data)
      setWeatherAlerts(data?.alerts || [])
    }).catch(console.error)
    const commodity = 'Wheat'
    const st = locState || ''
    getMarketPrices(commodity, st, '', '', 30).then(setPrices).catch(console.error)
  }, [latitude, longitude, locState])

  return (
    <div className="animate-fade-in">
      {/* Weather Alert Banner */}
      {weatherAlerts.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #E65100, #F57C00)', color: 'white',
          padding: '0.85rem 1.25rem', borderRadius: '12px', marginBottom: 'var(--sp-4)',
          display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem',
          boxShadow: '0 2px 8px rgba(230,81,0,0.3)', animation: 'fadeIn 0.3s'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong>{t('dash_weatherAlert') || 'Weather Alert'}:</strong>{' '}
            {weatherAlerts[0].message}
          </div>
        </div>
      )}
      {/* Welcome banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32, #43A047)', color: 'white', marginBottom: 'var(--sp-6)' }}>
        <div className="card-body" style={{ padding: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 'var(--sp-2)' }}>
                {t('dash_welcome')}
              </h1>
              <p style={{ opacity: 0.85, maxWidth: 500, fontSize: '0.9rem' }}>
                {t('dash_welcomeText')}
              </p>
              <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-3)' }}>
                <Link to="/recommend" className="btn" style={{ background: 'white', color: '#1B5E20', fontWeight: 700 }}>
                  {t('dash_getRecommendation')}
                </Link>
                <Link to="/market" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {t('dash_viewPrices')}
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
            <div className="stat-label">{t('dash_mlModels')}</div>
            <div className="stat-value">3</div>
            <div className="stat-change up">
              {status?.status === 'healthy' ? t('dash_allOnline') : t('dash_loading')}
            </div>
          </div>
        </div>
        <div className="stat-card stagger-2">
          <div className="stat-icon amber">🌾</div>
          <div className="stat-info">
            <div className="stat-label">{t('dash_cropsCovered')}</div>
            <div className="stat-value">22</div>
            <div className="stat-change up">{t('dash_rfModelReady')}</div>
          </div>
        </div>
        <div className="stat-card stagger-3">
          <div className="stat-icon blue">📊</div>
          <div className="stat-info">
            <div className="stat-label">{t('dash_modelAccuracy')}</div>
            <div className="stat-value">99.5%</div>
            <div className="stat-change up">{t('dash_rfClassifier')}</div>
          </div>
        </div>
        <div className="stat-card stagger-4">
          <div className="stat-icon earth">📈</div>
          <div className="stat-info">
            <div className="stat-label">{t('dash_latestPrice')}</div>
            <div className="stat-value">₹{prices?.latest_price?.toLocaleString() || '...'}</div>
            <div className={`stat-change ${prices?.trend === 'up' ? 'up' : 'down'}`}>
              {prices ? `${prices.trend === 'up' ? '↑' : '↓'} ${prices.trend}` : '...'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        {/* Weather Widget */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-header">
            <h3>{t('dash_weatherForecast')}</h3>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <span className="badge badge-blue">{city || locState || 'Your Area'}</span>
              {weather?.source === 'openweathermap' && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Live</span>}
            </div>
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
                <span>{t('dash_loadingWeather')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-fade-in-up stagger-3">
          <div className="card-header">
            <h3>{t('dash_quickActions')}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <Link to="/recommend" className="btn btn-primary btn-lg" style={{ justifyContent: 'flex-start' }}>
                {t('dash_getCropReco')}
              </Link>
              <Link to="/yield" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                {t('dash_predictYield')}
              </Link>
              <Link to="/market" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                {t('dash_checkPrices')}
              </Link>
              <Link to="/planner" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                {t('dash_planRotation')}
              </Link>
              <Link to="/fields" className="btn btn-secondary btn-lg" style={{ justifyContent: 'flex-start' }}>
                {t('dash_manageFields')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features summary */}
      <div className="card animate-fade-in-up stagger-4">
        <div className="card-header">
          <h3>{t('dash_aiFeatures')}</h3>
          <span className="badge badge-green">SIH 2025</span>
        </div>
        <div className="card-body">
          <div className="grid-3">
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>🧪</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>{t('dash_soilAnalysis')}</h4>
              <p className="text-sm text-secondary">{t('dash_soilAnalysisDesc')}</p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>📊</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>{t('dash_yieldPrediction')}</h4>
              <p className="text-sm text-secondary">{t('dash_yieldPredictionDesc')}</p>
            </div>
            <div style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--sp-3)' }}>💰</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>{t('dash_priceForecasting')}</h4>
              <p className="text-sm text-secondary">{t('dash_priceForecastingDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
