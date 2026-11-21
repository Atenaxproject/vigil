import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

async function runProbe(secret: string | undefined, status = 200, reject = false) {
  const fetch = reject
    ? vi.fn().mockRejectedValue(new Error('offline'))
    : vi.fn().mockResolvedValue({ status })
  const exit = vi.fn((code: number) => { throw new Error(`exit ${code}`) })
  const result = runInNewContext(`(async () => {${read('scripts/synthetic-uptime.mjs').replace(/^#!.*\n/, '')}})()`, {
    fetch,
    process: { env: { BASE_URL: 'https://demo.invalid/', CRON_SECRET: secret }, exit },
    console: { log: vi.fn(), error: vi.fn() },
  })
  return { result, fetch, exit }
}

describe('maintained demo uptime', () => {
  it.each([undefined, 'unused-test-secret'])('only reads public pages with secret=%s', async (secret) => {
    const { result, fetch, exit } = await runProbe(secret)
    await result
    expect(fetch.mock.calls).toEqual(
      ['/', '/buscar', '/reportar', '/informacion'].map((path) => [
        `https://demo.invalid${path}`, { method: 'GET', redirect: 'follow' },
      ])
    )
    expect(exit).not.toHaveBeenCalled()
  })

  it.each([[503, false], [200, true]])('fails on HTTP/network failures (%s, %s)', async (status, reject) => {
    const { result, fetch, exit } = await runProbe('unused-test-secret', status, reject)
    await expect(result).rejects.toThrow('exit 1')
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(exit).toHaveBeenCalledWith(1)
  })
})

describe('maintained demo schedules', () => {
  it('retains only existing Vercel data maintenance schedules', () => {
    expect(JSON.parse(read('vercel.json')).crons).toEqual([
      { path: '/api/cron/coverage-decay', schedule: '0 7 * * *' },
      { path: '/api/cron/retention', schedule: '0 2 * * *' },
    ])
  })

  it('retains manual watch dispatch without automatic triggers and uptime without secrets', () => {
    const watch = read('.github/workflows/vigil-watch.yml')
    expect(watch).toMatch(/on:\s*workflow_dispatch: \{\}/)
    expect(watch).not.toMatch(/^\s+schedule:/m)
    expect(read('.github/workflows/synthetic-uptime.yml')).not.toContain('CRON_SECRET')
  })
})
