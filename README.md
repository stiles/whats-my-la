# What's My LA?

A simple web app that helps users discover their Los Angeles in geographic context. Find a neighborhood, region, police division, council district and demographics for any address in LA County.

**Soon the be live at**: [whatsmyla.com](https://whatsmyla.com)

## Features

- **Address Search**: Find any LA address with autocomplete
- **Comprehensive Geography**: See all geographic layers for your location
  - Neighborhood and region
  - Police division and fire station
  - City council district and school district
- **Demographics**: Population, density, and racial/ethnic breakdown from 2020 Census
- **Shareable Cards**: Generate beautiful cards to share on social media
- **Mobile-First**: Works perfectly on all devices

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Geocoding**: Mapbox Geocoding API
- **Data API**: [LA Geography API](https://api.stilesdata.com/la-geography/lookup)
- **Deployment**: Vercel

## Development

### Prerequisites

- Node.js 18+
- Mapbox API token (free tier available)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/whats-my-la.git
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

Get a free token at: https://account.mapbox.com/access-tokens/

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

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