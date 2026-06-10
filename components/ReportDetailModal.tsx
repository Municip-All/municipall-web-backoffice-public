"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Loader2,
  Send,
  MapPin,
  Clock,
  User,
  Mail,
  Building2,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { api, ReportDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ReportThumbnail from "@/components/ReportThumbnail";
import { useLiveChatRefresh } from "@/hooks/useLiveChatRefresh";

const ReportLocationMap = dynamic(
  () => import("@/components/ReportLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-[var(--card-border)] bg-zinc-50">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)] opacity-40" />
      </div>
    ),
  },
);

const STATUS_OPTIONS = ["En attente", "En cours", "Résolu", "Clôturé"] as const;

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function categoryStyle(category: string): string {
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

type Props = {
  reportId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function ReportDetailModal({
  reportId,
  onClose,
  onUpdated,
}: Props) {
  const { token } = useAuth();
  const toast = useToast();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loading = reportId !== null && loadedId !== reportId;
  const isClosed = report?.status === "Résolu" || report?.status === "Clôturé";

  const applyReportData = useCallback(
    (
      result: { data: ReportDetail | null; error?: string },
      silent: boolean,
    ) => {
      const { data, error } = result;
      if (!data) {
        if (!silent) {
          setReport(null);
          setLoadError(error ?? "Signalement introuvable.");
          setLoadedId(reportId!);
        }
        return;
      }
      setReport((prev) => {
        if (!prev) return data;
        const prevLastId = prev.messages[prev.messages.length - 1]?.id;
        const nextLastId = data.messages[data.messages.length - 1]?.id;
        if (
          prev.messages.length === data.messages.length &&
          prevLastId === nextLastId &&
          prev.status === data.status
        ) {
          return prev;
        }
        return data;
      });
      if (!silent) {
        setLoadError(null);
        setLoadedId(reportId!);
      }
    },
    [reportId],
  );

  const loadReport = useCallback(
    async (silent = false) => {
      if (!reportId) return;
      const result = await api.getReport(reportId);
      applyReportData(result, silent);
    },
    [reportId, applyReportData],
  );

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    void api.getReport(reportId).then((result) => {
      if (cancelled) return;
      applyReportData(result, false);
    });
    return () => {
      cancelled = true;
    };
  }, [reportId, applyReportData]);

  useLiveChatRefresh(
    () => loadReport(true),
    Boolean(report) && !isClosed && reportId !== null,
  );

  useEffect(() => {
    if (report?.messages.length) {
      setTimeout(
        () =>
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }),
        80,
      );
    }
  }, [report?.messages.length]);

  const handleStatusChange = async (status: string) => {
    if (!report) return;
    setStatusSaving(true);
    const response = await api.updateReportStatus(report.id, status);
    setStatusSaving(false);
    if (response.ok) {
      setReport({ ...report, status });
      toast("success", `Statut mis à jour : ${status}`);
      onUpdated?.();
    } else {
      toast(
        "error",
        response.error ?? "Impossible de mettre à jour le statut.",
      );
    }
  };

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || !report || isClosed) return;
    if (!token) {
      toast("error", "Session expirée. Reconnectez-vous.");
      return;
    }
    setSending(true);
    const { data: updated, error } = await api.replyToReport(report.id, text);
    setSending(false);
    if (updated) {
      setReport(updated);
      setReply("");
      onUpdated?.();
    } else {
      toast("error", error ?? "Impossible d'envoyer le message.");
    }
  };

  if (!reportId) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card-panel relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex items-start justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <p className="section-title">Détails du signalement</p>
            <h2 className="text-xl font-black text-[var(--foreground)]">
              Incident #{String(reportId).padStart(4, "0")}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] opacity-40" />
          </div>
        ) : !report ? (
          <div className="px-6 py-16 text-center text-sm text-[var(--muted)]">
            {loadError ?? "Signalement introuvable."}
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:overflow-hidden">
            <div className="space-y-5 overflow-y-auto border-b border-[var(--card-border)] p-6 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    "inline-flex rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider",
                    categoryStyle(report.category),
                  )}
                >
                  {report.category}
                </span>
                {report.isResident ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800">
                    Résident
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800">
                    Extérieur
                  </span>
                )}
              </div>

              <div>
                <label className="section-title mb-2 block">Statut</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={statusSaving}
                      onClick={() => handleStatusChange(status)}
                      className={clsx(
                        "rounded-xl border px-3 py-2 text-xs font-bold transition-all",
                        report.status === status
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm"
                          : "border-[var(--card-border)] bg-white text-[var(--muted)] hover:border-[var(--accent)]/30",
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--card-border)] bg-zinc-50/50 p-4">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Clock className="h-4 w-4" />
                  {formatFullDate(report.createdAt)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                  {report.description || "Aucune description fournie."}
                </p>
              </div>

              {report.imageUrl ? (
                <div>
                  <p className="section-title mb-2">Photo jointe</p>
                  <ReportThumbnail
                    imageUrl={report.imageUrl}
                    size="lg"
                    className="max-h-72"
                  />
                </div>
              ) : null}

              {report.citizen ? (
                <div className="rounded-2xl border border-[var(--card-border)] p-4">
                  <p className="section-title mb-3">Citoyen signalant</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[var(--foreground)]">
                      <User className="h-4 w-4 text-[var(--accent)]" />
                      <span className="font-semibold">
                        {report.citizen.name} {report.citizen.surname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${report.citizen.email}`}
                        className="hover:text-[var(--accent)]"
                      >
                        {report.citizen.email}
                      </a>
                    </div>
                    {report.citizen.cityName ? (
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <Building2 className="h-4 w-4" />
                        {report.citizen.cityName}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="section-title mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Localisation précise
                </p>
                <ReportLocationMap
                  lat={report.lat}
                  lon={report.lon}
                  label={report.description || report.category}
                />
                <p className="mt-2 text-[11px] font-mono text-[var(--muted)]">
                  {report.lat.toFixed(6)}, {report.lon.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex min-h-[320px] flex-col bg-zinc-50/30 lg:min-h-0">
              <div className="border-b border-[var(--card-border)] px-5 py-3">
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Échanges avec le citoyen
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Posez des questions pour préciser le signalement
                </p>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4"
              >
                {report.messages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-[var(--muted)]">
                    Aucun message pour l&apos;instant. Envoyez la première
                    question à l&apos;habitant.
                  </p>
                ) : (
                  report.messages.map((msg) => {
                    const isAgent = msg.senderRole === "agent";
                    return (
                      <div
                        key={msg.id}
                        className={clsx(
                          "flex flex-col max-w-[90%]",
                          isAgent ? "ml-auto items-end" : "items-start",
                        )}
                      >
                        <span className="mb-1 text-[10px] font-bold text-[var(--muted)]">
                          {msg.senderName}
                        </span>
                        <div
                          className={clsx(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isAgent
                              ? "bg-[var(--accent)] text-white"
                              : "chat-bubble-citizen",
                          )}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {isClosed ? (
                <div className="flex items-center justify-center gap-2 border-t border-[var(--card-border)] px-4 py-3 text-xs text-[var(--muted)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Signalement clôturé — plus de nouveaux messages
                </div>
              ) : (
                <div className="border-t border-[var(--card-border)] p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Question ou mise à jour pour le citoyen…"
                      rows={2}
                      className="input-field min-h-[44px] flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => void handleSend()}
                      disabled={sending || !reply.trim()}
                      className="btn-primary !px-4 self-end"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
