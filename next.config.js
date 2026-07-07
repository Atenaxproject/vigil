const createNextIntlPlugin = require('next-intl/plugin')
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
      {
        urlPattern: /^https:\/\/earthquake\.usgs\.gov\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'usgs-data',
          expiration: { maxAgeSeconds: 300 },
        },
      },
      {
        urlPattern: /^https:\/\/api\.reliefweb\.int\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'reliefweb-data',
          expiration: { maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
        },
      },
    ],
  },
})

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // cdn-imagenes.theempire.tech: DTV federated result photos
              "img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://cdn-imagenes.theempire.tech",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org https://earthquake.usgs.gov https://api.reliefweb.int https://api.anthropic.com https://data.humdata.org https://api.open-meteo.com https://www.gdacs.org",
              "worker-src 'self'",
              "frame-ancestors 'none'",
              'report-uri /api/csp-report',
            ].join('; '),
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = withPWA(withNextIntl(nextConfig))
