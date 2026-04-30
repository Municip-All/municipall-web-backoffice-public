"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, Plus, X, MapPin, Save, Loader2, Pencil, Trash2, Tag, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface Event {
  id?: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  imageUrl?: string;
}

export default function EventManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/events`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': user?.cityId || ''
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleSave = async (event: Event) => {
    setIsSaving(true);
    try {
      const method = event.id ? 'PATCH' : 'POST';
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/events${event.id ? `/${event.id}` : ''}`;

      const body = {
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': user?.cityId || ''
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast("success", `Événement ${event.id ? 'mis à jour' : 'ajouté'} !`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/events/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': user?.cityId || ''
        }
      });

      if (response.ok) {
        toast("success", "Événement supprimé.");
        fetchEvents();
      }
    } catch {
      toast("error", "Erreur lors de la suppression.");
    }
  };

  if (isLoading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)]" />
      <p className="text-[10px] font-black text-apple-muted uppercase tracking-widest">Chargement de l&apos;agenda...</p>
    </div>
  );

  return (
    <div className="p-10 max-w-6xl mx-auto bg-[var(--background)] transition-colors duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="text-apple-muted mb-3 opacity-60">Culture & Vie Locale</p>
          <h2 className="text-apple-title">Agenda Municipal</h2>
        </div>
        <button
          onClick={() => setEditingEvent({
            title: "",
            description: "",
            location: "",
            startDate: new Date().toISOString().split('T')[0] + "T14:00",
            endDate: new Date().toISOString().split('T')[0] + "T18:00",
            category: "Culture",
          })}
          className="flex items-center gap-3 bg-[var(--accent)] hover:scale-105 active:scale-95 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-[var(--accent)]/20 text-xs uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Ajouter un événement
        </button>
      </div>

      {editingEvent && (
        <div className="card-premium p-10 mb-12 relative border-2 border-[var(--accent)]/20 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">{editingEvent.id ? 'Modifier l&apos;événement' : 'Nouvel Événement'}</h3>
            <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X className="w-6 h-6 text-zinc-400" /></button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Titre de l&apos;événement</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  placeholder="ex: Fête de la Musique"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Description</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 h-32 resize-none outline-none transition-all font-bold shadow-sm leading-relaxed"
                  placeholder="Détails de l'événement..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Lieu / Salle</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] pl-16 pr-7 py-5 outline-none transition-all font-bold shadow-sm"
                    placeholder="ex: Place de la Mairie"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Début</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.startDate.slice(0, 16)}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Fin</label>
                  <input
                    type="datetime-local"
                    value={editingEvent.endDate.slice(0, 16)}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">Catégorie</label>
                <div className="relative">
                  <Tag className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] pl-16 pr-7 py-5 outline-none transition-all font-bold shadow-sm appearance-none"
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
                <label className="text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 block opacity-60">URL de l&apos;image (optionnel)</label>
                <input
                  type="text"
                  value={editingEvent.imageUrl || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-lg rounded-[22px] px-7 py-5 outline-none transition-all font-bold shadow-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-end gap-6">
            <button
              onClick={() => setEditingEvent(null)}
              className="px-8 py-4 rounded-[22px] font-black text-apple-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest text-xs"
            >
              Annuler
            </button>
            <button
              onClick={() => handleSave(editingEvent)}
              disabled={isSaving}
              className="bg-[var(--accent)] text-white px-10 py-4 rounded-[24px] font-black shadow-xl shadow-[var(--accent)]/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Enregistrer l&apos;événement
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-32 card-premium !bg-transparent border-4 border-dashed border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[28px] flex items-center justify-center mb-8 mx-auto opacity-50">
              <Calendar className="w-10 h-10 text-[var(--muted)]" />
            </div>
            <p className="text-[10px] font-black text-apple-muted uppercase tracking-[0.4em] opacity-40">Agenda vide pour le moment</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="card-premium overflow-hidden group hover:border-[var(--accent)]/30 transition-all">
              {event.imageUrl && (
                <div className="h-48 w-full relative overflow-hidden">
                  <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-[var(--foreground)] tracking-tight mb-2">{event.title}</h4>
                    <div className="flex items-center gap-3 text-apple-muted opacity-60 text-[11px] font-bold uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {new Date(event.startDate).toLocaleDateString()} • {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="p-3 text-zinc-400 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => event.id && handleDelete(event.id)}
                      className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-8 line-clamp-3 font-medium">
                  {event.description}
                </p>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-[var(--foreground)]">
                    <MapPin className="w-4 h-4 text-[var(--accent)]" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
