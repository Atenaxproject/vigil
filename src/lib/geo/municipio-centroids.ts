/**
 * Venezuela municipio + estado centroids (76 §4 follow-up).
 *
 * SOURCE: OCHA / Humanitarian Data Exchange (HDX) — "Venezuela (Bolivarian
 * Republic of) — Subnational Administrative Boundaries" (COD-AB), dataset
 * `cod-ab-ven`, version 01, https://data.humdata.org/dataset/cod-ab-ven
 * License: Creative Commons Attribution for Intergovernmental Organisations
 * (CC BY-IGO) — http://creativecommons.org/licenses/by/3.0/igo/legalcode
 * Extracted from ven_admin2.geojson / ven_admin1.geojson (2026-07-25). Each
 * centroid is the value OCHA publishes as center_lat/center_lon per admin
 * unit — the authoritative source, not a computed approximation on our side.
 *
 * Coverage: all 335 municipios (OCHA's own count) + 25 admin-1 units
 * (24 estados + Dependencias Federales).
 *
 * Why this exists: for a missing-person record flagged as a minor, the public
 * view nulls precise/approximate coordinates (76 REV2 §2/§3) — reducing
 * "reach" while keeping "recognize." That left minors with no marker on the
 * crisis map at all. Rendering at the municipio centroid restores discovery
 * at a deliberately coarse resolution, matching the honest-approximation
 * treatment already used elsewhere (e.g. jittered coordinates).
 *
 * Names are OCHA's official admin names, which are often longer than the
 * short/colloquial forms already stored in missing_persons.municipio (see
 * src/lib/venezuela-geo.ts, itself incomplete for several estados — a
 * separate, pre-existing gap noted here but not fixed by this file). The
 * lookup below normalizes accents/case and falls back to a same-estado
 * substring match, then a small alias table for known renames/ambiguous
 * cases, before giving up to the estado-level centroid.
 */

export interface MunicipioCentroid {
  estado: string
  municipio: string
  lat: number
  lng: number
  pcode: string
}

export interface EstadoCentroid {
  estado: string
  lat: number
  lng: number
  pcode: string | null
}

