<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getLAGeography, type LAGeographyResponse } from '$lib/api/laGeography';
  import { reverseGeocode } from '$lib/api/geocode';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import GeographyCard from '$lib/components/GeographyCard.svelte';
  import DemographicsPanel from '$lib/components/DemographicsPanel.svelte';
  import ShareCard from '$lib/components/ShareCard.svelte';
  import LocationMap from '$lib/components/LocationMap.svelte';
  import { formatCoordinates } from '$lib/utils/formatters';

  const LA_COUNTY_BBOX = {
    min_lon: -119.0,
    max_lon: -117.6,
    min_lat: 33.7,
    max_lat: 34.8
  };

  let loading = true;
  let error = '';
  let geographyData: LAGeographyResponse | null = null;
  let address = '';
  let lat = 0;
  let lon = 0;
  let outsideLACounty = false;
  let placeHeadline = '';

  onMount(async () => {
    const latParam = $page.url.searchParams.get('lat');
    const lonParam = $page.url.searchParams.get('lon');
    const addressParam = $page.url.searchParams.get('address');

    if (!latParam || !lonParam) {
      error = 'Missing coordinates';
      loading = false;
      return;
    }

    lat = parseFloat(latParam);
    lon = parseFloat(lonParam);
    address = addressParam || '';

    outsideLACounty =
      lat < LA_COUNTY_BBOX.min_lat ||
      lat > LA_COUNTY_BBOX.max_lat ||
      lon < LA_COUNTY_BBOX.min_lon ||
      lon > LA_COUNTY_BBOX.max_lon;

    try {
      // Fetch geography data only for locations inside LA County
      if (!outsideLACounty) {
        geographyData = await getLAGeography(lat, lon);
      }

      // If no address provided, reverse geocode
      if (!address) {
        try {
          const geocodeResult = await reverseGeocode(lon, lat, PUBLIC_MAPBOX_ACCESS_TOKEN);
          if (geocodeResult.features.length > 0) {
            address = geocodeResult.features[0].place_name;
            // console.log('Address:', address);
          }
        } catch (err) {
          console.error('Reverse geocode failed:', err);
          // address = formatCoordinates(lat, lon);
        }
      }
    } catch (err) {
      error = 'I couldn’t look this spot up. The LA Geography API may be having a moment.';
      console.error('Error:', err);
    } finally {
      loading = false;
    }
  });

  // Build the place headline reactively based on geography data
  $: {
    if (outsideLACounty) {
      placeHeadline = 'This place is outside Los Angeles County';
    } else if (!geographyData) {
      placeHeadline = '';
    } else {
      const neighborhood = geographyData.layers.la_neighborhoods_comprehensive?.name;
      const city = geographyData.layers.la_neighborhoods_comprehensive?.type;
      const placeCategory = geographyData.place?.placeCategory || null;

      if (placeCategory === 'unincorporated_area') {
        if (neighborhood) {
          placeHeadline = `This place is in unincorporated ${neighborhood} in Los Angeles County`;
        } else {
          placeHeadline = 'This place is in an unincorporated part of Los Angeles County';
        }
      } else if (placeCategory === 'standalone_city') {
        if (neighborhood) {
          placeHeadline = `This place is in the city of ${neighborhood} in Los Angeles County`;
        } else {
          placeHeadline = 'This place is in a city in Los Angeles County';
        }
      } else if (neighborhood && city) {
        placeHeadline = `This place is in the ${neighborhood} neighborhood of ${city}`;
      } else if (neighborhood) {
        placeHeadline = `This place is in the ${neighborhood} neighborhood`;
      } else if (city) {
        placeHeadline = `This place is in ${city}`;
      } else {
        placeHeadline = 'Where this place fits in Los Angeles County';
      }
    }
  }

  // Icon SVGs
  const icons = {
    neighborhood: '<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
    region: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>',
    police: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
    fire: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>',
    council: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
    school: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>',
    neighborhoodCouncil: '<svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0H5z" /></svg>',
  };
</script>

