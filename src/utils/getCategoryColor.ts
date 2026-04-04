import type { Category } from '@/types';

interface ColorPair {
  bg: string;
  text: string;
  hex: string;
  chartColor: string;
}

const COLOR_MAP: Record<Category, ColorPair> = {
  'Food & Dining': {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    hex: '#f97316',
    chartColor: '#f97316',
  },
  Transport: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    hex: '#3b82f6',
    chartColor: '#3b82f6',
  },
  Housing: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    hex: '#a855f7',
    chartColor: '#a855f7',
  },
  Entertainment: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-300',
    hex: '#ec4899',
    chartColor: '#ec4899',
  },
  Health: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    hex: '#ef4444',
    chartColor: '#ef4444',
  },
  Shopping: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    hex: '#eab308',
    chartColor: '#eab308',
  },
  Salary: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    hex: '#10b981',
    chartColor: '#10b981',
  },
  Freelance: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-300',
    hex: '#14b8a6',
    chartColor: '#14b8a6',
  },
  Investments: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    hex: '#6366f1',
    chartColor: '#6366f1',
  },
};

export function getCategoryColor(category: string): ColorPair {
  return (
    COLOR_MAP[category as Category] ?? {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      hex: '#6b7280',
      chartColor: '#6b7280',
    }
  );
}

export default getCategoryColor;