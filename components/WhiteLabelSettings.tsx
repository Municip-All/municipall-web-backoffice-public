"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PaintBucket, Image as ImageIcon, Type, Save, CheckCircle2, MapPin, Bell, Calendar, UserRound, Loader2, Building2, LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";

export default function WhiteLabelSettings() {
  const { user } = useAuth();
  const toast = useToast();
  const [appName, setAppName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0B0080");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user?.cityId) {
        setIsLoading(false);
        return;
      }
      api.getCityConfig(user.cityId)
        .then(config => {
          if (config) {
            setAppName(config.name || "");
            setPrimaryColor(config.theme.primaryColor || "#0B0080");
            setSecondaryColor(config.theme.secondaryColor || "#4F46E5");
            setLogoPreview(config.theme.logoUrl || null);
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.cityId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.cityId) return;
    setIsSaving(true);
    try {
      const ok = await api.saveCityConfig(user.cityId, {
        name: appName,
        primaryColor,
        secondaryColor,
        logoUrl: logoPreview || '',
        useGradient: false,
      });
      if (ok) {
        toast("success", "Paramètres publiés avec succès !");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast("error", "Échec de la mise à jour. Réessayez.");
      }
    } catch {
      toast("error", "Impossible de contacter le serveur.");
    } finally {
      setIsSaving(false);
    }
  };

  const predefinedColors = [
    { name: "Navy", hex: "#0B0080" },
    { name: "Emerald", hex: "#059669" },
    { name: "Crimson", hex: "#DC2626" },
    { name: "Amber", hex: "#D97706" },
    { name: "Sky", hex: "#0284C7" }
  ];

  return (
    <PageShell>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] opacity-40" />
        </div>
      ) : (
        <>
          <PageHeader
            title="Configuration ville"
            description="Identité visuelle · Marque blanche"
            actions={
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary"
              >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saved ? (
                <><CheckCircle2 className="w-5 h-5" /> Publié</>
              ) : (
                <><Save className="w-5 h-5" /> Publier les changements</>
              )}
            </button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div className="card-premium p-10">
                <h3 className="text-xl font-black text-[var(--foreground)] mb-8 flex items-center gap-3">
                  <Type className="w-6 h-6 text-[var(--accent)]" />
                  Identité de l&apos;Application
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">NOM DE L&apos;APPLICATION</label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Ex: Ma Ville en poche"
                      className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-[var(--accent)] text-[var(--foreground)] text-sm rounded-[20px] px-5 py-4 outline-none transition-all font-bold"
                    />
                    <p className="text-[11px] text-[var(--muted)] mt-4 leading-relaxed">S&apos;affichera sur les stores et l&apos;écran d&apos;accueil.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">LOGO DE LA COMMUNE</label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-700 relative shrink-0">
                        {logoPreview ? (
                          <div className="relative w-full h-full p-2">
                            <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] py-3 px-5 rounded-[18px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all inline-block text-center w-full font-black text-xs shadow-sm">
                          Téléverser
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                        <p className="text-[9px] text-[var(--muted)] mt-3 text-center font-bold">PNG transparent, 512x512</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-premium p-10">
                <h3 className="text-xl font-black text-[var(--foreground)] mb-8 flex items-center gap-3">
                  <PaintBucket className="w-6 h-6 text-[var(--accent)]" />
                  Charte Graphique
                </h3>

                <div className="space-y-10">
                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-5 opacity-60">COULEUR PRIMAIRE GLOBALE</label>
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16 h-16 rounded-[22px] cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl p-0 overflow-hidden"
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-[24px] border border-[var(--card-border)]">
                        {predefinedColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setPrimaryColor(color.hex)}
                            className={clsx(
                              "w-10 h-10 rounded-full transition-all border-4",
                              primaryColor === color.hex ? "border-white dark:border-zinc-400 scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[var(--card-border)]">
                    <label className="block text-[10px] font-black text-apple-muted mb-5 opacity-60">COULEUR SECONDAIRE (ACCENTS)</label>
                    <div className="flex items-center gap-5">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-12 rounded-full cursor-pointer border-2 border-white dark:border-zinc-800 shadow-md p-0 overflow-hidden"
                      />
                      <span className="text-sm font-black text-[var(--foreground)] bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full border border-[var(--card-border)]">
                        {secondaryColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card-premium p-10 flex flex-col items-center sticky top-10">
                <h3 className="text-[10px] font-black text-apple-muted mb-10 uppercase tracking-[0.2em] opacity-40">
                  Aperçu App Mobile
                </h3>

                <div className="w-[310px] h-[640px] bg-zinc-900 rounded-[55px] p-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative border-[8px] border-zinc-800 shrink-0 mx-auto">
                  <div className="w-full h-full bg-[#fdfdfd] rounded-[42px] overflow-hidden relative flex flex-col">
                    <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 rounded-b-[24px] mx-20 z-20"></div>

                    <div
                      className="pt-14 px-6 pb-8 text-white rounded-b-[3rem] transition-all duration-700"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center p-2 shrink-0 border border-white/30 relative">
                          {logoPreview ? (
                            <Image src={logoPreview} alt="Logo" fill className="object-contain p-2" />
                          ) : (
                            <Building2 className="text-white w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-white/70 font-black uppercase tracking-widest">Ma Ville</p>
                          <h4 className="font-black text-lg truncate max-w-[160px] leading-tight">
                            {appName || "Application"}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 px-5 pt-8 pb-20 relative z-10 space-y-6">
                      <div
                        className="rounded-3xl p-4 flex items-start gap-4 transition-all duration-500 shadow-sm"
                        style={{ backgroundColor: `${secondaryColor}10`, borderLeft: `6px solid ${secondaryColor}` }}
                      >
                        <Bell className="w-5 h-5 mt-1" style={{ color: secondaryColor }} />
                        <div>
                          <p className="text-xs font-black text-zinc-900">Information Travaux</p>
                          <p className="text-[10px] text-zinc-600 font-medium leading-relaxed mt-1">Nouveaux chantiers planifiés dans votre quartier.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Signalement', icon: MapPin },
                          { label: 'Collecte', icon: Calendar }
                        ].map((btn, i) => (
                          <div key={i} className="bg-white border border-zinc-100 shadow-sm rounded-3xl p-5 flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                              <btn.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-zinc-800">{btn.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-t border-zinc-100 flex items-center justify-around px-4 z-20">
                      <div className="flex flex-col items-center gap-1.5" style={{ color: primaryColor }}>
                        <LayoutDashboard className="w-6 h-6" />
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                      </div>
                      <MapPin className="w-6 h-6 text-zinc-300" />
                      <UserRound className="w-6 h-6 text-zinc-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
