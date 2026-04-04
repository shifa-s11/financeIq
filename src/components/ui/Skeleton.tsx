interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-lg',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${width} ${height} ${rounded} ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="w-24" height="h-4" />
        <Skeleton width="w-10" height="h-10" rounded="rounded-xl" />
      </div>
      <Skeleton width="w-32" height="h-8" />
      <Skeleton width="w-20" height="h-3" />
    </div>
  );
}