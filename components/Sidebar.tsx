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
  Users,
  Landmark,
  Star,
  Bot,
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
  | "assistant-ai"
  | "widgets"
  | "targeted-push"
  | "neighborhoods"
  | "settings"
  | "profile"
  | "construction"
  | "waste"
  | "events"
  | "transport"
  | "associations"
  | "city-profile"
  | "citizen-feedback";

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

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  desktopCollapsed?: boolean;
}

export default function Sidebar({
  activeView,
  onViewChange,
  mobileOpen = false,
  onMobileClose,
  desktopCollapsed = false,
}: SidebarProps) {
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
          id: "citizen-feedback",
          label: "Avis citoyens",
          icon: Star,
          permission: Permission.FEEDBACK_READ,
          title: "Réservé au maire",
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
        {
          id: "assistant-ai",
          label: "Assistant IA",
          icon: Bot,
          permission: Permission.REPORTS_READ,
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
        {
          id: "associations",
          label: "Vie associative",
          icon: Users,
          permission: Permission.CITY_CONFIG_WRITE,
        },
        {
          id: "city-profile",
          label: "Fiche commune",
          icon: Landmark,
          permission: Permission.CITY_CONFIG_WRITE,
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

  const handleNav = (view: ViewType) => {
    onViewChange(view);
    onMobileClose?.();
  };

  const renderButton = (item: NavItem) => {
    const isActive = activeView === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNav(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={clsx(
          "flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
          isActive
            ? "bg-[var(--color-primary-bg)] text-[var(--accent)] ring-1 ring-[var(--accent)]/20"
            : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon
            className={clsx(
              "h-[18px] w-[18px] shrink-0",
              isActive ? "text-[var(--accent)]" : "text-[var(--muted)]",
            )}
            strokeWidth={isActive ? 2.25 : 2}
            aria-hidden
          />
          <span className="truncate">{item.label}</span>
        </span>
        {item.count && item.count > 0 ? (
          <span
            title={item.title}
            aria-label={
              item.title ?? `${item.count} élément(s) en attente`
            }
            className={clsx(
              "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-[var(--color-on-brand)]",
              item.urgent ? "bg-[var(--color-danger)]" : "bg-amber-500",
            )}
          >
            {item.count > 99 ? "99+" : item.count}
          </span>
        ) : isActive ? (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
            aria-hidden
          />
        ) : null}
      </button>
    );
  };

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-x-0 bottom-0 top-[72px] z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-label="Fermer le menu de navigation"
        />
      ) : null}

      <aside
        id="app-sidebar"
        aria-label="Navigation principale"
        aria-hidden={!mobileOpen && desktopCollapsed ? true : undefined}
        className={clsx(
          "flex h-full shrink-0 flex-col border-r border-[var(--card-border)] bg-[var(--card)] shadow-sidebar transition-[transform,width,opacity] duration-300 ease-out",
          // Mobile drawer — sous le header, pas en plein écran
          "fixed bottom-0 left-0 top-[72px] z-40 w-[min(100%,280px)] lg:static lg:top-auto lg:z-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop — rétractable
          desktopCollapsed
            ? "lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0"
            : "lg:w-[280px] lg:opacity-100",
        )}
      >
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="mb-4 flex items-center gap-3 px-1">
            <BrandLogo size="md" />
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold leading-tight text-[var(--foreground)]">
                Municip&apos;All Panel
              </p>
              <p className="text-xs font-medium text-[var(--muted)]">
                {isMayor ? "Espace maire" : "Espace mairie"}
              </p>
            </div>
          </div>

          <nav className="space-y-5">
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
    </>
  );
}
