import { create } from 'zustand';

const useWalletStore = create((set) => ({
    wallets: [],
    addWallet: (wallet) => set((state) => ({ wallets: [...state.wallets, wallet] })),
}));

export default useWalletStore;