# Content authoring progress

Session continuity record. Update this at the end of every authoring session.
This file exists to make handover cheap — it is **not** a reason to defer work.

Last updated: after authoring the JavaScript Reference — 213 canonical entries.

## Status

**CURRICULUM STATUS: COMPLETE** — 47 / 47 modules authored and verified.

**CHALLENGE LIBRARY STATUS: COMPLETE** — 171 challenges authored and verified,
against a target of 150+.

**PROJECT LIBRARY STATUS: COMPLETE** — 31 guided projects authored and
verified, against a target of 30+. See "Project library — composition" below.

**INTERVIEW BANK STATUS: COMPLETE** — 312 questions authored and verified,
against a target of 250+. Every one of the 40 output-prediction questions is
machine-verified by executing its code. See "Interview bank — composition"
below. Note Module 46 teaches interview *method* and deliberately does not
duplicate this; it is the companion, not the bank.

**REFERENCE STATUS: COMPLETE** — 213 canonical API entries authored and
verified, covering the ECMAScript, DOM and Web API surface the curriculum
teaches. 202 of 215 examples are executed and byte-compared against their
documented output; the other 13 are honestly labelled illustrative because the
sandbox genuinely cannot host those APIs. See "Reference — composition" below.

**CHEAT SHEETS STATUS: INCOMPLETE** — 0 sheets.

**PLACEMENT ASSESSMENT STATUS: INCOMPLETE**

**PRODUCT STATUS: INCOMPLETE** — curriculum, challenges, projects, the
interview bank and the reference are five of several required content areas.
The cheat sheets and the placement assessment remain at zero. See "Next
product phase" below.

## Status summary

All values below are read from `npm run content:audit`, `content:verify` and
`content:examples` — not estimated.

| Metric | Count |
| --- | --- |
| Modules with lessons | **47 / 47** |
| Lessons | 214 |
| Lesson sections | 3808 |
| Worked code examples | 1116 |
| Exercises | 810 |
| Quiz questions | 819 |
| Runnable examples verified | 949 |
| Intentionally skipped examples | **1** (see below) |
| Reference-solution items | 569 |
| Reference-solution assertions | 4561 |
| Audit errors | **0** |
| Audit warnings | **0** |
| **Challenges** | **171** |
| Challenge tests | 2118 (avg 12.4 per challenge, min 8) |
| Hidden challenge tests | 310 |
| **Projects** | **31** |
| Project milestones | 142 across 31 projects (avg 4.6) |
| Projects with `relatedLessons` | 31 / 31 |
| Projects with `relatedChallenges` | 31 / 31 |
| **Interview questions** | **312** |
| Interview output questions executed & verified | 40 |
| Interview questions with `relatedLessons` | 305 / 312 |
| Interview questions with `commonMistakes` and `followUps` | 312 / 312 |
| **Reference entries** | **213** |
| Reference examples executed & verified | 202 |
| Reference examples labelled illustrative | 13 |
| Reference entries with `relatedEntries` | 213 / 213 |
| Reference entries with `lessonId` | 213 / 213 |
| Reference entries with `aliases` | 213 / 213 |
| Cheat sheets | 0 (not started) |

Gate status — all six pass:

| Gate | Result |
| --- | --- |
| `npm run content:audit` | **PASSES GLOBALLY** — exit 0, 0 errors, 0 warnings |
| `npm run content:verify` | 569 items, 4561 assertions, 0 failures |
| `npm run content:examples` | 949 lesson examples + 40 interview output questions + 202 reference examples checked, 1 skipped, 0 mismatches |
| `npm run test` | 41 tests, 3 files, all passing |
| `npm run lint` | clean (`--ext .js,.jsx,.mjs,.cjs --max-warnings=0`) — **fixed this session, see below** |
| `npm run build` | succeeds |

> **`npm run lint` was silently not linting `.jsx` files at all**, for the
> entire life of this project up to this session — `eslint .` with no `--ext`
> flag defaults to `.js` only under the legacy config format this repo uses.
> That meant `src/pages/**/*.jsx` and `src/components/**/*.jsx` — the large
> majority of the actual UI — had never once been checked by the lint gate,
> despite every prior session reporting "lint: PASS." Fixed by adding
> `--ext .js,.jsx,.mjs,.cjs` to the script. Running the corrected lint surfaced
> 23 pre-existing errors and 1 warning across 13 files (unused imports, two
> JSX text nodes that looked like comments, one missing `useMemo` dependency
> wrap) — all pre-existing, none caused by this session's content, all fixed.
> One of those fixes was a genuine product gap, not just cleanup: `MyLearning`
> computed `quizAccuracy` and never rendered it — added as a fifth stat tile.
> Treat any future "lint: PASS" as meaning what it now actually checks.

> The audit now passes **globally** for the first time, because no curriculum
> module is empty. The previous "0 errors from authored content, N from empty
> modules" caveat no longer applies — treat any non-zero exit as a real failure.

### The one skipped example, and why

`shouldSkip` in `scripts/verify-examples.mjs` skips exactly one runnable
example. It is the `innerText` demonstration: jsdom has **no layout engine**, so
`.innerText` is always `undefined` there even though it works correctly in every
real browser. That is a gap in the verification environment, not in the content,
so the example stays runnable for learners rather than being made to fail
against an environment that cannot support the API.

The skip list also covers `localStorage` and calls to the global `fetch`, but no
authored example currently trips those — storage examples use a labelled
stand-in (Module 27) and fetch examples shadow the global (Module 26).

## Challenge library — composition

171 challenges in `src/content/challenges/`, one file per category. Counts are
read from the loader, not estimated.

By difficulty (brief target in brackets):

| Difficulty | Count | Target |
| --- | --- | --- |
| Beginner | 26 | 25–30 ✅ |
| Easy | 33 | 35–40 — **2 under** |
| Medium | 68 | 45–50 — **18 over** |
| Hard | 32 | 25–30 — **2 over** |
| Expert | 12 | 10–15 ✅ |

The Medium overshoot is real and worth stating plainly rather than hiding: when
a problem needed a non-obvious data structure or an edge case that changes the
approach, it landed in Medium, and that describes a lot of genuinely useful
problems. Nothing was padded to reach a number and nothing was thinned to hit a
band. If the distribution needs correcting later, the honest fix is to author
more Easy challenges, not to relabel existing ones.

By category:

| Category | Count |
| --- | --- |
| First Steps | 17 |
| Fundamentals | 15 |
| Arrays & Collections | 15 |
| Async & Promises | 13 |
| Algorithms | 12 |
| Functions & Closures | 12 |
| Objects & Data Shaping | 12 |
| Expert Builds | 12 |
| Strings & Text | 11 |
| Iterators & Metaprogramming | 10 |
| Security & Engineering | 10 |
| Regex, Dates & Numbers | 9 |
| Classes & OOP | 8 |
| DOM & Events | 8 |
| Data Structures | 7 |

44 distinct `topicIds` are referenced. Zero duplicate ids, slugs, titles or
prompts.

### XP rule

