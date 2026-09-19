import axios from 'axios';

// Base Axios instance pointing to local Express server
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // 3s timeout so it fails fast and falls back if backend is not running
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seed data strictly for Recruiter Preview Mode
const INITIAL_DEMO_DATA = {
  wallets: [
    { id: 1, name: 'HDFC Salary Account', balance: 78500 },
    { id: 2, name: 'Zerodha Emergency Vault', balance: 145000 },
    { id: 3, name: 'Cash & Daily Spends', balance: 12400 },
  ],
  transactions: [
    { id: 1, walletid: 1, walletname: 'HDFC Salary Account', type: 'income', amount: 150000, category: 'Salary', description: 'Monthly Engineering Salary', date: '2026-09-01T09:00:00Z' },
    { id: 2, walletid: 1, walletname: 'HDFC Salary Account', type: 'income', amount: 35000, category: 'Freelance', description: 'Full Stack Web Consulting', date: '2026-09-05T14:30:00Z' },
    { id: 3, walletid: 1, walletname: 'HDFC Salary Account', type: 'expense', amount: 32000, category: 'Bills', description: 'Apartment Rent & Maintenance', date: '2026-09-06T10:00:00Z' },
    { id: 4, walletid: 3, walletname: 'Cash & Daily Spends', type: 'expense', amount: 14200, category: 'Food', description: 'Weekly Groceries & Nature Basket', date: '2026-09-08T18:20:00Z' },
    { id: 5, walletid: 3, walletname: 'Cash & Daily Spends', type: 'expense', amount: 4800, category: 'Transport', description: 'Uber rides & Metro card recharge', date: '2026-09-10T12:15:00Z' },
    { id: 6, walletid: 1, walletname: 'HDFC Salary Account', type: 'expense', amount: 18500, category: 'Shopping', description: 'Ergonomic Standing Desk', date: '2026-09-12T16:40:00Z' },
    { id: 7, walletid: 1, walletname: 'HDFC Salary Account', type: 'expense', amount: 6500, category: 'Health', description: 'Cult.fit Gym & Supplements', date: '2026-09-14T08:30:00Z' },
    { id: 8, walletid: 2, walletname: 'Zerodha Emergency Vault', type: 'income', amount: 8200, category: 'Investment', description: 'Index Fund Dividend Payout', date: '2026-09-15T11:00:00Z' },
    { id: 9, walletid: 3, walletname: 'Cash & Daily Spends', type: 'expense', amount: 5600, category: 'Food', description: 'Team Celebratory Dinner', date: '2026-09-17T20:10:00Z' },
  ],
  budgets: [
    { id: 1, category: 'Food', amount: 22000, month: '2026-09' },
    { id: 2, category: 'Bills', amount: 35000, month: '2026-09' },
    { id: 3, category: 'Transport', amount: 8000, month: '2026-09' },
    { id: 4, category: 'Shopping', amount: 15000, month: '2026-09' },
    { id: 5, category: 'Health', amount: 10000, month: '2026-09' },
  ],
  goals: [
    { id: 1, title: '6-Month Emergency Fund', targetamount: 200000, currentamount: 145000, deadline: '2026-12-31', category: 'Safety' },
    { id: 2, title: 'MacBook Pro M3 Max', targetamount: 240000, currentamount: 190000, deadline: '2026-11-15', category: 'Tech' },
    { id: 3, title: 'Tokyo & Kyoto Vacation', targetamount: 180000, currentamount: 75000, deadline: '2027-04-10', category: 'Travel' },
  ],
  subscriptions: [
    { id: 1, name: 'Netflix Premium 4K', amount: 649, billingCycle: 'monthly', nextBilling: '2026-09-28', category: 'Entertainment', status: 'active' },
    { id: 2, name: 'Spotify Duo Premium', amount: 149, billingCycle: 'monthly', nextBilling: '2026-10-02', category: 'Entertainment', status: 'active' },
    { id: 3, name: 'GitHub Copilot Pro', amount: 850, billingCycle: 'monthly', nextBilling: '2026-09-25', category: 'Cloud / Tech', status: 'active' },
    { id: 4, name: 'Cult.fit Fitness Pass', amount: 1299, billingCycle: 'monthly', nextBilling: '2026-10-15', category: 'Health', status: 'active' },
    { id: 5, name: 'Airtel Fiber Gigabit', amount: 1199, billingCycle: 'monthly', nextBilling: '2026-10-05', category: 'Utilities', status: 'active' },
    { id: 6, name: 'ChatGPT Plus', amount: 1999, billingCycle: 'monthly', nextBilling: '2026-09-30', category: 'Cloud / Tech', status: 'active' },
  ],
};

// Retrieve currently active logged in user
const getSessionUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const getEmptyUserData = () => ({
  wallets: [],
  transactions: [],
  budgets: [],
  goals: [],
  subscriptions: [],
});

