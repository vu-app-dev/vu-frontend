# VU Frontend Project Rules

This file is the working context for future changes in this repository. Read this before modifying the project so you understand the full picture, current architecture, conventions, and integration rules.

## Product context

VU is an AI-powered virtual interview platform with two main areas:

1. **Recruitment dashboard** for company users/managers.
   - Candidate pipeline and candidate details.
   - Job management and job configuration.
   - Mock interview management and mock configuration.
   - Company team management, join requests, company settings.
   - Profile and settings.
2. **Candidate application flow** under `/apply/:jobId`.
   - Job landing page.
   - Candidate form.
   - Assessment overview.
   - Mock interview session.
   - Submission complete page.

## Current stack

Use the actual dependency versions in `package.json` as source of truth:

- React 19
- Vite 7
- React Router DOM 7.x, using the familiar declarative `Routes` / `Route` API
- Recharts 3.x
- Lucide React icons
- PropTypes for runtime prop validation
- ESLint 9 flat config
- Prettier
- Tailwind dependency exists, but the app primarily uses plain CSS files with design tokens

## Commands

- `npm run dev` starts Vite dev server.
- `npm run build` creates production build.
- `npm run lint` runs ESLint.
- `npm run preview` previews production build.

When validating code changes, prefer `npm run lint` and/or `npm run build` depending on scope.

## Entry points

- `src/main.jsx`
  - Imports global styles.
  - Calls `initializeTheme()`.
  - Wraps `App` in `BrowserRouter` and `BackendProvider`.
- `src/App.jsx`
  - Owns all route definitions.
  - Builds dashboard breadcrumbs.
  - Builds sidebar navigation items.
  - Defines page wrapper functions that bridge URL params and navigation callbacks to page components.

## Routing model

Dashboard routes are wrapped by `DashboardLayout`, which renders `PageLayout` with sidebar, navbar, breadcrumbs, and an `Outlet`.

Main dashboard routes:

- `/candidates`
- `/candidates/:slug`
- `/jobs`
- `/jobs/create`
- `/jobs/:id`
- `/jobs/:id/edit`
- `/mocks`
- `/mocks/create`
- `/mocks/:id`
- `/mocks/:id/edit`
- `/company`
- `/company/team/:id`
- `/company/members`
- `/company/members/:id`
- `/company/requests/:id`
- `/company/settings`
- `/profile`
- `/settings`
- `/showcase`

Candidate-facing routes are standalone under `ApplicationLayout`:

- `/apply/:jobId`
- `/apply/:jobId/form`
- `/apply/:jobId/overview`
- `/apply/:jobId/mock/:mockId`
- `/apply/:jobId/complete`

Authentication/join routes:

- `/login`
- `/join/:companyId`

Fallback redirects to `/candidates`.

## Authentication and backend state

`src/api/BackendProvider.jsx` owns backend/auth state.

It exposes `useBackendData()` through `src/api/backend/context.js` and provides:

- `token`
- `status`
- `error`
- `dataVersion`
- `isAuthenticated`
- `isLoading`
- `isReady`
- `login`
- `logout`
- `refreshData`
- `registerManager`
- `requestVerificationCode`
- `verifyEmail`

Dashboard pages require authentication. If not authenticated, `DashboardLayout` redirects to `/login`.

## API architecture

The app now has a backend-oriented API layer under `src/api`.

Important files:

- `src/api/index.js` is the public API barrel.
- `src/api/BackendProvider.jsx` provides auth/backend context.
- `src/api/backend/client.js` defines `apiFetch`, API base URLs, query string helper, public file URL helper, and `ApiError`.
- `src/api/backend/endpoints.js` centralizes backend endpoint paths.
- `src/api/backend/services.js` is the main domain service layer.
- `src/api/backend/store.js` is the in-memory frontend store populated from backend data.
- `src/api/backend/mappers.js` maps backend DTOs to UI data and UI forms back to backend payloads.
- `src/api/backend/storage.js` handles token/local persistence.

`fakeApi` and `localApi` currently alias `backendApi` for compatibility, so old imports may still work, but new work should use exports from `src/api`.

Vite proxy:

