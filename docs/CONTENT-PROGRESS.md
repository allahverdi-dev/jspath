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
| Localization / i18n | **COMPLETE** | all product chrome in en / az / ru, 912 strings |
| Content-language boundary | **COMPLETE** | authored English marked `lang="en"` inside a translated UI |
| Production defect remediation | **COMPLETE** | text fragmentation and auth-aware landing |
| Legal / trust layer | **COMPLETE** | all five owner decisions published |
| Account deletion | **COMPLETE** | Settings danger zone, server-side, subscription-safe |
| Purchase restore | **COMPLETE** | recreated accounts can claim a valid purchase |
| Paddle migration | **SANDBOX** | isolated from production; Gumroad still sells |
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

## Localization / i18n

The **product interface** is available in English, Azerbaijani and Russian.
**Authored learning content remains English** and is canonical — that split is
deliberate, and the language selector says so rather than implying a translation
that does not exist.

### Architecture

No i18n dependency was added. The app ships five production packages, and what a
library would contribute is key lookup, interpolation and plural selection. The
first two are a few lines; the third is the part worth getting right, and the
platform already does it better than a hand-written rule table:
`Intl.PluralRules` selects plural categories, `Intl.DateTimeFormat` formats dates,
`Intl.NumberFormat` formats numbers.

```
src/i18n/core.js       lookup, interpolation, plurals, formatters
src/i18n/index.jsx     I18nProvider, useI18n, useT
src/i18n/locales/      en.js (canonical), az.js, ru.js
```

**912 strings across 31 namespaces**, grouped by product surface — the largest
being learning (113), billing (80), achievements (63), dashboard (59),
interview (57), placement (48) and common (47). Russian carries more entries
(952) because its counted strings supply `few` and `many` forms.

### Behaviour

- **Default and fallback** — English. A missing, unrecognised or unsupported saved
  locale resolves to English rather than half-translating the interface. A missing
  key falls back to English; a key missing everywhere renders as readable sentence
  case, never as `billing.pendingCancellation`.
- **Detection** — explicit choice only. The browser locale is deliberately *not*
  used to switch automatically: English is the declared default, and silently
  flipping a returning learner because of an OS setting is worse than asking.
- **Persistence** — `state.settings.locale`, the existing settings slice. Local
  storage for guests, normal cloud sync when signed in. No new table, and nothing
  in billing or subscription data.
- **Switching** — immediate, no reload. `document.documentElement.lang` follows,
  so assistive technology announces the right language.
- **Routing** — unchanged. No locale prefixes, so bookmarks, deep links, OAuth
  redirects and Gumroad return URLs are unaffected.

### Translation approach

Established developer terminology stays in English where that is what the
audience actually reads: JavaScript, DOM, API, Promise, async/await, callback,
closure, prototype, array, object, fetch, HTTP, JSON, Map, Set, RegExp, Big O,
Google, GitHub, OAuth, Pro, Free, XP, Playground. "Замыкание" is correct Russian,
but a Russian-speaking developer reads `closure`.

Plurals follow each language rather than English assumptions: Russian supplies
`one/few/many` (1 урок, 2 урока, 5 уроков, 21 урок); Azerbaijani keeps the noun
singular after any numeral (1 dərs, 5 dərs).

### Localized surfaces

Navigation and app shell (sidebar, mobile tab bar, aria labels) · Settings,
including the language selector · Placement, end to end · the Pro gate and every
billing status · auth (both pages, via the shared OAuth buttons) · content
load/error states · 404 · bookmarks · difficulty and track labels.

The Pro wall now takes a stable `kind` token instead of a hardcoded English
sentence, so the same gate reads correctly in every language while gating
identically — verified in all three locales, with no solution leak.

### Not translated, by design

Code, identifiers, method names and property paths. Stable internal values:
`difficulty: 'beginner'`, `status === 'canceling'`, `plan: 'pro'`, content ids,
slugs, `topicIds`, track ids. Only their display labels change, so entitlement
logic is locale-independent by construction.

