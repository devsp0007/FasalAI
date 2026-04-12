import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getFields, createField, deleteFieldById } from '../services/api'

const IRRIGATION_TYPES = ['Tubewell', 'Canal', 'Rainfed', 'Drip', 'Sprinkler']
const SOIL_HEALTH_OPTIONS = [
  { label: 'Excellent', ph: 6.8, n: 120, p: 55, k: 55 },
  { label: 'Good', ph: 6.5, n: 90, p: 42, k: 43 },
  { label: 'Moderate', ph: 7.2, n: 60, p: 30, k: 35 },
  { label: 'Poor', ph: 5.5, n: 30, p: 15, k: 20 },
]
const CROP_LIST = [
  'Rice', 'Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Groundnut', 'Soyabean',
  'Potato', 'Onion', 'Bajra', 'Jowar', 'Barley', 'Gram', 'Urad',
  'Moong', 'Ragi', 'Banana', 'Coconut', 'Jute', 'Tobacco', 'Turmeric',
  'Mustard', 'Sunflower', 'Chickpea', 'Lentil', 'Tomato', 'Chilli',
]

const SOIL_STATUS = (ph) => {
  if (ph >= 6.0 && ph <= 7.5) return { label: 'Good', color: 'badge-green' }
  if (ph >= 5.5 && ph <= 8.0) return { label: 'Moderate', color: 'badge-amber' }
  return { label: 'Poor', color: 'badge-red' }
}

const EMPTY_FORM = {
  label: '',
  area_ha: 1.0,
  irrigation: 'Rainfed',
  soil_health: 'Good',
  soil_n: 90,
  soil_p: 42,
  soil_k: 43,
  soil_ph: 6.5,
  soil_type: '',
  previous_crop: '',
  current_crop: '',
  status: 'active',
}

