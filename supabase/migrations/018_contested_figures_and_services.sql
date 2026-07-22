-- Prompt 69/71: update official casualty figures + contested figure support
-- Prompt 70: service_reports + kill switches

ALTER TABLE sourced_figures
  ADD COLUMN IF NOT EXISTS is_contested BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disputes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS independent_alternatives JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE sourced_figures SET
  value = '5346',
  source = 'Balance oficial del gobierno (vía CIVIS Venezuela)',
  source_url = NULL,
  verified_at = '2026-07-21T00:00:00Z',
  is_contested = true,
  disputes = '[
    {"party":"Provea","claim":"Las cifras oficiales generan más dudas que certezas; pidió cero opacidad en la respuesta.","source_url":"https://provea.org","dated":"2026-06-28"},
    {"party":"Provea","claim":"Reportó creciente discordancia entre cifras oficiales y estimaciones independientes.","source_url":"https://provea.org","dated":"2026-07-01"},
    {"party":"USGS PAGER","claim":"Proyección automática inicial de pérdidas de hasta ~100.000 fatalidades (modelo de sacudida; no es un conteo).","source_url":"https://earthquake.usgs.gov","dated":"2026-06-24"},
    {"party":"ONU","claim":"Estimó aproximadamente 50.000 personas no localizadas; no hay balance oficial de desaparecidos.","source_url":"https://www.un.org","dated":"2026-07-01"},
    {"party":"Expertos académicos (vía Semana)","claim":"Cuestionaron la fiabilidad de datos oficiales, señalando que el Estado silenció la agencia que producía estadísticas comparables.","source_url":"https://www.semana.com","dated":"2026-07-01"}
  ]'::jsonb,
  updated_at = NOW()
WHERE key = 'deaths';

UPDATE sourced_figures SET
  value = '16740',
  source = 'Asamblea Nacional',
  verified_at = '2026-07-08T00:00:00Z',
  is_contested = true,
  disputes = '[
    {"party":"Provea","claim":"Las cifras oficiales generan más dudas que certezas.","source_url":"https://provea.org","dated":"2026-06-28"}
  ]'::jsonb,
  updated_at = NOW()
WHERE key = 'injured';

INSERT INTO sourced_figures (key, label_es, label_en, value, source, source_url, verified_at, is_official, category, sort_order, is_contested, disputes)
VALUES
('rescued', 'Rescatados (cifra oficial)', 'Rescued (official figure)', '6462', 'Balance oficial del gobierno', NULL, '2026-07-21T00:00:00Z', true, 'operational', 15, true,
 '[ {"party":"Provea","claim":"Cuestionó opacidad en cifras de la respuesta.","source_url":"https://provea.org","dated":"2026-06-28"} ]'::jsonb),
('patients_attended', 'Pacientes atendidos (cifra oficial)', 'Patients attended (official figure)', '39567', 'Balance oficial del gobierno', NULL, '2026-07-21T00:00:00Z', true, 'operational', 16, true,
 '[ {"party":"Provea","claim":"Cuestionó opacidad en cifras de la respuesta.","source_url":"https://provea.org","dated":"2026-06-28"} ]'::jsonb),
('aftershocks_official', 'Réplicas (balance oficial)', 'Aftershocks (official balance)', '1405', 'Balance oficial del gobierno', NULL, '2026-07-21T00:00:00Z', true, 'operational', 17, false, '[]'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  source = EXCLUDED.source,
  verified_at = EXCLUDED.verified_at,
  is_contested = EXCLUDED.is_contested,
  disputes = EXCLUDED.disputes,
  label_es = EXCLUDED.label_es,
  label_en = EXCLUDED.label_en,
  updated_at = NOW();

-- Keep OSU independent structures figure labeled clearly
UPDATE sourced_figures SET
  is_contested = false,
  is_official = false,
  source = 'Oregon State University (análisis satelital)',
  updated_at = NOW()
WHERE key = 'structures_damaged_osu';

-- Prompt 70 Part A: community service status reports
CREATE TABLE IF NOT EXISTS service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('electricidad','agua','gasolina','gas','senal')),
  status TEXT NOT NULL CHECK (status IN ('disponible','intermitente','sin_servicio')),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reporter_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_reports_zone_service_time
  ON service_reports (zone_id, service_type, reported_at DESC);

ALTER TABLE service_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_reports_public_insert" ON service_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "service_reports_public_read" ON service_reports
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO platform_settings (key, value)
VALUES
  ('servicios_public_enabled', 'true'::jsonb),
  ('amenazas_public_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
