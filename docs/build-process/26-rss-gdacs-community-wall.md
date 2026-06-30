# Vigil — RSS News Feed, GDACS Integration, Community Wall
## Paste into Cursor Composer (Agent mode)

---

## TASK A — GDACS Real-Time Disaster Feed (free, UN/EU official, no API key)

```typescript
// src/lib/gdacs.ts
// GDACS = Global Disaster Alert and Coordination System (UN + European Commission)
// Free, no auth required, JSON endpoint for most recent 100 events in last 4 days

export async function getGDACSEvents() {
  const res = await fetch(
    'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtypes=EQ&country=Venezuela',
    { next: { revalidate: 600 } } // 10 min cache
  )
  if (!res.ok) return []
  const data = await res.json()
  return data.features?.map((f: any) => ({
    title: f.properties.eventname || f.properties.name,
    alertLevel: f.properties.alertlevel, // Green/Orange/Red
    eventType: f.properties.eventtype,
    date: f.properties.fromdate,
    url: f.properties.url?.report,
    lat: f.geometry?.coordinates?.[1],
    lng: f.geometry?.coordinates?.[0],
  })) ?? []
}
```

Add to the `/api/live-info` route (built in an earlier session) alongside 
USGS and ReliefWeb data — GDACS gives an independent, UN-verified 
cross-check on alert severity, separate from raw USGS seismic readings.

## TASK B — RSS News Aggregation

Install a lightweight RSS parser:
```bash
npm install rss-parser
```

```typescript
// src/lib/rss.ts
import Parser from 'rss-parser'

const parser = new Parser()

const VENEZUELA_NEWS_FEEDS = [
  { name: 'El Nacional', url: 'https://www.elnacional.com/feed/' },
  { name: 'Infobae Venezuela', url: 'https://www.infobae.com/feeds/rss/venezuela/' },
  { name: 'Efecto Cocuyo', url: 'https://efectococuyo.com/feed/' },
]

export async function getVenezuelaNews(maxPerSource = 5) {
  const results = await Promise.allSettled(
    VENEZUELA_NEWS_FEEDS.map(async (source) => {
      const feed = await parser.parseURL(source.url)
      return feed.items.slice(0, maxPerSource).map(item => ({
        source: source.name,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet?.slice(0, 200),
      }))
    })
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<any>).value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
}
```

Add this as a clearly labeled secondary tier on `/informacion` and `/noticias`:

```
Fuentes Oficiales (verificadas)        ← existing ReliefWeb + OCHA + GDACS
─────────────────────────────────────
Prensa Venezolana (no verificado)      ← new RSS feed
```

Verify RSS feed URLs are actually correct/live before deploying — outlet 
RSS paths change. Test each with a direct curl before wiring into the app:
```bash
curl -s https://www.elnacional.com/feed/ | head -20
```
If any feed URL is dead, search for the correct current RSS path for that 
outlet or drop it from the list rather than showing a broken section.

## TASK C — Community Wall (Muro Comunitario)

General public message wall — NOT private chat. Same safety pattern as the 
existing missing-person notes system: public, append-only, rate-limited, 
flagged by default review, unverified badge shown.

### C1. Migration

```sql
CREATE TABLE community_wall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','aviso','solidaridad','pregunta')),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  location_label TEXT,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  reporter_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE community_wall;
ALTER TABLE community_wall ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_wall" ON community_wall FOR SELECT USING (flagged = false);
CREATE POLICY "public_insert_wall" ON community_wall FOR INSERT WITH CHECK (true);
CREATE INDEX idx_wall_created ON community_wall(created_at DESC) WHERE flagged = false;
```

Apply the SAME rate limiting already used elsewhere (5 submissions/hour per 
IP) — add `/api/community-wall/submit` to the existing middleware rate 
limit config from the original build.

### C2. UI — `/muro` page

Simple reverse-chronological feed, newest first, real-time subscription:
- Each message: author name, category badge (color-coded per existing 
  status badge pattern), message text, time ago, location if provided
- "Escribir un mensaje" button → simple form: name, category select, 
  message (300 char max), optional location
- Flag button on every message (same pattern as existing flag system)
- NO reply/thread feature — this is a wall, not chat, intentionally simple
- NO contact info field at all — this category doesn't need it, keeps 
  the feature genuinely low-risk

Categories with icons: Aviso (warning/announcement), Solidaridad 
(encouragement/support messages), Pregunta (general questions not tied to 
a specific missing person), General (everything else).

### C3. Add to navigation

Add "Muro" between Calendario and Punto de Acopio in both desktop sidebar 
and mobile Más sheet.

## Commit

```bash
git add -A
git commit -m "feat: GDACS real-time disaster feed, RSS news aggregation, community wall

- Added GDACS (UN/EU disaster alert system) as independent verified data source
- Added RSS aggregation from 3 Venezuelan news outlets, clearly labeled 
  separate from verified official sources
- Built community wall (Muro Comunitario) — public append-only messages, 
  same safety pattern as existing notes system (rate-limited, flaggable, 
  no contact info, no chat/reply threading)

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.

## Report back

1. Confirm GDACS data successfully returns events for Venezuela
2. Confirm which RSS feed URLs actually worked (curl-tested) vs needed 
   correction or removal
3. Confirm community wall rate limiting applies correctly (test: 6 rapid 
   submissions, confirm 6th is blocked)
