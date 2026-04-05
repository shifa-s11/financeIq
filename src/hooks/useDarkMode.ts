import { useEffect, useState } from 'react';
import useFinanceStore from '@/store/useFinanceStore';

export function useDarkMode() {
  const theme = useFinanceStore((state) => state.theme);
  const [isDark, setIsDark] = useState(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  return isDark;
}

export function useChartColors() {
  const isDark = useDarkMode();

  return {
    grid: isDark ? '#334155' : '#dbe1ea',
    tick: isDark ? '#94a3b8' : '#64748b',
    axis: isDark ? '#475569' : '#cbd5e1',
    tooltip: {
      bg: isDark ? '#111827' : '#ffffff',
      border: isDark ? '#334155' : '#e2e8f0',
      text: isDark ? '#f8fafc' : '#0f172a',
      muted: isDark ? '#94a3b8' : '#64748b',
    },
    income: isDark ? '#34d399' : '#10b981',
    expense: isDark ? '#fb7185' : '#ef4444',
    primary: isDark ? '#8b93ff' : '#6366f1',
    amber: isDark ? '#fbbf24' : '#f59e0b',
  };
}
