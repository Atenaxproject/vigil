import { describe, expect, it, vi } from 'vitest'
import { withTimeout } from '@/lib/with-timeout'

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
})
