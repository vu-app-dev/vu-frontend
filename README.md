# VU Frontend

AI-powered virtual interview platform and recruiting dashboard built with React, Vite, and the VU backend API.

## Overview

VU helps hiring teams create job-specific assessments, share public application links, run guided AI interviews, review candidate evidence, and manage hiring decisions from one workspace.

The frontend includes three main surfaces:

- Public marketing landing page at `/`.
- Authenticated recruiter dashboard for candidates, jobs, mocks, company, profile, and settings.
- Candidate-facing application flow for public job links.

## Current Features

- Premium public landing page with ReactBits navigation/Prism visuals, isolated Lenis smooth scrolling, product preview cards, and custom landing interactions.
- Authenticated dashboard with role-aware sidebar navigation, navbar actions, breadcrumbs, and protected routes.
- Candidate pipeline with filtering, pagination, charts, candidate details, CV analysis, feedback, and replay views.
- Job management with create/edit forms, linked mocks, shareable application links, job details, and candidate drill-downs.
- Mock management with create/edit forms, details, linked jobs, and dashboard-controlled test flows.
- Company area with overview, team members, join requests, company settings, and role permissions.
- Candidate application flow: job landing, PDF CV upload form, setup checks, full interview session, tab-switch warnings, and completion screen.
- Backend API integration through `src/api/backend`.
- Optional AI service integration through `src/api/ai`.
- Theme system with dark and light semantic tokens in `src/styles/tokens.css`.
- Request optimization for role-based data loading, optional endpoint fallbacks, refresh dedupe, and focused join-request polling.
- Route-level code splitting with `React.lazy` and `Suspense`.
- Route-level error boundaries so a broken page does not crash the whole app.

## Tech Stack

| Tool | Use |
| --- | --- |
| React 19 | UI runtime |
| Vite 7 | Dev server and production build |
| React Router 7 | Routing and nested layouts |
| Framer Motion / Motion | Landing and UI motion |
| Lenis | Landing-page-only smooth scrolling |
| Three / React Three Fiber / OGL | Visual and WebGL effects |
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
VITE_AI_SERVICE_URL=https://ai.vuapp.dev
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
    ai/                           # AI service client
    BackendProvider.jsx           # Auth/data provider and refresh orchestration
    backend/
      client.js                   # API fetch wrapper and ApiError
      endpoints.js                # Backend route constants
      mappers.js                  # Backend DTO to UI model mapping
      services.js                 # Auth, jobs, mocks, candidates, company API facade
      storage.js                  # Safe local/session storage helpers
      store.js                    # UI datastore populated from backend responses
  components/
    layout/                       # Navbar, sidebar, layout shell, route error boundary
    reactbits/                    # Landing visual/navigation components
    ui/                           # Buttons, cards, tables, charts, forms, dialogs, etc.
  hooks/                          # Shared hooks
  pages/
    Landing/                      # Public landing page and landing-only Lenis hook
    Application/                  # Candidate-facing apply flow
    Auth/                         # Login and company join
    Candidates/
    CompanyTeam/
    Jobs/
    Mocks/
    Profile/
    Settings/
    _showcase/                    # Component showcase route
  styles/                         # Global styles and design tokens
  utils/                          # Shared helpers, settings, theme utilities
```

For detailed flow documentation, see:

- [`USER_FLOWS.md`](./USER_FLOWS.md) for user-centered journeys.
- [`APP_FLOWS.md`](./APP_FLOWS.md) for routing, role, backend, and app behavior.
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) and [`PROJECT_RULES.md`](./PROJECT_RULES.md) for project notes and working rules.
- [`DESIGN_SYSTEM_COLOR_AUDIT.md`](./DESIGN_SYSTEM_COLOR_AUDIT.md) for design-token color audit notes.

## High-Level Frontend Architecture

The app is organized around route-level surfaces, shared layout shells, and API facades:

```txt
Browser
  -> React Router routes in App.jsx
  -> Surface layouts
      -> Public landing page
      -> Dashboard PageLayout
      -> Candidate ApplicationFlowLayout
  -> Feature pages
  -> Shared UI components and design tokens
  -> API facades
      -> Backend services/store
      -> AI interview/STT client
