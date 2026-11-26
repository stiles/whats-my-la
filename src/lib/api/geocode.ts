export interface GeocodeFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [lon, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export interface GeocodeResponse {
  type: string;
  query: string[];
  features: GeocodeFeature[];
  attribution: string;
}

// Bounding box around LA County (minLon,minLat,maxLon,maxLat) so forward
// searches don't return matches in other states.
const LA_COUNTY_BBOX = '-118.95,33.70,-117.65,34.82';

export async function geocodeAddress(
  address: string,
  accessToken: string,
  signal?: AbortSignal
): Promise<GeocodeResponse> {
  const encoded = encodeURIComponent(address);
  const params = new URLSearchParams({
    access_token: accessToken,
    proximity: '-118.2437,34.0522',
    bbox: LA_COUNTY_BBOX,
    limit: '6',
    // v5 no longer returns landmarks (POIs); those need Mapbox's Search Box API.
    types: 'address,neighborhood,locality,place,postcode'
  });
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?${params}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  return response.json();
}

export async function reverseGeocode(
  lon: number,
  lat: number,
  accessToken: string,
  fetchFn: typeof fetch = fetch
): Promise<GeocodeResponse> {
  const response = await fetchFn(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?` +
      `access_token=${accessToken}&types=address`
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.statusText}`);
  }

  return response.json();
}

