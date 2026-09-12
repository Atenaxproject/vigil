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
        // Emergency directory + info hub — CacheFirst so tel: links work offline (prompt 69 A7).
        urlPattern: /\/informacion/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'emergency-directory-pages',
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        // Preparedness hub — CacheFirst so guides open offline (the content
        // itself ships in the JS bundle; this covers the page documents).
        urlPattern: /\/preparacion/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'preparedness-pages',
          expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
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
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org https://earthquake.usgs.gov https://api.reliefweb.int https://api.anthropic.com https://data.humdata.org https://api.open-meteo.com https://www.gdacs.org https://www.nhc.noaa.gov https://api.weather.gov https://firms.modaps.eosdis.nasa.gov https://www.tsunami.gov https://waterservices.usgs.gov",
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
