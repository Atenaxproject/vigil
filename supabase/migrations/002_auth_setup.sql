-- ============================================================
-- VIGIL CRISIS PLATFORM — AUTH SETUP
-- Version: 1.1.0 | Date: 2026-06-29
-- Profiles, admin RLS policies (does not alter public policies)
-- ============================================================

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  locale TEXT DEFAULT 'es' CHECK (locale IN ('es','en','pt','fr','it','zh','de','ru')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ADMIN HELPER — uses app_metadata.role (NOT user_metadata)
-- Set via Supabase dashboard or service role:
--   UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' WHERE email = '...';
-- ============================================================
CREATE OR REPLACE FUNCTION is_vigil_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================
-- ADMIN-ONLY TABLES — enable RLS where missing
-- ============================================================
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE erasure_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Moderation queue: admins only (service role bypasses RLS)
CREATE POLICY "admin_read_moderation" ON moderation_queue
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_moderation" ON moderation_queue
  FOR UPDATE USING (is_vigil_admin());

-- Erasure requests: anyone can submit, admins manage
CREATE POLICY "public_submit_erasure" ON erasure_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_read_erasure" ON erasure_requests
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_erasure" ON erasure_requests
  FOR UPDATE USING (is_vigil_admin());

-- Rate limit log: admins only
CREATE POLICY "admin_read_rate_limit" ON rate_limit_log
  FOR SELECT USING (is_vigil_admin());

-- Contact requests: admins read/update (public submits via API with anon key + service role)
CREATE POLICY "admin_read_contact_requests" ON contact_requests
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_contact_requests" ON contact_requests
  FOR UPDATE USING (is_vigil_admin());

-- Public can still insert contact requests (existing table had RLS but no insert policy)
CREATE POLICY "public_insert_contact_requests" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- ADMIN UPDATE POLICIES for moderation tables
-- Does NOT change existing public read/insert policies
-- ============================================================
CREATE POLICY "admin_update_missing" ON missing_persons
  FOR UPDATE USING (is_vigil_admin());

CREATE POLICY "admin_select_all_missing" ON missing_persons
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_markers" ON map_markers
  FOR UPDATE USING (is_vigil_admin());

CREATE POLICY "admin_select_all_markers" ON map_markers
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_orgs" ON organizations
  FOR UPDATE USING (is_vigil_admin());

CREATE POLICY "admin_select_all_orgs" ON organizations
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_read_volunteers" ON volunteers
  FOR SELECT USING (is_vigil_admin());

CREATE POLICY "admin_update_volunteers" ON volunteers
  FOR UPDATE USING (is_vigil_admin());

-- Profiles updated_at trigger
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
