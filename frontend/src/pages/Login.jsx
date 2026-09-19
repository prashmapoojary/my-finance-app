import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const history = useHistory();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      login(data.user, false);
      history.push('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Tip: Check backend or click "Explore Live Demo" below!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterDemo = () => {
    localStorage.setItem('token', 'demo-recruiter-token');
    login({ id: 99, email: 'recruiter.preview@portfolio.com' }, true);
    history.push('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome to FinFlow 👋</h2>
        <p className="subtitle">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        {/* Recruiter / Quick Preview Button */}
        <div className="demo-preview-card">
          <div className="demo-preview-info">
            <span className="sparkle-icon">⚡</span>
            <div>
              <strong>Recruiter / Instant Demo</strong>
              <p>Explore with preloaded wallets, transactions & analytics</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-demo-preview"
            onClick={handleRecruiterDemo}
          >
            🚀 Launch Live Demo Preview
          </button>
        </div>

        <div className="auth-divider">
          <span>or sign in with credentials</span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;