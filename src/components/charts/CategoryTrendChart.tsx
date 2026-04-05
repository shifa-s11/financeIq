import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors } from '@/hooks/useDarkMode';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/getCategoryColor';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  const colors = useChartColors();
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      className="min-w-[160px] rounded-xl border p-3 text-xs shadow-lg"
      style={{
        backgroundColor: colors.tooltip.bg,
        borderColor: colors.tooltip.border,
      }}
    >
      <p className="mb-2 text-sm font-semibold" style={{ color: colors.tooltip.text }}>
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.name} className="mb-1 flex items-center gap-2">
          <span
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span style={{ color: colors.tooltip.muted }}>{item.name}:</span>
          <span
            className="ml-auto pl-3 font-medium"
            style={{ color: colors.tooltip.text }}
          >
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CategoryTrendChart({ transactions }: Props) {
  const colors = useChartColors();

  const categoriesBySpend = useMemo(() => {
    const totals = new Map<string, number>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        totals.set(
          transaction.category,
          (totals.get(transaction.category) ?? 0) + transaction.amount
        );
      });

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }, [transactions]);

  const topCategories = categoriesBySpend.slice(0, 3);

  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(topCategories.map((category) => [category, true]))
  );

  const chartData = useMemo(() => {
    const monthMap = new Map<string, Record<string, number | string>>();

    transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' &&
          topCategories.includes(transaction.category)
      )
      .forEach((transaction) => {
        const parsedDate = parseISO(transaction.date);
        const key = format(parsedDate, 'yyyy-MM');
        const label = format(parsedDate, 'MMM');

        if (!monthMap.has(key)) {
          monthMap.set(key, { month: label });
        }

        const row = monthMap.get(key)!;
        row[transaction.category] =
          Number(row[transaction.category] ?? 0) + transaction.amount;
      });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => {
        const normalized = { month: row.month as string } as Record<string, string | number>;
        topCategories.forEach((category) => {
          normalized[category] = Number(row[category] ?? 0);
        });
        return normalized;
      });
  }, [topCategories, transactions]);

  const anyVisible = Object.values(visible).some(Boolean);

  const toggleCategory = (category: string) => {
    setVisible((current) => ({ ...current, [category]: !current[category] }));
  };

  if (topCategories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No expense data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Category trend toggles">
        {topCategories.map((category) => {
          const color = getCategoryColor(category);
          const isVisible = visible[category];

          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              aria-pressed={isVisible}
              aria-label={`${isVisible ? 'Hide' : 'Show'} ${category} category trend`}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              style={
                isVisible
                  ? {
                      backgroundColor: color.hex,
                      borderColor: color.hex,
                      color: '#fff',
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: colors.grid,
                      color: colors.tick,
                    }
              }
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color.hex }}
              />
              {category}
            </button>
          );
        })}
      </div>

      {!anyVisible ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-400">
          Select at least one category above
        </div>
      ) : (
        <div role="img" aria-label="Category spending trend line chart" className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: colors.tick }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: colors.tick }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />
              {topCategories.map((category) =>
                visible[category] ? (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={getCategoryColor(category).hex}
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      strokeWidth: 0,
                      fill: getCategoryColor(category).hex,
                    }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationBegin={0}
                    animationDuration={600}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