`src/content/challenges/_xp.js` defines one table indexed by difficulty —
Beginner 15, Easy 25, Medium 40, Hard 60, Expert 90. Every challenge imports it
and indexes by its own `difficulty`, so the two cannot drift. **Do not
hand-write an `xp` number on a challenge**, and do not introduce a second
formula; `recordChallengeAttempt` already awards `challenge.xp` through the
existing `awardXp` path, once per challenge.

### Conventions these challenges follow

- **Behaviour, not implementation.** No test greps the learner's source for
  `.map(` or `for` or any other construct. Where a specific technique is
  genuinely required, it is enforced by a *performance* test with a large input
  (e.g. 50,000 elements) that a quadratic solution cannot pass, so any correct
  linear approach is accepted.
- **Alternative implementations pass.** Tests assert observable results, and
  where several correct answers exist the prompt states the tie-break rule
  rather than the test assuming the author's choice.
- **Determinism.** No challenge test depends on the network, the current date,
  the locale, the timezone, garbage collection, or an arbitrary elapsed
  millisecond count. Where timing or cancellation is the subject, the clock,
  the scheduler or the `AbortSignal` is **injected as a parameter** — see
  `debounce`, `withTimeout`, `retry`, `pollUntil`, `TokenBucket`,
  `createScheduler` and `runPool`. That is also why those tests run instantly.
- **Dates are UTC-only.** `daysBetween` and `addBusinessDays` compute in UTC and
  their tests construct dates with `Date.UTC`, so they pass in any timezone.
- **Security challenges are defensive only.** They build validators, escapers,
  masks, limiters and safe parsers. There are no exploit payload collections and
  no offensive tooling. Where a technique has real limits — the length leak in
  `constantTimeEqual`, the fact that `withTimeout` ignores rather than cancels,
  the scope of HTML escaping — the explanation says so instead of overclaiming.
- **Hidden tests carry the edge cases.** 310 of the 2118 tests are hidden, so a
  solution that only satisfies the visible examples still fails.

## Project library — composition

31 projects in `src/content/projects/`, one file per difficulty band. Counts
are read from the loader, not estimated.

| Difficulty | Count | Target |
| --- | --- | --- |
| Beginner | 9 | 8–10 ✅ |
| Easy | 6 | (intermediate lower band) |
| Medium | 7 | (intermediate upper band) |
| Hard | 6 | (advanced lower band) |
| Expert | 3 | (advanced upper band) |

The brief's three-tier target (Beginner 8–10 / Intermediate 12–14 / Advanced
8–10) was mapped onto the platform's existing five-level `DIFFICULTY` enum
rather than inventing a sixth "intermediate" value that nothing else in the
schema, the UI filter tabs, or `DIFFICULTY_ORDER` recognises: **Easy + Medium
(13) covers the Intermediate band, Hard + Expert (9) covers the Advanced
band.** Reusing the existing enum was a deliberate "use the actual schema"
choice, not an oversight — a new difficulty value would have needed changes to
`types.js`, `validate.js`, `Projects.jsx`'s tab list, and `DifficultyBadge`,
none of which the brief asked for.

| File | Projects |
| --- | --- |
| `beginner.js` | Counter App, Random Color Generator, Character Counter, Tip Calculator, Number Guessing Game, Digital Clock, Calculator, Quote Generator, FAQ Accordion |
| `easy.js` | Simple Form Validator, Password Strength UI, Image Gallery + Lightbox, Pomodoro Timer, Bookmark Manager, Memory Match Game |
| `medium.js` | Todo Application, Quiz Application, Notes Application, Expense Tracker, Weather Application, Recipe Finder, Habit Tracker |
| `hard.js` | Movie Search, GitHub Profile Finder, Kanban Board, Product Search & Filter, E-commerce Cart, Finance Dashboard |
| `expert.js` | Project Management Workspace, Async Request Dashboard, Configurable Validation Engine |

Every project topic in the original brief that was listed as a *distinct*
learning outcome is present. Deliberately **not** authored, with reasoning:
"Interactive Notes" and "Todo App" variants beyond the one Todo project — the
brief explicitly warns against counting near-identical CRUD-list apps as
separate projects; a second todo-shaped app would have taught nothing the
first did not.

### Coverage of the brief's required themes

| Requirement | Where it lives |
| --- | --- |
| DOM, events, forms | Beginner + Easy tier broadly; Form Validator, Image Gallery |
| Arrays, objects, local state | Every tier |
| Local persistence (`localStorage`) | Bookmark Manager onward, all Medium+ projects |
| Async / Promises / fetch / error handling | Weather, Recipe Finder, Movie Search, GitHub Finder, Async Request Dashboard |
| Modules (multi-file architecture, dependency direction) | **Finance Dashboard** (required `api/state/render/events/utils/main` split) and **Project Management Workspace** |
| Classes / architecture | Finance Dashboard, Project Management Workspace, Validation Engine |
| Explicit testing requirement | **Expense Tracker**, **Finance Dashboard**, **Project Management Workspace**, **Async Request Dashboard**, **Configurable Validation Engine** — five projects, not one, carry a required automated-test milestone |
| Debounce / throttle / caching / dedup | **Movie Search** (built specifically around this) and **Async Request Dashboard** |
| Safe rendering of user text (no unsafe `innerHTML`) | **Notes Application** (built specifically around this); mentioned again in Todo |
| No live public API dependency | Weather, Recipe Finder, Movie Search, GitHub Finder all use an **injected fetch** over local fixture data, following the same pattern the async challenges established — `getWeather(city, { fetch })`, not a hardcoded `fetch(...)` call |
| No embedded secrets | Stated explicitly in the Weather project's requirements; no API key appears in any authored project |

### Schema extension — minimal, backward compatible

`validateProject` already required `id, slug, title, brief, difficulty,
objectives, requirements, milestones, completionCriteria, hints, stretchGoals,
topicIds` before this session — that core was untouched. Added, as **optional**
fields validated for shape only when present (so nothing that omits them
breaks):

- `prerequisites`, `relatedChallenges`, `testingChecklist`,
  `reflectionQuestions` — arrays of strings
- `solutionNotes` — a string
- `starterFiles` — an array of `{ filename, code }`

`content-audit.mjs` gained one new cross-reference check —
`relatedChallenges` ids are now validated against the real challenge id set,
the same way `relatedLessons` already was — plus a project-title uniqueness
check (`checkUnique(content.projects, 'title', 'project')`) and a
near-duplicate-brief warning, mirroring the existing prompt-duplication check
for challenges.

### UI extension — minimal, reused existing components

`ProjectDetail.jsx` did not previously render `prerequisites`,
`relatedChallenges`, `testingChecklist`, `reflectionQuestions`,
`starterFiles`, `solutionNotes`, or topic/skill chips, and rendered `brief`
and every milestone/requirement/hint string as **plain text**, so authored
`` `code` `` and `**bold**` markup showed as raw characters — the same defect
class already fixed once in `ChallengeDetail` earlier this project. Fixed by
wrapping every prose field in the existing `InlineMarkup` component and adding
five new sections, all built from components already in
`components/ui/index.jsx` (`Card`, `Disclosure`, `Badge`) and the existing
`HighlightedCode` component for `starterFiles` — no new UI primitives were
created. `solutionNotes`, when present, is hidden behind a click-to-reveal
button before the `Disclosure` renders, mirroring the "reference solution"
reveal pattern `ChallengeDetail` already uses, per the brief's instruction not
to put implementation notes directly below the brief. `Projects.jsx`'s list
cards gained topic/skill chips (from `topicIds` via the existing `topicLabel`
helper — no new `skills` field was introduced, since one already existed).

