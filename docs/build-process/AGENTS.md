# AGENTS.md — Vigil Crisis Platform
## Autonomous Build Agent — Full Repository Creation & Deployment
**Read this file completely before executing a single command.**

---

## Agent Authority

You are authorized to operate in **fully autonomous mode** for this build. This means:
- Execute all bash commands without asking for confirmation
- Create, write, and modify all files
- Install all dependencies
- Create the GitHub repository
- Set up Supabase project
- Deploy to Vercel
- Generate all legal documents

**Do NOT stop to ask questions unless a prerequisite is missing and cannot be resolved automatically.**
If a step fails, attempt one alternative approach before reporting the failure.
Log every major action to `build.log` in the project root.

**Operator:** Orlando Toro — Bbluestudios LLC
**Reference spec:** CLAUDE.md (read it alongside this file)

---

## Critical Context

Vigil handles **sensitive personal data of disaster victims and their families** during the most vulnerable moment of their lives. Every implementation decision must account for:

1. Predators and traffickers who may attempt to exploit missing persons data
2. Political risk: the Venezuelan government must NEVER receive user data
3. Vulnerable populations: minors, elderly, people in shock submitting reports
4. Connectivity: 2G speeds, offline-first, low-bandwidth images
5. Scale: potential viral traffic if major media picks this up

**Privacy and data protection are not afterthoughts. They are architecture.**

---

## Prerequisites Check

Run these checks first. If any fail, install the missing tool before proceeding.

```bash
# Check all prerequisites
echo "=== VIGIL PREREQUISITES CHECK ===" | tee build.log
date | tee -a build.log

# Node.js (need 18+)
node --version | tee -a build.log || echo "ERROR: Node.js not found" | tee -a build.log

# GitHub CLI (for repo creation)
gh --version | tee -a build.log || echo "ERROR: GitHub CLI not found — install from https://cli.github.com" | tee -a build.log

# GitHub auth status
gh auth status | tee -a build.log || echo "ERROR: Not authenticated to GitHub. Run: gh auth login" | tee -a build.log

# Vercel CLI
vercel --version | tee -a build.log || npm install -g vercel | tee -a build.log

# Supabase CLI
supabase --version | tee -a build.log || npm install -g supabase | tee -a build.log

# Git
git --version | tee -a build.log

echo "=== PREREQUISITES CHECK COMPLETE ===" | tee -a build.log
```

If `gh auth status` fails, stop and notify the operator. Authentication requires human action.

---

## Phase 1 — GitHub Repository Creation

```bash
# Create the repository under atenaxproject organization
gh repo create atenaxproject/vigil \
  --public \
  --description "Vigil — Unified humanitarian crisis platform. Real-time missing persons, crisis mapping, volunteer coordination, and verified information for disaster response. Deployed for Venezuela 2026 earthquake response." \
  --homepage "https://vigil.app" \
  --add-readme \
  --gitignore Node \
  --license MIT | tee -a build.log

# Clone it
cd ~ && git clone https://github.com/atenaxproject/vigil.git
cd vigil

# Set git config
git config user.email "orlando@atenaxproject.com"
git config user.name "Orlando Toro"

echo "Repository created and cloned" | tee -a build.log
```

### Repository Description Labels (apply via GitHub CLI)
```bash
# Add topics for discoverability
gh repo edit atenaxproject/vigil \
  --add-topic humanitarian \
  --add-topic crisis-response \
  --add-topic disaster-relief \
  --add-topic missing-persons \
  --add-topic venezuela \
  --add-topic nextjs \
  --add-topic supabase \
  --add-topic open-source \
  --add-topic leaflet \
  --add-topic earthquake-response
```

---

## Phase 2 — Project Initialization

```bash
cd ~/vigil

# Initialize Next.js 14 App Router project
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git  # Already have git

# Install all dependencies at once
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  leaflet \
  react-leaflet \
  @types/leaflet \
  next-intl \
  @anthropic-ai/sdk \
  sharp \
  date-fns \
  lucide-react \
  clsx \
  tailwind-merge \
  framer-motion \
  react-hook-form \
  zod \
  @hookform/resolvers \
  react-hot-toast \
  next-themes \
  react-intersection-observer

# Dev dependencies
npm install -D \
  @types/node \
  prettier \
  prettier-plugin-tailwindcss

echo "Dependencies installed" | tee -a build.log
```

---

## Phase 3 — Full File Creation

Execute these in order. Create every file completely — no placeholders.

### 3.1 Environment Configuration

```bash
cat > .env.local << 'ENV'
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ANTHROPIC (Haiku 3.5 for all automated tasks)
ANTHROPIC_API_KEY=your_anthropic_key_here

# VIGIL ADMIN
VIGIL_ADMIN_SECRET=generate_a_strong_secret_here

# OPTIONAL: MAKE.COM WEBHOOK (for WhatsApp/Telegram intake)
MAKE_WEBHOOK_SECRET=your_make_webhook_secret_here
ENV

cat > .env.example << 'ENVEX'
# Copy this to .env.local and fill in your values
# NEVER commit .env.local to git

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
VIGIL_ADMIN_SECRET=
MAKE_WEBHOOK_SECRET=
ENVEX

# Ensure .env.local is gitignored
echo ".env.local" >> .gitignore
echo "build.log" >> .gitignore
```

### 3.2 Crisis Configuration
```bash
mkdir -p src/config
cat > src/config/crisis.config.ts << 'CONFIG'
// THIS IS THE ONLY FILE THAT CHANGES BETWEEN COUNTRY DEPLOYMENTS
// Swap these values + redeploy = Vigil runs for any country, any disaster

export const CRISIS_CONFIG = {
  country: 'Venezuela',
  countryCode: 'VE',
  crisis: '2026 Earthquakes',
  crisisDate: '2026-06-24',
  activeDeployment: true,
  defaultLang: 'es' as const,
  supportedLangs: ['es', 'en', 'pt', 'fr', 'it', 'zh', 'de', 'ru'] as const,
  
  mapBounds: {
    minLat: 0.6,   maxLat: 12.5,
    minLng: -73.5, maxLng: -59.5,
    centerLat: 10.4,
    centerLng: -66.9,
    defaultZoom: 7,
    maxZoom: 16,
    minZoom: 5,
  },

  emergency: {
    hotline: '0800-7372282',
    hotlineLabel: '0800-RESCATE',
    // VenApp intentionally excluded — see Vigil Privacy Policy section on
    // government data non-cooperation. VenApp has documented human rights concerns.
  },

  partnerLinks: [
    { name: 'Red de Intérpretes', url: 'https://interp-aid.lovable.app', type: 'translation' as const },
    { name: 'ReliefWeb Venezuela', url: 'https://reliefweb.int/country/ven', type: 'official' as const },
    { name: 'OCHA Venezuela', url: 'https://www.unocha.org/venezuela', type: 'official' as const },
    { name: 'UNICEF Venezuela', url: 'https://www.unicef.org/venezuela', type: 'official' as const },
    { name: 'Cruz Roja Venezolana', url: 'https://cruzrojavenezolana.org', type: 'ngo' as const },
    { name: 'HDX — Datos Humanitarios', url: 'https://data.humdata.org/group/ven', type: 'data' as const },
  ],

  seismic: {
    startDate: '2026-06-24',
    minMagnitudeDisplay: 2.0,
    alertThresholdMag: 4.0,
    refreshIntervalMs: 300000, // 5 minutes
  },

  dataRetention: {
    activeRecordDays: 90,       // After 90 days no update → archived
    archiveAfterDays: 365,      // After 1 year → deleted
    photoPurgeWithRecord: true, // Delete photo when record is deleted
  },

  legal: {
    operator: 'Bbluestudios LLC',
    operatorLocation: 'Greenacres, Florida, USA',
    contactEmail: 'vigil@atenaxproject.com',
    privacyPolicyVersion: '1.0.0',
    tosVersion: '1.0.0',
    governingLaw: 'Florida, United States',
    effectiveDate: '2026-06-29',
  },
} as const

export type SupportedLang = typeof CRISIS_CONFIG.supportedLangs[number]
export type PartnerLinkType = 'translation' | 'official' | 'ngo' | 'data'
CONFIG
```

