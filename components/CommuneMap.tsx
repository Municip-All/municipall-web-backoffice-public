"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

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

// Generates sub-zone polygons within a commune bounding box  
function generateSubZones(contour: number[][][], zoneName: string) {
  const coords = contour[0];
  const lngs = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  
  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;
  
  const zones = [
    {
      name: "Centre-Ville",
      bounds: [[midLat - 0.002, midLng - 0.003], [midLat + 0.002, midLng + 0.003]] as [[number,number],[number,number]]
    },
    {
      name: "Quartier Nord",
      bounds: [[midLat + 0.002, midLng - 0.004], [midLat + 0.006, midLng + 0.002]] as [[number,number],[number,number]]
    },
    {
      name: "Quartier Sud",
      bounds: [[midLat - 0.006, midLng - 0.003], [midLat - 0.002, midLng + 0.003]] as [[number,number],[number,number]]
    },
    {
      name: "Zone Est",
      bounds: [[midLat - 0.002, midLng + 0.002], [midLat + 0.003, midLng + 0.006]] as [[number,number],[number,number]]
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

    let map: unknown = null;
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
        map = (L as any).map(mapRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: true,
          attributionControl: true,
        });

        mapInstance.current = map;

        // IGN tile layer (free, official French base map)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (L as any).tileLayer(
          "https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal",
          {
            attribution: '© <a href="https://www.ign.fr">IGN</a>',
            maxZoom: 18,
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).addTo(map as any);

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
              color: "#0b0080",
              weight: 2.5,
              fillColor: "#0b0080",
              fillOpacity: 0.08,
              dashArray: "4 4",
            },
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).addTo(map as any);

        // Fit map to commune bounds
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).fitBounds((communeLayer as any).getBounds(), { padding: [20, 20] });

        // Draw zones
        const zonesToDraw = customNeighborhoods && customNeighborhoods.length > 0
          ? customNeighborhoods 
          : generateSubZones(commune.contour.coordinates as number[][][], commune.nom);

        zonesToDraw.forEach((zone: any) => {
          const isSelected = selectedZones.has(zone.name);
          
          let layer;
          if (zone.points) {
            // Custom polygon from NeighborhoodManager
            layer = (L as any).polygon(zone.points, {
              color: isSelected ? "#0b0080" : "#6b7280",
              weight: 2,
              fillColor: isSelected ? "#0b0080" : "#9ca3af",
              fillOpacity: isSelected ? 0.35 : 0.1,
              interactive: !isEditing,
            });
          } else {
            // Fallback rectangle from generator
            layer = (L as any).rectangle(zone.bounds, {
              color: isSelected ? "#0b0080" : "#6b7280",
              weight: 2,
              fillColor: isSelected ? "#0b0080" : "#9ca3af",
              fillOpacity: isSelected ? 0.35 : 0.1,
              interactive: !isEditing,
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const label = (L as any).tooltip({
            permanent: true,
            direction: "center",
            className: "zone-label",
          }).setContent(zone.name);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          layer.bindTooltip(label).addTo(map as any);

          layer.on("click", () => {
            onZoneToggle(zone.name);
          });
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
  }, [cityName, JSON.stringify(customNeighborhoods)]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-xs font-medium text-gray-500">Chargement de la carte IGN…</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <p className="text-xs font-medium text-gray-500 text-center px-4">{error}</p>
        </div>
      )}

      <style>{`
        .zone-label {
          background: rgba(255,255,255,0.9) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 6px !important;
          padding: 2px 8px !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          color: #111827 !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        .leaflet-tooltip-bottom::before { display: none !important; }
      `}</style>
    </div>
  );
}
