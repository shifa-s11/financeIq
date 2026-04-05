import {
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { formatCurrency } from '@/utils/formatCurrency';
import type {
  CategoryBreakdown,
  Category,
  CurrentMonthSummary,
  Filters,
  Insights,
  MonthlyData,
  Transaction,
} from '@/types';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function getReferenceDate(
  transactions: Transaction[],
  now = new Date()
) {
  if (!transactions.length) {
    return now;
  }

  const latestTransactionDate = parseISO(
    [...transactions].sort((a, b) => b.date.localeCompare(a.date))[0].date
  );

  return latestTransactionDate > now ? now : latestTransactionDate;
}

export function getDatePresetRange(
  preset: Filters['datePreset'],
  referenceDate: Date
) {
  switch (preset) {
    case 'thisMonth':
      return {
        from: format(startOfMonth(referenceDate), 'yyyy-MM-dd'),
        to: format(referenceDate, 'yyyy-MM-dd'),
      };
    case 'lastMonth': {
      const lastMonth = subMonths(referenceDate, 1);
      return {
        from: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        to: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      };
    }
    case 'last30Days':
      return {
        from: format(subDays(referenceDate, 29), 'yyyy-MM-dd'),
        to: format(referenceDate, 'yyyy-MM-dd'),
      };
    case 'last3Months':
      return {
        from: format(startOfMonth(subMonths(referenceDate, 2)), 'yyyy-MM-dd'),
        to: format(referenceDate, 'yyyy-MM-dd'),
      };
    default:
      return null;
  }
}

export function getMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const monthMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const parsedDate = parseISO(transaction.date);
    const key = format(parsedDate, 'yyyy-MM');
    const existing = monthMap.get(key) ?? { income: 0, expenses: 0 };

    if (transaction.type === 'income') {
      existing.income += transaction.amount;
    } else {
      existing.expenses += transaction.amount;
    }

    monthMap.set(key, existing);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expenses }]) => {
      const [, monthString] = key.split('-');
      const monthIndex = parseInt(monthString, 10) - 1;
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
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );
  const totalExpenses = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const categoryMap = new Map<string, number>();

  expenseTransactions.forEach((transaction) => {
    categoryMap.set(
      transaction.category,
      (categoryMap.get(transaction.category) ?? 0) + transaction.amount
    );
  });

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      total: Math.round(amount * 100) / 100,
      percentage:
        totalExpenses > 0
          ? Math.round((amount / totalExpenses) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getCurrentMonthSummary(
  transactions: Transaction[]
): CurrentMonthSummary {
  if (!transactions.length) {
    return {
      income: 0,
      expenses: 0,
      balance: 0,
      savingsRate: 0,
      vsLastMonth: { income: 0, expenses: 0 },
    };
  }

  const latestDate = parseISO(
    [...transactions].sort((a, b) => b.date.localeCompare(a.date))[0].date
  );
  const previousDate = new Date(latestDate);
  previousDate.setMonth(previousDate.getMonth() - 1);

  const currentMonthTransactions = transactions.filter((transaction) =>
    isSameMonth(parseISO(transaction.date), latestDate)
  );
  const previousMonthTransactions = transactions.filter((transaction) =>
    isSameMonth(parseISO(transaction.date), previousDate)
  );

  const sumByType = (
    items: Transaction[],
    type: 'income' | 'expense'
  ) =>
    items
      .filter((transaction) => transaction.type === type)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

  const income = sumByType(currentMonthTransactions, 'income');
  const expenses = sumByType(currentMonthTransactions, 'expense');
  const previousIncome = sumByType(previousMonthTransactions, 'income');
  const previousExpenses = sumByType(previousMonthTransactions, 'expense');
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  return {
    income,
    expenses,
    balance: income - expenses,
    savingsRate: Math.round(savingsRate * 10) / 10,
    vsLastMonth: {
      income:
        previousIncome > 0
          ? Math.round(((income - previousIncome) / previousIncome) * 1000) / 10
          : 0,
      expenses:
        previousExpenses > 0
          ? Math.round(((expenses - previousExpenses) / previousExpenses) * 1000) /
            10
          : 0,
    },
  };
}

export function getInsights(transactions: Transaction[]): Insights {
  const categoryBreakdown = getCategoryBreakdown(transactions);
  const topCategory = categoryBreakdown[0] ?? { category: 'N/A', total: 0 };

  const monthlyData = getMonthlyData(transactions);
  const bestSavingsMonth = monthlyData.reduce(
    (best, month) => (month.savings > best.savings ? month : best),
    { month: 'N/A', savings: -Infinity, income: 0, expenses: 0, balance: 0 }
  );

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );
  const largestTransaction = expenseTransactions.length
    ? expenseTransactions.reduce((max, transaction) =>
        transaction.amount > max.amount ? transaction : max
      , expenseTransactions[0])
    : undefined;

  const avgMonthlyExpense =
    monthlyData.length > 0
      ? monthlyData.reduce((sum, month) => sum + month.expenses, 0) /
        monthlyData.length
      : 0;

  return {
    topCategory,
    bestSavingsMonth: {
      month: bestSavingsMonth.month,
      savings: bestSavingsMonth.savings,
    },
    largestTransaction,
    avgMonthlyExpense: Math.round(avgMonthlyExpense * 100) / 100,
  };
}

