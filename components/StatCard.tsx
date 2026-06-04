import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendReverse?: boolean;
  icon: LucideIcon;
  alertCount?: number;
  onClick?: () => void;
  highlight?: boolean;
}

export default function StatCard({
  title,
  value,
  trend,
  trendReverse = false,
  icon: Icon,
  alertCount,
  onClick,
  highlight = false,
}: StatCardProps) {
  const trendUp = trend !== undefined && trend >= 0;
  const trendPositive = trendReverse ? !trendUp : trendUp;
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "card-panel group w-full p-5 text-left transition-all",
        onClick && "hover:ring-2 hover:ring-[var(--accent)]/20 cursor-pointer",
        highlight && "ring-2 ring-red-500/25",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={clsx(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
            highlight
              ? "bg-red-500/10 ring-red-500/20"
              : "bg-[var(--accent)]/[0.08] ring-[var(--accent)]/15",
          )}
        >
          <Icon
            className={clsx(
              "h-5 w-5",
              highlight ? "text-red-500" : "text-[var(--accent)]",
            )}
            strokeWidth={2}
          />
          {alertCount !== undefined && alertCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
              {alertCount > 99 ? "99+" : alertCount}
            </span>
          )}
        </div>
        {trend !== undefined && (
          <span
            className={clsx(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              trendPositive ? "text-emerald-600" : "text-red-500",
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
    </Wrapper>
  );
}
