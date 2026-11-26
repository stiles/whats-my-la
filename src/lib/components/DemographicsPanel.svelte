<script lang="ts">
  import { formatNumber } from '$lib/utils/formatters';
  import type { SimpleDemographics } from '$lib/api/laGeography';

  // LA County baseline, 2020 Census.
  const COUNTY_POPULATION = 10_014_009;
  const COUNTY_PCT = {
    pop_hispanic: 48.0,
    pop_white_nh: 25.6,
    pop_black_nh: 7.6,
    pop_asian_nh: 14.7,
    pop_other_nh: 4.1
  } as const;

  type GroupKey = keyof typeof COUNTY_PCT;

  const GROUPS: { key: GroupKey; label: string }[] = [
    { key: 'pop_hispanic', label: 'Latino' },
    { key: 'pop_white_nh', label: 'White' },
    { key: 'pop_black_nh', label: 'Black' },
    { key: 'pop_asian_nh', label: 'Asian' },
    { key: 'pop_other_nh', label: 'Other or multiracial' }
  ];

  interface Props {
    neighborhood?: SimpleDemographics | null | undefined;
    city?: SimpleDemographics | null | undefined;
    neighborhoodLabel?: string;
    cityLabel?: string;
  }

  let {
    neighborhood = null,
    city = null,
    neighborhoodLabel = 'Neighborhood',
    cityLabel = 'City'
  }: Props = $props();

  // Prefer the neighborhood; fall back to the city.
  let useNeighborhood = $derived(!!neighborhood && neighborhood.population > 0);
  let demo = $derived(useNeighborhood ? neighborhood! : city && city.population > 0 ? city : null);
  let placeLabel = $derived(useNeighborhood ? neighborhoodLabel : cityLabel);

  let rows = $derived(demo
    ? GROUPS.map((g) => ({
        ...g,
        place: (demo![g.key] / demo!.population) * 100,
        county: COUNTY_PCT[g.key]
      }))
    : []);

  // Scale to the largest share (rounded up to 10) so bars use the space.
  let domain = $derived(Math.max(10, Math.ceil(Math.max(...rows.flatMap((r) => [r.place, r.county])) / 10) * 10));

  function pct(v: number): string {
    if (v > 0 && v < 1) return '<1%';
    return `${Math.round(v)}%`;
  }

  // Large populations are estimates; don't imply single-person precision.
  function population(n: number): string {
    return formatNumber(n >= 100_000 ? Math.round(n / 1000) * 1000 : n);
  }
</script>

<section class="bg-surface rounded-lg border border-border-subtle p-5 sm:p-6">
  <h2 class="text-2xl font-bold text-text">Who lives here</h2>

  {#if demo}
    <p class="mt-1 text-text-muted">
      {population(demo.population)} residents in {placeLabel}. Racial and ethnic makeup compared with
      LA County ({formatNumber(COUNTY_POPULATION)}).
    </p>

    <div class="mt-6">
      <!-- Legend; the place/county number columns use the same colors -->
      <div class="flex flex-wrap justify-end gap-x-4 gap-y-1 pb-2 border-b border-border-subtle text-xs font-semibold">
        <span class="flex items-center gap-1.5 text-primary-ink">
          <span class="inline-block w-2.5 h-2.5 rounded-sm bg-primary shrink-0"></span>
          {placeLabel}
        </span>
        <span class="flex items-center gap-1.5 text-text-muted">
          <span class="inline-block w-0.5 h-3 bg-text shrink-0"></span>
          LA County
        </span>
      </div>

      <div class="divide-y divide-border-subtle">
        {#each rows as row}
          <div class="grid grid-cols-[1fr_4.5rem_4.5rem] sm:grid-cols-[11rem_1fr_5rem_5rem] gap-x-3 gap-y-1.5 items-center py-2.5">
            <div class="text-sm font-medium text-text">{row.label}</div>

            <!-- Bar: own row on mobile, inline on wider screens -->
            <div class="relative h-5 col-span-3 sm:col-span-1 order-last sm:order-none" aria-hidden="true">
              <div class="absolute inset-y-1 left-0 right-0 bg-gray-100 rounded-sm"></div>
              <div
                class="absolute inset-y-1 left-0 bg-primary rounded-sm"
                style="width: {(row.place / domain) * 100}%"
              ></div>
              <div
                class="absolute inset-y-0 w-0.5 -ml-px bg-text"
                style="left: {(row.county / domain) * 100}%"
              ></div>
            </div>

            <div class="text-right text-sm font-semibold text-primary-ink tabular-nums">{pct(row.place)}</div>
            <div class="text-right text-sm text-text-muted tabular-nums">{pct(row.county)}</div>
          </div>
        {/each}
      </div>
    </div>

    <p class="mt-5 text-xs text-text-muted">
      White, Black, Asian and other groups are non-Hispanic. Estimates from a spatial analysis of
      2020 Census data; neighborhood boundaries don't follow census lines exactly.
    </p>
  {:else}
    <p class="mt-2 text-text-muted">No demographic data available for this location.</p>
  {/if}
</section>
