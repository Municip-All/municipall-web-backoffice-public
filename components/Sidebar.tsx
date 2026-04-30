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
  Calendar
} from "lucide-react";
import clsx from "clsx";

export type ViewType = "pouls-ai" | "moderation" | "widgets" | "targeted-push" | "neighborhoods" | "settings" | "profile" | "construction" | "waste" | "events";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: "pouls-ai",
      label: "Pouls de la Ville",
      icon: LayoutDashboard,
      badge: "IA"
    },
    {
      id: "moderation",
      label: "Signalements",
      icon: ShieldAlert,
    },
    {
      id: "targeted-push",
      label: "Alertes Directes",
      icon: Send,
    },
    {
      id: "widgets",
      label: "Services GPS",
      icon: Smartphone,
    },
    {
      id: "neighborhoods",
      label: "Secteurs Géo",
      icon: Map,
    },
    {
      id: "events",
      label: "Agenda & Événements",
      icon: Calendar,
    },
    {
      id: "construction",
      label: "Chantiers & Travaux",
      icon: Hammer,
    },
    {
      id: "waste",
      label: "Calendrier Déchets",
      icon: Trash2,
    },
  ] as const;

  return (
    <aside className="w-80 bg-[var(--card)]/30 backdrop-blur-3xl border-r border-[var(--card-border)] flex flex-col justify-between py-10 shadow-2xl z-20 h-full transition-all duration-500">
      <div className="px-6 space-y-3 flex-1">
        <div className="px-5 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-[14px] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-[var(--foreground)] tracking-tighter">Municip&apos;All</h1>
            <p className="text-[9px] font-black text-apple-muted uppercase tracking-[0.2em] opacity-40">Command Center</p>
          </div>
        </div>

        <p className="px-5 text-[10px] font-black text-apple-muted mb-6 uppercase tracking-[0.3em] opacity-30">
          Supervision
        </p>

        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                "w-full flex items-center justify-between px-5 py-4 rounded-[22px] text-sm font-black transition-all duration-500 group outline-none mb-2",
                isActive 
                  ? "bg-[var(--card)] shadow-xl shadow-black/5 text-[var(--foreground)] border border-white/20 dark:border-white/5" 
                  : "text-apple-muted hover:bg-white/40 dark:hover:bg-zinc-800/40 hover:text-[var(--foreground)]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-11 h-11 rounded-[15px] flex items-center justify-center transition-all duration-500",
                  isActive ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                )}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="tracking-tight">{item.label}</span>
              </div>
              {'badge' in item && (
                <span className="text-[8px] font-black bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full border border-[var(--accent)]/20 uppercase tracking-widest">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-6 pt-10 border-t border-[var(--card-border)]/50 space-y-3">
        {[
          { id: "profile", label: "Mon Profil Agent", icon: User },
          { id: "settings", label: "Configuration Ville", icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={clsx(
              "w-full flex items-center gap-4 px-5 py-3 rounded-[20px] text-[13px] font-black transition-all duration-300 group outline-none",
              activeView === item.id
                ? "bg-[var(--card)] shadow-md text-[var(--accent)] border border-[var(--card-border)]" 
                : "text-apple-muted hover:text-[var(--foreground)]"
            )}
          >
            <item.icon className={clsx(
              "w-5 h-5 transition-colors",
              activeView === item.id ? "text-[var(--accent)]" : "text-zinc-400 group-hover:text-zinc-600"
            )} strokeWidth={2.5} />
            <span className="tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
