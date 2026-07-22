import { listFeedHealth } from '@/lib/feed-health-server'
import { getFeedFreshness } from '@/lib/feed-health'
import { FUNVISIS_PROXY } from '@/lib/funvisis-status'

async function probeFunvisis(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch(FUNVISIS_PROXY, {
      method: 'GET',
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    })
    return { ok: res.ok, detail: `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : 'unreachable' }
  }
}

function freshnessBadge(freshness: string): string {
  switch (freshness) {
    case 'fresh':
      return 'bg-status-alive-bg text-status-alive'
    case 'stale':
      return 'bg-status-unverified-bg text-status-unverified'
    case 'unavailable':
    case 'never':
      return 'bg-status-missing-bg text-status-missing'
    default:
      return 'bg-vigil-cloud text-vigil-muted'
  }
}

export async function FeedHealthPanel() {
  const [rows, funvisis] = await Promise.all([listFeedHealth(), probeFunvisis()])

  const displayRows = [
    ...rows,
    {
      feed_id: 'funvisis',
      label: 'FUNVISIS proxy (sismosve.rafnixg.dev)',
      last_success_at: funvisis.ok ? new Date().toISOString() : null,
      last_attempt_at: new Date().toISOString(),
      last_error: funvisis.ok ? null : funvisis.detail,
      item_count: null,
    },
  ]

  return (
    <section className="mt-10">
      <h2 className="text-[20px] font-semibold text-vigil-ink">Salud de feeds en vivo</h2>
      <p className="mt-1 text-[13px] text-vigil-muted">
        Última lectura exitosa por fuente. También visible en Supabase Studio →{' '}
        <code className="font-mono">feed_health</code>.
      </p>
      {displayRows.length === 0 ? (
        <p className="mt-4 text-[16px] text-vigil-muted">
          Aún no hay registros. Se crean al primer fetch exitoso de cada feed.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[color:var(--vigil-border)] rounded-card border border-[color:var(--vigil-border)]">
          {displayRows.map((row) => {
            const freshness = row.last_error && !row.last_success_at
              ? 'unavailable'
              : getFeedFreshness(row.last_success_at)
            return (
              <li key={row.feed_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-vigil-ink">{row.label}</p>
                  <p className="font-mono text-[13px] text-vigil-muted">
                    {row.feed_id}
                    {row.item_count != null ? ` · ${row.item_count} ítems` : ''}
                  </p>
                  {row.last_error && (
                    <p className="mt-0.5 text-[13px] text-status-missing">{row.last_error}</p>
                  )}
                </div>
                <span
                  className={`rounded-badge px-2 py-0.5 text-[11px] font-medium uppercase ${freshnessBadge(freshness)}`}
                >
                  {freshness}
                </span>
                <time
                  className="w-full font-mono text-[13px] text-vigil-muted sm:w-auto"
                  dateTime={row.last_success_at ?? undefined}
                >
                  {row.last_success_at
                    ? new Date(row.last_success_at).toLocaleString('es-VE', {
                        timeZone: 'America/Caracas',
                      })
                    : 'nunca'}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
