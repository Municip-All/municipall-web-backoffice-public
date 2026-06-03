"use client";

import React, { useState } from "react";
import {
  CarFront,
  CloudRainWind,
  CalendarHeart,
  MapPin,
  Radio,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

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
    description:
      "Affiche les perturbations en temps réel sur la carte de la ville.",
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
    description:
      "Synchronisation avec le flux évènementiel (Bientôt disponible).",
    icon: CalendarHeart,
    enabled: false,
    isBeta: true,
  },
];

export default function WidgetGenerator() {
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);

  const toggleWidget = (id: string, isBeta?: boolean) => {
    if (isBeta) return;
    setWidgets((current) =>
      current.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
  };

  const activeWidgets = widgets.filter((w) => w.enabled);

  return (
    <PageShell>
      <PageHeader
        title="Services GPS"
        description="Services connectés · Gestionnaire de widgets"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="space-y-8">
          <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight px-2">
            Modules Disponibles
          </h3>
          <div className="flex flex-col gap-6">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.id}
                  className={clsx(
                    "card-premium p-8 flex items-center justify-between transition-all",
                    widget.isBeta && "opacity-60 grayscale-[0.5]",
                    widget.enabled &&
                      "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/5",
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={clsx(
                        "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all shadow-sm border border-white/10",
                        widget.enabled
                          ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
                      )}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[var(--foreground)] flex items-center gap-3 tracking-tight">
                        {widget.name}
                        {widget.isBeta && (
                          <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest border border-[var(--card-border)]">
                            Bêta
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-[var(--muted)] font-medium mt-1 leading-relaxed max-w-sm">
                        {widget.description}
                      </p>
                    </div>
                  </div>

                  {!widget.isBeta && (
                    <button
                      onClick={() => toggleWidget(widget.id, widget.isBeta)}
                      className={clsx(
                        "relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none shrink-0 shadow-inner",
                        widget.enabled
                          ? "bg-[var(--accent)]"
                          : "bg-zinc-200 dark:bg-zinc-700",
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-all duration-300",
                          widget.enabled ? "translate-x-7" : "translate-x-1",
                        )}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight px-2 flex items-center gap-3">
            <Radio className="w-6 h-6 text-[var(--accent)] animate-pulse" />
            Liaison GPS Automatique
          </h3>
          <div className="card-premium p-10 overflow-hidden relative min-h-[500px] flex flex-col">
            <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10 pointer-events-none">
              <MapPin className="w-80 h-80" />
            </div>

            <p className="text-sm text-[var(--muted)] font-medium mb-12 max-w-md relative z-10 leading-relaxed">
              Le back-office est directement relié par GPS à l&apos;application
              de vos citoyens. Dès qu&apos;un habitant ouvre l&apos;application
              dans votre commune, les modules activés s&apos;affichent
              instantanément.
            </p>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="flex-1 w-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-[40px] p-10 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full border-2 border-[var(--accent)]/20 rounded-[40px] animate-ping opacity-20 absolute"></div>
                  <div className="w-[85%] h-[85%] border border-[var(--accent)]/30 rounded-[35px] animate-pulse opacity-30 absolute"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-[var(--accent)] text-center bg-[var(--card)]/80 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-white/20">
                  <span className="font-black text-lg tracking-tight mb-1">
                    Secteur Ville
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    Liaison Active
                  </span>
                </div>
              </div>

              <div className="text-[var(--accent)] opacity-40 transform md:-rotate-90 md:mx-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>

              <div className="flex-1 w-full flex flex-col items-center">
                <div className="w-32 h-64 bg-zinc-900 dark:bg-black rounded-[48px] shadow-2xl border-8 border-zinc-800 dark:border-zinc-900 p-3 flex flex-col gap-3 relative overflow-hidden shadow-[var(--accent)]/20">
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-8 rounded-2xl flex items-center px-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] mr-2"></div>
                    <span className="text-[7px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">
                      Municip&apos;All
                    </span>
                  </div>
                  {activeWidgets.length > 0 ? (
                    <div className="space-y-2">
                      {activeWidgets.map((widget) => {
                        const Icon = widget.icon;
                        return (
                          <div
                            key={widget.id}
                            className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-2 flex items-center gap-2"
                          >
                            <Icon className="w-4 h-4 text-[var(--accent)]" />
                            <div className="h-1.5 flex-1 bg-[var(--accent)]/30 rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--accent)] w-2/3 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-2">
                      <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest text-center px-2">
                        Offline
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-1 w-10 h-1 bg-zinc-800 rounded-full left-1/2 -translate-x-1/2"></div>
                </div>
                <div className="mt-8 flex items-center gap-3 bg-emerald-500/10 px-5 py-2.5 rounded-full border border-emerald-500/20 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    Connecté
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
