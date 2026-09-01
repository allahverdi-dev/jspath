# Authoring content

Content is plain data. Adding a module requires no changes to the application.

## Add a module's lessons

1. Create `src/content/curriculum/<NN>-<slug>/lessons.js`, matching the module's
   `order` and `slug` in `src/content/curriculum/modules.js`.
2. Default-export an array of lesson objects.
3. Run `npm run content:audit`.

The module's `lessonIds` is derived automatically from the lessons that claim its
`moduleId` — never edit it by hand. That is why the curriculum screen can never show a
lesson count that does not match reality.

```js
import { SECTION, CALLOUT_TONE, DIFFICULTY, EXERCISE_KIND, QUIZ_KIND } from '../../schema/types.js';

const M = 'm01'; // must match a module id

export default [
  {
    id: 'l-m01-01',              // globally unique, stable
    slug: 'declaring-variables', // globally unique, used in the URL
    moduleId: M,
    order: 1,
    title: 'Declaring Variables',
    description: 'One sentence, not reused anywhere else.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 12,
    xp: 25,
    topicIds: ['variables'],     // must exist in src/content/topics.js
    prerequisites: ['l-m00-06'], // lesson ids
    learningObjectives: ['...'],
    sections: [ /* see below */ ],
    exercises: [ /* see below */ ],
    quiz: { id: 'qz-m01-01', questions: [ /* see below */ ] },
    summary: 'A real paragraph, not a restatement of the title.',
    keyTakeaways: ['...'],
    relatedLessons: ['l-m00-06'],
    interviewConnections: ['Difference between var, let and const?'],
  },
];
```

## Section kinds

| Kind | Shape |
| --- | --- |
| `PROSE` | `{ body: string[] }` |
| `HEADING` | `{ text }` — also builds the "on this page" rail |
| `CODE` | `{ code, language?, caption?, output?, runnable?, needsDom?, html? }` |
| `ANNOTATED_CODE` | `{ code, annotations: [{ line, text }] }` |
| `CALLOUT` | `{ tone, title, body: string[] }` |
| `COMPARISON` | `{ left: { title, code }, right: { title, code }, note? }` |
| `PREDICT` | `{ code, options[], correct, explanation }` |
| `STEPS` | `{ steps: [{ title, body }] }` |
| `TABLE` | `{ headers: [], rows: [[]] }` |
| `TERMS` | `{ terms: [{ term, definition }] }` |
| `LIST` | `{ ordered?, items: string[] }` |
| `DIAGRAM` | `{ diagram, caption? }` |
| `EXERCISE_REF` | `{ exerciseId }` — inlines an exercise mid-lesson |

Callout tones: `TIP`, `WARNING`, `DANGER`, `INFO`, `MISTAKE`, `INTERVIEW`.

Prose supports three inline constructs: `` `code` ``, `**bold**` and `[text](url)`.
They render as React elements — there is no `dangerouslySetInnerHTML` anywhere, so
authored content can never inject markup into the page.

Available diagrams (`src/components/viz/Diagram.jsx`): `scope-chain`, `call-stack`,
`event-loop`, `prototype-chain`, `promise-states`, `event-propagation`,
`value-vs-reference`, `hoisting-tdz`, `closure`, `dom-tree`.

## Exercises

Code exercises need `starterCode` and `tests`. Each test's `body` is an assertion
evaluated in the sandbox **in the same scope as the learner's code**, with a Jest-like
`expect`: `toBe`, `toEqual`, `toBeCloseTo`, `toBeTruthy`, `toBeFalsy`, `toBeNull`,
`toBeUndefined`, `toBeNaN`, `toHaveLength`, `toContain`, `toMatch`, `toBeInstanceOf`,
`toBeGreaterThan`, `toBeLessThan`, `toBeTypeOf`, `toThrow`, and `not.*` variants.

```js
{
  id: 'ex-m01-01-a',
  title: 'Swap two variables',
  kind: EXERCISE_KIND.WRITE_FUNCTION,
  difficulty: DIFFICULTY.BEGINNER,
  xp: 15,
  topicIds: ['variables'],
  instructions: 'Write `swap(a, b)` that returns `[b, a]`.',
  starterCode: 'function swap(a, b) {\n  \n}',
  tests: [
    { name: 'swaps two numbers', body: 'expect(swap(1, 2)).toEqual([2, 1]);' },
    { name: 'handles strings', body: "expect(swap('a','b')).toEqual(['b','a']);", hidden: true },
  ],
  hints: ['An array literal can hold any two values.'],
  solution: 'function swap(a, b) {\n  return [b, a];\n}',
  solutionExplanation: 'Explain the reasoning and the common mistake, not just the code.',
}
```

