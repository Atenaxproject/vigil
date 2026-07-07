// Preparedness content loader. Static imports = content ships in the bundle,
// so guides work offline by default once visited. Every file is validated
// through the zod schema — malformed content throws at build/render.

import { CRISIS_CONFIG } from '@/config/crisis.config'
import {
  PREPAREDNESS_ARCHETYPES,
  preparednessGuideSchema,
  type PreparednessGuide,
} from './_schema'
import earthquakeEs from './earthquake/es.json'
import earthquakeEn from './earthquake/en.json'
import hurricaneEs from './hurricane/es.json'
import hurricaneEn from './hurricane/en.json'
import floodEs from './flood/es.json'
import floodEn from './flood/en.json'

// ES + EN are handcrafted. Other locales fall back to ES until reviewed
// translations ship (safety-critical content never ships machine-only).
const GUIDES: Record<string, Record<string, unknown>> = {
  earthquake: { es: earthquakeEs, en: earthquakeEn },
  hurricane: { es: hurricaneEs, en: hurricaneEn },
  flood: { es: floodEs, en: floodEn },
}

export function getPreparednessGuide(archetype: string, locale: string): PreparednessGuide | null {
  const byLocale = GUIDES[archetype]
  if (!byLocale) return null
  const raw = byLocale[locale] ?? byLocale.es
  return preparednessGuideSchema.parse(raw)
}

export interface GuideIndexEntry {
  archetype: string
  title: string
  summary: string
  /** True when the archetype matches the live deployment (ordered first). */
  currentDeployment: boolean
}

/** Guide index ordered: current deployment's archetypes first, rest after. */
export function getGuideIndex(locale: string): GuideIndexEntry[] {
  const deploymentArchetypes = CRISIS_CONFIG.disasterArchetypes as string[]
  const ordered = [
    ...PREPAREDNESS_ARCHETYPES.filter((a) => deploymentArchetypes.includes(a)),
    ...PREPAREDNESS_ARCHETYPES.filter((a) => !deploymentArchetypes.includes(a)),
  ]
  const entries: GuideIndexEntry[] = []
  for (const archetype of ordered) {
    const guide = getPreparednessGuide(archetype, locale)
    if (!guide) continue
    entries.push({
      archetype,
      title: guide.title,
      summary: guide.summary,
      currentDeployment: deploymentArchetypes.includes(archetype),
    })
  }
  return entries
}

export { PREPAREDNESS_ARCHETYPES }
export type { PreparednessGuide }
