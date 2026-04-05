import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { useChartColors } from '@/hooks/useDarkMode';

interface AreaChartProps {
  data: MonthlyData[];
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  const colors = useChartColors();
  if (!active || !payload || payload.length === 0) return null;

  const income = payload.find((p) => p.name === 'Income')?.value ?? 0;
  const expenses = payload.find((p) => p.name === 'Expenses')?.value ?? 0;
  const saved = income - expenses;

  return (
    <div
      className="rounded-xl shadow-lg p-3 text-sm border"
      style={{
        backgroundColor: colors.tooltip.bg,
        borderColor: colors.tooltip.border,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: colors.tooltip.text }}>
        {label}
      </p>
      <div className="space-y-1">
        {[
          { label: 'Income', value: income, color: colors.income },
          { label: 'Expenses', value: expenses, color: colors.expense },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span style={{ color: colors.tooltip.muted }}>{item.label}:</span>
            <span
              className="font-medium ml-auto pl-4"
              style={{ color: colors.tooltip.text }}
            >
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
        <div
          className="border-t pt-1 mt-1 flex items-center gap-2"
          style={{ borderColor: colors.tooltip.border }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.primary }}
          />
          <span style={{ color: colors.tooltip.muted }}>Saved:</span>
          <span
            className="font-semibold ml-auto pl-4"
            style={{
              color: saved >= 0 ? colors.income : colors.expense,
            }}
          >
            {formatCurrency(saved)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BalanceAreaChart({ data }: AreaChartProps) {
  const colors = useChartColors();

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div role="img" aria-label="Income and expenses area chart by month">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>

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
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, color: colors.tick }}>{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke={colors.income}
          strokeWidth={2.5}
          fill="url(#incomeGrad)"
          dot={{ fill: colors.income, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={colors.expense}
          strokeWidth={2.5}
          fill="url(#expenseGrad)"
          dot={{ fill: colors.expense, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
