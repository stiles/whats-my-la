<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';

  export let lat: number;
  export let lon: number;
  export let address: string = '';
  export let neighborhoodName: string | undefined = undefined;
  export let cityName: string | undefined = undefined;

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;
  let neighborhoodsGeoJson: GeoJSON.FeatureCollection | null = null;

  async function loadNeighborhoodGeoJson(): Promise<GeoJSON.FeatureCollection | null> {
    if (neighborhoodsGeoJson) return neighborhoodsGeoJson;

    try {
      const res = await fetch('https://stilesdata.com/la-geography/la_neighborhoods_comprehensive_simplified.geojson');
      if (!res.ok) {
        console.error('Failed to load neighborhoods GeoJSON', res.statusText);
        return null;
      }
      neighborhoodsGeoJson = await res.json();
      // console.log('Loaded neighborhoods GeoJSON', neighborhoodsGeoJson);
      return neighborhoodsGeoJson;
    } catch (err) {
      console.error('Error loading neighborhoods GeoJSON', err);
      return null;
    }
  }

  function getFeatureBounds(feature: GeoJSON.Feature): mapboxgl.LngLatBoundsLike {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    const updateBounds = (coords: number[][]) => {
      for (const [lng, lat] of coords) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    };

    const geom = feature.geometry;
    if (!geom) {
      return [
        [lon - 0.01, lat - 0.01],
        [lon + 0.01, lat + 0.01]
      ];
    }

    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates) {
        updateBounds(ring as number[][]);
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          updateBounds(ring as number[][]);
        }
      }
    }

    return [
      [minLng, minLat],
      [maxLng, maxLat]
    ];
  }

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;

    map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/stiles/cmim06vgu00fw01snabwaggb8',
      center: [lon, lat],
      zoom: 13,
      attributionControl: true
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add a marker at the location
    new mapboxgl.Marker({
      color: '#d83900'
    })
      .setLngLat([lon, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${address || 'Your Location'}</strong>`)
      )
      .addTo(map);

    // Optionally draw neighborhood or city outline
    if (neighborhoodName || cityName) {
      map.on('load', async () => {
        const data = await loadNeighborhoodGeoJson();
        if (!data) return;

        const targetName = neighborhoodName || cityName;
        const feature = data.features.find((f) => {
          const props = (f.properties || {}) as any;
          return props.name === targetName;
        });

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
            source: sourceId,
            paint: {
              'fill-color': '#d83900',
              'fill-opacity': 0.15
            }
          });
        }

        if (!map!.getLayer(lineLayerId)) {
          map!.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#d83900',
              'line-width': 2.5,
              'line-opacity': 0.8
            }
          });
        }

        try {
          const bounds = getFeatureBounds(feature);
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

