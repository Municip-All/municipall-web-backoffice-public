"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Loader2,
  Activity,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import RoleBadge from "@/components/RoleBadge";
import { api, AgentKpi, TeamActivityItem } from "@/lib/api";

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[var(--accent)] opacity-70" />
      </div>
      <p className="text-3xl font-black text-[var(--foreground)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    "report.message_sent": "Message sur signalement",
    "report.status_updated": "Statut signalement modifié",
    "report.created": "Signalement créé",
    "contact.reply_sent": "Réponse contact",
    "contact.closed": "Ticket clôturé",
    "team.invitation_created": "Invitation envoyée",
    "city.config_updated": "Configuration ville",
  };
  return map[action] ?? action;
}

export default function TeamInsightsDashboard() {
  const [kpis, setKpis] = useState<AgentKpi[]>([]);
  const [activity, setActivity] = useState<TeamActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([api.getTeamKpis(30), api.getTeamActivity(40)]).then(
      ([kpiData, activityData]) => {
        if (cancelled) return;
        setKpis(kpiData);
        setActivity(activityData);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = kpis.reduce(
    (acc, k) => ({
      handled: acc.handled + k.reportsHandled,
      messages: acc.messages + k.messagesSent,
      resolved: acc.resolved + k.reportsResolved,
    }),
    { handled: 0, messages: 0, resolved: 0 },
  );

  const avgResolution =
    kpis.length > 0
      ? Math.round(kpis.reduce((s, k) => s + k.resolutionRate, 0) / kpis.length)
      : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] opacity-40" />
      </div>
    );
  }

  return (
    <PageShell className="max-w-6xl">
      <header className="mb-8">
        <p className="section-title">Pilotage</p>
        <h1 className="text-2xl font-black text-[var(--foreground)]">
          Performance de l&apos;équipe
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Vue réservée au maire : suivi des actions de chaque agent sur les
          signalements et messages citoyens (30 derniers jours).
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Actions totales"
          value={totals.handled}
          hint="Statuts + messages"
          icon={Activity}
        />
        <KpiCard
          label="Messages envoyés"
          value={totals.messages}
          icon={MessageSquare}
        />
        <KpiCard
          label="Signalements résolus"
          value={totals.resolved}
          icon={CheckCircle2}
        />
        <KpiCard
          label="Taux résolution moyen"
          value={`${avgResolution}%`}
          hint="Par agent"
          icon={TrendingUp}
        />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
          <Users className="h-4 w-4 text-[var(--accent)]" />
          Détail par agent
        </h2>
        <div className="card-panel overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--card-border)] bg-zinc-50/80 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)] dark:bg-zinc-900/40">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 text-right">Traités</th>
                <th className="px-4 py-3 text-right">Messages</th>
                <th className="px-4 py-3 text-right">Résolus</th>
                <th className="px-4 py-3 text-right">Taux</th>
              </tr>
            </thead>
            <tbody>
              {kpis.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-[var(--muted)]"
                  >
                    Aucune activité enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                kpis.map((agent) => (
                  <tr
                    key={agent.userId}
                    className="border-b border-[var(--card-border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      {agent.name} {agent.surname}
                      <p className="text-xs font-normal text-[var(--muted)]">
                        {agent.email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={agent.role} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {agent.reportsHandled}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {agent.messagesSent}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {agent.reportsResolved}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          agent.resolutionRate >= 70
                            ? "text-emerald-600"
                            : agent.resolutionRate >= 40
                              ? "text-amber-600"
                              : "text-[var(--muted)]"
                        }
                      >
                        {agent.resolutionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-bold text-[var(--foreground)]">
          Journal d&apos;activité récent
        </h2>
        <ul className="space-y-2">
          {activity.length === 0 ? (
            <li className="card-panel px-4 py-8 text-center text-sm text-[var(--muted)]">
              Aucune action récente.
            </li>
          ) : (
            activity.map((item) => (
              <li
                key={item.id}
                className="card-panel flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-semibold">{item.userName}</span>
                  <span className="text-[var(--muted)]">
                    {" "}
                    — {actionLabel(item.action)}
                  </span>
                  {item.resourceId ? (
                    <span className="text-[var(--muted)]">
                      {" "}
                      #{item.resourceId}
                    </span>
                  ) : null}
                </div>
                <time className="text-xs text-[var(--muted)]">
                  {new Date(item.createdAt).toLocaleString("fr-FR")}
                </time>
              </li>
            ))
          )}
        </ul>
      </div>
    </PageShell>
  );
}
