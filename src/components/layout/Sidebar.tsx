import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import { useSidebar } from '@/context/useSidebar';

const NAV_LINKS = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/insights',     label: 'Insights',     icon: TrendingUp },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { theme, toggleTheme, selectedRole, setRole } = useFinanceStore();
  const location = useLocation();
  const isDark = theme === 'dark';

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col h-screen bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex-shrink-0 overflow-hidden fixed left-0 top-0 z-30"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 ${collapsed ? 'justify-center' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Wallet size={16} className="text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="font-bold text-gray-900 dark:text-white text-lg tracking-tight whitespace-nowrap"
          >
            FinanceIQ
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`
                flex items-center rounded-xl transition-all duration-150
                ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'}
                ${isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-2 space-y-1 flex-shrink-0">

        {/* Role Switcher — only when expanded */}
        {!collapsed && (
          <div className="px-1 pb-1">
            <label className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide block mb-1.5">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
              className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        )}

        {/* Theme Toggle — always visible */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`
            flex items-center rounded-xl transition-all duration-150
            text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
          `}
        >
          {isDark
            ? <Sun size={18} className="flex-shrink-0" />
            : <Moon size={18} className="flex-shrink-0" />
          }
          {!collapsed && (
            <span className="text-sm font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`
            flex items-center rounded-xl transition-all duration-150
            text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
          `}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && (
            <span className="text-sm font-medium text-gray-500">Collapse</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}