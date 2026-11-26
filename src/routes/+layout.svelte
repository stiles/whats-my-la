<script lang="ts">
  import { navigating } from '$app/state';
  import '@fontsource-variable/inter/opsz.css';
  import '../app.css';
  // Only the solid style is used; skip the brands and regular font files.
  import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
  import '@fortawesome/fontawesome-free/css/solid.min.css';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  const year = new Date().getFullYear();
</script>

<div class="min-h-screen bg-background">
  {#if navigating.to}
    <!-- Lookups can take a second; show that something is happening. -->
    <div class="fixed top-0 inset-x-0 z-50 h-0.5 overflow-hidden" role="progressbar" aria-label="Loading">
      <div class="h-full w-2/5 bg-primary" style="animation: nav-progress 1s ease-in-out infinite"></div>
    </div>
  {/if}
  <nav class="bg-footer shadow-md border-b border-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-12">
        <a href="/" class="flex items-center gap-2">
          <span class="text-xl font-semibold tracking-tight text-white">What’s My LA?</span>
        </a>
        <div class="flex items-center gap-4 text-sm">
          <a href="/explore" class="text-gray-200 hover:text-white">Explore</a>
          <a href="/neighborhoods" class="text-gray-200 hover:text-white">Neighborhoods</a>
        </div>
      </div>
    </div>
  </nav>

  <main>
    {@render children?.()}
  </main>

  <footer class="bg-footer border-t border-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="space-y-4">
        <!-- Main footer content -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-white mb-1">What's My LA?</h2>
            <p class="mt-1 text-sm text-gray-300">
              Built for people who aren’t quite sure <em>where</em> they live in LA — or keep losing arguments about it.
            </p>

            <div class="mt-4 flex flex-col gap-1 text-sm">
              <a
                href="https://github.com/stiles/whats-my-la"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline"
              >
                Read the code
              </a>
              <a
                href="https://github.com/stiles/la-geography"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline"
              >
                About the data
              </a>
              <!-- <a
                href="https://mattstiles.me/"
                target="_blank"
                rel="noopener"
                class="text-primary hover:underline"
              >
                Me
              </a> -->
              <!-- <a
                href="https://twitter.com/stiles"
                target="_blank"
                rel="noopener"
                class="text-primary hover:underline"
              >
                Twitter
              </a> -->
              <a
                href="https://www.buymeacoffee.com/mattstiles"
                target="_blank"
                rel="noopener"
                class="text-accent hover:underline"
              >
                Support the project! 
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom line -->
        <div class="pt-4 border-t border-gray-800 text-xs text-gray-400 text-center md:text-left space-y-1">
          <p>
            © {year} <a href="https://mattstiles.me/" target="_blank" rel="noopener" class="text-accent hover:underline">Matt Stiles</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</div>
