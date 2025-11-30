<script lang="ts">
  export let icon: string;
  export let label: string;
  export let value: string;
  export let subtitle: string = '';
  export let prominent: boolean = false;
</script>

<div
  class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
  class:ring-2={prominent}
  class:ring-primary={prominent}
>
  <div class="flex items-start gap-4">
    <div 
      class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
      class:bg-primary={prominent}
      class:bg-opacity-10={prominent}
      class:bg-gray-100={!prominent}
    >
      {@html icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div 
        class="font-semibold text-gray-900 truncate"
        class:text-2xl={prominent}
        class:text-lg={!prominent}
      >
        {value || 'Unknown'}
      </div>
      {#if subtitle}
        <div class="text-sm text-gray-500 mt-1">{subtitle}</div>
      {/if}
    </div>
  </div>
</div>