### Validation

| Suite | What it proves |
| --- | --- |
| `src/i18n/i18n.test.js` (36) | the three dictionaries agree on keys, values and interpolation variables; Russian plural categories and the Azerbaijani singular rule; Azerbaijani date and number formatting; that stable tokens stay untranslated |
| `src/tests/i18n-ui.test.jsx` (30) | the plumbing: default, fallback, persistence, `<html lang>`, immediate switching, and that changing language writes *only* the locale |
| `src/tests/i18n-surfaces.test.jsx` (45) | every migrated screen rendered in az and ru: correct wording and no leaked key |

A build-time check (`scratchpad/check.mjs` during the phase) scrapes every
`t('…')` in the source, expands the derived families from the app's own enums,
achievement ids and onboarding ids, and asserts all **871 required keys** resolve
in all three locales. That is the guarantee that no screen can render a missing
key.

The raw-key assertion is deliberately precise: it flags dotted text only when it
**resolves to a real dictionary entry**. A blunt scan produced only false
positives, because a Reference entry legitimately says "returns undefined", a
challenge prompt contains `${userInput}`, and one interview question is *about*
`[object Object]`. Mutation-tested by reintroducing the Bookmarks bug: the guard
fails, as it should.

### Verification

- **Full suite: 572 passed** (24 files), up from 524.
- **3-locale smoke across 27 routes each** — every route in the brief, including
  a Free challenge, a Pro-gated challenge, both session routes and a 404. Zero
  leaked keys in en, az and ru. Chrome headings translated; authored titles
  ("Taking from an Infinite Sequence", "Array()", "Counter App") correctly still
  English.
- **Responsive** at 320px, 375px, 768px and 1280px in Azerbaijani and Russian:
  no horizontal overflow on any surface, no clipped navigation labels.
- **Live switching** through the real Settings control, without reload:
  `Tənzimləmələr` → `Настройки` → `Settings`, `<html lang>` following each time,
  persisting to `settings.locale` and leaving theme, font scale and daily goal
  untouched. Console clean.
- **Pro gating identical in all three locales**, no solution leak, and locale is
  never an input to `canAccessContent`.
- **Pro gating and premium delivery** behave identically in all three locales;
  locale is never sent to the premium-content endpoint and never influences
  entitlement.

### Migration completed

Every product surface is migrated: Landing, Dashboard, Curriculum, Module and
Lesson chrome, Practice Hub and sessions, Challenges, Projects, Interview Prep
and sessions, Reference, Cheat Sheets, Playground, Search, Profile, Achievements,
My Learning, Bookmarks, Settings, Pricing, onboarding, auth, the app shell,
errors and the 404.

Three sources of English were removed along the way that a page-by-page sweep
would not have found:

- **Logic modules that built sentences.** `recommendations.js` composed
  "X is your weakest started topic (42%)"; `masteryEngine.rankFor()` returned
  "Advanced Dev"; the achievements list held 25 titles and descriptions. These
  have no locale, so they now emit keys and the component resolves them.
- **Enum label maps.** `DIFFICULTY_LABEL`, `TRACK_LABEL`, `MASTERY_LABEL`,
  `INTERVIEW_KIND_LABEL`, `PLACEMENT_DOMAIN_LABEL`, `PLACEMENT_LEVEL_LABEL` and
  the search `KIND_LABEL` are now `*_KEY` maps pointing at the dictionary. Some
  were rendering the raw token — `DifficultyBadge` printed `beginner`,
  lower-case, in every language.
- **English inside JSX expressions.** Ternaries and template literals the text
  scan cannot see: the sidebar's `{isPro ? 'Pro · Manage plan' : 'Upgrade to Pro'}`,
  the plan line, `{xp.toLocaleString()} XP`, and plural concatenations such as
  `{streak} day{streak === 1 ? '' : 's'}`. No plural concatenation remains.

### Defects found and fixed

