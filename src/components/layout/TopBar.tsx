import { format } from 'date-fns';
import { Command, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import useFinanceStore from '@/store/useFinanceStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/insights': 'Insights',
};

export function TopBar() {
  const location = useLocation();
  const { theme, toggleTheme, selectedRole, setRole } = useFinanceStore();
  const isDark = theme === 'dark';

  const title = PAGE_TITLES[location.pathname] ?? 'FinanceIQ';
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-gray-700/80 dark:bg-gray-900/70 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
            FinanceIQ Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {today}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2">
            {selectedRole === 'viewer' && (
              <span className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 md:inline-flex">
                View Only
              </span>
            )}

            <button
              type="button"
              aria-label="Open command palette"
              className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 md:inline-flex"
              onClick={() => {
                document.dispatchEvent(new CustomEvent('financeiq:open-command-palette'));
              }}
            >
              <Command size={14} />
              Search
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                Ctrl/Cmd+K
              </span>
            </button>

            <select
              value={selectedRole}
              onChange={(event) => setRole(event.target.value as 'admin' | 'viewer' | 'analyst')}
              aria-label="Select current role"
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 md:hidden"
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
