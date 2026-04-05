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
import { useChartColors } from '@/hooks/useDarkMode';
import type { CategoryBreakdown } from '@/types';

interface Props {
  data: CategoryBreakdown[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryBreakdown }>;
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
      <p className="font-semibold" style={{ color: colors.tooltip.text }}>
        {item.payload.category}
      </p>
      <p className="mt-0.5" style={{ color: colors.tooltip.muted }}>
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export function TopCategoriesBarChart({ data }: Props) {
  const colors = useChartColors();
  const top5 = data.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div role="img" aria-label="Top spending categories bar chart">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={top5}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
        >
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: colors.tick }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'transparent' }}
        />
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
           formatter={(v) => formatCurrency(Number(v ?? 0), 'USD', true)}
            style={{ fontSize: 11, fill: colors.tick }}
          />
        </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