Verified live in the browser, not just by the schema: milestone toggling
correctly awards 25 XP and records a streak day (confirmed "0 XP" → "50 XP",
"0 days" → "1 day" after ticking two milestones on the Counter App), the
dashboard's project count and progress panel already read from
`contentStats.projects` and `projectStats(state)` — both real, derived values,
untouched this session — and every difficulty tab, every one of the 31 project
cards, and a project from each tier (including the six-module Finance
Dashboard) render with zero console errors on a clean tab.

## Interview bank — composition

312 questions in `src/content/interview/`, 15 files grouped by subject. All
counts are read from the loader, not estimated.

By difficulty (brief target in brackets):

| Level | Count | Target |
| --- | --- | --- |
| Junior | 74 | 70–80 ✅ |
| Junior+ | 88 | 60–70 — **18 over** |
| Intermediate | 97 | 70–80 — **17 over** |
| Advanced | 53 | 30–40 — **13 over** |

The overshoot is a consequence of the bank landing at 312 rather than 250; the
Junior band is the one that matters most for a first-interview audience and it
sits inside its absolute target. Nothing was relabelled to hit a band.

By question type (brief target in brackets):

| Type | Count | Target |
| --- | --- | --- |
| Conceptual | 66 | ~60+ ✅ |
| Output prediction | 40 | ~40+ ✅ |
| Coding | 36 | ~35+ ✅ |
| Comparison | 31 | ~30+ ✅ |
| Debugging | 31 | ~30+ ✅ |
| Browser/DOM (22) + Async/event loop (10) | 32 | ~30+ ✅ |
| Architecture (8) + Testing (8) + Performance (10) + Security (11) | 37 | ~25+ ✅ |
| Scenario 13, Algorithms 12, HTTP 8, Refactoring 6 | 39 | — |

Files, largest first: `junior-essentials` 34, `browser-async` 28,
`coding-problems` 26, `fundamentals` 24, `output-prediction` 23,
`functions-closures` 22, `debugging` 20, `professional` 20, `arrays-objects` 19,
`async` 19, `engineering-practice` 19, `language-and-tooling` 17,
`browser-dom` 15, `advanced` 14, `prototypes-oop` 12.

Topic coverage: **58 of 59** curriculum topic ids are referenced by at least one
question. The single uncovered id is `orientation`, which is the "what
programming is / where JavaScript runs" meta-topic and has no interview
question that is not better expressed as a runtime question — that is a
deliberate omission, not a gap.

### What makes the output questions trustworthy

`scripts/verify-examples.mjs` was extended this phase to execute every
`kind: 'output'` question through the **real sandbox runtime** and assert that
the option marked `correct` is exactly what the code prints. Without that, an
output question could ship with a plausible-looking but wrong answer and no gate
would catch it — the schema cannot know what code prints. All 40 pass.

This is why the event-loop ordering claims in this bank are assertions of fact
rather than recollection. Three snippets were rewritten during authoring because
execution disagreed with what I had written, including one that used top-level
`await`, which the `new Function` sandbox cannot parse at all.

### Open-ended questions are self-assessed, and say so

There is no AI grader in this product. Every non-objective question ships with
`shortAnswer` (the 30-second answer for the room), `deepAnswer` (the reasoning),
`keyPoints` (a self-scoring checklist), `commonMistakes` and `followUps`. The
Interview Prep sidebar states this explicitly: *"Open answers are self-assessed.
There is no AI grader here, and pretending otherwise would give you false
confidence."* Do not add a scoring mechanism that pretends to judge semantic
correctness.

### Duplicate detection — and what it caught

`content-audit.mjs` gained a `checkUnique(content.interview, 'question')` check,
which makes an exact duplicate prompt a hard error. **That was not sufficient.**
A token-overlap pass across all 312 prompts found **34 questions that were
renamed copies** of questions already in the bank — written because the later
batches were authored before re-reading the earlier files. Examples: a second
"Where does execution resume after `await`", a second layout-thrashing question,
a second `memoize` implementation, a second CORS question, a second
forEach-with-async debugging question.

All 34 were deleted and replaced with genuinely distinct questions
(`language-and-tooling.js` and `engineering-practice.js` exist for exactly that
reason). The lesson to carry forward: **exact-match duplicate detection is the
floor, not the ceiling — dump every existing prompt and read it before
authoring a new batch.** A one-off token-overlap script is enough; do not build
an NLP similarity engine for this.

### One UI defect found by the browser smoke test

