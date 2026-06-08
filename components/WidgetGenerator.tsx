"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  CarFront,
  CloudRainWind,
  CalendarHeart,
  Radio,
  CheckCircle2,
  Loader2,
  Building2,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { getOnPrimaryColor } from "@/lib/brandUtils";

interface WidgetItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  isBeta?: boolean;
}

/** IDs persistés dans cities.features (app mobile + backend) */
const WIDGET_TO_FEATURE: Record<string, string> = {
  traffic: "flux-live",
  weather: "weather",
  cultural: "agenda",
};

const MANAGED_FEATURES = new Set(Object.values(WIDGET_TO_FEATURE));

const widgetCatalog: Omit<WidgetItem, "enabled">[] = [
  {
    id: "traffic",
    name: "Info Trafic & Travaux",
    description:
      "Affiche les perturbations en temps réel sur la carte de la ville.",
    icon: CarFront,
  },
  {
    id: "weather",
    name: "Météo & Alertes",
    description: "Vigilance météorologique et prévisions locales.",
    icon: CloudRainWind,
  },
  {
    id: "cultural",
    name: "Agenda & événements",
    description:
      "Publie les événements depuis l'agenda — visibles dans l'app citoyenne.",
    icon: CalendarHeart,
  },
];

function buildFeaturesFromWidgets(
  widgets: WidgetItem[],
  preserved: string[],
): string[] {
  const fromWidgets = widgets
    .filter((w) => w.enabled && WIDGET_TO_FEATURE[w.id])
    .map((w) => WIDGET_TO_FEATURE[w.id]);
  return [...new Set([...preserved, ...fromWidgets])];
}

function widgetsFromFeatures(features: string[]): WidgetItem[] {
  return widgetCatalog.map((w) => ({
    ...w,
    enabled: features.includes(WIDGET_TO_FEATURE[w.id] ?? ""),
  }));
}

