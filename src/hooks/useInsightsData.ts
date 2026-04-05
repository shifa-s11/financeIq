import { useMemo } from 'react';
import type { Transaction } from '@/types';
import {
  getAdvancedInsights,
  getInsights,
  getMonthlyData,
} from '@/utils/calculateSummary';

export function useInsightsData(transactions: Transaction[]) {
  return useMemo(() => {
    const monthly = getMonthlyData(transactions);
    const insights = getInsights(transactions);
    const advancedInsights = getAdvancedInsights(transactions);
    const lastTwoMonths = monthly.slice(-2);
    const monthOverMonthExpenseChange =
      lastTwoMonths.length === 2 && lastTwoMonths[0].expenses > 0
        ? ((lastTwoMonths[1].expenses - lastTwoMonths[0].expenses) /
            lastTwoMonths[0].expenses) *
          100
        : 0;
    const expenseChangeDown = monthOverMonthExpenseChange <= 0;

    return {
      monthly,
      insights,
      advancedInsights,
      monthOverMonthExpenseChange,
      expenseChangeDown,
    };
  }, [transactions]);
}
