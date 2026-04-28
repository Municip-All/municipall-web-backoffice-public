"use client";

import { useEffect, useState } from "react";
import { LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Header() {
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
        <div className="w-10 h-10 bg-municipall-blue rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(11,0,128,0.25)] border border-white/20">
          <Building2 className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-municipall-blue tracking-tight leading-none mb-0.5">
            Municip&apos;All
          </h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            {cityName ? cityName.toUpperCase() : "ESPACE MAIRIE"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="font-bold text-gray-900 text-sm leading-tight">
            {user?.name ? `${user.name} ${user.surname || ''}`.trim() : 'Agent'}
          </p>
          <p className="text-xs text-gray-500">{user?.role || 'Service Municipal'}</p>
        </div>
        <button 
          onClick={logout}
          className="text-gray-400 hover:text-red-500 transition-colors p-1" 
          aria-label="Se déconnecter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
