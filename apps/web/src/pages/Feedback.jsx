import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { submitFeedback, getFeedbackHistory } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const FEEDBACK_AREAS = [
  { value: 'crop_recommendation', label: '🌱 Crop Recommendation', desc: 'AI-based crop advisory' },
  { value: 'yield_prediction', label: '🌾 Yield Prediction', desc: 'XGBoost yield model' },
  { value: 'market_prices', label: '📈 Market Prices', desc: 'Price trends & prediction' },
  { value: 'disease_detection', label: '🔬 Disease Detection', desc: 'Leaf image scanning' },
  { value: 'pest_alerts', label: '🐛 Pest Alerts', desc: 'Seasonal pest warnings' },
  { value: 'fertilizer', label: '🧪 Fertilizer & Remedies', desc: 'NPK recommendations' },
  { value: 'fields', label: '🗺️ My Fields', desc: 'Field management' },
  { value: 'planner', label: '📅 Rotation Planner', desc: 'Crop rotation planning' },
  { value: 'community', label: '💬 Community Chat', desc: 'Farmer community' },
  { value: 'chatbot', label: '🤖 AI Chatbot', desc: 'SmartCrop Assistant' },
  { value: 'profile', label: '👤 Profile & Account', desc: 'Account settings' },
  { value: 'general', label: '📝 General / Other', desc: 'Any other feedback' },
];

