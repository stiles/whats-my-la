<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import { loadNeighborhoods, getBounds } from '$lib/api/neighborhoods';
  import { ROSE } from '$lib/colors';

  export let lat: number;
  export let lon: number;
  export let address: string = '';
  export let neighborhoodName: string | undefined = undefined;
  export let cityName: string | undefined = undefined;

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmwxn586f00iv01srax141zqj',
      center: [lon, lat],
      zoom: 13,
      attributionControl: true
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add a marker at the location
    new mapboxgl.Marker({
      color: ROSE
    })
      .setLngLat([lon, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setText(address || 'Your location')
      )
      .addTo(map);

    // Optionally draw neighborhood or city outline
    if (neighborhoodName || cityName) {
      map.on('load', async () => {
        let data;
        try {
          data = await loadNeighborhoods();
        } catch (err) {
          console.error('Error loading neighborhoods GeoJSON', err);
          return;
        }
        if (!map) return;

        const targetName = neighborhoodName || cityName;
        const feature = data.features.find((f) => f.properties?.name === targetName);

        if (!feature) {
          console.warn('No neighborhood feature found for', targetName);
          return;
        }

        // console.log('Highlighting neighborhood feature', (feature.properties as any)?.name);

        const sourceId = 'la-area';
        const fillLayerId = 'la-area-fill';
        const lineLayerId = 'la-area-outline';

        if (!map!.getSource(sourceId)) {
          map!.addSource(sourceId, { type: 'geojson', data: feature });
        }

        if (!map!.getLayer(fillLayerId)) {
          map!.addLayer({
            id: fillLayerId,
            type: 'fill',
            slot: 'middle', // under the basemap's labels (Mapbox Standard)
            source: sourceId,
            paint: {
              'fill-color': ROSE,
              'fill-opacity': 0.15
            }
          });
        }

        if (!map!.getLayer(lineLayerId)) {
          map!.addLayer({
            id: lineLayerId,
            type: 'line',
            slot: 'middle', // under the basemap's labels (Mapbox Standard)
            source: sourceId,
            paint: {
              'line-color': ROSE,
              'line-width': 2.5,
              'line-opacity': 0.8
            }
          });
        }

        try {
          const bounds = getBounds(feature.geometry);
          map!.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 800 });
        } catch (err) {
          console.error('Failed to fit bounds for neighborhood', err);
        }
      });
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="bg-surface rounded-lg shadow-md overflow-hidden border border-border-subtle">
  <div bind:this={mapContainer} class="w-full h-96"></div>
</div>

