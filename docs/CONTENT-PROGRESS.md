# Content progress

Status of each content pillar. Counts come from
`src/content/generated/manifest.json` (regenerate with `npm run content:audit`).

| Pillar | Status | Size |
| --- | --- | --- |
| Curriculum | **COMPLETE** | 47 modules, 214 lessons, 810 exercises |
| Challenges | **COMPLETE** | 171 challenges |
| Projects | **COMPLETE** | 31 projects |
| Interview bank | **COMPLETE** | 312 questions |
| Reference | **COMPLETE** | 213 entries |
| Cheat sheets | **COMPLETE** | 30 sheets |
| Placement assessment | **COMPLETE** | 42 questions |
| Cross-content validation | **COMPLETE** | 1856 relations verified |
| Final frontend / product QA | **COMPLETE** | 35 routes, 12 flows, 4 defects fixed |
| Product completion / production readiness | **COMPLETE** | premium payload protected, RLS captured, headers shipped |
| Product (billing, auth, entitlements) | **INCOMPLETE** | in progress |

## Cheat sheets

30 sheets across six categories. All are **Free** — the kind is absent from
`PRO_CONTENT_IDS`, so `requiredPlanForContent` returns FREE for every sheet.

| Category | Sheets |
| --- | --- |
| Language Core (6) | Fundamentals, Types & Coercion · Scope, Hoisting & the TDZ · Closures · Loops & Iteration · Modern JavaScript Syntax · Modules |
| Data & Collections (5) | Strings · Arrays · Array Methods · Map & Set · Numbers & Dates |
| Functions & Objects (4) | Functions · Objects · `this`, call, apply & bind · Prototypes & Classes |
| Browser & DOM (4) | DOM · Events · Forms · Storage & Browser APIs |
| Async & Networking (4) | Promises · Async & Await · The Event Loop · Fetch & APIs |
| Engineering (7) | Error Handling & Debugging · Testing · Performance · Security · Algorithms & Big O · Regular Expressions · Interview Quick Review |

**Composition** — 181 groups (69 snippets, 62 rule lists, 50 tables) holding 736
total entries, rows and rule items.

**Related links** — 128 to Reference entries, 103 to lessons, 76 to challenges
(307 total). Every id resolves; the audit fails on invented ids.

**Topic coverage** — 50 of 59 topics are referenced by a sheet. The nine that are
not (orientation, js-runtime, devtools, syntax, metaprogramming, clean-code,
design-patterns, tooling and booleans-as-a-standalone-topic) are not recall
material; a cheat sheet for them would be filler.

## Placement assessment

42 purpose-written questions that answer one product question — "where should I
start?" — and nothing else. It is **free for guests, Free and Pro alike**, it
gates no curriculum, and it never marks anything complete.

**Question kinds** — 27 `single` (choose the correct explanation, the safe
implementation, the right API behaviour) and 15 `output` (predict what the code
prints or throws). Both are objective kinds that already existed in `QUIZ_KIND`;
placement adds no new question type. 15 questions carry a code block.

**Difficulty** — 5 beginner, 7 easy, 17 medium, 10 hard, 3 expert. Questions are
presented in ascending difficulty, so the assessment opens accessibly and becomes
progressively more diagnostic. Every documented output was verified by executing
the snippet, not by intuition.

**Domain coverage** — 38 distinct topics across six domains:

| Domain | Questions | Curriculum entry |
| --- | --- | --- |
| Foundations | 8 | Module 01 — Variables & Values |
| Core language | 10 | Module 05 — Strings |
| Browser & DOM | 6 | Module 17 — DOM Fundamentals |
| Advanced language | 6 | Module 21 — Modern JavaScript (ES6+) |
| Engineering | 5 | Module 22 — Error Handling & Debugging |
| Async | 7 | Module 23 — Asynchronous JavaScript Foundations |

Engineering is deliberately the smallest domain (12% of the assessment): placement
is not an interview certification, and a developer who is solid at JavaScript is
not sent back to the start because they have never written a unit test.

### Scoring model

