"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  lat: number;
  lon: number;
  label?: string;
  className?: string;
};

export default function ReportLocationMap({
  lat,
  lon,
  label,
  className,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || !Number.isFinite(lat) || !Number.isFinite(lon))
      return;

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lon]).addTo(map);
      if (label) marker.bindPopup(label).openPopup();

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
  }, [lat, lon, label]);

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
