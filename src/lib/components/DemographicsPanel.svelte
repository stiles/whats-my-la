<script lang="ts">
  import { formatNumber, formatPercent } from '$lib/utils/formatters';
  import type { SimpleDemographics } from '$lib/api/laGeography';

  // LA County baseline for comparison
  const LA_COUNTY_DEMOGRAPHICS = {
    population: 10014009,
    pop_hispanic: 4804763,
    pop_white_nh: 2563609,
    pop_black_nh: 760689,
    pop_asian_nh: 1474237,
    pop_other_nh: 410711
  };

  const LA_COUNTY_PERCENTAGES = {
    hispanic: 48.0,
    white_nh: 25.6,
    black_nh: 7.6,
    asian_nh: 14.7,
    other_nh: 4.1
  };

  export let neighborhood: SimpleDemographics | null = null;
  export let city: SimpleDemographics | null = null;
  export let neighborhoodLabel: string = 'Neighborhood';
  export let cityLabel: string = 'City';

  const raceRows = [
    { key: 'pop_hispanic', label: 'Hispanic/Latino', pctKey: 'hispanic' },
    { key: 'pop_white_nh', label: 'White (non-Hispanic)', pctKey: 'white_nh' },
    { key: 'pop_black_nh', label: 'Black (non-Hispanic)', pctKey: 'black_nh' },
    { key: 'pop_asian_nh', label: 'Asian (non-Hispanic)', pctKey: 'asian_nh' },
    { key: 'pop_other_nh', label: 'Other / multiracial', pctKey: 'other_nh' },
  ] as const;

  const hasNeighborhood = neighborhood && neighborhood.population > 0;
  const hasCity = city && city.population > 0;

  // If neighborhood and city are effectively the same place (e.g., Santa Monica),
  // we only show one local column to keep the table simple.
  const samePlace =
    hasNeighborhood &&
    hasCity &&
    neighborhoodLabel.trim().toLowerCase() === cityLabel.trim().toLowerCase();

  const showTable = hasNeighborhood || hasCity;

  const primaryColumn: 'neighborhood' | 'city' | null =
    hasNeighborhood ? 'neighborhood' : hasCity ? 'city' : null;

  const primaryDemo: SimpleDemographics | null =
    primaryColumn === 'neighborhood'
      ? (neighborhood || null)
      : primaryColumn === 'city'
      ? (city || null)
      : null;

  function formatDemographicNumber(num: number): string {
    if (!num) return '0';
    // For large values, round to the nearest thousand to avoid false precision
    if (num >= 100_000) {
      const rounded = Math.round(num / 1000) * 1000;
      return formatNumber(rounded);
    }
    return formatNumber(num);
  }

  function formatCell(value: number | undefined, total: number | undefined): string {
    if (!value || !total) return '—';
    return `${formatDemographicNumber(value)} (${formatPercent(value, total)})`;
  }

  function formatCountyCell(key: keyof typeof LA_COUNTY_DEMOGRAPHICS, pctKey?: keyof typeof LA_COUNTY_PERCENTAGES): string {
    const count = LA_COUNTY_DEMOGRAPHICS[key];
    if (!pctKey) {
      return formatDemographicNumber(count);
    }
    const pct = LA_COUNTY_PERCENTAGES[pctKey];
    return `${formatDemographicNumber(count)} (${pct.toFixed(1)}%)`;
  }

  function headerLabel(label: string, col: 'neighborhood' | 'city'): string {
    return primaryColumn === col ? `${label} (you)` : label;
  }

  function primaryCellClass(col: 'neighborhood' | 'city'): string {
    return primaryColumn === col ? 'bg-orange-50' : '';
  }

  function diffClass(
    demo: SimpleDemographics | null,
    key: keyof SimpleDemographics,
    pctKey?: keyof typeof LA_COUNTY_PERCENTAGES
  ): string {
    if (!demo || !pctKey || !demo.population) return '';
    const value = demo[key] as number | undefined;
    if (!value) return '';
    const localPct = (value / demo.population) * 100;
    const countyPct = LA_COUNTY_PERCENTAGES[pctKey];
    const diff = localPct - countyPct;
    if (Math.abs(diff) < 3) return '';
    return 'font-semibold text-primary';
  }
</script>

