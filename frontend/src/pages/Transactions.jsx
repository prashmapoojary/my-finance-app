import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Salary', 'Freelance', 'Investment', 'Other'];

const Transactions = () => {
  const [transactions, setTx]   = useState([]);
  const [wallets, setWallets]   = useState([]);
  const [form, setForm]         = useState({ walletId: '', type: 'expense', amount: '', category: 'Food', description: '', date: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const loadAll = async () => {
    try {
      const [t, w] = await Promise.all([api.get('/transactions'), api.get('/wallets')]);
      setTx(t.data);
      setWallets(w.data);
      if (w.data.length && !form.walletId) {
        setForm(f => ({ ...f, walletId: w.data[0].id }));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/transactions', form);
      setSuccess('Transaction added!');
      setForm(f => ({ ...f, amount: '', description: '', date: '' }));
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadAll();
    } catch (e) { alert('Failed to delete'); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <h2 className="page-title">Transactions</h2>

        {/* Add Form */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Add Transaction</h3>
          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="form-group">
              <label>Wallet</label>
              <select value={form.walletId} onChange={(e) => setForm({ ...form, walletId: e.target.value })} required>
                <option value="">Select wallet</option>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" min="0" placeholder="0" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input placeholder="Optional note" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" disabled={loading} style={{ marginTop: 0 }}>
                {loading ? 'Adding…' : '+ Add'}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>All Transactions</h3>
          {transactions.length === 0 ? (
            <p className="empty">No transactions yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Wallet</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{fmtDate(t.date)}</td>
                      <td>{t.walletname || '—'}</td>
                      <td>{t.category || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{t.description || '—'}</td>
                      <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                      <td style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(t.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;