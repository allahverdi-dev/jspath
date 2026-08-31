# Free / Pro allocation — implementation and validation

## Product boundary

Learn JavaScript for free. Go Pro when you want to master it.

| Content | Free | Pro-only | Total available to Pro |
| --- | ---: | ---: | ---: |
| Modules | 47 | 0 | 47 |
| Lessons | 214 | 0 | 214 |
| Exercises | 650 | 160 | 810 |
| Challenges | 15 | 156 | 171 |
| Projects | 5 | 26 | 31 |
| Interview questions | 25 | 287 | 312 |
| Reference entries | 213 | 0 | 213 |
| Cheat sheets | 9 | 0 | 9 |

Guest and Free learners share the Free content allocation. Playground and local
progress remain available to everyone. Cloud sync, bookmarks and achievements
remain Free-account features in the existing plan architecture. Completing a
lesson does not require solving its Pro exercises. Neither account progress nor
authored content is deleted when access changes.

## Stable selection, not runtime cutoffs

`src/features/billing/accessCatalog.js` contains frozen, explicit ID arrays.
Changing the registry order cannot change access. New exercises default to Free;
new challenges, projects and interview questions default to Pro until explicitly
selected as samples. Modules, lessons, references and cheat sheets always stay Free.

### Exercises

The 160 selected exercises belong to 80 later lessons; every selected lesson keeps
two Free exercises. All exercises in modules m00–m22 remain Free, as do selected
introductory lessons later in the curriculum. Every exercise-bearing lesson retains
at least one Free exercise, and at least two wherever the lesson has two or more.

Selection favors the authored mastery/application tasks and difficult trade-offs:
async failure recovery, promise ordering, prototype behavior, closure retention,
generators, composition, data structures, architecture, testing, performance and
security. There are 92 hard and 68 medium Pro exercises; no beginner/easy exercises
are Pro. Foundational implementations usually stay Free; deeper implementations,
debugging, output reasoning and design decisions provide Pro practice. This is a
curated product allocation, not a claim that every Pro exercise is harder than every
Free exercise. All 160 IDs are recorded in code, not generated at runtime.

### Challenges

15 samples span 14 actual categories and all five actual difficulties:

- Beginner (4): Initials from a Name, Chunk an Array, Build a List from Data,
  A Counter with Private State.
- Easy (4): Word Frequency Count, Pick and Omit, Binary Search,
  Getters, Setters and Invariants.
- Medium (4): Implement Promise.all, Taking from an Infinite Sequence,
  Parsing Log Lines, Parsing Untrusted JSON.
- Hard (2): LRU Cache, Bounded Concurrency.
- Expert (1): A Finite State Machine.

The prompts and executable test cases were inspected before finalizing selection.
Samples cover text/data manipulation, safe DOM rendering, private state, algorithms,
OOP invariants, async concurrency, iterators, parsing, caching and architecture.

### Projects

Counter App (beginner), Simple Form Validator (easy), Todo Application (medium),
Weather Application (medium), and Kanban Board (hard) form a practical progression.
Their real topic IDs cover DOM/events, forms/regex, storage/state, async HTTP/error
handling and structured board state. The schema has topic IDs, not a project category
field. Kanban includes five core milestones; Weather supports injected offline
fixtures, so the sample does not require a paid weather API.

### Interview questions

25 samples span 17 existing topic labels and all four real levels: junior, junior+,
intermediate and advanced. They include fundamentals, functions/closures, `this`,
arrays/objects, prototypes/private fields, event-loop output, cancellation, DOM
delegation/accessibility, security, modules/generators, debounce, algorithms,
testing, performance, architecture, HTTP, refactoring and safe integers.
Question bodies/short answers were inspected; the exact IDs live in the catalog.
Full Interview Practice Sessions remain Pro, including when the session would
contain a Free sample question.

## Enforcement and discovery

- `requiredPlanForContent(kind, id)` is authoritative for item allocation.
- Router guards resolve challenge/project slugs and interview/exercise IDs against
  real indexes, then use `ContentGate` before mounting the lazy detail page.
- Unknown challenge/project/interview IDs fail closed to Pro. Broad feature gates
  remain for guided practice and interview sessions.
- `ExerciseRunner` also enforces `ContentGate`, covering both inline lesson
  references and trailing exercises, as well as standalone usage. A locked runner
  shows a quiet preview, not its editor, choices, hints, tests or solution.
- Missing checkout configuration no longer unlocks Pro features/content. The
  entitlement provider still uses the unchanged subscription resolution/lifecycle.
- All catalog items remain discoverable. Cards, daily challenges, recommendations
  and search results show centralized Pro allocation badges. Free samples are not
  mislabeled; Pro members still see which items belong to their plan.
- Interview catalogs/search no longer expose the complete short answer. Answers
  remain in authored content and are loaded by permitted detail/session pages.

## Advanced Analytics

`AdvancedAnalyticsGate` applies the existing `FEATURE.ADVANCED_ANALYTICS` through
`FeatureGate`. Pro receives Dashboard mastery/skill breakdown, the My Learning
evidence tree, module topic mastery, and practice/interview weak-area analysis.
Weak-topic recommendations include actual scores only for entitled accounts.

