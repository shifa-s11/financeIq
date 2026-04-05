import { Fragment, useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Transaction } from '@/types';

interface TransactionRowProps {
  transaction: Transaction;
  selected: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({
  transaction,
  selected,
  canEdit,
  canDelete,
  onToggleSelect,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!confirmingDelete) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setConfirmingDelete(false);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [confirmingDelete]);

  const hasExtraDetails =
    transaction.description.length > 32 || transaction.merchant.length > 20;

  return (
    <Fragment>
      <tr className="border-b border-gray-100 text-sm transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-primary/5 dark:border-gray-700 dark:odd:bg-gray-800 dark:even:bg-gray-800/70 dark:hover:bg-primary/10">
        <td className="px-4 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(transaction.id)}
            aria-label={`Select transaction from ${transaction.merchant}`}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          />
        </td>
        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
          {formatDate(transaction.date)}
        </td>
        <td className="max-w-[180px] px-6 py-4 font-medium text-gray-900 dark:text-white">
          <div className="flex items-center gap-2">
            <span
              className="truncate decoration-dotted underline-offset-4 hover:underline"
              title={transaction.merchant}
            >
              {transaction.merchant}
            </span>
            {hasExtraDetails && (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                aria-label={`${expanded ? 'Hide' : 'Show'} transaction details for ${transaction.merchant}`}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge category={transaction.category} size="sm" />
            {transaction.isRecurring && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary dark:bg-primary/20 dark:text-primary-light">
                Recurring
              </span>
            )}
            {transaction.sourceTag && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {transaction.sourceTag}
              </span>
            )}
          </div>
        </td>
        <td className="max-w-[220px] px-6 py-4 text-gray-500 dark:text-gray-400">
          <span
            className="block truncate decoration-dotted underline-offset-4 hover:underline"
            title={transaction.description || transaction.merchant}
          >
            {transaction.description || '-'}
          </span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              transaction.type === 'income'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {transaction.type}
          </span>
        </td>
        <td
          className={`px-6 py-4 text-right font-semibold ${
            transaction.type === 'income'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500 dark:text-red-300'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-end gap-2">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(transaction)}
                aria-label={`Edit transaction from ${transaction.merchant}`}
                icon={<Pencil size={14} />}
              />
            )}

            {canDelete &&
              (confirmingDelete ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingDelete(false)}
                    aria-label={`Cancel deleting transaction from ${transaction.merchant}`}
                    icon={<X size={14} />}
                  >
                    Undo
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    aria-label={`Confirm deleting transaction from ${transaction.merchant}`}
                    icon={<Check size={14} />}
                  >
                    Confirm
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(true)}
                  aria-label={`Delete transaction from ${transaction.merchant}`}
                  icon={<Trash2 size={14} />}
                />
              ))}
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-gray-100 bg-primary/5 dark:border-gray-700 dark:bg-primary/10">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Merchant
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {transaction.merchant}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Description
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {transaction.description || 'No description provided'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Amount
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Metadata
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                  {transaction.account} · {transaction.status}
                  {transaction.sourceTag ? ` · ${transaction.sourceTag}` : ''}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}
