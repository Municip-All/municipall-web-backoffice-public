"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Map as MapIcon,
  Save,
  Pencil,
  Check,
  X,
  RefreshCcw,
} from "lucide-react";
import { api, CityNeighborhood } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";
import type { LayerGroup, LeafletMouseEvent, Map, Polygon } from "leaflet";
import type {
  Feature,
  MultiPolygon,
  Polygon as GeoJsonPolygon,
  Position,
} from "geojson";

/** Contour communal renvoyé par geo.api.gouv.fr (Polygon ou MultiPolygon) */
type CommuneContour = GeoJsonPolygon | MultiPolygon;

async function loadLeaflet() {
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  return L;
}

export default function NeighborhoodManager() {
  const { user } = useAuth();
  const toast = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cityName, setCityName] = useState("");
  const [neighborhoods, setNeighborhoods] = useState<CityNeighborhood[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<[number, number][]>([]);
  const [isNaming, setIsNaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const tempLayer = useRef<Polygon | null>(null);
  const neighborhoodLayers = useRef<LayerGroup | null>(null);
  const communeContourRef = useRef<CommuneContour | null>(null);

  const isPointInPolygon = useCallback(
    (lat: number, lng: number, contour: CommuneContour | null) => {
      if (!contour) return true;

      const polygons: Position[][][] =
        contour.type === "Polygon"
          ? [contour.coordinates]
          : contour.coordinates;

      for (const polygon of polygons) {
        const outerRing = polygon[0];
        if (!outerRing?.length) continue;

        let inside = false;
        for (
          let i = 0, j = outerRing.length - 1;
          i < outerRing.length;
          j = i++
        ) {
          const xi = outerRing[i]![0],
            yi = outerRing[i]![1];
          const xj = outerRing[j]![0],
            yj = outerRing[j]![1];

          const intersect =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
          if (intersect) inside = !inside;
        }
        if (inside) return true;
      }
      return false;
    },
    [],
  );

  // Use a ref for isDrawing to prevent map re-initialization while allowing the click handler to see the current state
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    if (!user?.cityId) return;

    api
      .getCityConfig(user.cityId)
      .then((config) => {
        if (config && config.name && config.name !== "Municip'All") {
          setCityName(config.name);
          setNeighborhoods(config.neighborhoods ?? []);
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
  }, [user?.cityId, toast]);

  useEffect(() => {
    if (!mapRef.current || !cityName) return;

    let isMounted = true;
    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapRef.current) return;

        const resp = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=nom,code,centre,contour&format=json&geometry=contour&boost=population&limit=1`,
        );
        const data = await resp.json();
        if (!data || data.length === 0) return;

        const commune = data[0] as {
          centre: { coordinates: [number, number] };
          contour: CommuneContour;
        };
        const [lng, lat] = commune.centre.coordinates;
        communeContourRef.current = commune.contour;

        if (mapInstance.current) mapInstance.current.remove();

        const map = L.map(mapRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
        });
        mapInstance.current = map;

        L.tileLayer(
          "https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal",
          {
            attribution: "© IGN",
            maxZoom: 18,
          },
        ).addTo(map);

        const communeFeature: Feature = {
          type: "Feature",
          geometry: commune.contour,
          properties: {},
        };
        L.geoJSON(communeFeature, {
          style: {
            color: "var(--accent)",
            weight: 3,
            fillColor: "var(--accent)",
            fillOpacity: 0.05,
            dashArray: "10 10",
          },
        }).addTo(map);

        neighborhoodLayers.current = L.layerGroup().addTo(map);

        map.on("click", (e: LeafletMouseEvent) => {
          if (isDrawingRef.current) {
            const isInside = isPointInPolygon(
              e.latlng.lat,
              e.latlng.lng,
              communeContourRef.current,
            );
            if (!isInside) {
              toast("error", "Point hors limites de la ville.");
              return;
            }
            setTempPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
          }
        });
      } catch (err) {
        console.error("Map error:", err);
      }
    };

    initMap();
    return () => {
      isMounted = false;
    };
  }, [cityName, isPointInPolygon, toast]);

  // Handle Temp Points rendering
  useEffect(() => {
    if (!mapInstance.current || !tempPoints.length) {
      if (tempLayer.current) tempLayer.current.remove();
      return;
    }

    const map = mapInstance.current;
    loadLeaflet().then((L) => {
      if (!map) return;
      if (tempLayer.current) tempLayer.current.remove();

      const poly = L.polygon(tempPoints, {
        color: "var(--accent)",
        weight: 3,
        fillColor: "var(--accent)",
        fillOpacity: 0.3,
        dashArray: "10 10",
      }).addTo(map);

      tempLayer.current = poly;
    });
  }, [tempPoints]);

  // Render existing neighborhoods
  useEffect(() => {
    if (!mapInstance.current || !neighborhoodLayers.current) return;

    // Clear previous layers
    neighborhoodLayers.current.clearLayers();

    const layers = neighborhoodLayers.current;
    loadLeaflet().then((L) => {
      if (!layers) return;
      neighborhoods.forEach((n) => {
        L.polygon(n.points, {
          color: "var(--accent)",
          weight: 2,
          fillColor: "var(--accent)",
          fillOpacity: 0.2,
        })
          .addTo(layers)
          .bindTooltip(n.name, {
            permanent: true,
            direction: "center",
            className: "neighborhood-label",
          });
      });
    });
  }, [neighborhoods]);

  const startDrawing = () => {
    setIsDrawing(true);
    setTempPoints([]);
    toast("info", "Tracez le contour sur la carte.");
  };

  const finishDrawing = () => {
    if (tempPoints.length < 3) {
      toast("error", "Minimum 3 points requis.");
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
    const newQuartier: CityNeighborhood = {
      id: Date.now().toString(),
      name: newName,
      points: tempPoints,
    };
    setNeighborhoods((prev) => [...prev, newQuartier]);
    setIsNaming(false);
    setIsDrawing(false);
    setTempPoints([]);
    setNewName("");
    toast("success", `Quartier "${newName}" créé !`);
  };

  const deleteNeighborhood = (id: string) => {
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    toast("info", "Quartier supprimé.");
  };

  const saveAll = async () => {
    if (!user?.cityId) return;
    setIsSaving(true);
     
    const success = await api.saveCityConfig(user.cityId, {
      neighborhoods,
    });
    if (success) {
      toast("success", "Configuration enregistrée !");
    } else {
      toast("error", "Erreur d'enregistrement.");
    }
    setIsSaving(false);
  };

  return (
    <div className="flex h-full bg-[var(--background)] transition-colors duration-500 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-[380px] h-full bg-[var(--card)]/80 backdrop-blur-3xl border-r border-[var(--card-border)] flex flex-col p-10 shadow-2xl relative z-20">
        <header className="mb-8">
          <p className="section-title mb-2">Aménagement urbain</p>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Secteurs géo
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-10 pr-2">
          {neighborhoods.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-[28px] flex items-center justify-center mb-6 border border-[var(--card-border)] opacity-50">
                <MapIcon className="w-10 h-10 text-[var(--muted)]" />
              </div>
              <p className="text-xs font-black text-apple-muted opacity-40 uppercase tracking-widest px-8">
                Aucun quartier défini
              </p>
            </div>
          ) : (
            neighborhoods.map((n) => (
              <div
                key={n.id}
                className="card-premium !rounded-[24px] p-5 flex items-center justify-between group hover:border-[var(--accent)] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  <span className="font-black text-[var(--foreground)] text-sm tracking-tight truncate max-w-[160px]">
                    {n.name}
                  </span>
                </div>
                <button
                  onClick={() => deleteNeighborhood(n.id)}
                  className="text-zinc-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          {!isDrawing ? (
            <button
              onClick={startDrawing}
              className="w-full bg-[var(--accent)] text-white font-black py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-xl shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Nouveau Quartier
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTempPoints((prev) => prev.slice(0, -1))}
                  disabled={tempPoints.length === 0}
                  className="w-full bg-[var(--card)] text-[var(--foreground)] font-black py-4 rounded-[22px] flex items-center justify-center gap-2 border border-[var(--card-border)] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Undo
                </button>
                <button
                  onClick={finishDrawing}
                  className="w-full bg-emerald-500 text-white font-black py-4 rounded-[22px] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg text-xs uppercase tracking-widest"
                >
                  <Check className="w-4 h-4" />
                  Terminer ({tempPoints.length})
                </button>
              </div>
              <button
                onClick={cancelDrawing}
                className="w-full bg-red-500/10 text-red-500 font-black py-5 rounded-[28px] flex items-center justify-center gap-3 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                <X className="w-5 h-5" />
                Abandonner
              </button>
            </div>
          )}

          <button
            onClick={saveAll}
            disabled={isSaving || isDrawing}
            className={clsx(
              "w-full flex items-center justify-center gap-3 py-5 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all border-2 shadow-sm",
              isSaving
                ? "bg-zinc-100 text-zinc-400 border-transparent"
                : "bg-[var(--card)] text-[var(--accent)] border-[var(--accent)]/20 hover:border-[var(--accent)]/40",
            )}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Publier les quartiers
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Floating Tool Indicator */}
        {isDrawing && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white dark:border-white/10 shadow-2xl rounded-[28px] px-8 py-4 flex items-center gap-4 animate-bounce">
            <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_12px_var(--accent)]" />
            <span className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.2em]">
              Outil de tracé actif
            </span>
          </div>
        )}

        {/* Naming Modal */}
        {isNaming && (
          <div className="absolute inset-0 z-[2000] bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-8">
            <div className="card-premium !rounded-[48px] p-12 max-w-lg w-full shadow-[0_32px_120px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-[var(--accent)]/10 text-[var(--accent)] rounded-[32px] flex items-center justify-center mb-8 mx-auto border border-[var(--accent)]/20 shadow-inner">
                <Pencil className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-center text-[var(--foreground)] mb-3 tracking-tight">
                Nommer ce quartier
              </h3>
              <p className="text-[var(--muted)] text-center text-sm mb-10 px-6 font-medium leading-relaxed">
                Le nom apparaîtra sur l&apos;application mobile et le site web
                pour tous les citoyens.
              </p>

              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Quartier de la Mairie"
                className="form-input-lg mb-10 text-center text-xl font-black"
                onKeyDown={(e) => e.key === "Enter" && saveNewNeighborhood()}
              />

              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setIsNaming(false)}
                  className="py-5 rounded-[22px] font-black text-apple-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest text-xs"
                >
                  Annuler
                </button>
                <button
                  onClick={saveNewNeighborhood}
                  disabled={!newName}
                  className="bg-[var(--accent)] text-white py-5 rounded-[26px] font-black shadow-xl shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-xl z-[3000] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-[var(--accent)] animate-spin opacity-40" />
              <MapIcon className="w-6 h-6 text-[var(--accent)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] font-black text-apple-muted uppercase tracking-[0.4em] opacity-60">
              Synchronisation IGN Carto
            </p>
          </div>
        )}
      </div>

      <style>{`
        .neighborhood-label {
          background: rgba(255,255,255,0.95) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 16px !important;
          padding: 8px 18px !important;
          font-size: 10px !important;
          font-weight: 900 !important;
          color: #111827 !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .dark .neighborhood-label {
          background: rgba(24,24,27,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #f4f4f5 !important;
        }
        .leaflet-tooltip-center::before { display: none !important; }
        .leaflet-container { font-family: inherit; }
        .leaflet-tile { filter: grayscale(0.5) opacity(0.8); transition: filter 0.5s; }
        .dark .leaflet-tile { filter: invert(1) hue-rotate(180deg) brightness(0.9) grayscale(0.2) contrast(1.2); }
      `}</style>
    </div>
  );
}
