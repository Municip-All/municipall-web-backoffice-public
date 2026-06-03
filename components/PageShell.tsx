"use client";

import React from "react";
import clsx from "clsx";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={clsx(
        "custom-scrollbar h-full min-h-0 flex-1 overflow-y-auto",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-8 lg:py-8">
        {children}
      </div>
    </div>
  );
}
