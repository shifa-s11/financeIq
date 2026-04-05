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
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
        <svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative opacity-95"
        >
          <rect
            x="22"
            y="34"
            width="84"
            height="60"
            rx="16"
            className="fill-slate-100 dark:fill-slate-800"
          />
          <rect
            x="34"
            y="24"
            width="60"
            height="14"
            rx="7"
            className="fill-primary/20"
          />
          <circle cx="64" cy="63" r="15" className="fill-primary/15" />
          <path
            d="M58 63l4 4 10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
          <rect
            x="40"
            y="87"
            width="18"
            height="4"
            rx="2"
            className="fill-slate-300 dark:fill-slate-600"
          />
          <rect
            x="64"
            y="87"
            width="24"
            height="4"
            rx="2"
            className="fill-slate-200 dark:fill-slate-700"
          />
        </svg>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/70 dark:text-primary-light/70">
        Nothing here yet
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