<div class="bg-surface rounded-lg shadow-md p-4 sm:p-5 md:p-6 border border-border-subtle">
  <h3 class="text-xl sm:text-2xl font-bold text-text mb-4 sm:mb-5">Demographics</h3>

  {#if showTable}
    <p class="text-[0.8rem] text-text-muted mb-2">
      We compare your place to Los Angeles County. Bold values mark racial or ethnic groups that differ noticeably from the county average.
    </p>

    <div class="overflow-x-auto">
      <!-- Mobile: just "You" vs LA County -->
      {#if primaryDemo}
        <table class="min-w-full text-[13px] text-left border-collapse md:hidden">
          <thead>
            <tr class="border-b border-border-subtle text-[0.65rem] uppercase tracking-wide text-text-muted">
              <th class="py-1.5 pr-3">Group</th>
              <th class="py-1.5 px-3">You</th>
              <th class="py-1.5 px-3">LA County</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="py-2 pr-3 font-medium text-text">Total population</td>
              <td class="py-2 px-3 text-text bg-surface-muted">
                {formatDemographicNumber(primaryDemo.population)}
              </td>
              <td class="py-2 px-3 text-text">
                {formatCountyCell('population')}
              </td>
            </tr>

            {#each raceRows as row}
              <tr>
              <td class="py-2 pr-3 text-text-muted">{row.label}</td>
              <td class="py-2 px-3 text-text bg-surface-muted {diffClass(primaryDemo, row.key, row.pctKey)}">
                  {formatCell(
                    primaryDemo ? (primaryDemo[row.key] as number) : undefined,
                    primaryDemo?.population
                  )}
                </td>
                <td class="py-2 px-3 text-text">
                  {formatCountyCell(row.key, row.pctKey)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <!-- Desktop: neighborhood, city (if available) and county -->
      <table class="min-w-full text-[11px] md:text-[14px] text-left border-collapse hidden md:table">
        <thead>
          <tr class="border-b border-border-subtle text-xs uppercase tracking-wide text-text-muted">
            <th class="py-1.5 pr-3">Group</th>
            {#if hasNeighborhood}
              <th class="py-1.5 px-3">
                {headerLabel(neighborhoodLabel, 'neighborhood')}
              </th>
            {/if}
            {#if hasCity && !samePlace}
              <th class="py-1.5 px-3">
                {headerLabel(cityLabel, 'city')}
              </th>
            {/if}
            <th class="py-1.5 px-3">LA County</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <!-- Total population row -->
          <tr>
            <td class="py-2 pr-3 font-medium text-text">Total population</td>
            {#if hasNeighborhood}
              <td class="py-2 px-3 text-text {primaryCellClass('neighborhood')}">
                {formatDemographicNumber(neighborhood?.population || 0)}
              </td>
            {/if}
            {#if hasCity && !samePlace}
              <td class="py-2 px-3 text-text {primaryCellClass('city')}">
                {formatDemographicNumber(city?.population || 0)}
              </td>
            {/if}
            <td class="py-2 px-3 text-text">
              {formatCountyCell('population')}
            </td>
          </tr>

          {#each raceRows as row}
            <tr>
              <td class="py-2 pr-3 text-text-muted">{row.label}</td>
              {#if hasNeighborhood}
                <td class="py-2 px-3 text-text {primaryCellClass('neighborhood')} {diffClass(
                  neighborhood,
                  row.key,
                  row.pctKey
                )}">
                  {formatCell(
                    neighborhood ? (neighborhood[row.key] as number) : undefined,
                    neighborhood?.population
                  )}
                </td>
              {/if}
              {#if hasCity && !samePlace}
                <td class="py-2 px-3 text-text {primaryCellClass('city')} {diffClass(
                  city,
                  row.key,
                  row.pctKey
                )}">
                  {formatCell(
                    city ? (city[row.key] as number) : undefined,
                    city?.population
                  )}
                </td>
              {/if}
              <td class="py-2 px-3 text-text">
                {formatCountyCell(row.key, row.pctKey)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>No demographic data available for this location.</p>
    </div>
  {/if}

  <div class="mt-6 pt-6 border-t border-border-subtle text-xs text-text-muted">
    <p>Note: Values derived from a spatial analysis of geographic boundaries and US Census Bureau data and should be considered estimates.</p>
  </div>
</div>