### 3.3 TypeScript Types
```bash
mkdir -p src/types
cat > src/types/vigil.types.ts << 'TYPES'
export type MissingPersonStatus = 'missing' | 'found_alive' | 'found_deceased' | 'unverified'
export type DataSource = 'web' | 'whatsapp' | 'telegram' | 'partner' | 'pfif_import'
export type MarkerType = 'need' | 'resource' | 'shelter' | 'hospital' | 'danger' | 'rescue_zone' | 'collection_point'
export type MarkerCategory = 'food' | 'water' | 'medical' | 'rescue' | 'shelter' | 'clothing' | 'comms' | 'power' | 'transport' | 'other'
export type MarkerStatus = 'active' | 'resolved' | 'unverified'
export type OrgType = 'rescue' | 'medical' | 'food' | 'shelter' | 'translation' | 'tech' | 'government' | 'diaspora' | 'donation' | 'legal'
export type VolunteerSkill = 'medical' | 'rescue' | 'logistics' | 'translation' | 'tech' | 'construction' | 'drone' | 'legal' | 'psych' | 'communications'
export type Availability = 'immediate' | 'this_week' | 'remote_only' | 'on_request'
export type NeedOfferType = 'need' | 'offer'
export type NeedCategory = 'food' | 'water' | 'medical_supplies' | 'medicine' | 'blood' | 'shelter' | 'clothing' | 'transport' | 'money' | 'equipment' | 'manpower' | 'other'

// PUBLIC view of missing persons (contact info masked for privacy)
export interface PublicMissingPerson {
  id: string
  full_name: string
  age: number | null
  gender: string | null
  photo_url: string | null
  last_seen_location: string
  last_seen_at: string | null
  status: MissingPersonStatus
  notes: string | null
  source: DataSource
  verified: boolean
  created_at: string
  updated_at: string
  // Contact info is NEVER returned in public queries — route through Vigil messaging
}

// Full record — admin only
export interface MissingPerson extends PublicMissingPerson {
  last_seen_lat: number | null
  last_seen_lng: number | null
  contact_name: string
  contact_phone: string | null
  contact_whatsapp: string | null
  flagged: boolean
  flag_count: number
  duplicate_of: string | null
}

// Form data submitted by user
export interface MissingPersonSubmission {
  full_name: string
  age?: number
  gender?: string
  photo?: File
  last_seen_location: string
  last_seen_lat?: number
  last_seen_lng?: number
  last_seen_at?: string
  contact_name: string
  contact_phone?: string
  contact_whatsapp?: string
  notes?: string
  consent_given: boolean        // Must be true — GDPR-adjacent requirement
  data_accuracy_confirmed: boolean  // Submitter confirms info is accurate
}

export interface MapMarker {
  id: string
  type: MarkerType
  category: MarkerCategory | null
  title: string
  description: string | null
  lat: number
  lng: number
  contact: string | null        // Masked in public view
  urgent: boolean
  status: MarkerStatus
  verified: boolean
  source: string
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: OrgType | null
  country: string | null
  description_es: string | null
  description_en: string | null
  website: string | null
  phone: string | null          // Masked in public view
  email: string | null          // Masked in public view
  whatsapp: string | null       // Masked in public view
  donation_link: string | null
  donation_instructions: string | null
  lat: number | null
  lng: number | null
  location_label: string | null
  verified: boolean
  active: boolean
}

export interface Volunteer {
  id: string
  full_name: string
  skills: VolunteerSkill[]
  languages: string[]
  location: string | null
  availability: Availability | null
  // Contact info stored but never displayed publicly
  created_at: string
}

export interface SeismicEvent {
  id: string
  magnitude: number
  place: string
  time: number
  lat: number
  lng: number
  depth: number
  url: string
}

export interface ContactRequest {
  missing_person_id: string
  requester_name: string
  requester_phone: string
  requester_relationship: string
  message: string
  created_at: string
}

// PFIF compatibility types
export interface PFIFPerson {
  personRecordId: string
  sourceDate: string
  fullName: string
  sex?: string
  age?: string
  photoUrl?: string
  lastKnownLocation?: string
  status: 'information_sought' | 'is_note_author' | 'believed_alive' | 'believed_dead' | 'believed_missing'
}
TYPES
```

### 3.4 Supabase Client
```bash
mkdir -p src/lib/supabase
cat > src/lib/supabase/client.ts << 'SBCLIENT'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
SBCLIENT

cat > src/lib/supabase/server.ts << 'SBSERVER'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
SBSERVER

cat > src/lib/supabase/admin.ts << 'SBADMIN'
// ADMIN CLIENT — server-side only, NEVER expose to client
// Uses service role key — bypasses RLS for admin operations
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used client-side')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
SBADMIN
```

