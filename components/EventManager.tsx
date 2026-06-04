"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Calendar,
  Plus,
  X,
  MapPin,
  Save,
  Loader2,
  Pencil,
  Trash2,
  Tag,
  Clock,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import { api, CityEvent } from "@/lib/api";

export default function EventManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CityEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.cityId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.cityId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleSave = async (event: CityEvent) => {
    setIsSaving(true);
    try {
      const saved = await api.saveEvent(event);
      if (saved) {
        toast("success", `Événement ${event.id ? "mis à jour" : "ajouté"} !`);
        setEditingEvent(null);
        fetchEvents();
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
    if (!confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

    try {
      const ok = await api.deleteEvent(id);
      if (ok) {
        toast("success", "Événement supprimé.");
        fetchEvents();
      } else {
        toast("error", "Erreur lors de la suppression.");
      }
    } catch {
      toast("error", "Erreur lors de la suppression.");
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin opacity-40" />
        <p className="text-sm font-black text-apple-muted uppercase tracking-widest opacity-40">
          Chargement de l&apos;agenda...
        </p>
      </div>
    );

  return (
    <PageShell>
      <PageHeader
        title="Agenda & événements"
        description="Gestion citoyenne · Calendrier municipal"
        actions={
          <button
            type="button"
            onClick={() =>
              setEditingEvent({
                title: "",
                description: "",
                location: "",
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 3600000).toISOString(),
                category: "Culture",
              })
            }
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nouvel événement
          </button>
        }
      />

      {editingEvent && (
        <div className="card-premium p-10 mb-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
              {editingEvent.id
                ? "Modifier l'événement"
                : "Créer un événement"}
            </h3>
            <button
              type="button"
              onClick={() => setEditingEvent(null)}
              className="btn-ghost !p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                  Titre
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Ex: Marché de printemps"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                  Description
                </label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="input-field w-full min-h-[120px]"
                />
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                  Lieu
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[var(--accent)]" />
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                    className="input-field-icon w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                    Début
                  </label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[var(--accent)]" />
                    <input
                      type="datetime-local"
                      value={editingEvent.startDate.slice(0, 16)}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          startDate: new Date(e.target.value).toISOString(),
                        })
                      }
                      className="input-field-icon w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={editingEvent.endDate.slice(0, 16)}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        endDate: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                  Catégorie
                </label>
                <div className="relative">
                  <Tag className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-[var(--accent)]" />
                  <select
                    value={editingEvent.category}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        category: e.target.value,
                      })
                    }
                    className="input-field-icon w-full appearance-none"
                  >
                    <option>Culture</option>
                    <option>Sport</option>
                    <option>Social</option>
                    <option>Éducation</option>
                    <option>Cérémonie</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">
                  URL de l&apos;image (optionnel)
                </label>
                <input
                  type="text"
                  value={editingEvent.imageUrl || ""}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      imageUrl: e.target.value,
                    })
                  }
                  className="input-field w-full"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setEditingEvent(null)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSave(editingEvent)}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p className="text-sm font-black text-apple-muted uppercase tracking-widest opacity-40">
              Agenda vide pour le moment
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card-premium overflow-hidden">
              {event.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                      {event.category}
                    </span>
                    <h4 className="text-xl font-black text-[var(--foreground)] mt-1">
                      {event.title}
                    </h4>
                    <p className="text-sm text-[var(--muted)] mt-2">
                      {new Date(event.startDate).toLocaleDateString("fr-FR")} •{" "}
                      {new Date(event.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" — "}
                      {event.location}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="btn-ghost !p-2"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => event.id && handleDelete(event.id)}
                      className="btn-ghost !p-2 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
