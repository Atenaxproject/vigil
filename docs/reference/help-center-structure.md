# Vigil — Help Center Structure

**Purpose:** Outline for in-app help section, FAQ pages, and support content  
**Primary language:** Spanish (ES) — translate to all 8 locales for production  
**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

---

## Recommended information architecture

**Status: IMPLEMENTED** — live at `/ayuda` (accordion sections, Spanish primary, i18n keys in locale JSON).

```
Help Center
├── Getting Started
├── Missing Persons
├── Map & Needs
├── Volunteers & Exchange
├── Safety & Trust
├── Connectivity & Infrastructure
├── Donations & Organizations
└── Legal & Privacy
```

---

## Getting started

### What is Vigil?

Vigil is a humanitarian crisis platform that brings together missing persons search, live maps, resource exchange, and official disaster data in one mobile-friendly app. It connects citizen reports with rescue teams, volunteers, and diaspora families.

### Is Vigil a government app?

No. Vigil is operated by Bbluestudios LLC under the YouTheWave initiative. It does not share user data with the Venezuelan government. See `/privacidad` for details.

### How do I install the app?

On mobile: open vigil.youthewave.org in Safari (iOS) or Chrome (Android) → Share → **Add to Home Screen**. The app works offline for queued submissions.

### Which languages are supported?

8 languages via the header switcher. Spanish is default.

### Is Vigil free?

Yes. Vigil is free to use. Donation links on `/donaciones` go directly to verified organizations, not to Vigil.

---

## Missing persons

### How do I search for someone?

Go to **Buscar** (`/buscar`). Enter a name (minimum 2 characters) or filter by estado. Results include Vigil records and federated results from partner platform DTV (clearly labeled).

### How do I report someone missing?

Go to **Reportar** (`/reportar`). Fill in details, provide private contact info, and accept consent. Save your **claim link** — it is the only way to manage your report without an account.

### What is a claim link?

A unique URL (`/mi-reporte/[token]`) that lets you update status, view contact requests, and manage your report without a password. Treat it like a password — do not share publicly.

### Can others see my phone number?

No. Contact information is never shown on public pages. Others request contact through Vigil; you are notified via your claim inbox.

### What do status badges mean?

| Status | Meaning |
|--------|---------|
| Missing | Active search |
| Found alive | Located and safe |
| Found deceased | Confirmed deceased |
| Unverified | Citizen submission not yet admin-verified |

### How does photo search work?

Upload a photo on the search page. AI describes visible traits (not biometric ID) and suggests possible matches from Vigil and DTV. Results are indicative — always verify with families and authorities.

### What is PFIF?

Person Finder Interchange Format — a standard for sharing missing persons data with Google Person Finder and other crisis tools. Vigil exports at `/api/pfif`.

### How do I add a sighting note?

On a person's detail page (`/buscar/[id]`), submit a public note with location and time of sighting. Do not include private contact info in notes.

---

## Map & needs

### How do I read the crisis map?

The home page map shows multiple layers: aftershocks, needs, resources, shelters, hospitals, and more. Use the layer panel (desktop) to toggle layers. A text list alternative is available for accessibility.

### How do I report "I need help"?

Go to **Necesito ayuda** (`/necesito-ayuda`) and drop a pin with a description. Rescuers see it on the map.

### What is a collection point (punto de acopio)?

A location accepting donated goods. Register at `/punto-de-acopio` or find existing points on the map layer.

### What are the map layer colors?

Layer-specific — see map legend on `/`. Property assessments use ATC-20 colors: green (safe), yellow (caution), red (unsafe).

---

## Volunteers & exchange

### How do I register as a volunteer?

Go to **Voluntarios** (`/voluntarios`), select skills and languages, and provide a contact method. Your name may be masked in the public directory.

### How does resource exchange work?

Go to **Intercambio** (`/intercambio`) to offer or request food, water, medicine, shelter, transport, equipment, or other resources. Listings expire after 7 days.

### How does contact matching work?

When someone wants your listing or volunteer profile, they submit a contact request. Vigil routes the request — phone numbers are never public on the board.

### Can I assess building safety?

Only if registered with structural skills and assigned by admin. Submit property reports at `/evaluacion-estructural`; assignment happens via admin queue.

---

## Safety & trust

### What does "unverified" mean?

The report was submitted by a citizen and has not been confirmed by an admin or official source. Treat as leads, not confirmed fact.

### How do I report inappropriate content?

**Community wall:** use the flag button on `/muro` (auto-hidden after 3 flags).  
**Missing persons:** no public flag API yet — contact support@youthewave.org.

### Are structural assessments official?

No. They are volunteer field opinions following ATC-20 guidelines, not government inspections. See Terms of Service §4.

### What is the emergency hotline?

[former rescue-coordination label] — always shown in the site banner. Vigil supplements but does not replace official emergency services.

---

## Connectivity & infrastructure

### How do I report WiFi or Starlink availability?

Go to **Conectividad** (`/conectividad`) and report signal type with location. Helps rescuers and families find working internet.

### Where do official disaster alerts come from?

`/informacion` aggregates USGS, GDACS, ReliefWeb, and live infrastructure status. `/noticias` shows ReliefWeb official updates.

---

## Donations & organizations

### Where should I donate?

`/donaciones` and `/como-ayudar` link to 26 verified organizations. Vigil does not process payments — links go directly to org donation pages.

### How do organizations get listed?

Submit via the org registration flow. Admin approval required before public visibility on `/organizaciones`.

### What are sister platforms?

Independent citizen crisis tools linked at `/red`. Each operates separately; Vigil federates search with DTV but does not control partner data.

---

## Legal & privacy

### Privacy policy

Spanish: `/privacidad` · English: `/privacy`

### Terms of service

Spanish: `/terminos` · English: `/terms`

### How do I request data erasure?

Contact support@youthewave.org. Erasure requests are logged in the `erasure_requests` table for admin processing.

### Who operates Vigil?

Bbluestudios LLC, Delray Beach, FL — YouTheWave humanitarian initiative.

---

## Internal admin help (not public)

Link from admin-only docs:

- [onboarding.md](./onboarding.md) — Admin section
- [sops.md](./sops.md) — All operational procedures
- [data-model.md](./data-model.md) — Database reference

---

## Content maintenance notes

- Update FAQ when new features ship (check [gaps in VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md#14-gaps--open-items)).
- Keep org count and sister platform count in sync with `crisis.config.ts`.
- All user-facing help strings must exist in all 8 locale JSON files under `messages/`.
