# VU App Flows

This document describes the main user, routing, permission, data, and failure flows in the VU frontend.

## Actors

| Actor | Purpose |
| --- | --- |
| Owner | Full company workspace control, including company settings, members, join requests, jobs, mocks, and candidates. |
| Editor | Can manage jobs, mocks, and candidates, but cannot manage company members or company settings. |
| Viewer | Can view jobs, mocks, and candidates, but cannot create, edit, or make decisions. |
| Candidate | Public user applying through an `/apply` link. |

## Permission Model

| Permission | Owner | Editor | Viewer | Used For |
| --- | --- | --- | --- | --- |
| `view_jobs` | Yes | Yes | Yes | Jobs list/details and application links. |
| `view_mocks` | Yes | Yes | Yes | Mocks list/details and job mock lookup. |
| `view_candidates` | Yes | Yes | Yes | Candidate pipeline and details. |
| `create_jobs` | Yes | Yes | No | Create job form and sidebar action. |
| `edit_jobs` | Yes | Yes | No | Edit job, delete/duplicate job, share/test job actions. |
| `create_mocks` | Yes | Yes | No | Create mock form and sidebar action. |
| `edit_mocks` | Yes | Yes | No | Edit/delete/duplicate mock actions. |
| `review_candidates` | Yes | Yes | No | Candidate review surfaces. |
| `change_candidate_status` | Yes | Yes | No | Accept, reject, and shortlist candidate decisions. |
| `accept_members` | Yes | No | No | Join request list, accept, and decline flows. |
| `edit_company` | Yes | No | No | Company settings page. |
| `remove_members` | Yes | No | No | Team member removal. |

## High-Level App Flow

```txt
Browser opens app
  -> BackendProvider checks stored token
  -> If no token: user is unauthenticated
  -> If token exists: load workspace data
  -> DashboardLayout checks auth state
  -> Authenticated user enters dashboard
  -> Route-level lazy page loads
  -> RouteErrorBoundary catches route crashes
```

## Authentication Flow

### Login

```txt
User opens /login
  -> Enters credentials
  -> login(credentials) calls backend auth endpoint
  -> Token is stored
  -> refreshData({ force: true }) loads workspace
  -> User is redirected into dashboard
```

### Invalid Token Or Unauthorized

```txt
Stored token exists
  -> BackendProvider attempts workspace refresh
  -> Backend returns 401
  -> Token is cleared
  -> User becomes unauthenticated
  -> User is redirected to /login
```

### Pending Company Approval

```txt
User logs in
  -> /users/me returns company user with pending approval
  -> Store is reset to limited user/company context
  -> Auth notice is shown on login
  -> User cannot enter workspace until owner accepts request
```

### Removed Or Declined Company Access

```txt
User logs in or refreshes
  -> /users/me returns removed/declined/unavailable company access
  -> Token is cleared
  -> Auth notice explains company access is unavailable
  -> User returns to /login
```

### Logout

```txt
User chooses sign out
  -> Token is cleared locally first
  -> Backend logout endpoint is called
  -> Auth state becomes unauthenticated
  -> User is sent to /login
```

## Backend Workspace Loading Flow

```txt
loadBackendData()
  -> GET /users/me
  -> Determine company access and role
  -> Optionally GET company info
  -> Gate requests by role permissions
  -> Load allowed resources in parallel
  -> Normalize backend DTOs into UI store
  -> Increment store version
  -> React pages re-render from dataVersion
```

Role-aware request gates:

```txt
Owner
  -> Loads company users
  -> Loads join requests
  -> Loads jobs
  -> Loads mocks
  -> Loads candidates

Editor
  -> Loads company users
  -> Does not load join requests
  -> Loads jobs
  -> Loads mocks
  -> Loads candidates

Viewer
  -> Does not load company users
  -> Does not load join requests
  -> Loads jobs
  -> Loads mocks
  -> Loads candidates
```

Refresh behavior:

