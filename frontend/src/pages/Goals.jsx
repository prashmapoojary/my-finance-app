import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import useAuthStore, { formatMoney } from '../store/authStore';

const GOAL_CATEGORIES = ['Safety', 'Tech', 'Travel', 'Vehicle', 'House', 'Education', 'Investment'];

const Goals = () => {
  const { currency } = useAuthStore();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Safety',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/goals', form);
      setSuccess(`Goal "${form.title}" established!`);
      setForm({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'Safety',
      });
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeposit = async (e, goal) => {
    e.preventDefault();
    const addVal = Number(depositAmount);
    if (!addVal || addVal <= 0) return;

    try {
      const newCurrent = Number(goal.currentamount || 0) + addVal;
      await api.put(`/goals/${goal.id}`, { currentAmount: newCurrent });
      setDepositGoalId(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      alert('Failed to add deposit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (e) {
      alert('Failed to delete goal');
    }
  };

  const getDaysRemaining = (deadlineStr) => {
    if (!deadlineStr) return null;
    const diff = new Date(deadlineStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <header className="page-header-flex">
          <div>
            <h1 className="page-title">Savings Goals Tracker</h1>
            <p className="page-subtitle">
              Set milestones, log contributions, and gamify your long-term wealth targets
            </p>
          </div>
        </header>

        <div className="two-col">
          {/* Create Goal Form */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>New Savings Target</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Define a specific financial milestone
            </p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleCreateGoal}>
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  placeholder="e.g. 6-Month Emergency Fund, MacBook Pro, Japan Trip"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Amount ({currency})</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 150000"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Initial Saved Amount ({currency})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={form.currentAmount}
                  onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {GOAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Target Completion Date</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>

              <button className="btn-primary" disabled={loading}>
                {loading ? 'Creating…' : '🚀 Establish Savings Goal'}
              </button>
            </form>
          </div>

          {/* Goals List Grid */}
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Active Milestones</h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              Track funding status and log deposits
            </p>

            {goals.length === 0 ? (
              <div className="empty">
                <span>🏆</span>
                <p>No active goals yet. Create your first target on the left!</p>
              </div>
            ) : (
              <div className="goals-cards-list">
                {goals.map((g) => {
                  const target = Number(g.targetamount);
                  const current = Number(g.currentamount || 0);
                  const pct = Math.min(Math.round((current / target) * 100), 100);
                  const remaining = Math.max(target - current, 0);
                  const isAchieved = current >= target;
                  const daysLeft = getDaysRemaining(g.deadline);

                  return (
                    <div key={g.id} className="goal-item-card">
                      <div className="goal-item-top">
                        <div>
                          <div className="goal-tag-row">
                            <span className="goal-category-tag">{g.category || 'Savings'}</span>
                            {isAchieved && (
                              <span className="goal-achieved-badge">🎉 Achieved!</span>
                            )}
                          </div>
                          <h4 className="goal-title">{g.title}</h4>
                        </div>
                        <button
                          className="btn-danger-ghost"
                          title="Delete goal"
                          onClick={() => handleDelete(g.id)}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Numbers */}
                      <div className="goal-amounts-row">
                        <span className="goal-curr-text">
                          {formatMoney(current, currency)}
                        </span>
                        <span className="goal-target-sub">
                          Target: {formatMoney(target, currency)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="goal-bar-track">
                        <div
                          className={`goal-bar-fill ${isAchieved ? 'fill-gold' : 'fill-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="goal-item-footer">
                        <span className="goal-pct-label">{pct}% Saved</span>
                        <span className="goal-days-label">
                          {isAchieved
                            ? 'Milestone completed!'
                            : daysLeft !== null
                            ? daysLeft > 0
                              ? `⏳ ${daysLeft} days remaining`
                              : '⚠️ Deadline reached'
                            : `Remaining: ${formatMoney(remaining, currency)}`}
                        </span>
                      </div>

                      {/* Quick Deposit Simulator */}
                      {!isAchieved && (
                        <div className="goal-deposit-box">
                          {depositGoalId === g.id ? (
                            <form
                              onSubmit={(e) => handleAddDeposit(e, g)}
                              className="deposit-form"
                            >
                              <input
                                type="number"
                                min="1"
                                placeholder={`Deposit in ${currency}`}
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                autoFocus
                                required
                              />
                              <button type="submit" className="btn-deposit-save">
                                + Save
                              </button>
                              <button
                                type="button"
                                className="btn-deposit-cancel"
                                onClick={() => setDepositGoalId(null)}
                              >
                                ✕
                              </button>
                            </form>
                          ) : (
                            <button
                              className="btn-deposit-trigger"
                              onClick={() => setDepositGoalId(g.id)}
                            >
                              ➕ Add Funds / Log Deposit
                            </button>
                          )}
                        </div>
                      )}
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

export default Goals;
