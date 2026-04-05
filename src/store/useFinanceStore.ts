import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import mockTransactions from '@/data/mockData';
import type {
  Category,
  Filters,
  Role,
  Theme,
  ToastItem,
  Transaction,
  TransactionType,
} from '@/types';

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
  restoreTransaction: (tx: Transaction) => void;

  // Filter actions
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;

  // Role + Theme
  setRole: (role: Role) => void;
  toggleTheme: () => void;

  // Toasts
  addToast: (
    message: string,
    type: ToastItem['type'],
    options?: Pick<ToastItem, 'action' | 'actionLabel'>
  ) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  merchant: '',
  categories: [],
  type: 'all',
  dateFrom: '',
  dateTo: '',
  datePreset: 'all',
  amountMin: '',
  amountMax: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

const VALID_CATEGORIES = new Set<Category>([
  'Food & Dining',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Salary',
  'Freelance',
  'Investments',
]);

function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'viewer' || value === 'analyst';
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === 'income' || value === 'expense';
}

function isValidTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tx = value as Partial<Transaction>;

  return (
    typeof tx.id === 'string' &&
    typeof tx.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(tx.date) &&
    typeof tx.amount === 'number' &&
    Number.isFinite(tx.amount) &&
    tx.amount > 0 &&
    typeof tx.merchant === 'string' &&
    typeof tx.description === 'string' &&
    (tx.account === 'Checking' ||
      tx.account === 'Credit Card' ||
      tx.account === 'Brokerage') &&
    (tx.status === 'posted' || tx.status === 'pending') &&
    typeof tx.isRecurring === 'boolean' &&
    typeof tx.category === 'string' &&
    VALID_CATEGORIES.has(tx.category as Category) &&
    isTransactionType(tx.type) &&
    (tx.sourceTag === undefined ||
      tx.sourceTag === 'Payroll' ||
      tx.sourceTag === 'Client Work' ||
      tx.sourceTag === 'Investment Transfer' ||
      tx.sourceTag === 'Bonus')
  );
}

function sanitizeTransactions(value: unknown): Transaction[] {
  if (!Array.isArray(value)) {
    return mockTransactions;
  }

  const sanitized = value.filter(isValidTransaction);
  return sanitized.length > 0 ? sanitized : mockTransactions;
}

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

      restoreTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
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

      addToast: (message, type, options) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: crypto.randomUUID(), message, type, ...options },
          ],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'finance-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        selectedRole: state.selectedRole,
        theme: state.theme,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const persisted = persistedState as Partial<FinanceState>;

        return {
          ...currentState,
          transactions: sanitizeTransactions(persisted.transactions),
          selectedRole: isRole(persisted.selectedRole)
            ? persisted.selectedRole
            : currentState.selectedRole,
          theme: isTheme(persisted.theme)
            ? persisted.theme
            : currentState.theme,
        };
      },
    }
  )
);

export default useFinanceStore;
