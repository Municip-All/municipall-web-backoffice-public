import React from "react";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Smartphone, 
  Send,
  Settings
} from "lucide-react";
import clsx from "clsx";

export type ViewType = "pouls-ai" | "moderation" | "widgets" | "targeted-push" | "settings";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    {
      id: "pouls-ai",
      label: "Pouls de la Ville (IA)",
      icon: LayoutDashboard,
    },
    {
      id: "moderation",
      label: "Console de Modération",
      icon: ShieldAlert,
    },
    {
      id: "targeted-push",
      label: "Communication Directe",
      icon: Send,
    },
    {
      id: "widgets",
      label: "Gestionnaire de Widgets",
      icon: Smartphone,
    },
  ] as const;

  return (
    <aside className="w-72 bg-white/40 backdrop-blur-3xl border-r border-white/60 flex flex-col justify-between py-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 h-full">
      <div className="px-4 space-y-2 flex-1">
        <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
          Outils d&apos;Administration
        </p>

        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-sm font-bold transition-all duration-300 group outline-none",
                isActive 
                  ? "bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] text-municipall-blue" 
                  : "text-zinc-500 hover:bg-white/60 hover:text-zinc-900"
              )}
            >
              <Icon className={clsx(
                "w-[22px] h-[22px] transition-colors",
                isActive ? "text-municipall-blue flex-shrink-0 drop-shadow-sm" : "text-gray-400 group-hover:text-gray-700"
              )} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-auto">
        <button
          onClick={() => onViewChange("settings")}
          className={clsx(
            "w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-sm font-bold transition-all duration-300 group outline-none mt-2",
            activeView === "settings"
              ? "bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] text-municipall-blue" 
              : "text-zinc-500 hover:bg-white/60 hover:text-zinc-900"
          )}
        >
          <Settings className={clsx(
            "w-[22px] h-[22px] transition-colors",
            activeView === "settings" ? "text-municipall-blue drop-shadow-sm" : "text-gray-400 group-hover:text-gray-700"
          )} strokeWidth={activeView === "settings" ? 2.5 : 2} />
          Paramètres Marque Blanche
        </button>
      </div>
    </aside>
  );
}
