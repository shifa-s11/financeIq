import useFinanceStore from '@/store/useFinanceStore';

export interface Permissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  isViewer: boolean;
}

export function usePermissions(): Permissions {
  const role = useFinanceStore((state) => state.selectedRole);

  return {
    canAdd: role === 'admin',
    canEdit: role === 'admin',
    canDelete: role === 'admin',
    canExport: role === 'admin' || role === 'analyst',
    isViewer: role === 'viewer',
  };
}
