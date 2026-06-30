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
