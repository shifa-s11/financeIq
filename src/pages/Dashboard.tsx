import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';
import { BalanceAreaChart } from '@/components/charts/AreaChart';
import { SpendingPieChart } from '@/components/charts/PieChart';
import { TopCategoriesBarChart } from '@/components/charts/BarChart';
import useFinanceStore from '@/store/useFinanceStore';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';
import {
  getMonthlyData,
  getCategoryBreakdown,
  getCurrentMonthSummary,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor } from '@/utils/getCategoryColor';

// ── Summary Card ────────────────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  trend: number;
  isPercent?: boolean;
  loading: boolean;
}

function SummaryCard({
  label,
  value,
  icon,
  iconBg,
  trend,
  isPercent = false,
  loading,
}: SummaryCardProps) {
  const animated = useCounterAnimation(Math.round(value), 1200, !loading);
  const trendPositive = trend >= 0;

  if (loading) return <SkeletonCard />;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isPercent
              ? `${animated}%`
              : formatCurrency(animated)}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {trendPositive ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span className={`text-xs font-medium ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
          {trendPositive ? '+' : ''}{trend}%
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          vs last month
        </span>
      </div>
    </Card>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const transactions = useFinanceStore((s) => s.transactions);

  useEffect(() => {
    document.title = 'Dashboard — FinanceIQ';
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const monthly = getMonthlyData(transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const summary = getCurrentMonthSummary(transactions);
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const totalBalance = monthly.reduce((s, m) => s + m.savings, 0);

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Balance"
          value={totalBalance}
          icon={<Wallet size={20} className="text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/40"
          trend={summary.vsLastMonth.income}
          loading={loading}
        />
        <SummaryCard
          label="Monthly Income"
          value={summary.income}
          icon={<TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          trend={summary.vsLastMonth.income}
          loading={loading}
        />
        <SummaryCard
          label="Monthly Expenses"
          value={summary.expenses}
          icon={<TrendingDown size={20} className="text-red-500" />}
          iconBg="bg-red-100 dark:bg-red-900/40"
          trend={summary.vsLastMonth.expenses}
          loading={loading}
        />
        <SummaryCard
          label="Savings Rate"
          value={summary.savingsRate}
          icon={<PiggyBank size={20} className="text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          trend={summary.vsLastMonth.income - summary.vsLastMonth.expenses}
          isPercent
          loading={loading}
        />
      </div>

      {/* Balance Trend Chart */}
      <Card className="p-0! overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Balance Trend
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Income vs Expenses — Jan to Jun 2025
            </p>
          </div>
        </div>
        {loading ? (
          <div className="px-6 pb-5">
            <Skeleton height="h-64" />
          </div>
        ) : (
          <div className="px-2 pb-4">
            <BalanceAreaChart data={monthly} />
          </div>
        )}
      </Card>

      {/* Pie + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Spending Breakdown
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton height="h-48" rounded="rounded-full" className="mx-auto w-48" />
              {[1, 2, 3].map((i) => <Skeleton key={i} height="h-3" />)}
            </div>
          ) : (
            <SpendingPieChart data={breakdown} />
          )}
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Top Categories
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton width="w-20" height="h-3" />
                  <Skeleton height="h-6" />
                </div>
              ))}
            </div>
          ) : (
            <TopCategoriesBarChart data={breakdown} />
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-0! overflow-hidden">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="w-32" height="h-3" />
                  <Skeleton width="w-20" height="h-2.5" />
                </div>
                <Skeleton width="w-16" height="h-4" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recent.map((tx) => {
              const color = getCategoryColor(tx.category);
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.bg}`}>
                    <span className={`text-xs font-bold ${color.text}`}>
                      {tx.category.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {tx.merchant}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge category={tx.category} size="sm" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(tx.date, 'MMM d')}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <p className={`text-sm font-semibold shrink-0 ${
                    tx.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

