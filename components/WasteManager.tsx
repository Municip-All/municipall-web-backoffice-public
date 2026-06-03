"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Clock,
  Save,
  Loader2,
  Trash2,
  RefreshCw,
  Leaf,
  Archive,
  FlaskConical,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

interface WasteService {
  type: string;
  icon: string;
  color: string;
  days: number[]; // 0=Sunday, 1=Monday...
  time: string;
}

const DAYS = [
  { id: 1, label: "Lun" },
  { id: 2, label: "Mar" },
  { id: 3, label: "Mer" },
  { id: 4, label: "Jeu" },
  { id: 5, label: "Ven" },
  { id: 6, label: "Sam" },
  { id: 0, label: "Dim" },
];

const ICONS = [
  { id: "trash", icon: Trash2 },
  { id: "refresh", icon: RefreshCw },
  { id: "leaf", icon: Leaf },
  { id: "archive", icon: Archive },
  { id: "flask", icon: FlaskConical },
];

export default function WasteManager({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [services, setServices] = useState<WasteService[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCityConfig(cityId).then((data) => {
      if (data?.wasteConfig?.services) {
        setServices(data.wasteConfig.services);
      } else {
        // Default services if none exist
        setServices([
          {
            type: "Ordures Ménagères",
            icon: "trash",
            color: "#333333",
            days: [1, 4],
            time: "19:00",
          },
          {
            type: "Recyclage",
            icon: "refresh",
            color: "#FFCC00",
            days: [3],
            time: "08:00",
          },
        ]);
      }
      setIsLoading(false);
    });
  }, [cityId]);

  const handleAddService = () => {
    setServices([
      ...services,
      {
        type: "Nouveau Service",
        icon: "trash",
        color: "#666666",
        days: [],
        time: "08:00",
      },
    ]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, updates: Partial<WasteService>) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], ...updates };
    setServices(newServices);
  };

  const toggleDay = (serviceIndex: number, dayId: number) => {
    const service = services[serviceIndex];
    const newDays = service.days.includes(dayId)
      ? service.days.filter((d) => d !== dayId)
      : [...service.days, dayId].sort();
    updateService(serviceIndex, { days: newDays });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ok = await api.saveCityConfig(cityId, {
        wasteConfig: { services },
      });

      if (ok) {
        toast("success", "Configuration enregistrée !");
      } else {
        toast("error", "Erreur lors de l'enregistrement.");
      }
    } catch {
      toast("error", "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" />
        <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest">
          Chargement...
        </p>
      </div>
    );

  return (
    <PageShell>
      <PageHeader
        title="Calendrier déchets"
        description="Services municipaux"
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        }
      />

      <div className="space-y-8">
        {services.map((service, sIndex) => (
          <div
            key={sIndex}
            className="card-premium p-10 relative group border-2 border-transparent hover:border-[var(--accent)]/10"
          >
            <button
              onClick={() => handleRemoveService(sIndex)}
              className="absolute top-6 right-6 p-3 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Info de base */}
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                    Type de collecte
                  </label>
                  <input
                    type="text"
                    value={service.type}
                    onChange={(e) =>
                      updateService(sIndex, { type: e.target.value })
                    }
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                      Identifiant Couleur
                    </label>
                    <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-[22px] border border-transparent">
                      <input
                        type="color"
                        value={service.color}
                        onChange={(e) =>
                          updateService(sIndex, { color: e.target.value })
                        }
                        className="h-12 w-12 p-0 border-none rounded-[14px] cursor-pointer bg-transparent overflow-hidden"
                      />
                      <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">
                        {service.color}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                      Heure de passage
                    </label>
                    <div className="relative">
                      <Clock className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                      <input
                        type="time"
                        value={service.time}
                        onChange={(e) =>
                          updateService(sIndex, { time: e.target.value })
                        }
                        className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] pl-16 pr-7 py-5 outline-none transition-all font-bold shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Jours de passage */}
              <div className="flex flex-col h-full">
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-5 block opacity-60">
                  Calendrier hebdomadaire
                </label>
                <div className="grid grid-cols-7 gap-3 mb-10">
                  {DAYS.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(sIndex, day.id)}
                      className={`h-14 rounded-[18px] font-black text-[10px] uppercase tracking-tighter transition-all border-2 ${
                        service.days.includes(day.id)
                          ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                          : "bg-zinc-100 dark:bg-zinc-800/50 border-transparent text-zinc-400 hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>

                <div className="mt-auto">
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-5 block opacity-60">
                    Sélecteur d&apos;icône
                  </label>
                  <div className="flex gap-4">
                    {ICONS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => updateService(sIndex, { icon: item.id })}
                        className={`w-14 h-14 rounded-[20px] border-2 transition-all flex items-center justify-center ${
                          service.icon === item.id
                            ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-inner"
                            : "bg-zinc-100 dark:bg-zinc-800/50 border-transparent text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <item.icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddService}
          className="w-full py-8 border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px] text-zinc-400 font-black text-sm uppercase tracking-[0.3em] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all flex items-center justify-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[var(--accent)]/20 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          Nouveau Service
        </button>
      </div>
    </PageShell>
  );
}