- `VITE_BACKEND_URL` defaults to `http://localhost:4000`.
- frontend API calls default to `/api` and Vite rewrites `/api/*` to backend `/*` during development.
- `VITE_API_BASE_URL` can override API base URL.
- `VITE_PUBLIC_API_ORIGIN` or `VITE_BACKEND_URL` is used for public file URLs.

## Data/store rules

The UI consumes module-level arrays/objects exported from `src/api/backend/store.js`:

- `JOBS`
- `MOCKS`
- `CANDIDATES`
- `COMPANY`
- `TEAM_MEMBERS`
- `JOIN_REQUESTS`
- `CURRENT_USER_ID`
- `CURRENT_USER`
- `APPLICATION`
- `CANDIDATE_INFO`

These are mutated through service/store helper functions, then subscribers are notified through `dataVersion`.

When a component needs to re-render after store updates, it should use `useBackendData()` and include/read `dataVersion` where needed.

Avoid replacing this pattern with random local duplicates unless the feature is purely temporary UI state.

## Backend mapping rules

Use `src/api/backend/mappers.js` for all backend/UI conversion.

Key conventions:

- IDs are normalized with `normalizeId()` because backend IDs may be numbers, strings, or UUIDs.
- Backend enum values map to UI variants in mapper constants.
- Job status UI variants: `active`, `scheduled`, `closed`.
- Candidate status UI variants: `accepted`, `rejected`, `shortlisted`, `pending`.
- Candidate cheating variants: `clean`, `flagged`, `critical`.
- Company roles: `owner`, `editor`, `viewer`.

When adding or changing backend fields:

1. Update endpoint/service call if needed.
2. Update mapper functions.
3. Update store shape only through store helpers.
4. Update UI PropTypes and rendering.
5. Validate with lint/build.

## Component organization

Reusable UI components live in `src/components/ui/{ComponentName}`.

Typical structure:

- `{ComponentName}.jsx`
- `{ComponentName}.css`
- `index.js`

Layout components live in `src/components/layout/{ComponentName}`.

Pages live in `src/pages/{Domain}/{PageOrSubPage}`.

For new page routes:

1. Create page folder and component files.
2. Add/confirm barrel export if needed.
3. Add lazy import/page wrapper in `src/App.jsx` if route-level.
4. Add route in `src/App.jsx`.
5. Add breadcrumb handling in `getRouteBreadcrumbs()`.
6. Add sidebar nav entry in `buildNavItems()` if it should appear in navigation.

## Component coding rules

- Use named exports for components.
- Wrap reusable components in `memo()` unless there is a clear reason not to.
- Use PropTypes for components.
- Prefer `useCallback` for event handlers passed to children/effects.
- Use module-scope constants for static arrays/config.
- Use the existing `className` pattern:
  - `['base', condition && 'modifier', className].filter(Boolean).join(' ')`
- Lucide icons are imported as components and rendered with explicit size, usually `size={16}` or `size={20}`.
- Decorative icons must use `aria-hidden="true"` on their wrapper or be otherwise hidden from screen readers.
- Interactive icon-only buttons must have accessible names via `aria-label`.
- Inputs must associate labels/hints/errors using `id`, `aria-invalid`, and `aria-describedby` when applicable.

## Styling rules

- Use plain CSS files next to components/pages.
- Use BEM-like class names:
  - `.component`
  - `.component__element`
  - `.component--modifier`
- Use design tokens from `src/styles/tokens.css`.
- Avoid hardcoded colors, spacing, shadows, radii, and typography when tokens exist.
- Check `tokens.css` before introducing new CSS values.
- Global resets and imports are in `src/styles/index.css`.

## Animation rules

Use existing patterns:

- IntersectionObserver entrance animation for cards/charts and scroll-visible content.
- CSS custom property delays for staggered lists/table rows.
- CSS `@keyframes` with per-item CSS variables for breadcrumb-like staggered animations.
- CSS grid `grid-template-rows` transitions for collapsible content.
- `requestAnimationFrame` entrance and timed exit classes for dynamically inserted/removed cards like questions.

Always cleanup observers, event listeners, and timeouts in effects where relevant.

## UI primitives available

Central UI exports are in `src/components/ui/index.js`:

