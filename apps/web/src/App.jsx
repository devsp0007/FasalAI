import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Recommend from './pages/Recommend'
import Fields from './pages/Fields'
import Market from './pages/Market'
import Planner from './pages/Planner'
import Profile from './pages/Profile'
import YieldPredict from './pages/YieldPredict'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🌾</div>
        <h1>SmartCrop<span>AI-Powered Advisory</span></h1>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/recommend" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🌱</span> Crop Advisory
        </NavLink>
        <NavLink to="/fields" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🗺️</span> My Fields
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📅</span> Rotation Planner
        </NavLink>

        <div className="sidebar-section-label">Analytics</div>
        <NavLink to="/market" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📈</span> Market Prices
        </NavLink>
        <NavLink to="/yield" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🌾</span> Yield Prediction
        </NavLink>

        <div className="sidebar-section-label">Account</div>
        <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👤</span> Profile
        </NavLink>
      </nav>
    </aside>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink to="/" end className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>Home
        </NavLink>
        <NavLink to="/recommend" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🌱</span>Advisory
        </NavLink>
        <NavLink to="/market" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📈</span>Market
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📅</span>Plan
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>Profile
        </NavLink>
      </div>
    </nav>
  )
}

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/recommend': 'Crop Advisory',
  '/fields': 'My Fields',
  '/planner': 'Rotation Planner',
  '/market': 'Market Prices',
  '/yield': 'Yield Prediction',
  '/profile': 'Profile & Settings',
}

function TopBar() {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'SmartCrop'

  return (
    <header className="top-bar">
      <div className="top-bar-title">{title}</div>
      <div className="top-bar-actions">
        <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
          📍 Varanasi, UP
        </span>
        <button className="btn btn-sm btn-secondary">🔔</button>
      </div>
    </header>
  )
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
            <Route path="/fields" element={<Fields />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/market" element={<Market />} />
            <Route path="/yield" element={<YieldPredict />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
