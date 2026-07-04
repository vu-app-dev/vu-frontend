# VU Project Context

This document is the durable project map for future engineering and product work in this repository. Read it before making meaningful changes, and update it whenever major work changes architecture, routes, data flow, permissions, design-system patterns, or active product decisions.

## Product Vision

VU is an AI-assisted hiring platform for companies that need to create jobs, attach AI mock assessments, review candidates, and manage hiring teams. The product has two primary audiences:

- Hiring teams: owners, editors, and viewers who manage jobs, mocks, candidates, company settings, and team access.
- Candidates: applicants who open a public application link, submit profile/resume information, complete assigned mock interviews, and receive a completion state.

The intended experience is operational and work-focused: dense but readable dashboards, role-aware controls, clear hiring decisions, and candidate flows that feel guided and trustworthy.

## Architecture

The app is a React 19 + Vite 7 single-page application using React Router 7, Recharts 3, Lucide icons, PropTypes, Tailwind CSS, and a token-based CSS design system.

App boot sequence:

1. `src/main.jsx` imports global styles and initializes theme.
2. `BrowserRouter` wraps the app.
3. `BackendProvider` owns auth/backend state and exposes backend actions.
4. `App.jsx` defines all route groups and route wrappers.

Main architectural surfaces:

- Public landing/auth: `/`, `/login`, `/join/:companyId`.
- Authenticated dashboard: candidates, jobs, mocks, company/team, profile, settings, showcase.
- Public application flow: `/apply/:companyId/:jobId` and legacy `/apply/:jobId`.

Central runtime dependencies:

- `src/App.jsx`: route map, dashboard/application layouts, permission-aware wrappers.
- `src/api/BackendProvider.jsx`: auth token lifecycle, backend status, refresh scheduling, context actions.
- `src/api/backend/services.js`: domain service layer for auth, jobs, mocks, candidates, application flow, company/team.
- `src/api/backend/store.js`: mutable datastore and permission definitions.
- `src/api/backend/mappers.js`: backend-to-UI and UI-to-backend mapping boundary.
- `src/api/backend/client.js`: `apiFetch`, env validation, public file URL helpers.
- `src/api/ai/client.js`: AI interview REST/WebSocket/STT client.

## Folder Architecture

```text
src/
  api/
    ai/                 AI interview REST, WebSocket, and STT client
    backend/            backend client, endpoints, mappers, services, store, storage
  components/
    layout/             Navbar, Sidebar, PageLayout, Shortcuts, RouteErrorBoundary
    ui/                 reusable design-system primitives
  hooks/                shared UI/browser hooks
  pages/
    Application/        public candidate application and mock flow
    Auth/               login, register, verification, company join
    Candidates/         pipeline and candidate details
    CompanyTeam/        company overview, members, requests, settings
    Jobs/               job list/detail/create/edit
    Landing/            public marketing landing page
    Mocks/              mock list/detail/create/edit
    Profile/            profile and password management
    Settings/           local app preferences
    _showcase/          component showcase route
  styles/               global styles and design tokens
  utils/                theme, settings, weight redistribution
```

## Route Map

Public routes:

- `/`: landing page.
- `/login`: login, manager registration, email verification, password reset.
- `/join/:companyId`: company join request and verification.

Dashboard routes:

- `/candidates`: candidate pipeline.
- `/candidates/:slug`: candidate details.
- `/jobs`: job list.
- `/jobs/create`: create job.
- `/jobs/:id`: job details.
- `/jobs/:id/edit`: edit job.
- `/mocks`: mock list.
- `/mocks/create`: create mock.
- `/mocks/:id`: mock details.
- `/mocks/:id/edit`: edit mock.
- `/company`: company/team overview.
- `/company/team/:id`: team member details.
- `/company/members`: member invite and join requests.
- `/company/members/:id`: member/request detail wrapper.
- `/company/requests/:id`: join request details.
- `/company/settings`: company settings.
- `/profile`: current user profile.
- `/settings`: local app settings.
- `/showcase`: component showcase.

Application routes:

- `/apply/:companyId/:jobId`: candidate-facing application entry.
- `/apply/:companyId/:jobId/form`: candidate profile and resume form.
- `/apply/:companyId/:jobId/overview`: assessment overview.
- `/apply/:companyId/:jobId/mock/:mockId`: mock interview session.
- `/apply/:companyId/:jobId/complete`: completion state.
- `/apply/:jobId`: legacy shorthand with the same nested application steps.

