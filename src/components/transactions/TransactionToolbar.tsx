import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CATEGORIES } from '@/data/mockData';
import type { Category, Filters } from '@/types';

interface TransactionToolbarProps {
  filters: Filters;
  searchValue: string;
  presetLabels: Record<Filters['datePreset'], string>;
  hasActiveFilters: boolean;
  canAdd: boolean;
  canExport: boolean;
  selectedCount: number;
  savedPresetNames: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: Filters['type']) => void;
  onSortByChange: (value: Filters['sortBy']) => void;
  onSortOrderToggle: () => void;
  onCategoryToggle: (category: Category) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDatePresetChange: (value: Filters['datePreset']) => void;
  onMerchantChange: (value: string) => void;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
  onExportSelected: () => void;
  onAddTransaction: () => void;
  onSavePreset: () => void;
  onApplyPreset: (name: string) => void;
}

function getMonthInputValue(date: string) {
  return date ? date.slice(0, 7) : '';
}

const DATE_PRESETS: Array<{ value: Filters['datePreset']; label: string }> = [
  { value: 'all', label: 'All time' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'last30Days', label: 'Last 30 days' },
  { value: 'last3Months', label: 'Last 3 months' },
];

function QuickToggle({
  active,
  label,
  onClick,
  activeClassName,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  activeClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-4 focus:ring-primary/15 ${
        active
          ? activeClassName
          : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

interface AdvancedFiltersProps {
  filters: Filters;
  presetLabels: Record<Filters['datePreset'], string>;
  hasActiveFilters: boolean;
  savedPresetNames: string[];
  onTypeChange: (value: Filters['type']) => void;
  onSortByChange: (value: Filters['sortBy']) => void;
  onSortOrderToggle: () => void;
  onCategoryToggle: (category: Category) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDatePresetChange: (value: Filters['datePreset']) => void;
  onMerchantChange: (value: string) => void;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onClearFilters: () => void;
  onSavePreset: () => void;
  onApplyPreset: (name: string) => void;
}

function AdvancedFilters({
  filters,
  hasActiveFilters,
  savedPresetNames,
  onTypeChange,
  onSortByChange,
  onSortOrderToggle,
  onCategoryToggle,
  onDateFromChange,
  onDateToChange,
  onDatePresetChange,
  onMerchantChange,
  onAmountMinChange,
  onAmountMaxChange,
  onClearFilters,
  onSavePreset,
  onApplyPreset,
  presetLabels,
}: AdvancedFiltersProps) {
  return (
    <div className="space-y-4">
      {savedPresetNames.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Saved presets
            </p>
            <Button variant="ghost" size="sm" onClick={onSavePreset}>
              Save current
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPresetNames.map((name) => (
              <Button key={name} variant="ghost" size="sm" onClick={() => onApplyPreset(name)}>
                {name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {savedPresetNames.length === 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onSavePreset}>
            Save current preset
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Date presets
        </p>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onDatePresetChange(preset.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                filters.datePreset === preset.value
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {presetLabels[preset.value]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Merchant
          </span>
          <input
            type="text"
            value={filters.merchant}
            onChange={(event) => onMerchantChange(event.target.value)}
            placeholder="Filter by merchant"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Min amount
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.amountMin}
            onChange={(event) => onAmountMinChange(event.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Max amount
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filters.amountMax}
            onChange={(event) => onAmountMaxChange(event.target.value)}
            placeholder="5000"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Sort by
          </span>
          <select
            value={filters.sortBy}
            onChange={(event) => onSortByChange(event.target.value as Filters['sortBy'])}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            From month
          </span>
          <input
            type="month"
            value={getMonthInputValue(filters.dateFrom)}
            onChange={(event) => onDateFromChange(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            To month
          </span>
          <input
            type="month"
            value={getMonthInputValue(filters.dateTo)}
            onChange={(event) => onDateToChange(event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>

        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Transaction type
          </span>
          <div className="flex flex-wrap gap-2">
            <QuickToggle active={filters.type === 'all'} label="All" onClick={() => onTypeChange('all')} activeClassName="bg-primary text-white" />
            <QuickToggle active={filters.type === 'income'} label="Income" onClick={() => onTypeChange('income')} activeClassName="bg-emerald-500 text-white" />
            <QuickToggle active={filters.type === 'expense'} label="Expense" onClick={() => onTypeChange('expense')} activeClassName="bg-red-500 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-2" role="group" aria-label="Filter transactions by category">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Categories
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const active = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryToggle(category)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-4 focus:ring-primary/15 ${
                  active
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-primary-light'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={onSortOrderToggle}>
          {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export function TransactionToolbar(props: TransactionToolbarProps) {
  const {
    filters,
    searchValue,
    presetLabels,
    hasActiveFilters,
    canAdd,
    canExport,
    selectedCount,
    savedPresetNames,
    onSearchChange,
    onTypeChange,
    onSortByChange,
    onSortOrderToggle,
    onCategoryToggle,
    onDateFromChange,
    onDateToChange,
    onDatePresetChange,
    onMerchantChange,
    onAmountMinChange,
    onAmountMaxChange,
    onClearFilters,
    onExport,
    onExportSelected,
    onAddTransaction,
    onSavePreset,
    onApplyPreset,
  } = props;

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  return (
    <div className="space-y-4 border-b border-gray-100 px-4 py-5 dark:border-gray-700 sm:px-6">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
          Control Center
        </p>
        <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Transaction Explorer
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search quickly, then bring in date, merchant, amount, and saved views only when needed.
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {canExport && (
              <Button variant="secondary" size="sm" onClick={onExport} icon={<Download size={14} />}>
                Export CSV
              </Button>
            )}
            {canExport && selectedCount > 0 && (
              <Button variant="secondary" size="sm" onClick={onExportSelected}>
                Export Selected ({selectedCount})
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onSavePreset}>
              Save preset
            </Button>
            {canAdd && (
              <Button variant="primary" size="sm" onClick={onAddTransaction} icon={<Plus size={14} />}>
                Add Transaction
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search merchant, description, or category"
            aria-label="Search transactions"
            className="w-full rounded-2xl border border-gray-200 bg-white px-10 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <QuickToggle
            active={filters.type === 'expense'}
            label="Expenses"
            onClick={() => onTypeChange(filters.type === 'expense' ? 'all' : 'expense')}
            activeClassName="bg-red-500 text-white"
          />
          <QuickToggle
            active={filters.type === 'income'}
            label="Income"
            onClick={() => onTypeChange(filters.type === 'income' ? 'all' : 'income')}
            activeClassName="bg-emerald-500 text-white"
          />
          <Button
            variant={filters.datePreset === 'all' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onDatePresetChange(filters.datePreset === 'all' ? 'last30Days' : 'all')}
          >
            {filters.datePreset === 'all' ? presetLabels.last30Days : 'All time'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setMobileFiltersOpen(true)} icon={<SlidersHorizontal size={14} />}>
            More filters
          </Button>
          {canExport && (
            <Button variant="secondary" size="sm" onClick={onExport} icon={<Download size={14} />}>
              Export
            </Button>
          )}
          {canExport && selectedCount > 0 && (
            <Button variant="secondary" size="sm" onClick={onExportSelected}>
              Selected ({selectedCount})
            </Button>
          )}
          {canAdd && (
            <Button variant="primary" size="sm" onClick={onAddTransaction} icon={<Plus size={14} />}>
              Add
            </Button>
          )}
        </div>
      </div>

      <div
        className="hidden space-y-4 rounded-[1.2rem] border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30 md:block"
        role="group"
        aria-label="Transaction filters"
      >
        <AdvancedFilters
          filters={filters}
          presetLabels={presetLabels}
          hasActiveFilters={hasActiveFilters}
          savedPresetNames={savedPresetNames}
          onTypeChange={onTypeChange}
          onSortByChange={onSortByChange}
          onSortOrderToggle={onSortOrderToggle}
          onCategoryToggle={onCategoryToggle}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onDatePresetChange={onDatePresetChange}
          onMerchantChange={onMerchantChange}
          onAmountMinChange={onAmountMinChange}
          onAmountMaxChange={onAmountMaxChange}
          onClearFilters={onClearFilters}
          onSavePreset={onSavePreset}
          onApplyPreset={onApplyPreset}
        />
      </div>

      {mobileFiltersOpen &&
        createPortal(
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-[1.75rem] border border-white/60 bg-white px-4 pb-6 pt-5 shadow-2xl dark:border-gray-700/80 dark:bg-gray-900">
              <div className="sticky top-0 z-10 mb-4 flex items-start justify-between gap-3 bg-white/95 pb-3 pt-1 dark:bg-gray-900/95">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
                    Advanced Filters
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    Refine the list
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close advanced filters"
                  className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <X size={16} />
                </button>
              </div>

              <AdvancedFilters
                filters={filters}
                presetLabels={presetLabels}
                hasActiveFilters={hasActiveFilters}
                savedPresetNames={savedPresetNames}
                onTypeChange={onTypeChange}
                onSortByChange={onSortByChange}
                onSortOrderToggle={onSortOrderToggle}
                onCategoryToggle={onCategoryToggle}
                onDateFromChange={onDateFromChange}
                onDateToChange={onDateToChange}
                onDatePresetChange={onDatePresetChange}
                onMerchantChange={onMerchantChange}
                onAmountMinChange={onAmountMinChange}
                onAmountMaxChange={onAmountMaxChange}
                onClearFilters={onClearFilters}
                onSavePreset={onSavePreset}
                onApplyPreset={onApplyPreset}
              />

              <Button variant="primary" onClick={() => setMobileFiltersOpen(false)} className="mt-5 w-full">
                Apply filters
              </Button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
