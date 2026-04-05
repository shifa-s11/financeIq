import { describe, expect, it } from 'vitest';
import mockTransactions from '@/data/mockData';
import {
  getCurrentMonthSummary,
  getFilteredTransactions,
  getInsightNarratives,
  getMonthlyData,
} from '@/utils/calculateSummary';

describe('calculateSummary utilities', () => {
  it('builds monthly data in chronological order', () => {
    const monthly = getMonthlyData(mockTransactions);

    expect(monthly).toHaveLength(6);
    expect(monthly[0]?.month).toBe('Nov');
    expect(monthly[5]?.month).toBe('Apr');
  });

  it('returns the latest month summary instead of a hardcoded month', () => {
    const summary = getCurrentMonthSummary(mockTransactions);

    expect(summary.income).toBeGreaterThan(0);
    expect(summary.expenses).toBeGreaterThan(0);
    expect(summary.balance).toBe(summary.income - summary.expenses);
  });

  it('filters by search, category, type, and date range together', () => {
    const filtered = getFilteredTransactions(mockTransactions, {
      search: 'whole foods',
      merchant: '',
      categories: ['Food & Dining'],
      type: 'expense',
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
      datePreset: 'all',
      amountMin: '',
      amountMax: '',
      sortBy: 'date',
      sortOrder: 'asc',
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((transaction) => transaction.merchant === 'Whole Foods')).toBe(true);
    expect(filtered.every((transaction) => transaction.date.startsWith('2026-04'))).toBe(true);
  });

  it('creates narrative insights from the dataset', () => {
    const narratives = getInsightNarratives(mockTransactions);

    expect(narratives.categoryVsAverage).toContain('average');
    expect(narratives.standoutMonth.length).toBeGreaterThan(20);
    expect(narratives.savingsRecovery).toContain('Savings improved');
  });
});
