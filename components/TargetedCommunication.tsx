"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Send, AlertCircle, Info, Radio, CheckCircle2, Loader2 } from "lucide-react";
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
  const [neighborhoods, setNeighborhoods] = useState<{ id: string, name: string, points: [number, number][] }[]>([]);
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
    <div className="p-10 h-full overflow-y-auto custom-scrollbar bg-[var(--background)] transition-colors duration-500">
      <div className="mb-10">
        <p className="text-apple-muted mb-3 opacity-60">Diffusion Géolocalisée</p>
        <h2 className="text-apple-title">Communication Directe</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="card-premium p-10">
            <h3 className="text-xl font-black text-[var(--foreground)] mb-8 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              Rédiger le message
            </h3>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">Titre de l&apos;alerte</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Travaux sur le réseau d&apos;eau"
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">Message (Notification Push)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Détaillez votre message ici..."
                maxLength={250}
                className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 h-40 resize-none outline-none transition-all font-bold shadow-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-apple-muted mb-10 opacity-50 uppercase tracking-widest">
              <span>Impact immédiat sur les smartphones</span>
              <span>{message.length}/250</span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-5 opacity-60">Priorité de diffusion</label>
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setAlertType("info")}
                  className={clsx(
                    "flex items-center justify-center gap-3 py-5 rounded-[22px] border-2 text-xs font-black uppercase tracking-widest transition-all",
                    alertType === "info"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] shadow-lg shadow-[var(--accent)]/10 scale-[1.02]"
                      : "border-transparent bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 opacity-60 hover:opacity-100"
                  )}
                >
                  <Info className="w-5 h-5" />
                  Information
                </button>
                <button
                  onClick={() => setAlertType("urgent")}
                  className={clsx(
                    "flex items-center justify-center gap-3 py-5 rounded-[22px] border-2 text-xs font-black uppercase tracking-widest transition-all",
                    alertType === "urgent"
                      ? "border-red-500 bg-red-500/5 text-red-500 shadow-lg shadow-red-500/10 scale-[1.02]"
                      : "border-transparent bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 opacity-60 hover:opacity-100"
                  )}
                >
                  <AlertCircle className="w-5 h-5" />
                  Urgence
                </button>
              </div>
            </div>
          </div>

          <div className="card-premium p-10">
            <h3 className="text-xl font-black text-[var(--foreground)] mb-3 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              Ciblage Géographique
            </h3>
            {cityName && (
              <p className="text-[10px] font-black text-apple-muted mb-8 uppercase tracking-[0.2em] opacity-40">
                IGN Carto • <span className="text-[var(--accent)]">{cityName}</span> • Sélection par zones
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
              {/* Real map - takes 3/5 of the grid */}
              <div className="md:col-span-3 h-[400px] rounded-[32px] overflow-hidden border border-[var(--card-border)] shadow-inner relative group">
                {cityName ? (
                  <CommuneMap
                    cityName={cityName}
                    selectedZones={selectedZones}
                    onZoneToggle={toggleZone}
                    customNeighborhoods={neighborhoods}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin opacity-40" />
                    <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest opacity-40">Initialisation...</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 border border-white/20 shadow-lg group-hover:opacity-0 transition-opacity pointer-events-none">Interactif</div>
              </div>

              {/* Zone list - takes 2/5 */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-5 opacity-60">SÉLECTION DES QUARTIERS :</p>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {neighborhoods.map(zone => {
                      const isSelected = selectedZones.has(zone.name);
                      return (
                        <button
                          key={zone.id || zone.name}
                          onClick={() => toggleZone(zone.name)}
                          className={clsx(
                            "w-full flex items-center justify-between px-5 py-4 rounded-[18px] border transition-all text-left group",
                            isSelected
                              ? "bg-[var(--accent)]/5 border-[var(--accent)] shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-800/20 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={clsx("w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all", isSelected ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-zinc-300 dark:border-zinc-700 group-hover:border-[var(--accent)]/50")}>
                              {isSelected && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <span className={clsx("text-sm font-bold tracking-tight", isSelected ? "text-[var(--foreground)]" : "text-[var(--muted)]")}>{zone.name}</span>
                          </div>
                        </button>
                      );
                    })}
                    {neighborhoods.length === 0 && (
                      <div className="py-10 text-center">
                        <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest opacity-30">Aucun quartier défini</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedZones.size > 0 && (
                  <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-[22px] p-5 text-center mt-6 animate-in slide-in-from-bottom-2 duration-300">
                    <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest mb-1 opacity-60">Audience Estimée</p>
                    <div className="text-2xl font-black text-[var(--foreground)] tracking-tighter">
                      ~ {totalCitizens.toLocaleString('fr-FR')} <span className="text-xs text-apple-muted opacity-60 ml-1">CITOYENS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="card-premium p-10 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-apple-muted mb-10 uppercase tracking-[0.3em] text-center opacity-40">Aperçu Smartphone</h3>

            <div className="w-[300px] h-[610px] bg-zinc-900 dark:bg-black rounded-[54px] p-3 shadow-2xl relative border-8 border-zinc-800 dark:border-zinc-900 shrink-0 shadow-[var(--accent)]/10">
              <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 rounded-[42px] overflow-hidden relative flex flex-col pt-12 border border-white/5">
                <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 dark:bg-black rounded-b-[24px] mx-18 z-20"></div>

                <div className="flex-1 px-4 relative z-10 pt-10">
                  <div className="bg-white/80 dark:bg-zinc-800/90 backdrop-blur-xl rounded-[24px] shadow-2xl p-6 border border-white/20 pb-7 transform hover:scale-[1.02] transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/20">
                          <span className="text-white text-[10px] font-black">M</span>
                        </div>
                        <span className="text-[10px] font-black text-zinc-900 dark:text-white tracking-[0.2em]">MUNICIP&apos;ALL</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Maintenant</span>
                    </div>
                    <div className="mt-2">
                      <h4 className={clsx("text-lg font-black leading-tight mb-2 tracking-tight", alertType === "urgent" ? "text-red-500" : "text-zinc-900 dark:text-white")}>
                        {title || "Objet de l'alerte..."}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium line-clamp-6" style={{ wordBreak: 'break-word' }}>
                        {message || "Votre message s'affichera ici en temps réel. Validez l'aperçu avant la diffusion massive."}
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
            className="w-full bg-[var(--accent)] text-white py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-[var(--accent)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Diffuser
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
