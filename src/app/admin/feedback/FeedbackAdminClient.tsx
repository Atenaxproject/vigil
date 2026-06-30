'use client'

import { useCallback, useEffect, useState } from 'react'
import type { FeedbackItem, FeedbackStatus } from '@/types/vigil.types'

export function FeedbackAdminClient() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feedback')
      if (!res.ok) throw new Error('unauthorized')
      const data = await res.json()
      setItems(data.items ?? [])
      setAuthed(true)
    } catch {
      setAuthed(false)
      setError('No autorizado')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    })
    if (!res.ok) {
      setError('Clave incorrecta')
      return
    }
    await loadItems()
  }

  async function updateStatus(id: string, status: FeedbackStatus) {
    const res = await fetch('/api/admin/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    }
  }

  if (!authed) {
    return (
      <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4 p-8">
        <h1 className="font-display text-xl font-semibold text-vigil-ink">Feedback Admin</h1>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="VIGIL_ADMIN_SECRET"
          className="w-full min-h-[44px] rounded-input border border-slate-200 px-3 text-[16px]"
        />
        {error && <p className="text-[16px] text-status-missing">{error}</p>}
        <button type="submit" className="w-full min-h-[44px] rounded-input bg-vigil-blue text-white">
          Entrar
        </button>
      </form>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">Feedback ({items.length})</h1>
      {loading && <p className="mt-4 text-[16px] text-vigil-muted">Cargando...</p>}
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-card border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[13px] text-vigil-muted">
                {item.category} · {new Date(item.created_at).toLocaleString()}
              </span>
              <select
                value={item.status}
                onChange={(e) => void updateStatus(item.id, e.target.value as FeedbackStatus)}
                className="rounded-input border border-slate-200 px-2 py-1 text-[13px]"
              >
                <option value="new">new</option>
                <option value="reviewing">reviewing</option>
                <option value="resolved">resolved</option>
                <option value="wont_fix">wont_fix</option>
              </select>
            </div>
            <p className="mt-2 text-[16px] text-slate-700">{item.message}</p>
            {item.page_context && (
              <p className="mt-1 font-mono text-[13px] text-vigil-muted">Página: {item.page_context}</p>
            )}
            {item.contact_email && (
              <p className="mt-1 text-[13px] text-vigil-muted">Email: {item.contact_email}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
