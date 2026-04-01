import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Wallets = () => {
  const [wallets, setWallets]   = useState([]);
  const [form, setForm]         = useState({ name: '', balance: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const fetchWallets = async () => {
    try {
      const { data } = await api.get('/wallets');
      setWallets(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchWallets(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/wallets', form);
      setSuccess('Wallet created!');
      setForm({ name: '', balance: '' });
      fetchWallets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wallet?')) return;
    try {
      await api.delete(`/wallets/${id}`);
      fetchWallets();
    } catch (e) { alert('Failed to delete wallet'); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <h2 className="page-title">Wallets</h2>

        <div className="two-col">
          {/* Form */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Add New Wallet</h3>
            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Wallet Name</label>
                <input
                  placeholder="e.g. Savings, Cash"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />
              </div>
              <button className="btn-primary" disabled={loading}>
                {loading ? 'Adding…' : '+ Add Wallet'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Your Wallets</h3>
            {wallets.length === 0 ? (
              <p className="empty">No wallets yet. Create your first one!</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Balance</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((w) => (
                    <tr key={w.id}>
                      <td>👛 {w.name}</td>
                      <td style={{ color: w.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {fmt(w.balance)}
                      </td>
                      <td>
                        <button className="btn-danger" onClick={() => handleDelete(w.id)}>
                          Delete
                        </button>
                      </td>
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

export default Wallets;