`InterviewPrep.jsx` rendered `q.question` and `q.shortAnswer` as raw strings in
the list cards while `InterviewAnswer.jsx` correctly used `InlineMarkup`. With
262 of 312 cards containing backticks or bold, the list showed literal `` ` ``
and `**` markers throughout. Fixed by wrapping both in `InlineMarkup` — the same
plain-text-rendering defect this project has now hit in four places
(`ChallengeDetail`, `ProjectDetail`, `InterviewAnswer`, `InterviewPrep`).
Verified in the browser afterwards: 1,103 `<code>` and 97 `<strong>` elements
render in the cards, and zero raw markers remain in the page text.

## Curriculum coverage review

Checked against the original module specifications. Every required topic is
covered, in the module that owns it or deliberately elsewhere.

| Area | Status |
| --- | --- |
| Modules 00–37 | Covered — verified in earlier sessions |
| 38 Recursion | Covered: base cases, stack depth, nested data, recursion vs iteration, memoisation |
| 39 Algorithms | Covered: Big O, space complexity, stack, queue, hash lookup, linked list, tree, graph, search, sort, frequency counter, two pointers, sliding window |
| 40 Clean code | Covered: naming, magic values, comments, guard clauses, cohesion, DRY/KISS/YAGNI, smells, separation of concerns, refactoring |
| 41 Patterns | Covered: module, factory, singleton, observer, pub/sub, strategy, adapter, facade, command, MVC, misuse |
| 42 Testing | Covered: philosophy, AAA, unit/integration/E2E, doubles, async, DOM, behaviour vs implementation, coverage |
| 43 Performance | Covered: measurement, main thread, DOM batching, layout thrashing, debounce/throttle, rAF, memory, **network, caching, code splitting, deferred work** |
| 44 Security | Covered: trust boundaries, XSS, safe DOM APIs, sanitisation, CSRF, authn vs authz, tokens, secrets, CORS, dependencies, prototype pollution, eval |
| 45 Workflow | Covered: npm, package.json, semver, lockfiles, linting, formatting, build tools, env vars, debugging, docs, code review, **Git workflow, project structure** |
| 46 Interview | Covered: answer structure, short/deep answers, output prediction, debugging, front-end questions, communicating uncertainty, readiness checklist |

**Gaps found and closed during this review.** Two required areas were genuinely
missing after the first pass and were authored rather than waved through:

- **Module 43 lesson 3** — network performance, request deduplication, caching
  with a TTL, the N+1 pattern, code splitting and deferred work. The module
  previously had no code-splitting or network content at all.
- **Module 45 lesson 3** — Git branch/commit/PR workflow, merge vs rebase,
  destructive-command safety, and project structure with an enforceable
  dependency-direction rule. Neither Git nor project organisation was covered.

**Intentionally covered elsewhere.** Composition versus inheritance is listed
under Module 41 in the original brief but is taught in full as **Module 31
lesson 4** (`composition-versus-inheritance`), which is where the class material
makes it land. Module 41 references it rather than repeating it.

## Modules completed

Counts copied from the audit's own per-module table.

| # | Module | Lessons | Exercises | Quiz Qs |
| --- | --- | --- | --- | --- |
| 00 | Programming & JavaScript Orientation | 6 | 12 | 13 |
| 01 | Variables & Values | 6 | 22 | 21 |
| 02 | Data Types | 6 | 21 | 22 |
| 03 | Type Conversion & Coercion | 6 | 19 | 21 |
| 04 | Operators & Expressions | 6 | 19 | 21 |
| 05 | Strings | 6 | 19 | 19 |
| 06 | Numbers & Math | 3 | 9 | 12 |
| 07 | Booleans, Conditions & Control Flow | 3 | 9 | 10 |
| 08 | Functions Fundamentals | 6 | 23 | 23 |
| 09 | Arrow Functions & Function Patterns | 4 | 14 | 15 |
| 10 | Scope, Hoisting & Execution Basics | 5 | 18 | 19 |
| 11 | Loops & Iteration | 5 | 18 | 17 |
| 12 | Arrays Fundamentals | 4 | 15 | 15 |
| 13 | Array Iteration Methods | 7 | 28 | 27 |
| 14 | Objects Fundamentals | 6 | 24 | 24 |
| 15 | Object Utilities & Advanced Object Basics | 5 | 20 | 20 |
| 16 | Date, Time, RegExp & Built-in Utilities | 7 | 28 | 28 |
| 17 | DOM Fundamentals | 6 | 24 | 24 |
| 18 | DOM Creation & Traversal | 6 | 24 | 24 |
| 19 | Events | 6 | 24 | 24 |
| 20 | Forms & Validation | 6 | 24 | 24 |
| 21 | Modern JavaScript (ES6+) | 5 | 20 | 20 |
| 22 | Error Handling & Debugging | 5 | 20 | 20 |
| 23 | Asynchronous JavaScript Foundations | 5 | 20 | 20 |
| 24 | Promises | 5 | 20 | 20 |
| 25 | async / await | 4 | 16 | 16 |
| 26 | HTTP, JSON, Fetch & APIs | 6 | 24 | 24 |
| 27 | Browser Storage & Web APIs | 5 | 20 | 20 |
| 28 | Modules & Code Organization | 5 | 20 | 20 |
| 29 | The `this` Keyword | 5 | 20 | 20 |
| 30 | Prototypes & Prototypal Inheritance | 4 | 16 | 16 |
| 31 | Classes & OOP | 4 | 16 | 16 |
| 32 | Closures | 4 | 16 | 16 |
| 33 | Execution Context, Call Stack & Event Loop | 3 | 12 | 12 |
| 34 | Advanced Data Structures | 4 | 16 | 16 |
| 35 | Iterators & Generators | 3 | 12 | 12 |
| 36 | Metaprogramming | 3 | 12 | 12 |
| 37 | Functional JavaScript | 3 | 12 | 12 |
| 38 | Recursion & Problem Solving | 3 | 12 | 12 |
| 39 | Algorithms & Data Structure Fundamentals | 3 | 12 | 12 |
| 40 | Clean JavaScript | 3 | 12 | 12 |
| 41 | JavaScript Design Patterns | 3 | 12 | 12 |
| 42 | Testing JavaScript | 3 | 12 | 12 |
| 43 | Performance | 3 | 12 | 12 |
| 44 | JavaScript Security | 2 | 8 | 8 |
| 45 | Professional JavaScript Workflow | 3 | 12 | 12 |
| 46 | Interview Mastery | 3 | 12 | 12 |

**On lesson counts.** Counts follow the material, never a target. Module 44 has
two lessons because its required topics divide cleanly into *trust boundaries
and XSS* and *auth, secrets, CORS and dependencies* — a third would have split
one of those artificially. Modules 43 and 45 have three each **after** the
coverage review found genuine gaps; the additions were made because material was
missing, not to reach a number.

## Test-quality spot check

Run before declaring completion. All returned zero:

```bash
grep -rn "expect(true).toBe(true)" src/content/curriculum/*/lessons.js
grep -rn "toString().includes" src/content/curriculum/*/lessons.js
grep -rho "id: 'ex-m[0-9]*-[0-9]*-[a-z]'" src/content/curriculum/*/lessons.js | sort | uniq -d
grep -rho "id: 'l-m[0-9]*-[0-9]*'" src/content/curriculum/*/lessons.js | sort | uniq -d
```

No vacuous assertions, no source-string matching, no existence-only tests, and
no duplicate lesson, exercise or quiz-question ids.


### Challenge test-quality spot check

Run mechanically over all 2118 challenge tests, not sampled:

| Check | Result |
| --- | --- |
| Tests grepping the learner's source for constructs | **0** |
| Vacuous assertions (`expect(true).toBe(true)`) | **0** — 1 found and fixed |
| Existence-only tests (`typeof f === "function"` alone) | **0** |
| Duplicate test names within a challenge | **0** |
| Challenges with no hidden tests | **0** |
| Tests touching the network | **0** |
| Tests depending on the real clock or un-injected randomness | **0** |
| Duplicate challenge ids / slugs / titles / prompts | **0** |

The one vacuous assertion was in the scheduler challenge's empty-queue case; it
now asserts that `flush` actually settles, that it does not yield when there is
nothing to do, and that the scheduler still works afterwards.

Two constructs deliberately survive the audit and are correct:
`isPlainObject` constructs a `new Date()` (any date works — it is testing the
type, not the value), and `kthSmallest` uses `Math.random` for pivot selection
*inside the reference solution*, where randomness affects running time only and
never the result.

## Reference — composition

213 canonical entries. One API, one article: the audit enforces uniqueness on
the **normalised canonical name** (lowercased, trailing `()` stripped), not just
on id and slug, so `map` / `Array.map` / `Array.prototype.map()` cannot ship as
three entries. Informal spellings live in `aliases`, which the manifest carries
into global search.

### By environment

The ECMAScript / DOM / Web API boundary is recorded on every entry and shown as
a badge, because blurring it is one of the most common ways reference material
misleads.

| Environment | Entries |
| --- | --- |
| ECMAScript | 160 |
| DOM | 30 |
| Web API | 23 |

### By category

| Category | Entries | | Category | Entries |
| --- | --- | --- | --- | --- |
| Array | 35 | | Events | 6 |
| String | 25 | | Language & Globals | 6 |
| Number & Math | 21 | | Fetch & HTTP | 5 |
| Object | 14 | | DOM Selection | 4 |
| Modern Syntax | 14 | | Date | 7 |
| Browser & Web APIs | 13 | | DOM Content & Attributes | 7 |
| Map, Set & Collections | 11 | | Error | 3 |
| Promise & Async | 9 | | Forms | 3 |
| DOM Manipulation | 8 | | Function | 3 |
| Modules | 3 | | RegExp | 3 |
| Symbol & Iteration | 3 | | DOM Traversal | 2 |
| JSON | 2 | | Proxy & Reflect | 2 |
| Storage | 2 | | URL | 2 |

### Verification

| Metric | Count |
| --- | --- |
| Examples total | 215 |
| Executed and byte-compared against documented output | **202** |
| Labelled illustrative (`runnable: false`) | 13 |
| Entries where `mutates: true` | 39 |
| Entries where `mutates: false` | 174 |
| Distinct curriculum topics referenced | 46 |

`scripts/verify-examples.mjs` was extended to execute every reference example
that documents an `output`, through the **same** runner used for lesson
examples and interview output questions. There is one definition of "what this
code actually prints", not three that could drift.

**The 13 illustrative examples are the APIs the sandbox genuinely cannot host**,
and each says so in its own caveats rather than pretending to run: `fetch()`,
`localStorage` / `Storage.setItem()`, `IntersectionObserver`,
`requestAnimationFrame()`, `Navigator.clipboard`, `Navigator.geolocation`,
`Worker`, `History.pushState()`, `import` / `export` / dynamic `import()`, and
`HTMLElement.innerText` (jsdom has no layout engine). **No example anywhere in
the reference reaches the network.**

Mutation behaviour is a required schema field, so it is stated for every entry
rather than left to prose. The mutating set is exactly: `push`, `pop`, `shift`,
`unshift`, `splice`, `sort`, `reverse`, `fill`, `Object.assign`,
`Object.defineProperty`, `Object.freeze`, `Object.seal`, `Map`/`Set` mutators,
`Date` setters, and the DOM write APIs.

### Coverage review

Coverage was derived, not guessed: every code string across the curriculum,
exercises, challenges, projects and interview bank was scanned for method calls
and global identifiers, and the result compared against reference names,
aliases and syntax lines. That review found `console` — 4,427 uses and no
entry — plus `Boolean`, `BigInt`, `globalThis`, `encodeURIComponent`,
`queueMicrotask`, `performance.now` and `crypto.randomUUID`. All eight were
then authored. Everything else flagged was either a user-defined helper from an
exercise (`enqueue`, `deposit`, `greet`) or a test matcher (`toBe`, `toEqual`),
not a platform API.

### Infrastructure: extended, not rebuilt

The Reference page, detail page, registry glob, manifest field, loader bucket,
audit counter and `CONTENT_KIND.REFERENCE` search integration **all already
existed and were merely unpopulated** — the same pattern as the previous three
phases. What genuinely needed adding:

- **Schema** — `REFERENCE_CATEGORY` and `REFERENCE_ENV` enums; `environment`
  and `topicIds` made required; `aliases`, `description`, `commonMistakes` and
  `relatedEntries` accepted as optional; per-parameter and per-example shape
  checks.
- **Audit** — canonical-name uniqueness, alias-vs-canonical collision
  detection, `relatedEntries` resolution, self-reference detection, and
  reference `topicIds` added to the existing topic cross-check.
- **Verifier** — the reference-example loop described above.
- **Manifest / search** — `aliases` and `environment` carried through so global
  search matches informal spellings without loading a body.

### Defects found and fixed this session

1. **`ReferenceDetail.jsx` dropped `needsDom` and `html`** when handing examples
   to `CodeBlock`, and hard-coded `runnable`. Every DOM example would have
   passed the jsdom verifier and then failed in the browser with
   `ReferenceError: document is not defined` — the identical bug fixed in
   `ChallengeDetail.jsx` during the challenge phase. Fixed before authoring, and
   confirmed by running `Document.querySelector()`'s example in the real browser
   sandbox.

2. **`InlineMarkup` could not render `**\`code\`**`** — bold wrapping inline
   code produced literal backticks on screen. 62 places in the reference hit
   this. Fixed in the component rather than by stripping emphasis from 62
   strings.

