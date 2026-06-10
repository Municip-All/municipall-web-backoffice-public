"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Clock,
  Wrench,
  Check,
  Loader2,
  RefreshCcw,
  MessageSquare,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { api, ContactTicketListItem, Report } from "@/lib/api";
import { useInbox } from "@/context/InboxContext";
import clsx from "clsx";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import ContactTicketChat from "@/components/ContactTicketChat";
import { isTerminalContactStatus } from "@/lib/contactTicketStatus";
import ReportDetailModal from "@/components/ReportDetailModal";
import ReportThumbnail from "@/components/ReportThumbnail";
import SuggestionsBoard from "@/components/SuggestionsBoard";
import {
  consumeModerationSession,
  type ModerationTab,
} from "@/lib/moderationNav";

interface DisplayReport extends Report {
  priority: "Haute" | "Moyenne" | "Basse";
}

function categoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    Voirie: "bg-blue-100 text-blue-900 border-blue-200",
    Éclairage: "bg-amber-100 text-amber-900 border-amber-200",
    Sécurité: "bg-red-100 text-red-900 border-red-200",
    Vandalisme: "bg-orange-100 text-orange-900 border-orange-200",
    Propreté: "bg-emerald-100 text-emerald-900 border-emerald-200",
    Eau: "bg-cyan-100 text-cyan-900 border-cyan-200",
    "Espaces Verts": "bg-lime-100 text-lime-900 border-lime-200",
    Autre: "bg-slate-100 text-slate-800 border-slate-200",
  };
  return map[category] ?? "bg-indigo-100 text-indigo-900 border-indigo-200";
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
  if (diff < 86400)
    return `Aujourd'hui, ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  if (diff < 172800)
    return `Hier, ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TAB_TITLES: Record<ModerationTab, string> = {
  reports: "Signalements",
  questions: "Questions citoyennes",
  suggestions: "Suggestions citoyennes",
};

