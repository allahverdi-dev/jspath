import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Async: promises, async/await, the event loop, and fetch.
 *
 * The two claims most often compressed into falsehoods live here — "promises
 * run asynchronously" (the executor does not) and "fetch rejects on 404" (it
 * does not). Both are stated correctly and prominently.
 */

export default [
  {
    id: 'cs-promises',
    slug: 'promises',
    title: 'Promises',
    category: C.ASYNC,
    icon: 'schedule',
    aliases: ['promise', 'then catch', 'Promise.all', 'allSettled', 'race', 'any', 'combinators'],
    topicIds: ['promises', 'async-foundations'],
    description: 'Three states, the chaining rules, and a combinator matrix that says which one you actually want.',
    groups: [
      {
        title: 'Three states',
        kind: G.RULES,
        items: [
          '**pending** → **fulfilled** (a value) or **rejected** (a reason).',
          'Once it leaves pending it is **settled**, and that is permanent — later `resolve`/`reject` calls are silently ignored.',
          'The **executor body runs synchronously**, immediately, during `new Promise(...)`.',
          'Only the **reactions** — `then` / `catch` / `finally` callbacks — are deferred, and they run as **microtasks**.',
          'So "promises run asynchronously" is wrong. The scheduling applies to the handlers, not to the executor.',
        ],
      },
      {
        title: 'Executor is synchronous',
        kind: G.SNIPPETS,
        entries: [
          { code: 'console.log("A");\nconst p = new Promise((resolve) => {\n  console.log("B");     // runs NOW\n  resolve("value");\n});\np.then((v) => console.log("D", v));\nconsole.log("C");\n\n// A  B  C  D value', description: 'The executor prints before `C`; only the reaction waits.' },
        ],
      },
      {
        title: 'Chaining',
        kind: G.SNIPPETS,
        entries: [
          { code: 'fetchUser()\n  .then((user) => fetchPosts(user.id))  // RETURN to chain\n  .then((posts) => render(posts))\n  .catch((err) => showError(err))\n  .finally(() => hideSpinner());', description: '`then` returns a **new** promise. Returning a promise from a handler adopts it — that is what flattens the chain.' },
          { code: '.then((user) => { fetchPosts(user.id); })  // ✗ no return', description: 'The next `then` receives `undefined` and does not wait. The single most common chain bug.' },
        ],
      },
      {
        title: 'Combinators',
        kind: G.TABLE,
        columns: ['', 'Fulfils when', 'Rejects when', 'Empty input'],
        rows: [
          ['`all`', '**every** input fulfils', '**first** rejection', 'fulfils with `[]`'],
          ['`allSettled`', 'all have **settled**', '**never**', 'fulfils with `[]`'],
          ['`race`', 'first to **settle** wins — either way', 'first settlement is a rejection', '**never settles**'],
          ['`any`', 'first to **fulfil**', '**all** reject → `AggregateError`', 'rejects immediately'],
        ],
        note: '`Promise.all` output is ordered **by input**, not by completion. It rejects with a **single reason**, not an array, and it does **not cancel** the other operations — they keep running.',
      },
      {
        title: 'Choose',
        kind: G.RULES,
        items: [
          '`all` — results are **jointly required**; one failure makes the whole thing meaningless.',
          '`allSettled` — **partial success is useful**; a dashboard where one dead widget should not blank the page.',
          '`race` — **timeouts**. Race the work against a promise that rejects after N ms.',
          '`any` — **redundant sources**; first success wins, failures tolerated.',
          '`allSettled` results are `{ status, value }` or `{ status, reason }` — check `status` before reading `value`.',
        ],
      },
      {
        title: 'catch and finally',
        kind: G.RULES,
        items: [
          '`catch(fn)` is exactly `then(undefined, fn)`.',
          'A `catch` that **returns normally converts the rejection into a fulfilment** — the chain recovers. Rethrow to keep it failing.',
          '`finally` receives **no arguments** and passes the original outcome through — unless it throws.',
          'The two-argument `then(onOk, onErr)` cannot catch an error thrown by its **own** `onOk`. A trailing `.catch()` can.',
          'A chain with no `catch` produces an **unhandled rejection** — fatal by default in Node.',
        ],
      },
    ],
    relatedLessons: ['l-m24-01', 'l-m24-02', 'l-m24-03', 'l-m24-04'],
    relatedReference: ['ref-promise-ctor', 'ref-promise-then', 'ref-promise-all', 'ref-promise-allsettled', 'ref-promise-race', 'ref-promise-any'],
    relatedChallenges: ['ch-async-all', 'ch-async-all-settled', 'ch-async-any'],
  },

  {
    id: 'cs-async-await',
    slug: 'async-await',
    title: 'Async & Await',
    category: C.ASYNC,
    icon: 'hourglass_top',
    aliases: ['async await', 'await', 'async function', 'sequential concurrent', 'try catch async'],
    topicIds: ['async-await', 'promises'],
    description: 'Syntax over promises — plus the sequential-versus-concurrent decision that quietly doubles page load times.',
    groups: [
      {
        title: 'The rules',
        kind: G.RULES,
        items: [
          'An `async` function **always returns a promise**. `return x` fulfils it; `throw` **rejects** it.',
          'The body runs **synchronously up to the first `await`** — calling it does not defer the start.',
          '`await` suspends and schedules the rest as a **microtask**, then returns control to the caller.',
          '`await` works on **any value**; a non-promise still defers by one tick.',
          'A rejection is **thrown at the `await` line**, which is what makes `try`/`catch` work.',
        ],
      },
      {
        title: 'Sequential vs concurrent',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const a = await getA();   // waits\nconst b = await getB();   // then waits again\n// total = timeA + timeB', description: 'Correct **only** when `b` depends on `a`.' },
          { code: 'const [a, b] = await Promise.all([\n  getA(),\n  getB(),\n]);\n// total = max(timeA, timeB)', description: 'Independent work. Both calls start **before** `Promise.all` is reached — that is what makes it concurrent.' },
        ],
      },
      {
        title: 'Loops',
        kind: G.TABLE,
        columns: ['Pattern', 'Behaviour'],
        rows: [
          ['`for (const x of xs) await f(x)`', '**sequential** — each waits'],
          ['`await Promise.all(xs.map(f))`', '**concurrent** — all at once'],
          ['`xs.forEach(async (x) => await f(x))`', '**✗ waits for nothing**'],
          ['`for await (const x of asyncIterable)`', 'sequential over an async source'],
        ],
        note: '`forEach` discards the promise each callback returns, so the surrounding function continues immediately and rejections go unhandled. For a large list, bound the concurrency rather than firing N requests at once.',
      },
      {
        title: 'Error handling',
        kind: G.SNIPPETS,
        entries: [
          { code: 'try {\n  const user = await loadUser(id);   // await INSIDE try\n} catch (err) {\n  report(err);\n}', description: 'A `try`/`catch` around async code only works if there is an `await` inside it.' },
          { code: 'try {\n  loadUser(id);      // ✗ no await\n} catch { … }        // never runs', description: 'Without `await` the call returns a pending promise; the rejection happens after `try` has exited.' },
          { code: 'return await risky();   // inside try: catchable here\nreturn risky();         // hands the promise to the caller', description: '`return await` inside a `try` is **not** redundant.' },
        ],
      },
      {
        title: 'Traps',
        kind: G.RULES,
        items: [
          'Expensive work **before** the first `await` blocks the caller just like a normal function.',
          'Top-level `await` works **only in an ES module**; it is a `SyntaxError` in a classic script and impossible in CommonJS.',
          'After any `await`, re-check that the result is still wanted before touching the DOM — the component may have unmounted, or a newer request may have superseded this one.',
          'Every promise needs an owner that awaits or catches it, or you get an unhandled rejection.',
          'A function marked `async` with no `await` in its body is usually a forgotten `await`.',
        ],
      },
    ],
    relatedLessons: ['l-m25-01', 'l-m25-02', 'l-m25-03', 'l-m25-04'],
    relatedReference: ['ref-syntax-async-function', 'ref-syntax-await', 'ref-promise-all', 'ref-abortcontroller'],
    relatedChallenges: ['ch-async-sequential', 'ch-async-map-limit', 'ch-async-retry'],
  },

  {
    id: 'cs-event-loop',
    slug: 'event-loop',
    title: 'The Event Loop',
    category: C.ASYNC,
    icon: 'sync',
    aliases: ['event loop', 'microtask', 'macrotask', 'call stack', 'task queue', 'ordering'],
    topicIds: ['event-loop', 'execution-context'],
    description: 'One thread, one stack, two queues — and the ordering rule that explains every "why did this log first?".',
    groups: [
      {
        title: 'The model',
        kind: G.RULES,
        items: [
          'One **call stack**. Code runs to completion — nothing interleaves into the middle of a function.',
          'When the stack empties, the loop drains the **entire microtask queue**.',
          'Then it takes **one macrotask** (a timer, an I/O callback, an event), runs it, and drains microtasks again.',
          'Rendering happens between turns, not during them.',
          'So: **sync → all microtasks → one macrotask → all microtasks → …**',
        ],
      },
      {
        title: 'Which queue',
        kind: G.TABLE,
        columns: ['Queue', 'Contains'],
        rows: [
          ['**Microtask**', '`.then` / `.catch` / `.finally` reactions, `await` continuations, `queueMicrotask`, `MutationObserver`'],
          ['**Macrotask**', '`setTimeout`, `setInterval`, I/O, UI events, `postMessage`'],
          ['**Render step**', '`requestAnimationFrame`, then style, layout, paint'],
        ],
        note: 'Promise reactions and `queueMicrotask` share **one** FIFO queue — there is no separate higher-priority "promise queue".',
      },
      {
        title: 'The canonical example',
        kind: G.SNIPPETS,
        entries: [
          { code: 'console.log("A");\n\nsetTimeout(() => console.log("timer"), 0);\n\nPromise.resolve()\n  .then(() => console.log("promise"));\n\nconsole.log("B");', description: 'Output: **A, B, promise, timer**. Sync first; then the microtask checkpoint; the timer is a macrotask and waits its turn.' },
          { code: 'async function run() {\n  console.log("1");\n  await null;          // suspends here\n  console.log("3");\n}\nrun();\nconsole.log("2");\n\n// 1  2  3', description: '`run()` starts synchronously. `await` schedules the remainder as a microtask.' },
        ],
      },
      {
        title: 'Consequences',
        kind: G.RULES,
        items: [
          '`setTimeout(fn, 0)` is a **minimum** delay, never "run now". It always loses to a pending microtask.',
          'Nested timers are clamped to about **4ms**, and background tabs are throttled much harder.',
          'A microtask that enqueues another microtask **starves rendering** — the page freezes with no error, because the loop never reaches the render step. A recursive `setTimeout` does not do this.',
          'A long synchronous task blocks rendering **and** input. Anything over ~50ms is perceptible; chunk it or move it to a Web Worker.',
          '`async` does **not** create a thread. Concurrency here is overlapping *waiting*, not parallel execution.',
        ],
      },
      {
        title: 'Never say',
        kind: G.RULES,
        items: [
          '✗ "JavaScript is asynchronous" — the language is synchronous and single-threaded; the **host** provides async APIs.',
          '✗ "`setTimeout(fn, 0)` runs immediately."',
          '✗ "Promises run on a separate thread."',
          '✓ "One thread runs my code; the host does I/O elsewhere and queues callbacks."',
        ],
      },
    ],
    relatedLessons: ['l-m23-03', 'l-m24-05', 'l-m33-02', 'l-m33-03'],
    relatedReference: ['ref-settimeout', 'ref-queuemicrotask', 'ref-requestanimationframe', 'ref-promise-then'],
    relatedChallenges: ['ch-async-poll', 'ch-async-serial-queue'],
  },

  {
    id: 'cs-fetch',
    slug: 'fetch-http',
    title: 'Fetch & APIs',
    category: C.ASYNC,
    icon: 'cloud_download',
    aliases: ['fetch', 'http', 'api', 'response', 'json', 'AbortController', 'CORS', 'status codes'],
    topicIds: ['http'],
    description: 'The request/response shape, the status check everyone forgets, cancellation, and what CORS actually protects.',
    groups: [
      {
        title: 'fetch does NOT reject on 4xx/5xx',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const response = await fetch(url);\n\nif (!response.ok) {\n  throw new Error(`HTTP ${response.status}`);\n}\n\nconst data = await response.json();', description: 'A 404 or 500 is a **successful request** that carried an error response. Without the `ok` check, `response.json()` tries to parse an HTML error page and throws a confusing `SyntaxError`.' },
        ],
      },
      {
        title: 'When fetch really does reject',
        kind: G.RULES,
        items: [
          'Network failure, DNS failure, connection refused.',
          'A **CORS** rejection — with an opaque `TypeError` carrying no detail; read the browser console.',
          'A malformed URL.',
          'An aborted request → `AbortError`.',
          'Everything else — including every HTTP error status — **resolves**.',
        ],
      },
      {
        title: 'GET and POST',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const res = await fetch(`/api/items?${new URLSearchParams({ q, page })}`);', description: '`URLSearchParams` encodes values correctly — never build a query string by concatenation.' },
          { code: 'await fetch("/api/items", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(payload),\n});', description: 'A JSON body needs the header set by hand. `FormData` and `URLSearchParams` bodies set it automatically.' },
        ],
      },
      {
        title: 'Response',
        kind: G.TABLE,
        columns: ['Member', 'Is'],
        rows: [
          ['`res.ok`', '`true` only for status **200–299**'],
          ['`res.status`', 'the numeric code'],
          ['`res.headers.get(n)`', 'string or **`null`**; names are case-insensitive'],
          ['`res.json()` / `res.text()`', '**promises** — and the body reads **once**'],
        ],
        note: '`res.clone()` before the first read if you need the body twice. A **204 No Content** has no body, so `res.json()` throws on it.',
      },
      {
        title: 'Cancellation',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const controller = new AbortController();\n\ntry {\n  const res = await fetch(url, { signal: controller.signal });\n} catch (err) {\n  if (err.name !== "AbortError") throw err;   // swallow ONLY aborts\n}\n\ncontroller.abort();', description: 'A controller is **single-use** — make a fresh one per request. `AbortSignal.timeout(ms)` builds a self-aborting signal.' },
        ],
      },
      {
        title: 'Status codes worth branching on',
        kind: G.TABLE,
        columns: ['Status', 'Do'],
        rows: [
          ['**401**', 'refresh the token, then sign in'],
          ['**403**', 'show "no access" — **never redirect to sign-in** (loop)'],
          ['**404**', 'usually an empty state, not an error banner'],
          ['**409**', 'reload and let the user reconcile'],
          ['**422**', 'map field errors onto the form'],
          ['**429 / 503**', 'respect `Retry-After`, back off'],
          ['**5xx**', 'retry with exponential backoff **and jitter**'],
        ],
        note: 'Only retry **idempotent** requests. Retrying a `POST` can duplicate a write unless the server deduplicates on an idempotency key.',
      },
      {
        title: 'CORS — what it is and is not',
        kind: G.RULES,
        items: [
          'CORS is **enforced by the browser**, relaxing the same-origin policy so a server can opt in to being read cross-origin.',
          'It blocks **your access to the response** — the request may well have reached the server and had its effect.',
          'A **preflight** `OPTIONS` fires for non-simple methods, custom headers, or `Content-Type: application/json`.',
          'With `credentials: "include"` the server must send an **explicit origin**; the `*` wildcard is rejected.',
          '**It is not access control.** `curl` and any non-browser client ignore it entirely — the API still needs its own authentication and authorisation.',
          'CORS errors are fixed in **server configuration**, never in front-end code.',
        ],
      },
      {
        title: 'UI states',
        kind: G.RULES,
        items: [
          'Model **idle / loading / success-with-data / success-but-empty / error** — empty is **not** an error.',
          'Use one status value, not independent booleans that permit impossible combinations.',
          'Keep stale data visible while refetching instead of flashing a spinner.',
          'Debounce typing **and** guard against stale responses — debouncing narrows the race window but does not close it.',
        ],
      },
    ],
    relatedLessons: ['l-m26-03', 'l-m26-04', 'l-m26-05', 'l-m26-06'],
    relatedReference: ['ref-fetch', 'ref-response', 'ref-response-json', 'ref-abortcontroller', 'ref-url-searchparams'],
    relatedChallenges: ['ch-async-fetch-json', 'ch-async-timeout', 'ch-async-dedupe'],
  },
];
