import type { DashboardAlert } from "@/lib/api";

export type ModerationTab = "reports" | "questions" | "suggestions";

export function moderationTabForAlert(alert: DashboardAlert): ModerationTab {
  if (alert.type === "report") return "reports";
  return alert.contactKind === "suggestion" ? "suggestions" : "questions";
}

export function openAlertInModeration(alert: DashboardAlert): {
  tab: ModerationTab;
  ticketId?: number;
  contactKind?: "question" | "suggestion";
} {
  const tab = moderationTabForAlert(alert);
  if (alert.type !== "contact") {
    return { tab };
  }
  return {
    tab,
    ticketId: alert.entityId,
    contactKind: alert.contactKind ?? "question",
  };
}

export function setModerationNavigation(
  tab: ModerationTab,
  ticketId?: number,
  contactKind?: "question" | "suggestion",
): void {
  sessionStorage.setItem("moderation_tab", tab);
  if (ticketId != null) {
    sessionStorage.setItem("moderation_ticket_id", String(ticketId));
  }
  if (contactKind) {
    sessionStorage.setItem("moderation_contact_kind", contactKind);
  }
}

export function consumeModerationSession(): {
  tab: ModerationTab;
  ticketId: number | null;
} {
  if (typeof window === "undefined") {
    return { tab: "reports", ticketId: null };
  }

  let tab: ModerationTab = "reports";
  let ticketId: number | null = null;

  const savedTab = sessionStorage.getItem("moderation_tab");
  if (
    savedTab === "reports" ||
    savedTab === "questions" ||
    savedTab === "suggestions" ||
    savedTab === "messages"
  ) {
    tab = savedTab === "messages" ? "questions" : (savedTab as ModerationTab);
    sessionStorage.removeItem("moderation_tab");
  }

  const savedTicket = sessionStorage.getItem("moderation_ticket_id");
  if (savedTicket) {
    const id = Number(savedTicket);
    if (!Number.isNaN(id)) {
      ticketId = id;
    }
    sessionStorage.removeItem("moderation_ticket_id");
  }

  const savedKind = sessionStorage.getItem("moderation_contact_kind");
  if (savedKind === "suggestion" && ticketId != null) {
    tab = "suggestions";
  } else if (savedKind === "question" && ticketId != null) {
    tab = "questions";
  } else if (ticketId != null && tab === "reports") {
    tab = "questions";
  }
  if (savedKind) sessionStorage.removeItem("moderation_contact_kind");

  return { tab, ticketId };
}