export default function WidgetGenerator() {
  const { user } = useAuth();
  const toast = useToast();
  const [widgets, setWidgets] = useState<WidgetItem[]>(
    widgetCatalog.map((w) => ({ ...w, enabled: w.id === "traffic" })),
  );
  const [preservedFeatures, setPreservedFeatures] = useState<string[]>([]);
  const [readyCityId, setReadyCityId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [appDisplayName, setAppDisplayName] = useState("Municip'All");
  const [officialName, setOfficialName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0B0080");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const cityId = user?.cityId;
  const isLoading = Boolean(cityId) && readyCityId !== cityId;

  useEffect(() => {
    if (!cityId) return;
    let cancelled = false;
    void api
      .getCityConfig(cityId)
      .then((config) => {
        if (cancelled) return;
        const features = config?.features ?? [];
        setPreservedFeatures(features.filter((f) => !MANAGED_FEATURES.has(f)));
        setWidgets(widgetsFromFeatures(features));
        if (config) {
          setAppDisplayName(config.name || "Municip'All");
          setOfficialName(config.officialName || "");
          setPrimaryColor(config.theme?.primaryColor || "#0B0080");
          setLogoUrl(config.theme?.logoUrl || null);
        }
        setReadyCityId(cityId);
      })
      .catch(() => {
        if (!cancelled) setReadyCityId(cityId);
      });
    return () => {
      cancelled = true;
    };
  }, [cityId]);

  const persistFeatures = useCallback(
    async (nextWidgets: WidgetItem[], previousWidgets: WidgetItem[]) => {
      if (!user?.cityId) return false;
      const features = buildFeaturesFromWidgets(nextWidgets, preservedFeatures);
      const { ok } = await api.saveCityConfig(user.cityId, { features });
      if (ok) {
        setPreservedFeatures((current) =>
          current.filter((f) => features.includes(f)),
        );
        return true;
      }
      setWidgets(previousWidgets);
      toast("error", "Impossible d'enregistrer ce module. Réessayez.");
      return false;
    },
    [user, preservedFeatures, toast],
  );

  const toggleWidget = async (id: string, isBeta?: boolean) => {
    if (isBeta || savingId) return;

    const previousWidgets = widgets;
    const nextWidgets = widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w,
    );
    setWidgets(nextWidgets);
    setSavingId(id);

    const ok = await persistFeatures(nextWidgets, previousWidgets);
    if (ok) {
      toast("success", "Module mis à jour — visible dans l'app citoyenne.");
    }

    setSavingId(null);
  };

  const activeWidgets = widgets.filter((w) => w.enabled);

  return (
    <PageShell>
      <PageHeader
        title="Services GPS"
        description="Services connectés · Gestionnaire de widgets"
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="space-y-8">
            <h3 className="text-xl font-black text-[var(--foreground)] tracking-tight px-2">
              Modules Disponibles
            </h3>
            <div className="flex flex-col gap-6">
              {widgets.map((widget) => {
                const Icon = widget.icon;
                const isSaving = savingId === widget.id;
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
                        type="button"
                        disabled={!!savingId}
                        onClick={() => toggleWidget(widget.id, widget.isBeta)}
                        className={clsx(
                          "relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none shrink-0 shadow-inner",
                          widget.enabled
                            ? "bg-[var(--accent)]"
                            : "bg-zinc-200 dark:bg-zinc-700",
                          savingId && !isSaving && "opacity-50",
                        )}
                      >
                        {isSaving ? (
                          <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
                        ) : (
                          <span
                            className={clsx(
                              "inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-all duration-300",
                              widget.enabled
                                ? "translate-x-7"
                                : "translate-x-1",
                            )}
                          />
                        )}
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
            <div className="card-premium flex flex-col gap-8 p-8 lg:p-10">
              <p className="max-w-xl text-sm font-medium leading-relaxed text-[var(--muted)]">
                Le panel mairie est relié par GPS à l&apos;application
                citoyenne. Dès qu&apos;un habitant ouvre l&apos;app dans votre
                commune, les modules activés apparaissent avec votre identité
                visuelle.
              </p>

              <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
                {/* Panel mairie */}
                <div className="w-full max-w-[200px] rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] ring-1 ring-[var(--accent)]/20">
                    <Radio className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-black text-[var(--foreground)]">
                    Panel mairie
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--foreground)]/75">
                    {officialName || "Votre commune"}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-600/25 bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    GPS actif
                  </span>
                </div>

                {/* Liaison */}
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <div className="hidden h-px w-12 bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-[var(--accent)] lg:block" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="hidden h-px w-12 bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/40 to-transparent lg:block" />
                </div>

                {/* Aperçu téléphone */}
                <div className="flex flex-col items-center">
                  <div
                    className="relative w-[220px] shrink-0 rounded-[44px] border-[6px] border-zinc-800 bg-zinc-800 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
                    style={{ boxShadow: `0 24px 60px ${primaryColor}22` }}
                  >
                    <div className="relative flex h-[400px] flex-col overflow-hidden rounded-[36px] bg-[#f8fafc]">
                      {/* Encoche */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-2">
                        <div className="h-6 w-24 rounded-full bg-zinc-900" />
                      </div>

                      {/* En-tête marque blanche */}
                      <div
                        className="shrink-0 px-4 pb-5 pt-12"
                        style={{
                          backgroundColor: primaryColor,
                          color: getOnPrimaryColor(primaryColor),
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/25 bg-white/15">
                            {logoUrl ? (
                              <Image
                                src={logoUrl}
                                alt=""
                                fill
                                className="object-contain p-1.5"
                              />
                            ) : (
                              <Building2 className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black leading-tight">
                              {appDisplayName}
                            </p>
                            <p className="text-[9px] font-semibold uppercase tracking-wider opacity-75">
                              {officialName || "Commune"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Modules */}
                      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
                        {activeWidgets.length > 0 ? (
                          activeWidgets.map((widget) => {
                            const Icon = widget.icon;
                            return (
                              <div
                                key={widget.id}
                                className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2.5 shadow-sm"
                              >
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                  style={{
                                    backgroundColor: `${primaryColor}18`,
                                    color: primaryColor,
                                  }}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[11px] font-bold text-zinc-900">
                                    {widget.name}
                                  </p>
                                  <p className="text-[9px] font-medium text-emerald-600">
                                    Visible dans l&apos;app
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                            <Smartphone className="h-8 w-8 text-zinc-300" />
                            <p className="text-[10px] font-semibold text-zinc-400">
                              Activez un module à gauche pour le prévisualiser
                              ici
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Barre d'accueil */}
                      <div className="flex shrink-0 justify-around border-t border-zinc-200/80 bg-white px-2 py-2">
                        {["Accueil", "Carte", "Profil"].map((tab, i) => (
                          <span
                            key={tab}
                            className="text-[8px] font-bold"
                            style={{
                              color: i === 0 ? primaryColor : "#a1a1aa",
                            }}
                          >
                            {tab}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-full border border-emerald-600/25 bg-emerald-100 px-4 py-2 dark:border-emerald-500/35 dark:bg-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                      Synchronisé
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
