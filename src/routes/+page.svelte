<script lang="ts">
  import AddressSearch from '$lib/components/AddressSearch.svelte';
  import HeroMap from '$lib/components/HeroMap.svelte';
  import Meta from '$lib/components/Meta.svelte';
</script>

<Meta
  title="What's My LA? – Figure out where you really live"
  description="Los Angeles County's geography is confusing. Drop in an address to see its neighborhood, city, police and fire coverage, representatives and demographics."
/>

<div class="relative overflow-hidden">
  <!-- Hero Section with background map -->
  <section class="relative min-h-screen flex items-center">
    <div class="absolute inset-0 z-0 pointer-events-none">
      <HeroMap />
    </div>

    <!-- Soft fade so the decorative map recedes behind the text -->
    <div
      class="absolute inset-0 z-0 pointer-events-none"
      style="background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,245,245,0.75) 0%, rgba(245,245,245,0.35) 45%, rgba(245,245,245,0) 75%)"
    ></div>

    <div class="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-6 py-20 md:py-32 text-center">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-text text-balance">
        Discover <span class="text-primary">your</span> LA
      </h1>
      <p class="mt-5 text-lg md:text-2xl text-text-muted text-balance">
        Los Angeles County’s geography is confusing. We’re here to help.
      </p>

      <div class="mt-10">
        <AddressSearch />
      </div>

      <div class="mt-6 mx-auto max-w-xs sm:max-w-none flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
        <span class="text-sm text-text-muted sm:mr-1">Or explore</span>
        <a href="/explore" class="hero-chip">
          <i class="fa-solid fa-hand-pointer text-primary"></i> Pick a spot on a map
        </a>
        <a href="/neighborhoods" class="hero-chip">
          <i class="fa-solid fa-draw-polygon text-primary"></i> Browse neighborhoods
        </a>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <div class="bg-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-text mb-12">What you'll learn about a location</h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-city text-5xl text-primary"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Places</h3>
          <p class="text-text-muted">What the location is called — down to the region, city and neighborhood.</p>
        </div>

        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-fire-extinguisher text-5xl text-secondary"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Public safety</h3>
          <p class="text-text-muted">Learn the police division and fire station, plus other emergency service areas.</p>
        </div>

        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-people-group text-5xl text-accent"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Demographics</h3>
          <p class="text-text-muted">Get a quick look at the population and demographics compared to LA County.</p>
        </div>
      </div>
    </div>
  </div>

</div>

<style>
  .hero-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-radius: 9999px;
    border: 1px solid var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    transition: border-color 0.15s, color 0.15s;
  }
  .hero-chip:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
</style>
