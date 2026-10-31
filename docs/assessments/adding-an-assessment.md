# Adding an assessment

Every assessment Steward reads follows one path. A member's results save to their account as soon as the results are shown, with no button to press. A signed-out visitor sees a modal asking them to sign in or create an account; if they don't, the results are lost. If they do, the results are attached to their account and Steward can see them.

## The pieces

| Piece | File | Job |
|---|---|---|
| Registry | `lib/assessments/registry.ts` | One entry per assessment, covering three things: how to clean its answers, which `check_in_submissions` columns its score fills, and any computed `details`. |
| Save | `lib/assessments/save.ts` | `saveAssessmentResult()` saves one row per attempt with `profile_id`. When a new row is created it runs that assessment's follow-up (team alert, participant record) in `afterFirstSave`. |
| API | `app/api/assessments/[key]/save/route.ts` | Saves for the signed-in member. It returns 401 for a signed-out caller. |
| Hook | `components/assessments/use-assessment-autosave.ts` | `useAssessmentAutosave({ assessment, label, signedIn, answers, ready })`. Call `newAttempt()` on a retake. |
| UI | `components/assessments/save-results-modal.tsx` | `SaveResultsModal` asks a signed-out visitor to sign in; `AutosaveNote` shows saved, not saved, or retry. |
| Claimer | `components/assessments/pending-assessment-claimer.tsx` | Mounted in `app/layout.tsx`. After sign-in it attaches results that are waiting in the browser (under the localStorage key `mjg-pending-assessments`, kept for 7 days). |
| Steward | `lib/steward/assessments.ts` | Reads results by `profile_id` first, then by email for older rows. |

## Steps

1. **Registry.** Add an entry with `key` (stored in `check_in_submissions.assessment`), `label`, `path`, `cleanAnswers`, `columns` and, optionally, `details`. Scores are always recomputed on the server.
2. **Follow-up (optional).** If the team should be alerted about a new result, add a branch for the key to `afterFirstSave` in `lib/assessments/save.ts`.
3. **Page.** Pass `signedIn` from the server page, using `getCurrentProfile()` and excluding `local-preview`. On the results screen:
   ```tsx
   const autosave = useAssessmentAutosave({ assessment: "my-key", label: "My Assessment", signedIn, answers, ready: showingResults });
   <AutosaveNote status={autosave.status} onSignIn={() => autosave.setModalOpen(true)} onRetry={autosave.retry} />
   <SaveResultsModal open={autosave.modalOpen} onOpenChange={autosave.setModalOpen} label="My Assessment" />
   ```
   Pass `persistAttempt` if the form resumes after a page refresh.
4. **Any later "send" or "save" step** should post `autosave.submissionId`. Its route then updates that row with `ownedSubmission()` instead of inserting a new one.
5. **Steward.** Add the key to `memberRows` in `lib/steward/assessments.ts`, and give it a block in `assessmentSnapshot` and `assessmentDetail` so Steward can describe it.
6. **MCP (optional).** Seed an `assessment_settings` row so a Super Admin can switch "Readable by MCP" on.
