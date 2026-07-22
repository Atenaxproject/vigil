import { CRISIS_CONFIG } from '@/config/crisis.config'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export type AiModelTier = 'haiku' | 'sonnet'
export type AiFeature =
  | 'photo_search'
  | 'assistant'
  | 'nl_intake'
  | 'property_triage'
  | 'dedup'
  | 'translate'
  | 'matching'
  | 'other'

export type BreakerState = 'ok' | 'degraded' | 'halted'

export interface AiBreakerSnapshot {
  state: BreakerState
  /** Approximate spend units in the rolling window (not USD). */
  units: number
  haikuCalls: number
  sonnetCalls: number
  degradeThreshold: number
  haltThreshold: number
  windowHours: number
  /** Honest: Anthropic does not expose live spend; this is a request-count proxy. */
  approximationNote: string
}

function parseThreshold(envName: string, fallback: number): number {
  const raw = process.env[envName]
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Thresholds read at request time so Orlando can tune without redeploy. */
export function getAiThresholds(): { degrade: number; halt: number } {
  const { degradeThresholdDefault, haltThresholdDefault } = CRISIS_CONFIG.aiLimits
  const degrade = parseThreshold('AI_DEGRADE_THRESHOLD', degradeThresholdDefault)
  const halt = parseThreshold('AI_HALT_THRESHOLD', haltThresholdDefault)
  return { degrade, halt: Math.max(halt, degrade + 1) }
}

function unitsFromCounts(haiku: number, sonnet: number): number {
  const { haikuUnitCost, sonnetUnitCost } = CRISIS_CONFIG.aiLimits
  return haiku * haikuUnitCost + sonnet * sonnetUnitCost
}

/**
 * Record one AI call for the spend-proxy counter.
 * Failures are swallowed — breaker must never block a user path by throwing.
 */
export async function recordAiUsage(
  modelTier: AiModelTier,
  feature: AiFeature
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const supabase = createAdminClient()
    await supabase.from('ai_usage_log').insert({
      model_tier: modelTier,
      feature,
    })
  } catch {
    /* swallow — approximate counter must not crash features */
  }
}

async function countUsageInWindow(): Promise<{ haiku: number; sonnet: number }> {
  if (!isSupabaseConfigured()) return { haiku: 0, sonnet: 0 }
  try {
    const supabase = createAdminClient()
    const windowMs = CRISIS_CONFIG.aiLimits.usageWindowHours * 60 * 60 * 1000
    const since = new Date(Date.now() - windowMs).toISOString()

    const [haikuRes, sonnetRes] = await Promise.all([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('model_tier', 'haiku')
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('model_tier', 'sonnet')
        .gte('created_at', since),
    ])

    return {
      haiku: haikuRes.count ?? 0,
      sonnet: sonnetRes.count ?? 0,
    }
  } catch {
    return { haiku: 0, sonnet: 0 }
  }
}

export async function getAiBreakerSnapshot(): Promise<AiBreakerSnapshot> {
  const { haiku, sonnet } = await countUsageInWindow()
  const units = unitsFromCounts(haiku, sonnet)
  const { degrade, halt } = getAiThresholds()

  let state: BreakerState = 'ok'
  if (units >= halt) state = 'halted'
  else if (units >= degrade) state = 'degraded'

  return {
    state,
    units,
    haikuCalls: haiku,
    sonnetCalls: sonnet,
    degradeThreshold: degrade,
    haltThreshold: halt,
    windowHours: CRISIS_CONFIG.aiLimits.usageWindowHours,
    approximationNote:
      'Request-count proxy weighted by model tier — not live Anthropic spend. Tune via AI_DEGRADE_THRESHOLD / AI_HALT_THRESHOLD.',
  }
}

export async function getBreakerState(): Promise<BreakerState> {
  const snap = await getAiBreakerSnapshot()
  return snap.state
}

/** Photo search (Sonnet) — blocked in degraded + halted. */
export function isPhotoSearchAllowed(state: BreakerState): boolean {
  return state === 'ok'
}

/** Assistant / NL intake — blocked only when fully halted. */
export function isHaikuFeatureAllowed(state: BreakerState): boolean {
  return state !== 'halted'
}

/** JSON body for honest degrade responses (never invent success). */
export function aiUnavailableResponse(feature: 'photo_search' | 'assistant' | 'nl_intake') {
  return {
    unavailable: true,
    degraded: true,
    feature,
    code: 'ai_circuit_breaker',
  }
}
