<script lang="ts">
  // Title, description and social-card tags for a page. Every public page
  // includes this once; app.html carries no defaults so tags never duplicate.
  interface Props {
    title: string;
    description: string;
    /** Canonical URL for the page; defaults to the site root. */
    url?: string;
    image?: string;
  }

  let { title, description, url = SITE_URL, image = `${SITE_URL}/sharecard.jpg` }: Props = $props();
</script>

<script lang="ts" module>
  export const SITE_URL = 'https://whatsmyla.com';
  export const SITE_NAME = "What's My LA?";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
