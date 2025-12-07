<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;
  let showHint = true;

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmim06vgu00fw01snabwaggb8',
      center: [-118.2437, 34.0522], // LA center
      zoom: 9,
      attributionControl: true
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Dismiss hint after 3 seconds
    setTimeout(() => {
      showHint = false;
    }, 4000);

    // Add click handler
    map.on('click', (e) => {
      showHint = false; // Hide hint on first click
      const { lng, lat } = e.lngLat;
      goto(`/result?lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}`);
    });

    // Change cursor to plus sign
    map.getCanvas().style.cursor = 'crosshair';
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<svelte:head>
  <title>Explore Los Angeles - What's My LA?</title>
  <meta
    name="description"
    content="Click anywhere on the map to explore Los Angeles County's neighborhoods, cities, and geographic layers."
  />
</svelte:head>

<div class="relative w-full h-screen">

  <!-- Center instructional hint (subtle and auto-dismissing) -->
  {#if showHint}
    <div class="absolute inset-0 z-20 pointer-events-none flex items-center justify-center transition-opacity duration-500"
         class:opacity-0={!showHint}>
      <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 text-center">
        <div class="flex items-center gap-3">
          <img 
            src="/click.png" 
            alt="Click" 
            class="h-8 w-auto animate-pulse"
          />
          <span class="text-sm font-medium text-text">
            Click anywhere to explore
          </span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Full bleed map -->
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>

