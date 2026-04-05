import { useEffect, useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Transaction } from '@/types';

interface TransactionCardProps {
  transaction: Transaction;
  selected: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({
  transaction,
  selected,
  canEdit,
  canDelete,
  onToggleSelect,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!confirmingDelete) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setConfirmingDelete(false);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [confirmingDelete]);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="mb-2 inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(transaction.id)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            Select
          </label>
          <p
            className="truncate text-sm font-semibold text-gray-900 dark:text-white"
            title={transaction.merchant}
          >
            {transaction.merchant}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatDate(transaction.date)}
          </p>
        </div>

        <p
          className={`shrink-0 text-sm font-semibold ${
            transaction.type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-300'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge category={transaction.category} size="sm" />
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            transaction.type === 'income'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {transaction.type}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-200">
          {transaction.account}
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {transaction.status}
        </span>
        {transaction.isRecurring && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-primary/20 dark:text-primary-light">
            Recurring
          </span>
        )}
        {transaction.sourceTag && (
          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {transaction.sourceTag}
          </span>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-gray-50/90 px-3 py-2 dark:bg-gray-900/40">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Description
        </p>
        <p
          className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
          title={transaction.description || transaction.merchant}
        >
          {transaction.description || 'No description provided'}
        </p>
      </div>

      {(canEdit || canDelete) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(transaction)}
              icon={<Pencil size={14} />}
              aria-label={`Edit transaction from ${transaction.merchant}`}
            >
              Edit
            </Button>
          )}

          {canDelete &&
            (confirmingDelete ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                  icon={<X size={14} />}
                  aria-label={`Cancel deleting transaction from ${transaction.merchant}`}
                >
                  Undo
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                  icon={<Check size={14} />}
                  aria-label={`Confirm deleting transaction from ${transaction.merchant}`}
                >
                  Confirm
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
                icon={<Trash2 size={14} />}
                aria-label={`Delete transaction from ${transaction.merchant}`}
              >
                Delete
              </Button>
            ))}
        </div>
      )}
    </article>
  );
}
