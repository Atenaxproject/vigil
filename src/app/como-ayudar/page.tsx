import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getDonationOrganizations } from '@/lib/data'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'

export const dynamic = 'force-dynamic'

const FALLBACK_ORGS = [
  {
    name: 'IFRC — Federación Internacional de la Cruz Roja',
    description_es:
      'Lanzó apelación de emergencia CHF 2 millones para apoyar a Cruz Roja Venezolana.',
    description_en:
      'Launched CHF 2 million emergency allocation to support Venezuelan Red Cross.',
    donation_link: 'https://donate.redcrossredcrescent.org',
    verified: true,
  },
  {
    name: 'UNICEF Venezuela',
    description_es: 'Entregando suministros médicos y WASH. 3.9 millones de niños en zonas afectadas.',
    description_en: 'Delivering medical and WASH supplies. 3.9 million children in affected areas.',
    donation_link: 'https://www.unicef.org/emergencies',
    verified: true,
  },
  {
    name: 'Direct Relief',
    description_es: '100% de las donaciones van exclusivamente a la respuesta en Venezuela.',
    description_en: '100% of Venezuela-designated contributions go exclusively to this response.',
    donation_link: 'https://www.directrelief.org/emergency/venezuela-earthquakes-2026/',
    verified: true,
  },
]

const COUNTRIES = {
  americas: [
    'Argentina',
    'Brasil',
    'Canadá',
    'Chile',
    'Colombia',
    'Cuba',
    'Ecuador',
    'El Salvador',
    'Estados Unidos',
    'Guatemala',
    'México',
    'Panamá',
    'Perú',
    'República Dominicana',
  ],
  europe: [
    'Alemania',
    'Chequia',
    'España',
    'Francia',
    'Italia',
    'Luxemburgo',
    'Países Bajos',
    'Portugal',
    'Suiza',
  ],
  asia: ['China', 'India', 'Turquía'],
}

const COLLECTION_POINTS = [
  {
    name: 'Universidad Central de Venezuela',
    note: 'Centro de acopio verificado activo el 27 de junio',
  },
  {
    name: 'Estado Falcón',
    note: '20+ puntos de acopio incluyendo sede de Periodistas de Paraguaná',
  },
  {
    name: 'Área de Miami — GEM',
    note: 'Global Empowerment Mission — múltiples puntos. Ver globalempowermentmission.org',
  },
]

export default async function ComoAyudarPage() {
  const t = await getTranslations('howToHelp')
  const locale = await getLocale()
  const orgs = await getDonationOrganizations()
  const displayOrgs = orgs.length > 0 ? orgs : FALLBACK_ORGS

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('familySearch.title')}</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <p className="text-[16px] text-vigil-body">{t('familySearch.honduras')}</p>
          </div>
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <p className="text-[16px] text-vigil-body">{t('familySearch.argentina')}</p>
          </div>
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <p className="text-[16px] text-vigil-body">{t('familySearch.colombia')}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('donations.title')}</h2>
        <p className="mt-1 text-[16px] text-vigil-muted">{t('donations.curatedNote')}</p>
        <div className="mt-3 rounded-card border border-amber-200 bg-status-unverified-bg p-4 text-[16px] text-amber-900">
          {t('donations.warning')}
        </div>
        <div className="mt-4 space-y-3">
          {displayOrgs.map((org) => {
            const desc =
              locale === 'en' && 'description_en' in org && org.description_en
                ? org.description_en
                : 'description_es' in org
                  ? org.description_es
                  : null
            const link = 'donation_link' in org ? org.donation_link : null
            return (
              <article
                key={org.name}
                className="rounded-card border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[17px] font-medium text-vigil-ink">{org.name}</h3>
                  {org.verified && <VerifiedBadge />}
                </div>
                {desc && <p className="mt-2 text-[16px] text-slate-600">{desc}</p>}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
                  >
                    {t('donations.donateButton')}
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('teams.title')}</h2>
        <p className="mt-2 text-[16px] text-slate-600">{t('teams.summary')}</p>
        <p className="mt-1 font-mono text-[13px] text-vigil-muted">{t('teams.source')}</p>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-[17px] font-medium">{t('teams.americas')}</h3>
            <p className="mt-1 text-[16px] text-slate-600">{COUNTRIES.americas.join(' · ')}</p>
          </div>
          <div>
            <h3 className="text-[17px] font-medium">{t('teams.europe')}</h3>
            <p className="mt-1 text-[16px] text-slate-600">{COUNTRIES.europe.join(' · ')}</p>
          </div>
          <div>
            <h3 className="text-[17px] font-medium">{t('teams.asia')}</h3>
            <p className="mt-1 text-[16px] text-slate-600">{COUNTRIES.asia.join(' · ')}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('transfers.title')}</h2>
        <p className="mt-2 text-[16px] text-slate-600">{t('transfers.note')}</p>
        <p className="mt-1 font-mono text-[13px] text-vigil-muted">{t('transfers.source')}</p>
        <a
          href="https://www.riamoneytransfer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[16px] text-vigil-blue underline"
        >
          riamoneytransfer.com
        </a>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('collection.title')}</h2>
        <div className="mt-4 space-y-3">
          {COLLECTION_POINTS.map((point) => (
            <div key={point.name} className="rounded-card border border-slate-200 bg-white p-4">
              <h3 className="text-[17px] font-medium text-vigil-ink">{point.name}</h3>
              <p className="mt-1 text-[16px] text-slate-600">{point.note}</p>
            </div>
          ))}
        </div>
      </section>

      <Link href="/voluntarios" className="mt-8 inline-block text-[16px] text-vigil-blue underline">
        {t('volunteerLink')} →
      </Link>

      <Link href="/organizaciones" className="mt-4 inline-block text-[16px] text-vigil-blue underline">
        {t('directoryLink')} →
      </Link>
    </div>
  )
}
