import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Expert Builds';
const XP_E = XP[DIFFICULTY.EXPERT];

export const challenges = [
  {
    id: 'ch-exp-cancellable-pool',
    slug: 'a-cancellable-worker-pool',
    title: 'A Cancellable Worker Pool',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['promises', 'async-await', 'web-apis'],
    xp: XP_E,
    prompt:
      'Write `runPool(items, limit, worker, signal)` applying an async `worker(item, signal)` to every item with at most `limit` in flight, resolving to the results in input order. The difference from a plain pool is cancellation: when the `AbortSignal` fires, no further work starts, and the returned promise rejects with the signal\'s reason. The signal is forwarded to each worker so in-flight work can stop too, and a signal already aborted before the call means no worker ever runs.',
    examples: [
      'const controller = new AbortController();\nconst promise = runPool(urls, 4, fetchOne, controller.signal);\ncontroller.abort(new Error("navigated away"));\n// promise rejects; queued urls are never fetched',
    ],
    constraints: ['At most `limit` workers run at once.', 'After an abort, no new worker starts.', 'An already-aborted signal means zero workers run.'],
    starterCode: 'async function runPool(items, limit, worker, signal) {\n  // Your code here\n}\n',
    tests: [
      { name: 'maps every item', body: 'const c = new AbortController(); expect(await runPool([1, 2, 3], 2, async (n) => n * 2, c.signal)).toEqual([2, 4, 6]);' },
      { name: 'handles an empty input', body: 'const c = new AbortController(); expect(await runPool([], 2, async (n) => n, c.signal)).toEqual([]);' },
      { name: 'results follow input order', body: 'const c = new AbortController(); const out = await runPool([30, 1, 15], 3, async (ms) => { await new Promise((r) => setTimeout(r, ms)); return ms; }, c.signal); expect(out).toEqual([30, 1, 15]);' },
      {
        name: 'never exceeds the limit',
        body:
          'const c = new AbortController();\n' +
          'let active = 0;\n' +
          'let peak = 0;\n' +
          'await runPool(Array.from({ length: 10 }, (_, i) => i), 3, async () => {\n' +
          '  active += 1; peak = Math.max(peak, active);\n' +
          '  await new Promise((r) => setTimeout(r, 5));\n' +
          '  active -= 1;\n' +
          '}, c.signal);\n' +
          'expect(peak).toBe(3);',
      },
      {
        name: 'an already-aborted signal runs nothing',
        body:
          'const c = new AbortController();\n' +
          'c.abort(new Error("gone"));\n' +
          'let ran = 0;\n' +
          'let e = null;\n' +
          'try { await runPool([1, 2, 3], 2, async () => { ran += 1; }, c.signal); } catch (err) { e = err; }\n' +
          'expect(ran).toBe(0);\n' +
          'expect(e.message).toBe("gone");',
      },
      {
        name: 'aborting mid-run stops new work',
        body:
          'const c = new AbortController();\n' +
          'let started = 0;\n' +
          'const promise = runPool(Array.from({ length: 20 }, (_, i) => i), 2, async () => {\n' +
          '  started += 1;\n' +
          '  await new Promise((r) => setTimeout(r, 10));\n' +
          '}, c.signal);\n' +
          'await new Promise((r) => setTimeout(r, 5));\n' +
          'c.abort(new Error("stop"));\n' +
          'await promise.catch(() => {});\n' +
          'expect(started).toBeLessThan(20);',
      },
      {
        name: 'rejects with the abort reason',
        body:
          'const c = new AbortController();\n' +
          'const reason = new Error("cancelled");\n' +
          'const promise = runPool([1, 2, 3], 1, async () => { await new Promise((r) => setTimeout(r, 10)); }, c.signal);\n' +
          'await new Promise((r) => setTimeout(r, 5));\n' +
          'c.abort(reason);\n' +
          'let e = null;\n' +
          'try { await promise; } catch (err) { e = err; }\n' +
          'expect(e).toBe(reason);',
      },
      {
        name: 'forwards the signal to the worker',
        body:
          'const c = new AbortController();\n' +
          'let seen = null;\n' +
          'await runPool([1], 1, async (n, s) => { seen = s; }, c.signal);\n' +
          'expect(seen).toBe(c.signal);',
      },
      { name: 'rejects when a worker rejects', body: 'const c = new AbortController(); let e = null; try { await runPool([1, 2], 2, async (n) => { if (n === 2) throw new Error("boom"); }, c.signal); } catch (err) { e = err; } expect(e.message).toBe("boom");' },
      { name: 'passes the index', body: 'const c = new AbortController(); expect(await runPool(["a", "b"], 1, async (v, s, i) => v + i, c.signal)).toEqual(["a0", "b1"]);' },
      { name: 'a limit larger than the input is fine', body: 'const c = new AbortController(); expect(await runPool([1, 2], 10, async (n) => n, c.signal)).toEqual([1, 2]);' },
      {
        name: 'completes normally when never aborted',
        body:
          'const c = new AbortController();\n' +
          'const out = await runPool(Array.from({ length: 30 }, (_, i) => i), 4, async (n) => n * n, c.signal);\n' +
          'expect(out.length).toBe(30);\n' +
          'expect(out[29]).toBe(841);',
        hidden: true,
      },
      {
        name: 'an abort with no reason still rejects',
        body:
          'const c = new AbortController();\n' +
          'const promise = runPool([1, 2], 1, async () => { await new Promise((r) => setTimeout(r, 10)); }, c.signal);\n' +
          'await new Promise((r) => setTimeout(r, 5));\n' +
          'c.abort();\n' +
          'let threw = false;\n' +
          'try { await promise; } catch { threw = true; }\n' +
          'expect(threw).toBe(true);',
        hidden: true,
      },
    ],
    hints: [
      'Start `limit` runner loops sharing a cursor, as in an ordinary bounded pool.',
      'Check `signal.aborted` at the top of each loop iteration, before claiming the next index — that is what stops new work without interrupting what is already running.',
      '`signal.throwIfAborted()` throws the signal\'s reason, which is exactly the rejection you want; check it once before starting too, so an already-aborted signal runs nothing.',
    ],
    solution:
      'async function runPool(items, limit, worker, signal) {\n' +
      '  signal.throwIfAborted();\n' +
      '  const results = new Array(items.length);\n' +
      '  let cursor = 0;\n' +
      '\n' +
      '  async function runner() {\n' +
      '    for (;;) {\n' +
      '      signal.throwIfAborted();\n' +
      '      const index = cursor;\n' +
      '      if (index >= items.length) return;\n' +
      '      cursor += 1;\n' +
      '      results[index] = await worker(items[index], signal, index);\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  const runners = [];\n' +
      '  for (let i = 0; i < Math.min(limit, items.length); i += 1) runners.push(runner());\n' +
      '  await Promise.all(runners);\n' +
      '  return results;\n' +
      '}\n',
    solutionExplanation:
      'Cancellation in JavaScript is cooperative — nothing can forcibly stop a running promise — so a cancellable pool works by refusing to *start* anything more. Checking `signal.aborted` at the top of each loop iteration, before claiming an index, is what makes an abort take effect within one task rather than after the whole queue drains.\n\n`throwIfAborted()` does two jobs in one call: it rejects the runner, and it rejects with the signal\'s own reason, so the caller sees the object passed to `abort()` rather than a generic error. `Promise.all` then propagates the first rejection out of the pool. Checking once before starting is what makes an already-aborted signal run zero workers, which is the case an inside-the-loop check alone would miss when `limit` runners are all launched first.\n\nForwarding the signal to each worker is what makes cancellation reach the work itself: a `fetch` handed the same signal aborts its connection immediately instead of finishing a response nobody will read. Without that, cancellation only prevents *future* work — better than nothing, but it leaves whatever is in flight running to completion.',
  },

  {
    id: 'ch-exp-state-machine',
    slug: 'a-finite-state-machine',
    title: 'A Finite State Machine',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['design-patterns', 'objects', 'errors'],
    xp: XP_E,
    prompt:
      'Write `createMachine(definition)` interpreting a state chart. The definition has an `initial` state and a `states` map; each state maps event names to a transition `{ target, guard?, action? }`. `send(event, payload)` attempts a transition: if the current state does not handle the event, or the `guard(context, payload)` returns false, nothing changes and `send` returns false. Otherwise the `action(context, payload)` runs to update the context, the state changes, and `send` returns true. Expose `state`, `context` and `can(event, payload)`.',
    examples: [
      'const m = createMachine({\n  initial: "idle",\n  context: { retries: 0 },\n  states: {\n    idle: { FETCH: { target: "loading" } },\n    loading: { FAIL: { target: "idle", guard: (c) => c.retries < 3, action: (c) => { c.retries += 1; } } },\n  },\n});\nm.send("FETCH");   // true, state is "loading"',
    ],
    constraints: ['An unhandled event or a failed guard changes nothing and returns false.', 'The action runs only when the transition is actually taken.', '`can` reports whether an event would transition, without side effects.'],
    starterCode: 'function createMachine(definition) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'starts in the initial state',
        body:
          'const m = createMachine({ initial: "idle", states: { idle: {} } });\n' +
          'expect(m.state).toBe("idle");',
      },
      {
        name: 'transitions on a handled event',
        body:
          'const m = createMachine({ initial: "idle", states: { idle: { GO: { target: "busy" } }, busy: {} } });\n' +
          'expect(m.send("GO")).toBe(true);\n' +
          'expect(m.state).toBe("busy");',
      },
      {
        name: 'ignores an unhandled event',
        body:
          'const m = createMachine({ initial: "idle", states: { idle: { GO: { target: "busy" } }, busy: {} } });\n' +
          'expect(m.send("NOPE")).toBe(false);\n' +
          'expect(m.state).toBe("idle");',
      },
      {
        name: 'an event handled only by another state is ignored',
        body:
          'const m = createMachine({ initial: "idle", states: { idle: { GO: { target: "busy" } }, busy: { STOP: { target: "idle" } } } });\n' +
          'expect(m.send("STOP")).toBe(false);\n' +
          'expect(m.state).toBe("idle");',
      },
      {
        name: 'exposes the context',
        body:
          'const m = createMachine({ initial: "a", context: { n: 5 }, states: { a: {} } });\n' +
          'expect(m.context.n).toBe(5);',
      },
      {
        name: 'the action updates the context',
        body:
          'const m = createMachine({ initial: "a", context: { n: 0 }, states: { a: { INC: { target: "a", action: (c) => { c.n += 1; } } } } });\n' +
          'm.send("INC");\n' +
          'm.send("INC");\n' +
          'expect(m.context.n).toBe(2);',
      },
      {
        name: 'the action receives the payload',
        body:
          'const m = createMachine({ initial: "a", context: { v: null }, states: { a: { SET: { target: "a", action: (c, p) => { c.v = p; } } } } });\n' +
          'm.send("SET", "hello");\n' +
          'expect(m.context.v).toBe("hello");',
      },
      {
        name: 'a failing guard blocks the transition',
        body:
          'const m = createMachine({ initial: "a", context: {}, states: { a: { GO: { target: "b", guard: () => false } }, b: {} } });\n' +
          'expect(m.send("GO")).toBe(false);\n' +
          'expect(m.state).toBe("a");',
      },
      {
        name: 'a passing guard allows the transition',
        body:
          'const m = createMachine({ initial: "a", context: {}, states: { a: { GO: { target: "b", guard: () => true } }, b: {} } });\n' +
          'expect(m.send("GO")).toBe(true);\n' +
          'expect(m.state).toBe("b");',
      },
      {
        name: 'the action does not run when the guard fails',
        body:
          'let ran = 0;\n' +
          'const m = createMachine({ initial: "a", context: {}, states: { a: { GO: { target: "b", guard: () => false, action: () => { ran += 1; } } }, b: {} } });\n' +
          'm.send("GO");\n' +
          'expect(ran).toBe(0);',
      },
      {
        name: 'the guard receives the context and payload',
        body:
          'const m = createMachine({ initial: "a", context: { limit: 5 }, states: { a: { GO: { target: "b", guard: (c, p) => p < c.limit } }, b: {} } });\n' +
          'expect(m.send("GO", 10)).toBe(false);\n' +
          'expect(m.send("GO", 1)).toBe(true);',
      },
      {
        name: 'a retry limit works end to end',
        body:
          'const m = createMachine({\n' +
          '  initial: "idle",\n' +
          '  context: { retries: 0 },\n' +
          '  states: {\n' +
          '    idle: { FETCH: { target: "loading" } },\n' +
          '    loading: { FAIL: { target: "idle", guard: (c) => c.retries < 2, action: (c) => { c.retries += 1; } } },\n' +
          '  },\n' +
          '});\n' +
          'expect(m.send("FETCH")).toBe(true);\n' +
          'expect(m.send("FAIL")).toBe(true);\n' +
          'expect(m.send("FETCH")).toBe(true);\n' +
          'expect(m.send("FAIL")).toBe(true);\n' +
          'expect(m.send("FETCH")).toBe(true);\n' +
          'expect(m.send("FAIL")).toBe(false);\n' +
          'expect(m.state).toBe("loading");\n' +
          'expect(m.context.retries).toBe(2);',
      },
      {
        name: 'can reports without transitioning',
        body:
          'const m = createMachine({ initial: "a", states: { a: { GO: { target: "b" } }, b: {} } });\n' +
          'expect(m.can("GO")).toBe(true);\n' +
          'expect(m.state).toBe("a");',
      },
      {
        name: 'can respects the guard',
        body:
          'const m = createMachine({ initial: "a", context: {}, states: { a: { GO: { target: "b", guard: () => false } }, b: {} } });\n' +
          'expect(m.can("GO")).toBe(false);',
      },
      {
        name: 'can has no side effects',
        body:
          'let ran = 0;\n' +
          'const m = createMachine({ initial: "a", context: {}, states: { a: { GO: { target: "b", action: () => { ran += 1; } } }, b: {} } });\n' +
          'm.can("GO");\n' +
          'expect(ran).toBe(0);',
      },
      {
        name: 'a self-transition is allowed',
        body:
          'const m = createMachine({ initial: "a", context: { n: 0 }, states: { a: { PING: { target: "a", action: (c) => { c.n += 1; } } } } });\n' +
          'm.send("PING");\n' +
          'expect(m.state).toBe("a");\n' +
          'expect(m.context.n).toBe(1);',
        hidden: true,
      },
      {
        name: 'context defaults to an empty object',
        body:
          'const m = createMachine({ initial: "a", states: { a: {} } });\n' +
          'expect(m.context).toEqual({});',
        hidden: true,
      },
    ],
    hints: [
      'Look up the transition as `definition.states[currentState]?.[event]`. Absent means the event is not handled here.',
      'Evaluate the guard before doing anything else, and only then run the action and change the state — that ordering is what makes a rejected transition a true no-op.',
      '`can` is the same lookup and guard evaluation with the action and state change omitted, so factor that part out rather than duplicating it.',
    ],
    solution:
      'function createMachine(definition) {\n' +
      '  let state = definition.initial;\n' +
      '  const context = { ...(definition.context ?? {}) };\n' +
      '\n' +
      '  function resolve(event, payload) {\n' +
      '    const transition = definition.states[state]?.[event];\n' +
      '    if (transition === undefined) return null;\n' +
      '    if (transition.guard && !transition.guard(context, payload)) return null;\n' +
      '    return transition;\n' +
      '  }\n' +
      '\n' +
      '  return {\n' +
      '    get state() {\n' +
      '      return state;\n' +
      '    },\n' +
      '    get context() {\n' +
      '      return context;\n' +
      '    },\n' +
      '    can(event, payload) {\n' +
      '      return resolve(event, payload) !== null;\n' +
      '    },\n' +
      '    send(event, payload) {\n' +
      '      const transition = resolve(event, payload);\n' +
      '      if (transition === null) return false;\n' +
      '      if (transition.action) transition.action(context, payload);\n' +
      '      state = transition.target;\n' +
      '      return true;\n' +
      '    },\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The value of a state machine is that impossible transitions become impossible by construction rather than by discipline: an event a state does not declare simply does nothing, so the sprawl of boolean flags that usually encodes "are we loading, and did it fail, and can we retry" collapses into one `state` value that is always valid.\n\nFactoring the lookup and the guard into `resolve` is what keeps `can` and `send` honest about each other. If they duplicated the logic, `can` could drift and start promising transitions that `send` refuses — a UI would enable a button that does nothing. Sharing the resolution means `can` is exactly "would `send` succeed", with no possibility of divergence.\n\nEvaluating the guard *before* running the action and *before* assigning the state is what makes a rejected transition a genuine no-op. Getting that order wrong — running the action first and then discovering the guard fails — leaves the context mutated for a transition that never happened, which is the kind of bug that only appears at the retry limit and is miserable to track down. Copying the initial context rather than using the definition\'s object directly means two machines built from the same definition do not share state.',
  },

  {
    id: 'ch-exp-lfu',
    slug: 'an-lfu-cache',
    title: 'An LFU Cache',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['data-structures', 'algorithms', 'performance'],
    xp: XP_E,
    prompt:
      'An LRU cache evicts what was used least *recently*; an LFU evicts what has been used least *often*, which suits a workload with a stable hot set. Write a class `LFUCache(capacity)` with `get(key)`, `set(key, value)` and `size`. Both `get` and `set` count as a use. When full, evict the entry with the lowest use count, breaking ties by evicting the least recently used among them. Every operation must be O(1) — no scanning for the minimum.',
    examples: [
      'const c = new LFUCache(2);\nc.set("a", 1); c.set("b", 2);\nc.get("a");        // "a" now has 2 uses, "b" has 1\nc.set("c", 3);     // evicts "b"\nc.get("b");        // undefined',
    ],
    constraints: ['Eviction is by lowest use count, then least recently used.', '`get` and `set` both increase the count.', 'Every operation is O(1); scanning for the minimum is not acceptable.'],
    starterCode: 'class LFUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  set(key, value) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'stores and retrieves', body: 'const c = new LFUCache(2); c.set("a", 1); expect(c.get("a")).toBe(1);' },
      { name: 'returns undefined for a missing key', body: 'expect(new LFUCache(2).get("nope")).toBe(undefined);' },
      { name: 'reports its size', body: 'const c = new LFUCache(3); c.set("a", 1); c.set("b", 2); expect(c.size).toBe(2);' },
      { name: 'never exceeds the capacity', body: 'const c = new LFUCache(2); c.set("a", 1); c.set("b", 2); c.set("c", 3); expect(c.size).toBe(2);' },
      { name: 'evicts the least frequently used', body: 'const c = new LFUCache(2); c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3); expect(c.get("b")).toBe(undefined); expect(c.get("a")).toBe(1);' },
      { name: 'frequency beats recency', body: 'const c = new LFUCache(2); c.set("a", 1); c.get("a"); c.get("a"); c.set("b", 2); c.set("c", 3); expect(c.get("a")).toBe(1); expect(c.get("b")).toBe(undefined);' },
      { name: 'ties break by least recently used', body: 'const c = new LFUCache(2); c.set("a", 1); c.set("b", 2); c.set("c", 3); expect(c.get("a")).toBe(undefined); expect(c.get("b")).toBe(2);' },
      { name: 'a set on an existing key updates without growing', body: 'const c = new LFUCache(2); c.set("a", 1); c.set("a", 9); expect(c.size).toBe(1); expect(c.get("a")).toBe(9);' },
      { name: 'a set on an existing key counts as a use', body: 'const c = new LFUCache(2); c.set("a", 1); c.set("b", 2); c.set("a", 9); c.set("c", 3); expect(c.get("b")).toBe(undefined); expect(c.get("a")).toBe(9);' },
      { name: 'a capacity of one holds the newest', body: 'const c = new LFUCache(1); c.set("a", 1); c.set("b", 2); expect(c.get("a")).toBe(undefined); expect(c.get("b")).toBe(2);' },
      { name: 'stores falsy values', body: 'const c = new LFUCache(2); c.set("a", 0); expect(c.get("a")).toBe(0);' },
      { name: 'keeps number and string keys apart', body: 'const c = new LFUCache(3); c.set(1, "num"); c.set("1", "str"); expect(c.get(1)).toBe("num"); expect(c.get("1")).toBe("str");' },
      {
        name: 'a hot key survives a flood of one-off keys',
        body:
          'const c = new LFUCache(3);\n' +
          'c.set("hot", "kept");\n' +
          'for (let i = 0; i < 10; i += 1) c.get("hot");\n' +
          'for (let i = 0; i < 500; i += 1) c.set("cold" + i, i);\n' +
          'expect(c.get("hot")).toBe("kept");\n' +
          'expect(c.size).toBe(3);',
      },
      {
        name: 'stays fast on a large workload',
        body:
          'const c = new LFUCache(100);\n' +
          'for (let i = 0; i < 100000; i += 1) c.set("k" + (i % 500), i);\n' +
          'expect(c.size).toBe(100);',
        hidden: true,
      },
      {
        name: 'the minimum count is tracked correctly after eviction',
        body:
          'const c = new LFUCache(2);\n' +
          'c.set("a", 1); c.get("a"); c.get("a");\n' +
          'c.set("b", 2);\n' +
          'c.set("c", 3);\n' +
          'expect(c.get("b")).toBe(undefined);\n' +
          'c.get("c"); c.get("c"); c.get("c");\n' +
          'c.set("d", 4);\n' +
          'expect(c.get("a")).toBe(undefined);\n' +
          'expect(c.get("c")).toBe(3);',
        hidden: true,
      },
    ],
    hints: [
      'Keep three structures: key to entry (value plus count), count to the set of keys with that count, and a running minimum count.',
      'Use a `Map` for each count bucket. Because `Map` preserves insertion order, its first key is the least recently used at that frequency, which gives you the tie-break for free.',
      'On a use, move the key from bucket n to bucket n+1. If bucket n is now empty and n was the minimum, the minimum becomes n+1 — that single line is what keeps eviction O(1) with no scanning.',
    ],
    solution:
      'class LFUCache {\n' +
      '  #capacity;\n' +
      '\n' +
      '  #entries = new Map();\n' +
      '\n' +
      '  #buckets = new Map();\n' +
      '\n' +
      '  #minCount = 0;\n' +
      '\n' +
      '  constructor(capacity) {\n' +
      '    this.#capacity = capacity;\n' +
      '  }\n' +
      '\n' +
      '  get size() {\n' +
      '    return this.#entries.size;\n' +
      '  }\n' +
      '\n' +
      '  #bucket(count) {\n' +
      '    if (!this.#buckets.has(count)) this.#buckets.set(count, new Map());\n' +
      '    return this.#buckets.get(count);\n' +
      '  }\n' +
      '\n' +
      '  #touch(key, entry) {\n' +
      '    const from = this.#bucket(entry.count);\n' +
      '    from.delete(key);\n' +
      '    if (from.size === 0) {\n' +
      '      this.#buckets.delete(entry.count);\n' +
      '      if (this.#minCount === entry.count) this.#minCount = entry.count + 1;\n' +
      '    }\n' +
      '    entry.count += 1;\n' +
      '    this.#bucket(entry.count).set(key, true);\n' +
      '  }\n' +
      '\n' +
      '  get(key) {\n' +
      '    const entry = this.#entries.get(key);\n' +
      '    if (entry === undefined) return undefined;\n' +
      '    this.#touch(key, entry);\n' +
      '    return entry.value;\n' +
      '  }\n' +
      '\n' +
      '  set(key, value) {\n' +
      '    if (this.#capacity < 1) return;\n' +
      '    const existing = this.#entries.get(key);\n' +
      '    if (existing !== undefined) {\n' +
      '      existing.value = value;\n' +
      '      this.#touch(key, existing);\n' +
      '      return;\n' +
      '    }\n' +
      '    if (this.#entries.size >= this.#capacity) {\n' +
      '      const victims = this.#bucket(this.#minCount);\n' +
      '      const oldest = victims.keys().next().value;\n' +
      '      victims.delete(oldest);\n' +
      '      if (victims.size === 0) this.#buckets.delete(this.#minCount);\n' +
      '      this.#entries.delete(oldest);\n' +
      '    }\n' +
      '    this.#entries.set(key, { value, count: 1 });\n' +
      '    this.#bucket(1).set(key, true);\n' +
      '    this.#minCount = 1;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The hard requirement is O(1) eviction, which rules out scanning the entries for the lowest count. Bucketing keys by their use count and tracking the running minimum replaces that scan with a direct lookup: the victim is always the first key of the minimum bucket.\n\nKeeping the running minimum correct is the delicate part, and it works because of an invariant that is easy to miss — a use moves a key from bucket n to bucket n+1, so if bucket n was the minimum and is now empty, the new minimum can only be n+1. It cannot have jumped further, because nothing else moved. And any insertion resets the minimum to 1, since a brand-new entry always has the lowest possible count. Those two rules are the whole bookkeeping.\n\nUsing a `Map` for each bucket rather than a `Set` is what supplies the tie-break: `Map` iterates in insertion order, so the first key in a bucket is the one that arrived at that frequency first — least recently used among equals, exactly as specified.\n\nThe hot-key test shows why LFU exists. Five hundred one-off keys stream through the cache and the frequently-read entry survives all of them; an LRU of the same size would have evicted it almost immediately. The trade-off is the mirror image: LFU can cling to an entry that was popular an hour ago and is now dead, which is why production caches often add ageing or a time-decayed count.',
  },

  {
    id: 'ch-exp-json-patch',
    slug: 'applying-a-json-patch',
    title: 'Applying a JSON Patch',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['objects', 'copying', 'errors'],
    xp: XP_E,
    prompt:
      'Implement `applyPatch(document, operations)` from RFC 6902 — the format used to send a minimal change set over the wire instead of a whole document. Support `add`, `remove`, `replace` and `test`, each with a JSON Pointer `path` like `/user/name` or `/items/0`. The document must not be modified; return a new one. `add` on an array index inserts, and a path segment of `-` appends. A failed `test` throws, and so does any operation whose path does not exist. **Operations apply in order, and if any one fails the whole patch fails with nothing applied** — atomicity is the point of the format.',
    examples: [
      'applyPatch({ a: 1 }, [{ op: "replace", path: "/a", value: 2 }]);   // { a: 2 }',
      'applyPatch({ xs: [1, 3] }, [{ op: "add", path: "/xs/1", value: 2 }]);  // { xs: [1, 2, 3] }',
    ],
    constraints: ['The input document is never modified.', 'A failing operation leaves the document entirely unchanged.', 'JSON Pointer escapes: `~1` is `/` and `~0` is `~`.'],
    starterCode: 'function applyPatch(document, operations) {\n  // Your code here\n}\n',
    tests: [
      { name: 'replaces a value', body: 'expect(applyPatch({ a: 1 }, [{ op: "replace", path: "/a", value: 2 }])).toEqual({ a: 2 });' },
      { name: 'does not modify the input', body: 'const doc = { a: 1 }; applyPatch(doc, [{ op: "replace", path: "/a", value: 2 }]); expect(doc.a).toBe(1);' },
      { name: 'adds a new key', body: 'expect(applyPatch({ a: 1 }, [{ op: "add", path: "/b", value: 2 }])).toEqual({ a: 1, b: 2 });' },
      { name: 'removes a key', body: 'expect(applyPatch({ a: 1, b: 2 }, [{ op: "remove", path: "/a" }])).toEqual({ b: 2 });' },
      { name: 'works on a nested path', body: 'expect(applyPatch({ u: { n: "x" } }, [{ op: "replace", path: "/u/n", value: "y" }])).toEqual({ u: { n: "y" } });' },
      { name: 'replaces an array element', body: 'expect(applyPatch({ xs: [1, 2] }, [{ op: "replace", path: "/xs/0", value: 9 }])).toEqual({ xs: [9, 2] });' },
      { name: 'add inserts into an array', body: 'expect(applyPatch({ xs: [1, 3] }, [{ op: "add", path: "/xs/1", value: 2 }])).toEqual({ xs: [1, 2, 3] });' },
      { name: 'a dash appends to an array', body: 'expect(applyPatch({ xs: [1] }, [{ op: "add", path: "/xs/-", value: 2 }])).toEqual({ xs: [1, 2] });' },
      { name: 'remove splices an array', body: 'expect(applyPatch({ xs: [1, 2, 3] }, [{ op: "remove", path: "/xs/1" }])).toEqual({ xs: [1, 3] });' },
      { name: 'a passing test changes nothing', body: 'expect(applyPatch({ a: 1 }, [{ op: "test", path: "/a", value: 1 }])).toEqual({ a: 1 });' },
      { name: 'a failing test throws', body: 'expect(() => applyPatch({ a: 1 }, [{ op: "test", path: "/a", value: 2 }])).toThrow();' },
      { name: 'operations apply in order', body: 'expect(applyPatch({ a: 1 }, [{ op: "replace", path: "/a", value: 2 }, { op: "replace", path: "/a", value: 3 }])).toEqual({ a: 3 });' },
      { name: 'a later failure discards earlier operations', body: 'const doc = { a: 1, b: 2 }; expect(() => applyPatch(doc, [{ op: "replace", path: "/a", value: 9 }, { op: "test", path: "/b", value: 99 }])).toThrow(); expect(doc).toEqual({ a: 1, b: 2 });' },
      { name: 'the result of a failed patch is not partially applied', body: 'const doc = { a: 1, b: 2 }; let out = null; try { out = applyPatch(doc, [{ op: "replace", path: "/a", value: 9 }, { op: "remove", path: "/nope" }]); } catch { /* expected */ } expect(out).toBe(null); expect(doc.a).toBe(1);' },
      { name: 'removing a missing key throws', body: 'expect(() => applyPatch({ a: 1 }, [{ op: "remove", path: "/nope" }])).toThrow();' },
      { name: 'replacing a missing key throws', body: 'expect(() => applyPatch({ a: 1 }, [{ op: "replace", path: "/nope", value: 1 }])).toThrow();' },
      { name: 'an empty patch returns an equal document', body: 'expect(applyPatch({ a: 1 }, [])).toEqual({ a: 1 });' },
      { name: 'decodes the slash escape', body: 'expect(applyPatch({ "a/b": 1 }, [{ op: "replace", path: "/a~1b", value: 2 }])).toEqual({ "a/b": 2 });' },
      { name: 'decodes the tilde escape', body: 'expect(applyPatch({ "a~b": 1 }, [{ op: "replace", path: "/a~0b", value: 2 }])).toEqual({ "a~b": 2 });' },
      { name: 'add replaces an existing object key', body: 'expect(applyPatch({ a: 1 }, [{ op: "add", path: "/a", value: 2 }])).toEqual({ a: 2 });', hidden: true },
      { name: 'a deep nested add', body: 'expect(applyPatch({ a: { b: { c: [] } } }, [{ op: "add", path: "/a/b/c/-", value: 1 }])).toEqual({ a: { b: { c: [1] } } });', hidden: true },
    ],
    hints: [
      'Atomicity is easiest to get right by working on a deep copy and returning it only once every operation has succeeded — if anything throws, the copy is discarded and the original was never touched.',
      'Parse a pointer by splitting on `/`, dropping the leading empty piece, and decoding `~1` before `~0` (doing it the other way round would turn `~01` into `/` incorrectly).',
      'Walk to the *parent* of the target and keep the final segment separately — every operation acts on a container plus a key, and arrays need `splice` where objects need assignment and `delete`.',
    ],
    solution:
      'function applyPatch(document, operations) {\n' +
      '  const clone = (v) => {\n' +
      '    if (Array.isArray(v)) return v.map(clone);\n' +
      '    if (typeof v === "object" && v !== null) {\n' +
      '      const copy = {};\n' +
      '      for (const k of Object.keys(v)) copy[k] = clone(v[k]);\n' +
      '      return copy;\n' +
      '    }\n' +
      '    return v;\n' +
      '  };\n' +
      '\n' +
      '  const parse = (pointer) =>\n' +
      '    pointer.split("/").slice(1).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));\n' +
      '\n' +
      '  const working = clone(document);\n' +
      '\n' +
      '  for (const operation of operations) {\n' +
      '    const segments = parse(operation.path);\n' +
      '    const last = segments.pop();\n' +
      '    let parent = working;\n' +
      '    for (const segment of segments) {\n' +
      '      if (parent === null || typeof parent !== "object" || !(segment in parent)) {\n' +
      '        throw new Error("path not found: " + operation.path);\n' +
      '      }\n' +
      '      parent = parent[segment];\n' +
      '    }\n' +
      '\n' +
      '    const isArray = Array.isArray(parent);\n' +
      '    if (operation.op === "add") {\n' +
      '      if (isArray) {\n' +
      '        const index = last === "-" ? parent.length : Number(last);\n' +
      '        if (!Number.isInteger(index) || index < 0 || index > parent.length) {\n' +
      '          throw new Error("bad array index: " + operation.path);\n' +
      '        }\n' +
      '        parent.splice(index, 0, operation.value);\n' +
      '      } else {\n' +
      '        parent[last] = operation.value;\n' +
      '      }\n' +
      '    } else {\n' +
      '      if (!(last in parent)) throw new Error("path not found: " + operation.path);\n' +
      '      if (operation.op === "remove") {\n' +
      '        if (isArray) parent.splice(Number(last), 1);\n' +
      '        else delete parent[last];\n' +
      '      } else if (operation.op === "replace") {\n' +
      '        parent[last] = operation.value;\n' +
      '      } else if (operation.op === "test") {\n' +
      '        if (JSON.stringify(parent[last]) !== JSON.stringify(operation.value)) {\n' +
      '          throw new Error("test failed at " + operation.path);\n' +
      '        }\n' +
      '      } else {\n' +
      '        throw new Error("unsupported op: " + operation.op);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  return working;\n' +
      '}\n',
    solutionExplanation:
      'Atomicity is the requirement that shapes the whole design, and the clean way to get it is to never touch the original at all: everything happens on a deep copy, which is returned only after the last operation succeeds. If any operation throws, the copy is simply discarded — no rollback log, no undo stack, no half-applied state. Mutating the real document and trying to unwind on failure is far more code and far easier to get wrong.\n\nThe pointer escapes have to be decoded in the order `~1` then `~0`, and the reason is worth seeing: decoding `~0` first would turn `~01` into `~1`, which the next pass would then wrongly decode into `/`. Doing it the specified way round is unambiguous.\n\nWalking to the *parent* rather than the target is what lets one traversal serve every operation — each one ultimately needs a container plus a key, and `remove` and `add` could not be expressed at all if you only had the value. Arrays and objects then diverge exactly where they must: `add` inserts with `splice` on an array but assigns on an object, and `-` means "one past the end", which is why the bounds check permits `index === parent.length`. The `test` operation is what makes a patch safe to apply against a document that may have changed since it was generated — it is optimistic concurrency control expressed as a patch operation.',
  },

  {
    id: 'ch-exp-scheduler',
    slug: 'a-priority-scheduler',
    title: 'A Priority Scheduler',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['performance', 'event-loop', 'data-structures'],
    xp: XP_E,
    prompt:
      'A long synchronous loop freezes the page. Write `createScheduler(now, yieldTo)` returning `{ schedule(priority, fn), flush(budgetMs) }`. `schedule` queues work at a priority (lower number runs first, ties in scheduling order). `flush` runs queued work until the time budget is exhausted — using the injected `now()` — then hands control back via `yieldTo` and continues in the next slice. It resolves when the queue is empty. Work scheduled *during* a flush joins the same queue and is picked up by priority, so a newly scheduled high-priority task can jump ahead of lower-priority work still waiting.',
    examples: [
      'const { schedule, flush } = createScheduler(() => Date.now(), (fn) => setTimeout(fn, 0));\nschedule(2, renderFooter);\nschedule(0, renderHeader);   // runs first despite being queued second\nawait flush(5);',
    ],
    constraints: ['Lower priority numbers run first; ties keep scheduling order.', 'A slice stops once the budget is exhausted, then yields before continuing.', 'Work scheduled during a flush is ordered by priority like everything else.'],
    starterCode: 'function createScheduler(now, yieldTo) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'runs a scheduled task',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'let ran = 0;\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          'await s.flush(10);\n' +
          'expect(ran).toBe(1);',
      },
      {
        name: 'does not run before flush',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'let ran = 0;\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          'expect(ran).toBe(0);',
      },
      {
        name: 'runs in priority order',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'const order = [];\n' +
          's.schedule(2, () => order.push("low"));\n' +
          's.schedule(0, () => order.push("high"));\n' +
          's.schedule(1, () => order.push("mid"));\n' +
          'await s.flush(10);\n' +
          'expect(order).toEqual(["high", "mid", "low"]);',
      },
      {
        name: 'ties keep scheduling order',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'const order = [];\n' +
          's.schedule(1, () => order.push("a"));\n' +
          's.schedule(1, () => order.push("b"));\n' +
          's.schedule(1, () => order.push("c"));\n' +
          'await s.flush(10);\n' +
          'expect(order).toEqual(["a", "b", "c"]);',
      },
      {
        name: 'flushing an empty queue resolves and leaves the scheduler usable',
        body:
          'let yields = 0;\n' +
          'const s = createScheduler(() => 0, (fn) => { yields += 1; fn(); });\n' +
          'let settled = false;\n' +
          'await s.flush(10).then(() => { settled = true; });\n' +
          'expect(settled).toBe(true);\n' +
          'expect(yields).toBe(0);\n' +
          'let ran = 0;\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          'await s.flush(10);\n' +
          'expect(ran).toBe(1);',
      },
      {
        name: 'runs everything eventually',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'let ran = 0;\n' +
          'for (let i = 0; i < 50; i += 1) s.schedule(i % 3, () => { ran += 1; });\n' +
          'await s.flush(10);\n' +
          'expect(ran).toBe(50);',
      },
      {
        name: 'yields when the budget is exhausted',
        body:
          'let clock = 0;\n' +
          'let yields = 0;\n' +
          'const s = createScheduler(() => clock, (fn) => { yields += 1; fn(); });\n' +
          'for (let i = 0; i < 4; i += 1) s.schedule(0, () => { clock += 3; });\n' +
          'await s.flush(5);\n' +
          'expect(yields).toBeGreaterThan(0);',
      },
      {
        name: 'still completes every task across slices',
        body:
          'let clock = 0;\n' +
          'const s = createScheduler(() => clock, (fn) => fn());\n' +
          'let ran = 0;\n' +
          'for (let i = 0; i < 10; i += 1) s.schedule(0, () => { clock += 3; ran += 1; });\n' +
          'await s.flush(5);\n' +
          'expect(ran).toBe(10);',
      },
      {
        name: 'work scheduled during a flush also runs',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'const order = [];\n' +
          's.schedule(0, () => { order.push("first"); s.schedule(0, () => order.push("nested")); });\n' +
          'await s.flush(10);\n' +
          'expect(order).toEqual(["first", "nested"]);',
      },
      {
        name: 'a high priority task scheduled during a flush jumps the queue',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'const order = [];\n' +
          's.schedule(0, () => { order.push("a"); s.schedule(0, () => order.push("urgent")); });\n' +
          's.schedule(5, () => order.push("low"));\n' +
          'await s.flush(10);\n' +
          'expect(order).toEqual(["a", "urgent", "low"]);',
      },
      {
        name: 'runs at least one task per slice even with no budget',
        body:
          'let clock = 0;\n' +
          'const s = createScheduler(() => { clock += 100; return clock; }, (fn) => fn());\n' +
          'let ran = 0;\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          'await s.flush(0);\n' +
          'expect(ran).toBe(2);',
      },
      {
        name: 'flush resolves only when the queue is empty',
        body:
          'let clock = 0;\n' +
          'const s = createScheduler(() => clock, (fn) => fn());\n' +
          'let ran = 0;\n' +
          'for (let i = 0; i < 20; i += 1) s.schedule(0, () => { clock += 2; ran += 1; });\n' +
          'await s.flush(3);\n' +
          'expect(ran).toBe(20);',
        hidden: true,
      },
      {
        name: 'a task that throws does not stop the queue',
        body:
          'const s = createScheduler(() => 0, (fn) => fn());\n' +
          'let ran = 0;\n' +
          's.schedule(0, () => { throw new Error("boom"); });\n' +
          's.schedule(0, () => { ran += 1; });\n' +
          'await s.flush(10);\n' +
          'expect(ran).toBe(1);',
        hidden: true,
      },
    ],
    hints: [
      'Keep the queue sorted by priority, then by a monotonically increasing sequence number for the tie-break. Re-sorting before each pick is simplest and correct.',
      'The flush loop runs a task, then checks whether `now() - sliceStart` has exceeded the budget; if so, `await` a promise resolved from `yieldTo` and start a new slice.',
      'Run at least one task per slice before checking the budget, or a budget of 0 would never make progress. And wrap each task in `try`/`catch` so one failure does not abandon the queue.',
    ],
    solution:
      'function createScheduler(now, yieldTo) {\n' +
      '  const queue = [];\n' +
      '  let sequence = 0;\n' +
      '\n' +
      '  function schedule(priority, fn) {\n' +
      '    queue.push({ priority, order: sequence, fn });\n' +
      '    sequence += 1;\n' +
      '  }\n' +
      '\n' +
      '  function takeNext() {\n' +
      '    let bestIndex = 0;\n' +
      '    for (let i = 1; i < queue.length; i += 1) {\n' +
      '      const a = queue[i];\n' +
      '      const b = queue[bestIndex];\n' +
      '      if (a.priority < b.priority || (a.priority === b.priority && a.order < b.order)) {\n' +
      '        bestIndex = i;\n' +
      '      }\n' +
      '    }\n' +
      '    return queue.splice(bestIndex, 1)[0];\n' +
      '  }\n' +
      '\n' +
      '  async function flush(budgetMs) {\n' +
      '    while (queue.length > 0) {\n' +
      '      const sliceStart = now();\n' +
      '      do {\n' +
      '        const task = takeNext();\n' +
      '        try {\n' +
      '          task.fn();\n' +
      '        } catch {\n' +
      '          /* one failing task must not abandon the queue */\n' +
      '        }\n' +
      '      } while (queue.length > 0 && now() - sliceStart < budgetMs);\n' +
      '\n' +
      '      if (queue.length > 0) {\n' +
      '        await new Promise((resolve) => yieldTo(resolve));\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  return { schedule, flush };\n' +
      '}\n',
    solutionExplanation:
      'This is time slicing, the idea behind cooperative schedulers such as React\'s. A long run of work is chopped into slices bounded by a time budget, and between slices control returns to the host so the browser can paint, process input and run other tasks. Nothing is preempted — a single task that runs for 500ms still blocks — so the granularity of the work sets the floor on responsiveness.\n\nThe `do...while` shape matters: it runs one task *before* consulting the budget, which is what guarantees forward progress. With a plain `while`, a budget of 0 — or a slow clock whose first reading already exceeds it — would yield forever without ever running anything, and the flush would never resolve.\n\nPicking the best task at the moment it is needed, rather than sorting once when work is queued, is what lets a high-priority task scheduled *during* a flush jump ahead of lower-priority work still waiting. A pre-sorted queue would have to be re-sorted on every insertion to achieve the same thing; for a long queue a binary heap keyed on `(priority, order)` would beat this linear scan, and the sequence number is what preserves scheduling order among equal priorities regardless of which structure holds them.\n\nInjecting both `now` and `yieldTo` keeps the policy out of the mechanism — production code would pass `performance.now` and something like `requestIdleCallback` or a `MessageChannel` — and it is what makes every one of these tests deterministic rather than a race against a real clock.',
  },

  {
    id: 'ch-exp-serialize-refs',
    slug: 'serialising-a-graph',
    title: 'Serialising a Graph',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['objects', 'copying', 'data-structures'],
    xp: XP_E,
    prompt:
      '`JSON.stringify` throws on a cycle, turns a `Date` into a string that never becomes a `Date` again, and silently empties a `Map` or `Set`. Write `encode(value)` producing a JSON-safe structure and `decode(encoded)` reconstructing it, preserving `Date`, `Map`, `Set`, `undefined`, `NaN`, `Infinity`, cycles, and — crucially — **shared references**: two properties pointing at one object must still point at one object after the round trip.',
    examples: [
      'const shared = { n: 1 };\nconst original = { a: shared, b: shared };\noriginal.self = original;\nconst copy = decode(JSON.parse(JSON.stringify(encode(original))));\ncopy.a === copy.b;      // true\ncopy.self === copy;     // true',
    ],
    constraints: ['`encode` output must survive `JSON.stringify` and `JSON.parse`.', 'Shared references and cycles are preserved as such.', 'Functions and symbols are out of scope.'],
    starterCode: 'function encode(value) {\n  // Your code here\n}\n\nfunction decode(encoded) {\n  // Your code here\n}\n',
    tests: [
      { name: 'round-trips a plain object', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ a: 1 })))); expect(out).toEqual({ a: 1 });' },
      { name: 'round-trips an array', body: 'const out = decode(JSON.parse(JSON.stringify(encode([1, 2, 3])))); expect(out).toEqual([1, 2, 3]); expect(Array.isArray(out)).toBe(true);' },
      { name: 'round-trips nested structures', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ a: { b: [1, { c: 2 }] } })))); expect(out).toEqual({ a: { b: [1, { c: 2 }] } });' },
      { name: 'round-trips a Date', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ d: new Date(1000) })))); expect(out.d instanceof Date).toBe(true); expect(out.d.getTime()).toBe(1000);' },
      { name: 'round-trips a Map', body: 'const out = decode(JSON.parse(JSON.stringify(encode(new Map([["a", 1]]))))); expect(out instanceof Map).toBe(true); expect(out.get("a")).toBe(1);' },
      { name: 'round-trips a Set', body: 'const out = decode(JSON.parse(JSON.stringify(encode(new Set([1, 2]))))); expect(out instanceof Set).toBe(true); expect([...out]).toEqual([1, 2]);' },
      { name: 'round-trips undefined', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ u: undefined })))); expect("u" in out).toBe(true); expect(out.u).toBe(undefined);' },
      { name: 'round-trips NaN', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ n: NaN })))); expect(Number.isNaN(out.n)).toBe(true);' },
      { name: 'round-trips Infinity', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ p: Infinity, m: -Infinity })))); expect(out.p).toBe(Infinity); expect(out.m).toBe(-Infinity);' },
      { name: 'round-trips null', body: 'const out = decode(JSON.parse(JSON.stringify(encode({ n: null })))); expect(out.n).toBe(null);' },
      { name: 'preserves a self-reference', body: 'const o = { a: 1 }; o.self = o; const out = decode(JSON.parse(JSON.stringify(encode(o)))); expect(out.self).toBe(out);' },
      { name: 'preserves a two-node cycle', body: 'const a = {}; const b = { a }; a.b = b; const out = decode(JSON.parse(JSON.stringify(encode(a)))); expect(out.b.a).toBe(out);' },
      { name: 'preserves shared references', body: 'const shared = { n: 1 }; const out = decode(JSON.parse(JSON.stringify(encode({ x: shared, y: shared })))); expect(out.x).toBe(out.y);' },
      { name: 'shared references are not merely equal', body: 'const shared = { n: 1 }; const out = decode(JSON.parse(JSON.stringify(encode({ x: shared, y: shared })))); out.x.n = 99; expect(out.y.n).toBe(99);' },
      { name: 'a cycle through an array', body: 'const xs = [1]; xs.push(xs); const out = decode(JSON.parse(JSON.stringify(encode(xs)))); expect(out[1]).toBe(out);' },
      { name: 'a cycle through a Map', body: 'const m = new Map(); m.set("self", m); const out = decode(JSON.parse(JSON.stringify(encode(m)))); expect(out.get("self")).toBe(out);' },
      { name: 'JSON.stringify does not throw on the encoded form', body: 'const o = {}; o.self = o; expect(() => JSON.stringify(encode(o))).not.toThrow();' },
      { name: 'round-trips a primitive at the top level', body: 'expect(decode(JSON.parse(JSON.stringify(encode(42))))).toBe(42); expect(decode(JSON.parse(JSON.stringify(encode("s"))))).toBe("s");', hidden: true },
      { name: 'a Map with object keys survives', body: 'const key = { id: 1 }; const m = new Map([[key, "v"]]); const out = decode(JSON.parse(JSON.stringify(encode(m)))); expect([...out.keys()][0]).toEqual({ id: 1 }); expect(out.get([...out.keys()][0])).toBe("v");', hidden: true },
    ],
    hints: [
      'Give every object, array, `Map`, `Set` and `Date` an index in a flat list, and replace every reference to one with a marker holding that index. Cycles and sharing then both become ordinary index references.',
      'Encode in two passes conceptually: assign an index the first time you meet an object (before descending into it, so a cycle finds it), then encode its contents.',
      'Decode in two passes for the same reason: create every empty container first, then fill them in. That way a reference to a container can always be resolved, even one that points forward or back to itself.',
    ],
    solution:
      'const REF = "$ref";\n' +
      '\n' +
      'function encode(value) {\n' +
      '  const slots = [];\n' +
      '  const indexOf = new Map();\n' +
      '\n' +
      '  function ref(v) {\n' +
      '    if (typeof v === "number") {\n' +
      '      if (Number.isNaN(v)) return { [REF]: "nan" };\n' +
      '      if (v === Infinity) return { [REF]: "inf" };\n' +
      '      if (v === -Infinity) return { [REF]: "-inf" };\n' +
      '      return v;\n' +
      '    }\n' +
      '    if (v === undefined) return { [REF]: "undef" };\n' +
      '    if (v === null || typeof v !== "object") return v;\n' +
      '\n' +
      '    if (indexOf.has(v)) return { [REF]: indexOf.get(v) };\n' +
      '    const index = slots.length;\n' +
      '    indexOf.set(v, index);\n' +
      '    slots.push(null);\n' +
      '\n' +
      '    if (v instanceof Date) slots[index] = { t: "date", v: v.getTime() };\n' +
      '    else if (v instanceof Map) slots[index] = { t: "map", v: [...v].map(([k, val]) => [ref(k), ref(val)]) };\n' +
      '    else if (v instanceof Set) slots[index] = { t: "set", v: [...v].map(ref) };\n' +
      '    else if (Array.isArray(v)) slots[index] = { t: "arr", v: v.map(ref) };\n' +
      '    else {\n' +
      '      const entries = {};\n' +
      '      for (const k of Object.keys(v)) entries[k] = ref(v[k]);\n' +
      '      slots[index] = { t: "obj", v: entries };\n' +
      '    }\n' +
      '    return { [REF]: index };\n' +
      '  }\n' +
      '\n' +
      '  return { root: ref(value), slots };\n' +
      '}\n' +
      '\n' +
      'function decode(encoded) {\n' +
      '  const { root, slots } = encoded;\n' +
      '  const built = slots.map((slot) => {\n' +
      '    if (slot.t === "date") return new Date(slot.v);\n' +
      '    if (slot.t === "map") return new Map();\n' +
      '    if (slot.t === "set") return new Set();\n' +
      '    if (slot.t === "arr") return [];\n' +
      '    return {};\n' +
      '  });\n' +
      '\n' +
      '  function deref(v) {\n' +
      '    if (v === null || typeof v !== "object") return v;\n' +
      '    const marker = v[REF];\n' +
      '    if (marker === "undef") return undefined;\n' +
      '    if (marker === "nan") return NaN;\n' +
      '    if (marker === "inf") return Infinity;\n' +
      '    if (marker === "-inf") return -Infinity;\n' +
      '    return built[marker];\n' +
      '  }\n' +
      '\n' +
      '  slots.forEach((slot, i) => {\n' +
      '    const target = built[i];\n' +
      '    if (slot.t === "map") for (const [k, val] of slot.v) target.set(deref(k), deref(val));\n' +
      '    else if (slot.t === "set") for (const val of slot.v) target.add(deref(val));\n' +
      '    else if (slot.t === "arr") for (const val of slot.v) target.push(deref(val));\n' +
      '    else if (slot.t === "obj") for (const k of Object.keys(slot.v)) target[k] = deref(slot.v[k]);\n' +
      '  });\n' +
      '\n' +
      '  return deref(root);\n' +
      '}\n',
    solutionExplanation:
      'The central move is flattening the object graph into a numbered table and replacing every reference with an index. Once that is done, a cycle stops being special — it is just a slot referring to its own index — and sharing is preserved for the same reason, because two properties encoding the same object both emit the same number. A tree-shaped serialiser like `JSON.stringify` cannot express either, which is why it throws on the first and silently duplicates on the second.\n\nThe ordering in both directions is what makes it work. When encoding, the index is reserved and recorded *before* the object\'s contents are walked; otherwise a self-reference encountered during that walk would not find an existing index and would recurse forever. When decoding, every container is created empty *before* any of them is filled; otherwise a reference to a slot that has not been built yet — which any cycle guarantees — could not be resolved.\n\nThe primitive markers exist because JSON has no way to express them: `undefined` is dropped from objects entirely, and `NaN` and both infinities become `null`. Encoding them as tagged objects is what lets them survive, and it is a reminder of how much JSON quietly loses. This is essentially what the structured clone algorithm does natively — `structuredClone` handles all of this, including cycles and sharing — so the reason to write it by hand is to be able to send such a graph over a wire or into storage, where only text can go.',
  },
];

export default challenges;
