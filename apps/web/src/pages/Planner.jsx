import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import AzureTranslate from '../components/AzureTranslate'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CROP_COLORS = {
  rice: '#006b47', wheat: '#a36a00', maize: '#825400', cotton: '#ba1a1a',
  chickpea: '#3c6842', lentil: '#643f00', mustard: '#825400', potato: '#6e7a71',
  sugarcane: '#005235', mungbean: '#006b47', fallow: '#bdcac0',
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight"><AzureTranslate text="Rotation Planner" /> 🌿</h1>
          <p className="font-label text-sm text-on-surface-variant/60 mt-1">{t('planner_description')} {year}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors">← {year - 1}</button>
          <button className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-md shadow-primary/20">{year}</button>
          <button className="px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-colors">{year + 1} →</button>
        </div>
      </div>

      {/* Season Legend */}
      <div className="bg-white rounded-2xl editorial-shadow p-4 flex flex-wrap gap-3 items-center">
        <span className="font-label text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest"><AzureTranslate text="Seasons" />:</span>
        <span className="smart-chip bg-secondary-container text-on-secondary-container">❄ Rabi (Nov-Mar)</span>
        <span className="smart-chip bg-primary/10 text-primary">🌧 Kharif (Jun-Oct)</span>
        <span className="smart-chip bg-tertiary-fixed text-on-tertiary-fixed-variant">☀ Zaid (Mar-Jun)</span>
        <div className="hidden md:flex ml-auto gap-3 flex-wrap">
          {Object.entries(CROP_COLORS).filter(([k]) => k !== 'fallow').map(([crop, color]) => (
            <span key={crop} className="flex items-center gap-1.5 font-label text-[10px] font-bold capitalize">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl editorial-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left p-3 md:p-4 font-label text-xs uppercase tracking-wider text-on-surface-variant/50 bg-surface-container-low w-32"><AzureTranslate text="Plot" /></th>
                {MONTHS.map(m => (
                  <th key={m} className="text-center p-2 md:p-3 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/50 bg-surface-container-low">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_ROTATIONS.map(row => (
                <tr key={row.plot} className="border-b border-surface-container-high/40 last:border-0">
                  <td className="p-3 md:p-4 font-headline font-bold text-sm text-on-surface"><AzureTranslate text={row.plot} /></td>
                  {MONTHS.map((_, mi) => {
                    const entry = row.entries.find(e => mi >= e.start && mi < e.end)
                    if (!entry) return <td key={mi} className="p-1" />
                    if (mi !== entry.start) return null
                    const span = entry.end - entry.start
                    const color = CROP_COLORS[entry.crop] || '#6e7a71'
                    return (
                      <td key={mi} colSpan={span} className="p-1">
                        <div
                          className="gantt-bar cursor-pointer hover:scale-[1.03] transition-transform min-h-[50px] flex-col"
                          style={{
                            background: entry.crop === 'fallow' ? '#f2f4f3' : `${color}15`,
                            color: entry.crop === 'fallow' ? '#6e7a71' : color,
                            border: `2px solid ${entry.crop === 'fallow' ? '#e6e9e8' : `${color}40`}`,
                          }}
                        >
                          <div className="font-headline font-bold text-xs capitalize"><AzureTranslate text={entry.crop} /></div>
                          {entry.season && <div className="font-label text-[9px] opacity-60 mt-0.5">{entry.season}</div>}
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
      <div className="bg-white rounded-2xl editorial-shadow p-5 md:p-6 flex gap-4 items-start">
        <div className="w-11 h-11 rounded-2xl bg-tertiary-fixed/30 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-tertiary">lightbulb</span>
        </div>
        <div>
          <h4 className="font-headline font-bold text-on-surface mb-2">{t('planner_rotationTips')}</h4>
          <ul className="space-y-1.5 font-label text-sm text-on-surface-variant/60 leading-relaxed list-disc pl-5">
            <li>{t('planner_tip1')}</li>
            <li>{t('planner_tip2')}</li>
            <li>{t('planner_tip3')}</li>
            <li>{t('planner_tip4')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
