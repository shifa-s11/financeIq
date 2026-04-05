import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { getCategoryColor } from '@/utils/getCategoryColor';
import { formatCurrency } from '@/utils/formatCurrency';
import { useChartColors } from '@/hooks/useDarkMode';
import type { CategoryBreakdown } from '@/types';

interface SpendingPieChartProps {
  data: CategoryBreakdown[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CategoryBreakdown;
  }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  const colors = useChartColors();
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];

  return (
    <div
      className="rounded-xl shadow-lg p-3 text-sm border"
      style={{
        backgroundColor: colors.tooltip.bg,
        borderColor: colors.tooltip.border,
      }}
    >
      <p
        className="font-semibold"
        style={{ color: colors.tooltip.text }}
      >
        {item.name}
      </p>
      <p className="mt-0.5" style={{ color: colors.tooltip.muted }}>
        {formatCurrency(item.value)}{' '}
        <span>({item.payload.percentage}%)</span>
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
    <div
      className="space-y-4"
      role="img"
      aria-label="Expense distribution by category pie chart"
    >
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
      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((entry) => {
          const color = getCategoryColor(entry.category);
          return (
            <div
              key={entry.category}
              className="flex items-center gap-2 rounded-xl bg-gray-50/80 px-3 py-2 text-xs dark:bg-gray-900/30"
            >
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
