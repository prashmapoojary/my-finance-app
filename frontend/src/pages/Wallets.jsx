import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';

const WALLET_PRESETS = [
  'HDFC Bank Account',
  'ICICI Salary Account',
  'Zerodha Investment Vault',
  'Crypto / Digital Ledger',
  'Cash & Daily Expenses',
];

const Wallets = () => {
  const { currency } = useAuthStore();
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({ name: '', balance: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      const { data } = await api.get('/wallets');
      setWallets(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/wallets', form);
      setSuccess('Wallet account established successfully!');
      setForm({ name: '', balance: '' });
      fetchWallets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Warning: Deleting this wallet will also delete its linked transactions. Proceed?'
      )
    )
      return;
    try {
      await api.delete(`/wallets/${id}`);
      fetchWallets();
    } catch (e) {
      alert('Failed to delete wallet');
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Wallet Accounts</h1>
            <p className="page-subtitle">
              Manage bank accounts, debit cards, cash reserves, and liquid assets
            </p>
          </div>
          <div className="portfolio-total-badge">
            <span className="p-label">Total Liquid Net Worth</span>
            <strong className="p-val">{formatMoney(totalBalance, currency)}</strong>
          </div>
        </header>

        <div className="two-col">
          {/* Form */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Add Wallet Account</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Connect a physical or digital asset storage
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Wallet / Account Name</label>
                <input
                  placeholder="e.g. Chase Checking, HDFC Salary, Emergency Vault"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Quick Template Pills */}
              <div className="template-pills-row">
                <span className="template-label">Quick Suggestions:</span>
                <div className="pills-scroll">
                  {WALLET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="pill-preset-btn"
                      onClick={() => setForm({ ...form, name: preset })}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 14 }}>
                <label>Opening / Initial Balance ({currency})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />
              </div>

              <button className="btn-primary" disabled={loading}>
                {loading ? 'Creating…' : '💳 Create Wallet Account'}
              </button>
            </form>
          </div>

          {/* List of Wallets */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Configured Wallets ({wallets.length})</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Active accounts connected to your dashboard
            </p>

            {wallets.length === 0 ? (
              <div className="empty">
                <span>👛</span>
                <p>No wallets yet. Create your first one to start tracking balances!</p>
              </div>
            ) : (
              <div className="wallets-grid-view">
                {wallets.map((w) => (
                  <div key={w.id} className="wallet-card-item">
                    <div className="wallet-card-top">
                      <div className="wallet-icon-title">
                        <span className="w-icon">💳</span>
                        <div>
                          <strong className="w-name">{w.name}</strong>
                          <span className="w-id-tag">Account #{w.id}</span>
                        </div>
                      </div>
                      <button
                        className="btn-danger-ghost"
                        title="Delete Wallet"
                        onClick={() => handleDelete(w.id)}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="wallet-card-bottom">
                      <span className="w-balance-label">Current Balance</span>
                      <strong
                        className={`w-balance-val ${
                          Number(w.balance) >= 0 ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {formatMoney(w.balance, currency)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wallets;