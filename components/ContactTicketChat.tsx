"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send, X, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { api, ContactTicketDetail } from "@/lib/api";
import {
  isTerminalContactStatus,
  SUGGESTION_STATUSES,
  suggestionStatusStyle,
} from "@/lib/contactTicketStatus";
import { useToast } from "@/context/ToastContext";
import { useInbox } from "@/context/InboxContext";
import { useLiveChatRefresh } from "@/hooks/useLiveChatRefresh";

interface ContactTicketChatProps {
  ticketId: number;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function ContactTicketChat({
  ticketId,
  onClose,
  onUpdated,
}: ContactTicketChatProps) {
  const toast = useToast();
  const { refresh: refreshInbox } = useInbox();
  const [ticket, setTicket] = useState<ContactTicketDetail | null>(null);
  const [loadedTicketId, setLoadedTicketId] = useState<number | null>(null);
  const loading = loadedTicketId !== ticketId;
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const applyTicketData = useCallback(
    (data: ContactTicketDetail | null, silent: boolean) => {
      if (!data) {
        if (!silent) {
          setTicket(null);
          setLoadedTicketId(ticketId);
        }
        return;
      }
      setTicket((prev) => {
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
        setLoadedTicketId(ticketId);
      }
    },
    [ticketId],
  );

  const loadTicket = useCallback(
    async (silent = false) => {
      const data = await api.getContactTicket(ticketId);
      applyTicketData(data, silent);
    },
    [ticketId, applyTicketData],
  );

  useEffect(() => {
    let cancelled = false;
    void api.getContactTicket(ticketId).then((data) => {
      if (cancelled) return;
      applyTicketData(data, false);
    });
    return () => {
      cancelled = true;
    };
  }, [ticketId, applyTicketData]);

  const ticketType = ticket?.ticketType ?? "question";
  const isClosed = ticket
    ? isTerminalContactStatus(ticketType, ticket.status)
    : false;
  const isSuggestion = ticketType === "suggestion";

  useLiveChatRefresh(
    () => loadTicket(true),
    Boolean(ticket) && !isClosed,
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ticket?.messages.length]);

  const handleReply = async () => {
    const text = reply.trim();
    if (!text || (ticket && isTerminalContactStatus(ticketType, ticket.status)))
      return;
    setSending(true);
    const updated = await api.replyContactTicket(ticketId, text);
    setSending(false);
    if (updated) {
      setTicket(updated);
      setReply("");
      refreshInbox();
      onUpdated?.();
    } else {
      toast("error", "Impossible d'envoyer la réponse.");
    }
  };

  const handleClose = async () => {
    if (
      !confirm(
        "Clôturer cette conversation ? Le citoyen ne pourra plus y répondre.",
      )
    )
      return;
    setClosing(true);
    const updated = await api.closeContactTicket(ticketId);
    setClosing(false);
    if (updated) {
      setTicket(updated);
      toast("success", "Conversation clôturée.");
      refreshInbox();
      onUpdated?.();
    } else {
      toast("error", "Impossible de clôturer.");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!ticket || status === ticket.status) return;
    const terminal = isTerminalContactStatus("suggestion", status);
    if (
      terminal &&
      !confirm(
        `Passer la suggestion au statut « ${status} » ? Le citoyen ne pourra plus y répondre.`,
      )
    ) {
      return;
    }
    setUpdatingStatus(true);
    const updated = await api.updateContactTicketStatus(ticketId, status);
    setUpdatingStatus(false);
    if (updated) {
      setTicket(updated);
      toast("success", `Statut mis à jour : ${status}`);
      refreshInbox();
      onUpdated?.();
    } else {
      toast("error", "Impossible de modifier le statut.");
    }
  };

  return (
    <div className="flex h-full min-h-[480px] flex-col border-l border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-sm font-bold text-[var(--foreground)]">
            {ticket?.subject ?? "Conversation"}
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            {ticket?.citizenName} ·{" "}
            {ticket?.ticketType === "suggestion" ? "Suggestion · " : ""}
            {ticket?.status}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isClosed && ticket && !isSuggestion && (
            <button
              type="button"
              onClick={handleClose}
              disabled={closing}
              className="btn-secondary !px-3 !py-2 text-[10px]"
              title="Clôturer le ticket"
            >
              {closing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Clôturer
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !p-2"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isSuggestion && ticket && !isClosed && (
        <div className="border-b border-[var(--card-border)] px-4 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Statut de la suggestion
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTION_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updatingStatus}
                onClick={() => handleStatusChange(status)}
                className={clsx(
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold transition-opacity",
                  suggestionStatusStyle(status),
                  ticket.status === status && "ring-2 ring-[var(--accent)] ring-offset-1",
                  updatingStatus && "opacity-50",
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
          </div>
        ) : (
          ticket?.messages.map((msg) => {
            const isAgent = msg.senderRole === "agent";
            return (
              <div
                key={msg.id}
                className={clsx(
                  "flex flex-col max-w-[85%]",
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

      {!isClosed && (
        <div className="border-t border-[var(--card-border)] p-4">
          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Répondre au citoyen…"
              rows={2}
              className="input-field min-h-[44px] flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <button
              type="button"
              onClick={handleReply}
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

      {isClosed && (
        <p className="border-t border-[var(--card-border)] px-4 py-3 text-center text-xs text-[var(--muted)]">
          {isSuggestion
            ? `Suggestion archivée · ${ticket?.status}`
            : "Conversation clôturée"}
        </p>
      )}
    </div>
  );
}
