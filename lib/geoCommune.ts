import type { CityConfig } from "@/lib/api";

export function getGeoCommuneName(
  cityId: string,
  config?: Pick<CityConfig, "officialName" | "name"> | null,
): string {
  if (config?.officialName?.trim()) return config.officialName.trim();
  const envCityId = process.env.NEXT_PUBLIC_CITY_ID;
  if (envCityId && cityId === envCityId) {
    return envCityId
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return cityId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
