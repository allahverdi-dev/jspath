# JSPath — Implementation Audit & Architecture

## 1. Stitch export audit

Two exports were supplied. They are **complementary, not duplicates** — together they
cover 20 screens plus the shared design system.

| Export | Screens |
| --- | --- |
| `stitch_jspath_mastery_roadmap.zip` | challenges, cheat_sheets, dashboard_mobile, interview_prep, lesson_mobile, login, onboarding_goals, onboarding_level, playground, practice_hub, profile_achievements, projects, search, settings, sign_up, cheat-sheet preview art |
| `stitch_jspath_mastery_roadmap (1).zip` | array.map lesson, curriculum, dashboard, jspath_master_javascript (landing), jspath_logo, developer headshot art |
| Both | `jspath_core/DESIGN.md` — **byte-identical in both exports** |

Each screen ships as `code.html` (Tailwind CDN + a `tailwind.config` block) plus a
`screen.png` render.

### Screen → route map

| Stitch screen | Route | Notes |
| --- | --- | --- |
| `jspath_master_javascript` | `/` | Marketing landing |
| `dashboard_jspath` | `/dashboard` | Desktop |
| `dashboard_mobile_jspath` | `/dashboard` | Same route, responsive |
| `curriculum_jspath` | `/curriculum` | Module list + progress rail |
| `array.map_learn_javascript` | `/learn/:moduleSlug/:lessonSlug` | Generalised lesson renderer |
| `lesson_mobile_jspath` | same | Responsive variant |
| `practice_hub_jspath` | `/practice` | |
| `challenges_jspath` | `/challenges`, `/challenges/:slug` | |
| `projects_jspath` | `/projects`, `/projects/:slug` | |
| `playground_jspath` | `/playground` | |
| `interview_prep_jspath` | `/interview`, `/interview/session` | |
| `profile_achievements_jspath` | `/profile`, `/achievements` | |
| `cheat_sheets_jspath` | `/cheat-sheets`, `/cheat-sheets/:slug` | |
| `search_jspath` | `/search` + ⌘K overlay | |
| `settings_jspath` | `/settings` | |
| `login_jspath` | `/login` | |
| `sign_up_jspath` | `/signup` | |
| `onboarding_level_jspath` | `/onboarding/level` | |
| `onboarding_goals_jspath` | `/onboarding/goals` | |
| — | `/reference`, `/reference/:slug` | Required by the sidebar; no Stitch screen supplied, built to the same system |
| — | `/bookmarks`, `/my-learning`, `*` (404) | Same |

The sidebar in every export links to `reference`, `my-learning` and `bookmarks`,
which have no corresponding Stitch screen. They are built from the same design
primitives rather than invented in a new style.

## 2. Design system decision (recorded deliberately)

`DESIGN.md` contains two descriptions of the palette that do not agree:

- The **YAML frontmatter** is a mechanical Material-3 token dump: `primary: #fffaef`
  (near-white), `surface: #131313`, `outline-variant: #4b4732` (olive).
- The **prose** is the authored design intent: *"The JavaScript Yellow (`#F7DF1E`)
  is the 'hero' color"*, *"Primary: Background `#F7DF1E`, Text `#0A0A0A`"*,
  *"Level 0 `#0A0A0A`, Level 1 `#171717`, Borders `#262626`"*, *"Progress bars:
  track `#262626`, fill `#F7DF1E`"*.

The exported HTML follows the frontmatter, which is why the rendered screenshots are
almost entirely monochrome and the yellow appears only in the logo mark.

**Decision:** token **names** come from the Stitch export (so exported markup maps
1:1 onto our components); token **values** come from the prose. This is the reading
that satisfies every explicit instruction in `DESIGN.md` and in the brief, and it
restores the brand accent the frontmatter had flattened away.

Implementation: `src/styles/tokens.css` defines every token as an `R G B` triplet on
`:root`/`.dark` and `.light`; `tailwind.config.js` maps each name through
`rgb(var(--c-name) / <alpha-value>)` so opacity modifiers such as `bg-primary/10`
keep working and a theme swap is one class on `<html>`.

Two tokens were added that the export lacked:

