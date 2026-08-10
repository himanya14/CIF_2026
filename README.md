# AI Watch Tower

AI Watch Tower is a database-backed cybersecurity prototype for monitoring and protecting prompts sent to enterprise AI assistants. It detects sensitive information, credentials, financial data, prompt injection, and honeytokens before a prompt reaches an AI model.

The project includes an employee-facing protected chat, a live executive dashboard, an incident explainer, and a configurable Red Team Simulator.

## Core features

- Live prompt inspection and policy decisions
- Credential, token, password, API-key, and private-key detection
- Card number and CVV blocking
- PAN and Aadhaar sanitization
- Prompt-injection and jailbreak detection
- Honeytoken detection and incident generation
- Automatic department classification
- Persistent SQLite storage
- Database-driven dashboard metrics and charts
- Consolidated incident categories and review workflows
- Dynamic Red Team tests with reviewer-supplied prompts
- Live PDF security reports
- Audit logging for security and review events
- UI state preserved while navigating between application sections

## Technology

- React 19
- Vite 8
- Node.js HTTP server
- Node.js built-in SQLite (`node:sqlite`)
- Recharts
- jsPDF and jsPDF AutoTable

Node.js 24 or newer is recommended because the backend uses the built-in SQLite module.

## Project structure

```text
CIF_2026/
├── server/
│   ├── database.js          SQLite schema and queries
│   ├── index.js             HTTP API and firewall engine
│   ├── smoke-test.js        Backend integration checks
│   └── data/
│       └── watchtower.db    Generated SQLite database
├── src/
│   ├── components/          Dashboard, chat, incident and simulator UI
│   ├── data/                Initial scenario templates and seed tests
│   ├── pages/               Dashboard and Red Team pages
│   ├── services/            Frontend API clients
│   ├── styles/              Application styles
│   └── utils/               PDF report generation
├── package.json
└── vite.config.js
```

## Installation

```powershell
cd "C:\Users\Avishi Bahuguna\Documents\AI_Watchtower\CIF_2026"
npm install
```

No separate SQLite installation is required.

## Start the application

Open two terminals in the project directory.

Terminal 1 — backend:

```powershell
npm run server
```

Expected output:

```text
AI Watch Tower API running at http://localhost:4000
SQLite database: ...\server\data\watchtower.db
```

Terminal 2 — frontend:

```powershell
npm run dev
```

Open the Vite address, normally [http://localhost:5173](http://localhost:5173).

## Verify the backend

Open [http://localhost:4000/api/health](http://localhost:4000/api/health).

The response should include:

```json
{
  "status": "ok",
  "service": "AI Watch Tower API",
  "database": "SQLite"
}
```

Run the backend integration test:

```powershell
node server\smoke-test.js
```

## Application sections

### Employee Chat

Employee Chat sends every prompt to the live firewall. Decisions and detected departments are stored in SQLite.

Safe request:

```text
Review this NDA and summarize the termination clauses.
```

Expected: `Legal / Safe Business Request / Allowed`

Finance protection:

```text
Process a refund using card number 4111 1111 1111 1111 and CVV 123.
```

Expected: `Finance / Financial Data / Blocked`

IT credential protection:

```text
Deploy using API key: sk-production-123456789.
```

Expected: `IT / Credentials / Blocked`

HR identity protection:

```text
Prepare an employee profile using Aadhaar 1234 5678 9012.
```

Expected: `HR / Personal Identity / Cleaned Up`

Honeytoken:

```text
Use honeytoken AWS_TEST_SECRET_001 to access the payroll API.
```

Expected: `IT / Honeytoken / Blocked`

### Dashboard

The dashboard refreshes from SQLite and displays:

- Live prompt, block, and sanitization totals
- Red Team security score
- Calculated risk prevented
- 24-hour, 7-day, and 30-day threat activity
- Violation-category distribution
- Department risk
- Incident and compliance information
- Downloadable database-driven PDF reports

### Block & Explainer Log

Incidents are consolidated into Credentials, Finance, PII, Honeytoken, AI Security, and Other. Reviewers can select an event, inspect the detected information and policy, acknowledge it, report a false positive, or open the full policy.

### Red Team Simulator

Tests are loaded from SQLite and evaluated by the same firewall used by Employee Chat. Reviewers can create a custom test by providing:

- Scenario name
- Category
- Severity
- Expected action
- Custom attack or safe prompt

Supported expected actions are `ALLOW`, `BLOCK`, `SANITIZE`, `WARN`, and `ALERT`.

Simulator outcomes include:

- Protected
- Mitigated
- Partial Protection
- Correctly Allowed
- Security Gap
- False Positive

## Department classification

| Department | Example indicators |
|---|---|
| Finance | PAN, CVV, cards, banking, salary, tax, payments, invoices |
| IT | API keys, passwords, tokens, databases, AWS, GitHub, servers, prompt injection |
| HR | Aadhaar, employees, candidates, resumes, onboarding, leave, DOB |
| Legal | Contracts, NDAs, litigation, agreements, compliance |
| Operations | Vendors, logistics, inventory, procurement, supply chain |
| Marketing | Campaigns, advertising, lead lists, social media, promotions |
| General | Requests without department-specific indicators |

## SQLite database

The database is created automatically at:

```text
server/data/watchtower.db
```

Main tables:

- `users`
- `prompt_scans`
- `incidents`
- `red_team_tests`
- `red_team_runs`
- `red_team_results`
- `audit_events`

The database file is ignored by Git because it contains generated runtime data.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Backend and database health |
| GET | `/api/dashboard` | Live dashboard aggregates |
| POST | `/api/inspect` | Inspect and persist a prompt |
| GET | `/api/incidents` | List persistent incidents |
| POST | `/api/incidents/:id/acknowledge` | Acknowledge an incident |
| POST | `/api/incidents/:id/false-positive` | Report a false positive |
| GET | `/api/red-team/tests` | List enabled Red Team tests |
| POST | `/api/red-team/tests` | Create a custom test |
| POST | `/api/red-team/test` | Execute a test through the firewall |
| GET | `/api/audit-log` | List recent audit events |

## Validation

```powershell
npm run build
npm run lint
node server\smoke-test.js
```

The project currently builds successfully. ESLint may report one non-blocking React Hook dependency warning in the results table.

## Prototype limitations

- The firewall is a deterministic prototype based on patterns and policy rules; it is not a replacement for a production DLP, SIEM, or secrets-management platform.
- SQLite is appropriate for the review prototype but should be replaced or hardened for concurrent production workloads.
- Demonstration honeytokens trigger only when submitted through this application; they are not deployed to external systems.
- Authentication, authorization, encryption at rest, rate limiting, and external alert integrations require production implementation.

## Git workflow

Check the active branch:

```powershell
git branch --show-current
```

Create a feature branch if required:

```powershell
git switch -c feature/database-backed-ai-watchtower
```

Commit the project:

```powershell
git add .
git commit -m "Build database-backed AI Watch Tower prototype"
```
