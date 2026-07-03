-- ============================================================
-- VIGIL — Hogar Bambi Venezuela (17th verified organization)
-- Run after 001_real_data.sql and 002_resources — idempotent
-- ============================================================

INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email, donation_link, donation_instructions,
  lat, lng, location_label, verified, active, approved_by_admin, trusted_source
)
SELECT
  'Hogar Bambi Venezuela',
  'child_protection',
  'Venezuela',
  'Asociación Civil sin fines de lucro (27+ años), cinco casas en San Bernardino, Caracas. Atención integral a niños y adolescentes (0-18) retirados de entornos familiares inseguros — abandono, abuso, pobreza extrema. Enfoque en reunificación familiar y colocación en familia segura. RIF J-30251707-9, listado en GlobalGiving.',
  'Non-profit civil association (27+ years), five houses in San Bernardino, Caracas. Comprehensive care for children and adolescents (0-18) removed from unsafe family environments — abandonment, abuse, extreme poverty. Focus on family reunification and safe family placement. RIF J-30251707-9, listed on GlobalGiving.',
  'https://hogarbambi.org/',
  '+58 212 550 5539 / +58 212 550 5714',
  'hogarbambi@hogarbambi.org',
  'https://hogarbambi.org/donar-ahora/',
  'Donaciones verificadas vía GlobalGiving y sitio oficial.',
  10.5090,
  -66.8910,
  'Caracas, Venezuela (San Bernardino)',
  true,
  true,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM organizations o WHERE o.name = 'Hogar Bambi Venezuela'
);