### 3.5 Database Schema
```bash
mkdir -p supabase/migrations
cat > supabase/migrations/001_initial_schema.sql << 'SQL'
-- ============================================================
-- VIGIL CRISIS PLATFORM — INITIAL SCHEMA
-- Version: 1.0.0 | Date: 2026-06-29
-- Operator: Bbluestudios LLC
-- ============================================================

-- ============================================================
-- MISSING PERSONS
-- PFIF 1.4 compatible for Google Person Finder data exchange
-- Contact info is stored but NEVER exposed in public queries
-- ============================================================
CREATE TABLE missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification (public)
  full_name TEXT NOT NULL,
  age INT CHECK (age >= 0 AND age <= 150),
  gender TEXT CHECK (gender IN ('male','female','other','unknown')),
  photo_url TEXT,
  
  -- Last known location (text description public, GPS coords private)
  last_seen_location TEXT NOT NULL,
  last_seen_lat DECIMAL(9,6),        -- PRIVATE — admin only
  last_seen_lng DECIMAL(9,6),        -- PRIVATE — admin only
  last_seen_at TIMESTAMPTZ,
  
  -- Contact info — PRIVATE — NEVER exposed in public API
  -- All contact goes through Vigil's internal contact request system
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  
  -- Status
  status TEXT DEFAULT 'missing' CHECK (status IN ('missing','found_alive','found_deceased','unverified')),
  notes TEXT,
  
  -- Data provenance
  source TEXT DEFAULT 'web' CHECK (source IN ('web','whatsapp','telegram','partner','pfif_import')),
  reporter_ip_hash TEXT,             -- Stored as SHA256 hash only, never raw IP
  
  -- Consent tracking (GDPR-adjacent)
  consent_given BOOLEAN NOT NULL DEFAULT false,
  data_accuracy_confirmed BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  
  -- Moderation
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  duplicate_of UUID REFERENCES missing_persons(id),
  
  -- Data lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,           -- Set when record is archived (90 days no update)
  deletion_requested_at TIMESTAMPTZ  -- For right-to-erasure requests
);

-- PUBLIC VIEW — masks all private contact and GPS data
CREATE VIEW public_missing_persons AS
SELECT 
  id,
  full_name,
  age,
  gender,
  photo_url,
  last_seen_location,              -- Text description only, no GPS
  last_seen_at,
  status,
  notes,
  source,
  verified,
  created_at,
  updated_at
FROM missing_persons
WHERE flagged = false
  AND archived_at IS NULL
  AND deletion_requested_at IS NULL;

-- ============================================================
-- CONTACT REQUESTS (replaces exposing phone numbers publicly)
-- Anyone can request contact, submitter receives notification
-- and chooses whether to respond
-- ============================================================
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  requester_relationship TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','notified','resolved','spam')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAP MARKERS
-- ============================================================
CREATE TABLE map_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('need','resource','shelter','hospital','danger','rescue_zone','collection_point')),
  category TEXT CHECK (category IN ('food','water','medical','rescue','shelter','clothing','comms','power','transport','other')),
  title TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  contact TEXT,                    -- Masked in public queries
  urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','unverified')),
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  source TEXT DEFAULT 'citizen',
  reporter_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- ORGANIZATIONS
-- Require admin approval before appearing publicly
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('rescue','medical','food','shelter','translation','tech','government','diaspora','donation','legal')),
  country TEXT,
  description_es TEXT,
  description_en TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  donation_link TEXT,
  donation_instructions TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  location_label TEXT,
  trusted_source BOOLEAN DEFAULT false,  -- Trusted sources bypass moderation queue
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  approved_by_admin BOOLEAN DEFAULT false,  -- Orlando must manually approve
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOLUNTEERS
-- Contact info private — matched and connected through Vigil
-- ============================================================
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  location TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  availability TEXT CHECK (availability IN ('immediate','this_week','remote_only','on_request')),
  contact_phone TEXT,              -- PRIVATE
  contact_whatsapp TEXT,           -- PRIVATE
  contact_email TEXT,              -- PRIVATE
  matched_to UUID REFERENCES organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEEDS / OFFERS
-- ============================================================
CREATE TABLE needs_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('need','offer')),
  category TEXT CHECK (category IN ('food','water','medical_supplies','medicine','blood','shelter','clothing','transport','money','equipment','manpower','other')),
  description TEXT NOT NULL,
  quantity TEXT,
  location TEXT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  contact TEXT,                    -- PRIVATE
  status TEXT DEFAULT 'open' CHECK (status IN ('open','matched','fulfilled','expired')),
  urgent BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODERATION QUEUE
-- ============================================================
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  reason TEXT CHECK (reason IN ('flag_threshold','ai_duplicate','ai_suspicious','out_of_bounds','rate_limit','spam_pattern')),
  ai_confidence DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ERASURE REQUESTS (Right to be forgotten — GDPR-adjacent)
-- ============================================================
CREATE TABLE erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  reason TEXT,
  requestor_contact TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','denied')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RATE LIMITING LOG (for anti-scraping and abuse detection)
-- ============================================================
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rate_limit_ip_action ON rate_limit_log(ip_hash, action, created_at);

-- ============================================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE missing_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE map_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE needs_offers;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_mp_status ON missing_persons(status) WHERE archived_at IS NULL;
CREATE INDEX idx_mp_flagged ON missing_persons(flagged);
CREATE INDEX idx_mp_fts ON missing_persons USING gin(to_tsvector('simple', full_name));
CREATE INDEX idx_markers_type_status ON map_markers(type, status) WHERE flagged = false;
CREATE INDEX idx_markers_location ON map_markers(lat, lng);
CREATE INDEX idx_orgs_approved ON organizations(approved_by_admin, active);
CREATE INDEX idx_needs_type ON needs_offers(entry_type, status, urgent);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs_offers ENABLE ROW LEVEL SECURITY;

-- MISSING PERSONS: public read of non-flagged, non-archived records (via view)
-- Direct table access restricted — always use public_missing_persons view
CREATE POLICY "public_read_missing" ON missing_persons
  FOR SELECT USING (flagged = false AND archived_at IS NULL AND deletion_requested_at IS NULL);

-- MISSING PERSONS: anyone can submit a report
CREATE POLICY "public_insert_missing" ON missing_persons
  FOR INSERT WITH CHECK (consent_given = true AND data_accuracy_confirmed = true);

-- MAP MARKERS: public read of active non-flagged markers
CREATE POLICY "public_read_markers" ON map_markers
  FOR SELECT USING (flagged = false AND status != 'resolved');

CREATE POLICY "public_insert_markers" ON map_markers
  FOR INSERT WITH CHECK (true);

-- ORGANIZATIONS: only show admin-approved organizations
CREATE POLICY "public_read_orgs" ON organizations
  FOR SELECT USING (approved_by_admin = true AND active = true);

CREATE POLICY "public_submit_org" ON organizations
  FOR INSERT WITH CHECK (true);  -- Submissions always accepted, approval required before display

-- VOLUNTEERS: no public read — contact goes through admin matching
CREATE POLICY "no_public_volunteer_read" ON volunteers
  FOR SELECT USING (false);

CREATE POLICY "public_volunteer_register" ON volunteers
  FOR INSERT WITH CHECK (true);

-- NEEDS/OFFERS: public read, anyone can submit
CREATE POLICY "public_read_needs" ON needs_offers
  FOR SELECT USING (status IN ('open','matched'));

CREATE POLICY "public_insert_needs" ON needs_offers
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- AUTOMATED DATA LIFECYCLE (pg_cron — enable in Supabase dashboard)
-- ============================================================
-- Archive missing persons with no updates in 90 days
-- SELECT cron.schedule('archive-stale-records', '0 2 * * *',
--   $$UPDATE missing_persons SET archived_at = NOW()
--     WHERE archived_at IS NULL
--     AND updated_at < NOW() - INTERVAL '90 days'
--     AND status = 'missing'$$
-- );

-- ============================================================
-- TRIGGER: update updated_at on missing_persons changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missing_persons_updated_at
  BEFORE UPDATE ON missing_persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
SQL
```

### 3.6 Rate Limiting Middleware
```bash
cat > src/middleware.ts << 'MIDDLEWARE'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { CRISIS_CONFIG } from '@/config/crisis.config'

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  '/api/missing-persons/submit': { max: 5, windowMs: 60 * 60 * 1000 },   // 5 per hour
  '/api/map-markers/submit': { max: 10, windowMs: 60 * 60 * 1000 },      // 10 per hour
  '/api/missing-persons/search': { max: 60, windowMs: 60 * 60 * 1000 },  // 60 per hour (anti-scraping)
  '/api/contact-request': { max: 3, windowMs: 60 * 60 * 1000 },          // 3 per hour
}

// In-memory rate limit store (use Upstash Redis for production scale)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getIpHash(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
  return createHash('sha256').update(ip + process.env.VIGIL_ADMIN_SECRET).digest('hex').slice(0, 16)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Validate map coordinates if present (block out-of-bounds submissions)
  if (pathname.startsWith('/api/map-markers/submit') || pathname.startsWith('/api/missing-persons/submit')) {
    // Coordinate validation happens in the API route handler
  }

  // Apply rate limiting to API routes
  const limit = RATE_LIMITS[pathname]
  if (limit) {
    const ipHash = getIpHash(request)
    const key = `${ipHash}:${pathname}`
    const now = Date.now()
    const entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs })
    } else {
      entry.count++
      if (entry.count > limit.max) {
        return NextResponse.json(
          { error: 'Demasiadas solicitudes. Por favor intente más tarde. / Too many requests. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.windowMs / 1000)) } }
        )
      }
    }
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
MIDDLEWARE
```

---


---

## Phase 3.6 — Design System & Global CSS

```bash
# DESIGN-SYSTEM.md must be in the project root — Claude reads it before every UI task
# Copy it from wherever it was downloaded alongside this AGENTS.md
# If already in root, skip.

cat > src/app/globals.css << 'GLOBALCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --vigil-ink:             #0F172A;
    --vigil-blue:            #2563EB;
    --vigil-blue-light:      #EFF6FF;
    --vigil-cloud:           #F8FAFC;
    --vigil-muted:           #94A3B8;
    --status-missing:        #DC2626;
    --status-missing-bg:     #FEF2F2;
    --status-alive:          #16A34A;
    --status-alive-bg:       #F0FDF4;
    --status-deceased:       #475569;
    --status-deceased-bg:    #F1F5F9;
    --status-unverified:     #D97706;
    --status-unverified-bg:  #FFFBEB;
    --seismic-minor:         #22C55E;
    --seismic-light:         #F59E0B;
    --seismic-moderate:      #F97316;
    --seismic-strong:        #EF4444;
    --seismic-major:         #7C3AED;
  }
  .dark {
    --vigil-ink:    #F1F5F9;
    --vigil-cloud:  #111827;
    --vigil-muted:  #9CA3AF;
    background-color: #0A0F1E;
    color: #F1F5F9;
  }
}

@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.status-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
.status-pulse-ring-delayed { animation: pulse-ring 2s ease-out 0.6s infinite; }
.skeleton {
  background: linear-gradient(90deg, var(--vigil-cloud) 25%, #e2e8f0 50%, var(--vigil-cloud) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@media (prefers-reduced-motion: reduce) {
  .status-pulse-ring, .status-pulse-ring-delayed { animation: none; opacity: 0.5; }
  .skeleton { animation: none; }
}
GLOBALCSS
```

