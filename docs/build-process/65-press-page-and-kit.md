# 65 — Press Page and Downloadable Press Kit

**Priority:** P1 — this is the highest-leverage item remaining. It converts referral traffic into coverage instead of bounces.
**Depends on:** 62 merged (zero-state rule applies here), 63 REV2 Part A merged (figures need provenance).
**Routing:** Normal PR. No security surface.

---

## Context

DTV's `/medios` page reports **102 publications across 13 countries, plus 11 interviews and appearances** — France 24, CNN en Español, Infobae, El Nacional, LaPatilla, Telemundo 51, Univision WXTV, El Espectador, La Nación, Milenio, Yahoo/AFP, RCN Radio, Radio Buenos Aires. It is filterable by country, each entry links to the original, and there is a downloadable press kit.

Vigil has a `/prensa` route and no coverage.

**The causal link is not luck.** DTV built four artifacts and then had something to send journalists: a one-pager, a mission/vision/values sheet, a history-and-context narrative, and dated bulletins carrying hard numbers. Their bulletins are the mechanism — they published dated, quotable, number-dense updates that a journalist could file from without an interview.

When DTV lists Vigil in `/plataformas`, journalists working that directory will click through. A `/prensa` page with nothing behind it converts that traffic into nothing.

---

## Part A — `/prensa` page structure

Build these sections. **Apply the prompt 62 rule throughout: never render a zero.** Until coverage exists, the coverage section does not display a count and does not display an empty grid — it displays the press contact and kit download instead.

1. **Boilerplate block** — the paragraph a journalist copies into their piece. Copy provided in Part C. Include a one-tap copy button; this single affordance measurably increases correct attribution.
2. **Fact sheet** — current figures with sources and dates, pulled from the 63 REV2 system so it can never drift from the rest of the platform.
3. **Founder and contact** — Orlando Toro, founder, YouTheWave. Press contact email. Response-time expectation stated honestly.
4. **Assets** — logo (SVG and PNG, light background), platform screenshots at desktop and mobile, Open Graph image. Direct download, no form gate.
5. **The story** — the 48-hour build narrative. Copy in Part C.
6. **Kit download** — a single archive containing everything above.
7. **Coverage** — structure built, hidden until non-zero. When it populates, mirror DTV's model: outlet, country, format tag (periódico / portal / TV / radio / revista / red social), date, link to original.

---

## Part B — The press kit archive

Four documents, matching the structure DTV proved works. Generate as PDF, bundle as a single download, and keep the source markdown in `docs/press/` so it stays version-controlled and updatable.

1. **One-pager** — what Vigil is, what it does, the numbers, the URLs, the contact. One page, no exceptions.
2. **Mission, vision, values** — Part C provides the content.
3. **History and context** — the origin narrative. Part C.
4. **Fact sheet** — figures with sources and dates, generated from the live provenance system rather than hand-written, so it cannot go stale silently.

**Bulletins are the follow-on, not part of this PR.** Once the kit exists, the cadence of dated updates with hard numbers is what actually produces coverage. Flag it as the next content task.

---

## Part C — Copy. Use as written; Orlando approves before merge.

### Boilerplate (ES)

> **Vigil** es una plataforma humanitaria de código abierto creada en respuesta a los terremotos del 24 de junio de 2026 en Venezuela. Permite buscar personas desaparecidas por nombre y por fotografía, consultar un mapa de crisis con réplicas sísmicas en vivo, coordinar recursos entre quienes necesitan y quienes pueden ayudar, y acceder a directorios verificados de organizaciones y centros de acopio. Opera en ocho idiomas para equipos de rescate internacionales y está federada por API con Desaparecidos Terremoto Venezuela. No requiere registro, no solicita dinero y su código es público bajo licencia MIT. Es un proyecto de YouTheWave, fundado por Orlando Toro.
>
> vigil.youthewave.org · github.com/Atenaxproject/vigil

### Boilerplate (EN)

