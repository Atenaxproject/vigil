-- Missing-person community flag + auto-hide (parity with community wall).
-- Columns flagged / flag_count already exist on missing_persons (001).
-- Ship in repo only — do NOT apply to production without Orlando.

CREATE OR REPLACE FUNCTION flag_missing_person(person_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE missing_persons
  SET
    flag_count = flag_count + 1,
    flagged = CASE WHEN flag_count + 1 >= 3 THEN true ELSE flagged END
  WHERE id = person_id
    AND flagged = false
    AND archived_at IS NULL
    AND deletion_requested_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION flag_missing_person(UUID) TO anon, authenticated;

COMMENT ON FUNCTION flag_missing_person(UUID) IS
  'Increment flag_count; auto-hide (flagged=true) at threshold 3. Public RPC — same pattern as flag_community_wall_message.';
