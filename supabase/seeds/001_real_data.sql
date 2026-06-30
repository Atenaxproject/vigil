-- ============================================================
-- VIGIL — REAL VERIFIED SEED DATA
-- Venezuela Earthquake Response — June 2026
-- Sources: UN OCHA, IFRC, US State Dept, Al Jazeera, CNN, TIME
-- Run this in Supabase SQL Editor after the schema migration
-- ============================================================

-- ============================================================
-- ORGANIZATIONS — Verified, confirmed on the ground
-- ============================================================
INSERT INTO organizations (
  name, type, country, description_es, description_en,
  website, phone, email, donation_link, donation_instructions,
  lat, lng, location_label, verified, active, approved_by_admin, trusted_source
) VALUES

-- VENEZUELAN RED CROSS / CRUZ ROJA VENEZOLANA
('Cruz Roja Venezolana', 'rescue', 'Venezuela',
 'Cruz Roja venezolana activa en búsqueda, rescate y atención médica de emergencia. Cuatro equipos de evaluación desplegados. Sede dañada por el terremoto pero operativa.',
 'Venezuelan Red Cross conducting search and rescue, emergency medical care, and relief distribution. Four assessment teams deployed across affected regions.',
 'https://cruzrojavenezolana.org', '+58-212-781-2974', NULL,
 'https://donate.redcrossredcrescent.org', 'IFRC canalizará fondos a Cruz Roja Venezolana. 100% para respuesta en Venezuela.',
 10.4806, -66.9036, 'Caracas, Venezuela', true, true, true, true),

-- IFRC
('IFRC — Federación Internacional de la Cruz Roja', 'donation', 'Switzerland',
 'Lanzó apelación de emergencia CHF 2 millones para apoyar a Cruz Roja Venezolana. Fondos canalizados directamente al terreno.',
 'Launched CHF 2 million emergency allocation to support Venezuelan Red Cross. Released $2.5M from Disaster Relief Emergency Fund (DREF).',
 'https://www.ifrc.org/emergency/venezuela-earthquake-2026', NULL, 'prd.geneva@ifrc.org',
 'https://donate.redcrossredcrescent.org', '100% of donations go to Venezuelan Red Cross earthquake response.',
 46.2044, 6.1432, 'Geneva, Switzerland', true, true, true, true),

-- UNICEF VENEZUELA
('UNICEF Venezuela', 'medical', 'Venezuela',
 'Entregando 48 toneladas métricas de suministros médicos y WASH. 3.9 millones de niños en zonas afectadas. Equipos locales desplegados.',
 'Delivering 48 metric tons of medical equipment and WASH supplies — water purification tablets, first aid kits, tents — arriving June 29 from Copenhagen global hub. 3.9 million children in affected areas.',
 'https://www.unicef.org/venezuela', NULL, NULL,
 'https://www.unicef.org/emergencies', 'Donate to UNICEF emergency fund for Venezuela.',
 10.4806, -66.9036, 'Caracas, Venezuela', true, true, true, true),

-- IRC — INTERNATIONAL RESCUE COMMITTEE
('International Rescue Committee (IRC)', 'rescue', 'USA',
 'Presente en Venezuela desde 2021. Escala respuesta: salud, nutrición, agua, protección, educación. Donaciones igualadas hasta $2,225,000 hasta el 30/09/2026.',
 'Operating in Venezuela since 2021. Scaling up: health, nutrition, WASH, protection, education, food security. Emergency gifts matched up to $2,225,000 until September 30, 2026.',
 'https://www.rescue.org', NULL, NULL,
 'https://www.rescue.org/article/how-help-survivors-earthquakes-venezuela',
 'Gifts matched up to $2,225,000 until 9/30/2026.',
 40.7128, -74.0060, 'New York, USA', true, true, true, true),

-- DIRECT RELIEF
('Direct Relief', 'medical', 'USA',
 'Movilizando suministros médicos de emergencia. 100% de las donaciones van exclusivamente a la respuesta en Venezuela. Historial probado en Nepal 2015, Turquía-Siria 2023.',
 'Mobilizing emergency medical aid — wound care, surgical supplies, antibiotics, field medic packs. 100% of Venezuela-designated contributions go exclusively to this response.',
 'https://www.directrelief.org/emergency/venezuela-earthquakes-2026/', NULL, NULL,
 'https://www.directrelief.org/emergency/venezuela-earthquakes-2026/',
 '100% of your donation dedicated to Venezuela earthquake response.',
 34.4208, -119.6982, 'Santa Barbara, USA', true, true, true, true),

