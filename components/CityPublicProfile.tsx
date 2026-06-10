"use client";

import React, { useEffect, useState } from "react";
import { Save, Loader2, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

interface PublicProfileForm {
  mayorName: string;
  mayorTitle: string;
  welcomeText: string;
  description: string;
  address: string;
  website: string;
  openingHours: string;
}

const EMPTY: PublicProfileForm = {
  mayorName: "",
  mayorTitle: "Maire",
  welcomeText: "",
  description: "",
  address: "",
  website: "",
  openingHours: "",
};

export default function CityPublicProfile({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [form, setForm] = useState<PublicProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCityConfig(cityId).then((data) => {
      const p = data?.publicProfile;
      setForm({
        mayorName: p?.mayorName ?? "",
        mayorTitle: p?.mayorTitle ?? "Maire",
        welcomeText: p?.welcomeText ?? "",
        description: p?.description ?? "",
        address: p?.address ?? "",
        website: p?.website ?? "",
        openingHours: p?.openingHours ?? "",
      });
      setLoading(false);
    });
  }, [cityId]);

  const handleSave = async () => {
    setSaving(true);
    const { ok, error } = await api.saveCityConfig(cityId, {
      publicProfile: {
        mayorName: form.mayorName.trim() || undefined,
        mayorTitle: form.mayorTitle.trim() || "Maire",
        welcomeText: form.welcomeText.trim() || undefined,
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        website: form.website.trim() || undefined,
        openingHours: form.openingHours.trim() || undefined,
      },
    });
    setSaving(false);
    if (ok) toast("success", "Fiche commune mise à jour.");
    else toast("error", error ?? "Échec de la sauvegarde.");
  };

  const field = (key: keyof PublicProfileForm, label: string, multiline = false) => (
    <div>
      <label className="section-title mb-2 block">{label}</label>
      {multiline ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={4}
          className="input-field w-full resize-none"
        />
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="input-field w-full"
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Fiche commune"
        description="Contenu affiché quand le citoyen tape sur le blason en haut de l'accueil."
        actions={
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Publier</>}
          </button>
        }
      />

      <div className="card-premium max-w-3xl space-y-5 p-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-[var(--muted)]">
            Ces informations alimentent l&apos;écran « Ma commune » dans l&apos;application mobile.
          </p>
        </div>
        {field("mayorName", "Nom de l'élu référent (maire)")}
        {field("mayorTitle", "Titre affiché")}
        {field("welcomeText", "Message d'accueil", true)}
        {field("description", "Présentation de la commune", true)}
        {field("address", "Adresse de la mairie")}
        {field("openingHours", "Horaires d'ouverture")}
        {field("website", "Site web de la mairie")}
      </div>
    </PageShell>
  );
}
