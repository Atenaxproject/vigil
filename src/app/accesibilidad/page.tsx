import Link from 'next/link'

export const metadata = {
  title: 'Accesibilidad — Vigil',
  description: 'Declaración de conformidad WCAG 2.1 AA de la plataforma Vigil.',
}

export default function AccesibilidadPage() {
  return (
    <main className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">Accesibilidad</h1>
      <p className="text-[13px] text-vigil-muted">
        Última auditoría: 2026-07-22 · Estándar: WCAG 2.1 Nivel AA
      </p>

      <section className="mt-8 space-y-3 text-[16px] text-vigil-body">
        <h2 className="text-[20px] font-semibold text-vigil-ink">Compromiso</h2>
        <p>
          Vigil apunta a conformidad WCAG 2.1 AA. Controles de tamaño de texto y alto contraste
          (variante clara, no modo oscuro) están en la navegación. No usamos widgets overlay de
          accesibilidad.
        </p>
      </section>

      <section className="mt-8 space-y-3 text-[16px] text-vigil-body">
        <h2 className="text-[20px] font-semibold text-vigil-ink">Limitaciones conocidas</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            El mapa Leaflet requiere alternativa de texto; la interacción completa con teclado en
            capas del mapa sigue en mejora continua.
          </li>
          <li>Algunos feeds de terceros (USGS, DTV) no controlan su propia accesibilidad.</li>
          <li>
            Pruebas con lector de pantalla documentadas en{' '}
            <code className="text-[13px]">docs/accessibility/</code>.
          </li>
        </ul>
      </section>

      <section className="mt-8 space-y-3 text-[16px] text-vigil-body">
        <h2 className="text-[20px] font-semibold text-vigil-ink">Reportar barreras</h2>
        <p>
          Escribe a{' '}
          <a href="mailto:vigil@atenaxproject.com" className="text-vigil-blue hover:underline">
            vigil@atenaxproject.com
          </a>{' '}
          con la página, el dispositivo y la barrera encontrada.
        </p>
        <p>
          Resumen tipo VPAT:{' '}
          <code className="text-[13px]">docs/accessibility/VPAT-SUMMARY.md</code>
        </p>
        <p>
          <Link href="/ayuda" className="text-vigil-blue hover:underline">
            Centro de ayuda
          </Link>
        </p>
      </section>
    </main>
  )
}
