"use client";

import React, { useEffect, useState } from "react";
import { Bus, Loader2, Save, Lock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import { usePermissions, Permission } from "@/context/PermissionsContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function TransportSettings() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const canEdit = can(Permission.CITY_CONFIG_WRITE);
  const toast = useToast();
  const [loadedCityId, setLoadedCityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const cityId = user?.cityId;
  const loading = Boolean(cityId) && loadedCityId !== cityId;

  useEffect(() => {
    if (!cityId) return;

    let cancelled = false;

    void (async () => {
      try {
        const config = await api.getCityConfig(cityId);
        if (cancelled) return;
        setAllowed(!!config?.isTransportFeatureAllowed);
        setEnabled(!!config?.isTransportFeatureEnabled);
      } finally {
        if (!cancelled) {
          setLoadedCityId(cityId);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cityId]);

  const handleSave = async () => {
    if (!cityId) return;
    setSaving(true);
    try {
      const { ok, error } = await api.saveCityConfig(cityId, {
        isTransportFeatureEnabled: enabled,
      });
      if (ok) {
        toast("success", "Module transports mis à jour.");
      } else {
        toast("error", error ?? "Échec de la mise à jour.");
      }
    } catch {
      toast("error", "Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : (
        <>
          <PageHeader
            title="Transports en commun"
            description="Perturbations IDFM en temps réel · Île-de-France"
            actions={
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !allowed || !canEdit}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" /> Publier
                  </>
                )}
              </button>
            }
          />

          <div className="card-premium max-w-2xl p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <Bus className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)]">
                  Module Transports
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Affiche les perturbations des lignes de bus, métro, RER et tram
                  autour des citoyens.
                </p>
              </div>
            </div>

            {!allowed ? (
              <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Option non incluse dans votre contrat</p>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">
                    La fonctionnalité « Transports en commun (IDFM) » n&apos;a pas
                    été activée par Municip&apos;All pour votre commune. Contactez
                    votre interlocuteur commercial pour l&apos;ajouter à votre
                    abonnement.
                  </p>
                </div>
              </div>
            ) : !canEdit ? (
              <div className="flex gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 text-[var(--muted)]">
                <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold text-[var(--foreground)]">
                    Module {enabled ? "activé" : "désactivé"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">
                    Seul le maire peut modifier ce paramètre depuis « Configuration
                    ville » ou cette page.
                  </p>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
                <div>
                  <span className="block text-sm font-black text-[var(--foreground)]">
                    Activer le module Transports sur l&apos;application mobile
                  </span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    Les citoyens verront « Transports à proximité » sur l&apos;écran
                    d&apos;accueil.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-[var(--accent)]"
                />
              </label>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