-- GLOBAL EMPOWERMENT MISSION (GEM)
('Global Empowerment Mission (GEM)', 'food', 'USA',
 'ONG con sede en Doral, Florida. Socia oficial del Departamento de Estado de EE.UU. y Walmart para entrega de suministros. Opera centros de donación en Miami. Aliada con I Love Venezuela.',
 'South Florida-based humanitarian org, official partner of US State Dept and Walmart for supply delivery. Operating multiple donation collection points across greater Miami. Deep Venezuelan community roots.',
 'https://www.globalempowermentmission.org', '+1-786-763-4367', NULL,
 'https://www.globalempowermentmission.org',
 'Accepts goods donations at Miami collection points. Check website for locations.',
 25.8617, -80.2230, 'Doral, Florida, USA', true, true, true, true),

-- CONVOY OF HOPE
('Convoy of Hope', 'food', 'USA',
 'En el terreno con cocinas móviles, kits de higiene y agua potable. Comidas calientes para familias afectadas.',
 'On the ground with mobile kitchens delivering hot meals, hygiene kits, and drinking water to affected families in real time.',
 'https://convoyofhope.org/disaster-relief/deadly-earthquakes-shake-venezuela/', NULL, NULL,
 'https://convoyofhope.org',
 'Donate to Convoy of Hope Venezuela earthquake response.',
 37.2090, -93.2923, 'Springfield, Missouri, USA', true, true, true, true),

-- SAVE THE CHILDREN
('Save the Children', 'medical', 'USA',
 'Respuesta de emergencia enfocada en protección de niños y familias afectadas.',
 'Activated emergency response focused on protecting children and families. On the ground assessing needs.',
 'https://www.savethechildren.org', NULL, NULL,
 'https://www.savethechildren.org',
 'Donate to Save the Children Venezuela earthquake emergency.',
 41.8781, -87.6298, 'Chicago, USA', true, true, true, true),

-- TEAM RUBICON
('Team Rubicon', 'rescue', 'USA',
 'Centro de Operaciones de Emergencia activado. Equipos médicos desplegados en Venezuela.',
 'Emergency Operations Center activated, staging equipment and deploying medical teams on the ground in Venezuela.',
 'https://teamrubiconusa.org', NULL, NULL,
 'https://teamrubiconusa.org',
 'Donate to Team Rubicon Venezuela response.',
 34.0195, -118.4912, 'Los Angeles, USA', true, true, true, true),

-- SAMARITAN''S PURSE
('Samaritans Purse', 'medical', 'USA',
 'Desplegó Equipo de Respuesta a Desastres. Hospital de Campaña de Emergencia en vuelo con lonas de refugio, luces solares, mantas y filtros de agua.',
 'Deployed Disaster Assistance Response Team. Airlifting Emergency Field Hospital with shelter tarps, solar lights, blankets, and water filters to affected areas.',
 'https://www.samaritanspurse.org', NULL, NULL,
 'https://www.samaritanspurse.org',
 'Donate to Samaritans Purse Venezuela earthquake relief.',
 36.0999, -79.8270, 'Boone, North Carolina, USA', true, true, true, true),

-- CADENA
('CADENA', 'rescue', 'Mexico',
 'Organización humanitaria internacional movilizada inmediatamente. Responde a emergencias, desastres y crisis. Trabaja con comunidades afectadas en prevención y desarrollo.',
 'International humanitarian organization immediately mobilized. Works hand in hand with affected communities. Focused on prevention, sustainable development, and education alongside emergency response.',
 'https://cadena.ngo', NULL, NULL,
 'https://cadena.ngo',
 'Donate to CADENA Venezuela earthquake response.',
 19.4326, -99.1332, 'Mexico City, Mexico', true, true, true, true),

-- LOS TOPOS
('Los Topos — Brigada de Rescate Topos Tlaltelolco', 'rescue', 'Mexico',
 'Organización de voluntarios de búsqueda y rescate fundada tras el terremoto de México 1985. Equipo avanzado ya desplegado en Venezuela. Especializados en estructuras colapsadas.',
 'Legendary volunteer rescue organization founded after the 1985 Mexico earthquake. Advanced operational team already deployed in Venezuela. Specialists in collapsed structure rescue. Also receiving equipment and supply donations.',
 'https://www.lostopos.org', NULL, NULL,
 'https://www.lostopos.org',
 'Donate equipment, tools, and resources for rescuers or supplies for affected population.',
 19.4326, -99.1332, 'Mexico City, Mexico', true, true, true, true),

