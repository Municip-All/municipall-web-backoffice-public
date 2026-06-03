import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendReverse?: boolean;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  trend,
  trendReverse = false,
  icon: Icon,
}: StatCardProps) {
  const trendUp = trend !== undefined && trend >= 0;
  const trendPositive = trendReverse ? !trendUp : trendUp;

  return (
    <div className="card-panel group p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/[0.08] ring-1 ring-[var(--accent)]/15">
          <Icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span
            className={clsx(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              trendPositive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {trendUp ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="section-title mb-1">{title}</p>
        <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
