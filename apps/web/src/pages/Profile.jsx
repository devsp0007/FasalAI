import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { getProfile, saveProfile, deleteProfile } from '../services/api'

export default function Profile() {
  const { t } = useLanguage()
  const { user, logout, updateUserName } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    language: 'en',
    district: '',
    state: '',
    role: 'farmer',
    farm_size: '',
    crops_grown: '',
  })

  const [notifications, setNotifications] = useState({
    push: true, sms: true, whatsapp: false,
    weather: true, sowing: true, market: true,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState({ text: '', type: '' })

  // Load profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getProfile()
      if (data.profile) {
        const p = data.profile
        setProfile({
          name: p.name || user?.name || '',
          phone: p.phone || user?.phone || '',
          language: p.language || 'en',
          district: p.district || '',
          state: p.state || '',
          role: p.role || 'farmer',
          farm_size: p.farm_size || '',
          crops_grown: Array.isArray(p.crops_grown) ? p.crops_grown.join(', ') : '',
        })
        if (p.notifications && typeof p.notifications === 'object') {
          setNotifications(prev => ({ ...prev, ...p.notifications }))
        }
      } else {
        // No saved profile, use auth user data
        setProfile(prev => ({
          ...prev,
          name: user?.name || '',
          phone: user?.phone || '',
        }))
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setProfile(prev => ({
        ...prev,
        name: user?.name || '',
        phone: user?.phone || '',
      }))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg({ text: '', type: '' })
    try {
      const payload = {
        name: profile.name,
        district: profile.district,
        state: profile.state,
        language: profile.language,
        role: profile.role,
        farm_size: profile.farm_size ? parseFloat(profile.farm_size) : null,
        crops_grown: profile.crops_grown
          ? profile.crops_grown.split(',').map(c => c.trim()).filter(Boolean)
          : [],
        notifications,
      }
      await saveProfile(payload)
      updateUserName(profile.name)
      setSaveMsg({ text: '✅ Profile saved successfully!', type: 'success' })
      setTimeout(() => setSaveMsg({ text: '', type: '' }), 3000)
    } catch (err) {
      setSaveMsg({ text: `❌ ${err.message}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      await deleteProfile()
      logout()
      navigate('/login')
    } catch (err) {
      setSaveMsg({ text: `❌ ${err.message}`, type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Save feedback banner */}
      {saveMsg.text && (
        <div style={{
          padding: 'var(--sp-3) var(--sp-4)',
          marginBottom: 'var(--sp-4)',
          borderRadius: 'var(--radius-md)',
          background: saveMsg.type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(211,47,47,0.1)',
          border: `1px solid ${saveMsg.type === 'success' ? 'rgba(76,175,80,0.3)' : 'rgba(211,47,47,0.3)'}`,
          color: saveMsg.type === 'success' ? 'var(--green-600)' : '#d32f2f',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'opacity 0.3s',
        }}>
          {saveMsg.text}
        </div>
      )}

      <div className="grid-2" style={{ gap: 'var(--sp-6)' }}>
        {/* Profile Info */}
        <div className="card">
          <div className="card-header">
            <h3>{t('profile_title')}</h3>
            <span className={`badge badge-green`}>{profile.role}</span>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--green-400), var(--green-700))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: 'white', margin: '0 auto var(--sp-3)',
              }}>🧑‍🌾</div>
              <h3>{profile.name || 'Your Name'}</h3>
              <p className="text-sm text-muted">{profile.phone}</p>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile_fullName')}</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile_phone')}</label>
              <input className="form-input" value={profile.phone} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('profile_district')}</label>
                <input className="form-input" value={profile.district} onChange={e => setProfile(p => ({...p, district: e.target.value}))} placeholder="e.g. Varanasi" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile_state')}</label>
                <input className="form-input" value={profile.state} onChange={e => setProfile(p => ({...p, state: e.target.value}))} placeholder="e.g. Uttar Pradesh" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Farm Size (acres)</label>
                <input className="form-input" type="number" step="0.1" min="0" value={profile.farm_size} onChange={e => setProfile(p => ({...p, farm_size: e.target.value}))} placeholder="e.g. 5.5" />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={profile.role} onChange={e => setProfile(p => ({...p, role: e.target.value}))}>
                  <option value="farmer">Farmer</option>
                  <option value="advisor">Agricultural Advisor</option>
                  <option value="researcher">Researcher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Crops Grown (comma separated)</label>
              <input className="form-input" value={profile.crops_grown} onChange={e => setProfile(p => ({...p, crops_grown: e.target.value}))} placeholder="e.g. Wheat, Rice, Sugarcane" />
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile_language')}</label>
              <select className="form-select" value={profile.language} onChange={e => setProfile(p => ({...p, language: e.target.value}))}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', opacity: saving ? 0.7 : 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : `💾 ${t('profile_save')}`}
            </button>
          </div>
        </div>

        {/* Notifications & Settings */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="card-header">
              <h3>{t('profile_notifications')}</h3>
            </div>
            <div className="card-body">
              <h4 style={{ marginBottom: 'var(--sp-3)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Channels</h4>
              {[
                { key: 'push', label: '📱 Push Notifications' },
                { key: 'sms', label: '💬 SMS Notifications' },
                { key: 'whatsapp', label: '📲 WhatsApp Messages' },
              ].map(ch => (
                <label key={ch.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{ch.label}</span>
                  <div onClick={() => setNotifications(n => ({...n, [ch.key]: !n[ch.key]}))}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: notifications[ch.key] ? 'var(--green-500)' : 'var(--gray-300)',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: notifications[ch.key] ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)',
                    }}></div>
                  </div>
                </label>
              ))}

              <h4 style={{ marginTop: 'var(--sp-5)', marginBottom: 'var(--sp-3)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Alert Types</h4>
              {[
                { key: 'weather', label: '🌧 Weather Alerts' },
                { key: 'sowing', label: '🌱 Sowing Reminders' },
                { key: 'market', label: '📈 Market Price Alerts' },
              ].map(ch => (
                <label key={ch.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--sp-3) 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{ch.label}</span>
                  <div onClick={() => setNotifications(n => ({...n, [ch.key]: !n[ch.key]}))}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: notifications[ch.key] ? 'var(--green-500)' : 'var(--gray-300)',
                      position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: notifications[ch.key] ? 23 : 3,
                      transition: 'left 0.2s', boxShadow: 'var(--shadow-sm)',
                    }}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="card-header">
              <h3>🔬 Disease Detection</h3>
              <span className="badge badge-green">AI</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--sp-3)' }}>
                Upload a leaf image to detect diseases in your crops. Our AI model supports:
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-4)' }}>
                <span className="badge" style={{ background: '#FFF8E1', color: '#E65100' }}>🥔 Potato</span>
                <span className="badge" style={{ background: '#FFF8E1', color: '#E65100' }}>🌽 Corn</span>
                <span className="badge" style={{ background: '#FFF8E1', color: '#E65100' }}>🌾 Rice</span>
                <span className="badge" style={{ background: '#FFF8E1', color: '#E65100' }}>🎋 Sugarcane</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/disease')}>
                🔬 Go to Disease Detection
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>{t('profile_about')}</h3>
            </div>
            <div className="card-body">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: 'var(--sp-3)' }}><strong>{t('profile_aboutTitle')}</strong> — SIH 2025 (Problem ID: SIH25010)</p>
                <p style={{ marginBottom: 'var(--sp-2)' }}>{t('profile_aboutDesc')}</p>
                <p style={{ marginBottom: 'var(--sp-2)' }}>{t('profile_version')}</p>
                <p>{t('profile_poweredBy')}</p>
              </div>
              <div style={{ marginTop: 'var(--sp-4)', display: 'flex', gap: 'var(--sp-2)' }}>
                <button className="btn btn-secondary btn-sm">{t('profile_export')}</button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#FFEBEE', color: '#C62828' }}
                  onClick={handleDelete}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