```txt
App is active
  -> refreshData runs on startup
  -> refreshData runs every 30 seconds
  -> refreshData runs on window focus
  -> refreshData runs when tab becomes visible
  -> In-flight refreshes are reused
  -> Recent refreshes are deduped for 10 seconds unless force is true
```

Join request polling:

```txt
Owner opens Add Members
  -> refreshJoinRequests() runs immediately
  -> refreshJoinRequests() repeats every 15 seconds
  -> visibilitychange refreshes only join requests
  -> Full workspace reload is avoided
```

## Dashboard Shell Flow

```txt
Authenticated user enters dashboard route
  -> DashboardLayout renders PageLayout
  -> Current user is read from store
  -> Breadcrumbs are derived from pathname
  -> Sidebar items are derived from role permissions
  -> Lazy route page renders inside Suspense
  -> RouteErrorBoundary isolates page crashes
```

Sidebar behavior:

```txt
Candidates
Jobs
  -> Job Management
  -> Create Job if create_jobs permission
Mocks
  -> Mock Management
  -> Create Mock if create_mocks permission
Company
  -> Overview
  -> Add Members if accept_members permission
  -> Company Settings if edit_company permission
Profile
Settings
Application shortcut if edit_jobs permission and at least one job exists
```

## Candidate Pipeline Flow

Route:

```txt
/candidates
```

Flow:

```txt
User opens Candidates
  -> Pipeline lazy chunk loads
  -> Candidate list is read from store
  -> Optional jobId query filters list
  -> User can search, filter, and sort
  -> Responsive pagination calculates visible rows
  -> User clicks candidate row
  -> Navigate to /candidates/:slug
```

Candidate action menu:

```txt
User opens row menu
  -> If user can change candidate status:
       View Details
       Shortlist if candidate is not final
       Accept if candidate is not final
       Reject if candidate is not final
  -> If user cannot change candidate status:
       View Details only
```

Decision behavior:

```txt
User chooses Accept or Reject
  -> Confirmation prompt appears
  -> updateCandidateStatus(candidateId, action)
  -> Backend is updated
  -> Candidate store item is updated
  -> UI refreshes from dataVersion
```

## Candidate Details Flow

Route:

```txt
/candidates/:slug
```

Flow:

```txt
User opens candidate details
  -> App tries selectedCandidateId from navigation state
  -> Fallback resolves candidate by slug
  -> If candidate is missing: redirect to /candidates
  -> CandidateDetails renders
```

Tabs:

```txt
Full Feedback
Mock Replay
CV Analysis
Actions tab on compact/mobile layout
```

Decision panel:

```txt
If user has change_candidate_status
  -> Show decision buttons unless candidate is final
  -> Shortlist is hidden when already shortlisted
  -> Accept/Reject require confirmation modal
If user is viewer
  -> Show read-only message
```

## Jobs Flow

### Jobs List

Route:

```txt
/jobs
```

Flow:

```txt
User opens Jobs
  -> JobList lazy chunk loads
  -> Jobs are read from store
  -> User can search, filter by status/type, sort, and paginate
  -> User can view details
  -> User can show candidates for a job
  -> User can share job if edit_jobs permission
  -> User can edit job if edit_jobs permission
```

Create job guard:

```txt
User clicks Create Job
  -> If user lacks create_jobs: do nothing or redirect away
  -> If no mocks exist: show "Create a mock first" guide
  -> If mocks exist: navigate to /jobs/create
```

### Create Job

Route:

```txt
/jobs/create
```

Flow:

```txt
User opens Create Job
  -> Permission check requires create_jobs
  -> Mock existence check requires at least one mock
  -> Four-step form starts
       1. Job Info
       2. Add Mocks
       3. Scheduling
       4. Review & Publish
  -> Validation blocks invalid step transitions
  -> addJob(form) sends backend create request
  -> Workspace data reloads
  -> User navigates to /jobs/:id
```

### Job Details

Route:

