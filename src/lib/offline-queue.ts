const QUEUE_KEY = 'vigil-offline-queue'

export type OfflineSubmissionType = 'missing-person' | 'map-marker'

export interface QueuedSubmission {
  type: OfflineSubmissionType
  payload: unknown
  queuedAt: number
}

export function queueSubmission(type: OfflineSubmissionType, payload: unknown) {
  if (typeof window === 'undefined') return
  const queue: QueuedSubmission[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  queue.push({ type, payload, queuedAt: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function getQueueLength(): number {
  if (typeof window === 'undefined') return 0
  const queue: QueuedSubmission[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  return queue.length
}

const ENDPOINTS: Record<OfflineSubmissionType, string> = {
  'missing-person': '/api/missing-persons/submit',
  'map-marker': '/api/map-markers/submit',
}

async function submitQueuedItem(type: OfflineSubmissionType, payload: unknown) {
  const url = ENDPOINTS[type]
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to submit ${type}`)
}

export async function flushQueue() {
  if (typeof window === 'undefined') return 0
  const queue: QueuedSubmission[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  if (queue.length === 0) return 0

  const remaining: QueuedSubmission[] = []
  let flushed = 0

  for (const item of queue) {
    try {
      await submitQueuedItem(item.type, item.payload)
      flushed++
    } catch {
      remaining.push(item)
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining))
  return flushed
}
