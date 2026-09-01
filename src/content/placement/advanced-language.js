import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Advanced language — `this`, prototypes, classes, closures, Map/Set, modules.
 *
 * These are the mental-model questions. They are hard, but none of them is
 * trivia: every one describes something that changes how you write code.
 */

export default [
  {
    id: 'pq-adv-01',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['this'],
    prompt: 'What determines the value of `this` inside a normal (non-arrow) function?',
    options: [
      'How the function is called — the call form at the call site',
      'Where the function was defined in the source',
      'The file or module the function lives in',
      'The type of the value the function returns',
    ],
    correct: 0,
    explanation:
      '`this` for a normal function is bound at call time by the call form: `obj.fn()` binds `obj`, a bare `fn()` binds `undefined` in strict mode, `new Fn()` binds the new instance, and `call`/`apply`/`bind` set it explicitly.',
  },
  {
    id: 'pq-adv-02',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.EXPERT,
    kind: K.OUTPUT,
    topicIds: ['this'],
    prompt: 'What is logged?',
    code: 'const timer = {\n  label: "tick",\n  start() {\n    return [1].map(function () { return this?.label; })[0];\n  },\n};\nconsole.log(timer.start());',
    options: ['undefined', '"tick"', 'null', 'A TypeError is thrown'],
    correct: 0,
    explanation:
      'The callback passed to `map` is a normal function invoked by `map` itself, not as a method of `timer`, so its `this` is not `timer`. An arrow function would inherit `this` lexically from `start` and log `"tick"`.',
  },
  {
    id: 'pq-adv-03',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.HARD,
    kind: K.OUTPUT,
    topicIds: ['closures'],
    prompt: 'What is logged?',
    code: 'const fns = [];\nfor (var i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns.map((f) => f()).join(","));',
    options: ['"3,3,3"', '"0,1,2"', '"2,2,2"', '"0,0,0"'],
    correct: 0,
    explanation:
      '`var` creates one function-scoped binding shared by all three closures, and by the time they run the loop has finished with `i === 3`. Closures capture the binding, not a snapshot of its value. Switching to `let` gives a fresh binding per iteration and logs `"0,1,2"`.',
  },
  {
    id: 'pq-adv-04',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['prototypes', 'classes'],
    prompt: 'What is `class` syntax in JavaScript?',
    options: [
      'Syntax over the prototype system — methods land on `Fn.prototype` and instances delegate to it',
      'A separate object model that replaces prototypes for instances created with `new`',
      'A compile-time construct that is erased before the code runs',
      'A way to create objects that cannot be extended after definition',
    ],
    correct: 0,
    explanation:
      'A class declaration creates a constructor function whose `prototype` object holds the methods. `Object.getPrototypeOf(instance) === Class.prototype`. The differences from a function are real — strict mode, a TDZ, no call without `new` — but the object model underneath is unchanged.',
  },
  {
    id: 'pq-adv-05',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['data-structures'],
    prompt: 'When is a `Map` genuinely the right choice over a plain object?',
    options: [
      'When keys are not strings or symbols, or when you need reliable insertion order and a `size`',
      'Always — a Map is faster than an object for every workload',
      'When the data must be serialised with `JSON.stringify`',
      'When you need the keys sorted automatically',
    ],
    correct: 0,
    explanation:
      'A Map accepts any value as a key, including objects, keeps insertion order for all key types, and exposes `size`. It is not universally faster, and `JSON.stringify` on a Map gives `{}` — you must convert it first.',
  },
  {
    id: 'pq-adv-06',
    domain: D.ADVANCED_LANGUAGE,
    difficulty: DIFFICULTY.EXPERT,
    kind: K.SINGLE,
    topicIds: ['modules'],
    prompt: 'Which statement about ES modules is accurate?',
    options: [
      'Imports are live bindings, are hoisted, and the module body runs once no matter how many files import it',
      'Each importing file gets its own fresh copy of the module body',
      'Imports are copies of the exported values at import time and never change afterwards',
      '`import` statements can be placed inside an `if` block to load conditionally',
    ],
    correct: 0,
    explanation:
      'A module is evaluated once and cached; importers share that instance. Bindings are live views, so an exported counter incremented inside the module is visible to importers. Static `import` is hoisted and cannot be nested in a block — `import()` is the dynamic form for that.',
  },
];