```txt
/jobs/:id
```

Flow:

```txt
User opens job details
  -> Job is resolved by id
  -> Charts and top candidates render
  -> User can open linked candidates
  -> If edit_jobs:
       Share Job copies /apply link
       Test Application opens candidate application route
       Edit Job opens /jobs/:id/edit
```

### Edit Job

Route:

```txt
/jobs/:id/edit
```

Flow:

```txt
User opens edit route
  -> Permission check requires edit_jobs
  -> If missing permission: redirect to /jobs/:id
  -> Edit form loads existing job
  -> Active jobs have stricter scheduling rules
  -> updateJob(id, form) sends backend update request
  -> Workspace data reloads
  -> User returns to /jobs/:id
```

## Mocks Flow

### Mocks List

Route:

```txt
/mocks
```

Flow:

```txt
User opens Mocks
  -> MockList lazy chunk loads
  -> Mocks are enriched with computed status and linked jobs
  -> User can search, filter, sort, and paginate
  -> User can view details
  -> User can test a mock if it is linked to a job and user can edit mocks
  -> User can edit/delete mocks if edit_mocks permission and mock is not active
```

### Create Mock

Route:

```txt
/mocks/create
```

Flow:

```txt
User opens Create Mock
  -> Permission check requires create_mocks
  -> Three-step form starts
       1. Mock Info
       2. Evaluation
       3. Review & Publish
  -> addMock(form) sends backend create request
  -> Workspace data reloads
  -> User navigates to /mocks/:id
```

### Mock Details

Route:

```txt
/mocks/:id
```

Flow:

```txt
User opens mock details
  -> Mock is resolved by id
  -> Linked jobs and chart data render
  -> If edit_mocks:
       Edit opens /mocks/:id/edit
       Test opens /apply/:companyId/:jobId/mock/:mockId when linked job exists
```

### Edit Mock

Route:

```txt
/mocks/:id/edit
```

Flow:

```txt
User opens edit mock route
  -> Permission check requires edit_mocks
  -> If missing permission: redirect to /mocks/:id
  -> Existing mock form loads
  -> updateMock(id, form) sends backend update request
  -> Workspace data reloads
  -> User returns to /mocks/:id
```

## Company Flow

### Company Overview

Route:

```txt
/company
```

Flow:

```txt
User opens Company
  -> Company overview renders company card
  -> If current role is not viewer:
       Team member table renders
       User can open /company/team/:id
  -> If current role is viewer:
       Team member table is hidden/restricted
```

### Member Details

Routes:

```txt
/company/team/:id
/company/members/:id
```

Flow:

```txt
User opens member details
  -> Member is resolved by id
  -> Member info and activity render
  -> Removal callbacks return user to company page or members page
```

### Add Members And Join Requests

Route:

```txt
/company/members
```

Flow:

```txt
Owner opens Add Members
  -> Permission check requires accept_members
  -> Pending join requests render
  -> Owner assigns role for each pending request
  -> Accept request creates/activates member
  -> Decline request rejects request
  -> Processed requests render separately
```

Request details:

```txt
/company/requests/:id
  -> Permission check requires accept_members
  -> Request is resolved by id
  -> If missing: redirect to /company/members
  -> Accept redirects to /company/members/:memberId
  -> Decline redirects to /company/members
```

Invite link:

```txt
Owner clicks Generate Invitation Link
  -> Local public join link is generated
  -> Owner can copy link
  -> Copied state auto-clears after timeout
```

### Company Settings

Route:

```txt
/company/settings
```

Flow:

```txt
Owner opens company settings
  -> Permission check requires edit_company
  -> Company form loads from store
  -> Owner edits identity, statuses, departments
  -> updateCompany(form) sends backend update request
  -> Saved state appears briefly
```

## Profile Flow

Route:

```txt
/profile
```

Flow:

```txt
User opens profile
  -> Current user/member is resolved
  -> User can edit phone/profile details
  -> User can update password
  -> Recent activity renders
  -> Role permissions are displayed
```

