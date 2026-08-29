import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Functions & Closures';

export const challenges = [
  {
    id: 'ch-fn-once',
    slug: 'call-it-only-once',
    title: 'Call It Only Once',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'higher-order'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `once(fn)` returning a wrapper that calls `fn` at most once. Every later call skips `fn` entirely and returns the first result again. Arguments and `this` must be forwarded on that first call. A first call returning `undefined` still counts as having happened — the guard is "has it run", not "is there a result".',
    examples: [
      'const init = once(() => { console.log("setup"); return 42; });\ninit();  // logs "setup", returns 42\ninit();  // logs nothing, returns 42',
    ],
    constraints: ['`fn` runs at most once, whatever it returns.', 'Arguments and `this` are forwarded on the first call.', 'Later calls return the cached result and ignore their arguments.'],
    starterCode: 'function once(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'calls the function once', body: 'let calls = 0; const f = once(() => { calls += 1; }); f(); f(); f(); expect(calls).toBe(1);' },
      { name: 'returns the first result every time', body: 'const f = once(() => 42); expect(f()).toBe(42); expect(f()).toBe(42);' },
      { name: 'forwards arguments on the first call', body: 'const f = once((a, b) => a + b); expect(f(1, 2)).toBe(3);' },
      { name: 'ignores later arguments', body: 'const f = once((a) => a); expect(f("first")).toBe("first"); expect(f("second")).toBe("first");' },
      { name: 'caches an undefined result', body: 'let calls = 0; const f = once(() => { calls += 1; }); expect(f()).toBe(undefined); expect(f()).toBe(undefined); expect(calls).toBe(1);' },
      { name: 'caches a null result without re-running', body: 'let calls = 0; const f = once(() => { calls += 1; return null; }); f(); f(); expect(calls).toBe(1);' },
      { name: 'caches a falsy zero without re-running', body: 'let calls = 0; const f = once(() => { calls += 1; return 0; }); f(); f(); expect(calls).toBe(1);' },
      { name: 'forwards this', body: 'const obj = { n: 7, get: once(function () { return this.n; }) }; expect(obj.get()).toBe(7);' },
      { name: 'each wrapper has its own state', body: 'let calls = 0; const make = () => once(() => { calls += 1; }); const a = make(); const b = make(); a(); b(); expect(calls).toBe(2);', hidden: true },
    ],
    hints: [
      'The wrapper needs two pieces of private state: whether it has run, and what it returned.',
      'A closure over those two variables is the whole mechanism — they live as long as the wrapper does.',
      'Guard on the "has run" flag, not on whether the result is defined; the tests deliberately return `undefined`, `null` and `0`.',
    ],
    solution:
      'function once(fn) {\n' +
      '  let called = false;\n' +
      '  let result;\n' +
      '  return function (...args) {\n' +
      '    if (!called) {\n' +
      '      called = true;\n' +
      '      result = fn.apply(this, args);\n' +
      '    }\n' +
      '    return result;\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The two closure variables are the entire state machine, and keeping them separate is what makes the falsy-result tests pass: guarding on `result === undefined` would re-run a function that legitimately returns nothing, and `if (!result)` would re-run one that returns `0` or `null`. Setting `called = true` *before* invoking `fn` also means a function that throws is not retried, which is usually what "once" is meant to guarantee for an initialiser. The wrapper is a `function` rather than an arrow so it has its own `this` to forward, and `apply` passes both `this` and the arguments through unchanged.',
  },

  {
    id: 'ch-fn-memoize',
    slug: 'memoize-a-pure-function',
    title: 'Memoize a Pure Function',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'performance'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `memoize(fn, keyFn)` caching results by a key derived from the arguments. `keyFn` receives the argument array and returns the cache key; when omitted it defaults to the first argument. A cached `undefined` must not be recomputed — "no entry" and "an entry holding undefined" are different states. Expose `cache` on the returned function as the underlying `Map`, so callers can inspect or clear it.',
    examples: [
      'const slow = (n) => n * 2;\nconst fast = memoize(slow);\nfast(5);          // 10, computed\nfast(5);          // 10, from cache\nfast.cache.size;  // 1',
      'const add = memoize((a, b) => a + b, (args) => args.join(","));',
    ],
    constraints: ['`keyFn` receives the arguments as an array.', 'The default key is the first argument.', '`fn.cache` is a `Map`.'],
    starterCode: 'function memoize(fn, keyFn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns the right value', body: 'const f = memoize((n) => n * 2); expect(f(5)).toBe(10);' },
      { name: 'computes only once per key', body: 'let calls = 0; const f = memoize((n) => { calls += 1; return n; }); f(1); f(1); f(1); expect(calls).toBe(1);' },
      { name: 'computes again for a new key', body: 'let calls = 0; const f = memoize((n) => { calls += 1; return n; }); f(1); f(2); expect(calls).toBe(2);' },
      { name: 'exposes the cache as a Map', body: 'const f = memoize((n) => n); f(1); expect(f.cache instanceof Map).toBe(true); expect(f.cache.size).toBe(1);' },
      { name: 'clearing the cache forces recomputation', body: 'let calls = 0; const f = memoize((n) => { calls += 1; return n; }); f(1); f.cache.clear(); f(1); expect(calls).toBe(2);' },
      { name: 'caches an undefined result', body: 'let calls = 0; const f = memoize(() => { calls += 1; }); f(1); f(1); expect(calls).toBe(1);' },
      { name: 'uses a custom key function', body: 'let calls = 0; const f = memoize((a, b) => { calls += 1; return a + b; }, (args) => args.join(",")); expect(f(1, 2)).toBe(3); f(1, 2); expect(calls).toBe(1);' },
      { name: 'a custom key distinguishes different arguments', body: 'let calls = 0; const f = memoize((a, b) => { calls += 1; return a + b; }, (args) => args.join(",")); f(1, 2); f(2, 1); expect(calls).toBe(2);' },
      { name: 'the default key ignores later arguments', body: 'const f = memoize((a, b) => a + b); expect(f(1, 2)).toBe(3); expect(f(1, 9)).toBe(3);' },
      { name: 'does not confuse a number key with its string', body: 'let calls = 0; const f = memoize((x) => { calls += 1; return x; }); f(1); f("1"); expect(calls).toBe(2);' },
      { name: 'each memoized function has its own cache', body: 'const make = () => memoize((n) => n); const a = make(); const b = make(); a(1); expect(b.cache.size).toBe(0);', hidden: true },
      {
        name: 'turns exponential recursion into linear',
        body:
          'let calls = 0;\n' +
          'const fib = memoize((n) => { calls += 1; return n < 2 ? n : fib(n - 1) + fib(n - 2); });\n' +
          'expect(fib(30)).toBe(832040);\n' +
          'expect(calls).toBe(31);',
        hidden: true,
      },
    ],
    hints: [
      'A `Map` is the right cache: its keys are compared without stringifying, so `1` and `"1"` stay distinct.',
      'Check membership with `cache.has(key)` rather than `cache.get(key) !== undefined`, or a cached `undefined` is recomputed forever.',
      'Attach the cache to the returned function before returning it — a function is an object and takes properties like any other.',
    ],
    solution:
      'function memoize(fn, keyFn = (args) => args[0]) {\n' +
      '  const cache = new Map();\n' +
      '  const wrapped = function (...args) {\n' +
      '    const key = keyFn(args);\n' +
      '    if (cache.has(key)) return cache.get(key);\n' +
      '    const result = fn.apply(this, args);\n' +
      '    cache.set(key, result);\n' +
      '    return result;\n' +
      '  };\n' +
      '  wrapped.cache = cache;\n' +
      '  return wrapped;\n' +
      '}\n',
    solutionExplanation:
      '`cache.has(key)` rather than a comparison against `undefined` is the detail that makes a cached `undefined` behave correctly — the difference between "not computed yet" and "computed, and the answer was nothing". A `Map` keeps `1` and `"1"` apart, which a plain object cannot, since object keys are always strings. Exposing the cache is not just convenience: it is what makes the memoized function testable and lets long-running code reclaim memory. The last hidden test shows the real payoff — memoized Fibonacci calls the body 31 times for n=30 instead of over a million, because the recursive calls hit the same wrapper and find their subproblems already solved.',
  },

  {
    id: 'ch-fn-curry',
    slug: 'curry-by-arity',
    title: 'Curry by Arity',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'functional'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `curry(fn)` returning a curried version: calling it with fewer arguments than `fn` declares returns a new function waiting for the rest, and calling it with enough arguments invokes `fn`. Arguments may arrive in any grouping — `f(1)(2)(3)`, `f(1, 2)(3)` and `f(1, 2, 3)` are all equivalent. A partially applied function must be reusable: applying more arguments to it twice must not let the two calls interfere.',
    examples: [
      'const add3 = curry((a, b, c) => a + b + c);\nadd3(1)(2)(3);   // 6\nadd3(1, 2)(3);   // 6\nadd3(1)(2, 3);   // 6',
    ],
    constraints: ['Arity comes from `fn.length`.', 'A partially applied function can be reused independently.', 'Extra arguments beyond the arity are passed through to `fn`.'],
    starterCode: 'function curry(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'calls through with all arguments at once', body: 'const f = curry((a, b, c) => a + b + c); expect(f(1, 2, 3)).toBe(6);' },
      { name: 'applies one at a time', body: 'const f = curry((a, b, c) => a + b + c); expect(f(1)(2)(3)).toBe(6);' },
      { name: 'applies in mixed groupings', body: 'const f = curry((a, b, c) => a + b + c); expect(f(1, 2)(3)).toBe(6); expect(f(1)(2, 3)).toBe(6);' },
      { name: 'a partial application is reusable', body: 'const f = curry((a, b) => a + b); const add1 = f(1); expect(add1(2)).toBe(3); expect(add1(10)).toBe(11);' },
      { name: 'two branches from one partial do not interfere', body: 'const f = curry((a, b, c) => [a, b, c]); const p = f(1); expect(p(2)(3)).toEqual([1, 2, 3]); expect(p(9)(8)).toEqual([1, 9, 8]);' },
      { name: 'handles a single-argument function', body: 'const f = curry((a) => a * 2); expect(f(5)).toBe(10);' },
      { name: 'handles a two-argument function', body: 'const f = curry((a, b) => a * b); expect(f(3)(4)).toBe(12);' },
      { name: 'calls the underlying function once', body: 'let calls = 0; const f = curry((a, b) => { calls += 1; return a + b; }); f(1)(2); expect(calls).toBe(1);' },
      { name: 'does not call early', body: 'let calls = 0; const f = curry((a, b) => { calls += 1; }); f(1); expect(calls).toBe(0);' },
      { name: 'passes extra arguments through', body: 'const f = curry(function (a, b) { return arguments.length; }); expect(f(1, 2, 3)).toBe(3);' },
      { name: 'preserves falsy arguments', body: 'const f = curry((a, b) => [a, b]); expect(f(0)(false)).toEqual([0, false]);', hidden: true },
      { name: 'works for four arguments', body: 'const f = curry((a, b, c, d) => a + b + c + d); expect(f(1)(2)(3)(4)).toBe(10); expect(f(1, 2)(3, 4)).toBe(10);', hidden: true },
    ],
    hints: [
      '`fn.length` tells you how many arguments the function declares. Compare the number collected so far against it.',
      'When there are not enough yet, return a new function that concatenates its own arguments onto the ones already collected.',
      'The reusability requirement is about not mutating a shared array. Build a new array for each partial application rather than pushing into one.',
    ],
    solution:
      'function curry(fn) {\n' +
      '  return function curried(...args) {\n' +
      '    if (args.length >= fn.length) return fn.apply(this, args);\n' +
      '    return function (...more) {\n' +
      '      return curried.apply(this, [...args, ...more]);\n' +
      '    };\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'Each call either has enough arguments — in which case it invokes `fn` — or returns a function that will recheck once more arrive. The recursion is what allows any grouping: `f(1)(2, 3)` and `f(1, 2)(3)` both end up calling `curried` with three arguments, by different routes. The reusability requirement is the subtle part. `[...args, ...more]` builds a *new* array on every application, so the partial `p = f(1)` never changes; had the implementation pushed into a shared array, `p(2)(3)` would leave 2 and 3 stuck inside `p` and the second branch would see five arguments. Note that `fn.length` counts only parameters before a default or a rest parameter, so currying a function with defaults does not do what you might expect.',
  },

  {
    id: 'ch-fn-pipe',
    slug: 'pipe-and-compose',
    title: 'Pipe and Compose',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['functions', 'functional', 'higher-order'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write two combinators. `pipe(...fns)` returns a function that runs them left to right, feeding each result into the next. `compose(...fns)` does the same right to left, which is the order mathematical notation uses. The first function in the running order receives all the original arguments; every later one receives a single value. With no functions at all, both return their first argument unchanged.',
    examples: [
      'const inc = (n) => n + 1;\nconst double = (n) => n * 2;\npipe(inc, double)(3);     // 8   — inc first\ncompose(inc, double)(3);  // 7   — double first',
    ],
    constraints: ['The first function to run receives every argument.', 'With no functions, the first argument is returned unchanged.', 'Neither combinator calls anything until the returned function is called.'],
    starterCode: 'function pipe(...fns) {\n  // Your code here\n}\n\nfunction compose(...fns) {\n  // Your code here\n}\n',
    tests: [
      { name: 'pipe runs left to right', body: 'const inc = (n) => n + 1; const double = (n) => n * 2; expect(pipe(inc, double)(3)).toBe(8);' },
      { name: 'compose runs right to left', body: 'const inc = (n) => n + 1; const double = (n) => n * 2; expect(compose(inc, double)(3)).toBe(7);' },
      { name: 'pipe with one function is just that function', body: 'expect(pipe((n) => n * 3)(2)).toBe(6);' },
      { name: 'compose with one function is just that function', body: 'expect(compose((n) => n * 3)(2)).toBe(6);' },
      { name: 'pipe with none is the identity', body: 'expect(pipe()(7)).toBe(7);' },
      { name: 'compose with none is the identity', body: 'expect(compose()(7)).toBe(7);' },
      { name: 'the first function receives every argument', body: 'expect(pipe((a, b) => a + b, (n) => n * 2)(1, 2)).toBe(6);' },
      { name: 'compose passes every argument to its last function', body: 'expect(compose((n) => n * 2, (a, b) => a + b)(1, 2)).toBe(6);' },
      { name: 'chains four functions', body: 'const f = pipe((n) => n + 1, (n) => n * 2, (n) => n - 3, String); expect(f(1)).toBe("1");' },
      { name: 'nothing runs until the result is called', body: 'let calls = 0; pipe(() => { calls += 1; }); expect(calls).toBe(0);' },
      { name: 'pipe and compose are mirror images', body: 'const fns = [(n) => n + 1, (n) => n * 2, (n) => n - 3]; expect(pipe(...fns)(5)).toBe(compose(...[...fns].reverse())(5));', hidden: true },
      { name: 'values other than numbers flow through', body: 'expect(pipe((s) => s.trim(), (s) => s.toUpperCase())("  hi  ")).toBe("HI");', hidden: true },
    ],
    hints: [
      '`reduce` over the function list, carrying the running value, is the whole implementation of `pipe`.',
      'The first call is special because it takes all the arguments; the reduce seed is where that happens.',
      '`compose` is `pipe` with the list reversed — but reverse a copy, since `reverse` mutates.',
    ],
    solution:
      'function pipe(...fns) {\n' +
      '  return function (...args) {\n' +
      '    if (fns.length === 0) return args[0];\n' +
      '    let value = fns[0].apply(this, args);\n' +
      '    for (let i = 1; i < fns.length; i += 1) value = fns[i].call(this, value);\n' +
      '    return value;\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'function compose(...fns) {\n' +
      '  return pipe(...[...fns].reverse());\n' +
      '}\n',
    solutionExplanation:
      'The asymmetry between the first call and the rest is deliberate and is what makes `pipe((a, b) => a + b, double)(1, 2)` work: only the first function in the chain can meaningfully take multiple arguments, because every later one receives exactly one value — the previous result. Defining `compose` in terms of `pipe` states their relationship directly rather than duplicating the loop, and `[...fns]` before `reverse` matters because `reverse` mutates in place; without the copy, calling `compose` would silently reorder the caller\'s array. Both return a function without invoking anything, which is what the "nothing runs until called" test pins down.',
  },

  {
    id: 'ch-fn-debounce',
    slug: 'debounce-with-an-injected-clock',
    title: 'Debounce with an Injected Clock',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'event-loop'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'A debounced function delays its work until the calls stop coming: each new call cancels the pending one and restarts the wait. Write `debounce(fn, delay, schedule)` where `schedule(callback, delay)` starts a timer and returns a function that cancels it. Taking the scheduler as a parameter — rather than reaching for `setTimeout` directly — is what makes the behaviour testable without waiting in real time. When the timer finally fires, `fn` receives the arguments from the **most recent** call. The returned function also has a `cancel()` method that discards any pending call.',
    examples: [
      'const fake = (cb) => { pending = cb; return () => { pending = null; }; };\nconst save = debounce(reallySave, 300, fake);\nsave("a"); save("b");\npending();   // reallySave is called once, with "b"',
    ],
    constraints: ['`schedule(callback, delay)` returns a cancel function.', 'Only the most recent arguments are used when the timer fires.', '`cancel()` discards a pending call without invoking `fn`.'],
    starterCode: 'function debounce(fn, delay, schedule) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'does not call immediately',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let calls = 0;\n' +
          'const d = debounce(() => { calls += 1; }, 100, schedule);\n' +
          'd();\n' +
          'expect(calls).toBe(0);',
      },
      {
        name: 'calls once when the timer fires',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let calls = 0;\n' +
          'const d = debounce(() => { calls += 1; }, 100, schedule);\n' +
          'd();\n' +
          'pending();\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'collapses several rapid calls into one',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let calls = 0;\n' +
          'const d = debounce(() => { calls += 1; }, 100, schedule);\n' +
          'd(); d(); d();\n' +
          'pending();\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'uses the most recent arguments',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let seen = null;\n' +
          'const d = debounce((v) => { seen = v; }, 100, schedule);\n' +
          'd("a"); d("b");\n' +
          'pending();\n' +
          'expect(seen).toBe("b");',
      },
      {
        name: 'cancels the previous timer on each call',
        body:
          'let cancels = 0;\n' +
          'const schedule = () => () => { cancels += 1; };\n' +
          'const d = debounce(() => {}, 100, schedule);\n' +
          'd(); d(); d();\n' +
          'expect(cancels).toBe(2);',
      },
      {
        name: 'passes the delay to the scheduler',
        body:
          'let seenDelay = null;\n' +
          'const schedule = (cb, ms) => { seenDelay = ms; return () => {}; };\n' +
          'debounce(() => {}, 250, schedule)();\n' +
          'expect(seenDelay).toBe(250);',
      },
      {
        name: 'cancel discards the pending call',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let calls = 0;\n' +
          'const d = debounce(() => { calls += 1; }, 100, schedule);\n' +
          'd();\n' +
          'd.cancel();\n' +
          'expect(pending).toBe(null);\n' +
          'expect(calls).toBe(0);',
      },
      {
        name: 'works again after firing',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => { pending = null; }; };\n' +
          'let calls = 0;\n' +
          'const d = debounce(() => { calls += 1; }, 100, schedule);\n' +
          'd(); pending();\n' +
          'd(); pending();\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'forwards several arguments',
        body:
          'let pending = null;\n' +
          'const schedule = (cb) => { pending = cb; return () => {}; };\n' +
          'let seen = null;\n' +
          'const d = debounce((...args) => { seen = args; }, 10, schedule);\n' +
          'd(1, 2, 3);\n' +
          'pending();\n' +
          'expect(seen).toEqual([1, 2, 3]);',
        hidden: true,
      },
      {
        name: 'cancel on an idle debouncer is harmless',
        body:
          'const schedule = () => () => {};\n' +
          'const d = debounce(() => {}, 10, schedule);\n' +
          'expect(() => d.cancel()).not.toThrow();',
        hidden: true,
      },
    ],
    hints: [
      'Keep the cancel function returned by the last `schedule` call in a closure variable. On each new call, run it before scheduling again.',
      'Store the latest arguments in a closure variable too — the timer callback reads them when it eventually fires.',
      '`cancel` is just the same "run the stored canceller and forget it" logic, attached to the returned function as a property.',
    ],
    solution:
      'function debounce(fn, delay, schedule) {\n' +
      '  let cancelPending = null;\n' +
      '  let lastArgs = null;\n' +
      '\n' +
      '  const debounced = function (...args) {\n' +
      '    lastArgs = args;\n' +
      '    if (cancelPending) cancelPending();\n' +
      '    cancelPending = schedule(() => {\n' +
      '      cancelPending = null;\n' +
      '      fn(...lastArgs);\n' +
      '    }, delay);\n' +
      '  };\n' +
      '\n' +
      '  debounced.cancel = function () {\n' +
      '    if (cancelPending) cancelPending();\n' +
      '    cancelPending = null;\n' +
      '  };\n' +
      '\n' +
      '  return debounced;\n' +
      '}\n',
    solutionExplanation:
      'Injecting the scheduler is the design decision that matters most here. With `setTimeout` hard-coded, the only way to test this is to wait in real time, which makes the suite slow and flaky; with a scheduler parameter, the tests drive the clock directly and assert exactly what happened. The rest is two closure variables: the canceller for the timer currently in flight, and the most recent arguments. Overwriting `lastArgs` on every call is what gives debouncing its defining behaviour — the final call wins — and clearing `cancelPending` inside the timer callback keeps `cancel()` from trying to stop a timer that has already fired.',
  },

  {
    id: 'ch-fn-partial',
    slug: 'partial-application-with-holes',
    title: 'Partial Application with Holes',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'functional'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `partial(fn, ...preset)` fixing some arguments in advance. Any preset argument equal to the exported placeholder `_` leaves that position open to be filled by the next argument supplied at call time. Arguments beyond the preset list are appended at the end as usual. Export both `partial` and `_`.',
    examples: [
      'const greet = (greeting, name, punct) => greeting + ", " + name + punct;\nconst hi = partial(greet, "Hi");\nhi("Ada", "!");            // "Hi, Ada!"\n\nconst askAda = partial(greet, _, "Ada", "?");\naskAda("Hello");           // "Hello, Ada?"',
    ],
    constraints: ['`_` is a unique sentinel value, distinguishable from anything a caller might pass.', 'Holes are filled left to right from the call-time arguments.', 'Leftover call-time arguments are appended after the preset list.'],
    starterCode: 'const _ = Symbol("placeholder");\n\nfunction partial(fn, ...preset) {\n  // Your code here\n}\n',
    tests: [
      { name: 'fixes leading arguments', body: 'const greet = (g, n) => g + ", " + n; expect(partial(greet, "Hi")("Ada")).toBe("Hi, Ada");' },
      { name: 'fills a hole', body: 'const greet = (g, n) => g + ", " + n; expect(partial(greet, _, "Ada")("Hello")).toBe("Hello, Ada");' },
      { name: 'fills holes left to right', body: 'const f = (a, b, c) => [a, b, c]; expect(partial(f, _, 2, _)(1, 3)).toEqual([1, 2, 3]);' },
      { name: 'appends leftover arguments', body: 'const f = (a, b, c) => [a, b, c]; expect(partial(f, 1)(2, 3)).toEqual([1, 2, 3]);' },
      { name: 'combines holes and appending', body: 'const f = (a, b, c, d) => [a, b, c, d]; expect(partial(f, _, "b")("a", "c", "d")).toEqual(["a", "b", "c", "d"]);' },
      { name: 'presetting everything needs no call arguments', body: 'const f = (a, b) => a + b; expect(partial(f, 1, 2)()).toBe(3);' },
      { name: 'presetting nothing is a plain call', body: 'const f = (a, b) => a + b; expect(partial(f)(1, 2)).toBe(3);' },
      { name: 'the partial is reusable', body: 'const f = (a, b) => a + b; const add1 = partial(f, 1); expect(add1(2)).toBe(3); expect(add1(10)).toBe(11);' },
      { name: 'preserves falsy preset values', body: 'const f = (a, b) => [a, b]; expect(partial(f, 0)(false)).toEqual([0, false]);' },
      { name: 'undefined is not treated as a hole', body: 'const f = (a, b) => [a, b]; expect(partial(f, undefined)(2)).toEqual([undefined, 2]);' },
      { name: 'the placeholder is a symbol', body: 'expect(typeof _).toBe("symbol");', hidden: true },
      { name: 'a partial of a partial works', body: 'const f = (a, b, c) => [a, b, c]; expect(partial(partial(f, 1), 2)(3)).toEqual([1, 2, 3]);', hidden: true },
    ],
    hints: [
      'Walk the preset list, replacing each placeholder with the next unconsumed call-time argument.',
      'Keep an index into the call-time arguments and advance it only when you actually fill a hole.',
      'Whatever call-time arguments remain after the walk are appended to the end.',
    ],
    solution:
      'const _ = Symbol("placeholder");\n' +
      '\n' +
      'function partial(fn, ...preset) {\n' +
      '  return function (...later) {\n' +
      '    const args = [];\n' +
      '    let next = 0;\n' +
      '    for (const value of preset) {\n' +
      '      if (value === _ && next < later.length) {\n' +
      '        args.push(later[next]);\n' +
      '        next += 1;\n' +
      '      } else {\n' +
      '        args.push(value);\n' +
      '      }\n' +
      '    }\n' +
      '    while (next < later.length) {\n' +
      '      args.push(later[next]);\n' +
      '      next += 1;\n' +
      '    }\n' +
      '    return fn.apply(this, args);\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The placeholder is a `Symbol` for a specific reason: a sentinel has to be a value no caller could accidentally supply, and every symbol is unique, so `_ === _` is true only for this exact one. Using `undefined` or a string as the marker would make `partial(f, undefined)` ambiguous — the tests check that `undefined` is passed through as a real argument, not treated as a hole. Building a fresh `args` array inside the returned function rather than mutating `preset` is what makes the partial reusable across calls, and advancing `next` only when a hole is actually filled is what keeps the leftover arguments landing in the right place.',
  },

  {
    id: 'ch-fn-private-state',
    slug: 'a-counter-with-private-state',
    title: 'A Counter with Private State',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['closures', 'functions', 'scope'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `createCounter(start = 0)` returning an object with `increment()`, `decrement()`, `reset()` and `value()`. The count must be genuinely private: it lives in a closure, so no property on the returned object exposes or allows tampering with it. `increment` and `decrement` return the new count. `reset` returns the counter to its original starting value.',
    examples: [
      'const c = createCounter(10);\nc.increment();  // 11\nc.increment();  // 12\nc.value();      // 12\nc.reset();\nc.value();      // 10',
    ],
    constraints: ['The count is not reachable as a property of the returned object.', 'Two counters are fully independent.', '`reset` restores the original start value, not zero.'],
    starterCode: 'function createCounter(start = 0) {\n  // Your code here\n}\n',
    tests: [
      { name: 'starts at zero by default', body: 'expect(createCounter().value()).toBe(0);' },
      { name: 'starts at the given value', body: 'expect(createCounter(10).value()).toBe(10);' },
      { name: 'increments', body: 'const c = createCounter(); c.increment(); c.increment(); expect(c.value()).toBe(2);' },
      { name: 'increment returns the new count', body: 'const c = createCounter(5); expect(c.increment()).toBe(6);' },
      { name: 'decrements', body: 'const c = createCounter(5); expect(c.decrement()).toBe(4);' },
      { name: 'goes negative', body: 'const c = createCounter(); c.decrement(); expect(c.value()).toBe(-1);' },
      { name: 'reset returns to the start value, not zero', body: 'const c = createCounter(10); c.increment(); c.reset(); expect(c.value()).toBe(10);' },
      { name: 'two counters are independent', body: 'const a = createCounter(); const b = createCounter(); a.increment(); expect(b.value()).toBe(0);' },
      { name: 'the count is not an own property', body: 'const c = createCounter(); c.increment(); expect(Object.values(c).some((v) => v === 1)).toBe(false);' },
      { name: 'assigning a property does not change the count', body: 'const c = createCounter(); c.count = 99; c.value = c.value; expect(createCounter().value()).toBe(0);', hidden: true },
      { name: 'works after many operations', body: 'const c = createCounter(); for (let i = 0; i < 100; i += 1) c.increment(); for (let i = 0; i < 40; i += 1) c.decrement(); expect(c.value()).toBe(60);', hidden: true },
    ],
    hints: [
      'Declare the count as a local variable inside `createCounter`, not as a property of the returned object.',
      'The four methods all close over that same variable, which is what keeps them in sync.',
      'For `reset` you need to remember the original start — the parameter itself is already a local variable that never changes.',
    ],
    solution:
      'function createCounter(start = 0) {\n' +
      '  let count = start;\n' +
      '  return {\n' +
      '    increment() {\n' +
      '      count += 1;\n' +
      '      return count;\n' +
      '    },\n' +
      '    decrement() {\n' +
      '      count -= 1;\n' +
      '      return count;\n' +
      '    },\n' +
      '    reset() {\n' +
      '      count = start;\n' +
      '      return count;\n' +
      '    },\n' +
      '    value() {\n' +
      '      return count;\n' +
      '    },\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The four methods are created inside the same call to `createCounter`, so they all close over the same `count` binding — that shared binding is what makes them a coherent object rather than four unrelated functions. Because `count` is a local variable and never assigned to the returned object, there is no property to read or overwrite from outside; this is genuine encapsulation, achieved before JavaScript had `#private` class fields and still the mechanism underneath many module patterns. Each call to `createCounter` creates a fresh binding, which is why two counters never interfere. `start` works as the reset target for free: it is itself a per-call local that nothing reassigns.',
  },

  {
    id: 'ch-fn-bind',
    slug: 'implement-bind',
    title: 'Implement bind',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['functions', 'this', 'prototypes'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `bindTo(fn, thisArg, ...preset)` reproducing what `Function.prototype.bind` does, without calling `bind`. The returned function invokes `fn` with `thisArg` as its receiver and the preset arguments in front of whatever else is supplied. A bound function\'s `this` cannot be changed afterwards — calling it as a method of some other object must still use `thisArg`. The one exception is `new`: when the bound function is used as a constructor, the freshly created object wins and `thisArg` is ignored.',
    examples: [
      'const getX = function () { return this.x; };\nconst bound = bindTo(getX, { x: 1 });\nbound();                       // 1\n({ x: 99, m: bound }).m();     // still 1',
    ],
    constraints: ['Do not use `Function.prototype.bind`.', 'Preset arguments come before call-time arguments.', 'Used with `new`, the new instance is the receiver and `thisArg` is ignored.'],
    starterCode: 'function bindTo(fn, thisArg, ...preset) {\n  // Your code here\n}\n',
    tests: [
      { name: 'binds the receiver', body: 'const getX = function () { return this.x; }; expect(bindTo(getX, { x: 1 })()).toBe(1);' },
      { name: 'the receiver cannot be overridden by call site', body: 'const getX = function () { return this.x; }; const bound = bindTo(getX, { x: 1 }); const obj = { x: 99, m: bound }; expect(obj.m()).toBe(1);' },
      { name: 'the receiver cannot be overridden by call', body: 'const getX = function () { return this.x; }; const bound = bindTo(getX, { x: 1 }); expect(bound.call({ x: 99 })).toBe(1);' },
      { name: 'presets arguments', body: 'const add = (a, b) => a + b; expect(bindTo(add, null, 1)(2)).toBe(3);' },
      { name: 'presets come first', body: 'const list = (...args) => args; expect(bindTo(list, null, 1, 2)(3)).toEqual([1, 2, 3]);' },
      { name: 'works with no presets', body: 'const list = (...args) => args; expect(bindTo(list, null)(1, 2)).toEqual([1, 2]);' },
      { name: 'returns the underlying return value', body: 'expect(bindTo(() => 42, null)()).toBe(42);' },
      { name: 'does not call the function early', body: 'let calls = 0; bindTo(() => { calls += 1; }, null); expect(calls).toBe(0);' },
      {
        name: 'used with new, the instance wins',
        body:
          'function Point(x, y) { this.x = x; this.y = y; }\n' +
          'const Bound = bindTo(Point, { x: 999 }, 1);\n' +
          'const p = new Bound(2);\n' +
          'expect(p.x).toBe(1);\n' +
          'expect(p.y).toBe(2);',
      },
      {
        name: 'an instance from the bound constructor is an instance of the original',
        body:
          'function Point(x) { this.x = x; }\n' +
          'const Bound = bindTo(Point, null);\n' +
          'expect(new Bound(1) instanceof Point).toBe(true);',
        hidden: true,
      },
      { name: 'binding a method keeps working when detached', body: 'const obj = { n: 5, get() { return this.n; } }; const detached = bindTo(obj.get, obj); expect(detached()).toBe(5);', hidden: true },
    ],
    hints: [
      'The returned function must be a `function` declaration or expression, not an arrow — an arrow has no `this` of its own and cannot be used with `new`.',
      '`fn.apply(thisArg, [...preset, ...args])` handles the ordinary call. The `new` case is the interesting half.',
      '`new.target` inside the wrapper tells you it was called with `new`. In that case, pass the wrapper\'s own `this` through instead of `thisArg` — and make sure the prototype chain is right so `instanceof` still works.',
    ],
    solution:
      'function bindTo(fn, thisArg, ...preset) {\n' +
      '  function bound(...args) {\n' +
      '    const allArgs = [...preset, ...args];\n' +
      '    if (new.target) return new fn(...allArgs);\n' +
      '    return fn.apply(thisArg, allArgs);\n' +
      '  }\n' +
      '  bound.prototype = Object.create(fn.prototype ?? null);\n' +
      '  return bound;\n' +
      '}\n',
    solutionExplanation:
      'Two things make this harder than it first looks. The first is that a bound function\'s receiver is genuinely fixed — `apply` with `thisArg` ignores whatever the call site provides, which is why `bound.call({ x: 99 })` still sees the original object. The second is the `new` exception written into the specification: constructing a bound function must use the newly created instance, not the bound receiver. `new.target` is how the wrapper detects that it was invoked with `new`, and delegating with `new fn(...)` creates an object whose prototype chain comes from `fn` — so `instanceof Point` holds. Setting `bound.prototype` from `fn.prototype` keeps that relationship consistent even for code that inspects it directly. An arrow function could not do any of this: arrows have no `this` binding and cannot be constructed.',
  },

  {
    id: 'ch-fn-call-count',
    slug: 'a-counting-wrapper',
    title: 'A Counting Wrapper',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['functions', 'closures', 'testing'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Test doubles need to record what happened. Write `spy(fn)` returning a wrapper that behaves exactly like `fn` but also records every call. The wrapper carries `calls` — an array of the argument arrays, in order — and `results`, an array of what each call returned. A call that throws is still recorded in `calls`, and the error propagates to the caller unchanged. When `fn` is omitted, the wrapper does nothing and returns `undefined`.',
    examples: [
      'const s = spy((a, b) => a + b);\ns(1, 2);\ns(3, 4);\ns.calls;    // [[1, 2], [3, 4]]\ns.results;  // [3, 7]',
    ],
    constraints: ['`calls` holds one array of arguments per call.', 'A throwing call is recorded before the error propagates.', 'With no function given, the spy is a no-op returning `undefined`.'],
    starterCode: 'function spy(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'passes the return value through', body: 'const s = spy((a, b) => a + b); expect(s(1, 2)).toBe(3);' },
      { name: 'records the arguments', body: 'const s = spy((a, b) => a + b); s(1, 2); s(3, 4); expect(s.calls).toEqual([[1, 2], [3, 4]]);' },
      { name: 'records the results', body: 'const s = spy((a, b) => a + b); s(1, 2); s(3, 4); expect(s.results).toEqual([3, 7]);' },
      { name: 'starts with empty records', body: 'const s = spy(() => {}); expect(s.calls).toEqual([]); expect(s.results).toEqual([]);' },
      { name: 'records a call with no arguments', body: 'const s = spy(() => {}); s(); expect(s.calls).toEqual([[]]);' },
      { name: 'works with no function given', body: 'const s = spy(); expect(s(1)).toBe(undefined); expect(s.calls).toEqual([[1]]);' },
      { name: 'lets an error propagate', body: 'const s = spy(() => { throw new Error("boom"); }); expect(() => s()).toThrow("boom");' },
      { name: 'records a throwing call', body: 'const s = spy(() => { throw new Error("boom"); }); try { s(1); } catch { /* expected */ } expect(s.calls).toEqual([[1]]);' },
      { name: 'forwards this', body: 'const s = spy(function () { return this.n; }); expect(s.call({ n: 7 })).toBe(7);' },
      { name: 'two spies record independently', body: 'const a = spy(() => {}); const b = spy(() => {}); a(1); expect(b.calls).toEqual([]);', hidden: true },
      { name: 'records the call before the function runs', body: 'const s = spy(function () { return s.calls.length; }); expect(s()).toBe(1);', hidden: true },
    ],
    hints: [
      'Push the arguments into `calls` *before* invoking the function, so a call that throws is still recorded.',
      'Push into `results` after the call returns — a throwing call has no result to record.',
      'Attach both arrays to the wrapper as properties before returning it.',
    ],
    solution:
      'function spy(fn) {\n' +
      '  const wrapped = function (...args) {\n' +
      '    wrapped.calls.push(args);\n' +
      '    const result = fn ? fn.apply(this, args) : undefined;\n' +
      '    wrapped.results.push(result);\n' +
      '    return result;\n' +
      '  };\n' +
      '  wrapped.calls = [];\n' +
      '  wrapped.results = [];\n' +
      '  return wrapped;\n' +
      '}\n',
    solutionExplanation:
      'Recording before the call and the result after is the whole ordering decision, and it is what makes the throwing-call test pass: the arguments are already in `calls` when the exception unwinds, so a failed call is still visible to the test. Nothing is caught — the error propagates untouched, which is essential, since a spy that swallowed exceptions would hide real failures. Attaching the arrays as properties of the wrapper rather than keeping them purely in the closure is what lets a test read them, and the last hidden test confirms the ordering by having the spied function observe its own call already recorded.',
  },

  {
    id: 'ch-fn-trampoline',
    slug: 'trampoline-deep-recursion',
    title: 'Trampoline Deep Recursion',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['functions', 'recursion', 'functional'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'JavaScript engines do not eliminate tail calls, so a recursion 200,000 levels deep overflows the stack even when it is written tail-recursively. A trampoline fixes that: instead of recursing, the function returns a *thunk* — a zero-argument function representing the next step — and a driver loop calls thunks until a real value comes back. Write `trampoline(fn)` returning a function that starts `fn`, then keeps invoking any returned function until the result is not a function, and returns that value.',
    examples: [
      'const sumTo = trampoline(function step(n, acc = 0) {\n  return n === 0 ? acc : () => step(n - 1, acc + n);\n});\nsumTo(200000);  // 20000100000, no stack overflow',
    ],
    constraints: ['A returned function means "there is more to do".', 'Any non-function result is the final answer.', 'Arguments to the trampolined function are forwarded to the first call.'],
    starterCode: 'function trampoline(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns a plain result directly', body: 'expect(trampoline(() => 42)()).toBe(42);' },
      { name: 'forwards arguments', body: 'expect(trampoline((a, b) => a + b)(1, 2)).toBe(3);' },
      { name: 'runs a single thunk', body: 'expect(trampoline(() => () => 7)()).toBe(7);' },
      { name: 'runs a chain of thunks', body: 'expect(trampoline(() => () => () => () => 9)()).toBe(9);' },
      {
        name: 'drives a tail-recursive sum',
        body:
          'const sumTo = trampoline(function step(n, acc = 0) { return n === 0 ? acc : () => step(n - 1, acc + n); });\n' +
          'expect(sumTo(10)).toBe(55);',
      },
      {
        name: 'survives a depth that would overflow the stack',
        body:
          'const sumTo = trampoline(function step(n, acc = 0) { return n === 0 ? acc : () => step(n - 1, acc + n); });\n' +
          'expect(sumTo(200000)).toBe(20000100000);',
      },
      { name: 'returns a falsy final value correctly', body: 'expect(trampoline(() => () => 0)()).toBe(0);' },
      { name: 'returns null as a final value', body: 'expect(trampoline(() => () => null)()).toBe(null);' },
      { name: 'returns undefined as a final value', body: 'expect(trampoline(() => () => undefined)()).toBe(undefined);' },
      {
        name: 'drives mutual recursion',
        body:
          'const isEven = (n) => (n === 0 ? true : () => isOdd(n - 1));\n' +
          'const isOdd = (n) => (n === 0 ? false : () => isEven(n - 1));\n' +
          'expect(trampoline(isEven)(100000)).toBe(true);\n' +
          'expect(trampoline(isEven)(99999)).toBe(false);',
        hidden: true,
      },
      { name: 'lets an error from a thunk propagate', body: 'expect(() => trampoline(() => () => { throw new Error("boom"); })()).toThrow("boom");', hidden: true },
    ],
    hints: [
      'The driver is a `while` loop, not recursion — that is the entire point.',
      'Call `fn` with the forwarded arguments to get a starting result, then loop while that result is a function.',
      'Test with `typeof result === "function"`, not truthiness: `0`, `null` and `undefined` are all valid final answers.',
    ],
    solution:
      'function trampoline(fn) {\n' +
      '  return function (...args) {\n' +
      '    let result = fn.apply(this, args);\n' +
      '    while (typeof result === "function") {\n' +
      '      result = result();\n' +
      '    }\n' +
      '    return result;\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The recursion is traded for iteration: each step returns rather than calling, so its stack frame is gone before the next step begins, and the depth of the computation stops being the depth of the stack. That is what lets a 200,000-step sum run in constant stack space where a direct tail-recursive version overflows — ES2015 specified proper tail calls, but no major engine except JavaScriptCore ships them, so the trampoline is the portable answer. Testing `typeof result === "function"` rather than truthiness is essential: `0`, `null` and `undefined` are all legitimate final values and a truthiness check would treat them as "keep going" or stop early. The trade-off is that every step allocates a closure, so a trampoline is slower than a plain loop — it earns its place when the recursive shape is the clearest expression of the algorithm.',
  },

  {
    id: 'ch-fn-arity',
    slug: 'controlling-arity',
    title: 'Controlling Arity',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['functions', 'higher-order', 'array-methods'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Array methods pass more arguments to their callbacks than people expect, and `["1", "2", "3"].map(parseInt)` famously returns `[1, NaN, NaN]` because `parseInt` receives the index as its radix. Write `nAry(fn, n)` returning a wrapper that forwards only the first `n` arguments and drops the rest. Also export `unary(fn)`, which is `nAry(fn, 1)`.',
    examples: [
      '["1", "2", "3"].map(parseInt);          // [1, NaN, NaN]\n["1", "2", "3"].map(unary(parseInt));   // [1, 2, 3]',
    ],
    constraints: ['Extra arguments are dropped, not passed as `undefined`.', '`this` is forwarded.', '`nAry(fn, 0)` calls `fn` with no arguments at all.'],
    starterCode: 'function nAry(fn, n) {\n  // Your code here\n}\n\nfunction unary(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'forwards the allowed arguments', body: 'const f = nAry((a, b) => [a, b], 2); expect(f(1, 2)).toEqual([1, 2]);' },
      { name: 'drops the extras', body: 'const f = nAry((...args) => args, 2); expect(f(1, 2, 3, 4)).toEqual([1, 2]);' },
      { name: 'does not pad with undefined', body: 'const f = nAry(function () { return arguments.length; }, 2); expect(f(1)).toBe(1);' },
      { name: 'zero arity passes nothing', body: 'const f = nAry((...args) => args, 0); expect(f(1, 2)).toEqual([]);' },
      { name: 'unary keeps only the first argument', body: 'const f = unary((...args) => args); expect(f(1, 2, 3)).toEqual([1]);' },
      { name: 'fixes the classic parseInt bug', body: 'expect(["1", "2", "3"].map(unary(parseInt))).toEqual([1, 2, 3]);' },
      { name: 'the unfixed version really is broken', body: 'expect(["1", "2", "3"].map(parseInt)).toEqual([1, NaN, NaN]);' },
      { name: 'returns the underlying result', body: 'expect(unary((n) => n * 2)(5)).toBe(10);' },
      { name: 'forwards this', body: 'const f = unary(function (a) { return this.n + a; }); expect(f.call({ n: 1 }, 2)).toBe(3);' },
      { name: 'preserves falsy arguments', body: 'expect(nAry((...args) => args, 2)(0, false, 3)).toEqual([0, false]);', hidden: true },
    ],
    hints: [
      'Collect the arguments with a rest parameter, then `slice` them to the allowed length before applying.',
      '`slice(0, n)` on an array shorter than `n` returns the whole array, so a caller supplying too few arguments is handled without a special case.',
      '`unary` is just `nAry(fn, 1)` — define it in terms of the general version rather than repeating the logic.',
    ],
    solution:
      'function nAry(fn, n) {\n' +
      '  return function (...args) {\n' +
      '    return fn.apply(this, args.slice(0, n));\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'function unary(fn) {\n' +
      '  return nAry(fn, 1);\n' +
      '}\n',
    solutionExplanation:
      '`slice(0, n)` truncates without padding, which is exactly the required behaviour — the arity test confirms a call with one argument stays a one-argument call rather than becoming two with an `undefined`. The `parseInt` case is the reason this combinator exists: `map` calls its callback with `(value, index, array)`, so `parseInt("2", 1)` asks for base 1, which is not a valid radix and yields `NaN`, while `parseInt("3", 2)` asks for binary and `"3"` is not a binary digit. Wrapping with `unary` cuts the extra arguments off at the source. Defining `unary` through `nAry` keeps one implementation rather than two that could drift apart.',
  },

  {
    id: 'ch-fn-flip',
    slug: 'flip-and-rearrange',
    title: 'Flip and Rearrange',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['functions', 'functional', 'higher-order'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `flip(fn)` returning a function that swaps the first two arguments and passes everything else through unchanged. This is the small adapter that lets a function written as `divide(a, b)` be used where `divide(b, a)` is wanted, without writing a new lambda at every call site. A call with fewer than two arguments passes through untouched.',
    examples: [
      'const divide = (a, b) => a / b;\ndivide(10, 2);        // 5\nflip(divide)(10, 2);  // 0.2',
    ],
    constraints: ['Only the first two arguments swap.', 'Arguments beyond the second keep their positions.', 'Fewer than two arguments means nothing to swap.'],
    starterCode: 'function flip(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'swaps two arguments', body: 'const divide = (a, b) => a / b; expect(flip(divide)(10, 2)).toBe(0.2);' },
      { name: 'the unflipped version is unchanged', body: 'const divide = (a, b) => a / b; expect(divide(10, 2)).toBe(5);' },
      { name: 'later arguments keep their positions', body: 'const f = (...args) => args; expect(flip(f)(1, 2, 3, 4)).toEqual([2, 1, 3, 4]);' },
      { name: 'a single argument passes through', body: 'const f = (...args) => args; expect(flip(f)(1)).toEqual([1]);' },
      { name: 'no arguments passes through', body: 'const f = (...args) => args; expect(flip(f)()).toEqual([]);' },
      { name: 'flipping twice restores the original', body: 'const f = (a, b) => a + "-" + b; expect(flip(flip(f))("x", "y")).toBe("x-y");' },
      { name: 'returns the underlying result', body: 'expect(flip((a, b) => a - b)(1, 10)).toBe(9);' },
      { name: 'forwards this', body: 'const f = flip(function (a, b) { return this.n + a + b; }); expect(f.call({ n: "n" }, "a", "b")).toBe("nba");' },
      { name: 'preserves falsy arguments', body: 'const f = (...args) => args; expect(flip(f)(0, false)).toEqual([false, 0]);', hidden: true },
      { name: 'does not mutate anything shared', body: 'const f = (...args) => args; const flipped = flip(f); flipped(1, 2); expect(flipped(3, 4)).toEqual([4, 3]);', hidden: true },
    ],
    hints: [
      'Collect the arguments with a rest parameter, then rebuild the list with the first two exchanged.',
      'Destructuring makes it read well: `(a, b, ...rest)` then apply `[b, a, ...rest]`.',
      'With fewer than two arguments, destructuring gives `undefined` for the missing ones — guard on `args.length` so they are not passed along as real arguments.',
    ],
    solution:
      'function flip(fn) {\n' +
      '  return function (...args) {\n' +
      '    if (args.length < 2) return fn.apply(this, args);\n' +
      '    const [a, b, ...rest] = args;\n' +
      '    return fn.apply(this, [b, a, ...rest]);\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The length guard is the part that is easy to get wrong. Destructuring `(a, b, ...rest)` from a one-element array gives `b` the value `undefined`, and rebuilding as `[b, a]` would turn a one-argument call into a two-argument call whose first argument is `undefined` — a visible difference for anything that inspects `arguments.length` or has a default parameter. Handling that case by passing the arguments straight through keeps the wrapper honest. `flip` being its own inverse follows directly from swapping exactly two positions, which the double-flip test confirms.',
  },
];

export default challenges;
