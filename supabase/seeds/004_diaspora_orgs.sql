-- ============================================================
-- VIGIL — USA DIASPORA ORGANIZATIONS (South Florida)
-- region_scope = 'usa_diaspora'
-- ⚠️  ORLANDO: Confirm current hours/status before treating as authoritative.
-- ============================================================

INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email, donation_link, donation_instructions,
  lat, lng, location_label, verified, active, approved_by_admin, trusted_source,
  region_scope
)
SELECT
  'Global Empowerment Mission (GEM) — Doral',
  'diaspora', 'USA',
  'Organización humanitaria líder en la respuesta desde EE.UU.; aliada con la Ciudad de Doral, el Departamento de Estado y Walmart. ⚠️ Verificar horarios de recepción antes de trasladarse.',
  'Lead U.S. humanitarian org for Venezuela earthquake response; partnered with City of Doral, U.S. State Department, and Walmart. ⚠️ Confirm intake hours before traveling.',
  'https://www.globalempowermentmission.org', '+1-786-763-4367', NULL,
  'https://www.globalempowermentmission.org',
  '1850 NW 84th Ave, Suite 100, Doral, FL 33126 — confirm current intake hours with GEM directly.',
  25.8075, -80.3360, '1850 NW 84th Ave, Suite 100, Doral, FL 33126',
  true, true, true, false, 'usa_diaspora'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations
  WHERE name = 'Global Empowerment Mission (GEM) — Doral' AND region_scope = 'usa_diaspora'
);

INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email, donation_link, donation_instructions,
  lat, lng, location_label, verified, active, approved_by_admin, trusted_source,
  region_scope
)
SELECT
  'AFE — Amor, Fe y Esperanza',
  'diaspora', 'USA',
  'Punto de acopio activo en Miami-Dade. Contacto: Pastor Rubén Jiménez. ⚠️ Horarios reportados 9:30am–3pm — confirmar antes de visitar.',
  'Active collection point in Miami-Dade. Contact: Pastor Rubén Jiménez. ⚠️ Reported hours 9:30am–3pm — confirm before visiting.',
  NULL, NULL, NULL, NULL,
  '6090 NW 84th Ave, Miami, FL 33166 — confirm hours with AFE directly.',
  25.8210, -80.3365, '6090 NW 84th Ave, Miami, FL 33166',
  true, true, true, false, 'usa_diaspora'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations
  WHERE name = 'AFE — Amor, Fe y Esperanza' AND region_scope = 'usa_diaspora'
);