Password update:

```txt
User enters current password, new password, confirmation
  -> Frontend validates required current password
  -> Frontend validates new password length
  -> Frontend validates confirmation match
  -> changePassword request is sent
  -> Success state auto-clears
```

## Settings Flow

Route:

```txt
/settings
```

Flow:

```txt
User opens settings
  -> Persisted settings load from browser storage
  -> User can change theme, default job status, notifications, localization, and privacy
  -> Save writes settings to browser storage
  -> Theme is applied immediately
  -> Saved toast auto-clears
```

## Public Company Join Flow

Route:

```txt
/join/:companyId
```

Flow:

```txt
Public user opens company join link
  -> Company join page renders
  -> User submits join request data
  -> joinCompany(companyId, input) sends backend request
  -> User waits for owner approval
  -> Owner later accepts or declines from /company/members
```

## Candidate Application Flow

Supported routes:

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

### Application Context Setup

```txt
Candidate opens /apply link
  -> ApplicationLayout reads companyId and jobId from route
  -> buildApplicationContext(jobId, { companyId }) runs
  -> App tries store job first
  -> If job is missing, app fetches public job by id
  -> Job, company, and linked mocks are normalized into APPLICATION
  -> First mock becomes available
  -> Other mocks start locked
```

### Landing Page

```txt
Candidate opens /apply/:companyId/:jobId
  -> JobLanding renders job and company summary
  -> Candidate clicks Apply
  -> Navigate to /form
```

### Candidate Form

```txt
Candidate opens /form
  -> If job is inactive: redirect back to landing
  -> Candidate enters personal info and CV
  -> Existing stored candidate info can prefill form
  -> On submit:
       Upload CV if a file exists
       POST candidate application to backend
       Store candidate id if backend returns it
       Refresh workspace if authenticated user is also signed in
       Navigate to /overview
```

### Job Overview

```txt
Candidate opens /overview
  -> If job is inactive: redirect back to landing
  -> Mock checklist renders
  -> Completed mocks are shown
  -> Available mock can be started
  -> Locked mocks wait for earlier mocks
  -> If all mocks are completed: candidate can submit application
```

### Mock Intro

```txt
Candidate starts a mock
  -> MockIntro checks required device permissions
  -> Camera/microphone/screen requirements depend on mock type
  -> Candidate accepts rules
  -> Candidate starts session
```

### Mock Session

```txt
MockSession starts
  -> Timer begins
  -> Required panels render based on mock type
  -> Chat/input area renders
  -> AI follow-up simulation runs locally
  -> Tab visibility warning detects leaving page
  -> On complete:
       completeMock(mockId)
       Current mock status becomes completed
       Next locked mock becomes available
       Navigate back to /overview
```

### Submission Complete

```txt
Candidate completes all mocks
  -> Click Submit Application
  -> Navigate to /complete
  -> Submission summary renders
  -> If authenticated dashboard user: Back to Home goes to /candidates
  -> If public candidate: Back to Home goes to public application landing
```

## Route Error Flow

```txt
Route component crashes
  -> RouteErrorBoundary catches error
  -> Current shell stays mounted
  -> Fallback shows:
       Try Again
       Back to Safe Page
  -> Navigating to another route resets boundary automatically
```

Dashboard safe path:

```txt
Dashboard page error -> /candidates
Dashboard shell error -> /login
```

Application safe path:

```txt
Application page error -> /apply/:companyId/:jobId or /apply/:jobId
Application shell error -> /apply/:companyId/:jobId or /apply/:jobId
```

## Lazy Loading Flow

```txt
User navigates to route
  -> Route component is imported with React.lazy
  -> Suspense shows Loading...
  -> Chunk loads
  -> Page renders
  -> If chunk/render fails, RouteErrorBoundary handles it
```

Lazy-loaded route surfaces:

