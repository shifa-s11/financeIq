import { ArrowLeftRight, LayoutDashboard, TrendingUp } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/insights', label: 'Insights', icon: TrendingUp },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/70 bg-white/85 px-2 pb-2 pt-2 backdrop-blur-xl dark:border-gray-700/80 dark:bg-gray-900/80 md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-3 gap-2">
        {TABS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2.5 text-[11px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/12 text-primary shadow-sm dark:bg-primary/18 dark:text-primary-light'
                  : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span
                className={`absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full transition-opacity ${
                  isActive ? 'bg-primary opacity-100' : 'opacity-0'
                }`}
              />
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
