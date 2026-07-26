-- ============================================================
-- VIGIL — RLS contact / claim_token lockdown (Phase 0)
-- Pattern: 006_missing_persons_rls_fix + 010_property_assessments
-- Anon/authenticated clients read SAFE public_* views only.
-- Never expose claim_token, contact_*, organizer_contact via anon SELECT.
-- ============================================================

-- ------------------------------------------------------------
-- resource_exchange
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public_resource_exchange;
CREATE VIEW public_resource_exchange AS
SELECT
  id,
  entry_type,
  category,
  title,
  description,
  quantity,
  location,
  lat,
  lng,
  languages,
  available_until,
  urgent,
  status,
  verified,
  region_scope,
  created_at,
  updated_at
FROM resource_exchange
WHERE flagged = false
  AND status != 'expired';

GRANT SELECT ON public_resource_exchange TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_exchange" ON resource_exchange;
CREATE POLICY "no_public_direct_read_exchange" ON resource_exchange
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "admin_select_resource_exchange" ON resource_exchange;
CREATE POLICY "admin_select_resource_exchange" ON resource_exchange
  FOR SELECT USING (is_vigil_admin());

DROP POLICY IF EXISTS "admin_update_resource_exchange" ON resource_exchange;
CREATE POLICY "admin_update_resource_exchange" ON resource_exchange
  FOR UPDATE USING (is_vigil_admin());

-- ------------------------------------------------------------
-- volunteers (view already exists — restore table lockdown)
-- ------------------------------------------------------------
GRANT SELECT ON public_volunteers TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_volunteers" ON volunteers;
CREATE POLICY "no_public_direct_read_volunteers" ON volunteers
  FOR SELECT USING (false);
-- admin_read_volunteers / admin_update_volunteers remain from 002_auth_setup

-- ------------------------------------------------------------
-- rescuer_presence — remove public UPDATE; strip contact from public read
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public_rescuer_presence;
CREATE VIEW public_rescuer_presence AS
SELECT
  id,
  display_name,
  team_or_org,
  presence_type,
  lat,
  lng,
  status,
  last_checkin,
  notes,
  auto_expire_at,
  created_at
FROM rescuer_presence
WHERE auto_expire_at > NOW()
  AND status != 'signed_off';

GRANT SELECT ON public_rescuer_presence TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_presence" ON rescuer_presence;
DROP POLICY IF EXISTS "public_update_presence" ON rescuer_presence;

CREATE POLICY "no_public_direct_read_presence" ON rescuer_presence
  FOR SELECT USING (false);

-- INSERT remains public (check-in registration); updates go through service-role API
-- public_insert_presence kept from 004_golive_features

DROP POLICY IF EXISTS "admin_select_rescuer_presence" ON rescuer_presence;
CREATE POLICY "admin_select_rescuer_presence" ON rescuer_presence
  FOR SELECT USING (is_vigil_admin());

DROP POLICY IF EXISTS "admin_update_rescuer_presence" ON rescuer_presence;
CREATE POLICY "admin_update_rescuer_presence" ON rescuer_presence
  FOR UPDATE USING (is_vigil_admin());

-- ------------------------------------------------------------
-- map_markers — no contact via anon
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public_map_markers;
CREATE VIEW public_map_markers AS
SELECT
  id,
  type,
  category,
  title,
  description,
  lat,
  lng,
  estado,
  municipio,
  urgent,
  status,
  verified,
  source,
  hours_schedule,
  accepts_categories,
  organizer_name,
  region_scope,
  created_at,
  resolved_at
FROM map_markers
WHERE flagged = false
  AND status != 'resolved';

GRANT SELECT ON public_map_markers TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_markers" ON map_markers;
CREATE POLICY "no_public_direct_read_markers" ON map_markers
  FOR SELECT USING (false);
-- admin_select_all_markers / admin_update_markers remain from 002_auth_setup

-- ------------------------------------------------------------
-- events — no organizer_contact via anon
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public_events;
CREATE VIEW public_events AS
SELECT
  id,
  title,
  description,
  category,
  starts_at,
  ends_at,
  location_label,
  lat,
  lng,
  organizer_name,
  verified,
  region_scope,
  created_at
FROM events
WHERE flagged = false;

GRANT SELECT ON public_events TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "no_public_direct_read_events" ON events
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "admin_select_events" ON events;
CREATE POLICY "admin_select_events" ON events
  FOR SELECT USING (is_vigil_admin());

DROP POLICY IF EXISTS "admin_update_events" ON events;
CREATE POLICY "admin_update_events" ON events
  FOR UPDATE USING (is_vigil_admin());

-- ------------------------------------------------------------
-- needs_offers — no contact via anon (legacy table; lock for completeness)
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public_needs_offers;
CREATE VIEW public_needs_offers AS
SELECT
  id,
  entry_type,
  category,
  description,
  quantity,
  location,
  lat,
  lng,
  status,
  urgent,
  expires_at,
  region_scope,
  created_at
FROM needs_offers
WHERE status IN ('open', 'matched');

GRANT SELECT ON public_needs_offers TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_needs" ON needs_offers;
CREATE POLICY "no_public_direct_read_needs" ON needs_offers
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "admin_select_needs_offers" ON needs_offers;
CREATE POLICY "admin_select_needs_offers" ON needs_offers
  FOR SELECT USING (is_vigil_admin());

DROP POLICY IF EXISTS "admin_update_needs_offers" ON needs_offers;
CREATE POLICY "admin_update_needs_offers" ON needs_offers
  FOR UPDATE USING (is_vigil_admin());
