/** API host root without trailing slash (no `/api/v1` suffix). */
export function getConfiguredApiRoot(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function isLocalApiRoot(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Base URL for browser API calls. Remote APIs use same-origin `/api/v1/*` so
 * Next.js rewrites proxy to dev/prod without CORS issues on localhost.
 */
export function getApiBaseUrl(): string {
  const configured = getConfiguredApiRoot();
  if (!configured) return "http://localhost:3000";
  if (!isLocalApiRoot(configured) && typeof window !== "undefined") {
    return "";
  }
  return configured;
}

export function getApiProxyRewriteTarget(): string | null {
  const configured = getConfiguredApiRoot();
  if (!configured || isLocalApiRoot(configured)) return null;
  return configured;
}
