import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ phone: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!form.name.trim()) {
          setError('Please enter your name')
          setLoading(false)
          return
        }
        await register(form.phone, form.password, form.name)
      } else {
        await login(form.phone, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Left Panel — Branding */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logo}>🌾</div>
            <h1 style={styles.brandTitle}>SmartCrop</h1>
            <p style={styles.brandSubtitle}>AI-Powered Crop Advisory</p>
            <div style={styles.features}>
              {[
                { icon: '🤖', text: 'AI Crop Recommendations' },
                { icon: '📈', text: 'Yield & Price Predictions' },
                { icon: '🔬', text: 'Disease Detection' },
                { icon: '🌍', text: 'State-Wise Advisory' },
              ].map((f, i) => (
                <div key={i} style={styles.featureRow}>
                  <span style={styles.featureIcon}>{f.icon}</span>
                  <span style={styles.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div style={styles.formPanel}>
          <div style={styles.formContent}>
            <h2 style={styles.formTitle}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={styles.formSubtitle}>
              {isRegister
                ? 'Register to start using SmartCrop advisory'
                : 'Login to access your crop advisory dashboard'}
            </p>

            {error && (
              <div style={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    id="name-input"
                    style={styles.input}
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    autoComplete="name"
                  />
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  id="phone-input"
                  style={styles.input}
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  autoComplete="tel"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <input
                  id="password-input"
                  style={styles.input}
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                />
              </div>

              <button
                id="submit-btn"
                type="submit"
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'wait' : 'pointer',
                }}
                disabled={loading}
              >
                {loading
                  ? '⏳ Please wait...'
                  : isRegister
                    ? '🌱 Create Account'
                    : '🔑 Login'}
              </button>
            </form>

            <div style={styles.switchRow}>
              <span style={styles.switchText}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                id="toggle-auth-mode"
                style={styles.switchBtn}
                onClick={() => { setIsRegister(!isRegister); setError('') }}
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0d2b0d 100%)',
    padding: '1rem',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: 900,
    minHeight: 540,
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  brandPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(160deg, #2d6a2e 0%, #1b4d1c 60%, #0f3310 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
  },
  brandContent: {
    textAlign: 'center',
    color: 'white',
  },
  logo: {
    fontSize: '3.5rem',
    marginBottom: '0.5rem',
    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
  },
  brandTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    marginBottom: '0.3rem',
  },
  brandSubtitle: {
    fontSize: '0.9rem',
    opacity: 0.8,
    marginBottom: '2rem',
  },
  features: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
  },
  featureIcon: {
    fontSize: '1.1rem',
  },
  featureText: {
    fontSize: '0.85rem',
    fontWeight: 500,
    opacity: 0.9,
  },
  formPanel: {
    flex: '1 1 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem',
    background: 'rgba(15,25,15,0.95)',
  },
  formContent: {
    width: '100%',
    maxWidth: 360,
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#e8f5e9',
    marginBottom: '0.3rem',
  },
  formSubtitle: {
    fontSize: '0.85rem',
    color: 'rgba(200,220,200,0.6)',
    marginBottom: '1.5rem',
    lineHeight: 1.4,
  },
  errorBox: {
    background: 'rgba(211,47,47,0.15)',
    border: '1px solid rgba(211,47,47,0.3)',
    color: '#ef9a9a',
    padding: '0.7rem 1rem',
    borderRadius: 10,
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
  inputGroup: {
    marginBottom: '1.1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'rgba(200,230,200,0.7)',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: '1px solid rgba(100,160,100,0.2)',
    background: 'rgba(30,50,30,0.6)',
    color: '#e8f5e9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  switchRow: {
    marginTop: '1.5rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
  },
  switchText: {
    fontSize: '0.85rem',
    color: 'rgba(200,220,200,0.5)',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#66bb6a',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
}
