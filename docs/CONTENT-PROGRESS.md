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
| Placement assessment | **INCOMPLETE** | not started |
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

## Verification

All gates green as of the last run:

| Gate | Result |
| --- | --- |
| `npm run content:audit` | 0 broken references, 0 warnings |
| `npm run content:verify` | 569 items, 4561 assertions, 0 failures |
| `npm run content:examples` | 949 lesson + 40 interview + 202 reference examples, 0 mismatches |
| `npm test` | 184 passed (14 files) |
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

## Next phase

**Placement assessment.** Not started; no files written for it yet.