export default function Feedback() {
  const { t, language, speechCode } = useLanguage();
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const textareaRef = useRef(null);

  // Azure Speech-to-Text via shared hook
  const { isListening, isProcessing, isSupported, toggleListening, stopListening } = useSpeechRecognition({
    lang: speechCode || 'en-IN',
    onResult: (text) => setMessage(text),
  });

  // Load feedback history
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getFeedbackHistory(10);
      setHistory(data.feedback || []);
    } catch (err) {
      console.error('Failed to load feedback history:', err);
    }
    setHistoryLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!area) { setError('Please select an area'); return; }
    if (!message.trim()) { setError('Please write your feedback'); return; }

    if (isListening) stopListening();
    setSending(true);
    setError(null);
    setSuccess(false);
    try {
      await submitFeedback({ area, message: message.trim() });
      setSuccess(true);
      setMessage('');
      setArea('');
      await loadHistory();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    }
    setSending(false);
  };

  const selectedArea = FEEDBACK_AREAS.find(a => a.value === area);

  return (
    <div className="animate-fade-in feedback-page">
      <div className="feedback-layout">
        {/* Feedback Form */}
        <div className="card">
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #1565C0, #1E88E5)', color: 'white' }}>
            <h3 style={{ color: 'white' }}>📝 Submit Feedback</h3>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Help us improve</span>
          </div>
          <div className="card-body">
            {success && (
              <div className="feedback-success animate-fade-in-up">
                ✅ Thank you! Your feedback has been submitted successfully.
              </div>
            )}
            {error && (
              <div className="feedback-error">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Area Selection */}
              <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
                <label className="form-label">Which area is your feedback about? *</label>
                <div className="feedback-area-grid">
                  {FEEDBACK_AREAS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`feedback-area-btn ${area === opt.value ? 'selected' : ''}`}
                      onClick={() => { setArea(opt.value); setError(null); }}
                    >
                      <span className="feedback-area-icon">{opt.label.split(' ')[0]}</span>
                      <span className="feedback-area-label">{opt.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
                {selectedArea && (
                  <div className="feedback-area-desc animate-fade-in">
                    Selected: <strong>{selectedArea.label}</strong> — {selectedArea.desc}
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
                <label className="form-label">Your Feedback *</label>
                <div className="feedback-textarea-wrap">
                  <textarea
                    ref={textareaRef}
                    className="form-input feedback-textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe the issue or suggestion in detail..."
                    rows={5}
                    maxLength={2000}
                  />
                  <button
                    type="button"
                    className={`feedback-mic-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                    onClick={toggleListening}
                    title={isProcessing ? 'Processing...' : isListening ? 'Stop recording' : 'Speak to type'}
                    disabled={isProcessing}
                  >
                    {isProcessing ? '...' : isListening ? '⏹️' : '🎤'}
                  </button>
                </div>
                <div className="feedback-textarea-footer">
                  <span className="text-xs text-muted">{message.length}/2000 characters</span>
                  {(isListening || isProcessing) && (
                    <span className="feedback-listening-badge">
                      <span className="listening-dot"></span>
                      {isProcessing ? 'Processing speech...' : 'Recording...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sending || !user}>
                {sending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                    Submitting...
                  </span>
                ) : '📨 Submit Feedback'}
              </button>

              {!user && <div className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 'var(--sp-2)' }}>Please login to submit feedback</div>}
            </form>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="card">
          <div className="card-header">
            <h3>📋 Your Recent Feedback</h3>
            <span className="badge badge-blue">{history.length} entries</span>
          </div>
          <div className="card-body">
            {historyLoading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : history.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-6)' }}>
                <div className="empty-icon">📝</div>
                <h3>No feedback yet</h3>
                <p className="text-secondary">Submit your first feedback above</p>
              </div>
            ) : (
              <div className="feedback-history">
                {history.map((fb, i) => (
                  <div key={fb.id || i} className="feedback-history-item">
                    <div className="feedback-history-header">
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        {FEEDBACK_AREAS.find(a => a.value === fb.area)?.label || fb.area}
                      </span>
                      <span className="text-xs text-muted">
                        {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="feedback-history-text">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .feedback-page { max-width: 900px; margin: 0 auto; }
        .feedback-layout { display: grid; gap: var(--sp-6); }

        .feedback-area-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--sp-2); margin-top: var(--sp-2);
        }
        .feedback-area-btn {
          display: flex; align-items: center; gap: var(--sp-2);
          padding: 10px 14px; border: 2px solid var(--border-color, #e0e0e0);
          border-radius: var(--radius-md); background: var(--bg-primary, white);
          cursor: pointer; transition: all 0.2s; font-size: 0.82rem;
          color: var(--text-primary, #333); text-align: left;
        }
        .feedback-area-btn:hover { border-color: #43A047; background: var(--green-50, #E8F5E9); }
        .feedback-area-btn.selected {
          border-color: #43A047; background: var(--green-50, #E8F5E9);
          box-shadow: 0 0 0 1px #43A047;
        }
        .feedback-area-icon { font-size: 1.1rem; }
        .feedback-area-label { font-weight: 600; }
        .feedback-area-desc {
          margin-top: var(--sp-2); padding: var(--sp-2) var(--sp-3);
          background: var(--green-50, #E8F5E9); border-radius: var(--radius-md);
          font-size: 0.8rem; color: var(--green-700, #2E7D32);
        }

        .feedback-textarea-wrap { position: relative; }
        .feedback-textarea {
          width: 100%; resize: vertical; min-height: 120px;
          padding-right: 50px !important; font-family: inherit;
        }
        .feedback-mic-btn {
          position: absolute; right: 8px; top: 8px;
          width: 38px; height: 38px; border-radius: 50%;
          border: none; background: var(--bg-secondary, #f5f5f5);
          cursor: pointer; font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .feedback-mic-btn:hover { background: var(--green-50, #E8F5E9); }
        .feedback-mic-btn.listening {
          background: #EF5350; color: white;
          animation: pulse-mic 1.5s infinite;
        }
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 83, 80, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 83, 80, 0); }
        }
        .feedback-mic-btn.processing {
          background: #FF9800; color: white;
          animation: pulse-mic 1s infinite;
        }
        .feedback-mic-btn:disabled { opacity: 0.7; cursor: wait; }

        .feedback-textarea-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: var(--sp-1);
        }
        .feedback-listening-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.75rem; color: #EF5350; font-weight: 600;
        }
        .listening-dot {
          width: 8px; height: 8px; background: #EF5350;
          border-radius: 50%; animation: pulse 1s infinite;
        }

        .feedback-success {
          padding: var(--sp-3) var(--sp-4); background: #E8F5E9;
          border-radius: var(--radius-md); color: #2E7D32;
          margin-bottom: var(--sp-4); font-weight: 600; font-size: 0.9rem;
        }
        .feedback-error {
          padding: var(--sp-3) var(--sp-4); background: #FFEBEE;
          border-radius: var(--radius-md); color: #C62828;
          margin-bottom: var(--sp-4); font-size: 0.9rem;
        }

        .feedback-history { display: flex; flex-direction: column; gap: var(--sp-3); }
        .feedback-history-item {
          padding: var(--sp-3) var(--sp-4);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: var(--radius-md);
        }
        .feedback-history-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: var(--sp-2);
        }
        .feedback-history-text {
          font-size: 0.85rem; color: var(--text-secondary, #555);
          margin: 0; line-height: 1.5;
        }

        @media (max-width: 600px) {
          .feedback-area-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
