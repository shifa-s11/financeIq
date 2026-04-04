import { format, parseISO, isValid } from 'date-fns';

export function formatDate(
  isoString: string,
  pattern = 'MMM dd, yyyy'
): string {
  try {
    const date = parseISO(isoString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, pattern);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeMonth(isoString: string): string {
  return formatDate(isoString, 'MMM yyyy');
}