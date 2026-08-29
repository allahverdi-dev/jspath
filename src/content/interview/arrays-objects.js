import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Arrays, objects, collections and data manipulation — the day-to-day work of
 * most JavaScript roles, and the area where interviewers probe for precision
 * about mutation, references and which method actually fits.
 */

const TOPIC = 'Arrays & Objects';

export const questions = [
  {
    id: 'iv-arr-map-vs-foreach',
    question: 'What is the difference between `map` and `forEach`, and when do you use each?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['array-methods', 'arrays', 'higher-order'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      '`map` returns a new array of the transformed values; `forEach` returns `undefined` and exists purely for side effects. Use `map` when you want a result, `forEach` when you want to **do** something per item. Using `map` and ignoring the result is a signal you meant `forEach`.',
    deepAnswer: [
      'Both iterate every element and call your callback with `(value, index, array)`. The difference is the return value and therefore the intent.',
      '`map` builds and returns a new array of the same length, containing whatever your callback returned. It is a transformation, and it is chainable — `map(...).filter(...)` reads naturally.',
      '`forEach` returns `undefined`. It is for effects: logging, pushing into an external structure, updating the DOM per item.',
      'The practical rule an interviewer is listening for: **`map` where the result is used, `forEach` where it is not.** Calling `map` and discarding the return value allocates an array for nothing and misleads the reader into looking for a result that never arrives. Conversely, using `forEach` with a manual `push` to build an array is `map` written the long way.',
      'Two shared limitations worth knowing: neither can be broken out of early — `break` is a syntax error and `return` only exits the current callback, so use `for...of`, `some` or `find` when you need to stop. And both skip holes in sparse arrays, which is one reason `Array.from({ length: n })` is preferred over `new Array(n)` for generating sequences.',
      'On performance: they are close enough that it is almost never the deciding factor. Choose on intent, not on micro-benchmarks.',
    ],
    keyPoints: [
      '`map` returns a new array; `forEach` returns `undefined`',
      '`map` for transformation, `forEach` for side effects',
      'Discarding a `map` result means you wanted `forEach`',
      'Neither can break early — use `for...of`, `some` or `find`',
      'Both skip holes in sparse arrays',
    ],
    commonMistakes: [
      'Saying "`map` is faster" — the meaningful difference is intent, not speed.',
      'Using `forEach` plus `push` to build an array instead of `map`.',
    ],
    followUps: [
      'How do you stop iterating early?',
      'What does `map` do with a sparse array?',
      'Is there a performance reason to prefer one?',
    ],
  },

  {
    id: 'iv-arr-find-vs-filter',
    question: 'When would you use `find` versus `filter`, and `some` versus `every`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['array-methods', 'arrays'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      '`find` returns the first matching element (or `undefined`) and stops there; `filter` returns an array of every match and always scans the whole array. `some` returns `true` on the first match; `every` returns `false` on the first failure. All four short-circuit except `filter`.',
    deepAnswer: [
      '`find` — the first matching **element**, or `undefined`. `findIndex` — its index, or `-1`. Both stop at the first hit.',
      '`filter` — a **new array** of all matches, always empty rather than `undefined` when nothing matches. It cannot short-circuit; it must examine every element by definition.',
      '`some` — `true` if at least one element passes, short-circuiting on the first success. `every` — `true` only if all pass, short-circuiting on the first failure.',
      'The common inefficiency is `filter(...)[0]` to get one item, or `filter(...).length > 0` to test existence. Both build an intermediate array and scan everything; `find` and `some` do neither. On a large array that is a real difference, and on any array it states the intent more clearly.',
      'A specification detail worth knowing: `every` on an **empty array returns `true`**, and `some` returns `false`. That is vacuous truth — there is no element that fails — and it surprises people. It matters in validation code: `errors.every(isResolved)` on an empty list reports success, which is usually correct but should be a deliberate decision.',
      '`find` also has the `undefined` ambiguity: if the array can legitimately contain `undefined`, a `find` returning `undefined` cannot distinguish "not found" from "found undefined". `findIndex` avoids that.',
    ],
    keyPoints: [
      '`find`: first element or `undefined`, short-circuits',
      '`filter`: all matches as a new array, always scans everything',
      '`some`/`every` short-circuit on first success/failure',
      'Avoid `filter(...)[0]` and `filter(...).length > 0`',
      '`every` on an empty array is `true`; `some` is `false`',
    ],
    commonMistakes: [
      'Using `filter` where `find` or `some` is meant.',
      'Not knowing `[].every(fn)` is `true`.',
    ],
    followUps: [
      'What does `[].every(x => false)` return?',
      'How do you distinguish "not found" from "found `undefined`"?',
      'Which of these can stop early?',
    ],
  },

  {
    id: 'iv-arr-slice-vs-splice',
    question: 'What is the difference between `slice` and `splice`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['array-methods', 'arrays', 'copying'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      '`slice` returns a shallow copy of a section and does **not** modify the original. `splice` modifies the array in place — removing and/or inserting elements — and returns the removed items. One is safe to use in a pure function; the other is not.',
    deepAnswer: [
      '`slice(start, end)` extracts from `start` up to but not including `end`, returning a **new** array. The original is untouched. `slice()` with no arguments is the classic shallow copy of an entire array, and negative indices count from the end.',
      '`splice(start, deleteCount, ...items)` **mutates**: it removes `deleteCount` elements starting at `start` and inserts any additional arguments in their place. It returns an array of what was **removed**, which trips people up — the return value is not the resulting array.',
      'The names being one letter apart is a genuine source of bugs, and the mutation is the part that matters. `splice` inside a `map` callback, or on an array held in state, changes data other code may be reading.',
      'Modern alternatives worth naming: `toSpliced()` gives splice semantics without mutating, and `with(index, value)` replaces one element immutably. Both are recent additions alongside `toSorted` and `toReversed`, and mentioning them signals you keep current.',
      'A related trap: `splice` while iterating shifts subsequent indices, so removing items in a forward `for` loop skips elements. Iterate backwards, or build a new array with `filter`.',
      'Both are **shallow**: `slice` copies references, so nested objects are still shared with the original.',
    ],
    keyPoints: [
      '`slice` copies and returns a new array; the original is unchanged',
      '`splice` mutates in place and returns the **removed** elements',
      '`slice()` is a shallow whole-array copy',
      '`toSpliced`/`with`/`toSorted`/`toReversed` are the non-mutating modern forms',
      'Splicing during a forward loop skips elements',
    ],
    commonMistakes: [
      'Thinking `splice` returns the modified array.',
      'Using `splice` on shared state and causing action-at-a-distance bugs.',
    ],
    followUps: [
      'What does `splice` actually return?',
      'How do you remove items while iterating without skipping any?',
      'Which array methods mutate?',
    ],
  },

  {
    id: 'iv-arr-mutating-methods',
    question: 'Which array methods mutate the array, and why does it matter?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['array-methods', 'arrays', 'copying'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      'The mutators are `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` and `fill`. The surprising ones are `sort` and `reverse`, which people expect to return a new array. It matters because mutating shared state breaks change detection and causes bugs far from the mutation.',
    deepAnswer: [
      'The full list of mutating methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, and `copyWithin`. Everything else — `map`, `filter`, `slice`, `concat`, `reduce`, `flat`, `join` — returns something new.',
      '**`sort` and `reverse` are the traps.** They mutate **and** return the same array, so `const sorted = items.sort()` silently reorders `items` too. In UI state or a shared module-level array, that is a real bug: another component reading the "original" now sees a different order.',
      'The fix is to copy first — `[...items].sort()` — or use the newer non-mutating forms `toSorted()`, `toReversed()`, `toSpliced()` and `with()`, which return a new array and leave the original alone.',
      'Why it matters beyond correctness: frameworks detect change by comparing references. Mutating an array in place leaves the reference identical, so a re-render may never be triggered — the classic "my state changed but the UI did not update" bug. Producing a new array is what makes the change visible.',
      'One more `sort` detail worth volunteering: the default comparator converts elements to **strings**, so `[10, 9, 100].sort()` gives `[10, 100, 9]`. Numeric sorting needs `sort((a, b) => a - b)`. Also, `sort` has been guaranteed **stable** since ES2019, which matters for multi-key sorting.',
    ],
    keyPoints: [
      'Mutators: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`',
      '`sort` and `reverse` mutate — the most common surprise',
      'Copy first (`[...arr].sort()`) or use `toSorted`/`toReversed`/`with`',
      'Mutation keeps the same reference, so change detection can miss it',
      'Default `sort` compares as strings; `sort` is stable since ES2019',
    ],
    commonMistakes: [
      'Believing `sort` returns a new array.',
      'Sorting numbers without a comparator.',
    ],
    followUps: [
      'What does `[10, 9, 100].sort()` give, and why?',
      'Why might a framework not re-render after you mutate an array?',
      'What are the non-mutating alternatives?',
    ],
  },

  {
    id: 'iv-arr-sort-output',
    question: 'Sorting numbers without a comparator — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['array-methods', 'arrays', 'coercion'],
    relatedLessons: ['l-m13-01'],
    code:
      'const nums = [10, 9, 100, 1];\n' +
      'const sorted = nums.sort();\n' +
      'console.log(sorted.join(","));\n' +
      'console.log(nums.join(","));\n' +
      'console.log(sorted === nums);',
    options: [
      '1,10,100,9\n1,10,100,9\ntrue',
      '1,9,10,100\n10,9,100,1\nfalse',
      '1,9,10,100\n1,9,10,100\ntrue',
      '1,10,100,9\n10,9,100,1\nfalse',
    ],
    correct: 0,
    shortAnswer:
      'It prints `1,10,100,9` twice, then `true`. The default comparator converts elements to strings, so they sort lexicographically. And `sort` mutates in place and returns the same array, so `sorted` and `nums` are the same object.',
    deepAnswer: [
      'Two separate surprises in one snippet, which is why it is such a common interview question.',
      '**Lexicographic ordering.** With no comparator, `sort` converts each element to a string and compares those. As strings, `"1" < "10" < "100" < "9"` — because comparison is character by character and `"9"` is greater than `"1"` at the first character. Hence `1,10,100,9`.',
      '**Mutation.** `sort` sorts the array in place and returns a reference to that same array. So `nums` is reordered too, and `sorted === nums` is `true`. Assigning the result to a new name creates no independence whatsoever.',
      'The fix for both: `const sorted = [...nums].sort((a, b) => a - b)` — copy to avoid the mutation, and supply a numeric comparator. Or use `nums.toSorted((a, b) => a - b)`, which does both in one call.',
      'The comparator contract is worth stating precisely: return a negative number if `a` should come first, positive if `b` should, zero if they tie. Returning a boolean is a common bug, because `true`/`false` coerce to 1/0 and never produce a negative — so the sort is subtly wrong rather than obviously broken.',
    ],
    keyPoints: [
      'Default `sort` compares stringified elements, so `10` sorts before `9`',
      '`sort` mutates in place and returns the same array reference',
      'Fix: `[...nums].sort((a, b) => a - b)` or `nums.toSorted(...)`',
      'A comparator must return negative/positive/zero — never a boolean',
    ],
    commonMistakes: [
      'Expecting numeric order from the default comparator.',
      'Assuming assigning `sort()` to a new variable protects the original.',
    ],
    followUps: [
      'Why does returning a boolean from a comparator break the sort?',
      'How would you sort by two keys?',
      'Is `sort` stable?',
    ],
  },

  {
    id: 'iv-arr-reduce',
    question: 'Explain `reduce`. When is it the right tool and when is it overused?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['array-methods', 'higher-order', 'functional'],
    relatedLessons: ['l-m13-01'],
    relatedChallenges: ['ch-arr-group-by', 'ch-arr-count-by'],
    shortAnswer:
      '`reduce` folds an array into a single value by threading an accumulator through every element. It is right when you are genuinely aggregating — a sum, a lookup map, a grouping. It is overused when it reimplements `map`/`filter` in a harder-to-read form.',
    deepAnswer: [
      'The signature is `reduce((accumulator, value, index, array) => next, initialValue)`. Each call returns the accumulator for the next iteration; the final return value is the result.',
      '**Always pass the initial value.** Without it, `reduce` uses the first element as the seed and starts at index 1 — which changes behaviour, and throws `TypeError: Reduce of empty array with no initial value` on an empty array. Passing `0`, `[]` or `{}` explicitly makes the empty case work and makes the accumulator type obvious to the reader.',
      '**Good uses**: summing or averaging; building a lookup `Map` or object from a list (`groupBy`, `countBy`, indexing by id); flattening one level; computing several statistics in a single pass when the array is large.',
      '**Overuse** is the interesting half. `reduce` that pushes to an array is `map` or `filter` written less clearly. A `reduce` whose body is fifteen lines with several branches has stopped being a fold and become a loop with extra ceremony — a plain `for...of` is more readable and easier to debug. Chained `map().filter()` is usually clearer than a fused `reduce`, and the performance difference rarely justifies the readability cost.',
      'One real performance trap: `reduce` with object spread — `{ ...acc, [k]: v }` — allocates a new object every iteration, making an O(n) operation O(n²). Mutating the accumulator you own, or using a `Map`, is the fix. This is a genuinely common bug in code that looks idiomatic.',
    ],
    keyPoints: [
      'Folds an array into one value via an accumulator',
      'Always pass an initial value — empty arrays throw without one',
      'Good for aggregation: sums, lookup maps, grouping',
      'Overused when it replaces `map`/`filter` or grows into a branching loop',
      'Spreading into the accumulator each iteration is accidentally O(n²)',
    ],
    commonMistakes: [
      'Omitting the initial value and breaking on empty arrays.',
      'Using `{ ...acc }` inside the reducer without realising the quadratic cost.',
    ],
    followUps: [
      'What happens if you `reduce` an empty array with no initial value?',
      'Why is spreading into the accumulator slow?',
      'Rewrite a `map` implemented with `reduce` — which reads better?',
    ],
  },

  {
    id: 'iv-arr-object-vs-map',
    question: 'When would you use a `Map` instead of a plain object?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['data-structures', 'objects'],
    relatedLessons: ['l-m34-01'],
    relatedChallenges: ['ch-arr-group-by', 'ch-ds-lru'],
    shortAnswer:
      'Use a `Map` when keys are not strings, when keys come from user data, when insertion order matters, or when you add and delete frequently. Use an object for fixed, known-at-author-time record shapes — and when you need JSON serialisation.',
    deepAnswer: [
      '**Key types.** Object keys are always strings (or symbols) — `obj[1]` and `obj["1"]` are the same key. `Map` keys can be any value, compared by SameValueZero, so `1` and `"1"` are distinct and objects can be keys by identity. That last point enables patterns an object simply cannot express.',
      '**Prototype collisions.** An object inherits from `Object.prototype`, so a key of `"constructor"` or `"toString"` already "exists". `obj["constructor"]` returns a function rather than `undefined`, which breaks the common `counts[key] = (counts[key] || 0) + 1` accumulation pattern with real word-frequency data. A `Map` has no such inheritance. `Object.create(null)` is the object-based fix.',
      '**Order.** `Map` preserves strict insertion order. Objects order integer-like keys numerically first, then string keys by insertion — so `{ 2: "b", 1: "a" }` iterates `1` before `2`. That surprises people building ordered lookups.',
      '**Size and iteration.** `map.size` is O(1); an object needs `Object.keys(obj).length`, which allocates an array. `Map` is directly iterable and yields `[key, value]` pairs.',
      '**Performance.** `Map` is designed for frequent additions and deletions; `delete` on an object can deoptimise its hidden class in some engines.',
      '**Where objects still win**: `JSON.stringify` works on objects and produces `{}` for a `Map`; destructuring and spread are ergonomic; and for a fixed record like `{ id, name, email }` an object is obviously the right shape. The rule of thumb is **record** → object, **dictionary/lookup** → `Map`.',
    ],
    keyPoints: [
      '`Map` keys can be any type; object keys are strings/symbols only',
      'Objects inherit prototype names — `"constructor"` collides; `Map` does not',
      '`Map` preserves insertion order; objects put integer-like keys first',
      '`map.size` is O(1); `Object.keys().length` allocates',
      '`JSON.stringify` serialises objects, not `Map`s',
      'Record → object; dictionary keyed by data → `Map`',
    ],
    commonMistakes: [
      'Saying "`Map` is just a faster object" without the key-type and prototype reasons.',
      'Not knowing integer-like object keys reorder.',
    ],
    followUps: [
      'What breaks if you count word frequencies in a plain object?',
      'How do you serialise a `Map` to JSON?',
      'What order do `{ 2: "b", 1: "a" }` keys iterate in?',
    ],
  },

  {
    id: 'iv-arr-set-uses',
    question: 'What is a `Set` good for, and how does it compare to an array?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['data-structures', 'arrays'],
    relatedLessons: ['l-m34-01'],
    relatedChallenges: ['ch-beg-has-duplicate', 'ch-arr-intersection'],
    shortAnswer:
      'A `Set` stores unique values with roughly O(1) membership testing, where an array\'s `includes` is O(n). Use it for deduplication and for "have I seen this?" checks; use an array when order, indexing or duplicates matter.',
    deepAnswer: [
      'The two properties that matter are **uniqueness** (adding an existing value is a no-op) and **fast lookup** (`has` is roughly constant time versus `includes` being a linear scan).',
      'The performance difference is not academic. Checking membership inside a loop over an array turns an O(n) job into O(n²) — on 20,000 elements that is 400 million comparisons versus 20,000. Building a `Set` from the array first is the standard fix and is the single most common practical use.',
      '`[...new Set(items)]` is the idiomatic deduplication one-liner. It preserves first-seen order, which is worth knowing.',
      'Equality uses **SameValueZero**, so `NaN` is correctly treated as equal to itself — `new Set([NaN, NaN]).size` is 1 — while `indexOf` would fail to find `NaN` at all. Objects are compared by identity, so two structurally identical objects are two distinct entries; deduplicating records requires keying on an id.',
      '**Where arrays win**: indexed access, duplicates when they are meaningful, and the full array method suite. A `Set` has no `map` or `filter` — you convert back to an array for those, which costs an allocation.',
      '`WeakSet` exists for the case where membership should not keep an object alive, but it is not iterable and has no `size`.',
    ],
    keyPoints: [
      'Unique values; `has` is ~O(1) versus `includes` being O(n)',
      'Prevents accidental O(n²) membership checks in loops',
      '`[...new Set(arr)]` dedupes and preserves first-seen order',
      'SameValueZero: `NaN` equals itself; objects compare by identity',
      'No `map`/`filter` — convert back to an array',
    ],
    commonMistakes: [
      'Expecting a `Set` to deduplicate structurally-equal objects.',
      'Not knowing `Set` handles `NaN` correctly where `indexOf` does not.',
    ],
    followUps: [
      'How would you dedupe an array of objects by id?',
      'Why is `new Set([NaN, NaN]).size` equal to 1?',
      'When would you reach for a `WeakSet`?',
    ],
  },

  {
    id: 'iv-arr-weakmap',
    question: 'What is a `WeakMap` for, and what can it not do?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['data-structures', 'performance', 'objects'],
    relatedLessons: ['l-m34-01'],
    relatedChallenges: ['ch-obj-freeze-deep'],
    shortAnswer:
      'A `WeakMap` associates data with an object without keeping that object alive — if nothing else references the key, both key and value become collectable. The trade-offs: keys must be objects, and it is not iterable, has no `size`, and cannot be cleared.',
    deepAnswer: [
      'A normal `Map` holds a **strong** reference to its keys, so using DOM nodes or component instances as keys keeps them alive forever — a genuine leak. A `WeakMap` holds them weakly: once the key is unreachable from anywhere else, the entry can be collected.',
      '**Uses**: attaching metadata to objects you do not own; caching a computed result per object where the cache should not outlive the object; and private-data patterns where a `WeakMap` keyed by instance holds fields nothing outside the module can reach.',
      '**Limitations, and they are strict.** Keys must be objects (or non-registered symbols) — primitives cannot be weakly held. There is no iteration, no `size`, no `clear`, and no way to enumerate entries. That is not an oversight: exposing iteration would make garbage-collection timing observable, and the specification deliberately refuses to do that.',
      'Which leads to the point interviewers actually probe: **you cannot observe or force collection**. Any answer claiming a `WeakMap` entry disappears "immediately" when the key goes out of scope is overstating it. Collection happens at a time the engine chooses; the guarantee is only that the entry does not **prevent** collection.',
      '`WeakRef` and `FinalizationRegistry` exist for finer-grained cases, and both come with the same caveat — the specification explicitly declines to guarantee when, or whether, a finalizer runs. They are advanced tools that are usually the wrong first answer.',
    ],
    keyPoints: [
      'Holds keys weakly — does not prevent collection',
      'Uses: per-object metadata, per-instance caches, private data',
      'Keys must be objects; primitives are not allowed',
      'No iteration, no `size`, no `clear` — deliberately, to hide GC timing',
      'You cannot observe or force collection',
    ],
    commonMistakes: [
      'Claiming entries are removed immediately when the key goes out of scope.',
      'Trying to iterate a `WeakMap` or read its size.',
    ],
    followUps: [
      'Why is a `WeakMap` deliberately not iterable?',
      'How would you use one for private instance data?',
      'What is `WeakRef` for, and why is it rarely the right answer?',
    ],
  },

  {
    id: 'iv-arr-destructuring',
    question: 'What can destructuring do beyond pulling out a property?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['destructuring', 'modern-js', 'objects'],
    relatedLessons: ['l-m21-01'],
    shortAnswer:
      'It supports renaming, defaults, nesting, rest collection, destructuring in parameter lists, and swapping variables without a temporary. Defaults fire only for `undefined`, and destructuring `null` or `undefined` throws.',
    deepAnswer: [
      '**Renaming**: `const { id: userId } = user` — useful when the source name collides or is unclear.',
      '**Defaults**: `const { retries = 3 } = options`. They apply only when the value is **`undefined`** — an explicit `null` is passed through, which catches people who expect `??` semantics.',
      '**Combined**: `const { count: total = 0 } = data` renames and defaults at once — worth knowing the order because the syntax reads backwards at first.',
      '**Nesting**: `const { user: { address: { city } } } = response`. Powerful but brittle: if `address` is missing this throws, so deep destructuring of API responses needs defaults at each level or optional chaining beforehand.',
      '**Rest**: `const { password, ...safe } = user` is the idiomatic immutable way to omit a key.',
      '**Parameters**: `function f({ id, name = "anon" } = {})` — the trailing `= {}` matters, because calling `f()` with no argument would otherwise throw when destructuring `undefined`.',
      '**Swapping**: `[a, b] = [b, a]` with no temporary.',
      'The failure mode to state clearly: destructuring `null` or `undefined` throws `TypeError`. `const { a } = null` fails. That is why the `= {}` parameter default is so common.',
      'Array destructuring works on any **iterable**, so `const [first] = new Set([1,2])` works, and skipping elements with holes — `const [, second] = arr` — is valid.',
    ],
    keyPoints: [
      'Renaming, defaults, nesting, rest, parameter destructuring, swapping',
      'Defaults fire for `undefined` only, not `null`',
      'Destructuring `null`/`undefined` throws — hence `= {}` on parameters',
      'Rest is the idiomatic immutable key-omission',
      'Array destructuring works on any iterable',
    ],
    commonMistakes: [
      'Expecting a default to apply when the value is `null`.',
      'Omitting `= {}` on a destructured parameter and breaking the no-argument call.',
    ],
    followUps: [
      'What happens with `const { a } = null`?',
      'Does a default apply when the property is `null`?',
      'How do you omit a key from an object immutably?',
    ],
  },

  {
    id: 'iv-arr-optional-key-check',
    question: 'How do you check whether an object has a property, and which check should you use?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['objects', 'object-utilities', 'prototypes'],
    relatedLessons: ['l-m15-01'],
    shortAnswer:
      '`Object.hasOwn(obj, key)` for own properties — it is the modern, safe choice. `key in obj` also finds inherited properties. `obj[key] !== undefined` is unreliable because a property can legitimately hold `undefined`.',
    deepAnswer: [
      '`obj[key] !== undefined` cannot distinguish "missing" from "present and `undefined`". If either is a meaningful state — and in configuration or form data it usually is — this check is wrong.',
      '`"key" in obj` returns `true` for **inherited** properties too, so `"toString" in {}` is `true`. Sometimes that is what you want (checking for a method that may come from a prototype); usually it is not, when you are inspecting data.',
      '`Object.hasOwn(obj, key)` checks own properties only and is the current recommendation. It replaces `Object.prototype.hasOwnProperty.call(obj, key)`, which was the safe-but-verbose form.',
      'Why not just `obj.hasOwnProperty(key)`? Because it breaks on objects created with `Object.create(null)` (no prototype, so no method) and on any object with a property literally named `hasOwnProperty` — which is exactly the situation you are in when the object came from untrusted data. `Object.hasOwn` sidesteps both.',
      'For nested access, optional chaining is a different tool: `obj?.a?.b` guards against nullish intermediates but tells you nothing about whether the final key exists, since a missing key and a stored `undefined` both give `undefined`.',
    ],
    keyPoints: [
      '`Object.hasOwn(obj, key)` — own properties, modern and safe',
      '`in` includes inherited properties',
      '`obj[key] !== undefined` cannot distinguish missing from `undefined`',
      '`obj.hasOwnProperty` breaks on null-prototype objects and shadowed names',
      'Optional chaining guards nullish intermediates, not key existence',
    ],
    commonMistakes: [
      'Using `in` on parsed data and matching inherited names.',
      'Calling `obj.hasOwnProperty(...)` directly on untrusted objects.',
    ],
    followUps: [
      'Why can `obj.hasOwnProperty` fail?',
      'What does `"toString" in {}` return?',
      'How would you distinguish a missing key from one holding `undefined`?',
    ],
  },

  {
    id: 'iv-arr-object-freeze',
    question: 'What does `Object.freeze` actually prevent?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['objects', 'copying', 'metaprogramming'],
    relatedLessons: ['l-m15-01'],
    relatedChallenges: ['ch-obj-freeze-deep'],
    shortAnswer:
      'It makes an object non-extensible and marks its own properties non-writable and non-configurable — so adding, removing or reassigning top-level properties fails. It is **shallow**: nested objects remain fully mutable.',
    deepAnswer: [
      'After `Object.freeze(obj)`, you cannot add properties, delete them, or reassign existing ones, and you cannot reconfigure their descriptors. `Object.isFrozen` reports the state.',
      'Crucially it is **shallow**. `const config = Object.freeze({ db: { port: 5432 } })` still allows `config.db.port = 1`, because the nested object was never frozen. A deep freeze needs to walk the object graph recursively — and needs a visited set, or a cyclic structure recurses forever.',
      '**Failure mode depends on strict mode.** In sloppy mode a write to a frozen property fails **silently**. In strict mode — which means all module and class code — it throws a `TypeError`. That difference is worth stating precisely, because it determines whether a bug is loud or invisible.',
      'Related methods worth distinguishing: `Object.seal` prevents adding and deleting but still allows reassigning existing properties; `Object.preventExtensions` only blocks adding.',
      'Practical judgement: freezing is useful for genuine constants and for catching accidental mutation in development. It is not free — it can deoptimise property access in some engines — and it is not a substitute for an immutable data-flow design. Most codebases get more value from **not mutating** than from **preventing** mutation.',
    ],
    keyPoints: [
      'Blocks adding, deleting and reassigning own properties',
      'Shallow — nested objects stay mutable',
      'Silent failure in sloppy mode; `TypeError` in strict mode',
      '`seal` allows reassignment; `preventExtensions` only blocks additions',
      'A deep freeze needs a visited set to survive cycles',
    ],
    commonMistakes: [
      'Assuming `freeze` is deep.',
      'Not knowing the failure is silent outside strict mode.',
    ],
    followUps: [
      'How would you deep-freeze an object with a cycle?',
      'What is the difference between `freeze` and `seal`?',
      'Does freezing help performance?',
    ],
  },

  {
    id: 'iv-arr-json-limits',
    question: 'What does `JSON.stringify` lose or change?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['objects', 'copying', 'http'],
    relatedLessons: ['l-m26-01'],
    relatedChallenges: ['ch-exp-serialize-refs'],
    shortAnswer:
      'It drops `undefined`, functions and symbols from objects (turning them into `null` inside arrays), converts `Date` to an ISO string, empties `Map` and `Set`, throws on cycles and on `BigInt`, and loses prototypes and non-enumerable properties.',
    deepAnswer: [
      'The list matters because `JSON.parse(JSON.stringify(x))` is still the most common "deep clone", and every item here is a way it silently corrupts data.',
      '**Dropped in objects, `null` in arrays**: `undefined`, functions and symbols. So `{ a: undefined }` becomes `{}` but `[undefined]` becomes `[null]` — an asymmetry that surprises people.',
      '**Converted**: `Date` becomes an ISO string and does not survive the round trip as a `Date`. Any object with a `toJSON` method is replaced by whatever that returns — which is exactly how `Date` does it.',
      '**Emptied**: `Map` and `Set` serialise as `{}`, losing all contents, because their data lives in internal slots rather than own properties.',
      '**Throws**: on a circular reference (`TypeError: Converting circular structure to JSON`) and on `BigInt`.',
      '**Lost**: the prototype chain — a class instance comes back as a plain object — and all non-enumerable and symbol-keyed properties.',
      '`NaN` and `Infinity` become `null`, which is quietly destructive in numeric data.',
      'The modern answer for cloning is `structuredClone`, which handles cycles, `Date`, `Map` and `Set` correctly; its limitation is that it cannot clone functions. For serialisation across a wire, a custom format with reference tracking is needed if the graph has cycles or shared references.',
    ],
    keyPoints: [
      '`undefined`/functions/symbols: dropped in objects, `null` in arrays',
      '`Date` → ISO string; `toJSON` is honoured if present',
      '`Map`/`Set` → `{}`',
      'Throws on cycles and on `BigInt`',
      '`NaN`/`Infinity` → `null`; prototypes and non-enumerables lost',
      '`structuredClone` fixes most of this but cannot clone functions',
    ],
    commonMistakes: [
      'Recommending the JSON round-trip as a general deep clone.',
      'Not knowing the object/array asymmetry for `undefined`.',
    ],
    followUps: [
      'How would you serialise a structure containing a cycle?',
      'What does `JSON.stringify([undefined])` produce?',
      'How do you preserve a `Map` through serialisation?',
    ],
  },

  {
    id: 'iv-arr-debug-shallow-copy',
    question: 'This "copy" still affects the original. What is wrong and how would you fix it?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.DEBUGGING,
    topicIds: ['copying', 'objects'],
    relatedLessons: ['l-m15-01'],
    relatedChallenges: ['ch-obj-deep-merge'],
    code:
      'function updateCity(user, city) {\n' +
      '  const copy = { ...user };\n' +
      '  copy.address.city = city;\n' +
      '  return copy;\n' +
      '}\n' +
      '\n' +
      'const original = { name: "Ada", address: { city: "London" } };\n' +
      'const updated = updateCity(original, "Paris");\n' +
      'console.log(original.address.city);',
    shortAnswer:
      'Spread is a **shallow** copy, so `copy.address` is the same object as `original.address`. Mutating it changes both. Fix by copying each level along the path being changed: `{ ...user, address: { ...user.address, city } }`.',
    deepAnswer: [
      '`{ ...user }` creates a new top-level object, but its `address` property holds the **same reference** as the original\'s. So `copy.address.city = city` mutates the one shared nested object, and `original.address.city` becomes `"Paris"` too.',
      '**The fix** is to copy every level on the path to the change: `return { ...user, address: { ...user.address, city } };`. Untouched branches stay shared, which is fine — they are not being mutated — and this is exactly the structural-sharing pattern immutable state libraries use.',
      '**Why it matters beyond correctness**: a function named `updateCity` that mutates its argument is lying about what it does. Callers holding the original see it change underneath them, and in a UI framework the reference is unchanged so the re-render may not fire while the data has silently changed — the worst combination.',
      '**Alternatives**: `structuredClone(user)` then mutate, which is simpler but copies everything including large untouched branches. Or a library like Immer, which lets you write the mutation and produces a correctly-shared immutable result.',
      '**The test that catches it**: assert the original is unchanged after calling the function — `expect(original.address.city).toBe("London")`. A test that only checks `updated.address.city === "Paris"` passes against this broken code, which is why testing the non-mutation is the point.',
    ],
    keyPoints: [
      'Spread copies one level; nested references are shared',
      'Fix: copy each level along the changed path',
      'Untouched branches can stay shared — that is structural sharing',
      'Mutating an argument breaks the function\'s contract and change detection',
      'Test that the original is unchanged, not just that the copy is right',
    ],
    commonMistakes: [
      'Reaching for a full deep clone when only one path needs copying.',
      'Only asserting the new value in a test, which does not catch the mutation.',
    ],
    followUps: [
      'What test would catch this?',
      'Why not just `structuredClone` everything?',
      'What is structural sharing?',
    ],
  },

  {
    id: 'iv-arr-groupby-coding',
    question: 'Implement a `groupBy` that groups records by a computed key. What edge cases matter?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CODING,
    topicIds: ['array-methods', 'data-structures', 'higher-order'],
    relatedChallenges: ['ch-arr-group-by'],
    code:
      'function groupBy(items, keyFn) {\n' +
      '  const groups = new Map();\n' +
      '  for (const item of items) {\n' +
      '    const key = keyFn(item);\n' +
      '    const bucket = groups.get(key);\n' +
      '    if (bucket === undefined) groups.set(key, [item]);\n' +
      '    else bucket.push(item);\n' +
      '  }\n' +
      '  return groups;\n' +
      '}',
    shortAnswer:
      'Walk once, compute each key, and push into that key\'s bucket. Return a `Map` rather than an object so keys keep their type and a key of `"constructor"` does not collide with an inherited property. Complexity is O(n).',
    deepAnswer: [
      '**Approach.** One pass. For each item compute its key, find or create the bucket, push. That is O(n) time and O(n) space.',
      '**Why a `Map` and not an object.** Two concrete reasons. Object keys stringify, so grouping by a boolean or a number collapses `true` and `"true"`, or `1` and `"1"`, into one bucket. And an object inherits from `Object.prototype`, so a computed key of `"constructor"` finds an existing function rather than `undefined` — which breaks the create-if-missing check in a way that is very hard to debug with real-world data.',
      '**Ordering.** `Map` preserves insertion order, so groups appear in first-seen order and items stay in input order within each group. Those are usually the desired semantics and they come free — worth saying rather than leaving implicit.',
      '**Edge cases** to raise: an empty input gives an empty `Map`; the key function should be called exactly once per item (calling it twice matters if it is expensive or impure); and keys that are objects work by identity, which is occasionally exactly what you want.',
      '**Follow-up worth volunteering**: the modern `Object.groupBy` and `Map.groupBy` exist now and do this natively — `Map.groupBy(items, keyFn)`. Knowing the built-in exists while still being able to implement it is the strongest position.',
      '**Related shape**: `countBy` is the same loop accumulating a number instead of an array, and `indexBy` (one item per key rather than an array) is a third variation.',
    ],
    keyPoints: [
      'Single pass, O(n) time and space',
      '`Map` avoids key stringification and prototype-name collisions',
      'Insertion order gives first-seen group order and stable within-group order',
      'Call `keyFn` exactly once per item',
      '`Object.groupBy`/`Map.groupBy` are the modern built-ins',
    ],
    commonMistakes: [
      'Using a plain object and hitting the `"constructor"` collision on real data.',
      'Calling the key function more than once per item.',
    ],
    followUps: [
      'What breaks if you use a plain object here?',
      'How would you write `countBy` instead?',
      'Is there a built-in for this now?',
    ],
  },

  {
    id: 'iv-arr-flatten-coding',
    question: 'Implement a function that flattens a nested array to a given depth.',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['arrays', 'recursion', 'algorithms'],
    relatedChallenges: ['ch-arr-flatten-depth'],
    code:
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
      '}',
    shortAnswer:
      'Recurse: for each element, if it is an array and depth remains, flatten it with `depth - 1` and append; otherwise push it. `Infinity - 1` is still `Infinity`, so full flattening needs no special case. O(n) in the total number of elements.',
    deepAnswer: [
      '**Approach.** One guard combines both stopping conditions — a non-array element has nothing to flatten, and zero remaining depth means stop. Everything else falls out of that.',
      '**The neat detail**: `Infinity - 1 === Infinity`, so passing `Infinity` as the depth flattens completely with no separate branch. Worth pointing out; it shows you thought about the recursion rather than special-casing.',
      '**`Array.isArray`, not `typeof`.** `typeof []` is `"object"`, so it cannot distinguish an array from a plain object. This is the check that matters.',
      '**Edge cases**: depth 0 returns a shallow copy (not the original — worth being explicit); empty nested arrays vanish, since they contribute no elements; `null` and `undefined` are values, not containers, so they are preserved.',
      '**Complexity**: O(n) in the total element count. Space is O(n) for the output plus O(d) recursion stack for depth `d`. On a pathologically deep array — tens of thousands of nesting levels — recursion could overflow the stack, and an explicit stack-based iterative version avoids that. Mentioning that trade-off unprompted is a good signal.',
      '**Follow-up**: `Array.prototype.flat(depth)` is the built-in and does exactly this; `flatMap` is `map` followed by a single-level flatten and is the right tool when you are transforming and flattening together.',
    ],
    keyPoints: [
      'One guard: is it an array, and is there depth left',
      '`Infinity - 1` is `Infinity` — full flatten needs no special case',
      '`Array.isArray`, not `typeof`',
      'Depth 0 returns a shallow copy; empty nested arrays disappear',
      'O(n) time; recursion depth is the stack risk',
      'Built-ins: `flat` and `flatMap`',
    ],
    commonMistakes: [
      'Using `typeof item === "object"` and treating plain objects as arrays.',
      'Not noticing that `Infinity` works without a special branch.',
    ],
    followUps: [
      'How would you write this iteratively to avoid deep recursion?',
      'What is `flatMap` for?',
      'What does depth 0 return?',
    ],
  },

  {
    id: 'iv-arr-array-like',
    question: 'What is an array-like object, and how do you convert one to a real array?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['arrays', 'dom', 'iterators'],
    relatedLessons: ['l-m18-01'],
    shortAnswer:
      'An object with a `length` and indexed keys but no array methods — `arguments`, a `NodeList`, an `HTMLCollection`. Convert with `Array.from(x)`, which works on both array-likes and iterables, or `[...x]`, which requires it to be iterable.',
    deepAnswer: [
      'Array-likes have numeric indices and `length` but do not inherit from `Array.prototype`, so `map`, `filter` and `reduce` are absent. The ones you actually meet are `arguments`, `NodeList` (from `querySelectorAll`), `HTMLCollection` (from `getElementsByClassName`), and a string in some contexts.',
      '**`Array.from(x)`** is the general answer: it handles both array-likes (using `length` and indices) **and** iterables. It also takes a mapping function as a second argument, so `Array.from(nodes, n => n.textContent)` avoids an intermediate array.',
      '**Spread `[...x]`** only works if the value is **iterable** — it uses `Symbol.iterator`. A modern `NodeList` is iterable so spread works; an `HTMLCollection` is not, so `[...collection]` throws while `Array.from(collection)` succeeds. That distinction is the most useful thing to know here.',
      'The legacy form is `Array.prototype.slice.call(x)`, which you will still meet in older code.',
      '**The live-versus-static difference matters more in practice.** `getElementsByClassName` returns a **live** `HTMLCollection` that updates as the DOM changes — so removing elements while looping over it skips items. `querySelectorAll` returns a **static** `NodeList` snapshot. Converting to a real array also gives you a static snapshot, which is often the actual reason to convert.',
    ],
    keyPoints: [
      'Has `length` and indices but no array methods',
      'Examples: `arguments`, `NodeList`, `HTMLCollection`',
      '`Array.from` handles array-likes and iterables, and takes a map function',
      'Spread requires iterability — fails on `HTMLCollection`',
      '`HTMLCollection` is live; `querySelectorAll` gives a static `NodeList`',
    ],
    commonMistakes: [
      'Assuming spread works on every array-like.',
      'Iterating a live collection while removing elements.',
    ],
    followUps: [
      'Why does spread fail on an `HTMLCollection`?',
      'What is the difference between a live and a static collection?',
      'Which does `querySelectorAll` return?',
    ],
  },

  {
    id: 'iv-arr-refactor-reduce',
    question: 'Would you rewrite this? Explain your reasoning either way.',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.REFACTORING,
    topicIds: ['array-methods', 'clean-code', 'performance'],
    relatedLessons: ['l-m40-01'],
    code:
      'const activeNames = users.reduce((acc, user) => {\n' +
      '  if (user.isActive) {\n' +
      '    return [...acc, user.name.toUpperCase()];\n' +
      '  }\n' +
      '  return acc;\n' +
      '}, []);',
    shortAnswer:
      'Yes — twice over. It is a `filter` plus a `map` written as a fold, which obscures the intent, and spreading the accumulator each iteration makes it accidentally O(n²). `users.filter(u => u.isActive).map(u => u.name.toUpperCase())` is clearer and linear.',
    deepAnswer: [
      '**Readability.** The operation is "keep the active users, then take their uppercased names." Written as `filter().map()` that reads directly off the page. Written as a `reduce` with a conditional and two return paths, the reader has to reconstruct the intent. `reduce` earns its place when the result is genuinely a **fold** into something that is not a list — a sum, a lookup, a grouping. Here the result is a list.',
      '**Performance, and this is the sharper point.** `[...acc, x]` allocates a brand-new array on every iteration and copies everything accumulated so far. That turns an O(n) operation into **O(n²)**. On a hundred users it is invisible; on ten thousand it is roughly fifty million copy operations. This is a genuinely common bug in code that looks idiomatic and functional.',
      'If a single pass really were needed, the fix is to mutate the accumulator you own — `acc.push(...); return acc;` — which is safe precisely because the accumulator is a private array created by the `reduce` seed and never shared. That keeps it O(n).',
      '**On the two-pass concern**: `filter().map()` iterates twice and allocates one intermediate array. That is O(n) either way and almost never the bottleneck. Optimising it away before measuring is exactly the premature optimisation that produced the `reduce` in the first place.',
      '**What I would ask before changing it**: whether this sits in a hot path with large inputs. If it genuinely does, the single-pass version with a mutated accumulator — or a plain `for...of` — is defensible, and I would leave a comment saying why the less obvious form was chosen.',
    ],
    keyPoints: [
      'It is `filter` + `map` disguised as a fold',
      'Spreading the accumulator makes it O(n²)',
      'If a single pass is needed, push into the accumulator instead',
      'The two-pass version is O(n) and the intermediate array rarely matters',
      'Measure before optimising for one pass',
    ],
    commonMistakes: [
      'Only commenting on style and missing the quadratic complexity.',
      'Claiming the two-pass version is slow without measuring.',
    ],
    followUps: [
      'Exactly why is spreading the accumulator quadratic?',
      'When would a single pass genuinely be worth it?',
      'Is mutating the accumulator inside `reduce` acceptable?',
    ],
  },

  {
    id: 'iv-arr-mutation-in-loop-debug',
    question: 'This removes only some of the matching items. Why?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.DEBUGGING,
    topicIds: ['arrays', 'loops', 'array-methods'],
    relatedLessons: ['l-m12-01'],
    code:
      'const items = ["a", "x", "x", "b", "x"];\n' +
      '\n' +
      'for (let i = 0; i < items.length; i++) {\n' +
      '  if (items[i] === "x") {\n' +
      '    items.splice(i, 1);\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'console.log(items.join(","));',
    shortAnswer:
      'Removing an element shifts every later element down one index, but the loop still increments `i` — so the element that moved into the current slot is skipped. Consecutive matches survive. Fix by iterating backwards, or better, use `filter`.',
    deepAnswer: [
      '**Trace it.** At `i = 1`, `items[1]` is `"x"`, so it is spliced out. The array becomes `["a", "x", "b", "x"]` and the second `"x"` has slid into index 1. But the loop increments to `i = 2`, which is now `"b"` — the shifted-in `"x"` was never examined. The result is `a,x,b` with one `"x"` still present.',
      '`length` also shrinks as you go, so the loop condition is a moving target — another reason forward mutation during iteration is fragile.',
      '**Fix 1 — iterate backwards.** `for (let i = items.length - 1; i >= 0; i--)`. Removing at index `i` only shifts elements **after** it, which you have already passed, so nothing is skipped. This is the right approach when you genuinely must mutate in place.',
      '**Fix 2 — build a new array.** `const kept = items.filter(item => item !== "x")`. Clearer, non-mutating, and immune to the whole class of problem. This is what I would write unless in-place mutation is specifically required.',
      '**The general lesson**, which is what the interviewer is really testing: do not mutate a collection while iterating it forward. The same bug appears when removing DOM nodes from a **live** `HTMLCollection`, and when deleting from a `Map` mid-iteration — recognising the shared shape is the valuable part.',
      '**Test that catches it**: input with two adjacent matches. `["x", "x"]` should yield `[]`; the broken version yields `["x"]`.',
    ],
    keyPoints: [
      'Splicing shifts later elements down while `i` still increments — skips one',
      'Consecutive matches are what expose it',
      'Fix: iterate backwards, or use `filter` to build a new array',
      'Same bug shape with live `HTMLCollection`s and mid-iteration `Map` deletion',
      'Test with two adjacent matches',
    ],
    commonMistakes: [
      'Adding `i--` inside the branch — it works, but it is easy to get wrong and obscures intent versus `filter`.',
      'Not identifying which input exposes the bug.',
    ],
    followUps: [
      'What input best demonstrates the bug?',
      'Where else does this pattern bite in DOM code?',
      'Why is `filter` the better default here?',
    ],
  },
];

export default questions;
