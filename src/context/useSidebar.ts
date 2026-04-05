import { useContext } from 'react';
import { SidebarContext } from './SidebarContext';

export function useSidebar() {
  return useContext(SidebarContext);
}