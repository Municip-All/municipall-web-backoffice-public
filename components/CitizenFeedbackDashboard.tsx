"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Star, MessageSquareQuote, Shield } from "lucide-react";
import clsx from "clsx";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import { api, CitizenFeedbackItem } from "@/lib/api";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={clsx(
            "h-4 w-4",
            n <= value
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300",
          )}
        />
      ))}
    </div>
  );
}

function resourceTypeLabel(type: CitizenFeedbackItem["resourceType"]): string {
  if (type === "report") return "Signalement";
  return "Contact";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CitizenFeedbackDashboard() {
  const [items, setItems] = useState<CitizenFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void api.getCitizenFeedback().then((data) => {
      if (cancelled) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const withMessage = items.filter((i) => i.message?.trim());
  const avgStars =
    items.length > 0
      ? items.reduce((s, i) => s + i.stars, 0) / items.length
      : 0;

  return (
    <PageShell>
      <PageHeader
        title="Avis citoyens"
        description="Vue réservée au maire — commentaires confidentiels pour piloter l'équipe"
      />
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p>
          Les messages ci-dessous ne sont visibles que par le maire. Ils ne
          figurent pas dans les écrans de modération accessibles aux agents.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-panel p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Notes reçues
          </p>
          <p className="mt-1 text-3xl font-black">{items.length}</p>
        </div>
        <div className="card-panel p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Moyenne
          </p>
          <p className="mt-1 text-3xl font-black">
            {items.length > 0 ? `${avgStars.toFixed(1)}/5` : "—"}
          </p>
        </div>
        <div className="card-panel p-5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Avec commentaire
          </p>
          <p className="mt-1 text-3xl font-black">{withMessage.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : items.length === 0 ? (
        <div className="card-panel flex flex-col items-center justify-center px-6 py-16 text-center">
          <MessageSquareQuote className="mb-4 h-10 w-10 text-[var(--muted)] opacity-40" />
          <p className="font-bold text-[var(--foreground)]">Aucun avis pour l&apos;instant</p>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            Les citoyens peuvent noter leurs dossiers une fois un signalement,
            une question ou une suggestion clôturé(e).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="card-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      {resourceTypeLabel(item.resourceType)}
                    </span>
                    <Stars value={item.stars} />
                  </div>
                  <p className="font-bold text-[var(--foreground)]">
                    {item.resourceLabel}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {item.citizenName} · {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              {item.message ? (
                <blockquote className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground)]">
                  « {item.message} »
                </blockquote>
              ) : (
                <p className="mt-3 text-xs italic text-[var(--muted)]">
                  Note sans commentaire
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
