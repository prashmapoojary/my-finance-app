import { create } from 'zustand';

const useTransactionStore = create((set) => ({
    transactions: [],
    addTransaction: (transaction) => set((state) => ({ transactions: [...state.transactions, transaction] })),
}));

export default useTransactionStore;