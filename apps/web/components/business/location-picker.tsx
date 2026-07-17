'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { PIN_HTML, PIN_SIZE, PIN_ANCHOR, DEFAULT_CENTER, OSM_TILES, OSM_ATTRIB } from './map-pin';

function toNum(v: string | number | null | undefined): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/**
 * Interactive map location picker. Click (or drag the marker) to set the
 * business location; the value is written to hidden `lat`/`lng` inputs so the
 * existing form action + schema keep working unchanged.
 */
export function LocationPicker({
  initialLat,
  initialLng,
}: {
  initialLat?: string | number | null;
  initialLng?: string | number | null;
}) {
  const [lat, setLat] = useState<number | null>(toNum(initialLat));
  const [lng, setLng] = useState<number | null>(toNum(initialLng));

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const start = lat != null && lng != null ? ([lat, lng] as [number, number]) : DEFAULT_CENTER;
      const map = L.map(containerRef.current).setView(start, lat != null ? 14 : 11);
      L.tileLayer(OSM_TILES, { attribution: OSM_ATTRIB, maxZoom: 19 }).addTo(map);
      mapRef.current = map;

      const icon = L.divIcon({ className: 'mypet-pin', html: PIN_HTML, iconSize: PIN_SIZE, iconAnchor: PIN_ANCHOR });

      const place = (la: number, ln: number) => {
        setLat(la);
        setLng(ln);
        if (markerRef.current) {
          markerRef.current.setLatLng([la, ln]);
        } else {
          const m = L.marker([la, ln], { icon, draggable: true }).addTo(map);
          m.on('dragend', () => {
            const p = m.getLatLng();
            setLat(p.lat);
            setLng(p.lng);
          });
          markerRef.current = m;
        }
      };

      if (lat != null && lng != null) place(lat, lng);
      map.on('click', (e) => place(e.latlng.lat, e.latlng.lng));
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    setLat(null);
    setLng(null);
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="lat" value={lat ?? ''} />
      <input type="hidden" name="lng" value={lng ?? ''} />
      <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-card border border-cream-200" style={{ zIndex: 0 }} />
      <div className="flex items-center justify-between text-xs text-ink/60">
        <span>
          {lat != null && lng != null
            ? `Seçilmiş yer: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
            : 'Yeri seçmək üçün xəritəyə klikləyin'}
        </span>
        {lat != null && (
          <button type="button" onClick={clear} className="font-medium text-brand-600 hover:underline">
            Təmizlə
          </button>
        )}
      </div>
    </div>
  );
}
