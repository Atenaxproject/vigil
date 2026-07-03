'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface QueueItem {
  id: string
  estado: string | null
  municipio: string | null
  request_type: string
  tag_status: string
  status: string
  ai_priority_flag: boolean
  created_at: string
  danger_indicators: string[]
  description: string | null
  assigned_to: string | null
  contact_name: string | null
}

interface Engineer {
  id: string
  full_name: string
  skills: string[]
}

export function PropertyAssessmentAdmin() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [tagNotes, setTagNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/property-assessments/admin')
      if (!res.ok) throw new Error()
      const json = (await res.json()) as { queue: QueueItem[]; engineers: Engineer[] }
      setQueue(json.queue)
      setEngineers(json.engineers)
    } catch {
      toast.error('Error al cargar cola')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function assign(id: string, assignedTo: string | null) {
    const res = await fetch('/api/property-assessments/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', id, assigned_to: assignedTo }),
    })
    if (!res.ok) {
      toast.error('Error al asignar')
      return
    }
    toast.success('Asignado')
    void load()
  }

  async function submitTag(id: string, tag: 'green' | 'yellow' | 'red') {
    const note = tagNotes[id]?.trim()
    if (!note || note.length < 5) {
      toast.error('Se requiere una nota de observación (mín. 5 caracteres)')
      return
    }
    const res = await fetch('/api/property-assessments/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tag', id, tag_status: tag, tag_note: note }),
    })
    if (!res.ok) {
      toast.error('Error al etiquetar')
      return
    }
    toast.success('Etiqueta asignada')
    void load()
  }

  if (loading) {
    return <p className="mt-6 text-sm text-slate-600">Cargando cola de evaluaciones…</p>
  }

  if (queue.length === 0) {
    return <p className="mt-6 text-sm text-slate-600">No hay solicitudes pendientes.</p>
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-800">Evaluaciones estructurales</h2>
      <p className="mt-1 text-sm text-slate-600">
        Ordenadas por prioridad de triaje (IA) y fecha. Solo admin asigna etiquetas verde/amarillo/rojo.
      </p>
      <ul className="mt-4 space-y-4">
        {queue.map((item) => (
          <li key={item.id} className="rounded-card border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">
                  {item.estado}
                  {item.municipio ? `, ${item.municipio}` : ''}
                  {item.ai_priority_flag && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                      Prioridad triaje
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.request_type} · {item.contact_name} · {new Date(item.created_at).toLocaleString('es')}
                </p>
              </div>
              <select
                className="rounded border border-slate-200 px-2 py-1 text-sm"
                value={item.assigned_to ?? ''}
                onChange={(e) => assign(item.id, e.target.value || null)}
                aria-label="Asignar voluntario"
              >
                <option value="">Sin asignar</option>
                {engineers.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.full_name}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="mt-3 w-full rounded border border-slate-200 p-2 text-sm"
              rows={2}
              placeholder="Nota de observación (requerida para etiquetar)…"
              value={tagNotes[item.id] ?? ''}
              onChange={(e) => setTagNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {(['green', 'yellow', 'red'] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => submitTag(item.id, tag)}
                  className="rounded px-3 py-1 text-sm font-medium text-white"
                  style={{
                    backgroundColor:
                      tag === 'green' ? '#16A34A' : tag === 'yellow' ? '#D97706' : '#DC2626',
                  }}
                >
                  {tag === 'green' ? 'Verde' : tag === 'yellow' ? 'Amarillo' : 'Rojo'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
