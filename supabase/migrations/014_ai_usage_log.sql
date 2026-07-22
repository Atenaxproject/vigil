-- ============================================================
-- AI usage log — approximate spend proxy for circuit breaker
-- Anthropic does not expose live spend to the application.
-- Each row is one model call; unit weights applied in app code.
-- Justification vs rate_limit_log: per-IP abuse vs global spend
-- pressure need different schemas (no ip_hash; model_tier + feature).
-- ============================================================

CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_tier TEXT NOT NULL CHECK (model_tier IN ('haiku', 'sonnet')),
  feature TEXT NOT NULL CHECK (feature IN (
    'photo_search',
    'assistant',
    'nl_intake',
    'property_triage',
    'dedup',
    'translate',
    'matching',
    'other'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_created ON ai_usage_log (created_at DESC);
CREATE INDEX idx_ai_usage_tier_created ON ai_usage_log (model_tier, created_at DESC);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Admins only (service role bypasses RLS for inserts from API routes)
CREATE POLICY "admin_read_ai_usage" ON ai_usage_log
  FOR SELECT USING (is_vigil_admin());
