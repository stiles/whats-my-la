<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-background">
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-primary">What's My LA?</span>
        </a>
        <div class="text-sm text-gray-600">
          Discover your LA geography
        </div>
      </div>
    </div>
  </nav>

  <main>
    <slot />
  </main>

  <footer class="bg-white border-t border-gray-200 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center text-sm text-gray-600">
        <p class="mb-2">
          Built with data from the <a href="https://github.com/datadesk/boundaries.latimes.com" target="_blank" rel="noopener" class="text-primary hover:underline">LA Times Data Desk</a>
        </p>
        <p>
          Powered by the <a href="https://api.stilesdata.com/la-geography/docs" target="_blank" rel="noopener" class="text-primary hover:underline">LA Geography API</a>
        </p>
      </div>
    </div>
  </footer>
</div>
