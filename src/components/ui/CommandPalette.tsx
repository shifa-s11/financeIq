import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type CommandItem =
  | {
      id: string;
      type: 'page';
      title: string;
      subtitle: string;
      action: () => void;
    }
  | {
      id: string;
      type: 'transaction';
      title: string;
      subtitle: string;
      amountLabel: string;
      action: () => void;
    };

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

export function CommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const transactions = useFinanceStore((state) => state.transactions);
  const setFilter = useFinanceStore((state) => state.setFilter);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

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

  const commands = useMemo<CommandItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const pageCommands: CommandItem[] = PAGE_COMMANDS.filter((page) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.subtitle.toLowerCase().includes(normalizedQuery)
      );
    }).map((page) => ({
      id: page.id,
      type: 'page',
      title: page.title,
      subtitle: page.subtitle,
      action: () => {
        navigate(page.path);
        setIsOpen(false);
      },
    }));

    const transactionCommands: CommandItem[] = transactions
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
        type: 'transaction',
        title: transaction.merchant,
        subtitle: `${transaction.category} · ${formatDate(transaction.date, 'MMM d, yyyy')}`,
        amountLabel: `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(
          transaction.amount
        )}`,
        action: () => {
          setFilter('search', transaction.merchant);
          navigate('/transactions');
          setIsOpen(false);
        },
      }));

    return [...pageCommands, ...transactionCommands];
  }, [navigate, query, setFilter, transactions]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen || commands.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % commands.length);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((current) => (current - 1 + commands.length) % commands.length);
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        commands[activeIndex]?.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, commands, isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!isOpen) {
    return null;
  }

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
            placeholder="Search pages or transactions"
            aria-label="Search commands"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <span className="hidden rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400 sm:inline-flex">
            Ctrl/Cmd + K
          </span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {commands.length === 0 ? (
            <div className="rounded-2xl px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">No results found</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try a merchant, category, or page name.
              </p>
            </div>
          ) : (
            commands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                onClick={command.action}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 ${
                  index === activeIndex
                    ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-light'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{command.title}</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {command.type}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    {command.subtitle}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {'amountLabel' in command && (
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {command.amountLabel}
                    </span>
                  )}
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