/** All 335 municipios, OCHA official names. */
export const MUNICIPIO_CENTROIDS: MunicipioCentroid[] = [
  { estado: 'Amazonas', municipio: 'Autónomo Alto Orinoco', lat: 2.822806, lng: -64.937386, pcode: 'VE0201' },
  { estado: 'Amazonas', municipio: 'Autónomo Atabapo', lat: 3.782062, lng: -66.815433, pcode: 'VE0202' },
  { estado: 'Amazonas', municipio: 'Autónomo Atures', lat: 5.721256, lng: -67.423308, pcode: 'VE0203' },
  { estado: 'Amazonas', municipio: 'Autónomo Autana', lat: 4.945191, lng: -67.431422, pcode: 'VE0204' },
  { estado: 'Amazonas', municipio: 'Autónomo Maroa', lat: 2.614275, lng: -66.975551, pcode: 'VE0205' },
  { estado: 'Amazonas', municipio: 'Autónomo Rio Negro', lat: 1.760126, lng: -66.245392, pcode: 'VE0207' },
  { estado: 'Amazonas', municipio: 'Manapiare', lat: 5.033668, lng: -66.155981, pcode: 'VE0206' },
  { estado: 'Anzoátegui', municipio: 'Anaco', lat: 9.302956, lng: -64.492131, pcode: 'VE0301' },
  { estado: 'Anzoátegui', municipio: 'Aragua', lat: 9.28597, lng: -64.869764, pcode: 'VE0302' },
  { estado: 'Anzoátegui', municipio: 'Diego Bautista Urbaneja', lat: 10.29145, lng: -64.744738, pcode: 'VE0321' },
  { estado: 'Anzoátegui', municipio: 'Fernando de Peñalver', lat: 9.962234, lng: -64.984234, pcode: 'VE0303' },
  { estado: 'Anzoátegui', municipio: 'Francisco de Miranda', lat: 8.44612, lng: -64.207411, pcode: 'VE0305' },
  { estado: 'Anzoátegui', municipio: 'Francisco del Carmen Carvajal', lat: 9.879541, lng: -65.670467, pcode: 'VE0304' },
  { estado: 'Anzoátegui', municipio: 'Guanta', lat: 10.217116, lng: -64.548083, pcode: 'VE0306' },
  { estado: 'Anzoátegui', municipio: 'Independencia', lat: 8.526761, lng: -63.453267, pcode: 'VE0307' },
  { estado: 'Anzoátegui', municipio: 'José Gregorio Monagas', lat: 8.212445, lng: -64.842905, pcode: 'VE0310' },
  { estado: 'Anzoátegui', municipio: 'Juan Antonio Sotillo', lat: 10.168715, lng: -64.534889, pcode: 'VE0308' },
  { estado: 'Anzoátegui', municipio: 'Juan Manuel Cajigal', lat: 9.621651, lng: -65.223227, pcode: 'VE0309' },
  { estado: 'Anzoátegui', municipio: 'Libertad', lat: 9.806264, lng: -64.551581, pcode: 'VE0311' },
  { estado: 'Anzoátegui', municipio: 'Manuel Ezequiel Bruzual', lat: 9.868888, lng: -65.36567, pcode: 'VE0312' },
  { estado: 'Anzoátegui', municipio: 'Pedro María Freites', lat: 9.464092, lng: -64.135791, pcode: 'VE0313' },
  { estado: 'Anzoátegui', municipio: 'Piritu', lat: 9.931815, lng: -65.069092, pcode: 'VE0314' },
  { estado: 'Anzoátegui', municipio: 'San José de Guanipa', lat: 8.744993, lng: -63.87417, pcode: 'VE0315' },
  { estado: 'Anzoátegui', municipio: 'San Juan de Capistrano', lat: 10.083088, lng: -65.416999, pcode: 'VE0316' },
  { estado: 'Anzoátegui', municipio: 'Santa Ana', lat: 9.255719, lng: -64.653966, pcode: 'VE0317' },
  { estado: 'Anzoátegui', municipio: 'Simón Bolívar', lat: 9.953282, lng: -64.688003, pcode: 'VE0318' },
  { estado: 'Anzoátegui', municipio: 'Simón Rodríguez', lat: 8.756974, lng: -64.146841, pcode: 'VE0319' },
  { estado: 'Anzoátegui', municipio: 'Sir Arthur Mc Gregor', lat: 9.181493, lng: -64.993461, pcode: 'VE0320' },
  { estado: 'Apure', municipio: 'Achaguas', lat: 7.229425, lng: -68.513183, pcode: 'VE0401' },
  { estado: 'Apure', municipio: 'Biruaca', lat: 7.81232, lng: -67.672719, pcode: 'VE0402' },
  { estado: 'Apure', municipio: 'Muñoz', lat: 7.59643, lng: -69.302476, pcode: 'VE0403' },
  { estado: 'Apure', municipio: 'Pedro Camejo', lat: 6.901608, lng: -67.546355, pcode: 'VE0405' },
  { estado: 'Apure', municipio: 'Páez', lat: 7.362345, lng: -70.085958, pcode: 'VE0404' },
  { estado: 'Apure', municipio: 'Rómulo Gallegos', lat: 6.798433, lng: -69.40572, pcode: 'VE0406' },
  { estado: 'Apure', municipio: 'San Fernando', lat: 7.543703, lng: -66.944594, pcode: 'VE0407' },
  { estado: 'Aragua', municipio: 'Bolívar', lat: 10.250126, lng: -67.408168, pcode: 'VE0501' },
  { estado: 'Aragua', municipio: 'Camatagua', lat: 9.822915, lng: -66.902289, pcode: 'VE0502' },
  { estado: 'Aragua', municipio: 'Ezequiel Zamora', lat: 10.03587, lng: -67.492697, pcode: 'VE0516' },
  { estado: 'Aragua', municipio: 'Francisco Linares Alcántara', lat: 10.201377, lng: -67.577792, pcode: 'VE0517' },
  { estado: 'Aragua', municipio: 'Girardot', lat: 10.359174, lng: -67.584213, pcode: 'VE0503' },
  { estado: 'Aragua', municipio: 'José Félix Ribas', lat: 10.214033, lng: -67.341737, pcode: 'VE0505' },
  { estado: 'Aragua', municipio: 'José Rafael Revenga', lat: 10.264141, lng: -67.246675, pcode: 'VE0506' },
  { estado: 'Aragua', municipio: 'José Ángel Lamas', lat: 10.160353, lng: -67.507213, pcode: 'VE0504' },
  { estado: 'Aragua', municipio: 'Libertador', lat: 10.169528, lng: -67.569304, pcode: 'VE0507' },
  { estado: 'Aragua', municipio: 'Mario Briceño Iragorri', lat: 10.313931, lng: -67.636849, pcode: 'VE0508' },
  { estado: 'Aragua', municipio: 'Ocumare de la Costa de Oro', lat: 10.41603, lng: -67.756396, pcode: 'VE0518' },
  { estado: 'Aragua', municipio: 'San Casimiro', lat: 9.977789, lng: -66.903025, pcode: 'VE0509' },
  { estado: 'Aragua', municipio: 'San Sebastián', lat: 9.965561, lng: -67.201019, pcode: 'VE0510' },
  { estado: 'Aragua', municipio: 'Santiago Mariño', lat: 10.360544, lng: -67.480237, pcode: 'VE0511' },
  { estado: 'Aragua', municipio: 'Santos Michelena', lat: 10.191705, lng: -67.154831, pcode: 'VE0512' },
  { estado: 'Aragua', municipio: 'Sucre', lat: 10.160353, lng: -67.448911, pcode: 'VE0513' },
  { estado: 'Aragua', municipio: 'Tovar', lat: 10.424953, lng: -67.391341, pcode: 'VE0514' },
  { estado: 'Aragua', municipio: 'Urdaneta', lat: 9.616961, lng: -66.694389, pcode: 'VE0515' },
  { estado: 'Barinas', municipio: 'Alberto Arvelo Torrealba', lat: 8.834262, lng: -70.043696, pcode: 'VE0601' },
  { estado: 'Barinas', municipio: 'Andrés Eloy Blanco', lat: 7.470579, lng: -71.422932, pcode: 'VE0612' },
  { estado: 'Barinas', municipio: 'Antonio José de Sucre', lat: 8.177452, lng: -70.774715, pcode: 'VE0602' },
  { estado: 'Barinas', municipio: 'Arismendi', lat: 8.241354, lng: -68.293503, pcode: 'VE0603' },
  { estado: 'Barinas', municipio: 'Barinas', lat: 8.335135, lng: -70.090365, pcode: 'VE0604' },
  { estado: 'Barinas', municipio: 'Bolívar', lat: 8.804405, lng: -70.521651, pcode: 'VE0605' },
  { estado: 'Barinas', municipio: 'Cruz Paredes', lat: 8.878545, lng: -70.264023, pcode: 'VE0606' },
  { estado: 'Barinas', municipio: 'Ezequiel Zamora', lat: 7.810577, lng: -71.067719, pcode: 'VE0607' },
  { estado: 'Barinas', municipio: 'Obispos', lat: 8.405606, lng: -69.884346, pcode: 'VE0608' },
  { estado: 'Barinas', municipio: 'Pedraza', lat: 8.075314, lng: -70.26096, pcode: 'VE0609' },
  { estado: 'Barinas', municipio: 'Rojas', lat: 8.436614, lng: -69.646667, pcode: 'VE0610' },
  { estado: 'Barinas', municipio: 'Sosa', lat: 8.296786, lng: -69.291161, pcode: 'VE0611' },
  { estado: 'Bolívar', municipio: 'Angostura del Orinoco', lat: 7.881357, lng: -63.787684, pcode: 'VE0705' },
  { estado: 'Bolívar', municipio: 'Bolivariano Angostura', lat: 5.776101, lng: -63.488623, pcode: 'VE0707' },
  { estado: 'Bolívar', municipio: 'Caroní', lat: 8.164846, lng: -62.782735, pcode: 'VE0701' },
  { estado: 'Bolívar', municipio: 'Cedeño', lat: 6.770871, lng: -65.931251, pcode: 'VE0702' },
  { estado: 'Bolívar', municipio: 'El Callao', lat: 7.210322, lng: -61.768295, pcode: 'VE0703' },
  { estado: 'Bolívar', municipio: 'Gran Sabana', lat: 5.203238, lng: -61.598519, pcode: 'VE0704' },
  { estado: 'Bolívar', municipio: 'Padre Pedro Chien', lat: 8.00446, lng: -61.893965, pcode: 'VE0711' },
  { estado: 'Bolívar', municipio: 'Piar', lat: 7.304876, lng: -62.53579, pcode: 'VE0706' },
  { estado: 'Bolívar', municipio: 'Roscio', lat: 7.148232, lng: -62.121516, pcode: 'VE0708' },
  { estado: 'Bolívar', municipio: 'Sifontes', lat: 6.902726, lng: -61.056488, pcode: 'VE0709' },
  { estado: 'Bolívar', municipio: 'Sucre', lat: 5.971396, lng: -64.592654, pcode: 'VE0710' },
  { estado: 'Carabobo', municipio: 'Bejuma', lat: 10.225158, lng: -68.201528, pcode: 'VE0801' },
  { estado: 'Carabobo', municipio: 'Carlos Arvelo', lat: 9.983029, lng: -67.728785, pcode: 'VE0802' },
  { estado: 'Carabobo', municipio: 'Diego Ibarra', lat: 10.289662, lng: -67.69779, pcode: 'VE0803' },
  { estado: 'Carabobo', municipio: 'Guacara', lat: 10.262997, lng: -67.892046, pcode: 'VE0804' },
  { estado: 'Carabobo', municipio: 'Juan José Mora', lat: 10.440192, lng: -68.277863, pcode: 'VE0805' },
  { estado: 'Carabobo', municipio: 'Libertador', lat: 10.055529, lng: -68.132437, pcode: 'VE0806' },
  { estado: 'Carabobo', municipio: 'Los Guayos', lat: 10.151805, lng: -67.895172, pcode: 'VE0807' },
  { estado: 'Carabobo', municipio: 'Miranda', lat: 10.107504, lng: -68.353355, pcode: 'VE0808' },
  { estado: 'Carabobo', municipio: 'Montalbán', lat: 10.211555, lng: -68.321028, pcode: 'VE0809' },
  { estado: 'Carabobo', municipio: 'Naguanagua', lat: 10.284856, lng: -68.068837, pcode: 'VE0810' },
  { estado: 'Carabobo', municipio: 'Puerto Cabello', lat: 10.409384, lng: -68.019799, pcode: 'VE0811' },
  { estado: 'Carabobo', municipio: 'San Diego', lat: 10.270591, lng: -67.961879, pcode: 'VE0812' },
  { estado: 'Carabobo', municipio: 'San Joaquín', lat: 10.277068, lng: -67.797808, pcode: 'VE0813' },
  { estado: 'Carabobo', municipio: 'Valencia', lat: 10.023156, lng: -68.002597, pcode: 'VE0814' },
  { estado: 'Cojedes', municipio: 'Anzoátegui', lat: 9.646952, lng: -68.890536, pcode: 'VE0901' },
  { estado: 'Cojedes', municipio: 'Ezequiel Zamora', lat: 9.748425, lng: -68.657647, pcode: 'VE0908' },
  { estado: 'Cojedes', municipio: 'Girardot', lat: 8.876084, lng: -68.308394, pcode: 'VE0903' },
  { estado: 'Cojedes', municipio: 'Lima Blanco', lat: 9.834244, lng: -68.437257, pcode: 'VE0904' },
  { estado: 'Cojedes', municipio: 'Pao de San Juan Bautista', lat: 9.25827, lng: -68.117959, pcode: 'VE0905' },
  { estado: 'Cojedes', municipio: 'Ricaurte', lat: 9.306743, lng: -68.65362, pcode: 'VE0906' },
  { estado: 'Cojedes', municipio: 'Rómulo Gallegos', lat: 9.337226, lng: -68.489367, pcode: 'VE0907' },
  { estado: 'Cojedes', municipio: 'Tinaco', lat: 9.438, lng: -68.351142, pcode: 'VE0909' },
  { estado: 'Cojedes', municipio: 'Tinaquillo', lat: 9.940543, lng: -68.317009, pcode: 'VE0902' },
  { estado: 'Delta Amacuro', municipio: 'Antonio Díaz', lat: 8.619067, lng: -61.147807, pcode: 'VE1001' },
  { estado: 'Delta Amacuro', municipio: 'Casacoima', lat: 8.49888, lng: -62.090937, pcode: 'VE1002' },
  { estado: 'Delta Amacuro', municipio: 'Pedernales', lat: 9.704079, lng: -62.139193, pcode: 'VE1003' },
  { estado: 'Delta Amacuro', municipio: 'Tucupita', lat: 9.245765, lng: -61.713593, pcode: 'VE1004' },
  { estado: 'Distrito Capital', municipio: 'Libertador', lat: 10.472887, lng: -66.968828, pcode: 'VE0101' },
  { estado: 'Falcón', municipio: 'Acosta', lat: 11.16092, lng: -68.511692, pcode: 'VE1101' },
  { estado: 'Falcón', municipio: 'Bolívar', lat: 11.075109, lng: -69.647483, pcode: 'VE1102' },
  { estado: 'Falcón', municipio: 'Buchivacoa', lat: 10.81701, lng: -70.783673, pcode: 'VE1103' },
  { estado: 'Falcón', municipio: 'Cacique Manaure', lat: 10.99754, lng: -68.548713, pcode: 'VE1104' },
  { estado: 'Falcón', municipio: 'Carirubana', lat: 11.726982, lng: -70.014196, pcode: 'VE1105' },
  { estado: 'Falcón', municipio: 'Colina', lat: 11.313738, lng: -69.452245, pcode: 'VE1106' },
  { estado: 'Falcón', municipio: 'Dabajuro', lat: 10.708471, lng: -70.619341, pcode: 'VE1107' },
  { estado: 'Falcón', municipio: 'Democracia', lat: 10.879928, lng: -70.249232, pcode: 'VE1108' },
  { estado: 'Falcón', municipio: 'Falcón', lat: 11.852772, lng: -69.990561, pcode: 'VE1109' },
  { estado: 'Falcón', municipio: 'Federación', lat: 10.824693, lng: -69.577093, pcode: 'VE1110' },
  { estado: 'Falcón', municipio: 'Jacura', lat: 10.974369, lng: -68.898254, pcode: 'VE1111' },
  { estado: 'Falcón', municipio: 'Los Taques', lat: 11.837357, lng: -70.222145, pcode: 'VE1112' },
  { estado: 'Falcón', municipio: 'Mauroa', lat: 10.784167, lng: -70.990166, pcode: 'VE1113' },
  { estado: 'Falcón', municipio: 'Miranda', lat: 11.335464, lng: -69.859847, pcode: 'VE1114' },
  { estado: 'Falcón', municipio: 'Monseñor Iturriza', lat: 10.85527, lng: -68.661335, pcode: 'VE1115' },
  { estado: 'Falcón', municipio: 'Palmasola', lat: 10.670905, lng: -68.56014, pcode: 'VE1116' },
  { estado: 'Falcón', municipio: 'Petit', lat: 11.071367, lng: -69.405267, pcode: 'VE1117' },
  { estado: 'Falcón', municipio: 'Piritu', lat: 11.341482, lng: -68.989096, pcode: 'VE1118' },
  { estado: 'Falcón', municipio: 'San Francisco', lat: 11.158245, lng: -68.716268, pcode: 'VE1119' },
  { estado: 'Falcón', municipio: 'Silva', lat: 10.72731, lng: -68.403227, pcode: 'VE1120' },
  { estado: 'Falcón', municipio: 'Sucre', lat: 11.003327, lng: -69.869255, pcode: 'VE1121' },
  { estado: 'Falcón', municipio: 'Tocopero', lat: 11.491136, lng: -69.228072, pcode: 'VE1122' },
  { estado: 'Falcón', municipio: 'Unión', lat: 10.863435, lng: -69.250989, pcode: 'VE1123' },
  { estado: 'Falcón', municipio: 'Urumaco', lat: 11.125025, lng: -70.247324, pcode: 'VE1124' },
  { estado: 'Falcón', municipio: 'Zamora', lat: 11.312105, lng: -69.326088, pcode: 'VE1125' },
  { estado: 'Guárico', municipio: 'Camaguan', lat: 8.165804, lng: -67.558617, pcode: 'VE1201' },
  { estado: 'Guárico', municipio: 'Chaguaramas', lat: 9.332672, lng: -66.331235, pcode: 'VE1202' },
  { estado: 'Guárico', municipio: 'El Socorro', lat: 8.51485, lng: -65.648016, pcode: 'VE1203' },
  { estado: 'Guárico', municipio: 'Francisco de Miranda', lat: 8.622335, lng: -67.36219, pcode: 'VE1208' },
  { estado: 'Guárico', municipio: 'José Félix Ribas', lat: 9.387102, lng: -65.747053, pcode: 'VE1211' },
  { estado: 'Guárico', municipio: 'José Tadeo Monagas', lat: 9.644073, lng: -66.334346, pcode: 'VE1209' },
  { estado: 'Guárico', municipio: 'Juan Germán Roscio', lat: 9.776605, lng: -67.286001, pcode: 'VE1212' },
  { estado: 'Guárico', municipio: 'Julián Mellado', lat: 9.410193, lng: -67.124409, pcode: 'VE1207' },
  { estado: 'Guárico', municipio: 'Las Mercedes', lat: 8.421242, lng: -66.500416, pcode: 'VE1206' },
  { estado: 'Guárico', municipio: 'Leonardo Infante', lat: 8.641687, lng: -66.013124, pcode: 'VE1205' },
  { estado: 'Guárico', municipio: 'Ortiz', lat: 9.561169, lng: -67.566142, pcode: 'VE1210' },
  { estado: 'Guárico', municipio: 'Pedro Zaraza', lat: 9.229844, lng: -65.389387, pcode: 'VE1215' },
  { estado: 'Guárico', municipio: 'San Gerónimo de Guayabal', lat: 8.070747, lng: -67.18397, pcode: 'VE1204' },
  { estado: 'Guárico', municipio: 'San José de Guaribe', lat: 9.779715, lng: -65.828169, pcode: 'VE1213' },
  { estado: 'Guárico', municipio: 'Santa María de Ipire', lat: 8.472372, lng: -65.384487, pcode: 'VE1214' },
  { estado: 'La Guaira', municipio: 'Vargas', lat: 10.509378, lng: -67.236442, pcode: 'VE2401' },
  { estado: 'Lara', municipio: 'Andrés Eloy Blanco', lat: 9.670717, lng: -69.543536, pcode: 'VE1301' },
  { estado: 'Lara', municipio: 'Crespo', lat: 10.311668, lng: -69.169815, pcode: 'VE1302' },
  { estado: 'Lara', municipio: 'Iribarren', lat: 10.116154, lng: -69.394097, pcode: 'VE1303' },
  { estado: 'Lara', municipio: 'Jiménez', lat: 9.935461, lng: -69.622666, pcode: 'VE1304' },
  { estado: 'Lara', municipio: 'Moran', lat: 9.707549, lng: -69.875299, pcode: 'VE1305' },
  { estado: 'Lara', municipio: 'Palavecino', lat: 9.994331, lng: -69.234611, pcode: 'VE1306' },
  { estado: 'Lara', municipio: 'Simón Planas', lat: 9.846769, lng: -69.127252, pcode: 'VE1307' },
  { estado: 'Lara', municipio: 'Torres', lat: 10.163986, lng: -70.188205, pcode: 'VE1308' },
  { estado: 'Lara', municipio: 'Urdaneta', lat: 10.562479, lng: -69.552535, pcode: 'VE1309' },
  { estado: 'Miranda', municipio: 'Acevedo', lat: 10.236711, lng: -66.310441, pcode: 'VE1501' },
  { estado: 'Miranda', municipio: 'Andrés Bello', lat: 10.294224, lng: -66.015791, pcode: 'VE1502' },
  { estado: 'Miranda', municipio: 'Baruta', lat: 10.415776, lng: -66.873003, pcode: 'VE1503' },
  { estado: 'Miranda', municipio: 'Bolivariano Guaicaipuro', lat: 10.247761, lng: -66.999658, pcode: 'VE1510' },
  { estado: 'Miranda', municipio: 'Brión', lat: 10.510354, lng: -66.217564, pcode: 'VE1504' },
  { estado: 'Miranda', municipio: 'Buroz', lat: 10.324891, lng: -66.129097, pcode: 'VE1505' },
  { estado: 'Miranda', municipio: 'Carrizal', lat: 10.351463, lng: -66.98374, pcode: 'VE1506' },
  { estado: 'Miranda', municipio: 'Chacao', lat: 10.516405, lng: -66.851111, pcode: 'VE1507' },
  { estado: 'Miranda', municipio: 'Cristóbal Rojas', lat: 10.249066, lng: -66.831619, pcode: 'VE1508' },
  { estado: 'Miranda', municipio: 'El Hatillo', lat: 10.407398, lng: -66.796857, pcode: 'VE1509' },
  { estado: 'Miranda', municipio: 'Independencia', lat: 10.176706, lng: -66.586146, pcode: 'VE1511' },
  { estado: 'Miranda', municipio: 'Lander', lat: 10.078712, lng: -66.709995, pcode: 'VE1512' },
  { estado: 'Miranda', municipio: 'Los Salías', lat: 10.384849, lng: -66.958928, pcode: 'VE1513' },
  { estado: 'Miranda', municipio: 'Paz Castillo', lat: 10.317346, lng: -66.65796, pcode: 'VE1515' },
  { estado: 'Miranda', municipio: 'Pedro Gual', lat: 10.080227, lng: -65.679668, pcode: 'VE1516' },
  { estado: 'Miranda', municipio: 'Plaza', lat: 10.473118, lng: -66.652003, pcode: 'VE1517' },
  { estado: 'Miranda', municipio: 'Páez', lat: 10.16294, lng: -65.970442, pcode: 'VE1514' },
  { estado: 'Miranda', municipio: 'Simón Bolívar', lat: 10.178377, lng: -66.729409, pcode: 'VE1518' },
  { estado: 'Miranda', municipio: 'Sucre', lat: 10.470746, lng: -66.771202, pcode: 'VE1519' },
  { estado: 'Miranda', municipio: 'Urdaneta', lat: 10.117734, lng: -66.913514, pcode: 'VE1520' },
  { estado: 'Miranda', municipio: 'Zamora', lat: 10.436528, lng: -66.499489, pcode: 'VE1521' },
  { estado: 'Monagas', municipio: 'Acosta', lat: 10.12106, lng: -63.711931, pcode: 'VE1601' },
  { estado: 'Monagas', municipio: 'Aguasay', lat: 9.255245, lng: -63.637054, pcode: 'VE1602' },
  { estado: 'Monagas', municipio: 'Bolívar', lat: 10.116699, lng: -63.129136, pcode: 'VE1603' },
  { estado: 'Monagas', municipio: 'Caripe', lat: 10.195793, lng: -63.417746, pcode: 'VE1604' },
  { estado: 'Monagas', municipio: 'Cedeño', lat: 9.81631, lng: -63.72408, pcode: 'VE1605' },
  { estado: 'Monagas', municipio: 'Ezequiel Zamora', lat: 9.594287, lng: -63.707377, pcode: 'VE1606' },
  { estado: 'Monagas', municipio: 'Libertador', lat: 8.934109, lng: -62.689965, pcode: 'VE1607' },
  { estado: 'Monagas', municipio: 'Maturín', lat: 9.506871, lng: -62.947445, pcode: 'VE1608' },
  { estado: 'Monagas', municipio: 'Piar', lat: 9.961716, lng: -63.427043, pcode: 'VE1609' },
  { estado: 'Monagas', municipio: 'Punceres', lat: 10.003068, lng: -63.13272, pcode: 'VE1610' },
  { estado: 'Monagas', municipio: 'Santa Babara', lat: 9.576244, lng: -63.545292, pcode: 'VE1611' },
  { estado: 'Monagas', municipio: 'Sotillo', lat: 8.635861, lng: -62.459122, pcode: 'VE1612' },
  { estado: 'Monagas', municipio: 'Uracoa', lat: 8.899005, lng: -62.343881, pcode: 'VE1613' },
  { estado: 'Mérida', municipio: 'Alberto Adriani', lat: 8.630541, lng: -71.737473, pcode: 'VE1401' },
  { estado: 'Mérida', municipio: 'Andrés Bello', lat: 8.704012, lng: -71.370402, pcode: 'VE1402' },
  { estado: 'Mérida', municipio: 'Antonio Pinto Salinas', lat: 8.40913, lng: -71.625101, pcode: 'VE1403' },
  { estado: 'Mérida', municipio: 'Aricagua', lat: 8.145435, lng: -71.153046, pcode: 'VE1404' },
  { estado: 'Mérida', municipio: 'Arzobispo Chacón', lat: 8.105396, lng: -71.410663, pcode: 'VE1405' },
  { estado: 'Mérida', municipio: 'Campo Elías', lat: 8.51822, lng: -71.272291, pcode: 'VE1406' },
  { estado: 'Mérida', municipio: 'Caracciolo Parra Olmedo', lat: 8.829874, lng: -71.181624, pcode: 'VE1407' },
  { estado: 'Mérida', municipio: 'Cardenal Quintero', lat: 8.879254, lng: -70.671901, pcode: 'VE1408' },
  { estado: 'Mérida', municipio: 'Guaraque', lat: 8.151835, lng: -71.721674, pcode: 'VE1409' },
  { estado: 'Mérida', municipio: 'Julio Cesar Sala', lat: 9.122864, lng: -70.876967, pcode: 'VE1410' },
  { estado: 'Mérida', municipio: 'Justo Briceño', lat: 8.970489, lng: -70.951019, pcode: 'VE1411' },
  { estado: 'Mérida', municipio: 'Libertador', lat: 8.553978, lng: -71.106043, pcode: 'VE1412' },
  { estado: 'Mérida', municipio: 'Miranda', lat: 8.973132, lng: -70.779878, pcode: 'VE1413' },
  { estado: 'Mérida', municipio: 'Obispo Ramos de Lora', lat: 8.825302, lng: -71.430793, pcode: 'VE1414' },
  { estado: 'Mérida', municipio: 'Padre Noguera', lat: 7.784888, lng: -71.486681, pcode: 'VE1415' },
  { estado: 'Mérida', municipio: 'Pueblo Llano', lat: 8.961037, lng: -70.64948, pcode: 'VE1416' },
  { estado: 'Mérida', municipio: 'Rangel', lat: 8.739844, lng: -70.889837, pcode: 'VE1417' },
  { estado: 'Mérida', municipio: 'Rivas Dávila', lat: 8.240069, lng: -71.818755, pcode: 'VE1418' },
  { estado: 'Mérida', municipio: 'Santos Marquina', lat: 8.575406, lng: -70.943639, pcode: 'VE1419' },
  { estado: 'Mérida', municipio: 'Sucre', lat: 8.436195, lng: -71.447901, pcode: 'VE1420' },
  { estado: 'Mérida', municipio: 'Tovar', lat: 8.336923, lng: -71.737792, pcode: 'VE1421' },
  { estado: 'Mérida', municipio: 'Tulio Febres Cordero', lat: 9.111388, lng: -70.977562, pcode: 'VE1422' },
  { estado: 'Mérida', municipio: 'Zea', lat: 8.440276, lng: -71.751049, pcode: 'VE1423' },
  { estado: 'Nueva Esparta', municipio: 'Antolín del Campo', lat: 11.120152, lng: -63.863598, pcode: 'VE1701' },
  { estado: 'Nueva Esparta', municipio: 'Arismendi', lat: 11.0301, lng: -63.856408, pcode: 'VE1702' },
  { estado: 'Nueva Esparta', municipio: 'Díaz', lat: 10.97058, lng: -63.984946, pcode: 'VE1703' },
  { estado: 'Nueva Esparta', municipio: 'García', lat: 10.946742, lng: -63.921605, pcode: 'VE1704' },
  { estado: 'Nueva Esparta', municipio: 'Gómez', lat: 11.080384, lng: -63.923916, pcode: 'VE1705' },
  { estado: 'Nueva Esparta', municipio: 'Macanao', lat: 11.009891, lng: -64.273943, pcode: 'VE1709' },
  { estado: 'Nueva Esparta', municipio: 'Maneiro', lat: 11.006234, lng: -63.819463, pcode: 'VE1706' },
  { estado: 'Nueva Esparta', municipio: 'Marcano', lat: 11.066751, lng: -63.983084, pcode: 'VE1707' },
  { estado: 'Nueva Esparta', municipio: 'Mariño', lat: 10.934189, lng: -63.891429, pcode: 'VE1708' },
  { estado: 'Nueva Esparta', municipio: 'Tubores', lat: 10.937528, lng: -64.070286, pcode: 'VE1710' },
  { estado: 'Nueva Esparta', municipio: 'Villalba', lat: 10.770608, lng: -63.949723, pcode: 'VE1711' },
  { estado: 'Portuguesa', municipio: 'Agua Blanca', lat: 9.604195, lng: -69.052945, pcode: 'VE1801' },
  { estado: 'Portuguesa', municipio: 'Araure', lat: 9.623162, lng: -69.269721, pcode: 'VE1802' },
  { estado: 'Portuguesa', municipio: 'Esteller', lat: 9.203865, lng: -69.189346, pcode: 'VE1803' },
  { estado: 'Portuguesa', municipio: 'Guanare', lat: 9.150118, lng: -69.727107, pcode: 'VE1804' },
  { estado: 'Portuguesa', municipio: 'Guanarito', lat: 8.442799, lng: -68.881465, pcode: 'VE1805' },
  { estado: 'Portuguesa', municipio: 'Monseñor José Vicente de Und', lat: 9.461972, lng: -69.940546, pcode: 'VE1806' },
  { estado: 'Portuguesa', municipio: 'Ospino', lat: 9.23958, lng: -69.395394, pcode: 'VE1807' },
  { estado: 'Portuguesa', municipio: 'Papelón', lat: 8.864408, lng: -69.30748, pcode: 'VE1809' },
  { estado: 'Portuguesa', municipio: 'Páez', lat: 9.46181, lng: -68.983762, pcode: 'VE1808' },
  { estado: 'Portuguesa', municipio: 'San Genaro de Boconoito', lat: 8.943263, lng: -69.993352, pcode: 'VE1810' },
  { estado: 'Portuguesa', municipio: 'San Rafael de Onoto', lat: 9.663074, lng: -69.005625, pcode: 'VE1811' },
  { estado: 'Portuguesa', municipio: 'Santa Rosalía', lat: 9.0262, lng: -68.987174, pcode: 'VE1812' },
  { estado: 'Portuguesa', municipio: 'Sucre', lat: 9.295911, lng: -70.008383, pcode: 'VE1813' },
  { estado: 'Portuguesa', municipio: 'Turen', lat: 9.222438, lng: -68.881818, pcode: 'VE1814' },
  { estado: 'Sucre', municipio: 'Andrés Eloy Blanco', lat: 10.394403, lng: -63.339868, pcode: 'VE1901' },
  { estado: 'Sucre', municipio: 'Andrés Mata', lat: 10.502415, lng: -63.331674, pcode: 'VE1902' },
  { estado: 'Sucre', municipio: 'Arismendi', lat: 10.679953, lng: -63.044794, pcode: 'VE1903' },
  { estado: 'Sucre', municipio: 'Benítez', lat: 10.330489, lng: -62.934295, pcode: 'VE1904' },
  { estado: 'Sucre', municipio: 'Bermúdez', lat: 10.612555, lng: -63.241124, pcode: 'VE1905' },
  { estado: 'Sucre', municipio: 'Bolívar', lat: 10.398359, lng: -63.944197, pcode: 'VE1906' },
  { estado: 'Sucre', municipio: 'Cajigal', lat: 10.60903, lng: -62.814366, pcode: 'VE1907' },
  { estado: 'Sucre', municipio: 'Cruz Salmerón Acosta', lat: 10.605623, lng: -64.004208, pcode: 'VE1908' },
  { estado: 'Sucre', municipio: 'Libertador', lat: 10.54194, lng: -62.985797, pcode: 'VE1909' },
  { estado: 'Sucre', municipio: 'Mariño', lat: 10.624379, lng: -62.575883, pcode: 'VE1910' },
  { estado: 'Sucre', municipio: 'Mejía', lat: 10.383511, lng: -63.778256, pcode: 'VE1911' },
  { estado: 'Sucre', municipio: 'Montes', lat: 10.226864, lng: -63.899494, pcode: 'VE1912' },
  { estado: 'Sucre', municipio: 'Ribero', lat: 10.423495, lng: -63.536962, pcode: 'VE1913' },
  { estado: 'Sucre', municipio: 'Sucre', lat: 10.270913, lng: -64.262474, pcode: 'VE1914' },
  { estado: 'Sucre', municipio: 'Valdez', lat: 10.634597, lng: -62.356207, pcode: 'VE1915' },
  { estado: 'Trujillo', municipio: 'Andrés Bello', lat: 9.654398, lng: -70.724938, pcode: 'VE2101' },
  { estado: 'Trujillo', municipio: 'Bocono', lat: 9.23777, lng: -70.233015, pcode: 'VE2102' },
  { estado: 'Trujillo', municipio: 'Bolívar', lat: 9.366789, lng: -70.829585, pcode: 'VE2103' },
  { estado: 'Trujillo', municipio: 'Candelaria', lat: 9.655727, lng: -70.48148, pcode: 'VE2104' },
  { estado: 'Trujillo', municipio: 'Carache', lat: 9.631738, lng: -70.200218, pcode: 'VE2105' },
  { estado: 'Trujillo', municipio: 'Escuque', lat: 9.285899, lng: -70.706962, pcode: 'VE2106' },
  { estado: 'Trujillo', municipio: 'José Felipe Márquez Cañizal', lat: 9.866503, lng: -70.579315, pcode: 'VE2107' },
  { estado: 'Trujillo', municipio: 'Juan Vicente Campo Elías', lat: 9.431372, lng: -70.097109, pcode: 'VE2108' },
  { estado: 'Trujillo', municipio: 'La Ceiba', lat: 9.474527, lng: -70.987918, pcode: 'VE2109' },
  { estado: 'Trujillo', municipio: 'Miranda', lat: 9.588057, lng: -70.617213, pcode: 'VE2110' },
  { estado: 'Trujillo', municipio: 'Monte Carmelo', lat: 9.225462, lng: -70.847898, pcode: 'VE2111' },
  { estado: 'Trujillo', municipio: 'Motatan', lat: 9.452773, lng: -70.593023, pcode: 'VE2112' },
  { estado: 'Trujillo', municipio: 'Pampan', lat: 9.518707, lng: -70.510925, pcode: 'VE2113' },
  { estado: 'Trujillo', municipio: 'Pampanito', lat: 9.431256, lng: -70.51857, pcode: 'VE2114' },
  { estado: 'Trujillo', municipio: 'Rafael Rangel', lat: 9.339705, lng: -70.719344, pcode: 'VE2115' },
  { estado: 'Trujillo', municipio: 'San Rafael de Carvajal', lat: 9.356832, lng: -70.57534, pcode: 'VE2116' },
  { estado: 'Trujillo', municipio: 'Sucre', lat: 9.491468, lng: -70.842607, pcode: 'VE2117' },
  { estado: 'Trujillo', municipio: 'Trujillo', lat: 9.311303, lng: -70.448397, pcode: 'VE2118' },
  { estado: 'Trujillo', municipio: 'Urdaneta', lat: 9.133565, lng: -70.552314, pcode: 'VE2119' },
  { estado: 'Trujillo', municipio: 'Valera', lat: 9.207429, lng: -70.664369, pcode: 'VE2120' },
  { estado: 'Táchira', municipio: 'Andrés Bello', lat: 7.882487, lng: -72.147888, pcode: 'VE2001' },
  { estado: 'Táchira', municipio: 'Antonio Rómulo Costa', lat: 8.168134, lng: -72.164746, pcode: 'VE2002' },
  { estado: 'Táchira', municipio: 'Ayacucho', lat: 8.146881, lng: -72.285896, pcode: 'VE2003' },
  { estado: 'Táchira', municipio: 'Bolívar', lat: 7.753627, lng: -72.431469, pcode: 'VE2004' },
  { estado: 'Táchira', municipio: 'Cárdenas', lat: 7.783622, lng: -72.057978, pcode: 'VE2005' },
  { estado: 'Táchira', municipio: 'Córdoba', lat: 7.552695, lng: -72.20649, pcode: 'VE2006' },
  { estado: 'Táchira', municipio: 'Fernández Feo', lat: 7.547852, lng: -71.953416, pcode: 'VE2007' },
  { estado: 'Táchira', municipio: 'Francisco de Miranda', lat: 7.926837, lng: -71.895093, pcode: 'VE2008' },
  { estado: 'Táchira', municipio: 'García de Hevia', lat: 8.331802, lng: -72.261874, pcode: 'VE2009' },
  { estado: 'Táchira', municipio: 'Guasimos', lat: 7.85508, lng: -72.232028, pcode: 'VE2010' },
  { estado: 'Táchira', municipio: 'Independencia', lat: 7.815851, lng: -72.290555, pcode: 'VE2011' },
  { estado: 'Táchira', municipio: 'José María Vargas', lat: 8.019692, lng: -72.078126, pcode: 'VE2013' },
  { estado: 'Táchira', municipio: 'Junín', lat: 7.600805, lng: -72.384794, pcode: 'VE2014' },
  { estado: 'Táchira', municipio: 'Jáuregui', lat: 8.194379, lng: -71.954039, pcode: 'VE2012' },
  { estado: 'Táchira', municipio: 'Libertad', lat: 7.797959, lng: -72.329304, pcode: 'VE2015' },
  { estado: 'Táchira', municipio: 'Libertador', lat: 7.659169, lng: -71.650399, pcode: 'VE2016' },
  { estado: 'Táchira', municipio: 'Lobatera', lat: 7.943265, lng: -72.313462, pcode: 'VE2017' },
  { estado: 'Táchira', municipio: 'Michelena', lat: 8.009766, lng: -72.162027, pcode: 'VE2018' },
  { estado: 'Táchira', municipio: 'Panamericano', lat: 8.402403, lng: -72.04977, pcode: 'VE2019' },
  { estado: 'Táchira', municipio: 'Pedro María Ureña', lat: 7.947306, lng: -72.428028, pcode: 'VE2020' },
  { estado: 'Táchira', municipio: 'Rafael Urdaneta', lat: 7.551876, lng: -72.423635, pcode: 'VE2021' },
  { estado: 'Táchira', municipio: 'Samuel Darío Maldonado', lat: 8.496849, lng: -71.868044, pcode: 'VE2022' },
  { estado: 'Táchira', municipio: 'San Cristóbal', lat: 7.738869, lng: -72.17897, pcode: 'VE2023' },
  { estado: 'Táchira', municipio: 'San Judas Tadeo', lat: 8.262705, lng: -72.055481, pcode: 'VE2029' },
  { estado: 'Táchira', municipio: 'Seboruco', lat: 8.141976, lng: -72.077218, pcode: 'VE2024' },
  { estado: 'Táchira', municipio: 'Simón Rodríguez', lat: 8.319479, lng: -71.844199, pcode: 'VE2025' },
  { estado: 'Táchira', municipio: 'Sucre', lat: 7.883424, lng: -72.042947, pcode: 'VE2026' },
  { estado: 'Táchira', municipio: 'Torbes', lat: 7.660037, lng: -72.149127, pcode: 'VE2027' },
  { estado: 'Táchira', municipio: 'Uribante', lat: 7.90535, lng: -71.650566, pcode: 'VE2028' },
  { estado: 'Yaracuy', municipio: 'Arístides Bastidas', lat: 10.255794, lng: -68.861619, pcode: 'VE2201' },
  { estado: 'Yaracuy', municipio: 'Bolívar', lat: 10.46873, lng: -68.89291, pcode: 'VE2202' },
  { estado: 'Yaracuy', municipio: 'Bruzual', lat: 10.196035, lng: -68.893608, pcode: 'VE2203' },
  { estado: 'Yaracuy', municipio: 'Cocorote', lat: 10.295891, lng: -68.783785, pcode: 'VE2204' },
  { estado: 'Yaracuy', municipio: 'Independencia', lat: 10.312383, lng: -68.732419, pcode: 'VE2205' },
  { estado: 'Yaracuy', municipio: 'José Antonio Páez', lat: 10.074992, lng: -68.977777, pcode: 'VE2206' },
  { estado: 'Yaracuy', municipio: 'La Trinidad', lat: 10.234746, lng: -68.745556, pcode: 'VE2207' },
  { estado: 'Yaracuy', municipio: 'Manuel Monge', lat: 10.613294, lng: -68.747269, pcode: 'VE2208' },
  { estado: 'Yaracuy', municipio: 'Nirgua', lat: 10.101006, lng: -68.583838, pcode: 'VE2209' },
  { estado: 'Yaracuy', municipio: 'Peña', lat: 10.052988, lng: -69.109929, pcode: 'VE2210' },
  { estado: 'Yaracuy', municipio: 'San Felipe', lat: 10.408518, lng: -68.703366, pcode: 'VE2211' },
  { estado: 'Yaracuy', municipio: 'Sucre', lat: 10.254912, lng: -68.818621, pcode: 'VE2212' },
  { estado: 'Yaracuy', municipio: 'Urachiche', lat: 10.209251, lng: -69.016468, pcode: 'VE2213' },
  { estado: 'Yaracuy', municipio: 'Veroes', lat: 10.407794, lng: -68.514135, pcode: 'VE2214' },
  { estado: 'Zulia', municipio: 'Almirante Padilla', lat: 11.05496, lng: -71.759891, pcode: 'VE2301' },
  { estado: 'Zulia', municipio: 'Baralt', lat: 9.969337, lng: -70.912425, pcode: 'VE2302' },
  { estado: 'Zulia', municipio: 'Cabimas', lat: 10.400139, lng: -71.217077, pcode: 'VE2303' },
  { estado: 'Zulia', municipio: 'Catatumbo', lat: 8.988043, lng: -72.23511, pcode: 'VE2304' },
  { estado: 'Zulia', municipio: 'Colon', lat: 8.831979, lng: -71.912719, pcode: 'VE2305' },
  { estado: 'Zulia', municipio: 'Francisco Javier Pulgar', lat: 8.88798, lng: -71.55065, pcode: 'VE2306' },
  { estado: 'Zulia', municipio: 'Indígena Bolivariano Guajira', lat: 11.418165, lng: -72.028078, pcode: 'VE2315' },
  { estado: 'Zulia', municipio: 'Jesús Enrique Lossada', lat: 10.563429, lng: -72.063018, pcode: 'VE2307' },
  { estado: 'Zulia', municipio: 'Jesús María Semprum', lat: 8.995974, lng: -72.530175, pcode: 'VE2308' },
  { estado: 'Zulia', municipio: 'La Cañada de Urdaneta', lat: 10.296884, lng: -71.958537, pcode: 'VE2309' },
  { estado: 'Zulia', municipio: 'Lagunillas', lat: 10.239327, lng: -71.183504, pcode: 'VE2310' },
  { estado: 'Zulia', municipio: 'Machiques de Perija', lat: 9.821517, lng: -72.54119, pcode: 'VE2311' },
  { estado: 'Zulia', municipio: 'Mara', lat: 10.932247, lng: -72.138572, pcode: 'VE2312' },
  { estado: 'Zulia', municipio: 'Maracaibo', lat: 10.675782, lng: -71.685048, pcode: 'VE2313' },
  { estado: 'Zulia', municipio: 'Miranda', lat: 10.712525, lng: -71.311825, pcode: 'VE2314' },
  { estado: 'Zulia', municipio: 'Rosario de Perija', lat: 10.230773, lng: -72.297184, pcode: 'VE2316' },
  { estado: 'Zulia', municipio: 'San Francisco', lat: 10.556095, lng: -71.698716, pcode: 'VE2317' },
  { estado: 'Zulia', municipio: 'Santa Rita', lat: 10.528007, lng: -71.38154, pcode: 'VE2318' },
  { estado: 'Zulia', municipio: 'Simón Bolívar', lat: 10.299122, lng: -71.304069, pcode: 'VE2319' },
  { estado: 'Zulia', municipio: 'Sucre', lat: 9.031992, lng: -71.285129, pcode: 'VE2320' },
  { estado: 'Zulia', municipio: 'Valmore Rodríguez', lat: 10.172707, lng: -70.968331, pcode: 'VE2321' },
]