export function getFilteredTransactions(
  transactions: Transaction[],
  filters: Filters
): Transaction[] {
  let filteredTransactions = [...transactions];
  const referenceDate = getReferenceDate(transactions);
  const presetRange = getDatePresetRange(filters.datePreset, referenceDate);

  if (filters.search.trim()) {
    const query = filters.search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(
      (transaction) =>
        transaction.merchant.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)
    );
  }

  if (filters.merchant.trim()) {
    const merchantQuery = filters.merchant.toLowerCase();
    filteredTransactions = filteredTransactions.filter((transaction) =>
      transaction.merchant.toLowerCase().includes(merchantQuery)
    );
  }

  if (filters.categories.length > 0) {
    filteredTransactions = filteredTransactions.filter((transaction) =>
      filters.categories.includes(transaction.category)
    );
  }

  if (filters.type !== 'all') {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.type === filters.type
    );
  }

  if (presetRange?.from) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.date >= presetRange.from
    );
  }

  if (presetRange?.to) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.date <= presetRange.to
    );
  }

  if (filters.dateFrom) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.date >= filters.dateFrom
    );
  }

  if (filters.dateTo) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.date <= filters.dateTo
    );
  }

  if (filters.amountMin) {
    const amountMin = Number(filters.amountMin);
    if (!Number.isNaN(amountMin)) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.amount >= amountMin
      );
    }
  }

  if (filters.amountMax) {
    const amountMax = Number(filters.amountMax);
    if (!Number.isNaN(amountMax)) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.amount <= amountMax
      );
    }
  }

  filteredTransactions.sort((a, b) => {
    let comparison = 0;

    if (filters.sortBy === 'date') {
      comparison = a.date.localeCompare(b.date);
    } else if (filters.sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (filters.sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredTransactions;
}

export interface InsightNarratives {
  categoryVsAverage: string;
  standoutMonth: string;
  savingsRecovery: string;
}

export interface AdvancedInsights {
  recurringSubscriptions: Array<{ merchant: string; amount: number }>;
  unusualSpendingAlert: string;
  monthVsAverage: string;
  highestDiscretionaryMonth: string;
  savingsProjection: string;
  duplicateDetection: string;
}

function formatPercent(value: number) {
  return `${Math.abs(value).toFixed(1)}%`;
}

export function getInsightNarratives(
  transactions: Transaction[]
): InsightNarratives {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense'
  );

  if (expenseTransactions.length === 0) {
    return {
      categoryVsAverage: 'No expense data yet.',
      standoutMonth: 'Add more transactions to surface category shifts.',
      savingsRecovery: 'Savings trends will appear once monthly data is available.',
    };
  }

  const monthly = getMonthlyData(transactions);
  const latestMonth = monthly[monthly.length - 1];
  const previousMonth = monthly[monthly.length - 2];
  const worstSavingsMonth = [...monthly].sort((a, b) => a.savings - b.savings)[0];

  const categoryMonthlyTotals = new Map<string, Map<string, number>>();
  expenseTransactions.forEach((transaction) => {
    const monthKey = format(parseISO(transaction.date), 'MMM');
    const categoryTotals =
      categoryMonthlyTotals.get(transaction.category) ?? new Map<string, number>();
    categoryTotals.set(
      monthKey,
      (categoryTotals.get(monthKey) ?? 0) + transaction.amount
    );
    categoryMonthlyTotals.set(transaction.category, categoryTotals);
  });

  const latestCategorySpend = Array.from(categoryMonthlyTotals.entries())
    .map(([category, totals]) => {
      const values = Array.from(totals.values());
      const average =
        values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      const latest = latestMonth ? Number(totals.get(latestMonth.month) ?? 0) : 0;
      const change = average > 0 ? ((latest - average) / average) * 100 : 0;

      return { category: category as Category, latest, average, change };
    })
    .filter((item) => item.latest > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];

  const monthlyCategoryWinners = monthly.map((month) => {
    const categoriesForMonth = expenseTransactions
      .filter((transaction) => format(parseISO(transaction.date), 'MMM') === month.month)
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
        return acc;
      }, {});

    const topCategoryEntry = Object.entries(categoriesForMonth).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      month: month.month,
      category: topCategoryEntry?.[0] ?? 'Uncategorized',
      amount: topCategoryEntry?.[1] ?? 0,
    };
  });

  const standout = monthlyCategoryWinners.sort((a, b) => b.amount - a.amount)[0];

  const savingsRecovery =
    latestMonth && previousMonth && worstSavingsMonth
      ? latestMonth.savings - worstSavingsMonth.savings
      : 0;

  return {
    categoryVsAverage: latestCategorySpend
      ? `${latestCategorySpend.category} landed ${formatPercent(
          latestCategorySpend.change
        )} ${latestCategorySpend.change >= 0 ? 'above' : 'below'} its six-month average in ${
          latestMonth?.month ?? 'the latest month'
        }.`
      : 'No current category spike detected.',
    standoutMonth: standout
      ? `${standout.category} led spending in ${standout.month} at ${formatCurrency(
          standout.amount
        )}, making it the strongest category signal in the dataset.`
      : 'No standout category month detected.',
    savingsRecovery:
      latestMonth && worstSavingsMonth
        ? `Savings improved by ${formatCurrency(
            savingsRecovery
          )} from the ${worstSavingsMonth.month} low to ${latestMonth.month}.`
        : 'Savings recovery trends need at least two months of data.',
  };
}

