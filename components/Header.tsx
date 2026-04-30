"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { LogOut, Building2, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/lib/api";
import { ViewType } from "./Sidebar";

interface HeaderProps {
  onViewChange: (view: ViewType) => void;
}

export default function Header({ onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    if (!user?.cityId) return;
    api.getCityConfig(user.cityId).then(config => {
      if (config) setCityName(config.name);
    }).catch(() => {});
  }, [user?.cityId]);

  return (
    <header className="h-[80px] bg-glass border-b px-8 flex items-center justify-between shrink-0 relative z-20 shadow-sm transition-all duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[var(--accent)] rounded-[18px] flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 border border-white/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => onViewChange("pouls-ai")}>
          <Building2 className="text-white w-6 h-6" />
        </div>
        <div className="cursor-pointer" onClick={() => onViewChange("pouls-ai")}>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tighter leading-none mb-0.5">
            Municip&apos;All
          </h1>
          <p className="text-apple-muted opacity-50 text-[9px] font-black">
            {cityName ? cityName.toUpperCase() : "ESPACE MAIRIE"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:scale-110 transition-all border border-[var(--card-border)]"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div 
          className="flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-2xl transition-colors group"
          onClick={() => onViewChange("profile")}
        >
          <div className="text-right">
            <p className="font-black text-[var(--foreground)] text-sm leading-tight">
              {user?.name ? `${user.name} ${user.surname || ''}`.trim() : 'Agent'}
            </p>
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{user?.role || 'Service Municipal'}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 border-2 border-[var(--card)] overflow-hidden shadow-xl group-hover:scale-105 transition-transform relative">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Building2 className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all" 
          aria-label="Se déconnecter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
