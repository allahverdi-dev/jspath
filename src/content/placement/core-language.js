import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Core language — strings, arrays, array methods, objects, functions, scope.
 *
 * This is the widest domain and the one that most often decides a placement, so
 * it carries the most questions. The recurring theme is the distinction between
 * mutating and non-mutating work, which is where real bugs come from.
 */

export default [
  {
    id: 'pq-core-01',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.BEGINNER,
    kind: K.OUTPUT,
    topicIds: ['strings'],
    prompt: 'What is logged?',
    code: 'const name = "  Ada  ";\nconsole.log(name.trim().length);',
    options: ['3', '7', '5', '"Ada".length'],
    correct: 0,
    explanation:
      '`trim()` removes leading and trailing whitespace and returns a new string, `"Ada"`, whose length is `3`. The original string is unchanged — strings are immutable.',
  },
  {
    id: 'pq-core-02',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.BEGINNER,
    kind: K.OUTPUT,
    topicIds: ['arrays', 'array-methods'],
    prompt: 'What is logged?',
    code: 'const nums = [3, 1, 2];\nconst mapped = nums.map((n) => n * 2);\nconsole.log(nums.length, mapped.length);',
    options: ['3 3', '3 6', '6 6', '0 3'],
    correct: 0,
    explanation:
      '`map` builds a new array of the same length and never modifies the source. Both arrays have three elements.',
  },
  {
    id: 'pq-core-03',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.EASY,
    kind: K.SINGLE,
    topicIds: ['array-methods'],
    prompt: 'Which of these array methods modifies the array it is called on?',
    options: ['`sort()`', '`filter()`', '`slice()`', '`concat()`'],
    correct: 0,
    explanation:
      '`sort()` sorts in place and returns the *same* array reference. `filter`, `slice` and `concat` all return new arrays and leave the original alone. `toSorted()` is the non-mutating counterpart to `sort()`.',
  },
  {
    id: 'pq-core-04',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.OUTPUT,
    topicIds: ['array-methods', 'higher-order'],
    prompt: 'What is logged?',
    code: 'const result = [1, 2, 3, 4].reduce((acc, n) => (n % 2 ? acc : acc + n), 0);\nconsole.log(result);',
    options: ['6', '10', '4', '0'],
    correct: 0,
    explanation:
      'The reducer adds only even numbers, skipping odd ones by returning the accumulator unchanged. `2 + 4` is `6`.',
  },
  {
    id: 'pq-core-05',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.OUTPUT,
    topicIds: ['objects'],
    prompt: 'What is logged?',
    code: 'const original = { a: 1, nested: { b: 2 } };\nconst copy = { ...original };\ncopy.nested.b = 99;\nconsole.log(original.nested.b);',
    options: ['99', '2', 'undefined', 'A TypeError is thrown'],
    correct: 0,
    explanation:
      'Object spread is a *shallow* copy. `copy.a` is an independent number, but `copy.nested` is the same object reference as `original.nested`, so mutating it is visible through both.',
  },
  {
    id: 'pq-core-06',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['object-utilities', 'objects'],
    prompt: 'What does `Object.freeze(config)` actually guarantee?',
    options: [
      'Only the direct properties of `config` cannot be added, removed or reassigned; nested objects remain mutable',
      'The whole object graph becomes immutable, including every nested object',
      'The object cannot be read until it is unfrozen',
      'Reassigning a property throws a TypeError in every mode',
    ],
    correct: 0,
    explanation:
      '`Object.freeze` is shallow. `config.nested.value = 1` still works. It is also silent in sloppy mode — the assignment simply does nothing — and only throws in strict mode.',
  },
  {
    id: 'pq-core-07',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.OUTPUT,
    topicIds: ['functions', 'scope'],
    prompt: 'What is logged?',
    code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext();\nnext();\nconsole.log(next());',
    options: ['3', '1', 'undefined', 'NaN'],
    correct: 0,
    explanation:
      'The returned arrow function closes over the *binding* `n`, not a copy of its value at creation time. Each call increments the same live binding, so the third call returns `3`.',
  },
  {
    id: 'pq-core-08',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.HARD,
    kind: K.OUTPUT,
    topicIds: ['hoisting', 'scope'],
    prompt: 'What happens when this runs?',
    code: 'console.log(value);\nlet value = 10;',
    options: [
      'A ReferenceError is thrown because `value` is in the temporal dead zone',
      '`undefined` is logged, because `let` is hoisted and initialised to `undefined`',
      '`10` is logged, because `let` declarations are evaluated first',
      'A SyntaxError is thrown before any code runs',
    ],
    correct: 0,
    explanation:
      '`let` and `const` bindings *are* created when the scope is instantiated, but they stay uninitialised until the declaration is evaluated. Reading one in that window — the temporal dead zone — throws a ReferenceError. Only `var` is initialised to `undefined` up front.',
  },
  {
    id: 'pq-core-09',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.HARD,
    kind: K.OUTPUT,
    topicIds: ['functions', 'arrow-functions'],
    prompt: 'What is logged?',
    code: 'function greet(greeting, ...names) {\n  return `${greeting} ${names.length}`;\n}\nconsole.log(greet("hi", "a", "b", "c"));',
    options: ['"hi 3"', '"hi 4"', '"hi 0"', 'A TypeError is thrown'],
    correct: 0,
    explanation:
      'A rest parameter collects every argument *after* the named ones into a real array. `greeting` takes `"hi"`, leaving three names.',
  },
  {
    id: 'pq-core-10',
    domain: D.CORE_LANGUAGE,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['array-methods', 'higher-order'],
    prompt: 'Which call correctly removes falsy entries *and* leaves the original array untouched?',
    options: [
      '`const clean = items.filter(Boolean);`',
      '`const clean = items.forEach(Boolean);`',
      '`const clean = items.splice(0, items.length);`',
      '`const clean = items.sort(Boolean);`',
    ],
    correct: 0,
    explanation:
      '`filter` returns a new array and never mutates. `forEach` always returns `undefined`. `splice` mutates and returns the removed items. `sort` mutates and expects a comparator returning a number.',
  },
];
