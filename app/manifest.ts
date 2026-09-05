import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PrimeScore Partner Portal',
    short_name: 'PrimeScore Partner',
    description: 'Official PrimeScore Financial Partner & DSA Portal. Submit credit cases, track resolution, and earn PrimePoints rewards.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b132b',
    theme_color: '#1B2A72',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