export function getAdvancedInsights(transactions: Transaction[]): AdvancedInsights {
  const monthly = getMonthlyData(transactions);
  const latestMonth = monthly[monthly.length - 1];
  const latestMonthTransactions = transactions.filter(
    (transaction) =>
      latestMonth && format(parseISO(transaction.date), 'MMM') === latestMonth.month
  );

  const recurringSubscriptions = transactions
    .filter((transaction) => transaction.isRecurring && transaction.type === 'expense')
    .reduce<Map<string, number>>((accumulator, transaction) => {
      accumulator.set(
        transaction.merchant,
        Math.max(accumulator.get(transaction.merchant) ?? 0, transaction.amount)
      );
      return accumulator;
    }, new Map<string, number>());

  const monthlyExpenseAverage =
    monthly.length > 0
      ? monthly.reduce((sum, item) => sum + item.expenses, 0) / monthly.length
      : 0;

  const unusualCategory = (() => {
    const currentMap = new Map<string, number>();
    const historicalMap = new Map<string, number[]>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const month = format(parseISO(transaction.date), 'MMM');
        const list = historicalMap.get(transaction.category) ?? [];
        const existingMonth = list.slice();
        if (month === latestMonth?.month) {
          currentMap.set(
            transaction.category,
            (currentMap.get(transaction.category) ?? 0) + transaction.amount
          );
        }
        historicalMap.set(transaction.category, [...existingMonth, transaction.amount]);
      });

    return Array.from(currentMap.entries())
      .map(([category, total]) => {
        const history = historicalMap.get(category) ?? [];
        const average =
          history.reduce((sum, value) => sum + value, 0) / Math.max(history.length, 1);
        return {
          category,
          total,
          average,
          change: average > 0 ? ((total - average) / average) * 100 : 0,
        };
      })
      .sort((a, b) => b.change - a.change)[0];
  })();

  const discretionaryCategories = new Set([
    'Food & Dining',
    'Entertainment',
    'Shopping',
    'Transport',
  ]);

  const highestDiscretionaryMonth = monthly
    .map((month) => {
      const total = transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            discretionaryCategories.has(transaction.category) &&
            format(parseISO(transaction.date), 'MMM') === month.month
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return { month: month.month, total };
    })
    .sort((a, b) => b.total - a.total)[0];

  const monthVsAverageDiff =
    latestMonth && monthlyExpenseAverage > 0
      ? ((latestMonth.expenses - monthlyExpenseAverage) / monthlyExpenseAverage) * 100
      : 0;

  const projectedSavings =
    latestMonthTransactions.length > 0
      ? latestMonthTransactions.reduce(
          (sum, transaction) =>
            sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
          0
        )
      : latestMonth?.savings ?? 0;

  return {
    recurringSubscriptions: Array.from(recurringSubscriptions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([merchant, amount]) => ({ merchant, amount })),
    unusualSpendingAlert: unusualCategory
      ? `${unusualCategory.category} is running ${formatPercent(
          unusualCategory.change
        )} above its usual pace in ${latestMonth?.month ?? 'the latest month'}.`
      : 'No unusual spending spike detected this month.',
    monthVsAverage: latestMonth
      ? `${latestMonth.month} expenses are ${formatPercent(
          monthVsAverageDiff
        )} ${monthVsAverageDiff >= 0 ? 'above' : 'below'} your six-month average.`
      : 'Not enough data to compare against the six-month average.',
    highestDiscretionaryMonth: highestDiscretionaryMonth
      ? `${highestDiscretionaryMonth.month} had the highest discretionary spend at ${formatCurrency(
          highestDiscretionaryMonth.total
        )}.`
      : 'No discretionary spending trends available yet.',
    savingsProjection: `At the current pace, you are on track to save ${formatCurrency(
      projectedSavings
    )} this month.`,
    duplicateDetection: (() => {
      const duplicateCandidates = transactions.reduce<Map<string, number>>(
        (accumulator, transaction) => {
          const key = `${transaction.date}-${transaction.merchant}-${transaction.amount}-${transaction.type}`;
          accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
          return accumulator;
        },
        new Map<string, number>()
      );
      const duplicateCount = Array.from(duplicateCandidates.values()).filter(
        (count) => count > 1
      ).length;

      return duplicateCount > 0
        ? `${duplicateCount} potential duplicate transaction pattern${duplicateCount > 1 ? 's' : ''} detected.`
        : 'No exact duplicate transaction patterns detected.';
    })(),
  };
}