Deterministic and weighted by difficulty, with the weights declared explicitly in
`PLACEMENT_DIFFICULTY_WEIGHT`: beginner 1, easy 1.5, medium 2, hard 2.5, expert 3.
The spread is narrow on purpose — one expert question (weight 3) can never
outweigh the whole foundations domain (weight 12.5).

Each domain is scored independently from its own questions first; the overall
score is the weighted total. Answers are keyed by question id, so re-answering
replaces a choice and no question is ever counted twice. A skipped question is
incorrect but not an error. There is no AI, no inference from goals or
self-reported level, and no confidence figure that is not a ratio of marks earned.

### Result bands

Four bands, reusing the ids the onboarding level step already uses, so the
assessment refines the learner's self-reported level rather than introducing a
rival vocabulary: `zero`, `basics`, `intermediate`, `experienced`. A band depends
on prerequisites as well as the total — a learner is never called "experienced"
while foundations are unproven.

### Recommendation algorithm

The rule is **earliest meaningful gap after confirmed mastery**, not a module
proportional to the total score. Domains are walked in curriculum order and the
first one scoring below the mastery threshold (0.7) wins, however well the learner
did afterwards — so a 90% overall score with weak foundations still starts at
Module 01. Within that domain, the earliest module that teaches a topic the
learner actually missed is chosen.

The domain-to-module mapping and the domain ordering are both **derived from the
registry** (`module.topicIds` and `module.order`). There is no second copy of the
curriculum order in the placement code.

When no domain is below mastery there is no gap to send the learner back to, and
the recommendation becomes the capstone — the first module in the `interview`
track. Observed end to end in the browser:

| Profile | Band | Recommendation |
| --- | --- | --- |
| 0 / 42 | Starting out | Module 01 — Variables & Values |
| Foundations + core only | Knows the basics | Module 17 — DOM Fundamentals |
| Everything but async | Comfortable with JavaScript | Module 23 — Asynchronous JavaScript Foundations |
| 42 / 42 | Experienced developer | Module 46 — Interview Mastery |

Every recommendation resolves to a real module id, and every one is Free.

### Access, persistence and retakes

- **Guest, Free and Pro** all take the same assessment. `requiredPlanForContent`
  returns FREE for the kind, no billing code was changed, and the page renders no
  Pro badge, upgrade prompt or pricing link.
- **Persistence** uses the existing user-state path — local storage for guests,
  the normal sync for signed-in learners. No new migration and no parallel store.
  One compact record is written: band, score, counts, recommended module, domain
  scores and a timestamp.
- **Merging** on sign-in keeps the more recent of the two results, so a guest who
  took the assessment before signing in does not lose it.
- **Retake** starts a clean attempt — previous answers are discarded, not merged —
  replaces the stored recommendation, and leaves curriculum progress untouched.

### What placement never does

`savePlacement` writes exactly one state key. Completing the assessment marks no
lesson, exercise, challenge or project complete, awards no XP, logs no activity
and creates no streak day. A high score is evidence for a recommendation, not a
record of work done. This is asserted directly: one test diffs the whole state
object and requires `['placement']` to be the only key that changed.

### Placement verification

- **Placement tests**: 80 (52 engine, 28 page). Full suite **264 passed**, up from
  184, with no existing test weakened or removed.
- **UI smoke test**: both entry points (`/placement` and `/onboarding/placement`)
  render for a guest; all four profiles above were driven end to end in the real
  browser; retake starts clean; the dashboard card shows the result and links to
  the recommended module; fresh-tab console is clean.
- **Mobile**: 320px, 390px and desktop — zero page overflow at every stage, code
  blocks scroll inside their own container, answer rows are 50px and buttons 44px,
  no clipped text on the result breakdown.
- **Accessibility**: options are a labelled `radiogroup` of `role="radio"` controls
  with `aria-checked`, all keyboard reachable; progress bars carry text labels; the
  domain breakdown repeats each bar in words (Strong / Mixed / Focus area), so the
  result never depends on colour alone; the skip link is present.

## Cross-content validation

The libraries are individually complete; this phase verified they behave as one
product. `npm run content:audit` now walks the whole content graph and the access
catalog, and `src/tests/cross-content.test.js` holds the invariants as tests.

