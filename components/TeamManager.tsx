"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, Loader2, Mail } from "lucide-react";
import RoleBadge from "@/components/RoleBadge";
import PageShell from "@/components/PageShell";
import { api, TeamMember } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function TeamManager() {
  const toast = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "assistant" as "assistant" | "agent",
  });

  const load = () => {
    void api.getTeam().then((data) => {
      setTeam(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.name.trim()) return;
    setSending(true);
    const result = await api.inviteTeamMember(form);
    setSending(false);
    if (result.error) {
      toast("error", result.error);
      return;
    }
    if (result.data?.acceptPath && typeof window !== "undefined") {
      setLastInviteLink(`${window.location.origin}${result.data.acceptPath}`);
    }
    toast("success", `Invitation créée pour ${form.email}`);
    setForm({ name: "", email: "", role: "assistant" });
    load();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] opacity-40" />
      </div>
    );
  }

  return (
    <PageShell className="max-w-3xl">
      <header className="mb-8">
        <p className="section-title">Équipe</p>
        <h1 className="text-2xl font-black text-[var(--foreground)]">
          Gestion des accès
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          En tant que maire, vous pouvez inviter des assistants avec des droits
          limités. Ils ne verront pas les KPIs ni la configuration sensible.
        </p>
      </header>

      <form onSubmit={handleInvite} className="card-panel mb-8 space-y-4 p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <UserPlus className="h-4 w-4 text-[var(--accent)]" />
          Inviter un collaborateur
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Prénom / libellé</span>
            <input
              className="input-field w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Marie"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">E-mail</span>
            <input
              type="email"
              className="input-field w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="assistant@mairie.fr"
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Niveau d&apos;accès</span>
          <select
            className="input-field w-full"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value as "assistant" | "agent",
              })
            }
          >
            <option value="assistant">
              Assistant — signalements & contact
            </option>
            <option value="agent">Agent — + agenda & chantiers</option>
          </select>
        </label>
        <button type="submit" disabled={sending} className="btn-primary">
          {sending ? "Envoi…" : "Créer l'invitation"}
        </button>
        {lastInviteLink ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-zinc-50 p-4 text-sm dark:bg-zinc-900/40">
            <p className="mb-2 font-medium">
              Lien à transmettre au collaborateur :
            </p>
            <code className="block break-all text-xs text-[var(--accent)]">
              {lastInviteLink}
            </code>
            <button
              type="button"
              className="btn-ghost mt-3 text-xs"
              onClick={() => {
                void navigator.clipboard.writeText(lastInviteLink);
                toast("success", "Lien copié.");
              }}
            >
              Copier le lien
            </button>
          </div>
        ) : null}
      </form>

      <div className="card-panel overflow-hidden">
        <h2 className="border-b border-[var(--card-border)] px-4 py-3 text-sm font-bold">
          Membres actuels ({team.length})
        </h2>
        <ul>
          {team.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 border-b border-[var(--card-border)] px-4 py-3 last:border-0"
            >
              <div>
                <p className="font-medium">
                  {member.name} {member.surname}
                </p>
                <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Mail className="h-3 w-3" />
                  {member.email}
                </p>
              </div>
              <RoleBadge role={member.role} />
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
