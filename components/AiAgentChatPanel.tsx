"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, TriangleAlert, Wrench } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import {
  askAgent,
  AgentAnalysisTrace,
  AgentChatResponse,
  AgentTopReport,
} from "@/lib/aiAgent";

interface ChatEntry {
  id: number;
  role: "user" | "assistant";
  content: string;
  data?: AgentChatResponse;
  error?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "Quels sont les 3 problèmes les plus urgents cette semaine ?",
  "Analyse le signalement : un lampadaire est cassé rue des Écoles depuis 3 jours",
  "Ce signalement est-il un doublon : poubelle débordante depuis une semaine ?",
];

const MAX_QUESTION_LENGTH = 2000;

function sentimentBadgeClass(score: number): string {
  if (score <= -0.5) return "bg-[#C65D4E]/10 text-[#C65D4E]";
  if (score < 0) return "bg-[#D9A441]/15 text-[#9C7522] dark:text-[#D9A441]";
  return "bg-[#E3EDDE] text-[#4A6741] dark:bg-[#E3EDDE]/15 dark:text-[#A8C69F]";
}

function formatScore(score: number | undefined | null): string {
  const value = typeof score === "number" ? score : 0;
  return value.toFixed(2);
}

function TopReportCard({ report }: { report: AgentTopReport }) {
  return (
    <div className="rounded-xl border border-[#EFEAE0] bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#E3EDDE] px-2.5 py-0.5 text-[10px] font-bold text-[#4A6741] dark:bg-[#E3EDDE]/15 dark:text-[#A8C69F]">
          {report.category}
        </span>
        <span
          className={clsx(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
            sentimentBadgeClass(report.sentiment_score),
          )}
        >
          sentiment {formatScore(report.sentiment_score)}
        </span>
        <span className="text-[10px] font-semibold text-[var(--muted)]">
          #{report.id} · {report.status}
          {report.municipal_service ? ` · ${report.municipal_service}` : ""}
        </span>
      </div>
      {report.content && (
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[var(--foreground)]">
          {report.content}
        </p>
      )}
    </div>
  );
}

function AnalysisTrace({ trace }: { trace: AgentAnalysisTrace }) {
  return (
    <details className="group rounded-lg border border-[#EFEAE0] bg-white/60 dark:border-white/10 dark:bg-white/5">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-[11px] font-bold text-[#4A6741] dark:text-[#A8C69F]">
        <Wrench className="h-3.5 w-3.5" />
        {trace.tool}
        {trace.error && (
          <TriangleAlert className="h-3.5 w-3.5 text-[#C65D4E]" />
        )}
        <span className="ml-auto font-medium text-[var(--muted)] group-open:hidden">
          Détails
        </span>
      </summary>
      <div className="space-y-2 border-t border-[#EFEAE0] px-3 py-2 dark:border-white/10">
        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--muted)]">
          {JSON.stringify(trace.arguments ?? {}, null, 2)}
        </pre>
        <pre
          className={clsx(
            "overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed",
            trace.error ? "text-[#C65D4E]" : "text-[var(--foreground)]",
          )}
        >
          {trace.error
            ? trace.error
            : JSON.stringify(trace.result ?? null, null, 2).slice(0, 1200)}
        </pre>
      </div>
    </details>
  );
}

