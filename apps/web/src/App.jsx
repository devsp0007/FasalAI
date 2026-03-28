import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import Login from './pages/Login'

function Sidebar() {
  const { t } = useLanguage()
  const { logout, user } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🌾</div>
        <h1>{t('brand_title')}<span>{t('brand_subtitle')}</span></h1>
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
          <span className="nav-icon">🔬</span> Disease Detection
        </NavLink>
        <NavLink to="/fields" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🗺️</span> {t('nav_myFields')}
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📅</span> {t('nav_rotationPlanner')}
        </NavLink>

        <div className="sidebar-section-label">{t('nav_analytics')}</div>
        <NavLink to="/market" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📈</span> {t('nav_marketPrices')}
        </NavLink>
        <NavLink to="/yield" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🌾</span> {t('nav_yieldPrediction')}
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
          <span className="nav-icon">🚪</span> Logout
        </button>
      </nav>
    </aside>
  )
}

function BottomNav() {
  const { t } = useLanguage()

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink to="/" end className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>{t('nav_home')}
        </NavLink>
        <NavLink to="/recommend" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🌱</span>{t('nav_advisory')}
        </NavLink>
        <NavLink to="/disease" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🔬</span>Disease
        </NavLink>
        <NavLink to="/market" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📈</span>{t('nav_market')}
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>{t('nav_profile')}
        </NavLink>
      </div>
    </nav>
  )
}

function TopBar() {
  const location = useLocation()
  const { t } = useLanguage()
  const { user } = useAuth()

  const PAGE_TITLES = {
    '/': t('nav_dashboard'),
    '/recommend': t('nav_cropAdvisory'),
    '/disease': 'Disease Detection',
    '/fields': t('nav_myFields'),
    '/planner': t('nav_rotationPlanner'),
    '/market': t('nav_marketPrices'),
    '/yield': t('nav_yieldPrediction'),
    '/profile': t('topbar_profileSettings'),
  }
  const title = PAGE_TITLES[location.pathname] || t('brand_title')

  return (
    <header className="top-bar">
      <div className="top-bar-title">{title}</div>
      <div className="top-bar-actions">
        {user && (
          <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem'}}>
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
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <TopBar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/market" element={<Market />} />
            <Route path="/yield" element={<YieldPredict />} />
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
        <LanguageProvider>
          <AppRouter />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
