import {
  createAnthropicClient,
  extractTextContent,
  HAIKU_MODEL,
  isAnthropicConfigured,
} from '@/lib/ai/client'

/** Internal queue flag only — never assign green/yellow/red. */
export async function flagPropertyPhotoPriority(
  base64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<boolean> {
  if (!isAnthropicConfigured()) return false

  const anthropic = createAnthropicClient()
  if (!anthropic) return false

  try {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 80,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: `You are triaging disaster property photos for a humanitarian queue.
Reply with ONLY "priority" if the image shows clearly visible severe structural damage
(major cracks, leaning, partial collapse, foundation failure). Otherwise reply ONLY "normal".
Do NOT use green, yellow, or red. Do NOT assess safety for occupants.`,
            },
          ],
        },
      ],
    })

    const text = extractTextContent(response.content).toLowerCase()
    return text.includes('priority')
  } catch {
    return false
  }
}

export async function structurePropertyDescription(description: string): Promise<string> {
  if (!isAnthropicConfigured() || description.trim().length < 20) {
    return description.trim()
  }

  const anthropic = createAnthropicClient()
  if (!anthropic) return description.trim()

  try {
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Structure this property damage report in Spanish for a humanitarian database.
Keep all facts; do not invent details. Output plain text, 2-4 short sentences.

Report:
${description}`,
        },
      ],
    })
    const structured = extractTextContent(response.content).trim()
    return structured || description.trim()
  } catch {
    return description.trim()
  }
}
