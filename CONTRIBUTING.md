# Contributing to JSPath

Thank you for taking the time to review JSPath and for considering reporting an issue, suggesting an improvement, or contributing to the project.

JSPath is a **proprietary project**. It is publicly visible for portfolio review, demonstration, evaluation, and educational review, but it is **not open source**.

Please read the repository's [`LICENSE`](LICENSE) before submitting any issue, suggestion, or contribution.

---

## What contributions are welcome?

The following are welcome:

- bug reports
- accessibility issues
- broken routes or UI problems
- incorrect JavaScript explanations
- incorrect examples or documented output
- broken exercises or tests
- invalid challenge behavior
- incorrect interview answers
- reference documentation corrections
- performance problems
- usability feedback
- security reports through the appropriate channel
- suggestions for improving the learning experience

---

## Pull Requests

Pull requests are **not automatically accepted**.

If you want to propose a code or content contribution, please open an issue first and discuss the change with the repository owner.

A pull request should only be created after the proposed work has been acknowledged or requested.

Unsolicited pull requests may be closed without review.

Submitting a pull request does not grant permission to reuse, redistribute, publish, commercialize, or create derivative works from JSPath outside this repository.

---

## Before Opening an Issue

Please check whether the problem has already been reported.

When reporting a bug, include enough information to reproduce it.

Recommended format:

```text
Page / route:
Browser:
Device / operating system:
Expected behavior:
Actual behavior:
Steps to reproduce:
Console error, if any:
Screenshots, if useful:
```

For educational-content issues, also include:

```text
Content type:
Module / lesson / challenge / project / interview question / reference entry:
Relevant title or ID:
What appears to be incorrect:
Suggested correction, if known:
```

---

## Development Setup

For authorized contribution work:

```bash
git clone https://github.com/allahverdi-dev/jspath.git
cd jspath
npm install
npm run dev
```

Supabase is optional. JSPath can run in guest mode without environment variables.

If Supabase integration is needed, use a local `.env` file and never commit secrets.

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Project Standards

Changes should follow the existing architecture rather than introducing parallel systems or duplicate sources of truth.

Please keep the following principles in mind:

- preserve the existing content architecture
- avoid hard-coded content counts where values can be derived
- avoid duplicate IDs, slugs, titles, prompts, or references
- keep educational content structured rather than embedding lesson data directly in page components
- reuse existing UI components before introducing new primitives
- keep features accessible by keyboard where applicable
- maintain dark and light theme compatibility
- avoid unnecessary dependencies
- do not expose secrets or private credentials
- keep guest mode working unless the change explicitly concerns authenticated functionality
- do not weaken sandbox isolation or execution protections
- avoid implementation-specific challenge tests unless implementation constraints are genuinely required
- keep test behavior deterministic

---

## Educational Content Standards

JSPath is intended to teach concepts thoroughly rather than provide short definitions or filler content.

Educational contributions should:

- explain the concept, not only define it
- include meaningful examples
- cover important edge cases
- explain common mistakes where relevant
- use technically accurate JavaScript terminology
- avoid duplicated or padded material
- avoid placeholder content
- connect related concepts where useful
- keep code examples valid and executable when marked runnable
- provide tests for exercises and challenges
- provide explanations for quiz answers
- avoid misleading simplifications

For detailed content rules, see:

[`docs/CONTENT-AUTHORING.md`](docs/CONTENT-AUTHORING.md)

---

## Required Quality Gates

Before submitting an authorized pull request, run all of the following:

```bash
npm run lint
npm run test
npm run content:audit
npm run content:verify
npm run content:examples
npm run build
```

All quality gates must pass.

A change that introduces audit errors, lint warnings, test failures, invalid reference solutions, incorrect documented output, or a broken production build is not ready for review.

---

## Code Style

Follow the style already used in the repository.

General expectations:

- keep code readable and focused
- prefer clear names over unnecessary abbreviations
- avoid unrelated refactors in the same change
- remove unused imports and dead code
- avoid suppressing lint rules unless there is a strong technical reason
- keep components reasonably scoped
- keep content data outside UI components
- preserve existing routing and state patterns unless the change specifically requires an architectural update

---

## Commit Messages

Use short, descriptive commit messages.

Examples:

```text
Fix challenge detail DOM execution
Add missing reference aliases
Improve lesson quiz explanations
Fix mobile curriculum navigation
Update project verification tests
```

Avoid vague messages such as:

```text
update
fix stuff
changes
final
```

---

## Pull Request Scope

Keep each pull request focused on one coherent change.

A good pull request should make it easy to answer:

- What problem does this solve?
- Why is this change necessary?
- What files or systems are affected?
- How was it tested?
- Does it change user-visible behavior?
- Does it affect educational content?
- Does it affect stored user progress?

Large unrelated changes may be requested to be split into smaller pull requests.

---

## Pull Request Description

Use a clear description containing:

```text
Summary:
What changed:

Reason:
Why the change is needed:

Testing:
Commands and manual checks performed:

Affected areas:
Routes, features, content types, or services affected:

Screenshots:
Include before/after screenshots for visual changes when useful.
```

---

## Generated Content

Do not manually edit generated files unless the relevant workflow explicitly requires it.

The content manifest is generated through:

```bash
npm run content:manifest
```

Generated output should stay consistent with the authored content source.

---

## Security

Do not submit:

- passwords
- API secrets
- private Supabase keys
- authentication tokens
- private user data
- credentials
- environment files containing real secrets

If you discover a security issue, avoid publishing exploit details in a public issue.

Use the security reporting instructions in [`SECURITY.md`](SECURITY.md) once available, or contact the repository owner privately.

---

## Copyright and Ownership

All JSPath source code, original educational content, documentation, structure, branding, and associated materials remain subject to the proprietary [`LICENSE`](LICENSE).

Submitting feedback, an issue, or a contribution does **not** grant you any ownership interest or a general license to JSPath.

Unless otherwise agreed in writing, accepted contributions become part of the JSPath project and may be modified, maintained, distributed, or removed by the repository owner as part of the project.

If you are not comfortable with these terms, do not submit code or original content.

---

## Questions

For questions about a proposed contribution, open a GitHub issue before starting substantial work.

Repository:

https://github.com/allahverdi-dev/jspath

Live application:

https://jspath.vercel.app

---

Copyright © 2026 Allahverdi Həsənov. All Rights Reserved.
