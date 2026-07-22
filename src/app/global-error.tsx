'use client'

import { useEffect } from 'react'

/**
 * Last-resort boundary that replaces the root layout when an error is thrown
 * in the layout itself. It renders its own <html>/<body> and must NOT depend
 * on providers (next-intl, fonts) since those may be the source of the error.
 * Copy is bilingual (ES primary / EN) because the locale provider is gone here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#0F172A',
          padding: '1rem',
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            Algo salió mal
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>
            Ocurrió un error inesperado. Intenta de nuevo.
            <br />
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              minHeight: 44,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reintentar / Retry
          </button>
          <p style={{ fontSize: 13, marginTop: 24 }}>
            <a href="tel:911" style={{ color: '#DC2626', fontWeight: 600 }}>
              Emergencias: 911
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