// Storage resolver per user (keeps each registered user's data completely isolated!)
const getUserStorage = () => {
  const user = getSessionUser();
  const isDemo = localStorage.getItem('is_demo_mode') === 'true';

  // If user launched via Recruiter Live Demo button
  if (isDemo && (!user || user.email === 'recruiter.preview@portfolio.com')) {
    try {
      const raw = localStorage.getItem('finance_demo_db');
      if (!raw) {
        localStorage.setItem('finance_demo_db', JSON.stringify(INITIAL_DEMO_DATA));
        return INITIAL_DEMO_DATA;
      }
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_DEMO_DATA;
    }
  }

  // Individual registered user account
  const email = user?.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest';
  const userKey = 'finance_user_db_' + email;

  try {
    const raw = localStorage.getItem(userKey);
    if (!raw) {
      const freshData = getEmptyUserData();
      localStorage.setItem(userKey, JSON.stringify(freshData));
      return freshData;
    }
    const parsed = JSON.parse(raw);
    return {
      wallets: parsed.wallets || [],
      transactions: parsed.transactions || [],
      budgets: parsed.budgets || [],
      goals: parsed.goals || [],
      subscriptions: parsed.subscriptions || [],
    };
  } catch (e) {
    return getEmptyUserData();
  }
};

const saveUserStorage = (data) => {
  const user = getSessionUser();
  const isDemo = localStorage.getItem('is_demo_mode') === 'true';

  if (isDemo && (!user || user.email === 'recruiter.preview@portfolio.com')) {
    localStorage.setItem('finance_demo_db', JSON.stringify(data));
    return;
  }

  const email = user?.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest';
  const userKey = 'finance_user_db_' + email;
  localStorage.setItem(userKey, JSON.stringify(data));
};

// Registered accounts registry
const getRegisteredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('finance_registered_users') || '[]');
  } catch (e) {
    return [];
  }
};

const saveRegisteredUser = (email, password) => {
  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    users.push({ id: Date.now(), email, password });
    localStorage.setItem('finance_registered_users', JSON.stringify(users));
  }
  // Initialize clean fresh state for this user
  const userKey = 'finance_user_db_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (!localStorage.getItem(userKey)) {
    localStorage.setItem(userKey, JSON.stringify(getEmptyUserData()));
  }
};

// Check if currently operating in demo mode
const isDemoMode = () => {
  return localStorage.getItem('is_demo_mode') === 'true';
};

// Check if error is network/backend offline
const isNetworkError = (err) => {
  return (
    err.code === 'ERR_NETWORK' ||
    err.message?.includes('Network Error') ||
    err.message?.includes('ECONNREFUSED') ||
    !err.response
  );
};

