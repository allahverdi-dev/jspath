import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Fundamentals: variables, primitives, types, coercion, equality, operators.
 *
 * These are the questions that open almost every JavaScript interview. The bar
 * here is not "can you define it" — it is "can you explain it precisely enough
 * that an interviewer believes you have actually hit the edge cases."
 */

const TOPIC = 'Fundamentals';

export const questions = [
  {
    id: 'iv-fund-var-let-const',
    question: 'What is the difference between `var`, `let` and `const`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['variables', 'scope', 'hoisting'],
    relatedLessons: ['l-m01-01', 'l-m10-01'],
    shortAnswer:
      '`var` is function-scoped and is initialised to `undefined` when its scope is entered. `let` and `const` are block-scoped and stay in the Temporal Dead Zone until their declaration runs, so reading them early throws. `const` additionally forbids reassigning the binding — it does not make the value immutable.',
    deepAnswer: [
      'The three differ on three separate axes, and mixing them up is the most common way this answer goes wrong: **scope**, **initialisation before the declaration**, and **reassignment**.',
      '**Scope.** `var` is scoped to the nearest enclosing **function** (or the module/global scope), so a `var` declared inside an `if` block is visible throughout the whole function. `let` and `const` are scoped to the nearest enclosing **block** — any `{ }` — which is almost always what you actually want.',
      '**Initialisation.** All three are hoisted, in the sense that the engine knows about them before the code runs. The difference is what happens if you touch them first. A `var` binding is created **and initialised to `undefined`** when the scope is entered, so reading it early gives `undefined`. A `let`/`const` binding is created but **not initialised** — it sits in the Temporal Dead Zone, and reading it before the declaration throws a `ReferenceError`. Saying "`let` is not hoisted" is the standard wrong answer here; it is hoisted, it is just not initialised.',
      '**Reassignment.** `const` prevents reassigning the **binding**. It says nothing about the value. `const user = {}; user.name = "Ada";` is perfectly legal, because the object is mutated rather than the binding rebound. If you want the value frozen too, that is `Object.freeze`, and even that is shallow.',
      'In practice: default to `const`, use `let` when you genuinely need to reassign, and treat `var` as legacy. The reason is not fashion — block scoping eliminates a whole class of loop and closure bugs that `var` makes easy to write.',
    ],
    keyPoints: [
      'Scope: `var` is function-scoped, `let`/`const` are block-scoped',
      'All three are hoisted; `var` is initialised to `undefined`, `let`/`const` are not (TDZ)',
      'Reading a `let`/`const` before its declaration throws a `ReferenceError`',
      '`const` prevents rebinding, not mutation of the value',
      'Practical rule: `const` by default, `let` when reassigning, avoid `var`',
    ],
    commonMistakes: [
      'Saying "`let` and `const` are not hoisted" — they are hoisted, but left uninitialised in the TDZ.',
      'Claiming `const` makes an object immutable. It only prevents reassigning the binding.',
      'Describing `var` as "globally scoped" — it is function-scoped, and only global when declared at the top level.',
    ],
    followUps: [
      'What exactly is the Temporal Dead Zone, and when does it end?',
      'Show me a loop bug that `var` causes and `let` does not.',
      'Does `const` give you any performance benefit?',
    ],
  },

  {
    id: 'iv-fund-tdz',
    question: 'What is the Temporal Dead Zone?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['hoisting', 'scope', 'variables'],
    relatedLessons: ['l-m10-01'],
    shortAnswer:
      'The Temporal Dead Zone is the span between a block being entered and a `let` or `const` declaration inside it actually executing. The binding exists for that whole span but is uninitialised, so any read of it throws a `ReferenceError` rather than returning `undefined`.',
    deepAnswer: [
      'When the engine enters a scope it creates bindings for every declaration in that scope up front. That much is true for `var`, `let`, `const`, functions and classes alike — this is what "hoisting" describes.',
      'What differs is **initialisation**. A `var` binding is immediately initialised to `undefined`. A `let` or `const` binding is created in an explicitly uninitialised state, and stays that way until the declaration statement is reached at runtime. Accessing it during that window throws `ReferenceError: Cannot access \'x\' before initialization`.',
      'The window is called **temporal** rather than spatial for a reason worth knowing: it is about time, not position in the source. A function defined above a `let` declaration can read that variable perfectly well, as long as it is **called** after the declaration has run. Position in the file is not what matters; execution order is.',
      'The design intent is to turn a silent bug into a loud one. Under `var`, using a variable before you meant to gives you `undefined` and the failure surfaces somewhere else entirely. The TDZ makes it fail at the point of the mistake.',
      'One practical consequence: `typeof` is not safe on a TDZ variable. `typeof someUndeclared` returns `"undefined"` harmlessly, but `typeof x` where `x` is a `let` in the TDZ throws.',
    ],
    keyPoints: [
      'Spans from scope entry to the declaration statement executing',
      'The binding exists but is uninitialised — reads throw `ReferenceError`',
      'Applies to `let`, `const` and `class`; not to `var` or function declarations',
      'Temporal, not spatial — a function can close over it and read it later safely',
      '`typeof` does not protect you: it throws inside the TDZ',
    ],
    commonMistakes: [
      'Describing it as "the variable does not exist yet" — it exists, it is uninitialised.',
      'Assuming `typeof` is always safe. It is safe for undeclared names, not for TDZ bindings.',
    ],
    followUps: [
      'Does `typeof` protect you inside the TDZ?',
      'Are class declarations subject to the TDZ?',
      'Why did the language designers choose to throw rather than return `undefined`?',
    ],
  },

  {
    id: 'iv-fund-hoisting-var-output',
    question: 'Reading a `var` before its declaration — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.OUTPUT,
    topicIds: ['hoisting', 'variables'],
    relatedLessons: ['l-m10-01'],
    code: 'console.log(value);\nvar value = 10;\nconsole.log(value);',
    options: ['undefined\n10', 'ReferenceError', '10\n10', 'null\n10'],
    correct: 0,
    shortAnswer:
      'It prints `undefined` then `10`. The `var` binding is created and initialised to `undefined` when the scope is entered, so the first read succeeds with `undefined`; the assignment only happens when that line actually runs.',
    deepAnswer: [
      'The engine processes this in two phases. On entering the scope it creates a binding for `value` and initialises it to `undefined` — this is what people mean by "`var` is hoisted." The assignment `= 10` is **not** hoisted; it stays where it is written.',
      'So at the first `console.log`, `value` is a real, initialised binding holding `undefined`. That is why you get `undefined` rather than a `ReferenceError` — the name resolves fine, it just has not been assigned yet.',
      'Then `var value = 10` executes, assigning 10, and the second log shows `10`.',
      'The reason this is an interview staple is the contrast with `let`: the identical code with `let` throws, because the binding exists but is uninitialised. Being able to explain **both** behaviours in terms of "binding created" versus "binding initialised" is what separates a memorised answer from an understood one.',
    ],
    keyPoints: [
      'Declaration is hoisted and initialised to `undefined`; the assignment is not hoisted',
      'The first read succeeds — the binding exists',
      'Contrast with `let`, which would throw a `ReferenceError`',
    ],
    commonMistakes: [
      'Answering `ReferenceError` by confusing `var` with `let` behaviour.',
      'Saying "the whole `var value = 10` line moves to the top" — only the declaration does, not the assignment.',
    ],
    followUps: [
      'What does the same code print with `let` instead of `var`?',
      'What about with a function declaration instead of a variable?',
    ],
  },

  {
    id: 'iv-fund-hoisting-let-output',
    question: 'Reading a `let` before its declaration — what happens?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['hoisting', 'variables', 'errors'],
    relatedLessons: ['l-m10-01'],
    code:
      'try {\n' +
      '  console.log(value);\n' +
      '  let value = 10;\n' +
      '} catch (error) {\n' +
      '  console.log(error.constructor.name);\n' +
      '}',
    options: ['ReferenceError', 'undefined', 'TypeError', 'SyntaxError'],
    correct: 0,
    shortAnswer:
      'It throws a `ReferenceError`, caught and logged here as `ReferenceError`. The `let` binding exists from the moment the block is entered but is uninitialised until its declaration runs, so reading it first is an error rather than `undefined`.',
    deepAnswer: [
      'This is the direct contrast to the `var` version, and the difference is entirely about initialisation, not existence.',
      'Entering the block creates a binding for `value`. Because it is `let`, that binding is left uninitialised — it is in the Temporal Dead Zone. Reading an uninitialised binding is specified to throw `ReferenceError: Cannot access \'value\' before initialization`.',
      'Note the error **type** is worth getting right in an interview. It is a `ReferenceError`, the same class you get for a genuinely undeclared name, but the message is different and more informative — "cannot access before initialization" rather than "is not defined".',
      'The reason the language throws here rather than returning `undefined` is deliberate: under `var`, this exact mistake produces a silent `undefined` that fails later somewhere confusing. Throwing at the point of use makes the bug findable.',
    ],
    keyPoints: [
      'The binding exists but is uninitialised — this is the TDZ',
      'The error is a `ReferenceError`, not a `TypeError` or `SyntaxError`',
      'Contrast with `var`, which would log `undefined`',
      'Throwing early is a deliberate design choice to surface the mistake at its source',
    ],
    commonMistakes: [
      'Answering `undefined`, which is the `var` behaviour.',
      'Calling it a `SyntaxError` — the code parses fine; the failure is at runtime.',
    ],
    followUps: [
      'Would `typeof value` inside the try block behave differently?',
      'Is the same true for `const` and `class` declarations?',
    ],
  },

  {
    id: 'iv-fund-typeof-null',
    question: 'Why does `typeof null` return `"object"`?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['types', 'coercion'],
    relatedLessons: ['l-m02-01'],
    shortAnswer:
      'It is a bug from the first version of JavaScript that was never fixed for backward-compatibility reasons. Values were tagged by their low bits, objects were tagged `000`, and `null` was the null pointer — all zero bits — so it read as an object. `null` is a primitive, not an object.',
    deepAnswer: [
      'In the original implementation, a value was stored as a type tag plus a payload. The tag `000` meant "object". `null` was represented as the null machine pointer, which is all zeroes, so its tag bits also read `000` and `typeof` reported `"object"`.',
      'It was proposed for removal and rejected, because a lot of existing code branches on `typeof x === "object"` and changing it would break the web. So it stays as a documented quirk.',
      'The important part for an interview is what follows from it: **`typeof` alone cannot distinguish `null` from a real object.** So the reliable checks are `value === null` for null specifically, and `typeof value === "object" && value !== null` for "is this a non-null object".',
      'It is also worth noting that `null` genuinely is a primitive — one of the seven, alongside `undefined`, `boolean`, `number`, `string`, `symbol` and `bigint`. The `typeof` result is wrong; the type system is not.',
      'A related gotcha: `typeof` on a function returns `"function"`, even though functions are objects. That one is deliberate, not a bug.',
    ],
    keyPoints: [
      'A historical implementation bug, kept for backward compatibility',
      'Type tag `000` meant object; the null pointer was all zeroes',
      '`null` is a primitive despite what `typeof` says',
      'Reliable check: `typeof v === "object" && v !== null`',
    ],
    commonMistakes: [
      'Concluding `null` is therefore an object. It is a primitive.',
      'Using `typeof x === "object"` as an object check without excluding `null`.',
    ],
    followUps: [
      'How would you reliably check that a value is a non-null object?',
      'What does `typeof` return for a function, and why is that different?',
      'What are all the primitive types?',
    ],
  },

  {
    id: 'iv-fund-null-vs-undefined',
    question: 'What is the difference between `null` and `undefined`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['types', 'variables'],
    relatedLessons: ['l-m02-01'],
    shortAnswer:
      '`undefined` means a value was never assigned — it is what the language gives you by default. `null` means "deliberately no value" — it is what a programmer assigns to say "nothing here on purpose." Both are primitives; they are loosely equal to each other and to nothing else.',
    deepAnswer: [
      'The distinction is about **who set it**. `undefined` is the language\'s default: an unassigned variable, a missing object property, a parameter you did not pass, and the return value of a function with no `return` are all `undefined`. `null` never appears by accident — something has to assign it.',
      'That makes `null` a useful signal in your own APIs: "I looked, and there genuinely is nothing" is different from "nobody ever set this." A cache returning `null` for a miss and `undefined` for "not checked yet" is a meaningful distinction.',
      'Equality behaviour is worth memorising precisely: `null == undefined` is `true`, but `null === undefined` is `false`. And `null == 0` is `false` — `null` is loosely equal only to `undefined` and itself, not to any number. That asymmetry surprises people who assume `==` coerces everything to numbers.',
      'They differ in arithmetic too: `Number(null)` is `0`, but `Number(undefined)` is `NaN`. So `null + 1` is `1` and `undefined + 1` is `NaN`.',
      'The practical idiom that ties them together is `??` and `value != null`. Both treat `null` and `undefined` as the same "no value" case and nothing else — which is usually exactly the check you want.',
    ],
    keyPoints: [
      '`undefined` is the language default; `null` is an explicit programmer assignment',
      '`null == undefined` is true; `null === undefined` is false',
      '`null` is loosely equal only to `undefined` and itself — not to `0`',
      '`Number(null)` is `0`; `Number(undefined)` is `NaN`',
      '`??` and `!= null` treat both as "no value" and nothing else',
    ],
    commonMistakes: [
      'Assuming `null == 0` is true because `Number(null)` is `0`. Loose equality has a special case for `null`.',
      'Using `||` where `??` is meant, which also swallows `0`, `""` and `false`.',
    ],
    followUps: [
      'Why does `??` exist when `||` already provides a default?',
      'What does `typeof null` return, and why?',
      'When would you deliberately return `null` from a function rather than `undefined`?',
    ],
  },

  {
    id: 'iv-fund-eq-vs-strict-eq',
    question: 'What is the difference between `==` and `===`, and which should you use?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['coercion', 'operators'],
    relatedLessons: ['l-m03-01'],
    shortAnswer:
      '`===` compares type and value with no conversion. `==` converts the operands to a common type first, following a specific set of rules, then compares. Use `===` by default; the one idiomatic exception is `x == null`, which checks for `null` or `undefined` in one step.',
    deepAnswer: [
      '`===` is the simple one: if the types differ the answer is `false`, otherwise compare the values. The only surprises are `NaN === NaN` being `false` and `+0 === -0` being `true`, both of which come from the floating-point spec rather than from equality itself.',
      '`==` applies an abstract equality algorithm. The parts worth remembering are: `null == undefined` is true and neither is loosely equal to anything else; a string compared with a number converts the string to a number; a boolean is converted to a number **before** anything else, which is why `"1" == true` is true and `"true" == true` is false; and an object compared to a primitive is converted to a primitive first via `valueOf`/`toString`.',
      'That last rule produces the notorious results — `[] == false` is true, because `[]` becomes `""` becomes `0`, and `false` becomes `0`. The point in an interview is not to recite the table, it is to be able to say **why** a result happens by naming the conversion steps.',
      'The practical guidance is unambiguous: use `===`. Linters default to it. The single common exception is `value == null`, which is true for exactly `null` and `undefined` and is clearer than writing both checks. Some teams ban even that; either position is defensible as long as you know what the operator does.',
      'The deeper reason to prefer `===` is not correctness in a specific case, it is that `==` makes the reader simulate a conversion algorithm to know what the code does, and `===` does not.',
    ],
    keyPoints: [
      '`===`: no conversion, types must match',
      '`==`: converts to a common type using the abstract equality rules',
      'Booleans convert to numbers first — hence `"1" == true` but not `"true" == true`',
      'Objects convert to primitives via `valueOf`/`toString`',
      'Default to `===`; `x == null` is the one common, defensible exception',
    ],
    commonMistakes: [
      'Saying "`==` compares value, `===` compares value and type" and stopping there — it misses that `==` **converts**, which is where all the surprises live.',
      'Claiming `==` is always wrong. It has one genuinely idiomatic use.',
    ],
    followUps: [
      'Why is `[] == false` true?',
      'How does `Object.is` differ from `===`?',
      'Is `NaN === NaN` true? Why not?',
    ],
  },

  {
    id: 'iv-fund-object-is',
    question: 'How does `Object.is` differ from `===`?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['operators', 'numbers', 'types'],
    relatedLessons: ['l-m03-01'],
    shortAnswer:
      'They agree on everything except two cases: `Object.is(NaN, NaN)` is `true` where `NaN === NaN` is `false`, and `Object.is(0, -0)` is `false` where `0 === -0` is `true`. Neither performs any type conversion.',
    deepAnswer: [
      '`Object.is` implements the SameValue algorithm; `===` implements Strict Equality. They differ in exactly two places, and knowing which two is the whole answer.',
      '**`NaN`.** Strict equality says `NaN` is not equal to itself, which follows the IEEE-754 floating-point rule. That is why `[NaN].indexOf(NaN)` is `-1`. `Object.is(NaN, NaN)` is `true`, which is usually what you actually want when asking "is this value NaN" — though `Number.isNaN(x)` is the clearer way to ask that specific question.',
      '**Signed zero.** `0 === -0` is `true`, because they compare as numerically equal. `Object.is(0, -0)` is `false`, because they are distinguishable values — `1/0` is `Infinity` and `1/-0` is `-Infinity`. This matters rarely, but when it matters it matters a lot, typically in numeric code that divides.',
      'There is a third algorithm worth naming: **SameValueZero**, which treats `NaN` as equal to itself **and** `0` as equal to `-0`. That is what `Array.prototype.includes`, `Set` and `Map` keys use. So `[NaN].includes(NaN)` is `true` while `[NaN].indexOf(NaN)` is `-1` — a genuinely useful thing to be able to explain.',
      'In practice you rarely reach for `Object.is` directly. Its value in an interview is as evidence you know equality in JavaScript is three algorithms, not one.',
    ],
    keyPoints: [
      '`Object.is` is SameValue; `===` is Strict Equality',
      'Differs only on `NaN` (Object.is says equal) and `+0`/`-0` (Object.is says not equal)',
      'Neither does any type conversion',
      'SameValueZero is the third algorithm — used by `includes`, `Set` and `Map`',
      '`[NaN].includes(NaN)` is true; `[NaN].indexOf(NaN)` is -1',
    ],
    commonMistakes: [
      'Thinking `Object.is` is a loose-equality alternative. It does no conversion at all.',
      'Not knowing SameValueZero exists, which is what explains the `includes`/`indexOf` difference.',
    ],
    followUps: [
      'Which algorithm does `Set` use for key identity?',
      'How would you check whether a value is `NaN`?',
      'When would `+0` versus `-0` actually matter in real code?',
    ],
  },

  {
    id: 'iv-fund-coercion-plus',
    question: 'Explain what the `+` operator does when the operands are not both numbers.',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['coercion', 'operators', 'strings'],
    relatedLessons: ['l-m03-01', 'l-m04-01'],
    shortAnswer:
      '`+` first converts both operands to primitives. If **either** result is a string, it concatenates; otherwise it converts both to numbers and adds. That single rule explains `1 + "2"` being `"12"` and `1 + true` being `2`.',
    deepAnswer: [
      '`+` is the only arithmetic operator that is also string concatenation, which is why it behaves unlike `-`, `*` and `/`.',
      'The algorithm is: convert each operand to a primitive (using `valueOf` then `toString` for objects, in that order for the default hint). Then, **if either primitive is a string**, convert both to strings and concatenate. Otherwise convert both to numbers and add.',
      'So `1 + "2"` is `"12"` — one side is a string, so concatenation wins. But `1 - "2"` is `-1`, because `-` has no string behaviour and converts straight to numbers. That asymmetry catches people constantly.',
      '`1 + true` is `2`: neither primitive is a string, so both become numbers and `true` becomes `1`. `1 + null` is `1` for the same reason. `1 + undefined` is `NaN`, because `Number(undefined)` is `NaN`.',
      'Arrays and objects go through the primitive conversion first. `[] + []` is `""` because both arrays stringify to empty strings. `[] + {}` is `"[object Object]"`. `{}` at the start of a statement is parsed as a block rather than an object, which is why `{} + []` in a console can appear to be `0` — a parsing quirk, not a coercion one, and worth distinguishing.',
      'The practical takeaway: never rely on `+` for coercion. Use `Number(x)` or `String(x)` explicitly, so the reader does not have to run the algorithm in their head.',
    ],
    keyPoints: [
      'Both operands convert to primitives first',
      'If either primitive is a string, concatenate; otherwise add as numbers',
      '`-`, `*`, `/` have no string branch — they always go numeric',
      '`Number(true)` is 1, `Number(null)` is 0, `Number(undefined)` is `NaN`',
      'Prefer explicit `Number()`/`String()` over relying on `+`',
    ],
    commonMistakes: [
      'Saying "`+` always concatenates when a string is involved" without mentioning the primitive-conversion step, which is what explains objects and arrays.',
      'Assuming `-` behaves like `+` for strings.',
    ],
    followUps: [
      'What does `[] + {}` produce, and why?',
      'Why is `1 - "2"` a number but `1 + "2"` a string?',
      'How would you convert a string to a number safely?',
    ],
  },

  {
    id: 'iv-fund-coercion-output',
    question: 'What do these five arithmetic expressions print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['coercion', 'operators'],
    relatedLessons: ['l-m03-01'],
    code:
      'console.log(1 + "2");\n' +
      'console.log(1 - "2");\n' +
      'console.log(1 + true);\n' +
      'console.log(1 + null);\n' +
      'console.log(1 + undefined);',
    options: [
      '12\n-1\n2\n1\nNaN',
      '3\n-1\n2\n1\nNaN',
      '12\n-1\n1true\n1null\n1undefined',
      '12\nNaN\n2\n1\nNaN',
    ],
    correct: 0,
    shortAnswer:
      '`"12"`, `-1`, `2`, `1`, `NaN`. `+` concatenates when either operand is a string; `-` has no string branch so it converts to numbers. `true` becomes `1`, `null` becomes `0`, and `undefined` becomes `NaN`.',
    deepAnswer: [
      '`1 + "2"` — one operand is a string, so `+` concatenates: `"12"`.',
      '`1 - "2"` — `-` has no string behaviour, so both convert to numbers: `1 - 2` is `-1`. This line is the whole point of the question; it shows the string branch belongs to `+` specifically, not to arithmetic generally.',
      '`1 + true` — neither primitive is a string, so both go numeric. `Number(true)` is `1`, giving `2`.',
      '`1 + null` — `Number(null)` is `0`, giving `1`.',
      '`1 + undefined` — `Number(undefined)` is `NaN`, and `NaN` propagates, giving `NaN`. The contrast between `null` and `undefined` here is the second thing this question is testing.',
    ],
    keyPoints: [
      '`+` concatenates if either operand is a string; other arithmetic operators do not',
      '`Number(true)` is 1',
      '`Number(null)` is 0 but `Number(undefined)` is `NaN`',
      '`NaN` propagates through arithmetic',
    ],
    commonMistakes: [
      'Expecting `1 - "2"` to also concatenate or throw.',
      'Assuming `null` and `undefined` coerce the same way numerically. They do not.',
    ],
    followUps: [
      'Why does `null` convert to 0 but `undefined` to `NaN`?',
      'What would `"3" * "4"` produce?',
    ],
  },

  {
    id: 'iv-fund-truthy-falsy',
    question: 'Which values are falsy in JavaScript?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['booleans', 'coercion', 'control-flow'],
    relatedLessons: ['l-m03-01'],
    shortAnswer:
      'Exactly eight: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy — including `[]`, `{}`, `"0"`, `"false"` and any function.',
    deepAnswer: [
      'The list is short and finite, which is what makes it worth memorising precisely rather than reasoning about case by case: `false`, `0`, `-0`, `0n` (the BigInt zero), `""`, `null`, `undefined`, `NaN`.',
      'The consequences that actually bite in real code are on the truthy side. An empty array is truthy, so `if (items)` is true even when there is nothing in it — you almost always meant `if (items.length)`. An empty object is truthy for the same reason. The string `"0"` is truthy because it is a non-empty string, even though the number `0` is falsy.',
      'This is also the argument for `??` over `||`. `value || fallback` fires the fallback for **any** falsy value, so a legitimate `0`, `""` or `false` gets silently replaced. `value ?? fallback` fires only for `null` and `undefined`. Using `||` to supply a default for a numeric setting is one of the most common real bugs this list explains.',
      'A neat practical consequence: `array.filter(Boolean)` removes exactly the falsy entries, because `Boolean` used as a callback performs precisely this conversion. It is more reliable than hand-writing the checks, which tend to miss `NaN` and `-0`.',
    ],
    keyPoints: [
      'Eight falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`',
      '`[]`, `{}`, `"0"`, `"false"` and functions are all truthy',
      '`if (items)` does not test emptiness — use `items.length`',
      '`||` fires on any falsy value; `??` fires only on `null`/`undefined`',
      '`filter(Boolean)` keeps exactly the truthy values',
    ],
    commonMistakes: [
      'Believing `[]` or `{}` is falsy.',
      'Using `||` for defaults where `0` or `""` are valid inputs.',
    ],
    followUps: [
      'Give me a bug caused by using `||` instead of `??`.',
      'Is `"false"` truthy?',
      'How would you check that an array has items?',
    ],
  },

  {
    id: 'iv-fund-nullish-vs-or',
    question: 'When would you use `??` instead of `||`?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['operators', 'modern-js', 'booleans'],
    relatedLessons: ['l-m21-01'],
    shortAnswer:
      'Use `??` when `0`, `""` or `false` are legitimate values that should not be replaced. `||` falls back on any falsy value; `??` falls back only on `null` and `undefined`. For defaults on numeric, string or boolean settings, `||` is usually a bug.',
    deepAnswer: [
      'Both supply a fallback, but they disagree about what counts as "no value."',
      '`||` evaluates the right side whenever the left is falsy — which includes `0`, `""`, `false`, `NaN` and `-0`. `??` evaluates the right side only when the left is `null` or `undefined`.',
      'The classic bug: `const quantity = input.quantity || 1`. A user who deliberately sets the quantity to `0` gets `1` instead, and is charged for an item they removed. `?? 1` gives the correct behaviour. The same shape appears with `const label = name || "Anonymous"` silently rejecting an intentional empty string, and `const enabled = config.enabled || true` — which can never be `false`, making the setting useless.',
      '`||` is still the right tool when **any** falsy value genuinely should trigger the fallback: `const displayName = user.nickname || user.username` is fine, because an empty nickname should fall through.',
      'One syntax detail worth knowing: `??` cannot be mixed with `&&` or `||` without parentheses. `a || b ?? c` is a `SyntaxError`, deliberately, because the intended precedence would not be obvious to a reader.',
    ],
    keyPoints: [
      '`||` falls back on any falsy value; `??` only on `null`/`undefined`',
      'Use `??` when `0`, `""` or `false` are valid values',
      '`||` is correct when any falsy value should trigger the fallback',
      'Mixing `??` with `&&`/`||` without parentheses is a `SyntaxError`',
    ],
    commonMistakes: [
      'Treating `??` as a drop-in replacement for `||` everywhere.',
      'Not being able to name a concrete bug `||` causes — which is what the interviewer is listening for.',
    ],
    followUps: [
      'Give me a concrete bug caused by `||`.',
      'What does `??=` do?',
      'Why is `a || b ?? c` a syntax error?',
    ],
  },

  {
    id: 'iv-fund-primitives-list',
    question: 'What are the primitive types in JavaScript, and how do they differ from objects?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['types', 'objects', 'copying'],
    relatedLessons: ['l-m02-01'],
    shortAnswer:
      'Seven primitives: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`. They are immutable and copied by value. Everything else is an object — including arrays and functions — and is copied by reference.',
    deepAnswer: [
      'The seven primitives are `string`, `number`, `boolean`, `null`, `undefined`, `symbol` and `bigint`. Everything that is not one of those is an object.',
      '**Immutability.** Primitives cannot be changed in place. `str[0] = "X"` silently does nothing in sloppy mode and throws in strict mode; string methods like `toUpperCase` return a new string rather than modifying the original. Objects can be mutated in place, which is the whole reason reference semantics matter.',
      '**Copy semantics.** Assigning a primitive copies the value, so the two names are fully independent. Assigning an object copies the **reference**, so both names point at the same thing and a mutation through one is visible through the other. This is the single most important practical consequence, and it is behind a large share of real bugs — passing an object into a function that mutates it, or "copying" an array with `=` and then being surprised the original changed.',
      '**Method access.** Primitives are not objects, yet `"abc".toUpperCase()` works. That is because the engine temporarily wraps the primitive in an object wrapper for the duration of the call, then discards it. This is why assigning a property to a primitive does not stick: the wrapper is thrown away immediately.',
      'It is worth being precise that `typeof null` reporting `"object"` is a bug and does not make `null` an object, and that functions are objects even though `typeof` gives them their own `"function"` result.',
    ],
    keyPoints: [
      'Seven primitives: string, number, boolean, null, undefined, symbol, bigint',
      'Primitives are immutable; objects are mutable',
      'Primitives copy by value; objects copy by reference',
      'Method calls on primitives work via a temporary object wrapper',
      'Arrays and functions are objects',
    ],
    commonMistakes: [
      'Counting `object` or `array` as a primitive type.',
      'Saying "primitives are passed by value, objects by reference" without adding that the **reference itself** is what is copied — the object is not deep-copied, and reassigning the parameter does not affect the caller.',
    ],
    followUps: [
      'Show me a bug caused by reference copying.',
      'Why can you call `.toUpperCase()` on a string primitive?',
      'How do you make an independent copy of an object?',
    ],
  },

  {
    id: 'iv-fund-reference-output',
    question: 'Copying an object versus copying a number — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.OUTPUT,
    topicIds: ['objects', 'copying', 'arrays'],
    relatedLessons: ['l-m14-01'],
    code:
      'const a = { count: 1 };\n' +
      'const b = a;\n' +
      'b.count = 2;\n' +
      'console.log(a.count);\n' +
      '\n' +
      'let x = 1;\n' +
      'let y = x;\n' +
      'y = 2;\n' +
      'console.log(x);',
    options: ['2\n1', '1\n1', '2\n2', '1\n2'],
    correct: 0,
    shortAnswer:
      'It prints `2` then `1`. `b = a` copies the **reference**, so `a` and `b` are the same object and mutating through `b` is visible through `a`. `y = x` copies the primitive value, so the two numbers are independent.',
    deepAnswer: [
      '`const a = { count: 1 }` creates an object and stores a reference to it in `a`. `const b = a` copies that reference — it does not copy the object. There is one object with two names pointing at it.',
      '`b.count = 2` mutates that single shared object, so reading `a.count` sees `2`. Note that `const` did not prevent this: `const` stops you rebinding `a`, not mutating what it points to.',
      '`let y = x` with `x` holding a primitive copies the **value**. `y = 2` then rebinds `y` to a different value entirely, leaving `x` untouched at `1`.',
      'The distinction that matters in real code: mutation through a shared reference propagates; rebinding does not. Even for objects, `b = { count: 2 }` would **not** have changed `a`, because that rebinds `b` rather than mutating the shared object. Interviewers often follow up with exactly that variation.',
    ],
    keyPoints: [
      'Assigning an object copies the reference, not the object',
      '`const` prevents rebinding, not mutation',
      'Primitives copy by value and are fully independent',
      'Rebinding (`b = {...}`) differs from mutating (`b.x = ...`)',
    ],
    commonMistakes: [
      'Expecting `const` to have prevented the mutation.',
      'Predicting `1\\n1` by assuming assignment always deep-copies.',
    ],
    followUps: [
      'What would happen if line 3 were `b = { count: 2 }` instead?',
      'How would you copy the object so the original is unaffected?',
      'What is the difference between a shallow and a deep copy?',
    ],
  },

  {
    id: 'iv-fund-shallow-vs-deep-copy',
    question: 'What is the difference between a shallow copy and a deep copy, and how do you make each?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['copying', 'objects', 'arrays'],
    relatedLessons: ['l-m15-01'],
    shortAnswer:
      'A shallow copy duplicates the top level only — nested objects are still shared references. A deep copy duplicates the whole tree. Shallow: spread or `Object.assign`. Deep: `structuredClone` for data, or a recursive clone if you need to handle functions.',
    deepAnswer: [
      'A **shallow copy** creates a new top-level object whose properties hold the **same references** as the original. `{ ...user }` and `Object.assign({}, user)` both do this. If `user.address` is an object, the copy\'s `address` is the very same object — mutating `copy.address.city` changes the original too. That is the bug this question exists to test.',
      'A **deep copy** recursively duplicates nested structures so nothing is shared. The modern built-in is `structuredClone(value)`, which handles nested objects, arrays, `Date`, `Map`, `Set`, and even cyclic references correctly. Its limitation is that it cannot clone functions or DOM nodes — it throws.',
      'The old trick `JSON.parse(JSON.stringify(obj))` is a deep copy with real problems worth naming: it throws on cycles, silently drops `undefined` values and functions, converts `Date` objects to strings, and empties `Map` and `Set`. It is fine for plain JSON-shaped data and wrong for anything else. Being able to list those failure modes is a strong signal in an interview.',
      'The practical judgement is that deep copying is often the wrong instinct. It is expensive, and most of the time what you actually want is **not mutating shared state in the first place** — building new objects along the path you are changing, which is what immutable-update patterns and libraries like Immer do. Reaching for a deep clone on every update is usually a sign the data flow needs rethinking.',
    ],
    keyPoints: [
      'Shallow copies the top level; nested references are shared',
      'Spread and `Object.assign` are shallow',
      '`structuredClone` is the built-in deep copy; it handles cycles, `Date`, `Map`, `Set`',
      '`structuredClone` cannot clone functions',
      '`JSON.parse(JSON.stringify())` breaks on cycles, `undefined`, functions, `Date`, `Map`, `Set`',
      'Often the better answer is not to mutate shared state at all',
    ],
    commonMistakes: [
      'Calling spread a deep copy.',
      'Recommending the JSON round-trip without naming its failure modes.',
    ],
    followUps: [
      'What exactly does the JSON round-trip lose?',
      'How would you deep-copy an object containing a cycle?',
      'Is deep copying always the right solution to a shared-mutation bug?',
    ],
  },

  {
    id: 'iv-fund-nan',
    question: 'What is `NaN`, and how do you test for it?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['numbers', 'types', 'coercion'],
    relatedLessons: ['l-m06-01'],
    shortAnswer:
      '`NaN` is the numeric value representing an invalid numeric result. It is of type `number` and is the only value not equal to itself, so `x === NaN` never works. Use `Number.isNaN(x)` — not the global `isNaN`, which coerces its argument first.',
    deepAnswer: [
      '`NaN` is produced when an operation that should yield a number cannot: `0/0`, `Math.sqrt(-1)`, `Number("abc")`, `undefined + 1`. Confusingly, `typeof NaN` is `"number"` — it is a number-typed value meaning "not a valid number."',
      'The defining property is that `NaN` is not equal to itself under `==` or `===`. That follows from IEEE-754, and it means `x === NaN` is always false and useless as a test. It also means `[NaN].indexOf(NaN)` is `-1`.',
      '**`Number.isNaN(x)`** returns true only if `x` is actually the `NaN` value. **The global `isNaN(x)`** first coerces its argument to a number, so `isNaN("abc")` is `true` — which is usually not what you meant, since `"abc"` is a string, not `NaN`. Prefer `Number.isNaN` unless you specifically want "is this not coercible to a number."',
      '`Object.is(x, NaN)` also works, since SameValue treats `NaN` as equal to itself. And `Array.prototype.includes` uses SameValueZero, so `[NaN].includes(NaN)` is `true` even though `indexOf` fails — a difference that surprises people and is worth being able to explain.',
      'The other practical hazard is that `NaN` propagates silently through arithmetic. One bad conversion early can turn a whole calculation into `NaN` with no error thrown, which is why validating input at the boundary matters more than checking for `NaN` at the end.',
    ],
    keyPoints: [
      '`typeof NaN` is `"number"`',
      '`NaN` is the only value not equal to itself',
      'Use `Number.isNaN`, not global `isNaN` (which coerces)',
      '`Object.is(x, NaN)` works; so does `[..].includes(NaN)` via SameValueZero',
      '`NaN` propagates silently through arithmetic',
    ],
    commonMistakes: [
      'Testing with `x === NaN`.',
      'Using the global `isNaN` and being surprised that `isNaN("abc")` is true.',
    ],
    followUps: [
      'Why is `[NaN].includes(NaN)` true but `indexOf` returns -1?',
      'What is the difference between `Number("")` and `Number("abc")`?',
      'How would you validate that user input is a real number?',
    ],
  },

  {
    id: 'iv-fund-parseint-vs-number',
    question: 'What is the difference between `parseInt`, `parseFloat` and `Number`?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['numbers', 'strings', 'coercion'],
    relatedLessons: ['l-m06-01'],
    shortAnswer:
      '`Number` converts the whole string and gives `NaN` if any of it is invalid. `parseInt` and `parseFloat` parse from the start and stop at the first character they cannot use, so `parseInt("12px")` is `12` while `Number("12px")` is `NaN`. `parseInt` also takes a radix, which you should always pass.',
    deepAnswer: [
      '`Number(str)` is all-or-nothing: the entire string must be a valid numeric literal (whitespace aside), otherwise you get `NaN`. `Number("")` is `0`, which surprises people — an empty string converts to zero, not `NaN`.',
      '`parseInt(str, radix)` scans from the beginning, consuming as much as looks like an integer in the given base, and stops. `parseInt("12px")` is `12`. `parseInt("px12")` is `NaN`, because it fails immediately. The lenient behaviour is useful for parsing things like CSS values and dangerous everywhere else, because it silently accepts malformed input.',
      '**Always pass the radix.** `parseInt("08")` is `8` in modern engines, but the second argument is what makes the intent explicit and immune to the legacy octal behaviour older environments had. `parseInt("0x1F")` is `31` because a `0x` prefix is recognised as hex — passing `10` explicitly prevents that surprise.',
      '`parseFloat` is the same idea for decimals, and ignores a radix entirely.',
      'The classic interview trap that ties this together is `["1", "2", "3"].map(parseInt)`, which gives `[1, NaN, NaN]`. `map` passes `(value, index)`, so the index becomes the radix: `parseInt("2", 1)` is invalid and `parseInt("3", 2)` is not a binary digit. The fix is `map(Number)` or `map((s) => parseInt(s, 10))`.',
      'For validating user input, `Number` plus an explicit `Number.isFinite` check is usually the honest choice, because it rejects `"12px"` rather than silently accepting half of it.',
    ],
    keyPoints: [
      '`Number` converts the whole string or gives `NaN`; `Number("")` is `0`',
      '`parseInt`/`parseFloat` parse a prefix and stop at the first invalid character',
      'Always pass a radix to `parseInt`',
      '`["1","2","3"].map(parseInt)` gives `[1, NaN, NaN]` because index becomes radix',
      'For validation, prefer `Number` + `Number.isFinite`',
    ],
    commonMistakes: [
      'Omitting the radix in `parseInt`.',
      'Not knowing `Number("")` is `0`.',
      'Using `parseInt` for validation, which silently accepts `"12abc"`.',
    ],
    followUps: [
      'Why does `["1","2","3"].map(parseInt)` misbehave?',
      'How would you validate that a form field contains a real number?',
      'What does `Number(" 42 ")` give?',
    ],
  },

  {
    id: 'iv-fund-float-precision',
    question: 'Why is `0.1 + 0.2 !== 0.3`, and how do you handle money?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['numbers'],
    relatedLessons: ['l-m06-01'],
    shortAnswer:
      'JavaScript numbers are IEEE-754 doubles in base 2, and 0.1 and 0.2 have no exact binary representation, so the sum is `0.30000000000000004`. For money, work in integer minor units (cents) and format only at the display boundary.',
    deepAnswer: [
      'Every JavaScript number is a 64-bit binary floating-point value. Fractions whose denominators are not powers of two — including 0.1 and 0.2 — cannot be represented exactly, in the same way 1/3 cannot be written exactly in decimal. Each is stored as the nearest representable value, and the small errors accumulate: the sum lands on `0.30000000000000004`.',
      'This is not a JavaScript flaw; it is how IEEE-754 works in every language that uses doubles. What is JavaScript-specific is that there is no built-in decimal type to reach for instead.',
      '**For comparison**, do not test floats for exact equality. Compare within a tolerance — ideally a **relative** tolerance scaled to the magnitude of the values, since an absolute epsilon that works for numbers near 1 is meaningless for numbers near a billion.',
      '**For money**, the standard answer is to store integer minor units — cents rather than dollars — because integers add and subtract exactly. Parse the input string into cents without ever building an intermediate float (`parseFloat("0.07") * 100` gives `7.000000000000001`, so string manipulation is safer), do all arithmetic in cents, and format back to a decimal string only when displaying. `BigInt` is an alternative when the amounts can exceed the safe integer range.',
      'It is worth mentioning `Number.MAX_SAFE_INTEGER` here too: above 2^53 - 1, integers themselves stop being exactly representable, which is why large IDs from a backend should be transported as strings rather than numbers.',
    ],
    keyPoints: [
      'Numbers are IEEE-754 doubles; 0.1 and 0.2 have no exact binary form',
      'Not a JavaScript-specific flaw — it affects every double-based language',
      'Compare floats within a tolerance, ideally relative to magnitude',
      'For money: integer cents, parse without an intermediate float, format at display time',
      'Above `Number.MAX_SAFE_INTEGER` integers lose exactness — transport large IDs as strings',
    ],
    commonMistakes: [
      'Recommending `toFixed` as the fix. It formats for display but does not make the arithmetic exact.',
      'Multiplying a parsed float by 100 to "get cents", which reintroduces the same error.',
    ],
    followUps: [
      'How exactly would you parse `"19.99"` into cents without a float?',
      'When would you use `BigInt` instead?',
      'How would you compare two floats safely?',
    ],
  },

  {
    id: 'iv-fund-strict-mode',
    question: 'What does strict mode change, and where is it already on?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['syntax', 'modules', 'this'],
    relatedLessons: ['l-m28-01'],
    shortAnswer:
      'Strict mode turns silent failures into thrown errors, forbids undeclared variable assignment, and makes `this` `undefined` in ordinary function calls instead of the global object. ES modules and class bodies are always strict, so most modern code is already running in it.',
    deepAnswer: [
      'The changes worth naming: assigning to an undeclared variable throws a `ReferenceError` instead of silently creating a global; assigning to a non-writable property or a getter-only accessor throws instead of failing silently; `delete` on a non-configurable property throws; duplicate parameter names are a syntax error; and octal literals like `010` are forbidden.',
      'The one that matters most in interviews is `this`. In a plain function call, sloppy mode substitutes the global object for `this`; strict mode leaves it `undefined`. That is why `const fn = obj.method; fn();` throws "Cannot read properties of undefined" in modern code rather than silently reading from `globalThis`.',
      '**Where it is already on**, which is the part people miss: the body of an ES module is always strict, and so is the body of any `class`. Since almost all modern application code is modules, strict mode is the default environment, and writing `"use strict"` at the top of a module is redundant.',
      'It is still relevant for classic `<script>` tags and for understanding older code. And it is why you should reason about `this` using strict semantics when answering interview questions — assuming sloppy-mode global substitution will usually give the wrong answer for the environment the interviewer has in mind.',
      'Strict mode is also a prerequisite for some optimisations, since forbidding things like `with` and dynamic global creation lets the engine resolve names more predictably.',
    ],
    keyPoints: [
      'Silent failures become thrown errors',
      'Undeclared variable assignment throws instead of creating a global',
      '`this` is `undefined` in a plain function call, not the global object',
      'ES modules and class bodies are always strict',
      '`"use strict"` in a module is redundant',
    ],
    commonMistakes: [
      'Reasoning about `this` using sloppy-mode global substitution when the code is a module.',
      'Thinking strict mode must be opted into explicitly in modern code.',
    ],
    followUps: [
      'What does `this` equal in a plain function call in a module?',
      'Why are class bodies always strict?',
      'Name a bug strict mode catches that sloppy mode hides.',
    ],
  },

  {
    id: 'iv-fund-spread-rest',
    question: 'What is the difference between rest and spread, given they use the same `...` syntax?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['modern-js', 'functions', 'arrays', 'destructuring'],
    relatedLessons: ['l-m21-01'],
    shortAnswer:
      'They are opposites distinguished by position. **Rest** collects remaining items **into** an array or object — it appears in a parameter list or on the left of a destructuring assignment. **Spread** expands an iterable or object **out** — it appears in a call, an array literal or an object literal.',
    deepAnswer: [
      'The syntax is identical, so the way to keep them straight is to ask which side of the assignment or call you are on.',
      '**Rest gathers.** `function sum(...numbers)` collects every argument into a real array. `const [first, ...others] = list` puts everything after the first element into `others`. `const { id, ...rest } = user` puts every property except `id` into `rest` — which is the idiomatic way to omit a key immutably.',
      '**Spread expands.** `Math.max(...numbers)` passes each element as a separate argument. `[...a, ...b]` builds a new array from two. `{ ...defaults, ...overrides }` builds a new object, with later keys winning — the standard shallow-merge idiom.',
      'Two details that come up as follow-ups. Rest must be the **last** parameter or binding; anything after it is a syntax error, because there would be nothing left to collect. And object spread copies only **own enumerable** properties, so it does not copy inherited ones and it does not preserve getters — it invokes them and copies the resulting value.',
      'Also worth knowing: array spread works on any iterable, so `[...someString]`, `[...someSet]` and `[...someMap]` all work; object spread works on any object and is not iteration-based.',
      'And it is a shallow operation. `{ ...user }` gives a new top-level object whose nested objects are still shared — the same shallow-copy caveat that applies to `Object.assign`.',
    ],
    keyPoints: [
      'Rest gathers into an array/object; spread expands out',
      'Rest appears in parameter lists and destructuring targets; spread in calls and literals',
      'Rest must be last',
      'Object spread copies own enumerable properties only, and is shallow',
      'Array spread works on any iterable',
    ],
    commonMistakes: [
      'Describing them as the same feature rather than as inverse operations.',
      'Believing object spread is a deep copy.',
    ],
    followUps: [
      'How would you remove a key from an object immutably?',
      'Does spread copy inherited properties?',
      'What happens to getters when you spread an object?',
    ],
  },

  {
    id: 'iv-fund-optional-chaining',
    question: 'What does optional chaining do, and what does it **not** protect you from?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['modern-js', 'objects', 'errors'],
    relatedLessons: ['l-m21-01'],
    shortAnswer:
      '`a?.b` short-circuits to `undefined` if `a` is `null` or `undefined`, instead of throwing. It protects only against nullish values on the left of the `?.` — it does not make the rest of the expression safe, and it does not catch typos or wrong types.',
    deepAnswer: [
      '`user?.address?.city` returns `undefined` the moment any link in the chain is `null` or `undefined`, rather than throwing "Cannot read properties of undefined." It also works for calls (`fn?.()`) and dynamic access (`obj?.[key]`).',
      'The short-circuit is worth understanding precisely: if `user` is nullish, **the entire rest of the chain is skipped**, including any function calls in it. So `a?.b.c()` will not throw when `a` is nullish, because nothing after `?.` is evaluated.',
      '**What it does not do** is the part interviewers probe. It does not help if the value is present but the wrong type — `user?.name.toUpperCase()` still throws if `name` is a number. It does not validate that a property exists; a typo like `user?.adress?.city` quietly returns `undefined` forever, which is arguably worse than throwing because the failure is silent.',
      'That silence is the real trade-off. Over-using `?.` can hide genuine data-shape bugs: if your API contract says `address` is always present, an exception when it is missing is **useful information**, and swallowing it with `?.` turns a loud contract violation into a mystery `undefined` three layers away.',
      'It pairs naturally with `??` for defaults: `const city = user?.address?.city ?? "Unknown"`. Using `||` there would also replace a legitimate empty string.',
    ],
    keyPoints: [
      'Short-circuits to `undefined` when the left side is `null` or `undefined`',
      'The whole rest of the chain is skipped, including calls',
      'Works for property access, calls (`fn?.()`) and dynamic keys (`obj?.[k]`)',
      'Does not protect against wrong types or typo\'d property names',
      'Over-use can silently hide real data-shape bugs',
    ],
    commonMistakes: [
      'Believing `?.` makes an entire expression safe rather than just the nullish check at that link.',
      'Reaching for `?.` everywhere, which hides contract violations that should be loud.',
    ],
    followUps: [
      'Does `a?.b.c` throw if `a` exists but `b` does not?',
      'When would you deliberately **not** use optional chaining?',
      'How does it combine with `??`?',
    ],
  },

  {
    id: 'iv-fund-template-literals',
    question: 'What can template literals do that string concatenation cannot?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['strings', 'modern-js'],
    relatedLessons: ['l-m05-01'],
    shortAnswer:
      'They interpolate expressions inline, span multiple lines literally, and support tagged templates — where a function receives the literal parts and the interpolated values separately, which is what makes safe-by-default escaping possible.',
    deepAnswer: [
      'The everyday benefits are readability: `` `Hello ${name}, you have ${count} messages` `` instead of a concatenation chain, and real multi-line strings without `\\n` escapes.',
      'Any expression works inside `${}` — calls, ternaries, arithmetic. The value is converted with `String()`, so an object becomes `"[object Object]"` unless it has a `toString`.',
      'The genuinely interesting feature is **tagged templates**. Writing `` tag`text ${value} more` `` calls `tag(strings, ...values)`, where `strings` is an array of the literal chunks and `values` are the interpolated results. Because the two arrive separately, the function can treat the literal parts as trusted and the interpolated parts as untrusted.',
      'That separation is what makes safe escaping possible at all. An HTML-escaping tag can escape only the values and leave the author\'s own markup alone — something you cannot do reliably after the fact, once concatenation has already flattened everything into one indistinguishable string. The same idea underlies parameterised SQL tags and CSS-in-JS libraries.',
      'One detail worth knowing: the `strings` array always has exactly one more element than there are values, because a template can start or end with an interpolation (contributing an empty string at that position).',
    ],
    keyPoints: [
      'Inline expression interpolation and real multi-line strings',
      'Values are converted with `String()`',
      'Tagged templates receive literal parts and values as separate arguments',
      'That separation is what enables safe-by-default escaping',
      '`strings.length` is always `values.length + 1`',
    ],
    commonMistakes: [
      'Only mentioning interpolation and multi-line, missing tagged templates entirely.',
      'Assuming template literals escape anything by themselves. They do not — a plain template literal is exactly as unsafe as concatenation.',
    ],
    followUps: [
      'How would you write a tag that escapes HTML in the interpolated values?',
      'Why can that not be done reliably after concatenation?',
      'What does `` `${{}}` `` produce?',
    ],
  },

  {
    id: 'iv-fund-debug-equality',
    question: 'This validation always passes. What is wrong, and how would you catch it in a test?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.DEBUGGING,
    topicIds: ['coercion', 'operators', 'errors', 'testing'],
    relatedLessons: ['l-m03-01'],
    code:
      'function isAdult(age) {\n' +
      '  if (age = 18) {\n' +
      '    return true;\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'console.log(isAdult(10));',
    shortAnswer:
      'It uses assignment `=` instead of comparison. `age = 18` assigns 18 and evaluates to 18, which is truthy, so the function always returns `true`. The fix is `age >= 18`. A test asserting `isAdult(10) === false` catches it immediately.',
    deepAnswer: [
      'The bug is a single character: `=` assigns, `==`/`===` compare. `if (age = 18)` sets the parameter to `18` and then evaluates the assignment expression, whose value is `18` — truthy — so the branch always runs.',
      'It is worth noting the **second** bug hiding behind the first: even with `===`, `isAdult` would only be true for exactly 18. The intended logic is `age >= 18`. An interviewer asking "what else is wrong" is usually looking for this.',
      '**How it is caught.** Any test that exercises a value which should return `false` catches it: `expect(isAdult(10)).toBe(false)`. That is the point of testing the negative case — a test suite that only checks `isAdult(21) === true` passes happily against this broken code.',
      '**How it is prevented.** ESLint\'s `no-cond-assign` rule flags assignment in a conditional by default. This is a good example of a class of bug better handled by tooling than by care — the reason many style guides also suggest writing constants on the left (`18 === age`) is that `18 = age` is a syntax error, so the mistake cannot compile. That convention is less common now precisely because linters catch it.',
      'The general lesson for an interview: when logic "always returns the same thing," suspect the condition itself before suspecting the branches.',
    ],
    keyPoints: [
      '`=` assigns and evaluates to the assigned value; `===` compares',
      'The assignment result `18` is truthy, so the branch always runs',
      'Second bug: the comparison should be `>=`, not equality',
      'A test on the negative case (`isAdult(10)`) catches it',
      '`no-cond-assign` in ESLint prevents it entirely',
    ],
    commonMistakes: [
      'Spotting the `=` but missing that the intended logic is `>=` rather than `===`.',
      'Suggesting only "be more careful" rather than naming the lint rule or the missing test.',
    ],
    followUps: [
      'What test would you write first?',
      'What lint rule prevents this?',
      'Why does the assignment evaluate to a truthy value?',
    ],
  },

  {
    id: 'iv-fund-symbol-purpose',
    question: 'What are Symbols for?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['types', 'metaprogramming', 'objects'],
    relatedLessons: ['l-m36-01'],
    shortAnswer:
      'A Symbol is a unique, immutable primitive used as a property key that cannot collide with any other key. Well-known Symbols like `Symbol.iterator` let your objects hook into language behaviour — that is their main practical use.',
    deepAnswer: [
      'Every call to `Symbol("desc")` produces a brand-new value that is not equal to any other Symbol, even one with the same description. The description is purely for debugging.',
      'Because they are unique, Symbols make safe property keys. If you add metadata to an object you do not own, a Symbol key cannot clash with an existing or future string key. Symbol-keyed properties are also skipped by `Object.keys`, `for...in` and `JSON.stringify`, so they stay out of ordinary serialisation — visible via `Object.getOwnPropertySymbols` if you deliberately look.',
      'The genuinely important use is **well-known Symbols**, which are the language\'s extension points. Implementing `[Symbol.iterator]` makes an object work with `for...of`, spread and destructuring. `Symbol.toPrimitive` controls conversion to a number or string. `Symbol.toStringTag` changes what `Object.prototype.toString.call(x)` reports. `Symbol.hasInstance` customises `instanceof`.',
      'That is the framing worth giving in an interview: rather than special-casing built-in types, the specification asks objects how they want to behave, and Symbols are the keys it asks with.',
      'One caveat: Symbols are **not** a privacy mechanism. They are unenumerable-ish, not hidden — anything can retrieve them with `Object.getOwnPropertySymbols`. For real privacy, use `#private` class fields or closures.',
    ],
    keyPoints: [
      'Unique, immutable primitive used as a non-colliding property key',
      'Skipped by `Object.keys`, `for...in` and `JSON.stringify`',
      'Well-known Symbols are the language\'s extension points',
      '`Symbol.iterator` enables `for...of`, spread and destructuring',
      'Not a privacy mechanism — `getOwnPropertySymbols` reveals them',
    ],
    commonMistakes: [
      'Presenting Symbols as a way to make properties private.',
      'Only describing uniqueness and never mentioning well-known Symbols, which are the actual reason they matter.',
    ],
    followUps: [
      'How would you make a custom object work with `for...of`?',
      'What does `Symbol.toPrimitive` control?',
      'Is `Symbol("a") === Symbol("a")`?',
    ],
  },
];

export default questions;
