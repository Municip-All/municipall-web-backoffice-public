import type { CityConfig } from "@/lib/api";

/** Nom à utiliser pour geo.api.gouv.fr — jamais le nom d'app marque blanche seul */
export function getGeoCommuneName(
  cityId: string,
  config?: Pick<CityConfig, "officialName" | "name"> | null,
): string {
  if (config?.officialName?.trim()) return config.officialName.trim();
  if (cityId === "le-kremlin-bicetre") return "Le Kremlin-Bicêtre";
  return cityId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
