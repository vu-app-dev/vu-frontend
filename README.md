# VU Frontend

AI-powered virtual interview and recruiting dashboard built with React, Vite, and the VU backend API.

## Overview

VU helps companies create job-specific mock interviews, share public application links, review candidate submissions, and manage hiring decisions from one dashboard. The app also includes the candidate-facing application flow used by public job links.

## Current Features

- Authenticated dashboard with role-aware navigation and protected actions.
- Candidates pipeline with filters, pagination, charts, candidate details, CV analysis, feedback, and replay views.
- Job management with create/edit forms, linked mocks, shareable application links, and job analytics.
- Mock management with create/edit forms, details, linked jobs, and test application flow.
- Company team area with members, join requests, company settings, and role controls.
- Candidate-facing application flow: landing, candidate form, mock checklist, mock session, and completion page.
- Backend API integration through `src/api/backend`.
- Request optimization for role-based data loading, optional endpoint fallbacks, refresh dedupe, and focused join-request polling.
- Route-level code splitting with `React.lazy` and `Suspense`.
- Route-level error boundaries so a broken page does not crash the whole app.

## Tech Stack

| Tool | Use |
| --- | --- |
| React 19 | UI runtime |
| Vite 7 | Dev server and production build |
| React Router 7 | Routing and nested layouts |
| Recharts 3 | Dashboard charts |
| Lucide React | Icons |
| PropTypes | Runtime component contracts |
| ESLint 9 | Linting |

## Getting Started

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Environment

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Available frontend environment variables:

```env
VITE_API_BASE_URL=https://api.vuapp.dev
VITE_PUBLIC_API_ORIGIN=https://api.vuapp.dev
```

Values prefixed with `VITE_` are exposed to the browser. Do not put secrets, private keys, database URLs, or admin tokens in `.env` or `.env.example`.

### Run

```bash
npm run dev
```

The app defaults to `http://localhost:5173`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```txt
src/
  App.jsx                         # Routes, layouts, page adapters
  main.jsx                        # React entry point
  api/
    BackendProvider.jsx           # Auth/data provider and refresh orchestration
    backend/
      client.js                   # API fetch wrapper and ApiError
      endpoints.js                # Backend route constants
      mappers.js                  # Backend DTO to UI model mapping
      services.js                 # Auth, jobs, mocks, candidates, company API facade
      storage.js                  # Safe local/session storage helpers
      store.js                    # UI datastore populated from backend responses
  components/
    layout/
      Navbar/
      PageLayout/
      RouteErrorBoundary/
      Shortcuts/
      Sidebar/
    ui/                           # Reusable buttons, cards, tables, charts, forms, etc.
  hooks/                          # Shared hooks
  pages/
    Application/                  # Candidate-facing apply flow
    Auth/                         # Login and company join
    Candidates/
    CompanyTeam/
    Jobs/
    Mocks/
    Profile/
    Settings/
  styles/                         # Global styles and design tokens
  utils/                          # Shared helpers
```

For detailed flow documentation, see:

- [`USER_FLOWS.md`](./USER_FLOWS.md) for user-centered journeys.
- [`APP_FLOWS.md`](./APP_FLOWS.md) for routing, role, backend, and app behavior.

## Routing

Dashboard routes render inside `PageLayout` with sidebar, navbar, breadcrumbs, lazy route chunks, and a route error boundary.

```txt
/login
/join/:companyId
/candidates
/candidates/:slug
/jobs
/jobs/create
/jobs/:id
/jobs/:id/edit
/mocks
/mocks/create
/mocks/:id
/mocks/:id/edit
/company
/company/team/:id
/company/members
/company/members/:id
/company/requests/:id
/company/settings
/profile
/settings
```

Candidate application routes render in a standalone shell:

```txt
/apply/:companyId/:jobId
/apply/:companyId/:jobId/form
/apply/:companyId/:jobId/overview
/apply/:companyId/:jobId/mock/:mockId
/apply/:companyId/:jobId/complete

/apply/:jobId
/apply/:jobId/form
/apply/:jobId/overview
/apply/:jobId/mock/:mockId
/apply/:jobId/complete
```

## Backend Integration Notes

The frontend reads from the backend through `src/api/backend/services.js` and writes normalized data into `src/api/backend/store.js`.

Important behavior:

- Editors/viewers do not request owner-only endpoints such as company join requests.
- Optional backend calls can fail silently for expected statuses like `403`.
- Workspace refreshes are deduped to avoid repeated full reloads while navigating.
- Join-request polling refreshes only join requests instead of reloading all workspace data.
- Browser storage access is guarded so local/session storage failures do not crash the app.

## Error Boundaries

`src/components/layout/RouteErrorBoundary` protects:

- login and join pages
- dashboard shell
- individual dashboard routes
- candidate application shell
- individual application routes

When a route crashes, users get a contained fallback with retry and safe-page navigation instead of a full app crash.

## Cleanup Rules

These should not be committed:

- `.env`
- `dist/`
- `node_modules/`
- `*.log`
- local Vite dev logs
- generated backend handoff files unless they are intentionally maintained docs

`.env.example` is safe to commit only with public frontend config or placeholders.

## Useful Checks Before Pushing

```bash
npm run lint
npm run build
```

## Related

- Backend repository: https://github.com/Eyad-AbdElMohsen/VU
- Figma design: https://www.figma.com/design/LgLS6zCwbhl4yISLlsN2qC/VU-WebApp

## License

Graduation project.
