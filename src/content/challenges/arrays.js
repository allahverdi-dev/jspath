import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Arrays & Collections';

export const challenges = [
  {
    id: 'ch-arr-chunk',
    slug: 'chunk-an-array',
    title: 'Chunk an Array',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'loops'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `chunk(items, size)` splitting an array into groups of at most `size`, returned as an array of arrays. The final group holds whatever is left over and may be shorter. The original array must not be modified, and the chunks must be new arrays rather than views into it. Throw a `RangeError` for a `size` below 1 — there is no sensible chunking into groups of zero.',
    examples: ['chunk([1, 2, 3, 4, 5], 2);  // [[1, 2], [3, 4], [5]]\nchunk([1, 2], 5);           // [[1, 2]]\nchunk([], 3);               // []'],
    constraints: ['`size` is an integer.', 'Do not mutate the input.', 'An empty input produces an empty array, not an array containing an empty array.'],
    starterCode: 'function chunk(items, size) {\n  // Your code here\n}\n',
    tests: [
      { name: 'splits evenly', body: 'expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);' },
      { name: 'leaves a short final chunk', body: 'expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);' },
      { name: 'a size larger than the array gives one chunk', body: 'expect(chunk([1, 2], 5)).toEqual([[1, 2]]);' },
      { name: 'an empty array gives no chunks', body: 'expect(chunk([], 3)).toEqual([]);' },
      { name: 'a size of one gives singletons', body: 'expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; chunk(xs, 2); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'chunks are independent arrays', body: 'const xs = [1, 2]; const out = chunk(xs, 2); out[0][0] = 99; expect(xs[0]).toBe(1);' },
      { name: 'rejects a size of zero', body: 'expect(() => chunk([1], 0)).toThrow(RangeError);' },
      { name: 'rejects a negative size', body: 'expect(() => chunk([1], -1)).toThrow(RangeError);', hidden: true },
      { name: 'every element survives exactly once', body: 'const xs = Array.from({ length: 47 }, (_, i) => i); expect(chunk(xs, 5).flat()).toEqual(xs);', hidden: true },
    ],
    hints: [
      'Step through the array `size` positions at a time rather than one at a time — the loop increment is the whole trick.',
      '`slice` copies a section into a new array and clamps automatically at the end, so the short final chunk needs no special case.',
      'Validate `size` before the loop; a size of 0 would otherwise loop forever.',
    ],
    solution:
      'function chunk(items, size) {\n' +
      '  if (size < 1) throw new RangeError("size must be at least 1");\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < items.length; i += size) {\n' +
      '    out.push(items.slice(i, i + size));\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Incrementing the loop by `size` instead of 1 means each pass produces exactly one chunk. `slice` does the rest of the work: it copies rather than aliases, so mutating a chunk cannot reach back into the input, and it clamps its end index to the array length, so the final short chunk falls out with no boundary check. The `size < 1` guard is not decoration — with a size of 0 the loop counter never advances and the function hangs, which is a far worse failure than an exception.',
  },

  {
    id: 'ch-arr-flatten-depth',
    slug: 'flatten-to-a-depth',
    title: 'Flatten to a Depth',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'recursion'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `flattenDepth(items, depth)` flattening nested arrays by at most `depth` levels, without using `Array.prototype.flat` — implementing it is the point. A depth of 0 returns a shallow copy. A depth of `Infinity` flattens completely. Non-array values at any level are kept as they are, including `null`.',
    examples: [
      'flattenDepth([1, [2, [3, [4]]]], 1);        // [1, 2, [3, [4]]]',
      'flattenDepth([1, [2, [3, [4]]]], Infinity); // [1, 2, 3, 4]',
      'flattenDepth([1, [2]], 0);                  // [1, [2]]',
    ],
    constraints: ['Do not use `Array.prototype.flat` or `flatMap`.', 'Do not mutate the input at any level.', '`depth` is a non-negative number or `Infinity`.'],
    starterCode: 'function flattenDepth(items, depth) {\n  // Your code here\n}\n',
    tests: [
      { name: 'flattens one level', body: 'expect(flattenDepth([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);' },
      { name: 'flattens two levels', body: 'expect(flattenDepth([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);' },
      { name: 'flattens completely at Infinity', body: 'expect(flattenDepth([1, [2, [3, [4]]]], Infinity)).toEqual([1, 2, 3, 4]);' },
      { name: 'a depth of zero copies', body: 'expect(flattenDepth([1, [2]], 0)).toEqual([1, [2]]);' },
      { name: 'a depth of zero still returns a new array', body: 'const xs = [1]; expect(flattenDepth(xs, 0)).not.toBe(xs);' },
      { name: 'handles an already-flat array', body: 'expect(flattenDepth([1, 2, 3], 5)).toEqual([1, 2, 3]);' },
      { name: 'handles an empty array', body: 'expect(flattenDepth([], 3)).toEqual([]);' },
      { name: 'drops empty nested arrays as it flattens', body: 'expect(flattenDepth([1, [], [2, []]], Infinity)).toEqual([1, 2]);' },
      { name: 'keeps null as a value', body: 'expect(flattenDepth([1, [null, [undefined]]], Infinity)).toEqual([1, null, undefined]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, [2, [3]]]; flattenDepth(xs, Infinity); expect(xs).toEqual([1, [2, [3]]]);' },
      { name: 'handles several branches at one level', body: 'expect(flattenDepth([[1, 2], [3, 4], [5]], 1)).toEqual([1, 2, 3, 4, 5]);', hidden: true },
      { name: 'handles deep nesting', body: 'let nested = [42]; for (let i = 0; i < 60; i += 1) nested = [nested]; expect(flattenDepth(nested, Infinity)).toEqual([42]);', hidden: true },
    ],
    hints: [
      'Walk the array once. For each element, ask two questions: is it an array, and do you still have depth left to spend?',
      'When both answers are yes, recurse with `depth - 1` and append everything the recursive call returns.',
      '`Array.isArray` is the reliable test — `typeof []` is `"object"`, which does not distinguish an array from a plain object.',
    ],
    solution:
      'function flattenDepth(items, depth) {\n' +
      '  const out = [];\n' +
      '  for (const item of items) {\n' +
      '    if (Array.isArray(item) && depth > 0) {\n' +
      '      for (const inner of flattenDepth(item, depth - 1)) out.push(inner);\n' +
      '    } else {\n' +
      '      out.push(item);\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The recursion has exactly one guard combining both stopping conditions: a non-array element has nothing to flatten, and a depth of 0 means no budget left. `Infinity - 1` is still `Infinity`, so the full-flatten case needs no separate branch at all — the arithmetic simply never reaches 0. Building a fresh `out` array at every level is what makes the function non-mutating, and it is also why a depth of 0 returns a copy rather than the original. Note that pushing the recursive result element by element avoids `concat` re-copying the accumulator on every step.',
  },

  {
    id: 'ch-arr-group-by',
    slug: 'group-records-by-key',
    title: 'Group Records by Key',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order', 'data-structures'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `groupBy(items, keyFn)` returning a `Map` from each computed key to the array of items that produced it. Items keep their original relative order inside each group, and the groups appear in the order their keys were first seen. Use a `Map` rather than an object so that keys can be any value — numbers, booleans, even objects — without being stringified.',
    examples: [
      'groupBy([1, 2, 3, 4], (n) => n % 2 === 0);\n// Map { false => [1, 3], true => [2, 4] }',
      'groupBy(["ant", "bee", "ape"], (w) => w[0]);\n// Map { "a" => ["ant", "ape"], "b" => ["bee"] }',
    ],
    constraints: ['`keyFn` is called once per item, with the item as its only argument.', 'Return a `Map`.', 'An empty input produces an empty `Map`.'],
    starterCode: 'function groupBy(items, keyFn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'groups by a computed key', body: 'const m = groupBy(["ant", "bee", "ape"], (w) => w[0]); expect(m.get("a")).toEqual(["ant", "ape"]); expect(m.get("b")).toEqual(["bee"]);' },
      { name: 'returns a Map', body: 'expect(groupBy([1], () => 1) instanceof Map).toBe(true);' },
      { name: 'keeps boolean keys as booleans', body: 'const m = groupBy([1, 2, 3, 4], (n) => n % 2 === 0); expect(m.get(true)).toEqual([2, 4]); expect(m.get(false)).toEqual([1, 3]);' },
      { name: 'keeps number keys as numbers', body: 'const m = groupBy([1.2, 1.8, 2.4], Math.floor); expect(m.get(1)).toEqual([1.2, 1.8]); expect(m.get(2)).toEqual([2.4]);' },
      { name: 'preserves order within a group', body: 'expect(groupBy([5, 1, 3], () => "all").get("all")).toEqual([5, 1, 3]);' },
      { name: 'preserves first-seen order of the groups', body: 'expect([...groupBy(["b", "a", "b"], (x) => x).keys()]).toEqual(["b", "a"]);' },
      { name: 'an empty input gives an empty map', body: 'expect(groupBy([], (x) => x).size).toBe(0);' },
      { name: 'calls the key function once per item', body: 'let calls = 0; groupBy([1, 2, 3], (n) => { calls += 1; return n; }); expect(calls).toBe(3);' },
      { name: 'supports object keys by identity', body: 'const a = {}; const b = {}; const m = groupBy([1, 2], (n) => (n === 1 ? a : b)); expect(m.get(a)).toEqual([1]); expect(m.get(b)).toEqual([2]);', hidden: true },
      { name: 'does not collide with inherited names', body: 'const m = groupBy(["x"], () => "constructor"); expect(m.get("constructor")).toEqual(["x"]);', hidden: true },
    ],
    hints: [
      'For each item, compute its key, find or create that key\'s array, and push.',
      '`Map.prototype.get` returns `undefined` for a missing key — that is your signal to create the group.',
      'A `Map` remembers insertion order, so the "groups in first-seen order" requirement needs no extra work.',
    ],
    solution:
      'function groupBy(items, keyFn) {\n' +
      '  const groups = new Map();\n' +
      '  for (const item of items) {\n' +
      '    const key = keyFn(item);\n' +
      '    const bucket = groups.get(key);\n' +
      '    if (bucket === undefined) groups.set(key, [item]);\n' +
      '    else bucket.push(item);\n' +
      '  }\n' +
      '  return groups;\n' +
      '}\n',
    solutionExplanation:
      'A `Map` is the right container here for two reasons the tests make concrete. Its keys are compared by value for primitives and by identity for objects, so `true` stays a boolean and `1` stays a number rather than both collapsing into strings — with a plain object, `1` and `"1"` would land in the same bucket. And a key of `"constructor"` is just a key, with no inherited property to trip over. Order comes free: `Map` iterates in insertion order, and pushing into an existing bucket appends, so both ordering requirements hold without any sorting.',
  },

  {
    id: 'ch-arr-zip',
    slug: 'zip-parallel-arrays',
    title: 'Zip Parallel Arrays',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'functions'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `zip(...arrays)` that interleaves any number of arrays into an array of tuples: the first tuple holds every array\'s first element, the second holds every second element, and so on. Stop at the length of the **shortest** array, so no tuple is ever padded with `undefined`. Calling it with no arrays at all gives an empty array.',
    examples: [
      'zip([1, 2, 3], ["a", "b", "c"]);\n// [[1, "a"], [2, "b"], [3, "c"]]',
      'zip([1, 2, 3], ["a"]);\n// [[1, "a"]]',
      'zip([1], [2], [3]);\n// [[1, 2, 3]]',
    ],
    constraints: ['Any number of arrays, including zero or one.', 'Result length is the shortest input length.', 'Do not mutate any input.'],
    starterCode: 'function zip(...arrays) {\n  // Your code here\n}\n',
    tests: [
      { name: 'zips two equal-length arrays', body: 'expect(zip([1, 2], ["a", "b"])).toEqual([[1, "a"], [2, "b"]]);' },
      { name: 'stops at the shortest', body: 'expect(zip([1, 2, 3], ["a"])).toEqual([[1, "a"]]);' },
      { name: 'stops at the shortest whichever comes first', body: 'expect(zip(["a"], [1, 2, 3])).toEqual([["a", 1]]);' },
      { name: 'zips three arrays', body: 'expect(zip([1], [2], [3])).toEqual([[1, 2, 3]]);' },
      { name: 'zips one array into singletons', body: 'expect(zip([1, 2])).toEqual([[1], [2]]);' },
      { name: 'no arrays gives an empty result', body: 'expect(zip()).toEqual([]);' },
      { name: 'an empty input array gives an empty result', body: 'expect(zip([1, 2], [])).toEqual([]);' },
      { name: 'never pads with undefined', body: 'for (const tuple of zip([1, 2, 3], ["a", "b"])) for (const v of tuple) expect(v).not.toBe(undefined);' },
      { name: 'does not mutate the inputs', body: 'const a = [1, 2]; const b = ["x", "y"]; zip(a, b); expect(a).toEqual([1, 2]); expect(b).toEqual(["x", "y"]);' },
      { name: 'preserves falsy values', body: 'expect(zip([0, false], ["", null])).toEqual([[0, ""], [false, null]]);', hidden: true },
    ],
    hints: [
      'Find the shortest length first. `Math.min` over the lengths does it, but check what `Math.min()` returns with no arguments.',
      '`Math.min()` with nothing is `Infinity`, which would loop forever — handle the zero-arrays case explicitly.',
      'Once you know the length, each tuple is just "the element at this index from every array".',
    ],
    solution:
      'function zip(...arrays) {\n' +
      '  if (arrays.length === 0) return [];\n' +
      '  const length = Math.min(...arrays.map((a) => a.length));\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < length; i += 1) {\n' +
      '    out.push(arrays.map((a) => a[i]));\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Taking the minimum length up front is what guarantees no tuple is ever padded — the loop simply never reaches an index that any array lacks. The empty-arguments guard is genuinely necessary rather than defensive habit: `Math.min()` with no arguments returns `Infinity`, and the loop would run until the process gave up. Building each tuple with `arrays.map((a) => a[i])` reads as the definition of the operation, and because both `map` calls allocate new arrays, nothing about the inputs is disturbed. The falsy-values test confirms the function never mistakes `0` or `""` for a missing element.',
  },

  {
    id: 'ch-arr-rotate',
    slug: 'rotate-an-array',
    title: 'Rotate an Array',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'numbers'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `rotate(items, n)` returning a new array shifted `n` positions to the right, with elements pushed off the end wrapping around to the front. A negative `n` rotates left. `n` may be far larger than the array length and must still work. Do not modify the input.',
    examples: [
      'rotate([1, 2, 3, 4, 5], 2);    // [4, 5, 1, 2, 3]',
      'rotate([1, 2, 3, 4, 5], -1);   // [2, 3, 4, 5, 1]',
      'rotate([1, 2, 3], 300);        // [1, 2, 3]',
    ],
    constraints: ['`n` is an integer, possibly negative or larger than the array.', 'Do not mutate the input.', 'An empty array rotates to an empty array.'],
    starterCode: 'function rotate(items, n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'rotates right', body: 'expect(rotate([1, 2, 3, 4, 5], 2)).toEqual([4, 5, 1, 2, 3]);' },
      { name: 'rotates left for negative n', body: 'expect(rotate([1, 2, 3, 4, 5], -1)).toEqual([2, 3, 4, 5, 1]);' },
      { name: 'a rotation of zero is unchanged', body: 'expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]);' },
      { name: 'a full rotation is unchanged', body: 'expect(rotate([1, 2, 3], 3)).toEqual([1, 2, 3]);' },
      { name: 'handles n far larger than the length', body: 'expect(rotate([1, 2, 3], 301)).toEqual([3, 1, 2]);' },
      { name: 'handles a large negative n', body: 'expect(rotate([1, 2, 3], -301)).toEqual([2, 3, 1]);' },
      { name: 'an empty array stays empty', body: 'expect(rotate([], 3)).toEqual([]);' },
      { name: 'a single element is unchanged', body: 'expect(rotate([1], 7)).toEqual([1]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; rotate(xs, 1); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'returns a new array even at zero', body: 'const xs = [1, 2]; expect(rotate(xs, 0)).not.toBe(xs);' },
      { name: 'left and right rotations are inverses', body: 'const xs = [1, 2, 3, 4, 5]; expect(rotate(rotate(xs, 3), -3)).toEqual(xs);', hidden: true },
    ],
    hints: [
      'Reduce `n` modulo the length first, so a rotation of 301 becomes a rotation of 1.',
      'JavaScript\'s `%` keeps the sign of the left operand, so `-301 % 3` is `-1`, not `2`. Adding the length and taking the remainder again normalises it.',
      'Once `n` is a small non-negative number, the answer is the last `n` elements followed by the rest.',
    ],
    solution:
      'function rotate(items, n) {\n' +
      '  if (items.length === 0) return [];\n' +
      '  const shift = ((n % items.length) + items.length) % items.length;\n' +
      '  return [...items.slice(-shift || items.length), ...items.slice(0, items.length - shift)];\n' +
      '}\n',
    solutionExplanation:
      'The double modulo is the crux. JavaScript\'s `%` is a remainder, not a mathematical modulo, so it keeps the sign of its left operand: `-301 % 3` is `-1`. Adding the length and taking the remainder again folds any integer — however large or negative — into the range 0 to length-1, after which left and right rotations are the same operation. The `-shift || items.length` guard handles the one case `slice` gets awkward about: `slice(-0)` is `slice(0)`, which would return the whole array instead of nothing, so a shift of 0 is redirected to slicing from the end. The empty-array guard comes first because the modulo would divide by zero.',
  },

  {
    id: 'ch-arr-partition',
    slug: 'partition-in-one-pass',
    title: 'Partition in One Pass',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `partition(items, predicate)` splitting an array into `[matching, notMatching]`. The obvious implementation runs `filter` twice, which calls the predicate on every element twice — write it so the predicate is called exactly once per element. Order is preserved within each half.',
    examples: [
      'partition([1, 2, 3, 4], (n) => n % 2 === 0);\n// [[2, 4], [1, 3]]',
      'partition([], () => true);  // [[], []]',
    ],
    constraints: ['The predicate receives the item and its index.', 'The predicate must be called exactly once per element.', 'Always return a two-element array, even when one half is empty.'],
    starterCode: 'function partition(items, predicate) {\n  // Your code here\n}\n',
    tests: [
      { name: 'splits on a predicate', body: 'expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([[2, 4], [1, 3]]);' },
      { name: 'matching items come first', body: 'expect(partition([1, 2], (n) => n === 2)[0]).toEqual([2]);' },
      { name: 'an all-matching input leaves the second half empty', body: 'expect(partition([1, 2], () => true)).toEqual([[1, 2], []]);' },
      { name: 'an all-failing input leaves the first half empty', body: 'expect(partition([1, 2], () => false)).toEqual([[], [1, 2]]);' },
      { name: 'an empty input gives two empty halves', body: 'expect(partition([], () => true)).toEqual([[], []]);' },
      { name: 'preserves order within each half', body: 'expect(partition([5, 1, 6, 2], (n) => n > 3)).toEqual([[5, 6], [1, 2]]);' },
      { name: 'calls the predicate exactly once per element', body: 'let calls = 0; partition([1, 2, 3], () => { calls += 1; return true; }); expect(calls).toBe(3);' },
      { name: 'passes the index as the second argument', body: 'const seen = []; partition(["a", "b"], (v, i) => { seen.push(i); return true; }); expect(seen).toEqual([0, 1]);' },
      { name: 'treats a truthy non-boolean as a match', body: 'expect(partition([0, 1, 2], (n) => n)).toEqual([[1, 2], [0]]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; partition(xs, (n) => n > 1); expect(xs).toEqual([1, 2, 3]);', hidden: true },
    ],
    hints: [
      'Build both output arrays as you walk the input once, pushing each element into one of them.',
      'The predicate result should be captured in a variable and used once — calling it inside two separate places is the bug this challenge is about.',
      'Coerce the result to a boolean, or just use it in an `if` — a predicate is allowed to return any truthy value.',
    ],
    solution:
      'function partition(items, predicate) {\n' +
      '  const matching = [];\n' +
      '  const rest = [];\n' +
      '  for (let i = 0; i < items.length; i += 1) {\n' +
      '    if (predicate(items[i], i)) matching.push(items[i]);\n' +
      '    else rest.push(items[i]);\n' +
      '  }\n' +
      '  return [matching, rest];\n' +
      '}\n',
    solutionExplanation:
      'Writing this as `[items.filter(p), items.filter((x, i) => !p(x, i))]` is shorter and passes every behavioural test except one — the predicate-call count. That matters more than it looks: predicates in real code hit databases, log, or depend on external state, and calling one twice per element doubles that cost or, worse, changes the answer. Building both arrays in a single walk also keeps the two halves consistent even if the predicate is not pure. The `if` accepts any truthy return, which is why a predicate returning the number itself correctly puts `0` in the second half.',
  },

  {
    id: 'ch-arr-intersection',
    slug: 'array-intersection',
    title: 'Array Intersection',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'data-structures'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `intersection(a, b)` returning the values present in both arrays, each appearing once, in the order they first appear in `a`. The naive approach — checking `b.includes(x)` for every element of `a` — rescans `b` every time and becomes unusably slow on large inputs. Make the lookup constant-time instead.',
    examples: [
      'intersection([1, 2, 3, 2], [2, 3, 4]);  // [2, 3]',
      'intersection(["a"], ["b"]);             // []',
    ],
    constraints: ['Values are primitives compared by `SameValueZero`, so `NaN` matches `NaN`.', 'The result contains no duplicates.', 'One test uses arrays of 20,000 elements; a quadratic scan will time out.'],
    starterCode: 'function intersection(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds common values', body: 'expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);' },
      { name: 'deduplicates the result', body: 'expect(intersection([1, 2, 2, 3], [2, 3])).toEqual([2, 3]);' },
      { name: 'preserves the order of the first array', body: 'expect(intersection([3, 1, 2], [1, 2, 3])).toEqual([3, 1, 2]);' },
      { name: 'no overlap gives an empty array', body: 'expect(intersection(["a"], ["b"])).toEqual([]);' },
      { name: 'an empty first array gives an empty result', body: 'expect(intersection([], [1])).toEqual([]);' },
      { name: 'an empty second array gives an empty result', body: 'expect(intersection([1], [])).toEqual([]);' },
      { name: 'does not confuse a number with its string', body: 'expect(intersection([1], ["1"])).toEqual([]);' },
      { name: 'matches NaN with NaN', body: 'expect(intersection([NaN], [NaN])).toEqual([NaN]);' },
      { name: 'keeps falsy values that are genuinely present', body: 'expect(intersection([0, ""], [0, ""])).toEqual([0, ""]);' },
      {
        name: 'stays fast on large inputs',
        body:
          'const a = Array.from({ length: 20000 }, (_, i) => i);\n' +
          'const b = Array.from({ length: 20000 }, (_, i) => i + 10000);\n' +
          'expect(intersection(a, b).length).toBe(10000);',
        hidden: true,
      },
    ],
    hints: [
      'Put the second array into a structure with constant-time membership tests before you start scanning the first.',
      '`Set` gives you exactly that, and its `has` uses SameValueZero — which is why `NaN` matches itself, unlike `indexOf`.',
      'A second `Set` tracks what you have already emitted, so duplicates in the first array are skipped.',
    ],
    solution:
      'function intersection(a, b) {\n' +
      '  const inB = new Set(b);\n' +
      '  const seen = new Set();\n' +
      '  const out = [];\n' +
      '  for (const value of a) {\n' +
      '    if (inB.has(value) && !seen.has(value)) {\n' +
      '      seen.add(value);\n' +
      '      out.push(value);\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Building a `Set` from `b` costs one pass and turns every subsequent membership test into roughly constant time, taking the whole function from O(n×m) to O(n+m) — the difference between 400 million comparisons and 40 thousand on the 20,000-element test. `Set` membership uses SameValueZero, which treats `NaN` as equal to itself; `b.includes(NaN)` agrees, but `b.indexOf(NaN)` does not, so the choice of primitive matters. The second `Set` handles deduplication without ever scanning the growing output, which would have quietly reintroduced the quadratic behaviour.',
  },

  {
    id: 'ch-arr-sort-by',
    slug: 'sort-by-several-keys',
    title: 'Sort by Several Keys',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order', 'array-methods'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `sortBy(items, ...keyFns)` returning a new array sorted by the first key function, with ties broken by the second, and so on. Each key function returns a number or a string; compare numbers numerically and strings with `<`/`>` so `"b"` sorts after `"a"`. Items that tie on every key keep their original relative order. Do not modify the input array.',
    examples: [
      'sortBy(people, (p) => p.dept, (p) => p.age);\n// sorted by department, then by age within each department',
      'sortBy([3, 1, 2], (n) => n);  // [1, 2, 3]',
    ],
    constraints: ['At least one key function is given.', 'Key functions return numbers or strings, consistently per key.', 'The sort is stable and the input is not mutated.'],
    starterCode: 'function sortBy(items, ...keyFns) {\n  // Your code here\n}\n',
    tests: [
      { name: 'sorts by one numeric key', body: 'expect(sortBy([3, 1, 2], (n) => n)).toEqual([1, 2, 3]);' },
      { name: 'sorts numbers numerically, not as strings', body: 'expect(sortBy([10, 9, 100], (n) => n)).toEqual([9, 10, 100]);' },
      { name: 'sorts by one string key', body: 'expect(sortBy(["pear", "fig"], (s) => s)).toEqual(["fig", "pear"]);' },
      {
        name: 'breaks ties with the second key',
        body:
          'const rows = [{ d: "b", a: 2 }, { d: "a", a: 9 }, { d: "b", a: 1 }];\n' +
          'expect(sortBy(rows, (r) => r.d, (r) => r.a).map((r) => r.d + r.a)).toEqual(["a9", "b1", "b2"]);',
      },
      {
        name: 'uses a third key when the first two tie',
        body:
          'const rows = [{ a: 1, b: 1, c: 2 }, { a: 1, b: 1, c: 1 }];\n' +
          'expect(sortBy(rows, (r) => r.a, (r) => r.b, (r) => r.c).map((r) => r.c)).toEqual([1, 2]);',
      },
      {
        name: 'is stable when every key ties',
        body:
          'const rows = [{ id: 1, k: 0 }, { id: 2, k: 0 }, { id: 3, k: 0 }];\n' +
          'expect(sortBy(rows, (r) => r.k).map((r) => r.id)).toEqual([1, 2, 3]);',
      },
      { name: 'does not mutate the input', body: 'const xs = [3, 1, 2]; sortBy(xs, (n) => n); expect(xs).toEqual([3, 1, 2]);' },
      { name: 'returns a new array', body: 'const xs = [1]; expect(sortBy(xs, (n) => n)).not.toBe(xs);' },
      { name: 'handles an empty input', body: 'expect(sortBy([], (n) => n)).toEqual([]);' },
      { name: 'handles negative numbers', body: 'expect(sortBy([1, -5, 3], (n) => n)).toEqual([-5, 1, 3]);', hidden: true },
      { name: 'a derived key need not be the value itself', body: 'expect(sortBy(["aaa", "b", "cc"], (s) => s.length)).toEqual(["b", "cc", "aaa"]);', hidden: true },
    ],
    hints: [
      '`sort` mutates in place, so copy first — `[...items]` or `items.slice()`.',
      'Your comparator should try each key function in turn and return as soon as one of them produces a non-zero result.',
      'Subtracting works for numbers but not for strings. Comparing with `<` and `>` and returning -1, 1 or 0 handles both.',
    ],
    solution:
      'function sortBy(items, ...keyFns) {\n' +
      '  return [...items].sort((left, right) => {\n' +
      '    for (const keyFn of keyFns) {\n' +
      '      const a = keyFn(left);\n' +
      '      const b = keyFn(right);\n' +
      '      if (a < b) return -1;\n' +
      '      if (a > b) return 1;\n' +
      '    }\n' +
      '    return 0;\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'Copying before sorting is what keeps the function non-mutating — `sort` reorders in place and returns the same array, so `[...items]` is not cosmetic. The comparator loop expresses "break ties with the next key" directly: it returns as soon as a key disagrees and falls through to the next only on a tie. Comparing with `<` and `>` rather than subtracting is what lets the same comparator handle strings and numbers; `"b" - "a"` is `NaN`, and a comparator returning `NaN` produces an unspecified order. Returning 0 for a total tie is what preserves the original order, since `Array.prototype.sort` has been required to be stable since ES2019.',
  },

  {
    id: 'ch-arr-range',
    slug: 'building-a-range',
    title: 'Building a Range',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'loops', 'errors'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `range(start, end, step = 1)` returning the numbers from `start` up to but **not including** `end`. A negative step counts downward. When the step points away from `end` — counting up when `end` is below `start`, for instance — there are no values to produce, so return an empty array rather than looping forever. A step of 0 can never terminate: throw a `RangeError`.',
    examples: [
      'range(0, 5);        // [0, 1, 2, 3, 4]',
      'range(5, 0, -1);    // [5, 4, 3, 2, 1]',
      'range(0, 10, 3);    // [0, 3, 6, 9]',
      'range(5, 0);        // []',
    ],
    constraints: ['`end` is exclusive.', '`step` defaults to 1.', 'A step of 0 throws a `RangeError`.'],
    starterCode: 'function range(start, end, step = 1) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts up', body: 'expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);' },
      { name: 'excludes the end', body: 'expect(range(0, 1)).toEqual([0]);' },
      { name: 'an empty range when start equals end', body: 'expect(range(3, 3)).toEqual([]);' },
      { name: 'counts down with a negative step', body: 'expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);' },
      { name: 'honours a step larger than one', body: 'expect(range(0, 10, 3)).toEqual([0, 3, 6, 9]);' },
      { name: 'a step that overshoots still excludes the end', body: 'expect(range(0, 9, 3)).toEqual([0, 3, 6]);' },
      { name: 'an impossible upward range is empty', body: 'expect(range(5, 0)).toEqual([]);' },
      { name: 'an impossible downward range is empty', body: 'expect(range(0, 5, -1)).toEqual([]);' },
      { name: 'handles negative bounds', body: 'expect(range(-2, 2)).toEqual([-2, -1, 0, 1]);' },
      { name: 'rejects a step of zero', body: 'expect(() => range(0, 5, 0)).toThrow(RangeError);' },
      { name: 'works with a fractional step', body: 'expect(range(0, 1, 0.5)).toEqual([0, 0.5]);', hidden: true },
    ],
    hints: [
      'The loop condition differs depending on the direction: counting up you stop at `>= end`, counting down at `<= end`.',
      'Rather than two loops, pick the comparison once based on the sign of the step.',
      'The "impossible range" cases need no special handling — with the right condition the loop simply never runs.',
    ],
    solution:
      'function range(start, end, step = 1) {\n' +
      '  if (step === 0) throw new RangeError("step must not be zero");\n' +
      '  const out = [];\n' +
      '  if (step > 0) {\n' +
      '    for (let n = start; n < end; n += step) out.push(n);\n' +
      '  } else {\n' +
      '    for (let n = start; n > end; n += step) out.push(n);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Splitting on the sign of the step once, outside the loop, is cleaner than testing the direction on every iteration — and it makes the exclusive-end rule obvious in both directions. The "impossible range" cases need no code at all: with `start` of 5 and `end` of 0 counting up, `5 < 0` is false on the first check and the loop body never runs. The zero-step guard is the one case that genuinely cannot be expressed as an empty result: the condition would stay true forever and `n` would never move, so throwing is the only honest answer.',
  },

  {
    id: 'ch-arr-count-by',
    slug: 'tallying-with-count-by',
    title: 'Tallying with countBy',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order', 'data-structures'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `countBy(items, keyFn)` returning a `Map` from each computed key to how many items produced it. Unlike grouping, only the counts are kept. Keys appear in first-seen order. This is the shape you want for a histogram or a "how many of each status" summary.',
    examples: [
      'countBy(["ant", "bee", "ape"], (w) => w[0]);\n// Map { "a" => 2, "b" => 1 }',
      'countBy([1, 2, 3, 4], (n) => n % 2);\n// Map { 1 => 2, 0 => 2 }',
    ],
    constraints: ['Return a `Map`.', 'Keys appear in the order first encountered.', 'An empty input gives an empty `Map`.'],
    starterCode: 'function countBy(items, keyFn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts by a computed key', body: 'const m = countBy(["ant", "bee", "ape"], (w) => w[0]); expect(m.get("a")).toBe(2); expect(m.get("b")).toBe(1);' },
      { name: 'returns a Map', body: 'expect(countBy([1], (n) => n) instanceof Map).toBe(true);' },
      { name: 'keeps numeric keys numeric', body: 'const m = countBy([1, 2, 3, 4], (n) => n % 2); expect(m.get(1)).toBe(2); expect(m.get(0)).toBe(2);' },
      { name: 'reports the number of distinct keys', body: 'expect(countBy([1, 1, 2], (n) => n).size).toBe(2);' },
      { name: 'an empty input gives an empty map', body: 'expect(countBy([], (x) => x).size).toBe(0);' },
      { name: 'preserves first-seen key order', body: 'expect([...countBy(["b", "a", "b"], (x) => x).keys()]).toEqual(["b", "a"]);' },
      { name: 'the counts sum to the input length', body: 'const m = countBy([1, 2, 2, 3, 3, 3], (n) => n); let total = 0; for (const c of m.values()) total += c; expect(total).toBe(6);' },
      { name: 'handles a constant key', body: 'expect(countBy([1, 2, 3], () => "all").get("all")).toBe(3);' },
      { name: 'is unaffected by inherited names', body: 'expect(countBy(["x", "y"], () => "toString").get("toString")).toBe(2);', hidden: true },
    ],
    hints: [
      'Same shape as grouping, but the value you store is a number rather than an array.',
      '`(counts.get(key) ?? 0) + 1` handles both the first sighting and every later one in a single expression.',
      'Use `??` rather than `||` so a stored count of 0 would not be mistaken for absence — it cannot happen here, but the habit matters.',
    ],
    solution:
      'function countBy(items, keyFn) {\n' +
      '  const counts = new Map();\n' +
      '  for (const item of items) {\n' +
      '    const key = keyFn(item);\n' +
      '    counts.set(key, (counts.get(key) ?? 0) + 1);\n' +
      '  }\n' +
      '  return counts;\n' +
      '}\n',
    solutionExplanation:
      'The whole function is one accumulation expression. `counts.get(key)` returns `undefined` for a key never seen, and `?? 0` turns that into a starting count without needing an `if`. The `??` is deliberate over `||`: they behave identically here, but `||` would also replace a legitimate stored `0`, and copying this pattern into a context where 0 is a real value is a common way to introduce a bug. As with grouping, the `Map` keeps `1` and `"1"` distinct and treats `"toString"` as an ordinary key.',
  },

  {
    id: 'ch-arr-moving-average',
    slug: 'moving-average',
    title: 'Moving Average',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'numbers', 'algorithms'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `movingAverage(values, span)` returning the average of every consecutive group of `span` values. For an input of length n and a span of s, the result has n - s + 1 entries; when the span exceeds the input length there are no complete groups, so return an empty array. Recomputing each group\'s sum from scratch costs O(n×s) — do it in a single pass instead by adjusting a running total.',
    examples: [
      'movingAverage([1, 2, 3, 4], 2);  // [1.5, 2.5, 3.5]',
      'movingAverage([1, 2, 3], 3);     // [2]',
      'movingAverage([1, 2], 5);        // []',
    ],
    constraints: ['`span` is an integer of at least 1.', 'Values are finite numbers.', 'One test uses 100,000 values; a nested-loop solution will be too slow.'],
    starterCode: 'function movingAverage(values, span) {\n  // Your code here\n}\n',
    tests: [
      { name: 'averages consecutive pairs', body: 'expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1.5, 2.5, 3.5]);' },
      { name: 'a span equal to the length gives one value', body: 'expect(movingAverage([1, 2, 3], 3)).toEqual([2]);' },
      { name: 'a span larger than the length gives nothing', body: 'expect(movingAverage([1, 2], 5)).toEqual([]);' },
      { name: 'a span of one returns the values themselves', body: 'expect(movingAverage([4, 7], 1)).toEqual([4, 7]);' },
      { name: 'an empty input gives an empty result', body: 'expect(movingAverage([], 2)).toEqual([]);' },
      { name: 'produces the right number of entries', body: 'expect(movingAverage([1, 2, 3, 4, 5], 3).length).toBe(3);' },
      { name: 'handles negative values', body: 'expect(movingAverage([-2, 2, -2, 2], 2)).toEqual([0, 0, 0]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; movingAverage(xs, 2); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'averages a longer span correctly', body: 'expect(movingAverage([1, 2, 3, 4, 5, 6], 3)).toEqual([2, 3, 4, 5]);' },
      {
        name: 'stays fast on a large input',
        body:
          'const xs = Array.from({ length: 100000 }, (_, i) => i % 7);\n' +
          'const out = movingAverage(xs, 500);\n' +
          'expect(out.length).toBe(99501);\n' +
          'expect(out[0]).toBeCloseTo(2.988, 6);',
        hidden: true,
      },
    ],
    hints: [
      'Sum the first group directly. After that, each new group differs from the previous one by exactly two values.',
      'Moving one position along means adding the value entering the group and subtracting the value leaving it.',
      'Track the running total, not the running average — dividing once per output entry keeps the arithmetic exact.',
    ],
    solution:
      'function movingAverage(values, span) {\n' +
      '  if (span > values.length) return [];\n' +
      '  let total = 0;\n' +
      '  for (let i = 0; i < span; i += 1) total += values[i];\n' +
      '  const out = [total / span];\n' +
      '  for (let i = span; i < values.length; i += 1) {\n' +
      '    total += values[i] - values[i - span];\n' +
      '    out.push(total / span);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'This is the sliding-total technique: once the first group is summed, moving one position along changes the total by exactly two terms — the value entering and the value leaving — so each subsequent average costs one addition and one subtraction rather than `span` of them. On the large test that is 100,000 operations instead of 50 million. Keeping a running *total* rather than a running *average* matters for accuracy: repeatedly scaling an average by the span and back would accumulate floating-point drift, whereas the total is only divided at the moment it is reported.',
  },

  {
    id: 'ch-arr-unique-by',
    slug: 'deduplicate-by-identity',
    title: 'Deduplicate by Identity',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order', 'data-structures'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `uniqueBy(items, keyFn)` removing duplicates where "duplicate" means "produces the same key", keeping the **first** item for each key. This is what you need for a list of records that arrive more than once but are only equal by their id, not by object identity — `new Set(items)` would keep all of them, since two distinct objects are never the same value.',
    examples: [
      'uniqueBy([{ id: 1, v: "a" }, { id: 1, v: "b" }], (r) => r.id);\n// [{ id: 1, v: "a" }]',
      'uniqueBy(["apple", "avocado", "beet"], (w) => w[0]);\n// ["apple", "beet"]',
    ],
    constraints: ['Keep the first item for each key, not the last.', 'Preserve the original order.', 'Do not mutate the input.'],
    starterCode: 'function uniqueBy(items, keyFn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'removes duplicate keys', body: 'expect(uniqueBy(["apple", "avocado", "beet"], (w) => w[0])).toEqual(["apple", "beet"]);' },
      { name: 'keeps the first of each key', body: 'const rows = [{ id: 1, v: "a" }, { id: 1, v: "b" }]; expect(uniqueBy(rows, (r) => r.id)[0].v).toBe("a");' },
      { name: 'keeps distinct objects with distinct keys', body: 'const rows = [{ id: 1 }, { id: 2 }]; expect(uniqueBy(rows, (r) => r.id).length).toBe(2);' },
      { name: 'preserves order', body: 'expect(uniqueBy([3, 1, 3, 2], (n) => n)).toEqual([3, 1, 2]);' },
      { name: 'an empty input gives an empty result', body: 'expect(uniqueBy([], (x) => x)).toEqual([]);' },
      { name: 'an all-distinct input is unchanged', body: 'expect(uniqueBy([1, 2, 3], (n) => n)).toEqual([1, 2, 3]);' },
      { name: 'an all-identical input keeps one', body: 'expect(uniqueBy([1, 1, 1], (n) => n)).toEqual([1]);' },
      { name: 'returns the original items, not copies', body: 'const a = { id: 1 }; expect(uniqueBy([a, { id: 1 }], (r) => r.id)[0]).toBe(a);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 1, 2]; uniqueBy(xs, (n) => n); expect(xs).toEqual([1, 1, 2]);' },
      { name: 'keeps falsy keys apart', body: 'expect(uniqueBy([0, "", false, 0], (x) => x).length).toBe(3);', hidden: true },
      { name: 'does not stringify keys', body: 'expect(uniqueBy([1, "1"], (x) => x).length).toBe(2);', hidden: true },
    ],
    hints: [
      'Track the keys you have already emitted in a `Set`, and skip any item whose key is already there.',
      'Push the item itself, not the key — the output is a filtered list of the originals.',
      'A `Set` rather than an array of seen keys is what keeps this linear; `seen.includes(key)` would rescan on every element.',
    ],
    solution:
      'function uniqueBy(items, keyFn) {\n' +
      '  const seen = new Set();\n' +
      '  const out = [];\n' +
      '  for (const item of items) {\n' +
      '    const key = keyFn(item);\n' +
      '    if (seen.has(key)) continue;\n' +
      '    seen.add(key);\n' +
      '    out.push(item);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Because the walk runs front to back and each key is added the moment it is first seen, the item kept is always the first — reversing that to keep the last would mean overwriting entries rather than skipping them. Pushing `item` rather than `key` is what makes this a filter rather than a projection, and the identity test confirms the original object comes back untouched. The `Set` keeps the whole thing linear and, unlike a plain object used as a lookup, keeps `0`, `""` and `false` as three distinct keys instead of collapsing them into the strings `"0"`, `""` and `"false"`.',
  },

  {
    id: 'ch-arr-transpose',
    slug: 'transpose-a-matrix',
    title: 'Transpose a Matrix',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'loops', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `transpose(matrix)` turning an array of rows into an array of columns, so a 2×3 matrix becomes 3×2. The input must be rectangular: if the rows have differing lengths there is no well-defined transpose, so throw a `TypeError`. An empty matrix transposes to an empty matrix. Do not modify the input.',
    examples: [
      'transpose([[1, 2, 3], [4, 5, 6]]);\n// [[1, 4], [2, 5], [3, 6]]',
      'transpose([]);  // []',
    ],
    constraints: ['Rows must all have the same length.', 'A matrix of empty rows transposes to an empty array.', 'Do not mutate the input.'],
    starterCode: 'function transpose(matrix) {\n  // Your code here\n}\n',
    tests: [
      { name: 'transposes a rectangular matrix', body: 'expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);' },
      { name: 'transposes a square matrix', body: 'expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]]);' },
      { name: 'transposes a single row into a column', body: 'expect(transpose([[1, 2, 3]])).toEqual([[1], [2], [3]]);' },
      { name: 'transposes a single column into a row', body: 'expect(transpose([[1], [2]])).toEqual([[1, 2]]);' },
      { name: 'an empty matrix stays empty', body: 'expect(transpose([])).toEqual([]);' },
      { name: 'a matrix of empty rows gives an empty result', body: 'expect(transpose([[], []])).toEqual([]);' },
      { name: 'transposing twice returns the original', body: 'const m = [[1, 2, 3], [4, 5, 6]]; expect(transpose(transpose(m))).toEqual(m);' },
      { name: 'does not mutate the input', body: 'const m = [[1, 2], [3, 4]]; transpose(m); expect(m).toEqual([[1, 2], [3, 4]]);' },
      { name: 'rejects a ragged matrix', body: 'expect(() => transpose([[1, 2], [3]])).toThrow(TypeError);' },
      { name: 'rejects a ragged matrix whichever row is short', body: 'expect(() => transpose([[1], [2, 3]])).toThrow(TypeError);', hidden: true },
      { name: 'handles a larger matrix', body: 'const m = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]; expect(transpose(m)[3]).toEqual([4, 8, 12]);', hidden: true },
    ],
    hints: [
      'The element at row r, column c of the input belongs at row c, column r of the output.',
      'The output has as many rows as the input has columns — so the outer loop runs over the *first row\'s* length.',
      'Check rectangularity before building anything, otherwise a short row shows up as an `undefined` hole halfway through.',
    ],
    solution:
      'function transpose(matrix) {\n' +
      '  if (matrix.length === 0) return [];\n' +
      '  const width = matrix[0].length;\n' +
      '  for (const row of matrix) {\n' +
      '    if (row.length !== width) throw new TypeError("matrix rows must all be the same length");\n' +
      '  }\n' +
      '  const out = [];\n' +
      '  for (let c = 0; c < width; c += 1) {\n' +
      '    const column = [];\n' +
      '    for (let r = 0; r < matrix.length; r += 1) column.push(matrix[r][c]);\n' +
      '    out.push(column);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The loops are swapped relative to the input: the outer one walks columns and the inner one walks rows, which is exactly what "the element at (r, c) moves to (c, r)" means in code. Validating rectangularity up front rather than during the build is what turns a ragged input into a clear `TypeError` instead of an output quietly peppered with `undefined`. Both empty cases fall out naturally — an empty matrix returns early, and a matrix of empty rows has a width of 0, so the outer loop never runs and the result is `[]`, which is the correct transpose of an n×0 matrix.',
  },

  {
    id: 'ch-arr-spiral',
    slug: 'spiral-matrix-order',
    title: 'Spiral Matrix Order',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['arrays', 'loops', 'algorithms'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `spiralOrder(matrix)` reading a rectangular matrix in a clockwise spiral — the top row left to right, then the right column top to bottom, then the bottom row right to left, then the left column bottom to top, then inward — and returning the values as a flat array. Handle non-square matrices and single rows or columns correctly.',
    examples: [
      'spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);\n// [1, 2, 3, 6, 9, 8, 7, 4, 5]',
      'spiralOrder([[1, 2, 3, 4]]);\n// [1, 2, 3, 4]',
    ],
    constraints: ['The matrix is rectangular.', 'It may be empty, a single row, or a single column.', 'Every element appears exactly once in the output.'],
    starterCode: 'function spiralOrder(matrix) {\n  // Your code here\n}\n',
    tests: [
      { name: 'spirals a 3x3', body: 'expect(spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toEqual([1, 2, 3, 6, 9, 8, 7, 4, 5]);' },
      { name: 'spirals a wide matrix', body: 'expect(spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8]])).toEqual([1, 2, 3, 4, 8, 7, 6, 5]);' },
      { name: 'spirals a tall matrix', body: 'expect(spiralOrder([[1, 2], [3, 4], [5, 6]])).toEqual([1, 2, 4, 6, 5, 3]);' },
      { name: 'a single row is read left to right', body: 'expect(spiralOrder([[1, 2, 3, 4]])).toEqual([1, 2, 3, 4]);' },
      { name: 'a single column is read top to bottom', body: 'expect(spiralOrder([[1], [2], [3]])).toEqual([1, 2, 3]);' },
      { name: 'a single element', body: 'expect(spiralOrder([[7]])).toEqual([7]);' },
      { name: 'an empty matrix', body: 'expect(spiralOrder([])).toEqual([]);' },
      { name: 'a 2x2', body: 'expect(spiralOrder([[1, 2], [3, 4]])).toEqual([1, 2, 4, 3]);' },
      { name: 'a 4x4 reaches the inner ring', body: 'expect(spiralOrder([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])).toEqual([1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10]);' },
      {
        name: 'every element appears exactly once',
        body:
          'const m = Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => r * 7 + c));\n' +
          'const out = spiralOrder(m);\n' +
          'expect(out.length).toBe(35);\n' +
          'expect([...out].sort((a, b) => a - b)).toEqual(Array.from({ length: 35 }, (_, i) => i));',
        hidden: true,
      },
      { name: 'a 3x1 column', body: 'expect(spiralOrder([[1], [2], [3]]).length).toBe(3);', hidden: true },
    ],
    hints: [
      'Track four boundaries — top, bottom, left and right — and shrink them as each edge is consumed.',
      'After walking the top row, increment `top`; after the right column, decrement `right`; and so on. Loop while `top <= bottom` and `left <= right`.',
      'The bottom row and left column need a guard: in a single-row matrix, walking the bottom row would re-read the top row you just consumed.',
    ],
    solution:
      'function spiralOrder(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return [];\n' +
      '  const out = [];\n' +
      '  let top = 0;\n' +
      '  let bottom = matrix.length - 1;\n' +
      '  let left = 0;\n' +
      '  let right = matrix[0].length - 1;\n' +
      '\n' +
      '  while (top <= bottom && left <= right) {\n' +
      '    for (let c = left; c <= right; c += 1) out.push(matrix[top][c]);\n' +
      '    top += 1;\n' +
      '\n' +
      '    for (let r = top; r <= bottom; r += 1) out.push(matrix[r][right]);\n' +
      '    right -= 1;\n' +
      '\n' +
      '    if (top <= bottom) {\n' +
      '      for (let c = right; c >= left; c -= 1) out.push(matrix[bottom][c]);\n' +
      '      bottom -= 1;\n' +
      '    }\n' +
      '\n' +
      '    if (left <= right) {\n' +
      '      for (let r = bottom; r >= top; r -= 1) out.push(matrix[r][left]);\n' +
      '      left += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The four boundaries turn a shape problem into a bookkeeping problem: each edge is walked, then its boundary moves inward so the next ring is strictly smaller. The two guards before the bottom row and left column are where most implementations break. Consider a single-row matrix: the top row is consumed and `top` moves past `bottom`, so without the `top <= bottom` check the bottom-row walk would re-read the same row backwards and duplicate everything. The same happens to the left column in a single-column matrix, which is why that guard checks `left <= right`. The hidden test on a 5×7 matrix verifies the invariant that actually matters — every element exactly once, nothing dropped and nothing repeated.',
  },

  {
    id: 'ch-arr-chunk-while',
    slug: 'split-on-a-boundary',
    title: 'Split on a Boundary',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'higher-order', 'loops'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `chunkWhile(items, shouldContinue)` grouping consecutive elements into runs. `shouldContinue(previous, current)` is asked, for each adjacent pair, whether `current` belongs in the same run as `previous`; when it returns false a new run starts. This is how you split a sorted list into consecutive stretches, or a log into sessions with a gap between them.',
    examples: [
      'chunkWhile([1, 2, 4, 5, 7], (a, b) => b === a + 1);\n// [[1, 2], [4, 5], [7]]',
      'chunkWhile([1, 1, 2, 2], (a, b) => a === b);\n// [[1, 1], [2, 2]]',
    ],
    constraints: ['The callback is only asked about adjacent pairs, so it runs `items.length - 1` times.', 'An empty input gives an empty array.', 'Every element appears in exactly one run.'],
    starterCode: 'function chunkWhile(items, shouldContinue) {\n  // Your code here\n}\n',
    tests: [
      { name: 'splits into consecutive runs', body: 'expect(chunkWhile([1, 2, 4, 5, 7], (a, b) => b === a + 1)).toEqual([[1, 2], [4, 5], [7]]);' },
      { name: 'groups equal neighbours', body: 'expect(chunkWhile([1, 1, 2, 2], (a, b) => a === b)).toEqual([[1, 1], [2, 2]]);' },
      { name: 'an always-true predicate gives one run', body: 'expect(chunkWhile([1, 2, 3], () => true)).toEqual([[1, 2, 3]]);' },
      { name: 'an always-false predicate gives singletons', body: 'expect(chunkWhile([1, 2, 3], () => false)).toEqual([[1], [2], [3]]);' },
      { name: 'a single element gives one run', body: 'expect(chunkWhile([1], () => true)).toEqual([[1]]);' },
      { name: 'an empty input gives no runs', body: 'expect(chunkWhile([], () => true)).toEqual([]);' },
      { name: 'calls the callback once per adjacent pair', body: 'let calls = 0; chunkWhile([1, 2, 3, 4], () => { calls += 1; return true; }); expect(calls).toBe(3);' },
      { name: 'passes previous then current', body: 'const pairs = []; chunkWhile([1, 2, 3], (a, b) => { pairs.push([a, b]); return true; }); expect(pairs).toEqual([[1, 2], [2, 3]]);' },
      { name: 'every element appears exactly once', body: 'expect(chunkWhile([5, 6, 1, 9], (a, b) => b === a + 1).flat()).toEqual([5, 6, 1, 9]);' },
      { name: 'splits a session log on a gap', body: 'expect(chunkWhile([0, 5, 9, 400, 405], (a, b) => b - a < 60)).toEqual([[0, 5, 9], [400, 405]]);', hidden: true },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 4]; chunkWhile(xs, (a, b) => b === a + 1); expect(xs).toEqual([1, 2, 4]);', hidden: true },
    ],
    hints: [
      'The first element always starts a run — there is no previous element to compare it to.',
      'From the second element onward, ask the callback about it and its predecessor: continue the current run, or push the current run and start a new one.',
      'Handle the empty input before you start, since otherwise you would push an empty first run.',
    ],
    solution:
      'function chunkWhile(items, shouldContinue) {\n' +
      '  if (items.length === 0) return [];\n' +
      '  const out = [];\n' +
      '  let run = [items[0]];\n' +
      '  for (let i = 1; i < items.length; i += 1) {\n' +
      '    if (shouldContinue(items[i - 1], items[i])) {\n' +
      '      run.push(items[i]);\n' +
      '    } else {\n' +
      '      out.push(run);\n' +
      '      run = [items[i]];\n' +
      '    }\n' +
      '  }\n' +
      '  out.push(run);\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Seeding the first run with `items[0]` and starting the loop at index 1 is what makes the callback contract honest: it is only ever asked about pairs that actually exist, so it runs exactly `length - 1` times. The final `out.push(run)` outside the loop is easy to forget and drops the last group entirely — the always-true test, which produces exactly one run and never enters the else branch, is the one that catches it. The empty-input guard is needed because that unconditional final push would otherwise emit an empty run.',
  },
];

export default challenges;
