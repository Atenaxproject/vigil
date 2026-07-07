// Preparedness content schema — every guide file is validated at build time
// (imported through getPreparednessGuide, which parses with zod; a malformed
// file fails the build, never ships silently).
//
// Content authoring rules (non-negotiable):
// - Adapt ONLY from official sources: Ready.gov, FEMA, NWS/NOAA, American Red
//   Cross, PAHO, Cruz Roja. Min 2 sources per guide, rendered visibly.
// - Never generate novel safety advice. Conflicts → FEMA/NWS wins.
// - critical:true marks emergency numbers / imperative safety actions — these
//   are the human-review gate before any generated locale ships.

import { z } from 'zod'
import type { DisasterArchetype } from '@/types/vigil.types'

export const prepBlockSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1), // plain text / markdown-lite — no HTML injection
  context: z.enum(['interior', 'exterior', 'vehiculo']).optional(),
  critical: z.boolean().optional(),
})

export const preparednessGuideSchema = z.object({
  archetype: z.enum([
    'earthquake',
    'hurricane',
    'tornado',
    'flood',
    'wildfire',
    'volcanic',
    'tsunami',
    'winter_storm',
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().url() })).min(2),
  lastReviewed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sections: z.object({
    antes: z.array(prepBlockSchema).min(1),
    durante: z.array(prepBlockSchema).min(1),
    despues: z.array(prepBlockSchema).min(1),
  }),
  supplyChecklist: z
    .array(z.object({ item: z.string().min(1), qty: z.string().optional(), note: z.string().optional() }))
    .min(1),
  familyPlanPrompts: z
    .array(z.object({ id: z.string().min(1), label: z.string().min(1), placeholder: z.string() }))
    .min(1),
})

export type PrepBlock = z.infer<typeof prepBlockSchema>
export type PreparednessGuide = z.infer<typeof preparednessGuideSchema>

/** v1 shipped archetypes. Tornado/wildfire/tsunami/volcanic are P1 — the
 *  structure supports them; content comes later. */
export const PREPAREDNESS_ARCHETYPES: DisasterArchetype[] = ['earthquake', 'hurricane', 'flood']
