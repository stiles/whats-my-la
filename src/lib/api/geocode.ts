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

export async function geocodeAddress(
  address: string,
  accessToken: string
): Promise<GeocodeResponse> {
  const encoded = encodeURIComponent(address);
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?` +
      `access_token=${accessToken}&proximity=-118.2437,34.0522&limit=5&types=address,place`
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.statusText}`);
  }

  return response.json();
}

export async function reverseGeocode(
  lon: number,
  lat: number,
  accessToken: string
): Promise<GeocodeResponse> {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?` +
      `access_token=${accessToken}&types=address`
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.statusText}`);
  }

  return response.json();
}

