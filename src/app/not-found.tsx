import Link from 'next/link'

export const metadata = {
  title: 'Página no encontrada — Vigil',
}

/**
 * Branded 404 — recovery CTAs for crisis deep links (Buscar + Emergencia / need-help).
 * Spanish-first copy (site default); kept outside i18n to avoid 8-locale churn on a shell page.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-[13px] font-medium uppercase tracking-wide text-vigil-muted">Vigil</p>
      <h1 className="mt-2 font-display text-[26px] font-semibold text-vigil-ink">
        Página no encontrada
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
        Ese enlace no existe o ya no está disponible. Puedes buscar a alguien o ver opciones de
        ayuda de emergencia.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/buscar"
          className="inline-flex min-h-[44px] items-center justify-center rounded-input bg-vigil-blue px-6 py-2.5 text-[16px] font-medium text-white"
        >
          Buscar
        </Link>
        <Link
          href="/necesito-ayuda"
          className="inline-flex min-h-[44px] items-center justify-center rounded-input border border-vigil-border bg-white px-6 py-2.5 text-[16px] font-medium text-vigil-ink"
        >
          Emergencia
        </Link>
      </div>
      <Link href="/" className="mt-6 text-[15px] text-vigil-blue underline-offset-2 hover:underline">
        Volver al inicio
      </Link>
    </main>
  )
}
