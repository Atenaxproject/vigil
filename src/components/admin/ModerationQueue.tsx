'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface QueueItem {
  id: string
  table_name: string
  record_id: string
  reason: string
  ai_confidence: number | null
  status: string
  notes: string | null
  created_at: string
}

interface PendingOrg {
  id: string
  name: string
  type: string | null
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  created_at: string
  region_scope: string
}

interface FlaggedWall {
  id: string
  author_name: string
  message: string
  category: string | null
  flag_count: number
  created_at: string
}

interface FlaggedPerson {
  id: string
  full_name: string
  estado: string | null
  flag_count: number
  flagged: boolean
  created_at: string
}

export function ModerationQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [pendingOrgs, setPendingOrgs] = useState<PendingOrg[]>([])
  const [flaggedWall, setFlaggedWall] = useState<FlaggedWall[]>([])
  const [flaggedPersons, setFlaggedPersons] = useState<FlaggedPerson[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moderation')
      if (!res.ok) throw new Error()
      const json = (await res.json()) as {
        queue: QueueItem[]
        pendingOrgs: PendingOrg[]
        flaggedWall: FlaggedWall[]
        flaggedPersons: FlaggedPerson[]
      }
      setQueue(json.queue)
      setPendingOrgs(json.pendingOrgs)
      setFlaggedWall(json.flaggedWall)
      setFlaggedPersons(json.flaggedPersons)
    } catch {
      toast.error('Error al cargar cola de moderación')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function patch(body: Record<string, unknown>) {
    const res = await fetch('/api/admin/moderation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      toast.error('Acción fallida')
      return
    }
    toast.success('Actualizado')
    void load()
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">Cargando cola de moderación…</p>
  }

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-slate-800">Cola de moderación (IA / umbrales)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Duplicados detectados por IA y otros motivos automáticos.
        </p>
        {queue.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No hay ítems pendientes.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {queue.map((item) => (
              <li key={item.id} className="rounded-card border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">
                  {item.reason} · {item.table_name}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">{item.record_id}</p>
                {item.ai_confidence != null && (
                  <p className="mt-1 text-xs text-slate-500">
                    Confianza IA: {Number(item.ai_confidence).toFixed(2)}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString('es')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void patch({ action: 'review_queue', id: item.id, status: 'approved' })
                    }
                    className="min-h-[40px] rounded-input bg-emerald-600 px-3 text-sm text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void patch({ action: 'review_queue', id: item.id, status: 'rejected' })
                    }
                    className="min-h-[40px] rounded-input border border-red-200 bg-red-50 px-3 text-sm text-red-800"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800">Organizaciones pendientes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Aprobación manual antes de aparecer en el directorio público.
        </p>
        {pendingOrgs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Ninguna organización pendiente.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pendingOrgs.map((org) => (
              <li key={org.id} className="rounded-card border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{org.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {org.type} · {org.region_scope}
                  {org.website ? ` · ${org.website}` : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {org.contact_email ?? 'sin email'} · {org.contact_phone ?? 'sin teléfono'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void patch({ action: 'approve_org', id: org.id, approved: true })
                    }
                    className="min-h-[40px] rounded-input bg-emerald-600 px-3 text-sm text-white"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void patch({ action: 'approve_org', id: org.id, approved: false })
                    }
                    className="min-h-[40px] rounded-input border border-slate-200 px-3 text-sm"
                  >
                    Mantener oculto
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800">Muro — mensajes auto-ocultos</h2>
        {flaggedWall.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Sin mensajes ocultos por reportes.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {flaggedWall.map((msg) => (
              <li key={msg.id} className="rounded-card border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{msg.author_name}</p>
                <p className="mt-1 text-sm text-slate-700">{msg.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Reportes: {msg.flag_count} · {new Date(msg.created_at).toLocaleString('es')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void patch({ action: 'unflag_wall', id: msg.id })}
                    className="min-h-[40px] rounded-input bg-emerald-600 px-3 text-sm text-white"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => void patch({ action: 'keep_flagged_wall', id: msg.id })}
                    className="min-h-[40px] rounded-input border border-slate-200 px-3 text-sm"
                  >
                    Mantener oculto
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800">Personas desaparecidas — reportadas</h2>
        <p className="mt-1 text-sm text-slate-600">
          Auto-ocultas tras 3 reportes comunitarios (migración 022).
        </p>
        {flaggedPersons.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Sin reportes de personas con flags.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {flaggedPersons.map((p) => (
              <li key={p.id} className="rounded-card border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{p.full_name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {p.estado} · flags: {p.flag_count}
                  {p.flagged ? ' · oculto' : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void patch({ action: 'unflag_person', id: p.id })}
                    className="min-h-[40px] rounded-input bg-emerald-600 px-3 text-sm text-white"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => void patch({ action: 'keep_flagged_person', id: p.id })}
                    className="min-h-[40px] rounded-input border border-red-200 bg-red-50 px-3 text-sm text-red-800"
                  >
                    Confirmar oculto
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
