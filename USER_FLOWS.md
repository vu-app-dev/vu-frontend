# VU UX User Flows

This document describes the VU experience from the user's point of view. It focuses on what each person wants to achieve, what they see on screen, the choices they make, the moments where they can get blocked, and how the product helps them continue.

For implementation details and developer-facing flow notes, see [`APP_FLOWS.md`](./APP_FLOWS.md).

## Purpose

This is a UX flow reference for:

- Product reviewers
- UX reviewers
- QA testers
- Developers checking behavior against the intended experience
- Graduation project readers and demo presenters

The goal is to make the full product journey understandable without reading code or knowing the technical structure of the app.

## Product Roles

| Person | What they care about | What they can do |
| --- | --- | --- |
| Company owner | Running the hiring workspace | Manage jobs, mocks, candidates, company settings, members, and access requests. |
| Editor | Helping manage hiring work | Create and edit jobs and mocks, review candidates, and make candidate decisions. |
| Viewer | Observing hiring work | Read jobs, mocks, and candidate information without changing anything. |
| Candidate | Applying for a job | Read the job, submit personal details/CV, complete assessments, and finish the application. |
| Join requester | Joining an existing company workspace | Request access, verify email, then wait for the owner to approve. |
| Pending member | Waiting for access | Sign in only after company approval is complete. |

## UX Flow Format

Each flow is written as a user journey:

- User goal: what the person is trying to do.
- Starting moment: where the journey begins in normal language.
- Main path: the smooth experience.
- Decision points: choices or branches the user may face.
- Blocked states: what stops the user and how they recover.
- End state: what success or closure looks like.

## Global Experience Rules

These rules should stay consistent across the whole app.

| Situation | UX expectation |
| --- | --- |
| User is waiting | Show a loading or saving state so the user knows the app is working. |
| User makes a mistake | Point to the exact field or action that needs fixing. |
| User is not allowed to do something | Hide or disable the action, and keep them in a place where they can still do useful work. |
| User is about to make a final decision | Ask for confirmation before accepting, rejecting, or deleting. |
| Something cannot be loaded | Show a clear recovery option, usually retry or return to a safe page. |
| A page breaks | Show a page-level recovery screen instead of losing the whole app. |
| User changes filters or pages | Keep the experience fast and predictable, with no surprising reset of their current task. |

## Authentication And Access

### Existing Member Signs In

User goal: Enter the company workspace.

Starting moment: The user opens VU and sees the sign-in screen.

Main path:

1. The user enters their email.
2. The user enters their password.
3. The user chooses to sign in.
4. If the details are correct, the workspace opens.
5. The user lands in the dashboard area and can begin their work.

Decision points:

- If the user is an owner, they see full workspace controls.
- If the user is an editor, they see hiring work controls but not company administration.
- If the user is a viewer, they see read-only workspace areas.

Blocked states:

- Empty email: the email field explains that it is required.
- Invalid email: the email field asks for a valid email address.
- Empty password: the password field explains that it is required.
- Wrong password: the password field explains that the password is incorrect.
- Service problem: the sign-in screen shows a clear error and keeps the user's typed information where possible.

End state: The user is inside the workspace, or they stay on the sign-in screen with a clear next action.

### Owner Creates A Company Workspace

User goal: Create a new company account and start using VU.

Starting moment: The user is on the sign-in screen and chooses to create a company account.

Main path:

1. The registration form opens.
2. The user enters their personal details.
3. The user enters contact details.
4. The user creates and confirms a password.
5. The user enters company details such as company name and industry.
6. Optional company details can be added if available.
7. The user submits the form.
8. The product asks the user to verify their email.
9. The user enters the verification code.
10. After verification, the user can enter the workspace.

Decision points:

- The user can return to sign in if they already have an account.
- Optional company fields should not block account creation.
- The verification step should feel like a continuation of setup, not a separate task.

Blocked states:

- Missing required personal or company details: the exact fields are highlighted.
- Weak password: the form explains the password rule.
- Password mismatch: the confirmation field shows what needs to change.
- Invalid phone or website: the field gives a practical correction message.
- Account creation fails: the user stays on the form and can try again.

End state: The owner has a company workspace and can begin setup.

### User Verifies Email

User goal: Confirm their email so they can continue.

Starting moment: The user signs in or registers and VU asks for an email verification code.

Main path:

1. The verification screen appears.
2. The user checks their email for the code.
3. The user enters the code.
4. The user confirms the code.
5. VU accepts the code and continues the journey.

