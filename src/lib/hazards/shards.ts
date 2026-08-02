import type { HazardSource } from '@/lib/hazards/types'

/**
 * Hazard poll shards — each GitHub/Vercel cron invocation runs one shard so a
 * hung upstream cannot burn the full serverless budget for every feed.
 *
 * `eq` keeps USGS + GDACS together so cross-source earthquake clustering still
 * runs inside a single poll (see `clusterHazardEvents`).
 */
export const HAZARD_SHARDS = {
  eq: ['usgs', 'gdacs'] as const satisfies readonly HazardSource[],
  weather: ['nhc', 'nws', 'tsunami', 'usgs-water', 'open-meteo'] as const satisfies readonly HazardSource[],
  land: ['firms', 'reliefweb'] as const satisfies readonly HazardSource[],
} as const

export type HazardShardId = keyof typeof HAZARD_SHARDS

export const HAZARD_SHARD_IDS = Object.keys(HAZARD_SHARDS) as HazardShardId[]

/** Skip a feed this long after a timeout before trying it again. */
export const FEED_TIMEOUT_COOLDOWN_MS = 20 * 60 * 1000

export function isHazardShardId(value: string | null | undefined): value is HazardShardId {
  return !!value && Object.prototype.hasOwnProperty.call(HAZARD_SHARDS, value)
}

export function sourcesForShard(shard: HazardShardId): HazardSource[] {
  return [...HAZARD_SHARDS[shard]]
}

/** Pure: whether feed_health says this feed should cool down after a timeout. */
export function shouldCooldownFeed(input: {
  lastError: string | null | undefined
  lastAttemptAt: string | null | undefined
  nowMs?: number
  cooldownMs?: number
}): boolean {
  const err = (input.lastError ?? '').toLowerCase()
  if (!err.includes('timed out') && !err.includes('timeout') && !err.includes('aborted')) {
    return false
  }
  if (!input.lastAttemptAt) return false
  const attempted = Date.parse(input.lastAttemptAt)
  if (!Number.isFinite(attempted)) return false
  const now = input.nowMs ?? Date.now()
  const window = input.cooldownMs ?? FEED_TIMEOUT_COOLDOWN_MS
  return now - attempted < window
}