3. **`InlineMarkup` could not render fenced code blocks**, mangling them into a
   stray-backtick blob. This was a **pre-existing defect in the interview bank**
   from the previous phase — 105 paragraphs across 82 questions — as well as 2
   reference paragraphs. Fixed in the component; both areas now render real code
   blocks.

4. **The verifier's timer harness dropped `setTimeout`'s extra arguments**, so
   `setTimeout(fn, 0, "x")` verified as `undefined` — the harness misrepresented
   real `setTimeout` semantics. Fixed to forward them.

5. **The verifier did not drain for `MutationObserver`**, so its asynchronous
   records were never observed and the example silently produced no output.
   Added to the async-detection pattern.

6. **An unhandled rejection crashed the verifier** with a raw stack instead of
   naming the offending snippet. Now captured and reported as an ordinary
   failure.

7. **Roughly a dozen documented outputs were wrong** and were corrected against
   real execution — microtask tick-count orderings in `Promise.prototype.then`,
   `Promise.resolve` and `Promise.all`; ICU collation in `localeCompare`;
   relative-URL resolution in `URL`; `Map.prototype.size` throwing in strict
   mode; `insertAdjacentHTML` throwing a `DOMException` rather than a
   `SyntaxError`; and `Symbol.prototype.description` versus `String(symbol)`.
   Every one was found by the gate, not by review.

### UI smoke test

Run against the dev server in a **fresh tab** (the earlier tab's errors were
HMR context-identity churn from repeated edits, with mismatched `?t=` module
timestamps — not application errors).

- **Zero console errors** on a fresh tab.
- 213 cards render; the count derives from real data.
- 26 category tabs present; filtering to Array gives 35, then page search for
  `sort` narrows to `Array.prototype.sort()` and `Array.prototype.toSorted()`.
- Detail route renders all sections in the intended order: summary, syntax,
  parameters, returns, throws, behaviour, examples, caveats, common mistakes,
  related APIs, learn-this-properly.
- Mutation, category and environment badges render.
- Related-API links and lesson links resolve.
- `Document.querySelector()`'s example **executes in the real browser sandbox**
  and prints its documented output.