Decision points:

- The user can go back to sign in if they used the wrong account.
- The user may need a new code if the current one does not work.

Blocked states:

- Empty code: the screen asks the user to enter the code.
- Wrong or expired code: the screen explains that the code cannot be used.
- Code delivery issue: the user should understand that they can retry or request support.

End state: The user's email is verified, or they remain on the verification screen with a clear correction.

### Pending Member Signs In

User goal: Understand why they cannot enter yet.

Starting moment: A user who requested company access tries to sign in.

Main path:

1. The user enters their account details.
2. VU recognizes that company approval is still pending.
3. A clear message explains that the owner must approve the request first.
4. The user can close the message and wait.

Decision points:

- The user may try again later after approval.
- The user may contact the company owner outside VU.

Blocked states:

- The user cannot enter workspace pages until approved.
- Repeating sign-in before approval shows the same pending message.

End state: The user understands the next step is owner approval.

### Removed Or Declined User Tries To Enter

User goal: Understand why access is unavailable.

Starting moment: A user signs in after their access was removed, declined, or no longer connected to the company.

Main path:

1. The user tries to enter the workspace.
2. VU shows a message that company access is unavailable.
3. The user is returned to the sign-in experience.

Decision points:

- The user can contact the company owner if they believe this is a mistake.
- The owner may need to invite or approve them again.

Blocked states:

- The user cannot continue into the workspace.

End state: The user is outside the workspace and understands that company access must be restored.

### User Signs Out

User goal: End the current session.

Starting moment: The user is inside the workspace.

Main path:

1. The user opens their account menu.
2. The user chooses sign out.
3. VU ends the local session.
4. The sign-in screen appears.

Decision points:

- If sign-out cannot fully complete in the background, the user should still be safely returned to sign in.

End state: The user is signed out.

## Owner Workspace Flows

### Owner First Enters The Workspace

User goal: Understand the company dashboard and choose what to set up first.

Starting moment: The owner signs in successfully.

Main path:

1. The dashboard opens.
2. The owner sees the main workspace areas: candidates, jobs, mocks, company, profile, and settings.
3. The owner can create jobs, create mocks, manage company access, and review candidates.
4. If the workspace is new, empty states guide the owner toward setup.

Decision points:

- If no mocks exist, the owner should create a mock before publishing a complete job.
- If candidates already exist, the owner may go directly to review.
- If team members need access, the owner can open the company area.

End state: The owner has a clear next action.

### Owner Creates A Mock Assessment

User goal: Build an assessment that candidates can complete.

Starting moment: The owner chooses to create a mock assessment.

Main path:

1. The owner enters the basic mock information.
2. The owner chooses the mock type, difficulty, or relevant setup options.
3. The owner adds questions, evaluation criteria, or required behavior.
4. The owner reviews the setup.
5. The owner saves the mock.
6. The mock becomes available for jobs.

Decision points:

- The owner can move step by step through setup.
- The owner can go back to adjust earlier details.
- The owner can cancel if they are not ready to save.

Blocked states:

- Missing required information prevents the owner from continuing.
- Invalid setup choices are explained near the relevant step.
- Save failure keeps the owner in the form with their work preserved where possible.

End state: The mock is ready to attach to a job.

### Owner Creates A Job

User goal: Publish a job that candidates can apply to.

Starting moment: The owner chooses to create a job.

Main path:

1. The owner enters job details such as title, description, department, and type.
2. The owner attaches one or more mock assessments.
3. The owner sets weights or requirements for the assessments.
4. The owner configures scheduling and candidate communication options.
5. The owner reviews the job.
6. The owner publishes or saves the job.

Decision points:

- If no mock exists yet, VU guides the owner to create one first.
- The owner can adjust assessment weights before publishing.
- The owner can go back to edit earlier steps.

Blocked states:

- Required job details are missing.
- Assessment weights are incomplete or do not make sense.
- The job cannot be saved, so the owner remains in the form and can retry.

End state: The job is available and ready to share with candidates.

### Owner Shares An Application Link

User goal: Send a job application link to candidates.

Starting moment: The owner is viewing a job.

Main path:

1. The owner chooses the share action.
2. VU copies or presents the public application link.
3. The interface confirms the link is ready.
4. The owner sends the link through email, chat, or another channel outside VU.

Decision points:

- The owner may test the application before sharing it.
- If copying is not available, the product should still make the link easy to access.