`hidden: true` tests still run, but their assertion text is not shown — the learner is
told how many hidden tests are failing so edge cases stay meaningful without being
given away.

Choice exercises (`PREDICT_OUTPUT`, `CONCEPTUAL`, `CHOOSE_IMPLEMENTATION`) need
`options` and `correct` instead of `starterCode`/`tests`.

Set `kind: EXERCISE_KIND.DOM_TASK` (or `needsDom: true`) to run in the iframe host with
a real `document`, plus optional `html` for the starting markup.

All tests for one exercise run **sequentially against the same document and the same
in-memory state** — there is no reset between tests within an exercise. A test calling
a *flipping* function (`classList.toggle(name)`) must account for the state the previous
test left behind; prefer forced-state operations (`classList.toggle(name, bool)`, direct
assignment), which are idempotent and immune to test ordering.

## Runnable DOM examples

A runnable `CODE` section that touches `document` or `window` **must** set
`needsDom: true` and an `html` string with its starting markup:

```js
{
  kind: SECTION.CODE,
  language: 'javascript',
  runnable: true,
  needsDom: true,
  html: '<div id="app"><p id="note">Loading…</p></div>',
  code: 'document.getElementById("note").textContent = "Done";',
  output: '…',
}
```

Without `needsDom`, the example runs in the Web Worker host, which deliberately has no
`document` — a learner clicking "Run" gets `ReferenceError: document is not defined`.
`npm run content:examples` verifies these against a real jsdom document, so a missing
`needsDom` is caught before it reaches anyone.

`innerText` is unsupported by jsdom (no layout engine) and is skipped by the example
verifier; it still works correctly for real users. Other genuinely non-deterministic
APIs (`localStorage`, `fetch`, timers) are skipped for the same practical reason.

## Quiz questions

Kinds: `SINGLE`, `MULTIPLE` (correct is an array), `TRUE_FALSE`, `OUTPUT`.

Every question needs an `explanation`. Add `optionExplanations` — exactly one per
option — so wrong answers teach rather than merely fail.

```js
{
  id: 'q-m01-01-1',
  kind: QUIZ_KIND.SINGLE,
  topicIds: ['variables'],
  prompt: 'Which statement is accurate?',
  code: 'const user = { name: "Ada" };\nuser.name = "Grace";',
  options: ['This throws', 'This works'],
  correct: 1,
  optionExplanations: ['const blocks reassignment, not mutation.', 'Correct.'],
  explanation: 'const prevents rebinding the name, not changing the object it points to.',
}
```

## Standalone collections

`src/content/challenges/`, `projects/`, `interview/`, `references/` and
`cheat-sheets/` each take `.js` files that default-export an array. Their required
shapes are enforced by `src/content/schema/validate.js` — run the audit and it will
name exactly what is missing.

## Reference entries

One API, one article. The audit enforces uniqueness on the **normalised**
canonical name (lowercased, trailing parentheses stripped), so `map`,
`Array.map` and `Array.prototype.map()` cannot ship as three entries. Put the
informal spellings in `aliases` — the manifest carries them into global search.
An alias may not collide with another entry's canonical name; the audit rejects
that too, because it makes search ambiguous about which article owns the API.

Use technically canonical names: `Array.prototype.map()`, `Object.entries()`,
`Document.querySelector()`, `EventTarget.addEventListener()`. Syntax features
get plain names instead — `Spread syntax (...)`, `Optional chaining (?.)`.
Do not put markdown in `name`; it is rendered as plain text.

`environment` is required and must be `ECMAScript`, `DOM` or `Web API`. That
boundary is not cosmetic — blurring it is one of the most common ways reference
material misleads.

`mutates` is required and boolean. State it accurately: `sort` and `reverse`
mutate **and return the same array**.

Every example that documents an `output` is executed by `content:examples` and
byte-compared. **Never hand-write the output** — run the gate and paste what it
actually printed. If an API genuinely cannot run in the sandbox — network,
storage, permissions, layout, module syntax — set `runnable: false` and say so
in the caveats. Do not emulate an API and present it as the real one, and never
let an example reach the network.

