import { useState, useEffect } from 'react'
import { recommendCrop, predictYield, getStates, getCropsByState, getWeather, getYieldDistricts } from '../services/api'
import { useLocation } from '../contexts/LocationContext'
import AzureTranslate from '../components/AzureTranslate'

const SEASONS = [
  { value: 'kharif', label: 'Kharif (Jun–Oct)' },
  { value: 'rabi', label: 'Rabi (Nov–Mar)' },
  { value: 'zaid', label: 'Zaid (Mar–Jun)' },
]

const SOIL_TYPES = [
  'Alluvial soil', 'Black soil', 'Clayey soils', 'Desert soil',
  'Laterite soil', 'Red soil', 'Sandy loam', 'Sandy soil',
]

const DEFAULT_PARAMS = {
  nitrogen: 90, phosphorus: 42, potassium: 43,
  temperature: 25, humidity: 70, ph: 6.5, rainfall: 200,
  season: 'kharif', state: '', soil_type: '',
}

function computeRisks(params) {
  const risks = []
  if (params.ph < 5.5) risks.push({ label: 'Acidic Soil Stress', icon: 'warning', color: 'text-tertiary' })
  if (params.ph > 8.5) risks.push({ label: 'Alkaline Soil Stress', icon: 'warning', color: 'text-tertiary' })
  if (params.rainfall < 50) risks.push({ label: 'Drought Risk', icon: 'water_drop', color: 'text-error' })
  if (params.rainfall > 400) risks.push({ label: 'Flood Risk', icon: 'flood', color: 'text-error' })
  if (params.temperature > 42) risks.push({ label: 'Heat Stress', icon: 'thermostat', color: 'text-error' })
  if (params.temperature < 5) risks.push({ label: 'Frost Risk', icon: 'ac_unit', color: 'text-blue-600' })
  if (params.humidity > 90) risks.push({ label: 'Fungal Risk', icon: 'bug_report', color: 'text-tertiary' })
  if (params.nitrogen < 20) risks.push({ label: 'Low Nitrogen', icon: 'science', color: 'text-tertiary' })
  if (risks.length === 0) risks.push({ label: 'No Major Risks', icon: 'check_circle', color: 'text-primary' })
  return risks
}