- **Bookmarks rendered a raw key.** `message="{t('bookmarks.emptyBody')}"` — the
  braces were inside the quotes, so learners saw the source of the call. Shipped
  by the previous pass; the regression test now reproduces it.
- **Placement was not fully localized** despite being reported as done: the
  result level and every domain label came from English constants, and the "why"
  sentence was assembled from English clauses with a hand-rolled "a, b and c"
  list. It is now one key per case with `Intl.ListFormat` joining.
- **Azerbaijani dates and numbers were wrong on reduced-ICU runtimes** —
  "2026 M03 14" instead of "14 mart 2026". See `docs/I18N.md` §6.
- **Two links with the same accessible name.** Restructuring the guest notice on
  /login left its inline link duplicating the guest button below it.
- **Sentence fragments around links.** The unconfigured-accounts notices split a
  sentence around a link, which forces English word order on every language.

### Remaining English, by category

The audit sweeps `src/pages`, `src/components`, `src/layouts`, `src/features`,
`src/state` and `src/services` for both visible text and English inside JSX
expressions. Everything left is classified:

| Category | Count | Examples |
| --- | --- | --- |
| Authored learning content | 85 | `viz/Diagram.jsx` — the teaching diagrams: "Stack grows upward · last in, first out" |
| Technical / code | ~20 | sandbox runtime messages beside real JS errors, `ENV_TONE` keys, the Playground starter snippet, `revenue.js` |
| External product names | 3 | JSPath, Google, GitHub |
| Developer-only, never rendered | ~12 | `PLAN_DEFINITIONS` descriptions, search index `subtitle`, Supabase/entitlement error strings no surface displays |
| **Accidental untranslated UI** | **0** | — |

`viz/Diagram.jsx` is renderable only from an authored lesson section, so its
strings are lesson content and stay English with the rest of it.

## Verification

All gates green as of the last run:

| Gate | Result |
| --- | --- |
| `npm run content:audit` | 1856 relations, 0 broken references, 0 warnings |
| `npm run content:verify` | 569 items, 4561 assertions, 0 failures |
| `npm run content:examples` | 949 lesson + 40 interview + 202 reference examples, 0 mismatches |
| `npm test` | 1037 passed (34 files) |
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

## Content-language boundary

The interface is translated; the learning content is not, and `<html lang>`
follows the interface. Every unmarked authored string therefore claimed to be
Azerbaijani or Russian, with two visible consequences: screen readers announced
English prose with the wrong phonetics, and `text-transform: uppercase` — which
is language-sensitive — rendered the authored word "Orientation" as
"ORİENTATİON" under `lang="az"`.

Authored content now declares `lang="en"` where it is rendered. The marking is
per string rather than per region, because `lang` is inherited and marking a
panel would relabel the translated buttons inside it.

Two shared boundaries carry it, so the call sites barely changed:

- **`InlineMarkup`** — every authored prose string in the app already flows
  through it (70 call sites). It now wraps its output in
  `<span lang="en">`: the language applies to all authored prose in one place.
  (This wrapper originally used `display: contents`; the production defect pass
  below changed it to a real box.)
- **`Authored`** — a new one-line component for plain authored strings: titles,
  API names, categories, topic labels, milestone names, test names.

`Diagram` marks its whole `<figure>` (educational content end to end, no chrome
inside); `HighlightedCode` marks its `<pre>`.

Where a chip mixes a translated label with an authored value, only the authored
half is marked — `{t('learning.moduleNumber', { order })} · <Authored>{shortTitle}</Authored>`
— which also retired the `learning.moduleBadge` key that had interpolated the two
together.

### Verified

A/B in the browser under `lang="az"`, same font, same page: `lang="az"` renders
**ORİENTATİON**, `lang="en"` renders **ORIENTATION**, and the live chip now reads
"MODUL 00 · ORIENTATION". Smoke across a lesson, challenge, project, interview
question, Reference entry and Cheat Sheet in both az and ru: every authored title
resolves to `en`, every marked region is `en` (0 exceptions), and translated
controls beside them still resolve to the UI locale. Console clean.

