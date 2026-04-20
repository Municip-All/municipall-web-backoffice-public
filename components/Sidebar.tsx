import React from "react";
import { LayoutGrid, AlertTriangle, Bell, Settings } from "lucide-react";
import clsx from "clsx";

export type ViewType = "pouls-ai" | "moderation" | "widgets" | "targeted-push";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems = [
  { id: "pouls-ai", label: "Pouls de la Ville", icon: LayoutGrid },
  { id: "moderation", label: "Modération", icon: AlertTriangle },
  { id: "targeted-push", label: "Communication Directe", icon: Bell },
  { id: "widgets", label: "Gestion des Widgets", icon: Settings },
] as const;

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 relative z-10">
      <nav className="flex flex-col gap-1 px-4 py-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-left w-full text-sm font-semibold relative",
                isActive 
                  ? "text-municipall-blue bg-indigo-50/70" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-municipall-blue rounded-r-full -ml-4" />
              )}
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 px-4">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
          <p className="text-xs font-bold text-municipall-blue mb-1">Système Opérationnel</p>
          <p className="text-[10px] text-gray-500">Dernière maj: Aujourd'hui, 08:30</p>
        </div>
      </div>
    </aside>
  );
}
