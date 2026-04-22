"use client";

import React, { useState } from "react";
import { ShieldAlert, Clock, Wrench, Check } from "lucide-react";

interface Report {
  id: string;
  photoUrl: string;
  description: string;
  address: string;
  date: string;
  aiCategory: string;
  priority: "Haute" | "Moyenne" | "Basse";
  status: "pending" | "assigned";
}

const initialReports: Report[] = [
  {
    id: "INC-2024-089",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Nid-de-poule dangereux sur la voie principale.",
    address: "45 Rue de la République",
    date: "Aujourd'hui, 09:12",
    aiCategory: "Voirie",
    priority: "Haute",
    status: "pending",
  },
  {
    id: "INC-2024-090",
    photoUrl: "https://images.unsplash.com/photo-1580974852861-c381510bc98a?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Graffitis injurieux sur le mur de l'école primaire.",
    address: "École Jules Ferry",
    date: "Hier, 18:45",
    aiCategory: "Vandalisme",
    priority: "Moyenne",
    status: "assigned",
  },
  {
    id: "INC-2024-091",
    photoUrl: "https://images.unsplash.com/photo-1623912185292-0b1689ea52bb?auto=format&fit=crop&q=80&w=150&h=150",
    description: "Lampadaire cassé, rue dans l'obscurité totale.",
    address: "Avenue Jean Jaurès",
    date: "18 Avril 2026",
    aiCategory: "Éclairage public",
    priority: "Haute",
    status: "pending",
  },
];

export default function ModerationMatrix() {
  const [reports, setReports] = useState<Report[]>(initialReports);

  const assignReport = (id: string) => {
    setReports((current) =>
      current.map((r) => (r.id === id ? { ...r, status: "assigned" } : r))
    );
  };

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
          <div className="relative">
            <input 
              type="text" 
              placeholder="Rechercher un ID..." 
              className="pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white w-48 focus:outline-none focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue" 
            />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Recherche générale" 
              className="pl-3 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white w-64 focus:outline-none focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue" 
            />
          </div>
        </div>
      </div>

      <div className="card-panel overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <th className="py-4 px-6 w-24">Photo</th>
              <th className="py-4 px-6">Détails (IA)</th>
              <th className="py-4 px-6 w-40">Catégorie</th>
              <th className="py-4 px-6 w-32">Priorité</th>
              <th className="py-4 px-6 text-right w-56">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.photoUrl} alt="Photo du signalement" className="w-16 h-16 rounded-xl object-cover bg-gray-100 border border-black/5" />
                </td>
                
                <td className="py-4 px-6">
                  <p className="text-sm font-bold text-gray-900 mb-1">{report.id}</p>
                  <p className="text-sm text-gray-700 mb-1.5 line-clamp-1">{report.description}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>{report.address}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{report.date}</span>
                  </p>
                </td>
                
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                    {report.aiCategory}
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
                </td>
                
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end">
                    {report.status === "pending" ? (
                      <button
                        onClick={() => assignReport(report.id)}
                        className="btn-primary text-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Assigner aux Services
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors cursor-default"
                      >
                        <Check className="w-3.5 h-3.5" />
                        En cours (Tech.)
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
