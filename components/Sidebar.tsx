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
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col justify-between py-6 shadow-sm z-20 h-full">
      <div className="px-4 space-y-1.5 flex-1">
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-l-4 group outline-none",
                isActive 
                  ? "bg-indigo-50/70 text-municipall-blue border-municipall-blue shadow-sm" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 border-l-4 group outline-none mt-2",
            activeView === "settings"
              ? "bg-indigo-50/70 text-municipall-blue border-municipall-blue shadow-sm" 
              : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