Fallback:

- `*` redirects to `/candidates`.

## Current Features

Candidates:

- Search, filter, sort, paginate, and analyze candidate pipeline.
- Candidate pipeline uses a command-desk direction: table-first layout, compact summary strip, responsive applied filter chips beside the filter control, score percentages, Integrity naming, and preview drawer before full navigation.
- Candidate details with a candidate-specific summary header, Summary, Interview Evidence, CV Analysis, Replay, application details, resume link, and decision actions inside the Summary workspace.
- Role-aware candidate decisions for shortlist, accepted, and rejected statuses through app-styled confirmation dialogs.

Jobs:

- Job list uses the command-desk direction: compact summary strip, responsive applied filter chips beside the filter control, dense cards, functional secondary menus, application-link copy feedback, and app-styled create guard dialog.
- Job status display is derived in the frontend from existing fields: closed if closed/end date passed, scheduled if scheduled/start date future, otherwise active.
- Job details are organized around role summary, compact KPIs, candidate pipeline, combined role and assessment setup, performance trend, publishing rules, and role-aware actions.
- Multi-step job create/edit flow uses calmer step headers, assessment/publishing language, non-animated step changes, app-styled submit errors, mock assignment, persistent scoring/duration summaries, and scheduling.

Mocks:

- Mock list uses compact summary strip, responsive applied filter chips beside the filter control, dense cards, functional secondary menus, in-use/available status language, test/edit/delete states, and app-styled delete confirmation/error dialogs.
- Mock details are organized around assessment summary, compact KPIs, used-in-jobs, scoring structure, questions, performance, and clearer edit/test lock states.
- Multi-step mock create/edit flow uses Basics, Scoring, and Review language with assessment naming, session options, score categories, interview questions, persistent weighting feedback, and app-styled submit errors.

Company/team:

- Company overview with team table.
- Invite link generation and copy.
- Join request polling, role assignment, accept/decline flows.
- Member details, member permissions, activity, and removal.
- Company settings form.

Auth:

- Login, manager registration, email verification, resend cooldown, password reset.
- Company join request flow.
- Backend pending/unavailable state handling.

Candidate application:

- Public job landing page.
- Candidate profile/resume form.
- Assessment overview and mock locking/progress.
- Mock intro with device checks.
- AI interview UI with websocket/STT integration.
- Submission completion state.

Settings/profile:

- Theme and local settings.
- Profile phone edit and password change.

## Future Features

These are inferred from current gaps and code comments, not confirmed roadmap commitments:

- Candidate account/dashboard experience: dashboard, CV analysis, skill progress, suggested mocks, practice tips, mock library, interview session history, feedback reports, and performance trends.
- Persist all currently local-only metadata in the backend.
- Complete backend analytics for mock scores, sessions, pass rate, created/updated dates, candidate anti-cheat, and performance details.
- Replace hardcoded AI interview identifiers with real candidate/application context.
- Add test coverage and CI checks.
- Document API contracts and AI service contracts.
- Harden accessibility for table sorting, clickable cards, menus, and application flow.

## Figma and FigJam Documentation

Updated on June 28, 2026 during the VU UX research and IA documentation phase.

Source of truth rules:

- Current frontend reality comes from `src/App.jsx`, `PROJECT_CONTEXT.md`, `APP_FLOWS.md`, `USER_FLOWS.md`, and the actual route/page code.
- Figma and FigJam are allowed to document future product vision, but future-only features must be labeled as Future.
- Current, Future, and Drift labels are required when IA or flows mix shipped frontend behavior with target vision.

Artifacts:

- IA v2 FigJam board: `AaOePUnD5nuKRLRVYwIoOP`.
- IA repair/status layer: FigJam section `21:1619` named `VU IA Repair Section`.
- User Flows v2 FigJam section: FigJam section `23:1632` named `VU User Flows v2 FigJam Section`.
- Main design file: `LgLS6zCwbhl4yISLlsN2qC`.
- UX Research v2 page: Figma page `1568:3`.

FigJam IA repair notes:

