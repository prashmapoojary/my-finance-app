import React, { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

const Transactions = () => {
  const { currency } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [form, setForm] = useState({
    walletId: '',
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadAll = async () => {
    try {
      const [t, w] = await Promise.all([api.get('/transactions'), api.get('/wallets')]);
      setTransactions(t.data);
      setWallets(w.data);
      if (w.data.length && !form.walletId) {
        setForm((f) => ({ ...f, walletId: w.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []); // eslint-disable-line

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/transactions', form);
      setSuccess('Transaction recorded successfully!');
      setForm((f) => ({
        ...f,
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      }));
      setShowAddModal(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadAll();
    } catch (e) {
      alert('Failed to delete transaction');
    }
  };

  // Filtered and searched transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.walletname || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = filterType === 'all' || t.type === filterType;
      const matchWallet =
        filterWallet === 'all' || String(t.walletid) === String(filterWallet);
      const matchCategory =
        filterCategory === 'all' || t.category === filterCategory;

      return matchSearch && matchType && matchWallet && matchCategory;
    });
  }, [transactions, searchTerm, filterType, filterWallet, filterCategory]);

  // Summary of current filtered view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') income += Number(t.amount);
      if (t.type === 'expense') expense += Number(t.amount);
    });
    return { income, expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Export filtered transactions as a clean CSV statement
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Wallet', 'Category', 'Description', 'Type', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date ? new Date(t.date).toISOString().split('T')[0] : '',
      `"${(t.walletname || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.type,
      t.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `FinFlow_Statement_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Transactions Ledger</h1>
            <p className="page-subtitle">
              Detailed record of all income, expenditures, and asset transfers
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={exportToCSV}>
              <span>📥</span> Export CSV
            </button>
            <button
              className="btn-action-primary"
              onClick={() => setShowAddModal(!showAddModal)}
            >
              <span>{showAddModal ? '✕ Close' : '➕ Record Transaction'}</span>
            </button>
          </div>
        </header>

        {/* Collapsible Record Transaction Drawer/Form */}
        {showAddModal && (
          <div className="card add-tx-card">
            <div className="card-header-flex">
              <div>
                <h3>Record New Transaction</h3>
                <p className="card-subtitle">
                  Updates corresponding wallet balance automatically
                </p>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleAdd} className="form-grid-smart">
              <div className="form-group">
                <label>Linked Wallet</label>
                <select
                  value={form.walletId}
                  onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                  required
                >
                  <option value="">Select Wallet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatMoney(w.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Flow Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="expense">Expense (Outflow)</option>
                  <option value="income">Income (Inflow)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount ({currency})</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
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
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Description / Vendor Note</label>
                <input
                  placeholder="e.g. Amazon Electronics, Client Consulting, Grocery Basket"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-actions-bar">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" disabled={loading}>
                  {loading ? 'Submitting…' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search Bar */}
        <section className="card filter-toolbar-card">
          <div className="filter-toolbar-grid">
            <div className="search-input-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by description, vendor, or category…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-select-group">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Flow Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>

              <select
                value={filterWallet}
                onChange={(e) => setFilterWallet(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Wallets</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary Stats Bar */}
          <div className="filter-summary-strip">
            <div className="filter-stat-item">
              <span className="label">Matching Records:</span>
              <strong className="val">{summary.count}</strong>
            </div>
            <div className="filter-stat-item">
              <span className="label">Filtered Inflow:</span>
              <strong className="val text-success">
                +{formatMoney(summary.income, currency)}
              </strong>
            </div>
            <div className="filter-stat-item">
              <span className="label">Filtered Outflow:</span>
              <strong className="val text-danger">
                -{formatMoney(summary.expense, currency)}
              </strong>
            </div>
            <div className="filter-stat-item">
              <span className="label">Net Impact:</span>
              <strong
                className={`val ${
                  summary.income - summary.expense >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatMoney(summary.income - summary.expense, currency)}
              </strong>
            </div>
          </div>
        </section>

        {/* Transactions Table */}
        <section className="card">
          {filteredTransactions.length === 0 ? (
            <div className="empty">
              <span>💳</span>
              <p>No transactions found matching your criteria.</p>
              {(searchTerm ||
                filterType !== 'all' ||
                filterWallet !== 'all' ||
                filterCategory !== 'all') && (
                <button
                  className="btn-secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterWallet('all');
                    setFilterCategory('all');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account / Wallet</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Flow Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="date-cell">{fmtDate(t.date)}</td>
                      <td>
                        <span className="wallet-pill">👛 {t.walletname || 'Primary'}</span>
                      </td>
                      <td>
                        <span className="category-tag-pill">{t.category || 'Other'}</span>
                      </td>
                      <td className="desc-cell">{t.description || '—'}</td>
                      <td>
                        <span className={`badge badge-${t.type}`}>{t.type}</span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          color:
                            t.type === 'income' ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {formatMoney(t.amount, currency)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-danger-ghost"
                          title="Delete transaction"
                          onClick={() => handleDelete(t.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Transactions;