import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import mockTransactions from '@/data/mockData';
import type { Transaction, Filters, Role, Theme, ToastItem } from '@/types';

interface FinanceState {
  transactions: Transaction[];
  filters: Filters;
  selectedRole: Role;
  theme: Theme;
  toasts: ToastItem[];

  // Transaction actions
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Filter actions
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;

  // Role + Theme
  setRole: (role: Role) => void;
  toggleTheme: () => void;

  // Toasts
  addToast: (message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  categories: [],
  type: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: mockTransactions,
      filters: DEFAULT_FILTERS,
      selectedRole: 'admin',
      theme: 'light',
      toasts: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      clearFilters: () =>
        set({ filters: DEFAULT_FILTERS }),

      setRole: (role) => set({ selectedRole: role }),

      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: next };
        }),

      addToast: (message, type) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: crypto.randomUUID(), message, type },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'finance-store',
      partialize: (state) => ({
        transactions: state.transactions,
        selectedRole: state.selectedRole,
        theme: state.theme,
      }),
    }
  )
);

export default useFinanceStore;