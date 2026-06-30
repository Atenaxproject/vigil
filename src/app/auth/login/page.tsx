import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Iniciar sesión — Vigil',
  description: 'Acceso seguro a Vigil mediante código de verificación.',
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-vigil-muted">
        Verificación por correo o SMS. No se requiere contraseña.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-vigil-muted">Cargando...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