- Claude's IA v2 board was preserved rather than rewritten.
- No obvious text encoding corruption was found in node text during the audit.
- The main readability gap was missing Current/Future/Drift labeling.
- The future Candidate path was retained and explicitly labeled Future.
- Role naming drift was documented: some IA language says Admin, while current frontend uses owner/editor/viewer.

Documented flows:

- Candidate current path: public apply link -> form -> overview -> mock intro -> AI interview -> complete.
- Candidate future path: dashboard -> CV analysis -> skill progress -> suggested mocks -> mock library -> practice/interview -> feedback reports -> performance trends -> next recommendations.
- Recruiter create job wizard.
- Recruiter create mock wizard.
- Candidate review and decision.
- Company join/request/approval.
- Owner/editor/viewer permission branches.
- Failure states: unavailable backend, pending approval, device permission failure, AI/STT websocket failure, restricted route, missing entity.

UX Research v2 pages:

- Product Vision.
- Research Plan.
- Secondary Research.
- Personas.
- Jobs-to-be-Done.
- Journey Maps.
- Opportunity/Synthesis Board.
- Product Drift + Roadmap Map.
- Future Candidate Experience Spec.

Secondary research sources placed on canvas:

- Axios / Greenhouse, September 24, 2024: candidate ghosting and rejection communication.
- Wall Street Journal, 2024: ghost jobs and candidate trust.
- Business Insider / SHRM, January 2025: workplace, skills, and AI recruiting pressure.
- arXiv, 2025: AI-assisted recruitment study, `https://arxiv.org/abs/2507.08029`.
- arXiv, 2025: recruiting AI transparency/TARAI index, `https://arxiv.org/abs/2511.03916`.
- arXiv, 2025: job-seeker perspective on explainable hiring systems, `https://arxiv.org/abs/2505.20312`.

## API Map

Backend client:

- `VITE_API_BASE_URL` is required and must be an absolute URL.
- `VITE_PUBLIC_API_ORIGIN` is optional and defaults to `VITE_API_BASE_URL`.
- `apiFetch()` attaches the stored token, serializes JSON/FormData, parses responses, and throws `ApiError`.

Backend endpoint domains:

- Auth: register manager, join request, request code, verify email, reset password, login, logout, logout all devices.
- Users: current user, user by id, edit current user, change password.
- Companies: company info, company users, join requests, join request reply, remove user, update company.
- Files: upload.
- Mocks: get, paginate, create, update, delete.
- Jobs: public get, get, paginate, create, update, delete.
- Candidates: get, paginate, apply, update status.

Service layer domains:

- Auth/workspace: `loadBackendData`, `login`, `registerManager`, `requestVerificationCode`, `verifyEmail`, `resetPassword`, `logout`, `logoutAllDevices`.
- Roles: `getCurrentUserRole`, `canCurrentUser`.
- Jobs: `getJobById`, `fetchJobById`, `addJob`, `updateJob`, `removeJob`, `duplicateJob`.
- Mocks: `getMockById`, `fetchMockById`, status/usage helpers, `addMock`, `updateMock`, `removeMock`, `duplicateMock`.
- Candidates: lookup helpers, slug helpers, candidate fetching, `updateCandidateStatus`.
- Application: `uploadFile`, `getApplicationSharePath`, `buildApplicationContext`, `resetApplication`, `saveCandidateInfo`, mock progress helpers.
- Company/team: member/request lookups, member removal, request accept/decline/update, company update, invite link, password/profile edit, company join, join request refresh.

AI service:

- `VITE_AI_SERVICE_URL` defaults to `http://localhost:8000`.
- REST helpers: `startInterview`, `endInterview`.
- WebSocket helpers: interview events, answer sending, video frame sending, tab switch warnings, session end.
- STT helpers: websocket connection, audio sending, mic capture.

## Data Flow

Dashboard data flow:

1. `BackendProvider` loads or changes auth token.
2. `loadBackendData()` fetches current user and company access.
3. Data is loaded according to permissions.
4. Backend payloads pass through mappers.
5. `setBackendData()` mutates exported store arrays/objects in place.
6. Store subscribers increment `dataVersion`.
7. Pages re-render from imported store values plus `useBackendData()`.

Application data flow:

