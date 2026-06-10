/** Aligné sur municipall-backend-public/src/core/auth/permissions.ts */

export const Permission = {
  REPORTS_READ: "reports:read",
  REPORTS_REPLY: "reports:reply",
  REPORTS_STATUS: "reports:status",
  CONTACT_READ: "contact:read",
  CONTACT_REPLY: "contact:reply",
  CONTACT_CLOSE: "contact:close",
  CITY_CONFIG_READ: "city_config:read",
  CITY_CONFIG_WRITE: "city_config:write",
  NOTIFICATIONS_SEND: "notifications:send",
  EVENTS_MANAGE: "events:manage",
  CONSTRUCTION_MANAGE: "construction:manage",
  WIDGETS_READ: "widgets:read",
  NEIGHBORHOODS_MANAGE: "neighborhoods:manage",
  TEAM_READ: "team:read",
  TEAM_MANAGE: "team:manage",
  TEAM_KPIS: "team:kpis",
  FEEDBACK_CREATE: "feedback:create",
  FEEDBACK_READ: "feedback:read",
  PROFILE_READ: "profile:read",
  PROFILE_WRITE: "profile:write",
} as const;

export type PermissionCode = (typeof Permission)[keyof typeof Permission];

const STAFF_ROLES = new Set([
  "mayor",
  "maire",
  "mairie",
  "assistant",
  "conseiller",
  "adjoint",
  "agent",
  "agent municipal",
]);

export function normalizeRole(role: string | undefined | null): string {
  return (role ?? "").trim().toLowerCase();
}

export function isBackofficeStaff(role: string | undefined | null): boolean {
  const n = normalizeRole(role);
  if (!n || n === "citizen" || n === "citoyen") return false;
  if (STAFF_ROLES.has(n)) return true;
  return n.startsWith("agent") || n.includes("mairie");
}

export function isMayor(role: string | undefined | null): boolean {
  const n = normalizeRole(role);
  return n === "mayor" || n === "maire" || n === "mairie";
}

export function hasPermission(
  permissions: string[] | undefined,
  code: PermissionCode,
): boolean {
  return Boolean(permissions?.includes(code));
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  codes: PermissionCode[],
): boolean {
  return codes.some((c) => hasPermission(permissions, c));
}