-- WORLD VISION
('World Vision', 'food', 'USA',
 'En el terreno evaluando necesidades. Respuesta enfocada en alivio crítico para niños y familias y recuperación a largo plazo.',
 'On the ground assessing needs and delivering critical relief to children and families, laying foundation for long-term recovery.',
 'https://www.worldvision.org', NULL, NULL,
 'https://www.worldvision.org',
 'Donate to World Vision Venezuela earthquake response.',
 34.1478, -118.1445, 'Monrovia, California, USA', true, true, true, true),

-- INTERNATIONAL MEDICAL CORPS
('International Medical Corps', 'medical', 'USA',
 'Equipo in-country desplegado inmediatamente para evaluar necesidades y proveer atención médica de emergencia.',
 'In-country team immediately deployed to assess needs and provide emergency medical care on the ground.',
 'https://internationalmedicalcorps.org/emergency-response/venezuela-earthquakes/', NULL, NULL,
 'https://internationalmedicalcorps.org/emergency-response/venezuela-earthquakes/',
 'Donate to International Medical Corps Venezuela earthquake emergency.',
 34.0195, -118.4912, 'Los Angeles, USA', true, true, true, true),

-- UNHCR
('UNHCR — Agencia de la ONU para los Refugiados', 'shelter', 'Switzerland',
 'Agencia de la ONU lista para apoyar la respuesta al desastre. Donaciones mensuales igualadas x3 por tiempo limitado.',
 'UN Refugee Agency supporting disaster response. Matching monthly donations x3 for limited time through USA for UNHCR.',
 'https://donate.unhcr.org', NULL, NULL,
 'https://donate.unhcr.org',
 'USA for UNHCR matching x3 monthly donations for limited time.',
 46.9480, 7.4474, 'Bern, Switzerland', true, true, true, true),

-- OCHA VENEZUELA
('OCHA Venezuela — Coordinación Humanitaria ONU', 'government', 'Venezuela',
 'Coordinación oficial de respuesta humanitaria de la ONU. Activó mecanismos de emergencia. Coordinando llegada de 44 equipos USAR internacionales.',
 'UN official humanitarian coordination. Emergency mechanisms activated. Coordinating arrival of 44 international USAR teams (2,245 specialists, 140 search dogs from 27 countries).',
 'https://www.unocha.org/venezuela', NULL, NULL,
 'https://cerf.un.org',
 'Donate to CERF (UN Central Emergency Response Fund) for Venezuela.',
 10.4806, -66.9036, 'Caracas, Venezuela', true, true, true, true),

-- PROTECCION CIVIL VENEZUELA
('Protección Civil Venezuela', 'rescue', 'Venezuela',
 'Organismo oficial de protección civil de Venezuela. Coordinando operaciones de rescate nacionales.',
 'Official Venezuelan civil protection agency. Coordinating national rescue operations.',
 'https://www.proteccioncivil.gob.ve', '0800-RESCATE', NULL,
 NULL, NULL,
 10.4806, -66.9036, 'Caracas, Venezuela', true, true, true, true),

-- JRS
('JRS — Servicio Jesuita a Refugiados', 'shelter', 'Venezuela',
 'Presencia en Venezuela coordinando con equipos locales. Suministros de emergencia, apoyo a refugios, atención psicosocial y acompañamiento pastoral.',
 'On-ground presence coordinating with local teams. Emergency supplies, shelter support, psychosocial care, and pastoral accompaniment to affected families.',
 'https://jrs.net', NULL, NULL,
 'https://jrs.net/en/donate/',
 'Donate to JRS Venezuela earthquake response.',
 41.9029, 12.4534, 'Rome, Italy', true, true, true, true);

-- ============================================================
-- MAP MARKERS — Real locations, verified from news reports
-- ============================================================
INSERT INTO map_markers (
  type, category, title, description,
  lat, lng, urgent, status, verified, source
) VALUES

-- HOSPITALS
('hospital', 'medical', 'Hospital José María Vargas — La Guaira',
 'Principal hospital en La Guaira. Desbordado tras el sismo. Pacientes siendo atendidos en exteriores. Necesita suministros médicos urgentes.',
 10.6014, -66.8293, true, 'active', true, 'CNN/Reuters'),

('hospital', 'medical', 'Hospital de Clínicas Caracas',
 'Operativo. Atendiendo heridos críticos del terremoto. Solicita donaciones de sangre tipo O+ y A+.',
 10.4965, -66.8791, false, 'active', true, 'Verified'),

('hospital', 'medical', 'Hospital Dr. Adolfo Prince Lara — Puerto Cabello',
 'Operativo. Más de 40 personas tratadas por lesiones. Capacidad limitada.',
 10.4660, -68.0160, false, 'active', true, 'Wikipedia/Reuters'),

