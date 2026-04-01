import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const Reports = () => {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then(({ data }) => setReport(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  const savingsRate = report && report.totalIncome > 0
    ? ((report.netSavings / report.totalIncome) * 100).toFixed(1)
    : 0;

  const expenseRate = report && report.totalIncome > 0
    ? ((report.totalExpense / report.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <h2 className="page-title">Financial Report</h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading report…</p>
        ) : !report ? (
          <p className="empty">No data available yet.</p>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">💰 Total Income</span>
                <span className="stat-value income">{fmt(report.totalIncome)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">💸 Total Expenses</span>
                <span className="stat-value expense">{fmt(report.totalExpense)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">🏦 Net Savings</span>
                <span className={`stat-value ${report.netSavings >= 0 ? 'savings' : 'expense'}`}>
                  {fmt(report.netSavings)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">📊 Savings Rate</span>
                <span className={`stat-value ${savingsRate >= 0 ? 'savings' : 'expense'}`}>
                  {savingsRate}%
                </span>
              </div>
            </div>

            {/* Visual bars */}
            <div className="card" style={{ marginTop: 8 }}>
              <h3 style={{ marginBottom: 20 }}>Income vs Expense Breakdown</h3>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Income</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>{fmt(report.totalIncome)}</span>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 99, height: 10 }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--success)', borderRadius: 99 }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expenses</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>{fmt(report.totalExpense)} ({expenseRate}%)</span>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 99, height: 10 }}>
                  <div style={{ width: `${Math.min(expenseRate, 100)}%`, height: '100%', background: 'var(--danger)', borderRadius: 99, transition: 'width 0.8s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Savings</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{fmt(report.netSavings)} ({savingsRate}%)</span>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 99, height: 10 }}>
                  <div style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%`, height: '100%', background: 'var(--primary)', borderRadius: 99, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            {/* Summary box */}
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 16 }}>Summary</h3>
              <table>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Total Money In</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(report.totalIncome)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Total Money Out</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{fmt(report.totalExpense)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Net Balance</td>
                    <td style={{ color: report.netSavings >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                      {fmt(report.netSavings)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Savings Rate</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{savingsRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;