/** All 25 admin-1 units (24 estados + Dependencias Federales). */
export const ESTADO_CENTROIDS: EstadoCentroid[] = [
  { estado: 'Amazonas', lat: 3.415511, lng: -65.780778, pcode: 'VE02' },
  { estado: 'Anzoátegui', lat: 8.957745, lng: -64.12823, pcode: 'VE03' },
  { estado: 'Apure', lat: 7.073844, lng: -68.809663, pcode: 'VE04' },
  { estado: 'Aragua', lat: 9.894288, lng: -66.878611, pcode: 'VE05' },
  { estado: 'Barinas', lat: 8.173901, lng: -69.974612, pcode: 'VE06' },
  { estado: 'Bolívar', lat: 5.997068, lng: -63.472444, pcode: 'VE07' },
  { estado: 'Carabobo', lat: 10.197307, lng: -68.126057, pcode: 'VE08' },
  { estado: 'Cojedes', lat: 9.30907, lng: -68.350835, pcode: 'VE09' },
  { estado: 'Delta Amacuro', lat: 8.885198, lng: -61.362829, pcode: 'VE10' },
  { estado: 'Dependencias Federales', lat: 10.931035, lng: -65.316514, pcode: null },
  { estado: 'Distrito Capital', lat: 10.472887, lng: -66.968828, pcode: 'VE01' },
  { estado: 'Falcón', lat: 11.248117, lng: -69.510754, pcode: 'VE11' },
  { estado: 'Guárico', lat: 8.831447, lng: -66.381325, pcode: 'VE12' },
  { estado: 'La Guaira', lat: 10.509378, lng: -67.236442, pcode: 'VE24' },
  { estado: 'Lara', lat: 10.072863, lng: -70.025095, pcode: 'VE13' },
  { estado: 'Miranda', lat: 10.291989, lng: -66.504379, pcode: 'VE15' },
  { estado: 'Monagas', lat: 9.34985, lng: -63.148225, pcode: 'VE16' },
  { estado: 'Mérida', lat: 8.429457, lng: -71.322067, pcode: 'VE14' },
  { estado: 'Nueva Esparta', lat: 11.02042, lng: -63.91042, pcode: 'VE17' },
  { estado: 'Portuguesa', lat: 8.968539, lng: -69.391145, pcode: 'VE18' },
  { estado: 'Sucre', lat: 10.39897, lng: -63.574781, pcode: 'VE19' },
  { estado: 'Trujillo', lat: 9.495648, lng: -70.581139, pcode: 'VE21' },
  { estado: 'Táchira', lat: 8.004844, lng: -72.009957, pcode: 'VE20' },
  { estado: 'Yaracuy', lat: 10.303602, lng: -68.699914, pcode: 'VE22' },
  { estado: 'Zulia', lat: 10.103039, lng: -72.439851, pcode: 'VE23' },
]

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^(municipio|autonomo)\s+/i, '')
    .toLowerCase()
    .trim()
}

