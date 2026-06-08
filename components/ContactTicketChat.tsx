"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Send, X, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { api, ContactTicketDetail } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useInbox } from "@/context/InboxContext";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void api.getContactTicket(ticketId).then((data) => {
      if (!cancelled) {
        setTicket(data);
        setLoadedTicketId(ticketId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ticket?.messages.length]);

  const handleReply = async () => {
    const text = reply.trim();
    if (!text || ticket?.status === "Clôturé") return;
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

  const isClosed = ticket?.status === "Clôturé";

  return (
    <div className="flex h-full min-h-[480px] flex-col border-l border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="min-w-0 flex-1 pr-2">
          <p className="truncate text-sm font-bold text-[var(--foreground)]">
            {ticket?.subject ?? "Conversation"}
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            {ticket?.citizenName} · {ticket?.status}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!isClosed && ticket && (
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
          Conversation clôturée
        </p>
      )}
    </div>
  );
}
