import { memo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ToastContainer } from '@/components/ui/Toast';
import { useSidebar } from '@/context/useSidebar';
import { SidebarProvider } from '@/context/SidebarProvider';
import useFinanceStore from '@/store/useFinanceStore';

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

function DesktopSidebarSpacer() {
  const { collapsed } = useSidebar();

  return (
    <div
      aria-hidden="true"
      className="hidden md:block shrink-0"
      style={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH }}
    />
  );
}

const MainContent = memo(function MainContent() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <TopBar />
      <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
});

function LayoutInner() {
  const theme = useFinanceStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen overflow-x-clip bg-gray-50 dark:bg-gray-900 md:flex">
      <Sidebar />
      <DesktopSidebarSpacer />
      <MainContent />
      <BottomNav />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutInner />
    </SidebarProvider>
  );
}
