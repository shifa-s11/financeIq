import { getCategoryColor } from '@/utils/getCategoryColor';

interface BadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function Badge({ category, size = 'md' }: BadgeProps) {
  const colors = getCategoryColor(category);
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}