`src/tests/content-language.test.jsx` (21) asserts both directions and that
entitlement, ids, slugs and content are unchanged. Mutation-tested: removing
`lang="en"` from `Authored` fails eight assertions.

## Production defect remediation

Two defects found by live smoke testing on https://jspath.vercel.app.

### 1. Text fragmentation

On Project Detail at constrained widths, words and inline code split absurdly:
`querySelector` rendered as `querySel` / `ector`, `click` as `clic` / `k`, and
"count" ran one letter per line across five lines. Two rules combined:

- **`body { overflow-wrap: anywhere }`.** `anywhere` and `break-word` break the
  same words, but `anywhere` additionally makes an element's *min-content* width a
  single character. Every auto-sized flex and grid track was therefore free to
  collapse to ~7px, and did. Changed to `break-word`, which keeps the longest word
  in the intrinsic minimum — a column reserves the room a word needs, and a word
  breaks only when it genuinely cannot fit.
- **`InlineMarkup` generated no box.** Half its call sites are a flex row (icon,
  then prose). With `display: contents` — and with the bare fragment before it —
  every text run and every `<code>` became a *separate flex item*, so a sentence
  laid out as a row of independently-shrinking columns with the row's `gap`
  between them. It now renders one `<span class="min-w-0 flex-1">`: inert inside a
  `<p>`, correct inside a flex row.

A third, smaller instance: the dashboard guest notice used `flex-1` alone, which
is `flex: 1 1 0%`. A zero basis never triggers the row's `flex-wrap`, so the
paragraph shrank beside the icon and button until Russian words broke across three
lines. Given a real `basis-64` it wraps onto its own line instead.

Also added: `:not(pre) > code { word-break: normal }`, so inline code is treated
as an identifier rather than a character stream.

**Measured**, by Range-measuring every token on the page and reporting any whose
client rects span more than one line:

| | Before | After |
| --- | --- | --- |
| ProjectDetail @560px | "count" over 5 lines, 7px box; 81 of 161 runs under 40px | 0 broken words, 0 overflow |

Swept ProjectDetail, ChallengeDetail, Lesson, ExercisePage, ReferenceDetail,
CheatSheetDetail, InterviewQuestionPage, PracticeHub, Dashboard, Pricing and
Settings at 320 / 390 / 560 / 768 / 1366 / 1920 in en, az and ru. The only
remaining multi-line tokens are long code snippets inside line-clamped preview
cards (`window.addEventListener("resize", …)` in a 223px column), which the brief
explicitly allows to wrap at sensible opportunities.

### 2. Landing still offered "Log in" to signed-in learners

OAuth worked; the landing page did not know about it. It is the one screen
reachable without the app shell, so it was the only place left rendering guest
CTAs unconditionally. It now reads `isAuthenticated`, and — importantly —
`loading`, so a restoring session shows a same-size placeholder instead of
painting "Log in" and swapping it a moment later. The rest of the page never
waits on auth.

| State | Header | Hero / closing CTA |
| --- | --- | --- |
| Restoring | placeholder | placeholder |
| Signed out | Log in · Start learning | Start from zero · Get started |
| Signed in (free / active pro / canceling pro) | Dashboard · Profile | Continue learning |

Pricing stays in the header for every state, so upgrade discovery is unchanged.

### 3. OAuth return path

Signing in from a gated page returned to `/dashboard` rather than the page the
learner wanted. `/login` now reads `?next=` through `safeApplicationPath` — the
same guard the upgrade flow uses, which keeps same-origin application paths and
rejects absolute URLs, protocol-relative `//evil.test` and `javascript:` — and
passes it to both providers and to the guest link. The gate that sends people to
sign in now carries the current path. Opening `/login` directly still defaults to
the dashboard, and an authenticated visitor to `/login` or `/signup` is redirected
away rather than shown OAuth buttons.

## Legal / trust layer

Terms of Service, Privacy Policy and Refund Policy at `/terms`, `/privacy` and
`/refund-policy`, a shared `SiteFooter`, and full en/az/ru translations.
See `docs/LEGAL.md` for how the files fit together and how to update the text.