- `fetch()` correctly shows **no Run button**, being illustrative.
- Zero raw `` ` `` or `**` markers anywhere on the list or detail pages.
- Global search returns a reference hit for every required term: `map`,
  `Promise.all`, `querySelector`, `fetch`, `localStorage`, `Object.entries`,
  `addEventListener`, `reduce`, `filter`, `Map`, `Set`, `structuredClone`,
  `RegExp`, `Date`, `JSON.parse`, `AbortController`, `array map`, `spread`.

### Known limitations

- **`Math.random()` and `Date.now()`** cannot have reproducible documented
  output. Their examples assert *properties* (range, type, monotonicity) rather
  than values.
- **`Date` local-time getters** are timezone-dependent, so every Date example
  uses `Date.UTC` construction and `getUTC*` readers. The local/UTC distinction
  is explained in prose instead of being asserted.
- **`localeCompare` and `toLocaleString`** depend on the engine's ICU data;
  examples pin the locale and avoid orderings that vary between ICU versions.
- **`innerText`** is `undefined` in jsdom, so its example is illustrative even
  though it works in every real browser.
- **This project's sandbox console implements a subset** — `console.count` and
  `console.assert` produce no output there, which the entry states.

## Next product phase

Curriculum, challenges, projects, the interview bank and the reference are
complete. The product is not. Remaining content areas, in the order the original
specification gives:

1. ~~Coding Challenges library~~ — **done: 171 challenges**
2. ~~30+ Projects~~ — **done: 31 projects**
3. ~~250+ Interview Question Bank~~ — **done: 312 questions**
4. ~~JavaScript Reference~~ — **done: 213 entries**
5. **Cheat Sheets** — the next item to start
6. **Placement assessment completeness**
7. **Product-wide cross-link validation** — in particular, once the reference
   and interview bank exist, revisit `relatedChallenges`/`relatedLessons`
   density on projects and add reciprocal links (e.g. a challenge linking back
   to the project that uses it) if that turns out to help navigation
8. **Final product QA**

The audit reports `Cheat sheets` as `0`, which is the honest current state.
`Projects` reports `31`, `Interview questions` reports `312` and `Reference
entries` reports `213`.

**Starting the cheat sheets:** the infrastructure is almost certainly already
there and unpopulated, as it was for the previous four phases. `validateCheatSheet`
already exists in `src/content/schema/validate.js`, the registry already globs
`./cheat-sheets/**/*.js`, the manifest already emits a `cheatSheets` array with an
`entryCount`, and the audit already counts them. Populate and minimally extend
before considering any new tooling — and run the duplicate check **before** each
batch, not after, which is the lesson the interview phase paid for twice.

## Two defects fixed in the challenge phase

Both were found by using the feature rather than by reading the code, which is
the argument for verifying in the browser rather than trusting the verifier
alone.

1. **`ChallengeDetail` dropped `needsDom` and `html`** when calling `runCode`.
   Every DOM challenge would have passed `content:verify` (which reads
   `needsDom` correctly) and then failed for real learners, because the browser
   ran them in the DOM-less Web Worker. Confirmed by running one challenge both
   ways in the live app: 10/10 with the fix, 0 passing without it.
2. **`ChallengeDetail` rendered prompts as plain text**, so authored `` `code` ``
   and `**bold**` appeared as raw markup. The app already had `InlineMarkup`
   for exactly this and every lesson surface used it; the challenge page simply
   did not. Now wired into the prompt, constraints, hints and solution
   explanation.

No other UI work was done, and no engine was replaced — the existing sandbox,
registry, manifest and verifier all supported challenges already and needed no
changes.

## Defects fixed in the project phase

1. **`npm run lint` was not linting `.jsx` at all** — see the callout in
   "Status summary" above. This was found before authoring most of the
   project content, specifically because touching `Projects.jsx` and
   `ProjectDetail.jsx` surfaced a pre-existing unused import that the "lint:
   PASS" gate had never once caught. Fixed the script, then fixed every error
   the corrected script surfaced across the whole codebase (23 errors, 1
   warning, 13 files) — not just the two files this phase touched.
2. **Two challenge reference-solution bugs found by `content:verify`, not
   guessed**: `ch-async-promisify`'s hidden test assumed `0` in the
   error-first callback slot meant success, which contradicted the solution
   as specified — the test was wrong, not the solution; corrected the test
   and the explanation to say plainly that this is a real ambiguity in the
   error-first convention (Node's own `util.promisify` disagrees). And
   `ch-sec-rate-limit`'s `TokenBucket` accumulated floating-point drift
   across many small refills because it updated `#lastUpdate` on every call
   instead of only on a successful consume — fixed by computing available
   tokens from a fixed reference point each time, and rewrote the
   explanation to describe the actual accumulation bug rather than a vaguer
   "keep it fractional" claim.

No project-authoring session should assume `content:verify` passing means the
UI is correct, or that "0 errors" from a gate means that gate is actually
checking the files just written — both assumptions were false at some point
in this project's history and cost real time to discover. Verify gates
against a change you can observe them catching, at least once per phase.

## Async & timer verification — resolved in an earlier session

This was the open question at the start of the session. Resolved with the smallest
change that keeps verification honest; **read this before authoring async content**.

- **The browser sandbox now supports async tests and async examples.**
  `src/services/sandbox/runtime.js` `execute()` previously ran fully synchronously,
  so a test body returning a promise was recorded as **passed the instant it
  started** — a false green check that made graded Promise exercises impossible.
  Now: test bodies are wrapped in `async function`, `__run` collects returned
  thenables, and `execute()` returns a promise when any async work is outstanding.
  Both hosts (`WORKER_SOURCE`, `FRAME_SOURCE`) wrap the result in
  `Promise.resolve(...).then(...)`. The frame host reads `innerHTML` **after**
  settling, so DOM mutations from async code are captured.
- **Timers are wrapped inside the sandbox.** `execute()` injects its own
  `setTimeout`/`clearTimeout`/`setInterval`/`clearInterval` so it can (a) know
  whether async work is still outstanding, and (b) **tear down anything the code
  leaves behind** — notably an uncleared `setInterval`, which would otherwise run
  for the page's lifetime. Draining is bounded by the run's existing deadline, so a
  runaway interval cannot stall the host.
- **A non-callable timer handler is a no-op, not a throw.** Browsers stringify a
  non-function handler (harmless); Node throws `ERR_INVALID_ARG_TYPE`. Both the
  runtime and `verify-examples.mjs` now return `-1` without scheduling, so an
  example demonstrating the `setTimeout(fn(), 0)` mistake behaves as a learner
  sees it rather than crashing the verifier.
- **`verify-examples.mjs` drains async examples.** `setTimeout`/`setInterval` are
  **no longer skipped**. Code matching
  `/setTimeout|setInterval|queueMicrotask|Promise|async|await|\.then\(/` runs with
  wrapped timers, then drains: microtasks first, then macrotask ticks while timers
  remain, bounded by `ASYNC_BUDGET_MS` (2000). **If the budget is exhausted the
  example is reported as a failure**, never silently passed — "asynchronous work
  did not settle" is an honest failure message.
- **`verify-solutions.mjs` awaits async tests.** Same `async function` wrapper and
  thenable collection as the runtime, plus a 2000ms `Promise.race` guard so a test
  awaiting something that never settles is **reported**, not hung (a hang is
  indistinguishable from a pass otherwise). Verified by probe that this genuinely
  detects failed assertions, rejections **and** never-settling promises.
- Regression checked at every step: all 530 pre-existing examples and 1296
  pre-existing assertions passed unchanged after these edits.

### Never assert elapsed time

Timers guarantee a **minimum** delay only. Module 25 originally had examples and
tests asserting `Date.now()` deltas; one failed immediately under verifier load
(concurrent measured slower than sequential), which is exactly the flakiness the
content itself warns about. **All timing assertions were replaced with
`start`/`end` event-ordering assertions**, which are fully deterministic:

- sequential produces `A start -> A end -> B start -> B end`
- concurrent produces `A start -> B start -> A end -> B end`

This is both more robust **and** better pedagogy — it shows the overlap directly
rather than inferring it from a number. There are now **zero** `Date.now()`
assertions in authored content. Keep it that way.

## DOM & event verification — how it actually works

