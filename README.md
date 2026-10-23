# BridgeAI — Societal Intelligence & Action Engine

**Turning unstructured crisis reports into structured, actionable intelligence.**

[Live Demo](https://bridge-ai-tan.vercel.app) · [GitHub Repository](https://github.com/manasir747/BridgeAI)

## Overview

BridgeAI is an AI-powered crisis intelligence and response-support platform that transforms messy, fragmented real-world dispatches into structured, validated, and prioritized information.

During humanitarian emergencies, natural disasters, and community assistance operations, critical details are often buried in unstructured messages. Responders may struggle to identify urgent needs, verify claims, locate affected populations, and determine what information is still missing.

BridgeAI addresses this challenge using Google's Gemini API to analyze incoming reports, extract relevant information, assess urgency and uncertainty, identify critical information gaps, and recommend actionable next steps.

The goal is to help responders understand a situation faster and make better-informed decisions.

> **Important:** BridgeAI is a decision-support tool. Its AI-generated assessments require human verification and should not replace professional emergency response procedures.

## The Problem

Crisis communication is often fragmented and unreliable:

- **Unstructured information:** Critical details arrive through informal messages, field reports, and voice transcripts.
- **Delayed prioritization:** Urgent medical needs, affected population counts, and resource shortages can be overlooked.
- **Information gaps:** Reports may lack precise locations, confirmed casualty counts, or essential operational details.
- **Unverified claims:** Rumours and conflicting reports can lead to incorrect assumptions.
- **Coordination challenges:** Responders need clear, prioritized actions rather than lengthy, unstructured messages.

BridgeAI converts these reports into a structured operational overview that highlights what is known, what remains uncertain, and what needs attention.

## Key Features

### 1. AI-Powered Crisis Analysis
Uses Google Gemini to interpret unstructured dispatches and generate structured analysis.

### 2. Urgency Assessment
Classifies incidents by urgency — Critical, High, Medium, or Low — and provides a severity score and rationale.

### 3. Information Extraction
Identifies relevant details, including:
- Locations and addresses
- Affected populations and vulnerable groups
- Reported contacts and involved entities
- Requested resources and assistance

### 4. Critical Information Gaps
Highlights missing details that responders may need to clarify before taking action.

### 5. Claim Verification Support
Distinguishes verified, unverified, conflicting, and follow-up-required claims based on the available information. AI assessments are not independent proof of a claim's truth.

### 6. Prioritized Recommended Actions
Organizes suggested operational tasks to help responders determine what may need attention first.

### 7. Structured Results Dashboard
Presents analysis in a readable triage dossier, with supporting evidence, uncertainty indicators, and actionable information.

### 8. Analysis History
Stores previous analyses in browser-local storage, with support for searching, filtering, reopening, and importing or exporting JSON backups.

### 9. Multilingual Interface
Provides language selection for supported interface languages, including English, Hindi, and Marathi. AI-generated analysis language depends on the selected language and the deployed implementation.

### 10. Field-Friendly Intake
Provides an input workflow for raw dispatch text, scenario/category selection, and field photo upload controls.

## How It Works

1. **Submit a report:** Enter an unstructured crisis dispatch or field report.
2. **Validate the input:** The application validates and sanitizes the incoming text.
3. **Analyze with AI:** The server-side Gemini integration interprets the report and extracts relevant details.
4. **Validate the output:** Structured AI output is checked against the application's schema.
5. **Review the results:** Examine urgency, extracted information, uncertainty, missing details, and recommended actions.
6. **Track and revisit:** Save analyses locally, reopen previous reports, and manage recommended actions.

## Technology Stack

| Category | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript, strict mode |
| UI and Styling | React, Tailwind CSS, Lucide React |
| AI Integration | Google Gemini API using `@google/genai` |
| Validation | Zod |
| Testing | Vitest, React Testing Library, jsdom |
| Code Quality | ESLint |
| Deployment | Vercel |
| Storage | Browser LocalStorage and in-memory history service |

## Architecture

BridgeAI uses a single Next.js application. The frontend and analysis API are deployed together, avoiding the need for separate frontend and backend services.

```text
BridgeAI/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── analysis/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── validation/
│   └── utils.ts
├── public/
├── services/
│   ├── gemini/
│   └── history/
├── tests/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── setup.ts
├── types/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.mts
```

*This is a simplified overview. Individual files and subdirectories may evolve as the project develops.*

### Core Components

- **API route:** Receives analysis requests, validates input, and coordinates server-side processing.
- **Gemini service:** Manages model calls, prompts, response processing, and error handling.
- **Validation layer:** Defines input constraints and validates structured analysis results.
- **History service:** Abstracts browser-local storage and in-memory persistence.
- **Type contracts:** Define the structures used by the frontend, API, and analysis services.

## Structured Analysis Contract

BridgeAI's structured analysis includes:

| Field | Purpose |
|---|---|
| `summary` | Concise incident overview |
| `category` | Standardized incident classification |
| `urgency` | Severity level, numerical score, and rationale |
| `extractedDetails` | Locations, entities, affected populations, contacts, and resource requests |
| `missingInformation` | Critical details requiring clarification |
| `verification` | Claim status, confidence, and reasoning |
| `sources` | Supporting quotations from the original report |
| `recommendedActions` | Prioritized operational tasks and statuses |
| `metadata` | Processing time, model information, input length, and timestamp |

The output is validated using TypeScript contracts and Zod schemas to improve consistency and catch malformed responses.

## Security and Responsible AI

BridgeAI is designed with several security and reliability considerations:

- **Server-side API key handling:** The Gemini API key must remain on the server and must never be exposed through `NEXT_PUBLIC_*` variables.
- **Input validation:** Enforces configured text-length limits and rejects invalid requests.
- **Input sanitization:** Normalizes text and removes configured unwanted control and obfuscation characters.
- **Output validation:** Checks AI-generated results against the expected schema.
- **Safe diagnostics:** Sensitive credentials should never appear in application logs or error messages.
- **Uncertainty awareness:** Unverified claims and missing information are surfaced rather than automatically treated as facts.
- **Human oversight:** AI recommendations are intended to support, not replace, trained responders.

**Privacy note:** Analysis history is stored locally in the browser in the current architecture. Reports sent for AI analysis are transmitted to the configured Gemini service. Do not submit sensitive personal or operational information unless its handling is appropriate for your use case.

## Getting Started

### Prerequisites

- Node.js 20 or later recommended
- npm
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository

```bash
git clone https://github.com/manasir747/BridgeAI.git
cd BridgeAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env.local
```

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

Use your own key. Never commit `.env.local` or share your API key publicly.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing and Code Quality

Run the following commands before contributing or submitting changes:

```bash
# Run automated tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check TypeScript types
npm run typecheck

# Run ESLint
npm run lint

# Create a production build
npm run build
```

These commands depend on the scripts defined in `package.json`.

## Deployment

BridgeAI is deployed on Vercel.

**Live application:** https://bridge-ai-tan.vercel.app

To deploy your own instance:

1. Fork or import the repository into your GitHub account.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add `GEMINI_API_KEY` under the project's Environment Variables.
4. Enable the variable for the deployment environments you intend to use.
5. Deploy the application and test the analysis workflow.

The frontend and `/api/analyze` endpoint run as part of the same Next.js deployment. A separate backend deployment is not required.

## Roadmap

| Feature | Status |
|---|---|
| Next.js application foundation | Implemented |
| Structured analysis API | Implemented |
| Gemini integration | Implemented |
| Input and output validation | Implemented |
| Urgency and severity assessment | Implemented |
| Critical information gap detection | Implemented |
| Claim verification support | Implemented |
| Recommended action tracking | Implemented |
| Local analysis history and JSON backup | Implemented |
| Multilingual interface | Implemented / verify supported translations |
| Interactive hazard maps | Planned |
| Geospatial visualization and geocoding | Planned |
| Multi-agency coordination | Planned |
| Shared database and real-time collaboration | Planned |

## Contributing

Contributions, feedback, and ideas are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request with a clear description of the improvement.

Please avoid committing credentials, personal information, or real sensitive emergency reports.

## License

The repository should include a `LICENSE` file specifying the chosen open-source license before redistribution. If you intend to use Apache 2.0 or MIT, select one and add its corresponding license text.

---

**BridgeAI — Turning fragmented reports into clearer, more actionable crisis intelligence.**