1. Application route reads `companyId` and `jobId`.
2. `buildApplicationContext()` loads public job context and assigned mocks.
3. `APPLICATION` and `CANDIDATE_INFO` hold active application state.
4. Candidate info is saved locally/session-side and submitted through backend candidate application endpoints.
5. Mock progress is tracked through `startMock`, `completeMock`, `allMocksCompleted`, and `getCompletedCount`.

Local persistence:

- Auth token is stored under `vu:backend:token`.
- Theme is stored under `vu-theme`.
- Settings are stored under `vu-settings`.
- Application candidate info is stored in session storage.
- Backend-missing join requests and entity metadata are patched through local storage.

## State Management Overview

The app does not use Redux, Zustand, or React Query. State management is a hybrid:

- React local state for UI controls and forms.
- React context from `BackendProvider` for backend/auth status and refresh functions.
- Mutable module-level datastore in `src/api/backend/store.js` for shared domain entities.
- Local/session storage for preferences, application data, and backend-missing metadata.
- `dataVersion` subscription signal to force consumers to recalculate from mutable store data.

This pattern is simple and fast to work with, but it makes mutation boundaries important. Prefer service functions and mappers over direct feature-level mutation.

## Permission Matrix

| Permission              | Owner | Editor | Viewer |
| ----------------------- | ----- | ------ | ------ |
| View jobs               | Yes   | Yes    | Yes    |
| View mocks              | Yes   | Yes    | Yes    |
| View candidates         | Yes   | Yes    | Yes    |
| Create jobs             | Yes   | Yes    | No     |
| Edit jobs               | Yes   | Yes    | No     |
| Create mocks            | Yes   | Yes    | No     |
| Edit mocks              | Yes   | Yes    | No     |
| Review candidates       | Yes   | Yes    | No     |
| Change candidate status | Yes   | Yes    | No     |
| Accept members          | Yes   | No     | No     |
| Edit company            | Yes   | No     | No     |
| Remove members          | Yes   | No     | No     |

Use `canCurrentUser(permission)` for feature gating. Do not duplicate permission logic in page components unless there is a strong reason.

## Component Hierarchy

Top-level hierarchy:

```text
main.jsx
  BrowserRouter
    BackendProvider
      App
        Routes
          Public pages
          DashboardRouteLayout
            DashboardLayout
              PageLayout
                Navbar
                Sidebar
                Outlet page
          ApplicationRouteLayout
            ApplicationLayout
              Application shell
              Outlet page
```

Reusable layout components:

- `PageLayout`: responsive desktop/tablet/mobile shell and mobile drawer.
- `Navbar`: breadcrumbs, notifications, theme toggle, user menu, logout.
- `Sidebar`: navigation and current user display.
- `Shortcuts`: page action/search/filter bar.
- `RouteErrorBoundary`: route-level failure UI.

Reusable UI components:

- Actions: `Button`, `Toggle`, `RowMenu`.
- Identity/status: `Badge`, `RoleBadge`, `User`.
- Navigation: `Breadcrumb`, `Tabs`, `Stepper`, `SidebarButton`, `Pagination`.
- Forms: `Input`, `InputField`, input variants, labels, hints, file inputs.
- Display: `EntityCard`, `InfoCard`, `QuickInfoCard`, `ActionCard`, `QuestionCard`.
- Data tables: `TableHeader`, `TableRow`, `TableCell`.
- Filtering and overlays: `AppliedFilterChips`, `FilterOverlay`, `ConfirmDialog`, `SidePanel`, `QuickSort`, `Tags`.
- Charts: `AreaChart`, `BarChart`, `RadarChart`, `RadialBarChart`.

Candidates UX redesign notes, June 29, 2026:

- `ConfirmDialog` is now the preferred replacement for browser `confirm`/`alert` in touched flows.
- `SidePanel` is the reusable right-side preview drawer pattern.
- `QuickInfoCard`, `InfoCard`, `ActionCard`, and chart cards support `density="compact"`.
- `useEntranceAnimation` respects `prefers-reduced-motion`; Candidates pages should default operational surfaces to `animated={false}`.
- `TableRow` supports keyboard activation for clickable rows.

Candidates, Jobs, and Mocks correction pass, June 30, 2026:

