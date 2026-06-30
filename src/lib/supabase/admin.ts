// ADMIN CLIENT — server-side only, NEVER expose to client
// Uses service role key — bypasses RLS for admin operations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used client-side')
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey || serviceRoleKey === 'placeholder-service-key') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no configurada. Agregue la clave en .env.local (solo servidor).'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey)
}
