import { NavLink, useLocation } from 'react-router-dom';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Moon,
  Sun,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useSidebar } from '@/context/useSidebar';
import useFinanceStore from '@/store/useFinanceStore';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/insights', label: 'Insights', icon: TrendingUp },
];

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { theme, toggleTheme, selectedRole, setRole } = useFinanceStore();
  const location = useLocation();
  const isDark = theme === 'dark';

  return (
    <aside
      className="fixed left-0 top-0 z-30 hidden h-screen flex-col overflow-hidden border-r border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800 md:flex"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        willChange: 'width',
      }}
    >
      <div
        className={`flex h-16 flex-shrink-0 items-center border-b border-gray-100 dark:border-gray-700 ${
          collapsed ? 'justify-center' : 'gap-3 px-5'
        }`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
          <Wallet size={16} className="text-white" />
        </div>
        <span
          className={`whitespace-nowrap text-lg font-bold tracking-tight text-gray-900 transition-all duration-150 dark:text-white ${
            collapsed
              ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
              : 'max-w-40 translate-x-0 opacity-100'
          }`}
        >
          FinanceIQ
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-hidden px-2 py-4" aria-label="Primary">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={`flex items-center rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${
                collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span
                className={`whitespace-nowrap text-sm font-medium transition-all duration-150 ${
                  collapsed
                    ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
                    : 'max-w-40 translate-x-0 opacity-100'
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-gray-100 p-2 dark:border-gray-700">
        {!collapsed && (
          <div className="px-1 pb-1">
            <label
              htmlFor="sidebar-role-select"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
            >
              Role
            </label>
            <select
              id="sidebar-role-select"
              value={selectedRole}
              onChange={(event) => setRole(event.target.value as 'admin' | 'viewer' | 'analyst')}
              aria-label="Select current role"
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`flex items-center rounded-xl text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
            collapsed ? 'mx-auto h-10 w-10 justify-center' : 'w-full gap-3 px-3 py-2.5'
          }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span
            className={`whitespace-nowrap text-sm font-medium transition-all duration-150 ${
              collapsed
                ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
                : 'max-w-40 translate-x-0 opacity-100'
            }`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center rounded-xl text-gray-500 transition-all duration-150 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 dark:text-gray-400 dark:hover:bg-gray-700 ${
            collapsed ? 'mx-auto h-10 w-10 justify-center' : 'w-full gap-3 px-3 py-2.5'
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span
            className={`whitespace-nowrap text-sm font-medium transition-all duration-150 ${
              collapsed
                ? 'pointer-events-none max-w-0 -translate-x-1 opacity-0'
                : 'max-w-40 translate-x-0 opacity-100'
            }`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