export function getTopMerchants(transactions: Transaction[]) {
  return Array.from(
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce<Map<string, number>>((accumulator, transaction) => {
        accumulator.set(
          transaction.merchant,
          (accumulator.get(transaction.merchant) ?? 0) + transaction.amount
        );
        return accumulator;
      }, new Map<string, number>())
      .entries()
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([merchant, total]) => ({ merchant, total }));
}

export function getCumulativeSavingsData(transactions: Transaction[]) {
  let running = 0;
  return getMonthlyData(transactions).map((month) => {
    running += month.savings;
    return {
      month: month.month,
      cumulativeSavings: running,
    };
  });
}

export function getMonthlyGoalProgress(transactions: Transaction[], goal = 2500) {
  const latestMonth = getMonthlyData(transactions).slice(-1)[0];
  const currentSavings = latestMonth?.savings ?? 0;
  return {
    goal,
    currentSavings,
    progress: Math.max(0, Math.min(100, (currentSavings / goal) * 100)),
  };
}

export function getWeekdayWeekendSpending(transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce(
      (accumulator, transaction) => {
        const day = parseISO(transaction.date).getDay();
        if (day === 0 || day === 6) {
          accumulator.weekend += transaction.amount;
        } else {
          accumulator.weekday += transaction.amount;
        }
        return accumulator;
      },
      { weekday: 0, weekend: 0 }
    );
}
