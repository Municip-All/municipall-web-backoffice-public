import React from "react";
import { LogOut, Building2 } from "lucide-react";

export default function Header() {
  return (
    <header className="h-[72px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0 relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-municipall-blue rounded-lg flex items-center justify-center shadow-sm border border-blue-900/10">
          <Building2 className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-municipall-blue tracking-tight leading-none mb-0.5">
            Municip'All
          </h1>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            BACK-OFFICE
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="font-bold text-gray-900 text-sm leading-tight">Jean Dupont</p>
          <p className="text-xs text-gray-500">Maire-Adjoint</p>
        </div>
        <button className="text-gray-400 hover:text-gray-700 transition-colors p-1" aria-label="Se déconnecter">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
