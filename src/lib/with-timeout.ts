/** Default budget for a single upstream hazard/watch feed fetch. */
export const FEED_FETCH_TIMEOUT_MS = 15_000

/** AbortSignal for feed `fetch()` calls — cancels the HTTP request on timeout. */
export function feedAbortSignal(ms = FEED_FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms)
}

/** True for AbortSignal.timeout / fetch abort — must not be soft-swallowed as empty success. */
export function isFeedAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = 'name' in err ? String((err as { name?: unknown }).name) : ''
  const message = 'message' in err ? String((err as { message?: unknown }).message) : ''
  return (
    name === 'AbortError' ||
    name === 'TimeoutError' ||
    /aborted|timed?\s*out/i.test(message)
  )
}

/**
 * Reject if `promise` does not settle within `ms`.
 * Prefer pairing with `feedAbortSignal()` on `fetch()` so the request is aborted,
 * not only the waiter.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${ms}ms`))
        }, ms)
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}