> **Vigil** is an open-source humanitarian platform built in response to the 24 June 2026 earthquakes in Venezuela. It provides missing-persons search by name and by photograph, a live crisis map with seismic aftershock data, resource coordination between people in need and people who can help, and verified directories of organizations and collection points. It operates in eight languages for international rescue teams and is API-federated with Desaparecidos Terremoto Venezuela. No registration is required, no money is solicited, and the code is public under the MIT license. Vigil is a project of YouTheWave, founded by Orlando Toro.

### Mission

> Estar presentes cuando más importa. Construir tecnología que funcione en las peores condiciones —sin señal, sin registro, sin barreras— para que ninguna familia quede sin una forma de buscar.

### Vision

> Que la próxima vez no haya que empezar de cero. Una plataforma que se despliegue en horas para cualquier país y cualquier desastre, y que llegue a cada emergencia mejor que a la anterior.

### Values

| | |
|---|---|
| **Honestidad antes que velocidad** | La IA de Vigil nunca inventa información. Cuando no hay dato, lo dice. |
| **Privacidad no negociable** | Los datos de contacto de las familias nunca son públicos. Nunca se comparten con el gobierno venezolano. |
| **Federar, no copiar** | Los datos de otras plataformas se integran por acuerdo y API, jamás por scraping. |
| **Abierto por defecto** | Código público, licencia MIT, sin fines de lucro, sin publicidad. |
| **Sin barreras** | Sin registro, sin cuenta, sin app. Funciona en 2G y sin conexión. |

### History and context

> **48 horas.**
>
> El 24 de junio de 2026, durante el feriado de la Batalla de Carabobo, dos terremotos sacudieron el norte de Venezuela con 39 segundos de diferencia: uno de magnitud 7,2 con epicentro cerca de San Felipe, Yaracuy, y otro de magnitud 7,5 con epicentro en las inmediaciones de Yumare. Fueron los más fuertes en más de un siglo.
>
> Orlando Toro es venezolano y vive en Florida. Como cientos de miles de venezolanos en la diáspora, pasó esa noche intentando comunicarse con gente que no respondía.
>
> No esperó. En una sola sesión de trabajo durante la madrugada construyó y desplegó Vigil: búsqueda de personas, mapa de crisis, coordinación de recursos. De concepto a producción en 48 horas.
>
> Vigil no compite con nadie. Se federa. Los datos de Desaparecidos Terremoto Venezuela —el mayor repositorio ciudadano de esta emergencia— se integran por API y con atribución, nunca copiados. Lo que Vigil aporta es lo que no existía: búsqueda por fotografía, desglose geográfico hasta parroquia, ocho idiomas para los equipos de rescate de 27 países, y un mapa que funciona con señal intermitente.
>
> La plataforma está construida para redesplegarse. Un archivo de configuración cambia el país, los límites del mapa, los idiomas y las líneas de emergencia. Venezuela hoy. Donde haga falta mañana.

---

## Part D — What must not appear

- **No casualty figure presented as Vigil's own.** All such numbers are cifras oficiales, attributed, per 63 REV2.
- **No DTV figure without network attribution.** Getting this wrong in a press kit, in front of the partner who referred you, is the worst possible venue for that error.
- **No claim of organizational status Vigil does not have.** YouTheWave is pre-incorporation; 501(c)(3) status does not exist. The kit says "proyecto de YouTheWave," never "organización sin fines de lucro registrada."
- **No donation ask anywhere.** Pre-FDACS registration, soliciting from a Florida address is a Chapter 496 problem. The kit states plainly that Vigil does not solicit money — which is also a genuine differentiator, since DTV and Yummy both take donations.
- **No stock photography.** Standing constraint. Screenshots of the actual platform only.

---

## Acceptance criteria

- `/prensa` renders all sections; coverage section hidden while empty, with no zero counter anywhere
- Boilerplate has a working copy button in ES and EN
- Fact sheet pulls from the 63 REV2 provenance system, not hardcoded
- All four kit documents generate as PDF and bundle as one download
- Source markdown committed to `docs/press/`
- Assets downloadable without a form
- Page renders correctly in all 8 locales
- `scripts/visual-check.mjs` proof, mobile and desktop

---

## Report back

Confirm every figure on the page traces to the provenance system. Flag any claim in the copy you cannot substantiate from the repo or from live data — those get cut before merge, not softened.
