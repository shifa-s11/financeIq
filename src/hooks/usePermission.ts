import useFinanceStore from '@/store/useFinanceStore';

export interface Permissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  isViewer: boolean;
}

export function usePermissions(): Permissions {
  const role = useFinanceStore((s) => s.selectedRole);
  return {
    canAdd: role === 'admin',
    canEdit: role === 'admin',
    canDelete: role === 'admin',
    canExport: role === 'admin',
    isViewer: role === 'viewer',
  };
}