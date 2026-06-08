/** Utilitaires marque blanche (alignés sur l'app mobile). */

export function getLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return 0;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(normalized.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

export function getOnPrimaryColor(hex: string): string {
  return getLuminance(hex) > 0.45 ? "#111827" : "#FFFFFF";
}

export function isPrimaryReadableOnWhite(hex: string): boolean {
  const lum = getLuminance(hex);
  const ratio = (1 + 0.05) / (lum + 0.05);
  return ratio >= 3;
}
