// Auto-generates PT, FR, IT, ZH, DE, RU from EN source using Claude Haiku
// Run: node scripts/generate-translations.mjs
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANGUAGES = {
  pt: 'Brazilian Portuguese — for Brazilian rescue teams (USAR Brasil)',
  fr: 'French — for French Civil Protection (Sécurité Civile) teams',
  it: 'Italian — for Italian rescue teams (Protezione Civile)',
  zh: 'Simplified Chinese — for Chinese rescue teams',
  de: 'German — for German rescue teams (THW) and Swiss/Austrian teams',
  ru: 'Russian — for Russian rescue and medical teams',
}

const requested = process.argv.slice(2)
const targets = requested.length > 0 ? requested : Object.keys(LANGUAGES)

const sourceEn = JSON.parse(readFileSync('./src/i18n/locales/en.json', 'utf-8'))

for (const code of targets) {
  const description = LANGUAGES[code]
  if (!description) {
    console.warn(`Skipping unknown locale: ${code}`)
    continue
  }
  console.log(`Translating to ${code}...`)
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 16384,
    messages: [
      {
        role: 'user',
        content: `You are translating a humanitarian crisis response platform from English to ${description}.

CRITICAL RULES:
- This platform is used during a major earthquake disaster response where lives are at stake
- Tone: clear, calm, professional, compassionate. Never casual.
- "found_deceased" and similar status labels carry enormous emotional weight — translate with absolute care
- Keep ALL JSON keys in English (never translate the keys)
- Keep all placeholder variables EXACTLY as-is: {{count}} {{time}} {{hotline}} {{c}}
- Return ONLY valid JSON. No markdown fences. No explanation. No preamble.
- If unsure of a translation, prefer clarity over elegance

Source JSON to translate:
${JSON.stringify(sourceEn, null, 2)}`,
      },
    ],
  })

  try {
    let text = response.content[0].text.trim()
    // Haiku sometimes wraps JSON in markdown fences despite instructions
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    }
    const parsed = JSON.parse(text)
    writeFileSync(`./src/i18n/locales/${code}.json`, JSON.stringify(parsed, null, 2))
    console.log(`✓ ${code}.json written`)
  } catch (e) {
    console.error(`✗ Failed ${code}:`, e.message)
    writeFileSync(`./src/i18n/locales/${code}.json.error`, response.content[0].text)
  }

  await new Promise((r) => setTimeout(r, 2000)) // Courtesy pause between calls
}

console.log('All translations complete.')
