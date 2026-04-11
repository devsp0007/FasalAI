import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { getPestAlerts, getPestStates } from '../services/api';

export default function PestAlerts() {
  const { t } = useLanguage();
  const { state: detectedState } = useLocation();
  const [state, setState] = useState(detectedState || '');
  const [season, setSeason] = useState('');
  const [pestData, setPestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [expandedCrop, setExpandedCrop] = useState(null);

  useEffect(() => {
    getPestStates().then(d => setAvailableStates(d.states || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (detectedState && !state) setState(detectedState);
  }, [detectedState]);

  useEffect(() => {
    if (state) fetchPestAlerts();
  }, [state, season]);

  async function fetchPestAlerts() {
    setLoading(true);
    try {
      const data = await getPestAlerts(state, season);
      setPestData(data);
    } catch (err) {
      console.error('Pest fetch error:', err);
    }
    setLoading(false);
  }

  const seasonInfo = pestData?.season_info || {};
  const crops = pestData?.crops || [];

  return (
    <div className="pest-alerts-page">
      <div className="page-header">
        <h1>{t('pest_title') || '🐛 Pest Alerts'}</h1>
        <p>{t('pest_subtitle') || 'Season-aware pest alerts for your region'}</p>
      </div>

      {/* Season Banner */}
      <div className="season-banner">
        <div className="season-icon">
          {seasonInfo.icon === 'rain' ? '🌧' : seasonInfo.icon === 'snow' ? '❄' : '☀'}
        </div>
        <div className="season-details">
          <span className="season-name">{seasonInfo.name || 'Current Season'}</span>
          <span className="season-period">{seasonInfo.period || ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="pest-filters">
        <div className="filter-group">
          <label>{t('pest_selectState') || 'State'}</label>
          <select value={state} onChange={e => setState(e.target.value)}>
            <option value="">{t('pest_chooseState') || '-- Select State --'}</option>
            {availableStates.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{t('pest_selectSeason') || 'Season'}</label>
          <select value={season} onChange={e => setSeason(e.target.value)}>
            <option value="">{t('pest_autoSeason') || 'Auto (Current)'}</option>
            <option value="kharif">🌧 Kharif (Jun-Oct)</option>
            <option value="rabi">❄ Rabi (Nov-Mar)</option>
            <option value="zaid">☀ Zaid (Mar-Jun)</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading-state">Loading pest alerts...</div>}

      {!loading && crops.length === 0 && state && (
        <div className="empty-state">
          <div className="empty-icon">🐛</div>
          <h3>{t('pest_noData') || 'No pest data available'}</h3>
          <p>{t('pest_noDataDesc') || 'No pest alerts found for this state and season combination.'}</p>
        </div>
      )}

      {!loading && crops.length > 0 && (
        <>
          <div className="pest-summary">
            <span className="summary-badge">{crops.length} {t('pest_cropsAt') || 'crops at risk'}</span>
            <span className="summary-info">{state} · {seasonInfo.name}</span>
          </div>
          <div className="pest-grid">
            {crops.map((crop, idx) => (
              <div
                key={idx}
                className={`pest-card ${expandedCrop === idx ? 'expanded' : ''}`}
                onClick={() => setExpandedCrop(expandedCrop === idx ? null : idx)}
              >
                <div className="pest-card-header">
                  <div className="crop-info">
                    <span className="crop-name">{crop.common_name || crop.crop}</span>
                    {crop.note && <span className="crop-note">{crop.note}</span>}
                  </div>
                  <div className="pest-count-badge">{crop.pest_count} {t('pest_pests') || 'pests'}</div>
                </div>

                {(expandedCrop === idx || crop.top_pests.length <= 3) && (
                  <div className="pest-list">
                    {crop.top_pests.map((pest, pidx) => (
                      <div key={pidx} className="pest-item">
                        <div className="pest-name">
                          <span className="pest-dot" style={{ background: pidx === 0 ? '#D32F2F' : pidx === 1 ? '#F57C00' : '#FBC02D' }}></span>
                          {pest.pest}
                        </div>
                        <div className="pest-symptoms">
                          <strong>{t('pest_symptoms') || 'Symptoms'}:</strong> {pest.symptoms}
                        </div>
                        <div className="pest-response">
                          <strong>{t('pest_firstResponse') || 'Action'}:</strong> {pest.first_response}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {crop.top_pests.length > 3 && expandedCrop !== idx && (
                  <div className="pest-expand-hint">
                    {t('pest_clickExpand') || 'Click to see all pests →'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .pest-alerts-page { max-width: 900px; margin: 0 auto; padding: 1rem; }
        .page-header { margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.6rem; color: var(--text-primary, #1a1a2e); margin: 0; }
        .page-header p { color: var(--text-secondary, #666); margin: 0.25rem 0 0; font-size: 0.9rem; }

        .season-banner {
          display: flex; align-items: center; gap: 1rem;
          background: linear-gradient(135deg, #1B5E20, #388E3C);
          color: white; padding: 1rem 1.25rem; border-radius: 12px;
          margin-bottom: 1.25rem; box-shadow: 0 2px 8px rgba(27,94,32,0.3);
        }
        .season-icon { font-size: 2rem; }
        .season-name { font-size: 1.1rem; font-weight: 700; display: block; }
        .season-period { font-size: 0.85rem; opacity: 0.85; }

        .pest-filters {
          display: flex; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .filter-group { flex: 1; min-width: 200px; }
        .filter-group label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.85rem; color: var(--text-secondary, #555); }
        .filter-group select {
          width: 100%; padding: 0.6rem 0.75rem; border-radius: 8px;
          border: 1px solid var(--border, #ddd); font-size: 0.9rem;
          background: var(--bg-card, white); color: var(--text-primary, #333);
          cursor: pointer;
        }

        .pest-summary {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1rem; font-size: 0.9rem;
        }
        .summary-badge {
          background: #FFF3E0; color: #E65100; padding: 0.3rem 0.75rem;
          border-radius: 20px; font-weight: 600; font-size: 0.8rem;
        }
        .summary-info { color: var(--text-secondary, #777); }

        .pest-grid { display: flex; flex-direction: column; gap: 0.75rem; }
        .pest-card {
          background: var(--bg-card, white); border-radius: 12px;
          border: 1px solid var(--border, #eee); overflow: hidden;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .pest-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .pest-card-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 1.25rem; background: var(--bg-secondary, #fafafa);
        }
        .crop-name { font-weight: 700; font-size: 1rem; color: var(--text-primary, #222); }
        .crop-note { display: block; font-size: 0.75rem; color: var(--text-secondary, #888); margin-top: 0.15rem; }
        .pest-count-badge {
          background: #FFEBEE; color: #C62828; padding: 0.25rem 0.65rem;
          border-radius: 16px; font-weight: 600; font-size: 0.75rem; white-space: nowrap;
        }

        .pest-list { padding: 0 1.25rem 1rem; }
        .pest-item {
          padding: 0.75rem 0; border-bottom: 1px solid var(--border, #f0f0f0);
        }
        .pest-item:last-child { border-bottom: none; }
        .pest-name { font-weight: 600; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem; }
        .pest-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .pest-symptoms, .pest-response { font-size: 0.82rem; color: var(--text-secondary, #555); margin-top: 0.25rem; line-height: 1.4; }
        .pest-symptoms strong, .pest-response strong { color: var(--text-primary, #333); }
        .pest-expand-hint { padding: 0.5rem 1.25rem 0.75rem; color: var(--accent, #2E7D32); font-size: 0.8rem; }

        .loading-state, .empty-state {
          text-align: center; padding: 3rem 1rem; color: var(--text-secondary, #888);
        }
        .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }

        @media (max-width: 600px) {
          .pest-filters { flex-direction: column; }
          .pest-card-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}
