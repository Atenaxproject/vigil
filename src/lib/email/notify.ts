import { Resend } from 'resend'
import { CRISIS_CONFIG } from '@/config/crisis.config'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function notifyNewFeedback(feedback: {
  category: string
  message: string
  contact_email?: string
  page_context?: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    await resend.emails.send({
      from: `Vigil <${CRISIS_CONFIG.legal.contactEmail}>`,
      to: CRISIS_CONFIG.legal.supportEmail,
      subject: `[Vigil] Nuevo feedback: ${feedback.category}`,
      html: `
        <h2>Nuevo mensaje de feedback</h2>
        <p><strong>Categoría:</strong> ${escapeHtml(feedback.category)}</p>
        <p><strong>Página:</strong> ${escapeHtml(feedback.page_context || 'No especificada')}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(feedback.message)}</p>
        ${
          feedback.contact_email
            ? `<p><strong>Contacto para responder:</strong> ${escapeHtml(feedback.contact_email)}</p>`
            : '<p>Sin contacto provisto.</p>'
        }
      `,
    })
  } catch (error) {
    console.error('Failed to send feedback notification:', error)
  }
}

export async function notifyClaimLink(params: {
  to: string
  personName: string
  claimUrl: string
  type: 'missing_person' | 'resource_exchange'
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject =
    params.type === 'missing_person'
      ? `[Vigil] Enlace privado para gestionar reporte de ${params.personName}`
      : `[Vigil] Enlace privado para gestionar tu publicación`

  try {
    await resend.emails.send({
      from: `Vigil <${CRISIS_CONFIG.legal.contactEmail}>`,
      to: params.to,
      subject,
      html: `
        <h2>Tu enlace privado de Vigil</h2>
        <p>Guarda este enlace para gestionar tu reporte y ver actualizaciones:</p>
        <p><a href="${escapeHtml(params.claimUrl)}">${escapeHtml(params.claimUrl)}</a></p>
        <p><strong>⚠️ Este enlace es privado. Solo tú deberías tenerlo.</strong></p>
        <p>Si no enviaste este reporte, ignora este correo.</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send claim link email:', error)
  }
}