**Scope checked** - 1856 id-bearing relations across 12 relation types, 59 topics
against 9 tagged content kinds, every routable slug, the full access catalog, the
search index, and the Pricing copy.

### Defects found and fixed

| # | Class | Defect | Fix |
| --- | --- | --- | --- |
| 1 | Broken relation | `iv-code-debounce.relatedChallenges` pointed at `ch-hof-debounce`, which does not exist (the real id is `ch-fn-debounce`). The audit never validated `interview.relatedChallenges`. | Corrected the id; the audit now validates every relation type. |
| 2 | Wrong relation | `pr-form-validator` (topics: forms, **regex**) linked to `l-m16-01` *Dates and Timestamps*. Module 16 covers Dates **and** RegExp, and the link landed on the wrong half. | Re-pointed to `l-m16-05` *Regular Expressions: Fundamentals*. |
| 3 | Progression | `pr-digital-clock` (beginner) and `pr-pomodoro-timer` (easy) linked to `l-m33-01` *Execution Contexts and the Call Stack*, which never mentions `setInterval`, while `l-m23-02` *Timers* teaches exactly what they need and comes ten modules earlier. | Re-pointed both to `l-m23-02`. |
| 4 | Stale copy | Pricing listed every Free benefit except the Placement assessment, which had shipped as Free. | Added a Placement line to the Free list. |
| 5 | Raw markup | Module `m29` title and the `this` topic **label** contained backticks. Labels appear in `<option>` elements and aria text, where markup can never render. | De-marked both to plain text. |
| 6 | Raw markup | Search results, module and lesson lists, challenge and project cards, dashboard recommendations, practice cards, lesson objectives and takeaways, quiz prompts and options, and exercise instructions all printed authored inline code literally - the same strings their detail pages had always rendered correctly. 47 raw fragments on one search page alone. | Routed all of them through the existing `InlineMarkup`. |
| 7 | Corrupted projection | `generate-manifest.mjs` shortened instructions, prompts and taglines with a plain `.slice()`, cutting inline code and bold runs in half. 35 card fields shipped with an orphan backtick, and one carried half a fenced block. | Added `clip()`, which drops fenced blocks, trims to a word boundary, then repairs unpaired markers. |
| 8 | Renderer gap | `InlineMarkup` did not support the double-backtick code span, the standard Markdown escape for code that itself contains a backtick, so `ch-adv-tagged-template` rendered stray delimiters. | Added double-backtick support, matched before the single-backtick form. |

### Verified clean, no action needed

- **Ids and slugs** - every module, lesson, exercise, challenge, project,
  interview question, reference entry, cheat sheet and placement question has a
  unique id; every routable kind has a unique, URL-safe slug. No cross-file
  duplication. Reference canonical names and cheat sheet titles are unique, and no
  alias collides with another entry's canonical name.
- **Topic taxonomy** - 0 invalid topic ids, 0 orphan topics, and every topic that
  is assessed anywhere is taught in the curriculum first.
- **Curriculum hierarchy** - `module.lessonIds` matches the lessons themselves in
  order, every lesson belongs to exactly one module, the 214-entry global order is
  duplicate-free, and no module lists a prerequisite that comes later.
- **Access catalog** - all 160 Pro exercise ids and all 45 free-sample ids resolve
  to real content, with no duplicates and no stale entries. Every one of the 214
  lessons still has at least one Free exercise.
- **Search** - every indexed entry resolves, each item is indexed exactly once, no
  duplicate rows from alias indexing, and placement questions are correctly absent.
