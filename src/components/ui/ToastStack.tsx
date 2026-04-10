import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastKind = 'info' | 'success' | 'warning' | 'ai';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

let _addToast: ((t: Omit<Toast, 'id'>) => void) | null = null;

/** Call from anywhere to fire a toast. */
export function showToast(message: string, kind: ToastKind = 'info') {
  _addToast?.({ message, kind });
}

const KIND_STYLES: Record<ToastKind, string> = {
  info:    'border-gameAccent-gold text-gameAccent-gold bg-gameBg-dark/90',
  success: 'border-gameAccent-green text-gameAccent-green bg-gameBg-dark/90',
  warning: 'border-gameAccent-orange text-gameAccent-orange bg-gameBg-dark/90',
  ai:      'border-purple-500 text-purple-300 bg-gameBg-dark/90',
};

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Expose the adder globally
  useEffect(() => {
    _addToast = (t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev.slice(-4), { ...t, id }]); // max 5 at once
      timers.current[id] = setTimeout(() => dismiss(id), 2500);
    };
    return () => { _addToast = null; };
  }, []);

  function dismiss(id: string) {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded border text-[8px] font-pixel uppercase tracking-wider shadow-lg ${KIND_STYLES[toast.kind]}`}
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismiss(toast.id)}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
