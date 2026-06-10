"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, MessageSquare, ShieldAlert } from "lucide-react";
import clsx from "clsx";
import { useInbox } from "@/context/InboxContext";
import { DashboardAlert } from "@/lib/api";
import {
  openAlertInModeration,
  setModerationNavigation,
} from "@/lib/moderationNav";
import { ViewType } from "./Sidebar";

interface NotificationCenterProps {
  onViewChange: (view: ViewType) => void;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function severityStyles(severity: DashboardAlert["severity"]) {
  switch (severity) {
    case "urgent":
      return "border-red-500/30 bg-red-500/5";
    case "high":
      return "border-amber-500/30 bg-amber-500/5";
    default:
      return "border-[var(--card-border)] bg-[var(--card)] dark:bg-zinc-800/30";
  }
}

export default function NotificationCenter({
  onViewChange,
}: NotificationCenterProps) {
  const { alerts, pendingTotal, urgentCount, isLoading } = useInbox();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const openAlert = (alert: DashboardAlert) => {
    const nav = openAlertInModeration(alert);
    setModerationNavigation(nav.tab, nav.ticketId, nav.contactKind);
    setOpen(false);
    onViewChange("moderation");
  };

  const badgeCount = pendingTotal;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost relative !rounded-full !p-2.5"
        aria-label="Centre de notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {badgeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-[var(--card)]">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-premium">
          <div className="border-b border-[var(--card-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Centre de notifications
            </p>
            <p className="text-[11px] text-[var(--muted)]">
              {urgentCount > 0
                ? `${urgentCount} alerte${urgentCount > 1 ? "s" : ""} urgente${urgentCount > 1 ? "s" : ""}`
                : "Aucune urgence détectée"}
              {pendingTotal > 0 ? ` · ${pendingTotal} à traiter` : ""}
            </p>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                Chargement…
              </p>
            ) : alerts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                Rien à signaler pour le moment.
              </p>
            ) : (
              alerts.slice(0, 12).map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => openAlert(alert)}
                  className={clsx(
                    "flex w-full gap-3 border-b border-[var(--card-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-subtle)] dark:hover:bg-zinc-800/50",
                    severityStyles(alert.severity),
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === "urgent" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : alert.type === "contact" ? (
                      <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[var(--foreground)]">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--muted)]">
                      {alert.subtitle}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold text-[var(--muted)]">
                      {formatRelativeTime(alert.createdAt)}
                      {alert.severity === "urgent" && (
                        <span className="ml-2 text-red-500">URGENT</span>
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {pendingTotal > 0 && (
            <div className="border-t border-[var(--card-border)] p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onViewChange("moderation");
                }}
                className="w-full rounded-xl py-2.5 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                Voir tout ({pendingTotal})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
