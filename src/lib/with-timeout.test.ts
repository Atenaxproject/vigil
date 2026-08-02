import { describe, expect, it, vi } from 'vitest'
import { isFeedAbortError, withTimeout } from '@/lib/with-timeout'

describe('withTimeout', () => {
  it('resolves when the promise wins the race', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 1000, 'fast')).resolves.toBe('ok')
  })

  it('rejects when the timer wins', async () => {
    vi.useFakeTimers()
    try {
      const pending = withTimeout(new Promise(() => undefined), 50, 'slow-feed')
      const assertion = expect(pending).rejects.toThrow('slow-feed timed out after 50ms')
      await vi.advanceTimersByTimeAsync(50)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('detects abort/timeout errors for cooldown wiring', () => {
    expect(isFeedAbortError(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }))).toBe(
      true
    )
    expect(isFeedAbortError(new Error('HTTP 503'))).toBe(false)
  })
})
