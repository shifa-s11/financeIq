import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '@/components/ui/EmptyState';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionRow } from '@/components/transactions/TransactionRow';
import type { Transaction } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  selectedIds: string[];
  canEdit: boolean;
  canDelete: boolean;
  hasActiveFilters: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onClearFilters: () => void;
}

export function TransactionTable({
  transactions,
  selectedIds,
  canEdit,
  canDelete,
  hasActiveFilters,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onClearFilters,
}: TransactionTableProps) {
  const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>(
    (accumulator, transaction) => {
      const label = new Date(transaction.date).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      accumulator[label] = [...(accumulator[label] ?? []), transaction];
      return accumulator;
    },
    {}
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions match your filters"
        description="Your current filters are narrowing the ledger too much. Clear a few constraints or widen the date window to bring matching activity back."
        action={
          hasActiveFilters
            ? { label: 'Clear filters', onClick: onClearFilters }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 z-10 bg-gray-50/95 text-left text-xs uppercase tracking-wide text-gray-500 backdrop-blur dark:bg-gray-800/95 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={transactions.length > 0 && selectedIds.length === transactions.length}
                  onChange={() => onToggleSelectAll(transactions.map((transaction) => transaction.id))}
                  aria-label="Select all visible transactions"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
              </th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Merchant</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedTransactions).map(([group, items]) => (
              <AnimatePresence key={group} initial={false}>
                <tr className="bg-primary/5 dark:bg-primary/10">
                  <td
                    colSpan={7}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/80 dark:text-primary-light/80"
                  >
                    {group}
                  </td>
                </tr>
                {items.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    selected={selectedIds.includes(transaction.id)}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onToggleSelect={onToggleSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        <AnimatePresence initial={false}>
          {transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <TransactionCard
                transaction={transaction}
                selected={selectedIds.includes(transaction.id)}
                canEdit={canEdit}
                canDelete={canDelete}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
