import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CATEGORIES } from '@/data/mockData';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Category, Transaction } from '@/types';

interface FormData {
  date: string;
  merchant: string;
  category: Category;
  description: string;
  type: 'income' | 'expense';
  amount: string;
}

interface FormErrors {
  date?: string;
  merchant?: string;
  amount?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: Transaction | null;
}

const EMPTY_FORM: FormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  category: 'Food & Dining',
  description: '',
  type: 'expense',
  amount: '',
};

function deriveTransactionMeta(form: FormData, merchant: string): Pick<Transaction, 'account' | 'status' | 'isRecurring' | 'sourceTag'> {
  const recurringMerchants = new Set([
    'Spotify',
    'Netflix',
    'Planet Fitness',
    'Blue Cross Insurance',
    'Rent Payment',
    'Vanguard',
    'Fidelity',
  ]);

  return {
    account:
      form.type === 'income'
        ? 'Checking'
        : form.category === 'Investments'
          ? 'Brokerage'
          : form.category === 'Housing'
            ? 'Checking'
            : 'Credit Card',
    status: 'posted',
    isRecurring:
      recurringMerchants.has(merchant) ||
      form.description.toLowerCase().includes('subscription') ||
      form.description.toLowerCase().includes('membership'),
    sourceTag:
      form.type === 'income'
        ? merchant === 'Employer Inc.'
          ? form.description.toLowerCase().includes('bonus')
            ? 'Bonus'
            : 'Payroll'
          : 'Client Work'
        : undefined,
  };
}

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};
  const today = new Date().toISOString().split('T')[0];

  if (!form.date) errors.date = 'Date is required';
  if (form.date && form.date > today) {
    errors.date = 'Date cannot be in the future';
  }
  if (!form.merchant.trim()) errors.merchant = 'Merchant is required';

  const amount = parseFloat(form.amount);
  if (!form.amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Enter a valid positive amount';
  }

  return errors;
}

export function TransactionModal({
  isOpen,
  onClose,
  editing,
}: TransactionModalProps) {
  const { addToast, addTransaction, updateTransaction } = useFinanceStore();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const id = useId();

  useEffect(() => {
    setForm(
      editing
        ? {
            date: editing.date,
            merchant: editing.merchant,
            category: editing.category,
            description: editing.description,
            type: editing.type,
            amount: String(editing.amount),
          }
        : EMPTY_FORM
    );
    setErrors({});
  }, [editing, isOpen]);

  const setField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const fieldClass = (error?: string) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 ${
      error
        ? 'border-red-400 bg-white text-gray-900 focus-visible:ring-red-400/30 dark:bg-gray-700 dark:text-gray-100'
        : 'border-gray-200 bg-white text-gray-900 focus-visible:ring-primary/40 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
    }`;

  const handleSubmit = async () => {
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const merchant = form.merchant.trim();
    const derivedMeta = deriveTransactionMeta(form, merchant);
    const transaction: Transaction = {
      id: editing?.id ?? crypto.randomUUID(),
      date: form.date,
      merchant,
      category: form.category,
      description: form.description.trim(),
      type: form.type,
      amount: parseFloat(form.amount),
      ...derivedMeta,
      ...(editing ? { status: editing.status } : {}),
    };

    if (editing) {
      updateTransaction(editing.id, transaction);
      addToast(
        `Updated ${transaction.merchant} to ${formatCurrency(transaction.amount)}.`,
        'success'
      );
    } else {
      addTransaction(transaction);
      addToast(
        `Added ${transaction.merchant} for ${formatCurrency(transaction.amount)}.`,
        'success'
      );
    }

    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-date`} className="mb-1.5 block text-xs font-medium">
              Date
            </label>
            <input
              id={`${id}-date`}
              type="date"
              value={form.date}
              onChange={(event) => setField('date', event.target.value)}
              className={fieldClass(errors.date)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? `${id}-date-error` : undefined}
            />
            {errors.date && (
              <p id={`${id}-date-error`} className="mt-1 text-xs text-red-500">
                {errors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${id}-amount`} className="mb-1.5 block text-xs font-medium">
              Amount ($)
            </label>
            <input
              id={`${id}-amount`}
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setField('amount', event.target.value)}
              className={fieldClass(errors.amount)}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? `${id}-amount-error` : undefined}
            />
            {errors.amount && (
              <p id={`${id}-amount-error`} className="mt-1 text-xs text-red-500">
                {errors.amount}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-merchant`} className="mb-1.5 block text-xs font-medium">
            Merchant
          </label>
          <input
            id={`${id}-merchant`}
            type="text"
            placeholder="e.g. Amazon"
            value={form.merchant}
            onChange={(event) => setField('merchant', event.target.value)}
            className={fieldClass(errors.merchant)}
            aria-invalid={Boolean(errors.merchant)}
            aria-describedby={errors.merchant ? `${id}-merchant-error` : undefined}
          />
          {errors.merchant && (
            <p id={`${id}-merchant-error`} className="mt-1 text-xs text-red-500">
              {errors.merchant}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-category`} className="mb-1.5 block text-xs font-medium">
            Category
          </label>
          <select
            id={`${id}-category`}
            value={form.category}
            onChange={(event) => setField('category', event.target.value as Category)}
            className={fieldClass()}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-description`} className="mb-1.5 block text-xs font-medium">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id={`${id}-description`}
            type="text"
            placeholder="Optional"
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            className={fieldClass()}
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 block text-xs font-medium">Type</legend>
          <div className="flex gap-2" role="radiogroup" aria-label="Transaction type">
            {(['expense', 'income'] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={form.type === type}
                onClick={() => setField('type', type)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  form.type === type
                    ? type === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            {editing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
