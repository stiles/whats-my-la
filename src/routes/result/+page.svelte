<script lang="ts">
  import type { PageData } from './$types';
  import DemographicsPanel from '$lib/components/DemographicsPanel.svelte';
  import LocationMap from '$lib/components/LocationMap.svelte';
  import Meta, { SITE_URL } from '$lib/components/Meta.svelte';
  import PlaceFacts from '$lib/components/PlaceFacts.svelte';
  import { buildFactGroups, placeHeadline, placeShortName } from '$lib/placeFacts';
  import { formatCoordinates } from '$lib/utils/formatters';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let { lat, lon, address, outsideLACounty, geography, error, invalid } = $derived(data);
  let headline = $derived(placeHeadline(geography, outsideLACounty));
  let factGroups = $derived(geography ? buildFactGroups(geography) : []);
  let displayAddress = $derived(address.replace(/, United States$/, ''));

  // Social cards name the place, not the street address.
  let shortName = $derived(placeShortName(geography));
  let metaTitle = $derived(shortName
    ? `${shortName} – What's My LA?`
    : outsideLACounty
      ? "Outside LA County – What's My LA?"
      : "What's My LA?");
  let metaDescription = $derived(geography
    ? `${headline}. See its police and fire coverage, representatives and demographics.`
    : invalid
      ? "Los Angeles County's geography is confusing. Drop in an address to see where it fits."
      : headline);
  let canonical = $derived(invalid ? `${SITE_URL}/` : `${SITE_URL}/result?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`);
</script>

<Meta title={metaTitle} description={metaDescription} url={canonical} />

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
  {#if invalid}
    <div class="max-w-xl mx-auto py-24 text-center">
      <h1 class="text-3xl font-bold text-text">Hmm, where is that?</h1>
      <p class="mt-3 text-text-muted">{error}</p>
      <a href="/" class="mt-6 inline-block text-primary-ink hover:underline">← Search for an address</a>
    </div>
  {:else}
    <!-- Header -->
    <header class="mb-6">
      <a href="/" class="text-sm text-primary-ink hover:underline">← Search again</a>
      <h1 class="mt-2 text-3xl md:text-4xl font-bold text-text text-balance">{headline}</h1>
      {#if displayAddress}
        <p class="mt-2 text-text-muted">{displayAddress}</p>
      {/if}
      <p class="mt-2 text-xs text-gray-500 tabular-nums">{formatCoordinates(lat, lon)}</p>
    </header>

    {#if error}
      <div class="mb-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800 mb-4">{error}</p>
        <a href="/" class="text-primary-ink hover:underline">← Go back and try again</a>
      </div>
    {/if}

    {#if outsideLACounty}
      <p class="mb-6 text-sm text-text-muted">
        This spot is outside Los Angeles County, so LA-specific layers and demographics aren’t available here.
      </p>
    {/if}

    <!-- Map beside the facts on wide screens; stacked on narrow ones. Keyed so
         a new lookup gets a fresh map instead of a stale one. -->
    <div class="grid gap-6 mb-8 {factGroups.length ? 'lg:grid-cols-[3fr_2fr]' : ''}">
      {#key `${lat},${lon}`}
        <LocationMap
          {lat}
          {lon}
          address={displayAddress}
          neighborhoodName={geography?.layers.la_neighborhoods_comprehensive?.name}
          cityName={geography?.layers.la_neighborhoods_comprehensive?.type}
          heightClass="h-80 lg:h-full lg:min-h-[26rem]"
        />
      {/key}
      {#if factGroups.length}
        <div>
          <h2 class="sr-only">About this place</h2>
          <PlaceFacts groups={factGroups} />
        </div>
      {/if}
    </div>

    {#if geography?.demographics}
      <DemographicsPanel
        neighborhood={geography.demographics.neighborhood}
        city={geography.demographics.city}
        neighborhoodLabel={geography.layers.la_neighborhoods_comprehensive?.name || 'Neighborhood'}
        cityLabel={geography.layers.la_neighborhoods_comprehensive?.type || 'City'}
      />
    {/if}
  {/if}
</div>
