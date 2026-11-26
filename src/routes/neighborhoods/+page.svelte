<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { replaceState } from '$app/navigation';
  import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';
  import mapboxgl from 'mapbox-gl';
  import 'mapbox-gl/dist/mapbox-gl.css';
  import {
    loadNeighborhoods,
    getBounds,
    interiorPoint,
    formatRegion,
    TYPE_LABELS,
    type NeighborhoodFeature,
    type NeighborhoodType
  } from '$lib/api/neighborhoods';

  const TYPE_COLORS: Record<NeighborhoodType, string> = {
    'segment-of-a-city': '#d83900',
    'standalone-city': '#00345b',
    'unincorporated-area': '#b07a00'
  };
  const TYPES = Object.keys(TYPE_COLORS) as NeighborhoodType[];
  // One-line plain-English explanation of what each type means for residents.
  const TYPE_BLURBS: Record<NeighborhoodType, string> = {
    'segment-of-a-city': 'Part of the City of Los Angeles, which provides its police, fire and other city services.',
    'standalone-city': 'Its own incorporated city, with its own city council and local government.',
    'unincorporated-area': 'Not part of any city. LA County governs it directly through the Board of Supervisors.'
  };
  const TYPE_PLURALS: Record<NeighborhoodType, string> = {
    'segment-of-a-city': 'City of LA neighborhoods',
    'standalone-city': 'Cities',
    'unincorporated-area': 'Unincorporated areas'
  };
  const LA_CENTER: [number, number] = [-118.2244, 34.023];
  const LA_BASIN: [[number, number], [number, number]] = [
    [-118.85, 33.72],
    [-117.72, 34.32]
  ];

  let mapContainer: HTMLDivElement;
  let map: mapboxgl.Map | null = null;
  let hoverPopup: mapboxgl.Popup | null = null;

  let features: NeighborhoodFeature[] = [];
  let bySlug = new Map<string, NeighborhoodFeature>();
  let loadError = '';
  let ready = false;

  let selected: NeighborhoodFeature | null = null;
  // Point used for the full lookup: where the user clicked, or a guaranteed interior point.
  let selectedPoint: [number, number] | null = null;
  let hoveredSlug: string | null = null;

  let query = '';
  let visibleTypes = new Set<NeighborhoodType>(TYPES);
  let counts: Record<NeighborhoodType, number> = {
    'segment-of-a-city': 0,
    'standalone-city': 0,
    'unincorporated-area': 0
  };

  $: matches =
    query.trim().length < 2
      ? []
      : features
          .filter((f) => f.properties.name.toLowerCase().includes(query.trim().toLowerCase()))
          .sort((a, b) => {
            const q = query.trim().toLowerCase();
            const aStarts = a.properties.name.toLowerCase().startsWith(q) ? 0 : 1;
            const bStarts = b.properties.name.toLowerCase().startsWith(q) ? 0 : 1;
            return aStarts - bStarts || a.properties.name.localeCompare(b.properties.name);
          })
          .slice(0, 8);

  $: lookupHref = selectedPoint
    ? `/result?lat=${selectedPoint[1].toFixed(6)}&lon=${selectedPoint[0].toFixed(6)}`
    : '#';

  function setFeatureState(slug: string | null, state: Record<string, boolean>) {
    if (!map || !slug) return;
    map.setFeatureState({ source: 'neighborhoods', id: slug }, state);
  }

  // Leave room for the side panel (desktop) or bottom sheet (mobile).
  function panelPadding(): mapboxgl.PaddingOptions {
    return window.innerWidth >= 768
      ? { top: 60, bottom: 60, left: 380, right: 60 }
      : { top: 70, bottom: 300, left: 30, right: 30 };
  }

  function select(
    feature: NeighborhoodFeature | null,
    opts: { point?: [number, number]; fly?: boolean } = {}
  ) {
    setFeatureState(selected?.properties.slug ?? null, { selected: false });
    selected = feature;
    query = '';

    const url = new URL($page.url);
    if (feature) {
      setFeatureState(feature.properties.slug, { selected: true });
      selectedPoint = opts.point ?? interiorPoint(feature.geometry);
      url.searchParams.set('n', feature.properties.slug);
      if (opts.fly && map) {
        map.fitBounds(getBounds(feature.geometry), {
          padding: panelPadding(),
          maxZoom: 14,
          duration: 800
        });
      }
    } else {
      selectedPoint = null;
      url.searchParams.delete('n');
    }
    replaceState(url, {});
  }

  function toggleType(type: NeighborhoodType) {
    if (visibleTypes.has(type)) visibleTypes.delete(type);
    else visibleTypes.add(type);
    visibleTypes = new Set(visibleTypes);
    applyTypeFilter();
    if (selected && !visibleTypes.has(selected.properties.type)) select(null);
  }

  function applyTypeFilter() {
    if (!map || !ready) return;
    const filter: mapboxgl.FilterSpecification = ['in', ['get', 'type'], ['literal', [...visibleTypes]]];
    for (const id of ['nb-fill', 'nb-line', 'nb-label']) map.setFilter(id, filter);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selected) select(null);
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && matches.length > 0) {
      e.preventDefault();
      select(matches[0], { fly: true });
    }
  }

  onMount(() => {
    mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
    map = new mapboxgl.Map({
      container: mapContainer,
      // Gray monochrome basemap (same as the home hero) so boundary colors stand out.
      style: 'mapbox://styles/stiles/cmiuh91nz003q01su2wd5b64l',
      center: LA_CENTER,
      zoom: 9,
      attributionControl: true
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: 'nb-hover'
    });

    const dataPromise = loadNeighborhoods();

    map.on('load', async () => {
      let data;
      try {
        data = await dataPromise;
      } catch (err) {
        console.error(err);
        loadError = 'Couldn’t load neighborhood boundaries. Try refreshing the page.';
        return;
      }
      if (!map) return;

      features = data.features;
      bySlug = new Map(features.map((f) => [f.properties.slug, f]));
      for (const f of features) counts[f.properties.type]++;
      counts = counts;

      const labelPoints: GeoJSON.FeatureCollection<GeoJSON.Point> = {
        type: 'FeatureCollection',
        features: features.map((f) => ({
          type: 'Feature',
          properties: { name: f.properties.name, type: f.properties.type, area: f.properties.area_sqmi },
          geometry: { type: 'Point', coordinates: interiorPoint(f.geometry) }
        }))
      };

      map.addSource('neighborhoods', { type: 'geojson', data, promoteId: 'slug' });
      map.addSource('neighborhood-labels', { type: 'geojson', data: labelPoints });

      const colorByType: mapboxgl.ExpressionSpecification = [
        'match',
        ['get', 'type'],
        ...TYPES.flatMap((t) => [t, TYPE_COLORS[t]]),
        '#666'
      ];
      // The basemap is Mapbox Standard (an import), so ordering uses slots: fills
      // and outlines go in 'middle' (under basemap labels), our labels in 'top'.
      // Basemap place labels are hidden here because they don't follow these
      // boundaries and would duplicate ours; road and POI labels stay.
      map.setConfigProperty('basemap', 'showPlaceLabels', false);

      map.addLayer(
        {
          id: 'nb-fill',
          type: 'fill',
          slot: 'middle',
          source: 'neighborhoods',
          paint: {
            'fill-color': colorByType,
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.22,
              ['boolean', ['feature-state', 'hover'], false],
              0.2,
              0.08
            ]
          }
        }
      );
      map.addLayer(
        {
          id: 'nb-line',
          type: 'line',
          slot: 'middle',
          source: 'neighborhoods',
          paint: {
            'line-color': colorByType,
            'line-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 1, 0.7],
            // Mapbox only allows zoom at the top level, so state goes inside each stop.
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              ['case', ['boolean', ['feature-state', 'selected'], false], 2.5, ['boolean', ['feature-state', 'hover'], false], 1.5, 0.5],
              12,
              ['case', ['boolean', ['feature-state', 'selected'], false], 3.5, ['boolean', ['feature-state', 'hover'], false], 2.5, 1.2]
            ]
          }
        }
      );
      map.addLayer({
        id: 'nb-label',
        type: 'symbol',
        slot: 'top',
        source: 'neighborhood-labels',
        // When labels collide, larger areas win (lower sort key = higher priority).
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Inter Medium', 'Arial Unicode MS Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 11, 12, 14, 14],
          'text-max-width': 8,
          'symbol-sort-key': ['-', 0, ['get', 'area']]
        },
        paint: {
          'text-color': '#1f2937',
          'text-halo-color': 'rgba(255,255,255,0.9)',
          'text-halo-width': 1.5
        }
      });

      map.on('mousemove', 'nb-fill', (e) => {
        const f = e.features?.[0];
        if (!f || !map) return;
        const slug = f.properties?.slug as string;
        if (slug !== hoveredSlug) {
          setFeatureState(hoveredSlug, { hover: false });
          hoveredSlug = slug;
          setFeatureState(hoveredSlug, { hover: true });
        }
        map.getCanvas().style.cursor = 'pointer';
        hoverPopup!.setLngLat(e.lngLat).setText(f.properties?.name ?? '').addTo(map);
      });
      map.on('mouseleave', 'nb-fill', () => {
        setFeatureState(hoveredSlug, { hover: false });
        hoveredSlug = null;
        if (map) map.getCanvas().style.cursor = '';
        hoverPopup?.remove();
      });
      map.on('click', (e) => {
        const hit = map!.queryRenderedFeatures(e.point, { layers: ['nb-fill'] })[0];
        const feature = hit ? bySlug.get(hit.properties?.slug as string) : undefined;
        if (feature) select(feature, { point: [e.lngLat.lng, e.lngLat.lat] });
        else select(null);
      });

      ready = true;
      applyTypeFilter();

      const initial = $page.url.searchParams.get('n');
      if (initial && bySlug.has(initial)) {
        select(bySlug.get(initial)!, { fly: true });
        // Feature state set before the source's data is parsed gets dropped; re-apply.
        map.once('idle', () => setFeatureState(selected?.properties.slug ?? null, { selected: true }));
      } else {
        // Frame the populated basin (Malibu to Pomona, Palos Verdes to the foothills)
        // rather than the whole county, which Catalina and the Antelope Valley shrink.
        map.fitBounds(LA_BASIN, {
          padding: { ...panelPadding(), bottom: window.innerWidth >= 768 ? 40 : 60 },
          duration: 0
        });
      }
    });
  });

  onDestroy(() => {
    hoverPopup?.remove();
    map?.remove();
    map = null;
  });
