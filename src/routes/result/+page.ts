import type { PageLoad } from './$types';
import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
import { getLAGeography, type LAGeographyResponse } from '$lib/api/laGeography';
import { reverseGeocode } from '$lib/api/geocode';
import { parseCoord } from '$lib/utils/coords';

// Generous box around LA County; points outside it skip the LA lookup.
const LA_COUNTY_BBOX = { minLon: -119.0, maxLon: -117.6, minLat: 33.7, maxLat: 34.8 };

// Runs on the server for the first request, so link previews and the initial
// HTML have the real answer; SvelteKit reuses those responses during hydration.
export const load: PageLoad = async ({ url, fetch }) => {
  const lat = parseCoord(url.searchParams.get('lat'), -90, 90);
  const lon = parseCoord(url.searchParams.get('lon'), -180, 180);
  let address = url.searchParams.get('address') ?? '';

  if (lat === null || lon === null) {
    return {
      lat: 0,
      lon: 0,
      address,
      outsideLACounty: false,
      geography: null as LAGeographyResponse | null,
      error: 'That link is missing a valid location. Try searching for an address instead.',
      invalid: true
    };
  }

  const outsideLACounty =
    lat < LA_COUNTY_BBOX.minLat ||
    lat > LA_COUNTY_BBOX.maxLat ||
    lon < LA_COUNTY_BBOX.minLon ||
    lon > LA_COUNTY_BBOX.maxLon;

  // The lookup and the reverse geocode are independent; run them together.
  const [geoResult, addressResult] = await Promise.allSettled([
    outsideLACounty ? Promise.resolve(null) : getLAGeography(lat, lon, fetch),
    address ? Promise.resolve(null) : reverseGeocode(lon, lat, PUBLIC_MAPBOX_ACCESS_TOKEN, fetch)
  ]);

  if (addressResult.status === 'fulfilled' && addressResult.value?.features.length) {
    address = addressResult.value.features[0].place_name;
  } else if (addressResult.status === 'rejected') {
    console.error('Reverse geocode failed:', addressResult.reason);
  }

  let geography: LAGeographyResponse | null = null;
  let error = '';
  if (geoResult.status === 'fulfilled') {
    geography = geoResult.value;
  } else {
    console.error('LA Geography lookup failed:', geoResult.reason);
    error = 'I couldn’t look this spot up. The LA Geography API may be having a moment.';
  }

  return { lat, lon, address, outsideLACounty, geography, error, invalid: false };
};
