import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Foundations — variables, types, coercion, operators, control flow, loops.
 *
 * These questions decide whether a learner needs to start at the very beginning,
 * so they must be unambiguous. Nothing here depends on a browser, a library, or
 * a specification corner that a competent developer could reasonably not know.
 */

export default [
  {
    id: 'pq-fnd-01',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.BEGINNER,
    kind: K.SINGLE,
    topicIds: ['variables'],
    prompt: 'Which declaration creates a binding that cannot be reassigned later?',
    options: ['`const`', '`let`', '`var`', 'None — every JavaScript binding can be reassigned'],
    correct: 0,
    explanation:
      '`const` forbids *reassignment* of the binding. It does not freeze the value: `const a = []; a.push(1)` is perfectly legal, because the binding still points at the same array.',
  },
  {
    id: 'pq-fnd-02',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.BEGINNER,
    kind: K.OUTPUT,
    topicIds: ['types', 'variables'],
    prompt: 'What is logged?',
    code: 'let count;\nconsole.log(typeof count);',
    options: ['"undefined"', '"null"', '"number"', 'A ReferenceError is thrown'],
    correct: 0,
    explanation:
      'A declared but uninitialised variable holds `undefined`, and `typeof undefined` is the string `"undefined"`.',
  },
  {
    id: 'pq-fnd-03',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.BEGINNER,
    kind: K.OUTPUT,
    topicIds: ['coercion', 'operators'],
    prompt: 'What is logged?',
    code: 'console.log("5" + 3);\nconsole.log("5" - 3);',
    options: ['"53" then 2', '8 then 2', '"53" then "53"', '8 then "53"'],
    correct: 0,
    explanation:
      '`+` is overloaded: if either operand is a string it concatenates, giving `"53"`. `-` has no string meaning, so both operands are converted to numbers and the result is `2`.',
  },
  {
    id: 'pq-fnd-04',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.EASY,
    kind: K.SINGLE,
    topicIds: ['operators', 'coercion'],
    prompt: 'What is the difference between `==` and `===`?',
    options: [
      '`==` converts the operands to a common type before comparing; `===` requires the types to already match',
      '`==` compares values and `===` compares memory addresses',
      'They are identical; `===` is only a style preference',
      '`===` works on objects and `==` only works on primitives',
    ],
    correct: 0,
    explanation:
      '`==` applies the abstract equality algorithm, which coerces before comparing, so `"1" == 1` is `true`. `===` returns `false` immediately when the types differ.',
  },
  {
    id: 'pq-fnd-05',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.EASY,
    kind: K.OUTPUT,
    topicIds: ['booleans', 'control-flow', 'coercion'],
    prompt: 'What is logged?',
    code: 'const values = [0, "", "0", [], null];\nconsole.log(values.filter(Boolean).length);',
    options: ['2', '0', '3', '5'],
    correct: 0,
    explanation:
      'Only `"0"` and `[]` are truthy here. `0`, `""` and `null` are falsy. An empty array is an object, and every object is truthy — which is why `[] == false` being `true` surprises people, but that is coercion, not truthiness.',
  },
  {
    id: 'pq-fnd-06',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['types'],
    prompt: 'Which statement about JavaScript primitives is accurate?',
    options: [
      'Primitives are immutable, so a string method always returns a new string rather than changing the original',
      'Primitives are stored by reference, so two variables can share the same number',
      '`typeof null` is `"null"`, which is why `null` is a primitive',
      'Arrays are primitives because they hold a fixed list of values',
    ],
    correct: 0,
    explanation:
      'Primitives cannot be mutated: `s.toUpperCase()` returns a new string and leaves `s` untouched. `typeof null` is famously `"object"` — a long-standing bug that is now unfixable for compatibility reasons.',
  },
  {
    id: 'pq-fnd-07',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.EASY,
    kind: K.OUTPUT,
    topicIds: ['loops', 'control-flow'],
    prompt: 'What is logged?',
    code: 'let total = 0;\nfor (let i = 0; i < 5; i++) {\n  if (i === 2) continue;\n  if (i === 4) break;\n  total += i;\n}\nconsole.log(total);',
    options: ['4', '6', '10', '3'],
    correct: 0,
    explanation:
      '`continue` skips only the current iteration, so `i === 2` contributes nothing. `break` exits the loop entirely before `i === 4` is added. The sum is `0 + 1 + 3`, which is `4`.',
  },
  {
    id: 'pq-fnd-08',
    domain: D.FOUNDATIONS,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['operators'],
    prompt: 'When does `??` produce a different result from `||`?',
    options: [
      'When the left operand is `0`, `""` or `false` — `??` keeps them, `||` replaces them',
      'Never; `??` is a shorter spelling of `||`',
      'When the left operand is an object, because `??` compares by reference',
      'Only inside an `if` statement, where `??` short-circuits differently',
    ],
    correct: 0,
    explanation:
      '`||` falls through on any falsy value, so `0 || 10` is `10`. `??` falls through only on `null` and `undefined`, so `0 ?? 10` is `0`. That difference is exactly why `??` exists for defaults.',
  },
];
