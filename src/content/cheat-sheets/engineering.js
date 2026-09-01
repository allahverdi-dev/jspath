import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Engineering practice: errors, testing, performance, security, algorithms, and
 * a last-minute interview review.
 *
 * The security sheet is defensive throughout — it names what to do and what
 * never counts as a control. The review sheet is deliberately a set of one-line
 * corrections, not a second question bank.
 */

export default [
  {
    id: 'cs-errors',
    slug: 'error-handling',
    title: 'Error Handling & Debugging',
    category: C.ENGINEERING,
    icon: 'bug_report',
    aliases: ['error', 'try catch', 'throw', 'debugging', 'TypeError', 'custom error', 'cause'],
    topicIds: ['errors', 'debugging'],
    description: 'Which error type means what, how to add context without losing the original, and a debugging checklist.',
    groups: [
      {
        title: 'Built-in error types',
        kind: G.TABLE,
        columns: ['Type', 'Means', 'Typical cause'],
        rows: [
          ['`TypeError`', 'wrong type, or an illegal operation on it', '`undefined.x`, calling a non-function'],
          ['`ReferenceError`', 'the name does not resolve', 'undeclared variable, TDZ access'],
          ['`SyntaxError`', 'could not be parsed', 'bad syntax; also `JSON.parse` at runtime'],
          ['`RangeError`', 'value outside its allowed range', '`arr.length = -1`, stack overflow'],
          ['`AggregateError`', '**several** errors at once', '`Promise.any` when all reject'],
        ],
        note: 'A parse-time `SyntaxError` cannot be caught by code in the same file. Throw the accurate class from your own validation too — a wrong type is a `TypeError`, an out-of-range number is a `RangeError`.',
      },
      {
        title: 'throw and catch',
        kind: G.SNIPPETS,
        entries: [
          { code: 'throw new Error("Loading failed");   // ✓\nthrow "Loading failed";              // ✗ no stack', description: '**Always throw an `Error`.** Only an `Error` carries a stack trace, and every `catch` in the ecosystem assumes `err.message` exists.' },
          { code: 'try { … }\ncatch (err) { … }\nfinally { hideSpinner(); }', description: '`finally` always runs. A `return` inside it **overrides** the pending return and swallows an in-flight exception — linters ban this.' },
          { code: 'throw new Error("Loading user failed", { cause: err });', description: '`cause` keeps the original inspectable at `err.cause`. Wrapping without it destroys the diagnosis.' },
        ],
      },
      {
        title: 'Custom errors',
        kind: G.SNIPPETS,
        entries: [
          { code: 'class HttpError extends Error {\n  constructor(status, message) {\n    super(message);\n    this.name = "HttpError";   // must set it yourself\n    this.status = status;\n  }\n}', description: 'Lets callers branch on `err.status` instead of matching message strings, which break on the first wording change.' },
        ],
      },
      {
        title: 'Where to handle',
        kind: G.RULES,
        items: [
          'Separate **expected failures** (404, validation, timeout) from **bugs** (`TypeError`). One generic catch hides the second kind.',
          'Low-level code should usually **not** catch — it lacks the context to decide. Rethrow with added `cause`.',
          'Handle at **boundaries**: a UI error boundary, a per-request handler, and a global reporter.',
          'Model expected failures as **return values** (`{ ok: false, error }`) where it fits — an exception is invisible in the signature.',
          '**Never `catch {}` with an empty body.** If ignoring is genuinely right, say why in a comment.',
          'Split user-facing messages from diagnostic detail — a raw stack is both unhelpful and an information leak.',
        ],
      },
      {
        title: 'Unhandled rejections',
        kind: G.RULES,
        items: [
          'A rejected promise with no handler by the end of the microtask checkpoint is **unhandled** — Node exits by default; browsers fire `window.onunhandledrejection`.',
          'Common sources: a floating `async` call, a chain with no `.catch`, `forEach` with an `async` callback.',
          'Deliberate fire-and-forget should be explicit: `void doThing().catch(report)`.',
        ],
      },
      {
        title: 'Debugging checklist',
        kind: G.RULES,
        items: [
          '**Read the error type and the top stack frame** — it usually names the exact line.',
          'Reproduce it reliably before changing anything.',
          'Check the **Network** tab: is the request even happening, and what status came back?',
          '`console.log` objects, not concatenated strings — devtools shows them **live**, so log a snapshot if the object will change.',
          'Binary-search the change: what worked most recently, and what differs?',
          '`debugger;` plus a conditional breakpoint beats a hundred logs in a loop.',
          'Reach for `console.trace()` to answer "who called this?".',
        ],
      },
    ],
    relatedLessons: ['l-m22-02', 'l-m22-03', 'l-m22-04', 'l-m22-05'],
    relatedReference: ['ref-error-ctor', 'ref-error-types', 'ref-error-aggregate', 'ref-console-log'],
    relatedChallenges: ['ch-eng-error-chain', 'ch-eng-parse-safely', 'ch-eng-find-the-bug'],
  },

  {
    id: 'cs-testing',
    slug: 'testing',
    title: 'Testing',
    category: C.ENGINEERING,
    icon: 'science',
    aliases: ['testing', 'unit test', 'mock', 'spy', 'arrange act assert', 'coverage'],
    topicIds: ['testing'],
    description: 'What each level proves, the doubles vocabulary, and how to write async tests that can actually fail.',
    groups: [
      {
        title: 'Levels',
        kind: G.TABLE,
        columns: ['Level', 'Covers', 'Cost'],
        rows: [
          ['**Unit**', 'pure logic with many branches', 'milliseconds — be exhaustive'],
          ['**Integration**', 'modules wired together, network faked', 'the best confidence per second'],
          ['**E2E**', 'a few critical journeys, real stack', 'slow, flaky — keep the set small'],
        ],
        note: 'Most real front-end bugs are **wiring** bugs — a wrong prop, a missing `await`, a state update that never reaches the view — which is why the integration layer usually deserves the most weight.',
      },
      {
        title: 'Arrange, Act, Assert',
        kind: G.SNIPPETS,
        entries: [
          { code: 'test("expires after the deadline", () => {\n  const token = createToken(new Date("2024-01-15T12:00:00Z")); // Arrange\n  const result = isExpired(token, new Date("2024-03-01T00:00:00Z")); // Act\n  expect(result).toBe(true);                                   // Assert\n});', description: 'One behaviour per test. The name should describe the behaviour, not the function.' },
        ],
      },
      {
        title: 'Test doubles',
        kind: G.TABLE,
        columns: ['Double', 'Does', 'Assert on'],
        rows: [
          ['**Stub**', 'returns canned values', 'the outcome'],
          ['**Spy**', 'records how it was called', 'the call, when that *is* the effect'],
          ['**Mock**', 'has built-in expectations', 'the interaction'],
          ['**Fake**', 'a working simplified implementation', 'the outcome — usually best'],
        ],
        note: 'Mock at **boundaries you do not own** — network, clock, randomness, filesystem. Mocking your own modules and asserting on internal call patterns produces tests that break on every refactor **and** pass when the code is broken.',
      },
      {
        title: 'What to cover',
        kind: G.RULES,
        items: [
          '**Normal case** — the happy path with realistic data.',
          '**Boundaries** — `0`, `1`, empty, maximum, exactly at the threshold, and **both sides** of it.',
          '**Edge cases** — `null`, `undefined`, empty string, empty array, duplicates, unicode.',
          '**Failure paths** — 4xx, 5xx, malformed JSON, network rejection, timeout.',
          'Every **bug fix** gets a test that fails before the fix. It is the highest-value test you will write.',
        ],
      },
      {
        title: 'Async tests',
        kind: G.SNIPPETS,
        entries: [
          { code: 'await expect(loadUser(1)).resolves.toMatchObject({ id: 1 });', description: 'A **forgotten `await`** on an assertion is the classic test that can never fail.' },
          { code: 'setTimeout(() => expect(x).toBe(1), 100);  // ✗', description: 'Never assert after a fixed sleep. Use fake timers, or poll for the condition with a deadline (`waitFor`).' },
          { code: 'const fakeFetch = async (url) =>\n  new Response(JSON.stringify(fixtures[url]), { status: 200 });', description: 'Inject the network. **No unit test should reach the internet** — it is slow, non-deterministic, and fails when someone else\'s service does.' },
        ],
      },
      {
        title: 'Rules',
        kind: G.RULES,
        items: [
          'Test **behaviour, not implementation**. Query by role/label/text; assert on what a user would see.',
          'Ask of every test: **what failure would this have caught?** A test asserting one function called another catches nothing a user notices.',
          '**Coverage is a signal, not proof.** It shows what is definitely untested; it cannot show that what ran was meaningfully asserted.',
          'Prove a test can fail — break the code on purpose and watch it go red.',
          'A flaky test is usually an **ambient input**: clock, timezone, locale, randomness, network, or shared state between tests. Retries hide a real race rather than fixing it.',
        ],
      },
    ],
    relatedLessons: ['l-m42-01', 'l-m42-02', 'l-m42-03'],
    relatedReference: ['ref-date-now', 'ref-math-random', 'ref-response'],
    relatedChallenges: ['ch-eng-assert', 'ch-eng-find-the-bug'],
  },

  {
    id: 'cs-performance',
    slug: 'performance',
    title: 'Performance',
    category: C.ENGINEERING,
    icon: 'speed',
    aliases: ['performance', 'debounce', 'throttle', 'reflow', 'layout thrashing', 'memory leak', 'bundle size'],
    topicIds: ['performance'],
    description: 'Measure first, then the handful of techniques that actually move the numbers.',
    groups: [
      {
        title: 'Measure before changing anything',
        kind: G.RULES,
        items: [
          'Pin down **which** metric is bad: **LCP** (main content appears), **INP** (responds to input), **CLS** (visual stability). Three different problems.',
          'Throttle CPU 4–6× and the network — a developer machine hides almost every real problem.',
          'Read the Performance profile: wide network waterfall = loading; long yellow = script; purple = layout/paint.',
          'A **long task** is anything over ~50ms. That is what makes a page feel unresponsive.',
          'Re-measure after the change. Intuition about JavaScript performance is unreliable, and unverified optimisation is pure cost.',
        ],
      },
      {
        title: 'Debounce vs throttle',
        kind: G.TABLE,
        columns: ['', 'Debounce', 'Throttle'],
        rows: [
          ['Fires', 'once **after** activity stops', 'at most once **per interval, during**'],
          ['Use for', 'search-as-you-type, autosave, resize', 'scroll position, mousemove, analytics'],
          ['If activity never stops', '**never fires**', 'keeps firing at the rate'],
        ],
        note: 'They are not interchangeable. Debouncing a scroll handler means nothing happens while the user is scrolling. For layout work, `requestAnimationFrame` is usually a better throttle than a millisecond interval.',
      },
      {
        title: 'Layout thrashing',
        kind: G.SNIPPETS,
        entries: [
          { code: 'for (const el of els) {\n  el.style.height = el.offsetHeight * 2 + "px";  // ✗\n}', description: 'Each read after a write forces a **synchronous layout** — 500 elements becomes 500 layout passes.' },
          { code: 'const heights = els.map((el) => el.offsetHeight);  // all reads\nels.forEach((el, i) => {\n  el.style.height = heights[i] * 2 + "px";         // all writes\n});', description: 'Batch reads, then writes: one layout pass. DevTools flags forced synchronous layout and names the trigger.' },
        ],
      },
      {
        title: 'The main thread',
        kind: G.RULES,
        items: [
          'Script, layout, paint and input **share one thread** — a long synchronous block freezes all of them.',
          'First **do less work**: memoize, index with a `Map`, render only what is visible.',
          '**Web Workers** for genuinely expensive pure computation — no DOM access, and messages are structured-cloned so the payload size matters.',
          '**Chunk and yield explicitly.** `async` alone does **not** yield; an `async` function running a synchronous loop blocks exactly as long.',
          'Animate `transform` and `opacity` — they skip layout and paint. Avoid animating `top`/`width`.',
          '**Virtualise long lists**: render the visible window, not 10,000 rows.',
        ],
      },
      {
        title: 'Network & loading',
        kind: G.RULES,
        items: [
          'Analyse the bundle — the weight is usually a few dependencies, not your code.',
          'Split by **route**, then by heavy conditional feature, with dynamic `import()`.',
          'Use `defer` or `type="module"`; inline critical CSS and defer the rest.',
          'Deduplicate in-flight requests by caching the **promise**, and cache responses with a TTL.',
          'Lazy-load images with `loading="lazy"`, and set explicit dimensions to avoid layout shift.',
          'Enforce a bundle-size budget in CI, or the regression returns one small dependency at a time.',
        ],
      },
      {
        title: 'Memory leaks',
        kind: G.RULES,
        items: [
          'A leak is memory that is still **reachable** but no longer needed.',
          'Usual causes: listeners never removed, timers never cleared, **detached DOM nodes** still referenced, unbounded caches, a long-lived emitter retaining subscribers.',
          'Find them by comparing **heap snapshots** across a repeated open/close, and filtering for detached nodes. A staircase memory graph is a leak; a sawtooth is healthy.',
          'Prevent with `AbortController` signals for teardown, and a size or TTL bound on every cache.',
          '**Collection timing is not observable** — never assert in a test that an object was garbage-collected. Measure retained growth instead.',
        ],
      },
    ],
    relatedLessons: ['l-m43-01', 'l-m43-02', 'l-m43-03'],
    relatedReference: ['ref-performance-now', 'ref-requestanimationframe', 'ref-intersectionobserver', 'ref-weakmap'],
    relatedChallenges: ['ch-fn-debounce', 'ch-eng-batch-writes', 'ch-eng-memo-cache-size'],
  },

  {
    id: 'cs-security',
    slug: 'security',
    title: 'Security',
    category: C.ENGINEERING,
    icon: 'shield',
    aliases: ['security', 'xss', 'cors', 'authentication', 'authorization', 'secrets', 'sanitize'],
    topicIds: ['security'],
    description: 'Defensive front-end essentials: the trust boundary, XSS prevention, and what never counts as a control.',
    groups: [
      {
        title: 'The trust boundary',
        kind: G.RULES,
        items: [
          'The boundary is the **server**. Everything before it runs on a machine the user fully controls and can modify.',
          'So every client-side check can be bypassed by sending the request directly.',
          'Client validation is a **user-experience feature**. The server must revalidate types, ranges, business rules **and authorisation**.',
          'Untrusted input includes: form fields, URL parameters, `localStorage`, `postMessage`, API responses, **and your own database** — because that data originally came from a user.',
        ],
      },
      {
        title: 'XSS — prevent by construction',
        kind: G.SNIPPETS,
        entries: [
          { code: 'el.textContent = untrusted;   // ✓ never parsed as markup', description: 'The primary defence. There is no parsing step in which a tag could be recognised, so it needs no escaping of its own.' },
          { code: 'el.innerHTML = `<li>${untrusted}</li>`;  // ✗', description: '`<img src=x onerror=…>` executes without any `<script>` tag — "I strip script tags" is not a defence.' },
          { code: 'const url = new URL(raw);\nif (!["http:", "https:"].includes(url.protocol)) reject();', description: 'URLs need a **scheme allowlist**, not escaping — a perfectly escaped `javascript:` href still runs on click.' },
        ],
      },
      {
        title: 'The dangerous sinks',
        kind: G.RULES,
        items: [
          '`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`',
          '`eval`, `new Function`, `setTimeout("string")`',
          'Assigning a string to `el.onclick`, and `href` / `src` from untrusted input',
          'If untrusted data can reach any of them, that is the bug. For genuine rich text, use a **maintained sanitiser** (DOMPurify) — never write your own.',
        ],
      },
      {
        title: 'Auth vs authorisation',
        kind: G.TABLE,
        columns: ['', 'Question', 'Failure'],
        rows: [
          ['**Authentication**', 'who are you?', '**401** — sign in'],
          ['**Authorisation**', 'are you allowed to do this?', '**403** — no access'],
        ],
        note: '**Hiding a button is not authorisation.** The server must independently verify that this user may perform this action on this resource. A 403 must never redirect to sign-in — the user is already signed in, and you get a loop.',
      },
      {
        title: 'Tokens and secrets',
        kind: G.RULES,
        items: [
          'Session tokens belong in an **`HttpOnly`, `Secure`, `SameSite` cookie** — JavaScript cannot read it, so an XSS cannot exfiltrate it.',
          '`localStorage` is readable by **any script on the origin**, so a token there is one XSS away from theft.',
          'Because cookies are sent automatically they need `SameSite` plus CSRF protection. The two approaches trade different risks.',
          '**A JWT payload is signed, not encrypted** — it is base64url and readable by anyone holding it. Never put secrets in it.',
          '**There is no client-side secret.** Anything shipped to the browser is visible, including every build-time environment variable. A key that must stay private belongs on a server that proxies the call.',
          'Use `crypto.randomUUID()` / `crypto.getRandomValues()` for tokens — **never `Math.random()`**.',
        ],
      },
      {
        title: 'CORS is not access control',
        kind: G.RULES,
        items: [
          'CORS is **browser-enforced**, relaxing the same-origin policy so a server can opt in to being read cross-origin.',
          'It blocks **reading the response** — the request may still have reached the server and had its effect.',
          '`curl` and every non-browser client ignore it entirely, so the API still needs its own auth.',
          'Fix CORS errors in **server configuration**, with an explicit origin allowlist. `Access-Control-Allow-Origin: *` on an authenticated API is a misconfiguration.',
        ],
      },
      {
        title: 'Also worth knowing',
        kind: G.RULES,
        items: [
          '**CSP** without `unsafe-inline` blocks injected inline handlers even if something slips through — defence in depth.',
          '**Prototype pollution**: a recursive merge over untrusted keys can write to a shared prototype. Allowlist expected keys; skip `__proto__`, `constructor`, `prototype`; prefer `Map` or `Object.create(null)`.',
          '**Dependencies** run with your build\'s privileges. Depend on less, commit the lockfile, install with `npm ci`, and triage advisories by real exposure.',
          'Encode for the **destination context** and parameterise queries — filtering "dangerous characters" is not a strategy.',
        ],
      },
    ],
    relatedLessons: ['l-m44-01', 'l-m44-02', 'l-m20-06', 'l-m26-06'],
    relatedReference: ['ref-dom-textcontent', 'ref-dom-innerhtml', 'ref-storage-local', 'ref-crypto-randomuuid'],
    relatedChallenges: ['ch-sec-safe-redirect', 'ch-sec-sanitize-filename', 'ch-eng-parse-safely'],
  },

  {
    id: 'cs-algorithms',
    slug: 'algorithms-big-o',
    title: 'Algorithms & Big O',
    category: C.ENGINEERING,
    icon: 'insights',
    aliases: ['big o', 'complexity', 'algorithms', 'two pointers', 'sliding window', 'binary search', 'bfs dfs'],
    topicIds: ['algorithms', 'data-structures', 'recursion'],
    description: 'Complexity classes, the operation costs that actually bite, and the five patterns that solve most problems.',
    groups: [
      {
        title: 'Complexity classes',
        kind: G.TABLE,
        columns: ['Class', 'Name', 'Typical'],
        rows: [
          ['**O(1)**', 'constant', 'object/`Map` lookup, `push`, `pop`'],
          ['**O(log n)**', 'logarithmic', 'binary search, balanced tree'],
          ['**O(n)**', 'linear', 'one pass: `map`, `filter`, `includes`'],
          ['**O(n log n)**', 'linearithmic', '`sort` — the practical floor for comparison sorting'],
          ['**O(n²)**', 'quadratic', 'nested loop over the same array'],
          ['**O(2ⁿ)**', 'exponential', 'naive recursion over subsets'],
        ],
        note: 'Big O describes **growth**, not speed. O(n) with a huge constant can lose to O(n²) on small inputs — but the growth is what decides whether it survives real data.',
      },
      {
        title: 'Costs people miss',
        kind: G.TABLE,
        columns: ['Operation', 'Cost', 'Why'],
        rows: [
          ['`arr.shift()` / `unshift()`', '**O(n)**', 'every element is re-indexed'],
          ['`arr.splice(i, …)`', '**O(n)**', 'the tail shifts'],
          ['`arr.includes` in a loop', '**O(n²)**', 'use a `Set` → O(n)'],
          ['`{ ...acc }` inside `reduce`', '**O(n²)**', 'copies the whole object each pass'],
          ['`queue.shift()` in BFS', '**O(n²)**', 'advance an index instead'],
          ['`[...map.keys()][0]`', '**O(n)**', 'use `map.keys().next().value`'],
        ],
      },
      {
        title: 'Patterns',
        kind: G.RULES,
        items: [
          '**Frequency counter** — count with a `Map`/object, then compare. Turns "compare every pair" O(n²) into O(n). *Anagrams, duplicates, top-k.*',
          '**Two pointers** — one from each end, or fast/slow. Needs sorted or positional structure. *Pair-sum, palindrome, in-place compaction.*',
          '**Sliding window** — expand right, shrink left, keep a running summary. *Longest substring, max subarray of size k.*',
          '**Binary search** — halve a sorted range. *Search, first/last occurrence, "smallest value that works".*',
          '**BFS / DFS** — queue for BFS, stack (or recursion) for DFS. *Shortest hops = BFS; paths and post-order = DFS.*',
        ],
      },
      {
        title: 'Structure choice',
        kind: G.TABLE,
        columns: ['Need', 'Use', 'Lookup'],
        rows: [
          ['key → value', '`Map` / object', 'O(1)'],
          ['membership / dedupe', '`Set`', 'O(1)'],
          ['LIFO', 'array `push`/`pop`', 'O(1)'],
          ['FIFO', 'array + head index', 'O(1) amortised'],
          ['ordered by priority', 'heap', 'O(log n) insert/extract'],
          ['prefix search', 'trie', 'O(length)'],
        ],
      },
      {
        title: 'Before you code',
        kind: G.RULES,
        items: [
          '**Ask clarifying questions**: duplicates allowed? sorted? empty input? return index or value? ties? Interviewers score this as highly as the code.',
          'State the **brute force** and its complexity first, then improve on it — that shows the trade you are making.',
          'Name the trade out loud: extra O(n) space to drop from O(n²) to O(n) time is the classic one.',
          'Handle **empty, one element, all identical, and the boundary** cases.',
          'Recursion depth is bounded (~10,000 frames) — tail-call optimisation is specified but **not implemented** in practice, so convert to an explicit stack for deep or untrusted data.',
          'Any **graph** traversal needs a visited `Set` or it loops forever on a cycle.',
        ],
      },
    ],
    relatedLessons: ['l-m39-01', 'l-m39-02', 'l-m39-03'],
    relatedReference: ['ref-array-sort', 'ref-map-ctor', 'ref-set-ctor', 'ref-array-shift'],
    relatedChallenges: ['ch-algo-two-sum', 'ch-algo-binary-search', 'ch-algo-longest-unique', 'ch-ds-priority-queue'],
  },

  {
    id: 'cs-interview-review',
    slug: 'interview-quick-review',
    title: 'Interview Quick Review',
    category: C.ENGINEERING,
    icon: 'timer',
    aliases: ['interview', 'revision', 'quick review', 'last minute', 'common mistakes'],
    topicIds: ['interview'],
    description: 'The last-minute pass: one-line corrections to the mistakes candidates most often make out loud.',
    groups: [
      {
        title: 'Say it this way',
        kind: G.TABLE,
        columns: ['Do not say', 'Say instead'],
        rows: [
          ['"`let` is not hoisted"', 'the binding exists but is **uninitialised** — the TDZ'],
          ['"JavaScript is asynchronous"', 'single-threaded; the **host** provides async APIs'],
          ['"Promises run asynchronously"', 'the **executor is synchronous**; reactions are microtasks'],
          ['"`this` refers to the object"', '`this` is decided by the **call site**'],
          ['"arrows bind `this` to their object"', 'arrows have **no own `this`** — it is lexical'],
          ['"closures cause memory leaks"', 'an **uncleaned-up reference** does; the closure is how it is held'],
          ['"`fetch` rejects on 404"', '`fetch` resolves — **check `res.ok`**'],
          ['"`Object.freeze` deeply freezes"', 'it is **shallow**'],
          ['"`const` objects cannot change"', '`const` blocks **rebinding**, not mutation'],
          ['"`Map` is faster than Object"', 'choose on **key type, ordering and prototype safety**'],
        ],
      },
      {
        title: 'One-line definitions',
        kind: G.RULES,
        items: [
          '**Closure** — a function plus the lexical environment it was created in; it captures **bindings**, not snapshots.',
          '**Prototype vs `.prototype`** — `Object.getPrototypeOf(obj)` is what `obj` inherits from; `Fn.prototype` is what **future instances** of `Fn` will inherit from.',
          '**Event delegation** — one listener on a stable ancestor, resolved with `event.target.closest(sel)`.',
          '**Microtask vs task** — the whole microtask queue drains **before** the next macrotask; timers are macrotasks.',
          '**Debounce vs throttle** — debounce runs once **after** activity stops; throttle runs at most once per interval **during** it.',
          '**Authentication vs authorisation** — who you are (401) versus what you may do (403).',
        ],
      },
      {
        title: 'Pairs that get confused',
        kind: G.TABLE,
        columns: ['Pair', 'The difference'],
        rows: [
          ['`map` vs `forEach`', '`map` returns a new array; `forEach` returns `undefined`'],
          ['`slice` vs `splice`', '`slice` copies; **`splice` mutates** and returns what was removed'],
          ['`==` vs `===`', '`==` converts types; `===` does not — use `===`'],
          ['`null` vs `undefined`', '`undefined` = never set; `null` = deliberately empty'],
          ['`find` vs `filter`', '`find` returns one element and stops; `filter` returns an array'],
          ['`some` vs `every`', 'empty array → `some` is **`false`**, `every` is **`true`**'],
          ['`target` vs `currentTarget`', 'where it originated vs whose listener is running'],
          ['`call`/`apply` vs `bind`', 'the first two **invoke now**; `bind` returns a new function'],
          ['`??` vs `\\|\\|`', '`??` falls back only on nullish; `\\|\\|` on any falsy value'],
        ],
      },
      {
        title: 'Facts worth having exact',
        kind: G.RULES,
        items: [
          '**Eight falsy values**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`. `[]` and `{}` are **truthy**.',
          'Spread and `Object.assign` are **shallow**; `structuredClone` is deep but drops functions and class prototypes.',
          '`sort()` with no comparator sorts **as strings**, mutates, and returns the **same** array.',
          '`reduce` on an empty array with **no initial value throws** a `TypeError`.',
          '`Promise.all` rejects on the **first** rejection and does **not** cancel the others; `allSettled` never rejects.',
          '`typeof null === "object"`; `NaN !== NaN`; `Number("")` is `0`.',
          '`removeEventListener` needs the **identical function reference** — `.bind()` makes a new one every call.',
        ],
      },
      {
        title: 'How to answer well',
        kind: G.RULES,
        items: [
          'Give the **short answer first**, then the reasoning. Do not narrate your way to it.',
          'Name the **trade-off** — extra space for time, readability for speed. That is what separates a senior answer.',
          'Say "I would measure that" rather than guessing at performance.',
          'If you do not know, say so and describe **how you would find out**. Inventing an answer is worse.',
          'Volunteer the **caveat** — the shallow copy, the empty-array case, the security note. It is the strongest signal that you have shipped this before.',
        ],
      },
    ],
    relatedLessons: ['l-m46-01', 'l-m46-02', 'l-m46-03'],
    relatedReference: ['ref-array-sort', 'ref-promise-all', 'ref-object-freeze', 'ref-fetch', 'ref-syntax-nullish'],
    relatedChallenges: ['ch-algo-two-sum', 'ch-fn-debounce'],
  },
];
