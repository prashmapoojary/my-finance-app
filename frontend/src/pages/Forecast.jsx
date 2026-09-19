import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import useAuthStore, { formatMoney } from '../store/authStore';

const Forecast = () => {
  const { currency } = useAuthStore();
  const [initialAmount, setInitialAmount] = useState(100000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(25000);
  const [annualRate, setAnnualRate] = useState(12); // 12% annual return
  const [years, setYears] = useState(10); // 10 years

  // Calculate year-by-year compounding trajectory
  const projectionData = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    let balance = Number(initialAmount);
    let totalInvested = Number(initialAmount);
    const timeline = [];

    timeline.push({
      year: 0,
      balance: Math.round(balance),
      invested: Math.round(totalInvested),
      interest: 0,
    });

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        balance = (balance + Number(monthlyDeposit)) * (1 + monthlyRate);
        totalInvested += Number(monthlyDeposit);
      }
      const interestEarned = Math.max(0, balance - totalInvested);
      timeline.push({
        year: y,
        balance: Math.round(balance),
        invested: Math.round(totalInvested),
        interest: Math.round(interestEarned),
      });
    }

    return timeline;
  }, [initialAmount, monthlyDeposit, annualRate, years]);

  const finalYear = projectionData[projectionData.length - 1];
  const totalWealth = finalYear.balance;
  const totalPrincipal = finalYear.invested;
  const totalGains = finalYear.interest;
  const multiplier = totalPrincipal > 0 ? (totalWealth / totalPrincipal).toFixed(1) : 1;

  // Generate SVG area chart points
  const maxVal = Math.max(totalWealth, 1);
  const width = 600;
  const height = 220;
  const padding = 30;

  const points = projectionData.map((d, idx) => {
    const x = padding + (idx / years) * (width - 2 * padding);
    const y = height - padding - (d.balance / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const principalPoints = projectionData.map((d, idx) => {
    const x = padding + (idx / years) * (width - 2 * padding);
    const y = height - padding - (d.invested / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const areaPath = `M ${padding},${height - padding} L ${points.join(
    ' L '
  )} L ${width - padding},${height - padding} Z`;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Wealth & Compound Forecaster</h1>
            <p className="page-subtitle">
              Simulate long-term wealth accumulation, compounding momentum, and financial independence
            </p>
          </div>
          <div className="growth-multiplier-badge">
            <span className="mult-label">Wealth Multiplier</span>
            <strong className="mult-val">{multiplier}x</strong>
          </div>
        </header>

        {/* Projection KPI Summary Grid */}
        <section className="stats-grid">
          <div className="stat-card stat-savings">
            <span className="stat-label">Projected Net Worth ({years} yrs)</span>
            <span className="stat-value savings">{formatMoney(totalWealth, currency)}</span>
            <span className="stat-subtext">Future portfolio balance</span>
          </div>

          <div className="stat-card stat-income">
            <span className="stat-label">Total Cash Invested</span>
            <span className="stat-value income">{formatMoney(totalPrincipal, currency)}</span>
            <span className="stat-subtext">Capital out of your pocket</span>
          </div>

          <div className="stat-card stat-wallets">
            <span className="stat-label">Compound Interest Gained</span>
            <span className="stat-value neutral" style={{ color: 'var(--gold)' }}>
              +{formatMoney(totalGains, currency)}
            </span>
            <span className="stat-subtext">Pure returns from market growth</span>
          </div>

          <div className="stat-card stat-expense">
            <span className="stat-label">Gains Ratio</span>
            <span className="stat-value neutral" style={{ color: 'var(--secondary)' }}>
              {totalWealth > 0 ? Math.round((totalGains / totalWealth) * 100) : 0}%
            </span>
            <span className="stat-subtext">Portion made purely of interest</span>
          </div>
        </section>

        {/* Forecast Interactive Controls and SVG Graph */}
        <section className="two-col" style={{ marginBottom: 24 }}>
          {/* Sliders Form */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Model Parameters</h3>
            <p className="card-subtitle" style={{ marginBottom: 20 }}>
              Adjust variables to test financial outcomes
            </p>

            <div className="form-group">
              <div className="slider-label-flex">
                <label>Starting Capital</label>
                <strong className="slider-val-tag">
                  {formatMoney(initialAmount, currency)}
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <div className="slider-label-flex">
                <label>Monthly Contribution</label>
                <strong className="slider-val-tag">
                  {formatMoney(monthlyDeposit, currency)}/mo
                </strong>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <div className="slider-label-flex">
                <label>Expected Annual Return Rate</label>
                <strong className="slider-val-tag text-success">{annualRate}% / yr</strong>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="range-slider"
              />
              <span className="slider-hint">
                Typical benchmarks: Fixed Deposit ~7%, Index Funds ~12%, High Equity ~15%
              </span>
            </div>

            <div className="form-group">
              <div className="slider-label-flex">
                <label>Time Horizon</label>
                <strong className="slider-val-tag text-primary">{years} Years</strong>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="range-slider"
              />
            </div>
          </div>

          {/* SVG Projection Curve Chart */}
          <div className="card">
            <div className="card-header-flex">
              <div>
                <h3>Growth Trajectory Curve</h3>
                <p className="card-subtitle">Exponential curve vs cash invested</p>
              </div>
              <div className="chart-legend-row">
                <span className="legend-dot bg-secondary"></span>
                <span className="legend-text">Projected Wealth</span>
                <span className="legend-dot bg-muted" style={{ marginLeft: 10 }}></span>
                <span className="legend-text">Principal Invested</span>
              </div>
            </div>

            <div className="forecast-svg-container">
              <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75].map((pct) => (
                  <line
                    key={pct}
                    x1={padding}
                    y1={padding + pct * (height - 2 * padding)}
                    x2={width - padding}
                    y2={padding + pct * (height - 2 * padding)}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Area Gradient Fill */}
                <defs>
                  <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#wealthGrad)" />

                {/* Principal Line */}
                <polyline
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  points={principalPoints.join(' ')}
                />

                {/* Wealth Curve Line */}
                <polyline
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  points={points.join(' ')}
                />
              </svg>
            </div>

            <div className="chart-x-axis">
              <span>Year 0</span>
              <span>Year {Math.round(years / 2)}</span>
              <span>Year {years}</span>
            </div>
          </div>
        </section>

        {/* Milestone Milestones Table */}
        <section className="card">
          <h3 style={{ marginBottom: 4 }}>Annual Growth Schedule</h3>
          <p className="card-subtitle" style={{ marginBottom: 16 }}>
            Year-by-year capital progression breakdown
          </p>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Timeline</th>
                  <th>Invested Capital</th>
                  <th>Compound Gains</th>
                  <th style={{ textAlign: 'right' }}>Total Portfolio Worth</th>
                </tr>
              </thead>
              <tbody>
                {projectionData.map((row) => (
                  <tr key={row.year}>
                    <td className="year-cell">Year {row.year}</td>
                    <td>{formatMoney(row.invested, currency)}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      +{formatMoney(row.interest, currency)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        color: 'var(--secondary)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                      }}
                    >
                      {formatMoney(row.balance, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Forecast;
