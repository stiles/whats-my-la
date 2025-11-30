<script lang="ts">
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import { geocodeAddress } from '$lib/api/geocode';
  import { goto } from '$app/navigation';

  let searchQuery = '';
  let suggestions: any[] = [];
  let loading = false;
  let showSuggestions = false;
  let error = '';

  let debounceTimer: ReturnType<typeof setTimeout>;

  async function handleSearch() {
    if (!searchQuery || searchQuery.length < 3) {
      suggestions = [];
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      loading = true;
      error = '';

      try {
        const result = await geocodeAddress(searchQuery, PUBLIC_MAPBOX_ACCESS_TOKEN);
        suggestions = result.features;
        showSuggestions = true;
      } catch (err) {
        error = 'Failed to search address';
        console.error(err);
      } finally {
        loading = false;
      }
    }, 300);
  }

  function selectSuggestion(feature: any) {
    const [lon, lat] = feature.center;
    showSuggestions = false;
    searchQuery = feature.place_name;
    goto(`/result?lat=${lat}&lon=${lon}&address=${encodeURIComponent(feature.place_name)}`);
  }

  async function useCurrentLocation() {
    loading = true;
    error = '';

    if (!navigator.geolocation) {
      error = 'Geolocation is not supported by your browser';
      loading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        loading = false;
        goto(`/result?lat=${lat}&lon=${lon}`);
      },
      (err) => {
        error = 'Unable to get your location';
        loading = false;
        console.error(err);
      }
    );
  }

  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="relative">
    <input
      type="text"
      bind:value={searchQuery}
      on:input={handleSearch}
      on:focus={() => (showSuggestions = suggestions.length > 0)}
      on:blur={handleBlur}
      placeholder="Enter an LA address or neighborhood..."
      class="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-300 focus:border-primary focus:outline-none shadow-lg transition-all"
    />

    {#if loading}
      <div class="absolute right-6 top-1/2 -translate-y-1/2">
        <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    {/if}

    {#if showSuggestions && suggestions.length > 0}
      <div class="absolute w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-10">
        {#each suggestions as suggestion}
          <button
            type="button"
            on:click={() => selectSuggestion(suggestion)}
            class="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          >
            <div class="font-medium text-gray-900">{suggestion.text}</div>
            <div class="text-sm text-gray-600">{suggestion.place_name}</div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if error}
    <div class="mt-2 text-red-600 text-sm text-center">{error}</div>
  {/if}

  <div class="mt-6 text-center">
    <button
      on:click={useCurrentLocation}
      disabled={loading}
      class="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Use My Location
    </button>
  </div>
</div>

