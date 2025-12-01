<script>
  import '../app.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<div class="min-h-screen bg-background">
  <nav class="bg-footer shadow-md border-b border-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-primary">What's My LA?</span>
        </a>
        <!-- <div class="text-sm text-gray-200">
          Where you really live
        </div> -->
      </div>
    </div>
  </nav>

  <main>
    <slot />
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
                class="text-primary hover:underline"
              >
                Read the code
              </a>
              <a
                href="https://github.com/stiles/la-geography"
                target="_blank"
                rel="noopener"
                class="text-primary hover:underline"
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
                class="text-primary hover:underline"
              >
                Support the project! 
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom line -->
        <div class="pt-4 border-t border-gray-800 text-xs text-gray-400 text-center md:text-left space-y-1">
          <p>
            © 2025 <a href="https://mattstiles.me/" target="_blank" rel="noopener" class="text-primary hover:underline">Matt Stiles</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</div>
