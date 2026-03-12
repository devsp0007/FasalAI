import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const DEMO_PLOTS = [
  { id: 1, label: 'South Field', area_ha: 1.5, irrigation: 'tubewell', soil: { N: 90, P: 42, K: 43, pH: 6.5 }, previous_crop: 'rice', lat: 25.3176, lng: 82.9739, status: 'active' },
  { id: 2, label: 'North Plot', area_ha: 0.8, irrigation: 'rainfed', soil: { N: 120, P: 35, K: 50, pH: 7.0 }, previous_crop: 'wheat', lat: 25.3280, lng: 82.9800, status: 'active' },
  { id: 3, label: 'Riverside Field', area_ha: 2.0, irrigation: 'canal', soil: { N: 70, P: 55, K: 38, pH: 6.2 }, previous_crop: 'maize', lat: 25.3100, lng: 82.9650, status: 'fallow' },
]

const SOIL_STATUS = (ph) => {
  if (ph >= 6.0 && ph <= 7.5) return { label: 'Good', color: 'badge-green' }
  if (ph >= 5.5 && ph <= 8.0) return { label: 'Moderate', color: 'badge-amber' }
  return { label: 'Poor', color: 'badge-red' }
}

export default function Fields() {
  const [selected, setSelected] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h2>{t('fields_title')}</h2>
          <p className="text-sm text-muted">{DEMO_PLOTS.length} plots registered · {DEMO_PLOTS.reduce((s,p) => s + p.area_ha, 0)} hectares total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>{t('fields_addField')}</button>
      </div>

      <div className="grid-3">
        {DEMO_PLOTS.map((plot) => (
          <div key={plot.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(selected?.id === plot.id ? null : plot)}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div>
                  <h3>{plot.label}</h3>
                  <span className={`badge ${plot.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{plot.status}</span>
                </div>
                <div style={{ fontSize: '1.5rem' }}>🗺️</div>
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
                  <div className="font-semibold" style={{ textTransform: 'capitalize' }}>{plot.previous_crop}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">{t('fields_soilHealth')}</div>
                  <span className={`badge ${SOIL_STATUS(plot.soil.pH).color}`}>{SOIL_STATUS(plot.soil.pH).label}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                    { label: 'Nitrogen (N)', value: selected.soil.N, max: 200, color: '#43A047' },
                    { label: 'Phosphorus (P)', value: selected.soil.P, max: 100, color: '#FF9800' },
                    { label: 'Potassium (K)', value: selected.soil.K, max: 100, color: '#1E88E5' },
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
                    <span className="font-bold">{selected.soil.pH}</span>
                    <span className={`badge ${SOIL_STATUS(selected.soil.pH).color}`} style={{ marginLeft: 8 }}>{SOIL_STATUS(selected.soil.pH).label}</span>
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
                      ['Previous Crop', selected.previous_crop],
                      ['Latitude', selected.lat],
                      ['Longitude', selected.lng],
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
    </div>
  )
}