- `AppliedFilterChips` is the shared pattern for Candidates, Jobs, and Mocks filter state. Render it through `Shortcuts.filterSlot`, not as a detached row.
- Filter chips are responsive: full removable chips on desktop, collapsed overflow on tablet, and compact count/clear behavior on mobile.
- `EntityCard` supports keyboard activation for clickable cards, and card menu triggers stop event propagation so menu actions do not navigate unexpectedly.
- `RowMenu` supports hidden/disabled actions and quieter semantic variants. Menus should contain secondary actions only, not duplicate card-click navigation.
- Candidate status naming should use `Shortlisted`; candidate risk language should use `Integrity`.
- Job and mock operational pages should avoid decorative status icons. Prefer label/value metadata and functional actions.
- Candidate full-details mobile tabs should stay focused on Summary, Interview Evidence, CV Analysis, and Replay; decisions live in Summary.
- Job details should combine role and assessment metadata when the split creates duplicate heavy sections.

## Feature Map

| Feature Area           | Primary Files/Folders                     | Notes                                        |
| ---------------------- | ----------------------------------------- | -------------------------------------------- |
| Candidates             | `src/pages/Candidates`                    | Pipeline, analytics, details, decisions      |
| Jobs                   | `src/pages/Jobs`                          | List, details, create/edit wizard            |
| Mocks                  | `src/pages/Mocks`                         | List, details, create/edit wizard            |
| Company/team           | `src/pages/CompanyTeam`                   | Overview, requests, member details, settings |
| Auth                   | `src/pages/Auth`                          | Login/register/verification/join             |
| Application            | `src/pages/Application`                   | Candidate public flow and AI mock session    |
| Landing                | `src/pages/Landing`                       | Marketing/public product page                |
| Profile/settings       | `src/pages/Profile`, `src/pages/Settings` | User profile, password, local settings       |
| Design-system showcase | `src/pages/_showcase`                     | Component examples                           |

## Design System

The design system is token-first and mostly implemented through CSS variables plus colocated component CSS.

Token source:

- `src/styles/tokens.css`: typography, icon sizes, spacing, padding, border radius, primitive colors, semantic colors, button/input/status/chart/shadow tokens, dark/light theme values.
- `src/styles/index.css`: Tailwind import, token import, Tailwind theme bridge, base styles, and utility classes.
- `DESIGN_SYSTEM_COLOR_AUDIT.md`: current color-system audit, WCAG contrast checks, token migration rules, and remaining color-system debt.

Theme behavior:

- Dark and light themes are controlled through `document.documentElement.dataset.theme`.
- Theme storage key is `vu-theme`.
- `initializeTheme`, `applyTheme`, `persistTheme`, and `toggleTheme` live in `src/utils/theme.js`.

Visual conventions:

- Use semantic tokens for colors, backgrounds, borders, shadows, and chart colors.
- Use `--text-accent` for accent text and links; do not use `--brand-default` for text in new UI.
- Use `--btn-primary-*`, `--status-*`, `--score-*`, `--chart-*`, and `--focus-*` tokens instead of primitive palette colors.
- Prefer existing UI primitives before introducing a new component.
- Keep dashboard UI dense, scannable, and operational.
- Use Lucide icons for known actions.
- Use cards for individual entities/items, not as nested page-section containers.

## Coding Standards

Project conventions from repo instructions and code:

- Use React function components.
- Use PropTypes for component APIs.
- Prefer `memo`, `useMemo`, and `useCallback` where the local pattern already uses them.
- Keep component CSS colocated with the component.
- Build class names with array/filter/join patterns.
- Use service functions instead of calling endpoints directly from pages.
- Use mapper functions at backend/UI boundaries.
- Preserve role/permission gating with `canCurrentUser`.
- Validate with `npm run lint` and `npm run build` after code changes when feasible.
- Environment URLs must be absolute.

Formatting:

- Semicolons enabled.
- Single quotes.
- 2-space indentation.
- Trailing commas where valid in ES5.
- Print width 100.

## UX Standards

- Dashboard surfaces should be quiet, utilitarian, and optimized for repeated work.
- Candidates surfaces should follow the hiring command-desk direction: table-first, denser spacing, restrained borders, fewer hover shadows, and decision/evidence language instead of AI-dashboard language.
- Jobs and Mocks surfaces should follow the same command-desk direction while staying card-based: compact summaries, responsive filters, dense cards, clear secondary menus, and setup-first details.
- Filter state should be visible near the filter control on desktop/tablet and collapse into a quiet applied-count chip on mobile, not a second filter button.
- Important actions should be role-aware and disabled/hidden with clear context.
- Candidate-facing flows should be linear, reassuring, and explicit about progress.
- Use native form semantics and accessible controls when possible.
- Replace browser alerts/confirms with product-styled dialogs when touching those flows.
- Avoid adding visible instructional text that explains the UI unless the user truly needs guidance.
- Preserve responsive behavior across mobile, tablet, and desktop.

