/** Default budget for a single upstream hazard/watch feed fetch. */
export const FEED_FETCH_TIMEOUT_MS = 15_000

/** AbortSignal for feed `fetch()` calls — cancels the HTTP request on timeout. */
export function feedAbortSignal(ms = FEED_FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms)
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