End state: Candidates can open the shared application experience.

### Owner Tests The Candidate Experience

User goal: Preview what candidates will see.

Starting moment: The owner is viewing a job or linked mock.

Main path:

1. The owner chooses to test the application.
2. VU opens the candidate-facing experience.
3. The owner reviews the job landing page.
4. The owner checks the form, assessment overview, and mock start experience.
5. The owner returns to the workspace after testing.

Decision points:

- The owner can stop testing at any point.
- If a mock is not connected to a job, testing should be unavailable or clearly explained.

End state: The owner has confidence that the candidate journey is ready.

### Owner Reviews Candidates

User goal: Decide which candidates should move forward.

Starting moment: The owner opens the candidate area.

Main path:

1. The owner scans the candidate list.
2. The owner searches, filters, or sorts to find a candidate.
3. The owner opens a candidate profile.
4. The owner reviews summary details, scores, feedback, replay, and CV analysis.
5. The owner chooses to shortlist, accept, reject, or return later.

Decision points:

- Shortlist keeps the candidate in consideration.
- Accept is a final positive decision.
- Reject is a final negative decision.
- Final decisions ask for confirmation before applying.

Blocked states:

- If candidate details are missing, VU returns the owner to the candidate list.
- If a decision cannot be saved, the current candidate state remains unchanged.

End state: The candidate has a clearer hiring status.

### Owner Manages Company Access

User goal: Control who can enter the company workspace.

Starting moment: The owner opens the company team area.

Main path:

1. The owner views team members and pending access requests.
2. The owner opens a request.
3. The owner reviews the requester's details.
4. The owner chooses a role if accepting the user.
5. The owner accepts or declines the request.
6. The request moves out of the pending area.

Decision points:

- Accepting gives the person workspace access.
- Declining keeps the person out.
- Choosing owner/editor/viewer changes what the person can do later.

Blocked states:

- If there are no requests, the owner sees an empty state.
- If the request is no longer available, the owner returns to the request list.
- If the action cannot be completed, the request remains pending until the owner retries.

End state: The team access list reflects the owner's decision.

### Owner Invites A New Member

User goal: Invite someone to request access.

Starting moment: The owner is in the company team area.

Main path:

1. The owner chooses to generate or copy an invitation link.
2. VU shows the invite link.
3. The owner copies it.
4. The owner sends it to the person they want to invite.

Decision points:

- The invited person still needs to request access and verify email.
- The owner still needs to approve them before they can enter.

End state: A potential member has a way to request access.

### Owner Updates Company Settings

User goal: Keep company information and workspace defaults up to date.

Starting moment: The owner opens company settings.

Main path:

1. The owner edits company profile information.
2. The owner adjusts candidate status options or departments.
3. The owner saves the changes.
4. VU confirms that the settings were saved.

Decision points:

- The owner can reset the form to the current saved values.
- The owner can leave without saving if they do not want to keep changes.

Blocked states:

- Invalid values are highlighted.
- Save failure shows a clear error and keeps the form available.

End state: Company settings match the owner's updates.

## Editor Flows

### Editor Enters The Workspace

User goal: Help manage hiring work without company administration.

Starting moment: The editor signs in.

Main path:

1. The editor enters the dashboard.
2. The editor sees candidates, jobs, mocks, profile, and settings.
3. The editor can create and edit hiring content.
4. The editor can review candidates and make candidate decisions.
5. Company administration controls are not shown.

Decision points:

- The editor can work on jobs and mocks.
- The editor cannot manage members, access requests, or company settings.

End state: The editor can work safely inside their allowed responsibilities.

### Editor Creates Or Edits Hiring Content

User goal: Maintain jobs and mock assessments.

Starting moment: The editor opens jobs or mocks.

Main path:

1. The editor browses existing jobs or mocks.
2. The editor creates new content or opens existing content to edit.
3. The editor changes the needed details.
4. The editor saves the work.
5. The updated content appears in the workspace.

Decision points:

- Some destructive actions may be unavailable if content is already in use.
- The editor can test shared candidate experiences when available.

Blocked states:

- Missing or invalid fields stop the save until fixed.
- Restricted company administration pages return the editor to a safe company overview.

End state: Hiring content is created or updated.

### Editor Reviews Candidates

User goal: Help evaluate applicants.

Starting moment: The editor opens the candidate area.

Main path:

