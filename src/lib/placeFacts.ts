// Turns a lookup response into the grouped rows shown in the "About this place"
// panel, and tidies the API's raw labels ("77Th Street", "South La", "Mar Vista NC",
// "Los Angeles USD") into display text.

import type { LAGeographyResponse } from '$lib/api/laGeography';

export interface Fact {
  label: string;
  value: string;
  detail?: string;
}

export interface FactGroup {
  title: string;
  icon: string; // Font Awesome class
  facts: Fact[];
}

/** "77Th Street" → "77th Street" */
function fixOrdinals(s: string): string {
  return s.replace(/(\d)(St|Nd|Rd|Th)\b/g, (_, d: string, suf: string) => d + suf.toLowerCase());
}

/** "South La" → "South LA" */
export function cleanRegion(s: string): string {
  return s.replace(/\bLa\b/g, 'LA');
}

/** "Mar Vista NC" → "Mar Vista"; "… Area Ndc" → "… Area". Null when outside LA city. */
export function cleanNeighborhoodCouncil(s: string): string | null {
  if (/^N\/A/i.test(s)) return null;
  return s.replace(/\s+N?DC$|\s+NC$/i, '').trim();
}

/** "Los Angeles USD" / "Santa Monica-Malibu Unif School" → "… Unified" */
export function cleanSchoolDistrict(s: string): string {
  return s.replace(/\s+(USD|Unif(ied)?(\s+School)?)$/i, ' Unified').trim();
}

/** "Fire Station 62" → "Station 62"; "3" → "Station 3" */
export function fireStationLabel(station: string): string {
  if (/^\d+$/.test(station.trim())) return `Station ${station.trim()}`;
  return station.replace(/^Fire\s+Station/i, 'Station');
}

function policeFact(le: NonNullable<LAGeographyResponse['law_enforcement']>): Fact {
  if (le.agency === 'LAPD' && le.division) {
    const div = fixOrdinals(le.division);
    return {
      label: 'Police',
      value: /division$/i.test(div) ? div : `${div} Division`,
      detail: ['LAPD', le.bureau].filter(Boolean).join(' · ')
    };
  }
  // City police departments: the station is just the city name, so the agency says it all.
  if (le.type === 'municipal' || !le.station) return { label: 'Police', value: le.agency };
  return {
    label: 'Police',
    value: /station$/i.test(le.station) ? le.station : `${le.station} Station`,
    detail: le.agency
  };
}

function fireFact(fire: NonNullable<LAGeographyResponse['fire']>): Fact {
  const agency = fire.type === 'contract' ? `${fire.agency}, by contract` : fire.agency;
  if (!fire.station) return { label: 'Fire', value: agency };
  return { label: 'Fire', value: fireStationLabel(fire.station), detail: agency };
}

export function buildFactGroups(data: LAGeographyResponse): FactGroup[] {
  const nb = data.layers.la_neighborhoods_comprehensive;
  const category = data.place?.placeCategory;
  const region = data.layers.la_regions?.name;

  // Place
  const place: Fact[] = [];
  if (nb) {
    if (category === 'standalone_city') {
      place.push({ label: 'City', value: nb.name });
    } else if (category === 'unincorporated_area') {
      place.push({ label: 'Community', value: nb.name, detail: 'Unincorporated LA County' });
    } else {
      place.push({ label: 'Neighborhood', value: nb.name });
      if (nb.type && nb.type !== 'Unknown') place.push({ label: 'City', value: nb.type });
    }
  }
  const nc = data.layers.la_neighborhood_councils?.name;
  const ncName = nc ? cleanNeighborhoodCouncil(nc) : null;
  if (ncName) place.push({ label: 'Neighborhood council', value: ncName });
  if (region) place.push({ label: 'Region', value: cleanRegion(region) });

  // Public safety
  const safety: Fact[] = [];
  if (data.law_enforcement) safety.push(policeFact(data.law_enforcement));
  if (data.fire) safety.push(fireFact(data.fire));

  // Government
  const gov: Fact[] = [];
  const rep = data.representation;
  if (rep?.type === 'city_council') {
    gov.push(
      rep.representative
        ? { label: 'City council', value: rep.representative, detail: `District ${rep.district}` }
        : { label: 'City council', value: `District ${rep.district}` }
    );
  }
  const supDistrict =
    data.supervisorDistrict ??
    (rep?.type === 'county_supervisor' ? `District ${rep.district}` : undefined);
  if (supDistrict) {
    gov.push({ label: 'County supervisor', value: supDistrict, detail: 'LA County Board of Supervisors' });
  }
  const school = data.layers.la_county_school_districts?.label;
  if (school) gov.push({ label: 'School district', value: cleanSchoolDistrict(school) });

  return [
    { title: 'Place', icon: 'fa-location-dot', facts: place },
    { title: 'Public safety', icon: 'fa-shield-halved', facts: safety },
    { title: 'Government', icon: 'fa-landmark', facts: gov }
  ].filter((g) => g.facts.length > 0);
}

/** The page's one-sentence answer: "This place is in the Mar Vista neighborhood of Los Angeles". */
export function placeHeadline(data: LAGeographyResponse | null, outsideLACounty: boolean): string {
  if (outsideLACounty) return 'This place is outside Los Angeles County';
  if (!data) return 'Where this place fits in Los Angeles County';

  const neighborhood = data.layers.la_neighborhoods_comprehensive?.name;
  const city = data.layers.la_neighborhoods_comprehensive?.type;

  switch (data.place?.placeCategory) {
    case 'unincorporated_area':
      return neighborhood
        ? `This place is in unincorporated ${neighborhood} in Los Angeles County`
        : 'This place is in an unincorporated part of Los Angeles County';
    case 'standalone_city':
      return neighborhood
        ? `This place is in the city of ${neighborhood} in Los Angeles County`
        : 'This place is in a city in Los Angeles County';
  }
  if (neighborhood && city) return `This place is in the ${neighborhood} neighborhood of ${city}`;
  if (neighborhood) return `This place is in the ${neighborhood} neighborhood`;
  if (city) return `This place is in ${city}`;
  return 'Where this place fits in Los Angeles County';
}

/** Short place name for page titles: "Mar Vista, Los Angeles", "Santa Monica". */
export function placeShortName(data: LAGeographyResponse | null): string | null {
  const nb = data?.layers.la_neighborhoods_comprehensive;
  if (!nb) return null;
  if (data?.place?.placeCategory === 'la_city_neighborhood' && nb.type && nb.type !== 'Unknown') {
    return `${nb.name}, ${nb.type}`;
  }
  return nb.name;
}
