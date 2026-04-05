import { useMemo } from 'react';
import type { Transaction } from '@/types';
import {
  getCumulativeSavingsData,
  getCategoryBreakdown,
  getCurrentMonthSummary,
  getMonthlyData,
  getMonthlyGoalProgress,
  getTopMerchants,
  getWeekdayWeekendSpending,
} from '@/utils/calculateSummary';

export function useDashboardData(transactions: Transaction[]) {
  return useMemo(() => {
    const monthly = getMonthlyData(transactions);
    const breakdown = getCategoryBreakdown(transactions);
    const summary = getCurrentMonthSummary(transactions);
    const recentTransactions = [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    const totalBalance = monthly.reduce((sum, month) => sum + month.savings, 0);
    const cumulativeSavings = getCumulativeSavingsData(transactions);
    const topMerchants = getTopMerchants(transactions);
    const goalProgress = getMonthlyGoalProgress(transactions);
    const weekdayWeekendSpending = getWeekdayWeekendSpending(transactions);

    return {
      monthly,
      breakdown,
      summary,
      recentTransactions,
      totalBalance,
      cumulativeSavings,
      topMerchants,
      goalProgress,
      weekdayWeekendSpending,
    };
  }, [transactions]);
}
