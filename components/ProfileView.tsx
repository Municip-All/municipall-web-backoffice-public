"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Shield,
  Bell,
  ChevronRight,
  Camera,
  LogOut,
  Building,
  Globe,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  Loader2,
  Smartphone,
  Scale,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type NotificationPreferences } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";
import PageShell from "@/components/PageShell";
import ProfileSubHeader from "@/components/profile/ProfileSubHeader";
import LegalDocumentRenderer from "@/components/profile/LegalDocumentRenderer";
import {
  getLegalDocument,
  LEGAL_HUB_ITEMS,
  type LegalDocId,
} from "@/lib/legalContent";
import { HELP_ARTICLES, getHelpArticle } from "@/lib/helpContent";
import type { ViewType } from "@/components/Sidebar";
import { roleLabel } from "@/lib/roleLabels";

type SubView =
  | "main"
  | "identity"
  | "security"
  | "notifications"
  | "help"
  | "help-article"
  | "legal"
  | "legal-doc";

const DEFAULT_PREFS: NotificationPreferences = {
  moderationAlerts: true,
  weeklyReports: true,
  citizenEngagement: false,
  systemMaintenance: true,
  contactInbox: true,
  teamActivity: true,
};

type ProfileViewProps = {
  onNavigate?: (view: ViewType) => void;
};