Stable across sessions; unchanged this session.

- **`verify-solutions.mjs` and `verify-examples.mjs`** use `jsdom` for any code
  referencing `document`/`window`. They inject the `html` field into a
  `<div id="app">` container — matching `FRAME_SOURCE` — then execute via
  **`dom.window.eval(...)`**, not `new Function(...)` with document/window as
  parameters. Only `dom.window`'s own realm puts every DOM global (`HTMLElement`,
  `NodeList`, `MouseEvent`, `KeyboardEvent`, `CustomEvent`, `FormData`) in scope.
  `new JSDOM(...)` **must** use `runScripts: 'dangerously'` or `window.eval` is a
  silent no-op, and `url: 'http://localhost/'` or relative URLs will not resolve.
- **`html` is injected *inside* `<div id="app">`.** Never use `id="app"` in an
  `html` field — it creates a nested duplicate id and `getElementById` returns the
  outer wrapper, silently changing child counts. Use `host` or `root`.
- **Every DOM-touching runnable `CODE` section must set `needsDom: true`** plus an
  `html` string. `validate.js` **enforces** this: a `runnable` section matching
  `/\bdocument\b|\bwindow\b/` without `needsDom: true` is an audit error.
- **jsdom fully supports the event model and forms** — verified by probe before
  Modules 19 and 20. No verifier extension was needed for either.

## jsdom and sandbox limitations — do not write dishonest tests against these

- **`innerText`** is always `undefined` in jsdom (no layout engine). Skipped by
  `shouldSkip` in `verify-examples.mjs`; the example stays runnable for real users.
- **`localStorage`** is skipped, and this is deliberate even though jsdom
  *supports* it — see the Module 27 note above. Neither learner sandbox can run it,
  so verifying it here would produce a green check for code that fails on Run.
- **A call to the global `fetch`** is skipped, so verification never touches the
  network. The test is for an actual call (`/\bfetch\s*\(/`), not the bare word, so
  prose mentioning fetch in a comment does not silently drop a verifiable example
  into the skipped pile. An example that **defines its own** `fetch` shadows the
  global and is therefore run — that is how Module 26 verifies fetch behaviour
  offline. Real URLs may appear in illustrative, non-runnable code only.
- **Not available in jsdom**: `IntersectionObserver`, `requestAnimationFrame`,
  `navigator.clipboard`, `Worker`. Examples using these must be illustrative.
  **Available and genuinely verified**: `MutationObserver`, `history`, `location`,
  `URL`, `URLSearchParams`, `Response`, `Headers`, `AbortController`.
- **No layout**: never assert dimensions, visibility, or computed layout.

## Authoring gotchas worth carrying forward

- **Never hand-write a documented `output`.** Run `content:examples` and paste what
  it reports. This caught real defects in nearly every module, including several
  cases where **my prose was factually wrong about the sandbox** — Module 22
  claimed the console shows only `console.log`, but it renders `warn`, `error`,
  `table` and `group` too. The verifier is the source of truth, not intuition.
- **Microtask ordering between *independent* chains is not intuitive.** Returning a
  promise from `.then` costs extra microtask ticks (thenable adoption), so a chain
  that returns a promise can finish behind one that throws. Module 24 documents
  this and tells learners not to rely on cross-chain ordering. Within a single
  chain, ordering is fully deterministic.
- **A `return` inside `finally` overrides a pending `return` *and* discards a
  pending throw.** I documented this backwards first time; the verifier caught it.
- **Never use `.replace()` on a documented output string** to patch a value. Write
  the literal. This crept in repeatedly and is caught by review, not tooling —
  `grep -n "'.*'\.replace(" <file>` after writing a module is a fast check.
- **A bare apostrophe in a single-quoted JS string must be `\'`, never `\\'`.**
  The latter closes the string early. Fast check after writing any module:
  `node --input-type=module -e "import('./path/lessons.js').then(m=>console.log(m.default.length))"`
- **`relatedLessons`/`prerequisites` may only reference lessons that already
  exist.** Forward-referencing an unauthored module fails both audit and tests.
- **The placeholder detector rejects the word "placeholder"** (and TODO, TBD,
  FIXME, "coming soon", "sample content"). Module 18 tripped it with template
  markup reading "Placeholder name" — use "Sample heading" or similar.
- **DOM_TASK tests share one document and run sequentially with no reset.** A test
  calling a *flipping* toggle must account for what the previous test left behind.
  Prefer forced-state operations, or reset the container's `innerHTML` at the start
  of each test body — Modules 18, 19 and 20 all needed this.
- **An exercise's `solution` replaces `starterCode` entirely.** If the starter
  includes "already present — do not modify" setup code, the solution must repeat
  it, or that setup never runs. Three Module 19 exercises failed on this.
- **Beware vacuous tests.** One Module 24 test read
  `expect(true).toBe(true)` after a malformed assertion — it passed while checking
  nothing. Read each test body and ask what would make it fail.
- **Locale-dependent output needs a pinned locale**; `en-GB` formatting `USD` gives
  `"US$1,234.50"`, not `"$1,234.50"`.
- **Timezone-dependent output must be avoided entirely** — build `Date`s from local
  components and read with local getters, or pin `timeZone: 'UTC'` in `Intl`.
- **Do not invent floating-point artefacts.** Module 29 documented
  `30 * 1.1` as `33.000000000000004`; it is exactly `33`. `0.1 + 0.2` is the case
  that misbehaves, and not every multiplication does. Check in `node -e` first.
- **`MutationObserver` records are one callback with *separate* records** — an add
  and a remove in the same turn arrive together but are **not** merged, so a
  callback pushing per record sees 2, not 1. Also, assigning `textContent` reports
  **`childList`**, not `characterData`, because it replaces the child nodes.
- **Observer tests must use freshly created elements**, not the shared `#app`
  document. Solution tests run their synchronous bodies before any microtask
  drains, so several live observers on one node all see each other's mutations —
  Module 27 saw counts of 6 and 5 where 1 and 2 were expected.
  `document.createElement("ul")` works fine as an observe target.
- **The sandbox `expect` has no `.resolves`/`.rejects` matchers.** Await the
  promise yourself and assert on the value, or attach `.catch` and assert a flag.
- **In strict mode, writing a property to a primitive THROWS.** Module 30 first
  documented `text.custom = "x"` as a silent no-op; that is sloppy-mode behaviour
  only. Strict mode raises a `TypeError`. The same asymmetry applies to `delete` on
  a non-configurable property — Module 36 had it wrong the same way. When
  documenting a failure, check *which mode* produces which outcome.
- **Do not invent an example's own arithmetic.** Module 37 documented
  `2 * 3 * 10` as `80`. The verifier catches these, but only if the block is
  runnable — check any arithmetic written into an illustrative block by hand.
- **When an example logs an object that already has properties, count them.**
  Two Module 36 outputs assumed a fresh object where the code started from
  `{ name: "app" }`, and one logged `Reflect.ownKeys` *before* the line that added
  the key it expected to see. Read the code top-down before writing the output.
- **A consumer that decides after looking overshoots by one.** `take(gen, 5)` pulls
  **6** values, because the sixth must be produced before the count can be checked.
  Module 35 documents this deliberately; it matters whenever producing a value is
  expensive or effectful.
