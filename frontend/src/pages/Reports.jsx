import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';
import { CategoryDoughnutChart, MonthlyBarChart, FinancialHealthGauge } from '../components/Charts';

const Reports = () => {
  const { currency } = useAuthStore();
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [r, t] = await Promise.all([api.get('/reports'), api.get('/transactions')]);
        setReport(r.data);
        setTransactions(t.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalIncome = report?.totalIncome || 0;
  const totalExpense = report?.totalExpense || 0;
  const netSavings = report?.netSavings || 0;

  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const expenseRate = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  // Largest expense transaction
  const largestExpense = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

  // Average expense transaction
  const expenseTxList = transactions.filter((t) => t.type === 'expense');
  const avgExpense =
    expenseTxList.length > 0 ? Math.round(totalExpense / expenseTxList.length) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Financial Intelligence & Analytics</h1>
            <p className="page-subtitle">
              Comprehensive breakdown of cashflow, spending efficiency, and savings ratios
            </p>
          </div>
          <button className="btn-secondary" onClick={handlePrint}>
            <span>🖨️</span> Print / Save PDF
          </button>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Computing analytics models…</p>
          </div>
        ) : (
          <>
            {/* KPI Stats Grid */}
            <section className="stats-grid">
              <div className="stat-card stat-income">
                <span className="stat-label">Total Cumulative Income</span>
                <span className="stat-value income">{formatMoney(totalIncome, currency)}</span>
                <span className="stat-subtext">All historical inflows</span>
              </div>

              <div className="stat-card stat-expense">
                <span className="stat-label">Total Outflows</span>
                <span className="stat-value expense">{formatMoney(totalExpense, currency)}</span>
                <span className="stat-subtext">Cumulative operational burns</span>
              </div>

              <div className="stat-card stat-savings">
                <span className="stat-label">Net Wealth Accrual</span>
                <span className={`stat-value ${netSavings >= 0 ? 'savings' : 'expense'}`}>
                  {formatMoney(netSavings, currency)}
                </span>
                <span className="stat-subtext">Retained post-expenses</span>
              </div>

              <div className="stat-card stat-wallets">
                <span className="stat-label">Savings Ratio</span>
                <span
                  className={`stat-value ${
                    savingsRate >= 20 ? 'savings' : savingsRate >= 0 ? 'neutral' : 'expense'
                  }`}
                >
                  {savingsRate}%
                </span>
                <span className="stat-subtext">Target benchmark: 20%+</span>
              </div>
            </section>

            {/* Financial Health Score & Advice */}
            <FinancialHealthGauge totalIncome={totalIncome} totalExpense={totalExpense} />

            {/* Visual Analytics */}
            <section className="analytics-double-grid" style={{ marginTop: 24 }}>
              <div className="card chart-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Expense Distribution</h3>
                    <p className="card-subtitle">Spending weighted across categories</p>
                  </div>
                </div>
                <CategoryDoughnutChart data={transactions} currency={currency} />
              </div>

              <div className="card chart-card">
                <div className="card-header-flex">
                  <div>
                    <h3>Inflow vs Outflow Magnitude</h3>
                    <p className="card-subtitle">Side-by-side volume comparison</p>
                  </div>
                </div>
                <MonthlyBarChart
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  currency={currency}
                />
              </div>
            </section>

            {/* Efficiency Metrics & Key Ratios */}
            <section className="two-col" style={{ marginTop: 24 }}>
              <div className="card">
                <h3 style={{ marginBottom: 4 }}>Spending Efficiency Metrics</h3>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>
                  Detailed mathematical benchmarks
                </p>

                <div className="metrics-list">
                  <div className="metric-row">
                    <span className="m-label">Expense-to-Income Ratio</span>
                    <strong
                      className={`m-val ${
                        expenseRate > 80 ? 'text-danger' : expenseRate > 60 ? 'text-warning' : 'text-success'
                      }`}
                    >
                      {expenseRate}%
                    </strong>
                  </div>

                  <div className="metric-row">
                    <span className="m-label">Net Savings Rate</span>
                    <strong className="m-val text-success">{savingsRate}%</strong>
                  </div>

                  <div className="metric-row">
                    <span className="m-label">Average Expense Ticket</span>
                    <strong className="m-val">{formatMoney(avgExpense, currency)}</strong>
                  </div>

                  <div className="metric-row">
                    <span className="m-label">Total Transactions Analyzed</span>
                    <strong className="m-val">{transactions.length} records</strong>
                  </div>

                  {largestExpense && (
                    <div className="metric-row">
                      <span className="m-label">Peak Single Expense</span>
                      <strong className="m-val text-danger">
                        {formatMoney(largestExpense.amount, currency)} ({largestExpense.category} -{' '}
                        {largestExpense.description || 'Note'})
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 4 }}>Capital Allocation Ratios</h3>
                <p className="card-subtitle" style={{ marginBottom: 16 }}>
                  Visualizing income distribution against ideal rules
                </p>

                <div className="ratio-progress-item">
                  <div className="r-header">
                    <span>Expenses Burn ({expenseRate}%)</span>
                    <span className="r-amount">{formatMoney(totalExpense, currency)}</span>
                  </div>
                  <div className="b-bar-track">
                    <div
                      className="b-bar-fill bg-danger"
                      style={{ width: `${Math.min(expenseRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="ratio-progress-item" style={{ marginTop: 16 }}>
                  <div className="r-header">
                    <span>Retained Savings ({savingsRate}%)</span>
                    <span className="r-amount">{formatMoney(netSavings, currency)}</span>
                  </div>
                  <div className="b-bar-track">
                    <div
                      className="b-bar-fill bg-success"
                      style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
                    />
                  </div>
                </div>

                <div className="golden-rule-callout" style={{ marginTop: 24 }}>
                  <span className="callout-icon">💡</span>
                  <div>
                    <strong>The 50/30/20 Financial Framework</strong>
                    <p>
                      Optimal personal finance targets 50% for Needs (Rent, Utilities), 30% for
                      Wants (Dining, Gadgets), and 20% dedicated to Savings & Investments.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;