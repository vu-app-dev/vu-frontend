# Backend Gaps Found During Frontend Integration

This frontend is now wired to the local NestJS backend through `src/api/backend/*`. These are the backend gaps that still force local storage, local-only UI state, or degraded screens.
// add global context fot the link (dev, prod)

## High Priority

1. Enable CORS in `src/main.ts`, or keep the Vite `/api` proxy during development. //done
   - The frontend currently proxies `/api` to `http://localhost:4000`.
   - Browser clients outside Vite will still need backend CORS.

2. Add a public job detail/application endpoint. // front
   - Candidate pages need to render `/apply/:jobId` without company auth.
   - Current protected `/jobs/get/:jobId` cannot be used by unauthenticated candidates.
   - Suggested endpoint: `GET /public/jobs/:jobId`, including company info and linked mocks.

3. Return a candidate id from `POST /candidates/apply/:companyId/:jobId`. // back
   - Current response is `true`.
   - Frontend needs the created candidate id to attach mock session answers/results later.

4. Add endpoints to submit candidate assessment results. //done
   - Needed data: candidate answers, per-question score, AI feedback, strengths, areas to improve, anti-cheat flags, performance metrics, replay/video URL.
   - Current frontend interview flow can only run locally because no persistence endpoint exists.

5. Include candidate relations in `GET /candidates/get/:candidateId`. // ai + back
   - Needed relations: `questions`, `analysis`, `performance`.
   - Handoff says the current implementation returns only the candidate row.

6. Add team/member listing and join-request listing endpoints. // back, need members list, verify code for email 1234
   - Current backend supports replying/removing, but not listing pending requests or all company users reliably.
   - Needed endpoints:
     - `GET /companies/members`
     - `GET /companies/join_requests` //auth
     - `PATCH /companies/members/:userId/role`

// show company users, show add members (pending list)

## Product/Data Model Gaps

7. Company read endpoint. // front
   - Frontend currently derives company from `/users/me.companyUser.company` if present.
   - Suggested endpoint: `GET /companies/me`.

8. Invitation links. //front
   - Current frontend can generate a local `/join/:companyId` link, but no backend invite token/link model exists.

9. Job fields used by the UI but missing from backend:
   - `location`
   - `locationType`
   - `seniority`
   - `maxCandidates`
   - `draft` status
   - explicit close/pause/reopen job actions
   - per-job mock weights

10. Mock fields used by the UI but missing from backend:
    - scoring criteria
    - criteria/question weights
    - `enableFollowUpQuestions` and `enableRecordReplay` controls in update/read flows
    - reference answer fields in the frontend question editor

11. Candidate statuses.
    - Backend update only accepts `Accepted` or `Rejected`.
    - UI has `Shortlist`, but the backend update DTO does not allow setting it.

12. Analytics/dashboard endpoints.
    - Overview charts are derived client-side from paginated jobs/candidates.
    - Dedicated aggregate endpoints would avoid heavy list fetching.

## Known Backend Behavior Bugs / Concerns

13. Password reset code creation is incomplete. //back (reset pass code)
    - `/auth/reset_password` expects a `PASSWORD_RESET` code.
    - `/auth/code_verify_request` currently only handles `EMAIL_VERIFICATION`.

14. Public file upload should likely be protected or scoped.
    - `/files/upload` is public in the current handoff.

15. Candidate apply does not validate `companyId` and `jobId`. //back
    - The endpoint currently saves both IDs directly.
    - It should reject missing/inactive/closed jobs.
