/** URLs safe to pass to <img> or next/image (absolute http(s), data:, blob:). */
export function isDisplayableImageSrc(src: string): boolean {
  return /^(blob:|data:|https?:\/\/)/i.test(src.trim());
}

export function getDisplayableImageSrc(
  src: string | null | undefined,
): string | null {
  if (!src?.trim()) return null;
  return isDisplayableImageSrc(src) ? src.trim() : null;
}
