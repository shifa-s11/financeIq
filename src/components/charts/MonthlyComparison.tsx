import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useChartColors } from '@/hooks/useDarkMode';
import { formatCurrency } from '@/utils/formatCurrency';
import type { MonthlyData } from '@/types';

interface Props {
  data: MonthlyData[];
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

export function MonthlyComparisonChart({ data }: Props) {
  const colors = useChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  // Ensure savings never goes negative visually
  const chartData = data.map((m) => ({
    ...m,
    savings: Math.max(0, m.savings),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        barGap={3}
        barCategoryGap="25%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          strokeOpacity={0.6}
          vertical={false}
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
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={44}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: colors.tick }}>{value}</span>
          )}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill={colors.income}
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
        <Bar
          dataKey="expenses"
          name="Expenses"
          fill={colors.expense}
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
        <Bar
          dataKey="savings"
          name="Savings"
          fill={colors.primary}
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}