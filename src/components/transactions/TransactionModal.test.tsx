import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import useFinanceStore from '@/store/useFinanceStore';

describe('TransactionModal', () => {
  beforeEach(() => {
    useFinanceStore.setState({
      transactions: [],
      toasts: [],
    });
  });

  it('shows an inline validation error for future dates', async () => {
    render(<TransactionModal isOpen onClose={vi.fn()} editing={null} />);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoTomorrow = tomorrow.toISOString().split('T')[0];

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: isoTomorrow },
    });
    fireEvent.change(screen.getByLabelText('Merchant'), {
      target: { value: 'Test Merchant' },
    });
    fireEvent.change(screen.getByLabelText('Amount ($)'), {
      target: { value: '42' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

    await waitFor(() => {
      expect(screen.getByText('Date cannot be in the future')).toBeInTheDocument();
    });
  });
});
