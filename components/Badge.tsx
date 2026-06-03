import React from "react";
import clsx from "clsx";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "live"
  | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-600 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400",
  warning:
    "bg-amber-50 text-amber-700 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-400",
  danger:
    "bg-red-50 text-red-700 ring-red-200/80 dark:bg-red-950/50 dark:text-red-400",
  live: "bg-emerald-50 text-emerald-700 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400",
  accent: "bg-[var(--accent)]/10 text-[var(--accent)] ring-[var(--accent)]/20",
};

export default function Badge({
  children,
  variant = "default",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            variant === "live"
              ? "animate-pulse bg-emerald-500"
              : "bg-current opacity-70",
          )}
        />
      )}
      {children}
    </span>
  );
}