The policies are written from an audit of what the product actually does, not
from a template. They name Gumroad as the seller of record because that is what
the code integrates, say that sign-in is Google and GitHub only because that set
is closed in `services/supabase.js`, and state that there are no cookies and no
analytics because there are none in the source. `legal.test.js` re-checks each of
those claims against the implementation, so the copy fails the suite rather than
quietly going stale when the product moves.

### The five open facts, now decided

The audit found five legally significant facts that no file, config or document
established. Rather than invent them, `src/legal/config.js` held them as `null`
and every section depending on one was dropped from the page. The product owner
has now decided all five:

| Decision | Value |
| --- | --- |
| Contact | `jspath.edu@gmail.com` |
| Refund window | 10 calendar days, initial eligible purchase only; renewals generally non-refundable, exceptional requests reviewed individually with no promised outcome |
| Governing law and venue | Laws and competent courts of the Republic of Azerbaijan |
| Account deletion | Built as a real feature, not a support address |
| Minimum age | 16, as a condition of use; JSPath does not verify age |

Facts live only in `config.js`. Locale files carry `{token}` placeholders that
the renderer substitutes, so a number or an address exists in one place and
cannot drift between languages - and the suite fails if a locale file hard-codes
one.

`LEGAL_PUBLISHABLE` is still **computed** rather than asserted. Emptying any one
decision puts the layer back into withholding, and a test proves it. That was
the point of the mechanism, so it stays.

### Account deletion

Settings has a Danger zone. Deleting runs `supabase/functions/delete-account`,
which verifies the session, takes the user id from the token rather than the
request, checks subscription state with the service role and fails closed.

The rule that matters: an `active` or `past_due` subscription **blocks**
deletion, because JSPath cannot cancel a Gumroad subscription and deleting first
would leave a recurring charge with no account behind it. A `canceling`
subscription with time left is allowed only after an explicit forfeiture warning
that the request must acknowledge. Anything unrecognised is refused.

No migration was needed: `user_progress` and `subscriptions` already declare
`on delete cascade` from `auth.users`. `billing_events` is kept deliberately - it
has no user reference at all and exists so a replayed webhook is not processed
twice.

Client teardown is deliberately in the unobvious order: nothing local is cleared
until the server confirms the account is gone, because a failed deletion that
had already wiped the browser would leave a live account behind a signed-out,
empty-looking app.

### Verified

| Check | Result |
| --- | --- |
| Responsive | 320 / 390 / 768 / 1280 / 1920 x en/az/ru x 3 pages - 0 overflow, 0 broken words, 0 collisions with the mobile tab bar |
| Structure | one `h1` per page, `h2` for every section, no skipped level, keyboard-reachable TOC whose anchors all resolve |
| Language | `<html lang>` follows the locale; no localized policy prose is marked `lang="en"`; dates format through the locale formatter, including the custom Azerbaijani one |
| Footer | mounted once by `AppShell` and once by `Landing`, absent from `FocusLayout`, client-side routing throughout |
| Reach | policy links present on landing, dashboard, pricing, settings, login and signup |

## Recovery, contact and typography

Three findings from production, two real and one that turned out to be my own
reporting error.

### 1. A recreated account could not claim its purchase

A Canceling Pro learner deleted their account, the cascade removed
`subscriptions`, and they signed up again with the same identity. The Gumroad
subscription was untouched and still valid, but nothing asked about it.

The automatic reconciliation trigger is
`subscriptions.some(needsReconciliation)`, and an account with no rows makes that
`[].some(...)` - false. There was no path from "valid purchase exists" to "this
account knows about it" except opening the internal `/pricing?purchase=success`
return URL by hand.

Closed with an explicit **Restore Pro purchase** action in Settings and on
Pricing, rendered only for a signed-in learner who is not already Pro. Automatic
reconciliation on Pricing visits was considered and rejected: it would call
Gumroad once per session for every free learner who never bought anything. See
`docs/BILLING_GUMROAD.md` for the trigger table and the security model, which is
unchanged - the browser sends no body at all.

