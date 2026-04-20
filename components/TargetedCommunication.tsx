"use client";

import React, { useState, useMemo } from "react";
import { Send, MapPin, AlertCircle, Info, Radio } from "lucide-react";
import clsx from "clsx";

const neighborhoods = [
  { id: "nv", name: "Centre-Ville Historique", citizens: 3120 },
  { id: "qn", name: "Quartier Nord", citizens: 2450 },
  { id: "zi", name: "Zone Industrielle Sud", citizens: 890 },
  { id: "ce", name: "Les Coteaux Est", citizens: 1840 },
];

export default function TargetedCommunication() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "urgent">("info");
  
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set(["qn"]));

  const toggleZone = (id: string) => {
    setSelectedZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalCitizens = useMemo(() => {
    return neighborhoods
      .filter(n => selectedZones.has(n.id))
      .reduce((acc, curr) => acc + curr.citizens, 0);
  }, [selectedZones]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
          Communication Directe
        </h2>
        <p className="text-sm text-gray-500">Envoyez des alertes push ciblées directement sur le smartphone des citoyens selon leur position GPS actuelle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Rédiger le message</h3>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'alerte</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Travaux sur le réseau d'eau" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue outline-none transition-all shadow-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Message (Push)</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Détaillez votre message ici..."
                maxLength={250}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-3 h-28 resize-none focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
              <span>Le message doit être concis et aller à l'essentiel.</span>
              <span>{message.length}/250 caractères</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Type d'alerte</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAlertType("info")}
                  className={clsx(
                    "flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold transition-all",
                    alertType === "info" 
                      ? "border-gray-900 bg-white shadow-sm text-gray-900" 
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  Information
                </button>
                <button 
                  onClick={() => setAlertType("urgent")}
                  className={clsx(
                    "flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold transition-all",
                    alertType === "urgent" 
                      ? "border-red-500 bg-red-50 text-red-600 shadow-sm" 
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  Urgence
                </button>
              </div>
            </div>
          </div>

          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Radio className="w-5 h-5 text-municipall-blue" />
              Ciblage géographique GPS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-gray-100 rounded-xl h-48 relative overflow-hidden border border-gray-200 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                
                {/* Dynamically styled "zones" on the mock map based on selection */}
                <div className={clsx("absolute top-6 left-6 w-16 h-12 rounded-lg transform rotate-6 border-2 flex items-center justify-center transition-colors shadow-sm", selectedZones.has("nv") ? "bg-municipall-blue/80 border-municipall-blue text-white" : "bg-white/50 border-gray-300 text-gray-400")}><span className="text-[8px] font-bold">Centre</span></div>
                
                <div className={clsx("absolute top-12 left-28 w-24 h-16 transform -skew-x-12 -rotate-6 border-2 flex items-center justify-center transition-colors shadow-sm", selectedZones.has("qn") ? "bg-municipall-blue/80 border-municipall-blue text-white" : "bg-white/50 border-gray-300 text-gray-400")}><span className="text-[10px] font-bold">Nord</span></div>
                
                <div className={clsx("absolute bottom-6 left-12 w-20 h-10 rounded-full transform rotate-12 border-2 flex items-center justify-center transition-colors shadow-sm", selectedZones.has("zi") ? "bg-municipall-blue/80 border-municipall-blue text-white" : "bg-white/50 border-gray-300 text-gray-400")}><span className="text-[8px] font-bold">Z.I.</span></div>

                <div className={clsx("absolute bottom-10 right-6 w-16 h-20 rounded-xl transform -rotate-6 border-2 flex items-center justify-center transition-colors shadow-sm", selectedZones.has("ce") ? "bg-municipall-blue/80 border-municipall-blue text-white" : "bg-white/50 border-gray-300 text-gray-400")}><span className="text-[8px] font-bold text-center">Coteaux<br/>Est</span></div>
              </div>
              
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Sélectionnez les quartiers d'émission :</p>
                  <div className="space-y-2 mb-6">
                    {neighborhoods.map((zone) => {
                      const isSelected = selectedZones.has(zone.id);
                      return (
                        <button 
                          key={zone.id}
                          onClick={() => toggleZone(zone.id)}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none",
                            isSelected 
                              ? "bg-indigo-50 border-municipall-blue/30 text-municipall-blue" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-municipall-blue border-municipall-blue text-white" : "border-gray-300 bg-white")}>
                              {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span className={clsx(isSelected ? "font-bold text-gray-900" : "")}>{zone.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-3 text-sm text-municipall-blue flex items-center justify-center font-medium">
                  {selectedZones.size > 0 ? (
                    <>~ <span className="font-bold mx-1 text-gray-900">{totalCitizens.toLocaleString('fr-FR')}</span> citoyens recevront cette alerte.</>
                  ) : (
                    <span className="text-gray-500">Aucun quartier sélectionné.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card-panel p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wider text-center">Aperçu du Mobile</h3>
            
            <div className="w-[280px] h-[560px] bg-gray-900 rounded-[40px] p-3 shadow-xl relative border-4 border-gray-800 shrink-0">
              <div className="w-full h-full bg-gray-50 rounded-[28px] overflow-hidden relative flex flex-col pt-12">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl mx-16 z-20"></div>
                
                <div className="flex-1 px-4 relative z-10 pt-8">
                  <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 pb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-municipall-blue rounded flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] font-bold">M</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 tracking-wide">MUNICIP'ALL</span>
                      </div>
                      <span className="text-[10px] text-gray-400">à l'instant</span>
                    </div>
                    <div className="mt-2">
                      <h4 className={clsx("text-sm font-bold leading-tight mb-1", alertType === "urgent" ? "text-red-600" : "text-gray-900")}>
                        {title || "Titre de l'alerte"}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-snug line-clamp-4 overflow-hidden" style={{ wordBreak: 'break-word' }}>
                        {message || "Détaillez votre message ici... (Aperçu en temps réel pour validation avant envoi)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={!title || !message || selectedZones.size === 0}
            className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-municipall-blue/20"
          >
            <Send className="w-5 h-5" />
            Envoyer l'alerte via GPS
          </button>
        </div>

      </div>
    </div>
  );
}