export default function WhatIfSimulator() {
  const { state: detectedState, latitude, longitude } = useLocation()
  const [states, setStates] = useState([])
  const [baseline, setBaseline] = useState({ ...DEFAULT_PARAMS })
  const [whatif, setWhatif] = useState({ ...DEFAULT_PARAMS })
  const [baselineResult, setBaselineResult] = useState(null)
  const [whatifResult, setWhatifResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [weatherFilled, setWeatherFilled] = useState(false)

  useEffect(() => {
    getStates().then(d => setStates(d.states || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (detectedState) {
      setBaseline(p => ({ ...p, state: detectedState }))
      setWhatif(p => ({ ...p, state: detectedState }))
    }
  }, [detectedState])

  // Auto-fill weather on mount
  useEffect(() => {
    if (weatherFilled) return
    const lat = latitude || 25.3176
    const lon = longitude || 82.9739
    getWeather(lat, lon).then(data => {
      const c = data?.current
      if (c?.temperature) {
        const weatherParams = {
          temperature: Math.round(c.temperature * 10) / 10,
          humidity: c.humidity || 70,
          rainfall: c.rain_1h ? Math.round(c.rain_1h * 24 * 30) : 200,
        }
        setBaseline(p => ({ ...p, ...weatherParams }))
        setWhatif(p => ({ ...p, ...weatherParams }))
        setWeatherFilled(true)
      }
    }).catch(() => {})
  }, [latitude, longitude])

  const updateBaseline = (key, value) => {
    setBaseline(p => ({ ...p, [key]: value }))
  }

  const updateWhatif = (key, value) => {
    setWhatif(p => ({ ...p, [key]: value }))
  }

  const handleSimulate = async () => {
    setLoading(true)
    setError(null)
    try {
      const [bRes, wRes] = await Promise.all([
        recommendCrop({
          nitrogen: baseline.nitrogen, phosphorus: baseline.phosphorus, potassium: baseline.potassium,
          temperature: baseline.temperature, humidity: baseline.humidity, ph: baseline.ph, rainfall: baseline.rainfall,
          season: baseline.season, state: baseline.state || null, soil_type: baseline.soil_type || null,
        }),
        recommendCrop({
          nitrogen: whatif.nitrogen, phosphorus: whatif.phosphorus, potassium: whatif.potassium,
          temperature: whatif.temperature, humidity: whatif.humidity, ph: whatif.ph, rainfall: whatif.rainfall,
          season: whatif.season, state: whatif.state || null, soil_type: whatif.soil_type || null,
        }),
      ])
      setBaselineResult(bRes)
      setWhatifResult(wRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyBaselineToWhatif = () => setWhatif({ ...baseline })

  const inputClass = "w-full bg-surface-container-highest rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"

  function ParamInputs({ values, onChange, label }) {
    return (
      <div className="bg-white rounded-2xl editorial-shadow overflow-hidden">
        <div className="p-4 bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline font-bold text-on-surface flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-primary text-lg">
              {label === 'Current' ? 'fact_check' : 'edit_note'}
            </span>
            <AzureTranslate text={`${label} Conditions`} />
          </h3>
          {label === 'What-If' && (
            <button onClick={copyBaselineToWhatif}
              className="smart-chip bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors">
              <span className="material-symbols-outlined text-xs">content_copy</span>
              <AzureTranslate text="Copy Current" />
            </button>
          )}
        </div>
        <div className="p-4 space-y-3">
          {/* Location */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider"><AzureTranslate text="State" /></label>
              <select className={inputClass} value={values.state}
                onChange={e => onChange('state', e.target.value)}>
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider"><AzureTranslate text="Season" /></label>
              <select className={inputClass} value={values.season}
                onChange={e => onChange('season', e.target.value)}>
                {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* NPK */}
          <div>
            <label className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider"><AzureTranslate text="Soil NPK" /></label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { key: 'nitrogen', label: 'N' },
                { key: 'phosphorus', label: 'P' },
                { key: 'potassium', label: 'K' },
              ].map(f => (
                <div key={f.key} className="bg-surface-container-low rounded-xl p-2 text-center">
                  <span className="block text-[9px] font-bold text-on-surface-variant/40 uppercase">{f.label}</span>
                  <input type="number" value={values[f.key]} step="1"
                    onChange={e => onChange(f.key, parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-center font-headline font-bold text-primary p-0 focus:ring-0 focus:outline-none text-base" />
                </div>
              ))}
            </div>
          </div>

          {/* Weather + pH */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'temperature', label: 'Temp (°C)', step: 0.5 },
              { key: 'humidity', label: 'Humidity (%)', step: 1 },
              { key: 'rainfall', label: 'Rainfall (mm)', step: 5 },
              { key: 'ph', label: 'Soil pH', step: 0.1 },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <label className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider">
                  <AzureTranslate text={f.label} />
                </label>
                <input type="number" className={inputClass} value={values[f.key]} step={f.step}
                  onChange={e => onChange(f.key, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
          </div>

          {/* Soil Type */}
          <div className="space-y-1">
            <label className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider"><AzureTranslate text="Soil Type" /></label>
            <select className={inputClass} value={values.soil_type}
              onChange={e => onChange('soil_type', e.target.value)}>
              <option value="">Any</option>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Risk indicators */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {computeRisks(values).map((r, i) => (
              <span key={i} className={`smart-chip bg-surface-container-low ${r.color}`}>
                <span className="material-symbols-outlined text-xs">{r.icon}</span>
                <AzureTranslate text={r.label} />
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function ResultCard({ title, result, isWhatif }) {
    if (!result) return null
    const topRec = result.recommendations?.[0]
    if (!topRec) return null

    return (
      <div className={`bg-white rounded-2xl editorial-shadow overflow-hidden animate-fade-in-up ${isWhatif ? 'ring-2 ring-tertiary/20' : 'ring-2 ring-primary/20'}`}>
        <div className={`p-4 ${isWhatif ? 'bg-gradient-to-r from-tertiary/10 to-tertiary-fixed/20' : 'bg-gradient-to-r from-primary/10 to-secondary-container/30'}`}>
          <h4 className="font-headline font-bold text-sm flex items-center gap-2">
            <span className={`material-symbols-outlined text-lg ${isWhatif ? 'text-tertiary' : 'text-primary'}`}>
              {isWhatif ? 'compare_arrows' : 'verified'}
            </span>
            <AzureTranslate text={title} />
          </h4>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline font-extrabold text-xl capitalize"><AzureTranslate text={topRec.crop} /></div>
              <div className="font-label text-xs text-on-surface-variant/60"><AzureTranslate text="Top Recommendation" /></div>
            </div>
            <div className="text-right">
              <div className={`font-headline font-extrabold text-2xl ${isWhatif ? 'text-tertiary' : 'text-primary'}`}>{topRec.confidence_pct}%</div>
              <div className="font-label text-[10px] text-on-surface-variant/50"><AzureTranslate text="confidence" /></div>
            </div>
          </div>
          <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${isWhatif ? 'bg-gradient-to-r from-tertiary to-tertiary-container' : 'bg-gradient-to-r from-primary to-primary-container'}`}
              style={{ width: `${topRec.confidence_pct}%` }} />
          </div>

          {/* Other recommendations */}
          {result.recommendations?.slice(1, 3).map((rec, i) => (
            <div key={i} className="flex justify-between items-center bg-surface-container-low rounded-xl px-3 py-2">
              <span className="font-body text-sm font-semibold capitalize"><AzureTranslate text={rec.crop} /></span>
              <span className="font-label text-xs font-bold text-on-surface-variant">{rec.confidence_pct}%</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Compute comparison deltas
  const baseTop = baselineResult?.recommendations?.[0]
  const whatifTop = whatifResult?.recommendations?.[0]
  const confidenceDelta = baseTop && whatifTop ? (whatifTop.confidence_pct - baseTop.confidence_pct).toFixed(1) : null
  const cropChanged = baseTop && whatifTop && baseTop.crop !== whatifTop.crop

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">
          <AzureTranslate text="What-If Simulator" /> 🔬
        </h1>
        <p className="font-label text-sm text-on-surface-variant/60 mt-1">
          <AzureTranslate text="Test how changing soil, weather, or season affects crop recommendations" />
        </p>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParamInputs values={baseline} onChange={updateBaseline} label="Current" />
        <ParamInputs values={whatif} onChange={updateWhatif} label="What-If" />
      </div>

      {/* Simulate Button */}
      <button onClick={handleSimulate} disabled={loading}
        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-container transition-all disabled:opacity-60">
        <span className="material-symbols-outlined">{loading ? 'hourglass_empty' : 'science'}</span>
        {loading ? <AzureTranslate text="Running Simulation..." /> : <AzureTranslate text="Run Simulation" />}
      </button>

      {error && (
        <div className="bg-error-container/30 text-on-error-container p-4 rounded-2xl flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-error">error</span>
          <AzureTranslate text={error} />
        </div>
      )}

      {/* Comparison Delta Banner */}
      {baseTop && whatifTop && (
        <div className={`rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up ${cropChanged ? 'bg-tertiary-fixed/30' : 'bg-secondary-container/30'}`}>
          <span className="material-symbols-outlined text-2xl">
            {cropChanged ? 'swap_horiz' : 'compare_arrows'}
          </span>
          <div>
            <div className="font-headline font-bold text-sm">
              {cropChanged ? (
                <AzureTranslate text={`Recommendation changed: ${baseTop.crop} → ${whatifTop.crop}`} />
              ) : (
                <AzureTranslate text={`Same recommendation: ${baseTop.crop}`} />
              )}
            </div>
            <div className="font-label text-xs text-on-surface-variant/70 mt-0.5">
              <AzureTranslate text="Confidence" />: {baseTop.confidence_pct}% → {whatifTop.confidence_pct}%
              <span className={`ml-2 font-bold ${parseFloat(confidenceDelta) > 0 ? 'text-primary' : parseFloat(confidenceDelta) < 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                ({parseFloat(confidenceDelta) > 0 ? '+' : ''}{confidenceDelta}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Result Cards */}
      {(baselineResult || whatifResult) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ResultCard title="Current Result" result={baselineResult} isWhatif={false} />
          <ResultCard title="What-If Result" result={whatifResult} isWhatif={true} />
        </div>
      )}

      {/* Empty State */}
      {!baselineResult && !whatifResult && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">science</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
            <AzureTranslate text="Ready to Simulate" />
          </h3>
          <p className="text-sm text-on-surface-variant/60 max-w-sm">
            <AzureTranslate text="Adjust the current and what-if parameters above, then click Run Simulation to compare outcomes side by side." />
          </p>
        </div>
      )}
    </div>
  )
}
