-- Community wall: public append-only messages (Muro Comunitario)

CREATE TABLE community_wall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','aviso','solidaridad','pregunta')),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  location_label TEXT,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  reporter_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE community_wall;
ALTER TABLE community_wall ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_wall" ON community_wall FOR SELECT USING (flagged = false);
CREATE POLICY "public_insert_wall" ON community_wall FOR INSERT WITH CHECK (true);

CREATE INDEX idx_wall_created ON community_wall(created_at DESC) WHERE flagged = false;

-- Flag increment via SECURITY DEFINER (no service role needed for flags)
CREATE OR REPLACE FUNCTION flag_community_wall_message(msg_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_wall
  SET
    flag_count = flag_count + 1,
    flagged = CASE WHEN flag_count + 1 >= 3 THEN true ELSE flagged END
  WHERE id = msg_id AND flagged = false;
END;
$$;

GRANT EXECUTE ON FUNCTION flag_community_wall_message(UUID) TO anon, authenticated;