1. The editor searches and filters candidates.
2. The editor opens a candidate profile.
3. The editor reviews feedback, replay, and CV analysis.
4. The editor shortlists, accepts, or rejects a candidate when appropriate.

Decision points:

- Final decisions require confirmation.
- Already final candidates cannot be decided again from the normal decision controls.

End state: The candidate pipeline is updated.

## Viewer Flows

### Viewer Enters The Workspace

User goal: Understand hiring progress without changing anything.

Starting moment: The viewer signs in.

Main path:

1. The viewer enters the dashboard.
2. The viewer can inspect candidates, jobs, mocks, and company overview information.
3. Creation, editing, deletion, and decision actions are hidden or unavailable.
4. The viewer can still search, filter, sort, and open details.

Decision points:

- The viewer can explore information.
- The viewer cannot change workspace data.

End state: The viewer can audit the workspace safely.

### Viewer Reviews Candidate Information

User goal: Read candidate details without affecting their status.

Starting moment: The viewer opens the candidate area.

Main path:

1. The viewer scans the candidate list.
2. The viewer searches, filters, and sorts.
3. The viewer opens a candidate profile.
4. The viewer reads feedback, replay, and CV analysis.
5. Decision controls are unavailable.

Blocked states:

- If the viewer tries to access a changing action, VU keeps them in a read-only view.

End state: The viewer has the information they need without changing candidate state.

### Viewer Reviews Jobs And Mocks

User goal: Understand the hiring setup.

Starting moment: The viewer opens jobs or mocks.

Main path:

1. The viewer browses jobs or mocks.
2. The viewer searches, filters, and sorts.
3. The viewer opens details.
4. Edit, create, and delete actions are not available.

End state: The viewer understands the setup without making changes.

### Viewer Sees Company Restrictions

User goal: Check company information without managing the team.

Starting moment: The viewer opens the company area.

Main path:

1. The viewer sees company overview information.
2. Team administration is restricted.
3. Member management and company settings actions are not available.

End state: The viewer remains in a read-only company experience.

## Candidate Application Flows

### Candidate Opens A Job Link

User goal: Understand the opportunity and decide whether to apply.

Starting moment: The candidate opens a shared job application link.

Main path:

1. The job landing page appears.
2. The candidate reads the job title, company, description, and assessment summary.
3. The candidate understands that applying includes form details and assessment steps.
4. The candidate chooses to apply.

Decision points:

- The candidate can leave if the job is not relevant.
- If the job is closed or unavailable, the candidate should not be pushed into a dead-end form.

Blocked states:

- Missing or unavailable job information stops the candidate from applying.
- The page should explain that the link is no longer usable or that the job cannot be loaded.

End state: The candidate starts the application or understands why they cannot continue.

### Candidate Submits Their Details

User goal: Provide contact information and CV.

Starting moment: The candidate chooses to apply.

Main path:

1. The candidate enters their name.
2. The candidate enters email and phone information.
3. The candidate adds optional professional details if available.
4. The candidate uploads a CV when required.
5. The candidate submits the form.
6. VU moves the candidate to the assessment overview.

Decision points:

- The candidate can return to the job landing page.
- Optional fields should not stop progress.
- Required fields must be clear before submission.

Blocked states:

- Missing required fields are highlighted.
- Invalid contact information is explained.
- CV upload failure keeps the candidate on the form with a chance to retry.
- Submission failure shows a message and keeps the candidate's entered information where possible.

End state: The candidate has submitted their details and can begin assessments.

### Candidate Reviews The Assessment Overview

User goal: Understand what they need to complete.

Starting moment: The candidate finishes the details form.

Main path:

1. The candidate sees the list of required assessments.
2. The first available assessment is clearly marked.
3. Locked assessments show that they will open later.
4. Completed assessments are marked as done.
5. The candidate starts the available assessment.

Decision points:

- The candidate can only submit the final application after all required assessments are complete.
- The candidate can return to the overview between assessments.

Blocked states:

- If no assessment is available, the candidate needs a clear explanation.
- If an assessment is locked, the candidate sees what must happen first.

End state: The candidate knows their progress and starts the next required step.

### Candidate Prepares For A Mock Session

User goal: Get ready for the assessment.

Starting moment: The candidate selects an available assessment.

Main path:

1. The mock introduction appears.
2. The candidate reads the rules and expectations.
3. VU asks for any required device permissions.
4. The candidate grants the required permissions.
5. The candidate starts the session.

Decision points:

- The candidate can return to the overview before starting.
- The candidate may need to adjust browser/device permissions.

