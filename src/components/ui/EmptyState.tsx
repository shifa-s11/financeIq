import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Inline SVG illustration */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-6 opacity-40"
      >
        <rect
          x="20" y="30" width="80" height="60"
          rx="8"
          className="fill-gray-200 dark:fill-gray-600"
        />
        <rect
          x="30" y="20" width="60" height="10"
          rx="4"
          className="fill-gray-300 dark:fill-gray-500"
        />
        <circle
          cx="60" cy="62"
          r="14"
          className="fill-gray-300 dark:fill-gray-500"
        />
        <path
          d="M54 62l4 4 8-8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="35" y="82" width="20" height="4"
          rx="2"
          className="fill-gray-300 dark:fill-gray-500"
        />
        <rect
          x="60" y="82" width="25" height="4"
          rx="2"
          className="fill-gray-200 dark:fill-gray-600"
        />
      </svg>

      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}