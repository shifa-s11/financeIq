import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { parseISO, format } from 'date-fns';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatCurrency } from '@/utils/formatCurrency';
import { useChartColors } from '@/hooks/useDarkMode';
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
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl shadow-lg p-3 text-xs border min-w-[160px]"
      style={{
        backgroundColor: colors.tooltip.bg,
        borderColor: colors.tooltip.border,
      }}
    >
      <p
        className="font-semibold mb-2 text-sm"
        style={{ color: colors.tooltip.text }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span style={{ color: colors.tooltip.muted }}>{p.name}:</span>
          <span
            className="font-medium ml-auto pl-3"
            style={{ color: colors.tooltip.text }}
          >
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CategoryTrendChart({ transactions }: Props) {
  const colors = useChartColors();

  // ── Step 1: find top 3 expense categories across all data ──────────────
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
      });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [transactions]);

  const top3 = categoryTotals.slice(0, 3);

  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(top3.map((c) => [c, true]))
  );

  // ── Step 2: build chart data in a single pass ──────────────────────────
  const chartData = useMemo(() => {
    // Map: "2025-01" → { month: "Jan", [category]: total }
    const monthMap = new Map<string, Record<string, number>>();

    transactions
      .filter((tx) => tx.type === 'expense' && top3.includes(tx.category))
      .forEach((tx) => {
        const key = format(parseISO(tx.date), 'yyyy-MM');
        const label = format(parseISO(tx.date), 'MMM');
        if (!monthMap.has(key)) {
          monthMap.set(key, { __label: label as unknown as number });
        }
        const row = monthMap.get(key)!;
        row[tx.category] = (row[tx.category] ?? 0) + tx.amount;
      });

    // Sort by month key and return
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => {
        const result: Record<string, string | number> = {
          month: row.__label as unknown as string,
        };
        top3.forEach((cat) => {
          result[cat] = row[cat] ?? 0;
        });
        return result;
      });
  }, [transactions, top3]);

  const toggle = (cat: string) => {
    setVisible((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const anyVisible = Object.values(visible).some(Boolean);

  if (top3.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No expense data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle pills */}
      <div className="flex flex-wrap gap-2">
        {top3.map((cat) => {
          const color = getCategoryColor(cat);
          const isOn = visible[cat];
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-150 font-medium"
              style={
                isOn
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
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Chart or empty state */}
      {!anyVisible ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Select at least one category above
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
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
              tickFormatter={(v) => `$${v}`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            {top3.map((cat) =>
              visible[cat] ? (
                <Line
                  key={cat}
                  type="monotone"
                  dataKey={cat}
                  stroke={getCategoryColor(cat).hex}
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    strokeWidth: 0,
                    fill: getCategoryColor(cat).hex,
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationBegin={0}
                  animationDuration={600}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}