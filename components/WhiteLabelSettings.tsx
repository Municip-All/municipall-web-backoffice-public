"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  PaintBucket,
  Image as ImageIcon,
  Type,
  Save,
  CheckCircle2,
  MapPin,
  Bell,
  Calendar,
  UserRound,
  Loader2,
  Building2,
  LayoutDashboard,
  Mail,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import ColorHexField from "@/components/ColorHexField";
import { getOnPrimaryColor, isPrimaryReadableOnWhite } from "@/lib/brandUtils";

export default function WhiteLabelSettings() {
  const { user } = useAuth();
  const toast = useToast();
  const [appName, setAppName] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0B0080");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [backgroundColorLight, setBackgroundColorLight] = useState("#F2F2F7");
  const [backgroundColorDark, setBackgroundColorDark] = useState("#000000");
  const [useGradient, setUseGradient] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactHelpText, setContactHelpText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user?.cityId) {
        setIsLoading(false);
        return;
      }
      api
        .getCityConfig(user.cityId)
        .then((config) => {
          if (config) {
            setAppName(config.name || "");
            setOfficialName(config.officialName || config.name || "");
            setPrimaryColor(config.theme.primaryColor || "#0B0080");
            setSecondaryColor(config.theme.secondaryColor || "#4F46E5");
            setBackgroundColorLight(
              config.theme.backgroundColorLight || "#F2F2F7",
            );
            setBackgroundColorDark(
              config.theme.backgroundColorDark || "#000000",
            );
            setUseGradient(config.theme.useGradient ?? false);
            setLogoPreview(config.theme.logoUrl || null);
            setContactEmail(config.contact?.email || "");
            setContactPhone(config.contact?.phone || "");
            setContactHelpText(config.contact?.helpText || "");
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
      const { ok } = await api.saveCityConfig(user.cityId, {
        name: appName,
        primaryColor,
        secondaryColor,
        logoUrl: logoPreview || "",
        backgroundColorLight,
        backgroundColorDark,
        useGradient,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        contactHelpText: contactHelpText.trim() || undefined,
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
    { name: "Sky", hex: "#0284C7" },
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
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Publié
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Publier les changements
                  </>
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
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">
                      NOM AFFICHÉ DANS L&apos;APP
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Ex: KB'App, Ma Ville en poche…"
                      className="form-input-sm"
                    />
                    <p className="text-[11px] text-[var(--muted)] mt-4 leading-relaxed">
                      Titre sur l&apos;écran d&apos;accueil mobile (marque
                      blanche). Ce n&apos;est pas le nom géographique de la
                      commune.
                    </p>
                    {officialName && officialName !== appName && (
                      <p className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 text-[11px] font-medium text-[var(--muted)] dark:bg-zinc-800/60">
                        Commune officielle (cartes &amp; géoloc.) :{" "}
                        <strong className="text-[var(--foreground)]">
                          {officialName}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">
                      LOGO DE LA COMMUNE
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-700 relative shrink-0">
                        {logoPreview ? (
                          <div className="relative w-full h-full p-2">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-zinc-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] py-3 px-5 rounded-[18px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all inline-block text-center w-full font-black text-xs shadow-sm">
                          Téléverser
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                        <p className="text-[9px] text-[var(--muted)] mt-3 text-center font-bold">
                          PNG transparent, 512x512
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-premium p-10">
                <h3 className="text-xl font-black text-[var(--foreground)] mb-8 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[var(--accent)]" />
                  Page Contact (application mobile)
                </h3>
                <p className="text-sm text-[var(--muted)] mb-8 leading-relaxed">
                  Ces informations s&apos;affichent dans la section
                  &laquo;&nbsp;Besoin d&apos;aide&nbsp;&raquo; de l&apos;app
                  citoyenne.
                </p>
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">
                      E-MAIL DE LA MAIRIE
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="mairie@ville.fr"
                      className="form-input-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">
                      TÉLÉPHONE
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="01 23 45 67 89"
                      className="form-input-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-apple-muted mb-4 opacity-60">
                      TEXTE D&apos;INTRODUCTION
                    </label>
                    <textarea
                      value={contactHelpText}
                      onChange={(e) => setContactHelpText(e.target.value)}
                      placeholder="Notre équipe est à votre disposition..."
                      rows={3}
                      className="form-input-sm resize-none"
                    />
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
                    <label className="block text-[10px] font-black text-apple-muted mb-5 opacity-60">
                      COULEUR PRIMAIRE GLOBALE
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-16 h-16 rounded-[22px] cursor-pointer border-4 border-white dark:border-zinc-800 shadow-xl p-0 overflow-hidden"
                        />
                      </div>
                      <div className="surface-subtle flex items-center gap-3 p-2 rounded-[24px]">
                        {predefinedColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setPrimaryColor(color.hex)}
                            className={clsx(
                              "w-10 h-10 rounded-full transition-all border-4",
                              primaryColor === color.hex
                                ? "border-white dark:border-zinc-400 scale-110 shadow-lg"
                                : "border-transparent opacity-60 hover:opacity-100",
                            )}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                    {!isPrimaryReadableOnWhite(primaryColor) && (
                      <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                        Cette couleur est très claire : les boutons et liens
                        resteront lisibles grâce à un texte automatique sombre,
                        mais préférez une teinte plus soutenue pour un rendu
                        harmonieux.
                      </p>
                    )}
                  </div>

                  <div className="pt-8 border-t border-[var(--card-border)]">
                    <ColorHexField
                      label="COULEUR SECONDAIRE (ACCENTS)"
                      value={secondaryColor}
                      onChange={setSecondaryColor}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-8 pt-8 border-t border-[var(--card-border)] md:grid-cols-2">
                    <ColorHexField
                      label="FOND DE L'APP (MODE CLAIR)"
                      value={backgroundColorLight}
                      onChange={setBackgroundColorLight}
                    />
                    <ColorHexField
                      label="FOND DE L'APP (MODE SOMBRE)"
                      value={backgroundColorDark}
                      onChange={setBackgroundColorDark}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">
                    Couleur d&apos;arrière-plan des écrans dans l&apos;application
                    mobile. Les citoyens qui activent le mode sombre verront le
                    fond sombre ; les autres verront le fond clair.
                  </p>

                  <div className="pt-8 border-t border-[var(--card-border)]">
                    <label className="flex cursor-pointer items-center justify-between gap-4">
                      <div>
                        <span className="block text-[10px] font-black text-apple-muted opacity-60">
                          DÉGRADÉ D&apos;ACCUEIL
                        </span>
                        <span className="mt-1 block text-xs text-[var(--muted)]">
                          Halo coloré discret sur les écrans de connexion (sans
                          modifier la structure de l&apos;app).
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={useGradient}
                        onChange={(e) => setUseGradient(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-[var(--accent)]"
                      />
                    </label>
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
                  <div
                    className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col"
                    style={{ backgroundColor: backgroundColorLight }}
                  >
                    <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 rounded-b-[24px] mx-20 z-20"></div>

                    <div
                      className="pt-14 px-6 pb-8 rounded-b-[3rem] transition-all duration-700"
                      style={{
                        backgroundColor: primaryColor,
                        color: getOnPrimaryColor(primaryColor),
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center p-2 shrink-0 border border-white/30 relative">
                          {logoPreview ? (
                            <Image
                              src={logoPreview}
                              alt="Logo"
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <Building2 className="text-white w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-white/70 font-black uppercase tracking-widest">
                            Ma Ville
                          </p>
                          <h4 className="font-black text-lg truncate max-w-[160px] leading-tight">
                            {appName || "Application"}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 px-5 pt-8 pb-20 relative z-10 space-y-6">
                      <div
                        className="rounded-3xl p-4 flex items-start gap-4 transition-all duration-500 shadow-sm"
                        style={{
                          backgroundColor: `${secondaryColor}10`,
                          borderLeft: `6px solid ${secondaryColor}`,
                        }}
                      >
                        <Bell
                          className="w-5 h-5 mt-1"
                          style={{ color: secondaryColor }}
                        />
                        <div>
                          <p className="text-xs font-black text-zinc-900">
                            Information Travaux
                          </p>
                          <p className="text-[10px] text-zinc-600 font-medium leading-relaxed mt-1">
                            Nouveaux chantiers planifiés dans votre quartier.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Signalement", icon: MapPin },
                          { label: "Collecte", icon: Calendar },
                        ].map((btn, i) => (
                          <div
                            key={i}
                            className="bg-white border border-zinc-100 shadow-sm rounded-3xl p-5 flex flex-col items-center gap-3"
                          >
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                              style={{
                                backgroundColor: `${primaryColor}10`,
                                color: primaryColor,
                              }}
                            >
                              <btn.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-zinc-800">
                              {btn.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-t border-zinc-100 flex items-center justify-around px-4 z-20">
                      <div
                        className="flex flex-col items-center gap-1.5"
                        style={{ color: primaryColor }}
                      >
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
