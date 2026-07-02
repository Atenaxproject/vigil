import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { AlertTriangle } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { EmergencyBanner } from '@/components/layout/EmergencyBanner'
import { WeatherBar } from '@/components/layout/WeatherBar'
import { Navigation } from '@/components/layout/Navigation'
import { SkipToContent } from '@/components/layout/SkipToContent'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import { VigilAssistant } from '@/components/ai/VigilAssistant'
import { IOSInstallBanner } from '@/components/pwa/IOSInstallBanner'
import { NetworkStatusBanner } from '@/components/layout/NetworkStatusBanner'
import { OfflineQueueProvider } from '@/components/providers/OfflineQueueProvider'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { countAlertEvents, getVenezuelaSeismicEvents } from '@/lib/usgs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(CRISIS_CONFIG.siteUrl),
  title: 'Vigil — Respuesta a Crisis Venezuela',
  description:
    'Plataforma humanitaria unificada. Personas desaparecidas, mapa de crisis, voluntarios y información verificada.',
  applicationName: 'Vigil',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Vigil',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Vigil — Respuesta a Crisis Venezuela',
    description:
      'Plataforma humanitaria unificada. Personas desaparecidas, mapa de crisis, voluntarios y información verificada.',
    url: CRISIS_CONFIG.siteUrl,
    siteName: 'Vigil',
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vigil — Respuesta a Crisis Venezuela',
    description:
      'Plataforma humanitaria unificada. Personas desaparecidas, mapa de crisis, voluntarios y información verificada.',
  },
}

// width/initialScale are required — without them mobile browsers render at
// ~980px desktop width and scale the page down, bypassing all breakpoints.
// colorScheme: 'light' blocks Chrome Android auto-inversion.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  themeColor: '#0F172A',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('footer')
  const tNav = await getTranslations('nav')
  const events = await getVenezuelaSeismicEvents()
  const alertCount = countAlertEvents(events)

  const isSpanish = locale === 'es'
  const privacyHref = isSpanish ? '/privacidad' : '/privacy'
  const termsHref = isSpanish ? '/terminos' : '/terms'

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-screen font-sans">
        <SkipToContent />
        <NextIntlClientProvider messages={messages}>
          <EmergencyBanner aftershockCount={alertCount} />
          <WeatherBar />
          <div className="flex min-h-[calc(100vh-44px)]">
            <Navigation />
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
                <p className="hidden text-[13px] text-vigil-muted md:block">
                  {CRISIS_CONFIG.crisis} · {CRISIS_CONFIG.country}
                </p>
                <LanguageSwitcher />
              </header>
              <NetworkStatusBanner />
              <main
                id="main-content"
                tabIndex={-1}
                className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0"
              >
                {children}
              </main>
              <footer className="relative z-[1] bg-[color:var(--vigil-surface)] text-[13px] text-[color:var(--vigil-muted)]">
                {/* Group 1 — Open source / legal */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[color:var(--vigil-border)] px-4 py-4 text-center">
                  <Link
                    href={privacyHref}
                    className="inline-flex min-h-[44px] items-center transition-colors hover:text-vigil-blue"
                  >
                    {tNav('privacy')}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link
                    href={termsHref}
                    className="inline-flex min-h-[44px] items-center transition-colors hover:text-vigil-blue"
                  >
                    {tNav('terms')}
                  </Link>
                  <span aria-hidden="true">·</span>
                  <a
                    href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`}
                    className="inline-flex min-h-[44px] items-center transition-colors hover:text-vigil-blue"
                  >
                    {t('contact')}
                  </a>
                  <span aria-hidden="true">·</span>
                  <a
                    href="https://github.com/Atenaxproject/vigil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center transition-colors hover:text-vigil-blue"
                  >
                    {t('openSource')}
                  </a>
                  <span aria-hidden="true">·</span>
                  <span>{t('madeFor')}</span>
                </div>

                {/* Group 2 — Credits */}
                <div className="border-t border-[color:var(--vigil-border)] px-4 py-4 text-center">
                  <p className="text-[16px] text-[color:var(--vigil-body)]">{t('credits')} 🇻🇪</p>
                  <p className="mt-1">
                    {t('creditsByPrefix')}{' '}
                    <a
                      href="https://atenaxproject.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vigil-blue underline-offset-2 transition-colors hover:underline"
                    >
                      {t('creditsByLink')}
                    </a>
                  </p>
                  <p className="mt-1">{t('builtWith')}</p>
                </div>

                {/* Group 3 — Emergency disclaimer (quiet, but scannable) */}
                <div className="border-t border-[color:var(--vigil-border)] px-4 py-4">
                  <p className="flex items-center justify-center gap-2 text-center text-[16px] font-medium text-[color:var(--vigil-body)]">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[color:var(--vigil-body)]" aria-hidden="true" />
                    <span>{t('notEmergency', { hotline: CRISIS_CONFIG.emergency.hotlineLabel })}</span>
                  </p>
                </div>
              </footer>
            </div>
          </div>
          <Toaster position="top-center" />
          <OfflineQueueProvider />
          <FeedbackWidget />
          <VigilAssistant />
          <IOSInstallBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
