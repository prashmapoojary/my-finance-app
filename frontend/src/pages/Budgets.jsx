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
  'Freelance',
  'Investment',
  'Other',
];

const Budgets = () => {
  const { currency } = useAuthStore();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [form, setForm] = useState({ category: 'Food', amount: '', month: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [b, t] = await Promise.all([api.get('/budgets'), api.get('/transactions')]);
      setBudgets(b.data);
      setTransactions(t.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
    setForm((f) => ({ ...f, month: monthStr }));
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/budgets', form);
      setSuccess(`Budget for ${form.category} successfully saved!`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  // Compute spent amount per category for current month
  const categorySpending = useMemo(() => {
    const spendingMap = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        // Match month if date exists
        const txMonth = t.date ? t.date.slice(0, 7) : selectedMonth;
        if (!selectedMonth || txMonth === selectedMonth) {
          const cat = t.category || 'Other';
          spendingMap[cat] = (spendingMap[cat] || 0) + Number(t.amount);
        }
      });
    return spendingMap;
  }, [transactions, selectedMonth]);

  // Overall totals
  const overallTotals = useMemo(() => {
    const filteredBudgets = budgets.filter((b) => !selectedMonth || b.month === selectedMonth);
    const totalAllocated = filteredBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = filteredBudgets.reduce(
      (sum, b) => sum + (categorySpending[b.category] || 0),
      0
    );
    const remaining = totalAllocated - totalSpent;
    const percent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    return { totalAllocated, totalSpent, remaining, percent };
  }, [budgets, categorySpending, selectedMonth]);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Smart Budgeting</h1>
            <p className="page-subtitle">
              Set spending thresholds, monitor burn rate, and avoid over-budget traps
            </p>
          </div>

          <div className="month-picker-container">
            <label htmlFor="month-filter">Active Period:</label>
            <input
              id="month-filter"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-picker-input"
            />
          </div>
        </header>

        {/* Top Overall Budget Progress Banner */}
        <section className="card budget-summary-card">
          <div className="budget-summary-header">
            <div>
              <h3>Period Budget Burn Rate ({selectedMonth})</h3>
              <p className="card-subtitle">
                {overallTotals.totalSpent <= overallTotals.totalAllocated
                  ? `You have ${formatMoney(
                      overallTotals.remaining,
                      currency
                    )} remaining of your allocated budget.`
                  : `⚠️ Budget exceeded by ${formatMoney(
                      Math.abs(overallTotals.remaining),
                      currency
                    )}!`}
              </p>
            </div>
            <div className="budget-pct-badge">
              <span
                className={`pct-number ${
                  overallTotals.percent > 100
                    ? 'danger'
                    : overallTotals.percent > 80
                    ? 'warning'
                    : 'success'
                }`}
              >
                {overallTotals.percent}%
              </span>
              <span className="pct-sub">Burn Rate</span>
            </div>
          </div>

          <div className="budget-bar-large">
            <div
              className={`budget-bar-large-fill ${
                overallTotals.percent > 100
                  ? 'bg-danger'
                  : overallTotals.percent > 80
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              style={{ width: `${Math.min(overallTotals.percent, 100)}%` }}
            />
          </div>

          <div className="budget-numbers-grid">
            <div>
              <span className="b-label">Total Allocated</span>
              <strong className="b-val">{formatMoney(overallTotals.totalAllocated, currency)}</strong>
            </div>
            <div>
              <span className="b-label">Total Spent</span>
              <strong className="b-val text-expense">
                {formatMoney(overallTotals.totalSpent, currency)}
              </strong>
            </div>
            <div>
              <span className="b-label">Net Remaining</span>
              <strong
                className={`b-val ${
                  overallTotals.remaining >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatMoney(overallTotals.remaining, currency)}
              </strong>
            </div>
          </div>
        </section>

        <div className="two-col">
          {/* Form */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Set or Update Budget</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Define monthly caps to receive live alerts
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
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
                <label>Budget Limit ({currency})</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 15000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Month</label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                  required
                />
              </div>

              <button className="btn-primary" disabled={loading}>
                {loading ? 'Saving…' : '💾 Save Category Budget'}
              </button>
            </form>
          </div>

          {/* Budget List with Live Progress Bars */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Category Budgets</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Real-time expenditure tracking against limits
            </p>

            {budgets.length === 0 ? (
              <div className="empty">
                <span>🎯</span>
                <p>No budget caps set. Define one on the left to start tracking.</p>
              </div>
            ) : (
              <div className="budget-cards-list">
                {budgets.map((b) => {
                  const spent = categorySpending[b.category] || 0;
                  const limit = Number(b.amount);
                  const pct = Math.round((spent / limit) * 100);
                  const remaining = limit - spent;
                  const isExceeded = spent > limit;
                  const isWarning = pct >= 80 && !isExceeded;

                  return (
                    <div key={b.id} className="budget-progress-item">
                      <div className="b-item-header">
                        <div>
                          <strong className="b-cat-name">{b.category}</strong>
                          <span className="b-month-tag">{b.month}</span>
                        </div>
                        <div className="b-amt-status">
                          <span className="b-spent-text">
                            {formatMoney(spent, currency)} /{' '}
                            <strong>{formatMoney(limit, currency)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="b-bar-track">
                        <div
                          className={`b-bar-fill ${
                            isExceeded ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      <div className="b-item-footer">
                        <span
                          className={`b-status-pill ${
                            isExceeded
                              ? 'status-danger'
                              : isWarning
                              ? 'status-warning'
                              : 'status-safe'
                          }`}
                        >
                          {isExceeded
                            ? `Over budget by ${formatMoney(Math.abs(remaining), currency)}`
                            : `${formatMoney(remaining, currency)} remaining`}
                        </span>
                        <span className="b-pct-text">{pct}% used</span>
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

export default Budgets;