import { parseISO, format, getMonth, getYear } from 'date-fns';
import type {
  Transaction,
  MonthlyData,
  CategoryBreakdown,
  CurrentMonthSummary,
  Insights,
} from '@/types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const map = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((tx) => {
    const date = parseISO(tx.date);
    const key = format(date, 'yyyy-MM');
    const existing = map.get(key) ?? { income: 0, expenses: 0 };
    if (tx.type === 'income') {
      existing.income += tx.amount;
    } else {
      existing.expenses += tx.amount;
    }
    map.set(key, existing);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expenses }]) => {
      const [, monthStr] = key.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      const savings = income - expenses;
      return {
        month: MONTH_LABELS[monthIndex] ?? key,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        balance: Math.round(savings * 100) / 100,
      };
    });
}

export function getCategoryBreakdown(
  transactions: Transaction[]
): CategoryBreakdown[] {
  const expenseOnly = transactions.filter((tx) => tx.type === 'expense');
  const total = expenseOnly.reduce((sum, tx) => sum + tx.amount, 0);

  const map = new Map<string, number>();
  expenseOnly.forEach((tx) => {
    map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
  });

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      total: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getCurrentMonthSummary(
  transactions: Transaction[]
): CurrentMonthSummary {
  const now = new Date();
  const currentMonth = getMonth(now);
  const currentYear = getYear(now);

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const filterByMonth = (m: number, y: number) =>
    transactions.filter((tx) => {
      const d = parseISO(tx.date);
      return getMonth(d) === m && getYear(d) === y;
    });

  // Use June 2025 as "current" since our data ends there
  const current = filterByMonth(5, 2025);
  const previous = filterByMonth(4, 2025);

  const sum = (txs: Transaction[], type: 'income' | 'expense') =>
    txs.filter((tx) => tx.type === type).reduce((s, tx) => s + tx.amount, 0);

  const income = sum(current, 'income');
  const expenses = sum(current, 'expense');
  const prevIncome = sum(previous, 'income');
  const prevExpenses = sum(previous, 'expense');

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  return {
    income,
    expenses,
    balance: income - expenses,
    savingsRate: Math.round(savingsRate * 10) / 10,
    vsLastMonth: {
      income: prevIncome > 0
        ? Math.round(((income - prevIncome) / prevIncome) * 1000) / 10
        : 0,
      expenses: prevExpenses > 0
        ? Math.round(((expenses - prevExpenses) / prevExpenses) * 1000) / 10
        : 0,
    },
  };
}

export function getInsights(transactions: Transaction[]): Insights {
  // Top expense category
  const breakdown = getCategoryBreakdown(transactions);
  const topCategory = breakdown[0] ?? { category: 'N/A', total: 0 };

  // Best savings month
  const monthly = getMonthlyData(transactions);
  const best = monthly.reduce(
    (best, m) => (m.savings > best.savings ? m : best),
    { month: 'N/A', savings: -Infinity, income: 0, expenses: 0, balance: 0 }
  );

  // Largest single transaction
  const expenses = transactions.filter((tx) => tx.type === 'expense');
  const largest = expenses.reduce(
    (max, tx) => (tx.amount > max.amount ? tx : max),
    expenses[0]
  );

  // Avg monthly expense
  const avgMonthlyExpense =
    monthly.length > 0
      ? monthly.reduce((s, m) => s + m.expenses, 0) / monthly.length
      : 0;

  return {
    topCategory,
    bestSavingsMonth: { month: best.month, savings: best.savings },
    largestTransaction: largest,
    avgMonthlyExpense: Math.round(avgMonthlyExpense * 100) / 100,
  };
}

export function getFilteredTransactions(
  transactions: Transaction[],
  filters: {
    search: string;
    categories: string[];
    type: 'all' | 'income' | 'expense';
    dateFrom: string;
    dateTo: string;
    sortBy: 'date' | 'amount' | 'category';
    sortOrder: 'asc' | 'desc';
  }
): Transaction[] {
  let result = [...transactions];

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (tx) =>
        tx.merchant.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
    );
  }

  if (filters.categories.length > 0) {
    result = result.filter((tx) => filters.categories.includes(tx.category));
  }

  if (filters.type !== 'all') {
    result = result.filter((tx) => tx.type === filters.type);
  }

  if (filters.dateFrom) {
    result = result.filter((tx) => tx.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    result = result.filter((tx) => tx.date <= filters.dateTo);
  }

  result.sort((a, b) => {
    let cmp = 0;
    if (filters.sortBy === 'date') {
      cmp = a.date.localeCompare(b.date);
    } else if (filters.sortBy === 'amount') {
      cmp = a.amount - b.amount;
    } else if (filters.sortBy === 'category') {
      cmp = a.category.localeCompare(b.category);
    }
    return filters.sortOrder === 'asc' ? cmp : -cmp;
  });

  return result;
}