- `Button`
- `Toggle`
- `Badge`, `BADGE_VARIANTS`, `BADGE_TYPES`
- `Breadcrumb`
- `EmptyState`
- `Pagination`
- `SidebarButton`
- `User`
- `Tabs`
- `Tags`
- `QuickSort`
- `Stepper`
- `TableHeader`, `TableRow`, `TableCell`
- `SectionTitle`
- `FilterOverlay`

Layout exports are in `src/components/layout/index.js`:

- `Navbar`
- `Sidebar`
- `Shortcuts`
- `PageLayout`

Before building a new primitive, search for an existing component to reuse.

## Domain pages map

- `src/pages/Auth/LoginPage.jsx`: login, manager registration, email verification.
- `src/pages/Candidates/Pipeline`: candidate list/pipeline.
- `src/pages/Candidates/CandidateDetails`: candidate detail tabs, CV analysis, feedback, replay.
- `src/pages/Jobs/JobManagement`: job list/details.
- `src/pages/Jobs/JobConfigPage`: create/edit job multi-step form.
- `src/pages/Mocks/MockManagement`: mock list/details.
- `src/pages/Mocks/MockConfigPage`: create/edit mock multi-step form.
- `src/pages/CompanyTeam`: company overview, members, requests, settings.
- `src/pages/Profile`: profile page.
- `src/pages/Settings`: settings page.
- `src/pages/Application`: candidate-facing application and mock session flow.
- `src/pages/_showcase`: component showcase.

## Forms and CRUD rules

For jobs and mocks:

- Use the config constants from API/store exports.
- Use mapper helpers for form conversion (`getJobForm`, `getMockForm`) rather than manually reconstructing backend payloads.
- Create/update/delete should go through the service functions exported from `src/api`.
- When local draft behavior is needed, use existing draft helpers instead of inventing separate localStorage keys.

For candidate application:

- Build context with `buildApplicationContext(jobId)` before candidate pages rely on `APPLICATION`.
- Save candidate info through the API application service.
- Start/complete mocks through application service helpers.

For company/team:

- Member removal, role changes, join request accept/decline, and company updates should go through `backendApi.company` service functions.
- Permission concepts live in `ROLES` and `hasPermission()`.

## Accessibility rules

Do not regress accessibility.

- Buttons need accessible labels.
- Icon-only controls require `aria-label`.
- Dropdowns/modals should support outside click and Escape close when appropriate.
- Tabs should use proper tab roles/selection attributes.
- Tables should use existing table primitives and appropriate roles.
- Form errors should be associated with fields.

## Lint/build rules

ESLint uses flat config in `eslint.config.js`.

- `dist` is ignored.
- Unused vars are errors, but variables matching `^[A-Z_]` are ignored.
- React hooks rules are enabled.
- Vite React Refresh rules are enabled.

After edits, run diagnostics and preferably `npm run lint`. For wider changes, run `npm run build`.

## Important implementation notes

- Many pages/components consume exported arrays like `JOBS` directly. If the backend store changes, use `dataVersion` from `useBackendData()` to trigger recomputation/re-render.
- `CURRENT_USER_ID` is exported as a live binding; import it from `src/api` when needed.
- `buildNavItems()` currently derives first job ID from `JOBS[0]?.id`.
- `DashboardLayout` handles backend loading/error states before rendering the app shell.
- `ApplicationLayout` rebuilds application context whenever `jobId` or `dataVersion` changes.
- `Suspense fallback={null}` is used for lazy route pages.

## Before changing anything

1. Identify the exact domain: UI primitive, layout, route/page, API/service, mapper, store, or styling.
2. Search existing components/helpers first.
3. Follow the established folder and export patterns.
4. Keep backend-facing transformations in API mapper/service files, not random page components.
5. Use design tokens for styling.
6. Keep PropTypes and accessibility complete.
7. Validate with diagnostics/lint/build as appropriate.

## Assistant behavior for this project

When working in this repo, the assistant should:

- Treat this document plus `.github/copilot-instructions.md` as project memory.
- Prefer understanding existing flow before editing.
- Avoid broad rewrites unless requested.
- Make focused, incremental changes.
- Preserve current route/API/store architecture.
- Ask only when requirements are ambiguous and cannot be inferred from project structure.
