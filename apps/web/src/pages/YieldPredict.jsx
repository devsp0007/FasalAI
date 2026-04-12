import { useState, useEffect } from 'react'
import { predictYield, getYieldDistricts } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import { useLocation } from '../contexts/LocationContext'

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Laddakh', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const CROPS = [
  'Arecanut', 'Arhar/Tur', 'Bajra', 'Banana', 'Barley', 'Bean', 'Bhindi',
  'Bottle Gourd', 'Brinjal', 'Cabbage', 'Cashewnut', 'Castor seed', 'Coconut',
  'Coffee', 'Coriander', 'Cotton(lint)', 'Cowpea(Lobia)', 'Drum Stick', 'Garlic',
  'Ginger', 'Gram', 'Groundnut', 'Guar seed', 'Horse-gram', 'Jowar', 'Jute',
  'Khesari', 'Lemon', 'Linseed', 'Maize', 'Mango', 'Masoor', 'Mesta',
  'Moong(Green Gram)', 'Moth', 'Niger seed', 'Onion', 'Other Kharif pulses',
  'Peas & beans (Pulses)', 'Potato', 'Ragi', 'Rapeseed & Mustard', 'Rice',
  'Safflower', 'Sesamum', 'Small millets', 'Soyabean', 'Sugarcane', 'Sunflower',
  'Sweet potato', 'Tapioca', 'Tobacco', 'Turmeric', 'Urad', 'Wheat'
]

const SEASONS = ['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Autumn', 'Winter']

export default function YieldPredict() {
  const { city: detectedCity, state: detectedState } = useLocation()
  const [form, setForm] = useState({
    state: 'Punjab', district: 'LUDHIANA', crop: 'Wheat',
    season: 'Rabi', area_ha: 5.0, year: 2026
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  // District dropdown data
  const [districts, setDistricts] = useState([])
  const [districtsLoading, setDistrictsLoading] = useState(false)
  const [usingIpDistrict, setUsingIpDistrict] = useState(false)

  // Auto-fill state from IP detection
  useEffect(() => {
    if (detectedState) {
      const matchedState = STATES.find(s => s.toLowerCase() === detectedState.toLowerCase())
      if (matchedState) {
        setForm(f => ({ ...f, state: matchedState }))
      }
    }
  }, [detectedState])

  // Load districts when state changes
  useEffect(() => {
    if (!form.state) return
    setDistrictsLoading(true)
    setUsingIpDistrict(false)
    getYieldDistricts(form.state)
      .then(data => {
        const distList = data.districts || []
        setDistricts(distList)
        if (distList.length > 0) {
          // If detected city matches a district, select it; otherwise first
          const cityUpper = (detectedCity || '').toUpperCase()
          const match = distList.find(d => d.toUpperCase() === cityUpper)
          setForm(f => ({ ...f, district: match || distList[0] }))
          setUsingIpDistrict(!!match)
        } else {
          // No districts in dataset — fall back to IP city
          const fallback = detectedCity ? detectedCity.toUpperCase() : ''
          setForm(f => ({ ...f, district: fallback }))
          setUsingIpDistrict(true)
        }
      })
      .catch(() => {
        setDistricts([])
        const fallback = detectedCity ? detectedCity.toUpperCase() : ''
        setForm(f => ({ ...f, district: fallback }))
        setUsingIpDistrict(true)
      })
      .finally(() => setDistrictsLoading(false))
  }, [form.state, detectedCity])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const data = await predictYield(form)
      setResult(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-header">
            <h3>{t('yield_inputTitle')}</h3>
            <span className="badge badge-blue">XGBoost</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('yield_state')}</label>
                  <select className="form-select" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    {t('yield_district')}
                    {usingIpDistrict && (
                      <span className="badge badge-green" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>📍 Detected</span>
                    )}
                  </label>
                  {districtsLoading ? (
                    <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                      Loading districts...
                    </div>
                  ) : districts.length > 0 ? (
                    <select className="form-select" value={form.district} onChange={e => { setForm(f => ({...f, district: e.target.value})); setUsingIpDistrict(false) }}>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
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
                      <span>{form.district || detectedCity?.toUpperCase() || 'Detecting...'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('yield_crop')}</label>
                  <select className="form-select" value={form.crop} onChange={e => setForm(f => ({...f, crop: e.target.value}))}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('yield_season')}</label>
                  <select className="form-select" value={form.season} onChange={e => setForm(f => ({...f, season: e.target.value}))}>
                    {SEASONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('yield_area')}</label>
                  <input className="form-input" type="number" value={form.area_ha} onChange={e => setForm(f => ({...f, area_ha: +e.target.value}))} step="0.1" min="0.1" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('yield_year')}</label>
                  <input className="form-input" type="number" value={form.year} onChange={e => setForm(f => ({...f, year: +e.target.value}))} min="2000" max="2030" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? t('yield_predicting') : t('yield_predictYield')}
              </button>
            </form>
          </div>
        </div>

        <div>
          {error && <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 'var(--sp-4)' }}><div className="card-body" style={{ color: 'var(--danger)' }}>❌ {error}</div></div>}

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🌾</div>
              <h3>{t('yield_emptyTitle')}</h3>
              <p className="text-secondary">{t('yield_emptyDesc')}</p>
            </div>
          )}

          {loading && <div className="loading-container"><div className="spinner"></div><span>Running yield model...</span></div>}

          {result && !loading && (
            <div className="card animate-fade-in-up">
              <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--green-500), var(--green-700))', color: 'white' }}>
                <h3 style={{ color: 'white' }}>📊 Yield Prediction Result</h3>
              </div>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green-700)', marginBottom: 'var(--sp-2)' }}>
                  {result.predicted_yield_tonnes_per_ha} T/Ha
                </div>
                <div className="text-muted" style={{ marginBottom: 'var(--sp-6)' }}>Predicted yield per hectare</div>

                <div className="grid-2" style={{ gap: 'var(--sp-4)' }}>
                  <div style={{ background: 'var(--green-50)', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-muted">Total Expected Production</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-700)' }}>{result.predicted_total_tonnes} T</div>
                    <div className="text-xs text-muted">for {result.area_ha} hectares</div>
                  </div>
                  <div style={{ background: '#FFF8E1', padding: 'var(--sp-5)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-xs text-muted">Crop & Season</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{result.crop}</div>
                    <div className="text-xs text-muted">{result.season} · {result.state}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
