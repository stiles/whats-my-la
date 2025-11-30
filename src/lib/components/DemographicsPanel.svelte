<script lang="ts">
  import { formatNumber, formatPercent, formatDensity } from '$lib/utils/formatters';

  export let demographics: any;
  export let area: number = 0;

  $: popTotal = demographics?.pop_total || 0;
  $: popHispanic = demographics?.pop_hispanic || 0;
  $: popWhite = demographics?.pop_white_nh || 0;
  $: popBlack = demographics?.pop_black_nh || 0;
  $: popAsian = demographics?.pop_asian_nh || 0;
  $: popOther = demographics?.pop_other_nh || 0;
  $: housingTotal = demographics?.housing_total || 0;
  $: housingOccupied = demographics?.housing_occupied || 0;

  $: density = area > 0 ? formatDensity(popTotal, area) : '0';

  $: raceData = [
    { label: 'Hispanic/Latino', value: popHispanic, color: 'bg-primary' },
    { label: 'White (non-Hispanic)', value: popWhite, color: 'bg-secondary' },
    { label: 'Black (non-Hispanic)', value: popBlack, color: 'bg-accent' },
    { label: 'Asian (non-Hispanic)', value: popAsian, color: 'bg-green-500' },
    { label: 'Other', value: popOther, color: 'bg-gray-400' },
  ].filter(d => d.value > 0);
</script>

<div class="bg-white rounded-lg shadow-md p-6 border border-gray-100">
  <h3 class="text-2xl font-bold text-gray-900 mb-6">Demographics</h3>

  {#if popTotal > 0}
    <!-- Population Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-3xl font-bold text-primary mb-1">
          {formatNumber(popTotal)}
        </div>
        <div class="text-sm text-gray-600">Total Population</div>
      </div>
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-3xl font-bold text-secondary mb-1">
          {density}
        </div>
        <div class="text-sm text-gray-600">People per sq mi</div>
      </div>
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-3xl font-bold text-accent mb-1">
          {formatNumber(housingTotal)}
        </div>
        <div class="text-sm text-gray-600">Housing Units</div>
      </div>
    </div>

    <!-- Race/Ethnicity Breakdown -->
    <div class="mb-6">
      <h4 class="font-semibold text-gray-700 mb-3">Race & Ethnicity</h4>
      <div class="space-y-3">
        {#each raceData as race}
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-gray-700">{race.label}</span>
              <span class="text-sm font-medium text-gray-900">
                {formatNumber(race.value)} ({formatPercent(race.value, popTotal)})
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="{race.color} h-2 rounded-full transition-all"
                style="width: {(race.value / popTotal) * 100}%"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Housing Stats -->
    {#if housingTotal > 0}
      <div class="pt-6 border-t border-gray-200">
        <h4 class="font-semibold text-gray-700 mb-3">Housing</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-600">Occupied</div>
            <div class="font-semibold text-gray-900">
              {formatNumber(housingOccupied)} ({formatPercent(housingOccupied, housingTotal)})
            </div>
          </div>
          <div>
            <div class="text-gray-600">Vacant</div>
            <div class="font-semibold text-gray-900">
              {formatNumber(housingTotal - housingOccupied)} ({formatPercent(housingTotal - housingOccupied, housingTotal)})
            </div>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>No demographic data available for this location.</p>
    </div>
  {/if}

  <div class="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
    <p>Source: 2020 U.S. Decennial Census</p>
  </div>
</div>

