import { create } from 'zustand';

// Safely retrieve stored session and preferences
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const getStoredCurrency = () => {
  return localStorage.getItem('finance_currency') || 'INR';
};

const isStoredDemo = () => {
  return localStorage.getItem('is_demo_mode') === 'true';
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isDemo: isStoredDemo(),
  currency: getStoredCurrency(),

  login: (user, isDemo = false) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('is_demo_mode', isDemo ? 'true' : 'false');
    set({ user, isDemo });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_demo_mode');
    set({ user: null, isDemo: false });
  },

  setCurrency: (currency) => {
    localStorage.setItem('finance_currency', currency);
    set({ currency });
  },
}));

export const CURRENCY_CONFIG = {
  INR: { symbol: '₹', locale: 'en-IN', label: 'INR (₹)' },
  USD: { symbol: '$', locale: 'en-US', label: 'USD ($)' },
  EUR: { symbol: '€', locale: 'de-DE', label: 'EUR (€)' },
  GBP: { symbol: '£', locale: 'en-GB', label: 'GBP (£)' },
};

export const formatMoney = (amount, currencyCode = 'INR') => {
  const conf = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.INR;
  const val = Number(amount) || 0;
  return new Intl.NumberFormat(conf.locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(val);
};

export { useAuthStore };
export default useAuthStore;