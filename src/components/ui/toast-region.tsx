"use client";

import { CheckCircle2, X } from "lucide-react";

export type Toast = { id: number; title: string; description?: string };

export function ToastRegion({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <CheckCircle2 className="toast-icon" size={18} />
          <div style={{ flex: 1 }}><strong>{toast.title}</strong>{toast.description ? <p>{toast.description}</p> : null}</div>
          <button className="icon-button" style={{ width: 24, height: 24, flexShrink: 0 }} aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}><X size={13} /></button>
        </div>
      ))}
    </div>
  );
}
