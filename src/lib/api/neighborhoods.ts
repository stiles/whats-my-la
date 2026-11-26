// Client-side access to the LA neighborhoods boundary file (LA Times Data Desk v6,
// republished at stilesdata.com/la-geography). No lookup API call involved.

export const NEIGHBORHOODS_URL =
  'https://stilesdata.com/la-geography/la_neighborhoods_comprehensive_simplified.geojson';

export type NeighborhoodType = 'segment-of-a-city' | 'standalone-city' | 'unincorporated-area';

export interface NeighborhoodProperties {
  name: string;
  slug: string;
  type: NeighborhoodType;
  city: string | null;
  region: string;
  area_sqmi: number;
}

export type NeighborhoodGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
export type NeighborhoodFeature = GeoJSON.Feature<NeighborhoodGeometry, NeighborhoodProperties>;
export type NeighborhoodCollection = GeoJSON.FeatureCollection<
  NeighborhoodGeometry,
  NeighborhoodProperties
>;

export type Bounds = [[number, number], [number, number]];

let cached: Promise<NeighborhoodCollection> | null = null;

/** Fetch the boundary file once per session; failed fetches are not cached. */
export function loadNeighborhoods(): Promise<NeighborhoodCollection> {
  if (!cached) {
    cached = fetch(NEIGHBORHOODS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load neighborhoods: ${res.statusText}`);
        return res.json() as Promise<NeighborhoodCollection>;
      })
      .catch((err) => {
        cached = null;
        throw err;
      });
  }
  return cached;
}

export const TYPE_LABELS: Record<NeighborhoodType, string> = {
  'segment-of-a-city': 'City of LA neighborhood',
  'standalone-city': 'City',
  'unincorporated-area': 'Unincorporated area'
};

/** "south-la" → "South LA", "san-fernando-valley" → "San Fernando Valley" */
export function formatRegion(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w === 'la' ? 'LA' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

function polygons(geom: NeighborhoodGeometry): GeoJSON.Position[][][] {
  return geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
}

export function getBounds(geom: NeighborhoodGeometry): Bounds {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;
  for (const poly of polygons(geom)) {
    for (const ring of poly) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
}

function inRing(lng: number, lat: number, ring: GeoJSON.Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function containsPoint(geom: NeighborhoodGeometry, lng: number, lat: number): boolean {
  return polygons(geom).some(
    ([outer, ...holes]) => inRing(lng, lat, outer) && !holes.some((h) => inRing(lng, lat, h))
  );
}

/**
 * A point guaranteed to fall inside the shape (a plain centroid can land outside
 * concave or multi-part areas). Tries the bbox center of the largest part, then
 * scans an increasingly fine grid and picks the inside point nearest that center.
 */
export function interiorPoint(geom: NeighborhoodGeometry): [number, number] {
  const parts = polygons(geom).map((p) => ({ geom: { type: 'Polygon', coordinates: p } as GeoJSON.Polygon }));
  const largest = parts
    .map((p) => {
      const [[x0, y0], [x1, y1]] = getBounds(p.geom);
      return { ...p, b: [x0, y0, x1, y1], size: (x1 - x0) * (y1 - y0) };
    })
    .sort((a, b) => b.size - a.size)[0];

  const [x0, y0, x1, y1] = largest.b;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  if (containsPoint(largest.geom, cx, cy)) return [cx, cy];

  for (const steps of [10, 25, 60]) {
    let best: [number, number] | null = null;
    let bestDist = Infinity;
    for (let i = 1; i < steps; i++) {
      for (let j = 1; j < steps; j++) {
        const x = x0 + ((x1 - x0) * i) / steps;
        const y = y0 + ((y1 - y0) * j) / steps;
        if (!containsPoint(largest.geom, x, y)) continue;
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = [x, y];
        }
      }
    }
    if (best) return best;
  }
  return [cx, cy];
}
