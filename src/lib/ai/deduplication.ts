import type { PublicMissingPerson } from '@/types/vigil.types'

export interface DuplicateCandidate {
  id: string
  full_name: string
  confidence: number
  reason: string
}

export async function findDuplicateCandidates(
  records: PublicMissingPerson[]
): Promise<DuplicateCandidate[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('your_') || records.length < 2) {
    return []
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Review these missing person records for probable duplicates. Return JSON array of {id, full_name, confidence, reason} only for pairs with confidence >= 0.7:\n${JSON.stringify(records.slice(0, 50))}`,
          },
        ],
      }),
    })

    if (!res.ok) return []
    const data = (await res.json()) as { content?: Array<{ text?: string }> }
    const text = data.content?.[0]?.text ?? '[]'
    return JSON.parse(text) as DuplicateCandidate[]
  } catch {
    return []
  }
}
