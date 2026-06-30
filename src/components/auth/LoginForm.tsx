'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSupabaseConfigError } from '@/lib/supabase/env'

type AuthMethod = 'email' | 'phone'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const reason = searchParams.get('reason')

  const [method, setMethod] = useState<AuthMethod>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const configError = getSupabaseConfigError()

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (configError) {
      setError(configError)
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()

    const { error: authError } =
      method === 'email'
        ? await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
          })
        : await supabase.auth.signInWithOtp({ phone: phone.trim() })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (method === 'email') {
      setMessage(
        'Revise su correo electrónico. Haga clic en el enlace o ingrese el código de verificación.'
      )
    } else {
      setMessage('Se envió un código SMS. Ingréselo a continuación.')
    }
    setStep('verify')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (configError) {
      setError(configError)
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: authError } =
      method === 'email'
        ? await supabase.auth.verifyOtp({
            email: email.trim(),
            token: otp.trim(),
            type: 'email',
          })
        : await supabase.auth.verifyOtp({
            phone: phone.trim(),
            token: otp.trim(),
            type: 'sms',
          })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {reason === 'auth_required' && (
        <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Debe iniciar sesión para acceder a esta sección.
        </p>
      )}
      {reason === 'admin_required' && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Esta sección es solo para administradores de Vigil.
        </p>
      )}
      {configError && (
        <p className="mb-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {configError}
        </p>
      )}

      <div className="mb-6 flex rounded border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setMethod('email')
            setStep('input')
            setError(null)
            setMessage(null)
          }}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            method === 'email'
              ? 'bg-vigil-blue text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Correo electrónico
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod('phone')
            setStep('input')
            setError(null)
            setMessage(null)
          }}
          className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
            method === 'phone'
              ? 'bg-vigil-blue text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Teléfono SMS
        </button>
      </div>

      {step === 'input' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          {method === 'email' ? (
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="su@correo.com"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-vigil-blue focus:outline-none focus:ring-1 focus:ring-vigil-blue"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                Número de teléfono
              </label>
              <input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+58 412 1234567"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-vigil-blue focus:outline-none focus:ring-1 focus:ring-vigil-blue"
              />
              <p className="mt-1 text-[13px] text-vigil-muted">Incluya código de país (ej. +58)</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || Boolean(configError)}
            className="w-full rounded bg-vigil-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar código de verificación'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          {message && (
            <p className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {message}
            </p>
          )}

          <div>
            <label htmlFor="otp" className="mb-1 block text-sm font-medium text-slate-700">
              Código de verificación
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-vigil-blue focus:outline-none focus:ring-1 focus:ring-vigil-blue"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-vigil-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar e iniciar sesión'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('input')
              setOtp('')
              setError(null)
              setMessage(null)
            }}
            className="w-full text-sm text-vigil-muted hover:text-slate-700"
          >
            Volver
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-vigil-muted">
        Sin contraseñas — solo verificación por código. Sus datos están protegidos.
      </p>
    </div>
  )
}
