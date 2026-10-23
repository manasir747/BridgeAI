# BridgeAI — Societal Intelligence & Action Engine

> **Phase 1 Foundation:** An architectural foundation for a Gemini-powered societal-benefit platform that converts messy, noisy real-world crisis and mutual aid inputs into structured, validated, actionable operations.

---

## 1. Problem Statement

In humanitarian emergencies, climate disasters, and community mutual-aid scenarios, real-world communication is chaotic:
- **Noisy channels:** Dispatchers and coordinators receive desperate, fragmented messages across SMS, social media, voice transcripts, and field radios.
- **Critical delays:** Lifesaving details (trapped counts, medical dependencies, exact coordinates, urgent resources) are buried within informal, unstructured text.
- **Coordination friction:** Aid teams often dispatch duplicate resources while overlooking critical information gaps (e.g., passable water depth, battery levels, patient mobility).

**BridgeAI** bridges this gap using Google Gemini (`@google/genai`). It ingests raw, unstructured reports, extracts critical facts, evaluates urgency and credibility, pinpoints missing information, and outputs validated, prioritized action steps for responders.

---

## 2. Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-side execution, React 19, Turbopack |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety with zero suppressions |
| **Styling & UI** | Tailwind CSS v4, Lucide React | Clean, responsive design with accessible focus rings |
| **AI Engine** | Google Gemini API (`@google/genai`) | Server-side LLM inference (`gemini-2.5-flash`) |
| **Validation** | Zod (v4) | Dual-layer validation for API inputs and AI output |
| **Testing** | Vitest, React Testing Library, jsdom | Fast test runner and component accessibility tests |
| **Code Quality**| ESLint (Flat Config) | Strict linting rules and best practices |

---

## 3. Architecture & Directory Structure

```text
BridgeAI/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts         # Secure server-only analysis POST endpoint
│   ├── favicon.ico
│   ├── globals.css              # Tailwind CSS imports & theme definitions
│   ├── layout.tsx               # Root layout with accessibility skip link & header
│   └── page.tsx                 # Foundation overview & contract preview
├── components/
│   ├── analysis/
│   │   └── AnalysisResultCard.tsx # Accessible UI card for structured results
│   ├── layout/
│   │   └── Header.tsx           # Semantic header with status indicator
│   └── ui/
│       ├── badge.tsx            # Semantic urgency & status badges
│       ├── button.tsx           # Accessible button with CVA variants
│       └── card.tsx             # Composable card primitives
├── lib/
│   ├── utils.ts                 # Class merging (`cn`), formatting helpers
│   └── validation/
│       ├── analysis.schema.ts   # Canonical Zod schema for analysis output
│       ├── env.schema.ts        # Server-only environment validation & secret masking
│       ├── index.ts             # Validation barrel export
│       └── input.schema.ts      # Request validation (limits 10-10,000 chars, sanitization)
├── services/
│   ├── gemini/
│   │   ├── analyzer.ts          # Orchestration service for Gemini model calls
│   │   ├── client.ts            # Secure Gemini client with browser-context guards
│   │   ├── index.ts             # Gemini service barrel export
│   │   └── prompts.ts           # Humanitarian system instructions & prompt builder
│   └── history/
│       ├── factory.ts           # Environment-aware factory (localStorage vs memory)
│       ├── index.ts             # History service barrel export
│       ├── interface.ts         # IHistoryService contract for decoupled storage
│       ├── local-storage.ts     # LocalStorage implementation with quota handling
│       └── memory.ts            # In-memory implementation for SSR & testing
├── tests/
│   ├── components/
│   │   └── AnalysisResultCard.test.tsx # RTL component verification
│   ├── lib/
│   │   └── validation.test.ts   # Schemas, sanitization, and bounds testing
│   ├── services/
│   │   ├── gemini.test.ts       # Gemini client, prompts, and error mapping tests
│   │   └── history.test.ts      # History CRUD, filtering, pagination, import/export
│   └── setup.ts                 # Vitest matchers & jsdom polyfills
├── types/
│   ├── analysis.ts              # Core TypeScript interfaces for analysis contracts
│   ├── history.ts               # Storage, query filters, and pagination types
│   └── index.ts                 # Types barrel export
├── .env.example                 # Documented environment variable template
├── .gitignore                   # Strict rules guarding secrets and build artifacts
├── eslint.config.mjs            # ESLint flat configuration
├── package.json                 # Scripts and dependencies
├── tsconfig.json                # Strict TypeScript configuration
└── vitest.config.mts            # Vitest runner configuration with @ path alias
```

---

## 4. Core Contracts

The canonical result schema (`StructuredAnalysisResult` in `types/analysis.ts` & `structuredAnalysisSchema` in `lib/validation/analysis.schema.ts`) validates:

1. **`summary`**: Clear, concise overview of the incident.
2. **`category`**: Standard taxonomy (`emergency_relief`, `healthcare_access`, `infrastructure_damage`, `food_water_security`, `shelter_housing`, `public_safety`, `missing_persons`, `community_assistance`, `other`).
3. **`urgency`**: Triage level (`critical`, `high`, `medium`, `low`), numerical severity score (1–10), and rationale.
4. **`extractedDetails`**: Granular extracted locations (with coordinates/addresses), identified entities/personnel, affected populations (estimated counts & vulnerable groups), contact information, and resource requests.
5. **`missingInformation`**: Critical gaps in the input that responders must proactively clarify (with criticality ratings).
6. **`verification`**: Claim verification assessment (`verified`, `unverified`, `needs_followup`, `conflicting`), confidence score (0.0–1.0), and reasoning.
7. **`sources`**: Direct quotes from input text justifying facts and urgency assessments.
8. **`recommendedActions`**: Prioritized operational tasks with target entities and execution status.
9. **`metadata`**: Model version, latency (`processingTimeMs`), input length, sanitization flag, and timestamp.

