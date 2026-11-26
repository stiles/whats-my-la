# What's My LA?

A simple web app that helps users discover their Los Angeles in geographic context. Find a neighborhood, region, police division, council district and demographics for any address in LA County.

**Live at**: [whatsmyla.com](https://whatsmyla.com)

## Features

- **Address Search**: Find any LA County address, neighborhood, city or ZIP code with autocomplete, or use your location
- **Explore and browse**: Tap any spot on a map, or browse every neighborhood, city and unincorporated area
- **Geography for a location**:
  - Neighborhood, city, neighborhood council and region
  - Police division or station and fire station
  - City council member, county supervisor district and school district
- **Demographics**: Racial and ethnic makeup compared with LA County, from the 2020 Census
- **Shareable links**: Result pages are rendered on the server, so link previews name the place

## Tech Stack

- **Framework**: SvelteKit (Svelte 5), deployed with `@sveltejs/adapter-vercel`
- **Styling**: Tailwind CSS v4 (theme tokens in `src/app.css`, mirrored for map code in `src/lib/colors.ts`)
- **Maps and geocoding**: Mapbox GL JS and the Mapbox Geocoding API
- **Tests**: Vitest, plus `svelte-check`; both run in GitHub Actions
- **Data API**: [LA Geography API](https://api.stilesdata.com/la-geography/lookup)
- **Deployment**: Vercel

## Development

### Prerequisites

- Node.js 18+
- Mapbox API token

### Setup

1. Clone the repository:

```bash
git clone https://github.com/stiles/whats-my-la.git
cd whats-my-la
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.example .env
```

4. Add your Mapbox token to `.env`:

```
PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Check and test

```bash
npm run check
npm test
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - `PUBLIC_MAPBOX_ACCESS_TOKEN`

4. Configure custom domain (whatsmyla.com) in Vercel project settings

## Data Sources

- **Neighborhoods**: [LA Times Data Desk](https://github.com/datadesk/boundaries.latimes.com) (archived)
- **Demographics**: U.S. Census Bureau (2020 hard count)
- **Geographic Layers**: [LA Geography API](https://stilesdata.com/la-geography)

## License

MIT
