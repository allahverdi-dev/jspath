import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Objects & Data Shaping';

export const challenges = [
  {
    id: 'ch-obj-pick-omit',
    slug: 'pick-and-omit',
    title: 'Pick and Omit',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['objects', 'object-utilities'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write two functions. `pick(source, keys)` returns a new object with only the listed keys that the source actually has — a key that is absent stays absent rather than appearing as `undefined`. `omit(source, keys)` returns a new object with those keys removed. Neither may modify the source, and neither should copy inherited properties.',
    examples: [
      'pick({ a: 1, b: 2, c: 3 }, ["a", "c"]);   // { a: 1, c: 3 }',
      'pick({ a: 1 }, ["a", "zzz"]);             // { a: 1 }',
      'omit({ a: 1, b: 2 }, ["a"]);              // { b: 2 }',
    ],
    constraints: ['Do not mutate the source.', 'Only own properties are considered.', 'A requested key that does not exist is silently skipped.'],
    starterCode: 'function pick(source, keys) {\n  // Your code here\n}\n\nfunction omit(source, keys) {\n  // Your code here\n}\n',
    tests: [
      { name: 'picks the listed keys', body: 'expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });' },
      { name: 'skips a key that is absent', body: 'expect(pick({ a: 1 }, ["a", "zzz"])).toEqual({ a: 1 });' },
      { name: 'a missing key does not appear as undefined', body: 'expect("zzz" in pick({ a: 1 }, ["zzz"])).toBe(false);' },
      { name: 'picks a key whose value is undefined', body: 'expect("u" in pick({ u: undefined }, ["u"])).toBe(true);' },
      { name: 'picking nothing gives an empty object', body: 'expect(pick({ a: 1 }, [])).toEqual({});' },
      { name: 'omits the listed keys', body: 'expect(omit({ a: 1, b: 2 }, ["a"])).toEqual({ b: 2 });' },
      { name: 'omitting nothing copies everything', body: 'expect(omit({ a: 1, b: 2 }, [])).toEqual({ a: 1, b: 2 });' },
      { name: 'omitting everything gives an empty object', body: 'expect(omit({ a: 1 }, ["a"])).toEqual({});' },
      { name: 'omit ignores unknown keys', body: 'expect(omit({ a: 1 }, ["zzz"])).toEqual({ a: 1 });' },
      { name: 'neither mutates the source', body: 'const s = { a: 1, b: 2 }; pick(s, ["a"]); omit(s, ["a"]); expect(s).toEqual({ a: 1, b: 2 });' },
      { name: 'both return new objects', body: 'const s = { a: 1 }; expect(pick(s, ["a"])).not.toBe(s); expect(omit(s, [])).not.toBe(s);' },
      { name: 'does not copy inherited properties', body: 'const proto = { inherited: 1 }; const s = Object.create(proto); s.own = 2; expect(omit(s, [])).toEqual({ own: 2 });', hidden: true },
      { name: 'pick does not resolve inherited keys', body: 'const s = Object.create({ secret: 1 }); expect(pick(s, ["secret"])).toEqual({});', hidden: true },
    ],
    hints: [
      'For `pick`, walk the requested keys and copy each one that the source owns. For `omit`, walk the source\'s own keys and copy each one not in the list.',
      '`Object.hasOwn(source, key)` is the test that distinguishes "present with an undefined value" from "not there at all" — `source[key] !== undefined` cannot.',
      'A `Set` of the omitted keys makes the exclusion check constant-time and reads better than `keys.includes(key)`.',
    ],
    solution:
      'function pick(source, keys) {\n' +
      '  const out = {};\n' +
      '  for (const key of keys) {\n' +
      '    if (Object.hasOwn(source, key)) out[key] = source[key];\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function omit(source, keys) {\n' +
      '  const drop = new Set(keys);\n' +
      '  const out = {};\n' +
      '  for (const key of Object.keys(source)) {\n' +
      '    if (!drop.has(key)) out[key] = source[key];\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The two functions iterate different things, and that is the whole design: `pick` walks the requested keys because the result is defined by them, while `omit` walks the source because the result is defined by what is there. `Object.hasOwn` is what makes the `{ u: undefined }` case correct — checking `source[key] !== undefined` would drop a key that genuinely exists with an undefined value, and would also happily copy an inherited property. `Object.keys` only lists own enumerable properties, which is why `omit` never leaks anything from the prototype either.',
  },

  {
    id: 'ch-obj-deep-get',
    slug: 'reading-a-nested-path',
    title: 'Reading a Nested Path',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'strings', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `getPath(source, path, fallback)` reading a value out of a nested structure using a string path like `"user.roles[0].name"`. Both dot and bracket notation must work, and bracket indices address array positions. If any step along the way is missing — or the path runs into `null` — return `fallback` (default `undefined`) instead of throwing. A stored value of `undefined` also yields the fallback; a stored `null` does not.',
    examples: [
      'getPath({ a: { b: [{ c: 1 }] } }, "a.b[0].c");   // 1',
      'getPath({}, "a.b.c", "none");                    // "none"',
      'getPath({ a: null }, "a.b", "none");             // "none"',
    ],
    constraints: ['Paths use `.` for properties and `[n]` for indices.', 'Never throw on a missing intermediate step.', 'The fallback defaults to `undefined`.'],
    starterCode: 'function getPath(source, path, fallback) {\n  // Your code here\n}\n',
    tests: [
      { name: 'reads a nested property', body: 'expect(getPath({ a: { b: 2 } }, "a.b")).toBe(2);' },
      { name: 'reads through a bracket index', body: 'expect(getPath({ a: { b: [{ c: 1 }] } }, "a.b[0].c")).toBe(1);' },
      { name: 'reads a top-level property', body: 'expect(getPath({ a: 1 }, "a")).toBe(1);' },
      { name: 'reads an index from a top-level array', body: 'expect(getPath({ xs: [10, 20] }, "xs[1]")).toBe(20);' },
      { name: 'falls back on a missing path', body: 'expect(getPath({}, "a.b.c", "none")).toBe("none");' },
      { name: 'falls back rather than throwing on null', body: 'expect(getPath({ a: null }, "a.b", "none")).toBe("none");' },
      { name: 'falls back on an out-of-range index', body: 'expect(getPath({ xs: [] }, "xs[3]", "none")).toBe("none");' },
      { name: 'the fallback defaults to undefined', body: 'expect(getPath({}, "nope")).toBe(undefined);' },
      { name: 'returns a stored null rather than the fallback', body: 'expect(getPath({ a: null }, "a", "none")).toBe(null);' },
      { name: 'returns a stored false rather than the fallback', body: 'expect(getPath({ a: false }, "a", "none")).toBe(false);' },
      { name: 'returns a stored zero rather than the fallback', body: 'expect(getPath({ a: 0 }, "a", "none")).toBe(0);' },
      { name: 'handles consecutive indices', body: 'expect(getPath({ g: [[1, 2], [3, 4]] }, "g[1][0]")).toBe(3);', hidden: true },
      { name: 'a stored undefined yields the fallback', body: 'expect(getPath({ a: undefined }, "a", "none")).toBe("none");', hidden: true },
    ],
    hints: [
      'Turn the path into a list of steps first. Replacing `[n]` with `.n` lets you split the whole thing on dots.',
      'Walk the steps, moving a cursor down one level at a time, and bail out the moment the cursor is `null` or `undefined`.',
      'Do not use `||` to apply the fallback — a stored `0` or `false` is a real value. Compare against `undefined` explicitly.',
    ],
    solution:
      'function getPath(source, path, fallback) {\n' +
      '  const steps = path\n' +
      '    .replace(/\\[(\\d+)\\]/g, ".$1")\n' +
      '    .split(".")\n' +
      '    .filter((s) => s !== "");\n' +
      '  let cursor = source;\n' +
      '  for (const step of steps) {\n' +
      '    if (cursor === null || cursor === undefined) return fallback;\n' +
      '    cursor = cursor[step];\n' +
      '  }\n' +
      '  return cursor === undefined ? fallback : cursor;\n' +
      '}\n',
    solutionExplanation:
      'Normalising `[0]` into `.0` before splitting means the walk itself never has to distinguish array indices from property names — JavaScript property access accepts `"0"` on an array and does the right thing. The guard *inside* the loop is what makes the function total rather than throwing: it checks the cursor before dereferencing, so `{ a: null }` with path `"a.b"` returns the fallback instead of raising a TypeError. The final `=== undefined` check rather than a truthiness test is what keeps a stored `0`, `false` or `null` from being silently replaced by the fallback — the three cases the tests pin down individually.',
  },

  {
    id: 'ch-obj-deep-merge',
    slug: 'deep-merge-config',
    title: 'Deep Merge Config',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'recursion', 'copying'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `deepMerge(base, override)` combining two config objects. Where both sides have a plain object at the same key, merge them recursively. Where the override has anything else — a number, a string, an array, `null` — it replaces the base value outright. Arrays are **not** merged element by element; a supplied array replaces the default wholesale, which is what config systems almost always want. Neither input may be modified.',
    examples: [
      'deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 9 } });\n// { a: { x: 1, y: 9 } }',
      'deepMerge({ tags: ["a", "b"] }, { tags: ["c"] });\n// { tags: ["c"] }',
    ],
    constraints: ['Only plain objects are merged recursively.', 'Arrays replace rather than concatenate.', 'Neither input is mutated, at any depth.'],
    starterCode: 'function deepMerge(base, override) {\n  // Your code here\n}\n',
    tests: [
      { name: 'merges nested objects', body: 'expect(deepMerge({ a: { x: 1, y: 2 } }, { a: { y: 9 } })).toEqual({ a: { x: 1, y: 9 } });' },
      { name: 'adds keys the base lacks', body: 'expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });' },
      { name: 'the override wins on a scalar', body: 'expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });' },
      { name: 'arrays replace rather than merge', body: 'expect(deepMerge({ tags: ["a", "b"] }, { tags: ["c"] })).toEqual({ tags: ["c"] });' },
      { name: 'an object replaces a scalar', body: 'expect(deepMerge({ a: 1 }, { a: { b: 2 } })).toEqual({ a: { b: 2 } });' },
      { name: 'a scalar replaces an object', body: 'expect(deepMerge({ a: { b: 2 } }, { a: 1 })).toEqual({ a: 1 });' },
      { name: 'null replaces rather than merging', body: 'expect(deepMerge({ a: { b: 1 } }, { a: null })).toEqual({ a: null });' },
      { name: 'merges three levels deep', body: 'expect(deepMerge({ a: { b: { c: 1, d: 2 } } }, { a: { b: { d: 9 } } })).toEqual({ a: { b: { c: 1, d: 9 } } });' },
      { name: 'an empty override changes nothing', body: 'expect(deepMerge({ a: { b: 1 } }, {})).toEqual({ a: { b: 1 } });' },
      { name: 'does not mutate the base', body: 'const b = { a: { x: 1 } }; deepMerge(b, { a: { y: 2 } }); expect(b).toEqual({ a: { x: 1 } });' },
      { name: 'does not mutate the override', body: 'const o = { a: { y: 2 } }; deepMerge({ a: { x: 1 } }, o); expect(o).toEqual({ a: { y: 2 } });' },
      { name: 'nested results are fresh objects', body: 'const b = { a: { x: 1 } }; const out = deepMerge(b, {}); out.a.x = 99; expect(b.a.x).toBe(1);', hidden: true },
      { name: 'the merged array is not the same reference', body: 'const o = { t: [1] }; const out = deepMerge({}, o); expect(out.t).not.toBe(o.t);', hidden: true },
    ],
    hints: [
      'Start from a copy of the base, then apply each of the override\'s own keys.',
      'A key needs recursion only when *both* sides hold a plain object — anything else is a straight replacement.',
      '`Array.isArray` must be checked before treating a value as a plain object, since arrays are objects too. And watch the "no mutation at any depth" requirement: a shallow copy still shares nested references.',
    ],
    solution:
      'function deepMerge(base, override) {\n' +
      '  const isPlain = (v) => typeof v === "object" && v !== null && !Array.isArray(v);\n' +
      '  const clone = (v) => {\n' +
      '    if (Array.isArray(v)) return v.map(clone);\n' +
      '    if (isPlain(v)) {\n' +
      '      const copy = {};\n' +
      '      for (const k of Object.keys(v)) copy[k] = clone(v[k]);\n' +
      '      return copy;\n' +
      '    }\n' +
      '    return v;\n' +
      '  };\n' +
      '\n' +
      '  const out = clone(base);\n' +
      '  for (const key of Object.keys(override)) {\n' +
      '    const left = out[key];\n' +
      '    const right = override[key];\n' +
      '    out[key] = isPlain(left) && isPlain(right) ? deepMerge(left, right) : clone(right);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The rule is stated once, in the ternary: recurse only when both sides are plain objects, otherwise take a fresh copy of the override value. `isPlain` has to exclude `null` (whose `typeof` is `"object"`) and arrays (which are objects but must replace, not merge) — miss either and the array test or the null test fails. The `clone` helper is what satisfies "no mutation at any depth": `{ ...base }` would produce a new top-level object whose nested objects are still shared with the input, so mutating the result later would reach back into the caller\'s config. That is the difference the last two hidden tests measure.',
  },

  {
    id: 'ch-obj-deep-equal',
    slug: 'structural-equality',
    title: 'Structural Equality',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['objects', 'recursion', 'types'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `deepEqual(a, b)` comparing two values structurally. Primitives compare by `SameValueZero`, so `NaN` equals `NaN` but `0` and `-0` are treated as equal too. Arrays are equal when their lengths and elements match in order. Plain objects are equal when they have the same own keys, in any order, with equal values. `Date` objects compare by their time value. An array and an object with numeric keys are never equal.',
    examples: [
      'deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] });  // true',
      'deepEqual(NaN, NaN);                                     // true',
      'deepEqual([1, 2], { 0: 1, 1: 2 });                       // false',
    ],
    constraints: ['Handle primitives, arrays, plain objects and `Date`.', 'No cyclic inputs are tested.', 'Key order does not affect equality.'],
    starterCode: 'function deepEqual(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'equal primitives', body: 'expect(deepEqual(1, 1)).toBe(true); expect(deepEqual("a", "a")).toBe(true);' },
      { name: 'unequal primitives', body: 'expect(deepEqual(1, 2)).toBe(false);' },
      { name: 'does not coerce across types', body: 'expect(deepEqual(1, "1")).toBe(false);' },
      { name: 'NaN equals NaN', body: 'expect(deepEqual(NaN, NaN)).toBe(true);' },
      { name: 'null does not equal undefined', body: 'expect(deepEqual(null, undefined)).toBe(false);' },
      { name: 'null equals null', body: 'expect(deepEqual(null, null)).toBe(true);' },
      { name: 'equal flat arrays', body: 'expect(deepEqual([1, 2], [1, 2])).toBe(true);' },
      { name: 'order matters in arrays', body: 'expect(deepEqual([1, 2], [2, 1])).toBe(false);' },
      { name: 'length matters in arrays', body: 'expect(deepEqual([1], [1, undefined])).toBe(false);' },
      { name: 'equal nested structures', body: 'expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);' },
      { name: 'key order does not matter', body: 'expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);' },
      { name: 'an extra key makes them unequal', body: 'expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);' },
      { name: 'a missing key makes them unequal', body: 'expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);' },
      { name: 'dates compare by time value', body: 'expect(deepEqual(new Date(0), new Date(0))).toBe(true); expect(deepEqual(new Date(0), new Date(1))).toBe(false);' },
      { name: 'an array never equals a look-alike object', body: 'expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);' },
      { name: 'empty structures', body: 'expect(deepEqual({}, {})).toBe(true); expect(deepEqual([], [])).toBe(true); expect(deepEqual({}, [])).toBe(false);' },
      { name: 'a value equals itself', body: 'const o = { a: { b: 1 } }; expect(deepEqual(o, o)).toBe(true);', hidden: true },
      { name: 'distinguishes deeply', body: 'expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(false);', hidden: true },
    ],
    hints: [
      'Handle the primitive case first, then the special object types, then the general recursion — each layer can assume the earlier ones did not apply.',
      '`Object.is` gives you SameValue, which treats `NaN` as equal to itself but distinguishes `0` from `-0`. SameValueZero is `Object.is(a, b) || (a === 0 && b === 0)`.',
      'For objects, compare the key *counts* first and then check each key of one side exists on the other — comparing counts alone would miss `{a:1}` versus `{b:1}`.',
    ],
    solution:
      'function deepEqual(a, b) {\n' +
      '  if (Object.is(a, b)) return true;\n' +
      '  if (a === 0 && b === 0) return true;\n' +
      '  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;\n' +
      '\n' +
      '  if (a instanceof Date || b instanceof Date) {\n' +
      '    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();\n' +
      '  }\n' +
      '\n' +
      '  const aIsArray = Array.isArray(a);\n' +
      '  if (aIsArray !== Array.isArray(b)) return false;\n' +
      '\n' +
      '  if (aIsArray) {\n' +
      '    if (a.length !== b.length) return false;\n' +
      '    return a.every((value, i) => deepEqual(value, b[i]));\n' +
      '  }\n' +
      '\n' +
      '  const aKeys = Object.keys(a);\n' +
      '  if (aKeys.length !== Object.keys(b).length) return false;\n' +
      '  return aKeys.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));\n' +
      '}\n',
    solutionExplanation:
      'The function is a cascade of narrowing cases, and the order is what keeps each one simple. `Object.is` settles identical references and `NaN`, and the extra `0 === 0` line widens it from SameValue to SameValueZero. Once both sides are known to be non-null objects, `Date` is checked before anything generic — two Dates have no own enumerable keys at all, so the object branch would call every pair of Dates equal. Comparing `Array.isArray` on both sides is what keeps `[1, 2]` from matching `{ 0: 1, 1: 2 }`, which the generic key comparison would otherwise accept. For objects, the key-count check plus a `hasOwn` test on each key is the minimal pair of conditions that catches both extra and renamed keys.',
  },

  {
    id: 'ch-obj-invert',
    slug: 'inverting-a-lookup',
    title: 'Inverting a Lookup',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['objects', 'object-utilities'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `invert(source)` swapping keys and values, so `{ a: "1", b: "2" }` becomes `{ "1": "a", "2": "b" }`. Values become keys, so they are converted to strings — that is unavoidable in a plain object. When two keys share a value, the **last** one wins, matching what a plain assignment loop naturally does. Return a `null`-prototype object so that a value like `"toString"` cannot shadow anything inherited.',
    examples: [
      'invert({ a: "1", b: "2" });   // { "1": "a", "2": "b" }',
      'invert({ a: 1, b: 1 });       // { "1": "b" }',
    ],
    constraints: ['Only own enumerable properties are inverted.', 'Later keys overwrite earlier ones on a value collision.', 'The result has a `null` prototype.'],
    starterCode: 'function invert(source) {\n  // Your code here\n}\n',
    tests: [
      { name: 'swaps keys and values', body: 'const out = invert({ a: "1", b: "2" }); expect(out["1"]).toBe("a"); expect(out["2"]).toBe("b");' },
      { name: 'reads back through bracket access', body: 'const out = invert({ a: "x", b: "y" }); expect(out.x).toBe("a"); expect(out.y).toBe("b");' },
      { name: 'stringifies numeric values into keys', body: 'expect(invert({ a: 1 })["1"]).toBe("a");' },
      { name: 'the last key wins on a collision', body: 'expect(invert({ a: 1, b: 1 })["1"]).toBe("b");' },
      { name: 'an empty object inverts to an empty object', body: 'expect(Object.keys(invert({})).length).toBe(0);' },
      { name: 'preserves the number of distinct values', body: 'expect(Object.keys(invert({ a: 1, b: 2, c: 3 })).length).toBe(3);' },
      { name: 'has a null prototype', body: 'expect(Object.getPrototypeOf(invert({ a: 1 }))).toBe(null);' },
      { name: 'a value of toString does not collide with anything', body: 'const out = invert({ a: "toString" }); expect(out.toString).toBe("a");' },
      { name: 'ignores inherited properties', body: 'const s = Object.create({ inherited: "x" }); s.own = "y"; const out = invert(s); expect(out.y).toBe("own"); expect(out.x).toBe(undefined);', hidden: true },
      { name: 'does not mutate the source', body: 'const s = { a: "1" }; invert(s); expect(s).toEqual({ a: "1" });', hidden: true },
    ],
    hints: [
      '`Object.entries` gives you key/value pairs, which you assign back in the opposite order.',
      '`Object.create(null)` makes an object with no prototype — the safest container for keys that come from data you did not write.',
      'Assigning in iteration order gives you the "last one wins" rule for free; you do not need to detect collisions.',
    ],
    solution:
      'function invert(source) {\n' +
      '  const out = Object.create(null);\n' +
      '  for (const [key, value] of Object.entries(source)) {\n' +
      '    out[String(value)] = key;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Plain-object keys are always strings, so inverting necessarily stringifies the values — `{ a: 1 }` inverts to a key of `"1"`, and two values that stringify the same collapse into one entry. The "last one wins" rule needs no code: assignment in iteration order simply overwrites. The `null` prototype is the part worth internalising. Keys built from data can be anything, including `"toString"` or `"__proto__"`, and on an ordinary object those names collide with inherited machinery. `Object.create(null)` produces a container with nothing to collide with, which is why it is the right default whenever the keys come from outside your code.',
  },

  {
    id: 'ch-obj-flatten',
    slug: 'flatten-nested-keys',
    title: 'Flatten Nested Keys',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'recursion', 'strings'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `flattenKeys(source)` turning a nested object into a flat one whose keys are dotted paths, so `{ a: { b: 1 } }` becomes `{ "a.b": 1 }`. Arrays are flattened too, using their indices as path segments. Only plain objects and arrays are descended into; every other value — including `null` and `Date` — is a leaf. An empty object or array is itself a leaf, since it contributes no paths.',
    examples: [
      'flattenKeys({ a: { b: 1 }, c: 2 });\n// { "a.b": 1, c: 2 }',
      'flattenKeys({ xs: [10, 20] });\n// { "xs.0": 10, "xs.1": 20 }',
    ],
    constraints: ['Path segments are joined with `.`.', '`null` is a leaf, not a container.', 'An empty nested object is preserved as a leaf value.'],
    starterCode: 'function flattenKeys(source) {\n  // Your code here\n}\n',
    tests: [
      { name: 'flattens one level', body: 'expect(flattenKeys({ a: { b: 1 }, c: 2 })).toEqual({ "a.b": 1, c: 2 });' },
      { name: 'flattens several levels', body: 'expect(flattenKeys({ a: { b: { c: 1 } } })).toEqual({ "a.b.c": 1 });' },
      { name: 'leaves a flat object alone', body: 'expect(flattenKeys({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });' },
      { name: 'flattens array indices', body: 'expect(flattenKeys({ xs: [10, 20] })).toEqual({ "xs.0": 10, "xs.1": 20 });' },
      { name: 'flattens objects inside arrays', body: 'expect(flattenKeys({ xs: [{ a: 1 }] })).toEqual({ "xs.0.a": 1 });' },
      { name: 'treats null as a leaf', body: 'expect(flattenKeys({ a: null })).toEqual({ a: null });' },
      { name: 'treats an empty object as a leaf', body: 'expect(flattenKeys({ a: {} })).toEqual({ a: {} });' },
      { name: 'treats an empty array as a leaf', body: 'expect(flattenKeys({ a: [] })).toEqual({ a: [] });' },
      { name: 'an empty source gives an empty result', body: 'expect(flattenKeys({})).toEqual({});' },
      { name: 'keeps a Date whole', body: 'const d = new Date(0); expect(flattenKeys({ d }).d).toBe(d);' },
      { name: 'handles a mixed structure', body: 'expect(flattenKeys({ a: 1, b: { c: [2, { d: 3 }] } })).toEqual({ a: 1, "b.c.0": 2, "b.c.1.d": 3 });', hidden: true },
      { name: 'does not mutate the source', body: 'const s = { a: { b: 1 } }; flattenKeys(s); expect(s).toEqual({ a: { b: 1 } });', hidden: true },
    ],
    hints: [
      'Recurse with an accumulating prefix. At the top level the prefix is empty; one level down it is the key you just descended through.',
      'A value is a container only if it is a plain object or an array *and* it has at least one key — otherwise it is a leaf and contributes a single entry.',
      '`Date` is `typeof "object"`, so a plain `typeof` check would descend into it and produce nothing. Check `constructor` or use a plain-object test.',
    ],
    solution:
      'function flattenKeys(source) {\n' +
      '  const isContainer = (v) =>\n' +
      '    Array.isArray(v) || (typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype);\n' +
      '\n' +
      '  const out = {};\n' +
      '  const walk = (value, prefix) => {\n' +
      '    const keys = isContainer(value) ? Object.keys(value) : [];\n' +
      '    if (keys.length === 0) {\n' +
      '      out[prefix] = value;\n' +
      '      return;\n' +
      '    }\n' +
      '    for (const key of keys) {\n' +
      '      walk(value[key], prefix === "" ? key : prefix + "." + key);\n' +
      '    }\n' +
      '  };\n' +
      '\n' +
      '  for (const key of Object.keys(source)) walk(source[key], key);\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The single condition `keys.length === 0` handles three cases at once — a primitive, a `Date`, and a genuinely empty container — all of which must be emitted as leaves rather than descended into. That is what makes `{ a: {} }` come back as `{ a: {} }` instead of vanishing. The prototype check in `isContainer` is what keeps `Date` whole: `typeof new Date()` is `"object"` and `Object.keys` on it returns `[]`, so a looser test would still emit it as a leaf here, but the check makes the intent explicit and protects class instances too. Building the prefix during the descent, rather than reconstructing paths afterwards, keeps the recursion to one parameter.',
  },

  {
    id: 'ch-obj-map-values',
    slug: 'transform-every-value',
    title: 'Transform Every Value',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['objects', 'higher-order', 'object-utilities'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Objects have no `map`. Write `mapValues(source, fn)` returning a new object with the same keys but each value replaced by `fn(value, key)`. Keys keep their original order, only own enumerable properties are transformed, and the source is untouched.',
    examples: [
      'mapValues({ a: 1, b: 2 }, (n) => n * 10);\n// { a: 10, b: 20 }',
      'mapValues({ a: 1 }, (n, k) => k + n);\n// { a: "a1" }',
    ],
    constraints: ['The callback receives the value then the key.', 'Only own enumerable properties are included.', 'Do not mutate the source.'],
    starterCode: 'function mapValues(source, fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'transforms every value', body: 'expect(mapValues({ a: 1, b: 2 }, (n) => n * 10)).toEqual({ a: 10, b: 20 });' },
      { name: 'keeps the keys', body: 'expect(Object.keys(mapValues({ a: 1, b: 2 }, (n) => n))).toEqual(["a", "b"]);' },
      { name: 'passes the key as the second argument', body: 'expect(mapValues({ a: 1 }, (n, k) => k + n)).toEqual({ a: "a1" });' },
      { name: 'an empty source gives an empty result', body: 'expect(mapValues({}, (n) => n)).toEqual({});' },
      { name: 'calls the callback once per key', body: 'let calls = 0; mapValues({ a: 1, b: 2 }, (n) => { calls += 1; return n; }); expect(calls).toBe(2);' },
      { name: 'preserves key order', body: 'expect(Object.keys(mapValues({ z: 1, a: 2 }, (n) => n))).toEqual(["z", "a"]);' },
      { name: 'does not mutate the source', body: 'const s = { a: 1 }; mapValues(s, (n) => n * 2); expect(s).toEqual({ a: 1 });' },
      { name: 'returns a new object', body: 'const s = { a: 1 }; expect(mapValues(s, (n) => n)).not.toBe(s);' },
      { name: 'can produce undefined values', body: 'const out = mapValues({ a: 1 }, () => undefined); expect("a" in out).toBe(true);' },
      { name: 'ignores inherited properties', body: 'const s = Object.create({ inherited: 1 }); s.own = 2; expect(mapValues(s, (n) => n)).toEqual({ own: 2 });', hidden: true },
    ],
    hints: [
      '`Object.entries` and `Object.fromEntries` turn the problem into an array `map` and back.',
      'A plain loop over `Object.keys` works just as well and allocates less.',
      'Both `Object.keys` and `Object.entries` list only own enumerable properties, so the inherited-property requirement is satisfied automatically.',
    ],
    solution:
      'function mapValues(source, fn) {\n' +
      '  const out = {};\n' +
      '  for (const key of Object.keys(source)) {\n' +
      '    out[key] = fn(source[key], key);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'This is the object counterpart of `Array.prototype.map`, and the reason it has to be written by hand is that `Object.prototype` deliberately carries almost no methods — anything added there would appear on every object in the program. `Object.keys` gives own enumerable properties in insertion order for string keys, which satisfies both the ordering and the inheritance requirements without extra work. Assigning into a fresh `out` rather than the source is what keeps it non-mutating, and it means a callback returning `undefined` still produces a present key, which the tests check explicitly.',
  },

  {
    id: 'ch-obj-is-plain',
    slug: 'is-it-a-plain-object',
    title: 'Is It a Plain Object?',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'types', 'prototypes'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Utility functions constantly need to know "is this a plain data object, or something else?" Write `isPlainObject(value)` returning true only for objects created by an object literal, by `new Object()`, or by `Object.create(null)`. Arrays, `null`, functions, `Date`s, `Map`s, class instances and primitives all return false.',
    examples: [
      'isPlainObject({});                   // true',
      'isPlainObject(Object.create(null));  // true',
      'isPlainObject([]);                   // false',
      'isPlainObject(new Date());           // false',
    ],
    constraints: ['`typeof value === "object"` is not sufficient — `null` and arrays both pass it.', 'A class instance is not a plain object.', 'A `null`-prototype object *is* plain.'],
    starterCode: 'function isPlainObject(value) {\n  // Your code here\n}\n',
    tests: [
      { name: 'an object literal is plain', body: 'expect(isPlainObject({})).toBe(true);' },
      { name: 'an object with properties is plain', body: 'expect(isPlainObject({ a: 1 })).toBe(true);' },
      { name: 'a null-prototype object is plain', body: 'expect(isPlainObject(Object.create(null))).toBe(true);' },
      { name: 'new Object() is plain', body: 'expect(isPlainObject(new Object())).toBe(true);' },
      { name: 'null is not', body: 'expect(isPlainObject(null)).toBe(false);' },
      { name: 'undefined is not', body: 'expect(isPlainObject(undefined)).toBe(false);' },
      { name: 'an array is not', body: 'expect(isPlainObject([])).toBe(false);' },
      { name: 'a function is not', body: 'expect(isPlainObject(() => {})).toBe(false);' },
      { name: 'a Date is not', body: 'expect(isPlainObject(new Date())).toBe(false);' },
      { name: 'a Map is not', body: 'expect(isPlainObject(new Map())).toBe(false);' },
      { name: 'a class instance is not', body: 'class Point {} expect(isPlainObject(new Point())).toBe(false);' },
      { name: 'primitives are not', body: 'expect(isPlainObject(1)).toBe(false); expect(isPlainObject("s")).toBe(false); expect(isPlainObject(true)).toBe(false);' },
      { name: 'an object created from a plain object is not', body: 'expect(isPlainObject(Object.create({ a: 1 }))).toBe(false);', hidden: true },
      { name: 'a RegExp is not', body: 'expect(isPlainObject(/x/)).toBe(false);', hidden: true },
    ],
    hints: [
      'Rule out non-objects first: `typeof value !== "object"` catches primitives and functions, and `value === null` has to be excluded separately.',
      'What actually distinguishes a plain object is its prototype. Get it with `Object.getPrototypeOf`.',
      'There are exactly two acceptable prototypes: `Object.prototype`, and `null` for the `Object.create(null)` case.',
    ],
    solution:
      'function isPlainObject(value) {\n' +
      '  if (typeof value !== "object" || value === null) return false;\n' +
      '  const proto = Object.getPrototypeOf(value);\n' +
      '  return proto === Object.prototype || proto === null;\n' +
      '}\n',
    solutionExplanation:
      'The definition of "plain" is a statement about the prototype chain, so the check is a statement about the prototype chain. Two guards are needed before that: `typeof` rules out primitives and functions, and `null` has to be excluded by hand because `typeof null` is famously `"object"`. Then exactly two prototypes qualify — `Object.prototype` for literals and `new Object()`, and `null` for `Object.create(null)`. Everything else fails for the right reason: an array\'s prototype is `Array.prototype`, a `Date`\'s is `Date.prototype`, a class instance\'s is that class\'s `.prototype` object, and `Object.create({ a: 1 })` has a prototype that is a plain object but is not `Object.prototype` itself.',
  },

  {
    id: 'ch-obj-diff',
    slug: 'diffing-two-records',
    title: 'Diffing Two Records',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'object-utilities', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `diff(before, after)` comparing two flat objects and returning `{ added, removed, changed }`. `added` maps each key only in `after` to its value; `removed` maps each key only in `before` to its old value; `changed` maps each key present in both with a different value to `{ from, to }`. Keys whose values are unchanged appear nowhere. Compare values with `Object.is`, so `NaN` counts as unchanged.',
    examples: [
      'diff({ a: 1, b: 2 }, { b: 3, c: 4 });\n// { added: { c: 4 }, removed: { a: 1 }, changed: { b: { from: 2, to: 3 } } }',
    ],
    constraints: ['Both inputs are flat objects — no nested comparison is required.', 'All three result keys are always present, possibly empty.', 'Use `Object.is` for comparison.'],
    starterCode: 'function diff(before, after) {\n  // Your code here\n}\n',
    tests: [
      { name: 'reports an added key', body: 'expect(diff({}, { a: 1 }).added).toEqual({ a: 1 });' },
      { name: 'reports a removed key', body: 'expect(diff({ a: 1 }, {}).removed).toEqual({ a: 1 });' },
      { name: 'reports a changed value', body: 'expect(diff({ a: 1 }, { a: 2 }).changed).toEqual({ a: { from: 1, to: 2 } });' },
      { name: 'omits unchanged keys entirely', body: 'const d = diff({ a: 1 }, { a: 1 }); expect(d.added).toEqual({}); expect(d.removed).toEqual({}); expect(d.changed).toEqual({});' },
      { name: 'handles all three at once', body: 'const d = diff({ a: 1, b: 2 }, { b: 3, c: 4 }); expect(d.added).toEqual({ c: 4 }); expect(d.removed).toEqual({ a: 1 }); expect(d.changed).toEqual({ b: { from: 2, to: 3 } });' },
      { name: 'always returns all three keys', body: 'const d = diff({}, {}); expect(Object.keys(d).sort()).toEqual(["added", "changed", "removed"]);' },
      { name: 'treats NaN as unchanged', body: 'expect(diff({ a: NaN }, { a: NaN }).changed).toEqual({});' },
      { name: 'a value changing to undefined is a change, not a removal', body: 'const d = diff({ a: 1 }, { a: undefined }); expect(d.changed).toEqual({ a: { from: 1, to: undefined } }); expect(d.removed).toEqual({});' },
      { name: 'a falsy new value is still recorded', body: 'expect(diff({ a: 1 }, { a: 0 }).changed).toEqual({ a: { from: 1, to: 0 } });' },
      { name: 'does not compare by reference for equal literals', body: 'expect(diff({ a: 1 }, { a: 1 }).changed).toEqual({});' },
      { name: 'two distinct objects at the same key count as changed', body: 'expect(Object.keys(diff({ a: {} }, { a: {} }).changed)).toEqual(["a"]);', hidden: true },
      { name: 'does not mutate either input', body: 'const b = { a: 1 }; const a = { a: 2 }; diff(b, a); expect(b).toEqual({ a: 1 }); expect(a).toEqual({ a: 2 });', hidden: true },
    ],
    hints: [
      'Walk `before` first to find removals and changes, then walk `after` to find additions.',
      'Use `Object.hasOwn` for presence rather than checking for `undefined` — a key can legitimately hold `undefined`, which the tests check.',
      '`Object.is` distinguishes present-but-different from equal, and treats `NaN` as equal to itself unlike `===`.',
    ],
    solution:
      'function diff(before, after) {\n' +
      '  const added = {};\n' +
      '  const removed = {};\n' +
      '  const changed = {};\n' +
      '\n' +
      '  for (const key of Object.keys(before)) {\n' +
      '    if (!Object.hasOwn(after, key)) removed[key] = before[key];\n' +
      '    else if (!Object.is(before[key], after[key])) {\n' +
      '      changed[key] = { from: before[key], to: after[key] };\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  for (const key of Object.keys(after)) {\n' +
      '    if (!Object.hasOwn(before, key)) added[key] = after[key];\n' +
      '  }\n' +
      '\n' +
      '  return { added, removed, changed };\n' +
      '}\n',
    solutionExplanation:
      'Two passes with different questions: the first walk over `before` can classify removals and changes because it knows the old value, and the second walk over `after` only needs to find keys the first never saw. `Object.hasOwn` rather than an `undefined` check is what makes `{ a: 1 } → { a: undefined }` a change rather than a removal — a distinction that matters when the diff drives a patch. `Object.is` is chosen over `===` for `NaN`, and it is also honest about object identity: two structurally identical but distinct objects are reported as changed, which is the correct answer for a shallow diff.',
  },

  {
    id: 'ch-obj-set-in',
    slug: 'immutable-nested-update',
    title: 'Immutable Nested Update',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['objects', 'copying', 'recursion'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `setIn(source, path, value)` returning a **new** structure with one deeply nested value replaced, leaving the original untouched. `path` is an array of keys and indices, like `["user", "roles", 0, "name"]`. Only the objects along the path are copied; every branch the path does not touch must remain the same reference as in the original — that structural sharing is what makes this pattern efficient in state management. Missing intermediate steps are created: a numeric key creates an array, a string key creates an object.',
    examples: [
      'setIn({ a: { b: 1, c: 2 } }, ["a", "b"], 9);\n// { a: { b: 9, c: 2 } }  — a new object, original untouched',
      'setIn({}, ["a", 0, "b"], 1);\n// { a: [{ b: 1 }] }',
    ],
    constraints: ['An empty path replaces the whole value.', 'Untouched branches keep their original references.', 'The source is never mutated at any depth.'],
    starterCode: 'function setIn(source, path, value) {\n  // Your code here\n}\n',
    tests: [
      { name: 'sets a shallow key', body: 'expect(setIn({ a: 1 }, ["a"], 2)).toEqual({ a: 2 });' },
      { name: 'sets a nested key', body: 'expect(setIn({ a: { b: 1, c: 2 } }, ["a", "b"], 9)).toEqual({ a: { b: 9, c: 2 } });' },
      { name: 'does not mutate the source', body: 'const s = { a: { b: 1 } }; setIn(s, ["a", "b"], 9); expect(s.a.b).toBe(1);' },
      { name: 'copies the objects along the path', body: 'const s = { a: { b: 1 } }; const out = setIn(s, ["a", "b"], 9); expect(out).not.toBe(s); expect(out.a).not.toBe(s.a);' },
      { name: 'shares untouched branches', body: 'const s = { a: { b: 1 }, keep: { deep: 1 } }; const out = setIn(s, ["a", "b"], 9); expect(out.keep).toBe(s.keep);' },
      { name: 'sets an array index', body: 'expect(setIn({ xs: [1, 2, 3] }, ["xs", 1], 9)).toEqual({ xs: [1, 9, 3] });' },
      { name: 'keeps arrays as arrays', body: 'expect(Array.isArray(setIn({ xs: [1] }, ["xs", 0], 9).xs)).toBe(true);' },
      { name: 'creates a missing object step', body: 'expect(setIn({}, ["a", "b"], 1)).toEqual({ a: { b: 1 } });' },
      { name: 'creates a missing array step for a numeric key', body: 'const out = setIn({}, ["a", 0, "b"], 1); expect(Array.isArray(out.a)).toBe(true); expect(out.a[0].b).toBe(1);' },
      { name: 'an empty path replaces everything', body: 'expect(setIn({ a: 1 }, [], "new")).toBe("new");' },
      { name: 'sets a deep path', body: 'expect(setIn({}, ["a", "b", "c", "d"], 1)).toEqual({ a: { b: { c: { d: 1 } } } });' },
      { name: 'replaces rather than merges at the leaf', body: 'expect(setIn({ a: { b: { keep: 1 } } }, ["a", "b"], 5)).toEqual({ a: { b: 5 } });', hidden: true },
      { name: 'shares siblings at every level', body: 'const s = { a: { x: { deep: 1 }, y: 2 } }; const out = setIn(s, ["a", "y"], 3); expect(out.a.x).toBe(s.a.x);', hidden: true },
    ],
    hints: [
      'This is naturally recursive: copy the current level, then set the remaining path inside the child at the first key.',
      'The base case is an empty path — there is nothing left to descend into, so the value itself is the answer.',
      'Copy an array with `slice()` and an object with a spread. Which one you create for a *missing* step depends on whether the next key is a number.',
    ],
    solution:
      'function setIn(source, path, value) {\n' +
      '  if (path.length === 0) return value;\n' +
      '  const [key, ...rest] = path;\n' +
      '\n' +
      '  let copy;\n' +
      '  if (Array.isArray(source)) copy = source.slice();\n' +
      '  else if (typeof source === "object" && source !== null) copy = { ...source };\n' +
      '  else copy = typeof key === "number" ? [] : {};\n' +
      '\n' +
      '  copy[key] = setIn(copy[key], rest, value);\n' +
      '  return copy;\n' +
      '}\n',
    solutionExplanation:
      'Each recursive call copies exactly one level and delegates the rest, so the objects that get replaced are precisely those on the path — every sibling branch is carried across by the spread or `slice` as the same reference, which is what the sharing tests verify. Structural sharing is not a micro-optimisation here: it is what lets a state container compare an old and new tree with `===` at each node and re-render only the changed subtree. The container-creation branch reads the *current* key rather than the next: when `source` is missing, `typeof key === "number"` tells you an array is wanted at this level. The empty-path base case doubles as the leaf assignment, which is why the leaf replaces rather than merges.',
  },

  {
    id: 'ch-obj-freeze-deep',
    slug: 'deep-freeze',
    title: 'Deep Freeze',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['objects', 'recursion', 'metaprogramming'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      '`Object.freeze` is shallow: it stops the top-level properties changing but leaves nested objects fully mutable. Write `deepFreeze(value)` freezing an object and everything reachable through its own properties, returning the same object. It must survive a structure that contains a cycle — freezing an object that refers back to itself should terminate, not overflow the stack.',
    examples: [
      'const config = deepFreeze({ db: { port: 5432 } });\nconfig.db.port = 1;  // silently ignored (or throws in strict mode)\nconfig.db.port;      // still 5432',
    ],
    constraints: ['Return the same object that was passed in, not a copy.', 'Freeze arrays as well as objects.', 'A cyclic structure must not cause infinite recursion.'],
    starterCode: 'function deepFreeze(value) {\n  // Your code here\n}\n',
    tests: [
      { name: 'freezes the top level', body: 'expect(Object.isFrozen(deepFreeze({ a: 1 }))).toBe(true);' },
      { name: 'freezes nested objects', body: 'expect(Object.isFrozen(deepFreeze({ a: { b: 1 } }).a)).toBe(true);' },
      { name: 'freezes three levels down', body: 'expect(Object.isFrozen(deepFreeze({ a: { b: { c: 1 } } }).a.b)).toBe(true);' },
      { name: 'returns the same object', body: 'const o = { a: 1 }; expect(deepFreeze(o)).toBe(o);' },
      { name: 'nested values really cannot change', body: 'const o = deepFreeze({ a: { b: 1 } }); try { o.a.b = 9; } catch { /* strict mode throws */ } expect(o.a.b).toBe(1);' },
      { name: 'freezes arrays', body: 'const o = deepFreeze({ xs: [1, 2] }); expect(Object.isFrozen(o.xs)).toBe(true);' },
      { name: 'freezes objects inside arrays', body: 'const o = deepFreeze({ xs: [{ a: 1 }] }); expect(Object.isFrozen(o.xs[0])).toBe(true);' },
      { name: 'handles null values without throwing', body: 'expect(Object.isFrozen(deepFreeze({ a: null }))).toBe(true);' },
      { name: 'handles primitives passed directly', body: 'expect(deepFreeze(42)).toBe(42);' },
      { name: 'terminates on a self-referencing object', body: 'const o = { a: 1 }; o.self = o; deepFreeze(o); expect(Object.isFrozen(o)).toBe(true);' },
      { name: 'terminates on a two-node cycle', body: 'const a = {}; const b = { a }; a.b = b; deepFreeze(a); expect(Object.isFrozen(b)).toBe(true);', hidden: true },
      { name: 'an already-frozen input is fine', body: 'const o = Object.freeze({ a: {} }); expect(Object.isFrozen(deepFreeze(o).a)).toBe(true);', hidden: true },
    ],
    hints: [
      'Freeze the object first, then recurse into its own property values — order matters less than making sure both happen.',
      'For the cycle, keep track of what you have already visited. `Object.isFrozen` is almost a free visited-set, but be careful: an object can already be frozen shallowly before you start.',
      'A `WeakSet` of visited objects is the reliable answer, and it lets the entries be collected once the freeze is done.',
    ],
    solution:
      'function deepFreeze(value, seen = new WeakSet()) {\n' +
      '  if (typeof value !== "object" || value === null) return value;\n' +
      '  if (seen.has(value)) return value;\n' +
      '  seen.add(value);\n' +
      '\n' +
      '  Object.freeze(value);\n' +
      '  for (const key of Object.keys(value)) {\n' +
      '    deepFreeze(value[key], seen);\n' +
      '  }\n' +
      '  return value;\n' +
      '}\n',
    solutionExplanation:
      '`Object.freeze` only affects the object it is given — its properties keep pointing at fully mutable objects — so making a config genuinely immutable requires walking the whole reachable graph. The `WeakSet` is what makes that walk safe on a cyclic structure: without it, an object referring to itself recurses forever. Using `Object.isFrozen` as the visited check instead is tempting and subtly wrong, as the last hidden test shows: an input that was already shallowly frozen would be skipped entirely, leaving its children mutable. A `WeakSet` rather than a `Set` also means the bookkeeping holds no strong references, so nothing is kept alive after the call returns.',
  },

  {
    id: 'ch-obj-rename-keys',
    slug: 'renaming-keys-safely',
    title: 'Renaming Keys Safely',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['objects', 'object-utilities', 'strings'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'API responses rarely use the key names your code wants. Write `renameKeys(source, mapping)` returning a new object where any key listed in `mapping` is renamed to its mapped name, and every other key is copied unchanged. Values are untouched. When a rename would collide with a key that already exists, the renamed value wins — but only if the renamed key is genuinely produced by the mapping.',
    examples: [
      'renameKeys({ user_name: "ada", age: 36 }, { user_name: "userName" });\n// { userName: "ada", age: 36 }',
    ],
    constraints: ['Keys not present in the mapping are copied as they are.', 'A mapping entry for a key the source lacks does nothing.', 'Do not mutate the source.'],
    starterCode: 'function renameKeys(source, mapping) {\n  // Your code here\n}\n',
    tests: [
      { name: 'renames a mapped key', body: 'expect(renameKeys({ user_name: "ada" }, { user_name: "userName" })).toEqual({ userName: "ada" });' },
      { name: 'copies unmapped keys unchanged', body: 'expect(renameKeys({ a: 1, b: 2 }, { a: "x" })).toEqual({ x: 1, b: 2 });' },
      { name: 'an empty mapping copies everything', body: 'expect(renameKeys({ a: 1 }, {})).toEqual({ a: 1 });' },
      { name: 'a mapping for an absent key does nothing', body: 'expect(renameKeys({ a: 1 }, { zzz: "q" })).toEqual({ a: 1 });' },
      { name: 'preserves values exactly', body: 'const v = { nested: 1 }; expect(renameKeys({ a: v }, { a: "b" }).b).toBe(v);' },
      { name: 'preserves source key order', body: 'expect(Object.keys(renameKeys({ z: 1, a: 2 }, { z: "y" }))).toEqual(["y", "a"]);' },
      { name: 'renames several keys', body: 'expect(renameKeys({ a: 1, b: 2 }, { a: "x", b: "y" })).toEqual({ x: 1, y: 2 });' },
      { name: 'does not mutate the source', body: 'const s = { a: 1 }; renameKeys(s, { a: "b" }); expect(s).toEqual({ a: 1 });' },
      { name: 'an empty source gives an empty result', body: 'expect(renameKeys({}, { a: "b" })).toEqual({});' },
      { name: 'ignores inherited mapping entries', body: 'const m = Object.create({ a: "evil" }); expect(renameKeys({ a: 1 }, m)).toEqual({ a: 1 });', hidden: true },
      { name: 'a swap does not lose a value', body: 'expect(renameKeys({ a: 1, b: 2 }, { a: "b", b: "a" })).toEqual({ b: 1, a: 2 });', hidden: true },
    ],
    hints: [
      'Walk the source once. For each key, look up its replacement name; if there is none, keep the original.',
      'Use `Object.hasOwn(mapping, key)` rather than `mapping[key]` truthiness, so an inherited property on the mapping cannot rename anything.',
      'The swap test is the interesting one: because you read every value from the source and write to a fresh object, renaming `a`→`b` and `b`→`a` in one pass works without a temporary.',
    ],
    solution:
      'function renameKeys(source, mapping) {\n' +
      '  const out = {};\n' +
      '  for (const key of Object.keys(source)) {\n' +
      '    const name = Object.hasOwn(mapping, key) ? mapping[key] : key;\n' +
      '    out[name] = source[key];\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Reading from the source and writing to a separate object is what makes the swap case work: `{ a: 1, b: 2 }` with a mapping that exchanges the two names produces `{ b: 1, a: 2 }` in a single pass, whereas renaming in place would overwrite one value before it was read. `Object.hasOwn` on the mapping matters more than it looks — a mapping object that inherited a property named after one of your keys would otherwise silently rename it, which is a real hazard when the mapping itself comes from parsed data.',
  },
];

export default challenges;