export default function ModerationMatrix() {
  const toast = useToast();
  const { refresh: refreshInbox } = useInbox();
  const [sessionNav] = useState(consumeModerationSession);
  const [activeTab, setActiveTab] = useState<ModerationTab>(sessionNav.tab);
  const [reports, setReports] = useState<DisplayReport[]>([]);
  const [tickets, setTickets] = useState<ContactTicketListItem[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(
    sessionNav.ticketId,
  );
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [questionPool, setQuestionPool] = useState<"open" | "archived">("open");

  const fetchKey = `${activeTab}:${refreshKey}`;
  const isLoading = readyKey !== fetchKey;

  const fetchData = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;

    if (activeTab === "reports") {
      void api
        .getReports()
        .then((data) => {
          if (cancelled) return;
          setReports(
            data.map((r) => ({ ...r, priority: getPriority(r.category) })),
          );
          setReadyKey(fetchKey);
        })
        .catch(() => {
          if (!cancelled) setReadyKey(fetchKey);
        });
    } else {
      void api
        .getContactTickets()
        .then((data) => {
          if (cancelled) return;
          setTickets(data);
          setReadyKey(fetchKey);
        })
        .catch(() => {
          if (!cancelled) setReadyKey(fetchKey);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchKey]);

  const assignReport = async (id: number) => {
    const { ok } = await api.updateReportStatus(id, "En cours");
    if (ok) {
      setReports((current) =>
        current.map((r) => (r.id === id ? { ...r, status: "En cours" } : r)),
      );
      toast(
        "success",
        `Signalement #${String(id).padStart(4, "0")} assigné aux services.`,
      );
      refreshInbox();
    } else {
      toast("error", "Impossible de mettre à jour le signalement.");
    }
  };

  const activeReports = reports.filter(
    (r) => r.status !== "Résolu" && r.status !== "Clôturé",
  );

  const filteredReports = activeReports.filter((r) => {
    const q = search.toLowerCase();
    return (
      String(r.id).includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const questionTickets = tickets.filter(
    (t) => (t.ticketType ?? "question") === "question",
  );
  const openQuestions = questionTickets.filter((t) => t.status !== "Clôturé");
  const archivedQuestions = questionTickets.filter((t) => t.status === "Clôturé");
  const questionPoolTickets =
    questionPool === "open" ? openQuestions : archivedQuestions;

  const filteredQuestions = questionPoolTickets.filter((t) => {
    const q = search.toLowerCase();
    const preview = t.lastMessage?.body ?? "";
    return (
      String(t.id).includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      preview.toLowerCase().includes(q)
    );
  });

  const openSuggestionsCount = tickets.filter(
    (t) =>
      t.ticketType === "suggestion" &&
      !isTerminalContactStatus("suggestion", t.status),
  ).length;

  const handleTabChange = (tab: ModerationTab) => {
    setActiveTab(tab);
    setSelectedTicketId(null);
  };

  return (
    <PageShell>
      <ReportDetailModal
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onUpdated={() => {
          fetchData();
          refreshInbox();
        }}
      />
      <PageHeader
        title={TAB_TITLES[activeTab]}
        description={
          activeTab === "suggestions"
            ? "Suivi des idées citoyennes — chaque suggestion est traitée comme un dossier"
            : activeTab === "questions"
              ? "Échanges rapides avec les citoyens"
              : "Gestion citoyenne · Console de modération"
        }
        actions={
          <>
            <input
              type="text"
              placeholder="Filtrer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-56"
            />
            <button
              type="button"
              onClick={() => fetchData()}
              className="btn-secondary !px-3"
              aria-label="Rafraîchir"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleTabChange("reports")}
          className={clsx(
            "rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
            activeTab === "reports"
              ? "tab-segment-active"
              : "tab-segment-inactive",
          )}
        >
          Signalements
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("questions")}
          className={clsx(
            "rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === "questions"
              ? "tab-segment-active"
              : "tab-segment-inactive",
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Questions
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("suggestions")}
          className={clsx(
            "rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            activeTab === "suggestions"
              ? "bg-amber-500 text-white shadow-sm"
              : "tab-segment-inactive",
          )}
        >
          <Lightbulb className="h-4 w-4" />
          Suggestions
          {openSuggestionsCount > 0 && (
            <span className="ml-1 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px]">
              {openSuggestionsCount}
            </span>
          )}
        </button>
      </div>

      <div className="card-panel overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] opacity-40" />
          </div>
        ) : activeTab === "suggestions" ? (
          <SuggestionsBoard
            tickets={tickets}
            search={search}
            selectedTicketId={selectedTicketId}
            onSelectTicket={setSelectedTicketId}
            onUpdated={() => {
              fetchData();
              refreshInbox();
            }}
          />
        ) : activeTab === "questions" ? (
          <>
            <div className="flex flex-wrap gap-2 border-b border-[var(--card-border)] px-4 py-3">
              <button
                type="button"
                onClick={() => setQuestionPool("open")}
                className={clsx(
                  "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
                  questionPool === "open"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-zinc-100 text-zinc-500",
                )}
              >
                Actives ({openQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setQuestionPool("archived")}
                className={clsx(
                  "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
                  questionPool === "archived"
                    ? "bg-zinc-600 text-white"
                    : "bg-zinc-100 text-zinc-500",
                )}
              >
                Archives ({archivedQuestions.length})
              </button>
            </div>
            {filteredQuestions.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
                <MessageSquare className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">
                  Aucune question{search ? " trouvée" : ""}
                </p>
              </div>
            ) : (
              <div
                className={clsx(
                  "grid min-h-[520px]",
                  selectedTicketId
                    ? "lg:grid-cols-[minmax(0,1fr)_minmax(320px,42%)]"
                    : "grid-cols-1",
                )}
              >
                <div className="max-h-[70vh] divide-y divide-[var(--card-border)] overflow-y-auto">
                  {filteredQuestions.map((ticket) => {
                    const preview = ticket.lastMessage?.body ?? "—";
                    const fromCitizen =
                      ticket.lastMessage?.senderRole === "citizen";
                    return (
                      <button
                        key={ticket.id}
                        type="button"
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={clsx(
                          "w-full px-6 py-4 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20",
                          selectedTicketId === ticket.id &&
                            "border-l-4 border-[var(--accent)] bg-[var(--accent)]/5",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-1 text-sm font-black text-[var(--foreground)]">
                            {ticket.subject}
                          </p>
                          <span
                            className={clsx(
                              "shrink-0 text-[10px] font-black uppercase tracking-widest",
                              ticket.status === "En attente" && "text-amber-500",
                              ticket.status === "En cours" &&
                                "text-[var(--accent)]",
                              ticket.status === "Clôturé" && "text-zinc-400",
                            )}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                          {fromCitizen ? "" : "Mairie · "}
                          {preview}
                        </p>
                        <p className="mt-2 text-[10px] font-bold text-apple-muted">
                          {formatDate(
                            ticket.lastMessage?.createdAt ?? ticket.updatedAt,
                          )}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {selectedTicketId && (
                  <ContactTicketChat
                    ticketId={selectedTicketId}
                    onUpdated={fetchData}
                    onClose={() => {
                      setSelectedTicketId(null);
                      fetchData();
                    }}
                  />
                )}
              </div>
            )}
          </>
        ) : filteredReports.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
            <ShieldAlert className="mb-4 h-12 w-12 opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">
              Aucun signalement{search ? " trouvé" : " actif"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-50">
                  <th className="w-28 px-8 py-6">Visuel</th>
                  <th className="px-8 py-6">Signalement & Description</th>
                  <th className="w-48 px-8 py-6">Catégorie</th>
                  <th className="w-40 px-8 py-6">Priorité</th>
                  <th className="w-64 px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className="group cursor-pointer transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20"
                  >
                    <td className="px-8 py-6">
                      <ReportThumbnail
                        imageUrl={report.imageUrl}
                        className="transition-transform group-hover:scale-105"
                      />
                    </td>

                    <td className="px-8 py-6">
                      <div className="mb-2 flex items-center gap-3">
                        <p className="text-sm font-black tracking-tight text-[var(--foreground)]">
                          INCIDENT #{String(report.id).padStart(4, "0")}
                        </p>
                        {report.isResident ? (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-emerald-500">
                            Résident
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-amber-500">
                            Extérieur
                          </span>
                        )}
                      </div>
                      <p className="mb-2 line-clamp-2 max-w-lg text-sm font-medium leading-relaxed text-[var(--foreground)] opacity-70">
                        {report.description || "Aucune description détaillée."}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-apple-muted opacity-60">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(report.createdAt)}
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm",
                          categoryBadgeClass(report.category),
                        )}
                      >
                        {report.category}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      {report.priority === "Haute" && (
                        <div className="flex items-center gap-2 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Haute
                          </span>
                        </div>
                      )}
                      {report.priority === "Moyenne" && (
                        <div className="flex items-center gap-2 text-amber-500">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            Moyenne
                          </span>
                        </div>
                      )}
                      {report.priority === "Basse" && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <div className="h-2 w-2 rounded-full bg-zinc-400" />
                          <span className="text-xs font-black uppercase tracking-widest opacity-60">
                            Basse
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === "En attente" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void assignReport(report.id);
                            }}
                            className="flex items-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--accent)]/20 transition-all hover:scale-105 active:scale-95"
                          >
                            <Wrench className="h-4 w-4" />
                            Assigner
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-emerald-700">
                            <Check className="h-4 w-4" />
                            {report.status}
                          </div>
                        )}
                        <ChevronRight className="h-5 w-5 text-zinc-300 transition-colors group-hover:text-[var(--accent)]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageShell>
  );
}
