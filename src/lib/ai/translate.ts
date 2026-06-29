export async function translateMissingPersonReport(
  text: string,
  targetLang: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('your_')) {
    return text
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
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Translate this missing person report to ${targetLang}. Return only the translation, no commentary:\n\n${text}`,
          },
        ],
      }),
    })

    if (!res.ok) return text
    const data = (await res.json()) as { content?: Array<{ text?: string }> }
    return data.content?.[0]?.text ?? text
  } catch {
    return text
  }
}
