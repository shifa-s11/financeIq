import { useEffect, useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/transactions/Pagination';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionToolbar } from '@/components/transactions/TransactionToolbar';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { useTransactionsView } from '@/hooks/useTransactionsView';
import useFinanceStore from '@/store/useFinanceStore';
import { getReferenceDate } from '@/utils/calculateSummary';
import { exportToCSV } from '@/utils/exportCSV';
import { formatCurrency } from '@/utils/formatCurrency';
import { setPageMetadata } from '@/utils/setPageMetadata';
import type { Category, Filters, Transaction } from '@/types';

const PAGE_SIZE = 15;
const FILTER_PRESETS_STORAGE_KEY = 'finance-filter-presets';

interface SavedFilterPreset {
  name: string;
  filters: Filters;
}

function toMonthBoundary(value: string, boundary: 'start' | 'end') {
  if (!value) {
    return '';
  }

  if (boundary === 'start') {
    return `${value}-01`;
  }

  const [year, month] = value.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${value}-${String(lastDay).padStart(2, '0')}`;
}

export default function Transactions() {
  const transactions = useFinanceStore((state) => state.transactions);
  const filters = useFinanceStore((state) => state.filters);
  const setFilter = useFinanceStore((state) => state.setFilter);
  const clearFilters = useFinanceStore((state) => state.clearFilters);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const restoreTransaction = useFinanceStore((state) => state.restoreTransaction);
  const addToast = useFinanceStore((state) => state.addToast);
  const permissions = usePermissions();

  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [presetName, setPresetName] = useState('');
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetNameError, setPresetNameError] = useState('');
  const [presetOverwrite, setPresetOverwrite] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>(() => {
    try {
      const raw = localStorage.getItem(FILTER_PRESETS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedFilterPreset[]) : [];
    } catch {
      return [];
    }
  });

  const debouncedSearch = useDebounce(searchValue, 300);

  useEffect(() => {
    setPageMetadata({
      title: 'Transactions',
      description:
        'Review, filter, group, and export financial activity in FinanceIQ with saved presets, bulk actions, and responsive transaction management.',
    });
  }, []);

  useEffect(() => {
    setFilter('search', debouncedSearch.trim());
  }, [debouncedSearch, setFilter]);

  useEffect(() => {
    if (filters.search !== searchValue && searchValue === debouncedSearch) {
      setSearchValue(filters.search);
    }
  }, [debouncedSearch, filters.search, searchValue]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const handleOpenAdd = () => {
      setEditing(null);
      setIsModalOpen(true);
    };

    document.addEventListener(
      'financeiq:add-transaction',
      handleOpenAdd as EventListener
    );
    return () => {
      document.removeEventListener(
        'financeiq:add-transaction',
        handleOpenAdd as EventListener
      );
    };
  }, []);

  const { filteredTransactions, paginatedTransactions, totalPages, hasActiveFilters } =
    useTransactionsView(transactions, filters, page, PAGE_SIZE);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) =>
        filteredTransactions.some((transaction) => transaction.id === id)
      )
    );
  }, [filteredTransactions]);

  const exportFilename = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10);
    return `transactions-${date}`;
  }, []);

  const presetLabels = useMemo(() => {
    const referenceDate = getReferenceDate(transactions);
    const currentMonthLabel = format(referenceDate, 'MMM yyyy');
    const previousMonth = subMonths(referenceDate, 1);
    const previousMonthLabel = format(previousMonth, 'MMM yyyy');
    const threeMonthRangeLabel = `${format(subMonths(referenceDate, 2), 'MMM')} - ${format(
      referenceDate,
      'MMM yyyy'
    )}`;

    return {
      all: 'All time',
      thisMonth: `This month (${currentMonthLabel} to date)`,
      lastMonth: `Last month (${previousMonthLabel})`,
      last30Days: `Last 30 days (through ${format(referenceDate, 'MMM d')})`,
      last3Months: `Last 3 months (${threeMonthRangeLabel})`,
    } as const;
  }, [transactions]);

  const handleCategoryToggle = (category: Category) => {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    setFilter('categories', nextCategories);
  };

  const handleDateChange = (key: 'dateFrom' | 'dateTo', value: string) => {
    setFilter('datePreset', 'all');
    setFilter(key, value ? toMonthBoundary(value, key === 'dateFrom' ? 'start' : 'end') : '');
  };

  const handleSortByChange = (value: Filters['sortBy']) => {
    setFilter('sortBy', value);
  };

  const handleTypeChange = (value: Filters['type']) => {
    setFilter('type', value);
  };

  const handleSortOrderToggle = () => {
    setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDeleteTransaction = (id: string) => {
    const deletedTransaction = transactions.find((transaction) => transaction.id === id);
    deleteTransaction(id);
    addToast(
      deletedTransaction
        ? `Deleted ${deletedTransaction.merchant} for ${formatCurrency(
            deletedTransaction.amount
          )}.`
        : 'Transaction deleted successfully.',
      'success',
      deletedTransaction
        ? {
            actionLabel: 'Undo',
            action: () => {
              restoreTransaction(deletedTransaction);
              addToast(`Restored ${deletedTransaction.merchant}.`, 'info');
            },
          }
        : undefined
    );
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditing(transaction);
    setIsModalOpen(true);
  };

  const handleAddTransaction = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleExport = () => {
    exportToCSV(filteredTransactions, exportFilename);
    addToast(`Exported ${filteredTransactions.length} filtered transactions to CSV.`, 'info');
  };

  const handleExportSelected = () => {
    const selectedTransactions = filteredTransactions.filter((transaction) =>
      selectedIds.includes(transaction.id)
    );
    exportToCSV(selectedTransactions, `${exportFilename}-selected`);
    addToast(`Exported ${selectedTransactions.length} selected transactions.`, 'info');
  };

  const persistPresets = (nextPresets: SavedFilterPreset[]) => {
    setSavedPresets(nextPresets);
    localStorage.setItem(FILTER_PRESETS_STORAGE_KEY, JSON.stringify(nextPresets));
  };

  const handleSavePreset = () => {
    setPresetName(`High value ${savedPresets.length + 1}`);
    setPresetNameError('');
    setPresetOverwrite(false);
    setPresetModalOpen(true);
  };

  const handleConfirmSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      setPresetNameError('Please enter a preset name.');
      return;
    }

    const nextPreset = { name, filters: { ...filters, search: searchValue } };
    const existingIndex = savedPresets.findIndex(
      (preset) => preset.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex >= 0) {
      if (!presetOverwrite) {
        setPresetOverwrite(true);
        setPresetNameError(`"${name}" already exists. Save again to replace it.`);
        return;
      }

      const nextPresets = [...savedPresets];
      nextPresets[existingIndex] = nextPreset;
      persistPresets(nextPresets);
      addToast(`Updated filter preset "${name}".`, 'success');
      setPresetModalOpen(false);
      setPresetName('');
      setPresetOverwrite(false);
      setPresetNameError('');
      return;
    }

    persistPresets([...savedPresets, nextPreset]);
    addToast(`Saved filter preset "${name}".`, 'success');
    setPresetModalOpen(false);
    setPresetName('');
    setPresetOverwrite(false);
    setPresetNameError('');
  };

  const handleApplyPreset = (name: string) => {
    const preset = savedPresets.find((item) => item.name === name);
    if (!preset) return;

    Object.entries(preset.filters).forEach(([key, value]) => {
      setFilter(key as keyof Filters, value as Filters[keyof Filters]);
    });
    setSearchValue(preset.filters.search);
    addToast(`Applied filter preset "${name}".`, 'info');
  };

  const handleDeletePreset = (name: string) => {
    setPresetToDelete(name);
  };

  const confirmDeletePreset = () => {
    if (!presetToDelete) {
      return;
    }

    const nextPresets = savedPresets.filter((preset) => preset.name !== presetToDelete);
    persistPresets(nextPresets);
    addToast(`Deleted filter preset "${presetToDelete}".`, 'info');
    setPresetToDelete(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-primary/10 via-white/80 to-sky-50/70 px-6 py-6 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.25)] dark:border-gray-700/80 dark:from-primary/15 dark:via-gray-900/80 dark:to-sky-900/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70 dark:text-primary-light/70">
          Ledger Control
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Review activity without losing the plot.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Search fast on mobile, open deeper filters only when needed, and keep
          transaction details close enough to inspect without leaving the page.
        </p>
      </section>

      <Card className="overflow-hidden p-0">
        <TransactionToolbar
          filters={filters}
          searchValue={searchValue}
          presetLabels={presetLabels}
          hasActiveFilters={hasActiveFilters}
          canAdd={permissions.canAdd}
          canExport={permissions.canExport}
          selectedCount={selectedIds.length}
          savedPresetNames={savedPresets.map((preset) => preset.name)}
          onSearchChange={setSearchValue}
          onTypeChange={handleTypeChange}
          onSortByChange={handleSortByChange}
          onSortOrderToggle={handleSortOrderToggle}
          onCategoryToggle={handleCategoryToggle}
          onDateFromChange={(value) => handleDateChange('dateFrom', value)}
          onDateToChange={(value) => handleDateChange('dateTo', value)}
          onDatePresetChange={(value) => {
            setFilter('datePreset', value);
            if (value !== 'all') {
              setFilter('dateFrom', '');
              setFilter('dateTo', '');
            }
          }}
          onMerchantChange={(value) => setFilter('merchant', value)}
          onAmountMinChange={(value) => setFilter('amountMin', value)}
          onAmountMaxChange={(value) => setFilter('amountMax', value)}
          onClearFilters={() => {
            clearFilters();
            setSearchValue('');
          }}
          onClearSelection={() => setSelectedIds([])}
          onExport={handleExport}
          onExportSelected={handleExportSelected}
          onAddTransaction={handleAddTransaction}
          onSavePreset={handleSavePreset}
          onApplyPreset={handleApplyPreset}
          onDeletePreset={handleDeletePreset}
        />

        <TransactionTable
          transactions={paginatedTransactions}
          selectedIds={selectedIds}
          canEdit={permissions.canEdit}
          canDelete={permissions.canDelete}
          hasActiveFilters={hasActiveFilters}
          onToggleSelect={(id) =>
            setSelectedIds((current) =>
              current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
            )
          }
          onToggleSelectAll={(ids) =>
            setSelectedIds((current) =>
              ids.every((id) => current.includes(id))
                ? current.filter((id) => !ids.includes(id))
                : Array.from(new Set([...current, ...ids]))
            )
          }
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onClearFilters={() => {
            clearFilters();
            setSearchValue('');
          }}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editing={editing}
      />

      <Modal
        isOpen={presetModalOpen}
        onClose={() => {
          setPresetModalOpen(false);
          setPresetNameError('');
          setPresetOverwrite(false);
        }}
        title="Save Filter Preset"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleConfirmSavePreset();
          }}
        >
          <div>
            <label
              htmlFor="preset-name"
              className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Preset name
            </label>
            <input
              id="preset-name"
              type="text"
              value={presetName}
              onChange={(event) => {
                setPresetName(event.target.value);
                setPresetNameError('');
                setPresetOverwrite(false);
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus-visible:ring-4 ${
                presetNameError
                  ? 'border-red-400 bg-white text-gray-900 focus-visible:ring-red-400/20 dark:bg-gray-700 dark:text-gray-100'
                  : 'border-gray-200 bg-white text-gray-900 focus-visible:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
              }`}
              placeholder="e.g. High spend vendors"
            />
            {presetNameError && (
              <p className="mt-1 text-xs text-red-500">{presetNameError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Save the current search, date, amount, merchant, and category filters as a reusable view.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPresetModalOpen(false);
                setPresetNameError('');
                setPresetOverwrite(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {presetOverwrite ? 'Replace preset' : 'Save preset'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(presetToDelete)}
        onClose={() => setPresetToDelete(null)}
        title="Delete Preset"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            Delete the preset{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {presetToDelete}
            </span>
            ? This only removes the saved view and does not affect your transactions.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPresetToDelete(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDeletePreset}
              className="flex-1"
            >
              Delete preset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
