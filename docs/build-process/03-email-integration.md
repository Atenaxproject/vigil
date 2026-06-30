# Vigil — Email Integration Prompt
## Paste into Cursor Composer (Agent mode) after Cloudflare Email Routing is live

---

Read @CLAUDE.md before starting.

Orlando has set up two email addresses via Cloudflare Email Routing:
- vigil@youthewave.org — general contact, partnerships, public-facing
- vigil.support@youthewave.org — feedback and support specifically

Do the following:

## 1. Update crisis.config.ts

Update the `legal` object's `contactEmail` field:

```typescript
legal: {
  // ...existing fields
  contactEmail: 'vigil@youthewave.org',
  supportEmail: 'vigil.support@youthewave.org',
}
```

## 2. Update Privacy Policy and Terms of Service

In `src/app/privacidad/page.tsx` and `src/app/terminos/page.tsx`, replace any 
reference to the old contact email with `CRISIS_CONFIG.legal.contactEmail`. 
Confirm both pages render the correct new address.

## 3. Wire Resend for automated feedback notifications

Create `src/lib/email/notify.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notifyNewFeedback(feedback: {
  category: string
  message: string
  contact_email?: string
  page_context?: string
}) {
  try {
    await resend.emails.send({
      from: 'Vigil <vigil@youthewave.org>',
      to: 'vigil.support@youthewave.org',
      subject: `[Vigil] Nuevo feedback: ${feedback.category}`,
      html: `
        <h2>Nuevo mensaje de feedback</h2>
        <p><strong>Categoría:</strong> ${feedback.category}</p>
        <p><strong>Página:</strong> ${feedback.page_context || 'No especificada'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${feedback.message}</p>
        ${feedback.contact_email ? `<p><strong>Contacto para responder:</strong> ${feedback.contact_email}</p>` : '<p>Sin contacto provisto.</p>'}
      `,
    })
  } catch (error) {
    console.error('Failed to send feedback notification:', error)
    // Non-blocking — feedback is already saved in Supabase regardless
  }
}
```

## 4. Call this function after feedback submission

In the feedback submission handler (wherever the feedback form POSTs to Supabase), 
after a successful insert, call `notifyNewFeedback()` with the submitted data. 
This must not block or fail the user-facing submission if the email fails — 
wrap in try/catch, log errors, never show an error to the user if only the 
email step fails (the feedback is already safely stored in the database).

## 5. Add RESEND_API_KEY to env requirements

Add to `.env.example`:
```
RESEND_API_KEY=
```

Remind Orlando in your final summary: he needs to add `RESEND_API_KEY` to Vercel 
Environment Variables (get it from resend.com dashboard → API Keys), and verify 
`youthewave.org` as a sending domain in Resend (Resend dashboard → Domains → Add 
Domain → it provides DKIM/SPF DNS records → add those to Cloudflare DNS).

## 6. Add contact emails to the visible UI

Add a small "Contacto" link in the footer (every page) pointing to 
`mailto:vigil@youthewave.org`. Add the support email visibly inside the feedback 
widget modal: "También puedes escribirnos directamente a vigil.support@youthewave.org"

## 7. Update outreach email references (informational only — no code change)

Note for Orlando: the outreach emails to Anthropic, Cloudflare, Vercel, Supabase, 
etc. should now reference vigil@youthewave.org as the contact line instead of the 
personal Atenax email, since this is now the platform's official address. This is 
a manual edit Orlando makes to the email text before sending — not a code task.

## 8. Commit

```bash
git add -A
git commit -m "feat: integrate official Vigil email addresses

- Updated crisis.config.ts with vigil@youthewave.org and vigil.support@youthewave.org
- Updated Privacy Policy and Terms contact references
- Added Resend-powered feedback notification emails
- Added visible contact email in footer and feedback widget"
git push
```
