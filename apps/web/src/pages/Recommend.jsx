import { useState } from 'react'
import { recommendCrop } from '../services/api'

const PRESETS = {
  rice_kharif: { nitrogen: 80, phosphorus: 48, potassium: 40, temperature: 27, humidity: 80, ph: 6.5, rainfall: 250, season: 'kharif', label: 'Rice Belt (Kharif)' },
  wheat_rabi: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 18, humidity: 65, ph: 7.0, rainfall: 50, season: 'rabi', label: 'Wheat Belt (Rabi)' },
  cotton: { nitrogen: 120, phosphorus: 50, potassium: 30, temperature: 32, humidity: 55, ph: 7.5, rainfall: 100, season: 'kharif', label: 'Cotton Region' },
  default: { nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 20.8, humidity: 82, ph: 6.5, rainfall: 202.9, season: 'kharif', label: 'Default' },
}

export default function Recommend() {
  const [form, setForm] = useState(PRESETS.default)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'season' || name === 'previous_crop' ? value : parseFloat(value) || 0 }))
  }

  const handlePreset = (key) => {
    const preset = PRESETS[key]
    setForm(prev => ({ ...prev, ...preset }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await recommendCrop({
        nitrogen: form.nitrogen,
        phosphorus: form.phosphorus,
        potassium: form.potassium,
        temperature: form.temperature,
        humidity: form.humidity,
        ph: form.ph,
        rainfall: form.rainfall,
        season: form.season,
        previous_crop: form.previous_crop || null,
      })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 'var(--sp-6)' }}>
        {/* Input Form */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3>🧪 Soil & Weather Input</h3>
            </div>
            <div className="card-body">
              {/* Presets */}
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <label className="form-label">Quick Presets</label>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <button key={key} className="btn btn-sm btn-secondary" onClick={() => handlePreset(key)}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-label" style={{ marginBottom: 'var(--sp-3)', color: 'var(--green-700)', fontWeight: 700 }}>
                  🌍 Soil Nutrients (kg/ha)
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nitrogen (N)</label>
                    <input className="form-input" type="number" name="nitrogen" value={form.nitrogen} onChange={handleChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phosphorus (P)</label>
                    <input className="form-input" type="number" name="phosphorus" value={form.phosphorus} onChange={handleChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Potassium (K)</label>
                    <input className="form-input" type="number" name="potassium" value={form.potassium} onChange={handleChange} step="0.1" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Soil pH</label>
                  <input className="form-input" type="number" name="ph" value={form.ph} onChange={handleChange} step="0.1" min="0" max="14" />
                </div>

                <div className="form-label" style={{ marginBottom: 'var(--sp-3)', color: 'var(--green-700)', fontWeight: 700, marginTop: 'var(--sp-4)' }}>
                  🌤️ Weather Conditions
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Temperature (°C)</label>
                    <input className="form-input" type="number" name="temperature" value={form.temperature} onChange={handleChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Humidity (%)</label>
                    <input className="form-input" type="number" name="humidity" value={form.humidity} onChange={handleChange} step="0.1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rainfall (mm)</label>
                    <input className="form-input" type="number" name="rainfall" value={form.rainfall} onChange={handleChange} step="0.1" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Season</label>
                    <select className="form-select" name="season" value={form.season} onChange={handleChange}>
                      <option value="kharif">Kharif (Jun-Oct)</option>
                      <option value="rabi">Rabi (Nov-Mar)</option>
                      <option value="zaid">Zaid (Mar-Jun)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Previous Crop</label>
                    <select className="form-select" name="previous_crop" value={form.previous_crop || ''} onChange={handleChange}>
                      <option value="">None / Unknown</option>
                      <option value="rice">Rice</option>
                      <option value="wheat">Wheat</option>
                      <option value="maize">Maize</option>
                      <option value="cotton">Cotton</option>
                      <option value="chickpea">Chickpea</option>
                      <option value="mungbean">Mungbean</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--sp-2)' }} disabled={loading}>
                  {loading ? '⏳ Analyzing...' : '🌱 Get Recommendations'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {error && (
            <div className="card animate-fade-in" style={{ borderColor: 'var(--danger)', marginBottom: 'var(--sp-4)' }}>
              <div className="card-body" style={{ color: 'var(--danger)' }}>
                ❌ {error}
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <h3>Enter Your Soil & Weather Data</h3>
              <p className="text-secondary">Fill in the form and click "Get Recommendations" to see AI-powered crop suggestions.</p>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Running AI model inference...</span>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>🎯 Top Recommendations</h2>
                <span className="badge badge-green">{result.inference_ms}ms inference</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {result.recommendations.map((rec, i) => (
                  <div key={rec.crop} className={`reco-card rank-${rec.rank} animate-fade-in-up stagger-${i+1}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
                        <div className={`reco-rank rank-${rec.rank}`}>#{rec.rank}</div>
                        <div>
                          <div className="reco-crop-name">{rec.crop}</div>
                          <span className="badge badge-green" style={{ marginTop: 4 }}>{rec.crop_family}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="reco-score">{rec.confidence_pct}%</div>
                        <div className="text-xs text-muted">confidence</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'var(--sp-4)' }}>
                      <div className="score-bar-container">
                        <div className="score-bar" style={{ width: `${rec.confidence_pct}%` }}></div>
                      </div>
                    </div>

                    <p style={{ marginTop: 'var(--sp-3)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      💡 {rec.reason}
                    </p>

                    <div style={{ marginTop: 'var(--sp-4)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-3)' }}>
                      <div style={{ background: 'var(--green-50)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 2 }}>📅 Sowing Window</div>
                        <div className="font-semibold text-sm">{rec.sowing_window.start} — {rec.sowing_window.end}</div>
                      </div>
                      <div style={{ background: '#FFF8E1', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 2 }}>🧪 N-P-K (kg/ha)</div>
                        <div className="font-semibold text-sm">{rec.fertilizer.nitrogen_kg_ha} - {rec.fertilizer.phosphorus_kg_ha} - {rec.fertilizer.potassium_kg_ha}</div>
                      </div>
                      <div style={{ background: '#E3F2FD', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div className="text-xs text-muted" style={{ marginBottom: 2 }}>📊 Base Score</div>
                        <div className="font-semibold text-sm">{(rec.base_score * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    {rec.adjustments.length > 0 && (
                      <div style={{ marginTop: 'var(--sp-3)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {rec.adjustments.map((adj, j) => (
                          <span key={j} className={`badge ${adj.value > 0 ? 'badge-green' : 'badge-amber'}`} style={{ marginRight: 4, marginBottom: 4 }}>
                            {adj.rule.replace(/_/g, ' ')}: {adj.value > 0 ? '+' : ''}{adj.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 'var(--sp-4)' }}>
                <div className="card-body text-sm text-muted">
                  <strong>Model:</strong> {result.model_version} | <strong>Inference:</strong> {result.inference_ms}ms |
                  <strong> Input:</strong> N={result.input_summary.soil.N}, P={result.input_summary.soil.P}, K={result.input_summary.soil.K}, pH={result.input_summary.soil['pH']}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
