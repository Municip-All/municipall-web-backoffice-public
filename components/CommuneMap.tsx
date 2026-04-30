"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";

interface CommuneMapProps {
  cityName: string;
  /**
   * Called when a zone is clicked on the map (zone label)
   */
  selectedZones: Set<string>;
  onZoneToggle: (zoneName: string) => void;
  isEditing?: boolean;
  customNeighborhoods?: { name: string; points: [number, number][] }[];
}

interface CommuneData {
  nom: string;
  code: string;
  centre: { type: string; coordinates: [number, number] };
  contour: { type: string; coordinates: number[][][] };
}

// Dynamically load leaflet only client-side
async function loadLeaflet() {
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  return L;
}

interface MapZone {
  name: string;
  points?: [number, number][];
  bounds?: [[number, number], [number, number]];
}

// Generates sub-zone polygons within a commune bounding box  
function generateSubZones(contour: number[][][], zoneName: string): MapZone[] {
  const coords = contour[0];
  const lngs = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);

  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;

  const zones: MapZone[] = [
    {
      name: "Centre-Ville",
      bounds: [[midLat - 0.002, midLng - 0.003], [midLat + 0.002, midLng + 0.003]] as [[number, number], [number, number]]
    },
    {
      name: "Quartier Nord",
      bounds: [[midLat + 0.002, midLng - 0.004], [midLat + 0.006, midLng + 0.002]] as [[number, number], [number, number]]
    },
    {
      name: "Quartier Sud",
      bounds: [[midLat - 0.006, midLng - 0.003], [midLat - 0.002, midLng + 0.003]] as [[number, number], [number, number]]
    },
    {
      name: "Zone Est",
      bounds: [[midLat - 0.002, midLng + 0.002], [midLat + 0.003, midLng + 0.006]] as [[number, number], [number, number]]
    },
  ];
  void zoneName;
  return zones;
}

export default function CommuneMap({ cityName, selectedZones, onZoneToggle, isEditing, customNeighborhoods }: CommuneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || !cityName) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await loadLeaflet();

        // Fetch commune boundary from geo.api.gouv.fr
        const resp = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(cityName)}&fields=nom,code,centre,contour&format=json&geometry=contour&boost=population&limit=1`
        );
        const data: CommuneData[] = await resp.json();

        if (!isMounted || !mapRef.current) return;

        if (!data || data.length === 0) {
          setError(`Commune "${cityName}" non trouvée.`);
          setIsLoading(false);
          return;
        }

        const commune = data[0];
        const [lng, lat] = commune.centre.coordinates;

        // Destroy previous map instance if any
        if (mapInstance.current) {
          (mapInstance.current as { remove: () => void }).remove();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leafletMap = (L as any).map(mapRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstance.current = leafletMap;

        // IGN tile layer (free, official French base map)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (L as any).tileLayer(
          "https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal",
          {
            maxZoom: 18,
          }
        ).addTo(leafletMap);

        // Draw commune boundary
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const communeLayer = (L as any).geoJSON(
          {
            type: "Feature",
            geometry: commune.contour,
            properties: {},
          },
          {
            style: {
              color: "var(--accent)",
              weight: 3,
              fillColor: "var(--accent)",
              fillOpacity: 0.05,
              dashArray: "10 10",
            },
          }
        ).addTo(leafletMap);

        // Fit map to commune bounds
        leafletMap.fitBounds(communeLayer.getBounds(), { padding: [40, 40] });

        // Draw zones
        const zonesToDraw: MapZone[] = customNeighborhoods && customNeighborhoods.length > 0
          ? customNeighborhoods
          : generateSubZones(commune.contour.coordinates as number[][][], commune.nom);

        zonesToDraw.forEach((zone: MapZone) => {
          const isSelected = selectedZones.has(zone.name);

          let layer;
          if (zone.points) {
            // Custom polygon from NeighborhoodManager
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            layer = (L as any).polygon(zone.points, {
              color: isSelected ? "var(--accent)" : "rgba(107, 114, 128, 0.4)",
              weight: 2,
              fillColor: isSelected ? "var(--accent)" : "rgba(156, 163, 175, 0.2)",
              fillOpacity: isSelected ? 0.35 : 0.05,
              interactive: !isEditing,
            });
          } else if (zone.bounds) {
            // Fallback rectangle from generator
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            layer = (L as any).rectangle(zone.bounds, {
              color: isSelected ? "var(--accent)" : "rgba(107, 114, 128, 0.4)",
              weight: 2,
              fillColor: isSelected ? "var(--accent)" : "rgba(156, 163, 175, 0.2)",
              fillOpacity: isSelected ? 0.35 : 0.05,
              interactive: !isEditing,
            });
          }

          if (layer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const label = (L as any).tooltip({
              permanent: true,
              direction: "center",
              className: isSelected ? "zone-label selected" : "zone-label",
            }).setContent(zone.name);

            layer.bindTooltip(label).addTo(leafletMap);

            layer.on("click", () => {
              onZoneToggle(zone.name);
            });
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Map init error:", err);
        if (isMounted) {
          setError("Impossible de charger la carte.");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName, JSON.stringify(customNeighborhoods), selectedZones.size]);

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden border border-[var(--card-border)] shadow-inner group">
      <div ref={mapRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 bg-[var(--card)]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-[2000]">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            </div>
          </div>
          <p className="text-[10px] font-black text-apple-muted uppercase tracking-[0.4em] opacity-60">Synchronisation Cartographique</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-[var(--card)] flex flex-col items-center justify-center p-10 z-[2000]">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-[24px] flex items-center justify-center mb-6">
            <X className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-[var(--foreground)] text-center tracking-tight leading-relaxed">{error}</p>
        </div>
      )}

      <style>{`
        .zone-label {
          background: rgba(255,255,255,0.95) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 6px 14px !important;
          font-size: 9px !important;
          font-weight: 900 !important;
          color: #111827 !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s ease !important;
          pointer-events: none;
        }
        .dark .zone-label {
          background: rgba(24,24,27,0.95) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #f4f4f5 !important;
        }
        .zone-label.selected {
          background: var(--accent) !important;
          color: white !important;
          border-color: var(--accent) !important;
          box-shadow: 0 8px 25px var(--accent-shadow) !important;
          transform: scale(1.1);
        }
        .leaflet-tooltip-bottom::before { display: none !important; }
        .leaflet-container { font-family: inherit; background: var(--background); transition: background 0.5s; }
        .leaflet-tile { filter: grayscale(0.6) opacity(0.8); transition: filter 0.5s; }
        .dark .leaflet-tile { filter: invert(1) hue-rotate(180deg) brightness(0.9) grayscale(0.2) contrast(1.2); }
      `}</style>
    </div>
  );
}
