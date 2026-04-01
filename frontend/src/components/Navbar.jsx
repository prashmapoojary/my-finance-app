import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const NAV_LINKS = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/wallets',      icon: '👛', label: 'Wallets' },
  { to: '/transactions', icon: '💳', label: 'Transactions' },
  { to: '/budgets',      icon: '🎯', label: 'Budgets' },
  { to: '/reports',      icon: '📈', label: 'Reports' },
];

const Navbar = () => {
  const logout  = useAuthStore((s) => s.logout);
  const history = useHistory();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>💰 FinanceApp</h1>
        <p>Personal Finance Manager</p>
      </div>

      <nav className="sidebar-nav">
        {NAV_LINKS.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={pathname.startsWith(to) ? 'active' : ''}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Navbar;