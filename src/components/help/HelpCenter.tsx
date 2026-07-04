'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type HelpSection = {
  id: string
  titleKey: string
  items: Array<{ questionKey: string; answerKey: string }>
}

const SECTIONS: HelpSection[] = [
  {
    id: 'primeros-pasos',
    titleKey: 'sections.gettingStarted.title',
    items: [
      { questionKey: 'sections.gettingStarted.whatIsVigil.q', answerKey: 'sections.gettingStarted.whatIsVigil.a' },
      { questionKey: 'sections.gettingStarted.government.q', answerKey: 'sections.gettingStarted.government.a' },
      { questionKey: 'sections.gettingStarted.install.q', answerKey: 'sections.gettingStarted.install.a' },
      { questionKey: 'sections.gettingStarted.languages.q', answerKey: 'sections.gettingStarted.languages.a' },
      { questionKey: 'sections.gettingStarted.free.q', answerKey: 'sections.gettingStarted.free.a' },
    ],
  },
  {
    id: 'personas-desaparecidas',
    titleKey: 'sections.missingPersons.title',
    items: [
      { questionKey: 'sections.missingPersons.search.q', answerKey: 'sections.missingPersons.search.a' },
      { questionKey: 'sections.missingPersons.report.q', answerKey: 'sections.missingPersons.report.a' },
      { questionKey: 'sections.missingPersons.claimLink.q', answerKey: 'sections.missingPersons.claimLink.a' },
      { questionKey: 'sections.missingPersons.phone.q', answerKey: 'sections.missingPersons.phone.a' },
      { questionKey: 'sections.missingPersons.status.q', answerKey: 'sections.missingPersons.status.a' },
      { questionKey: 'sections.missingPersons.photo.q', answerKey: 'sections.missingPersons.photo.a' },
      { questionKey: 'sections.missingPersons.pfif.q', answerKey: 'sections.missingPersons.pfif.a' },
      { questionKey: 'sections.missingPersons.sighting.q', answerKey: 'sections.missingPersons.sighting.a' },
    ],
  },
  {
    id: 'mapa-necesidades',
    titleKey: 'sections.mapNeeds.title',
    items: [
      { questionKey: 'sections.mapNeeds.readMap.q', answerKey: 'sections.mapNeeds.readMap.a' },
      { questionKey: 'sections.mapNeeds.needHelp.q', answerKey: 'sections.mapNeeds.needHelp.a' },
      { questionKey: 'sections.mapNeeds.collectionPoint.q', answerKey: 'sections.mapNeeds.collectionPoint.a' },
      { questionKey: 'sections.mapNeeds.colors.q', answerKey: 'sections.mapNeeds.colors.a' },
    ],
  },
  {
    id: 'voluntarios-intercambio',
    titleKey: 'sections.volunteers.title',
    items: [
      { questionKey: 'sections.volunteers.register.q', answerKey: 'sections.volunteers.register.a' },
      { questionKey: 'sections.volunteers.exchange.q', answerKey: 'sections.volunteers.exchange.a' },
      { questionKey: 'sections.volunteers.contact.q', answerKey: 'sections.volunteers.contact.a' },
      { questionKey: 'sections.volunteers.structural.q', answerKey: 'sections.volunteers.structural.a' },
    ],
  },
  {
    id: 'seguridad-confianza',
    titleKey: 'sections.safety.title',
    items: [
      { questionKey: 'sections.safety.unverified.q', answerKey: 'sections.safety.unverified.a' },
      { questionKey: 'sections.safety.flag.q', answerKey: 'sections.safety.flag.a' },
      { questionKey: 'sections.safety.structural.q', answerKey: 'sections.safety.structural.a' },
      { questionKey: 'sections.safety.hotline.q', answerKey: 'sections.safety.hotline.a' },
    ],
  },
  {
    id: 'conectividad-infraestructura',
    titleKey: 'sections.connectivity.title',
    items: [
      { questionKey: 'sections.connectivity.wifi.q', answerKey: 'sections.connectivity.wifi.a' },
      { questionKey: 'sections.connectivity.alerts.q', answerKey: 'sections.connectivity.alerts.a' },
    ],
  },
  {
    id: 'donaciones-organizaciones',
    titleKey: 'sections.donations.title',
    items: [
      { questionKey: 'sections.donations.where.q', answerKey: 'sections.donations.where.a' },
      { questionKey: 'sections.donations.listed.q', answerKey: 'sections.donations.listed.a' },
      { questionKey: 'sections.donations.sister.q', answerKey: 'sections.donations.sister.a' },
    ],
  },
  {
    id: 'legal-privacidad',
    titleKey: 'sections.legal.title',
    items: [
      { questionKey: 'sections.legal.privacy.q', answerKey: 'sections.legal.privacy.a' },
      { questionKey: 'sections.legal.terms.q', answerKey: 'sections.legal.terms.a' },
      { questionKey: 'sections.legal.erasure.q', answerKey: 'sections.legal.erasure.a' },
      { questionKey: 'sections.legal.operator.q', answerKey: 'sections.legal.operator.a' },
    ],
  },
]

export function HelpCenter() {
  const t = useTranslations('helpCenter')
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <header className="mb-8">
        <h1 className="font-display text-[26px] font-semibold tracking-tight text-vigil-ink">{t('title')}</h1>
        <p className="mt-2 text-[16px] text-vigil-body">{t('subtitle')}</p>
      </header>

      <nav aria-label={t('sectionNav')} className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-slate-200 px-3 py-1 text-[13px] text-vigil-body hover:border-vigil-blue hover:text-vigil-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            {t(section.titleKey)}
          </a>
        ))}
      </nav>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openId === section.id
          return (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-card border border-slate-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : section.id)}
                aria-expanded={isOpen}
                className="flex w-full min-h-[44px] items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vigil-blue/40"
              >
                <h2 className="text-[17px] font-medium text-vigil-ink">{t(section.titleKey)}</h2>
                <ChevronDown
                  className={cn('h-5 w-5 shrink-0 text-vigil-muted transition-transform', isOpen && 'rotate-180')}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-4 pb-4">
                  <dl className="divide-y divide-slate-100">
                    {section.items.map((item) => (
                      <div key={item.questionKey} className="py-4">
                        <dt className="text-[16px] font-medium text-vigil-ink">{t(item.questionKey)}</dt>
                        <dd className="mt-2 text-[16px] leading-relaxed text-vigil-body">{t(item.answerKey)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
