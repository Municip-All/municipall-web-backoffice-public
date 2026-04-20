"use client";

import React, { useState } from "react";
import { PaintBucket, Image as ImageIcon, Type, Save, CheckCircle2, MapPin, Bell, Calendar, UserRound } from "lucide-react";
import clsx from "clsx";

export default function WhiteLabelSettings() {
  const [appName, setAppName] = useState("Bouffémont en poche");
  const [primaryColor, setPrimaryColor] = useState("#0B0080"); // Default navy
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5"); // Default indigo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const predefinedColors = [
    { name: "Navy", hex: "#0B0080" },
    { name: "Emerald", hex: "#059669" },
    { name: "Crimson", hex: "#DC2626" },
    { name: "Amber", hex: "#D97706" },
    { name: "Sky", hex: "#0284C7" }
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
            Marque Blanche & Application
          </h2>
          <p className="text-sm text-gray-500">Personnalisez l'identité visuelle de l'application citoyenne selon la charte graphique de votre commune.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary py-2.5 px-6 shadow-sm shadow-municipall-blue/20"
        >
          {isSaving ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Publié</>
          ) : (
            <><Save className="w-4 h-4" /> Publier les changements</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Identité de l'Application */}
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-municipall-blue" />
              Identité de l'Application
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom de l'Application</label>
                <input 
                  type="text" 
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Ex: Ma Ville en poche" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-4 py-3 focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue/50 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Ce nom sera affiché sur les stores (iOS/Android) et sur l'écran d'accueil du téléphone.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Logo de la Commune</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer text-xs font-bold bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors inline-block text-center w-full">
                      Téléverser une image
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center px-1">Format recommandé : PNG transparent, 512x512</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charte Graphique */}
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PaintBucket className="w-5 h-5 text-municipall-blue" />
              Charte Graphique
            </h3>

            <div className="flex flex-col gap-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Couleur Primaire Globale</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Color Picker Native */}
                  <div className="relative group shrink-0">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 p-0 overflow-hidden" 
                    />
                  </div>

                  {/* Predefined swatches */}
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    {predefinedColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setPrimaryColor(color.hex)}
                        title={color.name}
                        className={clsx(
                          "w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform border-2",
                          primaryColor === color.hex ? "border-gray-900 scale-110" : "border-white"
                        )}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Cette couleur s'appliquera principalement aux boutons d'actions, aux en-têtes et aux icônes principales de l'application citoyenne.</p>
              </div>
              
              <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-bold text-gray-700 mb-3">Couleur Secondaire (Accents)</label>
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <input 
                      type="color" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 p-0 overflow-hidden" 
                    />
                  </div>
                  <span className="text-sm font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded">{secondaryColor.toUpperCase()}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Aperçu en direct */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-panel p-6 flex flex-col items-center sticky top-8">
            <h3 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wider text-center w-full pb-3 border-b border-gray-100">
              Aperçu en Direct
            </h3>
            
            <div className="w-[290px] h-[600px] bg-gray-900 rounded-[45px] p-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] relative border-[6px] border-gray-800 shrink-0 mx-auto">
              {/* Contenu de l'écran Mobile */}
              <div className="w-full h-full bg-[#fdfdfd] rounded-[32px] overflow-hidden relative flex flex-col">
                {/* Notch UI */}
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl mx-16 z-20"></div>
                
                {/* Mobile Header Custom */}
                <div 
                  className="pt-12 px-5 pb-6 text-white rounded-b-[2rem] transition-colors duration-300"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden border border-white/30">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain drop-shadow" />
                      ) : (
                        <span className="text-white font-bold text-lg">M</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Bienvenue sur</p>
                      <h4 className="font-bold text-[15px] truncate max-w-[160px] leading-tight">
                        {appName || "Application"}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Mobile Body */}
                <div className="flex-1 px-4 pt-6 pb-20 overflow-y-auto custom-scrollbar relative z-10 flex flex-col gap-4">
                  
                  {/* Alert Banner mock */}
                  <div 
                    className="rounded-xl p-3 flex items-start gap-3 transition-colors duration-300"
                    style={{ backgroundColor: `${secondaryColor}15`, borderLeft: `4px solid ${secondaryColor}` }}
                  >
                    <Bell className="w-4 h-4 mt-0.5" style={{ color: secondaryColor }} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">Nouvelle alerte travaux</p>
                      <p className="text-[10px] text-gray-600 leading-snug mt-0.5">Route barrée au centre-ville jusqu'à vendredi.</p>
                    </div>
                  </div>

                  <h5 className="font-bold text-gray-900 text-sm mt-2">Mes Démarches</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                         <MapPin className="w-5 h-5" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-700 text-center">Faire un<br/>signalement</span>
                    </div>

                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                         <Calendar className="w-5 h-5" />
                       </div>
                       <span className="text-[11px] font-bold text-gray-700 text-center">Agenda<br/>Culturel</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mt-2 flex flex-col">
                    <h5 className="font-bold text-gray-900 text-sm mb-3">Actualité de la Mairie</h5>
                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end p-2">
                        <span className="text-white text-[10px] font-bold">Fête du village</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mobile Tabbar Bottom */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-20">
                  <div className="flex flex-col items-center gap-1" style={{ color: primaryColor }}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-current opacity-20 blur-md rounded-full transform scale-150"></div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <span className="text-[8px] font-bold">Accueil</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <MapPin className="w-5 h-5" />
                    <span className="text-[8px] font-medium">Carte</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <UserRound className="w-5 h-5" />
                    <span className="text-[8px] font-medium">Profil</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
