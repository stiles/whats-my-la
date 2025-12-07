// Raw API response from the LA Geography API
interface SimpleAPIDemographics {
  population: number;
  pop_hispanic: number;
  pop_white_nh: number;
  pop_black_nh: number;
  pop_asian_nh: number;
  pop_other_nh: number;
}

interface RawAPIResponse {
  status: string;
  query: {
    lat: number;
    lon: number;
  };
  results: {
    neighborhood?: string;
    region?: string;
    city?: string;
    zip_code?: string;
    supervisor_district?: string;
    neighborhood_council?: string;
    council_district?: string | null;
    school_district?: string;
    neighborhood_demographics?: SimpleAPIDemographics;
    city_demographics?: SimpleAPIDemographics;
    // New structured fields
    law_enforcement?: {
      agency: string;
      division?: string;
      bureau?: string;
      station?: string;
      type?: string;
    };
    fire?: {
      agency: string;
      station?: string | null;
      type?: 'contract' | 'direct' | 'municipal';
    };
    representation?: {
      type: string;
      district: string;
      representative?: string | null;
    };
    // governance / type metadata
    neighborhood_type?: string;
    neighborhood_city_slug?: string | null;
    place_category?: string;
    city_is_incorporated?: boolean;
    [key: string]: any; // Other fields we might not use
  };
}

// Our app's internal format
export interface SimpleDemographics {
  population: number;
  pop_hispanic: number;
  pop_white_nh: number;
  pop_black_nh: number;
  pop_asian_nh: number;
  pop_other_nh: number;
}

export interface LAGeographyResponse {
  coordinates: {
    lat: number;
    lon: number;
  };
  layers: {
    la_neighborhoods_comprehensive?: {
      name: string;
      type: string;
      area_sqmi?: number;
    };
    la_regions?: {
      name: string;
      area_sqmi?: number;
    };
    zip_code?: string;
    la_neighborhood_councils?: {
      name: string;
      area_sqmi?: number;
    };
    la_county_school_districts?: {
      label: string;
      area_sqmi?: number;
    };
  };
  law_enforcement?: {
    agency: string;
    division?: string;
    bureau?: string;
    station?: string;
    type?: string;
  };
  fire?: {
    agency: string;
    station?: string | null;
    type?: 'contract' | 'direct' | 'municipal';
  };
  representation?: {
    type: string;
    district: string;
    representative?: string | null;
  };
  demographics?: {
    neighborhood?: SimpleDemographics;
    city?: SimpleDemographics;
  };
  place?: {
    neighborhoodType?: string | null;
    neighborhoodCitySlug?: string | null;
    placeCategory?: string | null;
    cityIsIncorporated?: boolean | null;
  };
}

export async function getLAGeography(
  lat: number,
  lon: number
): Promise<LAGeographyResponse> {
  const response = await fetch(
    `https://api.stilesdata.com/la-geography/lookup?lat=${lat}&lon=${lon}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch geography data: ${response.statusText}`);
  }

  const rawData: RawAPIResponse = await response.json();
  // console.log('Raw API Response:', rawData);
  
  // Validate the response structure
  if (!rawData || rawData.status !== 'success' || !rawData.results) {
    throw new Error('Invalid API response format');
  }
  
  // Transform the raw API response to our internal format
  const transformedData: LAGeographyResponse = {
    coordinates: {
      lat: rawData.query.lat,
      lon: rawData.query.lon
    },
    layers: {}
  };

  // Map neighborhood
  if (rawData.results.neighborhood) {
    transformedData.layers.la_neighborhoods_comprehensive = {
      name: rawData.results.neighborhood,
      type: rawData.results.city || 'Unknown'
    };
  }

  // Map region
  if (rawData.results.region) {
    transformedData.layers.la_regions = {
      name: rawData.results.region
    };
  }

  // Map ZIP code
  if (rawData.results.zip_code) {
    transformedData.layers.zip_code = rawData.results.zip_code;
  }

  // Map neighborhood council (LA City only)
  if (rawData.results.neighborhood_council) {
    transformedData.layers.la_neighborhood_councils = {
      name: rawData.results.neighborhood_council
    };
  }

  // Map school district
  if (rawData.results.school_district) {
    transformedData.layers.la_county_school_districts = {
      label: rawData.results.school_district
    };
  }

  // Map law enforcement (new structured field)
  if (rawData.results.law_enforcement) {
    transformedData.law_enforcement = rawData.results.law_enforcement;
  }

  // Map fire (new structured field)
  if (rawData.results.fire) {
    transformedData.fire = rawData.results.fire;
  }

  // Map political representation (new structured field)
  if (rawData.results.representation) {
    transformedData.representation = rawData.results.representation;
  }

  // Map demographics
  if (rawData.results.neighborhood_demographics) {
    transformedData.demographics = {
      ...(transformedData.demographics || {}),
      neighborhood: {
        population: rawData.results.neighborhood_demographics.population,
        pop_hispanic: rawData.results.neighborhood_demographics.pop_hispanic,
        pop_white_nh: rawData.results.neighborhood_demographics.pop_white_nh,
        pop_black_nh: rawData.results.neighborhood_demographics.pop_black_nh,
        pop_asian_nh: rawData.results.neighborhood_demographics.pop_asian_nh,
        pop_other_nh: rawData.results.neighborhood_demographics.pop_other_nh,
      },
    };
  }

  if (rawData.results.city_demographics) {
    transformedData.demographics = {
      ...(transformedData.demographics || {}),
      city: {
        population: rawData.results.city_demographics.population,
        pop_hispanic: rawData.results.city_demographics.pop_hispanic,
        pop_white_nh: rawData.results.city_demographics.pop_white_nh,
        pop_black_nh: rawData.results.city_demographics.pop_black_nh,
        pop_asian_nh: rawData.results.city_demographics.pop_asian_nh,
        pop_other_nh: rawData.results.city_demographics.pop_other_nh,
      },
    };
  }

  // Map place / governance metadata
  const { neighborhood_type, neighborhood_city_slug, place_category, city_is_incorporated } =
    rawData.results;

  if (
    neighborhood_type !== undefined ||
    neighborhood_city_slug !== undefined ||
    place_category !== undefined ||
    city_is_incorporated !== undefined
  ) {
    transformedData.place = {
      neighborhoodType: neighborhood_type ?? null,
      neighborhoodCitySlug: neighborhood_city_slug ?? null,
      placeCategory: place_category ?? null,
      cityIsIncorporated:
        typeof city_is_incorporated === 'boolean' ? city_is_incorporated : null,
    };
  }

  // console.log('Transformed data:', transformedData);
  
  return transformedData;
}

