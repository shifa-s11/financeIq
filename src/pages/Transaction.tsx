import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Download, Plus,
  ChevronLeft, ChevronRight, ArrowUpDown,
  Pencil, Trash2, X, Check,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import useFinanceStore from '@/store/useFinanceStore';
import { usePermissions } from '@/hooks/usePermission';
import { useDebounce } from '@/hooks/useDebounce';
import { getFilteredTransactions } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { exportToCSV } from '@/utils/exportCSV';
import { CATEGORIES } from '@/data/mockData';
import type { Transaction, Category } from '@/types';

const PAGE_SIZE = 15;

// ── Transaction Form ─────────────────────────────────────────────────────────
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

const EMPTY_FORM: FormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  category: 'Food & Dining',
  description: '',
  type: 'expense',
  amount: '',
};

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.date) errors.date = 'Date is required';
  if (!form.merchant.trim()) errors.merchant = 'Merchant is required';
  const amt = parseFloat(form.amount);
  if (!form.amount || isNaN(amt) || amt <= 0)
    errors.amount = 'Enter a valid positive amount';
  return errors;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: Transaction | null;
}

function TransactionFormModal({ isOpen, onClose, editing }: TransactionModalProps) {
  const { addTransaction, updateTransaction, addToast } = useFinanceStore();

  const initialForm: FormData = editing
    ? {
        date: editing.date,
        merchant: editing.merchant,
        category: editing.category,
        description: editing.description,
        type: editing.type,
        amount: String(editing.amount),
      }
    : EMPTY_FORM;

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const tx: Transaction = {
      id: editing?.id ?? crypto.randomUUID(),
      date: form.date,
      merchant: form.merchant.trim(),
      category: form.category,
      description: form.description.trim(),
      type: form.type,
      amount: parseFloat(form.amount),
    };

    if (editing) {
      updateTransaction(editing.id, tx);
      addToast('Transaction updated successfully', 'success');
    } else {
      addTransaction(tx);
      addToast('Transaction added successfully', 'success');
    }

    setLoading(false);
    onClose();
  };

  const fieldClass = (err?: string) =>
    `w-full text-sm rounded-xl border px-3 py-2.5 bg-white dark:bg-gray-700
     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2
     transition-colors ${
       err
         ? 'border-red-400 focus:ring-red-400/30'
         : 'border-gray-200 dark:border-gray-600 focus:ring-primary/40'
     }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit Transaction' : 'Add Transaction'}
    >
      <div className="space-y-4">

        {/* Date + Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={fieldClass(errors.date)}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              className={fieldClass(errors.amount)}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Merchant */}
        <div>
          <label className="block text-xs font-medium mb-1.5">Merchant</label>
          <input
            type="text"
            placeholder="e.g. Amazon"
            value={form.merchant}
            onChange={(e) => set('merchant', e.target.value)}
            className={fieldClass(errors.merchant)}
          />
          {errors.merchant && <p className="text-xs text-red-500 mt-1">{errors.merchant}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className={fieldClass()}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={fieldClass()}
          />
        </div>

        {/* Type */}
        <div className="flex gap-2">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => set('type', t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            className="flex-1"
          >
            {editing ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Delete Confirmation Row ──────────────────────────────────────────────────
interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2"
    >
      <span className="text-xs text-red-500 font-medium">Delete?</span>
      <button
        onClick={onConfirm}
        className="p-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        title="Confirm delete"
      >
        <Check size={13} />
      </button>
      <button
        onClick={onCancel}
        className="p-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        title="Cancel"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Transactions() {
  const { transactions, filters, setFilter, clearFilters, deleteTransaction, addToast } =
    useFinanceStore();
  const { canAdd, canEdit, canDelete, canExport } = usePermissions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    document.title = 'Transactions — FinanceIQ';
  }, []);

  useEffect(() => {
    setFilter('search', debouncedSearch);
    setPage(1);
  }, [debouncedSearch, setFilter]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Auto-cancel delete confirmation after 5s
  useEffect(() => {
    if (!confirmingDelete) return;
    const t = setTimeout(() => setConfirmingDelete(null), 5000);
    return () => clearTimeout(t);
  }, [confirmingDelete]);

  const filtered = getFilteredTransactions(transactions, filters);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveFilters =
    filters.search || filters.categories.length > 0 ||
    filters.type !== 'all' || filters.dateFrom || filters.dateTo;

  const handleDelete = useCallback(
    (id: string) => {
      setDeletingId(id);
      setTimeout(() => {
        deleteTransaction(id);
        setDeletingId(null);
        setConfirmingDelete(null);
        addToast('Transaction deleted', 'success');
      }, 300);
    },
    [deleteTransaction, addToast]
  );

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (tx: Transaction) => { setEditing(tx); setModalOpen(true); };

  const toggleSort = (field: 'date' | 'amount' | 'category') => {
    if (filters.sortBy === field) {
      setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setFilter('sortBy', field);
      setFilter('sortOrder', 'desc');
    }
  };

  const SortBtn = ({ field, label }: { field: 'date' | 'amount' | 'category'; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
        filters.sortBy === field
          ? 'text-primary'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
      }`}
    >
      {label}
      <ArrowUpDown size={12} className={filters.sortBy === field ? 'text-primary' : ''} />
    </button>
  );

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <Card className="p-4! space-y-3">
        {/* Row 1: Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search merchant, category, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shrink-0">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setFilter('type', t); setPage(1); }}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  filters.type === t
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category filters + Sort + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {CATEGORIES.filter(c => !['Salary', 'Freelance'].includes(c)).map((cat) => {
              const active = filters.categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const next = active
                      ? filters.categories.filter((c) => c !== cat)
                      : [...filters.categories, cat];
                    setFilter('categories', next);
                    setPage(1);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-600 pl-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <SortBtn field="date" label="Date" />
            <SortBtn field="amount" label="Amount" />
            <SortBtn field="category" label="Category" />
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearFilters(); setSearch(''); setPage(1); }}
              icon={<X size={13} />}
            >
              Clear
            </Button>
          )}

          {/* Export */}
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCSV(filtered)}
              icon={<Download size={13} />}
            >
              Export
            </Button>
          )}

          {/* Add */}
          {canAdd && (
            <Button
              variant="primary"
              size="sm"
              onClick={openAdd}
              icon={<Plus size={13} />}
            >
              Add
            </Button>
          )}
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {filtered.length}
          </span>{' '}
          transactions
        </p>
      </div>

      {/* Table — desktop */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={hasActiveFilters ? { label: 'Clear filters', onClick: () => { clearFilters(); setSearch(''); } } : undefined}
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="p-0! overflow-hidden hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Date', 'Merchant', 'Category', 'Description', 'Type', 'Amount', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                <AnimatePresence>
                  {paginated.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: deletingId === tx.id ? 0 : 1,
                        height: deletingId === tx.id ? 0 : 'auto',
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(tx.date, 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-35">
                          {tx.merchant}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge category={tx.category} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400 max-w-45">
                        <span className="truncate block" title={tx.description}>
                          {tx.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <span className={tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <AnimatePresence mode="wait">
                          {confirmingDelete === tx.id ? (
                            <DeleteConfirm
                              onConfirm={() => handleDelete(tx.id)}
                              onCancel={() => setConfirmingDelete(null)}
                            />
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-1"
                            >
                              {canEdit && (
                                <button
                                  onClick={() => openEdit(tx)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-primary transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setConfirmingDelete(tx.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {paginated.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: deletingId === tx.id ? 0 : 1,
                    scale: deletingId === tx.id ? 0.95 : 1,
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="p-4!">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {tx.merchant}
                          </p>
                          <Badge category={tx.category} size="sm" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(tx.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className={`text-sm font-bold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <AnimatePresence mode="wait">
                          {confirmingDelete === tx.id ? (
                            <DeleteConfirm
                              onConfirm={() => handleDelete(tx.id)}
                              onCancel={() => setConfirmingDelete(null)}
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              {canEdit && (
                                <button
                                  onClick={() => openEdit(tx)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-primary"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setConfirmingDelete(tx.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                icon={<ChevronLeft size={14} />}
              >
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${i}`} className="text-gray-400 text-sm px-1">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? 'bg-primary text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
     <TransactionFormModal
  key={editing?.id ?? 'new'}  
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  editing={editing}
/>
    </div>
  );
}