---

## 5. Visual Design & Motion System (Phase 2.5)

BridgeAI features a warm, colorful, and lively SaaS interface designed for clarity and rapid triage during high-stakes situations:

- **Warm Palette & Mesh Gradients:** Warm off-white foundation (`#f8fafc`) layered with ambient emerald, teal, and mint mesh gradients, deep navy text (`#0f172a`), and restrained lavender/coral accents.
- **Floating Pill Glass Navigation:** Redesigned centered floating pill navbar with translucent glassmorphism (`backdrop-blur-md`), rounded active states, and real-time status indicators.
- **Layered Floating Cards:** Generous rounded radii (`20–28px`), soft multi-layered shadows (`shadow-[0_12px_36px_rgba(15,23,42,0.06)]`), and hover lift effects.
- **Hero & Visual Impact:** High-contrast expressive typography, subtle radial glow orbs, and interactive floating scenario teaser cards demonstrating live triage capabilities.
- **Motion & Accessibility:** Micro-interactions (staggered entrances, card hover lifts, badge transitions, button scales) powered by CSS keyframes with full `@media (prefers-reduced-motion: reduce)` compliance.

---

## 6. Security Architecture

- **Server-Side API Key Isolation:** `GEMINI_API_KEY` is loaded exclusively in server contexts via `lib/validation/env.schema.ts`. Initializing the Gemini client or reading the key in browser code immediately throws a fatal security exception. No secret variables are ever prefixed with `NEXT_PUBLIC_`.
- **Sensible Input Limits:** Inputs are restricted to between 10 characters (rejecting empty spam) and 10,000 characters (preventing DoS and runaway token consumption).
- **Sanitization:** Raw text is normalized to Unicode NFC; non-printable control characters, null bytes, and zero-width obfuscation characters are stripped.
- **Safe Secret Masking:** Utilities mask sensitive credentials (`maskSecret()`) to prevent accidental leaks in logs or diagnostics.
- **Airtight `.gitignore`:** Strict ignore rules block `.env`, `.env*.local`, certificates (`*.pem`, `*.key`), and secrets directories, while tracking `.env.example`.

---

## 6. Storage Architecture (`IHistoryService`)

Storage is decoupled through the `IHistoryService` interface (`services/history/interface.ts`):
- **`LocalStorageHistoryService`**: Provides immediate client-side persistence without requiring a database in Phase 1. Features automated quota handling (evicting non-essential archived items if quota is reached) and backup import/export.
- **`MemoryHistoryService`**: Fast in-memory implementation for automated tests, headless runtimes, and server-side rendering.
- **`getHistoryService()`**: Factory providing seamless environment detection.

---

## 7. Getting Started

### Prerequisites
- Node.js (v20+ recommended, tested on v26)
- npm (v10+)
- Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/manasir747/BridgeAI.git
cd BridgeAI

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY="your-actual-gemini-api-key"
```

---

## 8. Development & Verification Commands

All standard quality and testing commands are pre-configured:

```bash
# Run unit and component test suites (Vitest + RTL)
npm run test

# Run tests in interactive watch mode
npm run test:watch

# Run strict TypeScript typechecking
npm run typecheck

# Run ESLint check
npm run lint

# Start local Next.js development server
npm run dev

# Create optimized Next.js production build
npm run build
```

---

## 9. Roadmap: Implemented vs. Planned

| Feature | Status | Notes |
| :--- | :---: | :--- |
| **Strict TypeScript Contracts & Zod Schemas** | ✅ Implemented | Full dual-layer type safety & schema validation |
| **Server-Side Gemini SDK Integration** | ✅ Implemented | Secured client, custom error classes, system prompt |
| **API Endpoint (`POST /api/analyze`)** | ✅ Implemented | Request validation, sanitization, bounded inputs |
| **Decoupled History Service Interface** | ✅ Implemented | LocalStorage & In-Memory storage engines |
| **Home: Value Proposition & 3-Step Pipeline** | ✅ Implemented | Real-world scenario presets, ethics policy, and CTA |
| **Analyze: Intake Form & Field Photo Upload** | ✅ Implemented | Bounded input, sector hints, photo dropzone, loading state |
| **Results: Triage Dossier & My Actions Tracker** | ✅ Implemented | Status toggle (pending/in progress/completed), notes, caveats |
| **History: Search, Filter, Reopen & Backup** | ✅ Implemented | Full-text search, sector/urgency filters, metrics, JSON import/export |
| **Visual Polish & Motion System (Phase 2.5)** | ✅ Implemented | Warm palette, floating pill glass navbar, layered cards, motion |
| **Workspace & Dashboard Layout Refinement (Phase 2.6)** | ✅ Implemented | Large floating workspace, compact category selector, layered results dashboard, gallery archive |
| **Vitest & React Testing Library Suite** | ✅ Implemented | 56 automated unit and component tests passing |
| **Map Visualization & Geocoding** | 📋 Phase 3 | OpenStreetMap/Leaflet integration for hazard mapping |
| **Multi-Agency Dispatch Routing** | 📋 Phase 3 | Direct export to CAP (Common Alerting Protocol) |
| **Database & Multi-User Collaboration** | 📋 Phase 4 | Postgres/Supabase real-time coordination |

---

## 10. License

Open-source under the Apache 2.0 / MIT License for humanitarian and societal benefit.
