import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Advanced language features: modules, iterators, generators, metaprogramming
 * and functional patterns. Kept proportional — these appear in senior
 * interviews but should not crowd out the fundamentals.
 */

const TOPIC = 'Advanced JavaScript';

export const questions = [
  {
    id: 'iv-adv-modules',
    question: 'How do ES modules differ from CommonJS?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['modules', 'tooling'],
    relatedLessons: ['l-m28-01'],
    shortAnswer:
      'ES modules are statically analysable — imports are resolved before execution, which enables tree-shaking and live bindings. CommonJS `require` is a synchronous runtime call returning a copied value. ESM is always strict and its top-level bindings are read-only views of the exporter.',
    deepAnswer: [
      '**Static versus dynamic.** `import` declarations are hoisted and resolved before any module body runs, so a bundler can determine the dependency graph without executing anything. `require()` is an ordinary function call that can appear anywhere, including inside a conditional — which is why CommonJS cannot be reliably tree-shaken.',
      '**Live bindings versus value copies.** An ESM import is a live, read-only **view** of the exported binding: if the exporting module reassigns it later, importers see the new value. CommonJS copies the value at `require` time, so a later reassignment in the exporter is invisible. This surprises people, and it is the deepest semantic difference.',
      '**Strictness and scope.** Module bodies are always strict, have their own scope, and `this` at the top level is `undefined` rather than `module.exports` or the global object.',
      '**Loading.** ESM supports top-level `await` and asynchronous loading; `require` is synchronous. `import()` returns a promise, which is what enables code splitting.',
      '**Circular dependencies** behave differently: ESM hoisting means an importer may see an as-yet-uninitialised binding (a TDZ error) where CommonJS would see a partially-populated `exports` object. Neither is pleasant; the real answer is to restructure the cycle.',
      '**Named versus default exports** is a related practical choice: named exports are better for tree-shaking and refactoring tools, and they force consistent naming across the codebase. A default export lets each importer rename freely, which is convenient and makes the codebase harder to grep. Most style guides now prefer named exports for that reason.',
    ],
    keyPoints: [
      'ESM is static — resolved before execution, enabling tree-shaking',
      'ESM imports are live read-only bindings; CJS copies values',
      'Module bodies are always strict; top-level `this` is `undefined`',
      'ESM supports top-level `await`; `import()` enables code splitting',
      'Circular deps: ESM can throw a TDZ error where CJS gives a partial object',
      'Named exports aid tree-shaking and refactoring; defaults allow renaming',
    ],
    commonMistakes: [
      'Describing the difference as purely syntactic.',
      'Not knowing ESM bindings are live.',
    ],
    followUps: [
      'What does a live binding mean in practice?',
      'Why can CommonJS not be tree-shaken reliably?',
      'When would you use a default export?',
    ],
  },

  {
    id: 'iv-adv-iterable-protocol',
    question: 'What makes an object iterable, and what does that unlock?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['iterators', 'metaprogramming'],
    relatedLessons: ['l-m35-01'],
    relatedChallenges: ['ch-cls-iterable-range'],
    shortAnswer:
      'A `[Symbol.iterator]` method returning an iterator — an object with a `next()` that yields `{ value, done }`. Implementing it makes an object work with `for...of`, spread, array destructuring and `Array.from`, all through the same protocol.',
    deepAnswer: [
      'Two protocols. **Iterable**: has a `[Symbol.iterator]()` method. **Iterator**: has `next()` returning `{ value, done }`. Most iterators are also iterable (they return themselves), which is why a generator object works directly in `for...of`.',
      'One method unlocks four language features at once: `for...of`, spread (`[...obj]`), array destructuring (`const [a, b] = obj`) and `Array.from`. That leverage is the reason to implement it rather than exposing a `toArray()`.',
      '**A generator method is the simplest implementation** — `*[Symbol.iterator]() { yield 1; yield 2; }` — and it has an important property: because the method runs afresh on each use, the object is **re-iterable**. Returning a stored iterator object instead leaves it exhausted after the first loop, which is a genuine bug when converting a generator function into a class.',
      '**Laziness.** An iterator produces values on demand, so it can represent an infinite sequence or a stream. `for...of` with a `break` stops pulling — worth knowing that leaving the loop early calls the iterator\'s `return()` method, which **closes** a generator and runs its `finally` block. That cleanup hook is why generators can safely hold a file handle.',
      '**Built-in iterables**: arrays, strings (by code point, so emoji survive), `Map`, `Set`, `NodeList`, `arguments`. Plain objects are **not** iterable, which is why `for...in` (which walks enumerable string keys, including inherited ones) is a different thing entirely and generally the wrong tool.',
    ],
    keyPoints: [
      '`[Symbol.iterator]()` returning an object with `next() → { value, done }`',
      'Unlocks `for...of`, spread, destructuring and `Array.from` together',
      'A generator method gives re-iterability for free',
      'Iterators are lazy — infinite sequences are representable',
      'Breaking a `for...of` calls the iterator\'s `return()` and closes a generator',
      'Plain objects are not iterable; `for...in` is a different mechanism',
    ],
    commonMistakes: [
      'Returning a stored iterator, making the object single-use.',
      'Confusing `for...in` with `for...of`.',
    ],
    followUps: [
      'Why does returning a cached iterator break re-iteration?',
      'What happens to a generator when you `break` out of a `for...of`?',
      'What is the difference between `for...in` and `for...of`?',
    ],
  },

  {
    id: 'iv-adv-generators',
    question: 'What are generators useful for beyond producing sequences?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['iterators', 'functional'],
    relatedLessons: ['l-m35-01'],
    relatedChallenges: ['ch-adv-lazy-pipeline', 'ch-adv-tree-generator'],
    shortAnswer:
      'They are functions that can suspend and resume, keeping their local state. That enables lazy pipelines that never build intermediate arrays, clean recursive traversal via `yield*`, infinite sequences, and two-way communication — `next(value)` sends a value **into** the generator.',
    deepAnswer: [
      'A generator returns without finishing. Each `yield` hands a value out and suspends, preserving all local state; the next `next()` resumes exactly where it left off.',
      '**Lazy pipelines.** Chaining generator-based `map` and `filter` processes one element through the whole chain before touching the next, with no intermediate arrays. Over a large or infinite source, that is the difference between working and not working. The newer iterator helper methods formalise this.',
      '**Recursive traversal.** `yield*` delegates to another iterable, so a tree walk is four lines and needs no manual stack — and the consumer can stop partway, leaving the rest of the tree unvisited.',
      '**Two-way communication** is the part people forget: `gen.next(value)` makes that value the result of the `yield` expression inside the generator. That bidirectionality is what let libraries like co, and later redux-saga, express asynchronous flows as synchronous-looking code — and it is essentially the mechanism `async`/`await` was built on.',
      '**Cleanup.** A `try`/`finally` around a `yield` runs its `finally` when the consumer abandons the generator, because leaving a `for...of` early calls `return()`. That makes resource handling safe.',
      '**When not to use them.** For simple array transformations they are slower and less readable than `map`/`filter` — every step allocates a generator object and involves protocol overhead. They earn their place with large or infinite data, early termination, or genuinely stateful iteration.',
    ],
    keyPoints: [
      'Suspend and resume while preserving local state',
      'Lazy pipelines with no intermediate arrays',
      '`yield*` makes recursive traversal trivial and abandonable',
      '`next(value)` sends values in — the basis of co/redux-saga and of async/await',
      '`try`/`finally` around a `yield` gives reliable cleanup on abandonment',
      'Slower than array methods for small eager transformations',
    ],
    commonMistakes: [
      'Only describing them as a way to make iterators, missing laziness and two-way communication.',
      'Using generators where a plain `map` is clearer.',
    ],
    followUps: [
      'What does `gen.next(value)` do?',
      'How does `yield*` help with tree traversal?',
      'When is a generator the wrong choice?',
    ],
  },

  {
    id: 'iv-adv-proxy',
    question: 'What is a `Proxy` for, and what are the costs?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['metaprogramming', 'objects'],
    relatedLessons: ['l-m36-01'],
    relatedChallenges: ['ch-adv-proxy-validate'],
    shortAnswer:
      'A `Proxy` intercepts fundamental operations on an object — property reads, writes, deletion, `in`, key enumeration — via trap functions. It powers reactivity systems, validation and mocking. The costs are real performance overhead and code whose behaviour is not visible at the call site.',
    deepAnswer: [
      '`new Proxy(target, handler)` returns an object that behaves like `target` except where a handler trap intervenes. Traps include `get`, `set`, `has`, `deleteProperty`, `ownKeys` and `apply`.',
      '**Real uses**: reactivity — Vue 3 uses proxies to know which properties a component read, so it can re-render precisely when those change; validation on assignment; negative array indices; default values for missing keys; and mocking or recording access in tests.',
      '**`Reflect` is the companion.** `Reflect.get(target, prop, receiver)` performs the default operation with exactly the arguments a trap receives, including the receiver — which matters for inherited getters. Reaching into `target[prop]` directly instead is where subtle bugs come from.',
      '**Traps must respect invariants.** The `set` trap must return `true` on success; returning nothing means "failed" and throws in strict mode. And a `get` trap that throws for unknown properties will break ordinary operations, because the engine internally probes for `Symbol.toPrimitive`, `Symbol.iterator` and `then` — so symbol keys must be allowed through.',
      '**Costs.** Every trapped operation is slower than a direct property access, and proxies are hard for engines to optimise. More importantly, they make behaviour **invisible**: `user.name = "x"` looks like a plain assignment and may validate, log or trigger a render. That is powerful in a framework and dangerous in application code, where a reader has no local signal that something unusual happens.',
      'The judgement: excellent for library-level infrastructure, rarely the right tool for ordinary application logic where an explicit function call communicates better.',
    ],
    keyPoints: [
      'Intercepts fundamental operations via traps',
      'Uses: reactivity, validation, defaults, mocking',
      'Pair with `Reflect` to perform default behaviour with the right receiver',
      '`set` must return `true`; `get` must let symbol keys through',
      'Slower and harder for engines to optimise',
      'Makes behaviour invisible at the call site — best kept to library code',
    ],
    commonMistakes: [
      'Forgetting the `set` trap must return `true`.',
      'Blocking symbol lookups in a `get` trap and breaking string conversion.',
    ],
    followUps: [
      'Why does the `set` trap need to return `true`?',
      'What does `Reflect` give you that `target[prop]` does not?',
      'Why is a proxy risky in ordinary application code?',
    ],
  },

  {
    id: 'iv-adv-immutability',
    question: 'How do you update nested state immutably, and why not just deep clone?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['copying', 'functional', 'performance'],
    relatedLessons: ['l-m37-01'],
    relatedChallenges: ['ch-obj-set-in', 'ch-exp-produce'],
    shortAnswer:
      'Copy only the objects along the path you are changing, leaving untouched branches shared. That is structural sharing, and it is what lets consumers compare subtrees with `===` to detect change. A full deep clone is slower and destroys that ability, because every reference changes.',
    deepAnswer: [
      '**The technique**: `{ ...state, user: { ...state.user, name } }` — a new object at each level on the path to the change, and every sibling branch carried across as the same reference.',
      '**Why not deep clone.** Two reasons. It is O(size of the whole tree) for a one-field change. And more importantly it changes **every** reference, so a consumer comparing `prev.settings === next.settings` sees a difference where nothing changed — defeating the memoisation and re-render skipping that immutability is supposed to enable.',
      '**Structural sharing is the point.** When only the changed path has new references, a UI framework can compare each node with `===` and skip re-rendering entire untouched subtrees. That is why immutable updates are a performance technique, not just a correctness one.',
      '**Why not mutate?** Mutation keeps the same reference, so change detection sees nothing and the UI may not update at all — while the data has silently changed. That combination, changed data with an unchanged reference, is the worst failure mode.',
      '**Tools.** Immer lets you write mutating-looking code against a draft proxy and produces a correctly structurally-shared result — best of both. A `setIn(state, path, value)` helper is the explicit version.',
      '**When mutation is fine**: on a local object you created and have not shared yet — building an array inside a function before returning it, for instance. The rule is about **shared** state, not about mutation being inherently wrong.',
    ],
    keyPoints: [
      'Copy the path, share untouched branches — structural sharing',
      'Deep cloning is O(whole tree) and breaks `===` change detection',
      'Mutation keeps the reference, so re-renders may not fire',
      'Immer gives mutable-looking syntax with shared-structure output',
      'Mutating a local, unshared object is fine',
    ],
    commonMistakes: [
      'Reaching for `structuredClone` on every update.',
      'Treating immutability as dogma rather than as enabling reference comparison.',
    ],
    followUps: [
      'Why does deep cloning hurt memoisation?',
      'When is mutation acceptable?',
      'How does Immer produce a shared-structure result?',
    ],
  },

  {
    id: 'iv-adv-bigo',
    question: 'What is the time complexity of this function, and how would you improve it?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.ALGORITHMS,
    topicIds: ['algorithms', 'performance', 'data-structures'],
    relatedLessons: ['l-m39-01'],
    relatedChallenges: ['ch-arr-intersection', 'ch-algo-two-sum'],
    code:
      'function findCommon(listA, listB) {\n' +
      '  const result = [];\n' +
      '  for (const a of listA) {\n' +
      '    if (listB.includes(a)) {\n' +
      '      result.push(a);\n' +
      '    }\n' +
      '  }\n' +
      '  return result;\n' +
      '}',
    shortAnswer:
      'O(n × m) — for every element of `listA` it scans all of `listB`. Build a `Set` from `listB` first and the membership test becomes roughly O(1), taking the whole function to O(n + m) at the cost of O(m) extra memory.',
    deepAnswer: [
      '**Current complexity.** The outer loop is O(n). `includes` is a linear scan, O(m). Nested, that is O(n × m). With two 10,000-element lists that is 100 million comparisons.',
      '**The improvement.** `const inB = new Set(listB)` costs O(m) once; `inB.has(a)` is roughly O(1). Total O(n + m) — 20,000 operations instead of 100 million on that example.',
      '**The trade-off is memory**: O(m) for the set. That is the classic time-space trade, and stating it explicitly is what an interviewer wants — not just "use a Set".',
      '**Second detail worth raising unprompted**: the current function does not deduplicate. If `listA` contains a value twice and it is in `listB`, it appears twice in the result. Whether that is a bug depends on the intended semantics of "common", which I would ask about rather than assume.',
      '**Equality**: `Set` uses SameValueZero, so `NaN` matches `NaN` — which `indexOf` would not manage. `includes` also uses SameValueZero, so this particular change does not alter equality behaviour, but it is worth knowing they differ from `indexOf`.',
      '**When not to bother**: for lists of ten elements the `Set` allocation may cost more than it saves. Complexity analysis describes growth, not absolute speed — I would ask about expected input size before optimising, and measure if it matters.',
    ],
    keyPoints: [
      'O(n × m) — nested linear scan via `includes`',
      '`Set` membership is ~O(1), giving O(n + m)',
      'Costs O(m) memory — an explicit time-space trade',
      'Does not deduplicate; clarify intended semantics',
      '`Set` and `includes` use SameValueZero; `indexOf` does not',
      'Not worth it for tiny inputs — Big O is about growth',
    ],
    commonMistakes: [
      'Saying "use a Set" without stating the memory cost or the new complexity.',
      'Missing the duplicate-handling question.',
    ],
    followUps: [
      'What is the memory cost of your fix?',
      'Should duplicates appear twice in the result?',
      'When would the original be the better choice?',
    ],
  },

  {
    id: 'iv-adv-recursion-tradeoffs',
    question: 'When would you choose recursion over iteration, and what are the risks?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.ALGORITHMS,
    topicIds: ['recursion', 'algorithms', 'performance'],
    relatedLessons: ['l-m38-01'],
    relatedChallenges: ['ch-fn-trampoline', 'ch-ds-tree-depth'],
    shortAnswer:
      'Recursion suits genuinely recursive structures — trees, nested objects, divide-and-conquer. The risk is stack overflow: JavaScript engines do not implement tail-call optimisation in practice, so deep recursion throws `RangeError` where a loop would not.',
    deepAnswer: [
      '**Where recursion wins.** Tree and graph traversal, nested-object walks, and divide-and-conquer algorithms like merge sort or quickselect. The code mirrors the structure of the data, which makes it easier to verify by reading.',
      '**The stack limit is the main risk.** Each call consumes a frame, and the limit is typically around 10,000 frames. A recursive walk over a linked list of 100,000 nodes throws `RangeError: Maximum call stack size exceeded`.',
      '**Tail-call optimisation** was specified in ES2015 but is not implemented in practice by any major engine except JavaScriptCore. So you cannot rely on writing a tail-recursive function and expecting constant stack space — this is a genuinely important point, because it is a common misconception that "tail recursion is safe in modern JS".',
      '**The workarounds**: convert to iteration with an explicit stack — which is exactly what the recursion was doing implicitly; or use a trampoline, where the function returns a thunk instead of recursing and a driver loop calls thunks until a real value comes back. A trampoline gives constant stack depth at the cost of a closure allocation per step.',
      '**Naive recursion can also be exponential**: unmemoised Fibonacci recomputes the same subproblems repeatedly. Memoisation or a bottom-up loop makes it linear. Complexity, not just stack depth, is worth checking.',
      '**The practical guidance**: recursion for bounded-depth structures like a DOM tree or a config object, iteration when depth can scale with input size.',
    ],
    keyPoints: [
      'Fits trees, nested structures and divide-and-conquer',
      'Stack limit ~10,000 frames; deep recursion throws `RangeError`',
      'Tail-call optimisation is specified but not implemented in most engines',
      'Fixes: explicit stack, or a trampoline returning thunks',
      'Naive recursion can be exponential — memoise or go bottom-up',
      'Recursion for bounded depth; iteration when depth scales with input',
    ],
    commonMistakes: [
      'Claiming tail recursion is optimised in JavaScript.',
      'Only mentioning stack depth and missing exponential recomputation.',
    ],
    followUps: [
      'Is tail-call optimisation available in practice?',
      'How does a trampoline work?',
      'How would you rewrite a deep tree walk iteratively?',
    ],
  },

  {
    id: 'iv-adv-testing-pyramid',
    question: 'What is the difference between unit, integration and end-to-end tests, and how would you balance them?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.TESTING,
    topicIds: ['testing', 'clean-code'],
    relatedLessons: ['l-m42-01'],
    shortAnswer:
      'Unit tests exercise one piece in isolation — fast and precise but prove nothing about wiring. Integration tests cover several pieces together. E2E tests drive the real application through a browser — highest confidence, slowest and flakiest. Weight toward the fast layers, but let the architecture decide the exact shape.',
    deepAnswer: [
      '**Unit**: one function or module, dependencies stubbed. Milliseconds, pinpoint failure location. The weakness is that everything can pass while the app is broken, because the seams between units are untested.',
      '**Integration**: several real pieces together — a component with its store, or a handler with a real (test) database. Slower, but tests the interactions where most real bugs live.',
      '**End-to-end**: the whole system through a browser. Highest confidence that a user journey works, and the slowest and most brittle. Reserve them for a handful of critical paths — sign-up, checkout — rather than trying to cover features exhaustively.',
      '**On the pyramid**: the classic advice is many unit, fewer integration, fewest E2E, and the reasoning — fast feedback and cheap maintenance — remains sound. But the "testing trophy" argument that integration tests give the best confidence-per-cost is also fair, particularly for UI work where units are thin and most bugs are in composition. I would let the answer follow from where the risk actually is rather than defend a shape.',
      '**The failure mode to name**: over-mocked unit tests that assert on implementation. They pass while the feature is broken, and they fail when you refactor without changing behaviour. That is negative value — the suite costs maintenance and provides false confidence.',
      '**Practical judgement**: test complex pure logic exhaustively at the unit level, test the wiring at integration level, and keep E2E for the journeys whose breakage would be unacceptable.',
    ],
    keyPoints: [
      'Unit: isolated, fast, precise — but does not test wiring',
      'Integration: several real pieces; where many real bugs live',
      'E2E: real browser, highest confidence, slowest and flakiest',
      'Pyramid vs trophy — let risk and architecture decide',
      'Over-mocked unit tests give false confidence and break on refactors',
      'Exhaustive units for complex pure logic; E2E for critical journeys only',
    ],
    commonMistakes: [
      'Reciting the pyramid as doctrine without reasoning about the codebase.',
      'Not naming over-mocking as a real failure mode.',
    ],
    followUps: [
      'What does it mean when a test breaks after a behaviour-preserving refactor?',
      'How many E2E tests would you want?',
      'When are mocks the wrong choice?',
    ],
  },

  {
    id: 'iv-adv-test-brittleness',
    question: 'A test fails after a refactor that provably did not change behaviour. What does that tell you?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.TESTING,
    topicIds: ['testing', 'clean-code'],
    relatedLessons: ['l-m42-01'],
    relatedChallenges: ['ch-eng-assert'],
    shortAnswer:
      'The test asserts on implementation rather than behaviour. That is a defect in the test: it makes safe refactoring expensive and provides no real protection, since behaviour could break without it noticing.',
    deepAnswer: [
      'A test\'s value comes from failing when behaviour breaks and passing when it does not. A test that fails on a behaviour-preserving change is inverting that contract — it is coupled to **how** the code works rather than **what** it does.',
      '**Typical causes**: asserting that a specific internal method was called (`expect(repo.findById).toHaveBeenCalled()`) rather than that the right result came back; snapshotting an entire DOM tree so any markup change fails; reaching into private state; depending on the exact order of unordered results; or mocking so heavily that the test only verifies the mock configuration.',
      '**Why it is expensive.** It makes refactoring cost more than it should, which in practice means refactoring does not happen, which means the code decays. A brittle suite actively discourages the improvement it was supposed to enable.',
      '**The fix**: assert on observable outcomes — the return value, the rendered text a user would see, the state after the operation. For UI, query by accessible role and text rather than by CSS class or internal structure. That is the reasoning behind Testing Library\'s API.',
      '**When implementation coupling is legitimate**: when the implementation detail **is** the requirement — that a cache prevents a second network call, that a retry backs off, that a query is not N+1. There the call count is the behaviour under test, and asserting on it is correct.',
      '**What I would actually do**: confirm behaviour is genuinely unchanged, then rewrite the test to assert the outcome rather than deleting it — a brittle test usually indicates behaviour worth covering, just covered badly.',
    ],
    keyPoints: [
      'The test is coupled to implementation, not behaviour',
      'Causes: call-count assertions, whole-tree snapshots, private state, mock-heavy setup',
      'It makes refactoring expensive, so refactoring stops happening',
      'Fix: assert observable outcomes; query UI by role and text',
      'Legitimate when the detail is the requirement — caching, retries, N+1',
      'Rewrite the assertion rather than deleting the test',
    ],
    commonMistakes: [
      'Concluding the test should simply be deleted.',
      'Claiming implementation assertions are always wrong.',
    ],
    followUps: [
      'When is asserting on a call count correct?',
      'Why are whole-tree snapshots problematic?',
      'How would you rewrite a class-selector-based UI assertion?',
    ],
  },

  {
    id: 'iv-adv-performance-approach',
    question: 'A page feels slow. How do you approach it?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'debugging', 'tooling'],
    relatedLessons: ['l-m43-01'],
    shortAnswer:
      'Measure first — reproduce it, profile it, and identify which phase is actually slow before changing anything. "Slow" can mean load, interaction latency or jank, and each has different causes and different fixes.',
    deepAnswer: [
      '**Start by defining "slow".** Slow to first render, slow to become interactive, slow to respond to a click, or visibly janky while scrolling? These have different causes, and guessing wrong wastes the whole effort. Core Web Vitals give useful vocabulary: LCP for load, INP for interaction responsiveness, CLS for layout stability.',
      '**Then measure.** The Performance panel shows where time actually goes — scripting, layout, paint. The Network panel shows payload size and waterfall shape. A coverage report shows how much shipped JavaScript is unused. Real-user monitoring matters too, since a developer machine on fast wifi is not representative.',
      '**Common findings and their fixes.** Large bundles → code splitting and lazy loading of routes. Long tasks blocking the main thread → break work into chunks that yield, or move it to a Web Worker. Layout thrashing → batch reads before writes. Excessive re-rendering → memoisation and stable references. Too many requests → batching, caching, request deduplication. Unoptimised images → correct formats, sizing and lazy loading.',
      '**Verify the fix with the same measurement.** An optimisation that is not measured before and after is a guess, and plenty of "optimisations" make things worse — memoising cheap computations adds overhead and memory for no gain.',
      '**Judgement worth stating**: optimise what users actually experience. A 3ms improvement in a function called twice is irrelevant next to a 400KB unused dependency. And avoid quoting specific speedup figures without having measured them — a claim like "this makes it 10x faster" invites a question you cannot answer.',
    ],
    keyPoints: [
      'Define which kind of slow: load, interaction, or jank',
      'Vocabulary: LCP, INP, CLS',
      'Measure with Performance, Network and coverage before changing anything',
      'Fixes map to causes: splitting, chunking/workers, batched DOM reads, memoisation, caching',
      'Re-measure to confirm — some optimisations make things worse',
      'Do not claim speedup numbers you have not measured',
    ],
    commonMistakes: [
      'Listing optimisations without a measurement step.',
      'Quoting invented performance figures.',
    ],
    followUps: [
      'How would you find out which script is blocking the main thread?',
      'When does memoisation make things worse?',
      'What is INP and why did it replace FID?',
    ],
  },

  {
    id: 'iv-adv-security-checklist',
    question: 'What frontend security concerns would you raise in a code review?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['security', 'http', 'storage'],
    relatedLessons: ['l-m44-01'],
    shortAnswer:
      'Untrusted data reaching `innerHTML` or another code sink; secrets or tokens in client code or `localStorage`; trusting client-side validation; unvalidated URLs and redirects; and dependency risk. All are defensive checks, not exploitation.',
    deepAnswer: [
      '**XSS sinks first** — any untrusted value reaching `innerHTML`, `document.write`, `insertAdjacentHTML`, `eval`, `new Function`, or an `href`/`src` that could become a `javascript:` URL. The default should be text rendering; rich content needs a maintained sanitiser.',
      '**Secrets in client code.** Anything shipped to the browser is readable by the user — including values injected at build time from environment variables. A "private" API key in a frontend bundle is public. The fix is a server-side proxy that holds the credential.',
      '**Token storage.** `localStorage` is readable by any script on the origin, so one XSS exfiltrates the session. `HttpOnly` cookies with `Secure` and `SameSite` are the safer default, with CSRF protection as the accompanying cost.',
      '**Client-side validation trusted as a control.** Disabled buttons, hidden fields and `maxlength` are UX, not security — the server must re-validate and re-authorise every request.',
      '**Unvalidated redirects.** A `next` parameter taken from the URL and navigated to lets an attacker send users to a look-alike site from a link that genuinely starts on your domain. Validate against an allow-list of paths or origins.',
      '**Prototype pollution.** A recursive merge that copies a `__proto__` key from parsed JSON can alter `Object.prototype` and affect every object in the program. Strip those keys at the parse boundary or use `Object.create(null)` for data maps.',
      '**Dependencies.** Audit them, keep them current, and be wary of adding a package for something small — supply-chain compromise is a real and growing vector.',
      'A **Content Security Policy** is worth having as defence in depth, but it is a backstop for bugs that slip through, not a primary control.',
    ],
    keyPoints: [
      'Untrusted data reaching `innerHTML`/`eval`/`javascript:` URLs',
      'No secrets in client code — build-time env vars are still public',
      '`localStorage` tokens are XSS-exfiltrable; prefer `HttpOnly` cookies + CSRF defence',
      'Client validation is UX; the server must re-validate and authorise',
      'Validate redirect targets against an allow-list',
      'Prototype pollution via merged untrusted JSON',
      'Dependency hygiene; CSP as defence in depth',
    ],
    commonMistakes: [
      'Believing a build-time environment variable hides a key from users.',
      'Treating CSP or CORS as primary security controls.',
    ],
    followUps: [
      'Why is a build-time env var not a secret?',
      'How would you validate a redirect target?',
      'What is prototype pollution and where does it enter?',
    ],
  },

  {
    id: 'iv-adv-code-review',
    question: 'What do you look for when reviewing someone else\'s pull request?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['clean-code', 'tooling', 'testing'],
    relatedLessons: ['l-m45-01'],
    shortAnswer:
      'Correctness and edge cases first, then tests, then security and performance implications, then readability and naming. Style should be automated away. And the review should be about the change, phrased as questions where I might be missing context.',
    deepAnswer: [
      '**In priority order.** Does it do what it claims, including the edge cases — empty inputs, error paths, concurrent use? Are there tests, and do they test behaviour rather than implementation? Any security implication — untrusted data, authorisation, secrets? Any performance implication at realistic scale, like an N+1 or an accidental O(n²)? Then readability: naming, function size, whether the structure matches how the code will change.',
      '**Style is not a review topic.** Formatting belongs to Prettier and lint rules. Time spent arguing about it in review is time not spent on correctness, and it makes reviews adversarial over things nobody should care about.',
      '**How to phrase it matters as much as what you find.** "What happens if `items` is empty here?" invites a check; "this is wrong" invites defensiveness. Where I am unsure of the context, asking is more honest than asserting — the author usually knows something I do not.',
      '**Distinguish blocking from non-blocking.** A correctness bug blocks; a naming preference does not. Labelling comments as "nit:" or "blocking:" makes that explicit and stops a review reading as a wall of equally-weighted objections.',
      '**Praise what is good.** Noting a clean abstraction or a well-chosen test is not politeness filler — it tells the author which decisions to repeat.',
      '**Scope discipline.** A large PR mixing a refactor with a feature is hard to review well; asking for a split is often the highest-value comment. And I would not request unrelated improvements in someone else\'s PR — that belongs in a separate issue.',
    ],
    keyPoints: [
      'Order: correctness and edge cases → tests → security/performance → readability',
      'Automate style; do not review formatting',
      'Ask questions rather than assert when context may be missing',
      'Mark blocking versus non-blocking explicitly',
      'Call out what is done well',
      'Ask to split PRs that mix refactor and feature',
    ],
    commonMistakes: [
      'Leading with style nitpicks.',
      'Not distinguishing blocking issues from preferences.',
    ],
    followUps: [
      'How would you handle disagreeing with an author who is more senior?',
      'What makes a PR easy to review?',
      'When would you approve with comments rather than request changes?',
    ],
  },

  {
    id: 'iv-adv-debugging-approach',
    question: 'You are given a bug you cannot reproduce locally. How do you approach it?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['debugging', 'errors', 'tooling'],
    relatedLessons: ['l-m22-01'],
    shortAnswer:
      'Get a reliable reproduction first — that is usually most of the work. Narrow what differs between environments, gather real evidence from logs and error reporting, form one hypothesis at a time, and test it. Guess-and-patch without a reproduction usually moves the bug rather than fixing it.',
    deepAnswer: [
      '**Reproduction is the priority.** Without it you cannot know you have fixed anything. I would gather the specifics: exact steps, browser and version, device, network conditions, user role, data involved, and whether it is intermittent or consistent.',
      '**Then narrow the difference.** If it happens in production and not locally, something differs: build configuration (minification changing error messages, different environment variables), data shape (production has records development does not), scale (a list of 10,000 where local has 5), timing (real network latency exposing a race), or permissions.',
      '**Race conditions deserve specific mention** because they are the classic "works locally" bug: an out-of-order response or a missing `await` is invisible at 5ms latency and constant at 500ms. Throttling the network in DevTools is often the fastest way to reproduce one.',
      '**Gather evidence rather than guessing.** Error-reporting tools with source maps give real stack traces; session replay shows what the user actually did; structured logs with a request id let you follow one journey through the system.',
      '**Then be systematic.** One hypothesis at a time, changing one thing, so you know what the evidence means. Binary search — through git history with `bisect`, or by disabling half the code — narrows fast. Changing three things at once and seeing it work teaches you nothing.',
      '**Finish properly**: add a regression test that fails on the old code, and consider whether the same class of bug exists elsewhere. A fix with no test invites the bug back.',
    ],
    keyPoints: [
      'Reliable reproduction first — usually most of the work',
      'Enumerate environment differences: build, data, scale, timing, permissions',
      'Latency-sensitive races are the classic "works locally" case',
      'Use error reporting with source maps, session replay, structured logs',
      'One hypothesis at a time; bisect to narrow',
      'Finish with a regression test and check for the same bug elsewhere',
    ],
    commonMistakes: [
      'Jumping to a speculative fix without a reproduction.',
      'Changing several things at once so the result is uninterpretable.',
    ],
    followUps: [
      'How would you reproduce a race condition deliberately?',
      'What would you log, and what would you avoid logging?',
      'How do you decide when to stop investigating and ship a mitigation?',
    ],
  },

  {
    id: 'iv-adv-uncertainty',
    question: 'How should you handle an interview question you do not know the answer to?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.SCENARIO,
    topicIds: ['interview'],
    relatedLessons: ['l-m46-01'],
    shortAnswer:
      'Say precisely what you do and do not know, reason out loud from what you do know, and state what you would check to find out. Bluffing is the worst option — interviewers ask follow-ups, and a confident wrong answer costs more than an honest boundary.',
    deepAnswer: [
      '**Separate what you know from what you are inferring.** "I know `Promise.all` rejects on the first failure. I am less sure whether the others keep running — I believe they do, because promises cannot be cancelled, but I would verify that." That is a strong answer, not a weak one: it demonstrates accurate self-assessment, which is exactly what a senior colleague needs.',
      '**Reason out loud from adjacent knowledge.** Most questions are reachable from something you do know. Working toward it visibly shows how you think, which is usually more of what is being assessed than the fact itself.',
      '**Say how you would find out.** "I would check the MDN page for the exact behaviour, or write a three-line test" is a real answer. Nobody memorises everything; knowing where the authoritative answer lives is the professional skill.',
      '**Do not bluff.** Interviewers ask follow-ups precisely to test the depth of an answer, so a confident wrong claim usually unravels one question later — and it damages trust in everything else you said. An admitted gap costs one question; a discovered bluff costs the interview.',
      '**Ask clarifying questions** when the question is genuinely ambiguous. "Are we assuming module scope, so strict mode?" is not stalling; it is the same thing you would do with an underspecified ticket.',
      '**Afterwards, look it up.** Being able to say "I checked after our last conversation, and it turns out…" in a follow-up round is a genuinely strong signal.',
    ],
    keyPoints: [
      'State precisely what you know versus what you are inferring',
      'Reason aloud from adjacent knowledge',
      'Say how you would verify it — docs, a quick test',
      'Never bluff; follow-ups expose it and cost more than the gap',
      'Ask clarifying questions when genuinely ambiguous',
      'Look it up afterwards and mention it',
    ],
    commonMistakes: [
      'Guessing confidently to appear knowledgeable.',
      'Saying only "I do not know" with no reasoning or route to the answer.',
    ],
    followUps: [
      'How would you verify a claim about JavaScript semantics quickly?',
      'When is asking a clarifying question better than answering?',
    ],
  },
];

export default questions;
