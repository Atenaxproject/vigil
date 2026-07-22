import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import {
  createAnthropicClient,
  HAIKU_MODEL,
  isAnthropicConfigured,
} from '@/lib/ai/client'
import {
  aiUnavailableResponse,
  getBreakerState,
  isHaikuFeatureAllowed,
  recordAiUsage,
} from '@/lib/ai/circuit-breaker'
import { getVenezuelaSeismicEvents } from '@/lib/usgs'
import { getGuideIndex } from '@/content/preparedness'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  language: z.string().optional(),
})

export async function POST(request: NextRequest) {
  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!isAnthropicConfigured()) {
    return new Response(
      JSON.stringify({
        ...aiUnavailableResponse('assistant'),
        reply: null,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const breaker = await getBreakerState()
  if (!isHaikuFeatureAllowed(breaker)) {
    return new Response(
      JSON.stringify({
        ...aiUnavailableResponse('assistant'),
        reply: null,
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const anthropic = createAnthropicClient()
  if (!anthropic) {
    return new Response(
      JSON.stringify({ ...aiUnavailableResponse('assistant'), reply: null }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = await createClient()
  const [markersRes, orgsRes, eventsRes, seismicEvents] = await Promise.all([
    supabase
      .from('map_markers')
      .select('type, category, title, description, estado, status, urgent')
      .eq('status', 'active')
      .limit(50),
    supabase
      .from('organizations')
      .select('name, type, country, description_es, description_en, phone, website, donation_link, location_label')
      .eq('approved_by_admin', true)
      .eq('active', true)
      .limit(30),
    supabase
      .from('events')
      .select('title, category, starts_at, location_label, description')
      .gte('starts_at', new Date().toISOString())
      .limit(10),
    getVenezuelaSeismicEvents().catch(() => []),
  ])

  const recentQuakes = seismicEvents
    .filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.minMagnitudeDisplay)
    .slice(0, 10)
    .map((e) => ({
      magnitude: e.magnitude,
      place: e.place,
      time: e.time,
    }))

  const lang = parsed.language ?? CRISIS_CONFIG.defaultLang

  // System prompt split into a stable prefix (cacheable via prompt caching —
  // must stay byte-identical between calls) and the live-data suffix. Keep all
  // dynamic values (quakes, markers, language) OUT of the first block.
  const stableSystemBlock = `Eres el asistente de Vigil, una plataforma humanitaria para la respuesta al terremoto en Venezuela 2026.

REGLAS ABSOLUTAS:
- Solo responde con información que existe en el contexto provisto abajo
- Si no tienes la información, di exactamente: "No tengo esa información en este momento. Intenta en [recurso relevante]."
- NUNCA inventes datos, números, nombres o ubicaciones
- Responde siempre en el mismo idioma del usuario (el código de idioma llega en el contexto)
- Sé directo y conciso — las personas están bajo estrés
- Para emergencias inmediatas, siempre menciona primero: ${CRISIS_CONFIG.emergency.hotlineLabel} (${CRISIS_CONFIG.emergency.hotline})
- NUNCA compartas teléfonos o datos de contacto de reportantes de personas desaparecidas

FUNCIONES QUE VIGIL TIENE:
- Buscar/reportar personas desaparecidas → /buscar y /reportar
- Mapa de crisis con réplicas USGS, refugios, hospitales → página principal
- Registrar necesidades o recursos → /necesito-ayuda
- Intercambio de recursos → /intercambio
- Registro de voluntarios → /voluntarios
- Registro como equipo activo/rescatista → /equipo-activo
- Calendario de eventos → /calendario
- Puntos de acopio → /punto-de-acopio
- Conectividad (WiFi/Starlink) → /conectividad
- Actualizaciones oficiales → /noticias
- Estadísticas por estado → /estadisticas
- Guías de preparación → /preparacion

GUÍAS DE PREPARACIÓN DISPONIBLES (para preguntas de preparación, responde SOLO
con el resumen de la guía correspondiente y enlaza a su ruta — nunca inventes
ni parafrasees pasos de seguridad más allá de estos resúmenes):
${getGuideIndex('es')
  .map((g) => `- ${g.title} → /preparacion/${g.archetype}: ${g.summary}`)
  .join('\n')}`

  const liveDataBlock = `Idioma del usuario: ${lang}

DATOS EN TIEMPO REAL DE VIGIL:

Réplicas sísmicas recientes USGS (${recentQuakes.length}):
${JSON.stringify(recentQuakes)}

Marcadores activos en el mapa (${markersRes.data?.length ?? 0} total):
${JSON.stringify(markersRes.data?.slice(0, 20) ?? [])}

Organizaciones verificadas (${orgsRes.data?.length ?? 0} total):
${JSON.stringify(orgsRes.data?.slice(0, 15) ?? [])}

Próximos eventos (${eventsRes.data?.length ?? 0}):
${JSON.stringify(eventsRes.data ?? [])}`

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: HAIKU_MODEL,
          max_tokens: 400,
          system: [
            {
              type: 'text',
              text: stableSystemBlock,
              cache_control: { type: 'ephemeral' },
            },
            { type: 'text', text: liveDataBlock },
          ],
          stream: true,
          messages: [{ role: 'user', content: parsed.message }],
        })
        await recordAiUsage('haiku', 'assistant')

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch {
        const fallback = `En este momento no puedo responder. Llama al ${CRISIS_CONFIG.emergency.hotlineLabel} (${CRISIS_CONFIG.emergency.hotline}).`
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text: fallback })}\n\n`)
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/** Non-streaming fallback for simple clients */
export async function GET() {
  return new Response(JSON.stringify({ status: 'ok', streaming: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
