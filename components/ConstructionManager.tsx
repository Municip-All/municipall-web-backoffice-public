"use client";

import React, { useState, useEffect } from "react";
import { Hammer, Plus, X, Calendar, MapPin, Save, Loader2, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

interface ConstructionWork {
  id?: number;
  title: string;
  description: string;
  locationName: string;
  startDate: string;
  endDate: string;
  status: string; // 'Programmé', 'En cours', 'Terminé', 'Annulé'
  impactType: string;
}

export default function ConstructionManager({ cityId }: { cityId: string }) {
  const toast = useToast();
  const [works, setWorks] = useState<ConstructionWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingWork, setEditingWork] = useState<ConstructionWork | null>(null);

  const fetchWorks = React.useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': cityId
        }
      });
      const data = await response.json();
      setWorks(data);
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cityId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorks();
    }, 0);
    return () => clearTimeout(timer);
  }, [cityId, fetchWorks]);

  const handleSave = async (work: ConstructionWork) => {
    setIsSaving(true);
    try {
      const method = work.id ? 'PATCH' : 'POST';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works${work.id ? `/${work.id}` : ''}`;

      const body = {
        ...work,
        startDate: new Date(work.startDate).toISOString(),
        endDate: new Date(work.endDate).toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': cityId
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast("success", `Chantier ${work.id ? 'mis à jour' : 'ajouté'} !`);
        setEditingWork(null);
        fetchWorks();
      } else {
        toast("error", "Erreur lors de l'enregistrement.");
      }
    } catch {
      toast("error", "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce chantier ?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/construction-works/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': cityId
        }
      });

      if (response.ok) {
        toast("success", "Chantier supprimé.");
        fetchWorks();
      }
    } catch {
      toast("error", "Erreur lors de la suppression.");
    }
  };

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" />
      <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest">Chargement...</p>
    </div>
  );

  return (
    <PageShell>
      <PageHeader
        title="Chantiers & travaux"
        description="Voirie & urbanisme"
        actions={
          <button
            type="button"
            onClick={() => setEditingWork({
            title: "",
            description: "",
            locationName: "",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            status: "Programmé",
            impactType: "Circulation alternée"
          })}
            className="btn-primary"
          >
          <Plus className="h-4 w-4" />
          Déclarer un chantier
          </button>
        }
      />

      {editingWork && (
        <div className="card-premium p-10 mb-12 relative border-2 border-[var(--accent)]/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">{editingWork.id ? 'Modifier le chantier' : 'Déclaration de travaux'}</h3>
            <button onClick={() => setEditingWork(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6 text-zinc-400" /></button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Objet des travaux</label>
                <input
                  type="text"
                  value={editingWork.title}
                  onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  placeholder="ex: Réfection Avenue République"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Description & Impact</label>
                <textarea
                  value={editingWork.description}
                  onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 h-32 resize-none outline-none transition-all font-bold shadow-sm leading-relaxed"
                  placeholder="Détails des travaux..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Localisation</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                  <input
                    type="text"
                    value={editingWork.locationName}
                    onChange={(e) => setEditingWork({ ...editingWork, locationName: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] pl-16 pr-7 py-5 outline-none transition-all font-bold shadow-sm"
                    placeholder="Adresse ou quartier"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Date de début</label>
                  <input
                    type="date"
                    value={editingWork.startDate.split('T')[0]}
                    onChange={(e) => setEditingWork({ ...editingWork, startDate: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Fin prévisionnelle</label>
                  <input
                    type="date"
                    value={editingWork.endDate.split('T')[0]}
                    onChange={(e) => setEditingWork({ ...editingWork, endDate: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">État du chantier</label>
                <select
                  value={editingWork.status}
                  onChange={(e) => setEditingWork({ ...editingWork, status: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm appearance-none"
                >
                  <option>Programmé</option>
                  <option>En cours</option>
                  <option>Terminé</option>
                  <option>Annulé</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Contraintes de circulation</label>
                <select
                  value={editingWork.impactType}
                  onChange={(e) => setEditingWork({ ...editingWork, impactType: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm appearance-none"
                >
                  <option>Circulation alternée</option>
                  <option>Rue barrée</option>
                  <option>Stationnement interdit</option>
                  <option>Trottoir réduit</option>
                  <option>Bruit important</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-6">
            <button
              onClick={() => setEditingWork(null)}
              className="px-8 py-4 rounded-[22px] font-black text-apple-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest text-xs"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSave(editingWork)}
              disabled={isSaving}
              className="bg-[var(--accent)] text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-[var(--accent)]/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Enregistrer le chantier
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {works.length === 0 ? (
          <div className="text-center py-32 card-premium !bg-transparent border-4 border-dashed border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[28px] flex items-center justify-center mb-8 mx-auto opacity-50">
              <Hammer className="w-10 h-10 text-[var(--muted)]" />
            </div>
            <p className="text-[10px] font-black text-apple-muted uppercase tracking-[0.4em] opacity-40">Aucun chantier actif</p>
          </div>
        ) : (
          works.map((work) => (
            <div key={work.id} className="card-premium p-6 flex items-center justify-between group hover:border-[var(--accent)]/30 transition-all">
              <div className="flex items-center gap-8">
                <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-sm ${work.status === 'En cours' ? 'bg-orange-500/10 text-orange-500' :
                  work.status === 'Annulé' ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                  }`}>
                  <Hammer className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="text-xl font-black text-[var(--foreground)] tracking-tight">{work.title}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${work.status === 'En cours' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                      work.status === 'Annulé' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        work.status === 'Terminé' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]'
                      }`}>
                      {work.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-apple-muted opacity-60 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--accent)]" />
                      {work.locationName}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--accent)]" />
                      Du {new Date(work.startDate).toLocaleDateString()} au {new Date(work.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <button
                  onClick={() => setEditingWork(work)}
                  className="p-4 text-zinc-400 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-[18px] transition-all"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => work.id && handleDelete(work.id)}
                  className="p-4 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-[18px] transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
