import { getTranslations } from 'next-intl/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export default async function InformacionPage() {
  const t = await getTranslations('crisisInfo')

  const stats = [
    { label: t('stats.deaths'), value: '1,430+', source: 'OCHA / CNN / Asamblea Nacional' },
    { label: t('stats.injured'), value: '3,238+', source: 'OCHA' },
    { label: t('stats.missing'), value: '45,000–68,900', source: t('stats.missingSource') },
    { label: t('stats.displaced'), value: '12,000+', source: 'OCHA' },
    { label: t('stats.buildings'), value: '770+', source: 'OCHA' },
    { label: t('stats.damage'), value: '$6.7B', source: 'PNUD / RAPIDA' },
    { label: t('stats.children'), value: '3.9M', source: 'UNICEF' },
    { label: t('stats.rescueTeams'), value: '2,624 / 27 países', source: 'OCHA' },
    { label: t('stats.aftershocks'), value: '430+', source: 'USGS' },
  ]

  const states = [
    'La Guaira (peor afectado — 1,400+ edificios destruidos)',
    'Caracas (Chacao, Baruta, Pinto Salinas)',
    'Carabobo (Puerto Cabello)',
    'Yaracuy (epicentro — San Felipe)',
    'Miranda',
    'Aragua',
    'Falcón',
  ]

  const infrastructure = [
    { label: t('infra.power'), value: '75%', source: 'OCHA' },
    { label: t('infra.water'), value: '68%', source: 'OCHA' },
    { label: t('infra.roads'), value: '90%', source: 'OCHA' },
    { label: t('infra.airport'), value: t('infra.airportValue'), source: 'CNN' },
    { label: t('infra.bridge'), value: t('infra.bridgeValue'), source: 'CNN' },
  ]

  const hotlines = [
    {
      label: t('hotlines.rescate'),
      value: `${CRISIS_CONFIG.emergency.hotlineLabel} — ${CRISIS_CONFIG.emergency.hotline}`,
      source: 'Gobierno de Venezuela',
    },
    {
      label: t('hotlines.redCross'),
      value: '+58-212-781-2974',
      source: 'Cruz Roja Venezolana',
    },
    {
      label: t('hotlines.venapp'),
      value: CRISIS_CONFIG.emergency.officialApp,
      source: 'Gobierno de Venezuela',
    },
    {
      label: 'OCHA Venezuela',
      value: '@OCHAVenezuela',
      source: 'X / Twitter',
    },
  ]

  const sources = [
    { name: 'ReliefWeb', url: 'https://reliefweb.int/country/ven' },
    { name: 'OCHA Venezuela', url: 'https://www.unocha.org/venezuela' },
    { name: 'Caracas Chronicles', url: 'https://www.caracaschronicles.com' },
    { name: 'Cruz Roja Venezolana', url: 'https://x.com/CruzRojaVe' },
  ]

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-2xl font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[13px] text-vigil-muted">{t('subtitle')}</p>
      <p className="mt-2 font-mono text-[11px] text-vigil-muted">{t('updated')}</p>

      <section className="mt-8">
        <h2 className="text-[18px] font-semibold text-vigil-ink">{t('stats.title')}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[11px] text-vigil-muted">{stat.label}</p>
              <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">{stat.value}</p>
              <p className="mt-1 font-mono text-[11px] text-vigil-muted">
                {t('source')}: {stat.source}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-vigil-ink">{t('states.title')}</h2>
        <ul className="mt-3 space-y-2">
          {states.map((state) => (
            <li key={state} className="text-[13px] text-slate-600">
              · {state}
            </li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[11px] text-vigil-muted">{t('source')}: OCHA, CNN</p>
      </section>

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-vigil-ink">{t('infra.title')}</h2>
        <div className="mt-4 space-y-3">
          {infrastructure.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-card border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-[13px] font-medium text-vigil-ink">{item.label}</p>
                <p className="font-mono text-[11px] text-vigil-muted">
                  {t('source')}: {item.source}
                </p>
              </div>
              <span className="font-mono text-[15px] font-semibold text-vigil-ink">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-vigil-ink">{t('hotlines.title')}</h2>
        <div className="mt-4 space-y-3">
          {hotlines.map((line) => (
            <div key={line.label} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[13px] font-medium text-vigil-ink">{line.label}</p>
              <p className="mt-1 font-mono text-[15px] text-vigil-blue">{line.value}</p>
              <p className="mt-1 font-mono text-[11px] text-vigil-muted">
                {t('source')}: {line.source}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[18px] font-semibold text-vigil-ink">{t('sources.title')}</h2>
        <div className="mt-4 space-y-2">
          {sources.map((src) => (
            <a
              key={src.url}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-card border border-slate-200 bg-white px-4 py-3 text-[13px] text-vigil-blue hover:border-vigil-blue"
            >
              {src.name} →
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
