import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export const metadata = {
  title: 'Protección de Menores — Vigil',
  description:
    'Cómo Vigil publica y protege la información de niños, niñas y adolescentes desaparecidos: reconocer sin exponer la ubicación.',
}

export default async function ProteccionDeMenoresPage() {
  const t = await getTranslations('proteccionMenores')

  const sections = [
    { title: t('publishTitle'), body: t('publishBody') },
    { title: t('locationTitle'), body: t('locationBody') },
    { title: t('federationTitle'), body: t('federationBody') },
    { title: t('photoTitle'), body: t('photoBody') },
    { title: t('removalTitle'), body: t('removalBody') },
    { title: t('governmentTitle'), body: t('governmentBody') },
  ] as const

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-vigil-ink">{t('title')}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-vigil-body">{t('intro')}</p>

      <p className="mt-4 rounded-card border border-slate-200 bg-vigil-cloud p-4 text-[16px] font-medium text-vigil-ink">
        {t('principle')}
      </p>

      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-[20px] font-semibold text-vigil-ink">{s.title}</h2>
            <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed text-vigil-body">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-slate-200 pt-6 text-[13px] text-vigil-muted">
        {t('privacyLink')}{' '}
        <Link href="/privacidad" className="font-medium text-vigil-blue hover:underline">
          {t('privacyLinkCta')}
        </Link>
      </p>
    </main>
  )
}