Restore brings back **entitlement only**. `user_progress` was deleted with the
account and stays deleted; the recreated account is a new learning profile. The
delete dialog and the Privacy Policy both say so now, and also that deletion is
not a refund and does not cancel a Gumroad subscription.

### 2. The contact address needed a fallback

`mailto:jspath.edu@gmail.com` is correct markup, but on a browser with no mail
handler a click does nothing - indistinguishable from a broken link. The address
is now plain selectable text, a mailto link, and a Copy button, in the Contact
section of each policy. Clipboard access happens only inside the click handler
and degrades to "select and copy it manually". No CSP change was required.

### 3. The typography finding was wrong

An earlier report of mine claimed `text-display-md`, `text-title-lg`,
`text-title-sm` and `text-label-sm` were used across the app but undefined.
`git log -S` finds them in no commit: they were class names I invented while
drafting `LegalDocument.jsx`, checked against the built CSS, and then
misattributed to existing code. The correction matters because it was acted on.

A full audit did find **one** genuine case: `text-label-md` on a cheat-sheet
table header, which Tailwind never generated, so the header silently inherited
16px - the same size as its own cells. Replaced with `text-body-sm`, an existing
token, giving a 14px header over 16px content.

| Category | Result |
| --- | --- |
| Used and defined | 16 utilities, all generated |
| Used but undefined | 1 - `text-label-md`, now fixed |
| Defined but unused | `text-body-lg` (harmless; `body-lg` is used as a family utility) |

A test now fails if any `text-<scale>-<size>` used in the app is missing from the
Tailwind config, so a class that compiles to nothing cannot ship again.

Three arbitrary sizes remain in `AppShell` (`text-[13px]`, `text-[15px]`,
`text-[10px]`). They are deliberate one-offs in the logo and the mobile tab bar,
predate this work, and were left alone.

## Paddle Billing (sandbox)

New paid subscriptions move from Gumroad to Paddle. Gumroad is not removed:
existing rows keep granting Pro, both Gumroad functions stay deployed, and
reconciliation falls back to them. See `docs/DEPLOYMENT.md` for setup and
`docs/BILLING_GUMROAD.md` for how the two providers now sit side by side.

The security model is unchanged, which was the point. The browser names an
internal option id - `pro-monthly` or `pro-annual` - and nothing else. The server
maps it to a configured price, creates the transaction, and writes the account
binding into `custom_data` itself. Paddle.js is then handed a transaction id. It
cannot choose a price, a product, a customer or a user.

### Decisions worth recording

**A draft transaction is fine.** Paddle documents that a draft or ready
transaction can be passed to `Checkout.open`, and that the checkout collects the
customer and address. So the server creates the transaction with items and
custom data only, and never has to invent customer details to satisfy an API.

**Scheduled cancellation is not cancellation.** Paddle keeps the subscription
`active` and hangs a `scheduled_change` off it. Reading `status` alone would show
a leaving customer as renewing; reacting to the word "cancel" alone would cut
their access off on the day they asked rather than the day they paid through.
JSPath maps it to `canceling` with `current_period_end = effective_at`.

**`paused` is a new normalized status.** It grants no Pro, but it is neither
expired nor revoked, and a paused plan can resume. Calling it "Expired" in
Settings would have been a lie, so the vocabulary grew by one.

**A full refund does not cancel a Paddle subscription**, and refund adjustments
need Paddle's approval. `adjustment.updated` is therefore deliberately not
consumed: acting on it would mean inventing a rule about whether a refund ends
access early, which nobody has decided. `subscription.updated` stays the single
authority.

**Two Gumroad-era NOT NULLs could not hold.** `provider_sale_id` and
`customer_email` have no Paddle equivalent at `subscription.created`. Rather than
fabricate values, both became nullable and a per-provider CHECK re-imposes them
on Gumroad rows - so nothing that was true of a Gumroad row before is untrue now.