<svelte:head>
  <title>{address || 'Results'} - What's My LA?</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  {#if loading}
    <div class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
      <p class="text-gray-600">Figuring out where this spot fits in LA…</p>
    </div>
  {:else}
    <!-- Header -->
    <div class="mb-8">
      <a href="/" class="text-primary hover:underline mb-2 inline-block">← Search again</a>
      <h1 class="text-3xl md:text-4xl font-bold text-text mb-3">{placeHeadline}</h1>
      {#if address}
        <p class="text-base text-gray-600">
          <span class="font-semibold">Address:</span>
          {address.replace(/, United States$/, '')}
        </p>
      {/if}
      <p class="text-sm text-gray-500 mt-1 coordinates">
        <span class="font-semibold">Coordinates:</span>
        {formatCoordinates(lat, lon)}
      </p>
    </div>

    <!-- Map -->
    <div class="mb-4">
      <LocationMap
        {lat}
        {lon}
        {address}
        neighborhoodName={geographyData?.layers.la_neighborhoods_comprehensive?.name}
        cityName={geographyData?.layers.la_neighborhoods_comprehensive?.type}
      />
    </div>

    {#if outsideLACounty}
      <div class="mb-10">
        <p class="text-sm text-gray-700">
          This spot is outside Los Angeles County, so LA-specific layers and demographics aren’t available here.
        </p>
      </div>
    {/if}

    {#if error}
      <div class="mb-10 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800 mb-4">{error}</p>
        <a href="/" class="text-primary hover:underline">← Go back and try again</a>
      </div>
    {/if}

    {#if geographyData}

    <!-- Geography Cards -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-text mb-6">About this place</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#if geographyData.layers.la_neighborhoods_comprehensive}
          {#if geographyData.place?.placeCategory === 'unincorporated_area'}
            <GeographyCard
              icon={icons.neighborhood}
              label="Unincorporated area"
              value={geographyData.layers.la_neighborhoods_comprehensive.name}
              subtitle="Unincorporated Los Angeles County"
              prominent={true}
            />
          {:else if geographyData.place?.placeCategory === 'standalone_city'}
            <GeographyCard
              icon={icons.neighborhood}
              label="City"
              value={geographyData.layers.la_neighborhoods_comprehensive.name}
              subtitle="Incorporated city in Los Angeles County"
              prominent={true}
            />
          {:else}
            <GeographyCard
              icon={icons.neighborhood}
              label="Neighborhood (City of LA)"
              value={geographyData.layers.la_neighborhoods_comprehensive.name}
              subtitle={geographyData.layers.la_neighborhoods_comprehensive.type}
              prominent={true}
            />
          {/if}
        {/if}

        {#if geographyData.layers.la_neighborhood_councils}
          <GeographyCard
            icon={icons.neighborhoodCouncil}
            label="Neighborhood Council"
            value={geographyData.layers.la_neighborhood_councils.name.replace(/NC/, '').replace('N/A (outside LA City)', 'Outside LA City')}
          />
        {/if}

        {#if geographyData.layers.la_regions}
          <GeographyCard
            icon={icons.region}
            label="LA County Region"
            value={geographyData.layers.la_regions.name}
          />
        {/if}

        {#if geographyData.layers.lapd_divisions}
          <GeographyCard
            icon={icons.police}
            label="Police Division"
            value={geographyData.layers.lapd_divisions.aprec.replace('N/A (outside LAPD jurisdiction)', 'LA County Sheriff')}
          />
        {/if}

        {#if geographyData.layers.lafd_station_boundaries}
          <GeographyCard
            icon={icons.fire}
            label="Fire Station"
            value={geographyData.layers.lafd_station_boundaries.name.replace('N/A (LACOFD jurisdiction)', 'LA County Fire')}
            subtitle="LAFD"
          />
        {/if}

        {#if geographyData.layers.la_city_council_districts}
          <GeographyCard
            icon={icons.council}
            label="City Council"
            value={geographyData.layers.la_city_council_districts.district_name}
            subtitle={`District ${geographyData.layers.la_city_council_districts.district}`}
          />
        {/if}

        {#if geographyData.layers.la_county_school_districts}
          <GeographyCard
            icon={icons.school}
            label="School District"
            value={geographyData.layers.la_county_school_districts.label.replace(/USD/, '')}
          />
        {/if}
      </div>
    </div>

    <!-- Demographics -->
    {#if geographyData.demographics}
      <div class="mb-12 max-w-5xl">
        <DemographicsPanel
          neighborhood={geographyData.demographics.neighborhood}
          city={geographyData.demographics.city}
          neighborhoodLabel={geographyData.layers.la_neighborhoods_comprehensive?.name || 'Neighborhood'}
          cityLabel={geographyData.layers.la_neighborhoods_comprehensive?.type || 'City'}
        />
      </div>
    {/if}

    <!-- Share Card -->
    <div class="mb-12">
      <ShareCard
        {lat}
        {lon}
        {geographyData}
      />
    </div>
  {/if}
{/if}
</div>

