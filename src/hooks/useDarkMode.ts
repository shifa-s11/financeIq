import { useEffect, useState } from 'react';
import useFinanceStore from '@/store/useFinanceStore';

export function useDarkMode() {
  const theme = useFinanceStore((s) => s.theme);
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  return isDark;
}

export function useChartColors() {
  const isDark = useDarkMode();

  return {
    grid: isDark ? '#374151' : '#e5e7eb',
    tick: isDark ? '#9ca3af' : '#6b7280',
    tooltip: {
      bg: isDark ? '#1f2937' : '#ffffff',
      border: isDark ? '#374151' : '#e5e7eb',
      text: isDark ? '#f3f4f6' : '#111827',
      muted: isDark ? '#9ca3af' : '#6b7280',
    },
    income: '#10b981',
    expense: '#ef4444',
    primary: '#6366f1',
    amber: '#f59e0b',
  };
}