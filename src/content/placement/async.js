import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Async — promises, async/await, the event loop, fetch and HTTP errors.
 *
 * The output-ordering questions here are checked against real execution rather
 * than intuition; microtask ordering is the single most misremembered part of
 * the language and a placement test that gets it wrong is worse than none.
 */

export default [
  {
    id: 'pq-async-01',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.EASY,
    kind: K.SINGLE,
    topicIds: ['async-foundations'],
    prompt: 'Which description of JavaScript concurrency is accurate?',
    options: [
      'JavaScript runs your code on a single thread and uses a task queue to schedule callbacks',
      'JavaScript is an asynchronous language, so statements do not run in order',
      'Every function call runs on its own thread managed by the engine',
      'Async code runs in parallel with synchronous code on the same thread',
    ],
    correct: 0,
    explanation:
      'The language itself is synchronous and single-threaded. Asynchrony comes from the host — timers, network, the DOM — handing work back through queues that the event loop drains between turns.',
  },
  {
    id: 'pq-async-02',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.OUTPUT,
    topicIds: ['promises', 'event-loop'],
    prompt: 'In what order are these logged?',
    code: 'console.log("A");\nnew Promise((resolve) => {\n  console.log("B");\n  resolve();\n}).then(() => console.log("C"));\nconsole.log("D");',
    options: ['A B D C', 'A B C D', 'B A D C', 'A D B C'],
    correct: 0,
    explanation:
      'The executor passed to `new Promise` runs **synchronously**, so `B` is logged immediately after `A`. Only the `.then` callback is deferred — it is queued as a microtask and runs after the synchronous script finishes, which is after `D`.',
  },
  {
    id: 'pq-async-03',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.EXPERT,
    kind: K.OUTPUT,
    topicIds: ['event-loop', 'promises'],
    prompt: 'In what order are these logged?',
    code: 'setTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("sync");',
    options: [
      'sync promise timeout',
      'sync timeout promise',
      'promise sync timeout',
      'timeout promise sync',
    ],
    correct: 0,
    explanation:
      'Synchronous code runs first. The microtask queue is then drained completely before the next macrotask, so the promise callback beats the timer even with a `0` delay.',
  },
  {
    id: 'pq-async-04',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['http', 'async-await'],
    prompt: 'The server responds `404 Not Found`. What does the `fetch()` promise do?',
    options: [
      'It fulfils with a Response whose `ok` is `false` and `status` is `404`',
      'It rejects, so the `catch` block runs',
      'It fulfils with `null`',
      'It throws synchronously before the request is sent',
    ],
    correct: 0,
    explanation:
      '`fetch` rejects only when the request itself fails — a network error, a DNS failure, an aborted request. An HTTP error response *is* a successful exchange, so you must check `res.ok` yourself and throw if you want it to reach `catch`.',
  },
  {
    id: 'pq-async-05',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['async-await'],
    prompt: 'What does an `async` function return?',
    options: [
      'Always a promise — a non-promise return value is wrapped in a resolved one',
      'The value you returned, unless you explicitly wrap it in a promise',
      'A promise only if the body contains at least one `await`',
      'Undefined, unless the caller awaits it',
    ],
    correct: 0,
    explanation:
      'An `async` function always returns a promise. `return 1` produces a promise fulfilled with `1`; a `throw` produces a rejected one. That uniformity is what makes `await` composable.',
  },
  {
    id: 'pq-async-06',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['promises', 'async-await'],
    prompt:
      'Three independent API calls each take about one second. Which approach finishes in roughly one second rather than three?',
    options: [
      '`const [a, b, c] = await Promise.all([getA(), getB(), getC()]);`',
      '`const a = await getA(); const b = await getB(); const c = await getC();`',
      '`const results = [getA, getB, getC].map(async (f) => await f());` with no further await',
      '`for (const f of [getA, getB, getC]) await f();`',
    ],
    correct: 0,
    explanation:
      'Calling all three first starts all three, and `Promise.all` waits for the slowest. Sequential `await` statements deliberately serialise: each request only starts once the previous one has settled.',
  },
  {
    id: 'pq-async-07',
    domain: D.ASYNC,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['promises'],
    prompt: 'How does `Promise.allSettled` differ from `Promise.all`?',
    options: [
      '`allSettled` always fulfils, with one status object per input; `all` rejects as soon as any input rejects',
      '`allSettled` runs the promises one at a time; `all` runs them together',
      '`allSettled` rejects if every input rejects; `all` rejects if any does',
      'They are identical apart from the shape of the fulfilment value',
    ],
    correct: 0,
    explanation:
      '`allSettled` never rejects: you receive an array of `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` entries. `all` short-circuits on the first rejection, discarding results that had already arrived.',
  },
];
