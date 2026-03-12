import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Profile() {
  const { t } = useLanguage()
  const [profile, setProfile] = useState({
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    language: 'en',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    role: 'farmer',
  })

  const [notifications, setNotifications] = useState({
    push: true, sms: true, whatsapp: false,
    weather: true, sowing: true, market: true,
  })

  return (
    <div className="animate-fade-in">
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
              <h3>{profile.name}</h3>
              <p className="text-sm text-muted">{profile.phone}</p>
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile_fullName')}</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('profile_phone')}</label>
              <input className="form-input" value={profile.phone} disabled />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('profile_district')}</label>
                <input className="form-input" value={profile.district} onChange={e => setProfile(p => ({...p, district: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile_state')}</label>
                <input className="form-input" value={profile.state} onChange={e => setProfile(p => ({...p, state: e.target.value}))} />
              </div>
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
            <button className="btn btn-primary" style={{ width: '100%' }}>{t('profile_save')}</button>
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
                <button className="btn btn-sm" style={{ background: '#FFEBEE', color: '#C62828' }}>{t('profile_delete')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
