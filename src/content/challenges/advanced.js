import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Iterators & Metaprogramming';

export const challenges = [
  {
    id: 'ch-adv-take',
    slug: 'taking-from-an-infinite-sequence',
    title: 'Taking from an Infinite Sequence',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['iterators', 'functional', 'functions'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `take(iterable, n)` returning an array of the first `n` values. It must work on an **infinite** sequence, which means it can never consume the whole thing — it must stop pulling as soon as it has enough. Also write `naturals()`, an infinite generator yielding 0, 1, 2, … so the two can be used together. `take` with an `n` of 0 or less returns an empty array without pulling anything at all.',
    examples: [
      'take(naturals(), 5);        // [0, 1, 2, 3, 4]',
      'take([10, 20], 5);          // [10, 20] — stops when the source runs out',
    ],
    constraints: ['`take` must not run forever on an infinite source.', 'A source shorter than `n` yields everything it has.', '`take(source, 0)` pulls no values.', 'Note: leaving a `for...of` early closes the iterator, so a generator passed to `take` is finished afterwards.'],
    starterCode: 'function* naturals() {\n  // Your code here\n}\n\nfunction take(iterable, n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'takes from an infinite generator', body: 'expect(take(naturals(), 5)).toEqual([0, 1, 2, 3, 4]);' },
      { name: 'naturals starts at zero', body: 'expect(take(naturals(), 1)).toEqual([0]);' },
      { name: 'takes from an array', body: 'expect(take([10, 20, 30], 2)).toEqual([10, 20]);' },
      { name: 'a short source yields everything', body: 'expect(take([10, 20], 5)).toEqual([10, 20]);' },
      { name: 'an empty source yields nothing', body: 'expect(take([], 5)).toEqual([]);' },
      { name: 'taking zero yields nothing', body: 'expect(take(naturals(), 0)).toEqual([]);' },
      { name: 'a negative count yields nothing', body: 'expect(take(naturals(), -3)).toEqual([]);' },
      { name: 'works with a string', body: 'expect(take("hello", 3)).toEqual(["h", "e", "l"]);' },
      { name: 'works with a Set', body: 'expect(take(new Set([1, 2, 3]), 2)).toEqual([1, 2]);' },
      {
        name: 'pulls exactly n values and no more',
        body:
          'let pulled = 0;\n' +
          'function* counted() { for (;;) { pulled += 1; yield pulled; } }\n' +
          'take(counted(), 3);\n' +
          'expect(pulled).toBe(3);',
      },
      {
        name: 'pulls nothing when taking zero',
        body:
          'let pulled = 0;\n' +
          'function* counted() { for (;;) { pulled += 1; yield pulled; } }\n' +
          'take(counted(), 0);\n' +
          'expect(pulled).toBe(0);',
      },
      { name: 'takes a large slice of an infinite source', body: 'expect(take(naturals(), 10000).length).toBe(10000);', hidden: true },
      { name: 'breaking out of the loop closes the source generator', body: 'const gen = naturals(); expect(take(gen, 2)).toEqual([0, 1]); expect(take(gen, 2)).toEqual([]);', hidden: true },
      { name: 'a source consumed exactly to its end is also finished', body: 'const gen = naturals(); take(gen, 3); expect(gen.next().done).toBe(true);', hidden: true },
    ],
    hints: [
      'A `for...of` loop with a `break` stops pulling — that is the whole mechanism, and it is why it works on an infinite source.',
      'Do not spread the iterable into an array first. Spreading asks for every value, which never returns for an infinite sequence.',
      'Guard the zero case before the loop, since `for...of` pulls its first value before the body ever runs.',
    ],
    solution:
      'function* naturals() {\n' +
      '  let n = 0;\n' +
      '  for (;;) {\n' +
      '    yield n;\n' +
      '    n += 1;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function take(iterable, n) {\n' +
      '  const out = [];\n' +
      '  if (n <= 0) return out;\n' +
      '  for (const value of iterable) {\n' +
      '    out.push(value);\n' +
      '    if (out.length === n) break;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Laziness is what makes an infinite sequence usable at all: a generator computes nothing until asked, and `for...of` asks for one value at a time. The `break` is not merely an optimisation — it is the only reason this terminates, and it is why `[...naturals()]` would hang forever where this returns instantly. The zero guard is necessary rather than defensive: `for...of` pulls its first value before running the body, so without it `take(source, 0)` would still advance the generator once, which the pull-counting test detects.\n\nThe hidden tests pin down a consequence that surprises almost everyone: leaving a `for...of` early does not merely stop reading, it calls the iterator\'s `return()` method and **closes** the generator for good. So `take(gen, 2)` twice on one generator gives `[0, 1]` and then `[]`, not `[0, 1]` and `[2, 3]`. That cleanup is a feature — it is what lets a generator run its `finally` block to release a file handle or a connection when a consumer walks away — but it means `take` consumes its source rather than borrowing from it. Driving the iterator by hand with `.next()` instead of `for...of` would leave it open.',
  },

  {
    id: 'ch-adv-lazy-pipeline',
    slug: 'a-lazy-transformation-pipeline',
    title: 'A Lazy Transformation Pipeline',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['iterators', 'functional', 'performance'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Chaining `map` and `filter` on an array builds a full intermediate array at every step. Write generator-based `lazyMap(iterable, fn)` and `lazyFilter(iterable, predicate)` that yield values one at a time, so a chain of them processes each element through the whole pipeline before touching the next — and never builds an intermediate array. Then write `toArray(iterable)`. The chain must work on an infinite source when the consumer stops early.',
    examples: [
      'const pipeline = lazyFilter(lazyMap(naturals, (n) => n * 2), (n) => n % 3 === 0);\n// nothing has run yet — pulling one value runs one element through both stages',
    ],
    constraints: ['`lazyMap` and `lazyFilter` are generators — they do no work until pulled.', 'No intermediate arrays.', 'A chain over an infinite source works when the consumer stops.'],
    starterCode: 'function* lazyMap(iterable, fn) {\n  // Your code here\n}\n\nfunction* lazyFilter(iterable, predicate) {\n  // Your code here\n}\n\nfunction toArray(iterable) {\n  // Your code here\n}\n',
    tests: [
      { name: 'maps values', body: 'expect(toArray(lazyMap([1, 2, 3], (n) => n * 2))).toEqual([2, 4, 6]);' },
      { name: 'filters values', body: 'expect(toArray(lazyFilter([1, 2, 3, 4], (n) => n % 2 === 0))).toEqual([2, 4]);' },
      { name: 'chains map and filter', body: 'expect(toArray(lazyFilter(lazyMap([1, 2, 3, 4], (n) => n * 10), (n) => n > 15))).toEqual([20, 30, 40]);' },
      { name: 'toArray collects everything', body: 'expect(toArray([1, 2])).toEqual([1, 2]);' },
      { name: 'handles an empty source', body: 'expect(toArray(lazyMap([], (n) => n))).toEqual([]);' },
      { name: 'a filter matching nothing yields nothing', body: 'expect(toArray(lazyFilter([1, 2], () => false))).toEqual([]);' },
      { name: 'map passes the index', body: 'expect(toArray(lazyMap(["a", "b"], (v, i) => v + i))).toEqual(["a0", "b1"]);' },
      { name: 'filter passes the index', body: 'expect(toArray(lazyFilter([10, 20, 30], (v, i) => i > 0))).toEqual([20, 30]);' },
      {
        name: 'does no work until pulled',
        body:
          'let calls = 0;\n' +
          'const pipeline = lazyMap([1, 2, 3], (n) => { calls += 1; return n; });\n' +
          'expect(calls).toBe(0);\n' +
          'toArray(pipeline);\n' +
          'expect(calls).toBe(3);',
      },
      {
        name: 'processes one element through the whole chain at a time',
        body:
          'const order = [];\n' +
          'const pipeline = lazyFilter(\n' +
          '  lazyMap([1, 2], (n) => { order.push("map " + n); return n; }),\n' +
          '  (n) => { order.push("filter " + n); return true; },\n' +
          ');\n' +
          'toArray(pipeline);\n' +
          'expect(order).toEqual(["map 1", "filter 1", "map 2", "filter 2"]);',
      },
      {
        name: 'works over an infinite source when the consumer stops',
        body:
          'function* naturals() { let n = 0; for (;;) { yield n; n += 1; } }\n' +
          'const pipeline = lazyFilter(lazyMap(naturals(), (n) => n * 2), (n) => n % 3 === 0);\n' +
          'const out = [];\n' +
          'for (const value of pipeline) { out.push(value); if (out.length === 4) break; }\n' +
          'expect(out).toEqual([0, 6, 12, 18]);',
      },
      {
        name: 'stops calling the callbacks once the consumer stops',
        body:
          'let calls = 0;\n' +
          'function* naturals() { let n = 0; for (;;) { yield n; n += 1; } }\n' +
          'const pipeline = lazyMap(naturals(), (n) => { calls += 1; return n; });\n' +
          'for (const value of pipeline) { if (value === 4) break; }\n' +
          'expect(calls).toBe(5);',
        hidden: true,
      },
      { name: 'chains three stages', body: 'expect(toArray(lazyMap(lazyFilter(lazyMap([1, 2, 3, 4], (n) => n + 1), (n) => n % 2 === 0), (n) => n * 100))).toEqual([200, 400]);', hidden: true },
    ],
    hints: [
      'A generator function returns immediately; its body does not run until the first value is pulled. That is where the laziness comes from.',
      '`lazyMap` is a `for...of` over the source with a single `yield` inside. `lazyFilter` is the same with the `yield` behind an `if`.',
      'Track the index yourself with a counter, since `for...of` does not provide one.',
    ],
    solution:
      'function* lazyMap(iterable, fn) {\n' +
      '  let i = 0;\n' +
      '  for (const value of iterable) {\n' +
      '    yield fn(value, i);\n' +
      '    i += 1;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function* lazyFilter(iterable, predicate) {\n' +
      '  let i = 0;\n' +
      '  for (const value of iterable) {\n' +
      '    if (predicate(value, i)) yield value;\n' +
      '    i += 1;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function toArray(iterable) {\n' +
      '  const out = [];\n' +
      '  for (const value of iterable) out.push(value);\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Each `yield` hands one value to the consumer and suspends, so a chain of these generators inverts the usual execution order: instead of stage one finishing the entire array before stage two begins, one element travels through every stage before the next is fetched. The interleaving test makes that visible — `map 1, filter 1, map 2, filter 2`, not `map 1, map 2, filter 1, filter 2`. Two consequences follow. No intermediate array exists at any point, which matters when the data is large. And the pipeline works over an infinite source, because the source is only advanced as far as the consumer actually asks — the hidden test confirms exactly five calls when the consumer breaks at the fifth value. That is precisely the model behind the newer iterator helper methods.',
  },

  {
    id: 'ch-adv-tree-generator',
    slug: 'walking-a-tree-with-yield-star',
    title: 'Walking a Tree with yield*',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['iterators', 'recursion', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write a generator `walk(node)` yielding every value in a tree of `{ value, children }` nodes in depth-first pre-order. Because it is a generator, a consumer can stop partway and the rest of the tree is never visited. Also write `findFirst(node, predicate)` returning the first matching value — or `undefined` — which should stop searching the moment it finds one.',
    examples: [
      '[...walk(tree)];                         // every value, parents before children',
      'findFirst(tree, (v) => v > 10);          // stops as soon as it finds one',
    ],
    constraints: ['Pre-order: a node\'s value comes before its descendants\'.', '`children` may be missing or empty.', '`findFirst` must not visit nodes after the match.'],
    starterCode: 'function* walk(node) {\n  // Your code here\n}\n\nfunction findFirst(node, predicate) {\n  // Your code here\n}\n',
    tests: [
      { name: 'yields a single node', body: 'expect([...walk({ value: 1 })]).toEqual([1]);' },
      { name: 'yields children after the parent', body: 'expect([...walk({ value: 1, children: [{ value: 2 }] })]).toEqual([1, 2]);' },
      {
        name: 'is depth-first pre-order',
        body:
          'const tree = { value: 1, children: [{ value: 2, children: [{ value: 3 }] }, { value: 4 }] };\n' +
          'expect([...walk(tree)]).toEqual([1, 2, 3, 4]);',
      },
      { name: 'handles an empty children array', body: 'expect([...walk({ value: 1, children: [] })]).toEqual([1]);' },
      { name: 'handles several levels', body: 'expect([...walk({ value: 1, children: [{ value: 2, children: [{ value: 3, children: [{ value: 4 }] }] }] })]).toEqual([1, 2, 3, 4]);' },
      { name: 'works with for...of', body: 'const out = []; for (const v of walk({ value: 1, children: [{ value: 2 }] })) out.push(v); expect(out).toEqual([1, 2]);' },
      { name: 'findFirst finds a match', body: 'expect(findFirst({ value: 1, children: [{ value: 9 }] }, (v) => v > 5)).toBe(9);' },
      { name: 'findFirst returns undefined for no match', body: 'expect(findFirst({ value: 1 }, (v) => v > 5)).toBe(undefined);' },
      { name: 'findFirst can match the root', body: 'expect(findFirst({ value: 9, children: [{ value: 1 }] }, (v) => v > 5)).toBe(9);' },
      { name: 'findFirst returns the first in pre-order', body: 'expect(findFirst({ value: 1, children: [{ value: 7 }, { value: 8 }] }, (v) => v > 5)).toBe(7);' },
      {
        name: 'findFirst stops at the match',
        body:
          'let visited = 0;\n' +
          'const tree = { value: 1, children: [{ value: 2 }, { value: 3 }, { value: 4 }] };\n' +
          'findFirst(tree, (v) => { visited += 1; return v === 2; });\n' +
          'expect(visited).toBe(2);',
      },
      {
        name: 'breaking out of walk stops the traversal',
        body:
          'let visited = 0;\n' +
          'function* counted(node) { visited += 1; yield node.value; for (const c of node.children ?? []) yield* counted(c); }\n' +
          'const tree = { value: 1, children: [{ value: 2 }, { value: 3 }] };\n' +
          'for (const v of counted(tree)) { if (v === 2) break; }\n' +
          'expect(visited).toBe(2);',
      },
      { name: 'findFirst matches a falsy value correctly', body: 'expect(findFirst({ value: 1, children: [{ value: 0 }] }, (v) => v === 0)).toBe(0);', hidden: true },
      { name: 'handles a deep tree', body: 'let tree = { value: 200 }; for (let i = 199; i >= 1; i -= 1) tree = { value: i, children: [tree] }; expect([...walk(tree)].length).toBe(200);', hidden: true },
    ],
    hints: [
      '`yield*` delegates to another iterable, yielding everything it produces. That turns a recursive traversal into one line.',
      'Yield the node\'s own value before delegating into the children — that is what makes it pre-order.',
      'For `findFirst`, loop over `walk(node)` and `return` on the first match. Returning from a `for...of` closes the generator, which is what stops the traversal.',
    ],
    solution:
      'function* walk(node) {\n' +
      '  yield node.value;\n' +
      '  for (const child of node.children ?? []) {\n' +
      '    yield* walk(child);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function findFirst(node, predicate) {\n' +
      '  for (const value of walk(node)) {\n' +
      '    if (predicate(value)) return value;\n' +
      '  }\n' +
      '  return undefined;\n' +
      '}\n',
    solutionExplanation:
      '`yield*` is what makes recursive traversal readable: it delegates to the inner generator and forwards every value outward, so the four-line `walk` handles arbitrary depth without any manual stack. Separating traversal from the decision about what to do with each value is the real design win — `findFirst` contains no tree logic at all, and any other consumer (count, collect, take the first three) reuses the same walk. The early stop works because leaving a `for...of` — by `return` or `break` — calls the iterator\'s `return()` method, which finishes the generator where it is suspended. That is why the visit-counting tests see exactly two nodes rather than the whole tree, and it is a property an eager `collectAll` function could not offer.',
  },

  {
    id: 'ch-adv-async-iterator',
    slug: 'paging-through-an-async-source',
    title: 'Paging Through an Async Source',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['iterators', 'async-await', 'http'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'A paginated API is naturally a stream of items, but callers should not have to know about pages. Write an async generator `paginate(fetchPage)` where `fetchPage(cursor)` resolves to `{ items, nextCursor }` and a `nextCursor` of `null` means the end. It should yield individual items so a caller can write `for await (const item of paginate(fetchPage))`. Fetch a page only when its first item is actually needed — a consumer that stops after three items must not have fetched page two.',
    examples: [
      'for await (const user of paginate(fetchUsers)) {\n  if (user.name === target) break;   // later pages never fetched\n}',
    ],
    constraints: ['Yield items, not pages.', 'A page is fetched only when needed.', 'A `nextCursor` of `null` ends the sequence.'],
    starterCode: 'async function* paginate(fetchPage) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'yields the items of a single page',
        body:
          'const fetchPage = async () => ({ items: [1, 2, 3], nextCursor: null });\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(out).toEqual([1, 2, 3]);',
      },
      {
        name: 'follows the cursor across pages',
        body:
          'const pages = { start: { items: [1, 2], nextCursor: "b" }, b: { items: [3], nextCursor: null } };\n' +
          'const fetchPage = async (cursor) => pages[cursor ?? "start"];\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(out).toEqual([1, 2, 3]);',
      },
      {
        name: 'starts with an undefined cursor',
        body:
          'let firstCursor = "unset";\n' +
          'const fetchPage = async (cursor) => { if (firstCursor === "unset") firstCursor = cursor; return { items: [], nextCursor: null }; };\n' +
          'for await (const item of paginate(fetchPage)) { /* drain */ }\n' +
          'expect(firstCursor).toBe(undefined);',
      },
      {
        name: 'handles an empty first page',
        body:
          'const fetchPage = async () => ({ items: [], nextCursor: null });\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(out).toEqual([]);',
      },
      {
        name: 'skips an empty page in the middle',
        body:
          'const pages = { start: { items: [1], nextCursor: "b" }, b: { items: [], nextCursor: "c" }, c: { items: [2], nextCursor: null } };\n' +
          'const fetchPage = async (cursor) => pages[cursor ?? "start"];\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(out).toEqual([1, 2]);',
      },
      {
        name: 'fetches a page only when needed',
        body:
          'let fetched = 0;\n' +
          'const pages = { start: { items: [1, 2, 3], nextCursor: "b" }, b: { items: [4], nextCursor: null } };\n' +
          'const fetchPage = async (cursor) => { fetched += 1; return pages[cursor ?? "start"]; };\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) { out.push(item); if (out.length === 3) break; }\n' +
          'expect(fetched).toBe(1);',
      },
      {
        name: 'fetches nothing until the first pull',
        body:
          'let fetched = 0;\n' +
          'const fetchPage = async () => { fetched += 1; return { items: [], nextCursor: null }; };\n' +
          'paginate(fetchPage);\n' +
          'await new Promise((r) => setTimeout(r, 5));\n' +
          'expect(fetched).toBe(0);',
      },
      {
        name: 'fetches every page when fully drained',
        body:
          'let fetched = 0;\n' +
          'const pages = { start: { items: [1], nextCursor: "b" }, b: { items: [2], nextCursor: "c" }, c: { items: [3], nextCursor: null } };\n' +
          'const fetchPage = async (cursor) => { fetched += 1; return pages[cursor ?? "start"]; };\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(fetched).toBe(3);\n' +
          'expect(out).toEqual([1, 2, 3]);',
      },
      {
        name: 'lets a fetch error propagate',
        body:
          'const fetchPage = async () => { throw new Error("network"); };\n' +
          'let e = null;\n' +
          'try { for await (const item of paginate(fetchPage)) { /* drain */ } } catch (err) { e = err; }\n' +
          'expect(e.message).toBe("network");',
      },
      {
        name: 'handles many pages',
        body:
          'const fetchPage = async (cursor) => {\n' +
          '  const page = cursor ?? 0;\n' +
          '  return { items: [page], nextCursor: page < 49 ? page + 1 : null };\n' +
          '};\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) out.push(item);\n' +
          'expect(out.length).toBe(50);\n' +
          'expect(out[49]).toBe(49);',
        hidden: true,
      },
      {
        name: 'stopping mid-page fetches no further pages',
        body:
          'let fetched = 0;\n' +
          'const fetchPage = async (cursor) => { fetched += 1; const p = cursor ?? 0; return { items: [p * 2, p * 2 + 1], nextCursor: p + 1 }; };\n' +
          'const out = [];\n' +
          'for await (const item of paginate(fetchPage)) { out.push(item); if (out.length === 1) break; }\n' +
          'expect(fetched).toBe(1);',
        hidden: true,
      },
    ],
    hints: [
      'An `async function*` combines both protocols: it can `await` inside and `yield` out, and `for await...of` drives it.',
      'Loop while there is more to fetch, awaiting the page and then yielding each of its items in turn.',
      'The laziness is automatic — the generator suspends at each `yield`, so the next page is not requested until the consumer asks for an item beyond the current one.',
    ],
    solution:
      'async function* paginate(fetchPage) {\n' +
      '  let cursor;\n' +
      '  for (;;) {\n' +
      '    const page = await fetchPage(cursor);\n' +
      '    for (const item of page.items) yield item;\n' +
      '    if (page.nextCursor === null || page.nextCursor === undefined) return;\n' +
      '    cursor = page.nextCursor;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'An async generator hides pagination completely: the caller writes an ordinary `for await` loop over items and never sees a cursor. The laziness needs no explicit machinery — the generator suspends at each `yield`, so the loop only reaches the next `await fetchPage` when the consumer has consumed every item of the current page and asked for one more. That is why breaking after three items of a three-item page fetches exactly one page. Yielding items individually rather than yielding pages is what makes the abstraction worth having; a consumer that wants pages can always regroup, but one that wants items should not have to flatten. Errors need no handling at all: a rejected `await` propagates out of the generator and surfaces at the consumer\'s `for await`, exactly where it can be dealt with.',
  },

  {
    id: 'ch-adv-proxy-validate',
    slug: 'a-validating-proxy',
    title: 'A Validating Proxy',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'objects', 'errors'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `validated(target, rules)` returning a `Proxy` that enforces rules on writes. `rules` maps a property name to a predicate; assigning a value the predicate rejects throws a `TypeError` and leaves the object unchanged. Writing a property with no rule is allowed. Reading is unaffected. Reading a property that does not exist throws a `TypeError` too — catching a typo at the moment it happens rather than letting `undefined` travel through the program.',
    examples: [
      'const user = validated({ age: 30 }, { age: (v) => Number.isInteger(v) && v >= 0 });\nuser.age = 31;    // fine\nuser.age = -1;    // throws TypeError\nuser.nmae;        // throws TypeError — typo caught immediately',
    ],
    constraints: ['A rejected write leaves the target unchanged.', 'Reading a missing property throws a `TypeError`.', 'Properties with no rule are writable without checks.'],
    starterCode: 'function validated(target, rules) {\n  // Your code here\n}\n',
    tests: [
      { name: 'reads an existing property', body: 'expect(validated({ a: 1 }, {}).a).toBe(1);' },
      { name: 'allows a valid write', body: 'const o = validated({ age: 30 }, { age: (v) => v >= 0 }); o.age = 31; expect(o.age).toBe(31);' },
      { name: 'rejects an invalid write', body: 'const o = validated({ age: 30 }, { age: (v) => v >= 0 }); expect(() => { o.age = -1; }).toThrow(TypeError);' },
      { name: 'a rejected write leaves the value unchanged', body: 'const o = validated({ age: 30 }, { age: (v) => v >= 0 }); try { o.age = -1; } catch { /* expected */ } expect(o.age).toBe(30);' },
      { name: 'allows writing an unruled property', body: 'const o = validated({ a: 1 }, { b: () => false }); o.a = 2; expect(o.a).toBe(2);' },
      { name: 'throws on reading a missing property', body: 'expect(() => validated({ a: 1 }, {}).nope).toThrow(TypeError);' },
      { name: 'a property holding undefined still reads', body: 'expect(validated({ a: undefined }, {}).a).toBe(undefined);' },
      { name: 'a property holding a falsy value reads normally', body: 'const o = validated({ a: 0, b: "" }, {}); expect(o.a).toBe(0); expect(o.b).toBe("");' },
      { name: 'a new property can be added and then read', body: 'const o = validated({}, {}); o.fresh = 1; expect(o.fresh).toBe(1);' },
      { name: 'the rule runs on a newly added property too', body: 'const o = validated({}, { n: (v) => typeof v === "number" }); expect(() => { o.n = "text"; }).toThrow(TypeError);' },
      { name: 'the underlying object is updated', body: 'const target = { a: 1 }; const o = validated(target, {}); o.a = 2; expect(target.a).toBe(2);' },
      { name: 'several rules are enforced independently', body: 'const o = validated({ a: 1, b: 1 }, { a: (v) => v > 0, b: (v) => v < 0 }); o.a = 5; expect(() => { o.b = 5; }).toThrow(TypeError); expect(o.a).toBe(5);' },
      { name: 'symbol reads do not throw', body: 'const o = validated({ a: 1 }, {}); expect(() => o[Symbol.toPrimitive]).not.toThrow();', hidden: true },
      { name: 'the proxy still reports its keys', body: 'const o = validated({ a: 1, b: 2 }, {}); expect(Object.keys(o).sort()).toEqual(["a", "b"]);', hidden: true },
    ],
    hints: [
      'A `Proxy` takes a target and a handler object whose methods intercept operations. You need `get` and `set`.',
      'Use `Reflect.get` and `Reflect.set` to perform the default behaviour, rather than reaching into the target directly — `Reflect` mirrors the trap signatures exactly.',
      'The `set` trap must return `true` on success, or strict mode throws. And be careful with symbol keys in `get`: internal lookups probe for things like `Symbol.toPrimitive`, so a blanket "missing property" throw would break ordinary operations.',
    ],
    solution:
      'function validated(target, rules) {\n' +
      '  return new Proxy(target, {\n' +
      '    get(object, property, receiver) {\n' +
      '      if (typeof property === "symbol" || property in object) {\n' +
      '        return Reflect.get(object, property, receiver);\n' +
      '      }\n' +
      '      throw new TypeError("no such property: " + String(property));\n' +
      '    },\n' +
      '    set(object, property, value, receiver) {\n' +
      '      const rule = rules[property];\n' +
      '      if (rule && !rule(value)) {\n' +
      '        throw new TypeError("invalid value for " + String(property) + ": " + String(value));\n' +
      '      }\n' +
      '      return Reflect.set(object, property, value, receiver);\n' +
      '    },\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'A `Proxy` intercepts fundamental operations, which is what lets validation live with the data rather than at every call site. Two details separate a working proxy from a subtly broken one. The `set` trap must return `true` — returning nothing means "the write failed", and strict mode turns that into a `TypeError` even when the value was stored. And the `get` trap must let symbol keys through: JavaScript internally probes objects for `Symbol.toPrimitive`, `Symbol.iterator` and `Symbol.toStringTag`, so a blanket throw on unknown properties would make the object explode during string conversion or logging. Using `Reflect.get`/`Reflect.set` rather than `object[property]` matters because the `Reflect` methods take the same arguments as the traps, including the receiver, which keeps inherited getters and setters behaving correctly.',
  },

  {
    id: 'ch-adv-proxy-negative-index',
    slug: 'negative-array-indices',
    title: 'Negative Array Indices',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'arrays', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Some languages let `list[-1]` mean the last element. Write `wrapIndex(array)` returning a `Proxy` that adds that behaviour: a negative numeric index counts back from the end, while everything else — positive indices, `length`, `map`, `push` — behaves exactly as normal. A negative index beyond the start reads as `undefined`. Reads only; writes are out of scope.',
    examples: [
      'const xs = wrapIndex([10, 20, 30]);\nxs[0];    // 10\nxs[-1];   // 30\nxs.length // 3\nxs.map((n) => n * 2);  // [20, 40, 60]',
    ],
    constraints: ['Only negative numeric indices are special.', 'Methods and `length` work unchanged.', 'An out-of-range negative index reads as `undefined`.'],
    starterCode: 'function wrapIndex(array) {\n  // Your code here\n}\n',
    tests: [
      { name: 'positive indices are unchanged', body: 'const xs = wrapIndex([10, 20, 30]); expect(xs[0]).toBe(10); expect(xs[2]).toBe(30);' },
      { name: 'minus one is the last element', body: 'expect(wrapIndex([10, 20, 30])[-1]).toBe(30);' },
      { name: 'minus two is the second to last', body: 'expect(wrapIndex([10, 20, 30])[-2]).toBe(20);' },
      { name: 'a negative index reaching the start', body: 'expect(wrapIndex([10, 20, 30])[-3]).toBe(10);' },
      { name: 'a negative index past the start is undefined', body: 'expect(wrapIndex([10, 20, 30])[-4]).toBe(undefined);' },
      { name: 'a positive index past the end is undefined', body: 'expect(wrapIndex([10])[5]).toBe(undefined);' },
      { name: 'length works', body: 'expect(wrapIndex([1, 2, 3]).length).toBe(3);' },
      { name: 'methods work', body: 'expect(wrapIndex([1, 2, 3]).map((n) => n * 2)).toEqual([2, 4, 6]);' },
      { name: 'join works', body: 'expect(wrapIndex(["a", "b"]).join("-")).toBe("a-b");' },
      { name: 'iteration works', body: 'const out = []; for (const n of wrapIndex([1, 2])) out.push(n); expect(out).toEqual([1, 2]);' },
      { name: 'spread works', body: 'expect([...wrapIndex([1, 2])]).toEqual([1, 2]);' },
      { name: 'an empty array has no last element', body: 'expect(wrapIndex([])[-1]).toBe(undefined);' },
      { name: 'a string key that is not an index is unaffected', body: 'expect(typeof wrapIndex([1]).slice).toBe("function");', hidden: true },
      { name: 'it is still an array', body: 'expect(Array.isArray(wrapIndex([1, 2]))).toBe(true);', hidden: true },
    ],
    hints: [
      'Property keys arrive at the `get` trap as strings, so `xs[-1]` gives you the string `"-1"`, not the number.',
      'Convert with `Number(property)` and check `Number.isInteger(n) && n < 0` before treating it specially.',
      'For everything else, delegate to `Reflect.get` so `length`, methods and iteration keep working untouched.',
    ],
    solution:
      'function wrapIndex(array) {\n' +
      '  return new Proxy(array, {\n' +
      '    get(target, property, receiver) {\n' +
      '      if (typeof property === "string") {\n' +
      '        const index = Number(property);\n' +
      '        if (Number.isInteger(index) && index < 0) {\n' +
      '          return target[target.length + index];\n' +
      '        }\n' +
      '      }\n' +
      '      return Reflect.get(target, property, receiver);\n' +
      '    },\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'The detail that trips people up is that property keys are always strings or symbols — `xs[-1]` reaches the trap as `"-1"`, so the conversion and the integer check both have to be explicit. `Number("length")` is `NaN` and `Number("map")` is `NaN`, so `Number.isInteger` rejects them and they fall through to the default path; that single guard is what keeps every array method, `length`, and iteration working. Delegating everything else to `Reflect.get` rather than reimplementing it is what makes the proxy transparent, and it is why `Array.isArray` still returns true — a proxy reports the target\'s internal nature. The real `Array.prototype.at()` method does the same job without a proxy and is what you would reach for in practice; building it this way is how you learn what a trap actually sees.',
  },

  {
    id: 'ch-adv-default-map',
    slug: 'a-map-with-defaults',
    title: 'A Map with Defaults',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'data-structures', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Accumulating into a map means writing "create the entry if missing" at every call site. Write `defaultMap(createDefault)` returning an object with `get(key)`, `set(key, value)`, `has(key)`, `delete(key)`, `size` and `entries()`, where `get` on an unknown key **creates** the default, stores it, and returns it — so `map.get(k).push(v)` just works. `createDefault(key)` receives the key. `has` must report the truth and must not create anything.',
    examples: [
      'const groups = defaultMap(() => []);\ngroups.get("a").push(1);\ngroups.get("a").push(2);\ngroups.get("a");    // [1, 2]\ngroups.has("b");    // false — has does not create',
    ],
    constraints: ['`get` creates and stores the default for an unknown key.', '`has` never creates.', '`createDefault` is called with the key and once per key.'],
    starterCode: 'function defaultMap(createDefault) {\n  // Your code here\n}\n',
    tests: [
      { name: 'creates a default on first get', body: 'const m = defaultMap(() => []); expect(m.get("a")).toEqual([]);' },
      { name: 'the created default is stored', body: 'const m = defaultMap(() => []); m.get("a").push(1); expect(m.get("a")).toEqual([1]);' },
      { name: 'accumulates across calls', body: 'const m = defaultMap(() => []); m.get("a").push(1); m.get("a").push(2); expect(m.get("a")).toEqual([1, 2]);' },
      { name: 'returns the same object each time', body: 'const m = defaultMap(() => []); expect(m.get("a")).toBe(m.get("a"));' },
      { name: 'calls the factory once per key', body: 'let calls = 0; const m = defaultMap(() => { calls += 1; return []; }); m.get("a"); m.get("a"); m.get("b"); expect(calls).toBe(2);' },
      { name: 'passes the key to the factory', body: 'const m = defaultMap((key) => "default for " + key); expect(m.get("x")).toBe("default for x");' },
      { name: 'has does not create', body: 'const m = defaultMap(() => []); expect(m.has("a")).toBe(false); expect(m.size).toBe(0);' },
      { name: 'has reports an existing key', body: 'const m = defaultMap(() => []); m.get("a"); expect(m.has("a")).toBe(true);' },
      { name: 'set stores a value', body: 'const m = defaultMap(() => []); m.set("a", [9]); expect(m.get("a")).toEqual([9]);' },
      { name: 'set overrides the default', body: 'let calls = 0; const m = defaultMap(() => { calls += 1; return []; }); m.set("a", [9]); m.get("a"); expect(calls).toBe(0);' },
      { name: 'delete removes a key', body: 'const m = defaultMap(() => []); m.get("a"); m.delete("a"); expect(m.has("a")).toBe(false);' },
      { name: 'size counts stored keys', body: 'const m = defaultMap(() => []); m.get("a"); m.get("b"); expect(m.size).toBe(2);' },
      { name: 'entries lists the pairs', body: 'const m = defaultMap(() => 0); m.set("a", 1); m.set("b", 2); expect([...m.entries()]).toEqual([["a", 1], ["b", 2]]);' },
      { name: 'works as a counter with a numeric default', body: 'const m = defaultMap(() => 0); for (const w of ["a", "b", "a"]) m.set(w, m.get(w) + 1); expect(m.get("a")).toBe(2); expect(m.get("b")).toBe(1);' },
      { name: 'keeps number and string keys apart', body: 'const m = defaultMap(() => 0); m.set(1, "num"); m.set("1", "str"); expect(m.get(1)).toBe("num"); expect(m.get("1")).toBe("str");', hidden: true },
      { name: 'handles a key named constructor', body: 'const m = defaultMap(() => []); m.get("constructor").push(1); expect(m.get("constructor")).toEqual([1]);', hidden: true },
    ],
    hints: [
      'A `Map` holds the entries; the wrapper is just a small object exposing the six members.',
      'The whole trick is in `get`: check `has` first, create and `set` if absent, then return.',
      'Store the created default rather than returning a fresh one each time, or `m.get("a").push(1)` would push into an object that is immediately discarded.',
    ],
    solution:
      'function defaultMap(createDefault) {\n' +
      '  const entries = new Map();\n' +
      '  return {\n' +
      '    get(key) {\n' +
      '      if (!entries.has(key)) entries.set(key, createDefault(key));\n' +
      '      return entries.get(key);\n' +
      '    },\n' +
      '    set(key, value) {\n' +
      '      entries.set(key, value);\n' +
      '      return this;\n' +
      '    },\n' +
      '    has(key) {\n' +
      '      return entries.has(key);\n' +
      '    },\n' +
      '    delete(key) {\n' +
      '      return entries.delete(key);\n' +
      '    },\n' +
      '    get size() {\n' +
      '      return entries.size;\n' +
      '    },\n' +
      '    entries() {\n' +
      '      return entries.entries();\n' +
      '    },\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'Storing the created default rather than merely returning it is the whole point — `m.get("a").push(1)` only works because the array handed back is the one now living in the map. A version that returned a fresh default without storing it would pass the first test and silently lose every accumulation. `has` deliberately does not create, which keeps it a genuine question rather than a mutation; that asymmetry between `get` and `has` is worth being explicit about, since it is the one surprising thing about this structure. Wrapping a `Map` rather than a plain object means keys keep their types and a key of `"constructor"` is just a key. This is Python\'s `defaultdict` in JavaScript, and it removes the "create if missing" line from every grouping and counting loop you write.',
  },

  {
    id: 'ch-adv-deep-clone',
    slug: 'deep-clone-with-cycles',
    title: 'Deep Clone with Cycles',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['copying', 'recursion', 'data-structures'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `deepClone(value)` producing an independent copy. It must handle plain objects, arrays, `Date`, `Map` and `Set`, and it must survive **cycles**: an object referring to itself should clone into an object referring to *its own* copy, not the original. Shared references must stay shared — if two properties point at the same object, both copies must point at the same single clone. Functions and primitives are returned as they are.',
    examples: [
      'const o = { a: 1 };\no.self = o;\nconst copy = deepClone(o);\ncopy.self === copy;   // true\ncopy.self === o;      // false',
    ],
    constraints: ['A cyclic structure must not cause infinite recursion.', 'Shared references remain shared within the clone.', 'Functions are copied by reference, not cloned.'],
    starterCode: 'function deepClone(value) {\n  // Your code here\n}\n',
    tests: [
      { name: 'clones a plain object', body: 'const o = { a: 1 }; const c = deepClone(o); expect(c).toEqual({ a: 1 }); expect(c).not.toBe(o);' },
      { name: 'clones nested objects', body: 'const o = { a: { b: 1 } }; const c = deepClone(o); c.a.b = 2; expect(o.a.b).toBe(1);' },
      { name: 'clones arrays', body: 'const o = [1, [2]]; const c = deepClone(o); c[1][0] = 9; expect(o[1][0]).toBe(2); expect(Array.isArray(c)).toBe(true);' },
      { name: 'returns primitives unchanged', body: 'expect(deepClone(1)).toBe(1); expect(deepClone("s")).toBe("s"); expect(deepClone(null)).toBe(null); expect(deepClone(undefined)).toBe(undefined);' },
      { name: 'clones a Date', body: 'const d = new Date(1000); const c = deepClone(d); expect(c instanceof Date).toBe(true); expect(c.getTime()).toBe(1000); expect(c).not.toBe(d);' },
      { name: 'clones a Map', body: 'const m = new Map([["a", { n: 1 }]]); const c = deepClone(m); expect(c instanceof Map).toBe(true); expect(c.get("a").n).toBe(1); expect(c.get("a")).not.toBe(m.get("a"));' },
      { name: 'clones a Set', body: 'const s = new Set([1, 2]); const c = deepClone(s); expect(c instanceof Set).toBe(true); expect([...c]).toEqual([1, 2]); expect(c).not.toBe(s);' },
      { name: 'copies functions by reference', body: 'const fn = () => {}; const c = deepClone({ fn }); expect(c.fn).toBe(fn);' },
      { name: 'survives a self-reference', body: 'const o = { a: 1 }; o.self = o; const c = deepClone(o); expect(c.self).toBe(c); expect(c.self).not.toBe(o);' },
      { name: 'survives a two-node cycle', body: 'const a = {}; const b = { a }; a.b = b; const c = deepClone(a); expect(c.b.a).toBe(c);' },
      { name: 'survives a cycle through an array', body: 'const xs = [1]; xs.push(xs); const c = deepClone(xs); expect(c[1]).toBe(c);' },
      { name: 'preserves shared references', body: 'const shared = { n: 1 }; const o = { x: shared, y: shared }; const c = deepClone(o); expect(c.x).toBe(c.y); expect(c.x).not.toBe(shared);' },
      { name: 'clones a cycle inside a Map', body: 'const m = new Map(); m.set("self", m); const c = deepClone(m); expect(c.get("self")).toBe(c);' },
      { name: 'handles deep nesting', body: 'let o = { leaf: true }; for (let i = 0; i < 200; i += 1) o = { child: o }; const c = deepClone(o); let node = c; for (let i = 0; i < 200; i += 1) node = node.child; expect(node.leaf).toBe(true);', hidden: true },
      { name: 'does not mutate the original', body: 'const o = { a: { b: 1 } }; deepClone(o); expect(o).toEqual({ a: { b: 1 } });', hidden: true },
    ],
    hints: [
      'Keep a `Map` from each original object to its clone, threaded through the recursion.',
      'Before cloning an object, check that map. If it is there, return the existing clone — that single check handles both cycles and shared references.',
      'Register the new clone in the map *before* recursing into its contents, or a self-reference will still recurse forever.',
    ],
    solution:
      'function deepClone(value, seen = new Map()) {\n' +
      '  if (value === null || typeof value !== "object") return value;\n' +
      '  if (seen.has(value)) return seen.get(value);\n' +
      '\n' +
      '  if (value instanceof Date) {\n' +
      '    const copy = new Date(value.getTime());\n' +
      '    seen.set(value, copy);\n' +
      '    return copy;\n' +
      '  }\n' +
      '\n' +
      '  if (value instanceof Map) {\n' +
      '    const copy = new Map();\n' +
      '    seen.set(value, copy);\n' +
      '    for (const [k, v] of value) copy.set(deepClone(k, seen), deepClone(v, seen));\n' +
      '    return copy;\n' +
      '  }\n' +
      '\n' +
      '  if (value instanceof Set) {\n' +
      '    const copy = new Set();\n' +
      '    seen.set(value, copy);\n' +
      '    for (const v of value) copy.add(deepClone(v, seen));\n' +
      '    return copy;\n' +
      '  }\n' +
      '\n' +
      '  if (Array.isArray(value)) {\n' +
      '    const copy = [];\n' +
      '    seen.set(value, copy);\n' +
      '    for (const v of value) copy.push(deepClone(v, seen));\n' +
      '    return copy;\n' +
      '  }\n' +
      '\n' +
      '  const copy = {};\n' +
      '  seen.set(value, copy);\n' +
      '  for (const key of Object.keys(value)) copy[key] = deepClone(value[key], seen);\n' +
      '  return copy;\n' +
      '}\n',
    solutionExplanation:
      'The `seen` map is the entire difference between a toy clone and a correct one, and the ordering matters more than the map itself: the empty clone is registered *before* its contents are copied, so when the recursion comes back around to the same object it finds the clone already there. Register it afterwards and a self-referencing object still recurses forever. The same lookup gives shared references for free — two properties pointing at one object both resolve to the one clone, preserving the shape of the original graph rather than silently duplicating it. `JSON.parse(JSON.stringify(x))` fails every interesting case here: it throws on cycles, turns `Date` into a string, and empties `Map` and `Set`. The built-in `structuredClone` handles all of this properly and is what you should reach for in production; functions are the one thing it cannot copy, which is why it throws where this returns them by reference.',
  },

  {
    id: 'ch-adv-tagged-template',
    slug: 'a-safe-tagged-template',
    title: 'A Safe Tagged Template',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'strings', 'security'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'A tagged template lets a function see the literal parts and the interpolated values *separately*, which is what makes safe-by-default escaping possible. Write a tag `safe` so that `` safe`<p>${userInput}</p>` `` escapes only the interpolated values, never the literal markup around them. Escape `&`, `<`, `>`, `"` and `\'`. Values are converted to strings; `null` and `undefined` become empty strings rather than the words.',
    examples: [
      'const name = "<script>";\nsafe`Hello ${name}`;\n// "Hello &lt;script&gt;" — the literal text is untouched',
    ],
    constraints: ['Only interpolated values are escaped.', '`null` and `undefined` interpolate as an empty string.', 'The tag works with any number of interpolations, including none.'],
    starterCode: 'function safe(strings, ...values) {\n  // Your code here\n}\n',
    tests: [
      { name: 'escapes an interpolated value', body: 'const name = "<b>"; expect(safe`Hello ${name}`).toBe("Hello &lt;b&gt;");' },
      { name: 'leaves the literal parts alone', body: 'const name = "x"; expect(safe`<p>${name}</p>`).toBe("<p>x</p>");' },
      { name: 'works with no interpolation', body: 'expect(safe`<p>plain</p>`).toBe("<p>plain</p>");' },
      { name: 'handles several interpolations', body: 'const a = "<"; const b = ">"; expect(safe`${a}-${b}`).toBe("&lt;-&gt;");' },
      { name: 'escapes ampersands', body: 'const v = "a & b"; expect(safe`${v}`).toBe("a &amp; b");' },
      { name: 'escapes quotes', body: 'const v = \'say "hi"\'; expect(safe`${v}`).toBe("say &quot;hi&quot;");' },
      { name: 'escapes single quotes', body: 'const v = "it\'s"; expect(safe`${v}`).toBe("it&#39;s");' },
      { name: 'converts numbers', body: 'const n = 42; expect(safe`n=${n}`).toBe("n=42");' },
      { name: 'null interpolates as empty', body: 'const v = null; expect(safe`[${v}]`).toBe("[]");' },
      { name: 'undefined interpolates as empty', body: 'const v = undefined; expect(safe`[${v}]`).toBe("[]");' },
      { name: 'zero interpolates as zero', body: 'const v = 0; expect(safe`[${v}]`).toBe("[0]");' },
      { name: 'false interpolates as false', body: 'const v = false; expect(safe`[${v}]`).toBe("[false]");' },
      { name: 'an interpolation at the very start', body: 'const v = "<"; expect(safe`${v}end`).toBe("&lt;end");' },
      { name: 'an injected tag cannot escape', body: 'const v = "<img src=x onerror=alert(1)>"; const out = safe`<div>${v}</div>`; expect(out.startsWith("<div>")).toBe(true); expect(out.includes("<img")).toBe(false);', hidden: true },
      { name: 'adjacent interpolations', body: 'const a = "&"; const b = "&"; expect(safe`${a}${b}`).toBe("&amp;&amp;");', hidden: true },
    ],
    hints: [
      'A tag function receives the literal strings as its first argument and the interpolated values as the rest. There is always exactly one more literal than there are values.',
      'Walk the literals, appending each one raw, and append the escaped value after each literal except the last.',
      'Handle `null` and `undefined` before converting, since `String(null)` is `"null"`.',
    ],
    solution:
      'function safe(strings, ...values) {\n' +
      '  const entities = {\n' +
      '    "&": "&amp;",\n' +
      '    "<": "&lt;",\n' +
      '    ">": "&gt;",\n' +
      '    \'"\': "&quot;",\n' +
      '    "\'": "&#39;",\n' +
      '  };\n' +
      '  const escape = (value) => {\n' +
      '    if (value === null || value === undefined) return "";\n' +
      '    return String(value).replace(/[&<>"\']/g, (char) => entities[char]);\n' +
      '  };\n' +
      '\n' +
      '  let out = strings[0];\n' +
      '  for (let i = 0; i < values.length; i += 1) {\n' +
      '    out += escape(values[i]) + strings[i + 1];\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The reason tagged templates matter for safety is that the boundary between "code the developer wrote" and "data that came from somewhere else" is preserved in the arguments — `strings` is always literal, `values` is always interpolated. Ordinary string concatenation destroys that distinction before the function ever sees it, which is why escaping applied after the fact has to guess. There is always exactly one more literal than there are values (a template starting or ending with an interpolation simply has an empty string there), which is what makes the `strings[0]` seed plus `strings[i + 1]` loop correct with no special cases. Handling `null` and `undefined` before `String()` avoids rendering the literal words `"null"` and `"undefined"` into the page, while keeping `0` and `false` visible — a distinction the falsy-value tests pin down. This is the same mechanism behind parameterised SQL tags, and for the same reason.',
  },

  {
    id: 'ch-adv-symbol-protocol',
    slug: 'customising-built-in-behaviour',
    title: 'Customising Built-in Behaviour',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'classes', 'coercion'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Well-known symbols let a class hook into language operations. Write a class `Money` holding an integer number of cents and a currency, and wire up four of them. `Symbol.toPrimitive` returns the cents for a numeric hint and a formatted string like `"$12.34"` otherwise. `Symbol.toStringTag` makes `Object.prototype.toString.call(m)` report `"[object Money]"`. `Symbol.iterator` yields the cents then the currency, so `const [cents, currency] = m` destructures. `Symbol.hasInstance` on a static class `Currency` reports whether a value is a `Money` in that currency.',
    examples: [
      'const m = new Money(1234, "USD");\n`${m}`;        // "$12.34"\n+m;            // 1234\nm + 0;         // 1234 — default hint is number here\nString(m);     // "$12.34"',
    ],
    constraints: ['A numeric hint gives the raw cents; string and default hints give the formatted text.', 'Only USD, EUR and GBP need symbols — anything else uses the code and a space.', '`Money` values are immutable once constructed.'],
    starterCode: 'class Money {\n  constructor(cents, currency = "USD") {\n    // Your code here\n  }\n}\n\nclass Currency {\n  // Your code here\n}\n',
    tests: [
      { name: 'formats as a string', body: 'expect(`${new Money(1234, "USD")}`).toBe("$12.34");' },
      { name: 'String conversion formats', body: 'expect(String(new Money(500, "USD"))).toBe("$5.00");' },
      { name: 'a numeric hint gives the cents', body: 'expect(+new Money(1234, "USD")).toBe(1234);' },
      { name: 'pads the minor units', body: 'expect(String(new Money(5, "USD"))).toBe("$0.05");' },
      { name: 'formats euros', body: 'expect(String(new Money(100, "EUR"))).toBe("€1.00");' },
      { name: 'formats pounds', body: 'expect(String(new Money(100, "GBP"))).toBe("£1.00");' },
      { name: 'falls back to the code for other currencies', body: 'expect(String(new Money(100, "JPY"))).toBe("JPY 1.00");' },
      { name: 'reports its toStringTag', body: 'expect(Object.prototype.toString.call(new Money(1, "USD"))).toBe("[object Money]");' },
      { name: 'destructures into cents and currency', body: 'const [cents, currency] = new Money(750, "EUR"); expect(cents).toBe(750); expect(currency).toBe("EUR");' },
      { name: 'spreads into an array', body: 'expect([...new Money(750, "EUR")]).toEqual([750, "EUR"]);' },
      { name: 'hasInstance recognises a matching currency', body: 'class USD extends Currency { static code = "USD"; } expect(new Money(1, "USD") instanceof USD).toBe(true);' },
      { name: 'hasInstance rejects a different currency', body: 'class USD extends Currency { static code = "USD"; } expect(new Money(1, "EUR") instanceof USD).toBe(false);' },
      { name: 'hasInstance rejects a non-Money', body: 'class USD extends Currency { static code = "USD"; } expect(42 instanceof USD).toBe(false); expect(null instanceof USD).toBe(false);' },
      { name: 'handles zero', body: 'expect(String(new Money(0, "USD"))).toBe("$0.00");', hidden: true },
      { name: 'handles a large amount', body: 'expect(String(new Money(123456789, "USD"))).toBe("$1234567.89");', hidden: true },
    ],
    hints: [
      '`[Symbol.toPrimitive](hint)` receives `"number"`, `"string"` or `"default"`. Template literals and `String()` use the string hint; unary `+` uses the number hint.',
      '`get [Symbol.toStringTag]()` is a getter returning the tag name.',
      '`static [Symbol.hasInstance](value)` on a class replaces what `instanceof` does for that class entirely — it can return anything, including a check on a completely unrelated value.',
    ],
    solution:
      'const SYMBOLS = { USD: "$", EUR: "€", GBP: "£" };\n' +
      '\n' +
      'class Money {\n' +
      '  #cents;\n' +
      '\n' +
      '  #currency;\n' +
      '\n' +
      '  constructor(cents, currency = "USD") {\n' +
      '    this.#cents = cents;\n' +
      '    this.#currency = currency;\n' +
      '    Object.freeze(this);\n' +
      '  }\n' +
      '\n' +
      '  get cents() {\n' +
      '    return this.#cents;\n' +
      '  }\n' +
      '\n' +
      '  get currency() {\n' +
      '    return this.#currency;\n' +
      '  }\n' +
      '\n' +
      '  [Symbol.toPrimitive](hint) {\n' +
      '    if (hint === "number") return this.#cents;\n' +
      '    const prefix = SYMBOLS[this.#currency] ?? this.#currency + " ";\n' +
      '    return prefix + (this.#cents / 100).toFixed(2);\n' +
      '  }\n' +
      '\n' +
      '  get [Symbol.toStringTag]() {\n' +
      '    return "Money";\n' +
      '  }\n' +
      '\n' +
      '  *[Symbol.iterator]() {\n' +
      '    yield this.#cents;\n' +
      '    yield this.#currency;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'class Currency {\n' +
      '  static [Symbol.hasInstance](value) {\n' +
      '    return value instanceof Object && value.constructor === Money && value.currency === this.code;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'Well-known symbols are the language\'s extension points: rather than special-casing your types, the specification asks *them* how they want to behave. `Symbol.toPrimitive` receives a hint describing what the context wants — a template literal and `String()` pass `"string"`, unary `+` passes `"number"`, and `+` with an unknown other operand passes `"default"` — which is what lets one object be both a number and a formatted label without ambiguity. `Symbol.toStringTag` changes the last honest type-probing trick, `Object.prototype.toString.call`, which is why it is worth setting on any type that might be logged or inspected. `Symbol.hasInstance` is the most surprising: it replaces `instanceof` wholesale, so `new Money(1, "USD") instanceof USD` is true even though `Money` does not extend `USD` at all. That is powerful and worth using sparingly — code that reads `instanceof` reasonably expects it to mean prototype-chain membership.',
  },
];

export default challenges;
