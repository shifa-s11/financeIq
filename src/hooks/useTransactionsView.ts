import { useMemo } from 'react';
import type { Filters, Transaction } from '@/types';
import { getFilteredTransactions } from '@/utils/calculateSummary';

export function useTransactionsView(
  transactions: Transaction[],
  filters: Filters,
  page: number,
  pageSize: number
) {
  return useMemo(() => {
    const filteredTransactions = getFilteredTransactions(transactions, filters);
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTransactions.length / pageSize)
    );
    const paginatedTransactions = filteredTransactions.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    const hasActiveFilters =
      Boolean(filters.search) ||
      Boolean(filters.merchant) ||
      filters.categories.length > 0 ||
      filters.type !== 'all' ||
      Boolean(filters.dateFrom) ||
      Boolean(filters.dateTo) ||
      filters.datePreset !== 'all' ||
      Boolean(filters.amountMin) ||
      Boolean(filters.amountMax);

    return {
      filteredTransactions,
      paginatedTransactions,
      totalPages,
      hasActiveFilters,
    };
  }, [filters, page, pageSize, transactions]);
}
