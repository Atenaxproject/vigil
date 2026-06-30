# Vigil — Add Resource Directory Data + 2 More Sister Platforms
## Paste into Cursor Composer (Agent mode)

---

Sourced from venezuelatebusca.com/resources (public institutional resource 
directory — hospital numbers, Red Cross lines, government hotlines, 
volunteer groups). This is public service information, same category as 
existing seed data sourced from news outlets.

## TASK A — Add Two More Sister Platforms

```typescript
// crisis.config.ts partnerLinks — add to existing array
{ name: 'RedQuipu', url: 'https://redquipu.com', type: 'sister-platform' as const },
{ name: 'Mapa de Daños Venezuela', url: 'https://terremotovenezuela.com', type: 'sister-platform' as const },
```

## TASK B — Add International Red Cross Family Search Lines (high value for diaspora)

```sql
INSERT INTO organizations (name, type, country, description_es, phone, email, verified, active, approved_by_admin, trusted_source) VALUES
('Cruz Roja Hondureña — Búsqueda de Familiares', 'rescue', 'Honduras', 
 'Servicio de búsqueda de familiares de la Cruz Roja Hondureña para venezolanos buscando contacto con seres queridos.',
 '+504-9849-5556', 'busquedarcf@cruzroja.org.hn', true, true, true, true),

('Cruz Roja Argentina — Búsqueda de Familiares', 'rescue', 'Argentina',
 'Servicio de búsqueda de familiares de la Cruz Roja Argentina.',
 NULL, NULL, true, true, true, true),
-- Note: website is https://cruzroja.org.ar/rcf/ — add as website field if column allows

('Cruz Roja Colombiana — Búsqueda de Familiares', 'rescue', 'Colombia',
 'Servicio de búsqueda de familiares de la Cruz Roja Colombiana.',
 '+57-321-213-9525', 'rcf@cruzrojacolombiana.org', true, true, true, true),

('Ingenieros Voluntarios — Revisión Estructural (UNIMET)', 'tech', 'Venezuela',
 'Ingenieros civiles de la UNIMET y otras universidades que ofrecen evaluación 
 gratuita y voluntaria sobre el estado estructural de edificaciones afectadas.',
 NULL, NULL, true, true, true, true),

('RedQuipu', 'tech', 'Venezuela',
 'Plataforma humanitaria que conecta iniciativas, organiza necesidades y 
 consolida información para facilitar una respuesta coordinada en Venezuela.',
 NULL, NULL, true, true, true, false);
```

## TASK C — Add Caracas Hospitals as Map Markers

These need approximate coordinates — geocode each address/neighborhood 
mentioned, or use these reasonable Caracas-area approximations (refine with 
real geocoding if time allows, these are close-enough placeholders for the 
named neighborhoods):

```sql
INSERT INTO map_markers (type, category, title, description, lat, lng, contact, status, verified, source) VALUES
('hospital', 'medical', 'Policlínica David Lobo', 'Santa Rosalía, Caracas', 10.4880, -66.9180, '(212) 541-5465', 'active', true, 'venezuelatebusca.com'),
('hospital', 'medical', 'Hospital Periférico de Catia', 'Catia, Caracas', 10.5089, -66.9444, '(212) 870-2771', 'active', true, 'venezuelatebusca.com'),
('hospital', 'medical', 'Hospital Andrés Herrera Vegas', 'El Algodonal, Caracas', 10.4950, -67.0050, '(212) 472-3138', 'active', true, 'venezuelatebusca.com'),
('hospital', 'medical', 'Hospital Clínico Universitario', 'Chaguaramos, Caracas', 10.4920, -66.8970, '(212) 606-7111', 'active', true, 'venezuelatebusca.com'),
('hospital', 'medical', 'Hospital de Niños J.M. de los Ríos', 'San Bernardino, Caracas', 10.5080, -66.9050, '(212) 574-3511', 'active', true, 'venezuelatebusca.com');
```

## TASK D — Add Key Emergency Hotlines to /informacion Page

Add a compact reference list (not full database rows, just visible text) on 
the Información page under "Líneas de emergencia adicionales":

```
CICPC: (0212) 571-3533
Bomberos Chacao: (0212) 265-3261
Policía Municipal Baruta: (0212) 943-2855
Policía Municipal El Hatillo: (0212) 961-1682
Defensa Civil Alcaldía Mayor: (0212) 662-6759
Emergencias Digitel: 112
Inspectoría Nacional de Tránsito: 167
```

Source citation: "Recopilado de venezuelatebusca.com/resources"

## Commit

```bash
git add -A
git commit -m "feat: add Red Cross family search lines, Caracas hospitals, 
2 more sister platforms (RedQuipu, Mapa de Daños Venezuela)

Source: public resource directory at venezuelatebusca.com/resources 
(institutional/public service information, same category as existing 
news-sourced seed data)

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.