```

### Route and Layout Layer

`src/App.jsx` owns route definitions and keeps the three major surfaces separated:

- `/` renders the public landing page.
- Dashboard routes render inside `PageLayout`, which provides the sidebar, navbar, breadcrumbs, protected route shell, lazy page chunks, and route error boundary.
- Candidate application routes render in the standalone application shell, with `ApplicationFlowLayout` only around the early apply/setup steps.

Most dashboard and application pages are lazy-loaded with `React.lazy` and wrapped with `Suspense`, so each feature area can load independently.

### State and Data Layer

`src/api/BackendProvider.jsx` coordinates authenticated workspace loading, refreshes, logout, and backend status. Backend responses are normalized into the frontend store in `src/api/backend/store.js`, then consumed by pages through exported selectors, constants, and hooks.

This keeps page components focused on UI behavior while `src/api/backend/services.js` handles backend-specific payloads, endpoint fallbacks, mapping, and permissions.

### Backend Communication

The main backend integration lives under `src/api/backend`.

| File | Responsibility |
| --- | --- |
| `client.js` | Shared `fetch` wrapper, base URL handling, query strings, and API errors |
| `endpoints.js` | Backend endpoint constants |
| `services.js` | Auth, jobs, mocks, candidates, company, and application API facade |
| `mappers.js` | Backend DTO to UI model conversion |
| `store.js` | Normalized frontend datastore |
| `storage.js` | Safe token/local metadata storage |

Requests use `VITE_API_BASE_URL` and browser-safe auth storage. The service layer handles expected optional failures, role-aware calls, paginated responses, and local metadata patches for UI continuity.

### AI Service Communication

The AI integration is isolated in `src/api/ai/client.js` and uses `VITE_AI_SERVICE_URL`.

It communicates with the AI service in two ways:

- REST endpoints for interview lifecycle actions, such as starting and ending interview sessions.
- WebSocket connections for realtime interview events and speech-to-text streaming.

The AI client exposes helpers for:

- Starting/ending interview sessions.
- Creating interview WebSocket sessions.
- Sending candidate answers, video frames, tab-switch events, and session-end events.
- Creating realtime STT connections.
- Capturing microphone audio and streaming encoded audio chunks.

The client validates that `VITE_AI_SERVICE_URL` is an absolute HTTP(S) URL at build/runtime startup, then derives the matching `ws://` or `wss://` base URL for realtime communication.

## Routing

Public and auth routes:

```txt
/
/login
/join/:companyId
```

Dashboard routes render inside `PageLayout` with sidebar, navbar, breadcrumbs, lazy route chunks, and a route error boundary.

```txt
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
/showcase
```

Candidate application routes render in a standalone shell:

```txt
/apply/:companyId/:jobId
/apply/:companyId/:jobId/form
/apply/:companyId/:jobId/setup
/apply/:companyId/:jobId/mock/:mockId
/apply/:companyId/:jobId/interview
/apply/:companyId/:jobId/complete

/apply/:jobId
/apply/:jobId/form
/apply/:jobId/setup
/apply/:jobId/mock/:mockId
/apply/:jobId/interview
/apply/:jobId/complete
```

## Design System

Global design tokens live in `src/styles/tokens.css`.

- Dark mode is the default theme.
- Light mode is controlled by `:root[data-theme='light']`.
- Theme state is managed through `src/utils/theme.js`.
- Shared UI should use semantic tokens such as `--bg-card`, `--text-secondary`, `--border-default`, `--input-bg`, and `--status-*` instead of hardcoded colors.
- Landing-specific styling lives in `src/pages/Landing/LandingPage.css`, but it still leans on the same token system where possible.

## Landing Page Notes

The landing page is intentionally isolated from the rest of the app:

- `src/pages/Landing/useLandingLenis.js` initializes Lenis only while the landing page is mounted.
- Reduced motion preferences fall back to native browser scrolling.
- Landing visuals use components from `src/components/reactbits`.
- Landing interactions should not introduce global providers or affect dashboard/application scrolling.

## Backend Integration Notes

The frontend reads from the backend through `src/api/backend/services.js` and writes normalized data into `src/api/backend/store.js`.

Important behavior:

- Editors/viewers do not request owner-only endpoints such as company join requests.
- Optional backend calls can fail silently for expected statuses like `403`.
- Workspace refreshes are deduped to avoid repeated full reloads while navigating.
- Join-request polling refreshes only join requests instead of reloading all workspace data.
- Browser storage access is guarded so local/session storage failures do not crash the app.

## Candidate Application Notes

- Public application links support both `/apply/:companyId/:jobId` and `/apply/:jobId`.
- The CV upload is intended for PDF files.
- Setup asks for the candidate environment before entering the interview route.
- Interview completion ends at the standalone submission-complete screen.

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
