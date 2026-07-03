import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Política de Privacidad — Vigil',
  description:
    'Cómo Vigil recopila, usa y protege tus datos personales en el contexto de respuesta a desastres.',
}

export default function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-slate-500 mb-8">
        Versión {CRISIS_CONFIG.legal.privacyPolicyVersion} — Vigente desde{' '}
        {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">1. Quiénes Somos</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil es operado por <strong>{CRISIS_CONFIG.legal.operator}</strong>, con sede en{' '}
            {CRISIS_CONFIG.legal.operatorLocation}. Vigil es una plataforma humanitaria de código
            abierto diseñada exclusivamente para coordinar respuestas a desastres naturales y crisis
            humanitarias. No somos una organización de rescate, un servicio gubernamental ni una
            entidad con fines de lucro en relación con esta plataforma.
          </p>
          {/* TODO: update legal operator line once YouTheWave Inc. is incorporated */}
          <p className="text-slate-700 leading-relaxed mt-3">
            Contacto de privacidad:{' '}
            <a
              href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`}
              className="text-blue-600 underline"
            >
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">2. Qué Datos Recopilamos</h2>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.1 Reportes de personas desaparecidas</h3>
          <p className="text-slate-700 leading-relaxed">Cuando reportas a una persona desaparecida, recopilamos:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-2">
            <li>Nombre completo, edad y género de la persona desaparecida</li>
            <li>Fotografía (opcional pero recomendada)</li>
            <li>Última ubicación conocida (descripción de texto y/o coordenadas GPS)</li>
            <li>Hora y fecha de la última vez que fue visto/a</li>
            <li>Tu nombre y datos de contacto como persona que reporta</li>
            <li>Notas adicionales de identificación</li>
            <li>Hora y dirección IP (almacenada como hash anónimo, no como IP legible)</li>
          </ul>
          <p className="text-slate-700 mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <strong>Importante:</strong> Tu información de contacto NUNCA se muestra públicamente.
            Todas las solicitudes de contacto se enrutan a través del sistema de mensajería interno de
            Vigil, y tú decides si responder.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.2 Marcadores de mapa</h3>
          <p className="text-slate-700 leading-relaxed">
            Cuando publicas una necesidad o recurso en el mapa: tipo, categoría, descripción,
            ubicación, información de contacto (no pública), y hash de IP.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.3 Registro de voluntarios</h3>
          <p className="text-slate-700 leading-relaxed">
            Nombre, habilidades, idiomas, disponibilidad e información de contacto. Los datos de
            contacto son privados y solo se comparten con organizaciones verificadas cuando aceptas
            una coincidencia de voluntario.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.4 Datos de uso</h3>
          <p className="text-slate-700 leading-relaxed">
            Usamos Vercel Analytics (datos anonimizados) para entender el tráfico. No utilizamos
            cookies de seguimiento de terceros. No utilizamos Google Analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">3. Por Qué Usamos Tus Datos</h2>
          <p className="text-slate-700">Todos los datos se procesan exclusivamente para:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-2">
            <li>Facilitar la reunificación de familias separadas por el desastre</li>
            <li>Coordinar la entrega de ayuda humanitaria</li>
            <li>Conectar a voluntarios con organizaciones que necesitan ayuda</li>
            <li>Prevenir la desinformación y los reportes duplicados</li>
            <li>Detectar y bloquear el abuso de la plataforma</li>
          </ul>
          <p className="text-slate-700 mt-3 font-medium text-red-700">
            Vigil NO usa tus datos para publicidad, perfiles comerciales, investigación no relacionada
            con la crisis, ni ningún propósito más allá de la respuesta humanitaria directa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">4. Quién Tiene Acceso a Tus Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>
              <strong>Equipo de administración de Vigil</strong> (Orlando Toro, operador) — acceso
              completo para moderación
            </li>
            <li>
              <strong>Supabase</strong> — proveedor de base de datos (servidores en EE.UU.). Ver su
              política de privacidad en supabase.com/privacy
            </li>
            <li>
              <strong>Vercel</strong> — proveedor de hosting (servidores en EE.UU.). Ver su política en
              vercel.com/legal/privacy-policy
            </li>
            <li>
              <strong>Anthropic (Claude AI)</strong> — para traducción automática y detección de
              duplicados. Los datos se procesan pero no se almacenan para entrenamiento. Ver
              anthropic.com/privacy
            </li>
          </ul>
          <p className="text-slate-700 mt-4 p-4 bg-red-50 border border-red-200 rounded font-medium">
            🔒 COMPROMISO DE NO DIVULGACIÓN GUBERNAMENTAL: Vigil no comparte, vende, entrega ni
            proporciona acceso a ningún dato de usuario a ninguna agencia gubernamental, incluyendo el
            gobierno venezolano, a menos que sea requerido por una orden judicial válida de un tribunal
            de Florida, EE.UU. En tal caso, notificaremos al usuario afectado en la medida en que la ley
            lo permita.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">5. Retención de Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>
              Los registros de personas desaparecidas permanecen activos mientras la crisis esté en
              curso o haya actividad en el registro
            </li>
            <li>
              Los registros sin actualización por más de <strong>90 días</strong> se archivan
              automáticamente (aún accesibles por solicitud)
            </li>
            <li>
              Los registros archivados se eliminan permanentemente después de <strong>1 año</strong>
            </li>
            <li>Las fotografías se eliminan cuando se elimina el registro correspondiente</li>
            <li>
              Los logs de IPs (hasheadas) se eliminan después de <strong>30 días</strong>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">6. Tus Derechos</h2>
          <p className="text-slate-700 mb-3">Tienes derecho a:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2">
            <li>
              <strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti
            </li>
            <li>
              <strong>Corrección:</strong> Solicitar la corrección de datos incorrectos
            </li>
            <li>
              <strong>Eliminación (derecho al olvido):</strong> Solicitar la eliminación de tu reporte.
              Por razones de seguridad, verificaremos que eres quien enviaste el reporte original antes
              de eliminar.
            </li>
            <li>
              <strong>Actualización de estado:</strong> Marcar a una persona como encontrada en cualquier
              momento
            </li>
          </ul>
          <p className="text-slate-700 mt-3">
            Para ejercer cualquiera de estos derechos, escríbenos a:{' '}
            <a
              href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`}
              className="text-blue-600 underline ml-1"
            >
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">7. Seguridad de los Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>Toda la transmisión de datos usa HTTPS/TLS</li>
            <li>La información de contacto nunca se muestra públicamente</li>
            <li>Las IPs se almacenan como hashes SHA-256, no en texto claro</li>
            <li>Las fotografías se sirven con URLs firmadas de corta duración</li>
            <li>El acceso administrativo requiere autenticación de dos factores</li>
            <li>Los datos de la base de datos están aislados con seguridad a nivel de fila (RLS)</li>
            <li>Limitación de solicitudes para prevenir scraping masivo de datos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">8. Datos de Menores</h2>
          <p className="text-slate-700 leading-relaxed">
            Reconocemos que en situaciones de desastre, los datos de menores deben reportarse para
            facilitar reunificaciones. Los reportes sobre menores deben ser enviados por un adulto
            responsable. Tomamos precauciones adicionales con estos registros, incluyendo revisión de
            moderación prioritaria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">9. Ley Aplicable</h2>
          <p className="text-slate-700 leading-relaxed">
            Esta política se rige por las leyes del Estado de {CRISIS_CONFIG.legal.governingLaw}. Hacemos
            esfuerzos de buena fe para cumplir con los principios del RGPD de la UE dado que usuarios
            internacionales acceden a esta plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">10. Cambios a Esta Política</h2>
          <p className="text-slate-700 leading-relaxed">
            Publicaremos cambios en esta página con la fecha de actualización. Dado el carácter urgente de
            una crisis activa, los cambios pueden ser efectivos inmediatamente.
          </p>
        </section>

        <div className="mt-12 p-4 bg-slate-100 rounded text-sm text-slate-600">
          Última actualización: {CRISIS_CONFIG.legal.effectiveDate} | Versión{' '}
          {CRISIS_CONFIG.legal.privacyPolicyVersion} | {CRISIS_CONFIG.legal.operator}
        </div>
      </div>
    </main>
  )
}