**Recovery uses a server-owned mapping.** `billing_checkout_sessions` records
which authenticated user a transaction was created for, at the moment it is
created. Recovery reads a mapping JSPath wrote itself instead of searching the
provider by an email the browser supplied. The browser has no access to that
table at all.

## Paddle pre-deploy hardening

A security and lifecycle pass over the Paddle work before anything is deployed.
Four findings, two of them defects in what I had already reported as done.

### The one that mattered: production would have lost its checkout

The first implementation made `isBillingConfigured()` return true whenever a
Paddle client token was present, and removed the Gumroad checkout path. Deployed
as it stood, production would either have had **no checkout at all**, or - given
a sandbox token - would have handed real learners a sandbox checkout that costs
nothing and grants real Pro.

Fixed with an explicit `VITE_BILLING_MODE`: `gumroad-production` (today),
`paddle-sandbox`, `paddle-production`. Unset or unrecognised means
`gumroad-production`, so failing closed means failing to what production already
does. The Gumroad checkout builder is back and is what production uses.

The flag is a UI decision only. The real boundary is server-side: in sandbox,
the three authenticated Paddle functions refuse anyone not in
`PADDLE_SANDBOX_TESTER_IDS`, compared against the id in the verified JWT. No
allowlist configured means nobody is authorised.

### past_due revoked Pro immediately

`subscriptionGrantsPro` judged every subscription on `current_period_end > now`.
A past_due subscription has an elapsed period **by definition** - that is why
payment is due - so a genuinely past_due Paddle subscriber lost Pro the moment a
renewal failed, which is the opposite of Paddle's provisioning guidance and of
what the previous report claimed.

The test that should have caught it used a period end in the *future*, which no
real past_due subscription has. It passed for the wrong reason. It now uses an
elapsed period, and there is a second test for the inverse risk.

The first fix then over-corrected: it bounded past_due access by how recently
the row had been verified, which is a *second* invented rule - Paddle's model
has no such concept and nobody approved a staleness cutoff. Removed.

Paddle `past_due` now simply grants Pro. Paddle owns the recovery window: it
retries the payment, and either the payment succeeds and the subscription
returns to `active`, or recovery is exhausted and Paddle moves it to `canceled`,
which arrives here as `expired` and grants nothing. Following the provider's
status is both simpler and more correct than any grace period of ours. Webhook
ordering and idempotency keep state moving forwards; reconciliation refreshes it
on demand. `last_verified_at` stays as metadata and as the fallback for rows
with no period at all. Scoped to Paddle; Gumroad is unchanged.

### Sandbox rows could have become live entitlements

Sandbox and live are different Paddle accounts but both write
`provider = 'paddle'`. A subscription bought with a test card would have become
a real entitlement the day the deployment went live. The migration - never
deployed, so amended in place rather than corrected by a second migration - now
records `provider_environment`, and the resolver refuses a row whose environment
does not match the running deployment.

### Webhook tolerance: 300s back to 5s

The 300-second replay window was justified by a cold start nobody had measured.
Paddle documents 5 seconds and signs retries normally, so a retry arrives with a
fresh timestamp and needs no wider window. Now 5s by default, overridable only
through a server-side secret, bounded at 300s, with invalid values falling back
to 5 rather than being honoured.

### Also

`checkout.closed` now returns the pricing page to a usable state - previously
dismissing the overlay left the button stuck in its loading state with no way to
retry. Closing grants nothing and shows no success. The listener unsubscribes on
unmount.

Refund and chargeback entitlement semantics are documented as an explicit
**live cutover blocker** rather than guessed at, because in Paddle a refund is a
financial adjustment that does not cancel a subscription. `adjustment.updated`
stays disabled. See `docs/BILLING_GUMROAD.md`.

The legal policies still say Gumroad, because production still sells through
Gumroad. `docs/LEGAL.md` carries the checklist of what changes at cutover.

## Next phase

**Final release / production verification.** Not started; no files written for it
yet.
