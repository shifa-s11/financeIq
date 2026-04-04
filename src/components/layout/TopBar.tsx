import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Sun, Moon } from 'lucide-react';
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
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          {today}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* View Only badge — desktop */}
        {selectedRole === 'viewer' && (
          <span className="hidden md:inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            View Only
          </span>
        )}

        {/* Mobile: role switcher */}
        <select
          value={selectedRole}
          onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
          className="md:hidden text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>

        {/* Mobile: theme toggle */}
        <button
          onClick={toggleTheme}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}