<script lang="ts">
  import AddressSearch from '$lib/components/AddressSearch.svelte';
</script>

<svelte:head>
  <title>What's My LA? - Discover Your LA Geography</title>
  <meta name="description" content="Find out what neighborhood, region, police division, and more you're in. Discover your complete LA geography context." />
</svelte:head>

<div class="relative overflow-hidden">
  <!-- Hero Section -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
    <div class="text-center">
      <h1 class="text-5xl md:text-7xl font-bold text-text mb-6">
        Discover Your <span class="text-primary">LA</span>
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
        Find out what neighborhood, region, police division, council district, and more you're in.
        Get the complete geographic context for any address in Los Angeles County.
      </p>

      <AddressSearch />
    </div>
  </div>

  <!-- Features Section -->
  <div class="bg-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold text-center text-text mb-12">What you'll discover</h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center p-6">
          <div class="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Neighborhoods & Regions</h3>
          <p class="text-gray-600">Your neighborhood, region, and city — the places that define your LA.</p>
        </div>

        <div class="text-center p-6">
          <div class="w-16 h-16 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Public Safety</h3>
          <p class="text-gray-600">Your police division, fire station, and emergency service areas.</p>
        </div>

        <div class="text-center p-6">
          <div class="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Demographics</h3>
          <p class="text-gray-600">Population, density, and demographic makeup of your area.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Example Section -->
  <div class="py-20 bg-gradient-to-br from-primary to-secondary text-white">
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
  </div>
</div>
