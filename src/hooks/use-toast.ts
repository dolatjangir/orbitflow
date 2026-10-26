"use client";

import { useCallback, useState } from "react";
import type { ToastFn } from "@/components/layout/topbar";
import type { Toast } from "@/components/ui/toast-region";

/** Small client-side toast queue shared by dashboard actions. */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback<ToastFn>((title, description) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, title, description }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, notify, dismissToast };
}
