/** API host root without trailing slash (no `/api/v1` suffix). */
export function getConfiguredApiRoot(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function isLocalApiRoot(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Base URL for browser API calls. When a proxy target is configured, requests use
 * same-origin `/api/v1/*` so Next.js rewrites forward to the backend (local or remote).
 */
export function getApiBaseUrl(): string {
  const configured = getConfiguredApiRoot();
  if (!configured) return "http://localhost:3000";
  if (getApiProxyRewriteTarget() && typeof window !== "undefined") {
    return "";
  }
  return configured;
}

export function getApiProxyRewriteTarget(): string | null {
  const configured = getConfiguredApiRoot();
  if (!configured) return null;
  return configured;
}
