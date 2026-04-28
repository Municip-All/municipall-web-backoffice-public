"use client";

import { useEffect, useState } from "react";
import { LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface HeaderProps {
  onViewChange: (view: any) => void;
}

export default function Header({ onViewChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const [cityName, setCityName] = useState<string>("");

  useEffect(() => {
    if (!user?.cityId) return;
    api.getCityConfig(user.cityId).then(config => {
      if (config) setCityName(config.name);
    }).catch(() => {});
  }, [user?.cityId]);

  return (
    <header className="h-[72px] bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-8 flex items-center justify-between shrink-0 relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-municipall-blue rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(11,0,128,0.25)] border border-white/20 cursor-pointer hover:scale-105 transition-transform" onClick={() => onViewChange("pouls-ai")}>
          <Building2 className="text-white w-5 h-5" />
        </div>
        <div className="cursor-pointer" onClick={() => onViewChange("pouls-ai")}>
          <h1 className="text-xl font-extrabold text-municipall-blue tracking-tight leading-none mb-0.5">
            Municip&apos;All
          </h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            {cityName ? cityName.toUpperCase() : "ESPACE MAIRIE"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-2 rounded-2xl transition-colors"
          onClick={() => onViewChange("profile")}
        >
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm leading-tight">
              {user?.name ? `${user.name} ${user.surname || ''}`.trim() : 'Agent'}
            </p>
            <p className="text-xs text-gray-500">{user?.role || 'Service Municipal'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-200 border border-white overflow-hidden shadow-sm">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Building2 className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={logout}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2" 
          aria-label="Se déconnecter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
