"use client";

import React, { useState } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  Shield,
  LayoutDashboard,
  Send,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";
import { useAuth, User } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

const highlights = [
  {
    icon: LayoutDashboard,
    title: "Pouls de la ville",
    description: "Tableau de bord et indicateurs en temps réel.",
  },
  {
    icon: Shield,
    title: "Signalements",
    description: "Modération et suivi des remontées citoyennes.",
  },
  {
    icon: Send,
    title: "Alertes directes",
    description: "Communication géolocalisée vers les habitants.",
  },
  {
    icon: MapPin,
    title: "Services municipaux",
    description: "Agenda, chantiers, déchets et secteurs géo.",
  },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/api/v1/auth/login", { email, password });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const { access_token, user } = response.data as {
          access_token: string;
          user: User;
        };
        login(access_token, user);
      }
    } catch {
      setError("Impossible de contacter le serveur d'authentification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)]">
      {/* Panneau gauche — contexte & valeur */}
      <aside className="relative hidden w-[min(44%,520px)] shrink-0 overflow-hidden lg:flex lg:flex-col">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #0b0080 0%, #1a1a6e 45%, #2d2a9a 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-12">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <div className="rounded-2xl bg-white/95 p-2.5 shadow-lg ring-1 ring-white/20">
                <BrandLogo size="lg" className="!h-12 !w-12 !rounded-xl !bg-transparent !ring-0 !shadow-none" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Municip&apos;All Panel</p>
                <p className="text-sm text-white/70">Espace mairie</p>
              </div>
            </div>

            <h2 className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-white xl:text-[1.65rem]">
              Pilotez votre commune au quotidien
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              Un seul portail pour superviser l&apos;activité citoyenne, modérer les
              signalements et diffuser vos services municipaux.
            </p>
          </div>

          <ul className="mt-10 space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs leading-relaxed text-white/65">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-xs text-white/45">
            © 2026 Municip&apos;All · Technologies civiques
          </p>
        </div>
      </aside>

      {/* Panneau droit — formulaire */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80 dark:opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 0%, rgba(11, 0, 128, 0.06), transparent), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(79, 70, 229, 0.05), transparent)",
          }}
        />

        <div className="relative z-10 w-full max-w-[420px]">
          {/* En-tête mobile */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <BrandLogo size="lg" className="mb-4" />
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Municip&apos;All Panel
            </h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Espace de gestion municipale
            </p>
          </div>

          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Connexion
            </h1>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Accédez à votre espace agent avec vos identifiants institutionnels.
            </p>
          </div>

          <div className="card-panel p-7 sm:p-8">
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-[var(--accent)]/[0.06] px-3.5 py-2.5 ring-1 ring-[var(--accent)]/10">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <p className="text-xs font-medium text-[var(--muted)]">
                Accès réservé au personnel habilité des collectivités
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="section-title mb-2 block">
                  Email institutionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@ville.gouv.fr"
                    className="input-field-icon"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="section-title mb-2 block">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field-icon"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={clsx("btn-primary w-full py-3", isLoading && "opacity-75")}
              >
                {isLoading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--muted)]">
              Toute tentative d&apos;accès non autorisée est enregistrée et peut faire
              l&apos;objet de poursuites.
            </p>
          </div>

          {/* Raccourcis visuels sur mobile */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
            {highlights.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/60 px-3 py-3"
                >
                  <Icon className="mb-2 h-4 w-4 text-[var(--accent)]" />
                  <p className="text-xs font-medium text-[var(--foreground)]">
                    {item.title}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[11px] text-[var(--muted)] lg:hidden">
            © 2026 Municip&apos;All
          </p>
        </div>
      </main>
    </div>
  );
}
