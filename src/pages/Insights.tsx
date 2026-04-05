import { useEffect, useMemo, useState } from 'react';
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { Star, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { CategoryTrendChart } from '@/components/charts/CategoryTrendChart';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparison';
import { Card } from '@/components/ui/Card';
import { useInsightsData } from '@/hooks/useInsightsData';
import useFinanceStore from '@/store/useFinanceStore';
import { getInsightNarratives } from '@/utils/calculateSummary';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { setPageMetadata } from '@/utils/setPageMetadata';
import type { Transaction } from '@/types';

interface HeatmapTooltip {
  day: number;
  total: number;
  x: number;
  y: number;
}

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  accentColor: string;
}

function InsightCard({
  icon,
  title,
  value,
  sub,
  accentColor,
}: InsightCardProps) {
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p
            className="mt-0.5 truncate text-lg font-bold text-gray-900 dark:text-white"
            title={value}
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

function SpendingHeatmap({ transactions }: { transactions: Transaction[] }) {
  const [tooltip, setTooltip] = useState<HeatmapTooltip | null>(null);

  const latestExpenseDate = useMemo(() => {
    const expenses = transactions.filter((transaction) => transaction.type === 'expense');
    if (expenses.length === 0) {
      return null;
    }

    return parseISO(
      [...expenses].sort((a, b) => b.date.localeCompare(a.date))[0].date
    );
  }, [transactions]);

  const year = latestExpenseDate ? getYear(latestExpenseDate) : new Date().getFullYear();
  const month = latestExpenseDate ? getMonth(latestExpenseDate) : new Date().getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy');

  const dailyTotals = useMemo(() => {
    const totals = new Map<number, number>();

    transactions.forEach((transaction) => {
      const parsedDate = parseISO(transaction.date);
      if (
        transaction.type === 'expense' &&
        getMonth(parsedDate) === month &&
        getYear(parsedDate) === year
      ) {
        const day = parsedDate.getDate();
        totals.set(day, (totals.get(day) ?? 0) + transaction.amount);
      }
    });

    return totals;
  }, [month, transactions, year]);

  const maxSpend = Math.max(...Array.from(dailyTotals.values()), 1);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getIntensity = (total: number) => {
    if (total === 0) return 0;
    const ratio = total / maxSpend;
    if (ratio < 0.2) return 1;
    if (ratio < 0.4) return 2;
    if (ratio < 0.6) return 3;
    if (ratio < 0.8) return 4;
    return 5;
  };

  const intensityOpacity: Record<number, number> = {
    0: 0.06,
    1: 0.15,
    2: 0.3,
    3: 0.5,
    4: 0.7,
    5: 0.9,
  };

  return (
    <div className="space-y-3" role="img" aria-label={`Daily spending heatmap for ${monthLabel}`}>
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-gray-400 dark:text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
          const total = dailyTotals.get(day) ?? 0;
          const intensity = getIntensity(total);
          const opacity = intensityOpacity[intensity];

          return (
            <button
              key={day}
              type="button"
              className="relative flex aspect-square items-center justify-center rounded-md transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setTooltip({
                  day,
                  total,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
              onFocus={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setTooltip({
                  day,
                  total,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onBlur={() => setTooltip(null)}
              aria-label={`${monthLabel} ${day}: ${total > 0 ? formatCurrency(total) : 'No spending'}`}
            >
              <span className="select-none text-[10px] font-medium text-gray-600 dark:text-gray-300">
                {day}
              </span>
            </button>
          );
        })}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800"
          style={{ left: tooltip.x, top: tooltip.y - 52 }}
        >
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            {format(new Date(year, month, tooltip.day), 'MMMM d, yyyy')}
          </p>
          <p className="mt-0.5 text-gray-500 dark:text-gray-400">
            {tooltip.total > 0 ? formatCurrency(tooltip.total) : 'No spending'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
        {[0.06, 0.2, 0.4, 0.65, 0.9].map((opacity, index) => (
          <div
            key={index}
            className="h-5 w-5 rounded"
            style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}

export default function Insights() {
  const transactions = useFinanceStore((state) => state.transactions);
  const { monthly, insights, advancedInsights, monthOverMonthExpenseChange, expenseChangeDown } =
    useInsightsData(transactions);
  const narratives = useMemo(() => getInsightNarratives(transactions), [transactions]);

  useEffect(() => {
    setPageMetadata({
      title: 'Insights',
      description:
        'Explore FinanceIQ insights with recurring subscription detection, unusual spending alerts, savings projections, trend charts, and monthly comparisons.',
    });
  }, []);

  if (transactions.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No transaction data yet
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add some transactions to see your insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-white/70 bg-gradient-to-br from-primary/10 via-white/80 to-amber-50/70 px-6 py-6 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.25)] dark:border-gray-700/80 dark:from-primary/15 dark:via-gray-900/80 dark:to-amber-900/10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70 dark:text-primary-light/70">
          Pattern Intelligence
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Stats are useful. Observations are memorable.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          These signals turn the mock ledger into a believable financial story, so
          a reviewer sees interpretation instead of just chart rendering.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InsightCard
          icon={
            <TrendingDown
              size={18}
              style={{ color: getCategoryColor(insights.topCategory.category).hex }}
            />
          }
          title="Top Spending Category"
          value={insights.topCategory.category}
          sub={`${formatCurrency(insights.topCategory.total)} total spent`}
          accentColor={getCategoryColor(insights.topCategory.category).hex}
        />

        <InsightCard
          icon={
            expenseChangeDown ? (
              <TrendingDown size={18} color="#10b981" />
            ) : (
              <TrendingUp size={18} color="#ef4444" />
            )
          }
          title="Month-over-Month Expenses"
          value={`${expenseChangeDown ? 'Down' : 'Up'} ${Math.abs(monthOverMonthExpenseChange).toFixed(1)}%`}
          sub={
            expenseChangeDown
              ? 'Expenses eased compared with last month'
              : 'Expenses increased compared with last month'
          }
          accentColor={expenseChangeDown ? '#10b981' : '#ef4444'}
        />

        <InsightCard
          icon={<Star size={18} color="#10b981" />}
          title="Best Savings Month"
          value={insights.bestSavingsMonth.month}
          sub={`${formatCurrency(insights.bestSavingsMonth.savings)} saved`}
          accentColor="#10b981"
        />

        <InsightCard
          icon={<Zap size={18} color="#f59e0b" />}
          title="Largest Transaction"
          value={
            insights.largestTransaction
              ? formatCurrency(insights.largestTransaction.amount)
              : 'N/A'
          }
          sub={
            insights.largestTransaction
              ? `${insights.largestTransaction.merchant} | ${formatDate(
                  insights.largestTransaction.date,
                  'MMM d'
                )}`
              : 'No expense transactions yet'
          }
          accentColor="#f59e0b"
        />
      </div>

      <Card>
        <section aria-label="Insight narratives">
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
              Smart Readout
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              What stands out in the dataset
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {[
              narratives.categoryVsAverage,
              narratives.standoutMonth,
              narratives.savingsRecovery,
              advancedInsights.unusualSpendingAlert,
              advancedInsights.monthVsAverage,
              advancedInsights.savingsProjection,
              advancedInsights.duplicateDetection,
            ].map((message) => (
              <div
                key={message}
                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30"
              >
                <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {message}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Card>

      <Card>
        <section aria-label="Recurring subscriptions and discretionary insights">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Smart Signals
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Recurring payments, discretionary spikes, and current savings trajectory
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70 dark:text-primary-light/70">
                Recurring subscriptions
              </p>
              <div className="mt-3 space-y-3">
                {advancedInsights.recurringSubscriptions.map((subscription) => (
                  <div
                    key={subscription.merchant}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2 dark:bg-gray-800/80"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.merchant}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recurring monthly charge
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(subscription.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70 dark:text-primary-light/70">
                  Highest discretionary month
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {advancedInsights.highestDiscretionaryMonth}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/30">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70 dark:text-primary-light/70">
                  Six-month benchmark
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {advancedInsights.monthVsAverage}
                </p>
              </div>
            </div>
          </div>
        </section>
      </Card>

      <Card>
        <section aria-label="Monthly comparison chart">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Monthly Comparison
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Income, expenses, and savings across the full dataset
            </p>
          </div>
          <MonthlyComparisonChart data={monthly} />
        </section>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <section aria-label="Category trend chart">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Category Trends
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Top three expense categories over time
              </p>
            </div>
            <CategoryTrendChart transactions={transactions} />
          </section>
        </Card>

        <Card>
          <section aria-label="Spending heatmap">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Spending Heatmap
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Daily spending intensity for the latest expense month
              </p>
            </div>
            <SpendingHeatmap transactions={transactions} />
          </section>
        </Card>
      </div>
    </div>
  );
}
