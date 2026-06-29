import Link from 'next/link'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Privacy Policy — Vigil',
  description: 'How Vigil collects, uses, and protects personal data during disaster response.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Version {CRISIS_CONFIG.legal.privacyPolicyVersion} — Effective {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <p>
          Vigil is operated by <strong>{CRISIS_CONFIG.legal.operator}</strong> as an open-source
          humanitarian crisis platform. We collect only the data needed to help reunite families,
          coordinate aid, and connect volunteers — never for advertising or commercial profiling.
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contact info is never shown publicly.</strong> All outreach is routed through
            Vigil&apos;s internal contact request system.
          </li>
          <li>
            <strong>No government data sharing.</strong> Vigil does not share user data with the
            Venezuelan government or any government agency, except as required by a valid Florida court
            order.
          </li>
          <li>
            IP addresses are stored as hashed values only. Photos and records follow a defined retention
            schedule (90-day archive, 1-year deletion).
          </li>
          <li>
            You may request access, correction, or deletion of your data at{' '}
            <a href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`} className="text-blue-600 underline">
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
            .
          </li>
        </ul>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-slate-800 mb-2">Full policy available in Spanish</p>
          <p className="text-slate-700 mb-4">
            The authoritative privacy policy is published in Spanish, the primary language of this
            deployment.
          </p>
          <Link
            href="/privacidad"
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Read Política de Privacidad (Español) →
          </Link>
        </div>
      </div>
    </main>
  )
}