Blocked states:

- Camera permission is required but not granted.
- Microphone permission is required but not granted.
- Screen sharing is required but not granted.
- The start action stays unavailable until required permissions are ready.

End state: The candidate is ready and enters the live assessment.

### Candidate Completes A Mock Session

User goal: Finish one assessment successfully.

Starting moment: The candidate starts the mock session.

Main path:

1. The session timer starts.
2. The candidate reads the prompt.
3. The candidate responds through the available interaction area.
4. The candidate continues until the assessment is complete.
5. VU marks the assessment as completed.
6. The candidate returns to the overview.
7. The next assessment unlocks if another one remains.

Decision points:

- The candidate should always know how much time remains.
- If integrity warnings exist, they should be noticeable but not confusing.
- Completing one assessment should make the next step obvious.

Blocked states:

- If time runs low, the candidate sees a warning.
- If the candidate leaves or switches context, VU may show a warning.
- If completion cannot be saved, the candidate needs a retry or recovery message.

End state: One assessment is complete and the candidate knows what to do next.

### Candidate Submits The Final Application

User goal: Finish the full application.

Starting moment: The candidate has completed all required assessments.

Main path:

1. The assessment overview shows all items completed.
2. The final submit action becomes available.
3. The candidate submits the application.
4. The completion screen appears.

Decision points:

- If anything is incomplete, the final submit action should stay unavailable.
- The candidate should understand what remains before they can submit.

End state: The candidate receives confirmation that the application was submitted.

### Candidate Sees Completion

User goal: Know that the application is done.

Starting moment: The candidate submits the final application.

Main path:

1. A success message confirms the application was submitted.
2. The candidate sees a summary of completed assessment work.
3. The candidate sees a next-step message.
4. The candidate can leave the experience.

Decision points:

- A company user testing the flow should be able to return to the dashboard.
- A real candidate should be guided back to the application landing or simply close the page.

End state: The candidate has closure and does not need to take another action.

## Company Join Flows

### Invited User Requests Access

User goal: Ask to join an existing company workspace.

Starting moment: The invited user opens the company invitation link.

Main path:

1. The access request page appears.
2. The user enters personal details.
3. The user enters contact details.
4. The user creates and confirms a password.
5. The user submits the request.
6. VU moves the user to email verification.

Decision points:

- The user can edit details before completing verification.
- The user should understand this is a request, not instant access.

Blocked states:

- Missing details are highlighted.
- Invalid phone or email information is explained.
- Password problems are shown before submission.
- Request failure keeps the user on the form.

End state: The user has requested access and is ready to verify email.

### Invited User Verifies Email

User goal: Confirm identity after requesting access.

Starting moment: The user has submitted the join request.

Main path:

1. The verification step appears.
2. The user enters the code from email.
3. The user confirms the code.
4. A done screen explains that owner approval is still required.
5. The user can go to sign in later.

Decision points:

- The user can return to edit details if something is wrong.
- The user should not expect immediate dashboard access.

Blocked states:

- Wrong code shows a clear error.
- Missing code keeps the user on the verification step.

End state: The user is verified and waiting for approval.

### Owner Approves A Join Request

User goal: Add the requester to the company.

Starting moment: The owner opens pending access requests.

Main path:

1. The owner reviews the request.
2. The owner selects the person's role.
3. The owner accepts the request.
4. The person becomes a company member.
5. The person can sign in according to their role.

Decision points:

- Owner role gives full control.
- Editor role gives hiring work control.
- Viewer role gives read-only access.

End state: The requester becomes a member.

### Owner Declines A Join Request

User goal: Keep the requester out of the workspace.

Starting moment: The owner opens pending access requests.

Main path:

1. The owner reviews the request.
2. The owner declines it.
3. The request leaves the pending area.
4. The requester remains unable to enter the workspace.

Decision points:

- Declining should feel final enough to avoid accidental approval.
- The owner should be able to distinguish pending and processed requests.

End state: The request is declined.

## Candidate Review Flows

### Hiring User Finds A Candidate

User goal: Locate a candidate quickly.

Starting moment: The user opens the candidate area.

Main path:

1. The user scans the candidate list.
2. The user searches by name or related text.
3. The user filters by status, job, score, or integrity signals.
4. The user sorts the list.
5. The user opens the candidate they need.

Decision points:

- Empty results should clearly mean "nothing matches," not "the app is broken."
- Filters should be easy to adjust or clear.

