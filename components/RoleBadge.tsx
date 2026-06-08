"use client";

import { Shield } from "lucide-react";
import clsx from "clsx";
import { roleBadgeClass, roleLabel } from "@/lib/roleLabels";

type RoleBadgeProps = {
  role: string;
  className?: string;
  showIcon?: boolean;
};

export default function RoleBadge({
  role,
  className,
  showIcon = true,
}: RoleBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        roleBadgeClass(role),
        className,
      )}
    >
      {showIcon && <Shield className="h-3 w-3 shrink-0" aria-hidden />}
      {roleLabel(role)}
    </span>
  );
}
