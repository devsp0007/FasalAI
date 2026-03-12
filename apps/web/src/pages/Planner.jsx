import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CROP_COLORS = {
  rice: '#43A047', wheat: '#FF9800', maize: '#FFC107', cotton: '#E91E63',
  chickpea: '#795548', lentil: '#9C27B0', mustard: '#CDDC39', potato: '#8D6E63',
  sugarcane: '#26A69A', mungbean: '#66BB6A', fallow: '#BDBDBD',
}

const DEMO_ROTATIONS = [
  { plot: 'South Field', entries: [
    { crop: 'wheat', start: 0, end: 3, season: 'rabi' },
    { crop: 'fallow', start: 3, end: 5, season: '' },
    { crop: 'rice', start: 5, end: 9, season: 'kharif' },
    { crop: 'chickpea', start: 9, end: 12, season: 'rabi' },
  ]},
  { plot: 'North Plot', entries: [
    { crop: 'mustard', start: 0, end: 3, season: 'rabi' },
    { crop: 'mungbean', start: 3, end: 5, season: 'zaid' },
    { crop: 'cotton', start: 5, end: 10, season: 'kharif' },
    { crop: 'fallow', start: 10, end: 12, season: '' },
  ]},
  { plot: 'Riverside Field', entries: [
    { crop: 'potato', start: 0, end: 3, season: 'rabi' },
    { crop: 'fallow', start: 3, end: 6, season: '' },
    { crop: 'maize', start: 6, end: 9, season: 'kharif' },
    { crop: 'lentil', start: 9, end: 12, season: 'rabi' },
  ]},
]

export default function Planner() {
  const [year] = useState(2026)
  const { t } = useLanguage()

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h2>{t('planner_title')}</h2>
          <p className="text-sm text-muted">{t('planner_description')} {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
          <button className="btn btn-secondary btn-sm">⬅ {year - 1}</button>
          <button className="btn btn-primary btn-sm">{year}</button>
          <button className="btn btn-secondary btn-sm">{year + 1} ➡</button>
        </div>
      </div>

      {/* Season Legend */}
      <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="card-body" style={{ padding: 'var(--sp-3) var(--sp-6)', display: 'flex', gap: 'var(--sp-6)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="text-sm font-semibold">Seasons:</span>
          <span className="badge badge-blue">❄ Rabi (Nov-Mar)</span>
          <span className="badge badge-green">🌧 Kharif (Jun-Oct)</span>
          <span className="badge badge-amber">☀ Zaid (Mar-Jun)</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {Object.entries(CROP_COLORS).filter(([k]) => k !== 'fallow').map(([crop, color]) => (
              <span key={crop} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: color }}></span>
                {crop}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        <div className="card-body" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', width: 140, borderBottom: '2px solid var(--border-color)' }}>
                  Plot
                </th>
                {MONTHS.map(m => (
                  <th key={m} style={{ padding: '10px 4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', fontWeight: 600 }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_ROTATIONS.map((row) => (
                <tr key={row.plot} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.85rem' }}>
                    {row.plot}
                  </td>
                  {MONTHS.map((_, mi) => {
                    const entry = row.entries.find(e => mi >= e.start && mi < e.end)
                    if (!entry) return <td key={mi} style={{ padding: 4 }}></td>
                    if (mi !== entry.start) return null
                    const span = entry.end - entry.start
                    const color = CROP_COLORS[entry.crop] || '#9E9E9E'
                    return (
                      <td key={mi} colSpan={span} style={{ padding: 4 }}>
                        <div style={{
                          background: entry.crop === 'fallow' ? '#F5F5F5' : `${color}15`,
                          border: `2px solid ${entry.crop === 'fallow' ? '#E0E0E0' : color}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 12px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          minHeight: 50,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: entry.crop === 'fallow' ? '#9E9E9E' : color, textTransform: 'capitalize' }}>
                            {entry.crop}
                          </div>
                          {entry.season && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{entry.season}</div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 'var(--sp-4)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '1.5rem' }}>💡</div>
          <div>
            <h4>{t('planner_rotationTips')}</h4>
            <ul style={{ marginTop: 'var(--sp-2)', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: 'var(--sp-5)' }}>
              <li>{t('planner_tip1')}</li>
              <li>{t('planner_tip2')}</li>
              <li>{t('planner_tip3')}</li>
              <li>{t('planner_tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
