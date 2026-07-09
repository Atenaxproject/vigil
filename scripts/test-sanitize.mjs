// Security sanitizer bypass-vector tests — run: node scripts/test-sanitize.mjs
// No test framework dependency by design (repo convention, see test-feeds.mjs);
// exits non-zero on failure.
//
// The two functions below MIRROR src/lib/security/validate.ts — keep them in
// sync with that file (it can't be imported here: it pulls in the path-aliased
// crisis.config at module load, which a plain node script can't resolve). These
// cases guard the CodeQL findings js/incomplete-multi-character-sanitization
// (#1) and js/incomplete-url-scheme-check (#2), both fixed in commit 83507d5.

const DANGEROUS_SCHEME = /(?:javascript|data|vbscript):/gi
const ANGLE_BRACKETS = /[<>]/g

function sanitizeText(text) {
  let out = text.slice(0, 4000)
  let previous
  do {
    previous = out
    out = out.replace(ANGLE_BRACKETS, '').replace(DANGEROUS_SCHEME, '')
  } while (out !== previous)
  return out.replace(/\s+/g, ' ').trim().slice(0, 2000)
}

function isSafeHttpUrl(url) {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    const allowed = ['http:', 'https:', 'mailto:', 'tel:']
    return allowed.includes(parsed.protocol) ? trimmed : null
  } catch {
    return null
  }
}

let failures = 0
const check = (name, ok, detail = '') => {
  if (ok) console.log(`  ok  ${name}`)
  else {
    failures++
    console.error(`FAIL  ${name} ${detail}`)
  }
}

// --- isSafeHttpUrl: allowlist must reject every non-http(s)/mailto/tel scheme,
//     immune to case, embedded whitespace, and leading/trailing spaces
//     (the URL parser normalizes these — the reason to parse, not regex). ---
console.log('isSafeHttpUrl — dangerous schemes rejected')
for (const bad of [
  'JavaScript:alert(1)', // mixed case
  'java\tscript:alert(1)', // embedded tab
  'java\nscript:alert(1)', // embedded newline
  '  javascript:alert(1)  ', // surrounding whitespace
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  'not a url',
]) {
  check(`reject ${JSON.stringify(bad)}`, isSafeHttpUrl(bad) === null)
}

console.log('isSafeHttpUrl — legitimate links pass unchanged')
for (const good of [
  'https://example.com/verify',
  'http://legacy.example.org',
  'mailto:vigil@youthewave.org',
  'tel:+58-212-000-0000',
]) {
  check(`allow ${JSON.stringify(good)}`, isSafeHttpUrl(good) === good)
}

// --- sanitizeText: no executable tag can survive, including the re-forming
//     pattern; legitimate accented text is preserved. ---
console.log('sanitizeText — HTML injection neutralized')
for (const payload of [
  '<script',
  '<img src=x onerror=alert(1)>',
  '<scr<script>ipt>alert(1)</script>',
  'javascript:alert(1)',
]) {
  const out = sanitizeText(payload)
  check(`no angle brackets left in ${JSON.stringify(payload)}`, !/[<>]/.test(out), `-> ${JSON.stringify(out)}`)
  check(`no javascript: scheme left in ${JSON.stringify(payload)}`, !/javascript:/i.test(out), `-> ${JSON.stringify(out)}`)
}

console.log('sanitizeText — legitimate text preserved')
check('accented name intact', sanitizeText('María José Ñáñez') === 'María José Ñáñez')
check('address intact', sanitizeText('Calle 5 con Av. Bolívar, Caracas') === 'Calle 5 con Av. Bolívar, Caracas')
check('whitespace collapsed + trimmed', sanitizeText('  hola   mundo  ') === 'hola mundo')

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
