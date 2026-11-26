<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;

  const LA_CENTER: [number, number] = [-118.2614, 33.9109];
  const LA_ZOOM = 10.31;
  // Narrow screens: shift west and zoom out so the Westside coastline stays in view.
  const LA_CENTER_MOBILE: [number, number] = [-118.37, 34.01];
  const LA_ZOOM_MOBILE = 9.5;

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

    const narrow = window.matchMedia('(max-width: 639px)').matches;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmiuh91nz003q01su2wd5b64l',
      center: narrow ? LA_CENTER_MOBILE : LA_CENTER,
      zoom: narrow ? LA_ZOOM_MOBILE : LA_ZOOM,
      interactive: false
    });

    // The style already hides place labels; this also covers stale cached copies
    // of the style so names never collide with the hero text. Shields stay.
    map.on('style.load', () => map?.setConfigProperty('basemap', 'showPlaceLabels', false));
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="w-full h-full opacity-60">
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>