## Known Issues

- `.github/copilot-instructions.md` is stale and references older architecture details such as React Router v6, Recharts 2, and static data.
- The project has no configured test runner.
- `npm run lint` currently fails in unrelated pre-existing files: `src/pages/Application/MockSession/MockInterview/MockInterview.jsx` and several `src/pages/Landing/sections/*` files.
- Git may report safe-directory warnings under the Codex sandbox user.
- Some existing text/comments contain encoding artifacts.
- `src/api/ai/client.js` contains console logging in runtime helpers.
- Company/Profile views were historically less polished than Candidates, Jobs, and Mocks; the current command-desk pass should be reviewed in-browser across desktop/tablet/mobile.
- AI mock interview currently hardcodes `MOCK_REQUIREMENTS['Technical']` and `candidateId: 'candidate-1'`.
- Some clickable cards/table headers use non-button elements or incomplete keyboard behavior.
- `VITE_AI_SERVICE_URL` is used but not documented in `.env.example`.

## Technical Debt

- `src/App.jsx` combines routing, layout wrappers, dialogs, permission redirects, and adapter logic.
- `src/api/backend/services.js` is a large domain service module with many responsibilities.
- The mutable singleton store is pragmatic but can hide mutation boundaries and complicate testing.
- Candidate shortlist appears to be local metadata only.
- Some job status patches are local-only.
- Mock analytics fields are marked as backend-unimplemented.
- Company settings UI exposes fields that are not all persisted by `formToBackendCompanyInput`.
- Backend-missing data is patched through local storage, which should be treated as temporary compatibility logic.
- There is no formal API contract documentation for backend or AI service payloads.

## Current Sprint

UX research and IA documentation phase completed on June 28, 2026.

Candidates command-desk UX redesign implemented on June 29, 2026 for Pipeline, Overview, and Candidate Details. Production build passes; lint is blocked by unrelated existing errors noted in Known Issues.

Jobs and Mocks command-desk UX redesign implemented on June 29, 2026 for management lists, details pages, and create/edit flows. Production build passes; lint remains blocked by unrelated existing errors noted in Known Issues.

Candidates + Jobs/Mocks UX correction pass implemented on June 30, 2026. This tightened filter placement, mobile density, card/menu interactions, candidate details IA, frontend-derived job status display, mock in-use language, and create/edit form organization. Production build passes; targeted ESLint for changed files passes. Full lint remains blocked by unrelated existing errors noted in Known Issues.

Follow-up correction on June 30, 2026 simplified the shared filter chips, removed the Candidates Overview nested scrollbar, moved detail-page actions back to right-side action panels, removed repeated status badges from body sections, combined Candidate Summary evidence readout, and changed Candidate Details job assessment rows to resolve from the candidate's job mocks instead of raw question rows. Production build passes; targeted ESLint for touched files passes.

Second follow-up on June 30, 2026 changed applied filters to a single count-only clear-all control, combined Candidate Summary and Interview Evidence into one Summary tab, added a future AI review placeholder, made Replay an intentional coming-soon placeholder, promoted Resume as the primary Application Info action, and hides the decision action card after a final decision. Production build passes; targeted ESLint for touched files passes.

Candidate Summary refinement on June 30, 2026 restored a compact performance graph and removed duplicate evidence/application blocks. Summary should show the future AI review placeholder, performance breakdown, review metrics, and one evidence-notes list; application metadata stays in the header/sidebar. Production build passes; targeted ESLint for Candidate Details passes.

Detail header refinement on June 30, 2026 flattened Candidate, Job, and Mock top metadata from nested mini-cards into inline record strips. Candidate Location moved to Application Info with Phone/LinkedIn/Resume. Production build passes; targeted ESLint for touched detail pages passes.

