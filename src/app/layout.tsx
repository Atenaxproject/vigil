import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { Toaster } from 'react-hot-toast'
import { EmergencyBanner } from '@/components/layout/EmergencyBanner'
import { Navigation } from '@/components/layout/Navigation'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { countAlertEvents, getVenezuelaSeismicEvents } from '@/lib/usgs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://vigil.youtheway.org'),
  title: 'Vigil — Respuesta a Crisis Venezuela',
  description:
    'Plataforma humanitaria unificada. Personas desaparecidas, mapa de crisis, voluntarios y información verificada.',
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('footer')
  const events = await getVenezuelaSeismicEvents()
  const alertCount = countAlertEvents(events)

  return (
    <html lang={locale} className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider messages={messages}>
          <EmergencyBanner aftershockCount={alertCount} />
          <div className="flex min-h-[calc(100vh-44px)]">
            <Navigation />
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
                <p className="hidden text-[11px] text-vigil-muted md:block">
                  {CRISIS_CONFIG.crisis} · {CRISIS_CONFIG.country}
                </p>
                <LanguageSwitcher />
              </header>
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
              <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-[11px] text-vigil-muted">
                <p>{t('madeFor')}</p>
                <p className="mt-1">{t('openSource')}</p>
                <p className="mt-2 text-slate-500">
                  {t('notEmergency', { hotline: CRISIS_CONFIG.emergency.hotlineLabel })}
                </p>
              </footer>
            </div>
          </div>
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
