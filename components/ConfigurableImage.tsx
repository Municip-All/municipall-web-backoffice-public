"use client";

import clsx from "clsx";
import { getDisplayableImageSrc } from "@/lib/imageSrc";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
};

/** Renders remote/blob/data images; ignores relative paths like `/logo.png`. */
export default function ConfigurableImage({
  src,
  alt,
  className,
  fill,
}: Props) {
  const displaySrc = getDisplayableImageSrc(src);
  if (!displaySrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      className={clsx(fill ? "absolute inset-0 h-full w-full" : "", className)}
    />
  );
}