DOM examples need `needsDom: true` plus an `html` fixture, which is inserted
**inside** `#app` — so the fixture must not include its own `#app` wrapper.

```js
{
  id: 'ref-array-map',
  slug: 'array-prototype-map',
  name: 'Array.prototype.map()',
  aliases: ['Array.map', 'array map'],
  category: C.ARRAY,
  environment: E.ECMASCRIPT,
  topicIds: ['array-methods'],
  mutates: false,
  syntax: 'arr.map(callbackFn)',
  summary: 'Creates a new array by transforming every element.',
  parameters: [{ name: 'callbackFn', description: 'Called as (element, index, array).' }],
  returns: 'A new array with the same length as the original.',
  description: ['One input element produces exactly one output element.'],
  examples: [{ code: '...', output: '...', caption: '...' }],
  caveats: ['Always returns the same length — it cannot filter.'],
  commonMistakes: ['Using map purely for side effects.'],
  relatedEntries: ['ref-array-filter'],
  lessonId: 'l-m13-01',
}
```

Section order in the detail page is fixed by the component: summary, syntax,
parameters, returns, throws, behaviour (`description`), examples, caveats,
common mistakes, related APIs, then lessons and practice.

`InlineMarkup` renders these strings and supports fenced code blocks, inline
`code`, `**bold**` (including bold wrapping code) and links. It does **not**
support single-asterisk italics.

## Cheat sheets

Cheat sheets live in `src/content/cheat-sheets/*.js`. They answer a different
question from the other kinds:

| Kind | The question it answers |
| --- | --- |
| Curriculum | "Teach me this topic." |
| Reference | "What exactly does this API do?" |
| Cheat sheet | "Remind me of the syntax, rules and gotchas in 30 seconds." |

So a sheet is compressed and scan-friendly: tables, rule lists and short
snippets — never prose essays, never a second copy of the Reference.

```js
{
  id: 'cs-events', slug: 'events', title: 'Events',
  category: C.BROWSER,           // SHEET_CATEGORY
  icon: 'touch_app',
  aliases: ['bubbling', 'delegation'],   // fed into global search
  topicIds: ['events'],
  description: 'One-line scan of what the sheet covers.',
  groups: [
    { title: 'Phases', kind: G.TABLE, columns: ['Phase', 'Order'], rows: [[...]], note: '...' },
    { title: 'Rules',  kind: G.RULES, items: ['`stopPropagation` does **not** ...'] },
    { title: 'Delegation', kind: G.SNIPPETS, entries: [{ code: '...', description: '...' }] },
  ],
  relatedLessons: ['l-m18-01'],
  relatedReference: ['ref-addeventlistener'],
  relatedChallenges: ['ch-evt-delegation'],
}
```

Three group kinds are available: `TABLE` (needs at least two columns, and every
row must have one cell per column), `RULES` (a list of strings) and `SNIPPETS`
(entries of `{ code, description }`).

Titles, descriptions, notes, rule items, table headers and table cells all pass
through `InlineMarkup`, so backticks and `**bold**` render. Snippet `code` does
**not** — it is syntax-highlighted verbatim, so never put markdown inside it.

Every id in `relatedLessons` / `relatedReference` / `relatedChallenges` must
resolve to real content; the audit fails on invented ids.

Cheat sheets are **Free**. They are absent from `PRO_CONTENT_IDS` in
`src/features/billing/accessCatalog.js`, so `requiredPlanForContent` returns
FREE for the whole kind. Two tests pin that allocation.

## Rules the audit enforces

- Every module must have at least one lesson.
- A lesson needs at least 400 characters of explanatory prose (prose + callout bodies).
- Ids and slugs are globally unique within their kind.
- Every `topicIds` entry must exist in `src/content/topics.js`.
- Every referenced lesson, module, exercise and challenge must exist.
- Every quiz question needs an in-range correct answer and an explanation.
- Every code exercise needs tests; every exercise needs a solution and explanation.
- No placeholder text anywhere.

It also **warns** on duplicated descriptions, summaries, instructions and repeated quiz
prompts — which is what padded filler looks like.

If a lesson must legitimately discuss a word like "TODO" (for example, when teaching
about code comments), add the marker `@allow-placeholder` inside that string.
