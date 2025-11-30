<script lang="ts">
  export let icon: string;
  export let label: string;
  export let value: string;
  export let subtitle: string = '';
  export let prominent: boolean = false;
</script>

<div
  class="bg-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-border-subtle"
>
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
      {@html icon}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium text-text-muted mb-1">{label}</div>
      <div 
        class="font-semibold text-text truncate"
        class:text-2xl={prominent}
        class:text-lg={!prominent}
      >
        {value || 'Unknown'}
      </div>
      {#if subtitle}
    <div class="text-sm text-text-muted mt-1">{subtitle}</div>
      {/if}
    </div>
  </div>
</div>

