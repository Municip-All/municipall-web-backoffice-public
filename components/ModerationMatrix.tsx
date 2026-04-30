"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldAlert, Clock, Wrench, Check, Loader2, RefreshCcw } from "lucide-react";
import { api, Report } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface DisplayReport extends Report {
  priority: "Haute" | "Moyenne" | "Basse";
}

function getPriority(category: string): "Haute" | "Moyenne" | "Basse" {
  const high = ["Voirie", "Éclairage", "Sécurité"];
  const medium = ["Vandalisme", "Propreté", "Eau"];
  if (high.includes(category)) return "Haute";
  if (medium.includes(category)) return "Moyenne";
  return "Basse";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  if (diff < 172800) return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ModerationMatrix() {
  const toast = useToast();
  const [reports, setReports] = useState<DisplayReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchReports = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true);
      api.getReports()
        .then(data => {
          setReports(data.map(r => ({ ...r, priority: getPriority(r.category) })));
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const assignReport = async (id: number) => {
    const ok = await api.updateReportStatus(id, "En cours");
    if (ok) {
      setReports(current =>
        current.map(r => (r.id === id ? { ...r, status: "En cours" } : r))
      );
      toast("success", `Signalement #${String(id).padStart(4,'0')} assigné aux services.`);
    } else {
      toast("error", "Impossible de mettre à jour le signalement.");
    }
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return (
      String(r.id).includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <p className="text-apple-muted mb-3 opacity-60">Gestion Citoyenne</p>
          <h2 className="text-apple-title">Console de Modération</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Filtrer les signalements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-5 pr-12 py-3 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent dark:border-zinc-700/50 text-[var(--foreground)] text-sm rounded-2xl w-80 focus:bg-white dark:focus:bg-zinc-800 border-zinc-200 focus:border-[var(--accent)] outline-none transition-all font-bold shadow-sm" 
            />
          </div>
          <button
            onClick={() => fetchReports()}
            className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all border border-[var(--card-border)] rounded-2xl bg-[var(--card)]"
            aria-label="Rafraîchir"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-0 shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin opacity-40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
            <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-black opacity-40 uppercase tracking-widest">Aucun signalement{search ? " trouvé" : " actif"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] opacity-50">
                  <th className="py-6 px-8 w-28">Visuel</th>
                  <th className="py-6 px-8">Signalement & Description</th>
                  <th className="py-6 px-8 w-48">Catégorie</th>
                  <th className="py-6 px-8 w-40">Priorité</th>
                  <th className="py-6 px-8 text-right w-64">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="relative">
                        {report.imageUrl ? (
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-sm group-hover:scale-105 transition-transform bg-zinc-100 dark:bg-zinc-800">
                            <Image 
                              src={report.imageUrl} 
                              alt="Photo" 
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-[var(--card-border)] flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-black text-[var(--foreground)] tracking-tight">INCIDENT #{String(report.id).padStart(4, '0')}</p>
                        {report.isResident ? (
                          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-500/20">Résident</span>
                        ) : (
                          <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-amber-500/20">Extérieur</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground)] opacity-70 mb-2 line-clamp-2 leading-relaxed max-w-lg font-medium">{report.description || "Aucune description détaillée."}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-apple-muted opacity-60">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>
                    
                    <td className="py-6 px-8">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[var(--foreground)] text-[11px] font-black uppercase tracking-wider border border-[var(--card-border)] shadow-sm">
                        {report.category}
                      </span>
                    </td>
                    
                    <td className="py-6 px-8">
                      {report.priority === "Haute" && (
                        <div className="flex items-center gap-2 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-xs font-black uppercase tracking-widest">Haute</span>
                        </div>
                      )}
                      {report.priority === "Moyenne" && (
                        <div className="flex items-center gap-2 text-amber-500">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-xs font-black uppercase tracking-widest">Moyenne</span>
                        </div>
                      )}
                      {report.priority === "Basse" && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                          <span className="text-xs font-black uppercase tracking-widest opacity-60">Basse</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end">
                        {report.status === "En attente" ? (
                          <button
                            onClick={() => assignReport(report.id)}
                            className="bg-[var(--accent)] text-white text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                          >
                            <Wrench className="w-4 h-4" />
                            Assigner
                          </button>
                        ) : (
                          <div className="px-5 py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-black rounded-2xl text-[11px] uppercase tracking-widest flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            {report.status}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
