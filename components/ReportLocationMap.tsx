"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lon: number;
  label?: string;
  className?: string;
};

/** Tuiles IGN (mêmes que CommuneMap). */
const IGN_TILES =
  "https://data.geopf.fr/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&format=image/png&style=normal";

function hasValidCoords(lat: number, lon: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  // 0,0 = Null Island — données manquantes, pas une vraie localisation FR
  if (Math.abs(lat) < 1e-6 && Math.abs(lon) < 1e-6) return false;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return false;
  return true;
}

export default function ReportLocationMap({
  lat,
  lon,
  label,
  className,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const valid = hasValidCoords(lat, lon);

  useEffect(() => {
    if (!valid || !mapRef.current) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([lat, lon], 17);

      L.tileLayer(IGN_TILES, {
        attribution: "© IGN",
        maxZoom: 18,
      }).addTo(map);

      const pin = L.divIcon({
        className: "municipall-report-pin",
        html: `<span style="
          display:block;
          width:18px;height:18px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:#b91c1c;
          border:2px solid #fff;
          box-shadow:0 1px 4px rgba(0,0,0,.35);
        "></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 18],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([lat, lon], { icon: pin }).addTo(map);
      if (label) marker.bindPopup(label).openPopup();

      requestAnimationFrame(() => {
        map.invalidateSize();
      });

      mapInstance.current = map;
    };

    void init();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon, label, valid]);

  if (!valid) {
    return (
      <div
        className={
          className ??
          "flex h-56 w-full items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--surface-subtle)] px-4 text-center"
        }
      >
        <p className="text-sm text-[var(--muted)]">
          Coordonnées GPS indisponibles pour ce signalement.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={
        className ??
        "h-56 w-full overflow-hidden rounded-2xl border border-[var(--card-border)]"
      }
    />
  );
}
