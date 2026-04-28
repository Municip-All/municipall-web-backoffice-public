"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, CityDashboardStats } from "@/lib/api";

export default function PoulsAiDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CityDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user?.cityId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      api.getDashboardStats(user.cityId)
        .then(data => {
          setStats(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.cityId, refreshKey]);

  void setRefreshKey; // kept for manual refresh if needed

  const trendData = stats?.trendData ?? [
    { name: "Lun", satisfaction: 0 },
    { name: "Mar", satisfaction: 0 },
    { name: "Mer", satisfaction: 0 },
    { name: "Jeu", satisfaction: 0 },
    { name: "Ven", satisfaction: 0 },
    { name: "Sam", satisfaction: 0 },
    { name: "Dim", satisfaction: 0 },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-10">
        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">
          Intelligence Urbaine
        </p>
        <h2 className="text-4xl font-black text-zinc-900 tracking-tight">
          Pouls de la Ville
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card-panel p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                <TrendingUp className="text-indigo-600 w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Satisfaction</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900">{stats?.satisfaction ?? 0}%</span>
                  <span className={`text-xs font-bold ${(stats?.satisfactionTrend ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats?.satisfactionTrend ?? 0) >= 0 ? '+' : ''}{stats?.satisfactionTrend ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card-panel p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center shrink-0 border border-blue-100/50">
                <Users className="text-blue-500 w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Engagement</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900">
                    {(stats?.citizensCount ?? 0).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-panel p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50/50 flex items-center justify-center shrink-0 border border-amber-100/50">
                <AlertCircle className="text-amber-600 w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Alertes</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900">{stats?.activeReportsCount ?? 0}</span>
                  <span className={`text-xs font-bold ${(stats?.reportsTrend ?? 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats?.reportsTrend ?? 0) > 0 ? '+' : ''}{stats?.reportsTrend ?? 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card-panel p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50/50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                <MessageSquare className="text-emerald-500 w-7 h-7" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Idées</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-zinc-900">{stats?.suggestionsCount ?? 0}</span>
                  <span className={`text-xs font-bold ${(stats?.suggestionsTrend ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(stats?.suggestionsTrend ?? 0) >= 0 ? '+' : ''}{stats?.suggestionsTrend ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-panel p-8">
              <h3 className="text-lg font-bold text-zinc-900 mb-8">Évolution de la Satisfaction</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0b0080" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0b0080" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                      itemStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="satisfaction" stroke="#0b0080" strokeWidth={3} fillOpacity={1} fill="url(#colorSatisfaction)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="card-panel p-8">
                <h3 className="text-base font-bold text-zinc-900 mb-8">Sujets Chauds (IA)</h3>
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-4 px-2">
                  <span className="text-2xl font-black text-red-600">Nids-de-poule</span>
                  <span className="text-xl font-bold text-municipall-blue">Stationnement</span>
                  <span className="text-xl font-bold text-zinc-900">Sécurité</span>
                  <span className="text-sm text-gray-500">Parcs</span>
                  <span className="text-base font-bold text-green-600">Propreté</span>
                  <span className="text-sm text-gray-500">Pistes cyclables</span>
                  <span className="text-lg font-bold text-orange-500">Éclairage</span>
                  <span className="text-xs text-gray-400">Bruit</span>
                  <span className="text-xl font-bold text-blue-500">Transports</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 relative">
                <h3 className="text-base font-bold text-municipall-blue mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-municipall-blue"></span>
                  Synthèse de la Semaine
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed relative z-10">
                  {stats && stats.activeReportsCount > 0
                    ? `L'IA note ${stats.activeReportsCount} signalement${stats.activeReportsCount > 1 ? 's' : ''} actif${stats.activeReportsCount > 1 ? 's' : ''} en attente de traitement. La satisfaction citoyenne est à ${stats.satisfaction}%.`
                    : "Aucun signalement actif pour le moment. La ville fonctionne normalement."}
                </p>
                <div className="absolute right-4 top-4 w-12 h-12 border-2 border-indigo-100/50 rounded-lg bg-white/50"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
