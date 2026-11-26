// Site palette for code that can't use the Tailwind theme (Mapbox paint
// properties, inline styles). Keep in sync with the @theme block in app.css.
// Validated as a categorical set (CVD and normal-vision separation) on the
// gray basemap and on white.

import type { NeighborhoodType } from '$lib/api/neighborhoods';

export const ROSE = '#d1495b'; // primary: brand, City of LA
export const ROSE_INK = '#c93347'; // primary for small text / white-on-color (AA on white)
export const TEAL = '#008aa3'; // secondary: cities
export const GOLD = '#c98a1a'; // accent: unincorporated areas

export const TYPE_COLORS: Record<NeighborhoodType, string> = {
  'segment-of-a-city': ROSE,
  'standalone-city': TEAL,
  'unincorporated-area': GOLD
};