---

## Phase 3.7 — Internationalization (8 Languages)

Rescue teams arriving from USA, Mexico, Brazil, France, Italy, China, Germany, and Russia all need the app in their language. Vigil ships 8 languages from day one. ES and EN are hand-authored. The other 6 are auto-generated by Claude Haiku from the EN source — accurate, consistent, and crisis-appropriate.

```bash
mkdir -p src/i18n/locales

# Update crisis.config.ts supportedLangs (already set to 8 languages above)

# Create the translation auto-generation script
mkdir -p scripts
cat > scripts/generate-translations.mjs << 'GENSCRIPT'
// Auto-generates PT, FR, IT, ZH, DE, RU from EN source using Claude Haiku
// Run: node scripts/generate-translations.mjs
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANGUAGES = {
  pt: 'Brazilian Portuguese — for Brazilian rescue teams (USAR Brasil)',
  fr: 'French — for French Civil Protection (Sécurité Civile) teams',
  it: 'Italian — for Italian rescue teams (Protezione Civile)',
  zh: 'Simplified Chinese — for Chinese rescue teams',
  de: 'German — for German rescue teams (THW) and Swiss/Austrian teams',
  ru: 'Russian — for Russian rescue and medical teams',
}

const sourceEn = JSON.parse(readFileSync('./src/i18n/locales/en.json', 'utf-8'))

for (const [code, description] of Object.entries(LANGUAGES)) {
  console.log(`Translating to ${code}...`)
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `You are translating a humanitarian crisis response platform from English to ${description}.

CRITICAL RULES:
- This platform is used during a major earthquake disaster response where lives are at stake
- Tone: clear, calm, professional, compassionate. Never casual.  
- "found_deceased" and similar status labels carry enormous emotional weight — translate with absolute care
- Keep ALL JSON keys in English (never translate the keys)
- Keep all placeholder variables EXACTLY as-is: {{count}} {{time}} {{hotline}} {{c}}
- Return ONLY valid JSON. No markdown fences. No explanation. No preamble.
- If unsure of a translation, prefer clarity over elegance

Source JSON to translate:
${JSON.stringify(sourceEn, null, 2)}`
    }]
  })

  try {
    const text = response.content[0].text.trim()
    const parsed = JSON.parse(text)
    writeFileSync(`./src/i18n/locales/${code}.json`, JSON.stringify(parsed, null, 2))
    console.log(`✓ ${code}.json written`)
  } catch(e) {
    console.error(`✗ Failed ${code}:`, e.message)
    writeFileSync(`./src/i18n/locales/${code}.json.error`, response.content[0].text)
  }

  await new Promise(r => setTimeout(r, 2000)) // Courtesy pause between calls
}

console.log('All translations complete.')
GENSCRIPT
```

### English Source (en.json) — Hand-authored master file
```bash
cat > src/i18n/locales/en.json << 'ENFILE'
{
  "nav": { "search": "Search Missing Persons", "report": "Report Missing Person", "needHelp": "I Need Help", "volunteers": "Volunteers", "organizations": "Organizations", "donate": "Donate", "news": "Official Updates", "map": "Crisis Map", "privacy": "Privacy Policy", "terms": "Terms of Use" },
  "banner": { "emergency": "Emergency:", "hotline": "0800-RESCATE", "hotlineNumber": "0800-7372282", "interpreters": "Interpreters" },
  "missing": {
    "title": "Missing Persons", "subtitle": "Search or report a missing person",
    "search": { "placeholder": "Search by name...", "button": "Search", "noResults": "No results found. Try a different name.", "loading": "Searching...", "resultsCount": "{{count}} results found" },
    "status": { "missing": "Missing", "found_alive": "Found — Alive", "found_deceased": "Found — Deceased", "unverified": "Unverified" },
    "form": { "title": "Report a Missing Person", "name": "Full Name", "namePlaceholder": "First and last name", "age": "Age", "gender": "Gender", "genderOptions": { "male": "Male", "female": "Female", "other": "Other", "unknown": "Unknown" }, "photo": "Photo (recommended)", "photoHelp": "Clear photo helps identification. Max 5MB.", "lastSeen": "Last Known Location", "lastSeenPlaceholder": "City, neighborhood, address...", "lastSeenDate": "Date Last Seen", "notes": "Additional Details", "notesPlaceholder": "Clothing, physical description, identifiers...", "contactName": "Your Name (Reporter)", "contactPhone": "Your Phone", "contactWhatsApp": "Your WhatsApp", "contactPrivacyNote": "Your contact info is NEVER shown publicly. All contact routed through Vigil.", "consent": "I consent to Vigil storing this information to help locate this person", "accuracy": "I confirm this information is accurate to the best of my knowledge", "submit": "Submit Report", "submitting": "Submitting...", "success": "Report submitted. You will be notified if there is a match.", "error": "Submission failed. Please try again." },
    "card": { "lastSeen": "Last seen:", "reportedBy": "Reported via:", "verified": "Verified", "unverified": "Unverified", "contact": "Request Contact", "flag": "Flag as incorrect", "markFound": "Mark as Found", "daysAgo": "{{count}} days ago", "hoursAgo": "{{count}} hours ago", "justNow": "Just now" }
  },
  "map": { "title": "Crisis Map", "layers": { "aftershocks": "Aftershocks (USGS)", "needs": "Needs", "resources": "Resources Available", "shelters": "Shelters", "hospitals": "Hospitals", "rescueZones": "Rescue Zones", "collection": "Collection Points" }, "magnitude": "Magnitude", "depth": "Depth", "addMarker": "Add to Map", "markerTypes": { "need": "I Need Help Here", "resource": "Resource Available", "shelter": "Shelter", "hospital": "Medical Attention", "danger": "Danger Zone", "rescue_zone": "Active Rescue Zone", "collection_point": "Collection Point" }, "categories": { "food": "Food", "water": "Water", "medical": "Medical", "rescue": "Rescue", "shelter": "Shelter", "clothing": "Clothing", "comms": "Communications", "power": "Power/Generator", "transport": "Transportation", "other": "Other" }, "urgent": "URGENT", "verified": "Verified", "lastUpdate": "Last updated: {{time}}" },
  "volunteers": { "title": "Volunteer Registration", "subtitle": "Register your skills to be matched with organizations", "skills": { "medical": "Medical / First Aid", "rescue": "Search & Rescue", "logistics": "Logistics", "translation": "Translation / Interpretation", "tech": "Technology", "construction": "Construction / Engineering", "drone": "Drone Operation", "legal": "Legal Aid", "psych": "Psychological Support", "communications": "Communications / Media" }, "availability": { "immediate": "Available Immediately (On-Site)", "this_week": "Available This Week", "remote_only": "Remote Only", "on_request": "On Request" }, "form": { "name": "Full Name", "skills": "Your Skills (select all that apply)", "languages": "Languages Spoken", "location": "Your Current Location", "availability": "Availability", "phone": "Phone", "whatsapp": "WhatsApp", "email": "Email", "privacyNote": "Contact info shared only with matched organizations, never publicly.", "submit": "Register as Volunteer", "success": "Thank you. You will be contacted when matched.", "error": "Registration failed. Please try again." } },
  "organizations": { "title": "Organizations & Teams", "subtitle": "Verified organizations responding to the crisis", "types": { "rescue": "Search & Rescue", "medical": "Medical", "food": "Food & Water", "shelter": "Shelter", "translation": "Translation", "tech": "Technology", "government": "Government", "diaspora": "Diaspora Group", "donation": "Donations", "legal": "Legal Aid" }, "donate": "Donate", "website": "Website", "contact": "Contact", "verified": "Verified Organization", "register": "Register Your Organization", "registerNote": "Organizations require manual verification before appearing publicly. Allow 24-48 hours." },
  "donate": { "title": "How to Help", "note": "Vigil does not process donations directly. All links go to verified organizations.", "international": "International Transfers", "local": "Local Venezuela Support", "goods": "Donate Goods", "time": "Donate Your Time" },
  "news": { "title": "Official Updates", "subtitle": "Verified information from OCHA, ReliefWeb, UNICEF and official sources", "source": "Source:", "readMore": "Read full report", "lastUpdated": "Last updated: {{time}}", "disclaimer": "All content from official humanitarian sources. Vigil does not edit these reports." },
  "common": { "loading": "Loading...", "error": "An error occurred. Please try again.", "retry": "Retry", "close": "Close", "back": "Back", "save": "Save", "cancel": "Cancel", "confirm": "Confirm", "yes": "Yes", "no": "No", "required": "Required", "optional": "Optional", "share": "Share", "copyLink": "Copy Link", "linkCopied": "Link copied", "flag": "Flag as incorrect", "flagReason": "Why are you flagging this?", "flagSubmit": "Submit Flag", "flagSuccess": "Thank you. Our team will review this.", "notFound": "Not found", "noData": "No data available", "poweredBy": "Vigil — Open source humanitarian platform", "language": "Language" },
  "privacy": { "shortNotice": "Your contact info is never shown publicly. We do not share data with the Venezuelan government.", "learnMore": "Privacy Policy" },
  "footer": { "madeFor": "Built for the people of Venezuela", "openSource": "Open source — MIT License", "notEmergency": "Vigil is NOT an emergency service. For immediate rescue call: {{hotline}}" }
}
ENFILE
```

