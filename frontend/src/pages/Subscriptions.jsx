import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';

const PRESET_SERVICES = [
  { name: 'Netflix Premium', category: 'Entertainment', amount: 649 },
  { name: 'Spotify Premium', category: 'Entertainment', amount: 149 },
  { name: 'Amazon Prime', category: 'Shopping', amount: 299 },
  { name: 'ChatGPT Plus', category: 'Cloud / Tech', amount: 1999 },
  { name: 'GitHub Copilot', category: 'Cloud / Tech', amount: 850 },
  { name: 'Cult.fit Fitness', category: 'Fitness', amount: 1299 },
  { name: 'Google One 2TB', category: 'Cloud / Tech', amount: 650 },
];

const CATEGORIES = ['Entertainment', 'Cloud / Tech', 'Utilities', 'Fitness', 'Work', 'Other'];

const Subscriptions = () => {
  const { currency } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    billingCycle: 'monthly',
    nextBilling: '',
    category: 'Entertainment',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubscriptions(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/subscriptions', form);
      setSuccess(`Recurring service "${form.name}" tracked!`);
      setForm({
        name: '',
        amount: '',
        billingCycle: 'monthly',
        nextBilling: '',
        category: 'Entertainment',
      });
      fetchSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/subscriptions/${sub.id}`, { status: newStatus });
      fetchSubscriptions();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscription tracking?')) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (e) {
      alert('Failed to delete subscription');
    }
  };

  // Compute burn rate metrics
  const { monthlyBurn, annualBurn, activeCount } = useMemo(() => {
    let monthly = 0;
    let active = 0;
    subscriptions.forEach((s) => {
      if (s.status === 'active') {
        active++;
        const amt = Number(s.amount) || 0;
        if (s.billingCycle === 'yearly') {
          monthly += amt / 12;
        } else {
          monthly += amt;
        }
      }
    });
    return {
      monthlyBurn: Math.round(monthly),
      annualBurn: Math.round(monthly * 12),
      activeCount: active,
    };
  }, [subscriptions]);

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Subscriptions & Recurring Bills</h1>
            <p className="page-subtitle">
              Audit recurring charges, identify digital leaks, and anticipate upcoming renewals
            </p>
          </div>

          <div className="sub-burn-metric-box">
            <span className="sub-burn-label">Monthly Recurring Burn</span>
            <strong className="sub-burn-val">{formatMoney(monthlyBurn, currency)}/mo</strong>
            <span className="sub-burn-sub">≈ {formatMoney(annualBurn, currency)}/year</span>
          </div>
        </header>

        <div className="two-col">
          {/* Add Subscription Form */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Add Recurring Service</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Track fixed monthly or annual commitments
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Service / Provider Name</label>
                <input
                  placeholder="e.g. Netflix 4K, Spotify, AWS Cloud"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Popular Service Presets */}
              <div className="template-pills-row" style={{ marginBottom: 14 }}>
                <span className="template-label">Popular Presets:</span>
                <div className="pills-scroll">
                  {PRESET_SERVICES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className="pill-preset-btn"
                      onClick={() =>
                        setForm({
                          ...form,
                          name: p.name,
                          category: p.category,
                          amount: p.amount,
                        })
                      }
                    >
                      {p.name} ({formatMoney(p.amount, currency)})
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Billing Amount ({currency})</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Frequency Cycle</label>
                <select
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly / Annual</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Next Renewal / Due Date</label>
                <input
                  type="date"
                  value={form.nextBilling}
                  onChange={(e) => setForm({ ...form, nextBilling: e.target.value })}
                />
              </div>

              <button className="btn-primary" disabled={loading}>
                {loading ? 'Adding…' : '🔄 Track Recurring Bill'}
              </button>
            </form>
          </div>

          {/* Subscriptions List */}
          <div className="card">
            <div className="card-header-flex">
              <div>
                <h3>Tracked Services ({subscriptions.length})</h3>
                <p className="card-subtitle">{activeCount} currently active</p>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <div className="empty">
                <span>🔄</span>
                <p>No recurring subscriptions tracked yet.</p>
              </div>
            ) : (
              <div className="subscriptions-list-grid">
                {subscriptions.map((sub) => {
                  const days = getDaysUntil(sub.nextBilling);
                  const isPaused = sub.status === 'paused';

                  return (
                    <div
                      key={sub.id}
                      className={`subscription-item-card ${isPaused ? 'paused' : ''}`}
                    >
                      <div className="sub-card-top">
                        <div className="sub-info-col">
                          <span className="sub-cat-pill">{sub.category || 'General'}</span>
                          <h4 className="sub-name">{sub.name}</h4>
                          <span className="sub-cycle-text">
                            {sub.billingCycle === 'yearly' ? 'Annual charge' : 'Billed monthly'}
                          </span>
                        </div>

                        <div className="sub-price-col">
                          <strong className="sub-price">
                            {formatMoney(sub.amount, currency)}
                          </strong>
                          <span className="sub-price-sub">
                            /{sub.billingCycle === 'yearly' ? 'yr' : 'mo'}
                          </span>
                        </div>
                      </div>

                      <div className="sub-card-bottom">
                        <div className="sub-due-status">
                          {days !== null ? (
                            <span
                              className={`due-indicator ${
                                days <= 3 ? 'urgent' : days <= 7 ? 'warning' : 'normal'
                              }`}
                            >
                              📅{' '}
                              {days === 0
                                ? 'Due today!'
                                : days > 0
                                ? `Due in ${days} days`
                                : `${Math.abs(days)} days ago`}
                            </span>
                          ) : (
                            <span className="due-indicator normal">📅 No due date set</span>
                          )}
                        </div>

                        <div className="sub-actions-row">
                          <button
                            className={`btn-sub-toggle ${isPaused ? 'paused-btn' : 'active-btn'}`}
                            onClick={() => handleToggleStatus(sub)}
                          >
                            {isPaused ? '▶ Resume' : '⏸ Pause'}
                          </button>
                          <button
                            className="btn-danger-ghost"
                            title="Delete subscription"
                            onClick={() => handleDelete(sub.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
