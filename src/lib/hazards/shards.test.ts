import { describe, expect, it } from 'vitest'
import {
  HAZARD_SHARD_IDS,
  HAZARD_SHARDS,
  isHazardShardId,
  shouldCooldownFeed,
  sourcesForShard,
} from '@/lib/hazards/shards'

describe('hazard shards', () => {
  it('keeps usgs+gdacs in the eq shard for clustering', () => {
    expect(sourcesForShard('eq').sort()).toEqual(['gdacs', 'usgs'].sort())
    expect(HAZARD_SHARD_IDS).toEqual(['eq', 'weather', 'land'])
  })

  it('covers every adapter source exactly once', () => {
    const all = HAZARD_SHARD_IDS.flatMap((id) => [...HAZARD_SHARDS[id]])
    expect(new Set(all).size).toBe(all.length)
    expect(all.sort()).toEqual(
      ['firms', 'gdacs', 'nhc', 'nws', 'open-meteo', 'reliefweb', 'tsunami', 'usgs', 'usgs-water'].sort()
    )
  })

  it('validates shard ids', () => {
    expect(isHazardShardId('eq')).toBe(true)
    expect(isHazardShardId('nope')).toBe(false)
  })
})

describe('shouldCooldownFeed', () => {
  const now = Date.parse('2026-08-02T15:00:00.000Z')

  it('cools down recent timeouts', () => {
    expect(
      shouldCooldownFeed({
        lastError: 'USGS earthquakes timed out after 15000ms',
        lastAttemptAt: '2026-08-02T14:50:00.000Z',
        nowMs: now,
      })
    ).toBe(true)
  })

  it('does not cool down stale or non-timeout errors', () => {
    expect(
      shouldCooldownFeed({
        lastError: 'USGS earthquakes timed out after 15000ms',
        lastAttemptAt: '2026-08-02T14:00:00.000Z',
        nowMs: now,
      })
    ).toBe(false)
    expect(
      shouldCooldownFeed({
        lastError: 'HTTP 503',
        lastAttemptAt: '2026-08-02T14:50:00.000Z',
        nowMs: now,
      })
    ).toBe(false)
  })
})