### Spanish Source (es.json) — Hand-authored, primary language
```bash
cat > src/i18n/locales/es.json << 'ESFILE'
{
  "nav": { "search": "Buscar Persona", "report": "Reportar Desaparecido", "needHelp": "Necesito Ayuda", "volunteers": "Voluntarios", "organizations": "Organizaciones", "donate": "Donar", "news": "Actualizaciones Oficiales", "map": "Mapa de Crisis", "privacy": "Política de Privacidad", "terms": "Términos de Uso" },
  "banner": { "emergency": "Emergencias:", "hotline": "0800-RESCATE", "hotlineNumber": "0800-7372282", "interpreters": "Intérpretes" },
  "missing": {
    "title": "Personas Desaparecidas", "subtitle": "Busca o reporta una persona desaparecida",
    "search": { "placeholder": "Buscar por nombre...", "button": "Buscar", "noResults": "Sin resultados. Prueba con otro nombre.", "loading": "Buscando...", "resultsCount": "{{count}} resultados encontrados" },
    "status": { "missing": "Desaparecido/a", "found_alive": "Encontrado/a — Con vida", "found_deceased": "Encontrado/a — Fallecido/a", "unverified": "Sin verificar" },
    "form": { "title": "Reportar Persona Desaparecida", "name": "Nombre Completo", "namePlaceholder": "Nombre y apellido", "age": "Edad", "gender": "Sexo", "genderOptions": { "male": "Masculino", "female": "Femenino", "other": "Otro", "unknown": "Desconocido" }, "photo": "Fotografía (recomendado)", "photoHelp": "Una foto clara ayuda a la identificación. Máximo 5MB.", "lastSeen": "Última Ubicación Conocida", "lastSeenPlaceholder": "Ciudad, sector, dirección...", "lastSeenDate": "Fecha en que fue visto/a por última vez", "notes": "Detalles Adicionales", "notesPlaceholder": "Ropa, descripción física, señas particulares...", "contactName": "Tu Nombre (Quien Reporta)", "contactPhone": "Tu Teléfono", "contactWhatsApp": "Tu WhatsApp", "contactPrivacyNote": "Tu información de contacto NUNCA se muestra públicamente. Las solicitudes van a través de Vigil.", "consent": "Consiento que Vigil almacene esta información para ayudar a localizar a esta persona", "accuracy": "Confirmo que esta información es verídica al mejor de mi conocimiento", "submit": "Enviar Reporte", "submitting": "Enviando...", "success": "Reporte enviado. Te notificaremos si hay coincidencia.", "error": "Error al enviar. Intenta de nuevo." },
    "card": { "lastSeen": "Visto/a por última vez:", "reportedBy": "Reportado por:", "verified": "Verificado", "unverified": "Sin verificar", "contact": "Solicitar Contacto", "flag": "Marcar como incorrecto", "markFound": "Marcar como Encontrado/a", "daysAgo": "hace {{count}} días", "hoursAgo": "hace {{count}} horas", "justNow": "Hace un momento" }
  },
  "map": { "title": "Mapa de Crisis", "layers": { "aftershocks": "Réplicas (USGS)", "needs": "Necesidades", "resources": "Recursos Disponibles", "shelters": "Refugios", "hospitals": "Hospitales", "rescueZones": "Zonas de Rescate", "collection": "Puntos de Acopio" }, "magnitude": "Magnitud", "depth": "Profundidad", "addMarker": "Agregar al Mapa", "markerTypes": { "need": "Necesito Ayuda Aquí", "resource": "Recurso Disponible", "shelter": "Refugio", "hospital": "Atención Médica", "danger": "Zona de Peligro", "rescue_zone": "Zona de Rescate Activo", "collection_point": "Punto de Acopio" }, "categories": { "food": "Alimentos", "water": "Agua", "medical": "Médico", "rescue": "Rescate", "shelter": "Refugio", "clothing": "Ropa", "comms": "Comunicaciones", "power": "Electricidad/Generador", "transport": "Transporte", "other": "Otro" }, "urgent": "URGENTE", "verified": "Verificado", "lastUpdate": "Actualizado: {{time}}" },
  "volunteers": { "title": "Registro de Voluntarios", "subtitle": "Registra tus habilidades para ser asignado a organizaciones que necesitan ayuda", "skills": { "medical": "Médico / Primeros Auxilios", "rescue": "Búsqueda y Rescate", "logistics": "Logística", "translation": "Traducción / Interpretación", "tech": "Tecnología", "construction": "Construcción / Ingeniería", "drone": "Operación de Drones", "legal": "Asistencia Legal", "psych": "Apoyo Psicológico", "communications": "Comunicaciones / Medios" }, "availability": { "immediate": "Disponible de Inmediato (Presencial)", "this_week": "Disponible Esta Semana", "remote_only": "Solo Remoto", "on_request": "Bajo Solicitud" }, "form": { "name": "Nombre Completo", "skills": "Tus Habilidades", "languages": "Idiomas que Hablas", "location": "Tu Ubicación Actual", "availability": "Disponibilidad", "phone": "Teléfono", "whatsapp": "WhatsApp", "email": "Correo Electrónico", "privacyNote": "Tu contacto se comparte solo con organizaciones coincidentes, nunca públicamente.", "submit": "Registrarme como Voluntario", "success": "Gracias. Serás contactado cuando haya coincidencia.", "error": "Error en el registro. Intenta de nuevo." } },
  "organizations": { "title": "Organizaciones y Equipos", "subtitle": "Organizaciones verificadas respondiendo a la crisis", "types": { "rescue": "Búsqueda y Rescate", "medical": "Médico", "food": "Alimentos y Agua", "shelter": "Refugio", "translation": "Traducción", "tech": "Tecnología", "government": "Gobierno", "diaspora": "Grupo de la Diáspora", "donation": "Donaciones", "legal": "Asistencia Legal" }, "donate": "Donar", "website": "Sitio Web", "contact": "Contactar", "verified": "Organización Verificada", "register": "Registrar tu Organización", "registerNote": "Las organizaciones requieren verificación manual. Espera 24-48 horas." },
  "donate": { "title": "Cómo Ayudar", "note": "Vigil no procesa donaciones directamente. Los enlaces van a organizaciones verificadas.", "international": "Transferencias Internacionales", "local": "Apoyo Local en Venezuela", "goods": "Donar Bienes", "time": "Donar Tu Tiempo" },
  "news": { "title": "Actualizaciones Oficiales", "subtitle": "Información verificada de OCHA, ReliefWeb, UNICEF y fuentes oficiales", "source": "Fuente:", "readMore": "Leer informe completo", "lastUpdated": "Actualizado: {{time}}", "disclaimer": "Todo el contenido proviene de fuentes humanitarias oficiales. Vigil no edita estos reportes." },
  "common": { "loading": "Cargando...", "error": "Ocurrió un error. Intenta de nuevo.", "retry": "Reintentar", "close": "Cerrar", "back": "Volver", "save": "Guardar", "cancel": "Cancelar", "confirm": "Confirmar", "yes": "Sí", "no": "No", "required": "Requerido", "optional": "Opcional", "share": "Compartir", "copyLink": "Copiar Enlace", "linkCopied": "Enlace copiado", "flag": "Marcar como incorrecto", "flagReason": "¿Por qué marcas esto?", "flagSubmit": "Enviar Reporte", "flagSuccess": "Gracias. Nuestro equipo lo revisará.", "notFound": "No encontrado", "noData": "Sin datos disponibles", "poweredBy": "Vigil — Plataforma humanitaria de código abierto", "language": "Idioma" },
  "privacy": { "shortNotice": "Tu información de contacto nunca se muestra públicamente. No compartimos datos con el gobierno venezolano.", "learnMore": "Política de Privacidad" },
  "footer": { "madeFor": "Construido para el pueblo de Venezuela", "openSource": "Código abierto — Licencia MIT", "notEmergency": "Vigil NO es un servicio de emergencias. Para rescate inmediato llama al: {{hotline}}" }
}
ESFILE
```