Design-system color audit and correction pass completed on June 30, 2026. This strengthened dark/light semantic text tiers, made primary buttons WCAG AA compliant, added focus/chart/score tokens, removed runtime hardcoded hex/rgb/hsl colors outside `tokens.css`, moved accent text to `--text-accent`, and documented migration rules in `DESIGN_SYSTEM_COLOR_AUDIT.md`.

Light-mode color correction on June 30, 2026 adjusted primary actions back toward the brighter VU brand using dark button text for contrast, restored a visible notification count badge/menu treatment, and fixed Mock Details scoring rows so their structure is visible in both themes.

Department concept removal on June 30, 2026 removed Department from job create/edit, job cards/details, mock usage rows, public job landing, company/team overview, member details, profile, company settings, and frontend API config. Use role type, seniority, location, joined/submitted date, activity, or assessment/application counts instead of reintroducing Department as a product field.

Settings and form polish on June 30, 2026 removed default helper hints from Jobs/Mocks create/edit inputs so hints only appear for validation errors, simplified Company Settings to persisted company profile fields only, replaced browser alerts with inline save errors, and added real account actions for sign out and sign out all devices.

Shell/navigation refinement on June 30, 2026 replaced the old generated VU mark with the provided VU wordmark paths, widened and calmed the sidebar rail, removed the fake first-job Application shortcut, standardized breadcrumb/nav copy, enlarged top-nav action targets, made notification rows informational instead of fake links, and removed decorative breadcrumb/dropdown scale animations.

Sidebar correction on June 30, 2026 removed the red nested active pill and colored active icon tile, softened nav separators, flattened the bottom account strip, and changed the sidebar user identity to initials instead of the hash icon.

Landing reset continued on June 30, 2026. The old multi-section landing page is now a plain vertical React Bits showcase instead of a composed hero: CardNav, Prism, RotatingText, CardSwap, FlowingMenu, PixelBlast, and ScrollFloat render one after another with raw/default component styling. React Bits components now live under `src/components/reactbits/<ComponentName>/` with colocated JSX, CSS, and index files. Added `ogl`, `motion`, `postprocessing`, and `react-icons` dependencies for the raw component sources.

Company/Profile command-desk redesign implemented on July 4, 2026. Company Overview now uses a flat workspace header, compact team/request summary, responsive team table, and no generic EntityCard hero. Invite Members now behaves like an approval queue with invite-link feedback, refresh, role assignment, and inline action errors. Member Details now uses one responsive details layout with a right action panel and app-styled remove confirmation. Profile now supports editable first name, last name, phone, and profile image URL through the backend `/users/edit` endpoint, plus inline password/profile save feedback.

Company/Profile correction pass on July 4, 2026 simplified Profile into a top identity card plus one Profile details panel that includes password updates after a subtle separator. Profile right rail now contains Permissions and Sessions only, with sign out and sign out all devices moved out of Company Settings. Company Member Details no longer shows Activity or Access level sections. Company Settings keeps only company profile save/reset actions and uses a stronger workspace-record header.

Profile security refinement on July 4, 2026 made Security a standalone panel matching Profile details, removed Reset draft, and changed password updates to an explicit Edit password -> Save password / Cancel flow.

The immediate product-design goal is to review the redesigned Candidates, Jobs, Mocks, Company, and Profile surfaces in-browser, confirm visual direction, and then decide the final Landing composition from the raw React Bits showcase.

## Next Tasks

Recommended next work:

1. Review the IA v2 repair layer, User Flows v2 FigJam section, and UX Research v2 Figma page.
2. Confirm Candidate dashboard scope, privacy model, authentication needs, and data ownership before implementation.
3. Convert the Future Candidate Experience Spec into phased frontend tickets.
4. Update stale `.github/copilot-instructions.md`.
5. Add `.env.example` coverage for `VITE_AI_SERVICE_URL`.
6. Decide whether local-only metadata should be formalized or removed.
7. Create a lightweight API contract document for backend and AI service.
8. Add a first test strategy or smoke test setup.
9. Audit candidate/application accessibility and complete screenshot QA for the new Company/Profile command-desk surfaces.
10. Fix AI interview hardcoded candidate/mock assumptions.
11. Complete desktop/tablet/mobile screenshot QA for Candidates, Jobs, and Mocks command-desk surfaces, including the June 30 correction pass, after Chrome/native host setup is restored.
12. Resolve existing lint blockers in MockInterview and Landing sections so `npm run lint` can become a reliable regression gate.
13. Review the raw Landing React Bits showcase, then choose which components should become the final landing composition and which raw styles need to be adapted into the VU visual system.