- **Project prerequisites** are authored prose ("Comfortable with template
  literals"), not ids. A test pins this so they are never resolved as content ids.

### Coverage matrix

All 59 topics are taught in the curriculum and carry exercises. Challenge coverage
exists for every high-value practical area - types, strings, arrays, array methods,
objects, functions, scope, closures, `this`, prototypes, classes, DOM, events,
forms, async, promises, HTTP, event loop, algorithms and security.

**Accepted gaps** (documented, not defects): `orientation`, `js-runtime`,
`devtools`, `syntax`, `tooling` and `interview` have no coding challenges - they
are orientation and conceptual topics where a challenge would be filler.
`variables`, `hoisting` and `execution-context` are covered by exercises,
interview questions and cheat sheets rather than standalone challenges, which
suits concept-recall material.

**Reported for a future content pass, not closed here**: `arrow-functions`,
`destructuring`, `modern-js`, `modules` and `storage` have no dedicated challenge,
though each is practised through adjacent topics (`higher-order`, `objects`,
`arrays`) and through projects. Authoring new challenges was out of scope for a
validation phase.

### Cross-content verification

- **Cross-content tests**: 84. Full suite **348 passed** (17 files), up from 264
  with no existing test weakened.
- **Audit**: 1856 relations, 0 broken references, 0 warnings. The new checks were
  proven to fire by injecting synthetic defects - a dead id, a duplicate neighbour
  and a stale catalog id - and confirming each was reported.
- **UI smoke test**: every major content system rendered - curriculum, module,
  lesson, exercise, practice hub, challenge (Free and Pro gate), project (Free and
  Pro gate), interview (Free and Pro gate), reference, cheat sheet, placement,
  pricing, dashboard, my learning and search. No route errors, no dead links, no
  raw markdown, correct Pro badges, fresh-tab console clean.
- **Mobile**: 320px, 390px and desktop across lesson, challenge, project,
  reference, cheat sheet, placement and pricing - zero page overflow, no
  unscrollable code blocks or tables.
- **Accessibility**: one `<main>` heading per page, no unnamed links, no images
  missing alt text, lock affordances only on gated pages.

## Final frontend / product QA

Cross-content validation proved the content graph is coherent. This phase
exercises the *application*: every route, state and flow as a user meets it.

### Defects found and fixed

| # | Severity | Defect | Fix |
| --- | --- | --- | --- |
| 1 | High | A **nonexistent** challenge, project or interview slug rendered "This … is included with Pro" — an upgrade wall for content that does not exist. `ContentRouteGate` passed `id={undefined}` into the gate, and `requiredPlanForContent` falls through to PRO for the three feature-gated kinds, so a stale bookmark or mistyped link asked the learner to pay for nothing. | The gate now lets an unresolved slug through so the page renders its own "not found", which all three pages already had. |
| 2 | Low (latent) | `<Button>` rendered a bare `<button>`, which HTML defaults to `type="submit"`, while every other control in `ui/index.jsx` sets `type="button"`. Harmless today (no `<form>` elements exist) but it would submit the moment one was added. | Default to `type="button"`, still overridable through props. |
| 3 | Medium | In **light theme** the streak flame was brand yellow on near-white: contrast **1.3**, effectively invisible. | Switched to the theme-aware `text-primary-ink` token: light 1.3 → **5.12** (AA), dark unchanged at 13.62. |
| 4 | Medium | `PracticeSession` counted a solve on every passing run, so re-running one exercise inflated the total and the summary could claim more solved than the session contained. | Track solved **ids** rather than a counter. |

A misleading test was also corrected. `router.access.test.jsx` asserted that an
unknown premium slug should show the paywall ("fails closed for unknown
premium-by-default route"), using a slug that does not exist. Its intent —
content that exists but is missing from the catalog must default to Pro — is
legitimate, so it was split into the two invariants it had conflated: the access
layer still fails closed for an unlisted id, and the route layer 404s an unknown
one. That file went from 38 to 42 tests.

### Flows verified

| Flow | Result |
| --- | --- |
| Interview session | Setup, start, progression, completion summary and score all work. Objective questions score on reveal, open questions only on self-rating, and both are single-fire by construction. Walking a session without answering records nothing and scores zero rather than inventing a grade. |
| Practice session | Entitlement gated at the route; progression, completion, "run it again" and the solved count all correct after the dedupe fix. |
| Project milestones | Driven live: five milestones toggled, XP awarded once each plus one completion award, completion only at 5/5, reopening un-completes, re-completing awards nothing further (275 → 275 XP), and state survives a refresh. |
| Bookmarks | Add, reflect, remove, no duplicates, keyed by kind so two kinds sharing an id cannot collide, and curriculum progress untouched. |
| Settings export/import | The export contains learning progress only — no plan, subscription, session or identity keys. Import is parsed inside a guard, and the sign-in merge normalises a partial remote record without losing local progress. |
| Exercise runner | All three sandbox hosts exercised in the real browser (Worker, DOM iframe, async); every assertion passed. XP is awarded once no matter how often an exercise is re-run. |
| Placement, search, curriculum, reference, cheat sheets | Covered in the first pass and re-checked here. |

### The security invariant

Importing hand-edited client state **cannot** buy Pro. Verified two ways: the
entitlement resolver takes only `authenticated` and the subscription rows the
server returned, never user state; and in the running app, a forged blob
declaring `plan: 'pro'`, `isPro: true` and a fabricated active subscription left
Pricing showing the upgrade CTA and left a Pro challenge fully gated. The forged
keys survive in local storage as inert noise because nothing reads them.

### Billing UI states

| State | Behaviour |
| --- | --- |
| Guest | Pricing renders real allocation counts, offers account creation, gates Pro content. |
| Free | Current-plan state, upgrade CTA, free samples open, Pro gated, no account-creation link. |
| Active Pro | "Current plan" shown, premium content and sessions open, no upgrade prompt. |
| Pending cancellation | The `canceling` status **retains Pro** until `current_period_end`; the plan UI does not contradict it and does not downgrade early. |
| Past due | Retains Pro through the paid period rather than downgrading immediately. |
| Expired / refunded / revoked | Premium denied, every free allocation still reachable, no stale Pro badge. Tested through fixtures — no real Gumroad lifecycle event was triggered. |

### Accessibility

Keyboard behaviour is proven in jsdom, which delivers real key events, against
the primitives every screen is built from: buttons activate with Enter and
Space, disabled buttons leave the tab order, the dialog exposes
`role="dialog"`/`aria-modal` with an accessible name, closes on Escape, traps
Tab, restores focus to its opener and restores background scroll, selects and
inputs are labelled, toggles are switches carrying `aria-checked`, and tabs rove
with Arrow/Home keys per the ARIA pattern. In the running app, project milestone
buttons carry descriptive `aria-label`s and `aria-pressed`, every page has one
`<main>` heading, no link lacks a name and no image lacks alt text.

### Coverage

- **Routes** — all 35 patterns including `*` → 404, plus a bad-param probe for
  every parameterised route.
- **Responsive** — 320px, 390px, 768px and desktop across lesson, challenge,
  project, settings, pricing, cheat sheet, placement and the code editors. No
  page-level horizontal overflow at any width; editors scroll inside themselves.
- **Themes** — light and dark. With alpha correctly composited, 0 contrast
  failures on curriculum, pricing, challenges, settings, my-learning and project
  detail; the single dashboard failure is defect 3 above.
- **Console** — fresh tabs traversing the app, including the three not-found
  routes, produce zero errors.

### Environmental limitations

- The browser pane runs hidden. That throttles `setTimeout` to roughly one second
  and does not reliably deliver synthesised keystrokes, so **typing into the code
  editor could not be driven end to end**. The editor's input path is covered by
  the existing component tests, the sandbox was exercised directly in the real
  browser instead, and exercise correctness stays machine-verified by
  `content:verify` (4561 assertions). Keyboard interaction is proven in jsdom
  rather than by hand, as recorded above.
- Long-lived dev tabs accumulate HMR context-identity errors (`useUserState must
  be used inside UserStateProvider`, with mismatched `?t=` module timestamps).
  These are a hot-reload artifact, not a product fault: a fresh tab is always
  clean. Console verification therefore always uses a fresh tab.
- Expired and revoked subscription states were exercised through fixtures. No
  real Gumroad lifecycle event was triggered for QA.
- One full-suite run showed a single failure with no printed detail, consistent
  with a timeout under load; two subsequent runs were clean at 419/419.

## Product completion / production readiness

The question this phase asked was narrow: what actually stands between the
repository and a safe release? Three things did.

### P0 — premium content was public

The whole paid library shipped inside the client bundle. A marker search against
the built assets found Pro challenge solutions in `content-challenges-*.js`, Pro
exercise solutions in the curriculum chunks, and every Pro interview answer in
`content-interview-*.js`. Anyone could have read all 629 paid items out of the
static JavaScript.

**What was done.** The paid half of every Pro item is now removed at build time
and served from an authenticated Edge Function instead.

- `src/features/billing/premiumFields.js` is the single definition of what counts
  as paid. Discovery metadata — title, slug, difficulty, topic, the statement of
  the task — stays public; solutions, graded tests, hints, answer keys and paid
  build guidance do not.
- `scripts/vite-plugin-premium.mjs` strips those fields during `vite build` only.
  Source files are untouched, so `content:audit`, `content:verify`,
  `content:examples`, the registry, search and local development all behave
  exactly as before.
- `scripts/build-premium-payload.mjs` (`npm run content:premium`) writes the
  removed fields to `supabase/functions/premium-content/payload.json`, which
  deploys with the function and is never visible to Vite.
- `supabase/functions/premium-content/` verifies the caller's token, reads their
  subscriptions with the service role, applies the same entitlement rule the
  browser uses, and only then returns the payload. Nothing in the request body
  influences that decision.
- `src/services/premiumContent.js` fetches it, caches in memory only, partitioned
  by user id, and is cleared on every identity change and on sign-out.

**Measured result.**

| | before | after |
| --- | --- | --- |
| Pro challenge solutions in the bundle | 156 / 156 | **0 / 156** |
| Free challenge solutions in the bundle | 15 / 15 | 15 / 15 |
| Pro challenge titles (discovery) | 156 | 156 |
| `content-challenges` chunk | 743 KB | **210 KB** |
| `content-interview` chunk | 849 KB | **170 KB** |

3149 paid fields across 629 Pro items are withheld. The build prints the count,
and CI re-runs the delivery tests against the freshly built `dist` so a
regression fails the pipeline rather than shipping.

Residual matches for a handful of Pro bodies were traced and are **not leaks**:
they are passages that also appear in a free lesson or cheat sheet teaching the
same idea, which is public by allocation.

### P0 — `user_progress` had no migration

The table holding every learner's private progress existed only as SQL pasted by
hand into `docs/SUPABASE.md`. `supabase db push` would not have created it, and
nothing in the repository proved RLS was enabled on it.

`supabase/migrations/202609020001_user_progress.sql` now captures the table and
its four owner-only policies, written to converge safely on a project where the
table already exists.

### P1 — no security headers

`vercel.json` carried rewrites and nothing else. It now sets a Content-Security-
Policy, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and HSTS, plus cache rules for hashed assets.

The CSP was built empirically — the real build served with the real headers —
which caught three defects that reasoning alone had missed:

1. Monaco is CDN-loaded from jsDelivr; the first policy blocked it and the editor
   silently degraded to the plain-textarea fallback.
2. Google Fonts and the Material Symbols icon font were blocked, which would have
   shipped a site with no icons.
3. The DOM sandbox timed out. A `srcdoc` iframe with `sandbox="allow-scripts"`
   has an opaque origin, so `'self'` matches nothing and its bootstrap script was
   refused.

The final policy is verified end to end: Monaco loads, fonts and icons render,
both sandbox hosts execute, and the console is clean.

`script-src` permits `'unsafe-inline'` and `'unsafe-eval'` because running learner
code *is* the product. That is a deliberate, documented trade: the app has no
`dangerouslySetInnerHTML` and renders all content as React elements, and the rest
of the policy — `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'` and a tight `connect-src` — still does real work. Serving the
sandbox document from its own origin would allow a stricter policy and is recorded
in `docs/DEPLOYMENT.md` as a known improvement, not a blocker.

### Verified clean, no action needed

- **Secrets** — `.env` is gitignored and holds only public `VITE_*` values. No
  service-role key, Gumroad token or webhook token appears in source, in frontend
  environment variables or in the bundle.
- **Webhook** — verifies its token server-side, allow-lists the resource type,
  and de-duplicates through a `billing_events` ledger with a retry path for
  previously failed events. It never trusts browser-supplied identity.
- **Reconcile** — requires a verified JWT and a confirmed email, and matches the
  Gumroad sale email against the authenticated user rather than anything in the
  request body.
- **Billing tables** — `subscriptions` is select-own-rows only with no client
  write policy; `billing_events` is revoked from both roles entirely.
- **Client XSS** — no `dangerouslySetInnerHTML` anywhere. The single `innerHTML`
  is inside the null-origin sandbox iframe, which is the point of it. External
  links carry `rel="noreferrer"`.
- **Import** — cannot forge entitlement. Verified again after the architecture
  change, in the running app: a state file declaring `plan: 'pro'` with a
  fabricated active subscription left Pricing showing the upgrade CTA and a Pro
  challenge fully gated.
- **Source maps** — none are published, so nothing re-exposes the stripped bodies.
- **CI** — already ran lint, tests, audit, verify, examples and build; it now also
  builds the premium payload and re-checks the built bundle.

### Tests

`src/tests/premium-delivery.test.js` — 42 tests covering the server rule
(unauthenticated, no subscription, active, canceling before and after period end,
past due, expired, refunded, revoked, wrong product, invented status, missing
date, unparseable date, malformed row), parity between the two entitlement
implementations across every combination of plan, status, period end and
verification, the split definition, the artifact's coverage and freshness, the
built bundle, and cache partitioning by user.

The Edge Function body runs in Deno and cannot execute here, so what is tested is
the decision logic it imports and the artifacts it serves — not a mock standing in
for either. The freshness guard was mutation-tested: corrupting one payload entry
and adding an orphan both fail it.

Full suite: **461 passed** across 21 files.

### What must still be checked by hand

`docs/DEPLOYMENT.md` lists the configuration this repository cannot verify —
Supabase redirect URLs and RLS state, Edge Function secrets, the deploy ordering
between `content:premium` and `functions deploy`, the Google and GitHub callback
URLs, and the Gumroad webhook and product allowlist.

## Verification

All gates green as of the last run:

| Gate | Result |
| --- | --- |
| `npm run content:audit` | 1856 relations, 0 broken references, 0 warnings |
| `npm run content:verify` | 569 items, 4561 assertions, 0 failures |
| `npm run content:examples` | 949 lesson + 40 interview + 202 reference examples, 0 mismatches |
| `npm test` | 461 passed (21 files) |
| `npm run lint` | clean |
| `npm run build` | success |
| `git diff --check` | clean |

**UI smoke test** — all 30 sheet pages render: 181 group headings, 50 tables,
307 related links, 0 fragments of raw markdown, 0 Pro badges, 0 console errors.

**Mobile (375×812)** — no horizontal page overflow on any sheet; every table
scrolls inside its own `overflow-x: auto` wrapper; no unscrollable `<pre>`;
related links are 44px tap targets.

**Search** — all ten required terms surface the right sheet: array methods (1),
security (1), DOM (1), event loop (2), prototype (2), this (3), fetch (3),
closure (4), event (9), regex (14).

## Known limitations

- Snippet `code` is syntax-highlighted verbatim and does not render markdown, so
  backticks inside a snippet are literal characters. Titles, descriptions, notes,
  rule items, table headers and cells all render markup.
- `InlineMarkup` supports fenced blocks, inline code, bold and links — not
  single-asterisk italics.
- The build emits a chunk-size warning (>900 kB). Pre-existing, not content-related.
- Placement stores one result, not a history. Comparing attempts over time would
  need a state shape the product does not currently have, and was not invented.
- Placement questions are deliberately absent from global content search. They are
  answer keys, and indexing them would leak the assessment.
- An in-progress placement attempt is held in component state, so a refresh
  mid-assessment restarts it. Nothing is corrupted and the restart is predictable;
  persisting partial attempts was judged not worth a new state shape.
- Card text is shortened by `clip()` in the manifest generator, which drops fenced
  blocks. A card therefore shows the prose of an instruction but never its code
  block; the full text is always on the detail page.
- `chooseImplementation` exercise options render verbatim in monospace, because
  their backticks are real template-literal syntax rather than markup. Quiz options
  are the opposite case and do render markup. A test pins the distinction.
- The correct option is authored first in each domain file and rotated into place
  by a hash of the question id (`src/content/placement/index.js`). The rotation is
  deterministic, not random, so the assessment presents identically every run.

## Next phase

**Localization / i18n** — English default, then Azerbaijani and Russian. Not
started; no files written for it yet.
