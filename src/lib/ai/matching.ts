import type { PublicMissingPerson } from '@/types/vigil.types'

export interface MatchSuggestion {
  recordId: string
  full_name: string
  score: number
  reason: string
}

export async function suggestMatches(
  updatedRecord: PublicMissingPerson,
  candidates: PublicMissingPerson[]
): Promise<MatchSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('your_') || candidates.length === 0) {
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
            content: `A missing person status changed. Suggest possible matches. Return JSON array of {recordId, full_name, score, reason}:\nUpdated: ${JSON.stringify(updatedRecord)}\nCandidates: ${JSON.stringify(candidates.slice(0, 30))}`,
          },
        ],
      }),
    })

    if (!res.ok) return []
    const data = (await res.json()) as { content?: Array<{ text?: string }> }
    const text = data.content?.[0]?.text ?? '[]'
    return JSON.parse(text) as MatchSuggestion[]
  } catch {
    return []
  }
}