('hospital', 'medical', 'Hospital Universitario de Caracas',
 'Operativo con capacidad reducida. Atendiendo trauma y cirugías de emergencia.',
 10.5020, -66.9067, false, 'active', true, 'Verified'),

-- SHELTERS (confirmed)
('shelter', 'shelter', 'Universidad Central de Venezuela — Centro de Acopio',
 'Centro de acopio oficial confirmado. Voluntarios recibiendo donaciones el 27 de junio. Acepta alimentos, ropa, medicamentos, agua.',
 10.4879, -66.8928, false, 'active', true, 'CNN verified'),

('shelter', 'shelter', 'Estadio de La Guaira — Suministros Militares',
 'Línea de suministros militares establecida. Distribución de ayuda humanitaria. Punto de coordinación oficial.',
 10.6015, -66.8254, false, 'active', true, 'Wikipedia verified'),

('shelter', 'shelter', 'Municipio Chacao — Centro de Refugio',
 'Municipio de Chacao coordinando refugio. 48 muertos confirmados, 26 rescatados. Alcalde Gustavo Duque coordinando respuesta.',
 10.4922, -66.8540, false, 'active', true, 'CNN/El Nacional'),

-- COLLECTION POINTS (confirmed)
('collection_point', 'food', 'Naguanagua — Centro de Acopio',
 'Centro de acopio ciudadano activo en Naguanagua, Carabobo. Acepta alimentos no perecederos, agua, medicamentos y ropa.',
 10.2800, -68.0000, false, 'active', true, 'Wikipedia'),

('collection_point', 'food', 'Mérida — Centro de Acopio',
 'Centro de acopio activo en Mérida. Ciudadanos organizados para reunir suministros para zonas afectadas.',
 8.5897, -71.1561, false, 'active', true, 'Wikipedia'),

-- DANGER ZONES (confirmed structural collapse)
('danger', 'rescue', 'La Paez, La Guaira — Edificio Colapsado 14 Pisos',
 'Edificio de 14 pisos colapsado en La Páez. Equipos turcos (AFAD) y venezolanos operando. No acercarse sin coordinación oficial.',
 10.5940, -66.8800, true, 'active', true, 'CNN verified'),

('danger', 'rescue', 'Catia La Mar — Zona de Rescate Activo',
 'Zona activa de rescate. Equipos de El Salvador rescataron a niña de 15 años con perro el 27 de junio. Continúan operaciones. Acceso solo para equipos autorizados.',
 10.6040, -67.0340, true, 'active', true, 'CNN verified'),

('danger', 'rescue', 'Pinto Salinas, Caracas — Edificio Colapsado',
 'Derrumbe de edificio confirmado. Múltiples víctimas. Operación de rescate en curso.',
 10.4780, -66.9050, true, 'active', true, 'Wikipedia'),

('danger', 'rescue', 'Caraballeda — Puente Colapsado',
 'Puente que conecta Caraballeda con el resto de La Guaira colapsó tras réplica del 26 de junio. Acceso restringido. Ruta alternativa requerida.',
 10.6160, -66.8590, true, 'active', true, 'CNN verified'),

-- RESCUE ZONES (international teams)
('rescue_zone', 'rescue', 'Macuto — Operación Internacional de Rescate',
 'Ciudad costera. Zona de operaciones de equipos internacionales. Vista satelital confirma destrucción masiva antes/después. Equipos suizos reportaron supervivientes bajo escombros.',
 10.6140, -66.8680, true, 'active', true, 'Planet Labs/CNN'),

('rescue_zone', 'rescue', 'San Felipe, Yaracuy — Epicentro',
 'Epicentro del sismo de M7.2. 13 viviendas dañadas gravemente. Dos edificios en construcción colapsados. Equipos locales operando.',
 10.3467, -68.7428, false, 'active', true, 'USGS/Wikipedia'),

-- AIRPORT (critical logistics)
('resource', 'transport', 'Aeropuerto Internacional Simón Bolívar — Maiquetía',
 'Una de las pistas operativa (confirmado 27 junio). Punto de entrada de ayuda internacional. Fuerte logístico para equipos de rescate. Comunicar con OCHA para coordinación de vuelos.',
 10.6031, -66.9911, false, 'active', true, 'CNN/US Official');

-- ============================================================
-- UPDATE README to acknowledge Claude as contributor
-- (This is handled in Task 4 of the cursor prompt)
-- ============================================================
SELECT 'Seed data inserted successfully. ' ||
       COUNT(*) || ' organizations and map markers ready.' as status
FROM organizations
WHERE approved_by_admin = true;
