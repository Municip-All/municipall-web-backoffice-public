"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Building2, AlertTriangle } from "lucide-react";
import RoleBadge from "@/components/RoleBadge";
import { api, InvitationPreview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function InviteAcceptPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const router = useRouter();
  const { login } = useAuth();

  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!token) return;
    void api.getInvitationPreview(token).then((result) => {
      setLoading(false);
      if (result.error || !result.data) {
        setLoadError(result.error ?? "Invitation introuvable.");
        return;
      }
      setPreview(result.data);
      if (result.data.suggestedName) {
        setName(result.data.suggestedName);
      }
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (password.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    const result = await api.acceptInvitation({
      token,
      name: name.trim(),
      surname: surname.trim(),
      password,
    });
    setSubmitting(false);

    if (result.error || !result.data) {
      setFormError(result.error ?? "Impossible de finaliser l'inscription.");
      return;
    }

    const { access_token, user } = result.data;
    login(access_token, user);
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] opacity-40" />
      </div>
    );
  }

  if (loadError || !preview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
        <div className="card-panel max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-lg font-bold">Invitation invalide</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{loadError}</p>
        </div>
      </div>
    );
  }

  if (preview.status !== "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
        <div className="card-panel max-w-md p-8 text-center">
          <h1 className="text-lg font-bold">Invitation non disponible</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {preview.status === "accepted"
              ? "Cette invitation a déjà été utilisée. Connectez-vous avec votre compte."
              : "Cette invitation a expiré. Demandez-en une nouvelle à votre maire."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
      <div className="card-panel w-full max-w-lg p-8">
        <div className="mb-8 flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Espace mairie
            </p>
            <h1 className="text-xl font-black">Créer votre accès</h1>
          </div>
        </div>

        <div className="mb-6 space-y-2 rounded-2xl bg-[var(--accent)]/[0.06] p-4 text-sm">
          <p className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--accent)]" />
            <span>
              <strong>{preview.cityName}</strong>
            </span>
          </p>
          <p className="flex flex-wrap items-center gap-2 text-[var(--muted)]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Rôle :</span>
            <RoleBadge role={preview.role} />
            <span>— {preview.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Prénom</span>
              <input
                className="input-field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Nom</span>
              <input
                className="input-field w-full"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Mot de passe</span>
            <input
              type="password"
              className="input-field w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Confirmer le mot de passe
            </span>
            <input
              type="password"
              className="input-field w-full"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>

          {formError ? (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? "Création du compte…" : "Activer mon accès"}
          </button>
        </form>
      </div>
    </div>
  );
}