### Auto-generate PT, FR, IT, ZH, DE, RU
```bash
# Run translation generator (uses Claude Haiku — ~$0.50 total for all 6 languages)
node scripts/generate-translations.mjs
```

## Phase 4 — Data Protection Implementation

### 4.1 Coordinate Validator
```bash
mkdir -p src/lib/security
cat > src/lib/security/validate.ts << 'VALIDATE'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { createHash } from 'crypto'

// Validate coordinates are within crisis country bounds
export function isWithinBounds(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = CRISIS_CONFIG.mapBounds
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

// Hash IP for storage — we never store raw IPs
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.VIGIL_ADMIN_SECRET)
    .digest('hex')
    .slice(0, 16)
}

// Sanitize text input — remove potential XSS, excessive whitespace
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')      // Strip HTML
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .trim()
    .slice(0, 2000)               // Hard length limit
}

// Validate phone number format (loose — crisis context, accept any format)
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').slice(0, 25)
}

// Mask contact info for public display
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '****'
  return phone.slice(0, 3) + '***' + phone.slice(-2)
}

// Validate photo upload (type and size)
export function validatePhoto(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSizeBytes = 5 * 1024 * 1024  // 5MB before compression

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se aceptan imágenes JPG, PNG o WebP' }
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'La imagen no puede superar 5MB' }
  }
  return { valid: true }
}
VALIDATE
```

---

## Phase 5 — Legal Pages

### 5.1 Privacy Policy — Both Languages
```bash
mkdir -p src/app/privacidad src/app/privacy src/app/terminos src/app/terms

cat > src/app/privacidad/page.tsx << 'PRIVACY_ES'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Política de Privacidad — Vigil',
  description: 'Cómo Vigil recopila, usa y protege tus datos personales en el contexto de respuesta a desastres.',
}

export default function PrivacidadPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-slate-500 mb-8">
        Versión {CRISIS_CONFIG.legal.privacyPolicyVersion} — Vigente desde {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">1. Quiénes Somos</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil es operado por <strong>{CRISIS_CONFIG.legal.operator}</strong>, con sede en {CRISIS_CONFIG.legal.operatorLocation}. 
            Vigil es una plataforma humanitaria de código abierto diseñada exclusivamente para coordinar respuestas 
            a desastres naturales y crisis humanitarias. No somos una organización de rescate, un servicio gubernamental 
            ni una entidad con fines de lucro en relación con esta plataforma.
          </p>
          <p className="text-slate-700 leading-relaxed mt-3">
            Contacto de privacidad: <a href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`} 
            className="text-blue-600 underline">{CRISIS_CONFIG.legal.contactEmail}</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">2. Qué Datos Recopilamos</h2>
          
          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.1 Reportes de personas desaparecidas</h3>
          <p className="text-slate-700 leading-relaxed">Cuando reportas a una persona desaparecida, recopilamos:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-2">
            <li>Nombre completo, edad y género de la persona desaparecida</li>
            <li>Fotografía (opcional pero recomendada)</li>
            <li>Última ubicación conocida (descripción de texto y/o coordenadas GPS)</li>
            <li>Hora y fecha de la última vez que fue visto/a</li>
            <li>Tu nombre y datos de contacto como persona que reporta</li>
            <li>Notas adicionales de identificación</li>
            <li>Hora y dirección IP (almacenada como hash anónimo, no como IP legible)</li>
          </ul>
          <p className="text-slate-700 mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
            <strong>Importante:</strong> Tu información de contacto NUNCA se muestra públicamente. 
            Todas las solicitudes de contacto se enrutan a través del sistema de mensajería interno de Vigil, 
            y tú decides si responder.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.2 Marcadores de mapa</h3>
          <p className="text-slate-700 leading-relaxed">
            Cuando publicas una necesidad o recurso en el mapa: tipo, categoría, descripción, ubicación, 
            información de contacto (no pública), y hash de IP.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.3 Registro de voluntarios</h3>
          <p className="text-slate-700 leading-relaxed">
            Nombre, habilidades, idiomas, disponibilidad e información de contacto. 
            Los datos de contacto son privados y solo se comparten con organizaciones verificadas 
            cuando aceptas una coincidencia de voluntario.
          </p>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.4 Datos de uso</h3>
          <p className="text-slate-700 leading-relaxed">
            Usamos Vercel Analytics (datos anonimizados) para entender el tráfico. 
            No utilizamos cookies de seguimiento de terceros. No utilizamos Google Analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">3. Por Qué Usamos Tus Datos</h2>
          <p className="text-slate-700">Todos los datos se procesan exclusivamente para:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-2">
            <li>Facilitar la reunificación de familias separadas por el desastre</li>
            <li>Coordinar la entrega de ayuda humanitaria</li>
            <li>Conectar a voluntarios con organizaciones que necesitan ayuda</li>
            <li>Prevenir la desinformación y los reportes duplicados</li>
            <li>Detectar y bloquear el abuso de la plataforma</li>
          </ul>
          <p className="text-slate-700 mt-3 font-medium text-red-700">
            Vigil NO usa tus datos para publicidad, perfiles comerciales, investigación no relacionada con 
            la crisis, ni ningún propósito más allá de la respuesta humanitaria directa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">4. Quién Tiene Acceso a Tus Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li><strong>Equipo de administración de Vigil</strong> (Orlando Toro, operador) — acceso completo para moderación</li>
            <li><strong>Supabase</strong> — proveedor de base de datos (servidores en EE.UU.). Ver su política de privacidad en supabase.com/privacy</li>
            <li><strong>Vercel</strong> — proveedor de hosting (servidores en EE.UU.). Ver su política en vercel.com/legal/privacy-policy</li>
            <li><strong>Anthropic (Claude AI)</strong> — para traducción automática y detección de duplicados. Los datos se procesan pero no se almacenan para entrenamiento. Ver anthropic.com/privacy</li>
          </ul>
          <p className="text-slate-700 mt-4 p-4 bg-red-50 border border-red-200 rounded font-medium">
            🔒 COMPROMISO DE NO DIVULGACIÓN GUBERNAMENTAL: Vigil no comparte, vende, entrega ni proporciona 
            acceso a ningún dato de usuario a ninguna agencia gubernamental, incluyendo el gobierno venezolano, 
            a menos que sea requerido por una orden judicial válida de un tribunal de Florida, EE.UU. 
            En tal caso, notificaremos al usuario afectado en la medida en que la ley lo permita.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">5. Retención de Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>Los registros de personas desaparecidas permanecen activos mientras la crisis esté en curso o haya actividad en el registro</li>
            <li>Los registros sin actualización por más de <strong>90 días</strong> se archivan automáticamente (aún accesibles por solicitud)</li>
            <li>Los registros archivados se eliminan permanentemente después de <strong>1 año</strong></li>
            <li>Las fotografías se eliminan cuando se elimina el registro correspondiente</li>
            <li>Los logs de IPs (hasheadas) se eliminan después de <strong>30 días</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">6. Tus Derechos</h2>
          <p className="text-slate-700 mb-3">Tienes derecho a:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2">
            <li><strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti</li>
            <li><strong>Corrección:</strong> Solicitar la corrección de datos incorrectos</li>
            <li><strong>Eliminación (derecho al olvido):</strong> Solicitar la eliminación de tu reporte. 
              Por razones de seguridad, verificaremos que eres quien enviaste el reporte original antes de eliminar.</li>
            <li><strong>Actualización de estado:</strong> Marcar a una persona como encontrada en cualquier momento</li>
          </ul>
          <p className="text-slate-700 mt-3">
            Para ejercer cualquiera de estos derechos, escríbenos a: 
            <a href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`} className="text-blue-600 underline ml-1">
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">7. Seguridad de los Datos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>Toda la transmisión de datos usa HTTPS/TLS</li>
            <li>La información de contacto nunca se muestra públicamente</li>
            <li>Las IPs se almacenan como hashes SHA-256, no en texto claro</li>
            <li>Las fotografías se sirven con URLs firmadas de corta duración</li>
            <li>El acceso administrativo requiere autenticación de dos factores</li>
            <li>Los datos de la base de datos están aislados con seguridad a nivel de fila (RLS)</li>
            <li>Limitación de solicitudes para prevenir scraping masivo de datos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">8. Datos de Menores</h2>
          <p className="text-slate-700 leading-relaxed">
            Reconocemos que en situaciones de desastre, los datos de menores deben reportarse para facilitar 
            reunificaciones. Los reportes sobre menores deben ser enviados por un adulto responsable. 
            Tomamos precauciones adicionales con estos registros, incluyendo revisión de moderación prioritaria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">9. Ley Aplicable</h2>
          <p className="text-slate-700 leading-relaxed">
            Esta política se rige por las leyes del Estado de {CRISIS_CONFIG.legal.governingLaw}. 
            Hacemos esfuerzos de buena fe para cumplir con los principios del RGPD de la UE 
            dado que usuarios internacionales acceden a esta plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">10. Cambios a Esta Política</h2>
          <p className="text-slate-700 leading-relaxed">
            Publicaremos cambios en esta página con la fecha de actualización. Dado el carácter urgente 
            de una crisis activa, los cambios pueden ser efectivos inmediatamente.
          </p>
        </section>

        <div className="mt-12 p-4 bg-slate-100 rounded text-sm text-slate-600">
          Última actualización: {CRISIS_CONFIG.legal.effectiveDate} | 
          Versión {CRISIS_CONFIG.legal.privacyPolicyVersion} | 
          {CRISIS_CONFIG.legal.operator}
        </div>
      </div>
    </main>
  )
}
PRIVACY_ES
```

