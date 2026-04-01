import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Dashboard = () => {
  const [report, setReport]       = useState(null);
  const [wallets, setWallets]     = useState([]);
  const [transactions, setTx]     = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, w, t] = await Promise.all([
          api.get('/reports'),
          api.get('/wallets'),
          api.get('/transactions'),
        ]);
        setReport(r.data);
        setWallets(w.data);
        setTx(t.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <h2 className="page-title">Dashboard</h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Income</span>
                <span className="stat-value income">{fmt(report?.totalIncome)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value expense">{fmt(report?.totalExpense)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Net Savings</span>
                <span className={`stat-value ${report?.netSavings >= 0 ? 'savings' : 'expense'}`}>
                  {fmt(report?.netSavings)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Wallets</span>
                <span className="stat-value neutral">{wallets.length}</span>
              </div>
            </div>

            <div className="two-col">
              {/* Wallets */}
              <div className="card">
                <h3>My Wallets</h3>
                {wallets.length === 0 ? (
                  <p className="empty">No wallets yet — create one!</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.map((w) => (
                        <tr key={w.id}>
                          <td>👛 {w.name}</td>
                          <td style={{ color: w.balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {fmt(w.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="card">
                <h3>Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="empty">No transactions yet.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.category || '—'}</td>
                          <td>
                            <span className={`badge badge-${t.type}`}>{t.type}</span>
                          </td>
                          <td style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                            {fmt(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;