End state: The user reaches the candidate profile or understands there are no matches.

### Hiring User Reviews Candidate Details

User goal: Understand the candidate's performance.

Starting moment: The user opens a candidate profile.

Main path:

1. The user reviews the candidate summary.
2. The user checks assessment performance.
3. The user reads full feedback.
4. The user reviews replay information when available.
5. The user checks CV analysis.
6. The user decides what to do next based on their role.

Decision points:

- Owner/editor can decide.
- Viewer can only observe.
- Missing information should be shown as unavailable, not as broken UI.

End state: The user has enough context to act or report.

### Hiring User Shortlists A Candidate

User goal: Mark a candidate as promising without making a final choice.

Starting moment: The user is reviewing a candidate.

Main path:

1. The owner or editor chooses shortlist.
2. VU updates the candidate status.
3. The candidate remains open for a later final decision.

Decision points:

- Shortlist should feel reversible or intermediate compared with final decisions.
- Viewers should not see this as an available action.

End state: The candidate is marked for continued consideration.

### Hiring User Accepts A Candidate

User goal: Make a final positive decision.

Starting moment: The owner or editor is reviewing a candidate.

Main path:

1. The user chooses accept.
2. VU asks for confirmation.
3. The user confirms.
4. The candidate status changes to accepted.
5. Final decision controls are no longer shown for that candidate.

Decision points:

- Cancel keeps the candidate unchanged.
- Confirm applies the final decision.

Blocked states:

- If the decision cannot be saved, VU shows an error and keeps the old status.

End state: The candidate is accepted.

### Hiring User Rejects A Candidate

User goal: Make a final negative decision.

Starting moment: The owner or editor is reviewing a candidate.

Main path:

1. The user chooses reject.
2. VU asks for confirmation.
3. The user confirms.
4. The candidate status changes to rejected.
5. Final decision controls are no longer shown for that candidate.

Decision points:

- Cancel keeps the candidate unchanged.
- Confirm applies the final decision.

Blocked states:

- If the decision cannot be saved, VU shows an error and keeps the old status.

End state: The candidate is rejected.

## Job Flows

### User Browses Jobs

User goal: Find, inspect, or manage job postings.

Starting moment: The user opens the jobs area.

Main path:

1. Job cards or rows appear.
2. The user searches for a job.
3. The user filters by job state or type.
4. The user sorts the list.
5. The user opens job details.

Decision points:

- Owner/editor can create, edit, share, and test jobs.
- Viewer can inspect jobs only.
- Empty job lists should guide owner/editor toward creating the first job.

End state: The user finds a job or understands that no job matches.

### User Opens Job Details

User goal: Understand a job and its linked assessments.

Starting moment: The user selects a job.

Main path:

1. Job details appear.
2. The user reviews title, description, status, linked mocks, and candidate activity.
3. Owner/editor can edit, share, test, or view related candidates.
4. Viewer can read the information only.

Decision points:

- Show related candidates helps the user move from job setup to candidate review.
- Share and test actions support the public application journey.

End state: The user understands the job and chooses the next task.

### Owner Or Editor Edits A Job

User goal: Update a job after creation.

Starting moment: The owner/editor opens job details and chooses edit.

Main path:

1. The edit form opens with current job details.
2. The user changes the needed fields.
3. The user reviews the changes.
4. The user saves.
5. The job details show the updated information.

Decision points:

- Some fields may be more sensitive once candidates have started applying.
- The user should understand which changes are allowed.

Blocked states:

- Invalid or incomplete fields stop saving.
- Save failure keeps the edit form available.
- Viewer attempts to edit are blocked by the read-only experience.

End state: The job is updated, or the user stays in the form with a clear fix.

## Mock Assessment Flows

### User Browses Mocks

User goal: Find and understand available assessments.

Starting moment: The user opens the mocks area.

Main path:

1. Mock cards or rows appear.
2. The user searches by title, topic, or technology.
3. The user filters by type, difficulty, or settings.
4. The user sorts the list.
5. The user opens mock details.

Decision points:

- Owner/editor can create, edit, test, and sometimes delete.
- Viewer can inspect only.
- Empty lists should guide owner/editor toward creating the first mock.

End state: The user finds a mock or understands that none match.

### User Opens Mock Details

User goal: Understand what the assessment contains and how it is used.

Starting moment: The user selects a mock.

Main path:

