import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Términos de Uso — Vigil',
  description: 'Términos y condiciones de uso de la plataforma Vigil de respuesta a crisis.',
}

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos de Uso</h1>
      <p className="text-sm text-slate-500 mb-8">
        Versión {CRISIS_CONFIG.legal.tosVersion} — Vigente desde {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="prose prose-slate max-w-none space-y-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-slate-700 font-medium">
            Al usar Vigil, aceptas estos términos. Si no estás de acuerdo, por favor no uses la
            plataforma. Al enviar información, confirmas que tienes derecho a compartirla y que es
            verídica al mejor de tu conocimiento.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">1. Propósito de Vigil</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil es una plataforma tecnológica humanitaria de código abierto. Facilita la comunicación
            y coordinación durante desastres naturales y crisis humanitarias.
          </p>
          <p className="text-slate-700 mt-3 font-medium text-red-700">
            Vigil NO es un servicio de emergencias. NO es un sustituto de llamar al número de
            emergencias local. En una emergencia inmediata llama al{' '}
            <strong>
              {CRISIS_CONFIG.emergency.hotline} ({CRISIS_CONFIG.emergency.hotlineLabel})
            </strong>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">2. Uso Aceptable</h2>
          <p className="text-slate-700 mb-3">Puedes usar Vigil para:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Reportar personas desaparecidas a raíz de una crisis humanitaria</li>
            <li>Buscar personas desaparecidas</li>
            <li>Publicar necesidades o recursos disponibles en el mapa</li>
            <li>Registrarte como voluntario</li>
            <li>Acceder a información humanitaria oficial y actualizaciones verificadas</li>
          </ul>

          <p className="text-slate-700 mt-4 mb-3">
            Está <strong>estrictamente prohibido</strong>:
          </p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2">
            <li>Publicar información falsa, engañosa o fabricada sobre personas desaparecidas</li>
            <li>Usar la plataforma para actividades comerciales no autorizadas</li>
            <li>
              Scrapear, descargar masivamente o automatizar el acceso a datos de la plataforma sin
              autorización
            </li>
            <li>Intentar identificar o contactar a personas de manera que las ponga en riesgo</li>
            <li>
              Usar los datos de la plataforma para tráfico de personas, extorsión u otras actividades
              ilegales
            </li>
            <li>Publicar contenido de odio, discriminatorio o sexualmente explícito</li>
            <li>Hacerse pasar por organizaciones humanitarias sin verificación</li>
            <li>Intentar acceder a datos privados de otros usuarios</li>
            <li>Sobrecargar intencionalmente la plataforma (ataques DDoS)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">3. Exactitud de la Información</h2>
          <p className="text-slate-700 leading-relaxed">
            Al enviar cualquier información a Vigil, confirmas que es verídica al mejor de tu
            conocimiento. Entiendes que información incorrecta sobre personas desaparecidas puede causar
            daño real — angustia innecesaria, desviación de recursos de rescate, o poner a personas en
            riesgo.
          </p>
          <p className="text-slate-700 mt-3 leading-relaxed">
            Vigil modera los contenidos pero no puede verificar toda la información enviada. Los
            registros se muestran con su estado de verificación visible. Los usuarios deben ejercer
            criterio al actuar basándose en información no verificada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">4. Limitación de Responsabilidad</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil y {CRISIS_CONFIG.legal.operator} se esfuerzan por mantener la plataforma operativa y
            la información útil, pero:
          </p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>No garantizamos la exactitud de la información enviada por usuarios</li>
            <li>No somos responsables de decisiones tomadas basadas en información de la plataforma</li>
            <li>No garantizamos disponibilidad continua durante situaciones de crisis extrema</li>
            <li>
              No somos responsables de la conducta de organizaciones, voluntarios u otras partes
              listadas
            </li>
            <li>La plataforma se proporciona &quot;tal como está&quot; sin garantías de ningún tipo</li>
          </ul>
          <p className="text-slate-700 mt-3 leading-relaxed">
            En la máxima medida permitida por la ley aplicable, nuestra responsabilidad total no
            excederá $100 USD o el valor pagado por los servicios (Vigil es gratuito), lo que sea
            mayor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">5. Propiedad Intelectual</h2>
          <p className="text-slate-700 leading-relaxed">
            El código de Vigil es de código abierto bajo licencia MIT. Puedes usar, modificar y
            redistribuir el código según los términos de esa licencia.
          </p>
          <p className="text-slate-700 mt-3 leading-relaxed">
            Los datos de usuarios (reportes de personas desaparecidas, etc.) pertenecen a las personas
            que los enviaron. Vigil tiene licencia para usar esos datos exclusivamente para operar la
            plataforma humanitaria según lo descrito en nuestra Política de Privacidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">
            6. Uso de Datos — Prohibición de Uso Comercial
          </h2>
          <p className="text-slate-700 leading-relaxed font-medium text-red-700">
            Los datos de Vigil — incluyendo pero no limitado a registros de personas desaparecidas,
            datos de mapa, información de voluntarios y datos de organizaciones — NO PUEDEN SER USADOS
            PARA FINES COMERCIALES. Esto incluye venta, licenciamiento, perfilado de datos u otros
            usos comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">7. Terminación del Acceso</h2>
          <p className="text-slate-700 leading-relaxed">
            Nos reservamos el derecho de bloquear el acceso de cualquier usuario o IP que viole estos
            términos, intente hacer scraping masivo de datos, o use la plataforma de manera que ponga
            en riesgo a personas vulnerables.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">8. Ley Aplicable y Disputas</h2>
          <p className="text-slate-700 leading-relaxed">
            Estos términos se rigen por las leyes del Estado de {CRISIS_CONFIG.legal.governingLaw}.
            Cualquier disputa se resolverá en los tribunales del Condado de Palm Beach, Florida, EE.UU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">9. Cambios a los Términos</h2>
          <p className="text-slate-700 leading-relaxed">
            Podemos actualizar estos términos. El uso continuado de la plataforma después de cambios
            publicados constituye aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">10. Contacto</h2>
          <p className="text-slate-700">
            Preguntas sobre estos términos:{' '}
            <a
              href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`}
              className="text-blue-600 underline ml-1"
            >
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
        </section>

        <div className="mt-12 p-4 bg-slate-100 rounded text-sm text-slate-600">
          Última actualización: {CRISIS_CONFIG.legal.effectiveDate} | Versión{' '}
          {CRISIS_CONFIG.legal.tosVersion} | {CRISIS_CONFIG.legal.operator}
        </div>
      </div>
    </main>
  )
}
