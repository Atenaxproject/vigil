-- ============================================================
-- VIGIL — GEM refresh + We Love Foundation + GEM LATAM marker
-- Idempotent. Safe for production re-apply.
-- Prompt 59 — no schema changes; Venezuela map bounds untouched.
-- ============================================================

-- 1) Refresh primary GEM directory row (descriptions + /donate)
UPDATE organizations SET
  type = 'donation',
  description_es = 'Socio privado oficial del Departamento de Estado de EE.UU. para la respuesta al terremoto. Distribuciones diarias de ayuda en los estados más afectados, sede permanente GEM LATAM en La Guaira, y centro logístico en Doral, Florida. Más de 55.000 sobrevivientes atendidos con kits completos.',
  description_en = 'Official U.S. State Department private partner for the earthquake response. Daily aid distributions across the hardest-hit states, permanent GEM LATAM headquarters in La Guaira, and logistics hub in Doral, Florida. 55,000+ survivors served with full kits.',
  website = 'https://www.globalempowermentmission.org',
  donation_link = 'https://www.globalempowermentmission.org/donate',
  donation_instructions = 'Donate online or check supply intake options on the official /donate page. Confirm hours before traveling to Doral.',
  verified = true,
  active = true,
  approved_by_admin = true
WHERE name = 'Global Empowerment Mission (GEM)';

-- 2) Refresh GEM Doral diaspora row (hours verify flag retained; no VE map punch)
UPDATE organizations SET
  description_es = 'Centro logístico GEM en Doral, Florida — recepción de suministros donados desde EE.UU. para la respuesta en Venezuela. ⚠️ Verificar horarios de recepción antes de trasladarse.',
  description_en = 'GEM logistics hub in Doral, Florida — aid intake for supplies donated from the U.S. for the Venezuela response. ⚠️ Confirm intake hours before traveling.',
  website = 'https://www.globalempowermentmission.org',
  donation_link = 'https://www.globalempowermentmission.org/donate',
  donation_instructions = '1850 NW 84th Ave, Suite 100, Doral, FL 33126 — confirm current intake hours with GEM directly. Use their /donate page for supply donation options.',
  verified = true,
  active = true,
  approved_by_admin = true
WHERE name = 'Global Empowerment Mission (GEM) — Doral'
  AND region_scope = 'usa_diaspora';

-- 3) We Love Foundation (I Love Venezuela) — directory only; no false Vigil partnership claim
INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email, donation_link, donation_instructions,
  lat, lng, location_label, verified, active, approved_by_admin, trusted_source,
  region_scope
)
SELECT
  'We Love Foundation (I Love Venezuela)',
  'donation',
  'USA',
  'Fundación de la diáspora venezolana, socio operativo de GEM en cada distribución de ayuda en Venezuela. Canaliza el apoyo de la comunidad venezolana en EE.UU. hacia las familias afectadas.',
  'Venezuelan diaspora foundation and GEM''s operating partner on every aid distribution in Venezuela. Channels U.S. Venezuelan community support to affected families.',
  'https://www.welove.foundation',
  NULL,
  NULL,
  'https://www.welove.foundation',
  'Donate via the official We Love Foundation website. Verify the URL before giving.',
  NULL,
  NULL,
  'Diaspora — operating with GEM in Venezuela',
  true,
  true,
  true,
  false,
  'venezuela'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations
  WHERE name = 'We Love Foundation (I Love Venezuela)'
);

-- 4) GEM LATAM HQ — La Guaira city-center approximate marker (honest label)
-- Coordinates are intentional city-center approximation, NOT a street address.
INSERT INTO map_markers (
  type, category, title, description,
  lat, lng, urgent, status, verified, source, region_scope
)
SELECT
  'collection_point',
  'other',
  'GEM LATAM — Sede La Guaira (aprox.)',
  'Sede permanente GEM LATAM — ubicación exacta vía globalempowermentmission.org. Marcador aproximado al centro de La Guaira (no es dirección de calle).',
  10.5994,
  -66.9346,
  false,
  'active',
  true,
  'GEM public communications',
  'venezuela'
WHERE NOT EXISTS (
  SELECT 1 FROM map_markers
  WHERE title = 'GEM LATAM — Sede La Guaira (aprox.)'
);