// Unified API with user data isolation & auto-fallback
const api = {
  get: async (url, config = {}) => {
    if (!isDemoMode()) {
      try {
        return await axiosInstance.get(url, config);
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('Backend offline, accessing user local isolated database.');
        } else {
          throw err;
        }
      }
    }

    // Isolated user storage handler
    const db = getUserStorage();

    if (url.startsWith('/wallets')) {
      return { data: db.wallets || [] };
    }

    if (url.startsWith('/transactions')) {
      return { data: db.transactions || [] };
    }

    if (url.startsWith('/budgets')) {
      return { data: db.budgets || [] };
    }

    if (url.startsWith('/goals')) {
      return { data: db.goals || [] };
    }

    if (url.startsWith('/subscriptions')) {
      return { data: db.subscriptions || [] };
    }

    if (url.startsWith('/reports')) {
      let totalIncome = 0;
      let totalExpense = 0;
      (db.transactions || []).forEach((t) => {
        if (t.type === 'income') totalIncome += Number(t.amount);
        if (t.type === 'expense') totalExpense += Number(t.amount);
      });
      return {
        data: {
          totalIncome,
          totalExpense,
          netSavings: totalIncome - totalExpense,
        },
      };
    }

    return { data: {} };
  },

  post: async (url, data, config = {}) => {
    if (!isDemoMode()) {
      try {
        return await axiosInstance.post(url, data, config);
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('Backend port 5000 offline. Using user isolated storage.');
        } else {
          throw err;
        }
      }
    }

    if (url.startsWith('/auth/register')) {
      saveRegisteredUser(data.email, data.password);
      return {
        data: {
          message: 'User registered successfully',
          user: { id: Date.now(), email: data.email },
        },
      };
    }

    if (url.startsWith('/auth/login')) {
      saveRegisteredUser(data.email, data.password);
      return {
        data: {
          token: 'jwt-auth-session-token-' + Date.now(),
          user: { id: Date.now(), email: data.email || 'user@example.com' },
        },
      };
    }

    const db = getUserStorage();

    if (url.startsWith('/wallets')) {
      const newWallet = {
        id: Date.now(),
        name: data.name,
        balance: Number(data.balance) || 0,
      };
      db.wallets.push(newWallet);
      saveUserStorage(db);
      return { data: { message: 'Wallet created successfully', wallet: newWallet } };
    }

    if (url.startsWith('/transactions')) {
      const wallet = db.wallets.find((w) => String(w.id) === String(data.walletId));
      const amount = Number(data.amount);
      const newTx = {
        id: Date.now(),
        walletid: Number(data.walletId),
        walletname: wallet ? wallet.name : 'Primary Account',
        type: data.type,
        amount,
        category: data.category,
        description: data.description,
        date: data.date || new Date().toISOString(),
      };
      db.transactions.unshift(newTx);

      if (wallet) {
        if (data.type === 'income') wallet.balance += amount;
        else wallet.balance -= amount;
      }

      saveUserStorage(db);
      return { data: { message: 'Transaction recorded and balance updated', transaction: newTx } };
    }

    if (url.startsWith('/budgets')) {
      const existingIdx = db.budgets.findIndex(
        (b) => b.category === data.category && b.month === data.month
      );
      if (existingIdx >= 0) {
        db.budgets[existingIdx].amount = Number(data.amount);
      } else {
        db.budgets.push({
          id: Date.now(),
          category: data.category,
          amount: Number(data.amount),
          month: data.month,
        });
      }
      saveUserStorage(db);
      return { data: { message: 'Budget set successfully' } };
    }

    if (url.startsWith('/goals')) {
      const newGoal = {
        id: Date.now(),
        title: data.title,
        targetamount: Number(data.targetAmount),
        currentamount: Number(data.currentAmount) || 0,
        deadline: data.deadline || null,
        category: data.category || 'Savings',
      };
      db.goals.unshift(newGoal);
      saveUserStorage(db);
      return { data: { message: 'Goal created successfully', goal: newGoal } };
    }

    if (url.startsWith('/subscriptions')) {
      const newSub = {
        id: Date.now(),
        name: data.name,
        amount: Number(data.amount),
        billingCycle: data.billingCycle || 'monthly',
        nextBilling: data.nextBilling || null,
        category: data.category || 'General',
        status: data.status || 'active',
      };
      db.subscriptions.unshift(newSub);
      saveUserStorage(db);
      return { data: { message: 'Subscription added successfully', subscription: newSub } };
    }

    return { data: {} };
  },

  put: async (url, data, config = {}) => {
    if (!isDemoMode()) {
      try {
        return await axiosInstance.put(url, data, config);
      } catch (err) {
        if (!isNetworkError(err)) throw err;
      }
    }

    const db = getUserStorage();

    if (url.startsWith('/goals/')) {
      const id = url.split('/')[2];
      const goal = db.goals.find((g) => String(g.id) === String(id));
      if (goal) {
        if (data.currentAmount !== undefined) goal.currentamount = Number(data.currentAmount);
        if (data.title) goal.title = data.title;
        if (data.targetAmount) goal.targetamount = Number(data.targetAmount);
        if (data.deadline) goal.deadline = data.deadline;
        saveUserStorage(db);
        return { data: { message: 'Goal updated successfully', goal } };
      }
    }

    if (url.startsWith('/subscriptions/')) {
      const id = url.split('/')[2];
      const sub = db.subscriptions.find((s) => String(s.id) === String(id));
      if (sub) {
        if (data.status !== undefined) sub.status = data.status;
        if (data.name) sub.name = data.name;
        if (data.amount !== undefined) sub.amount = Number(data.amount);
        if (data.nextBilling) sub.nextBilling = data.nextBilling;
        saveUserStorage(db);
        return { data: { message: 'Subscription updated', subscription: sub } };
      }
    }

    return { data: {} };
  },

  delete: async (url, config = {}) => {
    if (!isDemoMode()) {
      try {
        return await axiosInstance.delete(url, config);
      } catch (err) {
        if (!isNetworkError(err)) throw err;
      }
    }

    const db = getUserStorage();

    if (url.startsWith('/wallets/')) {
      const id = url.split('/')[2];
      db.wallets = db.wallets.filter((w) => String(w.id) !== String(id));
      saveUserStorage(db);
      return { data: { message: 'Wallet deleted' } };
    }

    if (url.startsWith('/transactions/')) {
      const id = url.split('/')[2];
      const tx = db.transactions.find((t) => String(t.id) === String(id));
      if (tx) {
        const wallet = db.wallets.find((w) => String(w.id) === String(tx.walletid));
        if (wallet) {
          if (tx.type === 'income') wallet.balance -= Number(tx.amount);
          else wallet.balance += Number(tx.amount);
        }
        db.transactions = db.transactions.filter((t) => String(t.id) !== String(id));
        saveUserStorage(db);
      }
      return { data: { message: 'Transaction deleted and balance reverted' } };
    }

    if (url.startsWith('/goals/')) {
      const id = url.split('/')[2];
      db.goals = db.goals.filter((g) => String(g.id) !== String(id));
      saveUserStorage(db);
      return { data: { message: 'Goal deleted successfully' } };
    }

    if (url.startsWith('/subscriptions/')) {
      const id = url.split('/')[2];
      db.subscriptions = db.subscriptions.filter((s) => String(s.id) !== String(id));
      saveUserStorage(db);
      return { data: { message: 'Subscription deleted successfully' } };
    }

    return { data: {} };
  },
};

export default api;