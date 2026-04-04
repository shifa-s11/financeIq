import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import type { ToastItem } from '@/types';

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

const BORDER = {
  success: 'border-l-4 border-emerald-500',
  error: 'border-l-4 border-red-500',
  info: 'border-l-4 border-blue-500',
};

function ToastItem({ toast }: { toast: ToastItem }) {
  const removeToast = useFinanceStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 bg-white dark:bg-gray-800 shadow-lg rounded-xl px-4 py-3 min-w-[280px] max-w-sm ${BORDER[toast.type]}`}
    >
      <span className="mt-0.5 flex-shrink-0">{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 font-medium">
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useFinanceStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}