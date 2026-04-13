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

  const getConditionEmoji = (condition) => {
    if (!condition) return '☀️'
    const lower = condition.toLowerCase()
    if (lower.includes('clear') || lower.includes('sun')) return '☀️'
    if (lower.includes('partly cloud') || lower.includes('few cloud')) return '⛅'
    if (lower.includes('cloud')) return '☁️'
    if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️'
    if (lower.includes('storm') || lower.includes('thunder')) return '⛈️'
    if (lower.includes('snow')) return '❄️'
    if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return '🌫️'
    return '⛅'
  }
  const weatherEmoji = getConditionEmoji(currentCondition)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in stagger-children relative z-10 h-full">
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

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-xl bg-emerald-950 text-white min-h-[320px] flex flex-col justify-center p-8 md:p-12">
        <div className="absolute inset-0 opacity-40">
          <img alt="Wheat field" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBleOwQ7wYolit5VfeaJRT0A1QtSzF5TVmD_Ne3ff8RHInMh1vetLXEOodeagM_x--0ZSKjqgdK1jDX28f91BMlQsRU_kX-yKvwIK9uHqp7sU-YwJBzKuQyKfZfUpvEIZVOc-Km5X4NmbM-sBJTc8y7ngHoePhe3n4xOducMFsbMpYnpiY3AK9Oupr-AQ2J1dADLRU_Y8rID6265xh_augMZzEB6Iod34zd6_AES-4tQDTt4z_58hSYVNEW35vHJNGd0kKTYkC02COl"/>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/60 to-transparent"></div>
        <div className="relative z-10 max-w-xl">
          <span className="font-inter text-xs tracking-widest uppercase text-emerald-400 mb-4 block font-bold">🌾 Current Cycle: Wheat v.24</span>
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Welcome back, {userName}. <br/>Your fields are <span className="text-emerald-400">thriving</span>.</h2>
          <p className="font-body text-emerald-100/80 mb-8 max-w-sm">Optimal harvest window predicted in 14 days. Soil moisture levels are steady at {weather?.current?.humidity || 68}%.</p>
          <div className="flex gap-4">
            <Link to="/yield" className="bg-primary px-8 py-3 rounded-full font-bold text-white shadow-lg hover:scale-105 transition-transform text-center">View Report</Link>
            <Link to="/fields" className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full font-bold text-white hover:bg-white/20 transition-all text-center">Sensor Data</Link>
          </div>
        </div>
      </section>

      {/* Quick Stats & Alerts (Bento Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weather Widget */}
        <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm shadow-emerald-900/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-inter text-xs text-on-surface-variant uppercase font-bold tracking-wider">Local Weather 🌧️</p>
              <h3 className="font-headline text-2xl font-bold mt-1">{currentTemp ? `${Math.round(currentTemp)}°C` : '...'}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl">
              {weatherEmoji}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-inter">Humidity 💧</span>
              <span className="font-bold">{currentHumidity || '0'}%</span>
            </div>
            <div className="w-full bg-surface-container-low h-1 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${currentHumidity || 0}%` }}></div>
            </div>
          </div>
          <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-bold font-inter whitespace-nowrap uppercase">{weatherEmoji} {currentCondition}</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-bold font-inter whitespace-nowrap">🍃 {weather?.current?.wind_speed || 'LOW'} WIND</span>
          </div>
        </div>

        {/* Pest Risk */}
        <div className="md:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm shadow-emerald-900/5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="font-inter text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-2">Pest Risk Index 🐛</p>
              <div className="flex items-baseline gap-2">
                <h3 className="font-headline text-4xl font-extrabold text-tertiary">Low</h3>
                <span className="text-tertiary/60 text-sm font-inter">Risk detected in Sector 4</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-4 font-inter leading-relaxed max-w-[200px]">Aphid population stable. No immediate treatment required for North-West plots. ✅</p>
            </div>
            <div className="mt-4">
               <Link to="/pest" className="text-sm font-bold text-primary hover:underline">View Pest Analysis →</Link>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>bug_report</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <Link to="/fields" className="flex-1 bg-primary text-white rounded-xl p-4 flex flex-col justify-center items-center gap-2 hover:bg-primary-container transition-colors text-center group">
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_location_alt</span>
            <span className="font-headline font-bold text-sm">Add New Field 🗺️</span>
          </Link>
          <Link to="/recommend" className="flex-1 bg-secondary-container text-on-secondary-container rounded-xl p-4 flex flex-col justify-center items-center gap-2 hover:opacity-90 transition-opacity text-center group">
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">lightbulb</span>
            <span className="font-headline font-bold text-sm">Get Advisory 💡</span>
          </Link>
        </div>
      </div>

      {/* Market & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Prices */}
        <div className="lg:col-span-2 bg-surface-container-high rounded-xl p-8 overflow-hidden">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-headline text-2xl font-bold">Market Price Trends 📈</h3>
              <p className="font-inter text-sm text-on-surface-variant">Live updates from national trade centers 🏢</p>
            </div>
            <Link to="/market" className="text-primary font-bold text-sm font-inter flex items-center gap-1 hover:underline">View All <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dynamic live price from API if available, else fallback */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-primary/20">
              <p className="font-inter text-xs text-on-surface-variant uppercase font-bold">Wheat (Live) 🌾</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-headline text-xl font-bold">{prices?.latest_price ? `₹${prices.latest_price.toLocaleString()}` : '...'}</span>
                {prices?.trend && (
                   <span className={`text-${prices.trend === 'up' ? 'primary' : 'error'} text-xs font-bold flex items-center`}>
                     {prices.trend === 'up' ? '+' : ''}{prices.trend === 'up' ? '2.4%' : '1.2%'} <span className="material-symbols-outlined text-xs ml-1">{prices.trend === 'up' ? 'trending_up' : 'trending_down'}</span>
                   </span>
                )}
              </div>
            </div>
            
            {/* Static placeholders consistent with design */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="font-inter text-xs text-on-surface-variant uppercase font-bold">Organic Soy 🌱</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-headline text-xl font-bold">₹4,200</span>
                <span className="text-emerald-600 text-xs font-bold flex items-center">+4.1% <span className="material-symbols-outlined text-xs ml-1">trending_up</span></span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="font-inter text-xs text-on-surface-variant uppercase font-bold">Maize 🌽</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-headline text-xl font-bold">₹1,960</span>
                <span className="text-error text-xs font-bold flex items-center">-0.8% <span className="material-symbols-outlined text-xs ml-1">trending_down</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Prediction */}
        <div className="bg-emerald-900 text-white rounded-xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-headline text-xl font-bold mb-2">Yield Prediction 📊</h3>
            <p className="font-inter text-xs text-emerald-200/60 uppercase tracking-widest mb-6">Algorithm v.4.2 🤖</p>
            <div className="relative flex items-center justify-center py-6">
              <div className="w-32 h-32 rounded-full border-[10px] border-white/10 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[10px] border-emerald-400 border-t-transparent -rotate-45"></div>
                <span className="font-headline text-3xl font-black italic">84%</span>
              </div>
            </div>
            <p className="text-center font-inter text-sm text-emerald-100 mt-4">Estimated: 4.8 tons/acre 🚜</p>
          </div>
          
          <Link to="/yield" className="w-full bg-white text-emerald-950 py-3 rounded-lg font-bold text-sm mt-8 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 text-center">
            <span className="material-symbols-outlined text-sm">download</span>
            Generate Report
          </Link>
        </div>
      </div>

      {/* Disease Alerts & Community Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <div className="space-y-4">
          <h4 className="font-headline text-lg font-bold px-2">Satellite Field Health 🛰️</h4>
          <div className="rounded-xl overflow-hidden h-[300px] shadow-sm relative border-4 border-surface-container-high">
            <img alt="Field Map" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs0b8MZRtVDwLAe_GRJKWHs6jv2aq5GOYwKpmXmUCNfAwuiGpYA6dA-xI0xxfimRuOy1YSuh7CrHMxlbkFT4oa9RCz6XDxFGneqADVCqDjxDxbnKAXlcoIInbURopNTth8XHuIgJs1pf8KuVP0un5zj6pmMIKjzgeLMxcJ6YyMun2Gdl26kkTffSusSKupt_tQbc27GvCyOfMAXBvSBPD0NdD9gGVCNQFxQTQ1R5VRB6y6s3c7o45tLT-IFKuCSHctSkheOJnUwPMt"/>
            <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none"></div>
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold">HEALTHY ✨</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow text-[10px] font-bold text-emerald-950">
              UPDATED: 2H AGO 🕒
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h4 className="font-headline text-lg font-bold">Recent Community Insights 🤝</h4>
             <Link to="/community" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-fixed">person</span>
              </div>
              <div>
                <p className="font-inter text-sm font-bold">Soil Prepping Strategy 🌱</p>
                <p className="font-inter text-xs text-on-surface-variant mt-1">"Has anyone tried the new bio-fertilizer for corn in clay soils?"</p>
                <div className="mt-2 flex gap-3 text-[10px] font-bold text-primary">
                  <span>💬 24 REPLIES</span>
                  <span>🕒 10 MIN AGO</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-fixed">forum</span>
              </div>
              <div>
                <p className="font-inter text-sm font-bold">Disease Outbreak Alert ⚠️</p>
                <p className="font-inter text-xs text-on-surface-variant mt-1">Rust detected in neighbouring county. Adjust moisture monitors.</p>
                <div className="mt-2 flex gap-3 text-[10px] font-bold text-primary">
                  <span>💬 152 REPLIES</span>
                  <span>🕒 1 HOUR AGO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
