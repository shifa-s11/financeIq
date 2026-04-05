import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Star, Zap } from 'lucide-react';
import { parseISO, getMonth, getYear } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparison';
import { CategoryTrendChart } from '@/components/charts/CategoryTrendChart';
import useFinanceStore from '@/store/useFinanceStore';
import {
  getMonthlyData,
  getInsights,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor } from '@/utils/getCategoryColor';
import type { Transaction } from '@/types';

// ── Spending Heatmap ─────────────────────────────────────────────────────────
interface HeatmapTooltip {
  day: number;
  total: number;
  x: number;
  y: number;
}

function SpendingHeatmap({ transactions }: { transactions: Transaction[] }) {
  const [tooltip, setTooltip] = useState<HeatmapTooltip | null>(null);

  const year = 2025;
  const month = 5; // June (0-indexed)
  const daysInMonth = 30;
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Build daily totals
  const dailyTotals = new Map<number, number>();
  transactions.forEach((tx) => {
    const d = parseISO(tx.date);
    if (
      getMonth(d) === month &&
      getYear(d) === year &&
      tx.type === 'expense'
    ) {
      const day = d.getDate();
      dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + tx.amount);
    }
  });

  const maxSpend = Math.max(...Array.from(dailyTotals.values()), 1);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Map spend to 5 intensity levels
  const getIntensity = (total: number): number => {
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
    <div className="space-y-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Offset empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const total = dailyTotals.get(day) ?? 0;
          const intensity = getIntensity(total);
          const opacity = intensityOpacity[intensity];

          return (
            <div
              key={day}
              className="aspect-square rounded-md cursor-pointer flex items-center justify-center transition-transform duration-150 hover:scale-110 relative"
              style={{
                backgroundColor: `rgba(99, 102, 241, ${opacity})`,
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  day,
                  total,
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 select-none">
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none -translate-x-1/2"
          style={{
            left: tooltip.x,
            top: tooltip.y - 52,
          }}
        >
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            June {tooltip.day}, 2025
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {tooltip.total > 0
              ? formatCurrency(tooltip.total)
              : 'No spending'}
          </p>
        </div>
      )}

      {/* Intensity legend */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
        {[0.06, 0.2, 0.4, 0.65, 0.9].map((o, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded"
            style={{ backgroundColor: `rgba(99, 102, 241, ${o})` }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
      </div>
    </div>
  );
}

// ── Insight Card ─────────────────────────────────────────────────────────────
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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p
            className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate"
            title={value}
          >
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {sub}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Insights() {
  const transactions = useFinanceStore((s) => s.transactions);

  useEffect(() => {
    document.title = 'Insights — FinanceIQ';
  }, []);

  const monthly = getMonthlyData(transactions);
  const insights = getInsights(transactions);

  // MoM expense change
  const lastTwo = monthly.slice(-2);
  const momChange =
    lastTwo.length === 2 && lastTwo[0].expenses > 0
      ? ((lastTwo[1].expenses - lastTwo[0].expenses) / lastTwo[0].expenses) *
        100
      : 0;
  const momDown = momChange <= 0;

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            No transaction data yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add some transactions to see your insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Smart Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={
            <TrendingDown
              size={18}
              style={{
                color: getCategoryColor(insights.topCategory.category).hex,
              }}
            />
          }
          title="Top Spending Category"
          value={insights.topCategory.category}
          sub={`${formatCurrency(insights.topCategory.total)} total spent`}
          accentColor={getCategoryColor(insights.topCategory.category).hex}
        />

        <InsightCard
          icon={
            momDown ? (
              <TrendingDown size={18} color="#10b981" />
            ) : (
              <TrendingUp size={18} color="#ef4444" />
            )
          }
          title="Month-over-Month Expenses"
          value={`${momDown ? '↓' : '↑'} ${Math.abs(momChange).toFixed(1)}%`}
          sub={
            momDown
              ? 'Expenses down vs last month'
              : 'Expenses up vs last month'
          }
          accentColor={momDown ? '#10b981' : '#ef4444'}
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
              ? `${insights.largestTransaction.merchant} · ${formatDate(
                  insights.largestTransaction.date,
                  'MMM d'
                )}`
              : ''
          }
          accentColor="#f59e0b"
        />
      </div>

      {/* Monthly Comparison */}
      <Card>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Monthly Comparison
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Income, Expenses &amp; Savings — Jan to Jun 2025
          </p>
        </div>
        <MonthlyComparisonChart data={monthly} />
      </Card>

      {/* Category Trend + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Category Trends
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Top 3 expense categories over 6 months
            </p>
          </div>
          <CategoryTrendChart transactions={transactions} />
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Spending Heatmap
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              June 2025 — daily expense intensity
            </p>
          </div>
          <SpendingHeatmap transactions={transactions} />
        </Card>
      </div>
    </div>
  );
}