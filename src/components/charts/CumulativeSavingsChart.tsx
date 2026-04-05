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

interface Props {
  data: Array<{ month: string; cumulativeSavings: number }>;
}

export function CumulativeSavingsChart({ data }: Props) {
  const colors = useChartColors();

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div role="img" aria-label="Cumulative savings line chart" className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} strokeOpacity={0.6} />
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
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            width={56}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value ?? 0))}
            contentStyle={{
              borderRadius: 16,
              borderColor: colors.tooltip.border,
              backgroundColor: colors.tooltip.bg,
              color: colors.tooltip.text,
            }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeSavings"
            stroke={colors.primary}
            strokeWidth={3}
            dot={{ r: 4, fill: colors.primary, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
