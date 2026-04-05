import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages}
      </p>

      <div
        className="flex items-center gap-2"
        aria-label="Transaction pagination"
        role="navigation"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          icon={<ChevronLeft size={16} />}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          icon={<ChevronRight size={16} />}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
