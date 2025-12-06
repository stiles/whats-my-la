<script lang="ts">
  import { formatNumber, formatPercent } from '$lib/utils/formatters';
  import type { SimpleDemographics } from '$lib/api/laGeography';

  // LA County baseline for comparison
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

  // Use neighborhood if available, otherwise city
  const placeDemo: SimpleDemographics | null = 
    (neighborhood && neighborhood.population > 0) ? neighborhood :
    (city && city.population > 0) ? city : null;
  
  const placeLabel = (neighborhood && neighborhood.population > 0) ? neighborhoodLabel : cityLabel;

  function formatDemographicNumber(num: number): string {
    if (!num) return '0';
    if (num >= 100_000) {
      const rounded = Math.round(num / 1000) * 1000;
      return formatNumber(rounded);
    }
    return formatNumber(num);
  }

  function getPercent(demo: SimpleDemographics, key: keyof SimpleDemographics): number {
    const value = demo[key] as number;
    if (!value || !demo.population) return 0;
    return (value / demo.population) * 100;
  }
</script>

<div class="bg-surface rounded-lg shadow-md p-4 sm:p-5 md:p-6 border border-border-subtle">
  <h3 class="text-xl sm:text-2xl font-bold text-text mb-4">
    How demographics in {placeLabel} compare to Los Angeles County
  </h3>

  {#if placeDemo}
    <!-- Two column layout on desktop -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Data table -->
      <div class="bg-white rounded-lg border border-border-subtle overflow-hidden">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-border-subtle bg-gray-50">
              <th class="py-2 px-3 text-left font-semibold text-text">Category</th>
              <th class="py-2 px-3 text-left font-semibold text-text">{placeLabel}</th>
              <th class="py-2 px-3 text-left font-semibold text-text">LA County</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr>
              <td class="py-2 px-3 font-medium text-text">Total population</td>
              <td class="py-2 px-3 text-text">{formatDemographicNumber(placeDemo.population)}</td>
              <td class="py-2 px-3 text-text">10,014,009</td>
            </tr>
            {#each raceRows as row}
              {@const placeCount = placeDemo[row.key] as number}
              {@const countyCount = Math.round((LA_COUNTY_PERCENTAGES[row.pctKey] / 100) * 10014009)}
              <tr>
                <td class="py-2 px-3 text-text">{row.label}</td>
                <td class="py-2 px-3 text-text">{formatDemographicNumber(placeCount)}</td>
                <td class="py-2 px-3 text-text">{formatDemographicNumber(countyCount)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Right: Bullet chart visualization -->
      <div class="bg-white rounded-lg border border-border-subtle p-4">
        <p class="text-sm text-text-muted mb-4">
          <span class="font-semibold text-white" style="background-color: #d83900; padding: 2px 8px; border-radius: 4px;">{placeLabel}</span> compared to <span class="font-semibold" style="background-color: #e5e7eb; padding: 2px 8px; border-radius: 4px;">LA County</span>
        </p>
        
        <div class="space-y-4">
          {#each raceRows as row}
            {@const placePct = getPercent(placeDemo, row.key)}
            {@const countyPct = LA_COUNTY_PERCENTAGES[row.pctKey]}
            <div>
              <!-- Label above on mobile, left on desktop -->
              <div class="text-sm font-medium text-text mb-1 sm:mb-0 sm:hidden">
                {row.label}
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <!-- Label on the left (hidden on mobile) -->
                <div class="hidden sm:block text-sm font-medium text-text w-32 md:w-40 flex-shrink-0">
                  {row.label}
                </div>
                <!-- Bar area with grid -->
                <div class="flex-1 relative">
                  <!-- Continuous vertical grid lines as positioned elements -->
                  <div class="absolute inset-0 pointer-events-none">
                    <!-- <div class="absolute top-0 bottom-0 w-[1px] bg-gray-300" style="left: 20%"></div>
                    <div class="absolute top-0 bottom-0 w-[1px] bg-gray-300" style="left: 40%"></div>
                    <div class="absolute top-0 bottom-0 w-[1px] bg-gray-300" style="left: 60%"></div>
                    <div class="absolute top-0 bottom-0 w-[1px] bg-gray-300" style="left: 80%"></div>
                    <div class="absolute top-0 bottom-0 w-[1px] bg-gray-300" style="left: 100%"></div> -->
                  </div>
                  
                <div class="relative">
                  <!-- County bar (lighter gray, taller background) -->
                  <div 
                    class="h-6 rounded relative"
                    style="width: {countyPct}%; background-color: #e5e7eb"
                  ></div>
                  <!-- Place bar (red, thinner, overlaid) -->
                  <div 
                    class="absolute top-1/2 left-0 -translate-y-1/2 h-3 rounded"
                    style="width: {placePct}%; background-color: #d83900"
                  ></div>
                  <!-- Percentage label with halo, positioned 5px from red bar -->
                  {#if placePct > 15}
                    <div 
                      class="absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-800 whitespace-nowrap"
                      style="left: calc({placePct}% + 5px); text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white"
                    >
                      {placePct.toFixed(1)}%
                    </div>
                  {/if}
                </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- X-axis labels -->
        <div class="flex items-center gap-2 sm:gap-3 mt-4">
          <div class="hidden sm:block w-32 md:w-40 flex-shrink-0"></div>
          <div class="flex-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-border-subtle text-xs text-text-muted">
      <p>Note: Values derived from a spatial analysis of geographic boundaries and US Census Bureau data and should be considered estimates.</p>
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>No demographic data available for this location.</p>
    </div>
  {/if}
</div>