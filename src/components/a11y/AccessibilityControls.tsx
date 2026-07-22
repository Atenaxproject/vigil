'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

const TEXT_KEY = 'vigil-a11y-text-scale'
const CONTRAST_KEY = 'vigil-a11y-high-contrast'

type TextScale = '100' | '125' | '150'

type A11yContextValue = {
  textScale: TextScale
  highContrast: boolean
  setTextScale: (s: TextScale) => void
  setHighContrast: (v: boolean) => void
}

const A11yContext = createContext<A11yContextValue | null>(null)

function applyScale(scale: TextScale) {
  const root = document.documentElement
  const pct = scale === '100' ? '100%' : scale === '125' ? '125%' : '150%'
  root.style.fontSize = pct
}

function applyContrast(on: boolean) {
  document.documentElement.classList.toggle('vigil-high-contrast', on)
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textScale, setTextScaleState] = useState<TextScale>('100')
  const [highContrast, setHighContrastState] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem(TEXT_KEY) as TextScale | null
      const c = localStorage.getItem(CONTRAST_KEY) === 'true'
      if (s === '100' || s === '125' || s === '150') {
        setTextScaleState(s)
        applyScale(s)
      }
      setHighContrastState(c)
      applyContrast(c)
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const setTextScale = useCallback((s: TextScale) => {
    setTextScaleState(s)
    applyScale(s)
    try {
      localStorage.setItem(TEXT_KEY, s)
    } catch {
      /* ignore */
    }
  }, [])

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v)
    applyContrast(v)
    try {
      localStorage.setItem(CONTRAST_KEY, String(v))
    } catch {
      /* ignore */
    }
  }, [])

  if (!ready) {
    return <>{children}</>
  }

  return (
    <A11yContext.Provider value={{ textScale, highContrast, setTextScale, setHighContrast }}>
      {children}
    </A11yContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(A11yContext)
  if (!ctx) {
    return {
      textScale: '100' as TextScale,
      highContrast: false,
      setTextScale: () => undefined,
      setHighContrast: () => undefined,
    }
  }
  return ctx
}

/** Compact controls for nav / ajustes (prompt 72 B1). High contrast ≠ dark mode. */
export function AccessibilityControls({ compact = false }: { compact?: boolean }) {
  const { textScale, highContrast, setTextScale, setHighContrast } = useAccessibility()

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-2'
          : 'flex flex-col gap-3 rounded-card border border-slate-200 bg-white p-4'
      }
      role="group"
      aria-label="Accesibilidad"
    >
      <div className="flex items-center gap-1">
        <span className="sr-only">Tamaño de texto</span>
        {(['100', '125', '150'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={textScale === s}
            onClick={() => setTextScale(s)}
            className={`min-h-[44px] min-w-[44px] rounded-input border px-2 text-[16px] font-medium ${
              textScale === s
                ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                : 'border-slate-200 bg-white text-vigil-ink'
            }`}
          >
            {s === '100' ? 'A' : s === '125' ? 'A+' : 'A++'}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={highContrast}
        onClick={() => setHighContrast(!highContrast)}
        className={`min-h-[44px] rounded-input border px-3 text-[16px] font-medium ${
          highContrast
            ? 'border-vigil-ink bg-vigil-ink text-white'
            : 'border-slate-200 bg-white text-vigil-ink'
        }`}
      >
        {highContrast ? 'Alto contraste: sí' : 'Alto contraste'}
      </button>
    </div>
  )
}
