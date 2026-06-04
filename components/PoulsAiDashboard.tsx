"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  Users,
  ShieldAlert,
  MessageSquare,
  Loader2,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { useInbox } from "@/context/InboxContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { ViewType } from "./Sidebar";

interface PoulsAiDashboardProps {
  onViewChange: (view: ViewType) => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function PoulsAiDashboard({ onViewChange }: PoulsAiDashboardProps) {
  const { stats, alerts, pendingReports, pendingMessages, urgentCount, isLoading, refresh } =
    useInbox();

  const goModeration = (tab: "reports" | "messages") => {
    sessionStorage.setItem("moderation_tab", tab);
    onViewChange("moderation");
  };

  const trendData = stats?.trendData ?? [];
  const urgentAlerts = alerts.filter((a) => a.severity === "urgent").slice(0, 5);

  return (
    <PageShell>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble · Pouls de la ville"
        badge={
          urgentCount > 0 ? (
            <Badge variant="danger" dot>
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </Badge>
          ) : pendingReports + pendingMessages > 0 ? (
            <Badge variant="warning" dot>
              À traiter
            </Badge>
          ) : (
            <Badge variant="success" dot>
              Calme
            </Badge>
          )
        }
        actions={
          <button type="button" onClick={refresh} className="btn-secondary text-xs">
            Actualiser
          </button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard
              title="Signalements en attente"
              value={pendingReports}
              icon={ShieldAlert}
              alertCount={pendingReports}
              highlight={pendingReports > 0}
              onClick={() => goModeration("reports")}
            />
            <StatCard
              title="Messages en attente"
              value={pendingMessages}
              icon={MessageSquare}
              alertCount={pendingMessages}
              highlight={pendingMessages > 0}
              onClick={() => goModeration("messages")}
            />
            <StatCard
              title="Urgences"
              value={urgentCount}
              icon={AlertTriangle}
              alertCount={urgentCount}
              highlight={urgentCount > 0}
              onClick={() => onViewChange("moderation")}
            />
            <StatCard
              title="En cours de traitement"
              value={stats?.reportsInProgressCount ?? 0}
              icon={Clock}
              onClick={() => goModeration("reports")}
            />
            <StatCard
              title="Citoyens inscrits"
              value={(stats?.citizensCount ?? 0).toLocaleString("fr-FR")}
              icon={Users}
            />
            <StatCard
              title="Satisfaction"
              value={`${stats?.satisfaction ?? 0}%`}
              trend={stats?.satisfactionTrend}
              icon={CheckCircle2}
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => goModeration("reports")}
              className="card-panel flex items-center justify-between p-5 text-left transition-all hover:ring-2 hover:ring-[var(--accent)]/20"
            >
              <div>
                <p className="section-title">Signalements</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  Modérer la file citoyenne
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pendingReports > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white">
                    {pendingReports}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </div>
            </button>
            <button
              type="button"
              onClick={() => goModeration("messages")}
              className="card-panel flex items-center justify-between p-5 text-left transition-all hover:ring-2 hover:ring-[var(--accent)]/20"
            >
              <div>
                <p className="section-title">Messages contact</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  Répondre aux demandes
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pendingMessages > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white">
                    {pendingMessages}
                  </span>
                )}
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              </div>
            </button>
            <button
              type="button"
              onClick={() => onViewChange("targeted-push")}
              className="card-panel flex items-center justify-between p-5 text-left transition-all hover:ring-2 hover:ring-[var(--accent)]/20"
            >
              <div>
                <p className="section-title">Alertes directes</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  Communiquer à la population
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="card-panel p-6 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Alertes prioritaires
                </h3>
                {urgentCount > 0 && (
                  <Badge variant="danger">{urgentCount}</Badge>
                )}
              </div>
              {urgentAlerts.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">
                  Aucune alerte urgente pour le moment.
                </p>
              ) : (
                <ul className="space-y-2">
                  {urgentAlerts.map((alert) => (
                    <li key={alert.id}>
                      <button
                        type="button"
                        onClick={() => {
                          sessionStorage.setItem(
                            "moderation_tab",
                            alert.type === "contact" ? "messages" : "reports",
                          );
                          if (alert.type === "contact") {
                            sessionStorage.setItem(
                              "moderation_ticket_id",
                              String(alert.entityId),
                            );
                          }
                          onViewChange("moderation");
                        }}
                        className={clsx(
                          "w-full rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                          alert.severity === "urgent"
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-[var(--card-border)]",
                        )}
                      >
                        <p className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                          {alert.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                          {formatRelativeTime(alert.createdAt)}
                          <span className="ml-2 font-bold text-red-500">URGENT</span>
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {(stats?.pendingTotalCount ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => onViewChange("moderation")}
                  className="mt-4 w-full text-xs font-bold text-[var(--accent)]"
                >
                  Voir les {stats?.pendingTotalCount} éléments à traiter →
                </button>
              )}
            </div>

            <div className="card-panel p-6 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Évolution de la satisfaction
                </h3>
                <Badge variant="live" dot>
                  7 jours
                </Badge>
              </div>
              <div className="h-[260px] w-full">
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
          </div>
        </>
      )}
    </PageShell>
  );
}
