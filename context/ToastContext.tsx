"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-premium backdrop-blur-sm",
              t.type === "success" &&
                "border-emerald-200/80 bg-[var(--card)] text-emerald-800 dark:text-emerald-300",
              t.type === "error" &&
                "border-red-200/80 bg-[var(--card)] text-red-800 dark:text-red-300",
              t.type === "info" &&
                "border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)]",
            )}
          >
            {t.type === "success" && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            )}
            {t.type === "error" && (
              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            {t.type === "info" && (
              <Info className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            )}
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
}
