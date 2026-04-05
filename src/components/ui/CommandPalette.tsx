import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Command, Moon, Plus, Search, Sun, UserCog } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Role } from '@/types';

type CommandSection = 'Quick Actions' | 'Pages' | 'Recent Searches' | 'Transactions';

interface CommandItem {
  id: string;
  section: CommandSection;
  title: string;
  subtitle: string;
  badge?: string;
  icon?: React.ReactNode;
  amountLabel?: string;
  action: () => void;
}

const RECENT_SEARCHES_KEY = 'financeiq-command-recent-searches';

const PAGE_COMMANDS = [
  { id: 'page-dashboard', title: 'Dashboard', subtitle: 'Go to overview', path: '/' },
  {
    id: 'page-transactions',
    title: 'Transactions',
    subtitle: 'Review and filter activity',
    path: '/transactions',
  },
  { id: 'page-insights', title: 'Insights', subtitle: 'View smart signals', path: '/insights' },
] as const;

function roleLabel(role: Role) {
  if (role === 'admin') return 'Admin';
  if (role === 'analyst') return 'Analyst';
  return 'Viewer';
}

export function CommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const transactions = useFinanceStore((state) => state.transactions);
  const setFilter = useFinanceStore((state) => state.setFilter);
  const selectedRole = useFinanceStore((state) => state.selectedRole);
  const setRole = useFinanceStore((state) => state.setRole);
  const theme = useFinanceStore((state) => state.theme);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener('financeiq:open-command-palette', handleOpen as EventListener);
    return () => {
      document.removeEventListener(
        'financeiq:open-command-palette',
        handleOpen as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const rememberSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) {
      return;
    }

    setRecentSearches((current) => {
      const next = [clean, ...current.filter((item) => item.toLowerCase() !== clean.toLowerCase())]
        .slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const runTransactionSearch = (term: string) => {
    rememberSearch(term);
    setFilter('search', term);
    navigate('/transactions');
    setIsOpen(false);
  };

  const sections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const quickActions: CommandItem[] = [
      {
        id: 'quick-theme',
        section: 'Quick Actions' as const,
        title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        subtitle: 'Toggle the workspace theme',
        badge: 'Action',
        icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
        action: () => {
          toggleTheme();
          setIsOpen(false);
        },
      },
      {
        id: 'quick-role-admin',
        section: 'Quick Actions' as const,
        title: 'Switch role to Admin',
        subtitle: `Current role: ${roleLabel(selectedRole)}`,
        badge: 'Role',
        icon: <UserCog size={14} />,
        action: () => {
          setRole('admin');
          setIsOpen(false);
        },
      },
      {
        id: 'quick-role-analyst',
        section: 'Quick Actions' as const,
        title: 'Switch role to Analyst',
        subtitle: `Current role: ${roleLabel(selectedRole)}`,
        badge: 'Role',
        icon: <UserCog size={14} />,
        action: () => {
          setRole('analyst');
          setIsOpen(false);
        },
      },
      {
        id: 'quick-role-viewer',
        section: 'Quick Actions' as const,
        title: 'Switch role to Viewer',
        subtitle: `Current role: ${roleLabel(selectedRole)}`,
        badge: 'Role',
        icon: <UserCog size={14} />,
        action: () => {
          setRole('viewer');
          setIsOpen(false);
        },
      },
      {
        id: 'quick-add-transaction',
        section: 'Quick Actions' as const,
        title: 'Add transaction',
        subtitle: 'Jump straight into the add transaction modal',
        badge: 'Action',
        icon: <Plus size={14} />,
        action: () => {
          navigate('/transactions', { state: { openAddTransaction: true } });
          setIsOpen(false);
        },
      },
    ].filter((item) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery)
      );
    });

    const pages: CommandItem[] = PAGE_COMMANDS.filter((page) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.subtitle.toLowerCase().includes(normalizedQuery)
      );
    }).map((page) => ({
      id: page.id,
      section: 'Pages',
      title: page.title,
      subtitle: page.subtitle,
      badge: 'Page',
      action: () => {
        navigate(page.path);
        setIsOpen(false);
      },
    }));

    const recent: CommandItem[] = recentSearches
      .filter((term) => !normalizedQuery || term.toLowerCase().includes(normalizedQuery))
      .map((term) => ({
        id: `recent-${term}`,
        section: 'Recent Searches',
        title: term,
        subtitle: 'Re-run this transaction search',
        badge: 'Recent',
        icon: <Search size={14} />,
        action: () => runTransactionSearch(term),
      }));

    const transactionItems: CommandItem[] = transactions
      .filter((transaction) => {
        if (!normalizedQuery) {
          return false;
        }

        return (
          transaction.merchant.toLowerCase().includes(normalizedQuery) ||
          transaction.description.toLowerCase().includes(normalizedQuery) ||
          transaction.category.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6)
      .map((transaction) => ({
        id: transaction.id,
        section: 'Transactions',
        title: transaction.merchant,
        subtitle: `${transaction.category} · ${formatDate(transaction.date, 'MMM d, yyyy')}`,
        amountLabel: `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(
          transaction.amount
        )}`,
        badge: transaction.type,
        action: () => runTransactionSearch(transaction.merchant),
      }));

    return [
      { label: 'Quick Actions' as const, items: quickActions },
      { label: 'Pages' as const, items: pages },
      { label: 'Recent Searches' as const, items: recent },
      { label: 'Transactions' as const, items: transactionItems },
    ].filter((section) => section.items.length > 0);
  }, [
    navigate,
    query,
    recentSearches,
    selectedRole,
    setFilter,
    setRole,
    theme,
    toggleTheme,
    transactions,
  ]);

  const flatCommands = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen || flatCommands.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % flatCommands.length);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + flatCommands.length) % flatCommands.length);
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        flatCommands[activeIndex]?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, flatCommands, isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!isOpen) {
    return null;
  }

  let runningIndex = -1;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/45 px-4 pb-6 pt-[10vh] backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close command palette overlay"
        onClick={() => setIsOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/75 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.55)] dark:border-gray-700/80 dark:bg-gray-900"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <Search size={18} className="text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, transactions, or actions"
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <span className="hidden items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:inline-flex">
            <Command size={12} />
            Ctrl/Cmd + K
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {flatCommands.length === 0 ? (
            <div className="rounded-2xl px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No results found</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try a merchant, category, role action, or page name.
              </p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.label} className="mb-3 last:mb-0">
                <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((command) => {
                    runningIndex += 1;
                    const isActive = runningIndex === activeIndex;

                    return (
                      <button
                        key={command.id}
                        type="button"
                        onClick={command.action}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${
                          isActive
                            ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-light'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/80'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {command.icon}
                            <p className="truncate text-sm font-medium">{command.title}</p>
                            {command.badge && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                {command.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                            {command.subtitle}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          {command.amountLabel && (
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {command.amountLabel}
                            </span>
                          )}
                          <ArrowRight size={14} className="text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
