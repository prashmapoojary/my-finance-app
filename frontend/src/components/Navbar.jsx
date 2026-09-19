import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import useAuthStore, { CURRENCY_CONFIG } from '../store/authStore';

const NAV_LINKS = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/wallets', icon: '👛', label: 'Wallets' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
  { to: '/budgets', icon: '🎯', label: 'Budgets' },
  { to: '/goals', icon: '🏆', label: 'Savings Goals' },
  { to: '/subscriptions', icon: '🔄', label: 'Subscriptions' },
  { to: '/forecast', icon: '🚀', label: 'Wealth Forecast' },
  { to: '/reports', icon: '📈', label: 'Analytics' },
];

const Navbar = () => {
  const { user, isDemo, logout, currency, setCurrency } = useAuthStore();
  const history = useHistory();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme toggle state (default to 'light' per user request)
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-title">FinFlow</span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay on mobile */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-badge">
            <span className="logo-emoji">⚡</span>
            <div className="logo-text-col">
              <h1>FinFlow</h1>
              <p>Finance Manager</p>
            </div>
          </div>
          {isDemo && (
            <span className="demo-pill-badge" title="Running offline preview mode">
              ✨ Demo Mode
            </span>
          )}
        </div>

        {/* Compact Currency & Theme Row */}
        <div className="sidebar-controls-row">
          <div className="currency-selector-box">
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="currency-dropdown"
              aria-label="Select Currency"
            >
              {Object.entries(CURRENCY_CONFIG).map(([code, item]) => (
                <option key={code} value={code}>
                  {item.symbol} {code}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ to, icon, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={isActive ? 'active' : ''}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-text">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="user-avatar">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <span className="user-email-text" title={user?.email || 'Guest User'}>
                {user?.email ? user.email.split('@')[0] : 'Guest'}
              </span>
              <span className="user-role-text">{isDemo ? 'Demo' : 'Active'}</span>
            </div>
          </div>

          <button className="btn-logout" onClick={handleLogout} title="Sign Out">
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;