```txt
Candidates pipeline
Candidate details
Job list
Job details
Create/edit job
Mock list
Mock details
Create/edit mock
Company overview
Add members
Company settings
Profile
Settings
Application pages
Component showcase
```

## Backend Failure And Recovery Flow

```txt
Workspace refresh fails with normal endpoint error
  -> BackendProvider status becomes error
  -> Dashboard shows Backend unavailable
  -> User can Retry
  -> Retry calls refreshData({ force: true })
```

Optional endpoint failure:

```txt
Optional backend request fails with expected status such as 403
  -> Request returns fallback value
  -> Console warning may be suppressed for silent statuses
  -> App continues rendering accessible data
```

Candidate application public fetch failure:

```txt
Public job fetch fails
  -> buildApplicationContext catches error
  -> App falls back to stored job if available
  -> If no job exists, APPLICATION is cleared or public fallback is created
```

## Main Data Objects

| Store object | Meaning |
| --- | --- |
| `JOBS` | Normalized jobs shown in dashboard and application links. |
| `MOCKS` | Normalized mock interviews and evaluation config. |
| `CANDIDATES` | Normalized candidate applications and review data. |
| `COMPANY` | Current company/workspace profile. |
| `TEAM_MEMBERS` | Company users visible to owner/editor. |
| `JOIN_REQUESTS` | Pending/processed join requests visible to owner. |
| `APPLICATION` | Current candidate-facing application context. |
| `CANDIDATE_INFO` | Public candidate form/session data. |
| `CURRENT_USER` | Authenticated backend user. |
| `CURRENT_USER_ID` | Current user id used for member lookup and role checks. |

## End-To-End Happy Paths

### Owner Creates Full Hiring Flow

```txt
Login as owner
  -> Create mock
  -> Create job and attach mock
  -> Share application link
  -> Candidate applies
  -> Candidate completes mocks
  -> Owner reviews candidate in pipeline
  -> Owner accepts/rejects candidate
```

### Editor Reviews Candidates

```txt
Login as editor
  -> Workspace loads jobs, mocks, candidates, and company users
  -> Join requests are not requested
  -> Open Candidates
  -> Review candidate details
  -> Shortlist, accept, or reject candidate
```

### Viewer Audits Workspace

```txt
Login as viewer
  -> Workspace loads jobs, mocks, and candidates
  -> Company users and join requests are not requested
  -> Create/edit controls are hidden or guarded
  -> Candidate decisions are read-only
```

### Candidate Applies Publicly

```txt
Open /apply link
  -> Read job landing
  -> Submit candidate form and CV
  -> Complete each available mock
  -> Submit application
  -> See completion screen
```

## QA Smoke Test Checklist

Use this list after major changes:

```txt
Auth
  [ ] Login works
  [ ] Logout redirects to /login
  [ ] Invalid token redirects to /login

Dashboard
  [ ] /candidates renders
  [ ] /jobs renders
  [ ] /mocks renders
  [ ] /company renders
  [ ] /profile renders
  [ ] /settings renders

Roles
  [ ] Owner sees Add Members and Company Settings
  [ ] Editor does not request or show Join Requests
  [ ] Viewer cannot create/edit/change decisions

Jobs
  [ ] Create job requires at least one mock
  [ ] Share job copies /apply link
  [ ] Test application opens public flow

Mocks
  [ ] Create mock works
  [ ] Active/linked mocks protect destructive edits
  [ ] Test mock opens linked application route

Candidates
  [ ] Candidate pipeline filters work
  [ ] Candidate details tabs render
  [ ] Candidate decision updates status

Company
  [ ] Join request list is owner-only
  [ ] Accept request creates member
  [ ] Decline request updates request

Public application
  [ ] Landing renders from shared link
  [ ] Candidate form submits
  [ ] Mock overview unlocks next mock after completion
  [ ] Completion screen renders

Resilience
  [ ] Route error fallback renders on page crash
  [ ] Retry resets route boundary
  [ ] Backend unavailable screen can retry
```
