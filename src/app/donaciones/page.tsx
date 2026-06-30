import { getTranslations } from 'next-intl/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export default async function DonacionesPage() {
  const t = await getTranslations('donate')

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-2 text-[16px] text-vigil-muted">{t('note')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[t('international'), t('local'), t('goods'), t('time')].map((section) => (
          <div key={section} className="rounded-card border border-slate-200 bg-white p-4">
            <h2 className="text-[17px] font-medium text-vigil-ink">{section}</h2>
            <ul className="mt-2 space-y-2">
              {CRISIS_CONFIG.partnerLinks
                .filter((l) => l.type === 'ngo' || l.type === 'official')
                .map((link) => (
                  <li key={link.url}>
                    <a href={link.url} className="text-[16px] text-vigil-blue hover:underline" target="_blank" rel="noopener noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