/**
 * "Vargas" was the state's name before its 2022 rename to "La Guaira"; the
 * app still carries a legacy `Vargas` entry in venezuela-geo.ts alongside
 * `La Guaira`. Both must resolve to the same OCHA data.
 */
const ESTADO_ALIASES: Record<string, string> = {
  vargas: 'la guaira',
}

function normalizeEstado(s: string): string {
  const n = normalize(s)
  return ESTADO_ALIASES[n] ?? n
}

/**
 * Known short-form ↔ OCHA-official-name aliases, and the Distrito Capital /
 * Miranda ambiguity: Venezuela's 2009 territorial law makes Distrito Capital
 * exactly one municipio (Libertador); Sucre/Baruta/Chacao/El Hatillo are
 * officially Miranda even though they read as "Caracas" colloquially. The
 * app's own municipio list already carries this duplication (see
 * venezuela-geo.ts), so this table mirrors it rather than relitigating which
 * estado is "correct" — that question is out of scope for a centroid lookup.
 * Keyed by .
 */
const ALIASES: Record<string, { estado: string; municipio: string }> = {
  'distrito capital|sucre': { estado: 'Miranda', municipio: 'Sucre' },
  'distrito capital|baruta': { estado: 'Miranda', municipio: 'Baruta' },
  'distrito capital|chacao': { estado: 'Miranda', municipio: 'Chacao' },
  'distrito capital|el hatillo': { estado: 'Miranda', municipio: 'El Hatillo' },
  'miranda|guaicaipuro': { estado: 'Miranda', municipio: 'Bolivariano Guaicaipuro' },
  'aragua|zamora': { estado: 'Aragua', municipio: 'Ezequiel Zamora' },
  'aragua|mario briceno iragorry': { estado: 'Aragua', municipio: 'Mario Briceño Iragorri' },
  // Ciudad Bolívar (state capital) sits in the municipio historically called
  // Heres; OCHA's 2021 boundaries show it renamed/split into "Angostura del
  // Orinoco" (Angostura was the colonial name for Ciudad Bolívar). Best
  // available match, not a certainty — flagged for Orlando to confirm if
  // precision here ever matters beyond a municipio-level map marker.
  'bolivar|heres': { estado: 'Bolívar', municipio: 'Angostura del Orinoco' },
  'bolivar|angostura': { estado: 'Bolívar', municipio: 'Bolivariano Angostura' },
  'anzoategui|sotillo': { estado: 'Anzoátegui', municipio: 'Juan Antonio Sotillo' },
  'anzoategui|freites': { estado: 'Anzoátegui', municipio: 'Pedro María Freites' },
  'guarico|roscio': { estado: 'Guárico', municipio: 'Juan Germán Roscio' },
  'guarico|infante': { estado: 'Guárico', municipio: 'Leonardo Infante' },
  'guarico|zaraza': { estado: 'Guárico', municipio: 'Pedro Zaraza' },
  'guarico|monagas': { estado: 'Guárico', municipio: 'José Tadeo Monagas' },
  // La Guaira state has exactly one municipio (officially "Vargas"); the
  // stored value is sometimes the estado's own former name.
  'la guaira|vargas': { estado: 'La Guaira', municipio: 'Vargas' },
}

