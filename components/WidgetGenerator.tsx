"use client";

import React, { useState } from "react";
import { CarFront, CloudRainWind, CalendarHeart, MapPin, Radio, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface WidgetItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  isBeta?: boolean;
}

const initialWidgets: WidgetItem[] = [
  {
    id: "traffic",
    name: "Info Trafic & Travaux",
    description: "Affiche les perturbations en temps réel sur la carte de la ville.",
    icon: CarFront,
    enabled: true,
  },
  {
    id: "weather",
    name: "Météo & Alertes",
    description: "Vigilance météorologique et prévisions locales.",
    icon: CloudRainWind,
    enabled: false,
  },
  {
    id: "cultural",
    name: "Agenda Culturel",
    description: "Synchronisation avec le flux évènementiel (Bientôt disponible).",
    icon: CalendarHeart,
    enabled: false,
    isBeta: true,
  }
];

export default function WidgetGenerator() {
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);

  const toggleWidget = (id: string, isBeta?: boolean) => {
    if (isBeta) return;
    setWidgets(current => current.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const activeWidgets = widgets.filter(w => w.enabled);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
            Gestionnaire de Widgets
          </h2>
          <p className="text-sm text-gray-500">Activez les services géolocalisés disponibles pour vos citoyens équipés de l&apos;application Municip&apos;All.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Modules Disponibles</h3>
          <div className="flex flex-col gap-4">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <div 
                  key={widget.id} 
                  className={clsx(
                    "card-panel p-5 flex items-center justify-between transition-all",
                    widget.isBeta && "opacity-60 bg-gray-50",
                    widget.enabled && "border-municipall-blue/30 shadow-[0_0_10px_rgba(11,0,128,0.05)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                      widget.enabled ? "bg-indigo-100 text-municipall-blue" : widget.isBeta ? "bg-green-100 text-green-500" : "bg-blue-50 text-blue-500"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        {widget.name}
                        {widget.isBeta && <span className="bg-gray-200 text-gray-600 text-[10px] uppercase px-2 py-0.5 rounded font-bold">Bêta</span>}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">{widget.description}</p>
                    </div>
                  </div>

                  {!widget.isBeta && (
                    <button 
                      onClick={() => toggleWidget(widget.id, widget.isBeta)}
                      className={clsx(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0",
                        widget.enabled ? "bg-municipall-blue" : "bg-gray-200"
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          widget.enabled ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            <Radio className="w-5 h-5 text-municipall-blue" />
            Synchronisation Automatique (GPS)
          </h3>
          <div className="card-panel p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <MapPin className="w-48 h-48" />
            </div>

            <p className="text-sm text-gray-600 mb-8 max-w-sm relative z-10">
              Le back-office est directement relié par GPS à l&apos;application de vos citoyens. Dès qu&apos;un habitant ouvre l&apos;application dans votre commune, les modules activés s&apos;affichent instantanément sans aucune intégration web nécessaire de votre part.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              
              <div className="flex-1 w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full border border-indigo-200 rounded-2xl animate-pulse opacity-50 absolute"></div>
                  <div className="w-[80%] h-[80%] border border-indigo-300 rounded-2xl animate-pulse opacity-30 absolute" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-[60%] h-[60%] border border-indigo-400 rounded-2xl animate-pulse opacity-20 absolute" style={{ animationDelay: '0.2s' }}></div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-municipall-blue text-center bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm border border-indigo-50">
                  <span className="font-bold">Secteur Ville</span>
                  <span className="text-xs text-indigo-700 font-medium">Liaison satellitaire active</span>
                </div>
              </div>

              <div className="text-indigo-300 transform md:-rotate-90 md:mx-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </div>

              <div className="flex-1 w-full flex flex-col items-center">
                <div className="w-24 h-48 bg-gray-900 rounded-2xl shadow-xl border-4 border-gray-800 p-2 flex flex-col gap-2 relative overflow-hidden">
                  <div className="w-full bg-gray-100 h-6 rounded-md flex items-center px-2">
                    <span className="text-[6px] font-bold text-gray-800">Municip&apos;All</span>
                  </div>
                  {activeWidgets.length > 0 ? (
                    activeWidgets.map(widget => {
                      const Icon = widget.icon;
                      return (
                        <div key={widget.id} className="bg-municipall-blue/10 border border-municipall-blue/20 rounded-md p-1.5 flex items-center gap-1.5">
                          <Icon className="w-3 h-3 text-municipall-blue" />
                          <div className="h-1 flex-1 bg-municipall-blue/30 rounded-full"></div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-[8px] text-gray-500 italic text-center leading-tight">Aucun module activé</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 w-8 h-1 bg-gray-800 rounded-full left-1/2 -translate-x-1/2"></div>
                </div>
                <div className="mt-4 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700">App connectée</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
