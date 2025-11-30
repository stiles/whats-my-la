export interface LAGeographyResponse {
  coordinates: {
    lat: number;
    lon: number;
  };
  layers: {
    la_neighborhoods_comprehensive?: {
      name: string;
      slug: string;
      region: string;
      city: string | null;
      type: string;
      area_sqmi: number;
    };
    la_regions?: {
      name: string;
      slug: string;
      area_sqmi: number;
    };
    lapd_divisions?: {
      aprec: string;
      prec: string;
      area_sqmi: number;
    };
    lapd_bureaus?: {
      name: string;
      bureau: string;
      area_sqmi: number;
    };
    lafd_station_boundaries?: {
      name: string;
      precinctid: string;
      area_sqmi: number;
    };
    la_city_council_districts?: {
      district_name: string;
      district: string;
      area_sqmi: number;
    };
    la_county_school_districts?: {
      label: string;
      abbr: string;
      area_sqmi: number;
    };
  };
  demographics?: {
    la_neighborhoods_comprehensive?: {
      pop_total: number;
      pop_hispanic: number;
      pop_not_hispanic: number;
      pop_white_nh: number;
      pop_black_nh: number;
      pop_asian_nh: number;
      pop_aian_nh: number;
      pop_nhpi_nh: number;
      pop_other_nh: number;
      pop_two_or_more_nh: number;
      housing_total: number;
      housing_occupied: number;
      housing_vacant: number;
    };
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

  return response.json();
}