- **Never write a deliberately-broken example you then correct.** A draft of
  Module 32 lesson 4 did this and the accompanying callout contradicted itself.
  Show the correct pattern, and describe the failure mode in prose.
- **Non-English characters creep into string literals.** A stray `環境` reached a
  Module 32 output. Fast check: `grep -nP "[^\x00-\x7F]" <file>` will also match
  legitimate em-dashes and arrows, so scan rather than delete blindly.
- **A `PREDICT_OUTPUT` exercise is not a quiz question.** It needs `hints`,
  `solution` and `solutionExplanation`; writing `explanation` instead produces
  three audit errors. This was made twice, in Modules 38 and 46.
- **`shouldSkip` matches bare tokens, including inside comments and strings.**
  A prose comment mentioning `fetch`, or a log label containing `localStorage`,
  silently drops a perfectly verifiable example into the skipped pile. The
  `fetch` test was tightened to `/\bfetch\s*\(/` for this reason; `localStorage`
  and `innerText` still match the bare word, so rename the label instead.
- **The validator's `needsDom` check also matches bare tokens.** A local variable
  named `window`, or the word in a comment, triggers "uses document/window but
  does not set needsDom". Rename — `window` is a poor variable name regardless.
- **Solution tests share one jsdom document and run their synchronous bodies
  before any microtask drains.** Mounting a listener on a shared element in each
  test **accumulates listeners**, so one click fires several handlers; several
  live observers on one node all see each other's mutations. Build a fresh
  element per test: `document.createElement("div")` with `innerHTML` set.
- **Wall-clock waits in tests are flaky under load.** Nine Module 23 tests used
  `setTimeout(r, 40)` and failed once when a heavy Module 38 test ran alongside
  them. Presence assertions were converted to condition polling with a generous
  deadline; absence assertions must still wait, since absence cannot be polled.
- **Check which mode produces which failure.** Strict and sloppy differ for
  writes to primitives (throws vs silent), `delete` on a non-configurable
  property (throws vs `false`), and default `this`. Both were documented
  backwards once each.
- **`new URL(x, base)` rarely throws.** With a base supplied, odd input like
  `":::"` resolves as a *relative path* rather than failing, so a `catch` fires
  far less often than expected — the scheme **allowlist** does the real work.
- **Console formatting is not reproducible here.** `console.table`, `group` and
  `count` render richly in a browser and as plain lines in this sandbox
  (`count` is a no-op). An example whose point is the rendering must be
  illustrative, and should say why.

## Verification commands

Run all of these after any content change.

```bash
npm run content:audit     # schema, references, placeholders, duplicates, real counts
npm run content:verify    # every reference solution (sync, DOM and async) run against its tests
npm run content:examples  # every runnable example (sync, DOM, timer, promise) executed and compared
npm run test              # engine unit tests + content invariants across all modules
npm run lint
npm run build
```

No separate async-verification command was added — extending the two existing
verifiers was the smaller and more honest solution, since it keeps a single source
of truth for what "verified" means.

## Continuation instruction

**The curriculum, the challenge library, the project library and the interview
bank are all finished.** Do not add modules — `modules.js` defines 47 and all
47 have lessons. Do not add challenges to reach a number; 171 exist against a
target of 150+. Do not add projects to reach a number; 31 exist against a
target of 30+. Do not add interview questions to reach a number; 312 exist
against a target of 250+, every type target is met, and 40 output questions are
machine-verified. The next work is the **JavaScript Reference**, the next item
in "Next product phase" above.

Before starting it, read `docs/CONTENT-AUTHORING.md` and check how reference
entries are modelled in `src/content/schema/types.js` and what `validate.js`'s
`validateReference` already requires of them. **The pattern has now held four
times in a row**: for challenges, projects and interview questions, the schema,
the loader bucket, the manifest field, the registry glob, the audit counter and
the UI page all already existed and were simply unpopulated at 0. `validate.js`
already exports `validateReference` and `validateCheatSheet`, and the audit
already counts both. **Check before building anything** — the correct move has
consistently been to populate and extend, never to create a second engine.

The interview UI needed only two changes across the whole phase, both bug fixes
rather than redesign: `InterviewAnswer.jsx` had the plain-text-rendering defect
(fixed before authoring), `InterviewPrep.jsx` had the same defect in its list
cards (found by the browser smoke test, fixed after), plus a `whitespace-pre-wrap`
on option spans so multi-line expected output renders on separate lines, and one
`Tabs` row added for the question-type filter using the existing component. The
schema gained `INTERVIEW_KIND` and `INTERVIEW_LEVEL` enums so a typo becomes an
audit error instead of a question that vanishes from every filter.

Everything in "Authoring gotchas worth carrying forward" still applies. The most
expensive habits to relearn:

- **Never hand-write a documented `output` or a hand-computed expectation.** Run
  the verifier and paste what it reports. In the challenge phase this caught a
  wrong `movingAverage` average, a wrong `twoSum` tie-break, a `sumDigits`-style
  arithmetic slip, and a `safeFileName` expectation that did not match the
  algorithm actually specified.
- **A failing test may mean the test is wrong, not the solution.** Several
  failures in this phase were my expectation contradicting my own stated
  contract. Decide which is right, fix that one, and make the prompt say so.
- **Check the app, not just the verifier.** The `needsDom` defect passed every
  gate and would have shipped broken. Run the dev server and exercise the real
  path.
- **Verify claims about JavaScript semantics before writing them down.** Leaving
  a `for...of` early *closes* the generator; `Math.round` breaks .5 ties toward
  positive infinity; `%` keeps the sign of its left operand; accumulating
  `0.1` ten times is not `1`. Each of these was a test that failed until the
  claim was checked.
- **Dump every existing prompt and read it before authoring a new batch.** The
  interview phase authored 34 renamed duplicates because later batches were
  written without re-reading the earlier files, and the exact-match audit check
  caught none of them. A one-off token-overlap script over all prompts is enough
  to find them; run it *before* the batch, not after.
- **`InlineMarkup` supports only `` `code` ``, `**bold**` and `[text](url)`.**
  Single-asterisk italics render as literal asterisks. Run the italics→bold
  regex over every content file after writing it, and confirm in the browser
  that no raw markers appear — a list view and a detail view can render the same
  field differently, which is exactly how the `InterviewPrep` defect survived.
- **Grep for stray `.replace(` in outputs** after writing any file.
- **The verifier's `shouldSkip` matches the bare tokens `localStorage` and
  `innerText`, and a `fetch(` call.** A prose comment or a string label
  containing one of those will silently drop a runnable example into the skipped
  pile. The validator's `needsDom` check similarly matches a bare `window`
  token, so do not name a variable `window`.
- **Solution tests share one jsdom document and run their synchronous bodies
  before microtasks drain.** Build a fresh element per test when mounting
  listeners or observers, or listeners accumulate and observers see each other's
  mutations.

Run all six gates before finishing any session:

```bash
npm run content:audit && npm run content:verify && npm run content:examples && npm run test && npm run lint && npm run build
```

`content:audit` **passes globally**. Any non-zero exit is a real failure — the
old "expected errors from empty modules" caveat no longer applies.
