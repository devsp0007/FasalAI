import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LocationProvider, useLocation as useDetectedLocation } from './contexts/LocationContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import Chatbot from './components/Chatbot'
import Dashboard from './pages/Dashboard'
import Recommend from './pages/Recommend'
import Fields from './pages/Fields'
import Market from './pages/Market'
import Planner from './pages/Planner'
import Profile from './pages/Profile'
import YieldPredict from './pages/YieldPredict'
import DiseaseDetection from './pages/DiseaseDetection'
import PestAlerts from './pages/PestAlerts'
import Fertilizer from './pages/Fertilizer'
import Community from './pages/Community'
import Feedback from './pages/Feedback'
import Login from './pages/Login'

function Sidebar({ isOpen, onClose }) {
  const { t } = useLanguage()
  const { logout, user } = useAuth()
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose()
  }, [location.pathname])

  return (
    <>
      {/* Overlay backdrop for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🌾</div>
          <h1>{t('brand_title')}<span>{t('brand_subtitle')}</span></h1>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{t('nav_main')}</div>
          <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span> {t('nav_dashboard')}
          </NavLink>
          <NavLink to="/recommend" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🌱</span> {t('nav_cropAdvisory')}
          </NavLink>
          <NavLink to="/disease" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🔬</span> {t('nav_diseaseDetection') || 'Disease Detection'}
          </NavLink>
          <NavLink to="/pests" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🐛</span> {t('nav_pestAlerts') || 'Pest Alerts'}
          </NavLink>
          <NavLink to="/fields" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🗺️</span> {t('nav_myFields')}
          </NavLink>
          <NavLink to="/planner" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📅</span> {t('nav_rotationPlanner')}
          </NavLink>
          <NavLink to="/fertilizer" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🧪</span> {t('nav_fertilizer') || 'Fertilizer & Remedies'}
          </NavLink>

          <div className="sidebar-section-label">{t('nav_analytics')}</div>
          <NavLink to="/market" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📈</span> {t('nav_marketPrices')}
          </NavLink>
          <NavLink to="/yield" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🌾</span> {t('nav_yieldPrediction')}
          </NavLink>

          <div className="sidebar-section-label">{t('nav_community') || 'Community'}</div>
          <NavLink to="/community" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">💬</span> {t('nav_communityChat') || 'Community Chat'}
          </NavLink>
          <NavLink to="/feedback" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📝</span> {t('nav_feedback') || 'Feedback'}
          </NavLink>

          <div className="sidebar-section-label">{t('nav_account')}</div>
          <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👤</span> {t('nav_profile')}
          </NavLink>
          <button
            className="nav-item"
            onClick={logout}
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', color: 'inherit', font: 'inherit', padding: 'var(--sp-3) var(--sp-4)' }}
          >
            <span className="nav-icon">🚪</span> {t('nav_logout') || 'Logout'}
          </button>
        </nav>
      </aside>
    </>
  )
}

function BottomNav() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  // Close "More" drawer on route change
  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  return (
    <>
      {/* "More" slide-up drawer */}
      {moreOpen && <div className="more-drawer-overlay" onClick={() => setMoreOpen(false)} />}
      <div className={`more-drawer ${moreOpen ? 'open' : ''}`}>
        <div className="more-drawer-handle" onClick={() => setMoreOpen(false)}>
          <div className="more-drawer-handle-bar" />
        </div>
        <div className="more-drawer-grid">
          <NavLink to="/disease" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">🔬</span>
            <span className="more-drawer-label">{t('nav_diseaseDetection') || 'Disease Detection'}</span>
          </NavLink>
          <NavLink to="/pests" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">🐛</span>
            <span className="more-drawer-label">{t('nav_pestAlerts') || 'Pest Alerts'}</span>
          </NavLink>
          <NavLink to="/fields" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">🗺️</span>
            <span className="more-drawer-label">{t('nav_myFields') || 'My Fields'}</span>
          </NavLink>
          <NavLink to="/planner" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">📅</span>
            <span className="more-drawer-label">{t('nav_rotationPlanner') || 'Planner'}</span>
          </NavLink>
          <NavLink to="/fertilizer" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">🧪</span>
            <span className="more-drawer-label">{t('nav_fertilizer') || 'Fertilizer'}</span>
          </NavLink>
          <NavLink to="/yield" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">🌾</span>
            <span className="more-drawer-label">{t('nav_yieldPrediction') || 'Yield'}</span>
          </NavLink>
          <NavLink to="/community" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">💬</span>
            <span className="more-drawer-label">{t('nav_communityChat') || 'Community'}</span>
          </NavLink>
          <NavLink to="/feedback" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">📝</span>
            <span className="more-drawer-label">{t('nav_feedback') || 'Feedback'}</span>
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => `more-drawer-item ${isActive ? 'active' : ''}`}>
            <span className="more-drawer-icon">👤</span>
            <span className="more-drawer-label">{t('nav_profile') || 'Profile'}</span>
          </NavLink>
          <button className="more-drawer-item" onClick={logout}>
            <span className="more-drawer-icon">🚪</span>
            <span className="more-drawer-label">{t('nav_logout') || 'Logout'}</span>
          </button>
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink to="/" end className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span><span>{t('nav_home') || 'Home'}</span>
          </NavLink>
          <NavLink to="/recommend" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🌱</span><span>{t('nav_advisory') || 'Crops'}</span>
          </NavLink>
          <NavLink to="/market" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📈</span><span>{t('nav_market') || 'Market'}</span>
          </NavLink>
          <NavLink to="/disease" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🔬</span><span>{t('nav_disease') || 'Disease'}</span>
          </NavLink>
          <button
            className={`bottom-nav-item ${moreOpen ? 'active' : ''}`}
            onClick={() => setMoreOpen(prev => !prev)}
          >
            <span className="nav-icon">{moreOpen ? '✕' : '☰'}</span><span>{moreOpen ? (t('nav_close') || 'Close') : (t('nav_more') || 'More')}</span>
          </button>
        </div>
      </nav>
    </>
  )
}