export default function ProfileView({ onNavigate }: ProfileViewProps) {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSubView, setActiveSubView] = useState<SubView>("main");
  const [legalDocId, setLegalDocId] = useState<LegalDocId | null>(null);
  const [helpArticleId, setHelpArticleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cityName, setCityName] = useState<string>("");
  const [dataRetentionPolicy, setDataRetentionPolicy] = useState<string>("");
  const [stats, setStats] = useState<{
    reports: number;
    points: number;
  } | null>(null);

  const [identityForm, setIdentityForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [prefsDirty, setPrefsDirty] = useState(false);

  const goMain = () => {
    setActiveSubView("main");
    setLegalDocId(null);
    setHelpArticleId(null);
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfileData = async () => {
      const me = await api.getMe();
      if (cancelled) return;
      if (me) {
        updateUser({
          name: me.name,
          surname: me.surname,
          email: me.email,
          role: me.role,
          avatar_url: me.avatar_url,
          permissions: me.permissions,
        });
        setIdentityForm({
          name: me.name || "",
          surname: me.surname || "",
          email: me.email || "",
        });
      }

      const [userStats, notificationPrefs] = await Promise.all([
        api.getUserStats(),
        api.getNotificationPreferences(),
      ]);
      if (cancelled) return;
      if (userStats) {
        setStats({ reports: userStats.reports, points: userStats.points });
      }
      if (notificationPrefs) {
        setPrefs(notificationPrefs);
        setPrefsDirty(false);
      }

      const cityId = user?.cityId;
      if (cityId) {
        const config = await api.getCityConfig(cityId);
        if (cancelled) return;
        if (config) {
          setCityName(config.name || cityId);
          setDataRetentionPolicy(
            (config as { dataRetentionPolicy?: string }).dataRetentionPolicy ||
              "",
          );
        } else {
          setCityName(cityId);
        }
      }
    };

    void loadProfileData().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [updateUser, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("error", "Image trop volumineuse (max. 2 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const avatarUrl = reader.result as string;
      setIsSaving(true);
      const ok = await api.updateAvatar(avatarUrl);
      setIsSaving(false);
      if (ok) {
        updateUser({ avatar_url: avatarUrl });
        toast("success", "Photo de profil mise à jour.");
      } else {
        toast("error", "Impossible de mettre à jour la photo.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateIdentity = async () => {
    if (!identityForm.name || !identityForm.email) {
      toast("error", "Le prénom et l'e-mail sont obligatoires.");
      return;
    }
    setIsSaving(true);
    const success = await api.updateProfile(identityForm);
    setIsSaving(false);
    if (success) {
      updateUser(identityForm);
      toast("success", "Profil mis à jour.");
      goMain();
    } else {
      toast("error", "Erreur lors de la mise à jour du profil.");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast("error", "Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast(
        "error",
        "Le nouveau mot de passe doit faire au moins 8 caractères.",
      );
      return;
    }
    setIsSaving(true);
    const success = await api.updatePassword(passwordForm);
    setIsSaving(false);
    if (success) {
      toast("success", "Mot de passe modifié.");
      setPasswordForm({ current: "", new: "", confirm: "" });
      goMain();
    } else {
      toast("error", "Mot de passe actuel incorrect.");
    }
  };

  const handleSavePrefs = async () => {
    setIsSaving(true);
    const saved = await api.updateNotificationPreferences(prefs);
    setIsSaving(false);
    if (saved) {
      setPrefs(saved);
      setPrefsDirty(false);
      toast("success", "Préférences enregistrées.");
    } else {
      toast("error", "Impossible d'enregistrer les préférences.");
    }
  };

  const togglePref = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setPrefsDirty(true);
  };

  const legalContext = {
    cityName: cityName || user?.cityId,
    dataRetentionPolicy,
  };

  const menuItems = [
    {
      id: "identity" as SubView,
      label: "Informations personnelles",
      icon: UserIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "security" as SubView,
      label: "Sécurité & accès",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "notifications" as SubView,
      label: "Préférences alertes",
      icon: Bell,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "help" as SubView,
      label: "Assistance Municip'All",
      icon: HelpCircle,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: "legal" as SubView,
      label: "Informations légales",
      icon: Scale,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
    },
  ];

  const notificationItems: Array<{
    key: keyof NotificationPreferences;
    title: string;
    desc: string;
  }> = [
    {
      key: "moderationAlerts",
      title: "Alertes de modération",
      desc: "Nouveaux signalements nécessitant une attention immédiate.",
    },
    {
      key: "contactInbox",
      title: "Messages contact mairie",
      desc: "Nouvelles demandes citoyennes dans la boîte de réception.",
    },
    {
      key: "weeklyReports",
      title: "Rapports hebdomadaires",
      desc: "Synthèse IA de la satisfaction citoyenne chaque lundi.",
    },
    {
      key: "teamActivity",
      title: "Activité équipe",
      desc: "Résumé des actions des agents (maires et responsables).",
    },
    {
      key: "citizenEngagement",
      title: "Engagement citoyen",
      desc: "Notifications lors de nouvelles suggestions ou participations.",
    },
    {
      key: "systemMaintenance",
      title: "Maintenance & système",
      desc: "Mises à jour critiques et sécurité du backoffice.",
    },
  ];

  return (
    <PageShell>
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        {activeSubView === "main" && (
          <div className="fade-in">
            <ProfileSubHeader
              title="Mon profil"
              subtitle="Paramètres personnels"
              showBack={false}
              onBack={goMain}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-10">
              <div className="space-y-6">
                <div className="card-premium flex flex-col items-center p-10">
                  <div className="relative mb-8">
                    <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--card)] bg-zinc-100 shadow-2xl dark:bg-zinc-800">
                      {user?.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt="Profil"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserIcon className="h-20 w-20 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-[18px] border-4 border-[var(--card)] bg-[var(--accent)] text-white shadow-xl transition-transform hover:scale-110 disabled:opacity-50"
                      aria-label="Changer la photo"
                    >
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <h2 className="mb-1 text-2xl font-black text-[var(--foreground)]">
                    {user?.name} {user?.surname}
                  </h2>
                  <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    {roleLabel(user?.role || "agent")}
                  </p>
                  <div className="w-full space-y-4 border-t border-[var(--card-border)] pt-8">
                    <div className="flex items-center gap-4 text-[var(--muted)]">
                      <Building className="h-5 w-5 opacity-40" />
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {cityName || user?.cityId || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[var(--muted)]">
                      <Mail className="h-5 w-5 opacity-40" />
                      <span className="text-xs font-bold">{user?.email}</span>
                    </div>
                  </div>
                  {stats && (
                    <div className="mt-6 grid w-full grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[var(--accent)]/5 p-4 text-center">
                        <p className="text-2xl font-black text-[var(--accent)]">
                          {stats.reports}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          Signalements
                        </p>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/5 p-4 text-center">
                        <p className="text-2xl font-black text-emerald-600">
                          {stats.points}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          Points
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="group flex w-full items-center justify-center gap-3 rounded-[28px] border border-red-500/20 bg-red-500/10 py-5 text-sm font-black text-red-500 shadow-lg shadow-red-500/10 transition-all hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
                  Se déconnecter
                </button>
              </div>

              <div className="min-w-0 space-y-8">
                <div className="card-premium p-4">
                  {menuItems.map((item, i, arr) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSubView(item.id)}
                      className={clsx(
                        "group flex w-full items-center justify-between rounded-[28px] p-6 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                        i !== arr.length - 1 &&
                          "mb-1 border-b border-[var(--card-border)]",
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-[22px] border border-white/20 shadow-sm ${item.bg} ${item.color} transition-all group-hover:scale-110`}
                        >
                          <item.icon className="h-7 w-7" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-[var(--foreground)]">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="h-6 w-6 text-zinc-300 transition-all group-hover:translate-x-1 group-hover:text-[var(--accent)]" />
                    </button>
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-[38px] bg-[var(--accent)] p-10 text-white shadow-2xl shadow-[var(--accent)]/30">
                  <div className="relative z-10">
                    <h3 className="mb-3 text-2xl font-black">
                      Besoin d&apos;aide ?
                    </h3>
                    <p className="mb-8 max-w-sm text-sm font-medium leading-relaxed text-white/70">
                      Consultez la documentation ou contactez le support
                      technique dédié.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveSubView("help")}
                        className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black text-[var(--accent)] shadow-xl transition-all hover:scale-105 active:scale-95"
                      >
                        <Globe className="h-5 w-5" />
                        Centre d&apos;aide
                      </button>
                      <a
                        href="mailto:support@municipall.dev"
                        className="flex items-center gap-3 rounded-2xl border border-white/30 px-6 py-4 text-sm font-black text-white transition-all hover:bg-white/10"
                      >
                        <Mail className="h-5 w-5" />
                        support@municipall.dev
                      </a>
                    </div>
                  </div>
                  <HelpCircle className="absolute -bottom-12 -right-12 h-64 w-64 rotate-12 text-white/10" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "identity" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title="Informations"
              subtitle="Profil agent"
              onBack={goMain}
              showSave
              saving={isSaving}
              onSave={handleUpdateIdentity}
            />
            <div className="card-premium space-y-10 p-12">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={identityForm.name}
                    onChange={(e) =>
                      setIdentityForm({ ...identityForm, name: e.target.value })
                    }
                    className="form-input-lg"
                  />
                </div>
                <div>
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={identityForm.surname}
                    onChange={(e) =>
                      setIdentityForm({
                        ...identityForm,
                        surname: e.target.value,
                      })
                    }
                    className="form-input-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    E-mail institutionnel
                  </label>
                  <input
                    type="email"
                    value={identityForm.email}
                    onChange={(e) =>
                      setIdentityForm({
                        ...identityForm,
                        email: e.target.value,
                      })
                    }
                    className="form-input-lg"
                  />
                </div>
              </div>
              <div className="flex gap-5 rounded-[32px] border border-blue-500/20 bg-blue-500/10 p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                  <Building className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-[var(--foreground)]">
                  Votre commune ({cityName || user?.cityId}) et votre rôle (
                  {roleLabel(user?.role || "")}) sont gérés par votre
                  administrateur. Contactez le maire ou Municipall pour toute
                  modification.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "security" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title="Sécurité"
              subtitle="Authentification"
              onBack={goMain}
              showSave
              saving={isSaving}
              onSave={handleUpdatePassword}
            />
            <div className="card-premium mx-auto max-w-2xl space-y-10 p-12">
              <div className="space-y-8">
                <div className="relative group">
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    Mot de passe actuel
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    className="form-input-lg"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-7 top-[52px] text-zinc-400 transition-colors hover:text-[var(--accent)]"
                  >
                    {showPass ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                  </button>
                </div>
                <div className="mx-10 h-px bg-[var(--card-border)] opacity-50" />
                <div>
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    Nouveau mot de passe
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    className="form-input-lg"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-apple-muted opacity-60">
                    Confirmation
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm: e.target.value,
                      })
                    }
                    className="form-input-lg"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="flex gap-5 rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-500">
                    Conseil de sécurité
                  </p>
                  <p className="text-[11px] font-medium leading-relaxed text-[var(--muted)]">
                    Utilisez au moins 8 caractères. Ne réutilisez pas le mot de
                    passe de votre messagerie professionnelle. Déconnectez-vous
                    sur les postes partagés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "notifications" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title="Notifications"
              subtitle="Préférences"
              onBack={goMain}
              showSave={prefsDirty}
              saving={isSaving}
              onSave={handleSavePrefs}
              saveLabel="Enregistrer les préférences"
            />
            <div className="card-premium overflow-hidden p-2">
              {notificationItems.map((item, i, arr) => (
                <div
                  key={item.key}
                  className={clsx(
                    "flex items-center justify-between rounded-[32px] p-8 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                    i !== arr.length - 1 &&
                      "mb-1 border-b border-[var(--card-border)]",
                  )}
                >
                  <div className="max-w-md">
                    <h4 className="mb-1 text-lg font-black tracking-tight text-[var(--foreground)]">
                      {item.title}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-[var(--muted)] opacity-70">
                      {item.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[item.key]}
                    onClick={() => togglePref(item.key)}
                    className={clsx(
                      "relative h-9 w-16 rounded-full shadow-inner transition-all duration-300",
                      prefs[item.key]
                        ? "bg-[var(--accent)]"
                        : "bg-zinc-200 dark:bg-zinc-700",
                    )}
                  >
                    <div
                      className={clsx(
                        "absolute top-1 h-7 w-7 rounded-full bg-white shadow-lg transition-all duration-300",
                        prefs[item.key] ? "left-8" : "left-1",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-[var(--muted)]">
              Les alertes e-mail push navigateur seront prochainement
              disponibles. Vos préférences sont enregistrées sur votre compte.
            </p>
          </div>
        )}

        {activeSubView === "help" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title="Support"
              subtitle="Centre d'aide"
              onBack={goMain}
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {HELP_ARTICLES.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => {
                    setHelpArticleId(article.id);
                    setActiveSubView("help-article");
                  }}
                  className="card-premium group flex h-full flex-col items-start p-10 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/20 bg-purple-500/10 text-purple-500 shadow-sm transition-all group-hover:scale-110">
                    {article.id === "moderation" && (
                      <Shield className="h-8 w-8" />
                    )}
                    {article.id === "config" && (
                      <Smartphone className="h-8 w-8" />
                    )}
                    {article.id === "pulse" && (
                      <BarChart3 className="h-8 w-8" />
                    )}
                    {article.id === "contact" && <Mail className="h-8 w-8" />}
                  </div>
                  <h4 className="mb-3 text-xl font-black tracking-tight text-[var(--foreground)]">
                    {article.title}
                  </h4>
                  <p className="mb-10 flex-1 text-sm font-medium leading-relaxed text-[var(--muted)]">
                    {article.description}
                  </p>
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent)] transition-all group-hover:gap-3">
                    Consulter <ExternalLink className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSubView === "help-article" && helpArticleId && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {(() => {
              const article = getHelpArticle(helpArticleId);
              if (!article) return null;
              return (
                <>
                  <ProfileSubHeader
                    title={article.title}
                    subtitle="Guide"
                    onBack={() => setActiveSubView("help")}
                  />
                  <div className="card-premium space-y-8 p-10">
                    {article.sections.map((section) => (
                      <section key={section.title}>
                        <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-[var(--accent)]">
                          {section.title}
                        </h3>
                        {section.paragraphs?.map((p, i) => (
                          <p
                            key={i}
                            className="mb-2 text-sm font-medium leading-relaxed text-[var(--muted)]"
                          >
                            {p}
                          </p>
                        ))}
                        {section.bullets && (
                          <ul className="list-disc space-y-1 pl-5 text-sm font-medium text-[var(--muted)]">
                            {section.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))}
                    {article.relatedView && onNavigate && (
                      <button
                        type="button"
                        onClick={() => {
                          onNavigate(article.relatedView!);
                          goMain();
                        }}
                        className="btn-primary mt-4"
                      >
                        <Activity className="h-5 w-5" />
                        Ouvrir dans le Panel
                      </button>
                    )}
                    {article.id === "contact" && (
                      <a
                        href="mailto:support@municipall.dev?subject=Support%20Panel%20Municipall"
                        className="btn-secondary mt-4 inline-flex"
                      >
                        <Mail className="h-5 w-5" />
                        Envoyer un e-mail au support
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {activeSubView === "legal" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title="Informations légales"
              subtitle="Conformité & transparence"
              onBack={goMain}
            />
            <div className="card-premium divide-y divide-[var(--card-border)] overflow-hidden">
              {LEGAL_HUB_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setLegalDocId(item.id);
                    setActiveSubView("legal-doc");
                  }}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-[var(--foreground)]">
                        {item.label}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-300" />
                </button>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              Documents également accessibles en page dédiée :{" "}
              <Link
                href="/legal/cgu"
                className="text-[var(--accent)] hover:underline"
              >
                /legal/cgu
              </Link>
            </p>
          </div>
        )}

        {activeSubView === "legal-doc" && legalDocId && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <ProfileSubHeader
              title={getLegalDocument(legalDocId, legalContext).title}
              subtitle="Document légal"
              onBack={() => setActiveSubView("legal")}
            />
            <div className="card-premium p-10">
              <LegalDocumentRenderer
                document={getLegalDocument(legalDocId, legalContext)}
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                href={`/legal/${legalDocId}`}
                target="_blank"
                className="text-sm font-bold text-[var(--accent)] hover:underline"
              >
                Ouvrir dans un nouvel onglet
              </Link>
            </div>
          </div>
        )}

        <p className="mt-16 pb-8 text-center text-[11px] text-[var(--muted)]">
          Municip&apos;All Panel · Session sécurisée ·{" "}
          <button
            type="button"
            onClick={() => setActiveSubView("legal")}
            className="hover:text-[var(--accent)] hover:underline"
          >
            Mentions légales
          </button>
        </p>
      </div>
    </PageShell>
  );
}
