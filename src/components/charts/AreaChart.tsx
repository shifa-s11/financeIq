import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  defs,
} from 'recharts';
import type { MonthlyData } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

interface AreaChartProps {
  data: MonthlyData[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const income = payload.find((p) => p.name === 'Income')?.value ?? 0;
  const expenses = payload.find((p) => p.name === 'Expenses')?.value ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-gray-500 dark:text-gray-400">Income:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100 ml-auto pl-4">
            {formatCurrency(income)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-gray-500 dark:text-gray-400">Expenses:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100 ml-auto pl-4">
            {formatCurrency(expenses)}
          </span>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-1 mt-1 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
          <span className="text-gray-500 dark:text-gray-400">Saved:</span>
          <span className={`font-semibold ml-auto pl-4 ${income - expenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {formatCurrency(income - expenses)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BalanceAreaChart({ data }: AreaChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          width={48}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
          )}
        />

        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#incomeGrad)"
          dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#expenseGrad)"
          dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}