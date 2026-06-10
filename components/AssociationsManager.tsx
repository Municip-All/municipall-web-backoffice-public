"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

type AssociationCategory = "association" | "groupe-parole" | "autre";

interface AssociationItem {
  id: string;
  name: string;
  category: AssociationCategory;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

const CATEGORIES: { value: AssociationCategory; label: string }[] = [
  { value: "association", label: "Association" },
  { value: "groupe-parole", label: "Groupe de parole" },
  { value: "autre", label: "Autre" },
];

function newId() {
  return `asso-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AssociationsManager({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [items, setItems] = useState<AssociationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCityConfig(cityId).then((data) => {
      setItems(data?.associations ?? []);
      setLoading(false);
    });
  }, [cityId]);

  const handleSave = async () => {
    setSaving(true);
    const { ok, error } = await api.saveCityConfig(cityId, { associations: items });
    setSaving(false);
    if (ok) toast("success", "Associations mises à jour.");
    else toast("error", error ?? "Échec de la sauvegarde.");
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: newId(), name: "", category: "association", description: "" },
    ]);
  };

  const updateItem = (id: string, patch: Partial<AssociationItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

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
        title="Vie associative & social"
        description="Référencez les associations et groupes de parole visibles dans l'app (écran Social)."
        actions={
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Publier</>}
          </button>
        }
      />

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={addItem} className="btn-secondary">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card-panel flex flex-col items-center justify-center py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-[var(--muted)] opacity-30" />
          <p className="text-sm text-[var(--muted)]">
            Aucune association référencée. Les citoyens verront un message vide sur l&apos;écran Social.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card-panel space-y-3 p-5">
              <div className="flex flex-wrap gap-3">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Nom"
                  className="input-field min-w-[200px] flex-1"
                />
                <select
                  value={item.category}
                  onChange={(e) =>
                    updateItem(item.id, { category: e.target.value as AssociationCategory })
                  }
                  className="input-field w-auto"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="btn-ghost !px-3 text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={item.description ?? ""}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                placeholder="Description courte"
                rows={2}
                className="input-field w-full resize-none"
              />
              <input
                value={item.address ?? ""}
                onChange={(e) => updateItem(item.id, { address: e.target.value })}
                placeholder="Adresse (siège, local, permanence…)"
                className="input-field w-full"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  value={item.contactEmail ?? ""}
                  onChange={(e) => updateItem(item.id, { contactEmail: e.target.value })}
                  placeholder="E-mail"
                  className="input-field"
                />
                <input
                  value={item.contactPhone ?? ""}
                  onChange={(e) => updateItem(item.id, { contactPhone: e.target.value })}
                  placeholder="Téléphone"
                  className="input-field"
                />
                <input
                  value={item.website ?? ""}
                  onChange={(e) => updateItem(item.id, { website: e.target.value })}
                  placeholder="Site web"
                  className="input-field"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