1. Mock details appear.
2. The user reviews the purpose, type, difficulty, questions, and linked jobs.
3. Owner/editor can edit or test when available.
4. Viewer can read only.

Decision points:

- If the mock is tied to active hiring, destructive actions should be restricted.
- If the mock has a linked job, testing can preview the candidate experience.

End state: The user understands the mock and whether it can be changed.

### Owner Or Editor Deletes A Mock

User goal: Remove a mock that is no longer needed.

Starting moment: The owner/editor is browsing or viewing a mock.

Main path:

1. The user opens the mock action menu.
2. Delete is available only when safe.
3. The user chooses delete.
4. VU asks for confirmation.
5. The user confirms.
6. The mock disappears from the list.

Decision points:

- Cancel keeps the mock unchanged.
- Confirm removes it if allowed.

Blocked states:

- A mock connected to active hiring may not be deletable.
- Delete failure keeps the mock visible.

End state: The mock is deleted or remains safely unchanged.

## Company And Team Flows

### User Views Company Overview

User goal: Understand the company workspace.

Starting moment: The user opens the company area.

Main path:

1. Company information appears.
2. Owner/editor can see team-related information.
3. Viewer sees a restricted company view.
4. Owner can move into access management and company settings.

Decision points:

- Role determines whether the company area is informational or administrative.

End state: The user understands company context and available actions.

### Owner Or Editor Views A Team Member

User goal: Understand who a team member is and what they can do.

Starting moment: The user opens a team member from the company area.

Main path:

1. The member profile appears.
2. The user reviews identity, role, department, and activity information.
3. The user returns to the company area.

Blocked states:

- If the member cannot be found, VU should return the user to the team list.

End state: The user has reviewed the team member.

## Profile And Preferences

### User Edits Profile

User goal: Keep personal information current.

Starting moment: The user opens their profile.

Main path:

1. The user chooses to edit profile information.
2. Editable fields become active.
3. The user changes phone or other available details.
4. The user saves.
5. The profile returns to read mode.

Decision points:

- Cancel discards unsaved edits.
- Save keeps the updates.

Blocked states:

- Invalid values are highlighted.
- Save failure keeps the profile available for retry.

End state: The profile is updated or unchanged after cancel/error.

### User Changes Password

User goal: Update account security.

Starting moment: The user opens the password area in their profile.

Main path:

1. The user enters the current password.
2. The user enters a new password.
3. The user confirms the new password.
4. The user saves.
5. VU shows a success state.

Blocked states:

- Missing current password is highlighted.
- New password is too short or invalid.
- Confirmation does not match.
- Save failure shows a clear error.

End state: The password is changed or the user knows what to fix.

### User Saves Personal Preferences

User goal: Adjust the app to match their preferences.

Starting moment: The user opens settings.

Main path:

1. The user changes theme, notification, localization, privacy, or default preferences.
2. The user saves changes.
3. VU applies the preference where relevant.
4. A saved message appears.

Decision points:

- Theme changes should be immediately understandable.
- Preferences should feel personal, not company-wide.

End state: The user's preferences are saved.

## Recovery And Edge Flows

### Workspace Cannot Load

User goal: Recover when the dashboard cannot show data.

Starting moment: The user is trying to use the workspace and the main data cannot load.

Main path:

1. VU shows a friendly unavailable state.
2. The user can retry.
3. If retry succeeds, the workspace returns.
4. If retry fails, the user remains on the recovery screen.

Decision points:

- The user can sign out if they want to restart.
- The message should explain the problem without technical wording.

End state: The workspace recovers or the user exits safely.

### One Page Breaks

User goal: Continue using VU after a page-level problem.

Starting moment: A page fails while the rest of the app can still work.

Main path:

1. VU shows a page recovery screen.
2. The user can try the page again.
3. The user can return to a safe area.
4. Other parts of VU remain available.

Decision points:

- Try again is best when the issue may be temporary.
- Return to safe area is best when the user needs to keep working.

End state: The user is not trapped by a broken page.

### User Opens A Restricted Area

User goal: Avoid confusion when they are not allowed to perform an action.

Starting moment: A user reaches an area outside their role.

Main path:

1. VU keeps the user out of the restricted action.
2. The user is placed back in a safe related area.
3. The visible interface matches the user's role.

Examples:

- Viewer tries to create or edit content: they stay in read-only browsing.
- Editor tries to manage company access: they stay in company overview.
- Viewer tries to make candidate decisions: decision controls are unavailable.

