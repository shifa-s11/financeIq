import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFinanceStore from '@/store/useFinanceStore';
import { usePermissions } from '@/hooks/usePermissions';

describe('usePermissions', () => {
  afterEach(() => {
    useFinanceStore.setState({ selectedRole: 'admin' });
  });

  it('grants admin actions to admins', () => {
    useFinanceStore.setState({ selectedRole: 'admin' });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canAdd).toBe(true);
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canExport).toBe(true);
    expect(result.current.isViewer).toBe(false);
  });

  it('locks mutating actions for viewers', () => {
    useFinanceStore.setState({ selectedRole: 'viewer' });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canAdd).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canExport).toBe(false);
    expect(result.current.isViewer).toBe(true);
  });

  it('lets analysts export without granting mutation access', () => {
    useFinanceStore.setState({ selectedRole: 'analyst' });
    const { result } = renderHook(() => usePermissions());

    expect(result.current.canAdd).toBe(false);
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canExport).toBe(true);
    expect(result.current.isViewer).toBe(false);
  });
});
