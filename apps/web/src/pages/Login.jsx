import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
export default function Login() {
  const { login, register, loginWithGoogle, googleLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ phone: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return }
        await register(form.phone, form.password, form.name)
      } else {
        await login(form.phone, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try { await loginWithGoogle() } catch (err) { setError(err.message || 'Google login failed') }
  }

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left: Hero Image Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Agricultural hero image */}
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80"
          alt="Golden wheat field at sunset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary-container/80" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-white text-xl tracking-tight">Fasal.AI</h1>
              <p className="font-label text-[10px] text-white/60 uppercase tracking-[0.15em]">Smart Crop Advisory</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6 max-w-md">
            <h2 className="font-headline font-extrabold text-5xl text-white leading-tight tracking-tight">
              Cultivating<br />
              <span className="text-primary-fixed">Intelligence</span><br />
              for Every Acre
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              AI-powered crop advisory, yield prediction, and market intelligence — designed for the modern Indian farmer.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: 'query_stats', title: 'Yield Prediction', desc: 'ML-powered forecasting' },
              { icon: 'psychology', title: 'AI Advisory', desc: 'Smart crop recommendations' },
              { icon: 'trending_up', title: 'Market Prices', desc: 'Real-time mandi data' },
              { icon: 'shutter_speed', title: 'Disease Detection', desc: 'Image-based diagnosis' },
            ].map((f, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 hover:bg-white/15 transition-colors">
                <span className="material-symbols-outlined text-white/80 text-xl mb-2 block">{f.icon}</span>
                <h3 className="font-headline font-bold text-white text-sm">{f.title}</h3>
                <p className="font-label text-[11px] text-white/50 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="flex-1 lg:max-w-[520px] flex items-center justify-center p-6 md:p-12 bg-white relative">
        <div className="absolute top-4 right-4 z-10 hidden sm:block">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <div>
              <h1 className="font-headline font-extrabold text-primary text-xl tracking-tight">Fasal.AI</h1>
              <p className="font-label text-[10px] text-on-surface-variant/50 uppercase tracking-[0.15em]">Smart Crop Advisory</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
              {isRegister ? 'Create Account' : 'Welcome Back'} 👋
            </h2>
            <p className="text-sm text-on-surface-variant/60 mt-2 leading-relaxed">
              {isRegister
                ? 'Join Fasal.AI to access AI-powered crop advisory'
                : 'Login to your farm intelligence dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-error-container/30 text-on-error-container p-3.5 rounded-2xl text-sm mb-5 flex items-center gap-2.5 animate-fade-in">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              <span className="text-[13px]">{error}</span>
            </div>
          )}

          {/* Google Login */}
          <button
            id="google-login-btn"
            className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-low text-on-surface text-sm font-semibold flex items-center justify-center gap-3 hover:bg-surface-container transition-all disabled:opacity-50"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-surface-container-high" />
            <span className="font-label text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold">or</span>
            <span className="flex-1 h-px bg-surface-container-high" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="font-label text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                  className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-highest text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">Phone Number</label>
              <input
                id="phone-input"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
                required
                className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-highest text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">Password</label>
              <input
                id="password-input"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                className="w-full py-3.5 px-4 rounded-2xl bg-surface-container-highest text-on-surface text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all"
              />
            </div>

            <button
              id="submit-btn"
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary-container hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="spinner-sm !border-white/30 !border-t-white" />
                  Please wait...
                </>
              ) : isRegister ? (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Create Account
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-on-surface-variant/40">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              id="toggle-auth-mode"
              className="text-primary font-bold text-sm hover:underline"
              onClick={() => { setIsRegister(!isRegister); setError('') }}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex items-center justify-center gap-6">
            {[
              { icon: 'lock', label: 'Secured' },
              { icon: 'sync', label: 'Sync Ready' },
              { icon: 'verified_user', label: 'GDPR' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-1.5 text-on-surface-variant/30">
                <span className="material-symbols-outlined text-sm">{b.icon}</span>
                <span className="font-label text-[10px] font-bold uppercase tracking-wider">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
