import { useState, useEffect } from 'react'
import { getMarketPrices, predictPrice } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'

export default function Market() {
  const { t } = useLanguage()
  const [crop, setCrop] = useState('wheat')
  const [district, setDistrict] = useState('Varanasi')
  const [days, setDays] = useState(30)
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(false)

  // Price prediction form
  const [predForm, setPredForm] = useState({
    state: 'Uttar Pradesh', district: 'Varanasi', market: 'Varanasi Mandi',
    commodity: 'Wheat', variety: 'Dara', grade: 'FAQ',
    min_price: 2200, max_price: 2500, month: new Date().getMonth() + 1, year: 2026
  })
  const [prediction, setPrediction] = useState(null)
  const [predLoading, setPredLoading] = useState(false)

  const crops = ['wheat', 'rice', 'maize', 'cotton', 'chickpea', 'lentil', 'banana', 'mango', 'potato', 'tomato', 'onion', 'sugarcane']

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const data = await getMarketPrices(crop, district, days)
      setPriceData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrices() }, [crop, district, days])

  const handlePredict = async (e) => {
    e.preventDefault()
    setPredLoading(true)
    try {
      const data = await predictPrice(predForm)
      setPrediction(data)
    } catch (err) { console.error(err) }
    finally { setPredLoading(false) }
  }

  const chartData = priceData?.prices?.map(p => ({
    date: p.date.slice(5),
    price: p.price_per_quintal,
  })) || []

  return (
    <div className="animate-fade-in">
      {/* Price Chart */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="card-header">
          <h3>{t('market_priceTrends')}</h3>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
            <select className="form-select" style={{ width: 150 }} value={crop} onChange={e => setCrop(e.target.value)}>
              {crops.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <select className="form-select" style={{ width: 120 }} value={days} onChange={e => setDays(+e.target.value)}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {priceData && (
            <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-6)', alignItems: 'center' }}>
              <div>
                <div className="text-xs text-muted">{t('market_latestPrice')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{priceData.latest_price?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('market_trend')}</div>
                <span className={`badge ${priceData.trend === 'rising' ? 'badge-green' : 'badge-red'}`}>
                  {priceData.trend === 'rising' ? '↑' : '↓'} {Math.abs(priceData.trend_pct)}% {priceData.trend}
                </span>
              </div>
              <div>
                <div className="text-xs text-muted">{t('market_crop')}</div>
                <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{priceData.crop}</div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('market_district')}</div>
                <div className="font-semibold">{priceData.district}</div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43A047" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#43A047" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v.toFixed(0)}`, 'Price/Quintal']} />
                <Area type="monotone" dataKey="price" stroke="#43A047" strokeWidth={2} fill="url(#priceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Price Prediction */}
      <div className="card">
        <div className="card-header">
          <h3>{t('market_pricePrediction')}</h3>
          <span className="badge badge-blue">XGBoost Model</span>
        </div>
        <div className="card-body">
          <form onSubmit={handlePredict}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('market_commodity')}</label>
                <input className="form-input" value={predForm.commodity} onChange={e => setPredForm(f => ({...f, commodity: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('market_state')}</label>
                <input className="form-input" value={predForm.state} onChange={e => setPredForm(f => ({...f, state: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('market_district')}</label>
                <input className="form-input" value={predForm.district} onChange={e => setPredForm(f => ({...f, district: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('market_marketLabel')}</label>
                <input className="form-input" value={predForm.market} onChange={e => setPredForm(f => ({...f, market: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Price (₹)</label>
                <input className="form-input" type="number" value={predForm.min_price} onChange={e => setPredForm(f => ({...f, min_price: +e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Price (₹)</label>
                <input className="form-input" type="number" value={predForm.max_price} onChange={e => setPredForm(f => ({...f, max_price: +e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Month</label>
                <select className="form-select" value={predForm.month} onChange={e => setPredForm(f => ({...f, month: +e.target.value}))}>
                  {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month:'long'})}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={predLoading}>
              {predLoading ? t('market_predicting') : t('market_predictPrice')}
            </button>
          </form>

          {prediction && (
            <div className="animate-fade-in-up" style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-6)', background: 'var(--green-50)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>{t('market_predictedPrice')}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--green-700)' }}>
                ₹{prediction.predicted_modal_price.toLocaleString()}
              </div>
              <div className="text-sm text-muted">{prediction.unit} | {prediction.commodity} | {prediction.market}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
