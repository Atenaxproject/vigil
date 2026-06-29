import Link from 'next/link'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Terms of Use — Vigil',
  description: 'Terms and conditions for using the Vigil humanitarian crisis response platform.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-slate-500 mb-8">
        Version {CRISIS_CONFIG.legal.tosVersion} — Effective {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          By using Vigil, you agree to use the platform only for legitimate humanitarian purposes:
          reporting or searching for missing persons, sharing verified needs and resources, and
          volunteering during crisis response.
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Vigil is NOT an emergency service.</strong> For immediate rescue, call{' '}
            <strong>
              {CRISIS_CONFIG.emergency.hotline} ({CRISIS_CONFIG.emergency.hotlineLabel})
            </strong>
            .
          </li>
          <li>
            Submit only accurate information. False missing-person reports can cause real harm.
          </li>
          <li>
            Scraping, commercial use of platform data, impersonation of aid organizations, and abuse
            targeting vulnerable users are strictly prohibited.
          </li>
          <li>
            Vigil is provided &quot;as is.&quot; {CRISIS_CONFIG.legal.operator} is not liable for
            decisions made based on user-submitted, unverified information.
          </li>
        </ul>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-slate-800 mb-2">Full terms available in Spanish</p>
          <p className="text-slate-700 mb-4">
            The authoritative terms of use are published in Spanish, the primary language of this
            deployment.
          </p>
          <Link
            href="/terminos"
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Read Términos de Uso (Español) →
          </Link>
        </div>
      </div>
    </main>
  )
}
