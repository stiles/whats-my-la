<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;

  const LA_CENTER: [number, number] = [-118.2614, 33.9109];
  const LA_ZOOM = 10.31; 

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmiuh91nz003q01su2wd5b64l',
      center: LA_CENTER,
      zoom: LA_ZOOM,
      interactive: false
    });
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="w-full h-full opacity-30">
  <div bind:this={mapContainer} class="w-full h-full"></div>
</div>


