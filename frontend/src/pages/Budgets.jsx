import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Freelance', 'Investment', 'Other'];

const Budgets = () => {
  const [budgets, setBudgets]   = useState([]);
  const [form, setForm]         = useState({ category: 'Food', amount: '', month: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const fetchBudgets = async () => {
    try {
      const { data } = await api.get('/budgets');
      setBudgets(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    // default month to current
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setForm(f => ({ ...f, month: monthStr }));
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/budgets', form);
      setSuccess('Budget saved!');
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <h2 className="page-title">Budgets</h2>

        <div className="two-col">
          {/* Form */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Set Budget</h3>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Budget Amount (₹)</label>
                <input type="number" min="0" placeholder="e.g. 5000"
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Month</label>
                <input type="month" value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })} required />
              </div>
              <button className="btn-primary" disabled={loading}>
                {loading ? 'Saving…' : '💾 Save Budget'}
              </button>
            </form>
          </div>

          {/* Budget List */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>All Budgets</h3>
            {budgets.length === 0 ? (
              <p className="empty">No budgets set yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Category</th>
                    <th>Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id}>
                      <td>{b.month}</td>
                      <td>{b.category}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{fmt(b.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Budgets;