The evidence tree shows per-topic lesson/exercise/challenge coverage, best-attempt
quiz accuracy and existing recency adjustment. It uses the existing transparent
mastery model; no new historical trends, simulated metrics, AI grading or interview
readiness percentages are introduced. Quiz question IDs/topics are now included in
the generated manifest and registry index, fixing missing quiz evidence without
shipping answer keys in discovery metadata. Missing quiz data stays missing, not 0%.

Guest/Free Dashboard and My Learning keep XP, streak, curriculum completion, basic
counts, basic overall quiz accuracy and activity. Lesson-time totals are explicitly
labeled estimates, not measured study time. Quiet inline upgrade cards replace
advanced sections; the entire Dashboard is never gated.

## Pricing

Pricing displays the complete Free curriculum, all exact sample counts, references,
cheat sheets, Playground and account benefits. Pro lists the full content totals,
both session types and Advanced Analytics. Counts derive from the registry and
central access rules. Gumroad URLs, external prices, checkout identity, purchase
confirmation and subscription management remain unchanged.

## Files changed

Access and shared UI:

- `src/features/billing/accessCatalog.js` (new)
- `src/features/billing/contentAllocation.js` (new)
- `src/features/billing/access.js`
- `src/features/billing/plans.js`
- `src/state/EntitlementProvider.jsx`
- `src/app/router.jsx`
- `src/components/billing/FeatureGate.jsx`
- `src/components/billing/ContentAccessBadge.jsx` (new)
- `src/components/billing/AdvancedAnalyticsGate.jsx` (new)
- `src/features/exercises/ExerciseRunner.jsx`

Metadata and recommendations:

- `scripts/generate-manifest.mjs`
- `src/content/registry.js`
- `src/features/progress/recommendations.js`
- `src/features/search/searchIndex.js`
- `src/features/search/SearchOverlay.jsx`

Pages:

- `src/pages/Challenges.jsx`
- `src/pages/Projects.jsx`
- `src/pages/InterviewPrep.jsx`
- `src/pages/PracticeHub.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/MyLearning.jsx`
- `src/pages/ModuleDetail.jsx`
- `src/pages/Pricing.jsx`
- `src/pages/SearchPage.jsx`

Tests/documentation:

- `src/features/billing/accessCatalog.test.js` (new)
- `src/app/router.access.test.jsx` (new)
- `src/pages/AllocationUX.test.jsx` (new)
- `src/state/EntitlementProvider.test.jsx`
- `src/features/billing/billing.test.js`
- `docs/FREE-PRO-ALLOCATION.md` (this report)

Generated manifest/coverage were regenerated through existing scripts and remain
generated artifacts. No dependency, authored lesson, backend, migration, Edge
Function, secret, authentication or entitlement lifecycle file was changed.

## Validation results

- `npx vitest run src/features/billing/billing.test.js`: 24/24 passed.
- Focused access/catalog + router + provider run (including billing): 98/98 passed.
- `npx vitest run src/pages/AllocationUX.test.jsx`: 17/17 passed.
- `npm test`: 14 files, 184/184 tests passed (88 new regression tests).
- `npm run lint`: passed, zero ESLint warnings/errors.
- `npm run build`: passed; lazy route/content chunks remain split.
- `npm run content:audit`: passed, zero broken references/invalid content/warnings.
- `npm run content:verify`: 569 solutions, 4,561 assertions, zero failures.
- `npm run content:examples`: 949 examples, 40 interview output questions and
  202 reference examples verified; zero mismatches. Existing exclusions: one
  browser-only example and 13 illustrative reference examples.
- `git diff --check`: passed.

Actual registry tests assert all eight allocations, catalog existence/uniqueness,
lesson Free-exercise coverage, sample diversity, unknown-ID defaults, all plan
permissions and real quiz evidence. Router tests preserve the real router/indexes/
gates with sentinel detail components to prove denied workspaces never mount.
UI tests cover every catalog row, basic vs advanced progress, Pricing and embedded
exercise controls. Provider tests explicitly disable checkout configuration and
verify it cannot grant Pro. Existing active/canceling/paid-period/expired billing
tests continue passing.

Browser QA used the local application as a Guest (Free and Pro are additionally
covered in automated tests). At 320px: Pricing, challenge/project catalogs, Free
challenge and Kanban detail, Pro detail paywalls, revealed Free interview answer,
and Promise Combinators with two inline Pro previews were checked. At 390px:
Dashboard, My Learning, Practice Hub and Interview Prep were checked. Pricing was
also checked at 1440px. Checked pages had no document-level horizontal overflow.
This is responsive-browser verification, not a claim of testing every physical phone.

## Remaining boundaries

- This is static-SPA product access control, not DRM. Authored bodies still ship
  in downloadable JavaScript chunks, including paid exercises inside Free lesson
  chunks. Gates prevent ordinary UI/direct-route access, not a determined client
  inspecting bundles. Confidential content delivery would require server-side
  authorization and is outside this frontend allocation task.
- Local checkout URLs are not configured; paid checkout remains disabled there.
  No real purchase, webhook delivery, production subscription change or deployment
  was performed. Existing lifecycle tests validate the preserved billing behavior.
- The existing generated-content bundle-size warning remains (about 974 kB
  minified). Existing React Router future-flag and unrelated AuthProvider `act`
  test warnings remain; there are no failing tests.
- No commit or push was made. The implementation is left in the working tree.
