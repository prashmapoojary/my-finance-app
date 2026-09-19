import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const history = useHistory();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 4) {
      return setError('Password must be at least 4 characters');
    }

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { email: form.email, password: form.password });

      // Navigate to Login page with state
      history.push('/login', {
        registeredEmail: form.email,
        successMessage: 'Account registered successfully! Please sign in with your credentials to access your dashboard.',
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again or check your details.'
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
        <h2>Create Account 🚀</h2>
        <p className="subtitle">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>

        {/* Recruiter / Quick Preview Button */}
        <div className="demo-preview-card">
          <div className="demo-preview-info">
            <span className="sparkle-icon">⚡</span>
            <div>
              <strong>Instant Recruiter Preview</strong>
              <p>Explore all features immediately without registration</p>
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
          <span>or create standard account</span>
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
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating Account…' : 'Register Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;