function TopBar({ onMenuToggle }) {
  const location = useLocation()
  const { t } = useLanguage()
  const { user } = useAuth()
  // Use detected location for display
  let detectedLoc = null;
  try { detectedLoc = useDetectedLocation(); } catch(e) {}

  const PAGE_TITLES = {
    '/': t('nav_dashboard'),
    '/recommend': t('nav_cropAdvisory'),
    '/disease': t('nav_diseaseDetection') || 'Disease Detection',
    '/pests': t('nav_pestAlerts') || 'Pest Alerts',
    '/fields': t('nav_myFields'),
    '/planner': t('nav_rotationPlanner'),
    '/fertilizer': t('nav_fertilizer') || 'Fertilizer & Remedies',
    '/market': t('nav_marketPrices'),
    '/yield': t('nav_yieldPrediction'),
    '/community': t('nav_communityChat') || 'Community Chat',
    '/feedback': t('nav_feedback') || 'Feedback',
    '/profile': t('topbar_profileSettings'),
  }
  const title = PAGE_TITLES[location.pathname] || t('brand_title')
  const locationLabel = detectedLoc?.city && detectedLoc?.state
    ? `📍 ${detectedLoc.city}, ${detectedLoc.state}`
    : detectedLoc?.state ? `📍 ${detectedLoc.state}` : '';

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <div className="top-bar-title">{title}</div>
      </div>
      <div className="top-bar-actions">
        {locationLabel && (
          <span className="location-badge">{locationLabel}</span>
        )}
        {user && (
          <span className="top-bar-user">
            👤 {user.name || user.phone}
          </span>
        )}
        <button className="btn btn-sm btn-secondary">🔔</button>
        <LanguageSwitcher />
      </div>
    </header>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <TopBar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/pests" element={<PestAlerts />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/fertilizer" element={<Fertilizer />} />
            <Route path="/market" element={<Market />} />
            <Route path="/yield" element={<YieldPredict />} />
            <Route path="/community" element={<Community />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
      <BottomNav />
      <Chatbot />
    </div>
  )
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <LanguageProvider>
            <AppRouter />
          </LanguageProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