function AgentStructuredData({ data }: { data: AgentChatResponse }) {
  const hasTopReports = data.top_reports.length > 0;
  const hasAnalyses = data.analyses.length > 0;
  if (!hasTopReports && !hasAnalyses) return null;
  return (
    <div className="mt-3 space-y-3">
      {hasTopReports && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[#7A9B6D]" />
            Signalements urgents ({data.top_reports.length})
          </p>
          {data.top_reports.map((report) => (
            <TopReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
      {hasAnalyses && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
            Outils IA appelés
          </p>
          {data.analyses.map((trace, index) => (
            <AnalysisTrace key={`${trace.tool}-${index}`} trace={trace} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiAgentChatPanel() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const nextIdRef = useRef(1);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [entries.length, sending]);

  const sendQuestion = useCallback(
    async (rawQuestion: string) => {
      const text = rawQuestion.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!text || sending) return;
      setSending(true);
      setQuestion("");
      const userEntryId = nextIdRef.current;
      const assistantEntryId = userEntryId + 1;
      nextIdRef.current += 2;
      setEntries((prev) => [
        ...prev,
        { id: userEntryId, role: "user", content: text },
      ]);
      try {
        const data = await askAgent(text, user?.cityId ?? "");
        if (!aliveRef.current) return;
        setEntries((prev) => [
          ...prev,
          {
            id: assistantEntryId,
            role: "assistant",
            content: data.answer,
            data,
          },
        ]);
      } catch (error) {
        if (!aliveRef.current) return;
        setEntries((prev) => [
          ...prev,
          {
            id: assistantEntryId,
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "Impossible de contacter l'assistant IA.",
            error: true,
          },
        ]);
      } finally {
        if (aliveRef.current) setSending(false);
      }
    },
    [sending, user?.cityId],
  );

  return (
    <PageShell>
      <PageHeader
        title="Assistant IA"
        description="Posez vos questions sur les signalements : l&apos;agent IA appelle les outils d&apos;analyse (urgence, catégorisation, doublons) et synthétise la réponse."
        badge={
          <span className="flex items-center gap-1.5 rounded-full bg-[#E3EDDE] px-3 py-1 text-[11px] font-bold text-[#4A6741] dark:bg-[#E3EDDE]/15 dark:text-[#A8C69F]">
            <Sparkles className="h-3.5 w-3.5" />
            Propulsé par l&apos;IA Municip&apos;All
          </span>
        }
      />

      <div className="card-panel flex h-[calc(100%-6rem)] min-h-[480px] flex-col">
        <div
          ref={scrollRef}
          className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5"
        >
          {entries.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3EDDE] dark:bg-[#E3EDDE]/15">
                <Bot className="h-7 w-7 text-[#4A6741] dark:text-[#A8C69F]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Posez votre première question
                </p>
                <p className="mt-1 max-w-md text-[13px] text-[var(--muted)]">
                  L&apos;assistant interroge la base des signalements et les outils IA
                  en temps réel. Exemples :
                </p>
              </div>
              <div className="flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendQuestion(suggestion)}
                    className="rounded-full border border-[#A8C69F] bg-[#F7F4EC] px-3.5 py-1.5 text-[12px] font-medium text-[#4A6741] transition-colors hover:bg-[#E3EDDE] dark:border-[#A8C69F]/30 dark:bg-white/5 dark:text-[#A8C69F] dark:hover:bg-[#E3EDDE]/15"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {entries.map((entry) =>
            entry.role === "user" ? (
              <div key={entry.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-[#7A9B6D] px-4 py-2.5 text-sm leading-relaxed text-white">
                  {entry.content}
                </div>
              </div>
            ) : (
              <div key={entry.id} className="flex justify-start">
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    entry.error
                      ? "border border-[#C65D4E]/30 bg-[#C65D4E]/10 text-[#C65D4E]"
                      : "chat-bubble-citizen",
                  )}
                >
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  {entry.data && (
                    <>
                      {entry.data.fallback && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#9C7522] dark:text-[#D9A441]">
                          <TriangleAlert className="h-3.5 w-3.5" />
                          Mode dégradé : outils IA indisponibles, réponse statique.
                        </p>
                      )}
                      <AgentStructuredData data={entry.data} />
                    </>
                  )}
                </div>
              </div>
            ),
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="chat-bubble-citizen flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#7A9B6D]" />
                <span className="text-[13px] text-[var(--muted)]">
                  L&apos;assistant analyse…
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--card-border)] p-4">
          <div className="flex gap-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex : Quels sont les 3 problèmes les plus urgents cette semaine ?"
              rows={2}
              maxLength={MAX_QUESTION_LENGTH}
              className="input-field min-h-[44px] flex-1 resize-none focus:border-[#A8C69F] focus:ring-[#A8C69F]/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendQuestion(question);
                }
              }}
            />
            <button
              type="button"
              onClick={() => void sendQuestion(question)}
              disabled={sending || !question.trim()}
              className="btn-primary self-end !bg-[#7A9B6D] !px-4 hover:!bg-[#4A6741]"
              aria-label="Envoyer la question à l'assistant IA"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-right text-[10px] text-[var(--muted)]">
            {question.length}/{MAX_QUESTION_LENGTH}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
