-- ============================================================
-- VIGIL — RESOURCE DIRECTORY SEED (venezuelatebusca.com/resources)
-- Venezuela Earthquake Response — June 2026
-- Public institutional resource directory — hospitals, Red Cross
-- family search lines, volunteer groups. Same category as news-sourced seed.
-- Run after 001_real_data.sql — idempotent (skips existing names)
-- ============================================================

-- ============================================================
-- ORGANIZATIONS — Red Cross family search + humanitarian tech
-- ============================================================
INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email,
  verified, active, approved_by_admin, trusted_source
)
SELECT * FROM (VALUES
  (
    'Cruz Roja Hondureña — Búsqueda de Familiares', 'rescue', 'Honduras',
    'Servicio de búsqueda de familiares de la Cruz Roja Hondureña para venezolanos buscando contacto con seres queridos.',
    'Honduran Red Cross family tracing service for Venezuelans seeking contact with loved ones.',
    NULL::text, '+504-9849-5556', 'busquedarcf@cruzroja.org.hn',
    true, true, true, true
  ),
  (
    'Cruz Roja Argentina — Búsqueda de Familiares', 'rescue', 'Argentina',
    'Servicio de búsqueda de familiares de la Cruz Roja Argentina.',
    'Argentine Red Cross family tracing service.',
    'https://cruzroja.org.ar/rcf/', NULL::text, NULL::text,
    true, true, true, true
  ),
  (
    'Cruz Roja Colombiana — Búsqueda de Familiares', 'rescue', 'Colombia',
    'Servicio de búsqueda de familiares de la Cruz Roja Colombiana.',
    'Colombian Red Cross family tracing service.',
    NULL::text, '+57-321-213-9525', 'rcf@cruzrojacolombiana.org',
    true, true, true, true
  ),
  (
    'Ingenieros Voluntarios — Revisión Estructural (UNIMET)', 'tech', 'Venezuela',
    'Ingenieros civiles de la UNIMET y otras universidades que ofrecen evaluación gratuita y voluntaria sobre el estado estructural de edificaciones afectadas.',
    'Civil engineers from UNIMET and other universities offering free voluntary structural assessments of affected buildings.',
    NULL::text, NULL::text, NULL::text,
    true, true, true, true
  ),
  (
    'RedQuipu', 'tech', 'Venezuela',
    'Plataforma humanitaria que conecta iniciativas, organiza necesidades y consolida información para facilitar una respuesta coordinada en Venezuela.',
    'Humanitarian platform connecting initiatives, organizing needs, and consolidating information for coordinated response in Venezuela.',
    'https://redquipu.com', NULL::text, NULL::text,
    true, true, true, false
  )
) AS v(name, type, country, description_es, description_en, website, phone, email, verified, active, approved_by_admin, trusted_source)
WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.name = v.name);

-- ============================================================
-- MAP MARKERS — Caracas hospitals (venezuelatebusca.com/resources)
-- ============================================================
INSERT INTO map_markers (
  type, category, title, description, lat, lng, contact, status, verified, source
)
SELECT * FROM (VALUES
  ('hospital', 'medical', 'Policlínica David Lobo', 'Santa Rosalía, Caracas', 10.4880::decimal, -66.9180::decimal, '(212) 541-5465', 'active', true, 'venezuelatebusca.com'),
  ('hospital', 'medical', 'Hospital Periférico de Catia', 'Catia, Caracas', 10.5089::decimal, -66.9444::decimal, '(212) 870-2771', 'active', true, 'venezuelatebusca.com'),
  ('hospital', 'medical', 'Hospital Andrés Herrera Vegas', 'El Algodonal, Caracas', 10.4950::decimal, -67.0050::decimal, '(212) 472-3138', 'active', true, 'venezuelatebusca.com'),
  ('hospital', 'medical', 'Hospital Clínico Universitario', 'Chaguaramos, Caracas', 10.4920::decimal, -66.8970::decimal, '(212) 606-7111', 'active', true, 'venezuelatebusca.com'),
  ('hospital', 'medical', 'Hospital de Niños J.M. de los Ríos', 'San Bernardino, Caracas', 10.5080::decimal, -66.9050::decimal, '(212) 574-3511', 'active', true, 'venezuelatebusca.com')
) AS v(type, category, title, description, lat, lng, contact, status, verified, source)
WHERE NOT EXISTS (SELECT 1 FROM map_markers m WHERE m.title = v.title AND m.source = v.source);
