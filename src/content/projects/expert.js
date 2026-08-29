import { DIFFICULTY } from '../schema/types.js';

/**
 * Expert projects — the top of the guided-project library. Each one combines
 * architecture, async correctness, and an explicit testing requirement,
 * because at this level "it works when I click it" is no longer a sufficient
 * bar — the learner has to demonstrate correctness, not just observe it.
 */

export const projects = [
  {
    id: 'pr-project-workspace',
    slug: 'project-management-workspace',
    title: 'Project Management Workspace',
    difficulty: DIFFICULTY.EXPERT,
    tagline: 'A multi-project task workspace with a modular architecture, undo, and a real automated test suite.',
    brief:
      'Build a workspace that manages several projects at once, each with its own board of tasks across ' +
      'statuses, plus cross-project search and a global activity log. This is the Kanban Board and the Finance ' +
      'Dashboard\'s architecture requirement combined and raised: a full module split with a strict dependency ' +
      'direction, an undo/redo stack over structured state, and — the explicit bar for this project — a real ' +
      'suite of automated tests over the state and undo logic, not just manual verification.',
    estimatedHours: '8–14',
    topicIds: ['modules', 'data-structures', 'design-patterns', 'testing', 'clean-code'],
    prerequisites: [
      'Completed the Kanban Board and the Finance Dashboard, or is equally comfortable with modular architecture and nested structured state.',
      'Comfortable writing test cases against pure functions — this project cannot be considered complete without them.',
    ],
    relatedLessons: ['l-m41-01', 'l-m42-01', 'l-m28-01'],
    relatedChallenges: ['ch-cls-observable-store', 'ch-exp-produce', 'ch-eng-assert'],
    objectives: [
      'Design and hold to a module architecture across a genuinely multi-entity domain (projects containing tasks), with the same one-directional dependency discipline as the Finance Dashboard, at larger scale.',
      'Implement undo/redo correctly over structured, nested state — which means every state-changing action has to be expressible as a reversible operation, not just a mutation.',
      'Write and pass a real automated test suite covering the state and undo logic in isolation from the DOM.',
    ],
    requirements: [
      'Multiple projects, each with its own name and its own board of tasks across at least three statuses (To Do, In Progress, Done).',
      'Full task CRUD within a project: add, edit, delete, move between statuses, reorder within a status.',
      'Switching between projects preserves each one\'s full state independently.',
      'A global search across all projects\' tasks by title, showing which project each result belongs to.',
      'An undo and redo stack covering at minimum: add task, delete task, edit task, move task between statuses. Undo reverses the most recent action; redo reapplies an undone action; performing a new action after an undo clears the redo stack (the standard behaviour of every undo system you have used).',
      'A global activity log listing recent actions across all projects, in order, with enough detail to be meaningful (what happened, to which task, in which project).',
      'The codebase is split into modules with a strict dependency direction, documented in the project (a short `ARCHITECTURE` note or equivalent comment block is sufficient — a formal document is not required).',
      'An automated test suite (using the platform\'s existing test tooling, or an equivalent lightweight approach) exercises the state and undo/redo logic directly, without going through the DOM, and passes.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Architecture and data model',
        tasks: [
          'Design the module split (following the pattern from the Finance Dashboard: state, api/persistence, render, events, utils, plus whatever this domain specifically needs) and write down the intended dependency direction before writing much logic.',
          'Model the domain: projects, each holding an ordered set of tasks with a status; design this in `state.js`-equivalent, with no DOM access.',
        ],
      },
      {
        id: 'm2',
        title: 'Core task operations, and switching projects',
        tasks: [
          'Implement add, edit, delete, move-status and reorder as pure state functions, each taking the current state and returning new state (rather than mutating in place) — this immutability is what will make undo tractable in the next milestone.',
          'Wire project switching, confirming each project\'s state is preserved independently when you switch away and back.',
        ],
      },
      {
        id: 'm3',
        title: 'Undo / redo',
        tasks: [
          'Design your undo approach: either a stack of full state snapshots (simplest to implement correctly, more memory) or a stack of inverse operations (more work, less memory) — pick one deliberately and be able to explain why.',
          'Wire undo and redo for every required action, and confirm performing a new action after an undo correctly clears the redo stack rather than leaving stale future states reachable.',
        ],
      },
      {
        id: 'm4',
        title: 'Search and activity log',
        tasks: [
          'Implement cross-project search as a pure function over all projects\' state, returning matches annotated with which project they came from.',
          'Implement an activity log that records a description of each state-changing action as it happens, most recent first.',
        ],
      },
      {
        id: 'm5',
        title: 'Wire the UI',
        tasks: [
          'Build render and event-wiring modules on top of the now-tested state layer, following the same "render is pure display, events call state functions" discipline as the Finance Dashboard.',
          'Confirm the UI correctly reflects undo and redo, including disabling either control when its stack is empty.',
        ],
      },
      {
        id: 'm6',
        title: 'Automated tests',
        tasks: [
          'Write tests directly against your state and undo/redo functions — no DOM, no clicking — covering at least: each core operation individually, an undo immediately after an action, a redo immediately after an undo, and a new action correctly clearing a pending redo.',
          'Run the test suite and get it fully passing before considering the project complete.',
        ],
      },
    ],
    hints: [
      'Making every state-changing function pure — `(state, action) => newState`, never mutating the passed-in state — is not a style preference here, it is what makes undo tractable at all: a snapshot-based undo stack is just "keep the previous `state` values in an array," which only works cleanly if state is never mutated in place.',
      'The "new action clears the redo stack" rule is the single most-forgotten undo/redo requirement. Trace it explicitly: after undoing twice and then performing a brand-new action, is the old "future" still reachable via redo? It should not be — write a test for exactly this case.',
      'Writing the automated tests against `state.js` directly, calling your pure functions and asserting on their return values, is what makes this genuinely different from "I clicked around and it seemed fine." If a function is hard to test in isolation, that is usually a sign it is doing too much or is not as pure as it should be — treat that friction as architectural feedback, not just a testing inconvenience.',
    ],
    stretchGoals: [
      'Persist the full undo-capable state to `localStorage`, including surviving a reload with the undo stack intact.',
      'Keyboard shortcuts for undo/redo (the conventional Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z).',
      'Task dependencies or subtasks within a project.',
      'Export a single project, or the whole workspace, as JSON.',
    ],
    completionCriteria: [
      'Every core task operation works correctly across multiple independent projects.',
      'Undo and redo work correctly for every required action, including the new-action-clears-redo rule, verified by both manual testing and automated tests.',
      'Cross-project search returns correct results with correct project attribution.',
      'The activity log accurately reflects the true order and content of recent actions.',
      'The module architecture follows a documented, one-directional dependency graph with no violations.',
      'The automated test suite passes and covers the state and undo logic without depending on the DOM.',
    ],
    testingChecklist: [
      'Run your automated test suite and confirm every test passes, with particular attention to the undo/redo tests.',
      'Perform several actions, undo them all the way back to the start, then redo them all the way forward, and confirm the final state exactly matches the state before you started undoing.',
      'Undo twice, then perform one new action, then try to redo — confirm redo is now unavailable (or a no-op) rather than reapplying the action you undid past.',
      'Search for a task title that exists in two different projects and confirm both results appear with correct project attribution.',
      'Switch between three projects, making changes in each, and confirm no project\'s state leaks into or overwrites another\'s.',
    ],
    reflectionQuestions: [
      'Which undo strategy did you choose — full snapshots or inverse operations — and what would change about your implementation, and its memory cost, if the state were ten times larger?',
      'What is the smallest state-changing function in your app that turned out to be hardest to write a test for, and what does that difficulty tell you about its design?',
    ],
  },

  {
    id: 'pr-async-request-dashboard',
    slug: 'async-request-dashboard',
    title: 'Async Request Dashboard',
    difficulty: DIFFICULTY.EXPERT,
    tagline: 'A dashboard of independently loading, cancellable, retryable panels sharing a request layer.',
    brief:
      'Build a dashboard made of several independent panels — each fetching its own data through a shared, ' +
      'injected request layer — that individually load, error, retry, and can be cancelled, without one panel\'s ' +
      'state ever leaking into another\'s. This project is the direct, applied continuation of the async ' +
      'challenges on deduplication, caching, cancellation and batching: build the dashboard, then prove each ' +
      'piece of async correctness with a targeted test, the way `ch-exp-cancellable-pool` and `ch-async-dedupe` ' +
      'do at the function level.',
    estimatedHours: '8–14',
    topicIds: ['async-await', 'promises', 'performance', 'testing', 'errors'],
    prerequisites: [
      'Completed Movie Search, or is equally comfortable with debounce, caching and request deduplication.',
      'Comfortable with `AbortController` and the general shape of a cancellable async operation.',
    ],
    relatedLessons: ['l-m43-01', 'l-m24-01', 'l-m25-01'],
    relatedChallenges: ['ch-exp-cancellable-pool', 'ch-async-dedupe', 'ch-eng-memo-cache-size', 'ch-async-retry'],
    objectives: [
      'Build a shared, injected request layer used by multiple independent panels, with per-panel loading/error/success state that never cross-contaminates.',
      'Implement cancellation that actually reaches the in-flight (mocked) request, not just the UI\'s willingness to display its result.',
      'Implement retry with backoff for a failed panel, and prove — with an automated test against injected time and an injected fetch — that the backoff timing and attempt count are correct.',
    ],
    requirements: [
      'At least four independent dashboard panels (e.g. recent activity, a stats summary, a status feed, a third-party-style widget), each fetching its own data through one shared, injectable request client.',
      'Each panel has its own loading, success and error state — one panel\'s slow or failed request must never block or corrupt another panel\'s display.',
      'A failed panel shows a retry control; retrying uses backoff (increasing delay between attempts) rather than immediately hammering the request again.',
      'Every panel can be individually refreshed on demand, cancelling any request currently in flight for that panel before starting a new one.',
      'Navigating away from the dashboard (or an equivalent "unmount" action your app defines) cancels every still-in-flight panel request.',
      'Requests for the same underlying resource, fired from two places at once, are deduplicated into one underlying call — reuse or directly adapt the pattern from `ch-async-dedupe`.',
      'The request layer accepts an injected fetch-like function and an injected clock/scheduler for backoff timing, so both retry behaviour and cancellation can be tested deterministically without real waiting.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Shared, injectable request layer',
        tasks: [
          'Build a request client that accepts an injected fetch-like function and returns panel data, with configurable artificial latency and a way to force a failure, for testing.',
          'Write a couple of direct calls to this client with fixture responses and confirm it behaves correctly before building any UI on top of it.',
        ],
      },
      {
        id: 'm2',
        title: 'Independent panels',
        tasks: [
          'Build the four (or more) panels, each managing its own request lifecycle and its own loading/success/error state.',
          'Force one panel to fail (via your mock\'s failure flag) while the others succeed, and confirm the failure is fully contained to that one panel.',
        ],
      },
      {
        id: 'm3',
        title: 'Cancellable, per-panel refresh',
        tasks: [
          'Wire an `AbortController` per panel (or per in-flight request), passed into the request layer, and confirm that refreshing a panel while its previous request is still in flight cancels the stale one.',
          'Wire a "leave dashboard" action (even if simulated, e.g. a button that tears down the panels) that cancels every still-in-flight panel request.',
        ],
      },
      {
        id: 'm4',
        title: 'Retry with backoff',
        tasks: [
          'Implement retry for a failed panel using an injectable wait/scheduler function, following the pattern from the retry-with-backoff challenge, rather than hardcoding `setTimeout`.',
          'Wire a visible retry control that, on repeated failure, waits progressively longer between attempts up to a sensible maximum attempt count, after which it shows a final, distinct "gave up" state.',
        ],
      },
      {
        id: 'm5',
        title: 'Deduplication',
        tasks: [
          'Identify at least one case in your dashboard where two panels (or a panel and a manual refresh) could plausibly request the same underlying resource concurrently, and wire deduplication for it.',
          'Prove it with a request counter: firing both requests at once results in exactly one underlying call.',
        ],
      },
      {
        id: 'm6',
        title: 'Targeted automated tests',
        tasks: [
          'Write direct tests — no UI clicking — for: cancellation actually preventing a stale response from being applied; retry backoff producing the correct sequence of wait calls with an injected scheduler; and deduplication producing exactly one underlying call for two concurrent identical requests.',
        ],
      },
    ],
    hints: [
      'Every panel needs its own `AbortController`, created fresh on each request and passed into the shared request client — sharing one controller across panels would mean cancelling one panel\'s request accidentally cancels every other panel\'s in-flight request too.',
      'Injecting both the fetch function *and* the wait/scheduler function into your retry logic is what makes the backoff timing testable without your test suite actually waiting several real seconds — a test can pass a fake `wait` that resolves instantly while still recording how long it was "asked" to wait, and assert on that recorded sequence.',
      'For deduplication, the shared in-flight-request map has to be keyed by whatever uniquely identifies the request (an endpoint plus its parameters, for instance) and cleared once the request settles — reuse the exact structure from the async deduplication challenge if you solved it, since the underlying problem is identical.',
    ],
    stretchGoals: [
      'A global "refresh all" that refreshes every panel while still respecting per-panel cancellation of any request already in flight.',
      'Configurable per-panel refresh intervals (auto-refresh on a timer), correctly cancelling and restarting.',
      'A visible request-in-flight indicator per panel, distinct from the loading skeleton, useful when debugging.',
      'Rate-limit the shared request layer using the token-bucket pattern from the equivalent security/engineering challenge.',
    ],
    completionCriteria: [
      'Every panel loads, errors, and can be individually retried and refreshed independently of every other panel.',
      'A cancelled request never has its (eventually-arriving) result applied to the UI.',
      'Retry uses increasing backoff between attempts, verified by an automated test against an injected scheduler, not merely observed by eye.',
      'A demonstrated concurrent-duplicate-request scenario results in exactly one underlying call.',
      'Navigating away (or the equivalent teardown action) cancels every still-in-flight panel request.',
      'The targeted automated tests for cancellation, backoff and deduplication all pass.',
    ],
    testingChecklist: [
      'Force one panel to fail while the others succeed, and confirm the other panels are entirely unaffected — no shared loading indicator, no shared error state.',
      'Refresh a panel while its previous (artificially delayed) request is still pending, and confirm the stale response, if it later arrives, has no effect on the display.',
      'Trigger repeated failures on a panel\'s retry and confirm — via your automated test against the injected scheduler — that the wait durations actually increase between attempts, and that a maximum attempt count is respected.',
      'Fire two concurrent requests for the same underlying resource and confirm, via a request counter, that only one actually reached your mock request layer.',
      'Trigger your "leave dashboard" teardown while at least one panel is still loading and confirm that panel\'s request is genuinely cancelled, not merely ignored.',
    ],
    reflectionQuestions: [
      'Why does each panel needing its own `AbortController` matter, and what would you observe going wrong if every panel shared one?',
      'What did injecting the scheduler into your retry logic let you test that you could not have tested — or could only have tested slowly and flakily — with a hardcoded `setTimeout`?',
    ],
  },

  {
    id: 'pr-validation-engine',
    slug: 'configurable-validation-engine',
    title: 'Configurable Validation Engine',
    difficulty: DIFFICULTY.EXPERT,
    tagline: 'A rule-based, form-agnostic validation engine, driven entirely by declared schemas and proven by tests.',
    brief:
      'Build a validation engine as a standalone, reusable library — not tied to any one form — driven entirely ' +
      'by a declared schema of fields and rules, including rules that depend on other fields (like confirm-' +
      'password) and rules that are asynchronous (like a simulated "is this username taken" check). The whole ' +
      'engine is validated by an explicit, required automated test suite: this is the one project on the ' +
      'platform where the tests are not a checklist item at the end, they are the actual deliverable proving ' +
      'the engine works.',
    estimatedHours: '8–14',
    topicIds: ['design-patterns', 'testing', 'async-await', 'functional', 'errors'],
    prerequisites: [
      'Completed the Simple Form Validator project, or is equally comfortable with field-level and cross-field validation.',
      'Comfortable writing and running automated tests — this project is not achievable without them, by design.',
    ],
    relatedLessons: ['l-m42-01', 'l-m37-01'],
    relatedChallenges: ['ch-eng-assert', 'ch-fn-pipe', 'ch-async-poll', 'ch-cls-result'],
    objectives: [
      'Design a schema format expressive enough to declare synchronous rules, cross-field rules, and asynchronous rules, without hardcoding any specific form\'s fields into the engine itself.',
      'Implement composable validators — combinators like "required," "and both of these," "either of these" — built from small, independently testable pieces rather than one large per-field function.',
      'Build and rely on a real automated test suite as the primary evidence that the engine is correct, covering synchronous rules, cross-field rules, async rules, and error-message output.',
    ],
    requirements: [
      'A schema format (a plain JavaScript object or array is fine — no external library) describing, per field: its rules, in order, each producing a specific error message on failure.',
      'Built-in rule combinators at minimum: `required`, `minLength`/`maxLength`, `pattern` (regex-based), a numeric `range`, and a cross-field rule capable of expressing "must equal another field\'s value" (for confirm-password-style checks).',
      'Support for at least one asynchronous rule (e.g. a simulated, injectable "username availability" check) that the engine awaits correctly, including showing a pending/checking state for that specific field while it resolves.',
      'The engine validates a full set of field values against a schema and returns a structured result: which fields failed, with which specific message(s), independent of any particular form\'s HTML.',
      'The engine is demonstrated against at least two different schemas (e.g. a signup form and a checkout form) to prove it is genuinely schema-driven and not secretly specific to one form\'s shape.',
      'A comprehensive automated test suite exists and passes, covering: each built-in rule type in isolation, a cross-field rule, the async rule (using an injected, controllable async check — no real network dependency), and at least one full end-to-end schema validation with a mix of passing and failing fields.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Schema format and the synchronous core',
        tasks: [
          'Design the schema shape: how a field declares its rules, and how a rule declares its check function and its error message.',
          'Implement `required`, `minLength`/`maxLength`, `pattern` and `range` as small, independently callable rule functions, each with its own direct test before wiring anything else.',
        ],
      },
      {
        id: 'm2',
        title: 'Run a schema against a set of values',
        tasks: [
          'Write the engine\'s core `validate(schema, values)` function, running every field\'s rules in order and stopping at the first failure per field (or collecting all — decide and document which, and be consistent).',
          'Test `validate` against a full schema with a mix of valid and invalid fields, and confirm the structured result is exactly right.',
        ],
      },
      {
        id: 'm3',
        title: 'Cross-field rules',
        tasks: [
          'Extend the rule contract so a rule\'s check function can receive the full set of values, not just its own field\'s value — this is what a confirm-password-style rule needs.',
          'Implement and test a cross-field "must equal another field" rule using this extended contract.',
        ],
      },
      {
        id: 'm4',
        title: 'Asynchronous rules',
        tasks: [
          'Extend the engine to support a rule whose check function returns a promise, and to track a distinct "pending" state for that field while the check is in flight.',
          'Implement a simulated, injectable "is this value already taken" async rule, and test it directly with a controllable fake async check — both the taken and the available outcomes, and the pending state in between.',
        ],
      },
      {
        id: 'm5',
        title: 'Two independent schemas, and the full test suite',
        tasks: [
          'Declare two genuinely different schemas (different fields, different rule combinations) and run each through the same, unmodified engine — this is your proof the engine is truly schema-driven.',
          'Assemble the complete automated test suite covering every rule type, the cross-field rule, the async rule (including its pending state), and at least one full mixed-result schema run — and get every test passing.',
        ],
      },
    ],
    hints: [
      'Design each rule as a small function with a consistent shape — something like `(value, allValues) => true | errorMessage` — and the engine as a thin loop that runs a field\'s rules against that contract. Consistency in the rule contract is what lets `required`, `pattern`, a cross-field rule and an async rule all plug into the same engine without special-casing any of them inside `validate` itself.',
      'For the async rule\'s pending state, the engine needs somewhere to record "this field\'s validation is currently in flight" separately from "this field passed" or "this field failed" — a three-state result per field (pending / valid / invalid-with-message), not a boolean, is what makes a UI able to show a spinner next to the username field while the check runs.',
      'Prove the engine is schema-driven, not secretly hardcoded, by literally reusing the exact same `validate` function against two schemas with different field names and different rule combinations — if you find yourself writing an `if (schema === signupSchema)` anywhere inside the engine, that is the sign the abstraction has leaked.',
    ],
    stretchGoals: [
      'A `oneOf`/`anyOf` combinator expressing "at least one of these rules must pass," composed from the same small rule functions.',
      'Localizable error messages — messages as keys resolved through a lookup, rather than hardcoded English strings, without changing the engine\'s core logic.',
      'A small adapter connecting the engine to a real HTML form (wiring blur/submit events to `validate` calls) as a demonstration, separate from the engine itself.',
      'Debounced async rule checks, reusing the debounce technique from earlier projects, so a fast typist does not trigger a check on every keystroke.',
    ],
    completionCriteria: [
      'The engine is driven entirely by declared schemas, demonstrated against at least two structurally different ones with no engine-level special-casing.',
      'Every built-in rule type (required, length, pattern, range, cross-field, async) works correctly and produces its specific error message on failure.',
      'The async rule correctly represents a pending state distinct from pass or fail, and resolves to the correct final state.',
      'A comprehensive automated test suite exists, passes, and covers every rule type plus at least one full mixed-result schema run.',
      'The engine has no dependency on any specific form\'s DOM structure — it operates purely on schemas and plain value objects.',
    ],
    testingChecklist: [
      'Run the full automated test suite and confirm every test passes, including the async rule\'s pending, taken, and available outcomes.',
      'Run your two different schemas through the same `validate` function and confirm each produces correct, schema-appropriate results — proof there is no hidden per-form logic inside the engine.',
      'Validate a set of values where a cross-field rule is the only failing rule, and confirm the structured result correctly attributes the failure to the right field with the right message.',
      'Directly call the async rule with an injected fake check that resolves "taken" after a delay, and confirm the field shows pending immediately and the correct failure message once the check resolves.',
    ],
    reflectionQuestions: [
      'What decision did you make about whether a field\'s validation stops at the first failing rule or collects every failing rule, and what would change about the engine\'s output shape if you had chosen the other way?',
      'If a future rule needed to make an HTTP request with custom headers, would your current rule contract support that without modification — and if not, what is the smallest change to the contract that would?',
    ],
  },
];

export default projects;
