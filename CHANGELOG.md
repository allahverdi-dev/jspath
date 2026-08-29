# Changelog

All notable changes to **JSPath** are documented in this file.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic versioning for public releases where practical.

> JSPath is proprietary software. See [`LICENSE`](LICENSE) for usage restrictions.

---

## [Unreleased]

### Planned

- Additional product refinements based on real usage and feedback.

---

## [1.0.0] - 2026-08-30

### Initial Public Release

JSPath v1.0.0 marks the first public production release of the platform.

### Added

#### Curriculum

- Complete **47 / 47 module** JavaScript curriculum
- **214 lessons**
- **3,808 lesson sections**
- **1,116 worked code examples**
- **810 exercises**
- **819 quiz questions**
- Structured progression from beginner fundamentals to advanced and professional JavaScript topics

#### Coding Challenges

- **171 coding challenges**
- Beginner through Expert difficulty levels
- Visible and hidden test coverage
- Deterministic challenge testing
- Topic coverage across fundamentals, functions, arrays, objects, async JavaScript, DOM, algorithms, data structures, OOP, security, metaprogramming, and more

#### Projects

- **31 guided projects**
- Beginner, Easy, Medium, Hard, and Expert project levels
- Project milestones
- Completion criteria
- Hints and solution notes
- Related lessons and challenges
- Testing requirements for advanced projects
- Architecture-focused projects including Finance Dashboard and Project Management Workspace

#### Interview Preparation

- **312 JavaScript interview questions**
- Conceptual questions
- Common mistakes
- Follow-up questions
- Output-prediction questions
- Machine verification for executable output questions

#### JavaScript Reference

- **213 canonical reference entries**
- ECMAScript, DOM, and Web API coverage
- Related entries
- Related lessons
- Aliases
- Searchable metadata
- Executable reference examples where supported

#### Cheat Sheets

- 9 JavaScript cheat sheets
- Compact revision material covering core JavaScript concepts
- Related lessons, references, and challenges
- Dedicated cheat sheet browsing and detail pages

#### Placement Assessment

- Interactive placement assessment
- Questions sampled across the authored curriculum
- Starting-module recommendation based on assessment performance
- Optional onboarding flow without restricting curriculum access

#### Interactive Learning

- Sandboxed code execution
- Web Worker execution for JavaScript tasks
- Null-origin iframe execution for DOM exercises
- Infinite-loop protection
- Execution timeouts
- Progressive exercise feedback
- Conceptual hints
- Worked solutions
- Quiz explanations and distractor rationales
- Monaco Editor playground
- Textarea fallback for editor availability issues

#### Learning Progress

- Guest mode with `localStorage`
- Progress tracking
- Mastery scoring
- XP
- Streaks
- Achievements
- Recommendations
- Mistake review
- Quiz accuracy tracking
- Project progress
- Guest-to-account migration architecture

#### Search and Navigation

- Global content search
- Generated content manifest
- Keyboard-accessible search
- Route-based application structure
- Responsive navigation
- Dark and light themes

#### Quality and Verification

- Automated content manifest generation
- Content audit pipeline
- Reference-solution verification
- Runnable-example verification
- Vitest test suite
- ESLint with zero-warning policy
- Production build verification
- GitHub Actions CI workflow

Current verified quality gates:

- `npm run lint` — passes
- `npm run test` — passes
- `npm run content:audit` — passes with 0 errors and 0 warnings
- `npm run content:verify` — passes
- `npm run content:examples` — passes
- `npm run build` — passes

Additional verified totals:

- **569** reference-solution items
- **4,561** reference-solution assertions
- **949** runnable lesson examples verified
- **40** interview output-prediction questions machine-verified
- **202** executable reference examples verified

#### Deployment

- Production deployment on Vercel
- Live application at **https://jspath.vercel.app**
- SPA routing fallback through `vercel.json`
- Automatic production deployment from `main`

#### Repository and Project Governance

- Professional `README.md`
- Proprietary `LICENSE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODEOWNERS`
- `.gitattributes`
- GitHub issue templates
- Pull request template
- GitHub Actions CI
- Protected `main` branch rules
- Squash-merge repository workflow
- Social Preview image
- Repository description, website, and topics

### Security

- Added responsible vulnerability disclosure policy
- Documented sandbox-related security scope
- Documented authentication and Supabase-related security scope
- Added restrictions against destructive or harmful testing
- Added guidance for handling exposed secrets

### Licensing

- JSPath is publicly visible but **not open source**
- Source code and educational content are protected under a proprietary, All Rights Reserved license
- Public visibility does not grant reuse, redistribution, modification, commercial use, or derivative-work rights

### Known Remaining Product Work

The core JavaScript learning platform and primary learning libraries are complete.

The following content areas are intentionally deferred to a future release:

- Cheat sheets
- Placement assessment

See [`docs/CONTENT-PROGRESS.md`](docs/CONTENT-PROGRESS.md) for the authoritative project status.

---

Copyright © 2026 Allahverdi Həsənov. All Rights Reserved.
