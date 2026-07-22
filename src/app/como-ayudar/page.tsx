import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getDonationOrganizations } from '@/lib/data'
import { VerifiedBadge } from '@/components/ui/VerifiedBadge'
import { dedupeDonationOrgs, getContentDisposition } from '@/lib/content-expiry'

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
  {
    name: 'Global Empowerment Mission (GEM)',
    description_es:
      'Socio privado oficial del Departamento de Estado de EE.UU. para la respuesta al terremoto. Distribuciones diarias, sede GEM LATAM en La Guaira, y centro logístico en Doral, Florida.',
    description_en:
      'Official U.S. State Department private partner for the earthquake response. Daily distributions, GEM LATAM HQ in La Guaira, and logistics hub in Doral, Florida.',
    donation_link: 'https://www.globalempowermentmission.org/donate',
    verified: true,
  },
  {
    name: 'We Love Foundation (I Love Venezuela)',
    description_es:
      'Fundación de la diáspora venezolana, socio operativo de GEM en cada distribución de ayuda en Venezuela.',
    description_en:
      "Venezuelan diaspora foundation and GEM's operating partner on every aid distribution in Venezuela.",
    donation_link: 'https://www.welove.foundation',
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

/** Collection points with expiry — peak-response "activo el…" claims must not linger. */
const COLLECTION_POINTS = [
  {
    name: 'Universidad Central de Venezuela',
    noteKey: 'ucv' as const,
    verifiedAt: '2026-06-27',
    suppressWhenStale: true,
  },
  {
    name: 'Estado Falcón',
    note: '20+ puntos de acopio incluyendo sede de Periodistas de Paraguaná',
    verifiedAt: '2026-07-01',
    suppressWhenStale: false,
  },
  {
    name: 'Global Empowerment Mission (GEM)',
    noteKey: 'gem' as const,
    verifiedAt: '2026-07-11',
  },
]

export default async function ComoAyudarPage() {
  const t = await getTranslations('howToHelp')
  const locale = await getLocale()
  const orgs = await getDonationOrganizations()
  const rawOrgs = orgs.length > 0 ? orgs : FALLBACK_ORGS
  const displayOrgs = dedupeDonationOrgs(
    rawOrgs.map((org) => ({
      name: org.name,
      description_es: ('description_es' in org ? org.description_es : null) ?? null,
      description_en: ('description_en' in org ? org.description_en : null) ?? null,
      donation_link: ('donation_link' in org ? org.donation_link : null) ?? null,
      verified: Boolean(org.verified),
    }))
  )

  const teamsDisposition = getContentDisposition({
    verifiedAt: '2026-06-27',
    suppressWhenStale: true,
  })
  const riaDisposition = getContentDisposition({
    expiresAt: '2026-07-15',
    suppressWhenStale: false,
  })
  const ofacDisposition = getContentDisposition({
    expiresAt: '2026-10-23',
  })

  const collectionPoints = COLLECTION_POINTS.filter((p) => {
    const d = getContentDisposition({
      verifiedAt: p.verifiedAt,
      suppressWhenStale: p.suppressWhenStale,
    })
    return d.disposition === 'show'
  })

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      {/* RCF family search belongs on /buscar — not donation channels */}
      <section className="mt-10 rounded-card border border-slate-200 bg-vigil-cloud p-4">
        <h2 className="text-[17px] font-medium text-vigil-ink">{t('familySearch.relocatedTitle')}</h2>
        <p className="mt-2 text-[16px] text-vigil-body">{t('familySearch.relocatedBody')}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/buscar"
            className="inline-flex min-h-[44px] items-center text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
          >
            {t('familySearch.buscarLink')} →
          </Link>
          <Link
            href="/red"
            className="inline-flex min-h-[44px] items-center text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
          >
            {t('familySearch.redLink')} →
          </Link>
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
              locale === 'en' && org.description_en
                ? org.description_en
                : org.description_es
            const link = org.donation_link
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
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('usaDiaspora.title')}</h2>
        <p className="mt-2 text-[16px] text-slate-600">{t('usaDiaspora.gemDoral')}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href="https://www.globalempowermentmission.org/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
          >
            {t('usaDiaspora.gemDonateCta')}
          </a>
          <Link
            href="/apoyo-usa"
            className="inline-flex min-h-[44px] items-center text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
          >
            {t('usaDiaspora.hubLink')} →
          </Link>
        </div>
        <p className="mt-3 text-[13px] text-vigil-muted">{t('usaDiaspora.hoursNote')}</p>
      </section>

      {teamsDisposition.disposition === 'show' ? (
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
      ) : (
        <section className="mt-10 rounded-card border border-slate-200 bg-vigil-cloud p-4">
          <h2 className="text-[17px] font-medium text-vigil-ink">{t('teams.title')}</h2>
          <p className="mt-2 text-[16px] text-vigil-body">{t('teams.suppressed')}</p>
          <a
            href="https://reliefweb.int/country/ven"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-[44px] items-center text-[16px] text-vigil-blue underline-offset-2 hover:underline"
          >
            ReliefWeb Venezuela →
          </a>
        </section>
      )}

      {ofacDisposition.disposition !== 'suppressed' && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('ofac.title')}</h2>
          <p className="mt-2 text-[16px] text-slate-600">{t('ofac.note')}</p>
          {ofacDisposition.disposition === 'expired' && (
            <p className="mt-2 text-[13px] font-medium text-status-unverified">{t('expiredBadge')}</p>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('transfers.title')}</h2>
        {riaDisposition.disposition === 'expired' ? (
          <p className="mt-2 text-[16px] text-slate-600">{t('transfers.noteExpired')}</p>
        ) : (
          <p className="mt-2 text-[16px] text-slate-600">{t('transfers.note')}</p>
        )}
        <p className="mt-1 font-mono text-[13px] text-vigil-muted">{t('transfers.source')}</p>
        <div className="mt-4 space-y-3">
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <h3 className="text-[17px] font-medium text-vigil-ink">{t('transfers.meru.title')}</h3>
            <p className="mt-2 text-[16px] text-slate-600">{t('transfers.meru.note')}</p>
          </div>
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <h3 className="text-[17px] font-medium text-vigil-ink">{t('transfers.banesco.title')}</h3>
            <p className="mt-2 text-[16px] text-slate-600">{t('transfers.banesco.note')}</p>
          </div>
        </div>
        <a
          href="https://www.riamoneytransfer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[16px] text-vigil-blue underline"
        >
          riamoneytransfer.com
        </a>
      </section>

      {collectionPoints.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('collection.title')}</h2>
          <div className="mt-4 space-y-3">
            {collectionPoints.map((point) => (
              <div key={point.name} className="rounded-card border border-slate-200 bg-white p-4">
                <h3 className="text-[17px] font-medium text-vigil-ink">{point.name}</h3>
                <p className="mt-1 text-[16px] text-slate-600">
                  {'noteKey' in point && point.noteKey === 'ucv'
                    ? t('collection.ucvNote')
                    : 'noteKey' in point && point.noteKey === 'gem'
                      ? t('collection.gemNote')
                      : point.note}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link href="/voluntarios" className="mt-8 inline-block text-[16px] text-vigil-blue underline">
        {t('volunteerLink')} →
      </Link>

      <Link href="/organizaciones" className="mt-4 inline-block text-[16px] text-vigil-blue underline">
        {t('directoryLink')} →
      </Link>
    </div>
  )
}
