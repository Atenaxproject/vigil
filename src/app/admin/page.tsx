import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { PropertyAssessmentAdmin } from '@/components/admin/PropertyAssessmentAdmin'
import { FeedHealthPanel } from '@/components/admin/FeedHealthPanel'
import { redirect } from 'next/navigation'

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
    <div className="mx-auto max-w-xl p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-vigil-ink">Admin</h1>
          <p className="mt-2 text-[16px] text-vigil-muted">
            Panel de moderación — sesión activa como {user.email}
          </p>
        </div>
        <SignOutButton />
      </div>
      <p className="mt-8 text-sm text-slate-600">
        Moderación completa próximamente. Use Supabase Studio para revisar la cola de moderación.
      </p>
      <FeedHealthPanel />
      <PropertyAssessmentAdmin />
    </div>
  )
}
