'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { PIN_HTML, PIN_SIZE, PIN_ANCHOR, OSM_TILES, OSM_ATTRIB } from './map-pin';

/** Read-only map showing a single marker at the business location. */
export function LocationMap({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
      L.tileLayer(OSM_TILES, { attribution: OSM_ATTRIB, maxZoom: 19 }).addTo(map);
      const icon = L.divIcon({ className: 'mypet-pin', html: PIN_HTML, iconSize: PIN_SIZE, iconAnchor: PIN_ANCHOR });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      if (label) marker.bindPopup(label);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  return <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-card border border-cream-200" style={{ zIndex: 0 }} />;
}
