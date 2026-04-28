"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Send, AlertCircle, Info, Radio, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

// Load map dynamically (client-only — Leaflet needs window)
const CommuneMap = dynamic(() => import("@/components/CommuneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <span className="text-xs text-gray-400 font-medium">Chargement de la carte…</span>
    </div>
  ),
});


export default function TargetedCommunication() {
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "urgent">("info");
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [cityName, setCityName] = useState<string>("");
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user?.cityId) return;
      api.getCityConfig(user.cityId)
        .then(config => {
          if (config && config.name && config.name !== "Municip'All") {
            setCityName(config.name);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customZones = (config as any).neighborhoods || [];
            setNeighborhoods(customZones);
          } else {
            setCityName("Paris");
          }
        })
        .catch(() => setCityName("Paris"));
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.cityId]);

  const toggleZone = (name: string) => {
    setSelectedZones(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalCitizens = useMemo(() => {
    // Estimated citizens per zone based on area or fixed average
    return selectedZones.size * 1250; // Simple estimate
  }, [selectedZones]);

  const handleSend = async () => {
    if (!title || !message || selectedZones.size === 0) return;
    setIsSending(true);
    try {
      const response = await api.post("/api/v1/notifications/send", {
        title,
        message,
        type: alertType,
        zones: Array.from(selectedZones),
        cityId: user?.cityId,
      });

      if (response.error) {
        toast("error", `Échec de l'envoi : ${response.error}`);
      } else {
        toast("success", `Alerte envoyée à ~${totalCitizens.toLocaleString('fr-FR')} citoyens !`);
        setTitle("");
        setMessage("");
        setSelectedZones(new Set());
      }
    } catch {
      toast("error", "Impossible de contacter le serveur.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
          Communication Directe
        </h2>
        <p className="text-sm text-gray-500">Envoyez des alertes push ciblées directement sur le smartphone des citoyens selon leur position GPS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Rédiger le message</h3>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l&apos;alerte</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Travaux sur le réseau d&apos;eau" 
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
              <span>Le message doit être concis et aller à l&apos;essentiel.</span>
              <span>{message.length}/250 caractères</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Type d&apos;alerte</label>
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
                  <Info className="w-4 h-4" />
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
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-municipall-blue" />
              Ciblage Géographique GPS
            </h3>
            {cityName && (
              <p className="text-xs text-gray-400 mb-4 font-medium">
                Carte officielle IGN • <span className="text-municipall-blue font-bold">{cityName}</span>
                {" "}• Cliquez sur un quartier pour le sélectionner
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Real map - takes 3/5 of the grid */}
              <div className="md:col-span-3 h-72">
                {cityName ? (
                  <CommuneMap
                    cityName={cityName}
                    selectedZones={selectedZones}
                    onZoneToggle={toggleZone}
                    customNeighborhoods={neighborhoods}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-xs text-gray-400">Connexion en cours…</p>
                  </div>
                )}
              </div>
              
              {/* Zone list - takes 2/5 */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-3">Sélectionnez les quartiers :</p>
                  <div className="space-y-2">
                    {neighborhoods.map(zone => {
                      const isSelected = selectedZones.has(zone.name);
                      return (
                        <button
                          key={zone.id || zone.name}
                          onClick={() => toggleZone(zone.name)}
                          className={clsx(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none",
                            isSelected 
                              ? "bg-indigo-50 border-municipall-blue/30 text-municipall-blue" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <div className={clsx("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-municipall-blue border-municipall-blue text-white" : "border-gray-300 bg-white")}>
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <span className={clsx("text-xs font-semibold", isSelected && "font-bold text-gray-900")}>{zone.name}</span>
                        </button>
                      );
                    })}
                    {neighborhoods.length === 0 && (
                      <p className="text-xs text-zinc-400 italic">Aucun quartier défini dans le gestionnaire.</p>
                    )}
                  </div>
                </div>

                {selectedZones.size > 0 && (
                  <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-3 text-sm text-municipall-blue flex items-center justify-center font-medium mt-4">
                    ~<span className="font-bold mx-1 text-gray-900">{totalCitizens.toLocaleString('fr-FR')}</span> citoyens recevront cette alerte.
                  </div>
                )}
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
                        <span className="text-[10px] font-bold text-gray-900 tracking-wide">MUNICIP&apos;ALL</span>
                      </div>
                      <span className="text-[10px] text-gray-400">à l&apos;instant</span>
                    </div>
                    <div className="mt-2">
                      <h4 className={clsx("text-sm font-bold leading-tight mb-1", alertType === "urgent" ? "text-red-600" : "text-gray-900")}>
                        {title || "Titre de l'alerte"}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-snug line-clamp-4" style={{ wordBreak: 'break-word' }}>
                        {message || "Détaillez votre message ici... (Aperçu en temps réel pour validation avant envoi)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSend}
            disabled={!title || !message || selectedZones.size === 0 || isSending}
            className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-municipall-blue/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSending ? "Envoi en cours…" : "Envoyer l'alerte via GPS"}
          </button>
        </div>

      </div>
    </div>
  );
}
