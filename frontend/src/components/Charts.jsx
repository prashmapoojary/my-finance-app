import React, { useState } from 'react';
import { formatMoney } from '../store/authStore';

const PALETTE = [
  '#059669', // Emerald
  '#0d9488', // Teal
  '#d97706', // Amber Gold
  '#0284c7', // Sky
  '#e11d48', // Rose
  '#7c3aed', // Violet
  '#10b981', // Mint
  '#ea580c', // Orange
  '#64748b', // Slate
];

/**
 * Interactive SVG Doughnut Chart for Spending Breakdown
 */
export const CategoryDoughnutChart = ({ data = [], currency = 'INR', height = 240 }) => {
  const [activeItem, setActiveItem] = useState(null);

  // Group and sum by category
  const categoryTotals = data
    .filter((d) => d.type === 'expense')
    .reduce((acc, curr) => {
      const cat = curr.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const entries = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({ category: cat, amount: amt }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = entries.reduce((sum, item) => sum + item.amount, 0);

  if (entries.length === 0 || totalExpense === 0) {
    return (
      <div className="chart-empty">
        <p>No expense data recorded yet for breakdown</p>
      </div>
    );
  }

  // Calculate SVG stroke dashes for circle
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="doughnut-chart-container">
      <div className="doughnut-svg-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {entries.map((item, idx) => {
            const percent = item.amount / totalExpense;
            const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
            const strokeDashoffset = -circumference * cumulativePercent;
            cumulativePercent += percent;
            const color = PALETTE[idx % PALETTE.length];
            const isHovered = activeItem === item.category;

            return (
              <circle
                key={item.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="chart-segment"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: activeItem && !isHovered ? 0.4 : 1,
                }}
                onMouseEnter={() => setActiveItem(item.category)}
                onMouseLeave={() => setActiveItem(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="doughnut-center-info">
          <span className="doughnut-center-label">
            {activeItem || 'Total Spend'}
          </span>
          <span className="doughnut-center-value">
            {activeItem
              ? formatMoney(categoryTotals[activeItem], currency)
              : formatMoney(totalExpense, currency)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="doughnut-legend">
        {entries.map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const pct = Math.round((item.amount / totalExpense) * 100);
          return (
            <div
              key={item.category}
              className={`legend-pill ${activeItem === item.category ? 'active' : ''}`}
              onMouseEnter={() => setActiveItem(item.category)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <span className="legend-dot" style={{ backgroundColor: color }} />
              <span className="legend-name">{item.category}</span>
              <span className="legend-pct">{pct}%</span>
              <span className="legend-val">{formatMoney(item.amount, currency)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Monthly Cashflow Bar Comparison (Income vs Expense)
 */
export const MonthlyBarChart = ({ totalIncome = 0, totalExpense = 0, currency = 'INR' }) => {
  const maxVal = Math.max(totalIncome, totalExpense, 1);
  const incomeHeight = Math.round((totalIncome / maxVal) * 100);
  const expenseHeight = Math.round((totalExpense / maxVal) * 100);

  return (
    <div className="cashflow-bars-card">
      <div className="cashflow-bars-wrapper">
        <div className="bar-column">
          <div className="bar-track">
            <div
              className="bar-fill income-bar"
              style={{ height: `${Math.max(incomeHeight, 8)}%` }}
            >
              <span className="bar-tooltip">{formatMoney(totalIncome, currency)}</span>
            </div>
          </div>
          <span className="bar-label">Income</span>
          <span className="bar-amount-sub">{formatMoney(totalIncome, currency)}</span>
        </div>

        <div className="bar-column">
          <div className="bar-track">
            <div
              className="bar-fill expense-bar"
              style={{ height: `${Math.max(expenseHeight, 8)}%` }}
            >
              <span className="bar-tooltip">{formatMoney(totalExpense, currency)}</span>
            </div>
          </div>
          <span className="bar-label">Expenses</span>
          <span className="bar-amount-sub">{formatMoney(totalExpense, currency)}</span>
        </div>

        <div className="bar-column">
          <div className="bar-track">
            <div
              className="bar-fill savings-bar"
              style={{
                height: `${Math.max(
                  Math.round((Math.max(totalIncome - totalExpense, 0) / maxVal) * 100),
                  8
                )}%`,
              }}
            >
              <span className="bar-tooltip">
                {formatMoney(Math.max(totalIncome - totalExpense, 0), currency)}
              </span>
            </div>
          </div>
          <span className="bar-label">Net Saved</span>
          <span className="bar-amount-sub">
            {formatMoney(Math.max(totalIncome - totalExpense, 0), currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Financial Health & Savings Rate Indicator
 */
export const FinancialHealthGauge = ({ totalIncome = 0, totalExpense = 0 }) => {
  const savings = totalIncome - totalExpense;
  const rate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  let grade = 'Needs Attention';
  let badgeColor = 'var(--danger)';
  let advice = 'Your spending exceeds or matches your income. Build an emergency buffer.';

  if (rate >= 30) {
    grade = 'Excellent (Super Saver)';
    badgeColor = 'var(--success)';
    advice = 'You are saving 30%+ of your income! You are on track for financial independence.';
  } else if (rate >= 15) {
    grade = 'Healthy & Balanced';
    badgeColor = 'var(--secondary)';
    advice = 'Solid savings habits. Aiming for 20% adheres to the 50/30/20 financial rule.';
  } else if (rate > 0) {
    grade = 'Moderate';
    badgeColor = 'var(--warning)';
    advice = 'Positive cashflow! Look into trimming non-essential subscriptions and shopping.';
  }

  return (
    <div className="health-gauge-card">
      <div className="gauge-header">
        <span className="gauge-title">Financial Health Score</span>
        <span className="gauge-badge" style={{ borderColor: badgeColor, color: badgeColor }}>
          {grade}
        </span>
      </div>

      <div className="gauge-progress-bar-bg">
        <div
          className="gauge-progress-fill"
          style={{
            width: `${Math.min(Math.max(rate, 0), 100)}%`,
            background: `linear-gradient(90deg, #6366f1, ${badgeColor})`,
          }}
        />
      </div>

      <div className="gauge-footer">
        <span className="rate-num">{rate}% Savings Rate</span>
        <p className="gauge-tip">{advice}</p>
      </div>
    </div>
  );
};
