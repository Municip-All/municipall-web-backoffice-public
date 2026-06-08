function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

export function roleLabel(role: string): string {
  const n = normalizeRole(role);
  if (n === "mayor" || n === "maire" || n === "mairie") return "Maire";
  if (n === "assistant" || n === "conseiller") return "Assistant";
  if (n === "agent") return "Agent";
  if (n === "citizen" || n === "citoyen") return "Citoyen";
  if (n === "platform_admin" || n === "admin") return "Administrateur";
  return role;
}

/** Classes Tailwind avec contraste lisible en clair et en sombre */
export function roleBadgeClass(role: string): string {
  const n = normalizeRole(role);
  if (n === "mayor" || n === "maire" || n === "mairie") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
  }
  if (n === "assistant" || n === "conseiller") {
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300";
  }
  if (n === "agent") {
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300";
  }
  if (n === "citizen" || n === "citoyen") {
    return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
  }
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
}