export default function Fields() {
  const [fields, setFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState(null)
  const { t } = useLanguage()

  // Fetch fields from API
  const loadFields = async () => {
    setFieldsLoading(true)
    try {
      const data = await getFields()
      setFields(data.fields || [])
    } catch (err) {
      console.error('Failed to load fields:', err)
      setFields([])
    } finally {
      setFieldsLoading(false)
    }
  }

  useEffect(() => { loadFields() }, [])

  // Handle soil health preset selection
  const handleSoilPreset = (preset) => {
    setAddForm(f => ({
      ...f,
      soil_health: preset.label,
      soil_n: preset.n,
      soil_p: preset.p,
      soil_k: preset.k,
      soil_ph: preset.ph,
    }))
  }

  // Handle add field
  const handleAddField = async (e) => {
    e.preventDefault()
    if (!addForm.label.trim()) {
      setError('Please enter a field name')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createField({
        label: addForm.label.trim(),
        area_ha: addForm.area_ha,
        irrigation: addForm.irrigation.toLowerCase(),
        soil_n: addForm.soil_n,
        soil_p: addForm.soil_p,
        soil_k: addForm.soil_k,
        soil_ph: addForm.soil_ph,
        soil_type: addForm.soil_type,
        previous_crop: addForm.previous_crop,
        current_crop: addForm.current_crop,
        status: addForm.status,
      })
      setShowAddModal(false)
      setAddForm({ ...EMPTY_FORM })
      await loadFields()
    } catch (err) {
      setError(err.message || 'Failed to create field')
    } finally {
      setSaving(false)
    }
  }

  // Handle delete field
  const handleDeleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this field?')) return
    setDeleting(fieldId)
    try {
      await deleteFieldById(fieldId)
      if (selected?.id === fieldId) setSelected(null)
      await loadFields()
    } catch (err) {
      console.error('Failed to delete field:', err)
    } finally {
      setDeleting(null)
    }
  }

  const totalArea = fields.reduce((s, p) => s + (p.area_ha || 0), 0)

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h2>{t('fields_title')}</h2>
          <p className="text-sm text-muted">{fields.length} plots registered · {totalArea.toFixed(1)} hectares total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowAddModal(true); setError(null); setAddForm({ ...EMPTY_FORM }) }}>
          + {t('fields_addField')}
        </button>
      </div>

      {/* Field Cards */}
      {fieldsLoading ? (
        <div className="loading-container"><div className="spinner"></div><span>Loading fields...</span></div>
      ) : fields.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌾</div>
          <h3>No Fields Added Yet</h3>
          <p className="text-secondary">Click "Add Field" to register your first farm plot</p>
        </div>
      ) : (
        <div className="grid-3">
          {fields.map((plot) => (
            <div key={plot.id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setSelected(selected?.id === plot.id ? null : plot)}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                  <div>
                    <h3>{plot.label}</h3>
                    <span className={`badge ${plot.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{plot.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>🗺️</div>
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--danger)', padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteField(plot.id) }}
                      disabled={deleting === plot.id}
                    >
                      {deleting === plot.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                  <div>
                    <div className="text-xs text-muted">{t('fields_area')}</div>
                    <div className="font-semibold">{plot.area_ha} ha</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">{t('fields_irrigation')}</div>
                    <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{plot.irrigation}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">{t('fields_previousCrop')}</div>
                    <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{plot.previous_crop || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Current Crop</div>
                    <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{plot.current_crop || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">{t('fields_soilHealth')}</div>
                    <span className={`badge ${SOIL_STATUS(plot.soil_ph || 7).color}`}>{SOIL_STATUS(plot.soil_ph || 7).label}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plot Detail Panel */}
      {selected && (
        <div className="card animate-fade-in-up" style={{ marginTop: 'var(--sp-6)' }}>
          <div className="card-header">
            <h3>📋 {selected.label} — Details</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setSelected(null)}>✕ Close</button>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 'var(--sp-6)' }}>
              {/* Soil Health */}
              <div>
                <h4 style={{ marginBottom: 'var(--sp-4)' }}>🧪 Soil Nutrients (kg/ha)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {[
                    { label: 'Nitrogen (N)', value: selected.soil_n || 0, max: 200, color: '#43A047' },
                    { label: 'Phosphorus (P)', value: selected.soil_p || 0, max: 100, color: '#FF9800' },
                    { label: 'Potassium (K)', value: selected.soil_k || 0, max: 100, color: '#1E88E5' },
                  ].map(nutrient => (
                    <div key={nutrient.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="text-sm">{nutrient.label}</span>
                        <span className="font-semibold text-sm">{nutrient.value}</span>
                      </div>
                      <div className="score-bar-container">
                        <div className="score-bar" style={{ width: `${(nutrient.value / nutrient.max) * 100}%`, background: nutrient.color }}></div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 'var(--sp-2)' }}>
                    <span className="text-sm">Soil pH: </span>
                    <span className="font-bold">{selected.soil_ph || '—'}</span>
                    <span className={`badge ${SOIL_STATUS(selected.soil_ph || 7).color}`} style={{ marginLeft: 8 }}>{SOIL_STATUS(selected.soil_ph || 7).label}</span>
                  </div>
                </div>
              </div>

              {/* Plot Info */}
              <div>
                <h4 style={{ marginBottom: 'var(--sp-4)' }}>📍 Plot Information</h4>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                  <tbody>
                    {[
                      ['Label', selected.label],
                      ['Area', `${selected.area_ha} hectares`],
                      ['Irrigation', selected.irrigation],
                      ['Previous Crop', selected.previous_crop || '—'],
                      ['Current Crop', selected.current_crop || '—'],
                      ['Soil Type', selected.soil_type || '—'],
                      ['Status', selected.status],
                    ].map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--text-muted)', width: 140 }}>{k}</td>
                        <td style={{ padding: '8px 0', fontWeight: 500, textTransform: 'capitalize' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--sp-4)',
          backdropFilter: 'blur(4px)',
        }} onClick={() => setShowAddModal(false)}>
          <div className="card animate-fade-in-up" style={{
            width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--green-500), var(--green-700))', color: 'white' }}>
              <h3 style={{ color: 'white' }}>🌾 Add New Field</h3>
              <button className="btn btn-sm btn-ghost" style={{ color: 'white' }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="card-body">
              {error && (
                <div style={{ padding: 'var(--sp-3)', background: '#FFEBEE', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: 'var(--sp-4)', fontSize: '0.85rem' }}>
                  ❌ {error}
                </div>
              )}
              <form onSubmit={handleAddField}>
                {/* Field Name */}
                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label">Field Name *</label>
                  <input className="form-input" placeholder="e.g. South Field, Plot A"
                    value={addForm.label} onChange={e => setAddForm(f => ({...f, label: e.target.value}))} required />
                </div>

                {/* Area & Status */}
                <div className="form-row" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Area (hectares) *</label>
                    <input className="form-input" type="number" step="0.1" min="0.01"
                      value={addForm.area_ha} onChange={e => setAddForm(f => ({...f, area_ha: +e.target.value}))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={addForm.status} onChange={e => setAddForm(f => ({...f, status: e.target.value}))}>
                      <option value="active">Active</option>
                      <option value="fallow">Fallow</option>
                    </select>
                  </div>
                </div>

                {/* Irrigation */}
                <div className="form-group" style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label">Irrigation Type</label>
                  <select className="form-select" value={addForm.irrigation} onChange={e => setAddForm(f => ({...f, irrigation: e.target.value}))}>
                    {IRRIGATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Soil Health */}
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label className="form-label" style={{ marginBottom: 'var(--sp-2)' }}>Soil Health</label>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                    {SOIL_HEALTH_OPTIONS.map(opt => (
                      <button key={opt.label} type="button"
                        className={`btn btn-sm ${addForm.soil_health === opt.label ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
                        onClick={() => handleSoilPreset(opt)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--sp-2)' }}>
                    <div>
                      <label className="text-xs text-muted">N (kg/ha)</label>
                      <input className="form-input" type="number" value={addForm.soil_n}
                        onChange={e => setAddForm(f => ({...f, soil_n: +e.target.value, soil_health: 'Custom'}))} style={{ fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label className="text-xs text-muted">P (kg/ha)</label>
                      <input className="form-input" type="number" value={addForm.soil_p}
                        onChange={e => setAddForm(f => ({...f, soil_p: +e.target.value, soil_health: 'Custom'}))} style={{ fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label className="text-xs text-muted">K (kg/ha)</label>
                      <input className="form-input" type="number" value={addForm.soil_k}
                        onChange={e => setAddForm(f => ({...f, soil_k: +e.target.value, soil_health: 'Custom'}))} style={{ fontSize: '0.85rem' }} />
                    </div>
                    <div>
                      <label className="text-xs text-muted">pH</label>
                      <input className="form-input" type="number" step="0.1" min="0" max="14" value={addForm.soil_ph}
                        onChange={e => setAddForm(f => ({...f, soil_ph: +e.target.value, soil_health: 'Custom'}))} style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>

                {/* Previous & Current Crop */}
                <div className="form-row" style={{ marginBottom: 'var(--sp-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Previous Crop</label>
                    <select className="form-select" value={addForm.previous_crop} onChange={e => setAddForm(f => ({...f, previous_crop: e.target.value}))}>
                      <option value="">— None —</option>
                      {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Crop</label>
                    <select className="form-select" value={addForm.current_crop} onChange={e => setAddForm(f => ({...f, current_crop: e.target.value}))}>
                      <option value="">— None —</option>
                      {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                      Saving...
                    </span>
                  ) : '🌾 Add Field'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
