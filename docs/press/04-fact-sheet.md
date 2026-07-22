# Hoja de hechos — Vigil

Las cifras de esta hoja se generan en vivo desde el sistema de proveniencia de Vigil (`sourced_figures` + API DTV federada) al descargar el kit. No edites números a mano aquí; actualiza Supabase Studio o la red DTV.

## Reglas editoriales
- Toda cifra oficial se etiqueta como **cifra oficial** y nombra al emisor.
- Toda cifra DTV lleva atribución a la red federada — nunca como dato propio de Vigil.
- No se promedian ni se reconcilian fuentes conflictivas en un solo número.
- YouTheWave es un proyecto pre-constitución; no es 501(c)(3).
- Vigil no solicita donaciones.

## Mapeo de campos DTV (API)
| Campo API | Etiqueta Vigil |
|---|---|
| conteo GET /personas | Personas en red DTV (registros federados) |
| estado = sin-contacto | Aún sin contacto |
| estado = localizado | Localizados |
| ubicacion.estado | Estado geográfico |
| localizado + centro null | Localizados sin centro registrado |