## Important Decisions

- React Router routes are centralized in `src/App.jsx`.
- Backend access should go through `src/api/backend/services.js`.
- Backend payload shape changes should be handled in `src/api/backend/mappers.js`.
- Shared domain data currently lives in the mutable store exported by `src/api/backend/store.js`.
- Permissions are role-based and defined in the backend store.
- Theme is applied globally through `data-theme`.
- The design system is CSS-token based, not a separate component package.
- Candidates UX should use `ConfirmDialog`, `SidePanel`, compact card/chart density, and non-animated operational surfaces.
- Jobs and Mocks UX should follow the same command-desk direction: compact summaries, applied filter chips, dense cards, calmer details pages, non-animated wizard transitions, and app-styled dialogs.
- Applied filters belong in `Shortcuts.filterSlot` across Candidates, Jobs, and Mocks as a single count-only clear-all control.
- Candidate Details keeps interview evidence inside Summary; Replay remains a placeholder until replay recording is connected.
- Candidate Summary should not repeat header/sidebar metadata. Keep it focused on AI review placeholder, performance graph, review metrics, and one evidence list.
- Card clicks open details; card menus should expose only secondary actions and must not trigger card navigation.
- Department is not a frontend product concept. Do not add Department fields, filters, cards, settings, or review rows; use role metadata, location, seniority, dates, and usage counts instead.
- Create/edit inputs should not show default helper hints like "Required" or "Minimum" before an error state. Use labels, placeholders, and validation messages instead.
- Company Settings should expose only persisted controls unless the backend/API contract supports more. Account actions belong in the right-side actions panel.
- Profile edits should use `editCurrentUser`, which sends the backend `/users/edit` DTO directly and refreshes the local member store after save.
- Detail-page action buttons belong in the right action panel on desktop; top summaries should focus on identity, status, and key context.
- Detail-page headers should avoid nested mini-cards; use a flat inline metadata strip for role/job/mock facts.
- App shell navigation should stay focused on real workspace sections: Candidates, Jobs, Mocks, Company, Profile, and Settings. Public application previews belong in job/detail actions, not the primary sidebar.
- The shell uses the provided VU wordmark as an inline themed SVG through `AppLogo`; keep logo color theme-aware instead of hardcoding runtime hex fills.
- Sidebar/top-nav controls should use stable 36-40px targets, clear focus rings, and quiet border/background feedback rather than left-border-only active states or scale animations.
- Sidebar active states should stay neutral. Avoid red tinted child pills or colored icon tiles; reserve the brand accent mostly for the logo and primary actions.
- Landing is being rebuilt from scratch. The current landing root intentionally contains only the new first viewport prototype until the nav/hero/card direction is approved.
- Candidate Details job assessment rows should resolve from the linked job's mocks, with candidate response scores layered on when available.
- Frontend display status for jobs is derived from existing fields without changing backend contracts.
- In-use mocks should use locked/disabled or hidden edit/delete behavior rather than exposing actions that cannot complete.
- Color work should follow `DESIGN_SYSTEM_COLOR_AUDIT.md`: accent text uses `--text-accent`; primary actions use `--btn-primary-*`; status, score, chart, and focus states use their semantic token groups.
- Runtime code should not introduce hardcoded hex/rgb/hsl colors outside `src/styles/tokens.css`.
- Frontend code is the source of truth for Current behavior.
- Figma/FigJam may document Future vision, but future-only features must be explicitly labeled Future.
- The future Candidate dashboard/path remains in IA and roadmap documentation even though it is not currently built.
- Role naming should standardize around owner/editor/viewer unless the product deliberately introduces a separate admin concept.
- Future major work should update this document before handoff.

## Missing Documentation

- Backend API contract and payload examples.
- AI service contract and websocket event schema.
- Design-system reference for component variants, states, accessibility, and examples.
- Testing strategy and QA checklist.
- Permission model reference outside source code.
- Data persistence/local metadata strategy.
- Deployment/environment setup beyond the current README and `.env.example`.
- Current sprint/roadmap ownership.
