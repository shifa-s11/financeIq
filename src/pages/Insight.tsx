import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, TrendingUp, Star, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import useFinanceStore from '@/store/useFinanceStore';
import {
  getMonthlyData,
  getCategoryBreakdown,
  getInsights,
} from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { parseISO, getMonth, getYear } from 'date-fns';
import type { Transaction } from '@/types';

// ── Spending Heatmap ─────────────────────────────────────────────────────────
function SpendingHeatmap({ transactions }: { transactions: Transaction[] }) {
  const [tooltip, setTooltip] = useState<{ day: number; total: number; x: number; y: number } | null>(null);

  // Use June 2025 as reference month
  const year = 2025;
  const month = 5; // June (0-indexed)
  const daysInMonth = 30;
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dailyTotals = new Map<number, number>();
  transactions.forEach((tx) => {
    const d = parseISO(tx.date);
    if (getMonth(d) === month && getYear(d) === year && tx.type === 'expense') {
      const day = d.getDate();
      dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + tx.amount);
    }
  });

  const maxSpend = Math.max(...Array.from(dailyTotals.values()), 1);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="w-8 text-center text-xs text-gray-400 font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 2rem)' }}>
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const total = dailyTotals.get(day) ?? 0;
          const opacity = total > 0 ? 0.15 + (total / maxSpend) * 0.8 : 0.06;

          return (
            <div
              key={day}
              className="relative w-8 h-8 rounded-md cursor-pointer flex items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ day, total, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x + 16, top: tooltip.y - 8 }}
        >
          <p className="font-semibold text-gray-700 dark:text-gray-200">
            June {tooltip.day}, 2025
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {tooltip.total > 0 ? formatCurrency(tooltip.total) : 'No spending'}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-gray-400">Less</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
          <div
            key={o}
            className="w-5 h-5 rounded"
            style={{ backgroundColor: `rgba(99, 102, 241, ${o})` }}
          />
        ))}
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  );
}

// ── Category Trend Chart ─────────────────────────────────────────────────────
function CategoryTrendChart({ transactions }: { transactions: Transaction[] }) {
  const breakdown = getCategoryBreakdown(transactions);
  const top3 = breakdown.slice(0, 3).map((b) => b.category);
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(top3.map((c) => [c, true]))
  );

  const monthly = getMonthlyData(transactions);
  const months = monthly.map((m) => m.month);

  const data = months.map((month) => {
    const row: Record<string, number | string> = { month };
    top3.forEach((cat) => {
      const monthIdx = months.indexOf(month);
      const txsInMonth = transactions.filter((tx) => {
        const d = parseISO(tx.date);
        return (
          tx.type === 'expense' &&
          tx.category === cat &&
          getMonthlyData([tx])[0]?.month === months[monthIdx]
        );
      });
      row[cat] = txsInMonth.reduce((s, tx) => s + tx.amount, 0);
    });
    return row;
  });

  return (
    <div className="space-y-4">
      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2">
        {top3.map((cat) => {
          const color = getCategoryColor(cat);
          const isVisible = visible[cat];
          return (
            <button
              key={cat}
              onClick={() => setVisible((prev) => ({ ...prev, [cat]: !prev[cat] }))}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                isVisible
                  ? 'text-white border-transparent'
                  : 'bg-transparent border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
              }`}
              style={isVisible ? { backgroundColor: color.hex } : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color.hex }}
              />
              {cat}
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === 'number' ? formatCurrency(value) : String(value ?? ''),
              String(name ?? ''),
            ]}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, white)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontSize: '12px',
            }}
          />
          {top3.map((cat) =>
            visible[cat] ? (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={getCategoryColor(cat).hex}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 0, fill: getCategoryColor(cat).hex }}
                activeDot={{ r: 6 }}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Monthly Grouped Bar Chart ────────────────────────────────────────────────
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function GroupedTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100 ml-auto pl-3">
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
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

function InsightCard({ icon, title, value, sub, accentColor }: InsightCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 truncate">
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

  const barData = monthly.map((m) => ({
    month: m.month,
    Income: m.income,
    Expenses: m.expenses,
    Savings: Math.max(0, m.savings),
  }));

  return (
    <div className="space-y-6">

      {/* Smart Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={<TrendingDown size={18} style={{ color: getCategoryColor(insights.topCategory.category).hex }} />}
          title="Top Spending Category"
          value={insights.topCategory.category}
          sub={`${formatCurrency(insights.topCategory.total)} total spent`}
          accentColor={getCategoryColor(insights.topCategory.category).hex}
        />
        <InsightCard
          icon={<TrendingUp size={18} color="#10b981" />}
          title="Best Savings Month"
          value={insights.bestSavingsMonth.month}
          sub={`${formatCurrency(insights.bestSavingsMonth.savings)} saved`}
          accentColor="#10b981"
        />
        <InsightCard
          icon={<Zap size={18} color="#f97316" />}
          title="Largest Transaction"
          value={insights.largestTransaction
            ? formatCurrency(insights.largestTransaction.amount)
            : 'N/A'}
          sub={insights.largestTransaction
            ? `${insights.largestTransaction.merchant} · ${formatDate(insights.largestTransaction.date, 'MMM d')}`
            : ''}
          accentColor="#f97316"
        />
        <InsightCard
          icon={<Star size={18} color="#6366f1" />}
          title="Avg Monthly Expense"
          value={formatCurrency(insights.avgMonthlyExpense)}
          sub="Across all 6 months"
          accentColor="#6366f1"
        />
      </div>

      {/* Monthly Comparison Bar Chart */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Monthly Comparison
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Income, Expenses & Savings per month
        </p>
        {barData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <Tooltip content={<GroupedTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
                )}
              />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Savings" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Category Trend + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Category Trends
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Top 3 expense categories over 6 months
          </p>
          <CategoryTrendChart transactions={transactions} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Spending Heatmap
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            June 2025 — daily expense intensity
          </p>
          <SpendingHeatmap transactions={transactions} />
        </Card>
      </div>
    </div>
  );
}
