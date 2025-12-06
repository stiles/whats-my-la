<script lang="ts">
  import AddressSearch from '$lib/components/AddressSearch.svelte';
  import HeroMap from '$lib/components/HeroMap.svelte';
</script>

<svelte:head>
  <title>What's My LA? – Figure out where you really live in Los Angeles</title>
  <meta
    name="description"
    content="Not totally sure where you live in LA? Drop in an address and see the real neighborhood, city, council district, and public safety coverage for any spot in Los Angeles County."
  />
</svelte:head>

<div class="relative overflow-hidden">
  <!-- Hero Section with background map -->
  <section class="relative min-h-screen flex items-center">
    <div class="absolute inset-0 z-0 pointer-events-none">
      <HeroMap />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
      <h1 class="text-5xl md:text-7xl font-bold text-text mb-6">
        Discover <span class="text-primary">your</span> LA
      </h1>
      <p class="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto">
        Drop in an address and see the neighborhood, city, police and fire coverage, council district, and more for anywhere in Los Angeles County.
      </p>

      <AddressSearch />
    </div>
  </section>

  <!-- Features Section -->
  <div class="bg-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-text mb-12">What you'll learn about your LA neighborhood</h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-city text-5xl text-primary"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Places</h3>
          <p class="text-text-muted">Find out what your location is officially named, by neighborhood, region and city.</p>
        </div>

        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-fire-extinguisher text-5xl text-secondary"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Public safety</h3>
          <p class="text-text-muted">See which police division and fire station cover you, plus other emergency service areas.</p>
        </div>

        <div class="text-center p-6">
          <div class="flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-people-group text-5xl text-accent"></i>
          </div>
          <h3 class="text-xl font-semibold mb-2">Demographics</h3>
          <p class="text-text-muted">Get a quick read on who lives around you: population, density and a basic demographic snapshot.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Example Section -->
  <!-- <div class="py-20 bg-gradient-to-br from-primary to-secondary text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold mb-6">Perfect for</h2>
      <div class="grid md:grid-cols-4 gap-6 text-left">
        <div class="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
          <h3 class="font-semibold mb-2">New Residents</h3>
          <p class="text-sm text-white text-opacity-90">Learn about your new neighborhood and community.</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
          <h3 class="font-semibold mb-2">Researchers</h3>
          <p class="text-sm text-white text-opacity-90">Quick geographic context for analysis and reporting.</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
          <h3 class="font-semibold mb-2">Journalists</h3>
          <p class="text-sm text-white text-opacity-90">Verify locations and add geographic detail to stories.</p>
        </div>
        <div class="bg-white bg-opacity-10 backdrop-blur rounded-lg p-6">
          <h3 class="font-semibold mb-2">Curious Angelenos</h3>
          <p class="text-sm text-white text-opacity-90">Settle those "which neighborhood is that?" debates.</p>
        </div>
      </div>
    </div>
  </div> -->
</div>
