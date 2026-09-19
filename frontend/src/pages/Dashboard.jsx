import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';
import { CategoryDoughnutChart, MonthlyBarChart, FinancialHealthGauge } from '../components/Charts';

const Dashboard = () => {
  const { user, currency } = useAuthStore();
  const [report, setReport] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [r, w, t] = await Promise.all([
          api.get('/reports'),
          api.get('/wallets'),
          api.get('/transactions'),
        ]);
        setReport(r.data);
        setWallets(w.data);
        setTransactions(t.data);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalWalletBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  const recentTransactions = transactions.slice(0, 5);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Top Header & Greeting */}
        <header className="dashboard-topbar">
          <div>
            <span className="topbar-date">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <h1 className="page-title">
              {getGreeting()},{' '}
              <span className="highlight-name">
                {user?.email ? user.email.split('@')[0] : 'Developer'}
              </span>{' '}
              👋
            </h1>
          </div>

          <div className="quick-actions-group">
            <Link to="/transactions" className="btn-action-primary">
              <span>➕</span> Add Transaction
            </Link>
            <Link to="/budgets" className="btn-action-secondary">
              <span>🎯</span> Set Budget
            </Link>
            <Link to="/goals" className="btn-action-secondary">
              <span>🏆</span> New Goal
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Gathering your financial intelligence…</p>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <section className="stats-grid">
              <div className="stat-card stat-income">
                <div className="stat-card-header">
                  <span className="stat-label">Total Inflow</span>
                  <span className="stat-card-icon">📈</span>
                </div>
                <span className="stat-value income">
                  {formatMoney(report?.totalIncome, currency)}
                </span>
                <span className="stat-subtext">Active earnings & returns</span>
              </div>

              <div className="stat-card stat-expense">
                <div className="stat-card-header">
                  <span className="stat-label">Total Outflow</span>
                  <span className="stat-card-icon">📉</span>
                </div>
                <span className="stat-value expense">
                  {formatMoney(report?.totalExpense, currency)}
                </span>
                <span className="stat-subtext">Tracked category spending</span>
              </div>

              <div className="stat-card stat-savings">
                <div className="stat-card-header">
                  <span className="stat-label">Net Surplus</span>
                  <span className="stat-card-icon">💎</span>
                </div>
                <span
                  className={`stat-value ${
                    (report?.netSavings || 0) >= 0 ? 'savings' : 'expense'
                  }`}
                >
                  {formatMoney(report?.netSavings, currency)}
                </span>
                <span className="stat-subtext">Retained capital buffer</span>
              </div>

              <div className="stat-card stat-wallets">
                <div className="stat-card-header">
                  <span className="stat-label">Liquid Assets</span>
                  <span className="stat-card-icon">👛</span>
                </div>
                <span className="stat-value neutral">
                  {formatMoney(totalWalletBalance, currency)}
                </span>
                <span className="stat-subtext">{wallets.length} Active Accounts</span>
              </div>
            </section>

            {/* Financial Health Score Banner */}
            <FinancialHealthGauge
              totalIncome={report?.totalIncome || 0}
              totalExpense={report?.totalExpense || 0}
            />

            {/* Visual Analytics Section */}
            <section className="analytics-double-grid">
              <div className="card chart-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Expense Breakdown</h3>
                    <p className="card-subtitle">Spending distribution by category</p>
                  </div>
                  <Link to="/reports" className="card-link-more">
                    Full Analytics →
                  </Link>
                </div>
                <CategoryDoughnutChart data={transactions} currency={currency} />
              </div>

              <div className="card chart-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Cashflow Momentum</h3>
                    <p className="card-subtitle">Comparison of inflows vs expenses</p>
                  </div>
                  <span className="badge-live">Live Balance</span>
                </div>
                <MonthlyBarChart
                  totalIncome={report?.totalIncome || 0}
                  totalExpense={report?.totalExpense || 0}
                  currency={currency}
                />
              </div>
            </section>

            {/* Two-column Bottom: Wallets & Recent Transactions */}
            <section className="two-col dashboard-bottom-grid">
              {/* Wallets Card */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3>Your Wallets</h3>
                    <p className="card-subtitle">Linked payment methods & accounts</p>
                  </div>
                  <Link to="/wallets" className="card-link-more">
                    Manage →
                  </Link>
                </div>

                {wallets.length === 0 ? (
                  <div className="empty">
                    <span>👛</span>
                    <p>No wallets created yet.</p>
                    <Link to="/wallets" className="btn-inline-link">
                      + Create First Wallet
                    </Link>
                  </div>
                ) : (
                  <div className="wallets-mini-list">
                    {wallets.map((w) => (
                      <div key={w.id} className="wallet-mini-item">
                        <div className="wallet-mini-info">
                          <span className="wallet-avatar-icon">💳</span>
                          <div>
                            <strong className="wallet-name-title">{w.name}</strong>
                            <span className="wallet-type-sub">Current Balance</span>
                          </div>
                        </div>
                        <span
                          className={`wallet-mini-balance ${
                            Number(w.balance) >= 0 ? 'positive' : 'negative'
                          }`}
                        >
                          {formatMoney(w.balance, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions Card */}
              <div className="card">
                <div className="card-header-flex">
                  <div>
                    <h3>Recent Transactions</h3>
                    <p className="card-subtitle">Latest movements in and out</p>
                  </div>
                  <Link to="/transactions" className="card-link-more">
                    View All ({transactions.length}) →
                  </Link>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="empty">
                    <span>💳</span>
                    <p>No transaction history recorded yet.</p>
                    <Link to="/transactions" className="btn-inline-link">
                      + Add New Record
                    </Link>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((t) => (
                          <tr key={t.id}>
                            <td>
                              <span className="category-tag-pill">{t.category || 'General'}</span>
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
                                fontWeight: 600,
                              }}
                            >
                              {t.type === 'income' ? '+' : '-'}
                              {formatMoney(t.amount, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;