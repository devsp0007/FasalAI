import { useState, useEffect } from 'react'
import { getMarketPrices, predictPrice, getMarketMetadata } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useLanguage } from '../contexts/LanguageContext'
import { useLocation } from '../contexts/LocationContext'

export default function Market() {
  const { t } = useLanguage()
  const { state: detectedState, city: detectedCity } = useLocation()
  const [commodity, setCommodity] = useState('Wheat')
  const [state, setState] = useState(detectedState || '')
  const [days, setDays] = useState(90)
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [metadata, setMetadata] = useState(null)

  // Price prediction form — district auto-filled from IP, no market input
  const [predForm, setPredForm] = useState({
    state: detectedState || 'Uttar Pradesh',
    district: detectedCity || '',
    market: detectedCity || '',
    commodity: 'Wheat', variety: 'Other', grade: 'FAQ',
    min_price: 2200, max_price: 2500, month: new Date().getMonth() + 1, year: 2026
  })
  const [prediction, setPrediction] = useState(null)
  const [predLoading, setPredLoading] = useState(false)

  // Load market metadata (states, commodities)
  useEffect(() => {
    getMarketMetadata().then(d => setMetadata(d)).catch(() => {})
  }, [])

  useEffect(() => {
    if (detectedState && !state) setState(detectedState)
  }, [detectedState])

  // Auto-fill district & market from IP detection
  useEffect(() => {
    if (detectedCity) {
      setPredForm(f => ({
        ...f,
        district: f.district || detectedCity,
        market: f.market || detectedCity,
      }))
    }
    if (detectedState) {
      setPredForm(f => ({
        ...f,
        state: f.state || detectedState,
      }))
    }
  }, [detectedCity, detectedState])

  const commodities = metadata?.commodities || ['Wheat', 'Rice', 'Maize', 'Cotton', 'Onion', 'Potato', 'Tomato', 'Sugarcane']
  const availableStates = metadata?.states ? Object.keys(metadata.states).sort() : []

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const data = await getMarketPrices(commodity, state, '', '', days)
      setPriceData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrices() }, [commodity, state, days])

  const handlePredict = async (e) => {
    e.preventDefault()
    setPredLoading(true)
    try {
      const data = await predictPrice(predForm)
      setPrediction(data)
    } catch (err) { console.error(err) }
    finally { setPredLoading(false) }
  }

  const chartData = (priceData?.prices || []).map((p, i) => ({
    date: p.date ? p.date.slice(5) : `#${i + 1}`,
    price: p.price_per_quintal || 0,
  })).filter(d => d.price > 0)

  return (
    <div className="animate-fade-in">
      {/* Price Chart */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="card-header">
          <h3>{t('market_priceTrends')}</h3>
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-select" style={{ width: 160 }} value={commodity} onChange={e => setCommodity(e.target.value)}>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: 160 }} value={state} onChange={e => setState(e.target.value)}>
              <option value="">All States</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: 120 }} value={days} onChange={e => setDays(+e.target.value)}>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>6 months</option>
              <option value={365}>1 year</option>
            </select>
            {priceData?.source === 'agmarknet' && <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>Real Data</span>}
          </div>
        </div>
        <div className="card-body">
          {priceData && (
            <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div className="text-xs text-muted">{t('market_latestPrice')}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{priceData.latest_price?.toLocaleString() || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted">{t('market_trend')}</div>
                <span className={`badge ${priceData.trend === 'up' ? 'badge-green' : 'badge-red'}`}>
                  {priceData.trend === 'up' ? '↑' : '↓'} {priceData.trend}
                </span>
              </div>
              <div>
                <div className="text-xs text-muted">{t('market_crop')}</div>
                <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{priceData.commodity || priceData.crop}</div>
              </div>
              <div>
                <div className="text-xs text-muted">Data Points</div>
                <div className="font-semibold">{priceData.data_points || chartData.length}</div>
              </div>
              {priceData.state && (
                <div>
                  <div className="text-xs text-muted">State</div>
                  <div className="font-semibold">{priceData.state}</div>
                </div>
              )}
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
          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
            <span className="badge badge-blue">XGBoost Model</span>
            {detectedCity && (
              <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                📍 {detectedCity}{detectedState ? `, ${detectedState}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handlePredict}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('market_commodity')}</label>
                <select className="form-select" value={predForm.commodity} onChange={e => setPredForm(f => ({...f, commodity: e.target.value}))}>
                  {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('market_state')}</label>
                <select className="form-select" value={predForm.state} onChange={e => setPredForm(f => ({...f, state: e.target.value}))}>
                  {availableStates.length > 0
                    ? availableStates.map(s => <option key={s} value={s}>{s}</option>)
                    : <option value={predForm.state}>{predForm.state}</option>
                  }
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District (Auto-detected)</label>
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--green-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--green-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                  minHeight: 42,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--green-700)',
                }}>
                  <span>📍</span>
                  <span>{predForm.district || detectedCity || 'Detecting...'}</span>
                </div>
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
