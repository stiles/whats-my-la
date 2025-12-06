<script lang="ts">
  import AddressSearch from '$lib/components/AddressSearch.svelte';
  import HeroMap from '$lib/components/HeroMap.svelte';
</script>

<svelte:head>
  <title>What's my Los Angeles? – Figure out where you really live</title>
  <meta
    name="description"
    content="Los Angeles County's geography is confusing. We're here to help."
  />

  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://whatsmyla.com/" />
  <meta property="og:title" content="What's my Los Angeles? – Figure out where you really live" />
  <meta property="og:description" content="Los Angeles County's geography is confusing. We're here to help." />
  <meta property="og:image" content="https://whatsmyla.com/sharecard.jpg" />
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://whatsmyla.com/" />
  <meta property="twitter:title" content="What's my Los Angeles? – Figure out where you really live" />
  <meta property="twitter:description" content="Los Angeles County's geography is confusing. We're here to help." />
  <meta property="twitter:image" content="https://whatsmyla.com/sharecard.jpg" />
</svelte:head>

<div class="relative overflow-hidden">
  <!-- Hero Section with background map -->
  <section class="relative min-h-screen flex items-center">
    <div class="absolute inset-0 z-0 pointer-events-none">
      <HeroMap />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
      <h1 class="text-5xl md:text-7xl font-bold text-text mb-6">
        Discover <br class="sm:hidden" /><span class="text-primary">your</span> LA
      </h1>
      <p class="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto">
        Los Angeles County's geography is confusing.<br class="sm:hidden" /> We're here to help.
      </p>

      <AddressSearch />
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