/**
 * Resolve a (estado, municipio) pair to a centroid for map display. Order:
 * exact normalized match → alias table → same-estado substring match →
 * estado-level centroid → null.
 */
export function getMunicipioCentroid(
  estado: string | null | undefined,
  municipio: string | null | undefined
): { lat: number; lng: number; precision: 'municipio' | 'estado' } | null {
  if (!estado) return null
  const nEstado = normalizeEstado(estado)

  if (municipio) {
    const nMuni = normalize(municipio)

    const exact = MUNICIPIO_CENTROIDS.find(
      (m) => normalize(m.estado) === nEstado && normalize(m.municipio) === nMuni
    )
    if (exact) return { lat: exact.lat, lng: exact.lng, precision: 'municipio' }

    const alias = ALIASES[`${nEstado}|${nMuni}`]
    if (alias) {
      const aliased = MUNICIPIO_CENTROIDS.find(
        (m) => normalize(m.estado) === normalize(alias.estado) && normalize(m.municipio) === normalize(alias.municipio)
      )
      if (aliased) return { lat: aliased.lat, lng: aliased.lng, precision: 'municipio' }
    }

    // Same-estado substring match — covers "Sotillo" vs official "Juan
    // Antonio Sotillo" style short forms not already in the alias table.
    const bySubstring = MUNICIPIO_CENTROIDS.find((m) => {
      if (normalize(m.estado) !== nEstado) return false
      const words = normalize(m.municipio).split(/\s+/)
      return words.includes(nMuni) || normalize(m.municipio).includes(nMuni)
    })
    if (bySubstring) return { lat: bySubstring.lat, lng: bySubstring.lng, precision: 'municipio' }
  }

  const estadoMatch = ESTADO_CENTROIDS.find((e) => normalize(e.estado) === nEstado)
  if (estadoMatch) return { lat: estadoMatch.lat, lng: estadoMatch.lng, precision: 'estado' }

  return null
}
