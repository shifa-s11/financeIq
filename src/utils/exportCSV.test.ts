import { describe, expect, it, vi } from 'vitest';
import { exportToCSV } from '@/utils/exportCSV';
import type { Transaction } from '@/types';

const transaction: Transaction = {
  id: 'tx-1',
  date: '2025-06-12',
  amount: 125.5,
  category: 'Food & Dining',
  type: 'expense',
  description: 'Lunch meeting',
  merchant: 'Whole Foods',
  account: 'Credit Card',
  status: 'posted',
  isRecurring: false,
};

describe('exportToCSV', () => {
  it('creates a downloadable CSV file for the provided transactions', () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const removeSpy = vi.spyOn(document.body, 'removeChild');
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = clickSpy;
      }
      return element;
    });

    exportToCSV([transaction], 'report');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
