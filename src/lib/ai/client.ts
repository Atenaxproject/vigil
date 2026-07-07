import Anthropic from '@anthropic-ai/sdk'

export const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
export const SONNET_MODEL = 'claude-sonnet-4-6'

export function isAnthropicConfigured(): boolean {
  const key = process.env.ANTHROPIC_API_KEY
  return Boolean(key && !key.startsWith('your_'))
}

export function createAnthropicClient(): Anthropic | null {
  if (!isAnthropicConfigured()) return null
  // ANTHROPIC_BASE_URL enables routing through Vercel AI Gateway (per-workload
  // spend observability, budget alerts, no token markup) without code changes.
  // Unset = direct Anthropic API. Key stays server-side either way.
  const baseURL = process.env.ANTHROPIC_BASE_URL
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    ...(baseURL ? { baseURL } : {}),
  })
}

export function extractTextContent(
  content: Anthropic.Messages.Message['content']
): string {
  const block = content[0]
  return block?.type === 'text' ? block.text : ''
}

export function parseJsonFromText<T>(text: string, fallback: T): T {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/)
    if (!jsonMatch) return fallback
    return JSON.parse(jsonMatch[0]) as T
  } catch {
    return fallback
  }
}
