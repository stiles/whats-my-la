<script lang="ts">
  import { toPng } from 'html-to-image';
  import type { LAGeographyResponse } from '$lib/api/laGeography';
import { formatNumber, formatDensity } from '$lib/utils/formatters';

export let lat: number;
export let lon: number;
export let geographyData: LAGeographyResponse;

  let downloading = false;
  let showCard = false;

  async function downloadCard() {
    downloading = true;
    showCard = true;

    // Wait for card to render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = document.getElementById('share-card');
      if (!element) {
        throw new Error('Card element not found');
      }

      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'my-la-geography.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate card:', err);
      alert('Failed to generate card. Please try again.');
    } finally {
      downloading = false;
      showCard = false;
    }
  }

  // Calculate approximate centroid by taking the coordinates but rounding to ~neighborhood level
  // This provides general location without exposing exact address
  function getApproximateCoords() {
    // Round to 2 decimal places (~1km precision) instead of full precision
    const approxLat = Math.round(lat * 100) / 100;
    const approxLon = Math.round(lon * 100) / 100;
    return { lat: approxLat, lon: approxLon };
  }

  function shareOnTwitter() {
    const { lat: approxLat, lon: approxLon } = getApproximateCoords();
    const text = `Check out my LA geography! I'm in ${geographyData.layers.la_neighborhoods_comprehensive?.name || 'LA'} 📍`;
    const url = `${window.location.origin}/result?lat=${approxLat}&lon=${approxLon}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }

  function copyLink() {
    const { lat: approxLat, lon: approxLon } = getApproximateCoords();
    const url = `${window.location.origin}/result?lat=${approxLat}&lon=${approxLon}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  }

  $: neighborhood = geographyData.layers.la_neighborhoods_comprehensive?.name || 'Unknown';
  $: region = geographyData.layers.la_regions?.name || 'Unknown';
  $: cityName = geographyData.layers.la_neighborhoods_comprehensive?.type
    || geographyData.layers.la_regions?.name
    || '';
  $: lapd = geographyData.layers.lapd_divisions?.aprec || 'N/A';
  $: council = geographyData.layers.la_city_council_districts?.district_name || 'N/A';
  $: population = geographyData.demographics?.neighborhood?.population
    || geographyData.demographics?.city?.population
    || 0;
  // We no longer have area in the new API; skip density if unknown
  $: area = geographyData.layers.la_neighborhoods_comprehensive?.area_sqmi || 0;
  $: density = area > 0 ? formatDensity(population, area) : 'N/A';

  // For the share card header we use a softer location line instead of the full address
  $: headerLocation =
    neighborhood && cityName
      ? `${neighborhood}, ${cityName}`
      : neighborhood !== 'Unknown'
      ? neighborhood
      : cityName || 'Los Angeles County';
</script>

<div class="bg-surface rounded-lg shadow-md p-5 border border-border-subtle">
  <h3 class="text-xl font-semibold text-text mb-3">Share your results</h3>

  <div class="flex flex-wrap gap-2 mb-5 text-sm text-text">
    <!-- <button
      on:click={downloadCard}
      disabled={downloading}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-white hover:bg-primary transition-colors disabled:opacity-50"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {downloading ? 'Generating...' : 'Download Card'}
    </button> -->

    <button
      on:click={shareOnTwitter}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle text-text hover:bg-surface-muted/60 transition-colors"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
      Share
    </button>

    <button
      on:click={copyLink}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle text-text hover:bg-surface-muted/60 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      Copy
    </button>
  </div>

  <!-- Hidden shareable card -->
  {#if showCard || downloading}
    <div class="fixed top-0 left-[-9999px]">
      <div
        id="share-card"
        class="w-[800px] h-[1000px] bg-gradient-to-br from-primary to-secondary p-12 text-white"
      >
          <div class="flex flex-col h-full">
            <!-- Header -->
            <div class="mb-8">
              <h1 class="text-5xl font-bold mb-4">My LA Geography</h1>
              {#if headerLocation}
                <p class="text-2xl opacity-90">{headerLocation}</p>
              {/if}
            </div>

          <!-- Main Info -->
          <div class="flex-1 space-y-6">
            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <div class="text-xl opacity-80 mb-2">Neighborhood</div>
              <div class="text-4xl font-bold">{neighborhood}</div>
            </div>

            <div class="bg-white/10 backdrop-blur rounded-xl p-6">
              <div class="text-xl opacity-80 mb-2">Region</div>
              <div class="text-3xl font-bold">{region}</div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                <div class="text-lg opacity-80 mb-2">Police Division</div>
                <div class="text-2xl font-bold">{lapd}</div>
              </div>
              <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                <div class="text-lg opacity-80 mb-2">Council District</div>
                <div class="text-2xl font-bold">{council}</div>
              </div>
            </div>

            {#if population > 0}
              <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                <div class="text-xl opacity-80 mb-4">Demographics</div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-lg opacity-80">Population</div>
                    <div class="text-3xl font-bold">{formatNumber(population)}</div>
                  </div>
                  <div>
                    <div class="text-lg opacity-80">Density</div>
                    <div class="text-3xl font-bold">{density}/mi²</div>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Footer -->
          <div class="mt-8 pt-6 border-t border-white border-opacity-20">
            <div class="text-2xl font-bold">whatsmyla.com</div>
            <div class="text-lg opacity-80">Discover your LA geography</div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

