import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { recommendFertilizer, getOrganicRemedies, getFertilizerMetadata } from '../services/api';

export default function Fertilizer() {
  const { t } = useLanguage();
  const { state: detectedState } = useLocation();
  const [activeTab, setActiveTab] = useState('market');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);

  // Market Fertilizer form
  const [mForm, setMForm] = useState({
    temperature: 25, moisture: 50, rainfall: 100, ph: 6.5,
    nitrogen: 50, phosphorous: 50, potassium: 50, carbon: 1.0,
    soil: 'Loamy', crop: 'Rice',
  });
  const [mResult, setMResult] = useState(null);

  // Organic form
  const [oForm, setOForm] = useState({ nitrogen: 40, phosphorous: 25, potassium: 25 });
  const [oResult, setOResult] = useState(null);

  useEffect(() => {
    getFertilizerMetadata().then(setMetadata).catch(() => {});
  }, []);

  async function handleMarketSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await recommendFertilizer(mForm);
      setMResult(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleOrganicSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getOrganicRemedies(oForm);
      setOResult(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  const soilTypes = metadata?.soil_types || ['Loamy', 'Sandy', 'Clayey', 'Red', 'Black'];
  const cropTypes = metadata?.crop_types || ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];

  return (
    <div className="fertilizer-page">
      <div className="page-header">
        <h1>{t('fert_title') || '🧪 Fertilizer & Remedies'}</h1>
        <p>{t('fert_subtitle') || 'Get AI-powered fertilizer recommendations or organic remedies'}</p>
      </div>

      {/* Tabs */}
      <div className="fert-tabs">
        <button className={`tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
          🏭 {t('fert_marketTab') || 'Market Fertilizer'}
        </button>
        <button className={`tab ${activeTab === 'organic' ? 'active' : ''}`} onClick={() => setActiveTab('organic')}>
          🌿 {t('fert_organicTab') || 'Organic Remedies'}
        </button>
      </div>

      {/* Market Fertilizer Tab */}
      {activeTab === 'market' && (
        <div className="tab-content">
          <form onSubmit={handleMarketSubmit} className="fert-form">
            <div className="form-grid">
              <div className="input-group">
                <label>{t('fert_soil') || 'Soil Type'}</label>
                <select value={mForm.soil} onChange={e => setMForm({ ...mForm, soil: e.target.value })}>
                  {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>{t('fert_crop') || 'Crop'}</label>
                <select value={mForm.crop} onChange={e => setMForm({ ...mForm, crop: e.target.value })}>
                  {cropTypes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>{t('rec_nitrogen') || 'Nitrogen (N)'}</label>
                <input type="number" value={mForm.nitrogen} onChange={e => setMForm({ ...mForm, nitrogen: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('rec_phosphorus') || 'Phosphorus (P)'}</label>
                <input type="number" value={mForm.phosphorous} onChange={e => setMForm({ ...mForm, phosphorous: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('rec_potassium') || 'Potassium (K)'}</label>
                <input type="number" value={mForm.potassium} onChange={e => setMForm({ ...mForm, potassium: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('rec_soilPh') || 'Soil pH'}</label>
                <input type="number" step="0.1" value={mForm.ph} onChange={e => setMForm({ ...mForm, ph: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('rec_temperature') || 'Temperature (°C)'}</label>
                <input type="number" value={mForm.temperature} onChange={e => setMForm({ ...mForm, temperature: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('fert_moisture') || 'Moisture (%)'}</label>
                <input type="number" value={mForm.moisture} onChange={e => setMForm({ ...mForm, moisture: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('rec_rainfall') || 'Rainfall (mm)'}</label>
                <input type="number" value={mForm.rainfall} onChange={e => setMForm({ ...mForm, rainfall: +e.target.value })} />
              </div>
              <div className="input-group">
                <label>{t('fert_carbon') || 'Carbon'}</label>
                <input type="number" step="0.1" value={mForm.carbon} onChange={e => setMForm({ ...mForm, carbon: +e.target.value })} />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🏭 ' + (t('fert_getRecommendation') || 'Get Fertilizer Recommendation')}
            </button>
          </form>

          {mResult && mResult.recommendations && (
            <div className="fert-results">
              <h3>{t('fert_results') || '🎯 Recommended Fertilizers'}</h3>
              <div className="fert-cards">
                {mResult.recommendations.map((rec, i) => (
                  <div key={i} className={`fert-result-card rank-${i + 1}`}>
                    <div className="rank-badge">#{i + 1}</div>
                    <div className="fert-name">{rec.fertilizer}</div>
                    <div className="fert-confidence">
                      <div className="conf-bar">
                        <div className="conf-fill" style={{ width: `${rec.confidence}%` }}></div>
                      </div>
                      <span>{rec.confidence}%</span>
                    </div>
                    {rec.reason && <div className="fert-reason">{rec.reason}</div>}
                  </div>
                ))}
              </div>
              <div className="model-info">
                {t('fert_model') || 'Model'}: {mResult.model_used || 'N/A'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Organic Remedies Tab */}
      {activeTab === 'organic' && (
        <div className="tab-content">
          <div className="organic-info">
            <p>{t('fert_organicDesc') || 'Enter your soil NPK values to find organic alternatives for nutrient deficiencies.'}</p>
          </div>
          <form onSubmit={handleOrganicSubmit} className="fert-form">
            <div className="form-grid three-col">
              <div className="input-group">
                <label>{t('rec_nitrogen') || 'Nitrogen (N)'}</label>
                <input type="number" value={oForm.nitrogen} onChange={e => setOForm({ ...oForm, nitrogen: +e.target.value })} />
                <small>{t('fert_threshold') || 'Low if'} &lt; 50</small>
              </div>
              <div className="input-group">
                <label>{t('rec_phosphorus') || 'Phosphorus (P)'}</label>
                <input type="number" value={oForm.phosphorous} onChange={e => setOForm({ ...oForm, phosphorous: +e.target.value })} />
                <small>{t('fert_threshold') || 'Low if'} &lt; 30</small>
              </div>
              <div className="input-group">
                <label>{t('rec_potassium') || 'Potassium (K)'}</label>
                <input type="number" value={oForm.potassium} onChange={e => setOForm({ ...oForm, potassium: +e.target.value })} />
                <small>{t('fert_threshold') || 'Low if'} &lt; 30</small>
              </div>
            </div>
            <button type="submit" className="submit-btn organic-btn" disabled={loading}>
              {loading ? '⏳ Checking...' : '🌿 ' + (t('fert_findRemedies') || 'Find Organic Remedies')}
            </button>
          </form>

          {oResult && (
            <div className="organic-results">
              {oResult.all_nutrients_ok ? (
                <div className="all-ok-banner">
                  <span className="ok-icon">✅</span>
                  <span>{oResult.message}</span>
                </div>
              ) : (
                <>
                  <div className="deficiency-alert">{oResult.message}</div>
                  {oResult.deficiencies.map((def, di) => (
                    <div key={di} className="deficiency-section">
                      <div className="def-header">
                        <span className="def-nutrient">{def.nutrient}</span>
                        <span className="def-status">{def.status} (Current: {def.current_value})</span>
                      </div>
                      <div className="remedy-cards">
                        {def.recommendations.map((rem, ri) => (
                          <div key={ri} className="remedy-card">
                            <div className="remedy-name">{rem.name}</div>
                            <div className="remedy-meta">
                              <span className="remedy-type">{rem.type}</span>
                              <span className="remedy-cost">{rem.cost_indicator}</span>
                            </div>
                            <div className="remedy-why">{rem.why}</div>
                            {rem.prep_or_mode && (
                              <div className="remedy-prep">
                                <strong>{t('fert_howToUse') || 'How to use'}:</strong> {rem.prep_or_mode}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .fertilizer-page { max-width: 900px; margin: 0 auto; padding: 1rem; }
        .page-header { margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.6rem; color: var(--text-primary, #1a1a2e); margin: 0; }
        .page-header p { color: var(--text-secondary, #666); margin: 0.25rem 0 0; font-size: 0.9rem; }

        .fert-tabs {
          display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
          background: var(--bg-secondary, #f5f5f5); padding: 0.35rem; border-radius: 12px;
        }
        .tab {
          flex: 1; padding: 0.7rem 1rem; border: none; border-radius: 10px;
          font-weight: 600; font-size: 0.9rem; cursor: pointer;
          background: transparent; color: var(--text-secondary, #666);
          transition: all 0.2s;
        }
        .tab.active {
          background: var(--bg-card, white); color: var(--text-primary, #222);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .tab:hover:not(.active) { background: rgba(0,0,0,0.05); }

        .form-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.75rem; margin-bottom: 1rem;
        }
        .form-grid.three-col { grid-template-columns: repeat(3, 1fr); }
        .input-group label { display: block; font-weight: 600; font-size: 0.8rem; color: var(--text-secondary, #555); margin-bottom: 0.25rem; }
        .input-group input, .input-group select {
          width: 100%; padding: 0.55rem 0.7rem; border: 1px solid var(--border, #ddd);
          border-radius: 8px; font-size: 0.9rem; background: var(--bg-card, white);
          color: var(--text-primary, #333);
        }
        .input-group small { font-size: 0.7rem; color: var(--text-secondary, #999); }

        .submit-btn {
          width: 100%; padding: 0.75rem; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #1B5E20, #43A047); color: white;
          font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(27,94,32,0.3); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .organic-btn { background: linear-gradient(135deg, #33691E, #689F38); }

        .fert-results { margin-top: 1.5rem; }
        .fert-results h3 { margin: 0 0 1rem; font-size: 1.1rem; }
        .fert-cards { display: flex; flex-direction: column; gap: 0.75rem; }
        .fert-result-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem; border-radius: 12px;
          background: var(--bg-card, white); border: 1px solid var(--border, #eee);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .fert-result-card.rank-1 { border-left: 4px solid #2E7D32; }
        .fert-result-card.rank-2 { border-left: 4px solid #F57C00; }
        .fert-result-card.rank-3 { border-left: 4px solid #1976D2; }
        .rank-badge {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8rem;
          background: #E8F5E9; color: #2E7D32; flex-shrink: 0;
        }
        .fert-name { font-weight: 700; font-size: 1rem; flex: 1; color: var(--text-primary, #222); }
        .fert-confidence { display: flex; align-items: center; gap: 0.5rem; min-width: 120px; }
        .conf-bar { flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; }
        .conf-fill { height: 100%; background: linear-gradient(90deg, #43A047, #66BB6A); border-radius: 3px; transition: width 0.5s; }
        .fert-reason { font-size: 0.8rem; color: var(--text-secondary, #777); margin-top: 0.25rem; }
        .model-info { margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary, #999); }

        .organic-info { background: #F1F8E9; padding: 1rem; border-radius: 10px; margin-bottom: 1.25rem; }
        .organic-info p { margin: 0; font-size: 0.9rem; color: #33691E; }

        .all-ok-banner {
          display: flex; align-items: center; gap: 0.75rem;
          background: #E8F5E9; padding: 1.25rem; border-radius: 12px;
          font-weight: 600; color: #2E7D32; margin-top: 1.5rem;
        }
        .ok-icon { font-size: 1.5rem; }
        .deficiency-alert {
          background: #FFF3E0; color: #E65100; padding: 0.75rem 1rem;
          border-radius: 10px; font-weight: 600; margin: 1.25rem 0 1rem; font-size: 0.9rem;
        }
        .deficiency-section { margin-bottom: 1.5rem; }
        .def-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border, #eee);
        }
        .def-nutrient { font-weight: 700; font-size: 1rem; color: var(--text-primary, #222); }
        .def-status { font-size: 0.8rem; color: #D32F2F; font-weight: 600; }
        .remedy-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.75rem; }
        .remedy-card {
          background: var(--bg-card, white); border: 1px solid var(--border, #eee);
          border-radius: 10px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .remedy-name { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.35rem; color: var(--text-primary, #222); }
        .remedy-meta { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .remedy-type, .remedy-cost {
          font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 12px;
          background: #E8F5E9; color: #2E7D32; font-weight: 600;
        }
        .remedy-cost { background: #FFF8E1; color: #F57F17; }
        .remedy-why { font-size: 0.82rem; color: var(--text-secondary, #555); line-height: 1.4; margin-bottom: 0.4rem; }
        .remedy-prep { font-size: 0.8rem; color: var(--text-secondary, #666); background: var(--bg-secondary, #f9f9f9); padding: 0.5rem 0.75rem; border-radius: 6px; }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr 1fr; }
          .form-grid.three-col { grid-template-columns: 1fr; }
          .fert-result-card { flex-wrap: wrap; }
          .fert-confidence { width: 100%; }
          .remedy-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
