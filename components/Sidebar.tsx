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
  BarChart3,
  UserCog,
  Bus,
} from "lucide-react";
import clsx from "clsx";
import BrandLogo from "@/components/BrandLogo";
import { useInbox } from "@/context/InboxContext";
import { usePermissions, Permission } from "@/context/PermissionsContext";

export type ViewType =
  | "team-insights"
  | "team-manage"
  | "pouls-ai"
  | "moderation"
  | "widgets"
  | "targeted-push"
  | "neighborhoods"
  | "settings"
  | "profile"
  | "construction"
  | "waste"
  | "events"
  | "transport";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

type NavItem = {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  permission?: (typeof Permission)[keyof typeof Permission];
  count?: number;
  urgent?: boolean;
  title?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { pendingTotal, pendingReports, pendingMessages, urgentCount } =
    useInbox();
  const { can, isMayor } = usePermissions();

  const sections: NavSection[] = [
    {
      title: "Pilotage",
      items: [
        {
          id: "team-insights",
          label: "Performance équipe",
          icon: BarChart3,
          permission: Permission.TEAM_KPIS,
        },
        {
          id: "team-manage",
          label: "Gestion des accès",
          icon: UserCog,
          permission: Permission.TEAM_MANAGE,
        },
        {
          id: "pouls-ai",
          label: "Tableau de bord",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Supervision",
      items: [
        {
          id: "moderation",
          label: "Signalements",
          icon: ShieldAlert,
          permission: Permission.REPORTS_READ,
          count: pendingTotal,
          urgent: urgentCount > 0,
          title:
            pendingTotal > 0
              ? `${pendingReports} signalement(s), ${pendingMessages} message(s)`
              : undefined,
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          id: "targeted-push",
          label: "Alertes directes",
          icon: Send,
          permission: Permission.NOTIFICATIONS_SEND,
        },
      ],
    },
    {
      title: "Services ville",
      items: [
        {
          id: "widgets",
          label: "Services GPS",
          icon: Smartphone,
          permission: Permission.WIDGETS_READ,
        },
        {
          id: "transport",
          label: "Transports IDFM",
          icon: Bus,
          permission: Permission.WIDGETS_READ,
        },
        {
          id: "neighborhoods",
          label: "Secteurs géo",
          icon: Map,
          permission: Permission.NEIGHBORHOODS_MANAGE,
        },
        {
          id: "events",
          label: "Agenda & événements",
          icon: Calendar,
          permission: Permission.EVENTS_MANAGE,
        },
        {
          id: "construction",
          label: "Chantiers & travaux",
          icon: Hammer,
          permission: Permission.CONSTRUCTION_MANAGE,
        },
        {
          id: "waste",
          label: "Calendrier déchets",
          icon: Trash2,
          permission: Permission.CITY_CONFIG_READ,
        },
      ],
    },
  ];

  const bottomItems: NavItem[] = [
    { id: "profile", label: "Mon profil", icon: User },
    {
      id: "settings",
      label: "Configuration ville",
      icon: Settings,
      permission: Permission.CITY_CONFIG_WRITE,
    },
  ];

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => !item.permission || can(item.permission));

  const renderButton = (item: NavItem) => {
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
        {item.count && item.count > 0 ? (
          <span
            title={item.title}
            className={clsx(
              "flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-black text-white",
              item.urgent ? "bg-red-500" : "bg-red-500",
            )}
          >
            {item.count > 99 ? "99+" : item.count}
          </span>
        ) : isActive ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
        ) : null}
      </button>
    );
  };

  return (
    <aside className="z-20 flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--card)] shadow-sidebar">
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-5">
        <div className="mb-4 flex items-center gap-3 px-1">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold leading-tight text-[var(--foreground)]">
              Municip&apos;All Panel
            </h1>
            <p className="text-[11px] font-medium text-[var(--muted)]">
              {isMayor ? "Espace maire" : "Espace mairie"}
            </p>
          </div>
        </div>

        <nav className="space-y-5" aria-label="Navigation principale">
          {sections.map((section) => {
            const items = filterItems(section.items);
            if (items.length === 0) return null;
            return (
              <div key={section.title}>
                <p className="section-title mb-2 px-1">{section.title}</p>
                <div className="space-y-0.5">{items.map(renderButton)}</div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="space-y-0.5 border-t border-[var(--card-border)] p-5">
        {filterItems(bottomItems).map(renderButton)}
      </div>
    </aside>
  );
}
