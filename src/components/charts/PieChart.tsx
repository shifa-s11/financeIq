import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatCurrency } from '@/utils/formatCurrency';
import type { CategoryBreakdown } from '@/types';

interface SpendingPieChartProps {
  data: CategoryBreakdown[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: CategoryBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 dark:text-gray-200">{item.name}</p>
      <p className="text-gray-500 dark:text-gray-400 mt-0.5">
        {formatCurrency(item.value)}{' '}
        <span className="text-gray-400">({item.payload.percentage}%)</span>
      </p>
    </div>
  );
}

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="total"
            nameKey="category"
            isAnimationActive
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={getCategoryColor(entry.category).hex}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {data.map((entry) => {
          const color = getCategoryColor(entry.category);
          return (
            <div key={entry.category} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">
                {entry.category}
              </span>
              <span className="text-gray-400 dark:text-gray-500">
                {entry.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}