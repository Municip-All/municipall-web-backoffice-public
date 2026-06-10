export type ContactTicketType = "question" | "suggestion";

export const SUGGESTION_STATUSES = [
  "En attente",
  "À l'étude",
  "Retenue",
  "Mise en œuvre",
  "Réalisée",
  "Non retenue",
  "Clôturé",
] as const;

const SUGGESTION_TERMINAL = new Set<string>([
  "Réalisée",
  "Non retenue",
  "Clôturé",
]);

export function isTerminalContactStatus(
  ticketType: ContactTicketType,
  status: string,
): boolean {
  if (ticketType === "suggestion") {
    return SUGGESTION_TERMINAL.has(status);
  }
  return status === "Clôturé";
}

export function suggestionStatusStyle(status: string): string {
  switch (status) {
    case "En attente":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "À l'étude":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "Retenue":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "Mise en œuvre":
      return "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]";
    case "Réalisée":
      return "border-green-200 bg-green-50 text-green-800";
    case "Non retenue":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "Clôturé":
      return "border-zinc-200 bg-zinc-100 text-zinc-500";
    default:
      return "border-zinc-200 bg-zinc-100 text-zinc-500";
  }
}
