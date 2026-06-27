# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build (requires .env with VITE_API_BASE_URL set)
npm run lint       # run ESLint
npm run preview    # preview the production build locally
```

There is no test runner configured in this project.

## Environment Setup

Copy `.env.example` to `.env` before running or building. Two variables are required to be absolute URLs:

```
VITE_API_BASE_URL=https://api.vuapp.dev        # required — backend origin
VITE_PUBLIC_API_ORIGIN=https://api.vuapp.dev   # optional — falls back to VITE_API_BASE_URL
```

Vite enforces these at build time and will throw if they are missing or not absolute URLs.

## Architecture

### Two App Surfaces

The app has two completely separate surfaces rendered under one React root:

- **Dashboard** (`/candidates`, `/jobs`, `/mocks`, `/company`, `/profile`, `/settings`) — the HR/recruiter tool with sidebar + navbar chrome (`DashboardRouteLayout` in `src/App.jsx`).
- **Application flow** (`/apply/:companyId/:jobId/*`) — candidate-facing, no dashboard chrome, standalone shell. Route layout is `ApplicationRouteLayout`.

Auth routes (`/login`, `/join/:companyId`) are standalone with no layout wrapper.

A `/showcase` route renders `src/pages/_showcase/ComponentShowcase.jsx` inside the dashboard layout — useful for inspecting UI primitives during development.

### State Management — In-Memory Store

There is no Redux, Zustand, or React Query. State lives in mutable module-level arrays and objects in `src/api/backend/store.js`:

```js
export const JOBS = [];
export const MOCKS = [];
export const CANDIDATES = [];
export const COMPANY = {};
export const TEAM_MEMBERS = [];
```

These arrays are mutated in place (via `replaceArray`/`replaceObject`) so existing references stay valid. A pub/sub mechanism (`subscribeStore` / `notify`) increments a version counter on every change. `BackendProvider` subscribes and stores the version in React state, causing re-renders. Pages read `dataVersion` from `useBackendData()` and pass it through `useMemo` deps to re-derive data when the store changes.

**`void dataVersion` idiom:** Inside `useMemo`, writing `void dataVersion;` at the top of the callback is the standard way to declare a dependency on the store version without actually using the value — it forces the memo to re-run on every store change without requiring the variable to appear in a conditional or expression.

### API Layer (`src/api/`)

| File | Purpose |
|---|---|
| `BackendProvider.jsx` | React context provider; owns auth state, polling (30s interval + focus/visibility), `login`/`logout` |
| `backend/context.js` | `BackendContext` + `useBackendData()` hook |
| `backend/store.js` | In-memory store, mutation helpers, pub/sub |
| `backend/services.js` | All async operations (CRUD for jobs/mocks/candidates, auth, application flow) |
| `backend/endpoints.js` | Centralized endpoint strings/factories |
| `backend/client.js` | `apiFetch` wrapper — adds `Authorization` header, handles JSON, throws `ApiError` |
| `backend/mappers.js` | Backend → UI shape transforms |
| `backend/storage.js` | `localStorage`/`sessionStorage` helpers (token, candidate info, entity metadata) |

All imports go through `src/api/index.js` which re-exports everything.

### Local Metadata Pattern

Some fields the backend doesn't persist (mock topic weights, job seniority/location, candidate status overrides) are stored in `localStorage` under `vu:backend-missing:entity-metadata` and merged back onto entities after every fetch. Functions `patchLocalJobMetadata`, `patchLocalMockMetadata`, `patchLocalCandidateMetadata` in `storage.js` manage this.

### Application Flow Context

The candidate-facing flow uses a module-level `APPLICATION` object (in `store.js`) that is populated once per job by `buildApplicationContext(jobId, { companyId })` in `ApplicationLayout`. This object carries the resolved job, its mocks, and candidate session info. Sub-pages (`CandidateForm`, `JobOverview`, `MockSession`, `SubmissionComplete`) read from `APPLICATION` directly rather than from the store arrays. The context is rebuilt whenever the job signature changes (title, end date, attached mocks).

The apply route exists in two variants — with and without `companyId`:
- `/apply/:companyId/:jobId/*` — used when sharing a public link that includes the company
- `/apply/:jobId/*` — legacy/shorthand; both map to `ApplicationRouteLayout`

### Routing

All routes are defined in `src/App.jsx`. Pages are lazy-loaded via `React.lazy`. Route-to-component wiring follows a wrapper pattern: a thin `*Page` function component extracts route params (`useParams`, `useLocation`) and passes them as props to the actual page component. This keeps page components free of router coupling.

Candidates are addressed by **slug** in the URL (`/candidates/:slug`), not by ID. The slug encodes the candidate name plus a disambiguating suffix (`name--id`). `getCandidateBySlug` and `getCandidateById` in `services.js` handle lookup. Navigation state may carry `selectedCandidateId` for a faster by-ID lookup before falling back to slug.

### Permissions

Three roles are defined in `store.js`: `owner`, `editor`, `viewer`. Permission checks go through `canCurrentUser(permission)` (from `services.js`), which reads the current user's role from `TEAM_MEMBERS`. The sidebar nav items and route guards both call this function — conditional nav items and `<Navigate>` redirects enforce access at the route level.

### Component Structure

UI primitives live in `src/components/ui/` — each component has its own directory with a `.jsx` implementation file and an `index.js` barrel export. Layout components (Sidebar, Navbar, PageLayout) are in `src/components/layout/`.

### Hooks (`src/hooks/`)

- `useEntranceAnimation(animated, threshold)` — attaches an `IntersectionObserver` and returns `{ ref, isVisible }`. Attach `ref` to an element; `isVisible` flips true once the element enters the viewport. Pass `animated=false` to skip the observer entirely.
- `useResponsiveItemsPerPage()` — returns a page-size number derived from the current viewport width, for use with `Pagination`.

### Utilities (`src/utils/`)

- `redistributeWeights(items, lockedIds, targetId, targetWeight)` — keeps weights summing to 100 while respecting manually-locked items. Used by `MockConfigForm` when the user edits mock topic weights.
- `redistributeWeightsPair(listA, listB, ...)` — same logic across two parallel lists that share a single 100% pool (criteria + questions in mock evaluation config).
- `theme.js` — `initializeTheme()`, `toggleTheme()`, `applyTheme()`, etc. Theme is stored in `localStorage` under `vu-theme` and applied as `data-theme` on `<html>`.

### Styling

All styling uses CSS custom properties defined in `src/styles/tokens.css` (exported from Figma). Tokens cover typography, spacing, colors, borders, shadows, and component-specific vars (buttons, inputs, charts). No Tailwind utility classes in component markup — Tailwind is configured but tokens are the primary styling mechanism.

Dark/light theme is toggled by setting `data-theme="dark"|"light"` on `<html>`. Default is dark. Theme is initialized before first render in `src/main.jsx` via `initializeTheme()` and persisted to `localStorage` under `vu-theme`.
