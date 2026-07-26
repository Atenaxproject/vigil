/**
 * Durable rate limiting with optional Upstash Redis REST.
 *
 * When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, counters
 * survive serverless isolates. Otherwise falls back to an in-memory Map
 * (same behavior as the previous middleware-only store).
 *
 * Safe for Edge middleware — uses fetch only, no Node APIs.
 */

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  backend: 'upstash' | 'memory'
}

type MemoryEntry = { count: number; resetAt: number }

const memoryStore = new Map<string, MemoryEntry>()

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function upstashCommand(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('upstash_not_configured')

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!res.ok) {
    throw new Error(`upstash_http_${res.status}`)
  }

  const json = (await res.json()) as { result?: unknown; error?: string }
  if (json.error) throw new Error(json.error)
  return json.result
}

function memoryCheck(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    memoryStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt, backend: 'memory' }
  }

  entry.count += 1
  const allowed = entry.count <= max
  return {
    allowed,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
    backend: 'memory',
  }
}

/**
 * Increment a rolling fixed-window counter for `key`.
 * Falls back to memory if Upstash is unset or the REST call fails.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!upstashConfigured()) {
    return memoryCheck(key, max, windowMs)
  }

  const redisKey = `vigil:rl:${key}`
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))

  try {
    const count = Number(await upstashCommand(['INCR', redisKey]))
    if (count === 1) {
      await upstashCommand(['EXPIRE', redisKey, windowSec])
    }
    const ttl = Number(await upstashCommand(['TTL', redisKey]))
    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs)
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt,
      backend: 'upstash',
    }
  } catch {
    // Fail open to memory so a Redis outage does not block crisis submissions.
    return memoryCheck(key, max, windowMs)
  }
}

export function isDurableRateLimitConfigured(): boolean {
  return upstashConfigured()
}
