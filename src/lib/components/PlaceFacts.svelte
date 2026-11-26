<script lang="ts">
  import type { FactGroup } from '$lib/placeFacts';

  interface Props {
    groups: FactGroup[];
  }

  let { groups }: Props = $props();
</script>

<div class="bg-surface rounded-lg border border-border-subtle divide-y divide-border-subtle">
  {#each groups as group}
    <section class="px-5 py-4">
      <h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
        <i class="fa-solid {group.icon} text-primary w-3.5 text-center" aria-hidden="true"></i>
        {group.title}
      </h3>
      <dl class="space-y-2">
        {#each group.facts as fact}
          <div class="grid grid-cols-[10rem_1fr] gap-3 items-baseline">
            <dt class="text-sm text-text-muted">{fact.label}</dt>
            <dd class="min-w-0">
              <span class="font-semibold text-text">{fact.value}</span>
              {#if fact.detail}
                <span class="block text-sm text-text-muted">{fact.detail}</span>
              {/if}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  {/each}
</div>
