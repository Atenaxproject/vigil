import { afterEach, describe, expect, it } from 'vitest'
import { isTransactionalEmailConfigured } from '@/lib/email/notify'

describe('isTransactionalEmailConfigured', () => {
  const prev = process.env.RESEND_API_KEY

  afterEach(() => {
    if (prev === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = prev
  })

  it('is false when RESEND_API_KEY unset', () => {
    delete process.env.RESEND_API_KEY
    expect(isTransactionalEmailConfigured()).toBe(false)
  })

  it('is true when RESEND_API_KEY set', () => {
    process.env.RESEND_API_KEY = 're_test'
    expect(isTransactionalEmailConfigured()).toBe(true)
  })
})
