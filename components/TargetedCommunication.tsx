"use client";

import React, { useState, useMemo, useRef } from "react";
import { Send, MapPin, AlertCircle, Info, Radio, Settings, Plus, Trash2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

interface Neighborhood {
  id: string;
  name: string;
  citizens: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

const initialNeighborhoods: Neighborhood[] = [
  { id: "nv", name: "Centre-Ville Historique", citizens: 3120, x: 25, y: 30 },
  { id: "qn", name: "Quartier Nord", citizens: 2450, x: 45, y: 40 },
  { id: "zi", name: "Zone Industrielle", citizens: 890, x: 30, y: 75 },
  { id: "ce", name: "Coteaux Est", citizens: 1840, x: 75, y: 65 },
];

export default function TargetedCommunication() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertType, setAlertType] = useState<"info" | "urgent">("info");
  
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(initialNeighborhoods);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set(["qn"]));
  
  const [isEditing, setIsEditing] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZonePop, setNewZonePop] = useState("");

  const [draggedZoneId, setDraggedZoneId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const toggleZone = (id: string) => {
    if (isEditing) return; // Prevent selection while editing list
    setSelectedZones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addNeighborhood = () => {
    if (!newZoneName.trim() || !newZonePop.trim()) return;
    const pop = parseInt(newZonePop, 10);
    if (isNaN(pop)) return;
    
    const newId = `zone_${Date.now()}`;
    // Placed in the dead center by default for the user to drag
    setNeighborhoods([...neighborhoods, { id: newId, name: newZoneName, citizens: pop, x: 50, y: 50 }]);
    setNewZoneName("");
    setNewZonePop("");
  };

  const removeNeighborhood = (id: string) => {
    setNeighborhoods(neighborhoods.filter(n => n.id !== id));
    setSelectedZones(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (!isEditing) return;
    e.preventDefault();
    setDraggedZoneId(id);
    if (e.target instanceof Element) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditing || !draggedZoneId || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain logic
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setNeighborhoods(prev => prev.map(n => 
      n.id === draggedZoneId ? { ...n, x, y } : n
    ));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedZoneId && e.target instanceof Element) {
      e.target.releasePointerCapture(e.pointerId);
    }
    setDraggedZoneId(null);
  };

  const totalCitizens = useMemo(() => {
    return neighborhoods
      .filter(n => selectedZones.has(n.id))
      .reduce((acc, curr) => acc + curr.citizens, 0);
  }, [selectedZones, neighborhoods]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">
          Communication Directe
        </h2>
        <p className="text-sm text-gray-500">Envoyez des alertes push ciblées directement sur le smartphone des citoyens selon leur position GPS actuelle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Rédiger le message</h3>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'alerte</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Travaux sur le réseau d'eau" 
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-2.5 focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue outline-none transition-all shadow-sm"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Message (Push)</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Détaillez votre message ici..."
                maxLength={250}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-4 py-3 h-28 resize-none focus:ring-1 focus:ring-municipall-blue focus:border-municipall-blue outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
              <span>Le message doit être concis et aller à l'essentiel.</span>
              <span>{message.length}/250 caractères</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Type d'alerte</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAlertType("info")}
                  className={clsx(
                    "flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold transition-all",
                    alertType === "info" 
                      ? "border-gray-900 bg-white shadow-sm text-gray-900" 
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <Info className="w-4 h-4" />
                  Information
                </button>
                <button 
                  onClick={() => setAlertType("urgent")}
                  className={clsx(
                    "flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold transition-all",
                    alertType === "urgent" 
                      ? "border-red-500 bg-red-50 text-red-600 shadow-sm" 
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  Urgence
                </button>
              </div>
            </div>
          </div>

          <div className="card-panel p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Radio className="w-5 h-5 text-municipall-blue" />
              Ciblage géographique GPS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div 
                ref={mapRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className={clsx(
                  "bg-gray-100 rounded-xl h-64 relative overflow-hidden border-2 transition-all",
                  isEditing ? "border-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.3)] touch-none" : "border-gray-200"
                )}
              >
                {isEditing && (
                  <div className="absolute top-2 left-0 right-0 z-20 flex justify-center pointer-events-none">
                    <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-lg border border-indigo-700 animate-pulse">
                      Positionnement des Quartiers Activé
                    </span>
                  </div>
                )}
                
                {/* Bouffémont OpenStreetMap Background */}
                <iframe 
                  src="https://www.openstreetmap.org/export/embed.html?bbox=2.278,49.035,2.315,49.050&layer=mapnik" 
                  className="absolute inset-0 w-full h-full border-none opacity-60 pointer-events-none grayscale-[0.2]"
                  title="Carte de Bouffémont"
                />
                <div className="absolute inset-0 bg-municipall-blue/10 mix-blend-multiply pointer-events-none"></div>

                {/* Draggable/Toggled Zones */}
                {neighborhoods.map(zone => {
                  const isSelected = selectedZones.has(zone.id) && !isEditing;
                  return (
                    <div
                      key={zone.id}
                      onPointerDown={(e) => handlePointerDown(e, zone.id)}
                      className={clsx(
                        "absolute w-20 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm z-10 p-1",
                        isEditing 
                          ? "cursor-grab active:cursor-grabbing border-2 border-indigo-500 bg-white/90 text-indigo-900 shadow-xl scale-110" 
                          : isSelected 
                            ? "bg-municipall-blue/90 border-2 border-municipall-blue text-white" 
                            : "bg-white/80 border-2 border-gray-300 text-gray-500 backdrop-blur-sm"
                      )}
                      style={{ 
                        left: `calc(${zone.x}% - 2.5rem)`, 
                        top: `calc(${zone.y}% - 1.25rem)`,
                        userSelect: 'none'
                      }}
                    >
                      <span className="text-[9px] font-bold text-center leading-tight break-words pointer-events-none">
                        {zone.name.length > 20 ? zone.name.substring(0, 18) + '...' : zone.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-700">{isEditing ? "Gérer les quartiers :" : "Sélectionnez les quartiers :"}</p>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={clsx("text-xs font-semibold flex items-center gap-1 transition-colors outline-none", isEditing ? "text-green-600 hover:text-green-700" : "text-municipall-blue hover:text-indigo-800")}
                    >
                      {isEditing ? <><CheckCircle2 className="w-3 h-3"/>Terminer</> : <><Settings className="w-3 h-3"/>Éditer</>}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4 h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {neighborhoods.map((zone) => {
                      const isSelected = selectedZones.has(zone.id) && !isEditing;
                      return (
                        <div key={zone.id} className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleZone(zone.id)}
                            disabled={isEditing}
                            className={clsx(
                              "flex-1 flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none",
                              isSelected 
                                ? "bg-indigo-50 border-municipall-blue/30 text-municipall-blue" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {!isEditing && (
                                <div className={clsx("w-4 h-4 rounded border flex items-center justify-center transition-colors", isSelected ? "bg-municipall-blue border-municipall-blue text-white" : "border-gray-300 bg-white")}>
                                  {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                              )}
                              <span className={clsx(isSelected ? "font-bold text-gray-900" : "", isEditing && "pl-1")}>{zone.name}</span>
                            </div>
                            {isEditing && (
                              <span className="text-xs text-gray-400 font-mono">{zone.citizens} pop.</span>
                            )}
                          </button>
                          {isEditing && (
                            <button 
                              onClick={() => removeNeighborhood(zone.id)}
                              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isEditing && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 grid grid-cols-5 gap-2 items-center mb-2">
                      <input 
                        type="text" 
                        placeholder="Nouveau quartier..." 
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="col-span-3 text-xs bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:border-municipall-blue" 
                      />
                      <input 
                        type="number" 
                        placeholder="Pop." 
                        value={newZonePop}
                        onChange={(e) => setNewZonePop(e.target.value)}
                        className="col-span-1 text-xs bg-white border border-gray-200 rounded p-1.5 focus:outline-none focus:border-municipall-blue" 
                      />
                      <button 
                        onClick={addNeighborhood}
                        disabled={!newZoneName.trim() || !newZonePop.trim()}
                        className="col-span-1 bg-municipall-blue text-white rounded p-1.5 flex items-center justify-center disabled:opacity-50 hover:bg-indigo-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {!isEditing && (
                  <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-3 text-sm text-municipall-blue flex items-center justify-center font-medium">
                    {selectedZones.size > 0 ? (
                      <>~ <span className="font-bold mx-1 text-gray-900">{totalCitizens.toLocaleString('fr-FR')}</span> citoyens recevront cette alerte.</>
                    ) : (
                      <span className="text-gray-500">Aucun quartier sélectionné.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card-panel p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-600 mb-6 uppercase tracking-wider text-center">Aperçu du Mobile</h3>
            
            <div className="w-[280px] h-[560px] bg-gray-900 rounded-[40px] p-3 shadow-xl relative border-4 border-gray-800 shrink-0">
              <div className="w-full h-full bg-gray-50 rounded-[28px] overflow-hidden relative flex flex-col pt-12">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl mx-16 z-20"></div>
                
                <div className="flex-1 px-4 relative z-10 pt-8">
                  <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 pb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-municipall-blue rounded flex items-center justify-center shrink-0">
                          <span className="text-white text-[8px] font-bold">M</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-900 tracking-wide">MUNICIP'ALL</span>
                      </div>
                      <span className="text-[10px] text-gray-400">à l'instant</span>
                    </div>
                    <div className="mt-2">
                      <h4 className={clsx("text-sm font-bold leading-tight mb-1", alertType === "urgent" ? "text-red-600" : "text-gray-900")}>
                        {title || "Titre de l'alerte"}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-snug line-clamp-4 overflow-hidden" style={{ wordBreak: 'break-word' }}>
                        {message || "Détaillez votre message ici... (Aperçu en temps réel pour validation avant envoi)."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            disabled={!title || !message || selectedZones.size === 0 || isEditing}
            className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-municipall-blue/20 transition-all"
          >
            <Send className="w-5 h-5" />
            Envoyer l'alerte via GPS
          </button>
        </div>

      </div>
    </div>
  );
}
