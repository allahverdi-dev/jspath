<div align="center">

# JSPath

### Master JavaScript through structured learning, real practice, projects, challenges, and interview preparation.

A free and comprehensive JavaScript learning platform designed to take learners from their first line of code to advanced, professional JavaScript.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-jspath.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://jspath.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=000000)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)

<br />

**47 curriculum modules · 214 lessons · 810 exercises · 171 coding challenges · 31 projects**

[Live Demo](https://jspath.vercel.app) · [Getting Started](#getting-started) · [Architecture](#architecture) · [Project Status](#project-status)

</div>

---

## About JSPath

**JSPath** is a structured JavaScript learning platform built around one core idea:

> Learning JavaScript should mean understanding it, writing it, debugging it, applying it, and being able to explain it — not simply reading definitions.

The platform combines structured lessons, executable examples, interactive exercises, quizzes, coding challenges, guided projects, interview preparation, JavaScript reference material, progress tracking, and an in-browser coding environment.

JSPath is designed to support learners from absolute beginner level through advanced JavaScript topics while keeping the learning experience practical, measurable, and self-directed.

The entire learning experience can be used without creating an account.

### Live application

**https://jspath.vercel.app**

---

## Platform at a Glance

| Content | Current Count |
| --- | ---: |
| Curriculum modules | **47 / 47** |
| Lessons | **214** |
| Lesson sections | **3,808** |
| Worked code examples | **1,116** |
| Exercises | **810** |
| Quiz questions | **819** |
| Coding challenges | **171** |
| Guided projects | **31** |
| Interview questions | **312** |
| JavaScript reference entries | **213** |
| Reference-solution items | **569** |
| Reference-solution assertions | **4,561** |
| Audit errors | **0** |
| Audit warnings | **0** |

All counts are derived from the actual content system rather than hard-coded marketing numbers.

---

## Key Features

### Complete JavaScript Curriculum

JSPath contains a structured **47-module JavaScript curriculum** covering the learning path from orientation and fundamentals through DOM, asynchronous JavaScript, advanced concepts, professional development practices, and interview preparation.

The curriculum currently contains:

- 214 lessons
- 3,808 teaching sections
- 1,116 worked examples
- 810 exercises
- 819 quiz questions

Every module is authored and verified.

---

### Interactive Code Execution

Runnable examples and exercises execute directly inside the learning environment.

JSPath uses sandboxed execution rather than evaluating learner code directly inside the application window.

Depending on the task, execution happens inside:

- a sandboxed Web Worker
- a null-origin iframe for DOM exercises

Protection mechanisms include timeout handling and injected infinite-loop guards so learner code cannot permanently freeze the application.

---

### Exercise Engine

Exercises provide progressive learning support instead of simply reporting whether an answer is correct.

The exercise system supports:

- automated assertions
- per-test feedback
- attempt tracking
- conceptual hints
- stronger hints
- worked solutions
- reference-solution verification

Reference solutions are automatically executed against their own tests as part of the content verification pipeline.

---

### Quiz Engine

Quiz questions include explanations rather than only correct/incorrect states.

Incorrect alternatives can explain why they are wrong, helping quizzes reinforce conceptual understanding instead of functioning only as scoring mechanisms.

---

### Coding Challenges

JSPath currently includes **171 coding challenges** across multiple areas and difficulty levels.

Challenges cover subjects such as:

- fundamentals
- functions and closures
- arrays and collections
- objects and data shaping
- strings
- algorithms
- data structures
- asynchronous JavaScript
- DOM and events
- classes and OOP
- regex, dates, and numbers
- iterators and metaprogramming
- security and engineering
- advanced JavaScript patterns

Challenge tests focus on observable behavior rather than forcing one specific implementation.

Hidden tests are used for important edge cases.

---

### Guided Projects

The platform includes **31 guided JavaScript projects**, ranging from beginner exercises to advanced application architecture.

Examples include:

- Counter App
- Calculator
- Quiz Application
- Todo Application
- Expense Tracker
- Weather Application
- Recipe Finder
- Movie Search
- GitHub Profile Finder
- Kanban Board
- E-commerce Cart
- Finance Dashboard
- Project Management Workspace
- Async Request Dashboard
- Configurable Validation Engine

Projects include structured milestones, objectives, completion criteria, hints, related lessons, related challenges, and—in advanced projects—testing and architecture requirements.

---

### Interview Preparation

JSPath contains **312 JavaScript interview questions**.

The interview bank includes conceptual questions, technical reasoning, common mistakes, follow-up questions, and output-prediction exercises.

Output-prediction questions containing executable code are machine-verified so their documented answers remain consistent with actual JavaScript behavior.

---

### JavaScript Reference

The platform contains **213 canonical JavaScript, DOM, and Web API reference entries**.

Reference entries support:

- canonical titles
- aliases
- related entries
- related lessons
- code examples
- API descriptions
- searchable metadata

Reference examples that can execute inside the verification environment are automatically checked against their documented output.

---

### Interactive Code Playground

JSPath includes an integrated code playground powered by Monaco Editor.

The editor is loaded lazily so it does not unnecessarily increase the application's initial loading cost.

A textarea fallback is available when Monaco cannot be loaded.

---

### Guest Mode

Creating an account is not required.

Guest progress is stored locally using `localStorage`, allowing the core learning experience to work without a backend.

Supabase integration is optional.

When authentication is enabled, the architecture supports merging guest learning progress into an account without discarding stronger existing results.

---

### Progress and Mastery

The learning model tracks more than a simple "completed" checkbox.

Progress can incorporate evidence including:

- lesson coverage
- exercise performance
- number of attempts
- quiz accuracy
- challenge completion
- recent activity

The application also includes:

- XP
- streaks
- achievements
- mastery scoring
- learning recommendations
- mistake review
- progress statistics

---

### Search

Global search allows learners to navigate across multiple content types.

The search system is generated from the content manifest rather than loading every full lesson body into the initial application bundle.

Keyboard access is available through:

```text
⌘ K
```

or the corresponding platform shortcut.

---

### Dark and Light Themes

JSPath supports both dark and light themes.

The interface also considers:

- keyboard navigation
- accessible contrast
- focus visibility
- reduced-motion preferences
- responsive layouts

---

## Technology Stack

| Area | Technology |
| --- | --- |
| UI | React 18 |
| Build tool | Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 |
| Code editor | Monaco Editor |
| Backend / Auth | Supabase — optional |
| Testing | Vitest |
| Component testing | Testing Library |
| DOM test environment | jsdom |
| Linting | ESLint |
| Deployment | Vercel |
| Language | JavaScript |

JSPath is intentionally written in JavaScript rather than TypeScript.

Content integrity is enforced through runtime schemas, validation scripts, automated audits, executable examples, and automated test suites.

---

## Architecture

JSPath separates application behavior, learning systems, content, state management, execution services, and presentation.

High-level structure:

```text
src/
├── app/
│   └── routing and application providers
│
├── components/
│   ├── ui/
│   ├── code/
│   ├── learning/
│   ├── feedback/
│   └── viz/
│
├── layouts/
│   ├── AppShell
│   ├── AuthLayout
│   └── FocusLayout
│
├── pages/
│   └── route-level page components
│
├── features/
│   ├── progress
│   ├── mastery
│   ├── achievements
│   ├── exercises
│   ├── quizzes
│   ├── search
│   └── interview
│
├── content/
│   ├── schema/
│   ├── curriculum/
│   ├── challenges/
│   ├── projects/
│   ├── interview/
│   ├── references/
│   ├── cheat-sheets/
│   └── generated/
│
├── services/
│   ├── storage
│   ├── supabase
│   └── sandbox
│
├── state/
│   ├── Theme
│   ├── Auth
│   ├── UserState
│   └── Toast
│
└── tests/

docs/
├── ARCHITECTURE.md
├── CONTENT-AUTHORING.md
├── CONTENT-PROGRESS.md
├── LEARNING-MODEL.md
└── SUPABASE.md

scripts/
├── content-audit.mjs
├── generate-manifest.mjs
├── verify-examples.mjs
└── verify-solutions.mjs
```

For a deeper technical overview, see:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/LEARNING-MODEL.md`](docs/LEARNING-MODEL.md)
- [`docs/CONTENT-AUTHORING.md`](docs/CONTENT-AUTHORING.md)

---

## Content Architecture

Learning content is stored as structured data rather than being embedded directly into page components.

This separation makes it possible to independently validate, audit, search, test, and progressively load educational content.

### Content manifest

The manifest generator:

```bash
npm run content:manifest
```

creates the application's generated content metadata.

List pages can therefore load lightweight metadata without importing every complete lesson body into the initial JavaScript bundle.

Full lesson content is loaded when required.

### Single source of truth

Module metadata does not manually maintain duplicated lesson counts.

Relationships such as module lesson membership are derived from the content itself.

This prevents the UI from presenting statistics that do not reflect actual authored material.

---

## Quality Assurance

JSPath includes several independent quality gates.

Current status:

| Gate | Status |
| --- | --- |
| Production build | ✅ Pass |
| ESLint | ✅ Pass — zero warnings |
| Vitest | ✅ Pass |
| Content audit | ✅ Pass — zero errors |
| Content verification | ✅ Pass |
| Runnable example verification | ✅ Pass |

### Content Audit

Run:

```bash
npm run content:audit
```

The content audit validates issues including:

- missing lessons
- malformed content
- broken relationships
- duplicate IDs
- duplicate slugs
- invalid quiz definitions
- exercises without tests
- unresolved references
- placeholder content
- suspicious duplicated material

The current complete authored content passes with:

```text
0 errors
0 warnings
```

---

### Reference Solution Verification

Run:

```bash
npm run content:verify
```

Current verified totals:

```text
569 reference-solution items
4,561 assertions
0 failures
```

This ensures that official exercise and challenge solutions actually satisfy the tests presented by the platform.

---

### Example Verification

Run:

```bash
npm run content:examples
```

Runnable examples are executed and compared with their documented output.

Lesson examples, interview output-prediction questions, and supported reference examples are included in this verification process.

One known example is intentionally excluded from automated jsdom verification because `innerText` depends on browser layout behavior unavailable in jsdom.

The example remains valid in real browsers.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/allahverdi-dev/jspath.git
```

### 2. Enter the project directory

```bash
cd jspath
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite will start the local development environment.

The content manifest is regenerated automatically before the development server starts.

---

## Environment Variables

Supabase is optional.

JSPath works in guest mode without any `.env` file.

To enable Supabase integration, create:

```text
.env
```

and add:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For database structure and Row Level Security information, see:

[`docs/SUPABASE.md`](docs/SUPABASE.md)

Do not commit real environment credentials to the repository.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm run test` | Run the Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run content:manifest` | Regenerate the content manifest |
| `npm run content:audit` | Audit the entire content system |
| `npm run content:verify` | Verify reference solutions against their tests |
| `npm run content:examples` | Execute runnable examples and validate documented output |

---

## Development Checks

Before considering a change ready, run:

```bash
npm run lint
npm run test
npm run content:audit
npm run content:verify
npm run content:examples
npm run build
```

All six quality gates should pass.

---

## Deployment

The production application is deployed with **Vercel**.

Live application:

**https://jspath.vercel.app**

The repository's `main` branch is connected to Vercel.

New commits pushed to `main` trigger a new production deployment automatically.

SPA route fallback configuration is defined in:

```text
vercel.json
```

so React Router routes can be opened and refreshed directly without returning a server-side 404.

---

## Project Status

### Completed

- ✅ 47 / 47 JavaScript curriculum modules
- ✅ 214 lessons
- ✅ 810 exercises
- ✅ 819 quiz questions
- ✅ 171 coding challenges
- ✅ 31 guided projects
- ✅ 312 interview questions
- ✅ 213 JavaScript reference entries
- ✅ interactive code execution
- ✅ exercise engine
- ✅ quiz engine
- ✅ challenge engine
- ✅ project progress system
- ✅ mastery model
- ✅ XP and streak system
- ✅ achievements
- ✅ recommendations
- ✅ global search
- ✅ Monaco playground
- ✅ guest progress
- ✅ optional Supabase integration
- ✅ dark/light themes
- ✅ responsive application shell
- ✅ automated content auditing
- ✅ reference-solution verification
- ✅ runnable-example verification
- ✅ production deployment

### Remaining product work

The major JavaScript curriculum and practice libraries are complete.

The following content areas remain planned:

- Cheat sheets
- Placement assessment

The authoritative development status is maintained in:

[`docs/CONTENT-PROGRESS.md`](docs/CONTENT-PROGRESS.md)

---

## Educational Philosophy

JSPath is intentionally designed to avoid several common problems found in learning platforms.

It does not treat a topic as learned because a learner clicked "Complete."

It does not rely on a few superficial examples to represent an entire JavaScript concept.

It does not present fabricated statistics for content that has not been authored.

It does not require an account before someone can begin learning.

Instead, the platform focuses on:

- explanation
- deliberate sequencing
- practice
- feedback
- verification
- application
- repetition
- measurable evidence of learning

---

## Contributing

Contributions, bug reports, and improvement suggestions are welcome.

Before submitting a significant change:

1. Open an issue describing the proposed change.
2. Keep changes focused and scoped.
3. Follow the existing project architecture.
4. Avoid introducing duplicate content or alternative sources of truth.
5. Run all quality gates before opening a pull request.

```bash
npm run lint
npm run test
npm run content:audit
npm run content:verify
npm run content:examples
npm run build
```

For educational content changes, also follow:

[`docs/CONTENT-AUTHORING.md`](docs/CONTENT-AUTHORING.md)

---

## Reporting Issues

If you discover a bug, incorrect JavaScript explanation, broken exercise, invalid test, accessibility issue, or inconsistent example output, please open a GitHub issue with enough information to reproduce the problem.

For code-related issues, include:

```text
Page / route:
Browser:
Expected behavior:
Actual behavior:
Steps to reproduce:
Console error, if any:
```

For educational-content issues, include the relevant lesson, challenge, project, interview question, or reference entry.

---

## Security

Do not include private API keys, Supabase secrets, credentials, authentication tokens, or other sensitive information in issues, pull requests, screenshots, or commits.

Client-side environment variables should only contain values intended to be exposed to the browser.

---

## License

An explicit open-source license has not yet been added to this repository.

Until a `LICENSE` file is added, the repository should not be assumed to grant permission for redistribution, modification, or reuse beyond what is permitted by applicable law.

A dedicated license will be added separately.

---

## Author

**Allahverdi Həsənov**

GitHub: [@allahverdi-dev](https://github.com/allahverdi-dev)

Project: [JSPath](https://github.com/allahverdi-dev/jspath)

Live: [jspath.vercel.app](https://jspath.vercel.app)

---

<div align="center">

### Learn JavaScript properly. Build with it. Understand why it works.

[Open JSPath](https://jspath.vercel.app)

</div>
