import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatCurrency } from '@/utils/formatCurrency';
import type { CategoryBreakdown } from '@/types';

interface TopCategoriesBarChartProps {
  data: CategoryBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200">
        {item.payload.category}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export function TopCategoriesBarChart({ data }: TopCategoriesBarChartProps) {
  const top5 = data.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={top5}
        layout="vertical"
        margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          hide
          domain={[0, 'dataMax']}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar
          dataKey="total"
          radius={[0, 6, 6, 0]}
          isAnimationActive
          animationBegin={0}
          animationDuration={800}
        >
          {top5.map((entry) => (
            <Cell
              key={entry.category}
              fill={getCategoryColor(entry.category).hex}
              fillOpacity={0.85}
            />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value) =>
              typeof value === 'number' ? formatCurrency(value, 'USD', true) : ''
            }
            style={{ fontSize: 11, fill: '#9ca3af' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
