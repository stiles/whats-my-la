<script lang="ts">

  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import { geocodeAddress, type GeocodeFeature } from '$lib/api/geocode';
  import { goto } from '$app/navigation';

  const LISTBOX_ID = 'address-suggestions';

  let searchQuery = $state('');
  let suggestions: GeocodeFeature[] = $state([]);
  let open = $state(false);
  let activeIndex = $state(-1); // highlighted suggestion for keyboard users
  let locating = $state(false);
  let error = $state('');

  let debounceTimer: ReturnType<typeof setTimeout>;
  let inFlight: AbortController | null = null;

  function handleInput() {
    clearTimeout(debounceTimer);
    activeIndex = -1;
    if (searchQuery.trim().length < 3) {
      inFlight?.abort();
      suggestions = [];
      open = false;
      return;
    }
    debounceTimer = setTimeout(search, 250);
  }

  async function search() {
    // Cancel the previous request so a slow, older response can't replace a newer one.
    inFlight?.abort();
    const controller = new AbortController();
    inFlight = controller;
    error = '';

    try {
      const result = await geocodeAddress(searchQuery, PUBLIC_MAPBOX_ACCESS_TOKEN, controller.signal);
      suggestions = result.features;
      open = true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      error = 'Address search isn’t working right now. Try again in a moment.';
      console.error(err);
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  }

  function select(feature: GeocodeFeature) {
    const [lon, lat] = feature.center;
    open = false;
    searchQuery = feature.place_name;
    goto(`/result?lat=${lat}&lon=${lon}&address=${encodeURIComponent(feature.place_name)}`);
  }

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        if (!suggestions.length) return;
        e.preventDefault();
        open = true;
        activeIndex = (activeIndex + 1) % suggestions.length;
        break;
      case 'ArrowUp':
        if (!suggestions.length) return;
        e.preventDefault();
        open = true;
        activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
        break;
      case 'Enter':
        // Enter with nothing highlighted takes the top match.
        if (open && suggestions.length) {
          e.preventDefault();
          select(suggestions[Math.max(activeIndex, 0)]);
        }
        break;
      case 'Escape':
        open = false;
        activeIndex = -1;
        break;
    }
  }

  function useCurrentLocation() {
    error = '';
    if (!navigator.geolocation) {
      error = 'Your browser doesn’t support location lookup.';
      return;
    }
    locating = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        locating = false;
        goto(`/result?lat=${coords.latitude.toFixed(6)}&lon=${coords.longitude.toFixed(6)}`);
      },
      (err) => {
        locating = false;
        error = 'Couldn’t get your location. Check your browser’s location permission.';
        console.error(err);
      }
    );
  }

  function handleBlur() {
    // Let a click on a suggestion land before the list closes.
    setTimeout(() => (open = false), 150);
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="relative">
    <input
      type="text"
      bind:value={searchQuery}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={() => (open = suggestions.length > 0)}
      onblur={handleBlur}
      placeholder="Search any LA address or place"
      aria-label="Search for an address or place"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open && suggestions.length > 0}
      aria-controls={LISTBOX_ID}
      aria-activedescendant={activeIndex >= 0 ? `${LISTBOX_ID}-${activeIndex}` : undefined}
      autocomplete="off"
      class="w-full pl-6 pr-16 py-4 md:pl-7 md:py-5 text-base rounded-full border-2 border-border-subtle focus:border-primary focus:outline-none shadow-xl transition-all bg-surface text-text"
    />

    <div class="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2">
      {#if locating}
        <div class="w-11 h-11 flex items-center justify-center" role="status" aria-label="Finding your location">
          <div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      {:else}
        <button
          type="button"
          onclick={useCurrentLocation}
          title="Use my location"
          aria-label="Use my location"
          class="w-11 h-11 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-muted/60 transition-colors"
        >
          <i class="fa-solid fa-location-crosshairs text-lg"></i>
        </button>
      {/if}
    </div>

    {#if open && suggestions.length > 0}
      <ul
        id={LISTBOX_ID}
        role="listbox"
        class="absolute w-full mt-2 bg-surface rounded-lg shadow-xl border border-border-subtle max-h-80 overflow-y-auto z-10 text-left"
      >
        {#each suggestions as suggestion, i (suggestion.id)}
          <li
            id="{LISTBOX_ID}-{i}"
            role="option"
            aria-selected={i === activeIndex}
            class="px-6 py-3 cursor-pointer border-b border-border-subtle last:border-b-0 transition-colors {i === activeIndex ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'}"
            onmousedown={(e) => {
              e.preventDefault(); // keep focus in the input
              select(suggestion);
            }}
            onmouseenter={() => (activeIndex = i)}
          >
            <div class="font-medium text-text">{suggestion.text}</div>
            <div class="text-sm text-text-muted">{suggestion.place_name.replace(/, United States$/, '')}</div>
          </li>
        {/each}
      </ul>
    {:else if open && searchQuery.trim().length >= 3 && !error}
      <div class="absolute w-full mt-2 bg-surface rounded-lg shadow-xl border border-border-subtle z-10 px-6 py-3 text-sm text-text-muted text-left">
        No matches in LA County.
      </div>
    {/if}
  </div>

  {#if error}
    <div class="mt-2 text-red-600 text-sm text-center" role="alert">{error}</div>
  {/if}
</div>
