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

## Verification

All gates green as of the last run:

| Gate | Result |
| --- | --- |
| `npm run content:audit` | 1856 relations, 0 broken references, 0 warnings |
| `npm run content:verify` | 569 items, 4561 assertions, 0 failures |
| `npm run content:examples` | 949 lesson + 40 interview + 202 reference examples, 0 mismatches |
| `npm test` | 348 passed (17 files) |
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

**Final frontend / product QA.** Not started; no files written for it yet.
