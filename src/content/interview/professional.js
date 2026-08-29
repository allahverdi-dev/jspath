import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * The questions that separate someone who can write JavaScript from someone
 * who can be trusted with a production codebase: testing, performance,
 * security, architecture, HTTP and refactoring judgment.
 *
 * These are open-ended by nature. Each carries the expected key points and the
 * mistakes an interviewer listens for, so you can assess your own answer
 * against a rubric rather than a score the app cannot honestly compute.
 *
 * The security questions are defensive throughout: how to prevent, detect and
 * limit the blast radius of a class of vulnerability. None of them explain how
 * to build an attack.
 */

const TESTING = 'Testing';
const PERF = 'Performance';
const SEC = 'Security';
const ARCH = 'Architecture';
const HTTP = 'HTTP & APIs';

export const questions = [
  /* ---------------------------------------------------------------- testing */
  {
    id: 'iv-test-doubles',
    question: 'Explain stubs, mocks, spies and fakes. When does mocking do more harm than good?',
    topic: TESTING,
    level: L.INTERMEDIATE,
    kind: K.TESTING,
    topicIds: ['testing'],
    relatedLessons: ['l-m42-02'],
    shortAnswer:
      'A **stub** returns canned values, a **spy** records calls, a **mock** asserts on the interaction, and a **fake** is a working lightweight implementation. Mocking hurts when it asserts on internal collaboration — those tests break on every refactor while still passing when the behaviour is wrong.',
    deepAnswer: [
      '**Stub**: supplies an answer so the code under test can proceed. `getUser` returns a fixed user. It has no opinion about being called.',
      '**Spy**: wraps or replaces a function and records how it was called, so you can assert afterwards. Useful for verifying a genuine side effect — that an analytics event fired, that `onSubmit` was invoked.',
      '**Mock**: a double with expectations built in — "must be called once, with these arguments". The assertion is on the interaction rather than the outcome.',
      '**Fake**: a real, simplified implementation. An in-memory repository, a `Map`-backed cache, a fake clock. Fakes usually give the best tests, because the code under test exercises real behaviour and the test asserts on real results.',
      'The harm comes from **over-mocking**. If a test asserts "the service called the repository with these arguments", any refactor that changes the collaboration — batching two calls into one, caching, renaming a method — breaks the test even though behaviour is unchanged. Worse, the test passes when the repository is broken, because the real one never runs.',
      'The rule of thumb: mock at **boundaries you do not own** — network, clock, randomness, filesystem, third-party SDKs — and use real code inside the boundary. That keeps tests fast and deterministic without making them a mirror of the implementation.',
      'The deterministic doubles worth having by default: an injected clock, an injected random source, and a fetch layer replaced with a fixture map from request to response. Those three remove almost all non-determinism in front-end tests.',
    ],
    keyPoints: [
      'Stub returns values; spy records calls; mock asserts interactions; fake is a real simplified implementation',
      'Prefer fakes — the code under test exercises real behaviour',
      'Over-mocking couples tests to implementation and hides real breakage',
      'Mock at boundaries you do not own: network, clock, randomness, filesystem',
      'Inject the clock, the random source and the network layer',
    ],
    commonMistakes: [
      'Mocking modules you own and then asserting on internal call patterns.',
      'Using the terms interchangeably without noticing that mocks assert and stubs do not.',
    ],
    followUps: ['Why is a fake usually better than a mock?', 'Which boundaries should always be faked?'],
  },

  {
    id: 'iv-test-no-network',
    question: 'How do you test code that calls an API, without the test ever touching the internet?',
    topic: TESTING,
    level: L.INTERMEDIATE,
    kind: K.TESTING,
    topicIds: ['testing', 'http'],
    relatedLessons: ['l-m42-02'],
    shortAnswer:
      'Put the network behind a seam you control: inject `fetch` (or a small API module) and supply a fake that maps requests to fixture responses. A test that reaches a real server is not a test — it is slow, non-deterministic, and fails when someone else\'s service does.',
    deepAnswer: [
      'The cleanest seam is dependency injection: the module takes `fetch` as a parameter and defaults to the global one.\n\n```js\nexport function createApi({ fetch: doFetch = fetch, baseUrl = "" } = {}) {\n  return {\n    async getUser(id) {\n      const res = await doFetch(`${baseUrl}/users/${id}`);\n      if (!res.ok) throw new HttpError(res.status);\n      return res.json();\n    },\n  };\n}\n```\n\nThe test constructs it with a fake that returns a `Response`-shaped object, and the production code stays unaware that testing exists.',
      'A fixture-driven fake keeps tests readable:\n\n```js\nconst fixtures = new Map([\n  ["/users/1", { status: 200, body: { id: 1, name: "Ada" } }],\n]);\n\nconst fakeFetch = async (url) => {\n  const hit = fixtures.get(url);\n  if (!hit) return new Response("Not found", { status: 404 });\n  return new Response(JSON.stringify(hit.body), {\n    status: hit.status,\n    headers: { "Content-Type": "application/json" },\n  });\n};\n```',
      'Test the failures, not just the happy path — that is where the bugs are. A 500, a 404, malformed JSON, an empty `204`, a network rejection, and a request that never resolves so a timeout can be exercised. Each of these is trivial to produce with a fake and impossible to produce reliably against a real service.',
      'The alternative to injection is intercepting at the network layer — MSW (Mock Service Worker) defines handlers per route and works in both the browser and Node. It has the advantage that the application code needs no seam at all and the same handlers can drive local development.',
      'What to avoid: mocking your own `getUser` function and asserting it was called. That tests nothing about request construction, status handling, or parsing — the parts most likely to be wrong.',
      'Contract drift is the remaining risk: a fake stays correct forever even when the real API changes. Contract tests, or schema validation against the provider\'s published schema, are what close that gap — the fake makes tests deterministic, the contract test makes them truthful.',
    ],
    keyPoints: [
      'Inject `fetch` or an API module — never let a unit test reach the network',
      'Drive the fake from fixtures mapping request to response',
      'Test 4xx, 5xx, malformed JSON, empty bodies and network rejection',
      'MSW intercepts at the network layer and needs no code seam',
      'Fakes drift from reality — contract or schema tests close that gap',
    ],
    commonMistakes: [
      'Mocking your own wrapper and asserting it was called.',
      'Testing only the success path.',
    ],
    followUps: ['What does a fake never catch?', 'How would you test a request timeout?'],
  },

  {
    id: 'iv-test-async-pitfalls',
    question: 'What makes asynchronous tests flaky, and how do you write them so they are not?',
    topic: TESTING,
    level: L.ADVANCED,
    kind: K.TESTING,
    topicIds: ['testing', 'async-await'],
    relatedLessons: ['l-m42-02'],
    shortAnswer:
      'Flakiness comes from waiting on time instead of on a condition. Never assert after a fixed `setTimeout`; await the promise, use fake timers for scheduled work, and poll for the expected state with a deadline. Also make sure a test that should fail actually can.',
    deepAnswer: [
      'The classic broken pattern is `setTimeout(() => expect(...), 100)`. It is a bet that the work finishes in under 100ms — usually true on a developer laptop, sometimes false on a loaded CI runner. It also risks the assertion running after the test has already been reported as passed, so a failure is silently lost.',
      'Return or await the promise so the framework knows when the test is done:\n\n```js\nawait expect(loadUser(1)).resolves.toMatchObject({ id: 1 });\n```\n\nA forgotten `await` on an assertion is the single most common cause of a test that can never fail.',
      'For code that schedules work, use fake timers instead of real ones: `vi.useFakeTimers()`, advance by the exact amount, assert. That makes a debounce test instant and deterministic rather than a real 300ms wait that sometimes is not enough.',
      'When you genuinely cannot know the moment, poll for the condition with a deadline rather than sleeping for a guess. Testing-library\'s `waitFor` and Playwright\'s auto-waiting locators do exactly this: retry the assertion until it passes or the timeout expires. The test finishes as soon as the condition holds, so it is both faster and more reliable than a fixed sleep.',
      'Test isolation is the other half. Shared module state, a database not reset between tests, a global `Date` mock left installed, or listeners not removed all create order-dependent failures — the tests pass individually and fail as a suite, or vice versa. Running the suite in a randomised order is how you find these deliberately.',
      'Verify the test can fail. Break the implementation on purpose and confirm the test goes red. An async test with a missing `await` passes unconditionally, and that is not visible from a green run.',
      'When a flaky test appears, the wrong response is a retry setting. Retries hide a real race — often a genuine bug in the code, not in the test — and turn an intermittent product failure into an invisible one.',
    ],
    keyPoints: [
      'Never assert after a fixed sleep — wait for a condition with a deadline',
      'Return or await the promise; a missing `await` makes a test that cannot fail',
      'Use fake timers for debounce, throttle, polling and retry logic',
      'Reset shared state between tests; randomise order to expose coupling',
      'Prove the test can fail by breaking the code deliberately',
      'Retrying a flaky test hides a race rather than fixing it',
    ],
    commonMistakes: [
      'Adding a longer sleep until CI stops failing.',
      'Enabling automatic retries instead of diagnosing the race.',
    ],
    followUps: ['How do fake timers change a debounce test?', 'Why is a randomised test order useful?'],
  },

  {
    id: 'iv-test-what-to-test-first',
    question: 'You inherit a large untested codebase and have limited time. Where do you add tests first?',
    topic: TESTING,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['testing', 'clean-code'],
    relatedLessons: ['l-m42-01'],
    shortAnswer:
      'Start where the cost of being wrong is highest and the code changes most often — usually money, auth and data integrity. Add a characterisation test before changing anything, and write a regression test for every bug as it is fixed.',
    deepAnswer: [
      'Rank by **impact × change frequency**. Code that never changes and never breaks does not need tests written retroactively, however complex it is. Code touched weekly, in a path that costs money or loses data when it fails, is where the first tests belong.',
      'Version-control history is the data source: files with the most commits are the ones most likely to break next, and they are also the ones where tests pay for themselves fastest.',
      'Before changing untested legacy code, write **characterisation tests** — tests that assert what it currently does, correct or not. They are a safety net for refactoring, not a statement that the behaviour is right. Once they pass, you can restructure with confidence and then change behaviour deliberately.',
      'Every bug fix gets a test that fails before the fix and passes after. This is the highest-value test you will ever write: the bug is proof that this path is both reachable and easy to get wrong, and the test is proof the fix works.',
      'Expect to have to make the code testable first. Untested code is usually untestable code — hard-coded `new Date()`, direct `fetch` calls, module-level singletons. Introducing a seam (a parameter, an injected dependency) is often the actual first step, and it is a refactor that needs the characterisation test to be safe.',
      'End-to-end smoke tests over the two or three critical journeys are cheap insurance while the unit-level coverage is still thin. They catch the catastrophic "nothing loads" failures that unit tests never see.',
      'What not to do: declare a coverage target and grind through files alphabetically. That produces the most tests where they matter least, and burns the goodwill you need to keep investing.',
    ],
    keyPoints: [
      'Prioritise by impact × change frequency; use commit history as the signal',
      'Money, auth and data integrity first',
      'Characterisation tests before refactoring legacy code',
      'A regression test for every bug — the highest-value test available',
      'Introducing a testing seam is often the real first step',
      'A blanket coverage target produces tests where they matter least',
    ],
    commonMistakes: [
      'Chasing a coverage number instead of risk.',
      'Refactoring untested code before pinning its current behaviour.',
    ],
    followUps: ['What is a characterisation test asserting?', 'How do you make legacy code testable without changing behaviour?'],
  },

  /* ------------------------------------------------------------ performance */
  {
    id: 'iv-perf-long-tasks',
    question: 'A 300ms calculation freezes the UI. What are the options?',
    topic: PERF,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'event-loop', 'web-apis'],
    relatedLessons: ['l-m43-01'],
    shortAnswer:
      'JavaScript runs on the same thread as rendering and input, so a 300ms synchronous block means 300ms of unresponsiveness. Options in order: do less work, move it to a Web Worker, or break it into chunks that yield to the event loop between pieces.',
    deepAnswer: [
      'First ask whether the work is necessary at all. Computing something for 10,000 rows when only 20 are visible, or recomputing on every keystroke what could be computed once, is the most common cause. Memoizing, indexing with a `Map`, or computing lazily often removes the problem outright.',
      '**Web Workers** are the correct answer for genuinely expensive pure computation — parsing a large file, image processing, running a search index. The worker has its own thread and cannot touch the DOM, which is exactly the constraint that makes it safe. The cost is the structured-clone serialisation of messages, so it pays off for chunky work and not for many tiny calls; transferable objects avoid the copy for large buffers.',
      '**Chunking** keeps the work on the main thread but yields between pieces so input and rendering can happen:\n\n```js\nasync function processInChunks(items, work) {\n  for (let i = 0; i < items.length; i += 100) {\n    for (const item of items.slice(i, i + 100)) work(item);\n    await new Promise((resolve) => setTimeout(resolve, 0));\n  }\n}\n```\n\n`scheduler.yield()` is the purpose-built modern equivalent where available, and `requestIdleCallback` suits genuinely low-priority work that can wait for a quiet moment.',
      'Note that `async`/`await` alone does **not** help. An `async` function running a synchronous loop blocks exactly as long as a non-async one — the yield has to be explicit. This misconception is common enough that interviewers ask about it directly.',
      'For rendering specifically, virtualising a long list — rendering only the visible window plus a small buffer — removes the work rather than rescheduling it, and is usually a bigger win than any scheduling change.',
      'Whatever the fix, keep the UI honest: show a progress indicator, keep the page interactive, and make the operation cancellable if it can run long. Perceived performance is what the user actually experiences.',
    ],
    keyPoints: [
      'One thread runs script, rendering and input — a long task blocks all three',
      'First reduce the work: memoize, index, compute lazily, render less',
      'Web Workers for heavy pure computation; mind the serialisation cost',
      'Chunk and yield explicitly — `async` alone does not yield',
      'Virtualise long lists instead of rescheduling the same work',
      'Show progress and allow cancellation',
    ],
    commonMistakes: [
      'Believing an `async` function is automatically non-blocking.',
      'Reaching for a worker before checking whether the work is needed at all.',
    ],
    followUps: ['What can a Web Worker not do?', 'When is `requestIdleCallback` appropriate?'],
  },

  {
    id: 'iv-perf-memory-leaks',
    question: 'What causes memory leaks in a browser application, and how do you find them?',
    topic: PERF,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'closures', 'events'],
    relatedLessons: ['l-m43-02', 'l-m32-04'],
    shortAnswer:
      'A leak is memory that is still **reachable** but no longer needed. The usual causes are listeners never removed, timers never cleared, closures holding large objects, detached DOM nodes still referenced, and unbounded caches. Find them by comparing heap snapshots across a repeated user action.',
    deepAnswer: [
      'Garbage collection frees what is unreachable. It cannot free something a live reference still points at, so every leak is ultimately "something is still holding this".',
      'The recurring causes: an `addEventListener` on `window` or `document` that is never removed; a `setInterval` that outlives its component; a closure that captures a large array it barely uses; a detached DOM subtree kept alive by a variable or a listener; a `Map` used as a cache with no eviction; and a long-lived event emitter retaining every subscriber.',
      'Finding them: perform the suspect action repeatedly — open and close a modal twenty times — then take heap snapshots before and after and compare. The DevTools Memory panel can filter to **detached DOM nodes**, which is usually the fastest route to a front-end leak. The Performance panel\'s memory timeline shows the shape: a sawtooth that returns to baseline is healthy; a staircase that never comes down is a leak.',
      'Prevention is structural. Every subscription needs an owner responsible for teardown. `AbortController` with `{ signal }` removes many listeners at once and is much harder to get wrong than matching `removeEventListener` calls. Every cache needs a bound — a size limit or a TTL.',
      '`WeakMap` and `WeakSet` hold keys weakly, so an entry disappears when the key becomes otherwise unreachable. They are the right structure for associating metadata with DOM nodes or objects you do not own, precisely because they cannot keep the key alive.',
      'The honest caveat about testing this: garbage collection is not deterministic or observable. You cannot assert in a test that an object was collected, and `WeakRef`/`FinalizationRegistry` explicitly do not promise timing — the specification permits a collection never to happen. Detect leaks by measuring retained heap growth across many iterations, not by asserting a single object disappeared.',
    ],
    keyPoints: [
      'A leak is reachable-but-unneeded memory, not "GC failing"',
      'Listeners, timers, closures, detached DOM nodes and unbounded caches',
      'Compare heap snapshots across a repeated action; filter for detached nodes',
      'A staircase memory graph means a leak; a sawtooth is healthy',
      '`AbortController` for teardown; bound every cache; `WeakMap` for object metadata',
      'Collection timing is not observable — measure growth, never assert collection',
    ],
    commonMistakes: [
      'Claiming an object is collected immediately when the last reference is dropped.',
      'Writing a test that asserts garbage collection occurred.',
    ],
    followUps: ['Why is `WeakMap` the right choice for DOM metadata?', 'How would you demonstrate a leak in CI?'],
  },

  {
    id: 'iv-perf-bundle-size',
    question: 'The JavaScript bundle is 2MB. How do you approach reducing it?',
    topic: PERF,
    level: L.INTERMEDIATE,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'modules', 'tooling'],
    relatedLessons: ['l-m43-03', 'l-m28-04'],
    shortAnswer:
      'Analyse first — a bundle visualiser shows which dependencies dominate. Then: remove or replace oversized dependencies, split routes and heavy features behind dynamic `import()`, ensure tree shaking actually works, and defer anything not needed for the first paint.',
    deepAnswer: [
      'Start with a bundle analyser to see the actual composition. The answer is usually concentrated: a date library, a charting library, an icon set imported wholesale, a polyfill bundle for browsers you no longer support, or the same library included twice at two versions.',
      '**Dependency choices** give the biggest single wins. Replacing a large date library with `Intl.DateTimeFormat` and `Temporal`-style helpers, or a utility library with the handful of functions actually used, can remove hundreds of kilobytes. Check the alternatives on a size-comparison tool before adding anything.',
      '**Import shape** matters as much as the dependency. `import { debounce } from "lodash"` may pull the whole library if the package is not ESM and side-effect-free; `import debounce from "lodash/debounce"` or `lodash-es` does not. Tree shaking only works for static ESM imports, so a CommonJS dependency is effectively unshakeable.',
      '**Code splitting** is the structural fix. Route-level splitting with dynamic `import()` means the first page ships only what it needs. Then split heavy features that are conditionally used — a rich text editor, a chart, a PDF viewer — behind the interaction that opens them.',
      '`"sideEffects": false` in `package.json` tells the bundler that dropping unused modules is safe. Without it, bundlers must conservatively keep modules that might have side effects at import time.',
      'Load strategy is separate from size: `defer` and `type="module"` stop scripts blocking parsing, `preload` prioritises the critical bundle, and modern-only builds avoid shipping transpilation and polyfills to browsers that never needed them.',
      'Track the number over time. A bundle-size budget enforced in CI is what stops the 2MB from coming back — size regressions arrive one small dependency at a time, and nobody notices any single one.',
    ],
    keyPoints: [
      'Analyse first — the weight is usually concentrated in a few dependencies',
      'Replace oversized dependencies; check size before adding one',
      'Import shape matters; tree shaking needs static ESM and `sideEffects: false`',
      'Split by route, then by heavy conditional feature, with dynamic `import()`',
      'Use `defer`/modules, preload the critical bundle, ship modern-only builds',
      'Enforce a size budget in CI or the regression returns',
    ],
    commonMistakes: [
      'Assuming named imports are always tree-shaken.',
      'Optimising code you wrote while ignoring the dependencies that dominate.',
    ],
    followUps: ['Why does tree shaking fail for CommonJS?', 'What does `sideEffects: false` promise?'],
  },

  {
    id: 'iv-perf-premature',
    question: 'A colleague rewrites a `map` chain as a manual `for` loop "for performance". How do you respond?',
    topic: PERF,
    level: L.INTERMEDIATE,
    kind: K.SCENARIO,
    topicIds: ['performance', 'clean-code', 'array-methods'],
    relatedLessons: ['l-m43-01'],
    shortAnswer:
      'Ask for the measurement. For typical array sizes the difference is negligible and invisible next to network and rendering costs. If a profile genuinely shows this loop as a bottleneck, the rewrite is justified — and should carry a comment saying so.',
    deepAnswer: [
      'The factual position: a `for` loop can be measurably faster than a chain of `map`/`filter` for large arrays, mostly because a chain allocates an intermediate array per stage and calls a function per element. For 100,000 elements in a hot path that is real. For the 50 rows a UI usually renders, it is nanoseconds against a 200ms network request.',
      'So the response is not "never optimise" — it is "show me where this ranks". If the profile does not name this function, the rewrite trades readability for nothing measurable, and readability is what determines how many bugs the next person introduces here.',
      'When the array genuinely is large, the better first move is usually algorithmic rather than syntactic: avoid the multiple passes by combining stages, replace a nested `find` with a `Map` lookup to turn O(n²) into O(n), or avoid processing elements nobody will see. Those changes are worth orders of magnitude; loop-versus-`map` is worth a constant factor.',
      'Two more traps to name. Micro-benchmarks are notoriously misleading, because JIT compilers optimise a tight benchmark loop in ways they will not optimise the real call site, and results vary by engine and by data shape. And engines change: advice about which array method was slow in 2015 is not reliable today.',
      'The professional framing is about where effort goes. Bundle size, request waterfalls, long tasks and re-render counts dominate real front-end performance by orders of magnitude. Time spent on array-method micro-optimisation is time not spent on the things the profile actually blames.',
      'How to disagree well: do not block the change on principle. Ask what prompted it, offer to profile together, and agree that if it is measurable it stays with a comment recording the measurement — so the next person does not "clean it up" back to a chain.',
    ],
    keyPoints: [
      'Ask for the measurement rather than arguing from principle',
      'The difference is real for large arrays, negligible for typical UI sizes',
      'Algorithmic fixes beat syntactic ones by orders of magnitude',
      'Micro-benchmarks mislead; JIT behaviour differs from real call sites',
      'Bundle size, waterfalls and long tasks dominate real-world performance',
      'If it is justified, record the measurement in a comment',
    ],
    commonMistakes: [
      'Claiming array methods are always fine, or always slow — both are unmeasured.',
      'Accepting a micro-benchmark as evidence about production behaviour.',
    ],
    followUps: ['When is the rewrite actually justified?', 'Why are micro-benchmarks unreliable?'],
  },

  /* --------------------------------------------------------------- security */
  {
    id: 'iv-sec-token-storage',
    question: 'Where should an authentication token live in a browser application, and why?',
    topic: SEC,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['security', 'storage', 'http'],
    relatedLessons: ['l-m44-02'],
    shortAnswer:
      'In an `HttpOnly`, `Secure`, `SameSite` cookie set by the server. JavaScript cannot read it, so an XSS cannot exfiltrate it. `localStorage` is readable by any script on the origin, which makes any XSS an immediate credential theft.',
    deepAnswer: [
      'The comparison is between two different failure modes, and the honest answer names both.',
      '**`localStorage`**: readable by every script on the origin, including any third-party script you include and anything an XSS injects. It survives tab closure, is never sent automatically, and is therefore immune to CSRF. Its fatal weakness is that a single XSS reads the token and sends it anywhere.',
      '**`HttpOnly` cookie**: unreadable from JavaScript by design, so an XSS cannot exfiltrate it — though it can still make authenticated requests from the page while the user is there, which is a smaller blast radius but not zero. Because cookies are sent automatically, they need `SameSite=Lax` or `Strict` (plus CSRF tokens for cross-site flows) to prevent cross-site request forgery, and `Secure` so they are never sent over plain HTTP.',
      'The standard architecture: a short-lived access token, a long-lived refresh token in an `HttpOnly` cookie, and a refresh endpoint that rotates them. Short expiry limits how long a stolen token is useful; rotation with reuse detection lets the server revoke a whole session when a stolen refresh token is replayed.',
      'What not to do, in any storage: put secrets in a JWT payload. A JWT is signed, not encrypted — the payload is base64url and readable by anyone holding the token. Treat it as public data with a tamper-proof signature.',
      'There is no client-side API key that stays secret. Anything shipped to the browser is visible to the user, so a key that must remain private belongs on a server that proxies the call. Client-visible keys must be restricted by origin, scope and rate limit at the provider.',
      'Do not build your own authentication if you can avoid it. Session management, rotation, revocation and secure password handling are well-solved by established libraries and identity providers, and the failure modes of a bespoke implementation are severe and quiet.',
    ],
    keyPoints: [
      '`HttpOnly` + `Secure` + `SameSite` cookie is the default correct answer',
      '`localStorage` is readable by any script — XSS becomes credential theft',
      'Cookies need CSRF protection precisely because they are sent automatically',
      'Short-lived access token plus rotating refresh token limits exposure',
      'A JWT payload is readable — signed, not encrypted',
      'No client-side key is secret; proxy anything that must stay private',
    ],
    commonMistakes: [
      'Recommending `localStorage` because "cookies are vulnerable to CSRF" without weighing XSS.',
      'Putting sensitive data in a JWT payload.',
    ],
    followUps: ['What can an XSS still do against an `HttpOnly` cookie?', 'Why does `SameSite` matter?'],
  },

  {
    id: 'iv-sec-dependencies',
    question: 'How do you reduce the risk that comes from npm dependencies?',
    topic: SEC,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['security', 'tooling'],
    relatedLessons: ['l-m44-02', 'l-m45-01'],
    shortAnswer:
      'Depend on less, pin what you depend on with a committed lockfile, audit and update on a schedule rather than in a panic, and reduce what a compromised package can reach — CI secrets scoped narrowly, install scripts disabled where possible, and builds reproducible.',
    deepAnswer: [
      'The scale of the exposure is the first thing to state: a direct dependency brings its whole transitive tree, and every one of those packages runs with the same privileges as your build. A typical front-end project depends on hundreds of packages maintained by people nobody on the team has met.',
      '**Depend on less.** Every addition is a permanent liability — review size, maintenance activity, the number of transitive dependencies, and whether the standard library or twenty lines of your own code would do. A left-pad-sized dependency is rarely worth its supply-chain surface.',
      '**Pin and verify.** Commit the lockfile, install with `npm ci` in CI so the lockfile is authoritative, and be aware that a caret range means a future `npm install` can pull code nobody reviewed. Consider a delay policy — do not adopt a version on its release day — which blunts the window during which a compromised publish is live.',
      '**Audit continuously.** `npm audit` and automated dependency PRs (Dependabot, Renovate) surface known vulnerabilities. Triage them rather than treating every advisory as urgent: a prototype-pollution advisory in a build-time-only tool has a very different real risk from one in code that processes user input at runtime.',
      '**Limit the blast radius.** `npm ci --ignore-scripts` where the toolchain allows it removes the most common execution vector, since install scripts run automatically with full permissions. CI tokens should be scoped to what a job actually needs, and publish credentials should never be available to a build that only runs tests.',
      'Keep an inventory. Generating an SBOM makes "are we affected by this advisory?" a query rather than an investigation, which is the difference between responding in an hour and responding in a day.',
      'Have a response plan: how a bad version is rolled back, how secrets are rotated, and who decides. Supply-chain incidents are a question of when.',
    ],
    keyPoints: [
      'A direct dependency brings its whole transitive tree, running with build privileges',
      'Depend on less; evaluate size, maintenance and transitive count before adding',
      'Commit the lockfile and install with `npm ci`; caret ranges admit unreviewed code',
      'Automate audits and triage by real exposure, not advisory count',
      'Disable install scripts where possible; scope CI credentials narrowly',
      'Keep an SBOM and a rollback/rotation plan',
    ],
    commonMistakes: [
      'Treating `npm audit` output as the whole strategy.',
      'Not distinguishing a build-time-only vulnerability from a runtime one.',
    ],
    followUps: ['Why does a lockfile matter if versions are already ranged?', 'How do you triage an advisory?'],
  },

  {
    id: 'iv-sec-object-injection-defence',
    question: 'A function merges a JSON payload into a configuration object. What defensive measures does it need?',
    topic: SEC,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['security', 'objects', 'copying'],
    relatedLessons: ['l-m44-02'],
    shortAnswer:
      'Untrusted keys must never be allowed to reach special property names such as `__proto__`, `constructor` or `prototype`, because a naive recursive merge can end up writing to a shared prototype and affecting unrelated objects. Use an allowlist of expected keys, skip inherited and special names, and prefer `Map` or `Object.create(null)` for data-keyed structures.',
    deepAnswer: [
      'The risk class is **prototype pollution**: a deep merge or deep-set helper that walks keys from untrusted input can be steered into modifying an object that many other objects inherit from. The consequence is not localised — code elsewhere reads a property it never set and behaves differently. Defending against it is a well-understood, purely defensive practice.',
      'The concrete defences, in order of strength:',
      '**Validate against a schema.** Accept only the keys you expect, with the types you expect, and discard everything else. An allowlist is the only defence that does not depend on enumerating dangerous names correctly.',
      '**Reject special keys explicitly** in any recursive merge:\n\n```js\nconst FORBIDDEN = new Set(["__proto__", "constructor", "prototype"]);\n\nfunction safeAssign(target, source) {\n  for (const key of Object.keys(source)) {\n    if (FORBIDDEN.has(key)) continue;\n    if (!Object.hasOwn(source, key)) continue;\n    // ... recurse for plain objects, assign otherwise\n  }\n  return target;\n}\n```\n\n`Object.keys` plus `Object.hasOwn` keeps you to own enumerable properties, which is what a data merge should touch.',
      '**Use structures without a prototype.** `Object.create(null)` produces an object with no inherited properties at all, and a `Map` has no property semantics to abuse. For anything keyed by data rather than by code, `Map` is the better default anyway.',
      '**Freeze what should not change.** `Object.freeze(Object.prototype)` at startup is a blunt but effective mitigation in some applications; more practically, freeze your own configuration objects so unexpected writes fail loudly in strict mode.',
      '**Do not write the merge yourself** if you can avoid it. Maintained libraries have had these cases reported and fixed; a hand-rolled deep merge in application code has had one reviewer.',
      'The general principle this illustrates: data from outside should never be able to influence **which** property is written, only **what value** goes into a property you chose. Keeping key selection under your program\'s control is what makes a whole family of injection problems impossible.',
    ],
    keyPoints: [
      'A recursive merge over untrusted keys can write to a shared prototype',
      'Schema allowlisting is the strongest defence — accept only expected keys',
      'Explicitly skip `__proto__`, `constructor`, `prototype`; use `Object.hasOwn`',
      '`Object.create(null)` and `Map` remove prototype semantics entirely',
      'Freeze configuration so unexpected writes fail loudly',
      'Data should choose values, never which property is written',
    ],
    commonMistakes: [
      'Relying on a denylist of key names as the only defence.',
      'Writing a bespoke deep merge for untrusted input.',
    ],
    followUps: ['Why is an allowlist stronger than a denylist here?', 'When is `Object.create(null)` the right container?'],
  },

  /* ----------------------------------------------------------- architecture */
  {
    id: 'iv-arch-error-strategy',
    question: 'How do you decide where errors are handled in an application?',
    topic: ARCH,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['errors', 'clean-code', 'design-patterns'],
    relatedLessons: ['l-m22-04'],
    shortAnswer:
      'Handle an error where you can actually do something about it — usually near the top, where the UI context is known — and let it propagate everywhere else. Add context as it travels, distinguish expected failures from bugs, and never swallow an error just to make code quieter.',
    deepAnswer: [
      'The first distinction is between **expected failures** and **bugs**. A 404, a validation rejection or a network timeout is a normal outcome that the design should account for. A `TypeError` from reading a property of `undefined` is a defect. Handling both with one generic catch guarantees the second class is hidden.',
      'Expected failures are often better modelled as values than as exceptions. A function returning `{ ok: false, error }` makes the failure part of the type, which the caller cannot forget to consider — whereas an exception is invisible in the signature.',
      'Low-level code should generally **not** catch. It lacks the context to decide what to do, and catching there means the caller loses the ability to choose. Where it does catch, it should add context and rethrow: `throw new Error("Loading user " + id + " failed", { cause: err })`. `cause` preserves the original stack, which is what makes a wrapped error debuggable rather than a lie.',
      'The boundaries where handling belongs: a UI error boundary or top-level handler that shows something sensible instead of a blank screen; a per-request boundary that turns a failure into an inline message with a retry; and a global `window.onerror` / `onunhandledrejection` for reporting.',
      'Custom error types make branching honest. A `class HttpError extends Error` carrying `status` lets a caller retry a 503, re-authenticate on a 401, and show "not found" on a 404. String matching on error messages is the alternative, and it breaks on the first wording change.',
      'Distinguish **user-facing** from **diagnostic** messages. Users need what happened and what to do; engineers need the stack, the request id and the inputs. Showing a raw stack to a user is both unhelpful and an information leak.',
      'The one rule with no exceptions: never `catch {}` with an empty body. If an error is genuinely safe to ignore, say so in a comment explaining why — otherwise you have converted a loud failure into a silent one, which is strictly worse.',
    ],
    keyPoints: [
      'Separate expected failures from bugs; do not catch both the same way',
      'Model expected failures as return values where it fits',
      'Low-level code rethrows with added context and `cause`, rather than deciding',
      'Handle at boundaries: UI error boundary, per-request, global reporter',
      'Custom error types with a `status` beat string-matching messages',
      'Split user-facing messages from diagnostic detail',
      'Never swallow an error silently',
    ],
    commonMistakes: [
      'Wrapping every call in a `try`/`catch` that logs and continues.',
      'Losing the original error by wrapping without `cause`.',
    ],
    followUps: ['When is a result object better than an exception?', 'What does `cause` preserve?'],
  },

  {
    id: 'iv-arch-when-to-abstract',
    question: 'When should you extract a shared abstraction, and when should you leave the duplication?',
    topic: ARCH,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['clean-code', 'design-patterns'],
    relatedLessons: ['l-m40-03'],
    shortAnswer:
      'Extract when the duplicated code represents the same **decision**, so that a change to one should always change the other. Leave it when the similarity is coincidental — a premature abstraction over cases that later diverge is more expensive than the duplication it removed.',
    deepAnswer: [
      'DRY is about knowledge, not characters. Two functions that look identical but encode different business rules are not duplication; merging them creates a single function that two stakeholders now co-own, and the next divergence arrives as a boolean parameter.',
      'The signal that an abstraction is wrong is **flag arguments**. When `formatThing(x, { isAdmin, isCompact, legacy })` accumulates parameters that select between behaviours, the abstraction is holding apart things that were never the same. Two clear functions beat one parameterised one.',
      'The rule of three is a decent heuristic: at the second occurrence, note it; at the third, you can usually see which parts are genuinely shared and which are incidental. Abstracting from a single example means guessing at the axis of variation, and the guess is often wrong.',
      'Sandi Metz\'s framing is the one worth quoting in an interview: duplication is far cheaper than the wrong abstraction. Duplication is easy to find and easy to fix; a wrong abstraction is load-bearing, and unwinding it means changing every caller.',
      'The reverse mistake is real too: copy-paste that spreads a bug to six places, or a validation rule that drifts because nobody knew there were other copies. The cost of duplication is highest when the duplicated thing is a rule that must stay consistent.',
      'A useful test: if this changed, would every copy have to change? If yes, that is one piece of knowledge and it should live in one place. If some copies would change and others would not, they were never the same thing.',
      'Practical middle ground: extract the obviously-shared **mechanism** (a fetch wrapper, a formatting helper) early, and leave the **policy** duplicated until the pattern is clear. Mechanisms tend to be stable; policies diverge.',
    ],
    keyPoints: [
      'DRY is about shared knowledge, not identical characters',
      'Ask whether a change to one must always change the other',
      'Accumulating flag arguments is the sign of a wrong abstraction',
      'Rule of three: abstract when the axis of variation is visible',
      'The wrong abstraction costs more than the duplication it removed',
      'Extract stable mechanisms early; let divergent policy stay duplicated',
    ],
    commonMistakes: [
      'Deduplicating on visual similarity alone.',
      'Adding boolean parameters to preserve an abstraction that no longer fits.',
    ],
    followUps: ['How do you unwind a wrong abstraction?', 'Where is duplication most dangerous?'],
  },

  {
    id: 'iv-arch-state-management',
    question: 'How do you decide where a piece of state should live?',
    topic: ARCH,
    level: L.INTERMEDIATE,
    kind: K.ARCHITECTURE,
    topicIds: ['design-patterns', 'clean-code'],
    relatedLessons: ['l-m41-01'],
    shortAnswer:
      'Keep it as local as possible, and lift it only when something else genuinely needs it. Distinguish server cache, client UI state, form state and URL state — they have different lifetimes and different correct homes, and treating them all as one global store is the usual mistake.',
    deepAnswer: [
      'The categories, because they need different tools:\n\n- **Server state** — data fetched from an API. It is a cache of something you do not own, so it needs staleness, revalidation, deduplication and error states. This is what SWR and React Query exist for; a hand-rolled global store reimplements them badly.\n- **Client UI state** — is the modal open, which tab is selected. Local unless shared.\n- **Form state** — draft values and validation, usually local to the form and discarded on submit.\n- **URL state** — filters, search terms, pagination, the current record. Belongs in the URL so it survives reload and can be shared as a link.',
      'The default is the narrowest scope that works. Lifting state upward is easy later; pulling it back down after twenty components read it is not. Global-by-default makes every piece of state a potential source of coupling and re-rendering.',
      'Lift when two siblings must agree, or when a value must outlive the component that created it. That is a specific, observable trigger — not a guess about future needs.',
      'Watch for **derived state stored as state**. A `filteredItems` array kept alongside `items` and `filter` can go stale; computing it on render (memoized if measurement justifies it) has one source of truth and cannot disagree with itself. The same goes for a `count` beside a list.',
      'URL state is the most commonly missed. Putting filters in the URL costs almost nothing and gives shareable links, working back-button behaviour and reload survival for free — and users expect all three.',
      'On global stores generally: they are a good answer for genuinely cross-cutting client state such as the current user, theme or feature flags. They are a poor answer for server data, and a poor default for anything one screen owns.',
    ],
    keyPoints: [
      'Distinguish server cache, UI state, form state and URL state',
      'Server state needs staleness and revalidation — use a query cache, not a store',
      'Default to the narrowest scope; lift on a specific observable trigger',
      'Do not store derived state — compute it from one source of truth',
      'Filters, search and pagination belong in the URL',
      'Global stores suit cross-cutting client state, not fetched data',
    ],
    commonMistakes: [
      'Putting fetched API data in a global store and hand-rolling cache invalidation.',
      'Storing derived values that can drift from their source.',
    ],
    followUps: ['Why is server state a cache rather than state?', 'What does putting filters in the URL buy you?'],
  },

  {
    id: 'iv-arch-tech-debt',
    question: 'How do you argue for time to address technical debt?',
    topic: ARCH,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['clean-code', 'tooling'],
    relatedLessons: ['l-m45-02'],
    shortAnswer:
      'Translate it into the currency the decision-maker uses: delivery speed, defect rate, incident frequency, on-call load. "The code is ugly" is not an argument; "every change to checkout takes three days and causes a regression a third of the time" is.',
    deepAnswer: [
      'Start by distinguishing the kinds. **Deliberate debt** — a shortcut taken knowingly to hit a date — is a legitimate trade with a known cost. **Accidental debt** is what accumulates from decisions that made sense with less knowledge. **Rot** is code that was fine and became wrong as the system moved around it. They warrant different responses, and conflating them makes the conversation vague.',
      'Quantify with evidence people already trust: cycle time for changes in that area, the proportion of incidents tracing back to it, the number of bugs reopened, the time on-call spends there. Version-control history gives most of this without instrumentation.',
      'Tie it to something already on the roadmap. "The payments rewrite we are planning will take two extra weeks unless this is untangled first" gets funded; "we should clean up payments" does not. Debt work attached to upcoming feature work is easier to justify and easier to scope.',
      'Prefer incremental to a rewrite. A big-bang rewrite means a long period with no visible progress and a high failure rate; the strangler-fig approach — route new work through a new implementation, migrate callers gradually, delete the old path when it is empty — delivers value continuously and can be stopped at any point.',
      'The boy-scout rule is what prevents the debt from returning: leave each file slightly better than you found it, as part of normal work. That requires the team to accept slightly larger diffs, which is a cultural agreement rather than a technical one.',
      'Be honest about what is **not** worth fixing. Ugly code in a stable module nobody touches costs nothing. Prioritise by change frequency — the same signal that decides where tests go.',
      'And accept the answer sometimes. If the business genuinely needs the date more than the maintainability, record the decision and the expected cost so it is a considered trade rather than an accident — and so the conversation can be reopened with evidence later.',
    ],
    keyPoints: [
      'Translate debt into delivery speed, defect rate and incident load',
      'Distinguish deliberate debt, accidental debt and rot',
      'Use commit history and incident data as evidence',
      'Attach the work to a feature already on the roadmap',
      'Prefer incremental strangler-fig migration over a rewrite',
      'Prioritise by change frequency; ignore stable ugly code',
      'Record the decision when the answer is "not now"',
    ],
    commonMistakes: [
      'Arguing from aesthetics or personal preference.',
      'Proposing a rewrite as the default remedy.',
    ],
    followUps: ['Why do rewrites usually fail?', 'Which debt is safe to ignore?'],
  },

  /* ------------------------------------------------------------------- HTTP */
  {
    id: 'iv-http-status-codes',
    question: 'Which HTTP status codes should a front-end developer handle differently, and how?',
    topic: HTTP,
    level: L.JUNIOR_PLUS,
    kind: K.HTTP,
    topicIds: ['http', 'errors'],
    relatedLessons: ['l-m26-03'],
    shortAnswer:
      'Group them by what the client should do: 2xx succeed, 3xx follow (usually automatically), 4xx means the request was wrong so do not retry it, 5xx means the server failed so retrying may help. Within 4xx, 401, 403, 404, 409 and 429 each need distinct handling.',
    deepAnswer: [
      '**401 Unauthorized** — not authenticated, or the token expired. Refresh the token and retry once; if that fails, send the user to sign in. Retrying blindly just burns attempts.',
      '**403 Forbidden** — authenticated but not permitted. Do **not** redirect to sign-in; the user is already signed in and a redirect loop is the classic bug. Show that they lack access.',
      '**404 Not Found** — show an empty or not-found state, not an error banner. It is often a normal outcome rather than a failure.',
      '**409 Conflict** — the resource changed underneath, typically an optimistic-concurrency failure. Reload the current version and let the user reconcile; silently overwriting loses the other person\'s edit.',
      '**422** — validation failed; map the field errors from the response body onto the form rather than showing one generic message.',
      '**429 Too Many Requests** — rate limited. Respect the `Retry-After` header rather than guessing, and back off.',
      '**5xx** — the server failed. Retry with exponential backoff and jitter for idempotent requests, and show a "try again" affordance rather than a dead end. **503** in particular often carries `Retry-After`.',
      'The `fetch`-specific trap to state unprompted: none of these reject. `fetch` resolves for every response the server sent, so `res.ok` must be checked explicitly or a 500\'s HTML error page ends up in `res.json()` producing a misleading `SyntaxError`.',
      'A practical pattern is one error type carrying the status — `class HttpError extends Error { constructor(status, ...) }` — so callers branch on `err.status` rather than parsing messages. Centralising this in the API layer means each call site handles only what is genuinely specific to it.',
      'Also worth handling: **204 No Content** has no body, so calling `res.json()` on it throws even though the request succeeded.',
    ],
    keyPoints: [
      '4xx means the request was wrong — do not retry; 5xx may be worth retrying',
      '401 refresh-then-sign-in; 403 show a permission message, never redirect to sign-in',
      '404 is often an empty state, not an error',
      '409 means reload and reconcile; 422 maps onto form fields',
      '429 and 503: respect `Retry-After`',
      '`fetch` does not reject on any of these — check `res.ok`; `204` has no body',
    ],
    commonMistakes: [
      'Redirecting to sign-in on a 403 and creating a loop.',
      'Treating every non-2xx as one generic error.',
    ],
    followUps: ['Why is 404 often not an error?', 'What does `Retry-After` tell you?'],
  },

  {
    id: 'iv-http-caching',
    question: 'Explain HTTP caching headers and how they affect a single-page application deployment.',
    topic: HTTP,
    level: L.ADVANCED,
    kind: K.HTTP,
    topicIds: ['http', 'performance'],
    relatedLessons: ['l-m26-01', 'l-m43-03'],
    shortAnswer:
      '`Cache-Control` sets the freshness policy; `ETag`/`Last-Modified` enable revalidation. The standard SPA deployment is: hashed asset filenames cached immutably for a year, and `index.html` never cached — so a new deployment is picked up immediately while assets are served from cache.',
    deepAnswer: [
      '**`Cache-Control`** carries the policy. `max-age=N` is how long the response stays fresh without asking. `no-cache` means it may be stored but must be revalidated before reuse — it does **not** mean "do not store", which is `no-store`. `immutable` promises the content will never change at this URL, so the browser skips even the revalidation request.',
      '**Validators** handle what happens after expiry. The browser sends `If-None-Match` with the stored `ETag`, and the server replies `304 Not Modified` with no body if nothing changed — saving the transfer but not the round trip.',
      'The deployment pattern this enables:\n\n- `app.a1b2c3.js`, `styles.d4e5f6.css` — content-hashed names, served with `Cache-Control: public, max-age=31536000, immutable`. A new build produces new filenames, so there is never a stale-asset problem and never a revalidation request.\n- `index.html` — `Cache-Control: no-cache` (or a very short max-age). It must be revalidated every time, because it is what points at the current hashed filenames.',
      'Getting this backwards is the classic deployment bug: a cached `index.html` keeps referencing the previous build\'s assets, so users see an old application, or a half-updated one if some files were purged.',
      'API responses are a different problem. `no-store` for anything user-specific and sensitive; short `max-age` plus `ETag` for data that tolerates slight staleness. `stale-while-revalidate` is the useful middle ground — serve the cached copy immediately and refresh in the background.',
      '`Vary` matters whenever the response depends on a request header. Without `Vary: Accept-Encoding` or `Vary: Authorization`, a shared cache can serve one user\'s response to another — a correctness and privacy bug, not just a performance one.',
      'A service worker adds a cache the HTTP headers do not control, and it is the layer most likely to serve genuinely stale content after a deploy. Whatever caching strategy it implements needs an explicit update-and-activate path, or users can be stuck on an old version indefinitely.',
    ],
    keyPoints: [
      '`no-cache` means revalidate, not "do not store" — that is `no-store`',
      '`ETag`/`If-None-Match` give a 304 with no body, saving transfer not round trip',
      'Hashed asset filenames: `max-age=31536000, immutable`',
      '`index.html`: `no-cache`, so new deployments are picked up immediately',
      'API data: `no-store` when sensitive; `stale-while-revalidate` when staleness is tolerable',
      '`Vary` prevents a shared cache serving the wrong user\'s response',
      'A service worker caches outside these rules and needs its own update path',
    ],
    commonMistakes: [
      'Reading `no-cache` as "never cache".',
      'Caching `index.html` and pinning users to an old build.',
    ],
    followUps: ['Why does content hashing make `immutable` safe?', 'What breaks without `Vary`?'],
  },

  {
    id: 'iv-http-rest-design',
    question: 'How would you design the endpoints for a resource with filtering, pagination and partial updates?',
    topic: HTTP,
    level: L.INTERMEDIATE,
    kind: K.HTTP,
    topicIds: ['http'],
    relatedLessons: ['l-m26-04'],
    shortAnswer:
      'Nouns as paths, methods as verbs, filters and pagination as query parameters, `PATCH` for partial updates with `PUT` reserved for full replacement. Return the right status codes, envelope paginated responses with the cursor, and version the API from the start.',
    deepAnswer: [
      'The shape:\n\n- `GET /articles?status=published&tag=js&limit=20&cursor=abc` — collection with filtering and pagination.\n- `GET /articles/123` — one resource.\n- `POST /articles` — create; return `201 Created` with a `Location` header.\n- `PUT /articles/123` — full replacement, idempotent.\n- `PATCH /articles/123` — partial update.\n- `DELETE /articles/123` — remove; `204 No Content`.\n\nVerbs in paths (`/getArticles`, `/deleteArticle`) throw away the semantics the methods already carry — including caching and idempotency.',
      '**Pagination**: cursor-based beats offset-based for anything that changes. With `?offset=20`, an item inserted at the top shifts everything down and page two repeats an item page one already showed. A cursor points at a stable position, so insertions do not cause duplicates or skips. Offset is simpler and fine for static or small datasets, and it is the only one that supports jumping to page N.',
      '**Response envelope**: return `{ data: [...], nextCursor, total? }` rather than a bare array. A bare array leaves nowhere to put pagination metadata later without a breaking change. `total` is optional deliberately — counting can be expensive on large tables.',
      '**Filtering**: query parameters, documented and validated. Reject unknown parameters rather than ignoring them, so a typo in a filter is an error instead of a silently unfiltered result set — which is a real data-exposure risk.',
      '**Errors**: a consistent body shape with a machine-readable code, a human message, and per-field details for validation. RFC 9457 (`application/problem+json`) is the standard worth naming. Clients should branch on the code, never on the message text.',
      '**Versioning** from day one — `/v1/` in the path, or a version header. Retrofitting a version onto an unversioned API means every client breaks at once.',
      'Two further considerations: nesting should stop at one level (`/articles/123/comments` is fine; three levels deep becomes unusable), and any endpoint returning a list needs a maximum `limit` enforced server-side, or one client will ask for everything.',
    ],
    keyPoints: [
      'Nouns in paths, methods as verbs; no verbs in URLs',
      'Cursor pagination for changing data; offset only for static or page-jumping',
      'Envelope the response so metadata can be added without a breaking change',
      'Validate and reject unknown query parameters',
      'Consistent machine-readable error bodies; clients branch on codes',
      'Version from day one; cap `limit` server-side; keep nesting shallow',
    ],
    commonMistakes: [
      'Using offset pagination on a frequently-changing collection.',
      'Returning a bare array with no room for pagination metadata.',
    ],
    followUps: ['Why does offset pagination duplicate items?', 'When is `PUT` preferable to `PATCH`?'],
  },

  /* ------------------------------------------------------------- refactoring */
  {
    id: 'iv-refactor-long-function',
    question: 'You are handed a 300-line function. How do you break it up safely?',
    topic: ARCH,
    level: L.INTERMEDIATE,
    kind: K.REFACTORING,
    topicIds: ['clean-code', 'functions'],
    relatedLessons: ['l-m40-02'],
    shortAnswer:
      'Pin the current behaviour with a characterisation test first. Then extract along the seams the code already has — the comment-headed sections, the blocks with few shared variables — one at a time, running the tests after each step. Do not restructure and change behaviour in the same commit.',
    deepAnswer: [
      '**Safety first.** Without tests, every extraction is a guess. Write characterisation tests that capture what it currently does — including the odd behaviour you suspect is a bug — so that any change in behaviour shows up immediately. Fix the bugs afterwards, deliberately, as separate commits.',
      '**Find the seams.** Long functions usually have visible sections: comment headers, blank-line-separated blocks, or a run of statements that touch a disjoint set of variables. That variable-locality signal is the most reliable one — a block that reads three locals and writes one is a function waiting to be named.',
      '**Extract one at a time**, run the tests, commit. A single 300-line commit that "cleans up" is unreviewable and unbisectable; ten small commits are both.',
      '**Name by intent, not mechanics.** `calculateShippingCost` rather than `processStep3`. If a good name is hard to find, the extraction boundary is probably wrong — that difficulty is useful information, not an obstacle to push through.',
      '**Reduce the parameter list.** An extracted function taking eight parameters has been cut in the wrong place. Either the boundary is wrong, or those parameters are a concept that wants to be an object.',
      '**Separate the pure from the effectful.** Pulling the calculation apart from the I/O and DOM work usually accounts for most of the improvement on its own: the pure part becomes trivially testable, and the remaining effectful shell becomes short enough to read.',
      'Let the tooling do the mechanical work where it can — editor "extract function" refactorings are less error-prone than manual cut and paste, particularly around closures over local variables.',
      'And know when to stop. The goal is a function you can hold in your head, not the smallest possible functions. Ten one-line functions with a call graph nobody can follow is a different failure of the same kind.',
    ],
    keyPoints: [
      'Characterisation tests before touching anything',
      'Find seams by variable locality, not just by comments',
      'One extraction per commit, tests run each time',
      'Name by intent; a hard name means a wrong boundary',
      'A long parameter list means the cut is in the wrong place',
      'Separating pure logic from effects gives most of the benefit',
      'Stop when it is readable, not when the functions are tiny',
    ],
    commonMistakes: [
      'Refactoring and fixing bugs in the same commit.',
      'Extracting until the call graph is harder to follow than the original.',
    ],
    followUps: ['What does a hard-to-name extraction tell you?', 'Why separate pure logic from effects first?'],
  },

  {
    id: 'iv-refactor-callback-to-async',
    question: 'How do you modernise deeply nested callback code, and what should you be careful about?',
    topic: ARCH,
    level: L.INTERMEDIATE,
    kind: K.REFACTORING,
    topicIds: ['async-await', 'promises', 'clean-code'],
    relatedLessons: ['l-m25-01'],
    code: [
      'getUser(id, (err, user) => {',
      '  if (err) return done(err);',
      '  getOrders(user.id, (err, orders) => {',
      '    if (err) return done(err);',
      '    getShipping(orders[0].id, (err, shipping) => {',
      '      if (err) return done(err);',
      '      done(null, { user, orders, shipping });',
      '    });',
      '  });',
      '});',
    ].join('\n'),
    shortAnswer:
      'Promisify the leaf functions, then rewrite the chain as sequential `await`s inside a `try`/`catch`. The care points are preserving the exact error semantics, not accidentally serialising work that used to be concurrent, and converting one layer at a time rather than the whole tree at once.',
    deepAnswer: [
      'The result:\n\n```js\nasync function loadOrderContext(id) {\n  const user = await getUser(id);\n  const orders = await getOrders(user.id);\n  const shipping = await getShipping(orders[0].id);\n  return { user, orders, shipping };\n}\n```\n\nOne `try`/`catch` at the call site replaces three repeated error branches, and the sequence reads top to bottom.',
      'The mechanical step is promisifying the leaves — either `util.promisify`, a hand-rolled wrapper, or the library\'s own promise API if it has gained one. Do the leaves first and work outward, so each step is small and testable.',
      '**Watch the error semantics.** Callback code often has subtly different behaviour per branch — one path logs and continues, another aborts. A single `catch` flattens those distinctions. Read each branch before collapsing it.',
      '**Watch for lost concurrency.** Callback code sometimes fires several operations in parallel and joins them with a counter. Rewriting that as sequential `await`s is correct but slower — often much slower. Independent operations belong in `Promise.all`:\n\n```js\nconst [profile, settings] = await Promise.all([getProfile(id), getSettings(id)]);\n```\n\nHere `getOrders` genuinely depends on `user`, so sequential is right — but that must be checked, not assumed.',
      '**Watch the edges.** `orders[0]` throws if `orders` is empty, and in callback style that throw lands inside a callback where the outer `try` cannot see it. Under `await` it becomes catchable — an improvement, but one that changes which code path runs.',
      'Do it incrementally with tests around each converted layer. A big-bang conversion of a callback tree is exactly the change most likely to alter behaviour invisibly, because the error paths are the least-tested part of the original.',
      'And modernising is not automatically worth it. Working, tested, rarely-touched callback code has real value; the conversion pays off where the code is actively changed and the nesting is slowing people down.',
    ],
    keyPoints: [
      'Promisify the leaves and work outward, one layer per commit',
      'One `try`/`catch` replaces repeated error branches — check they were identical',
      'Do not serialise operations that were concurrent; use `Promise.all`',
      'Errors thrown inside callbacks become catchable under `await` — a behaviour change',
      'Test around each converted layer; error paths are the least-tested part',
      'Modernising stable, rarely-touched code may not be worth it',
    ],
    commonMistakes: [
      'Converting parallel callback code into sequential awaits and slowing it down.',
      'Collapsing per-branch error handling into one catch without reading the branches.',
    ],
    followUps: ['How do you spot concurrency in callback code?', 'When would you leave callback code alone?'],
  },
];

export default questions;
