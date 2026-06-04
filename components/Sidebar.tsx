"use client";

import React from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Smartphone,
  Send,
  Map,
  Settings,
  User,
  Hammer,
  Trash2,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import BrandLogo from "@/components/BrandLogo";
import { useInbox } from "@/context/InboxContext";

export type ViewType =
  | "pouls-ai"
  | "moderation"
  | "widgets"
  | "targeted-push"
  | "neighborhoods"
  | "settings"
  | "profile"
  | "construction"
  | "waste"
  | "events";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { pendingTotal, pendingReports, pendingMessages, urgentCount } = useInbox();

  const menuItems = [
    {
      id: "pouls-ai" as const,
      label: "Tableau de bord",
      icon: LayoutDashboard,
    },
    {
      id: "moderation" as const,
      label: "Signalements",
      icon: ShieldAlert,
      count: pendingTotal,
      urgent: urgentCount > 0,
      title:
        pendingTotal > 0
          ? `${pendingReports} signalement(s), ${pendingMessages} message(s)`
          : undefined,
    },
    { id: "targeted-push" as const, label: "Alertes directes", icon: Send },
    { id: "widgets" as const, label: "Services GPS", icon: Smartphone },
    { id: "neighborhoods" as const, label: "Secteurs géo", icon: Map },
    { id: "events" as const, label: "Agenda & événements", icon: Calendar },
    { id: "construction" as const, label: "Chantiers & travaux", icon: Hammer },
    { id: "waste" as const, label: "Calendrier déchets", icon: Trash2 },
  ];

  const bottomItems = [
    { id: "profile" as const, label: "Mon profil", icon: User },
    { id: "settings" as const, label: "Configuration ville", icon: Settings },
  ];

  return (
    <aside className="z-20 flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--card)] shadow-sidebar">
      <div className="flex flex-col gap-1 p-5">
        <div className="mb-6 flex items-center gap-3 px-1">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold leading-tight text-[var(--foreground)]">
              Municip&apos;All Panel
            </h1>
            <p className="text-[11px] font-medium text-[var(--muted)]">
              Espace mairie
            </p>
          </div>
        </div>

        <p className="section-title mb-2 px-1">Supervision</p>

        <nav className="space-y-0.5" aria-label="Navigation principale">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={clsx(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all outline-none",
                  isActive
                    ? "bg-[var(--accent)]/[0.08] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-zinc-50 hover:text-[var(--foreground)] dark:hover:bg-zinc-800/60",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={clsx(
                      "h-[18px] w-[18px] shrink-0",
                      isActive ? "text-[var(--accent)]" : "text-zinc-400",
                    )}
                    strokeWidth={isActive ? 2.25 : 2}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {"count" in item && item.count && item.count > 0 ? (
                  <span
                    title={"title" in item ? item.title : undefined}
                    className={clsx(
                      "flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-black text-white",
                      "urgent" in item && item.urgent ? "bg-red-500" : "bg-red-500",
                    )}
                  >
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                ) : isActive ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-0.5 border-t border-[var(--card-border)] p-5">
        {bottomItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all outline-none",
                isActive
                  ? "bg-[var(--accent)]/[0.08] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-zinc-50 hover:text-[var(--foreground)] dark:hover:bg-zinc-800/60",
              )}
            >
              <Icon
                className={clsx(
                  "h-[18px] w-[18px]",
                  isActive ? "text-[var(--accent)]" : "text-zinc-400",
                )}
                strokeWidth={2}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
