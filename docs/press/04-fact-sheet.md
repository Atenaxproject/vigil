# Hoja de hechos — Vigil

Esta hoja documenta cómo Vigil maneja cifras. Las cifras vivas no se imprimen aquí: se consultan en [vigil.youthewave.org/estadisticas](https://vigil.youthewave.org/estadisticas) (cifras con fuente, fecha de verificación y contrapuntos) y en [vigil.youthewave.org/prensa](https://vigil.youthewave.org/prensa) (hoja de proveniencia para prensa). Un número impreso en un PDF envejece; esos enlaces no.

## Reglas editoriales

- Toda cifra oficial se etiqueta como **cifra oficial** y nombra al emisor.
- Toda cifra de la red DTV lleva atribución a la red federada de Desaparecidos Terremoto Venezuela — nunca se presenta como dato propio de Vigil.
- No se promedian ni se reconcilian fuentes conflictivas en un solo número. Las cifras disputadas se muestran con sus contrapuntos (Provea, USGS PAGER, ONU, fuentes académicas).
- Una cifra agregada solo se publica cuando la enumeración de origen está completa. Si no puede establecerse con confianza, se suprime — nunca se estima ni se redondea.
- YouTheWave es un proyecto pre-constitución; no es 501(c)(3).
- Vigil no solicita donaciones.

## Mapeo de campos DTV (API)

| Campo API | Etiqueta Vigil |
|---|---|
| enumeración completa GET /personas | Personas en red DTV (registros federados) |
| estado = sin-contacto | Aún sin contacto |
| estado = localizado | Localizados |
| ubicacion.estado | Estado geográfico |

Los rótulos siguen la semántica de los campos de la API: *reportes* ≠ *personas únicas* ≠ *sin contacto*. Vigil no re-etiqueta cifras para hacerlas coincidir.

## Privacidad — posiciones permanentes

- Sin reconocimiento facial. La búsqueda por fotografía usa descripción de rasgos por IA (texto), no biometría.
- Los datos de contacto nunca se muestran públicamente; el contacto se canaliza por el sistema interno de solicitudes.
- Sin cooperación de datos con el gobierno venezolano.