</script>

<svelte:head>
  <title>Neighborhood boundaries – What's My LA?</title>
  <meta
    name="description"
    content="Browse the boundaries of every neighborhood, city and unincorporated area in Los Angeles County."
  />
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="relative w-full h-[calc(100vh-3rem)]">
  <div bind:this={mapContainer} class="w-full h-full"></div>

  <!-- Control panel: top-left card on desktop, bottom sheet on mobile -->
  <aside
    class="absolute z-10 left-2 right-2 bottom-8 md:bottom-auto md:right-auto md:top-4 md:left-4 md:w-[340px]
           bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-border-subtle
           max-h-[55vh] md:max-h-[calc(100%-4rem)] overflow-y-auto"
  >
    {#if selected}
      <div class="p-4 md:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                style="background: {TYPE_COLORS[selected.properties.type]}"
              ></span>
              {TYPE_LABELS[selected.properties.type]}
            </p>
            <h1 class="text-2xl font-bold text-text leading-tight tracking-tight mt-1">
              {selected.properties.name}
            </h1>
            <p class="text-sm text-text-muted mt-0.5">
              {formatRegion(selected.properties.region)} · {selected.properties.area_sqmi.toFixed(1)} sq. mi.
            </p>
          </div>
          <button
            type="button"
            on:click={() => select(null)}
            class="shrink-0 -mr-1.5 -mt-1 w-8 h-8 rounded-full text-text-muted hover:bg-gray-100 hover:text-text"
            aria-label="Close"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p class="mt-3 text-sm text-text leading-snug">{TYPE_BLURBS[selected.properties.type]}</p>

        <a
          href={lookupHref}
          class="group mt-4 flex items-center justify-between gap-3 w-full pl-4 pr-4 py-2.5 rounded-xl bg-footer text-white hover:bg-secondary transition-colors"
        >
          <span>
            <span class="block text-sm font-semibold">See full details</span>
            <span class="block text-xs text-white/70">Police, fire, schools &amp; more</span>
          </span>
          <i class="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-0.5"></i>
        </a>
      </div>
    {:else}
      <div class="p-4">
        <h1 class="text-lg font-bold text-text">Neighborhood boundaries</h1>
        <p class="text-sm text-text-muted mt-0.5">
          {#if features.length}
            {features.length} neighborhoods, cities and unincorporated areas. Tap one or search.
          {:else if !loadError}
            Loading boundaries…
          {/if}
        </p>

        <div class="relative mt-3">
          <input
            type="search"
            bind:value={query}
            on:keydown={handleSearchKeydown}
            placeholder="Find a neighborhood or city…"
            disabled={!features.length}
            aria-label="Find a neighborhood or city"
            class="w-full px-4 py-2 text-sm rounded-full border border-border-subtle focus:border-primary focus:outline-none bg-surface text-text disabled:opacity-60"
          />
          {#if matches.length > 0}
            <ul class="mt-2 border border-border-subtle rounded-lg overflow-hidden bg-surface">
              {#each matches as m (m.properties.slug)}
                <li>
                  <button
                    type="button"
                    on:click={() => select(m, { fly: true })}
                    class="w-full text-left px-4 py-2 hover:bg-surface-muted/50 border-b border-border-subtle last:border-b-0"
                  >
                    <span class="block text-sm font-medium text-text">{m.properties.name}</span>
                    <span class="block text-xs text-text-muted">
                      {TYPE_LABELS[m.properties.type]} · {formatRegion(m.properties.region)}
                    </span>
                  </button>
                </li>
              {/each}
            </ul>
          {:else if query.trim().length >= 2}
            <p class="mt-2 text-sm text-text-muted px-1">No matches.</p>
          {/if}
        </div>

        {#if loadError}
          <p class="mt-3 text-sm text-red-700">{loadError}</p>
        {/if}

        <fieldset class="mt-4">
          <legend class="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">Show</legend>
          <div class="flex flex-col gap-1.5">
            {#each TYPES as t}
              <label class="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleTypes.has(t)}
                  on:change={() => toggleType(t)}
                  class="sr-only peer"
                />
                <span
                  class="w-4 h-4 rounded-sm border-2 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
                  style="border-color: {TYPE_COLORS[t]}; background: {visibleTypes.has(t)
                    ? TYPE_COLORS[t]
                    : 'transparent'}"
                >
                  {#if visibleTypes.has(t)}<i class="fa-solid fa-check text-[9px] text-white"></i>{/if}
                </span>
                <span class="flex-1">{TYPE_PLURALS[t]}</span>
                {#if counts[t]}<span class="text-xs text-text-muted tabular-nums">{counts[t]}</span>{/if}
              </label>
            {/each}
          </div>
        </fieldset>
      </div>
    {/if}
  </aside>
</div>

<style>
  :global(.nb-hover .mapboxgl-popup-content) {
    padding: 4px 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 6px;
    pointer-events: none;
  }
  :global(.nb-hover .mapboxgl-popup-tip) {
    display: none;
  }
  :global(.nb-hover) {
    pointer-events: none;
  }
</style>