- `primary-ink` — the accent used **as text**. `#F7DF1E` on white fails contrast, so
  light mode resolves it to `#7A6B00` (4.7:1) while dark mode keeps the yellow.
- `success` / `warning` / `info` families — `DESIGN.md` calls for semantic feedback
  colours but the frontmatter only shipped `error`.

Other fidelity fixes to the export: `w-[sidebar-width]` / `pl-[sidebar-width]` are
invalid Tailwind arbitrary values (they render as `0`, which is why the sidebar
overlaps the content in the supplied screenshots). These become real `spacing` scale
entries.

## 3. Architecture

```
src/
  app/           router, providers, error boundaries
  components/    ui/ code/ curriculum/ learning/ feedback/ navigation/ viz/
  layouts/       AppShell (sidebar+header), FocusLayout, AuthLayout
  pages/         one component per route
  features/      auth onboarding curriculum lessons practice quizzes challenges
                 projects playground progress mastery achievements bookmarks
                 search interview reference cheat-sheets profile settings
  content/       schema/ curriculum/ challenges/ projects/ interview/
                 references/ cheat-sheets/ generated/
  services/      storage, supabase, sandbox (code execution)
  state/         React context stores built on the pure engines
  utils/         pure helpers
  tests/         setup + cross-cutting tests
```

### Content pipeline

Content is **plain data**, never JSX, and never embedded in a page component.

```
src/content/**/*.js
        │
        ├── scripts/lib/load-content.mjs   (node: filesystem walk + import)
        │        │
        │        ├── scripts/generate-manifest.mjs → src/content/generated/manifest.json
        │        └── scripts/content-audit.mjs     → validation + real counts
        │
        └── src/content/registry.js  (app: manifest for metadata,
                                      import.meta.glob for lazy bodies)
```

The manifest is what makes this scale. Every screen that needs *titles, counts and
relationships* (curriculum, dashboard, search, practice hub) reads the manifest,
which is small and statically imported. Full lesson bodies live in per-module chunks
loaded on demand, so the initial bundle never carries the whole curriculum.

`predev` and `prebuild` regenerate the manifest, so it cannot go stale.

**Single source of truth for structure:** modules declare metadata only. A module's
`lessonIds` is *derived* from the lessons that claim `moduleId`. The two can never
drift, and the curriculum screen therefore always shows real counts — never the
numbers that appeared in the Stitch mockup.

### Mastery vs. modules

Modules organise *teaching order*. **Topics** (`src/content/topics.js`, 59 of them)
are the unit of *mastery* and cut across modules, so a closure question inside the
event-loop module still feeds the learner's "closures" score. Every lesson,
exercise, quiz question, challenge, project and interview question declares
`topicIds`, and the audit fails on unknown ids.

### Progress, mastery and XP

All progression logic lives in pure functions under `src/features/*/`, with React
context as a thin wrapper. This keeps the rules testable without rendering and
prevents the formula-duplicated-across-components problem.

Mastery is **evidence-based**: marking a lesson complete alone can never reach
`Mastered`. See `docs/LEARNING-MODEL.md`.

### Code execution

User code runs in a sandboxed `<iframe>` (`sandbox="allow-scripts"`, no
`allow-same-origin`), so it has a null origin and cannot touch the parent document,
cookies or storage. Communication is `postMessage` only. An instruction-counter is
injected into loops to interrupt infinite loops, and every run has a wall-clock
timeout. `eval()` is never called in the parent window.

## 4. Quality gates

```
npm run dev            vite dev server (regenerates manifest first)
npm run build          production build (regenerates manifest first)
npm run lint           eslint, zero warnings tolerated
npm run test           vitest
npm run content:audit  schema validation, reference integrity,
                       placeholder detection, duplicate detection, real counts
```

`content:audit` exits non-zero on: a module with no lessons, a lesson with no
teaching content, a lesson under 400 characters of explanatory prose, a broken
lesson/module/topic/exercise reference, a duplicate id or slug, a quiz question
without a correct answer or explanation, an exercise without tests, and any
placeholder pattern (`TODO`, `Coming soon`, `Lorem ipsum`, `Placeholder`, …).
