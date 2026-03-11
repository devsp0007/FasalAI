import { useState } from 'react'
import { predictYield } from '../services/api'

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']

const CROPS = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton(lint)', 'Groundnut', 'Soyabean', 'Potato',
  'Onion', 'Bajra', 'Jowar', 'Barley', 'Gram', 'Urad', 'Moong(Green Gram)', 'Ragi',
  'Banana', 'Coconut', 'Jute', 'Tobacco', 'Turmeric']

const SEASONS = ['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Autumn', 'Winter']

export default function YieldPredict() {
  const [form, setForm] = useState({
    state: 'Punjab', district: 'LUDHIANA', crop: 'Wheat',
    season: 'Rabi', area_ha: 5.0, year: 2026
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
            <h3>🌾 Yield Prediction Input</h3>
            <span className="badge badge-blue">XGBoost</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select className="form-select" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <input className="form-input" value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} placeholder="e.g. LUDHIANA" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Crop</label>
                  <select className="form-select" value={form.crop} onChange={e => setForm(f => ({...f, crop: e.target.value}))}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <select className="form-select" value={form.season} onChange={e => setForm(f => ({...f, season: e.target.value}))}>
                    {SEASONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Area (Hectares)</label>
                  <input className="form-input" type="number" value={form.area_ha} onChange={e => setForm(f => ({...f, area_ha: +e.target.value}))} step="0.1" min="0.1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" type="number" value={form.year} onChange={e => setForm(f => ({...f, year: +e.target.value}))} min="2000" max="2030" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? '⏳ Predicting...' : '🌾 Predict Yield'}
              </button>
            </form>
          </div>
        </div>

        <div>
          {error && <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 'var(--sp-4)' }}><div className="card-body" style={{ color: 'var(--danger)' }}>❌ {error}</div></div>}

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🌾</div>
              <h3>Predict Your Crop Yield</h3>
              <p className="text-secondary">Select your state, crop, and season to get an AI-powered yield estimate.</p>
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
