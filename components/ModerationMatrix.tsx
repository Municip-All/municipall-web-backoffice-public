"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldAlert, Clock, Wrench, Check, Loader2, RefreshCcw } from "lucide-react";
import { api, Report } from "@/lib/api";

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
  const [reports, setReports] = useState<DisplayReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getReports();
      const enriched: DisplayReport[] = data.map(r => ({
        ...r,
        priority: getPriority(r.category),
      }));
      setReports(enriched);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports().catch(console.error);
  }, [fetchReports]);

  const assignReport = async (id: number) => {
    const ok = await api.updateReportStatus(id, "En cours");
    if (ok) {
      setReports(current =>
        current.map(r => (r.id === id ? { ...r, status: "En cours" } : r))
      );
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
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
            Console de Modération
          </h2>
          <p className="text-sm text-gray-500">Gestion des signalements citoyens qualifiés par l&apos;IA.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white w-64 focus:outline-none focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue" 
          />
          <button
            onClick={() => fetchReports()}
            className="p-2 text-gray-400 hover:text-municipall-blue transition-colors border border-gray-200 rounded-lg bg-white"
            aria-label="Rafraîchir"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card-panel overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <ShieldAlert className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-semibold">Aucun signalement{search ? " trouvé" : " pour le moment"}.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <th className="py-4 px-6 w-24">Photo</th>
                <th className="py-4 px-6">Détails</th>
                <th className="py-4 px-6 w-40">Catégorie</th>
                <th className="py-4 px-6 w-32">Priorité</th>
                <th className="py-4 px-6 text-right w-56">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    {report.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={report.imageUrl} alt="Photo" className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-black/5" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 border border-black/5 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-gray-900 mb-1">INC-{String(report.id).padStart(4, '0')}</p>
                    <p className="text-sm text-gray-700 mb-1.5 line-clamp-1">{report.description || "Aucune description."}</p>
                    <p className="text-[11px] text-gray-500">{formatDate(report.createdAt)}</p>
                  </td>
                  
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                      {report.category}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6">
                    {report.priority === "Haute" && (
                      <div className="flex items-center gap-1.5 text-red-600">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-sm font-semibold">Haute</span>
                      </div>
                    )}
                    {report.priority === "Moyenne" && (
                      <div className="flex items-center gap-1.5 text-orange-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">Moyenne</span>
                      </div>
                    )}
                    {report.priority === "Basse" && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">Basse</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end">
                      {report.status === "En attente" ? (
                        <button
                          onClick={() => assignReport(report.id)}
                          className="btn-primary text-xs"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Assigner aux Services
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 font-semibold rounded-lg text-xs flex items-center gap-2 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {report.status}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
