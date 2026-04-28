"use client";

import React, { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Bell, 
  ChevronRight, 
  Camera, 
  LogOut,
  Building,
  Key,
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
    <header className="mb-10 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-4 mb-2">
          {showBack && (
            <button 
              onClick={() => setActiveSubView("main")}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            {subtitle}
          </p>
        </div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">{title}</h1>
      </div>
      {activeSubView !== "main" && (
        <button 
          onClick={activeSubView === "identity" ? handleUpdateIdentity : handleUpdatePassword}
          disabled={isSaving}
          className="btn-primary px-8 py-3 shadow-lg flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Enregistrer
        </button>
      )}
    </header>
  );

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar bg-[#F2F2F7]">
      <div className="max-w-4xl mx-auto">
        
        {activeSubView === "main" && (
          <>
            {renderHeader("Mon Profil Agent", "Paramètres Personnel", false)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="card-panel p-8 flex flex-col items-center">
                  <div className="relative group mb-6">
                    <div className="w-32 h-32 rounded-full bg-zinc-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-16 h-16 text-zinc-300" />
                      )}
                    </div>
                    <button className="absolute bottom-1 right-1 w-10 h-10 bg-municipall-blue text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transform hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 mb-1">{user?.name} {user?.surname}</h2>
                  <p className="text-sm font-medium text-zinc-400 mb-4">{user?.role || "Agent Municipal"}</p>
                  <div className="w-full pt-6 border-t border-zinc-100/50 space-y-3">
                    <div className="flex items-center gap-3 text-zinc-500"><Building className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wider">{user?.cityId}</span></div>
                    <div className="flex items-center gap-3 text-zinc-500"><Mail className="w-4 h-4" /><span className="text-xs font-semibold">{user?.email}</span></div>
                  </div>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-4 rounded-[24px] bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors border border-red-100/50"><LogOut className="w-5 h-5" />Se déconnecter</button>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="card-panel p-2">
                  {[
                    { id: "identity" as SubView, label: "Informations Personnelles", icon: UserIcon, color: "text-blue-500", bg: "bg-blue-50" },
                    { id: "security" as SubView, label: "Sécurité & Mot de passe", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { id: "notifications" as SubView, label: "Préférences de Notifications", icon: Bell, color: "text-amber-500", bg: "bg-amber-50" },
                    { id: "help" as SubView, label: "Centre d'Aide & Support", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-50" },
                  ].map((item, i, arr) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveSubView(item.id)}
                      className={clsx(
                        "w-full flex items-center justify-between p-5 hover:bg-zinc-50/50 transition-colors group rounded-[24px]",
                        i !== arr.length - 1 && "border-b border-zinc-50/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}><item.icon className="w-6 h-6" /></div>
                        <span className="font-bold text-zinc-800 text-lg">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </button>
                  ))}
                </div>
                <div className="bg-municipall-blue rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
                    <p className="text-white/70 text-sm mb-6 leading-relaxed">Consultez notre documentation complète ou contactez le support technique de Municip'All.</p>
                    <button className="bg-white text-municipall-blue px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-zinc-100 transition-colors flex items-center gap-2"><Globe className="w-4 h-4" />Documentation</button>
                  </div>
                  <HelpCircle className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeSubView === "identity" && (
          <>
            {renderHeader("Informations", "Profil Agent")}
            <div className="card-panel p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Prénom</label>
                  <input type="text" value={identityForm.name} onChange={e => setIdentityForm({...identityForm, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nom de famille</label>
                  <input type="text" value={identityForm.surname} onChange={e => setIdentityForm({...identityForm, surname: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Email Institutionnel</label>
                  <input type="email" value={identityForm.email} onChange={e => setIdentityForm({...identityForm, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                </div>
              </div>
              <div className="p-6 bg-blue-50/50 rounded-[28px] border border-blue-100/50 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><Building className="w-5 h-5 text-municipall-blue" /></div>
                <p className="text-sm text-zinc-600 leading-relaxed">Votre <strong>CityID</strong> est lié à votre collectivité territoriale. Seul un administrateur système peut modifier cette information.</p>
              </div>
            </div>
          </>
        )}

        {activeSubView === "security" && (
          <>
            {renderHeader("Sécurité", "Mot de passe")}
            <div className="card-panel p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Mot de passe actuel</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-12 text-zinc-400">{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                <div className="h-px bg-zinc-100 mx-10"></div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Nouveau mot de passe</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-1">Confirmer le nouveau mot de passe</label>
                  <input type={showPass ? "text" : "password"} value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg" />
                </div>
              </div>
              <div className="p-6 bg-amber-50/50 rounded-[28px] border border-amber-100/50 flex gap-4">
                <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-amber-900 text-sm mb-1">Conseil de sécurité</p>
                  <p className="text-xs text-amber-800 leading-relaxed">Utilisez au moins 8 caractères, incluant des majuscules, des chiffres et des symboles pour une protection maximale.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSubView === "notifications" && (
          <>
            {renderHeader("Notifications", "Préférences")}
            <div className="card-panel p-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {[
                { title: "Alertes de Modération", desc: "Être notifié lorsqu'un nouveau signalement nécessite une attention immédiate.", active: true },
                { title: "Rapports hebdomadaires", desc: "Recevoir par mail la synthèse IA de la satisfaction citoyenne chaque lundi.", active: true },
                { title: "Nouveaux inscrits", desc: "Recevoir une notification lors de l'inscription d'un nouveau citoyen dans la ville.", active: false },
                { title: "Alertes Système", desc: "Maintenance prévue, mises à jour critiques et sécurité du backoffice.", active: true },
              ].map((item, i, arr) => (
                <div key={i} className={clsx("flex items-center justify-between p-6", i !== arr.length -1 && "border-b border-zinc-50")}>
                  <div className="max-w-md">
                    <h4 className="font-bold text-zinc-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-zinc-500 leading-snug">{item.desc}</p>
                  </div>
                  <button className={clsx("w-14 h-8 rounded-full relative transition-colors duration-300", item.active ? "bg-municipall-blue" : "bg-zinc-200")}>
                    <div className={clsx("absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300", item.active ? "left-7" : "left-1")} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeSubView === "help" && (
          <>
            {renderHeader("Support", "Centre d'aide")}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {[
                { title: "Guide de Modération", icon: Shield, desc: "Apprenez à utiliser la console de modération efficacement." },
                { title: "Configuration Widgets", icon: Smartphone, desc: "Comment intégrer les widgets sur votre site web communal." },
                { title: "Gestion de l'IA", icon: Loader2, desc: "Comprendre comment l'IA analyse le sentiment citoyen." },
                { title: "Contact Support", icon: Mail, desc: "Ouvrir un ticket pour un problème technique ou administratif." },
              ].map((item, i) => (
                <button key={i} className="card-panel p-8 text-left hover:scale-[1.02] transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-400 flex items-center justify-center mb-6 group-hover:bg-municipall-blue group-hover:text-white transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-zinc-900 mb-2 text-lg">{item.title}</h4>
                  <p className="text-sm text-zinc-500 mb-6">{item.desc}</p>
                  <span className="text-municipall-blue font-bold text-sm flex items-center gap-2">Consulter l'article <ExternalLink className="w-4 h-4" /></span>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-12 pb-10">
          Municip'All Core v1.4.2 • Session Sécurisée
        </p>
      </div>
    </div>
  );
}
