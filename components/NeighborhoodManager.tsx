"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Trash2, Map as MapIcon, Save, MousePointer2, Pencil, Check, X, RefreshCcw } from "lucide-react";
import { api, CityConfig } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";

interface Neighborhood {
  id: string;
  name: string;
  points: [number, number][]; // [lat, lng]
}

async function loadLeaflet() {
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  return L;
}

export default function NeighborhoodManager() {
  const { user } = useAuth();
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cityName, setCityName] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<[number, number][]>([]);
  const [isNaming, setIsNaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempLayer = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const neighborhoodLayers = useRef<any>(null);
  const communeContourRef = useRef<any>(null);

  // Helper: Point in Polygon (Ray Casting)
  const isPointInPolygon = (lat: number, lng: number, contour: any) => {
    if (!contour) return true;
    
    // Convert contour to an array of polygons (MultiPolygon support)
    const polygons = contour.type === "Polygon" ? [contour.coordinates] : contour.coordinates;
    
    for (const polygon of polygons) {
      // Each polygon has one or more rings (outer + holes)
      const outerRing = polygon[0];
      
      let inside = false;
      for (let i = 0, j = outerRing.length - 1; i < outerRing.length; j = i++) {
        const xi = outerRing[i][0], yi = outerRing[i][1]; // xi = Longitude, yi = Latitude
        const xj = outerRing[j][0], yj = outerRing[j][1];
        
        const intersect = ((yi > lat) !== (yj > lat))
            && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
      }
      if (inside) return true;
    }
    return false;
  };

  // Use a ref for isDrawing to prevent map re-initialization while allowing the click handler to see the current state
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    if (!user?.cityId) return;
    
    api.getCityConfig(user.cityId)
      .then(config => {
        if (config && config.name && config.name !== "Municip'All") {
          setCityName(config.name);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const savedNeighborhoods = (config as any).neighborhoods || [];
          setNeighborhoods(savedNeighborhoods);
        } else {
          setCityName("Paris");
          toast("info", "Ville non reconnue. Affichage de Paris par défaut.");
        }
      })
      .catch(() => {
        setCityName("Paris");
        toast("error", "Erreur API. Mode démo activé.");
      })
      .finally(() => setIsLoading(false));
  }, [user?.cityId]);

  useEffect(() => {
    if (!mapRef.current || !cityName) return;

    let isMounted = true;
    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapRef.current) return;

        const resp = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=nom,code,centre,contour&format=json&geometry=contour&boost=population&limit=1`);
        const data = await resp.json();
        if (!data || data.length === 0) return;

        const commune = data[0];
        const [lng, lat] = commune.centre.coordinates;
        communeContourRef.current = commune.contour;

        if (mapInstance.current) mapInstance.current.remove();

        const map = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
        });
        mapInstance.current = map;

        L.tileLayer("https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal", {
          attribution: '© IGN',
          maxZoom: 18,
        }).addTo(map);

        L.geoJSON({ type: "Feature", geometry: commune.contour, properties: {} } as any, {
          style: { color: "#0b0080", weight: 2, fillColor: "#0b0080", fillOpacity: 0.05, dashArray: "5 5" }
        }).addTo(map);

        // Initialize Layer Group for neighborhoods
        neighborhoodLayers.current = L.layerGroup().addTo(map);

        // Click handler for drawing - uses the ref to always have the latest state
        map.on("click", (e: any) => {
          if (isDrawingRef.current) {
            const isInside = isPointInPolygon(e.latlng.lat, e.latlng.lng, communeContourRef.current);
            if (!isInside) {
              toast("error", "Vous ne pouvez pas placer de point en dehors des limites de la ville.");
              return;
            }
            setTempPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
          }
        });

      } catch (err) {
        console.error("Map error:", err);
      }
    };

    initMap();
    return () => { isMounted = false; };
  }, [cityName]); 

  // Handle Temp Points rendering
  useEffect(() => {
    if (!mapInstance.current || !tempPoints.length) {
      if (tempLayer.current) tempLayer.current.remove();
      return;
    }

    loadLeaflet().then(L => {
      if (tempLayer.current) tempLayer.current.remove();
      
      const poly = L.polygon(tempPoints, {
        color: "#0b0080",
        weight: 3,
        fillColor: "#0b0080",
        fillOpacity: 0.2,
        dashArray: "5 5"
      }).addTo(mapInstance.current);
      
      tempLayer.current = poly;
    });
  }, [tempPoints]);

  // Render existing neighborhoods
  useEffect(() => {
    if (!mapInstance.current || !neighborhoodLayers.current) return;

    // Clear previous layers
    neighborhoodLayers.current.clearLayers();

    loadLeaflet().then(L => {
      neighborhoods.forEach(n => {
        L.polygon(n.points, {
          color: "#0b0080",
          weight: 2,
          fillColor: "#0b0080",
          fillOpacity: 0.15
        }).addTo(neighborhoodLayers.current)
          .bindTooltip(n.name, { permanent: true, direction: "center", className: "neighborhood-label" });
      });
    });
  }, [neighborhoods]);

  const startDrawing = () => {
    setIsDrawing(true);
    setTempPoints([]);
    toast("info", "Cliquez sur la carte pour définir les points du quartier.");
  };

  const finishDrawing = () => {
    if (tempPoints.length < 3) {
      toast("error", "Un quartier doit avoir au moins 3 points.");
      return;
    }
    setIsNaming(true);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setTempPoints([]);
    if (tempLayer.current) tempLayer.current.remove();
  };

  const saveNewNeighborhood = () => {
    if (!newName) return;
    const newQuartier: Neighborhood = {
      id: Date.now().toString(),
      name: newName,
      points: tempPoints
    };
    setNeighborhoods(prev => [...prev, newQuartier]);
    setIsNaming(false);
    setIsDrawing(false);
    setTempPoints([]);
    setNewName("");
    toast("success", `Quartier "${newName}" créé ! N'oubliez pas d'enregistrer.`);
  };

  const deleteNeighborhood = (id: string) => {
    setNeighborhoods(prev => prev.filter(n => n.id !== id));
    toast("info", "Quartier supprimé de la liste temporaire.");
  };

  const saveAll = async () => {
    if (!user?.cityId) return;
    setIsSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const success = await api.saveCityConfig(user.cityId, { neighborhoods } as any);
    if (success) {
      toast("success", "Découpage des quartiers enregistré avec succès !");
    } else {
      toast("error", "Erreur lors de l'enregistrement.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex h-full bg-[#F2F2F7]">
      {/* Sidebar List */}
      <div className="w-80 h-full bg-white/60 backdrop-blur-2xl border-r border-white/50 flex flex-col p-6 shadow-xl relative z-20">
        <header className="mb-8">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Aménagement Urbain</p>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Quartiers</h2>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6">
          {neighborhoods.length === 0 ? (
            <div className="text-center py-12">
              <MapIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <p className="text-sm text-zinc-400 font-medium px-4">Aucun quartier défini. Commencez à dessiner sur la carte.</p>
            </div>
          ) : (
            neighborhoods.map(n => (
              <div key={n.id} className="card-panel !rounded-2xl p-4 flex items-center justify-between group hover:border-municipall-blue/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-municipall-blue" />
                  <span className="font-bold text-zinc-800 text-sm truncate max-w-[140px]">{n.name}</span>
                </div>
                <button onClick={() => deleteNeighborhood(n.id)} className="text-zinc-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3">
          {!isDrawing ? (
            <button onClick={startDrawing} className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-lg">
              <Plus className="w-5 h-5" />
              Dessiner un quartier
            </button>
          ) : (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setTempPoints(prev => prev.slice(0, -1))}
                  disabled={tempPoints.length === 0}
                  className="w-full bg-white text-zinc-500 font-bold py-3 rounded-full flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 transition-all disabled:opacity-50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Undo
                </button>
                <button onClick={finishDrawing} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg">
                  <Check className="w-4 h-4" />
                  Valider ({tempPoints.length})
                </button>
              </div>
              <button onClick={cancelDrawing} className="w-full bg-white text-red-500 font-bold py-4 rounded-full flex items-center justify-center gap-2 border border-red-50 hover:bg-red-50 transition-all">
                <X className="w-5 h-5" />
                Annuler tout
              </button>
            </div>
          )}
          
          <button 
            onClick={saveAll} 
            disabled={isSaving || isDrawing}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-sm transition-all",
              isSaving ? "bg-zinc-100 text-zinc-400" : "bg-white text-municipall-blue border-2 border-municipall-blue/20 hover:border-municipall-blue/40 shadow-sm"
            )}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer en base
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Floating Tool Indicator */}
        {isDrawing && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-full px-6 py-3 flex items-center gap-3 animate-bounce">
            <div className="w-2 h-2 rounded-full bg-municipall-blue animate-pulse" />
            <span className="text-sm font-black text-municipall-blue uppercase tracking-widest">Mode Dessin Actif</span>
          </div>
        )}

        {/* Naming Modal */}
        {isNaming && (
          <div className="absolute inset-0 z-[2000] bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="card-panel !rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-blue-50 text-municipall-blue rounded-[24px] flex items-center justify-center mb-6 mx-auto">
                <Pencil className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-center text-zinc-900 mb-2">Nommer ce quartier</h3>
              <p className="text-zinc-500 text-center text-sm mb-8 px-4">Ce nom sera visible par tous les citoyens sur l'application mobile.</p>
              
              <input 
                autoFocus
                type="text" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Quartier de la Mairie"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-[22px] px-6 py-4 focus:bg-white focus:ring-4 focus:ring-municipall-blue/10 focus:border-municipall-blue outline-none transition-all font-bold text-lg mb-6"
                onKeyDown={e => e.key === 'Enter' && saveNewNeighborhood()}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsNaming(false)} className="py-4 rounded-full font-bold text-zinc-500 hover:bg-zinc-50 transition-all">Annuler</button>
                <button onClick={saveNewNeighborhood} disabled={!newName} className="btn-primary py-4">Valider</button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-zinc-50/50 backdrop-blur-md z-[3000] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-municipall-blue animate-spin" />
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Chargement de la carte IGN...</p>
          </div>
        )}
      </div>

      <style>{`
        .neighborhood-label {
          background: rgba(255,255,255,0.95) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 6px 14px !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          color: #111827 !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08) !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .leaflet-tooltip-center::before { display: none !important; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  );
}
