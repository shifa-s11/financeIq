import type { Transaction } from '@/types';
import { formatDate } from './formatDate';
import { formatCurrency } from './formatCurrency';

export function exportToCSV(
  transactions: Transaction[],
  filename = 'transactions-export'
): void {
  const headers = [
    'Date',
    'Merchant',
    'Category',
    'Description',
    'Type',
    'Amount',
  ];

  const rows = transactions.map((tx) => [
    formatDate(tx.date, 'yyyy-MM-dd'),
    `"${tx.merchant.replace(/"/g, '""')}"`,
    tx.category,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.type,
    formatCurrency(tx.amount),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}