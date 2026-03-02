/**
 * ToastContainer Component
 * Global container for displaying toast notifications
 */

"use client";

import Toast from "./Toast";
import { type ToastItem, useToastStore } from "@/hooks/useToast";

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast: ToastItem) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
