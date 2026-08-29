import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Async & Promises';

export const challenges = [
  {
    id: 'ch-async-all',
    slug: 'implement-promise-all',
    title: 'Implement Promise.all',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['promises', 'async-foundations', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `all(items)` reproducing `Promise.all` without calling it. It returns a promise fulfilling with an array of results **in input order**, however the individual promises finish. It rejects as soon as any input rejects, with that first rejection reason. Non-promise values in the array are treated as already-fulfilled. An empty array fulfils immediately with `[]`.',
    examples: [
      'await all([Promise.resolve(1), 2, Promise.resolve(3)]);  // [1, 2, 3]',
      'await all([]);  // []',
    ],
    constraints: ['Do not call `Promise.all`, `Promise.allSettled` or `Promise.any`.', 'Results are in input order, not completion order.', 'Rejects with the first rejection reason.'],
    starterCode: 'function all(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'fulfils with every result', body: 'expect(await all([Promise.resolve(1), Promise.resolve(2)])).toEqual([1, 2]);' },
      { name: 'treats plain values as fulfilled', body: 'expect(await all([1, Promise.resolve(2), 3])).toEqual([1, 2, 3]);' },
      { name: 'fulfils with an empty array for empty input', body: 'expect(await all([])).toEqual([]);' },
      { name: 'returns a promise', body: 'const p = all([]); expect(p instanceof Promise).toBe(true); await p;' },
      {
        name: 'preserves input order regardless of completion order',
        body:
          'const slow = new Promise((r) => setTimeout(() => r("slow"), 20));\n' +
          'const fast = Promise.resolve("fast");\n' +
          'expect(await all([slow, fast])).toEqual(["slow", "fast"]);',
      },
      { name: 'rejects when one input rejects', body: 'let e = null; try { await all([Promise.resolve(1), Promise.reject(new Error("boom"))]); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      {
        name: 'rejects with the first rejection',
        body:
          'const late = new Promise((_, rej) => setTimeout(() => rej(new Error("late")), 20));\n' +
          'let e = null;\n' +
          'try { await all([late, Promise.reject(new Error("early"))]); } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("early");',
      },
      { name: 'a single rejection is enough', body: 'let e = null; try { await all([Promise.reject(new Error("x"))]); } catch (err) { e = err; } expect(e.message).toBe("x");' },
      { name: 'handles a single value', body: 'expect(await all([Promise.resolve(7)])).toEqual([7]);' },
      { name: 'handles falsy results', body: 'expect(await all([Promise.resolve(0), Promise.resolve(false), Promise.resolve(null)])).toEqual([0, false, null]);' },
      {
        name: 'starts every promise, it does not run them one at a time',
        body:
          'let started = 0;\n' +
          'const make = () => new Promise((r) => { started += 1; setTimeout(() => r(1), 5); });\n' +
          'const p = all([make(), make(), make()]);\n' +
          'expect(started).toBe(3);\n' +
          'await p;',
        hidden: true,
      },
      { name: 'handles a longer list', body: 'expect(await all(Array.from({ length: 50 }, (_, i) => Promise.resolve(i)))).toEqual(Array.from({ length: 50 }, (_, i) => i));', hidden: true },
    ],
    hints: [
      'Return a new `Promise`. Inside its executor, attach a handler to each input and record the result at its own index.',
      'Count how many have settled. Resolve the outer promise only when that count reaches the input length — do not rely on the last one to finish being the last one in the array.',
      'Wrapping each item with `Promise.resolve(item)` handles both promises and plain values with one code path.',
    ],
    solution:
      'function all(items) {\n' +
      '  return new Promise((resolve, reject) => {\n' +
      '    const results = new Array(items.length);\n' +
      '    let remaining = items.length;\n' +
      '    if (remaining === 0) {\n' +
      '      resolve([]);\n' +
      '      return;\n' +
      '    }\n' +
      '    items.forEach((item, index) => {\n' +
      '      Promise.resolve(item).then(\n' +
      '        (value) => {\n' +
      '          results[index] = value;\n' +
      '          remaining -= 1;\n' +
      '          if (remaining === 0) resolve(results);\n' +
      '        },\n' +
      '        reject,\n' +
      '      );\n' +
      '    });\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'Writing results into `results[index]` rather than pushing is what preserves input order — a pushed array would come out in completion order, which is what the slow/fast test checks. The `remaining` counter is needed because "all done" cannot be detected by watching any single promise; only a count knows when the last one has settled. Passing `reject` directly as the rejection handler gives first-rejection-wins for free: a promise can only settle once, so the earliest call takes effect and later ones are ignored. The empty-array guard is real — with no items, `remaining` starts at 0 and nothing would ever resolve the outer promise. And because every handler is attached in the same synchronous pass, the operations run concurrently rather than in sequence.',
  },

  {
    id: 'ch-async-all-settled',
    slug: 'implement-all-settled',
    title: 'Implement allSettled',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['promises', 'async-foundations', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `allSettled(items)` reproducing `Promise.allSettled`. Unlike `all`, it never rejects: it waits for every input to settle and fulfils with one descriptor per input, in input order. A fulfilled input gives `{ status: "fulfilled", value }`; a rejected one gives `{ status: "rejected", reason }`. This is the shape you want when partial failure is acceptable and you need to report which parts failed.',
    examples: [
      'await allSettled([Promise.resolve(1), Promise.reject(new Error("no"))]);\n// [{ status: "fulfilled", value: 1 },\n//  { status: "rejected", reason: Error("no") }]',
    ],
    constraints: ['Do not call `Promise.allSettled`.', 'The returned promise never rejects.', 'Descriptors are in input order.'],
    starterCode: 'function allSettled(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'describes a fulfilled result', body: 'expect(await allSettled([Promise.resolve(1)])).toEqual([{ status: "fulfilled", value: 1 }]);' },
      { name: 'describes a rejection without rejecting', body: 'const out = await allSettled([Promise.reject(new Error("no"))]); expect(out[0].status).toBe("rejected"); expect(out[0].reason.message).toBe("no");' },
      { name: 'mixes both kinds', body: 'const out = await allSettled([Promise.resolve(1), Promise.reject(new Error("no"))]); expect(out[0]).toEqual({ status: "fulfilled", value: 1 }); expect(out[1].status).toBe("rejected");' },
      { name: 'never rejects', body: 'let threw = false; try { await allSettled([Promise.reject(new Error("a")), Promise.reject(new Error("b"))]); } catch { threw = true; } expect(threw).toBe(false);' },
      { name: 'fulfils with an empty array for empty input', body: 'expect(await allSettled([])).toEqual([]);' },
      { name: 'treats plain values as fulfilled', body: 'expect(await allSettled([5])).toEqual([{ status: "fulfilled", value: 5 }]);' },
      {
        name: 'preserves input order regardless of timing',
        body:
          'const slow = new Promise((r) => setTimeout(() => r("slow"), 20));\n' +
          'const out = await allSettled([slow, Promise.resolve("fast")]);\n' +
          'expect(out.map((d) => d.value)).toEqual(["slow", "fast"]);',
      },
      { name: 'a fulfilled descriptor has no reason key', body: 'const out = await allSettled([Promise.resolve(1)]); expect("reason" in out[0]).toBe(false);' },
      { name: 'a rejected descriptor has no value key', body: 'const out = await allSettled([Promise.reject(new Error("x"))]); expect("value" in out[0]).toBe(false);' },
      { name: 'preserves a falsy fulfilment value', body: 'expect(await allSettled([Promise.resolve(0)])).toEqual([{ status: "fulfilled", value: 0 }]);' },
      { name: 'preserves a non-Error rejection reason', body: 'const out = await allSettled([Promise.reject("plain string")]); expect(out[0].reason).toBe("plain string");', hidden: true },
      { name: 'handles a longer mixed list', body: 'const items = Array.from({ length: 20 }, (_, i) => (i % 2 ? Promise.reject(new Error(String(i))) : Promise.resolve(i))); const out = await allSettled(items); expect(out.filter((d) => d.status === "rejected").length).toBe(10);', hidden: true },
    ],
    hints: [
      'The structure is the same as `all`, but both handlers record a descriptor instead of one resolving and the other rejecting.',
      'Since nothing rejects, the counter is the only thing that decides when the outer promise resolves.',
      'The descriptor shapes are asymmetric on purpose — a fulfilled one has no `reason` key at all, not a `reason` of `undefined`.',
    ],
    solution:
      'function allSettled(items) {\n' +
      '  return new Promise((resolve) => {\n' +
      '    const results = new Array(items.length);\n' +
      '    let remaining = items.length;\n' +
      '    if (remaining === 0) {\n' +
      '      resolve([]);\n' +
      '      return;\n' +
      '    }\n' +
      '    const settle = (index, descriptor) => {\n' +
      '      results[index] = descriptor;\n' +
      '      remaining -= 1;\n' +
      '      if (remaining === 0) resolve(results);\n' +
      '    };\n' +
      '    items.forEach((item, index) => {\n' +
      '      Promise.resolve(item).then(\n' +
      '        (value) => settle(index, { status: "fulfilled", value }),\n' +
      '        (reason) => settle(index, { status: "rejected", reason }),\n' +
      '      );\n' +
      '    });\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'The executor takes only `resolve` — there is deliberately no `reject` in scope, which makes "never rejects" a structural property rather than something to remember. Both handlers funnel through the same `settle` helper, so the counter is decremented exactly once per input whichever way it went. The descriptor shapes matter: the tests check that a fulfilled descriptor has no `reason` *key*, which is what building the object literal per branch gives you, and what a single object with both keys would not. Using `allSettled` rather than `all` is the right choice whenever a partial result is still useful and you need to report which parts failed.',
  },

  {
    id: 'ch-async-any',
    slug: 'first-one-to-succeed',
    title: 'First One to Succeed',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['promises', 'errors', 'async-foundations'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `any(items)` reproducing `Promise.any`: it fulfils with the first input to fulfil, ignoring rejections. Only if **every** input rejects does it reject, and then with an `AggregateError` whose `errors` array holds every rejection reason in input order. An empty input array rejects immediately with an `AggregateError` holding no errors.',
    examples: [
      'await any([Promise.reject(new Error("a")), Promise.resolve(2)]);  // 2',
      'try { await any([Promise.reject(new Error("a"))]); }\ncatch (e) { e.errors[0].message; }  // "a"',
    ],
    constraints: ['Do not call `Promise.any`.', 'The rejection is an `AggregateError` with an `errors` array in input order.', 'Non-promise values count as fulfilled.'],
    starterCode: 'function any(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'fulfils with the only success', body: 'expect(await any([Promise.reject(new Error("a")), Promise.resolve(2)])).toBe(2);' },
      { name: 'ignores a later rejection', body: 'expect(await any([Promise.resolve(1), Promise.reject(new Error("a"))])).toBe(1);' },
      {
        name: 'fulfils with the first to succeed, not the first in order',
        body:
          'const slow = new Promise((r) => setTimeout(() => r("slow"), 20));\n' +
          'expect(await any([slow, Promise.resolve("fast")])).toBe("fast");',
      },
      { name: 'treats plain values as fulfilled', body: 'expect(await any([Promise.reject(new Error("a")), 7])).toBe(7);' },
      { name: 'rejects when everything rejects', body: 'let e = null; try { await any([Promise.reject(new Error("a"))]); } catch (err) { e = err; } expect(e instanceof AggregateError).toBe(true);' },
      { name: 'collects every reason', body: 'let e = null; try { await any([Promise.reject(new Error("a")), Promise.reject(new Error("b"))]); } catch (err) { e = err; } expect(e.errors.map((x) => x.message)).toEqual(["a", "b"]);' },
      {
        name: 'the reasons are in input order, not rejection order',
        body:
          'const late = new Promise((_, rej) => setTimeout(() => rej(new Error("first-in-list")), 20));\n' +
          'let e = null;\n' +
          'try { await any([late, Promise.reject(new Error("second-in-list"))]); } catch (err) { e = err; }\n' +
          'expect(e.errors.map((x) => x.message)).toEqual(["first-in-list", "second-in-list"]);',
      },
      { name: 'an empty input rejects', body: 'let e = null; try { await any([]); } catch (err) { e = err; } expect(e instanceof AggregateError).toBe(true); expect(e.errors).toEqual([]);' },
      { name: 'fulfils with a falsy value rather than treating it as failure', body: 'expect(await any([Promise.reject(new Error("a")), Promise.resolve(0)])).toBe(0);' },
      { name: 'returns a promise', body: 'const p = any([1]); expect(p instanceof Promise).toBe(true); await p;' },
      { name: 'succeeds even if most reject', body: 'expect(await any([Promise.reject(new Error("a")), Promise.reject(new Error("b")), Promise.resolve("ok")])).toBe("ok");', hidden: true },
      { name: 'a single success is enough', body: 'expect(await any([Promise.resolve("only")])).toBe("only");', hidden: true },
    ],
    hints: [
      'This is the mirror image of `all`: fulfilment resolves immediately, and rejections are the thing you count.',
      'Record each rejection reason at its own index so the `errors` array follows input order rather than the order they failed in.',
      'Reject only when the rejection count reaches the input length — and remember the empty-array case, where that is true from the start.',
    ],
    solution:
      'function any(items) {\n' +
      '  return new Promise((resolve, reject) => {\n' +
      '    const errors = new Array(items.length);\n' +
      '    let remaining = items.length;\n' +
      '    if (remaining === 0) {\n' +
      '      reject(new AggregateError([], "All promises were rejected"));\n' +
      '      return;\n' +
      '    }\n' +
      '    items.forEach((item, index) => {\n' +
      '      Promise.resolve(item).then(resolve, (reason) => {\n' +
      '        errors[index] = reason;\n' +
      '        remaining -= 1;\n' +
      '        if (remaining === 0) reject(new AggregateError(errors, "All promises were rejected"));\n' +
      '      });\n' +
      '    });\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      '`any` inverts `all`: fulfilment is the fast path, passed straight to `resolve` so the first success wins and every later settlement is ignored, while rejections are accumulated. Writing each reason to `errors[index]` rather than pushing is what makes the `errors` array follow input order — the test with a slow first rejection would otherwise come out backwards. `AggregateError` is the standard type for "several things failed and here they all are"; its first argument is the iterable of errors and the second is the message. The empty-array case rejects rather than hanging, which is the specified behaviour and matches the intuition that "none of zero promises succeeded".',
  },

  {
    id: 'ch-async-map-limit',
    slug: 'bounded-concurrency',
    title: 'Bounded Concurrency',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['promises', 'async-await', 'performance'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Firing a thousand requests at once is a good way to be rate-limited. Write `mapLimit(items, limit, worker)` applying an async `worker(item, index)` to every item while keeping at most `limit` calls in flight at any moment. It fulfils with the results in **input order**. If any worker rejects, the returned promise rejects with that reason. Do not start a new worker after a rejection has occurred.',
    examples: [
      'await mapLimit(urls, 3, fetchOne);\n// at most 3 fetchOne calls running at a time,\n// results in the same order as urls',
    ],
    constraints: ['At most `limit` workers run concurrently.', 'Results are in input order.', 'A rejection stops new work from starting.'],
    starterCode: 'async function mapLimit(items, limit, worker) {\n  // Your code here\n}\n',
    tests: [
      { name: 'maps every item', body: 'expect(await mapLimit([1, 2, 3], 2, async (n) => n * 2)).toEqual([2, 4, 6]);' },
      { name: 'handles an empty input', body: 'expect(await mapLimit([], 3, async (n) => n)).toEqual([]);' },
      { name: 'passes the index', body: 'expect(await mapLimit(["a", "b"], 1, async (v, i) => v + i)).toEqual(["a0", "b1"]);' },
      { name: 'a limit of one runs everything in order', body: 'const order = []; await mapLimit([1, 2, 3], 1, async (n) => { order.push(n); }); expect(order).toEqual([1, 2, 3]);' },
      {
        name: 'never exceeds the limit',
        body:
          'let active = 0;\n' +
          'let peak = 0;\n' +
          'const worker = async () => {\n' +
          '  active += 1;\n' +
          '  peak = Math.max(peak, active);\n' +
          '  await new Promise((r) => setTimeout(r, 5));\n' +
          '  active -= 1;\n' +
          '};\n' +
          'await mapLimit(Array.from({ length: 10 }, (_, i) => i), 3, worker);\n' +
          'expect(peak).toBe(3);',
      },
      {
        name: 'actually reaches the limit rather than running one at a time',
        body:
          'let active = 0;\n' +
          'let peak = 0;\n' +
          'const worker = async () => {\n' +
          '  active += 1;\n' +
          '  peak = Math.max(peak, active);\n' +
          '  await new Promise((r) => setTimeout(r, 5));\n' +
          '  active -= 1;\n' +
          '};\n' +
          'await mapLimit(Array.from({ length: 6 }, (_, i) => i), 4, worker);\n' +
          'expect(peak).toBe(4);',
      },
      {
        name: 'results follow input order, not completion order',
        body:
          'const out = await mapLimit([30, 1, 15], 3, async (ms) => {\n' +
          '  await new Promise((r) => setTimeout(r, ms));\n' +
          '  return ms;\n' +
          '});\n' +
          'expect(out).toEqual([30, 1, 15]);',
      },
      { name: 'rejects when a worker rejects', body: 'let e = null; try { await mapLimit([1, 2], 2, async (n) => { if (n === 2) throw new Error("boom"); return n; }); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      {
        name: 'stops starting new work after a rejection',
        body:
          'let started = 0;\n' +
          'try {\n' +
          '  await mapLimit(Array.from({ length: 20 }, (_, i) => i), 2, async (n) => {\n' +
          '    started += 1;\n' +
          '    if (n === 0) throw new Error("boom");\n' +
          '    await new Promise((r) => setTimeout(r, 5));\n' +
          '  });\n' +
          '} catch { /* expected */ }\n' +
          'expect(started).toBeLessThan(20);',
      },
      { name: 'a limit larger than the input is fine', body: 'expect(await mapLimit([1, 2], 10, async (n) => n)).toEqual([1, 2]);' },
      { name: 'handles a longer list', body: 'const out = await mapLimit(Array.from({ length: 50 }, (_, i) => i), 5, async (n) => n * n); expect(out[49]).toBe(2401); expect(out.length).toBe(50);', hidden: true },
    ],
    hints: [
      'Start `limit` independent "runner" loops. Each one repeatedly takes the next unclaimed index and awaits the worker for it.',
      'A shared cursor variable is what hands out indices. Because JavaScript runs one task at a time, incrementing it is safe without any locking.',
      'Each runner writes its result to `results[index]`, so order is preserved without any sorting. Awaiting all the runners with `Promise.all` propagates the first rejection.',
    ],
    solution:
      'async function mapLimit(items, limit, worker) {\n' +
      '  const results = new Array(items.length);\n' +
      '  let cursor = 0;\n' +
      '  let failed = false;\n' +
      '\n' +
      '  async function runner() {\n' +
      '    while (!failed) {\n' +
      '      const index = cursor;\n' +
      '      if (index >= items.length) return;\n' +
      '      cursor += 1;\n' +
      '      try {\n' +
      '        results[index] = await worker(items[index], index);\n' +
      '      } catch (error) {\n' +
      '        failed = true;\n' +
      '        throw error;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  const runners = [];\n' +
      '  for (let i = 0; i < Math.min(limit, items.length); i += 1) runners.push(runner());\n' +
      '  await Promise.all(runners);\n' +
      '  return results;\n' +
      '}\n',
    solutionExplanation:
      'The pattern is a fixed pool of workers pulling from a shared queue, rather than a queue that pushes work out. Exactly `limit` runners are started, and each loops until the cursor is exhausted — so the number in flight is bounded by construction, with no need to count active tasks. Reading and incrementing `cursor` needs no synchronisation because JavaScript never interleaves two synchronous sections; the `await` is the only place another runner can take over, and by then the index is already claimed. Writing to `results[index]` keeps input order regardless of which runner finishes when. The `failed` flag is what stops new work after a rejection: `Promise.all` will reject as soon as the first runner throws, but without the flag the other runners would keep pulling items and doing work whose result nobody will ever read.',
  },

  {
    id: 'ch-async-retry',
    slug: 'retry-with-injected-backoff',
    title: 'Retry with Injected Backoff',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['async-await', 'errors', 'promises'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `retry(task, { attempts, wait, shouldRetry })` calling an async `task()` and retrying it when it rejects. `attempts` is the **total** number of tries, so `attempts: 3` means one initial call and up to two retries. `wait(attemptNumber)` is awaited between tries — taking it as a parameter keeps the backoff policy out of this function and makes the behaviour testable without real delays. `shouldRetry(error)` decides whether an error is worth retrying; when it returns false the error is thrown immediately. If every attempt fails, throw the last error.',
    examples: [
      'await retry(flakyTask, {\n  attempts: 3,\n  wait: (n) => delay(100 * 2 ** n),\n  shouldRetry: (e) => e.status >= 500,\n});',
    ],
    constraints: ['`attempts` counts the initial call.', '`wait` is awaited between attempts, never before the first or after the last.', 'A non-retryable error is thrown without further attempts.'],
    starterCode: 'async function retry(task, { attempts, wait, shouldRetry }) {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns the result when the first try succeeds', body: 'expect(await retry(async () => "ok", { attempts: 3, wait: async () => {}, shouldRetry: () => true })).toBe("ok");' },
      { name: 'does not retry a success', body: 'let calls = 0; await retry(async () => { calls += 1; return 1; }, { attempts: 3, wait: async () => {}, shouldRetry: () => true }); expect(calls).toBe(1);' },
      {
        name: 'retries until it succeeds',
        body:
          'let calls = 0;\n' +
          'const task = async () => { calls += 1; if (calls < 3) throw new Error("fail"); return "ok"; };\n' +
          'expect(await retry(task, { attempts: 5, wait: async () => {}, shouldRetry: () => true })).toBe("ok");\n' +
          'expect(calls).toBe(3);',
      },
      {
        name: 'attempts counts the initial call',
        body:
          'let calls = 0;\n' +
          'try { await retry(async () => { calls += 1; throw new Error("fail"); }, { attempts: 3, wait: async () => {}, shouldRetry: () => true }); } catch { /* expected */ }\n' +
          'expect(calls).toBe(3);',
      },
      {
        name: 'throws the last error when everything fails',
        body:
          'let n = 0;\n' +
          'let e = null;\n' +
          'try { await retry(async () => { n += 1; throw new Error("fail " + n); }, { attempts: 3, wait: async () => {}, shouldRetry: () => true }); } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("fail 3");',
      },
      {
        name: 'waits between attempts but not before the first',
        body:
          'const waits = [];\n' +
          'try { await retry(async () => { throw new Error("fail"); }, { attempts: 3, wait: async (n) => { waits.push(n); }, shouldRetry: () => true }); } catch { /* expected */ }\n' +
          'expect(waits.length).toBe(2);',
      },
      {
        name: 'stops immediately for a non-retryable error',
        body:
          'let calls = 0;\n' +
          'let e = null;\n' +
          'try { await retry(async () => { calls += 1; throw new Error("fatal"); }, { attempts: 5, wait: async () => {}, shouldRetry: () => false }); } catch (err) { e = err; }\n' +
          'expect(calls).toBe(1);\n' +
          'expect(e.message).toBe("fatal");',
      },
      {
        name: 'shouldRetry receives the error',
        body:
          'const seen = [];\n' +
          'try { await retry(async () => { throw new Error("x"); }, { attempts: 2, wait: async () => {}, shouldRetry: (e) => { seen.push(e.message); return true; } }); } catch { /* expected */ }\n' +
          'expect(seen).toEqual(["x", "x"]);',
      },
      { name: 'a single attempt never retries', body: 'let calls = 0; try { await retry(async () => { calls += 1; throw new Error("f"); }, { attempts: 1, wait: async () => {}, shouldRetry: () => true }); } catch { /* expected */ } expect(calls).toBe(1);' },
      {
        name: 'wait is not called after the final failure',
        body:
          'let waited = 0;\n' +
          'try { await retry(async () => { throw new Error("f"); }, { attempts: 1, wait: async () => { waited += 1; }, shouldRetry: () => true }); } catch { /* expected */ }\n' +
          'expect(waited).toBe(0);',
        hidden: true,
      },
      {
        name: 'passes the attempt number to wait',
        body:
          'const waits = [];\n' +
          'try { await retry(async () => { throw new Error("f"); }, { attempts: 4, wait: async (n) => { waits.push(n); }, shouldRetry: () => true }); } catch { /* expected */ }\n' +
          'expect(waits.length).toBe(3);\n' +
          'expect(new Set(waits).size).toBe(3);',
        hidden: true,
      },
    ],
    hints: [
      'A `for` loop over the attempt numbers, with a `try`/`catch` inside, expresses this directly — `return` on success, and let the loop continue on a retryable failure.',
      'The wait belongs at the end of the catch block, and only when another attempt is actually going to happen.',
      'Keep the most recent error in a variable so you can throw it after the loop ends.',
    ],
    solution:
      'async function retry(task, { attempts, wait, shouldRetry }) {\n' +
      '  let lastError;\n' +
      '  for (let attempt = 1; attempt <= attempts; attempt += 1) {\n' +
      '    try {\n' +
      '      return await task();\n' +
      '    } catch (error) {\n' +
      '      lastError = error;\n' +
      '      if (!shouldRetry(error)) throw error;\n' +
      '      if (attempt < attempts) await wait(attempt);\n' +
      '    }\n' +
      '  }\n' +
      '  throw lastError;\n' +
      '}\n',
    solutionExplanation:
      'The two conditions in the catch block are what the tests pin down separately. `shouldRetry` runs first, so a permanently fatal error — a 400, a validation failure — is not retried five times pointlessly. The `attempt < attempts` guard means no wait happens after the final failure, which matters when the backoff is seconds long and the caller is about to give up anyway. `return await task()` inside the `try` is deliberate: writing `return task()` would return the promise without awaiting it here, so a rejection would escape the `try` entirely and never be retried. Injecting `wait` rather than hard-coding a delay is what lets these tests run instantly and lets the caller choose exponential, jittered, or fixed backoff without this function knowing anything about it.',
  },

  {
    id: 'ch-async-timeout',
    slug: 'promise-with-a-timeout',
    title: 'Promise with a Timeout',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['promises', 'errors', 'async-foundations'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `withTimeout(promise, ms, schedule)` returning a promise that settles the same way as `promise` if it settles in time, and otherwise rejects with an `Error` whose message is `"timed out"`. `schedule(callback, ms)` starts the timer and returns a cancel function; the timer must be cancelled once the underlying promise settles, so a pending timer cannot keep a process alive. Note what this cannot do: the underlying operation is not cancelled, only ignored.',
    examples: [
      'await withTimeout(slowFetch(), 1000, schedule);\n// resolves with the fetch result, or rejects with Error("timed out")',
    ],
    constraints: ['A timeout rejects with an `Error` whose message is exactly `"timed out"`.', 'The timer is cancelled when the promise settles first.', 'A rejection from the underlying promise passes through unchanged.'],
    starterCode: 'function withTimeout(promise, ms, schedule) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'resolves when the promise wins',
        body:
          'const schedule = () => () => {};\n' +
          'expect(await withTimeout(Promise.resolve("ok"), 100, schedule)).toBe("ok");',
      },
      {
        name: 'rejects with the timeout error when the timer fires',
        body:
          'let fire = null;\n' +
          'const schedule = (cb) => { fire = cb; return () => {}; };\n' +
          'const p = withTimeout(new Promise(() => {}), 100, schedule);\n' +
          'fire();\n' +
          'let e = null;\n' +
          'try { await p; } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("timed out");',
      },
      {
        name: 'the timeout error is an Error',
        body:
          'let fire = null;\n' +
          'const schedule = (cb) => { fire = cb; return () => {}; };\n' +
          'const p = withTimeout(new Promise(() => {}), 100, schedule);\n' +
          'fire();\n' +
          'let e = null;\n' +
          'try { await p; } catch (err) { e = err; }\n' +
          'expect(e instanceof Error).toBe(true);',
      },
      {
        name: 'passes an underlying rejection through',
        body:
          'const schedule = () => () => {};\n' +
          'let e = null;\n' +
          'try { await withTimeout(Promise.reject(new Error("inner")), 100, schedule); } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("inner");',
      },
      {
        name: 'cancels the timer once the promise resolves',
        body:
          'let cancelled = 0;\n' +
          'const schedule = () => () => { cancelled += 1; };\n' +
          'await withTimeout(Promise.resolve(1), 100, schedule);\n' +
          'expect(cancelled).toBe(1);',
      },
      {
        name: 'cancels the timer once the promise rejects',
        body:
          'let cancelled = 0;\n' +
          'const schedule = () => () => { cancelled += 1; };\n' +
          'try { await withTimeout(Promise.reject(new Error("x")), 100, schedule); } catch { /* expected */ }\n' +
          'expect(cancelled).toBe(1);',
      },
      {
        name: 'passes the delay to the scheduler',
        body:
          'let seen = null;\n' +
          'const schedule = (cb, delay) => { seen = delay; return () => {}; };\n' +
          'await withTimeout(Promise.resolve(1), 250, schedule);\n' +
          'expect(seen).toBe(250);',
      },
      {
        name: 'a late settlement after a timeout changes nothing',
        body:
          'let fire = null;\n' +
          'let settle = null;\n' +
          'const schedule = (cb) => { fire = cb; return () => {}; };\n' +
          'const inner = new Promise((r) => { settle = r; });\n' +
          'const p = withTimeout(inner, 100, schedule);\n' +
          'fire();\n' +
          'settle("too late");\n' +
          'let e = null;\n' +
          'try { await p; } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("timed out");',
      },
      {
        name: 'preserves a falsy resolution value',
        body:
          'const schedule = () => () => {};\n' +
          'expect(await withTimeout(Promise.resolve(0), 100, schedule)).toBe(0);',
      },
      {
        name: 'returns a promise',
        body:
          'const schedule = () => () => {};\n' +
          'const p = withTimeout(Promise.resolve(1), 10, schedule);\n' +
          'expect(p instanceof Promise).toBe(true);\n' +
          'await p;',
        hidden: true,
      },
    ],
    hints: [
      'Build a second promise that rejects when the timer fires, then race the two.',
      'You can write the race by hand with `new Promise` and two `.then` handlers — a promise ignores every settlement after the first, which is what makes the race work.',
      'Cancel the timer in a handler attached to the underlying promise, so it runs whichever way that promise settles.',
    ],
    solution:
      'function withTimeout(promise, ms, schedule) {\n' +
      '  return new Promise((resolve, reject) => {\n' +
      '    const cancel = schedule(() => reject(new Error("timed out")), ms);\n' +
      '    promise.then(\n' +
      '      (value) => {\n' +
      '        cancel();\n' +
      '        resolve(value);\n' +
      '      },\n' +
      '      (error) => {\n' +
      '        cancel();\n' +
      '        reject(error);\n' +
      '      },\n' +
      '    );\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'The race relies on a promise settling exactly once: whichever of the timer and the underlying promise gets there first wins, and the other call is silently ignored — which is why a late resolution after the timeout changes nothing. Cancelling in *both* handlers is what stops a pending timer outliving the work; forgetting it in the rejection path is the common version of the bug, and leaves a timer alive after a fast failure. The important limitation is in the prompt: this ignores a slow operation, it does not stop one. The underlying request is still in flight and still consuming a connection, which is why real cancellation needs `AbortController` plumbed through to whatever started the work.',
  },

  {
    id: 'ch-async-sequential',
    slug: 'run-tasks-in-order',
    title: 'Run Tasks in Order',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['async-await', 'promises', 'arrays'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `runSeries(tasks)` taking an array of zero-argument functions that return promises, running them strictly one after another, and fulfilling with an array of their results. Each task must not start until the previous one has finished — this is the opposite of `Promise.all`, and it is what you want when the tasks share a resource or must not overwhelm a server. If any task rejects, stop and reject with that reason.',
    examples: [
      'await runSeries([\n  () => step1(),\n  () => step2(),\n]);\n// step2 does not begin until step1 has settled',
    ],
    constraints: ['Tasks are thunks — functions that start the work when called.', 'A task is not invoked until the previous one has fulfilled.', 'A rejection stops the remaining tasks from running.'],
    starterCode: 'async function runSeries(tasks) {\n  // Your code here\n}\n',
    tests: [
      { name: 'collects the results', body: 'expect(await runSeries([async () => 1, async () => 2])).toEqual([1, 2]);' },
      { name: 'handles an empty list', body: 'expect(await runSeries([])).toEqual([]);' },
      { name: 'runs in order', body: 'const order = []; await runSeries([async () => { order.push(1); }, async () => { order.push(2); }]); expect(order).toEqual([1, 2]);' },
      {
        name: 'does not start a task before the previous finishes',
        body:
          'const events = [];\n' +
          'const task = (id) => async () => {\n' +
          '  events.push("start " + id);\n' +
          '  await new Promise((r) => setTimeout(r, 5));\n' +
          '  events.push("end " + id);\n' +
          '};\n' +
          'await runSeries([task(1), task(2)]);\n' +
          'expect(events).toEqual(["start 1", "end 1", "start 2", "end 2"]);',
      },
      {
        name: 'does not invoke the thunks up front',
        body:
          'let invoked = 0;\n' +
          'const make = () => async () => { invoked += 1; await new Promise((r) => setTimeout(r, 5)); };\n' +
          'const p = runSeries([make(), make(), make()]);\n' +
          'expect(invoked).toBe(1);\n' +
          'await p;\n' +
          'expect(invoked).toBe(3);',
      },
      { name: 'rejects when a task rejects', body: 'let e = null; try { await runSeries([async () => 1, async () => { throw new Error("boom"); }]); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      {
        name: 'stops after a rejection',
        body:
          'let ran = 0;\n' +
          'try { await runSeries([async () => { throw new Error("boom"); }, async () => { ran += 1; }]); } catch { /* expected */ }\n' +
          'expect(ran).toBe(0);',
      },
      { name: 'handles a single task', body: 'expect(await runSeries([async () => "only"])).toEqual(["only"]);' },
      { name: 'preserves falsy results', body: 'expect(await runSeries([async () => 0, async () => false])).toEqual([0, false]);' },
      { name: 'accepts tasks returning plain values', body: 'expect(await runSeries([() => 1, () => 2])).toEqual([1, 2]);', hidden: true },
      { name: 'handles a longer series', body: 'const tasks = Array.from({ length: 25 }, (_, i) => async () => i); expect(await runSeries(tasks)).toEqual(Array.from({ length: 25 }, (_, i) => i));', hidden: true },
    ],
    hints: [
      'A `for...of` loop with an `await` inside is all it takes — the loop naturally pauses at each iteration.',
      'This is one of the few places where awaiting inside a loop is correct rather than a mistake. The point *is* to serialise.',
      'Tasks must be thunks rather than promises: a promise passed in has already started, so nothing could keep it waiting.',
    ],
    solution:
      'async function runSeries(tasks) {\n' +
      '  const results = [];\n' +
      '  for (const task of tasks) {\n' +
      '    results.push(await task());\n' +
      '  }\n' +
      '  return results;\n' +
      '}\n',
    solutionExplanation:
      'Awaiting inside a loop is usually a performance mistake — it serialises work that could overlap — but here it is the entire specification, and the events test proves it: task 2 does not log its start until task 1 has logged its end. The thunk requirement is the conceptual point worth holding onto. A promise represents work that has *already begun*, so an array of promises cannot be run in series no matter what you do with it; only an array of functions leaves the starting decision in your hands. That is also why the "does not invoke the thunks up front" test can observe exactly one invocation before the first await resolves. A rejection propagates out of the `await` and abandons the loop, so nothing after it runs.',
  },

  {
    id: 'ch-async-promisify',
    slug: 'promisify-a-callback-api',
    title: 'Promisify a Callback API',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['promises', 'functions', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Older APIs take an error-first callback as their last argument: `fn(...args, (error, value) => {})`, where `error` is `null` on success. Write `promisify(fn)` returning a function that takes the same arguments minus the callback and returns a promise. A non-null error rejects; otherwise the value fulfils. Forward `this`, so a promisified method still works when called on its object.',
    examples: [
      'const readFile = promisify(fs.readFile);\nconst text = await readFile("notes.txt", "utf8");',
    ],
    constraints: ['The callback is always the last argument.', 'A non-null, non-undefined first callback argument is an error.', '`this` is forwarded to the original function.'],
    starterCode: 'function promisify(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'fulfils with the callback value', body: 'const fn = (a, cb) => cb(null, a * 2); expect(await promisify(fn)(5)).toBe(10);' },
      { name: 'returns a promise', body: 'const fn = (cb) => cb(null, 1); const p = promisify(fn)(); expect(p instanceof Promise).toBe(true); await p;' },
      { name: 'rejects on an error', body: 'const fn = (cb) => cb(new Error("boom")); let e = null; try { await promisify(fn)(); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      { name: 'forwards several arguments', body: 'const fn = (a, b, cb) => cb(null, a + b); expect(await promisify(fn)(1, 2)).toBe(3);' },
      { name: 'forwards no arguments', body: 'const fn = (cb) => cb(null, "none"); expect(await promisify(fn)()).toBe("none");' },
      { name: 'treats undefined as no error', body: 'const fn = (cb) => cb(undefined, "ok"); expect(await promisify(fn)()).toBe("ok");' },
      { name: 'fulfils with a falsy value', body: 'const fn = (cb) => cb(null, 0); expect(await promisify(fn)()).toBe(0);' },
      { name: 'fulfils with undefined when no value is given', body: 'const fn = (cb) => cb(null); expect(await promisify(fn)()).toBe(undefined);' },
      { name: 'rejects with a non-Error reason', body: 'const fn = (cb) => cb("string error"); let e = null; try { await promisify(fn)(); } catch (err) { e = err; } expect(e).toBe("string error");' },
      {
        name: 'forwards this',
        body:
          'const obj = { n: 7, read(cb) { cb(null, this.n); } };\n' +
          'obj.readAsync = promisify(obj.read);\n' +
          'expect(await obj.readAsync()).toBe(7);',
      },
      {
        name: 'handles an asynchronous callback',
        body:
          'const fn = (cb) => setTimeout(() => cb(null, "later"), 5);\n' +
          'expect(await promisify(fn)()).toBe("later");',
        hidden: true,
      },
      {
        name: 'ignores callback arguments beyond the value',
        body:
          'const fn = (cb) => cb(null, "value", "extra", "more");\n' +
          'expect(await promisify(fn)()).toBe("value");',
        hidden: true,
      },
    ],
    hints: [
      'Return a function that gathers its arguments, then calls `fn` with those arguments plus a callback you supply.',
      'That callback is where `resolve` and `reject` are wired up — it is created inside the `new Promise` executor.',
      'Compare the error against `null` and `undefined` explicitly rather than testing truthiness — the specified contract is about those two values, and a callback may legitimately pass `undefined` for "no error".',
    ],
    solution:
      'function promisify(fn) {\n' +
      '  return function (...args) {\n' +
      '    return new Promise((resolve, reject) => {\n' +
      '      fn.call(this, ...args, (error, value) => {\n' +
      '        if (error === null || error === undefined) resolve(value);\n' +
      '        else reject(error);\n' +
      '      });\n' +
      '    });\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The callback is constructed inside the executor so it closes over `resolve` and `reject`, which is what bridges the two styles: the old API calls back, and that call settles the promise. Comparing against `null` and `undefined` explicitly rather than testing truthiness states the contract precisely, and it is worth knowing that implementations disagree here: Node\'s own `util.promisify` uses a plain `if (err)`, so it would treat a `0` in the error slot as success where this one treats it as a failure. Neither is wrong — the lesson is that "error-first" is a convention with soft edges, so the check deserves to be a deliberate choice rather than a reflex. `fn.call(this, ...)` is what keeps a promisified method working: without it, `this` inside the original function would be undefined and `this.n` would throw.',
  },

  {
    id: 'ch-async-serial-queue',
    slug: 'a-serial-task-queue',
    title: 'A Serial Task Queue',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['promises', 'async-await', 'data-structures'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `createQueue()` returning an object with `add(task)` and `size`. `add` takes an async thunk and returns a promise for its result, but guarantees that queued tasks run **one at a time, in the order they were added**, even when `add` is called while earlier tasks are still running. A failing task must reject only its own promise — the queue keeps going. `size` reports how many tasks are waiting or running.',
    examples: [
      'const q = createQueue();\nconst a = q.add(() => save("a"));\nconst b = q.add(() => save("b"));\n// save("b") does not start until save("a") has settled\nawait Promise.all([a, b]);',
    ],
    constraints: ['Tasks run strictly in submission order, one at a time.', 'A rejecting task does not stop the queue.', '`size` counts pending and running tasks.'],
    starterCode: 'function createQueue() {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns the task result', body: 'const q = createQueue(); expect(await q.add(async () => 42)).toBe(42);' },
      {
        name: 'runs tasks one at a time in order',
        body:
          'const q = createQueue();\n' +
          'const events = [];\n' +
          'const task = (id) => async () => {\n' +
          '  events.push("start " + id);\n' +
          '  await new Promise((r) => setTimeout(r, 5));\n' +
          '  events.push("end " + id);\n' +
          '};\n' +
          'await Promise.all([q.add(task(1)), q.add(task(2)), q.add(task(3))]);\n' +
          'expect(events).toEqual(["start 1", "end 1", "start 2", "end 2", "start 3", "end 3"]);',
      },
      {
        name: 'each add resolves with its own result',
        body:
          'const q = createQueue();\n' +
          'const results = await Promise.all([q.add(async () => "a"), q.add(async () => "b")]);\n' +
          'expect(results).toEqual(["a", "b"]);',
      },
      {
        name: 'a failing task rejects only its own promise',
        body:
          'const q = createQueue();\n' +
          'const bad = q.add(async () => { throw new Error("boom"); });\n' +
          'const good = q.add(async () => "fine");\n' +
          'let e = null;\n' +
          'try { await bad; } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("boom");\n' +
          'expect(await good).toBe("fine");',
      },
      {
        name: 'the queue keeps running after a failure',
        body:
          'const q = createQueue();\n' +
          'const order = [];\n' +
          'const a = q.add(async () => { order.push(1); throw new Error("x"); });\n' +
          'const b = q.add(async () => { order.push(2); });\n' +
          'await a.catch(() => {});\n' +
          'await b;\n' +
          'expect(order).toEqual([1, 2]);',
      },
      {
        name: 'size counts queued work',
        body:
          'const q = createQueue();\n' +
          'const p = Promise.all([\n' +
          '  q.add(async () => { await new Promise((r) => setTimeout(r, 5)); }),\n' +
          '  q.add(async () => { await new Promise((r) => setTimeout(r, 5)); }),\n' +
          ']);\n' +
          'expect(q.size).toBe(2);\n' +
          'await p;',
      },
      {
        name: 'size returns to zero when the queue drains',
        body:
          'const q = createQueue();\n' +
          'await q.add(async () => 1);\n' +
          'expect(q.size).toBe(0);',
      },
      {
        name: 'adding while running still serialises',
        body:
          'const q = createQueue();\n' +
          'const events = [];\n' +
          'const first = q.add(async () => {\n' +
          '  events.push("start 1");\n' +
          '  await new Promise((r) => setTimeout(r, 10));\n' +
          '  events.push("end 1");\n' +
          '});\n' +
          'await new Promise((r) => setTimeout(r, 2));\n' +
          'const second = q.add(async () => { events.push("start 2"); });\n' +
          'await Promise.all([first, second]);\n' +
          'expect(events).toEqual(["start 1", "end 1", "start 2"]);',
      },
      { name: 'starts empty', body: 'expect(createQueue().size).toBe(0);' },
      { name: 'handles a task returning a plain value', body: 'const q = createQueue(); expect(await q.add(() => "plain")).toBe("plain");', hidden: true },
      {
        name: 'handles many tasks in order',
        body:
          'const q = createQueue();\n' +
          'const order = [];\n' +
          'const ps = Array.from({ length: 20 }, (_, i) => q.add(async () => { order.push(i); }));\n' +
          'await Promise.all(ps);\n' +
          'expect(order).toEqual(Array.from({ length: 20 }, (_, i) => i));',
        hidden: true,
      },
    ],
    hints: [
      'Keep a list of waiting entries, each holding the task plus the `resolve` and `reject` for the promise `add` handed back.',
      'A single "am I currently draining?" flag stops a second drain loop from starting and running tasks concurrently.',
      'Wrap each task in `try`/`catch` inside the drain loop, so a failure settles that one entry\'s promise and the loop moves on.',
    ],
    solution:
      'function createQueue() {\n' +
      '  const pending = [];\n' +
      '  let draining = false;\n' +
      '\n' +
      '  async function drain() {\n' +
      '    if (draining) return;\n' +
      '    draining = true;\n' +
      '    while (pending.length > 0) {\n' +
      '      const entry = pending[0];\n' +
      '      try {\n' +
      '        entry.resolve(await entry.task());\n' +
      '      } catch (error) {\n' +
      '        entry.reject(error);\n' +
      '      }\n' +
      '      pending.shift();\n' +
      '    }\n' +
      '    draining = false;\n' +
      '  }\n' +
      '\n' +
      '  return {\n' +
      '    add(task) {\n' +
      '      return new Promise((resolve, reject) => {\n' +
      '        pending.push({ task, resolve, reject });\n' +
      '        drain();\n' +
      '      });\n' +
      '    },\n' +
      '    get size() {\n' +
      '      return pending.length;\n' +
      '    },\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The `draining` flag is the whole concurrency control: `add` always calls `drain`, but a second call while one is already running returns immediately, so exactly one loop is ever pulling from the queue. That is what keeps tasks serialised even when `add` is called mid-flight. Capturing `resolve` and `reject` in the queued entry is what lets `add` hand back a promise *now* for work that will not start until later — a common and reusable technique. The `try`/`catch` around each task is what isolates failures: the entry\'s own promise rejects, and the loop continues to the next entry rather than unwinding. Note that `pending.shift()` happens after the task settles, which is what keeps `size` counting the running task as well as the waiting ones.',
  },

  {
    id: 'ch-async-dedupe',
    slug: 'deduplicate-in-flight-calls',
    title: 'Deduplicate In-Flight Calls',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['promises', 'closures', 'performance'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Ten components mounting at once should not trigger ten identical requests. Write `dedupe(fn, keyFn)` so that while a call for a given key is still in flight, every further call with that key receives the **same** promise instead of starting new work. Once the call settles the entry is cleared, so a later call starts fresh — this is request coalescing, not caching. `keyFn` receives the argument array and defaults to the first argument. Rejections are shared too, and must also clear the entry.',
    examples: [
      'const load = dedupe(fetchUser);\nconst a = load(7);\nconst b = load(7);\na === b;        // true — one request\nawait a;\nload(7) === a;  // false — the flight is over',
    ],
    constraints: ['Concurrent calls with the same key share one promise object.', 'The entry is cleared once the promise settles, whether it fulfils or rejects.', 'Different keys never share.'],
    starterCode: 'function dedupe(fn, keyFn) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'calls the underlying function once for concurrent calls',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (n) => { calls += 1; await new Promise((r) => setTimeout(r, 5)); return n; });\n' +
          'await Promise.all([load(1), load(1), load(1)]);\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'returns the same promise object',
        body:
          'const load = dedupe(async () => { await new Promise((r) => setTimeout(r, 5)); });\n' +
          'const a = load(1);\n' +
          'const b = load(1);\n' +
          'expect(a).toBe(b);\n' +
          'await a;',
      },
      {
        name: 'every caller gets the result',
        body:
          'const load = dedupe(async (n) => { await new Promise((r) => setTimeout(r, 5)); return n * 2; });\n' +
          'expect(await Promise.all([load(3), load(3)])).toEqual([6, 6]);',
      },
      {
        name: 'different keys do not share',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (n) => { calls += 1; await new Promise((r) => setTimeout(r, 5)); return n; });\n' +
          'await Promise.all([load(1), load(2)]);\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'a later call starts fresh work',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (n) => { calls += 1; return n; });\n' +
          'await load(1);\n' +
          'await load(1);\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'shares a rejection',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async () => { calls += 1; await new Promise((r) => setTimeout(r, 5)); throw new Error("boom"); });\n' +
          'const a = load(1);\n' +
          'const b = load(1);\n' +
          'const results = await Promise.allSettled([a, b]);\n' +
          'expect(calls).toBe(1);\n' +
          'expect(results.every((r) => r.status === "rejected")).toBe(true);',
      },
      {
        name: 'clears the entry after a rejection',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async () => { calls += 1; throw new Error("boom"); });\n' +
          'await load(1).catch(() => {});\n' +
          'await load(1).catch(() => {});\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'uses a custom key function',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (a, b) => { calls += 1; await new Promise((r) => setTimeout(r, 5)); return a + b; }, (args) => args.join(","));\n' +
          'await Promise.all([load(1, 2), load(1, 2)]);\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'a custom key distinguishes different arguments',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (a, b) => { calls += 1; await new Promise((r) => setTimeout(r, 5)); return a + b; }, (args) => args.join(","));\n' +
          'await Promise.all([load(1, 2), load(2, 1)]);\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'does not confuse a number key with its string',
        body:
          'let calls = 0;\n' +
          'const load = dedupe(async (x) => { calls += 1; await new Promise((r) => setTimeout(r, 5)); return x; });\n' +
          'await Promise.all([load(1), load("1")]);\n' +
          'expect(calls).toBe(2);',
        hidden: true,
      },
      {
        name: 'two deduped functions are independent',
        body:
          'let calls = 0;\n' +
          'const make = () => dedupe(async () => { calls += 1; await new Promise((r) => setTimeout(r, 5)); });\n' +
          'await Promise.all([make()(1), make()(1)]);\n' +
          'expect(calls).toBe(2);',
        hidden: true,
      },
    ],
    hints: [
      'Keep a `Map` from key to the in-flight promise. On a call, return the existing entry if there is one.',
      'Attach the cleanup with `.finally(...)` *before* storing the promise, so it runs whichever way the call settles.',
      'Be careful what you store: the promise you store must be the one you return, or callers will not share the same object.',
    ],
    solution:
      'function dedupe(fn, keyFn = (args) => args[0]) {\n' +
      '  const inFlight = new Map();\n' +
      '  return function (...args) {\n' +
      '    const key = keyFn(args);\n' +
      '    const existing = inFlight.get(key);\n' +
      '    if (existing) return existing;\n' +
      '\n' +
      '    const promise = Promise.resolve()\n' +
      '      .then(() => fn.apply(this, args))\n' +
      '      .finally(() => {\n' +
      '        inFlight.delete(key);\n' +
      '      });\n' +
      '\n' +
      '    inFlight.set(key, promise);\n' +
      '    return promise;\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The distinction from memoisation is the `finally`: the entry lives only as long as the request is in flight, so this coalesces concurrent duplicates without ever serving stale data. `finally` rather than `then` is what makes a rejection clear the entry too — otherwise one failed request would poison that key permanently, and every later caller would receive the same old rejection. Storing exactly the promise that is returned is what lets the identity test pass, and it means all the callers share one settlement rather than each getting a separate wrapper. A `Map` keeps `1` and `"1"` apart. Note the deliberate omission: no result is retained after settlement, which is what makes this safe to use on data that changes.',
  },

  {
    id: 'ch-async-fetch-json',
    slug: 'a-json-client-with-injected-fetch',
    title: 'A JSON Client with Injected fetch',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['http', 'promises', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `getJson(url, { fetch })` performing a request and returning parsed JSON. Taking `fetch` as a parameter is what makes this testable without a network. Three failure modes must be distinguished, each rejecting with an `Error` carrying a `kind` property: a non-`ok` response gives `kind: "http"` with a `status` property; a body that is not valid JSON gives `kind: "parse"`; and a `fetch` that rejects outright gives `kind: "network"`. Every error should also keep the original as its `cause`.',
    examples: [
      'const data = await getJson("/api/users", { fetch });\n\ntry { await getJson("/missing", { fetch }); }\ncatch (e) { e.kind; }  // "http", with e.status === 404',
    ],
    constraints: ['A response is successful when `response.ok` is true.', 'Errors carry `kind`, and HTTP errors also carry `status`.', 'The original failure is preserved as `cause`.'],
    starterCode: 'async function getJson(url, { fetch }) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'returns the parsed body',
        body:
          'const fetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 1 }) });\n' +
          'expect(await getJson("/x", { fetch })).toEqual({ id: 1 });',
      },
      {
        name: 'passes the url to fetch',
        body:
          'let seen = null;\n' +
          'const fetch = async (u) => { seen = u; return { ok: true, status: 200, json: async () => ({}) }; };\n' +
          'await getJson("/api/thing", { fetch });\n' +
          'expect(seen).toBe("/api/thing");',
      },
      {
        name: 'rejects on a non-ok response',
        body:
          'const fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e.kind).toBe("http");',
      },
      {
        name: 'an http error carries the status',
        body:
          'const fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e.status).toBe(503);',
      },
      {
        name: 'does not parse the body of a failed response',
        body:
          'let parsed = 0;\n' +
          'const fetch = async () => ({ ok: false, status: 500, json: async () => { parsed += 1; return {}; } });\n' +
          'try { await getJson("/x", { fetch }); } catch { /* expected */ }\n' +
          'expect(parsed).toBe(0);',
      },
      {
        name: 'rejects with a parse kind on invalid JSON',
        body:
          'const fetch = async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("bad json"); } });\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e.kind).toBe("parse");',
      },
      {
        name: 'rejects with a network kind when fetch rejects',
        body:
          'const fetch = async () => { throw new TypeError("offline"); };\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e.kind).toBe("network");',
      },
      {
        name: 'preserves the original error as cause',
        body:
          'const original = new TypeError("offline");\n' +
          'const fetch = async () => { throw original; };\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e.cause).toBe(original);',
      },
      {
        name: 'every rejection is an Error',
        body:
          'const fetch = async () => ({ ok: false, status: 400, json: async () => ({}) });\n' +
          'let e = null;\n' +
          'try { await getJson("/x", { fetch }); } catch (err) { e = err; }\n' +
          'expect(e instanceof Error).toBe(true);',
      },
      {
        name: 'handles an array body',
        body:
          'const fetch = async () => ({ ok: true, status: 200, json: async () => [1, 2, 3] });\n' +
          'expect(await getJson("/x", { fetch })).toEqual([1, 2, 3]);',
        hidden: true,
      },
      {
        name: 'a 201 is still a success',
        body:
          'const fetch = async () => ({ ok: true, status: 201, json: async () => ({ created: true }) });\n' +
          'expect(await getJson("/x", { fetch })).toEqual({ created: true });',
        hidden: true,
      },
    ],
    hints: [
      'The three failures happen at different moments, so wrap them in separate `try` blocks rather than one big one — otherwise you cannot tell a network failure from a parse failure.',
      '`fetch` only rejects when the request could not be made at all. A 404 or a 500 is a perfectly successful request that returned a failure response, which is why `response.ok` has to be checked explicitly.',
      '`new Error("message", { cause })` attaches the original, and extra fields like `kind` and `status` can be assigned to the error object afterwards.',
    ],
    solution:
      'async function getJson(url, { fetch }) {\n' +
      '  let response;\n' +
      '  try {\n' +
      '    response = await fetch(url);\n' +
      '  } catch (cause) {\n' +
      '    const error = new Error("network request failed", { cause });\n' +
      '    error.kind = "network";\n' +
      '    throw error;\n' +
      '  }\n' +
      '\n' +
      '  if (!response.ok) {\n' +
      '    const error = new Error("request failed with status " + response.status);\n' +
      '    error.kind = "http";\n' +
      '    error.status = response.status;\n' +
      '    throw error;\n' +
      '  }\n' +
      '\n' +
      '  try {\n' +
      '    return await response.json();\n' +
      '  } catch (cause) {\n' +
      '    const error = new Error("response was not valid JSON", { cause });\n' +
      '    error.kind = "parse";\n' +
      '    throw error;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The most important line is the one people forget: `if (!response.ok)`. `fetch` rejects only when the request could not be made — DNS failure, connection refused, CORS block — so a 404 or a 500 arrives as a perfectly resolved promise, and code without this check happily parses an error page as if it were data. Separating the three `try` regions is what makes `kind` meaningful; a single wrapping `try` could not tell a parse failure from a network failure. Not parsing the body of a failed response is a small but real decision: an error page is often HTML, and parsing it would replace an informative HTTP error with a confusing syntax error. `cause` preserves the original for logging without losing the classification the caller needs.',
  },

  {
    id: 'ch-async-poll',
    slug: 'poll-until-ready',
    title: 'Poll Until Ready',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['async-await', 'promises', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Some operations report completion only if you keep asking. Write `pollUntil(check, { maxAttempts, wait })` that calls the async `check()` repeatedly until it returns a value that is not `null` or `undefined`, then fulfils with that value. Wait between attempts by awaiting `wait(attemptNumber)`. After `maxAttempts` unsuccessful checks, reject with an `Error` whose message is `"gave up after N attempts"`. A `check` that throws should abort immediately — a broken endpoint is not something more polling will fix.',
    examples: [
      'const job = await pollUntil(\n  () => getJobIfFinished(id),\n  { maxAttempts: 10, wait: (n) => delay(500) },\n);',
    ],
    constraints: ['`null` and `undefined` mean "not ready"; every other value, including `false` and `0`, is a result.', 'No wait happens after the final attempt.', 'An error from `check` propagates immediately.'],
    starterCode: 'async function pollUntil(check, { maxAttempts, wait }) {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns a result available on the first check', body: 'expect(await pollUntil(async () => "ready", { maxAttempts: 3, wait: async () => {} })).toBe("ready");' },
      { name: 'checks once when it succeeds immediately', body: 'let n = 0; await pollUntil(async () => { n += 1; return 1; }, { maxAttempts: 5, wait: async () => {} }); expect(n).toBe(1);' },
      {
        name: 'polls until ready',
        body:
          'let n = 0;\n' +
          'const result = await pollUntil(async () => { n += 1; return n < 3 ? null : "ready"; }, { maxAttempts: 5, wait: async () => {} });\n' +
          'expect(result).toBe("ready");\n' +
          'expect(n).toBe(3);',
      },
      { name: 'treats undefined as not ready', body: 'let n = 0; const r = await pollUntil(async () => { n += 1; return n < 2 ? undefined : "ok"; }, { maxAttempts: 5, wait: async () => {} }); expect(r).toBe("ok");' },
      { name: 'treats false as a result', body: 'expect(await pollUntil(async () => false, { maxAttempts: 3, wait: async () => {} })).toBe(false);' },
      { name: 'treats zero as a result', body: 'expect(await pollUntil(async () => 0, { maxAttempts: 3, wait: async () => {} })).toBe(0);' },
      {
        name: 'gives up after maxAttempts',
        body:
          'let n = 0;\n' +
          'let e = null;\n' +
          'try { await pollUntil(async () => { n += 1; return null; }, { maxAttempts: 4, wait: async () => {} }); } catch (err) { e = err; }\n' +
          'expect(n).toBe(4);\n' +
          'expect(e.message).toBe("gave up after 4 attempts");',
      },
      {
        name: 'does not wait after the final attempt',
        body:
          'const waits = [];\n' +
          'try { await pollUntil(async () => null, { maxAttempts: 3, wait: async (n) => { waits.push(n); } }); } catch { /* expected */ }\n' +
          'expect(waits.length).toBe(2);',
      },
      {
        name: 'aborts immediately when check throws',
        body:
          'let n = 0;\n' +
          'let e = null;\n' +
          'try { await pollUntil(async () => { n += 1; throw new Error("broken"); }, { maxAttempts: 5, wait: async () => {} }); } catch (err) { e = err; }\n' +
          'expect(n).toBe(1);\n' +
          'expect(e.message).toBe("broken");',
      },
      { name: 'a single attempt is allowed', body: 'let e = null; try { await pollUntil(async () => null, { maxAttempts: 1, wait: async () => {} }); } catch (err) { e = err; } expect(e.message).toBe("gave up after 1 attempts");' },
      {
        name: 'passes the attempt number to wait',
        body:
          'const waits = [];\n' +
          'try { await pollUntil(async () => null, { maxAttempts: 3, wait: async (n) => { waits.push(n); } }); } catch { /* expected */ }\n' +
          'expect(new Set(waits).size).toBe(2);',
        hidden: true,
      },
    ],
    hints: [
      'A counted loop with an `await check()` inside is the shape. Return as soon as the result is neither `null` nor `undefined`.',
      'Use `result != null` — the loose inequality against `null` is the one idiomatic use of `!=`, and it matches `null` and `undefined` while letting `0` and `false` through.',
      'Do not catch the error from `check`; letting it propagate is exactly the "abort immediately" behaviour.',
    ],
    solution:
      'async function pollUntil(check, { maxAttempts, wait }) {\n' +
      '  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {\n' +
      '    const result = await check();\n' +
      '    if (result !== null && result !== undefined) return result;\n' +
      '    if (attempt < maxAttempts) await wait(attempt);\n' +
      '  }\n' +
      '  throw new Error("gave up after " + maxAttempts + " attempts");\n' +
      '}\n',
    solutionExplanation:
      'The readiness test compares against `null` and `undefined` specifically rather than using truthiness, which is what lets `false` and `0` be legitimate results — a poll for "is the queue empty" would otherwise never terminate. The `attempt < maxAttempts` guard keeps the function from sleeping once before an inevitable failure, which matters when the interval is measured in seconds. There is deliberately no `try`/`catch` around `check`: an exception means the operation itself is broken, and retrying a broken endpoint just delays the report. Injecting `wait` keeps the backoff policy — fixed, exponential, jittered — out of this function entirely, and is what lets the tests run instantly.',
  },

  {
    id: 'ch-async-all-props',
    slug: 'awaiting-an-object-of-promises',
    title: 'Awaiting an Object of Promises',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['promises', 'objects', 'async-await'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `allProps(source)` taking an object whose values may be promises and fulfilling with an object of the same keys holding the resolved values. It is the object-shaped counterpart of `Promise.all`, and it reads far better at the call site than destructuring a positional array. Non-promise values pass through. It rejects if any value rejects, and all the operations run concurrently — not one key at a time.',
    examples: [
      'const { user, posts } = await allProps({\n  user: fetchUser(id),\n  posts: fetchPosts(id),\n});',
    ],
    constraints: ['Only own enumerable properties are included.', 'Every promise starts before any is awaited.', 'An empty object fulfils with an empty object.'],
    starterCode: 'async function allProps(source) {\n  // Your code here\n}\n',
    tests: [
      { name: 'resolves every value', body: 'expect(await allProps({ a: Promise.resolve(1), b: Promise.resolve(2) })).toEqual({ a: 1, b: 2 });' },
      { name: 'passes plain values through', body: 'expect(await allProps({ a: 1, b: Promise.resolve(2) })).toEqual({ a: 1, b: 2 });' },
      { name: 'an empty object gives an empty object', body: 'expect(await allProps({})).toEqual({});' },
      { name: 'keeps the keys', body: 'expect(Object.keys(await allProps({ x: 1, y: 2 })).sort()).toEqual(["x", "y"]);' },
      { name: 'rejects when a value rejects', body: 'let e = null; try { await allProps({ a: Promise.resolve(1), b: Promise.reject(new Error("boom")) }); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      {
        name: 'runs concurrently rather than one at a time',
        body:
          'let started = 0;\n' +
          'const make = () => new Promise((r) => { started += 1; setTimeout(() => r(1), 5); });\n' +
          'const p = allProps({ a: make(), b: make(), c: make() });\n' +
          'expect(started).toBe(3);\n' +
          'await p;',
      },
      { name: 'preserves falsy resolved values', body: 'expect(await allProps({ a: Promise.resolve(0), b: Promise.resolve(false) })).toEqual({ a: 0, b: false });' },
      { name: 'returns a new object', body: 'const s = { a: 1 }; expect(await allProps(s)).not.toBe(s);' },
      { name: 'handles a single key', body: 'expect(await allProps({ only: Promise.resolve("v") })).toEqual({ only: "v" });' },
      { name: 'ignores inherited properties', body: 'const s = Object.create({ inherited: Promise.resolve(1) }); s.own = Promise.resolve(2); expect(await allProps(s)).toEqual({ own: 2 });', hidden: true },
      { name: 'handles many keys', body: 'const src = {}; for (let i = 0; i < 30; i += 1) src["k" + i] = Promise.resolve(i); const out = await allProps(src); expect(out.k29).toBe(29);', hidden: true },
    ],
    hints: [
      'Split the object into parallel arrays of keys and values, await the values together, then reassemble.',
      '`Object.entries` and `Object.fromEntries` make the round trip short.',
      'Awaiting inside a loop over the keys would serialise the work — the concurrency test is there to catch exactly that.',
    ],
    solution:
      'async function allProps(source) {\n' +
      '  const keys = Object.keys(source);\n' +
      '  const values = await Promise.all(keys.map((key) => source[key]));\n' +
      '  const out = {};\n' +
      '  keys.forEach((key, i) => {\n' +
      '    out[key] = values[i];\n' +
      '  });\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Because `keys` and `values` are built from the same array in the same order, reassembling by index is safe — no sorting or lookup is needed. The concurrency requirement is what rules out the obvious alternative of a `for...of` loop with an `await` inside: that would wait for each key before starting the next, turning three parallel requests into three sequential ones. The values are all handed to `Promise.all` at once, which means they were all already in flight. `Object.keys` gives own enumerable properties only, which satisfies the inheritance requirement without extra work.',
  },
];

export default challenges;
