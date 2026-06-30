import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import { EmergencyBanner } from '@/components/layout/EmergencyBanner'
import { WeatherBar } from '@/components/layout/WeatherBar'
import { Navigation } from '@/components/layout/Navigation'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
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
  manifest: '/manifest.json',
}

// Declare light explicitly so Chrome's "Auto Dark Theme" (Android) does not
// auto-invert the UI. DESIGN-SYSTEM.md mandates light as the true default.
export const viewport: Viewport = {
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
        <NextIntlClientProvider messages={messages}>
          <EmergencyBanner aftershockCount={alertCount} />
          <WeatherBar />
          <div className="flex min-h-[calc(100vh-44px)]">
            <Navigation />
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
                <p className="hidden text-[11px] text-vigil-muted md:block">
                  {CRISIS_CONFIG.crisis} · {CRISIS_CONFIG.country}
                </p>
                <LanguageSwitcher />
              </header>
              <NetworkStatusBanner />
              <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
              </main>
              <footer className="border-t border-slate-200 bg-white text-[11px] text-vigil-muted">
                {/* Tier 1 — Safety disclaimer (most prominent) */}
                <div className="border-b border-slate-200 bg-vigil-cloud px-4 py-4 text-center">
                  <p className="text-[13px] font-medium leading-relaxed text-slate-700">
                    {t('notEmergency', { hotline: CRISIS_CONFIG.emergency.hotlineLabel })}
                  </p>
                  <a
                    href={`tel:${CRISIS_CONFIG.emergency.hotline}`}
                    className="mt-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-badge bg-status-missing px-5 font-mono text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    {CRISIS_CONFIG.emergency.hotlineLabel} · {CRISIS_CONFIG.emergency.hotline}
                  </a>
                </div>

                {/* Tier 2 — Credits (understated) */}
                <div className="px-4 py-5 text-center">
                  <p className="text-[13px] text-slate-600">{t('credits')} 🇻🇪</p>
                  <p className="mt-1">
                    {t('creditsByPrefix')}{' '}
                    <a
                      href="https://atenaxproject.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-vigil-blue"
                    >
                      {t('creditsByLink')}
                    </a>
                  </p>
                  <p className="mt-1 text-vigil-muted">{t('builtWith')}</p>
                </div>

                {/* Tier 3 — Legal / meta */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-200 px-4 py-4 text-center">
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
                  <span>{t('openSource')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('madeFor')}</span>
                </div>
              </footer>
            </div>
          </div>
          <Toaster position="top-center" />
          <OfflineQueueProvider />
          <FeedbackWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
