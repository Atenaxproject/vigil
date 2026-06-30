import { getTranslations } from 'next-intl/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizacionesPage() {
  const t = await getTranslations('organizations')

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
      <p className="mt-4 text-[16px] text-vigil-muted">{t('registerNote')}</p>
      <div className="mt-6 space-y-3">
        {CRISIS_CONFIG.partnerLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
          >
            <span className="font-medium text-vigil-ink">{link.name}</span>
            <span className="ml-2 text-[13px] uppercase text-vigil-muted">{link.type}</span>
          </a>
        ))}
      </div>
      <Link href="/donaciones" className="mt-6 inline-block text-[16px] text-vigil-blue underline">
        {t('donate')} →
      </Link>
    </div>
  )
}