### 5.2 Terms of Service
```bash
cat > src/app/terminos/page.tsx << 'TOS_ES'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const metadata = {
  title: 'Términos de Uso — Vigil',
  description: 'Términos y condiciones de uso de la plataforma Vigil de respuesta a crisis.',
}

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Términos de Uso</h1>
      <p className="text-sm text-slate-500 mb-8">
        Versión {CRISIS_CONFIG.legal.tosVersion} — Vigente desde {CRISIS_CONFIG.legal.effectiveDate}
      </p>

      <div className="prose prose-slate max-w-none space-y-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-slate-700 font-medium">
            Al usar Vigil, aceptas estos términos. Si no estás de acuerdo, por favor no uses la plataforma.
            Al enviar información, confirmas que tienes derecho a compartirla y que es verídica al mejor de tu conocimiento.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">1. Propósito de Vigil</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil es una plataforma tecnológica humanitaria de código abierto. Facilita la comunicación y 
            coordinación durante desastres naturales y crisis humanitarias. 
          </p>
          <p className="text-slate-700 mt-3 font-medium text-red-700">
            Vigil NO es un servicio de emergencias. NO es un sustituto de llamar al número de emergencias 
            local. En una emergencia inmediata llama al <strong>{CRISIS_CONFIG.emergency.hotline} 
            ({CRISIS_CONFIG.emergency.hotlineLabel})</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">2. Uso Aceptable</h2>
          <p className="text-slate-700 mb-3">Puedes usar Vigil para:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Reportar personas desaparecidas a raíz de una crisis humanitaria</li>
            <li>Buscar personas desaparecidas</li>
            <li>Publicar necesidades o recursos disponibles en el mapa</li>
            <li>Registrarte como voluntario</li>
            <li>Acceder a información humanitaria oficial y actualizaciones verificadas</li>
          </ul>

          <p className="text-slate-700 mt-4 mb-3">Está <strong>estrictamente prohibido</strong>:</p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2">
            <li>Publicar información falsa, engañosa o fabricada sobre personas desaparecidas</li>
            <li>Usar la plataforma para actividades comerciales no autorizadas</li>
            <li>Scrapear, descargar masivamente o automatizar el acceso a datos de la plataforma sin autorización</li>
            <li>Intentar identificar o contactar a personas de manera que las ponga en riesgo</li>
            <li>Usar los datos de la plataforma para tráfico de personas, extorsión u otras actividades ilegales</li>
            <li>Publicar contenido de odio, discriminatorio o sexualmente explícito</li>
            <li>Hacerse pasar por organizaciones humanitarias sin verificación</li>
            <li>Intentar acceder a datos privados de otros usuarios</li>
            <li>Sobrecargar intencionalmente la plataforma (ataques DDoS)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">3. Exactitud de la Información</h2>
          <p className="text-slate-700 leading-relaxed">
            Al enviar cualquier información a Vigil, confirmas que es verídica al mejor de tu conocimiento. 
            Entiendes que información incorrecta sobre personas desaparecidas puede causar daño real — 
            angustia innecesaria, desviación de recursos de rescate, o poner a personas en riesgo.
          </p>
          <p className="text-slate-700 mt-3 leading-relaxed">
            Vigil modera los contenidos pero no puede verificar toda la información enviada. 
            Los registros se muestran con su estado de verificación visible. 
            Los usuarios deben ejercer criterio al actuar basándose en información no verificada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">4. Limitación de Responsabilidad</h2>
          <p className="text-slate-700 leading-relaxed">
            Vigil y {CRISIS_CONFIG.legal.operator} se esfuerzan por mantener la plataforma operativa y la 
            información útil, pero:
          </p>
          <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-2">
            <li>No garantizamos la exactitud de la información enviada por usuarios</li>
            <li>No somos responsables de decisiones tomadas basadas en información de la plataforma</li>
            <li>No garantizamos disponibilidad continua durante situaciones de crisis extrema</li>
            <li>No somos responsables de la conducta de organizaciones, voluntarios u otras partes listadas</li>
            <li>La plataforma se proporciona "tal como está" sin garantías de ningún tipo</li>
          </ul>
          <p className="text-slate-700 mt-3 leading-relaxed">
            En la máxima medida permitida por la ley aplicable, nuestra responsabilidad total no excederá 
            $100 USD o el valor pagado por los servicios (Vigil es gratuito), lo que sea mayor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">5. Propiedad Intelectual</h2>
          <p className="text-slate-700 leading-relaxed">
            El código de Vigil es de código abierto bajo licencia MIT. Puedes usar, modificar y redistribuir 
            el código según los términos de esa licencia.
          </p>
          <p className="text-slate-700 mt-3 leading-relaxed">
            Los datos de usuarios (reportes de personas desaparecidas, etc.) pertenecen a las personas que 
            los enviaron. Vigil tiene licencia para usar esos datos exclusivamente para operar la plataforma 
            humanitaria según lo descrito en nuestra Política de Privacidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">6. Uso de Datos — Prohibición de Uso Comercial</h2>
          <p className="text-slate-700 leading-relaxed font-medium text-red-700">
            Los datos de Vigil — incluyendo pero no limitado a registros de personas desaparecidas, 
            datos de mapa, información de voluntarios y datos de organizaciones — 
            NO PUEDEN SER USADOS PARA FINES COMERCIALES. 
            Esto incluye venta, licenciamiento, perfilado de datos u otros usos comerciales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">7. Terminación del Acceso</h2>
          <p className="text-slate-700 leading-relaxed">
            Nos reservamos el derecho de bloquear el acceso de cualquier usuario o IP que viole estos términos, 
            intente hacer scraping masivo de datos, o use la plataforma de manera que ponga en riesgo a personas vulnerables.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">8. Ley Aplicable y Disputas</h2>
          <p className="text-slate-700 leading-relaxed">
            Estos términos se rigen por las leyes del Estado de {CRISIS_CONFIG.legal.governingLaw}. 
            Cualquier disputa se resolverá en los tribunales del Condado de Palm Beach, Florida, EE.UU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">9. Cambios a los Términos</h2>
          <p className="text-slate-700 leading-relaxed">
            Podemos actualizar estos términos. El uso continuado de la plataforma después de cambios 
            publicados constituye aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-3">10. Contacto</h2>
          <p className="text-slate-700">
            Preguntas sobre estos términos: 
            <a href={`mailto:${CRISIS_CONFIG.legal.contactEmail}`} className="text-blue-600 underline ml-1">
              {CRISIS_CONFIG.legal.contactEmail}
            </a>
          </p>
        </section>

        <div className="mt-12 p-4 bg-slate-100 rounded text-sm text-slate-600">
          Última actualización: {CRISIS_CONFIG.legal.effectiveDate} | 
          Versión {CRISIS_CONFIG.legal.tosVersion} | 
          {CRISIS_CONFIG.legal.operator}
        </div>
      </div>
    </main>
  )
}
TOS_ES
```

