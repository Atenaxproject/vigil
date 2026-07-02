'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'

const STARLINK_SUPPORT_URL =
  'https://starlink.com/support/article/28779c02-f1cb-4d77-1f75-b947ae179c91'
const STARLINK_ACTIVATE_URL = 'https://starlink.com/activate'
const STARLINK_EMERGENCY_URL = 'https://starlink.com/emergency-response'

export function ConnectivityInfoCard() {
  const t = useTranslations('connectivityInfo')

  const links = [
    {
      href: STARLINK_SUPPORT_URL,
      label: t('links.support'),
      description: t('links.supportDesc'),
    },
    {
      href: STARLINK_ACTIVATE_URL,
      label: t('links.activate'),
      description: t('links.activateDesc'),
    },
    {
      href: STARLINK_EMERGENCY_URL,
      label: t('links.emergency'),
      description: t('links.emergencyDesc'),
    },
  ]

  return (
    <section className="mt-10 rounded-card border border-amber-200 bg-amber-50/50 p-4">
      <h2 className="text-[20px] font-semibold text-vigil-ink">{t('title')}</h2>
      <p className="mt-1 text-[16px] text-vigil-body">{t('subtitle')}</p>

      <div className="mt-4 space-y-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
          >
            <p className="flex items-center gap-1 text-[16px] font-medium text-vigil-blue">
              {link.label}
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            </p>
            <p className="mt-1 text-[13px] text-vigil-muted">{link.description}</p>
          </a>
        ))}
      </div>

      <Link
        href="/conectividad"
        className="mt-4 inline-flex min-h-[44px] items-center text-[16px] font-medium text-vigil-blue hover:underline"
      >
        {t('reportPoint')} →
      </Link>

      <p className="mt-4 text-[13px] text-vigil-muted">{t('carrierNote')}</p>
      <p className="mt-2 text-[13px] text-status-unverified">{t('mapNote')}</p>
    </section>
  )
}
