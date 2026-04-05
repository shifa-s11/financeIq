import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { BalanceAreaChart } from '@/components/charts/AreaChart';
import { TopCategoriesBarChart } from '@/components/charts/BarChart';
import { CumulativeSavingsChart } from '@/components/charts/CumulativeSavingsChart';
import { SpendingPieChart } from '@/components/charts/PieChart';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';
import { useDashboardData } from '@/hooks/useDashboardData';
import useFinanceStore from '@/store/useFinanceStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { setPageMetadata } from '@/utils/setPageMetadata';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  trend: number;
  loading: boolean;
  isPercent?: boolean;
  accent: string;
  tint: string;
  sparkline: number[];
}

function SummaryCard({
  label,
  value,
  icon,
  iconBg,
  trend,
  loading,
  isPercent = false,
  accent,
  tint,
  sparkline,
}: SummaryCardProps) {
  const animated = useCounterAnimation(Math.round(value), 1200, !loading);
  const trendPositive = trend >= 0;

  if (loading) {
    return <SkeletonCard />;
  }

  return (
    <Card className={`overflow-hidden ${tint}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isPercent ? `${animated}%` : formatCurrency(animated)}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {trendPositive ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span
          className={`text-xs font-medium ${
            trendPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-500'
          }`}
        >
          {trendPositive ? '+' : ''}
          {trend}%
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          vs last month
        </span>
      </div>

      <div className="mt-5">
        <div className="flex h-10 items-end gap-1">
          {sparkline.map((point, index) => (
            <span
              key={`${label}-${index}`}
              className="flex-1 rounded-full"
              style={{
                height: `${Math.max(18, point)}%`,
                background: accent,
                opacity: 0.28 + index * 0.08,
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const transactions = useFinanceStore((state) => state.transactions);
  const {
    monthly,
    breakdown,
    summary,
    recentTransactions,
    totalBalance,
    cumulativeSavings,
    topMerchants,
    goalProgress,
    weekdayWeekendSpending,
  } =
    useDashboardData(transactions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMetadata({
      title: 'Dashboard',
      description:
        'View FinanceIQ dashboard summaries, spending breakdowns, balance trends, savings momentum, top merchants, and recent transaction activity.',
    });
    const timeout = window.setTimeout(() => setLoading(false), 800);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-primary/10 via-white/80 to-emerald-50/70 px-6 py-6 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.25)] dark:border-gray-700/80 dark:from-primary/15 dark:via-gray-900/80 dark:to-emerald-900/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70 dark:text-primary-light/70">
          Portfolio Overview
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Your cash flow story at a glance.
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              FinanceIQ turns six months of activity into a clear rhythm of income,
              spending, and recovery so the dashboard feels less like a report and
              more like a decision surface.
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm dark:border-gray-700/80 dark:bg-gray-800/80">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Net position
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Balance"
          value={totalBalance}
          icon={<Wallet size={20} className="text-indigo-600 dark:text-indigo-300" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/40"
          trend={Number((summary.vsLastMonth.income - summary.vsLastMonth.expenses).toFixed(1))}
          loading={loading}
          accent="linear-gradient(180deg, rgba(99,102,241,0.95), rgba(129,140,248,0.42))"
          tint="bg-gradient-to-br from-indigo-50/90 to-white dark:from-indigo-950/35 dark:to-gray-800"
          sparkline={[34, 58, 50, 76, 68, 88]}
        />
        <SummaryCard
          label="Monthly Income"
          value={summary.income}
          icon={<TrendingUp size={20} className="text-emerald-600 dark:text-emerald-300" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          trend={summary.vsLastMonth.income}
          loading={loading}
          accent="linear-gradient(180deg, rgba(16,185,129,0.95), rgba(52,211,153,0.42))"
          tint="bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/30 dark:to-gray-800"
          sparkline={[56, 62, 58, 66, 60, 82]}
        />
        <SummaryCard
          label="Monthly Expenses"
          value={summary.expenses}
          icon={<TrendingDown size={20} className="text-rose-500 dark:text-rose-300" />}
          iconBg="bg-rose-100 dark:bg-rose-900/40"
          trend={summary.vsLastMonth.expenses}
          loading={loading}
          accent="linear-gradient(180deg, rgba(244,63,94,0.95), rgba(251,113,133,0.4))"
          tint="bg-gradient-to-br from-rose-50/90 to-white dark:from-rose-950/25 dark:to-gray-800"
          sparkline={[44, 52, 82, 46, 54, 58]}
        />
        <SummaryCard
          label="Savings Rate"
          value={summary.savingsRate}
          icon={<PiggyBank size={20} className="text-amber-600 dark:text-amber-300" />}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          trend={summary.vsLastMonth.income - summary.vsLastMonth.expenses}
          loading={loading}
          isPercent
          accent="linear-gradient(180deg, rgba(245,158,11,0.95), rgba(251,191,36,0.42))"
          tint="bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/25 dark:to-gray-800"
          sparkline={[26, 24, 18, 42, 54, 70]}
        />
      </div>

      <Card className="overflow-hidden p-0">
        <section aria-label="Balance trend chart">
          <div className="px-6 pb-2 pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Trendline
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Balance Trend
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Follow how income and expenses move against each other over the last six months.
            </p>
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
        </section>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <section aria-label="Spending breakdown chart">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Distribution
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Spending Breakdown
            </h2>
            <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
              See which categories absorb the most of your monthly outflow.
            </p>
            {loading ? (
              <div className="space-y-3">
                <Skeleton
                  height="h-48"
                  rounded="rounded-full"
                  className="mx-auto w-48"
                />
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} height="h-3" />
                ))}
              </div>
            ) : (
              <SpendingPieChart data={breakdown} />
            )}
          </section>
        </Card>

        <Card>
          <section aria-label="Top spending categories chart">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Category Ranking
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Top Categories
            </h2>
            <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
              Compare the heaviest spending buckets side by side.
            </p>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Skeleton width="w-20" height="h-3" />
                    <Skeleton height="h-6" />
                  </div>
                ))}
              </div>
            ) : (
              <TopCategoriesBarChart data={breakdown} />
            )}
          </section>
        </Card>
      </div>

      <Card>
        <section aria-label="Cumulative savings chart">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
                Momentum
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                Cumulative Savings
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Watch your total savings build month over month instead of reading each period in isolation.
              </p>
            </div>
            <div className="rounded-2xl bg-primary/8 px-4 py-3 dark:bg-primary/15">
              <p className="text-xs uppercase tracking-wide text-primary/70 dark:text-primary-light/70">
                Current total
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(cumulativeSavings[cumulativeSavings.length - 1]?.cumulativeSavings ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <CumulativeSavingsChart data={cumulativeSavings} />
          </div>
        </section>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Card className="h-full">
          <section aria-label="Monthly savings goal progress" className="flex h-full flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Goal tracking
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Goal Progress
            </h2>
            <div className="mt-4 flex flex-1 items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="rgba(148,163,184,0.2)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="46"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * goalProgress.progress) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {Math.round(goalProgress.progress)}%
                  </p>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Goal hit
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current savings
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(goalProgress.currentSavings)}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Goal target: {formatCurrency(goalProgress.goal)}
                </p>
              </div>
            </div>
          </section>
        </Card>

        <Card className="h-full">
          <section aria-label="Top merchants widget" className="flex h-full flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Merchant watch
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Top Merchants
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The vendors taking the biggest share of your spending.
            </p>
            <div className="mt-4 space-y-3">
              {topMerchants.map((merchant, index) => (
                <div
                  key={merchant.merchant}
                  className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 px-3 py-2 dark:bg-gray-900/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-primary-light">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {merchant.merchant}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Highest spend merchant
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(merchant.total)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Card>

        <Card className="h-full">
          <section aria-label="Weekday versus weekend spending" className="flex h-full flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Spend rhythm
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Weekday vs Weekend
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A quick read on when your discretionary activity tends to cluster.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-xl bg-gray-50/80 px-4 py-3 dark:bg-gray-900/30">
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Weekday spend
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(weekdayWeekendSpending.weekday)}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50/80 px-4 py-3 dark:bg-gray-900/30">
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Weekend spend
                </p>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(weekdayWeekendSpending.weekend)}
                </p>
              </div>
            </div>
          </section>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-100 px-6 pb-3 pt-5 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
                Live Feed
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Jump into the latest activity without leaving the overview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              aria-label="View all transactions"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-4 px-6 py-4">
                <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="w-32" height="h-3" />
                  <Skeleton width="w-20" height="h-2.5" />
                </div>
                <Skeleton width="w-16" height="h-4" />
              </div>
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentTransactions.map((transaction) => {
              const color = getCategoryColor(transaction.category);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.bg}`}
                  >
                    <span className={`text-xs font-bold ${color.text}`}>
                      {transaction.category.charAt(0)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.merchant}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge category={transaction.category} size="sm" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(transaction.date, 'MMM d')}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-semibold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
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
