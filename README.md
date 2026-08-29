# JSPath

A free, structured JavaScript learning platform: a path from *never written code* to
professional JavaScript, with lessons that teach rather than define, exercises that
check your work in a real sandbox, and interview preparation that expects you to
explain yourself.

> **Build status — read this first.** The application is complete and working.
> **Curriculum authoring is in progress**: 8 of 47 modules are authored to the full
> quality bar. `npm run content:audit` deliberately **fails** until every module has
> real lessons, and it reports true counts computed from the content itself.
> See [Current state](#current-state) and `docs/CONTENT-PROGRESS.md`.

## Key features

- **47-module curriculum spine** — orientation → fundamentals → DOM → async →
  advanced → professional → interview, in a deliberate teaching order.
- **Real code execution.** Every runnable example, exercise and challenge runs in a
  sandboxed Web Worker (or a null-origin iframe for DOM tasks). Infinite loops are
  interrupted by an injected guard *and* a terminate-based timeout — they cannot
  freeze the tab. `eval()` is never called in the parent window.
- **Exercise engine with progressive feedback.** Per-assertion results, then a
  conceptual hint, then a stronger hint, then the worked solution — only when asked.
  It never just says "Wrong."
- **Quiz engine with distractor rationales.** Every answer carries an explanation;
  wrong options explain why they are wrong.
- **Evidence-based mastery.** Clicking "complete" can never reach *Mastered*. Topic
  scores combine lesson coverage, solved exercises (weighted by attempts), quiz
  accuracy and challenges, and decay after three weeks of neglect. The calculation is
  shown to the learner on **My Learning**.
- **Guest mode as a first-class citizen.** Everything works with no account, saved to
  `localStorage`. Signing in *merges* guest progress into the account — the merge
  keeps the better outcome for every item, so nothing earned is ever lost.
- **Deterministic recommendations.** No fake AI tutor. Every suggestion carries the
  reason it was made, derived from your own results.
- **⌘K global search** across every content type, built from the manifest.
- **Dark and light themes**, WCAG-conscious contrast, keyboard navigation,
  reduce-motion support.

## Stack

React 18 · Vite 5 · React Router 6 · Tailwind CSS 3 · Monaco Editor (lazy, with a
textarea fallback) · Supabase (optional) · Vitest + Testing Library.

The application is written in JavaScript, not TypeScript — content integrity is
enforced by runtime schema validation and the content audit instead.

## Getting started

```bash
npm install
npm run dev
```

`predev` regenerates the content manifest, so it can never be stale.

If `npm install` reports blocked install scripts, approve esbuild's postinstall:

```bash
npm approve-scripts esbuild
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (regenerates the manifest first) |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | ESLint, zero warnings tolerated |
| `npm run test` | Vitest |
| `npm run content:audit` | Validate all content, check every reference, report real counts |
| `npm run content:verify` | Execute every exercise's reference solution against its own tests |
| `npm run content:examples` | Execute every runnable example and compare its documented output |
| `npm run content:manifest` | Regenerate `src/content/generated/manifest.json` |

The last two exist because two classes of defect are otherwise invisible: an exercise
whose assertions no correct answer could satisfy, and a documented output that differs
from what the sandbox actually prints. Both caught real errors on their first run.

## Environment variables

Supabase is entirely optional. With no `.env`, the app runs in guest mode and every
learning feature works.

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [`docs/SUPABASE.md`](docs/SUPABASE.md) for the schema and row-level security
policies.

## Project structure

```
src/
  app/           router + providers
  components/    ui/ code/ learning/ feedback/ viz/
  layouts/       AppShell, AuthLayout, FocusLayout
  pages/         one component per route (32)
  features/      progress mastery achievements exercises quizzes search interview
  content/       schema/ curriculum/ challenges/ projects/ interview/
                 references/ cheat-sheets/ generated/
  services/      storage, supabase, sandbox
  state/         Theme, Auth, UserState, Toast providers
  tests/
docs/            ARCHITECTURE.md, LEARNING-MODEL.md, CONTENT-AUTHORING.md, SUPABASE.md
scripts/         content-audit.mjs, generate-manifest.mjs
```

## Content architecture

Content is **plain data**, never JSX, and never embedded in a page component. Authored
files live under `src/content/**`; two tools consume them:

- `scripts/generate-manifest.mjs` produces a small metadata manifest that every list
  screen imports statically — so the curriculum, dashboard and search render instantly
  without pulling a single lesson body into the bundle.
- `scripts/content-audit.mjs` validates everything and prints real counts.

Full lesson bodies live in per-module chunks loaded on demand. Adding all 47 modules
therefore does not grow the initial bundle.

**Single source of truth:** modules declare metadata only. A module's `lessonIds` is
*derived* from the lessons that claim `moduleId`, so the curriculum screen always shows
real counts — never the numbers from the design mockup.

See [`docs/CONTENT-AUTHORING.md`](docs/CONTENT-AUTHORING.md) to add a module.

## The content audit

```bash
npm run content:audit
```

Exits non-zero on: a module with no lessons, a lesson with no teaching content, a
lesson under 400 characters of explanatory prose, a broken lesson/module/topic/exercise
reference, a duplicate id or slug, a quiz question without a correct answer or
explanation, an exercise without tests, and any placeholder pattern (`TODO`,
`Coming soon`, `Lorem ipsum`, `Placeholder`, …). It also warns on duplicated
descriptions and repeated quiz prompts, which is what padded filler looks like.

## Current state

Quality gates, as of this build:

| Gate | Status |
| --- | --- |
| `npm run build` | **passes** |
| `npm run lint` | **passes** (0 warnings) |
| `npm run test` | **passes** (41 tests) |
| `npm run content:verify` | **passes** (63 solutions, 397 assertions) |
| `npm run content:examples` | **passes** (139 runnable examples) |
| `npm run content:audit` | **fails — by design**, 78 errors: 39 modules have no lessons yet |

What is **done**:

- The full application: 32 routes, all Stitch screens, responsive shell, dark/light
  themes, error boundaries, empty and loading states.
- All engines: sandbox, exercise engine, quiz engine, progress, mastery, XP, streaks,
  achievements, recommendations, mistake review, search, guest→account migration.
- The content pipeline: schemas, validation, manifest generation, and three
  independent verification tools.
- **Modules 00–07 fully authored**: 42 lessons, 184 worked examples, 130 exercises,
  139 quiz questions, roughly 10 hours of material. Every module passes with zero
  errors and zero warnings of its own.

What is **not done**:

- Modules 08–46 have metadata but no lessons.
- Challenges, projects, interview questions, reference entries and cheat sheets are
  empty collections. Their screens work and show honest empty states.

[`docs/CONTENT-PROGRESS.md`](docs/CONTENT-PROGRESS.md) tracks exactly where authoring
stopped and what comes next. The audit output is the authoritative count at any time;
nothing in the UI reports a number that is not computed from real content.
