import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWeather, getMarketPrices, healthCheck } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import { useLocation } from '../contexts/LocationContext'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const [weather, setWeather] = useState(null)
  const [prices, setPrices] = useState(null)
  const [status, setStatus] = useState(null)
  const [weatherAlerts, setWeatherAlerts] = useState([])
  const { t } = useLanguage()
  const { latitude, longitude, city, state: locState } = useLocation()
  const { user } = useAuth()

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

  const userName = user?.name || 'Farmer'
  const currentTemp = weather?.current?.temperature
  const currentHumidity = weather?.current?.humidity
  const currentCondition = weather?.current?.description || 'Clear sky'

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in stagger-children">
      {/* Weather Alert Banner */}
      {weatherAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-tertiary-container to-tertiary text-white p-4 md:p-5 rounded-3xl flex items-center gap-3 shadow-lg animate-fade-in-up">
          <span className="material-symbols-outlined text-2xl flex-shrink-0">warning</span>
          <div>
            <strong className="font-headline">{t('dash_weatherAlert') || 'Weather Alert'}:</strong>{' '}
            <span className="text-sm opacity-90">{weatherAlerts[0].message}</span>
          </div>
        </div>
      )}

      {/* ─── Hero Welcome Section ────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden min-h-[260px]">
        <img
          src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1600&q=80"
          alt="Lush green agricultural field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003b21]/85 via-[#003b21]/60 to-transparent" />
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row justify-between items-start h-full min-h-[260px]">
          <div className="space-y-4 flex-1">
            <p className="font-label text-[11px] text-white/50 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Welcome back,<br />{userName}.
            </h1>
            <p className="text-white/60 text-sm max-w-md">
              Your fields are <span className="text-primary-fixed font-bold">thriving</span>. 
              {currentTemp && ` Current conditions: ${Math.round(currentTemp)}°C, ${currentCondition}.`}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/fields" className="bg-white text-primary px-5 py-2.5 rounded-full font-bold text-sm hover:scale-[0.97] transition-transform shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Add New Field
              </Link>
              <Link to="/recommend" className="bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-bold text-sm border border-white/20 hover:bg-white/25 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">psychology</span>
                Get Advisory
              </Link>
            </div>
          </div>

          {/* Weather widget (right side on desktop) */}
          {weather && (
            <div className="hidden md:flex flex-col items-end gap-2 mt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 min-w-[160px]">
                <div className="font-headline font-extrabold text-5xl text-white leading-none">
                  {currentTemp ? `${Math.round(currentTemp)}°` : '—'}
                </div>
                <p className="font-label text-xs text-white/60 mt-1 capitalize">{currentCondition}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-sm">water_drop</span>
                    <span className="font-label text-xs text-white/70 font-bold">{currentHumidity || '—'}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-white/50 text-sm">air</span>
                    <span className="font-label text-xs text-white/70 font-bold">{weather?.current?.wind_speed || '—'} km/h</span>
                  </div>
                </div>
              </div>
              <div className="font-label text-[10px] text-white/40 uppercase tracking-wider">
                {city || locState || 'Your Area'} • Live
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Weather Strip ────────────────────────── */}
      {weather && (
        <div className="md:hidden bg-white rounded-2xl editorial-shadow p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">{weather.forecast?.[0]?.icon || '☀️'}</span>
            </div>
            <div>
              <div className="font-headline font-extrabold text-2xl text-on-surface">
                {currentTemp ? `${Math.round(currentTemp)}°C` : '—'}
              </div>
              <p className="font-label text-xs text-on-surface-variant/60 capitalize">{currentCondition}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="material-symbols-outlined text-primary text-sm">water_drop</span>
              <span className="font-label text-sm font-bold text-on-surface">{currentHumidity || '—'}%</span>
            </div>
            <p className="font-label text-[10px] text-on-surface-variant/50 mt-0.5">{city || 'Your Area'}</p>
          </div>
        </div>
      )}

      {/* ─── Bento Grid: Stats ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[
          {
            icon: 'model_training', label: t('dash_mlModels'), value: '3',
            sub: status?.status === 'healthy' ? t('dash_allOnline') : t('dash_loading'),
            color: 'text-primary', bg: 'bg-primary/10', iconBg: 'bg-primary/10'
          },
          {
            icon: 'grass', label: t('dash_cropsCovered'), value: '22',
            sub: t('dash_rfModelReady'),
            color: 'text-tertiary', bg: 'bg-tertiary-fixed/30', iconBg: 'bg-tertiary-fixed/40'
          },
          {
            icon: 'analytics', label: t('dash_modelAccuracy'), value: '99.5%',
            sub: t('dash_rfClassifier'),
            color: 'text-secondary', bg: 'bg-secondary-container/30', iconBg: 'bg-secondary-container/40'
          },
          {
            icon: 'trending_up', label: t('dash_latestPrice'),
            value: `₹${prices?.latest_price?.toLocaleString() || '...'}`,
            sub: prices ? `${prices.trend === 'up' ? '↑' : '↓'} ${prices.trend} trend` : '...',
            color: prices?.trend === 'up' ? 'text-primary' : 'text-error',
            bg: prices?.trend === 'up' ? 'bg-primary/5' : 'bg-error/5',
            iconBg: prices?.trend === 'up' ? 'bg-primary/10' : 'bg-error/10'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 md:p-6 editorial-shadow metric-card">
            <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="font-label text-[10px] md:text-xs uppercase tracking-wider text-on-surface-variant/50 mb-1 font-bold">{stat.label}</p>
            <p className="font-headline font-extrabold text-xl md:text-2xl text-on-surface">{stat.value}</p>
            <p className={`font-label text-xs font-semibold mt-1.5 ${stat.color}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Weather Forecast + Market Cards ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* 7-day Forecast (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl editorial-shadow overflow-hidden">
          <div className="p-5 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <h3 className="font-headline font-bold text-on-surface">{t('dash_weatherForecast')}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="smart-chip bg-surface-container text-on-surface-variant">
                {city || locState || 'Your Area'}
              </span>
              {weather?.source === 'openweathermap' && (
                <span className="smart-chip bg-primary/10 text-primary">Live</span>
              )}
            </div>
          </div>
          <div className="px-4 md:px-6 pb-5 md:pb-6">
            {weather ? (
              <div className="grid grid-cols-7 gap-1">
                {weather.forecast.map((day, i) => (
                  <div key={i} className={`text-center p-2.5 md:p-3 rounded-2xl transition-all cursor-default ${i === 0 ? 'bg-primary/5' : 'hover:bg-surface-container-low'}`}>
                    <div className={`font-label text-[10px] md:text-xs font-bold uppercase ${i === 0 ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                      {i === 0 ? 'Today' : day.day_name.slice(0, 3)}
                    </div>
                    <div className="text-xl md:text-2xl my-1.5 md:my-2">{day.icon}</div>
                    <div className="font-headline font-bold text-sm text-on-surface">{Math.round(day.temp_max)}°</div>
                    <div className="font-label text-[10px] text-on-surface-variant/40">{Math.round(day.temp_min)}°</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-on-surface-variant/60">
                <div className="spinner" />
                <span className="font-label text-sm">{t('dash_loadingWeather')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Market Snapshot Card (1 col) */}
        <div className="bg-white rounded-2xl editorial-shadow overflow-hidden">
          <div className="p-5 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span>
              <h3 className="font-headline font-bold text-on-surface text-sm">Market Snapshot</h3>
            </div>
            <Link to="/market" className="font-label text-xs text-primary font-bold hover:underline">View All →</Link>
          </div>
          <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-3">
            {[
              { crop: 'Wheat', emoji: '🌾', price: prices?.latest_price, trend: prices?.trend },
              { crop: 'Rice', emoji: '🍚', price: null, trend: null },
              { crop: 'Maize', emoji: '🌽', price: null, trend: null },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-headline font-bold text-sm text-on-surface">{item.crop}</span>
                </div>
                <div className="text-right">
                  <div className="font-headline font-bold text-sm text-on-surface">
                    {item.price ? `₹${item.price.toLocaleString()}` : '—'}
                  </div>
                  {item.trend && (
                    <span className={`font-label text-[10px] font-bold ${item.trend === 'up' ? 'text-primary' : 'text-error'}`}>
                      {item.trend === 'up' ? '↑' : '↓'} {item.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Quick Actions ───────────────────────────────── */}
      <div className="bg-white rounded-2xl editorial-shadow overflow-hidden">
        <div className="p-5 md:p-6 flex items-center justify-between">
          <h3 className="font-headline font-bold text-on-surface">{t('dash_quickActions')}</h3>
          <span className="smart-chip bg-primary/10 text-primary">SIH 2025</span>
        </div>
        <div className="px-4 md:px-6 pb-5 md:pb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { to: '/recommend', icon: 'psychology', label: t('dash_getCropReco'), primary: true },
              { to: '/yield', icon: 'query_stats', label: t('dash_predictYield') },
              { to: '/market', icon: 'trending_up', label: t('dash_checkPrices') },
              { to: '/planner', icon: 'agriculture', label: t('dash_planRotation') },
              { to: '/fields', icon: 'map', label: t('dash_manageFields') },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className={`
                  flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 group text-center
                  ${action.primary
                    ? 'bg-primary text-white hover:bg-primary-container shadow-md shadow-primary/15 col-span-2 md:col-span-1'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container metric-card'
                  }
                `}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.primary ? 'bg-white/20' : 'bg-white'}`}>
                  <span className={`material-symbols-outlined text-xl ${action.primary ? 'text-white' : 'text-primary'}`}>{action.icon}</span>
                </div>
                <span className="font-headline font-bold text-xs leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AI Features Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: 'science', title: t('dash_soilAnalysis'), desc: t('dash_soilAnalysisDesc'),
            color: 'text-primary', bg: 'bg-primary/10', link: '/recommend'
          },
          {
            icon: 'query_stats', title: t('dash_yieldPrediction'), desc: t('dash_yieldPredictionDesc'),
            color: 'text-tertiary', bg: 'bg-tertiary-fixed/30', link: '/yield'
          },
          {
            icon: 'payments', title: t('dash_priceForecasting'), desc: t('dash_priceForecastingDesc'),
            color: 'text-secondary', bg: 'bg-secondary-container/30', link: '/market'
          },
        ].map((feat, i) => (
          <Link
            key={i}
            to={feat.link}
            className="bg-white rounded-2xl editorial-shadow p-6 md:p-8 text-center hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className={`w-14 h-14 mx-auto rounded-2xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              <span className={`material-symbols-outlined ${feat.color} text-2xl`}>{feat.icon}</span>
            </div>
            <h4 className="font-headline font-bold text-on-surface mb-2">{feat.title}</h4>
            <p className="text-sm text-on-surface-variant/60 leading-relaxed">{feat.desc}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-primary font-label text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
