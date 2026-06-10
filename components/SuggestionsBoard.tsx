"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  MessageSquare,
  Archive,
  Mail,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import type { ContactTicketListItem } from "@/lib/api";
import ContactTicketChat from "@/components/ContactTicketChat";
import {
  isTerminalContactStatus,
  suggestionStatusStyle,
} from "@/lib/contactTicketStatus";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)
    return `Aujourd'hui, ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}


type SuggestionsBoardProps = {
  tickets: ContactTicketListItem[];
  search: string;
  selectedTicketId: number | null;
  onSelectTicket: (id: number | null) => void;
  onUpdated: () => void;
};

export default function SuggestionsBoard({
  tickets,
  search,
  selectedTicketId,
  onSelectTicket,
  onUpdated,
}: SuggestionsBoardProps) {
  const [pool, setPool] = useState<"open" | "archived">("open");

  const suggestions = tickets.filter((t) => t.ticketType === "suggestion");
  const q = search.toLowerCase();

  const matchesSearch = (t: ContactTicketListItem) => {
    const preview = t.lastMessage?.body ?? "";
    return (
      String(t.id).includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      preview.toLowerCase().includes(q)
    );
  };

  const open = suggestions.filter(
    (t) => !isTerminalContactStatus("suggestion", t.status) && matchesSearch(t),
  );
  const archived = suggestions.filter(
    (t) => isTerminalContactStatus("suggestion", t.status) && matchesSearch(t),
  );
  const visible = pool === "open" ? open : archived;

  const waiting = suggestions.filter((t) => t.status === "En attente").length;
  const inProgress = suggestions.filter(
    (t) =>
      !isTerminalContactStatus("suggestion", t.status) && t.status !== "En attente",
  ).length;
  const archivedCount = suggestions.filter((t) =>
    isTerminalContactStatus("suggestion", t.status),
  ).length;

  return (
    <div
      className={clsx(
        "grid min-h-[520px]",
        selectedTicketId
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(340px,42%)]"
          : "grid-cols-1",
      )}
    >
      <div className="overflow-y-auto max-h-[75vh]">
        <div className="grid grid-cols-3 gap-3 border-b border-[var(--card-border)] p-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              En attente
            </p>
            <p className="text-xl font-black text-amber-900">{waiting}</p>
          </div>
          <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              En suivi
            </p>
            <p className="text-xl font-black text-[var(--foreground)]">{inProgress}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Archivées
            </p>
            <p className="text-xl font-black text-zinc-700">{archivedCount}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-[var(--card-border)] px-4 py-3">
          <button
            type="button"
            onClick={() => setPool("open")}
            className={clsx(
              "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
              pool === "open"
                ? "bg-amber-500 text-white"
                : "bg-zinc-100 text-zinc-500",
            )}
          >
            Suivi actif ({open.length})
          </button>
          <button
            type="button"
            onClick={() => setPool("archived")}
            className={clsx(
              "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1",
              pool === "archived"
                ? "bg-zinc-600 text-white"
                : "bg-zinc-100 text-zinc-500",
            )}
          >
            <Archive className="h-3 w-3" />
            Archives ({archived.length})
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Lightbulb className="mb-4 h-12 w-12 opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">
              Aucune suggestion{search ? " trouvée" : ""}
            </p>
            <p className="mt-2 max-w-sm text-center text-xs text-[var(--muted)]">
              Les idées des citoyens apparaissent ici avec un suivi dédié, distinct des
              questions simples.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {visible.map((ticket) => {
              const fromAgent = ticket.lastMessage?.senderRole === "agent";
              const preview = ticket.lastMessage?.body ?? "Suggestion transmise à la mairie.";
              const isSelected = selectedTicketId === ticket.id;

              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => onSelectTicket(ticket.id)}
                  className={clsx(
                    "group rounded-2xl border p-5 text-left transition-all hover:shadow-md",
                    isSelected
                      ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-300/50"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-amber-200",
                    pool === "archived" && "opacity-80",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <span
                      className={clsx(
                        "shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        suggestionStatusStyle(ticket.status),
                      )}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-sm font-black leading-snug text-[var(--foreground)] line-clamp-2">
                    {ticket.subject}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">
                    Réf. SUG-{String(ticket.id).padStart(4, "0")}
                  </p>

                  <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/40">
                    <p className="text-xs leading-relaxed text-[var(--muted)] line-clamp-3">
                      {preview}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide",
                        fromAgent ? "text-[var(--accent)]" : "text-amber-700",
                      )}
                    >
                      {fromAgent ? (
                        <>
                          <Mail className="h-3 w-3" />
                          Réponse mairie
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3 w-3" />
                          En attente de suivi
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-medium text-[var(--muted)]">
                      {formatDate(ticket.lastMessage?.createdAt ?? ticket.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-end text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Ouvrir le dossier
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTicketId && (
        <ContactTicketChat
          ticketId={selectedTicketId}
          onUpdated={onUpdated}
          onClose={() => {
            onSelectTicket(null);
            onUpdated();
          }}
        />
      )}
    </div>
  );
}