End state: The user can continue using allowed parts of VU.

### User Opens Missing Or Old Content

User goal: Recover from stale links or deleted content.

Starting moment: The user tries to view content that no longer exists or cannot be found.

Main path:

1. VU cannot show the requested item.
2. The user is returned to the closest useful list or overview.
3. The user can search or choose another item.

Examples:

- Missing candidate returns the user to the candidate list.
- Missing access request returns the owner to pending requests.
- Missing job link explains that the application cannot continue.

End state: The user is not stuck on an empty or broken detail screen.

## Complete Journey Maps

### New Owner Hiring Journey

1. Owner creates a company account.
2. Owner verifies email.
3. Owner enters the workspace.
4. Owner creates the first mock assessment.
5. Owner creates a job and attaches the mock.
6. Owner tests the candidate experience.
7. Owner shares the application link.
8. Candidate applies and completes assessments.
9. Owner reviews the candidate.
10. Owner shortlists, accepts, or rejects the candidate.

### Existing Team Hiring Journey

1. Editor signs in.
2. Editor opens jobs or mocks.
3. Editor creates or updates hiring content.
4. Editor opens candidates.
5. Editor reviews candidate evidence.
6. Editor makes a hiring decision.
7. Editor remains blocked from company administration.

### Read-Only Review Journey

1. Viewer signs in.
2. Viewer opens jobs, mocks, candidates, or company overview.
3. Viewer searches and filters information.
4. Viewer opens details.
5. Viewer reads information without changing it.
6. Viewer cannot create, edit, delete, or decide.

### Candidate Application Journey

1. Candidate opens the shared job link.
2. Candidate reads the job landing page.
3. Candidate submits personal details and CV.
4. Candidate reviews required assessments.
5. Candidate prepares permissions.
6. Candidate completes each assessment.
7. Candidate submits the final application.
8. Candidate sees completion confirmation.

### Company Join Journey

1. Owner copies an invitation link.
2. Invitee opens the link.
3. Invitee requests access.
4. Invitee verifies email.
5. Owner reviews the access request.
6. Owner accepts and assigns a role.
7. New member signs in.
8. New member sees the workspace according to their role.

## UX QA Checklist

### Sign In And Access

```txt
[ ] User understands how to sign in.
[ ] Field errors explain exactly what to fix.
[ ] Email verification feels connected to the sign-in/register flow.
[ ] Pending approval message explains who must act next.
[ ] Removed or declined access message is clear.
[ ] Sign out returns the user to a safe signed-out state.
```

### Owner

```txt
[ ] Owner sees a clear first setup path.
[ ] Owner can create a mock before creating a complete job.
[ ] No-mock job setup state guides the owner instead of feeling broken.
[ ] Owner can share and test an application link.
[ ] Owner can review candidates with enough evidence.
[ ] Final candidate decisions ask for confirmation.
[ ] Owner can manage access requests.
[ ] Owner can update company settings.
```

### Editor

```txt
[ ] Editor can manage jobs and mocks.
[ ] Editor can review and decide candidates.
[ ] Editor does not see member/settings administration as normal actions.
[ ] Restricted company actions return the editor to useful company context.
```

### Viewer

```txt
[ ] Viewer can browse and inspect information.
[ ] Viewer does not see create, edit, delete, or decision actions.
[ ] Viewer restrictions feel intentional, not broken.
[ ] Viewer can still search, filter, sort, and open details.
```

### Candidate

```txt
[ ] Candidate understands the job before applying.
[ ] Candidate form clearly marks required fields.
[ ] CV upload problems are recoverable.
[ ] Assessment overview explains progress.
[ ] Device permission requirements are clear before the mock starts.
[ ] Completing one assessment clearly unlocks the next.
[ ] Final submission is only available when all required work is done.
[ ] Completion screen gives the candidate closure.
```

### Company Join

```txt
[ ] Invitee understands they are requesting access, not instantly joining.
[ ] Join form errors are specific and friendly.
[ ] Email verification leads to a clear waiting-for-approval state.
[ ] Owner can approve with the correct role.
[ ] Owner can decline without confusion.
[ ] Approved member can later sign in with the assigned role.
```

### Recovery

```txt
[ ] Loading failures offer retry or sign out.
[ ] Broken pages do not crash the whole experience.
[ ] Restricted actions return users to useful places.
[ ] Missing content returns users to the nearest useful list.
[ ] Error messages avoid technical wording where the user cannot act on it.
```
