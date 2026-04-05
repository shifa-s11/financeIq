export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Food & Dining'
  | 'Transport'
  | 'Housing'
  | 'Entertainment'
  | 'Health'
  | 'Shopping'
  | 'Salary'
  | 'Freelance'
  | 'Investments';

export interface Transaction {
  id: string;
  date: string;        // ISO string
  amount: number;      // always positive
  category: Category;
  type: TransactionType;
  description: string;
  merchant: string;
  account: 'Checking' | 'Credit Card' | 'Brokerage';
  status: 'posted' | 'pending';
  isRecurring: boolean;
  sourceTag?: 'Payroll' | 'Client Work' | 'Investment Transfer' | 'Bonus';
}

export interface Filters {
  search: string;
  merchant: string;
  categories: Category[];
  type: 'all' | 'income' | 'expense';
  dateFrom: string;
  dateTo: string;
  datePreset: 'all' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'last3Months';
  amountMin: string;
  amountMax: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export type Role = 'admin' | 'viewer' | 'analyst';
export type Theme = 'light' | 'dark';

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

export interface CurrentMonthSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  vsLastMonth: {
    income: number;
    expenses: number;
  };
}

export interface Insights {
  topCategory: { category: string; total: number };
  bestSavingsMonth: { month: string; savings: number };
  largestTransaction: Transaction | undefined;
  avgMonthlyExpense: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  actionLabel?: string;
  action?: () => void;
}
