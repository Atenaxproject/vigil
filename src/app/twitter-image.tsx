import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Vigil — Plataforma humanitaria para Venezuela'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#2563EB',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Respuesta Humanitaria · Venezuela 2026
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 140,
            fontWeight: 700,
            color: '#F8FAFC',
            letterSpacing: -4,
            marginBottom: 28,
          }}
        >
          <span>Vigil</span>
          <span style={{ color: '#2563EB' }}>.</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: '#CBD5E1',
            fontWeight: 400,
            marginBottom: 36,
          }}
        >
          Estamos en vigilia cuando más importa
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#94A3B8',
            fontWeight: 400,
            marginBottom: 56,
          }}
        >
          Personas desaparecidas · Mapa en tiempo real · Recursos verificados
        </div>

        <div style={{ display: 'flex', width: 180, height: 8, marginBottom: 32 }}>
          <div style={{ flex: 1, backgroundColor: '#FCD116' }} />
          <div style={{ flex: 1, backgroundColor: '#0033A0' }} />
          <div style={{ flex: 1, backgroundColor: '#CF142B' }} />
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 26,
            color: '#64748B',
            fontWeight: 500,
          }}
        >
          vigil.youthewave.org
        </div>
      </div>
    ),
    { ...size }
  )
}
