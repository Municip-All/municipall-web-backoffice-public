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
    <div className="p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-12">
        <p className="text-apple-muted mb-3 opacity-60">
          Intelligence Urbaine • Municip&apos;All Pulse
        </p>
        <h2 className="text-apple-title">
          Pouls de la Ville
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin opacity-40" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Satisfaction', value: `${stats?.satisfaction ?? 0}%`, trend: stats?.satisfactionTrend ?? 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50/50 dark:bg-indigo-900/10' },
              { label: 'Engagement', value: (stats?.citizensCount ?? 0).toLocaleString('fr-FR'), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
              { label: 'Alertes', value: stats?.activeReportsCount ?? 0, trend: stats?.reportsTrend ?? 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50/50 dark:bg-amber-900/10', reverse: true },
              { label: 'Idées', value: stats?.suggestionsCount ?? 0, trend: stats?.suggestionsTrend ?? 0, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
            ].map((card, i) => (
              <div key={i} className="card-premium p-8 flex items-center gap-6 hover:scale-[1.02] transition-transform">
                <div className={`w-16 h-16 rounded-[22px] ${card.bg} flex items-center justify-center shrink-0 border border-white/20`}>
                  <card.icon className={`${card.color} w-8 h-8`} />
                </div>
                <div>
                  <p className="text-apple-muted mb-1 opacity-60">{card.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[var(--foreground)]">{card.value}</span>
                    {card.trend !== undefined && (
                      <span className={`text-[10px] font-black ${(card.trend >= 0 ? !card.reverse : card.reverse) ? 'text-green-500' : 'text-red-500'}`}>
                        {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-premium p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-[var(--foreground)]">Évolution de la Satisfaction</h3>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-[var(--card-border)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"></div>
                    <span className="text-[10px] font-black text-[var(--muted)]">ACTUEL</span>
                  </div>
                </div>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5e5ce6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5e5ce6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 11, fontWeight: 700}} dy={15} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 11, fontWeight: 700}} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', color: 'var(--foreground)' }}
                      itemStyle={{ color: 'var(--foreground)', fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="satisfaction" stroke="#5e5ce6" strokeWidth={4} fillOpacity={1} fill="url(#colorSatisfaction)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="card-premium p-10 flex-1">
                <h3 className="text-base font-black text-[var(--foreground)] mb-8 opacity-80 uppercase tracking-widest">Sujets Chauds (IA)</h3>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-6">
                  <span className="text-3xl font-black text-red-500 drop-shadow-sm">Nids-de-poule</span>
                  <span className="text-xl font-bold text-[var(--accent)]">Stationnement</span>
                  <span className="text-2xl font-black text-[var(--foreground)]">Sécurité</span>
                  <span className="text-sm text-[var(--muted)] font-bold">Parcs</span>
                  <span className="text-lg font-bold text-green-500">Propreté</span>
                  <span className="text-sm text-[var(--muted)] font-bold">Pistes cyclables</span>
                  <span className="text-2xl font-bold text-orange-500">Éclairage</span>
                  <span className="text-xs text-[var(--muted)]">Bruit</span>
                  <span className="text-xl font-black text-blue-500">Transports</span>
                </div>
              </div>

              <div className="bg-[var(--accent)] rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-[var(--accent)]/20">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  Synthèse de la Semaine
                </h3>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {stats && stats.activeReportsCount > 0
                    ? `L'IA note ${stats.activeReportsCount} signalement${stats.activeReportsCount > 1 ? 's' : ''} actif${stats.activeReportsCount > 1 ? 's' : ''} en attente de traitement. La satisfaction citoyenne est stable à ${stats.satisfaction}%.`
                    : "Aucun signalement actif pour le moment. La ville fonctionne normalement. Bel engagement citoyen constaté."}
                </p>
                <div className="mt-6 flex justify-end">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-tighter">AI AGENT ANALYTICS v2.0</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
