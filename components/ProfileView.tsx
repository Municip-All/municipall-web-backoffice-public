"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  Save,
  Loader2,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";
import PageShell from "@/components/PageShell";

type SubView = "main" | "identity" | "security" | "notifications" | "help";

export default function ProfileView() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const [activeSubView, setActiveSubView] = useState<SubView>("main");
  const [isSaving, setIsSaving] = useState(false);

  // Identity Form State
  const [identityForm, setIdentityForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);

  const handleUpdateIdentity = async () => {
    if (!identityForm.name || !identityForm.email) {
      toast("error", "Le nom et l'email sont obligatoires.");
      return;
    }

    setIsSaving(true);
    const success = await api.updateProfile(identityForm);
    if (success) {
      updateUser(identityForm);
      toast("success", "Profil mis à jour avec succès !");
      setActiveSubView("main");
    } else {
      toast("error", "Erreur lors de la mise à jour du profil.");
    }
    setIsSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast("error", "Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast("error", "Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setIsSaving(true);
    const success = await api.updatePassword(passwordForm);
    if (success) {
      toast("success", "Mot de passe modifié avec succès !");
      setPasswordForm({ current: "", new: "", confirm: "" });
      setActiveSubView("main");
    } else {
      toast("error", "Le mot de passe actuel est incorrect.");
    }
    setIsSaving(false);
  };

  const renderHeader = (title: string, subtitle: string, showBack = true) => (
    <header className="mb-12 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-4 mb-3">
          {showBack && (
            <button 
              onClick={() => setActiveSubView("main")}
              className="w-11 h-11 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-apple-muted opacity-60">
            {subtitle}
          </p>
        </div>
        <h1 className="text-apple-title">{title}</h1>
      </div>
      {activeSubView !== "main" && (
        <button 
          onClick={activeSubView === "identity" ? handleUpdateIdentity : handleUpdatePassword}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer
        </button>
      )}
    </header>
  );

  return (
    <PageShell>
      <div className="w-full">
        {activeSubView === "main" && (
          <div className="fade-in">
            {renderHeader("Mon Profil Agent", "Paramètres Personnels", false)}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-10">
              <div className="space-y-6">
                <div className="card-premium p-10 flex flex-col items-center">
                  <div className="relative group mb-8">
                    <div className="w-36 h-36 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-[var(--card)] shadow-2xl overflow-hidden relative flex items-center justify-center group-hover:scale-105 transition-transform">
                      {user?.avatar_url ? (
                        <Image src={user.avatar_url} alt="Profile" fill className="object-cover" />
                      ) : (
                        <UserIcon className="w-20 h-20 text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>
                    <button className="absolute bottom-2 right-2 w-11 h-11 bg-[var(--accent)] text-white rounded-[18px] flex items-center justify-center shadow-xl border-4 border-[var(--card)] transform hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-2xl font-black text-[var(--foreground)] mb-1">{user?.name} {user?.surname}</h2>
                  <p className="text-[10px] font-black text-apple-muted opacity-60 uppercase tracking-[0.2em] mb-6">{user?.role || "Agent Municipal"}</p>
                  <div className="w-full pt-8 border-t border-[var(--card-border)] space-y-4">
                    <div className="flex items-center gap-4 text-[var(--muted)]"><Building className="w-5 h-5 opacity-40" /><span className="text-[11px] font-black uppercase tracking-widest">{user?.cityId}</span></div>
                    <div className="flex items-center gap-4 text-[var(--muted)]"><Mail className="w-5 h-5 opacity-40" /><span className="text-xs font-bold">{user?.email}</span></div>
                  </div>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-5 rounded-[28px] bg-red-500/10 text-red-500 font-black text-sm hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-lg shadow-red-500/10 group">
                  <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Se déconnecter
                </button>
              </div>

              <div className="min-w-0 space-y-8">
                <div className="card-premium p-4">
                  {[
                    { id: "identity" as SubView, label: "Informations Personnelles", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { id: "security" as SubView, label: "Sécurité & Accès", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { id: "notifications" as SubView, label: "Préférences Alertes", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { id: "help" as SubView, label: "Assistance Municip'All", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
                  ].map((item, i, arr) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveSubView(item.id)}
                      className={clsx(
                        "w-full flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group rounded-[28px]",
                        i !== arr.length - 1 && "border-b border-[var(--card-border)] mb-1"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-[22px] ${item.bg} ${item.color} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-white/20`}><item.icon className="w-7 h-7" /></div>
                        <span className="font-black text-[var(--foreground)] text-lg tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
                <div className="bg-[var(--accent)] rounded-[38px] p-10 text-white relative overflow-hidden shadow-2xl shadow-[var(--accent)]/30">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-3">Besoin d&apos;aide ?</h3>
                    <p className="text-white/70 text-sm mb-8 leading-relaxed font-medium max-w-sm">Consultez notre base de connaissance ou contactez notre support technique dédié.</p>
                    <button className="bg-white text-[var(--accent)] px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      Documentation
                    </button>
                  </div>
                  <HelpCircle className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "identity" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {renderHeader("Informations", "Profil Agent")}
            <div className="card-premium p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">PRÉNOM</label>
                  <input type="text" value={identityForm.name} onChange={e => setIdentityForm({...identityForm, name: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">NOM DE FAMILLE</label>
                  <input type="text" value={identityForm.surname} onChange={e => setIdentityForm({...identityForm, surname: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">EMAIL INSTITUTIONNEL</label>
                  <input type="email" value={identityForm.email} onChange={e => setIdentityForm({...identityForm, email: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                </div>
              </div>
              <div className="p-8 bg-blue-500/10 rounded-[32px] border border-blue-500/20 flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30"><Building className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium">Votre <strong>CityID</strong> est lié à votre collectivité territoriale. Seul un administrateur système peut modifier cette information critique.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "security" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {renderHeader("Sécurité", "Authentification")}
            <div className="card-premium mx-auto max-w-2xl space-y-10 p-12">
              <div className="space-y-8">
                <div className="relative group">
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">MOT DE PASSE ACTUEL</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-7 top-[52px] text-zinc-400 hover:text-[var(--accent)] transition-colors">{showPass ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}</button>
                </div>
                <div className="h-px bg-[var(--card-border)] mx-10 opacity-50"></div>
                <div>
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">NOUVEAU MOT DE PASSE</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-apple-muted uppercase tracking-[0.2em] mb-4 opacity-60">CONFIRMATION</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] rounded-[22px] px-7 py-5 outline-none transition-all font-bold text-lg shadow-sm" />
                </div>
              </div>
              <div className="p-8 bg-amber-500/10 rounded-[32px] border border-amber-500/20 flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30"><Lock className="w-6 h-6" /></div>
                <div>
                  <p className="font-black text-amber-500 text-xs mb-2 uppercase tracking-widest">Conseil de sécurité</p>
                  <p className="text-[11px] text-[var(--muted)] font-medium leading-relaxed">Utilisez au moins 8 caractères, incluant des majuscules, des chiffres et des symboles.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubView === "notifications" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {renderHeader("Notifications", "Préférences")}
            <div className="card-premium overflow-hidden p-2">
              {[
                { title: "Alertes de Modération", desc: "Nouveaux signalements nécessitant une attention immédiate.", active: true },
                { title: "Rapports Hebdomadaires", desc: "Synthèse IA de la satisfaction citoyenne chaque lundi.", active: true },
                { title: "Engagement Citoyen", desc: "Notifications lors de nouvelles suggestions d'idées.", active: false },
                { title: "Maintenance & Système", desc: "Mises à jour critiques et sécurité du backoffice.", active: true },
              ].map((item, i, arr) => (
                <div key={i} className={clsx("flex items-center justify-between p-8 rounded-[32px] hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all", i !== arr.length -1 && "border-b border-[var(--card-border)] mb-1")}>
                  <div className="max-w-md">
                    <h4 className="font-black text-[var(--foreground)] text-lg mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-sm text-[var(--muted)] font-medium leading-relaxed opacity-70">{item.desc}</p>
                  </div>
                  <button className={clsx("w-16 h-9 rounded-full relative transition-all duration-500 shadow-inner", item.active ? "bg-[var(--accent)]" : "bg-zinc-200 dark:bg-zinc-700")}>
                    <div className={clsx("absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-500 transform", item.active ? "left-8" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubView === "help" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {renderHeader("Support", "Centre d'aide")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Guide de Modération", icon: Shield, desc: "Maîtrisez la console de modération IA.", color: "text-blue-500", bg: "bg-blue-500/10" },
                { title: "Configuration App", icon: Smartphone, desc: "Personnalisez votre application mobile.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { title: "Analyse Municip'All Pulse", icon: Loader2, desc: "Comprendre les indicateurs de satisfaction.", color: "text-purple-500", bg: "bg-purple-500/10" },
                { title: "Contactez-nous", icon: Mail, desc: "Support technique disponible 24/7.", color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((item, i) => (
                <button key={i} className="card-premium p-10 text-left hover:scale-[1.02] transition-all group flex flex-col items-start h-full">
                  <div className={`w-16 h-16 rounded-[24px] ${item.bg} ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-all border border-white/20 shadow-sm`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-[var(--foreground)] mb-3 text-xl tracking-tight">{item.title}</h4>
                  <p className="text-sm text-[var(--muted)] font-medium leading-relaxed mb-10 flex-1">{item.desc}</p>
                  <span className="text-[var(--accent)] font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Consulter <ExternalLink className="w-4 h-4" /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-16 pb-8 text-center text-[11px] text-[var(--muted)]">
          Municip&apos;All Panel · Session sécurisée
        </p>
      </div>
    </PageShell>
  );
}
