// On-brand coral map marker (SVG) shared by the picker and the read-only map.
// Rendered via L.divIcon so we avoid Leaflet's default image assets (which 404
// under bundlers) — no emojis, per project rule.
export const PIN_HTML =
  '<svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M15 0C7 0 1 6 1 13.5 1 22 15 38 15 38s14-16 14-24.5C29 6 23 0 15 0Z" fill="#f4622f" stroke="#b63c16" stroke-width="1.5"/>' +
  '<circle cx="15" cy="13.5" r="5" fill="#ffffff"/></svg>';

export const PIN_SIZE: [number, number] = [30, 38];
export const PIN_ANCHOR: [number, number] = [15, 38];

// Baku city center — sensible default when no location is set yet.
export const DEFAULT_CENTER: [number, number] = [40.4093, 49.8671];

export const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIB = '© OpenStreetMap';
