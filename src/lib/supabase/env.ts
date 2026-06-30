/** Returns true when Supabase URL and anon key are configured (not placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
      key &&
      url !== 'https://placeholder.supabase.co' &&
      key !== 'placeholder-anon-key' &&
      !url.includes('your_supabase')
  )
}

export function getSupabaseConfigError(): string | null {
  if (isSupabaseConfigured()) return null
  return 'Supabase no está configurado. Agregue NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
}
