"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, CityDashboardStats } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";

export default function PoulsAiDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CityDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user?.cityId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      api
        .getDashboardStats(user.cityId)
        .then((data) => {
          setStats(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.cityId]);

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
    <PageShell>
      <PageHeader
        title="Pouls de la ville"
        description="Intelligence urbaine · Municip'All Pulse"
        badge={
          <Badge variant="accent" dot>
            IA
          </Badge>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Satisfaction"
              value={`${stats?.satisfaction ?? 0}%`}
              trend={stats?.satisfactionTrend}
              icon={TrendingUp}
            />
            <StatCard
              title="Engagement"
              value={(stats?.citizensCount ?? 0).toLocaleString("fr-FR")}
              icon={Users}
            />
            <StatCard
              title="Alertes"
              value={stats?.activeReportsCount ?? 0}
              trend={stats?.reportsTrend}
              trendReverse
              icon={AlertCircle}
            />
            <StatCard
              title="Idées"
              value={stats?.suggestionsCount ?? 0}
              trend={stats?.suggestionsTrend}
              icon={MessageSquare}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card-panel p-6 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Évolution de la satisfaction
                </h3>
                <Badge variant="live" dot>
                  Actuel
                </Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-zinc-200 dark:stroke-zinc-800"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderRadius: "12px",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="satisfaction"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      fill="url(#colorSatisfaction)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="card-panel flex-1 p-6">
                <h3 className="section-title mb-4">Sujets chauds (IA)</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {[
                    { label: "Nids-de-poule", size: "text-lg font-semibold text-red-500" },
                    { label: "Stationnement", size: "text-sm font-medium text-[var(--accent)]" },
                    { label: "Sécurité", size: "text-base font-semibold" },
                    { label: "Parcs", size: "text-xs text-[var(--muted)]" },
                    { label: "Propreté", size: "text-sm font-medium text-emerald-600" },
                    { label: "Éclairage", size: "text-sm font-medium text-amber-600" },
                  ].map((tag) => (
                    <span
                      key={tag.label}
                      className={`${tag.size} text-[var(--foreground)]`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-[var(--accent)] p-6 text-white shadow-premium">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Synthèse de la semaine
                </h3>
                <p className="text-sm leading-relaxed text-white/90">
                  {stats && stats.activeReportsCount > 0
                    ? `L'IA note ${stats.activeReportsCount} signalement${stats.activeReportsCount > 1 ? "s" : ""} actif${stats.activeReportsCount > 1 ? "s" : ""} en attente. Satisfaction citoyenne : ${stats.satisfaction}%.`
                    : "Aucun signalement actif. La ville fonctionne normalement."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
