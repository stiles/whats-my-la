# Planning

Open follow-ups for What's My LA. Data and API work lives in [la-geography's PLANNING.md](https://github.com/stiles/la-geography/blob/main/PLANNING.md).

## Before the next deploy

### Clear Vercel's output directory setting

The site now builds with `@sveltejs/adapter-vercel`, which writes its own `.vercel/output`. The old `vercel.json` (now deleted) set `outputDirectory: .svelte-kit/output`. If the Vercel project's dashboard also has an output directory override (Settings → Build & Development), clear it so the adapter's output is used. Check the first deploy:

- `/result?lat=34.005&lon=-118.43` serves a fully rendered page (view source shows the headline and `og:title` "Mar Vista, Los Angeles – What's My LA?")
- `PUBLIC_MAPBOX_ACCESS_TOKEN` is still set for both build and runtime

## Upgrades

### SvelteKit 3

`npm audit` flags advisories in `@sveltejs/kit` 2.x that are fixed only in Kit 3: open redirect via enhanced form submission, XSS via cache-control headers on prerendered pages, DoS in remote-function form parsing, `query.batch` collisions, and the bundled `cookie` package. The app uses none of those features (no form actions, prerendering, remote functions or cookies), so the risk is low, but the upgrade should happen. It travels with:

- `@sveltejs/kit` 3.x and `@sveltejs/adapter-vercel` 7.x (which requires Kit 3)
- `@sveltejs/vite-plugin-svelte` 7.x and Vite 8
- TypeScript 7 (separately; check `svelte-check` support first)

The components already use Svelte 5 runes and `$app/state`, which should make this easier.

## Features

### Landmark search

Mapbox's v5 Geocoding API no longer returns points of interest, so "Dodger Stadium" or "Griffith Observatory" only match street names. Supporting landmarks means moving `AddressSearch` to Mapbox's Search Box API (suggest/retrieve with session tokens, different billing). Geocoding v5 itself is Mapbox's legacy API, so this would also be the time to move off it.

### Supervisor names

Result pages show "County supervisor: District 3" without a name because the lookup API doesn't return one. Tracked in la-geography's PLANNING.md. Once the API returns it, it's a small change in `src/lib/placeFacts.ts`.

### Per-neighborhood link previews on /neighborhoods

`/neighborhoods?n=echo-park` is selected client-side, so its link preview is the generic page title. A `+page.ts` load that reads `n` could set a neighborhood-specific title and description, like result pages do.

## Cleanup

- **Font Awesome**: only about 15 solid icons are used, but `fontawesome.min.css` adds about 80 KB of CSS. Inline SVGs (or a per-icon import) would remove it.
- **Prettier and ESLint**: not set up. Add them in a commit of their own, since the first format pass touches every file.
- **`src/routes/design-preview/`**: untracked mockups. Pick a direction and delete them, or keep them out of production builds before committing.
