import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, X, XCircle } from 'lucide-react';
import useFinanceStore from '@/store/useFinanceStore';
import type { ToastItem } from '@/types';

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

const BORDER = {
  success: 'border-emerald-500',
  error: 'border-red-500',
  info: 'border-blue-500',
};

function ToastMessage({ toast }: { toast: ToastItem }) {
  const removeToast = useFinanceStore((state) => state.removeToast);

  useEffect(() => {
    const timer = window.setTimeout(() => removeToast(toast.id), 3000);
    return () => window.clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`min-w-[280px] max-w-sm rounded-2xl border bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm dark:bg-gray-800/95 ${BORDER[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">{ICONS[toast.type]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            {toast.type === 'success'
              ? 'Success'
              : toast.type === 'error'
                ? 'Attention'
                : 'Update'}
          </p>
          <p className="mt-1 text-sm font-medium leading-5 text-gray-700 dark:text-gray-200">
            {toast.message}
          </p>
          {toast.action && toast.actionLabel && (
            <button
              type="button"
              onClick={toast.action}
              className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:text-primary-dark"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          aria-label="Dismiss notification"
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={15} />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useFinanceStore((state) => state.toasts);

  return (
    <div className="fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
