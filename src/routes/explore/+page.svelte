<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import { ROSE } from '$lib/colors';
  import { LA_BASIN, LA_BASIN_PORTRAIT } from '$lib/mapViews';

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;
  // Touch screens have no hover; say "Tap" there and "Click" elsewhere.
  let touch = false;
  let lookingUp = false;

  onMount(() => {
    touch = window.matchMedia('(hover: none)').matches;
    const portrait = window.innerWidth < window.innerHeight;

    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmwxn586f00iv01srax141zqj',
      bounds: portrait ? LA_BASIN_PORTRAIT : LA_BASIN,
      fitBoundsOptions: { padding: { top: 24, right: 24, left: 24, bottom: 72 } },
      attributionControl: true
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.getCanvas().style.cursor = 'crosshair';

    map.on('click', (e) => {
      if (lookingUp || !map) return;
      lookingUp = true;
      // Drop a pin where they tapped so the jump to results doesn't feel abrupt.
      new mapboxgl.Marker({ color: ROSE }).setLngLat(e.lngLat).addTo(map);
      const { lng, lat } = e.lngLat;
      setTimeout(() => goto(`/result?lat=${lat.toFixed(6)}&lon=${lng.toFixed(6)}`), 200);
    });
  });

  onDestroy(() => {
    map?.remove();
    map = null;
  });
</script>

<svelte:head>
  <title>Explore Los Angeles - What's My LA?</title>
  <meta
    name="description"
    content="Tap or click anywhere on the map to explore Los Angeles County's neighborhoods, cities, and geographic layers."
  />
</svelte:head>

<div class="relative w-full h-[calc(100vh-3rem)]">
  <div bind:this={mapContainer} class="w-full h-full"></div>

  <!-- Persistent instruction, kept off the center of the map where people tap -->
  <div class="absolute z-10 bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
    <div
      class="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 backdrop-blur-sm border border-border-subtle shadow-md px-4 py-2 text-sm font-medium text-text"
      role="status"
    >
      {#if lookingUp}
        <span class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></span>
        Looking up this spot…
      {:else}
        <i class="fa-solid {touch ? 'fa-hand-pointer' : 'fa-arrow-pointer'} text-primary"></i>
        {touch ? 'Tap' : 'Click'} any spot to look it up
      {/if}
    </div>
  </div>
</div>
