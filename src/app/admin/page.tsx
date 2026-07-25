import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { PropertyAssessmentAdmin } from '@/components/admin/PropertyAssessmentAdmin'
import { FeedHealthPanel } from '@/components/admin/FeedHealthPanel'
import { ModerationQueue } from '@/components/admin/ModerationQueue'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user)) {
    redirect('/auth/login?next=/admin&reason=auth_required')
  }

  return (
    <div className="mx-auto max-w-2xl p-8 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-vigil-ink">Admin</h1>
          <p className="mt-2 text-[16px] text-vigil-muted">
            Panel de moderación — sesión activa como {user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/admin/feedback" className="text-vigil-blue hover:underline">
          Feedback
        </Link>
      </nav>

      <ModerationQueue />
      <FeedHealthPanel />
      <PropertyAssessmentAdmin />
    </div>
  )
}