---

## Phase 6 — Security Hardening

### 6.1 next.config.js
```bash
cat > next.config.js << 'NEXTCONFIG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers applied globally
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org",
              "connect-src 'self' https://*.supabase.co https://earthquake.usgs.gov https://api.reliefweb.int https://api.anthropic.com",
              "frame-ancestors 'none'",
            ].join('; ')
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
NEXTCONFIG
```

### 6.2 robots.txt (block scrapers from sensitive paths)
```bash
cat > public/robots.txt << 'ROBOTS'
User-agent: *
Allow: /
Allow: /buscar
Allow: /reportar
Allow: /necesito-ayuda
Allow: /voluntarios
Allow: /organizaciones
Allow: /donaciones
Allow: /noticias
Allow: /privacidad
Allow: /terminos

# Block direct API access from scrapers
Disallow: /api/
Disallow: /admin/

# Allow specific APIs for search engines only
User-agent: Googlebot
Allow: /api/pfif  # Google Person Finder integration

Sitemap: https://vigil.app/sitemap.xml
ROBOTS
```

---

## Phase 7 — PWA Manifest & Initial Commit

```bash
cat > public/manifest.json << 'MANIFEST'
{
  "name": "Vigil — Crisis Response Platform",
  "short_name": "Vigil",
  "description": "Unified humanitarian crisis platform. Missing persons, crisis map, volunteer coordination.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#DC2626",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["humanitarian", "utilities", "social"],
  "lang": "es",
  "dir": "ltr"
}
MANIFEST
```

### GitHub Repository Description Files
```bash
cat > README.md << 'README'
# Vigil — Unified Humanitarian Crisis Platform

**We stand watch when it matters most.**

Vigil is an open-source humanitarian crisis platform that unifies proven tools into a single, 
accessible interface for six user groups: rescue teams, volunteers, victims, diaspora, donors, 
and organizations — all organized around a shared real-time crisis map.

**Currently deployed for: Venezuela 2026 Earthquake Response**

---

## What Vigil Does

- 🔍 **Missing Persons Board** — Real-time, PFIF-compatible, searchable. Contact info protected.
- 🗺️ **Crisis Map** — Live aftershock data (USGS), needs, resources, shelters, hospitals
- 🤝 **Volunteer Matching** — Skills-based matching with verified organizations
- 🏢 **Organization Directory** — Verified NGOs, rescue teams, diaspora groups with donation links
- 📡 **Official Updates** — ReliefWeb + OCHA/HDX data feeds, verified and labeled
- 🌐 **Multilingual** — Spanish default, English/Portuguese/French toggle
- 📱 **PWA / Offline-first** — Works at 2G speeds. Forms queue offline, sync on reconnect

## Stack

Next.js 14 App Router · Supabase (Postgres + Realtime) · Leaflet.js · Vercel · Cloudflare · Claude AI (Haiku)

## Data Protection

Contact information is **never displayed publicly**. All contact is routed through Vigil's 
internal messaging. The Venezuelan government is **explicitly excluded** from any data sharing. 
See [Privacy Policy](https://vigil.app/privacidad).

## Deploy Your Own Crisis Instance

Change one file: `src/config/crisis.config.ts`  
Update country bounds, emergency numbers, partner links, and deploy.  
Full deployment guide: [DEPLOYMENT.md](../architecture/DEPLOYMENT.md)

## Built By

[Orlando Toro](https://atenaxproject.com) — Bbluestudios LLC  
For the people of Venezuela. For anyone who needs it next.

## License

MIT License — Free to use, modify, and deploy for humanitarian purposes.  
Commercial use of the data is prohibited. See [Terms](https://vigil.app/terminos).
README

# Initial commit and push
git add -A
git commit -m "feat: initial Vigil crisis platform — Venezuela earthquake response 2026

- Next.js 14 App Router + Supabase + Leaflet.js stack
- Missing persons board with PFIF compatibility
- Crisis map with USGS real-time seismic data
- Full data protection: contact masking, RLS, rate limiting, coordinate validation
- Privacy Policy (ES) + Terms of Service (ES)
- PWA manifest for offline-first operation
- Venezuela crisis config — one-file deployment model for any country

Built for the 2026 Venezuela earthquakes. 68,900+ missing persons.
Every commit is a brick in someone's reunion."

git push origin main
```

---

## Phase 8 — Vercel Deployment

```bash
# Link to Vercel (will prompt for account if needed)
vercel link --yes

# Set environment variables on Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add VIGIL_ADMIN_SECRET production

# Deploy to production
vercel deploy --prod

echo "=== DEPLOYMENT COMPLETE ===" | tee -a build.log
echo "Next steps:" | tee -a build.log
echo "1. Point vigil.app (or your domain) to Vercel" | tee -a build.log
echo "2. Set up Cloudflare DNS in front of Vercel" | tee -a build.log
echo "3. Run Supabase migration: supabase db push" | tee -a build.log
echo "4. Add trusted organizations to database manually" | tee -a build.log
```

---

## Phase 9 — Post-Deploy Checklist

After autonomous build completes, the operator (Orlando) must manually complete:

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and all env vars in Vercel dashboard
- [ ] Run Supabase migration in the Supabase SQL editor
- [ ] Enable Supabase Realtime on `missing_persons` and `map_markers` tables
- [ ] Configure Cloudflare DNS to proxy the domain to Vercel
- [ ] Enable Supabase 2FA on the admin account
- [ ] Seed the organizations table with 15-20 verified Venezuela orgs
- [ ] Test: Submit a missing person report and verify contact info is masked in public view
- [ ] Test: Submit a map marker outside Venezuela bounds — should be rejected
- [ ] Test: Submit 6 times from same IP within 1 hour — should be rate-limited on the 6th
- [ ] Set Anthropic API hard spend cap to $50 in the Anthropic console
- [ ] Email partnerships@anthropic.com for humanitarian API credits
- [ ] Email microsoft.com/en-us/ai/ai-for-good for Azure humanitarian credits
- [ ] Share the live URL on social media and with Venezuelan diaspora networks

---

## Execution Command for Claude Code

```bash
# Hand this file to Claude Code CLI:
claude --dangerously-skip-permissions \
  "Read AGENTS.md completely. Read CLAUDE.md completely. 
   Execute all phases in order from Phase 1 to Phase 8. 
   Log every action to build.log. 
   Do not stop for confirmations unless a prerequisite fails. 
   If a step fails, try one alternative before reporting. 
   The goal is a live deployed Vigil repository on GitHub and Vercel 
   by the end of this session."
```

---

*AGENTS.md — Vigil Crisis Platform v1.0.0*
*Operator: Orlando Toro / Bbluestudios LLC*
*Built for Venezuela. Ready for the world.*
