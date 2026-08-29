import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Async, promises and the event loop.
 *
 * Every output-prediction question here is executed by `content:examples`, so
 * the ordering claimed in the answers is verified against the real runtime
 * rather than asserted from memory.
 */

const TOPIC = 'Async & Event Loop';

export const questions = [
  {
    id: 'iv-async-event-loop',
    question: 'Explain the event loop.',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['event-loop', 'async-foundations', 'execution-context'],
    relatedLessons: ['l-m33-01'],
    shortAnswer:
      'JavaScript runs one synchronous call stack. When the stack empties, the event loop drains the **entire microtask queue** (promise callbacks), then takes **one** macrotask (a timer, an I/O callback, an event), and repeats. Microtasks always run before the next macrotask.',
    deepAnswer: [
      'The runtime has a single call stack, so only one piece of JavaScript runs at a time. Asynchronous work is not concurrent execution of your code — it is your code being **scheduled** to run later.',
      'The cycle is: run the current synchronous code to completion; when the stack is empty, drain the **microtask queue completely**; then take **one** task from the macrotask queue; then drain microtasks again; repeat. Rendering, in a browser, generally happens between macrotasks.',
      '**Microtasks**: promise reactions (`.then`/`.catch`/`.finally` callbacks and everything after an `await`), `queueMicrotask`, and `MutationObserver` callbacks. **Macrotasks**: `setTimeout`, `setInterval`, I/O completions, and UI events.',
      'The two consequences that matter most in interviews: **microtasks always run before the next timer**, no matter the delay — even `setTimeout(fn, 0)` waits for every pending promise callback. And a microtask queued **by** a microtask is added to the same drain, so an infinitely self-queueing microtask starves the loop and freezes the page, where an infinitely self-scheduling `setTimeout` would not.',
      '`setTimeout(fn, 0)` does not mean "run immediately" — it means "queue this as a task, minimum delay 0", and browsers clamp nested timeouts to about 4ms after a few levels. It runs after all current synchronous code **and** all pending microtasks.',
      'The framing worth offering: JavaScript is not asynchronous. It is single-threaded and synchronous; the **host environment** provides asynchronous APIs and the event loop decides when your callbacks get their turn on the one stack.',
    ],
    keyPoints: [
      'One call stack; only one piece of JS runs at a time',
      'Cycle: sync code → drain all microtasks → one macrotask → repeat',
      'Microtasks: promise callbacks, `queueMicrotask`, `MutationObserver`',
      'Macrotasks: timers, I/O, UI events',
      'Microtasks always precede the next timer, even `setTimeout(fn, 0)`',
      'Self-queueing microtasks can starve the loop; timers cannot',
    ],
    commonMistakes: [
      '"JavaScript is asynchronous." The language is single-threaded and synchronous; the host provides async APIs.',
      'Saying `setTimeout(fn, 0)` runs immediately or before promise callbacks.',
    ],
    followUps: [
      'Why can a microtask loop freeze the page when a `setTimeout` loop cannot?',
      'Where does rendering fit in the cycle?',
      'What is the difference between a task and a microtask?',
    ],
  },

  {
    id: 'iv-async-ordering-basic-output',
    question: 'Classic ordering: sync, `setTimeout` and a promise — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['event-loop', 'promises', 'async-foundations'],
    relatedLessons: ['l-m33-01'],
    code:
      'console.log("A");\n' +
      '\n' +
      'setTimeout(() => {\n' +
      '  console.log("B");\n' +
      '}, 0);\n' +
      '\n' +
      'Promise.resolve().then(() => {\n' +
      '  console.log("C");\n' +
      '});\n' +
      '\n' +
      'console.log("D");',
    options: ['A\nD\nC\nB', 'A\nB\nC\nD', 'A\nD\nB\nC', 'A\nC\nD\nB'],
    correct: 0,
    shortAnswer:
      '`A`, `D`, `C`, `B`. The synchronous logs run first (`A`, `D`). Then the stack empties and the microtask queue drains, giving `C`. Only then does the event loop take the timer macrotask, giving `B`.',
    deepAnswer: [
      '**Synchronous phase.** `console.log("A")` runs. `setTimeout` registers a callback as a **macrotask** and returns immediately — it does not pause anything. `Promise.resolve().then(...)` registers a **microtask**; the `.then` callback is scheduled, not run. `console.log("D")` runs. So `A` and `D` print during the synchronous pass.',
      '**Microtask drain.** The stack is now empty, so the event loop drains the microtask queue completely. That runs the promise reaction: `C`.',
      '**Macrotask.** Only after microtasks are exhausted does the loop take one task from the macrotask queue: the timer callback, printing `B`.',
      'The `0` in `setTimeout(fn, 0)` is a **minimum** delay, not a priority. Even at 0ms the callback is a macrotask and therefore loses to every pending microtask.',
      'This is the canonical version of the question. The variation to be ready for is adding a second `.then` or an `await`, which inserts more microtasks — all of which still complete before `B`.',
    ],
    keyPoints: [
      'Synchronous code first: `A`, `D`',
      '`setTimeout` and `.then` both only **schedule**',
      'Microtask queue drains fully before any macrotask: `C` before `B`',
      '`setTimeout(fn, 0)` is a minimum delay, not a priority',
    ],
    commonMistakes: [
      'Answering `A B C D`, treating `setTimeout(fn, 0)` as immediate.',
      'Putting `C` before `D` — the `.then` callback is scheduled, not run inline.',
    ],
    followUps: [
      'What if there were a second `.then` chained on?',
      'Where would a `queueMicrotask` call land?',
      'Does the delay value change the relative order versus the promise?',
    ],
  },

  {
    id: 'iv-async-executor-sync-output',
    question: 'Does the `Promise` constructor run synchronously? What does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['promises', 'event-loop'],
    relatedLessons: ['l-m24-01'],
    code:
      'console.log(1);\n' +
      '\n' +
      'new Promise((resolve) => {\n' +
      '  console.log(2);\n' +
      '  resolve();\n' +
      '}).then(() => console.log(4));\n' +
      '\n' +
      'console.log(3);',
    options: ['1\n2\n3\n4', '1\n2\n4\n3', '1\n3\n2\n4', '2\n1\n3\n4'],
    correct: 0,
    shortAnswer:
      '`1`, `2`, `3`, `4`. The executor function passed to `new Promise` runs **synchronously and immediately**. Only the `.then` callback is deferred to the microtask queue.',
    deepAnswer: [
      'The single most common misconception about promises is that constructing one defers something. It does not. The executor — the function you pass to `new Promise` — is invoked **immediately and synchronously** by the constructor.',
      'So `console.log(2)` runs right there, between `1` and `3`, before the constructor even returns.',
      '`resolve()` marks the promise settled but does not run any callback — none is attached yet at that instant. `.then(...)` registers the reaction as a microtask.',
      '`console.log(3)` runs, finishing the synchronous phase. Then the microtask queue drains and prints `4`.',
      'The practical consequence: any expensive synchronous work inside a promise executor blocks the main thread exactly as it would anywhere else. Wrapping a slow computation in `new Promise` does not make it asynchronous — it just makes it look like it is.',
      'It also explains why `new Promise(executor)` is the right way to **adopt** a callback-based API and the wrong way to **create** asynchrony that does not already exist.',
    ],
    keyPoints: [
      'The executor runs synchronously and immediately',
      '`resolve()` settles the promise; it does not invoke callbacks',
      '`.then` callbacks are microtasks and run after synchronous code',
      'Wrapping slow sync work in a promise does not make it non-blocking',
    ],
    commonMistakes: [
      'Believing the `Promise` constructor defers its executor.',
      'Expecting `4` before `3`.',
    ],
    followUps: [
      'Does wrapping a slow loop in a promise stop it blocking?',
      'When is `new Promise` the right tool?',
      'What if `resolve()` were called asynchronously inside the executor?',
    ],
  },

  {
    id: 'iv-async-await-ordering-output',
    question: 'Where does execution resume after an `await`? What does this print?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.OUTPUT,
    topicIds: ['async-await', 'event-loop', 'promises'],
    relatedLessons: ['l-m25-01'],
    code:
      'async function run() {\n' +
      '  console.log(2);\n' +
      '  await Promise.resolve();\n' +
      '  console.log(4);\n' +
      '}\n' +
      '\n' +
      'console.log(1);\n' +
      'run();\n' +
      'console.log(3);',
    options: ['1\n2\n3\n4', '1\n2\n4\n3', '1\n3\n2\n4', '2\n1\n3\n4'],
    correct: 0,
    shortAnswer:
      '`1`, `2`, `3`, `4`. An `async` function body runs synchronously up to its first `await`. The `await` then suspends the function and schedules the remainder as a microtask, so `3` prints before the continuation resumes with `4`.',
    deepAnswer: [
      '`console.log(1)` runs. Then `run()` is called — and this is the key point — **the body starts executing immediately and synchronously**, so `console.log(2)` runs before `run()` returns anything.',
      'At `await Promise.resolve()`, the function suspends. Everything after the `await` is packaged as a continuation and scheduled as a **microtask**. `run()` returns a pending promise at this moment.',
      'Control returns to the caller, so `console.log(3)` runs, completing the synchronous phase.',
      'The stack empties, the microtask queue drains, the continuation resumes, and `4` prints.',
      'The mental model that makes every question of this shape tractable: **an `async` function is synchronous until its first `await`, and everything after each `await` is a microtask.** Awaiting an already-resolved promise still yields — it does not continue inline.',
      'A precise detail worth knowing for harder variants: `await somePromise` on a native promise costs one microtask tick, but `await` on a **thenable** (an object with a `.then`) costs extra ticks because the promise machinery has to adopt it. That is why cross-chain ordering puzzles sometimes have surprising answers, and why relying on exact interleaving between independent chains is fragile.',
    ],
    keyPoints: [
      'An async function body runs synchronously until the first `await`',
      'Code after an `await` becomes a microtask continuation',
      'Awaiting an already-resolved promise still yields',
      'The caller resumes immediately at the first `await`',
      'Awaiting a thenable costs extra microtask ticks than a native promise',
    ],
    commonMistakes: [
      'Assuming calling an async function defers the whole body.',
      'Expecting `4` before `3` because `Promise.resolve()` is "already done".',
    ],
    followUps: [
      'What if `run()` were awaited at the top level?',
      'Does `await` on an already-resolved promise still yield?',
      'Why can awaiting a thenable change the ordering?',
    ],
  },

  {
    id: 'iv-async-loop-ordering-output',
    question: 'Interleaved timers and promises in a loop — what is the order?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.OUTPUT,
    topicIds: ['event-loop', 'promises', 'loops'],
    relatedLessons: ['l-m33-01'],
    code:
      'for (let i = 1; i <= 2; i++) {\n' +
      '  setTimeout(() => console.log("timeout " + i), 0);\n' +
      '  Promise.resolve().then(() => console.log("promise " + i));\n' +
      '}\n' +
      'console.log("sync");',
    options: [
      'sync\npromise 1\npromise 2\ntimeout 1\ntimeout 2',
      'sync\ntimeout 1\ntimeout 2\npromise 1\npromise 2',
      'promise 1\npromise 2\nsync\ntimeout 1\ntimeout 2',
      'sync\npromise 1\ntimeout 1\npromise 2\ntimeout 2',
    ],
    correct: 0,
    shortAnswer:
      '`sync`, then both promises, then both timeouts. The loop only **schedules**; nothing async runs during it. Then the whole microtask queue drains (both promise callbacks) before the event loop takes any timer.',
    deepAnswer: [
      'The loop body runs twice synchronously, scheduling two macrotasks and two microtasks. Neither callback executes during the loop.',
      '`console.log("sync")` completes the synchronous phase.',
      'The stack empties. The event loop drains the **entire** microtask queue: `promise 1`, then `promise 2` in the order they were queued.',
      'Only then does it take macrotasks, one per cycle: `timeout 1`, then `timeout 2`.',
      'The tempting wrong answer is the interleaved one — `promise 1, timeout 1, promise 2, timeout 2` — which assumes the two queues alternate. They do not: microtasks are drained **exhaustively** before a single macrotask runs.',
      '`let i` also matters here: each iteration gets a fresh binding, so the callbacks capture 1 and 2. With `var` all four callbacks would print 3, which is a natural follow-up combining this with the closure question.',
    ],
    keyPoints: [
      'The loop only schedules; nothing async runs inside it',
      'Microtasks drain exhaustively before any macrotask',
      'The queues do not interleave',
      '`let` gives each iteration its own binding',
    ],
    commonMistakes: [
      'Predicting an interleaved order.',
      'Forgetting that `sync` still precedes everything asynchronous.',
    ],
    followUps: [
      'What changes if `let` becomes `var`?',
      'What if the timeout delay were 10 instead of 0?',
      'Where would `queueMicrotask` land in this order?',
    ],
  },

  {
    id: 'iv-async-promise-states',
    question: 'What are the states of a promise, and what does "settled" mean?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['promises', 'async-foundations'],
    relatedLessons: ['l-m24-01'],
    shortAnswer:
      'Pending, fulfilled or rejected. "Settled" means fulfilled **or** rejected — no longer pending. A promise settles exactly once and is immutable thereafter; later `resolve` or `reject` calls are ignored.',
    deepAnswer: [
      'A promise starts **pending**. It transitions once, to either **fulfilled** (with a value) or **rejected** (with a reason). **Settled** is the umbrella term for "fulfilled or rejected" — it is not a fourth state, and using it precisely is a small signal of care.',
      'The transition is **one-way and single-shot**. Once settled, the state and value are fixed. Calling `resolve()` twice, or `reject()` after `resolve()`, has no effect — which is exactly what makes promise-based race conditions safe: whichever settles first wins and the rest are silently ignored.',
      'That immutability is why `Promise.race` works, why a timeout wrapper is safe, and why a late-arriving response cannot overwrite an earlier settlement.',
      '**Resolved is not the same as fulfilled**, and this catches people. A promise can be **resolved to another promise**, meaning it has locked onto that promise\'s eventual outcome but is still pending until the inner one settles. So "resolved" describes the resolution mechanism; "fulfilled" describes the successful outcome.',
      'Attaching a `.then` to an already-settled promise still schedules the callback as a microtask — it never runs synchronously. That guarantee of asynchrony is deliberate: it means callback timing does not depend on whether the promise happened to settle before you attached the handler.',
    ],
    keyPoints: [
      'Three states: pending, fulfilled, rejected',
      '"Settled" = fulfilled or rejected, not a separate state',
      'Transitions once and is then immutable — later calls are ignored',
      'That immutability makes `race` and timeout wrappers safe',
      '"Resolved" ≠ "fulfilled" — a promise can be resolved to another pending promise',
      '`.then` on a settled promise still defers to a microtask',
    ],
    commonMistakes: [
      'Treating "settled" as a synonym for "fulfilled".',
      'Thinking a `.then` on an already-resolved promise runs synchronously.',
    ],
    followUps: [
      'What happens if you call `resolve` twice?',
      'What is the difference between resolved and fulfilled?',
      'Why does `.then` always defer, even on a settled promise?',
    ],
  },

  {
    id: 'iv-async-promise-combinators',
    question: 'Compare `Promise.all`, `allSettled`, `race` and `any`.',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['promises', 'async-await', 'errors'],
    relatedLessons: ['l-m24-01'],
    relatedChallenges: ['ch-async-all', 'ch-async-all-settled', 'ch-async-any'],
    shortAnswer:
      '`all`: all succeed or reject on the first failure. `allSettled`: never rejects, reports every outcome. `race`: settles as the first promise settles, success **or** failure. `any`: first **success**, rejecting with an `AggregateError` only if all fail.',
    deepAnswer: [
      '**`Promise.all`** — fulfils with an array of results in input order, or rejects immediately with the first rejection. Use it when you need everything and any failure makes the whole operation pointless. The trap: a single failure discards the successful results too.',
      '**`Promise.allSettled`** — never rejects. Fulfils with one descriptor per input: `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. Use it when partial success is useful and you want to report exactly what failed. This is usually the right choice for a dashboard of independent widgets.',
      '**`Promise.race`** — settles as soon as **any** input settles, whether that is a fulfilment or a rejection. The classic use is a timeout: race the real work against a promise that rejects after N milliseconds. The subtlety is that a fast **rejection** wins too, which is sometimes not what people expect.',
      '**`Promise.any`** — fulfils with the first **fulfilment**, ignoring rejections. It rejects only if every input rejects, and then with an `AggregateError` whose `errors` array holds all the reasons. Use it for redundant sources where you want whichever responds successfully first.',
      'The two axes that organise all four: **all versus first**, and **does a rejection count**. `all`/`allSettled` wait for everything; `race`/`any` settle early. `all` and `race` treat rejection as a settlement; `allSettled` and `any` are tolerant of failure.',
      'A shared caveat worth raising: none of them **cancels** the other operations. `race` losing does not stop the slower request — it keeps running and consuming a connection. Real cancellation needs `AbortController` threaded through.',
    ],
    keyPoints: [
      '`all`: everything, fails fast, discards successes on failure',
      '`allSettled`: never rejects, one descriptor per input',
      '`race`: first to settle, success or failure',
      '`any`: first success; `AggregateError` only if all fail',
      'Axes: all-vs-first, and whether rejection counts as settling',
      'None of them cancels the losing operations',
    ],
    commonMistakes: [
      'Thinking `race` waits for the first **success** — that is `any`.',
      'Assuming a lost `race` cancels the slower request.',
    ],
    followUps: [
      'How would you implement a timeout with `race`?',
      'Does `race` cancel the slower promise?',
      'Which would you use for a dashboard of independent panels?',
    ],
  },

  {
    id: 'iv-async-fetch-404',
    question: 'Why does this not enter the `catch` block when the server returns 404?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.DEBUGGING,
    topicIds: ['http', 'errors', 'async-await'],
    relatedLessons: ['l-m26-01'],
    relatedChallenges: ['ch-async-fetch-json'],
    code:
      'async function loadUser(url) {\n' +
      '  try {\n' +
      '    const response = await fetch(url);\n' +
      '    const user = await response.json();\n' +
      '    return user;\n' +
      '  } catch (error) {\n' +
      '    console.log("failed:", error.message);\n' +
      '    return null;\n' +
      '  }\n' +
      '}',
    shortAnswer:
      '`fetch` rejects only when the request itself could not be made — network failure, DNS, CORS block. A 404 or 500 is a **successful HTTP exchange** that returned an error status, so the promise fulfils. You must check `response.ok` explicitly.',
    deepAnswer: [
      'This is the most commonly misunderstood part of `fetch`, and it is deliberate design: `fetch` models "did the HTTP transaction complete", not "was the server happy".',
      '`fetch` **rejects** for: network unreachable, DNS failure, connection refused, a CORS preflight failure, or an aborted request. It **fulfils** for every response that arrives, including 404, 401 and 500.',
      'So on a 404 the `await fetch(url)` succeeds. Execution proceeds to `response.json()`, which typically throws a `SyntaxError` because the error page is HTML rather than JSON — meaning you **do** end up in the `catch`, but with a misleading "Unexpected token < in JSON" message instead of "not found". That misdirection is what makes this bug expensive to debug.',
      '**The fix** is an explicit status check before parsing:',
      '```\nconst response = await fetch(url);\nif (!response.ok) {\n  throw new Error(`Request failed: ${response.status}`);\n}\nreturn response.json();\n```',
      'A production client should distinguish three failure kinds — network, HTTP status, and parse — because callers respond differently to each: retry a network blip, show "not found" for a 404, and report a bug for malformed JSON. Attaching the original as `cause` preserves the detail while keeping the classification useful.',
      'Worth noting `response.ok` is simply `status >= 200 && status < 300`, and that a redirect is followed transparently by default so you rarely see a 3xx.',
    ],
    keyPoints: [
      '`fetch` rejects only on network/CORS/abort failures, not HTTP error statuses',
      'A 404 fulfils; `response.ok` must be checked explicitly',
      'Parsing an HTML error page produces a misleading `SyntaxError`',
      '`response.ok` is `status >= 200 && status < 300`',
      'Distinguish network, HTTP and parse failures — callers handle them differently',
    ],
    commonMistakes: [
      'Believing `fetch` rejects on 4xx/5xx.',
      'Catching the resulting JSON `SyntaxError` and reporting it as a parse bug rather than a 404.',
    ],
    followUps: [
      'What error does the current code actually produce on a 404?',
      'How would you distinguish a network failure from a 500?',
      'Does `fetch` reject on a CORS failure?',
    ],
  },

  {
    id: 'iv-async-foreach-debug',
    question: 'Why does this log "done" before any user is saved?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.DEBUGGING,
    topicIds: ['async-await', 'array-methods', 'promises'],
    relatedLessons: ['l-m25-01'],
    relatedChallenges: ['ch-async-sequential', 'ch-async-map-limit'],
    code:
      'async function saveAll(users) {\n' +
      '  users.forEach(async (user) => {\n' +
      '    await save(user);\n' +
      '    console.log("saved", user.id);\n' +
      '  });\n' +
      '  console.log("done");\n' +
      '}',
    shortAnswer:
      '`forEach` ignores the promise each async callback returns, so it starts them all and returns immediately. Nothing awaits them. Use `for...of` with `await` for sequential, or `Promise.all(users.map(...))` for concurrent.',
    deepAnswer: [
      'An `async` callback returns a promise. `forEach` has no concept of promises — it calls the callback and discards the return value. So `saveAll` fires every `save` and reaches `console.log("done")` while all of them are still pending.',
      'Two further consequences worth naming. First, **errors are unhandled**: a rejection inside one of those discarded promises becomes an unhandled rejection rather than something `saveAll`\'s caller can catch. Second, the function\'s own returned promise resolves before the work finishes, so any caller awaiting `saveAll` is misled.',
      '**Sequential fix** — when order matters or you must not overwhelm the target:',
      '```\nfor (const user of users) {\n  await save(user);\n  console.log("saved", user.id);\n}\n```',
      '**Concurrent fix** — when the operations are independent:',
      '```\nawait Promise.all(users.map(async (user) => {\n  await save(user);\n}));\n```',
      'The choice is a real trade-off. `Promise.all` is much faster for independent work but fires every request at once, which can rate-limit you or exhaust connections. For a large list, a bounded-concurrency helper — running at most N at a time — is the production answer.',
      '`await` inside `for...of` is one of the few places awaiting in a loop is correct rather than a mistake, because serialising is the explicit intent. Linters that flag `no-await-in-loop` are worth overriding here with a comment saying why.',
    ],
    keyPoints: [
      '`forEach` discards the promise an async callback returns',
      'Nothing awaits the work; `done` logs immediately',
      'Rejections become unhandled rather than catchable',
      'Sequential: `for...of` + `await`. Concurrent: `Promise.all(map(...))`',
      'For large lists, bound the concurrency rather than firing everything',
    ],
    commonMistakes: [
      'Reaching for `Promise.all` without considering whether firing every request at once is acceptable.',
      'Not noticing that error handling is also broken, not just ordering.',
    ],
    followUps: [
      'What happens to a rejection inside one of those callbacks?',
      'When would you choose sequential over concurrent?',
      'How would you limit it to 5 at a time?',
    ],
  },

  {
    id: 'iv-async-missing-return-debug',
    question: 'This promise chain resolves before the inner work finishes. Why?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.DEBUGGING,
    topicIds: ['promises', 'errors', 'async-foundations'],
    relatedLessons: ['l-m24-01'],
    code:
      'function loadProfile(id) {\n' +
      '  return fetchUser(id)\n' +
      '    .then((user) => {\n' +
      '      fetchPosts(user.id).then((posts) => {\n' +
      '        user.posts = posts;\n' +
      '      });\n' +
      '      return user;\n' +
      '    });\n' +
      '}',
    shortAnswer:
      'The inner `fetchPosts` promise is never returned, so the outer chain does not wait for it. `user` is returned with `posts` still undefined, and any error from `fetchPosts` is unhandled. Return the inner promise from the `.then`.',
    deepAnswer: [
      'A `.then` callback links the next step to whatever it **returns**. Returning a promise makes the chain adopt it and wait; returning a plain value settles immediately with that value.',
      'Here the inner `fetchPosts(...).then(...)` is created and left dangling. The callback returns `user` right away, so the outer promise resolves before the posts arrive. The assignment `user.posts = posts` does eventually happen — but after the caller already received the object, so it is a race the caller cannot see.',
      'That also makes the bug **intermittent**, which is the worst kind: on a fast connection the assignment may land before the caller reads it, so it appears to work in development and fails in production.',
      '**Two independent problems** follow from the same missing `return`: the ordering bug, and the fact that a rejection from `fetchPosts` has no handler and becomes an unhandled rejection.',
      '**Fixes.** Return the inner chain: `return fetchPosts(user.id).then((posts) => ({ ...user, posts }));`. Or rewrite with `async`/`await`, where the mistake is much harder to make:',
      '```\nasync function loadProfile(id) {\n  const user = await fetchUser(id);\n  const posts = await fetchPosts(user.id);\n  return { ...user, posts };\n}\n```',
      'Note the version above also avoids mutating `user` in place, which was a second smell in the original.',
      '**The general rule**: in a `.then` callback, either return the promise or explicitly handle it. A promise you neither return nor `catch` is almost always a bug.',
    ],
    keyPoints: [
      'A `.then` only waits for what its callback **returns**',
      'The dangling inner promise makes the resolution order a race',
      'Fails intermittently — often works locally, breaks under latency',
      'A rejection from the inner promise is also unhandled',
      '`async`/`await` makes this class of mistake much harder to write',
    ],
    commonMistakes: [
      'Fixing the ordering but not noticing the unhandled rejection.',
      'Missing that the original also mutates the `user` object.',
    ],
    followUps: [
      'Why is this bug intermittent?',
      'Rewrite it with `async`/`await`.',
      'Should these two requests run in parallel instead?',
    ],
  },

  {
    id: 'iv-async-sequential-vs-parallel',
    question: 'What is wrong with awaiting these two independent requests like this?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.PERFORMANCE,
    topicIds: ['async-await', 'performance', 'promises'],
    relatedLessons: ['l-m25-01'],
    code:
      'async function loadDashboard() {\n' +
      '  const user = await fetchUser();\n' +
      '  const stats = await fetchStats();\n' +
      '  return { user, stats };\n' +
      '}',
    shortAnswer:
      'The two requests are independent but run sequentially — the total time is the sum rather than the maximum. Start both before awaiting either, or use `Promise.all`, and the page loads in the time of the slower one.',
    deepAnswer: [
      '`await fetchUser()` suspends until it completes, and only then is `fetchStats()` even **called**. Since neither depends on the other, that serialisation is pure waste: 300ms plus 400ms is 700ms where 400ms was achievable.',
      '**Fix with `Promise.all`:**',
      '```\nconst [user, stats] = await Promise.all([fetchUser(), fetchStats()]);\n```',
      'This works because `fetchUser()` and `fetchStats()` are both **invoked** before `Promise.all` awaits anything — the requests are already in flight.',
      'The equivalent explicit form makes that clearer: `const userPromise = fetchUser(); const statsPromise = fetchStats(); const user = await userPromise; const stats = await statsPromise;`. Starting both, then awaiting, is the actual technique; `Promise.all` is the tidy expression of it.',
      '**When sequential is correct**: if the second call genuinely needs the first result — `fetchPosts(user.id)` — you have no choice. The question to ask of any `await` chain is "does this line need the previous line\'s value?" If not, it should not be waiting.',
      '**The trade-off with `Promise.all`**: one failure rejects the whole thing and discards the successful result. For a dashboard where each panel can render independently, `Promise.allSettled` is often the better fit — you show the user what loaded and an error only in the panel that failed.',
    ],
    keyPoints: [
      'Independent awaits serialise unnecessarily — sum instead of max',
      '`Promise.all` starts both before awaiting either',
      'The requests are in flight because the functions are **called** first',
      'Sequential is correct only when the second depends on the first',
      '`allSettled` is often better than `all` for independent UI panels',
    ],
    commonMistakes: [
      'Applying `Promise.all` to genuinely dependent calls, which cannot work.',
      'Not mentioning that `all` discards successes when one fails.',
    ],
    followUps: [
      'When would sequential be the correct choice here?',
      'What if one of the two is allowed to fail?',
      'How would you limit concurrency with twenty requests?',
    ],
  },

  {
    id: 'iv-async-error-handling',
    question: 'How do you handle errors with `async`/`await` versus promise chains?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['errors', 'async-await', 'promises'],
    relatedLessons: ['l-m25-01', 'l-m22-01'],
    shortAnswer:
      '`async`/`await` uses ordinary `try`/`catch`; chains use `.catch()`. The differences that matter: a `.catch()` placed before a `.then` will not catch that `.then`\'s error, and a synchronous throw inside a promise executor is caught by the chain while one before the chain starts is not.',
    deepAnswer: [
      '**With `await`**, a rejected promise throws at the `await`, so a normal `try`/`catch` works and the code reads like synchronous error handling. That readability is the main argument for `await` over chains.',
      '**With chains**, `.catch(fn)` handles a rejection from anything **earlier** in the chain. Position matters: `.catch().then()` will not catch a rejection produced by that trailing `.then`. Putting the `.catch` last is the usual correct placement.',
      '**`.then(onFulfilled, onRejected)`** takes a second argument that handles rejection from **preceding** steps only — it will not catch an error thrown by its own `onFulfilled`. `.catch()` after it will. That distinction is a genuine interview differentiator.',
      '**`finally`** runs on both paths and passes the value or reason through untouched — useful for hiding a spinner. It does not swallow the rejection.',
      '**Common failure modes**: an over-broad `try` block that wraps rendering logic as well as the request, so a rendering bug is reported as a network failure; catching and logging without rethrowing, which hides the failure from the caller; and forgetting that `catch (error)` may receive a non-`Error` value, since anything can be thrown or rejected with.',
      '**Unhandled rejections** are worth mentioning: a promise that rejects with no handler triggers `unhandledrejection` in browsers and can crash a Node process. Wiring a global handler for reporting is standard practice, but it is a safety net, not a substitute for handling.',
    ],
    keyPoints: [
      '`await` + `try`/`catch` reads like synchronous handling',
      '`.catch()` only catches rejections from earlier in the chain',
      '`.then(onFulfilled, onRejected)` does not catch its own `onFulfilled` errors',
      '`finally` runs either way and passes the outcome through',
      'Do not wrap unrelated logic in the same `try`',
      'A caught value is not guaranteed to be an `Error`',
    ],
    commonMistakes: [
      'Placing `.catch()` before the step that can fail.',
      'Catching, logging and silently continuing, so callers believe it succeeded.',
    ],
    followUps: [
      'What is the difference between `.then(f, g)` and `.then(f).catch(g)`?',
      'What happens to a rejection with no handler?',
      'Why is a very large `try` block a problem?',
    ],
  },

  {
    id: 'iv-async-timeout-coding',
    question: 'Implement a timeout wrapper for a promise. What can it not do?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['promises', 'async-await', 'errors'],
    relatedChallenges: ['ch-async-timeout', 'ch-exp-cancellable-pool'],
    code:
      'function withTimeout(promise, ms) {\n' +
      '  let timer;\n' +
      '  const timeout = new Promise((_, reject) => {\n' +
      '    timer = setTimeout(() => reject(new Error("timed out")), ms);\n' +
      '  });\n' +
      '  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));\n' +
      '}',
    shortAnswer:
      'Race the real promise against one that rejects after `ms`. Clear the timer in a `finally` so a fast success does not leave it pending. The key limitation: this **ignores** the slow operation, it does not cancel it — the request keeps running.',
    deepAnswer: [
      '**Approach.** Build a promise that rejects on a timer, race it against the real one. Because a promise settles only once, whichever finishes first wins and the loser is silently ignored — that immutability is what makes the race safe.',
      '**Clearing the timer matters.** Without `clearTimeout`, a fast success still leaves a pending timer; in Node that can keep the process alive, and in a browser it is a small leak repeated on every call. `finally` is the right place because it runs on both the success and failure paths.',
      '**The real limitation**, and the thing to volunteer unprompted: this does not cancel anything. The underlying `fetch` or database query keeps running, holding its connection, and its result is simply discarded. For a slow endpoint under load, timing out and retrying can make the problem **worse** by multiplying in-flight work.',
      '**Actual cancellation** requires `AbortController`: create one, pass `controller.signal` into `fetch`, and call `controller.abort()` when the timer fires. That genuinely terminates the request. `AbortSignal.timeout(ms)` now provides this directly for fetch.',
      '**Edge cases** to mention: a rejection from the real promise should propagate as itself, not be masked by the timeout error; and the error type should be distinguishable so callers can retry a timeout differently from a 500.',
      '**Testing**: inject the scheduler rather than calling `setTimeout` directly, so tests drive the clock instead of sleeping — otherwise every timeout test costs real seconds and becomes flaky under CI load.',
    ],
    keyPoints: [
      'Race the promise against a timer-rejected promise',
      'Clear the timer in `finally` to avoid a pending timer on fast success',
      'It ignores the slow work — it does not cancel it',
      '`AbortController` / `AbortSignal.timeout` gives real cancellation',
      'Inject the scheduler so tests do not sleep',
    ],
    commonMistakes: [
      'Claiming the timeout cancels the underlying request.',
      'Forgetting to clear the timer.',
    ],
    followUps: [
      'How would you actually cancel the request?',
      'Why does the losing promise not cause an unhandled rejection?',
      'How would you test this without waiting?',
    ],
  },

  {
    id: 'iv-async-retry-coding',
    question: 'Implement a retry helper with backoff. What should it not retry?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['async-await', 'errors', 'http'],
    relatedChallenges: ['ch-async-retry'],
    code:
      'async function retry(task, { attempts = 3, wait, shouldRetry = () => true }) {\n' +
      '  let lastError;\n' +
      '  for (let attempt = 1; attempt <= attempts; attempt++) {\n' +
      '    try {\n' +
      '      return await task();\n' +
      '    } catch (error) {\n' +
      '      lastError = error;\n' +
      '      if (!shouldRetry(error)) throw error;\n' +
      '      if (attempt < attempts) await wait(attempt);\n' +
      '    }\n' +
      '  }\n' +
      '  throw lastError;\n' +
      '}',
    shortAnswer:
      'Loop over attempts with `try`/`catch`, waiting between tries with increasing backoff. Crucially, do **not** retry non-transient failures — a 400, a validation error or a 401 will fail identically every time, so retrying wastes time and hides the real problem.',
    deepAnswer: [
      '**Approach.** A counted loop, returning on success and catching to decide whether to try again. `return await task()` inside the `try` is deliberate — writing `return task()` would return the promise without awaiting it there, so a rejection would escape the `try` and never be retried.',
      '**What not to retry** is the part that separates a thoughtful answer. Retry **transient** failures: network errors, timeouts, 429, 502/503/504. Do **not** retry deterministic ones: 400 (bad request), 401/403 (auth), 404, or a validation error — the same request will fail the same way, so retrying just delays the error report by several seconds.',
      '**Backoff.** Retrying immediately hammers a struggling service. Exponential backoff — 100ms, 200ms, 400ms — gives it room to recover. Add **jitter** (randomising the delay) so that many clients failing simultaneously do not retry in lockstep and create a thundering herd. Mentioning jitter is a strong signal.',
      '**Idempotency.** Only retry operations that are safe to repeat. Retrying a GET is fine; retrying a POST that creates an order may create two. Either restrict retries to idempotent methods or use an idempotency key so the server can deduplicate.',
      '**Injection for testing.** `wait` is a parameter rather than a hardcoded `setTimeout`, so tests can pass an instant fake and still assert that the delays **increase** — verifying the backoff policy without waiting seconds.',
      '**Edge cases**: `attempts` counts the initial call, so `attempts: 3` means one try plus two retries; no wait happens after the final failure; and the last error is what propagates.',
    ],
    keyPoints: [
      '`return await task()` inside the `try`, or rejections escape it',
      'Retry transient failures only: network, timeout, 429, 5xx',
      'Never retry 400/401/403/404 or validation errors',
      'Exponential backoff plus jitter to avoid a thundering herd',
      'Only retry idempotent operations, or use an idempotency key',
      'Inject `wait` so backoff is testable without sleeping',
    ],
    commonMistakes: [
      'Retrying every error indiscriminately.',
      'Omitting jitter and creating synchronised retry storms.',
      'Retrying a non-idempotent POST.',
    ],
    followUps: [
      'Why does jitter matter?',
      'Which HTTP status codes would you retry?',
      'How would you test that the backoff actually increases?',
    ],
  },

  {
    id: 'iv-async-race-condition-scenario',
    question: 'A search box shows results for a query the user already changed. What is happening and how do you fix it?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['async-await', 'http', 'performance', 'event-loop'],
    relatedChallenges: ['ch-fn-debounce', 'ch-async-dedupe'],
    shortAnswer:
      'An earlier, slower request resolves after a later, faster one and overwrites the fresher results. Fix by tagging each request and ignoring any response that is not the most recent — or by aborting the previous request with `AbortController`.',
    deepAnswer: [
      '**The mechanism.** The user types "a", firing request A. They type "ab", firing request B. If A is slower — different server load, a cold cache, an unlucky route — it resolves **after** B, and the naive `setResults(response)` overwrites B\'s correct results with A\'s stale ones. The UI then shows results for a query that is no longer in the box.',
      'It is invisible locally, where every request takes 5ms, and constant on real networks. That asymmetry is why it survives into production.',
      '**Fix 1 — sequence tagging.** Keep an incrementing counter; capture its value per request; before applying a response, check it is still the latest:',
      '```\nconst id = ++latestRequestId;\nconst data = await search(query);\nif (id !== latestRequestId) return;\nsetResults(data);\n```',
      'Simple, robust, and it does not require the request layer to support cancellation.',
      '**Fix 2 — `AbortController`.** Abort the previous request before starting a new one and pass the signal to `fetch`. This also stops wasted network work, which sequence tagging does not.',
      '**Related but different concerns** worth separating clearly, because interviewers probe whether you conflate them: **debounce** reduces how many requests are fired but does not order them; **caching** avoids repeating an identical query; **deduplication** shares one in-flight request between concurrent identical callers. A production search box wants debounce **and** race protection — they solve different problems.',
      '**Testing it**: give the mock client an artificial variable delay so the earlier request resolves last, then assert the displayed results match the final query. Without a variable delay the test cannot reproduce the bug at all.',
    ],
    keyPoints: [
      'An older slow response overwrites a newer fast one',
      'Invisible in local development, common on real networks',
      'Fix: tag requests and ignore non-latest responses',
      'Or `AbortController`, which also stops the wasted work',
      'Debounce, caching and dedup solve different problems — not this one',
      'Test with variable mock latency so the race is reproducible',
    ],
    commonMistakes: [
      'Answering "debounce it", which reduces requests but does not fix ordering.',
      'Not distinguishing deduplication from race protection.',
    ],
    followUps: [
      'Does debouncing alone fix this?',
      'How would you write a test that reliably reproduces it?',
      'What does `AbortController` give you that sequence tagging does not?',
    ],
  },

  {
    id: 'iv-async-microtask-starvation',
    question: 'Why can a recursive microtask freeze the page when a recursive `setTimeout` does not?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['event-loop', 'performance', 'promises'],
    relatedLessons: ['l-m33-01'],
    shortAnswer:
      'The event loop drains the microtask queue **completely** before doing anything else — including rendering and taking the next task. A microtask that queues another microtask never lets the queue empty, so the loop never proceeds. A `setTimeout` chain yields between every callback.',
    deepAnswer: [
      'The loop\'s contract is: drain microtasks **exhaustively**, then take **one** macrotask, then drain microtasks again. Rendering happens between macrotasks, not during a microtask drain.',
      'So `function loop() { Promise.resolve().then(loop); }` produces a queue that is never empty. The loop cannot move on to a macrotask, cannot render, and cannot process input. The tab freezes even though no individual callback is slow.',
      'By contrast `function loop() { setTimeout(loop, 0); }` queues one **macrotask** per iteration. The loop takes one, drains microtasks, renders if needed, and takes the next. The page stays responsive — it burns CPU, but it does not block.',
      'The practical lesson is about **chunking long work**. Splitting a long computation across `await Promise.resolve()` boundaries does **not** let the browser render, because those are microtasks. To actually yield to the browser you need a macrotask (`setTimeout`, `MessageChannel`) or `scheduler.yield()` where available.',
      'This is exactly the mechanism behind cooperative time-slicing schedulers: run work until a time budget is exhausted, then yield via a macrotask so the browser can paint and handle input, then continue.',
      'It also explains why `queueMicrotask` is the right tool for "run right after this synchronous block, before anything else" and the wrong tool for "let the UI breathe".',
    ],
    keyPoints: [
      'Microtasks drain exhaustively before any macrotask or rendering',
      'A self-queueing microtask never lets the queue empty — the loop stalls',
      'A `setTimeout` chain yields between callbacks, so the page stays responsive',
      'Awaiting a resolved promise does **not** yield to the renderer',
      'To yield for painting, use a macrotask or `scheduler.yield()`',
    ],
    commonMistakes: [
      'Believing `await` yields to the browser for rendering.',
      'Using `await Promise.resolve()` to "break up" a long task.',
    ],
    followUps: [
      'How would you break a long computation into chunks that let the page paint?',
      'Where does rendering fit in the loop?',
      'Is `queueMicrotask` ever the right choice for long work?',
    ],
  },

  {
    id: 'iv-async-generators-async-iteration',
    question: 'What problem do async generators and `for await...of` solve?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['iterators', 'async-await', 'http'],
    relatedLessons: ['l-m35-01'],
    relatedChallenges: ['ch-adv-async-iterator'],
    shortAnswer:
      'They let you consume an asynchronous sequence — paginated API results, a stream — with ordinary loop syntax, pulling the next chunk only when the consumer asks for it. That laziness is the point: nothing is fetched ahead of demand.',
    deepAnswer: [
      'An `async function*` can both `await` inside and `yield` out. `for await...of` drives it, awaiting each value before running the loop body.',
      'The canonical use is **pagination**. Without it, callers deal with cursors and page loops themselves. With it, the generator hides the paging entirely and the caller writes an ordinary loop over **items** — the abstraction the caller actually wants.',
      '**Laziness is the real benefit.** The generator suspends at each `yield`, so the next page is requested only when the consumer has exhausted the current one and asks for more. A consumer that `break`s after three items never triggers a second page fetch. An eager "fetch all pages then return an array" implementation cannot do that, and on a large dataset the difference is between a fast partial read and downloading everything.',
      'It also gives natural **backpressure**: production is driven by consumption, so a slow consumer does not cause unbounded buffering.',
      'Errors need no special handling — a rejected `await` inside the generator propagates out to the consumer\'s `for await` loop, where a normal `try`/`catch` works.',
      '**Caveat worth raising**: `for await...of` processes items strictly one at a time. If the per-item work is independent and slow, that serialisation may be exactly what you do **not** want, and a bounded-concurrency approach fits better. Async iteration is about ordered, lazy consumption, not throughput.',
    ],
    keyPoints: [
      '`async function*` can `await` inside and `yield` out; `for await...of` consumes it',
      'Hides pagination behind an ordinary item-level loop',
      'Lazy: the next page is fetched only when demanded',
      'Provides natural backpressure',
      'Errors propagate to the consumer\'s `try`/`catch`',
      'Processes serially — not a throughput tool',
    ],
    commonMistakes: [
      'Describing it as syntax sugar with no behavioural benefit, missing the laziness.',
      'Using `for await` over independent slow work where concurrency was wanted.',
    ],
    followUps: [
      'How does laziness change the number of requests made?',
      'What if you want to process items concurrently instead?',
      'How do errors propagate out of an async generator?',
    ],
  },

  {
    id: 'iv-async-callback-hell',
    question: 'Beyond nesting, what problems do promises actually solve compared to callbacks?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['promises', 'async-foundations', 'errors'],
    relatedLessons: ['l-m24-01'],
    shortAnswer:
      'Beyond flattening nesting: guaranteed single settlement, guaranteed asynchronous callback timing, composable error propagation through a chain, a first-class value you can pass around and combine, and combinators like `all` and `race` that callbacks have no equivalent for.',
    deepAnswer: [
      '"Callback hell" is the visible symptom people cite, but the deeper problems are about **guarantees**.',
      '**Single settlement.** A callback API can invoke your callback twice, or zero times, and nothing prevents it. A promise settles exactly once and is then immutable — so double-callback bugs, which are genuinely hard to diagnose, cannot happen.',
      '**Consistent timing.** A callback might fire synchronously on a cache hit and asynchronously on a miss, meaning the caller\'s code runs in a different order depending on data. That "releasing Zalgo" inconsistency causes subtle bugs. Promise callbacks are **always** asynchronous, even on an already-settled promise.',
      '**Error propagation.** With callbacks, every level must check `err` and forward it manually; one missed check swallows the failure. A promise rejection propagates down the chain automatically to the nearest handler, and a `throw` inside any `.then` becomes a rejection.',
      '**First-class value.** A promise can be stored, returned, passed, and awaited by several consumers. A callback is a one-shot arrangement between exactly two parties. That is what makes deduplication — several callers sharing one in-flight request — trivially expressible with promises and awkward with callbacks.',
      '**Composition.** `Promise.all`, `race`, `any` and `allSettled` express multi-operation coordination declaratively. Doing that with callbacks means hand-written counters and flags, which is where the real bugs live.',
      'The honest caveat: promises are single-value and not cancellable by design. For streams of values you want async iterators or an event/observable model, and for cancellation you need `AbortController` — promises alone do not provide it.',
    ],
    keyPoints: [
      'Guaranteed single settlement — no double-callback bugs',
      'Callbacks always async, so timing does not vary with cache state',
      'Automatic error propagation down the chain',
      'A first-class value: storable, shareable, awaitable by many',
      'Combinators (`all`, `race`, `any`) have no clean callback equivalent',
      'Not a solution for streams or cancellation',
    ],
    commonMistakes: [
      'Only citing nesting/readability and missing the guarantees.',
      'Claiming promises are cancellable.',
    ],
    followUps: [
      'What does "releasing Zalgo" mean?',
      'Are promises cancellable?',
      'How would you share one in-flight request between two callers?',
    ],
  },

  {
    id: 'iv-async-await-in-loop-output',
    question: 'Does `await` inside `map` serialise the work? What does this print?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.OUTPUT,
    topicIds: ['async-await', 'array-methods', 'promises'],
    relatedLessons: ['l-m25-01'],
    code:
      'const order = [];\n' +
      '\n' +
      'async function work(n) {\n' +
      '  order.push("start " + n);\n' +
      '  await Promise.resolve();\n' +
      '  order.push("end " + n);\n' +
      '  return n;\n' +
      '}\n' +
      '\n' +
      'const promises = [1, 2].map(work);\n' +
      '\n' +
      'Promise.all(promises).then((results) => {\n' +
      '  console.log(order.join(" | "));\n' +
      '  console.log(results.join(","));\n' +
      '});',
    options: [
      'start 1 | start 2 | end 1 | end 2\n1,2',
      'start 1 | end 1 | start 2 | end 2\n1,2',
      'start 1 | start 2 | end 2 | end 1\n1,2',
      'start 1 | end 1 | start 2 | end 2\n2,1',
    ],
    correct: 0,
    shortAnswer:
      '`start 1 | start 2 | end 1 | end 2`, then `1,2`. `map` calls `work` for every element synchronously, so both functions run to their first `await` before either resumes. The continuations then run in the order they were queued.',
    deepAnswer: [
      '`map(work)` invokes `work(1)` and `work(2)` synchronously, one after the other. Each runs its body until the first `await`, so `start 1` and `start 2` are pushed before anything resumes.',
      'Each `await Promise.resolve()` queues its continuation as a microtask. They were queued in call order, so the drain runs them in that order: `end 1`, then `end 2`.',
      'Hence the interleaving `start 1 | start 2 | end 1 | end 2` — which demonstrates the operations genuinely overlap rather than running one after the other.',
      '`Promise.all` preserves **input order** in its results regardless of completion order, so `results` is `[1, 2]`. That guarantee is worth stating explicitly — it is a common point of confusion, and it holds even when the promises settle out of order.',
      'The contrast to draw: `for (const n of [1,2]) { await work(n); }` would give `start 1 | end 1 | start 2 | end 2` — genuinely sequential. `map` plus `Promise.all` is concurrent; `for...of` with `await` is sequential. Knowing which you want, and being able to show the difference in output, is the substance of this question.',
    ],
    keyPoints: [
      '`map` invokes every async callback synchronously up to its first `await`',
      'Continuations resume in the order they were queued',
      'The interleaving proves the work overlaps',
      '`Promise.all` returns results in **input** order, not completion order',
      '`for...of` + `await` would serialise instead',
    ],
    commonMistakes: [
      'Expecting `map` with async callbacks to serialise.',
      'Assuming `Promise.all` returns results in completion order.',
    ],
    followUps: [
      'What order would a `for...of` loop with `await` produce?',
      'Does `Promise.all` preserve input order?',
      'How would you limit this to N concurrent operations?',
    ],
  },
];

export default questions;
