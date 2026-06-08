"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import clsx from "clsx";

type Props = {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "w-14 h-14 rounded-xl",
  md: "w-20 h-20 rounded-2xl",
  lg: "w-full max-h-72 rounded-2xl",
};

export default function ReportThumbnail({
  imageUrl,
  alt = "Photo du signalement",
  className,
  size = "md",
}: Props) {
  const sizeClass = sizes[size];

  if (
    imageUrl &&
    (imageUrl.startsWith("data:") || imageUrl.startsWith("http"))
  ) {
    return (
      <div
        className={clsx(
          "overflow-hidden border border-[var(--card-border)] bg-zinc-100 shadow-sm",
          sizeClass,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center border border-[var(--card-border)] bg-zinc-100",
        sizeClass,
        className,
      )}
    >
      <ShieldAlert className="h-8 w-8 text-zinc-400" />
    </div>
  );
}
