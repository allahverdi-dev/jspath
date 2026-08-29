import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Functions, scope and closures — the densest interview territory in the
 * language. Closures in particular are asked in almost every JavaScript
 * interview, and "a function inside a function" is the answer that fails.
 */

const TOPIC = 'Functions & Closures';

export const questions = [
  {
    id: 'iv-fn-closure',
    question: 'What is a closure?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['closures', 'scope', 'functions'],
    relatedLessons: ['l-m32-01'],
    relatedChallenges: ['ch-fn-private-state', 'ch-fn-once'],
    shortAnswer:
      'A closure is a function together with the lexical environment it was created in. It keeps access to the variables of its defining scope even after that outer function has returned — so the variables live as long as the closure does, rather than being discarded when the call finishes.',
    deepAnswer: [
      'Every function in JavaScript captures the scope it was **defined** in, not the scope it is called from. That captured environment is the closure. The important word is **lexical**: it is determined by where the code is written, and it is fixed at definition time.',
      'The behaviour that makes closures worth naming is that the captured variables outlive the call that created them. Normally when a function returns, its local variables become unreachable and can be collected. If an inner function referencing them is still reachable, the binding survives instead.',
      'It is critical that a closure captures the **binding, not a snapshot of the value**. If the variable is reassigned later, the closure sees the new value. This is exactly why the classic `var`-in-a-loop bug happens — all three closures share one binding — and why `let` fixes it by creating a fresh binding per iteration.',
      'The practical uses are: **private state** (a counter or a cache whose variable nothing outside can reach), **factory functions** (`createLogger(prefix)` returning a function that remembers `prefix`), **callbacks and event handlers** that need surrounding context, and **partial application** like `once`, `memoize`, `debounce` — all of which are closures holding state between calls.',
      'The memory consequence is real but usually overstated: a closure keeps its captured variables alive, so holding a long-lived closure over a large object retains that object. That is a genuine leak source in event listeners that are never removed — not a reason to avoid closures.',
    ],
    keyPoints: [
      'A function plus the lexical environment it was defined in',
      'Lexical: determined by where the code is written, not where it is called',
      'Captured variables outlive the call that created them',
      'Captures the binding, not a copy of the value',
      'Uses: private state, factories, callbacks, memoize/debounce/once',
      'Retains what it captures — relevant for listener leaks',
    ],
    commonMistakes: [
      '"A function inside a function." That describes nesting, not the retained-scope behaviour that makes it a closure.',
      'Saying a closure copies the values it captures. It captures the binding, which is why reassignment is visible.',
    ],
    followUps: [
      'Show me a practical use of a closure.',
      'What happens in a loop using `var`, and why does `let` fix it?',
      'Can closures cause memory leaks?',
      'How do `#private` class fields differ from closure-based privacy?',
    ],
  },

  {
    id: 'iv-fn-closure-counter-output',
    question: 'Two counters from the same factory — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['closures', 'scope', 'functions'],
    relatedLessons: ['l-m32-01'],
    relatedChallenges: ['ch-fn-private-state'],
    code:
      'function createCounter() {\n' +
      '  let count = 0;\n' +
      '  return () => ++count;\n' +
      '}\n' +
      '\n' +
      'const a = createCounter();\n' +
      'const b = createCounter();\n' +
      '\n' +
      'console.log(a());\n' +
      'console.log(a());\n' +
      'console.log(b());',
    options: ['1\n2\n1', '1\n2\n3', '1\n1\n1', '0\n1\n0'],
    correct: 0,
    shortAnswer:
      'It prints `1`, `2`, `1`. Each call to `createCounter` creates a **new** lexical environment with its own `count`, so `a` and `b` close over independent variables. `a` increments its own count twice; `b` starts fresh at 1.',
    deepAnswer: [
      'Calling `createCounter()` creates a new execution context with a fresh `count` binding initialised to `0`, and returns an arrow function that closes over **that specific binding**.',
      'The second call creates an entirely separate environment with its own `count`. There is no sharing — `a` and `b` are two closures over two different variables that merely happen to have the same name.',
      '`a()` increments a\'s count to 1 and returns it. `a()` again gives 2. `b()` increments b\'s own count, still at 0, to 1.',
      'The reasoning an interviewer wants to hear is "each **call** to the factory creates a new environment" — not "each function has its own scope," which is vaguer and does not explain why two closures from the same source code are independent.',
      '`++count` is prefix, so it increments first and returns the new value. If it were `count++`, the first call would print `0` — a small variation interviewers sometimes use as a follow-up.',
    ],
    keyPoints: [
      'Each **call** to the factory creates a new lexical environment',
      '`a` and `b` close over independent `count` bindings',
      'The closure persists after `createCounter` returns',
      '`++count` returns the incremented value; `count++` would return the old one',
    ],
    commonMistakes: [
      'Answering `1\\n2\\n3`, assuming the two closures share one counter.',
      'Answering `1\\n1\\n1`, assuming the state resets on every call.',
    ],
    followUps: [
      'What would change if the return were `count++`?',
      'How would you add a `reset` to this counter?',
      'Is `count` reachable from outside? Why does that matter?',
    ],
  },

  {
    id: 'iv-fn-loop-var-output',
    question: 'The classic `var`-in-a-loop question — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['closures', 'scope', 'loops', 'variables'],
    relatedLessons: ['l-m32-01', 'l-m10-01'],
    code:
      'const fns = [];\n' +
      'for (var i = 0; i < 3; i++) {\n' +
      '  fns.push(() => i);\n' +
      '}\n' +
      'console.log(fns.map((f) => f()).join(","));\n' +
      '\n' +
      'const fns2 = [];\n' +
      'for (let j = 0; j < 3; j++) {\n' +
      '  fns2.push(() => j);\n' +
      '}\n' +
      'console.log(fns2.map((f) => f()).join(","));',
    options: ['3,3,3\n0,1,2', '0,1,2\n0,1,2', '3,3,3\n3,3,3', '2,2,2\n0,1,2'],
    correct: 0,
    shortAnswer:
      'It prints `3,3,3` then `0,1,2`. `var i` is one function-scoped binding shared by all three closures, and by the time they run the loop has finished with `i` at 3. `let j` creates a fresh binding per iteration, so each closure captures a different one.',
    deepAnswer: [
      'This is the single most-asked closure question, and the answer hinges on **how many bindings exist**, not on when the functions run.',
      'With `var`, there is exactly **one** `i` for the whole function. All three arrow functions close over that same binding. The loop runs to completion — `i` becomes 3, which is what ends the loop — and only then are the functions called. Each reads the one shared binding and sees 3.',
      'With `let`, the specification creates a **new binding for each iteration**, and copies the value forward at the end of each pass. So the three closures capture three distinct `j` bindings holding 0, 1 and 2 respectively.',
      'The wrong explanation to avoid is "the functions run later so they see the final value" — that is true but incomplete, because it does not explain why `let` behaves differently even though those functions also run later. The real answer is the number of bindings.',
      'Before `let` existed, the fix was an IIFE per iteration to create a new scope: `(function (n) { fns.push(() => n); })(i)`. Being able to describe that is a good signal you understand **why** `let` works rather than just that it does.',
    ],
    keyPoints: [
      '`var` creates one binding for the whole function — all closures share it',
      '`let` creates a fresh binding per loop iteration',
      'The loop finishes before any closure runs, so `i` is 3',
      'Not simply "they run later" — `let` closures also run later and behave differently',
      'Pre-ES6 fix: an IIFE per iteration',
    ],
    commonMistakes: [
      'Explaining it purely as "asynchronous timing" — these are synchronous calls.',
      'Answering `2,2,2`, forgetting the loop exits when `i` reaches 3.',
    ],
    followUps: [
      'How would you fix the `var` version without changing it to `let`?',
      'Does the same difference apply to `for...of` loops?',
      'Why does `let` behave this way — is it per-iteration or per-block?',
    ],
  },

  {
    id: 'iv-fn-decl-vs-expr',
    question: 'What is the difference between a function declaration and a function expression?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['functions', 'hoisting'],
    relatedLessons: ['l-m08-01'],
    shortAnswer:
      'A declaration is hoisted **and initialised**, so it can be called before it appears in the source. A function expression assigns a function to a variable, so it follows that variable\'s hoisting rules — with `const`, it is in the TDZ until the line runs, so calling it early throws.',
    deepAnswer: [
      '`function greet() {}` is a declaration. The whole function is created when the scope is entered, so `greet()` works on a line above its definition. This is the one kind of hoisting where the **value** is available early, not just the binding.',
      '`const greet = function () {}` is an expression assigned to a variable. The binding is hoisted into the TDZ but not initialised, so calling `greet()` before that line throws a `ReferenceError`. With `var greet = function () {}` you instead get `TypeError: greet is not a function`, because the binding exists holding `undefined` — a different error worth being able to distinguish.',
      'Declarations must be at statement position. `const x = function () {}` can appear anywhere an expression can — as an argument, in an object literal, immediately invoked.',
      'A **named function expression** (`const f = function inner() {}`) makes the name `inner` available only inside its own body, which is useful for self-reference in recursion and gives a better stack-trace name than an anonymous function.',
      'The practical preference in most modern codebases is expressions with `const`, because the TDZ error surfaces ordering mistakes rather than hiding them, and because it keeps functions on the same footing as other values. Declarations are still fine and are arguably clearer for top-level named utilities.',
    ],
    keyPoints: [
      'Declarations are hoisted and initialised — callable before their definition',
      'Expressions follow the variable\'s rules: TDZ with `const`/`let`, `undefined` with `var`',
      '`const` early call → `ReferenceError`; `var` early call → `TypeError: not a function`',
      'Expressions can appear anywhere an expression is allowed',
      'Named function expressions give self-reference and better stack traces',
    ],
    commonMistakes: [
      'Saying "expressions are not hoisted" — the variable is hoisted; only the assignment is not.',
      'Not distinguishing the `ReferenceError` (const/let) from the `TypeError` (var) case.',
    ],
    followUps: [
      'What error do you get calling a `var` function expression too early, and why is it different?',
      'What is a named function expression useful for?',
      'Are arrow functions hoisted?',
    ],
  },

  {
    id: 'iv-fn-arrow-vs-regular',
    question: 'How do arrow functions differ from regular functions?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['arrow-functions', 'this', 'functions'],
    relatedLessons: ['l-m09-01', 'l-m29-01'],
    shortAnswer:
      'Arrows have no `this`, `arguments`, `super` or `new.target` of their own — they inherit `this` lexically from the enclosing scope. They cannot be used as constructors and have no `prototype` property. That lexical `this` is the reason they exist.',
    deepAnswer: [
      'The headline difference is **`this`**. A regular function gets its `this` from how it is **called** — method call, plain call, `call`/`apply`/`bind`, or `new`. An arrow function has no `this` binding at all; a reference to `this` inside it resolves lexically to the enclosing scope, exactly like any other variable. That is what makes `setTimeout(() => this.tick(), 100)` work inside a method where a regular function would lose `this`.',
      'Because the lexical `this` is fixed at definition, `call`, `apply` and `bind` **cannot** change it. Passing a `thisArg` to an arrow is silently ineffective.',
      'Arrows also have no `arguments` object — a reference inside one resolves to the enclosing function\'s `arguments`, which is usually a bug waiting to happen. Use a rest parameter instead.',
      'They cannot be constructed: `new (() => {})` throws a `TypeError`. They have no `prototype` property, which follows from that.',
      'The practical consequence is **where not to use them**. An arrow as an object method (`{ name: "x", getName: () => this.name }`) does not do what people expect — `this` is the enclosing scope, not the object. The same applies to prototype methods and to any function whose `this` is supposed to be supplied by the caller, including most DOM event handlers where you want `this` to be the element (though `event.currentTarget` is usually the better choice anyway).',
      'A minor extra: arrows cannot be generators, and a concise-body arrow returning an object literal needs parentheses — `() => ({ a: 1 })` — or the braces are parsed as a block.',
    ],
    keyPoints: [
      'No own `this` — inherited lexically from the enclosing scope',
      '`call`/`apply`/`bind` cannot change an arrow\'s `this`',
      'No own `arguments` — use rest parameters',
      'Cannot be used with `new`; no `prototype` property',
      'Wrong choice for object/prototype methods that rely on the call site',
      '`() => ({})` needs parentheses to return an object literal',
    ],
    commonMistakes: [
      'Saying arrows "bind `this` to the parent" — they do not bind anything; they simply have no `this` and resolve it lexically.',
      'Using an arrow as an object method and expecting `this` to be the object.',
    ],
    followUps: [
      'What happens if you `bind` an arrow function?',
      'Why is an arrow a bad choice for an object method?',
      'Can an arrow function be a generator?',
    ],
  },

  {
    id: 'iv-fn-this-lost-output',
    question: 'A method extracted from its object — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['this', 'functions', 'errors'],
    relatedLessons: ['l-m29-01'],
    relatedChallenges: ['ch-fn-bind'],
    code:
      'const user = {\n' +
      '  name: "Alex",\n' +
      '  getName() {\n' +
      '    return this.name;\n' +
      '  },\n' +
      '};\n' +
      '\n' +
      'const fn = user.getName;\n' +
      '\n' +
      'try {\n' +
      '  console.log(fn());\n' +
      '} catch (error) {\n' +
      '  console.log(error.constructor.name);\n' +
      '}\n' +
      'console.log(user.getName());',
    options: ['TypeError\nAlex', 'undefined\nAlex', 'Alex\nAlex', 'ReferenceError\nAlex'],
    correct: 0,
    shortAnswer:
      'It throws a `TypeError`, logged here as `TypeError`, then prints `Alex`. `this` is determined by the call site: `fn()` is a plain call, so in strict mode (which modules and this sandbox use) `this` is `undefined`, and reading `.name` off `undefined` throws.',
    deepAnswer: [
      '`const fn = user.getName` copies the **function**, not any connection to `user`. Functions in JavaScript do not remember which object they were reached through.',
      'When `fn()` is called as a plain function, `this` is decided by the call site. In **strict mode** — which is what ES modules, class bodies and this sandbox all use — `this` is `undefined`. So `this.name` throws `TypeError: Cannot read properties of undefined`.',
      'In sloppy mode the answer would be different: `this` would be substituted with the global object and the result would be `undefined` (the property does not exist) rather than a throw. Being able to state **both** and say which applies is the strong answer — most modern code is modules, so strict is the right default assumption.',
      '`user.getName()` is a method call, so `this` is `user` and it returns `"Alex"` normally. Nothing about the function changed; only the call site did.',
      'The fixes are `user.getName.bind(user)`, wrapping in an arrow `() => user.getName()`, or defining the method as a class field arrow. This is exactly why React class components needed `this.handleClick = this.handleClick.bind(this)` in constructors.',
    ],
    keyPoints: [
      '`this` is determined by the call site, not by where the function was defined',
      'Extracting a method loses the receiver',
      'Strict mode (modules): plain-call `this` is `undefined` → `TypeError`',
      'Sloppy mode: `this` would be the global object → `undefined`, no throw',
      'Fixes: `bind`, an arrow wrapper, or a class-field arrow',
    ],
    commonMistakes: [
      'Answering `Alex`, assuming the method stays attached to its object.',
      'Answering `undefined` by reasoning in sloppy mode when the context is a module.',
    ],
    followUps: [
      'What would this print in sloppy mode, and why?',
      'How would you fix it while still passing the function as a callback?',
      'Would an arrow function as `getName` have helped?',
    ],
  },

  {
    id: 'iv-fn-this-rules',
    question: 'How is the value of `this` determined?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['this', 'functions'],
    relatedLessons: ['l-m29-01'],
    shortAnswer:
      'By the call site, in this precedence: `new` binding, then explicit `call`/`apply`/`bind`, then method call (the object before the dot), then default (`undefined` in strict mode, `globalThis` in sloppy). Arrow functions opt out entirely and inherit `this` lexically.',
    deepAnswer: [
      'The rules apply in order, and naming them as an ordered list is what makes this answer sound precise rather than hand-wavy.',
      '**1. `new`.** `new Fn()` creates a fresh object and binds `this` to it. This beats everything else — even a bound function, when constructed, uses the new instance rather than the bound receiver.',
      '**2. Explicit binding.** `fn.call(obj)`, `fn.apply(obj)` and `fn.bind(obj)` set `this` to the given value. `bind` is permanent — a bound function cannot be re-bound.',
      '**3. Method call.** `obj.fn()` binds `this` to `obj`. What matters is the object immediately before the dot at the moment of the call, which is why extracting the method loses it.',
      '**4. Default.** A plain `fn()` gives `undefined` in strict mode and `globalThis` in sloppy mode.',
      '**Arrows are outside this system.** They have no `this` binding, so the reference resolves lexically to whatever `this` means in the enclosing scope — determined at definition, unchangeable at the call site.',
      'Two frequent extras: in a DOM event handler declared as a regular function, `this` is the element the listener is attached to (equivalent to `event.currentTarget`); and at the top level of an ES module `this` is `undefined`, not `globalThis`.',
    ],
    keyPoints: [
      'Precedence: `new` > explicit bind > method call > default',
      'Default is `undefined` in strict mode, `globalThis` in sloppy',
      '`bind` is permanent, but `new` still overrides it',
      'Arrows have no `this` and resolve it lexically at definition',
      'DOM handler (regular function): `this` is the element, like `currentTarget`',
      'Top level of a module: `this` is `undefined`',
    ],
    commonMistakes: [
      '"`this` refers to where the function was defined." That is the arrow rule, and it is the opposite of the rule for regular functions.',
      'Forgetting that `new` outranks `bind`.',
    ],
    followUps: [
      'What happens if you `new` a bound function?',
      'What is `this` at the top level of a module?',
      'How does `this` behave in a DOM event handler?',
    ],
  },

  {
    id: 'iv-fn-call-apply-bind',
    question: 'What is the difference between `call`, `apply` and `bind`?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['this', 'functions'],
    relatedLessons: ['l-m29-01'],
    relatedChallenges: ['ch-fn-bind', 'ch-fn-partial'],
    shortAnswer:
      '`call` and `apply` both invoke the function immediately with a given `this`; they differ only in how arguments are passed — `call` takes them individually, `apply` takes an array. `bind` invokes nothing: it returns a new function with `this` permanently fixed, optionally with preset leading arguments.',
    deepAnswer: [
      '`fn.call(thisArg, a, b)` — calls now, arguments listed. `fn.apply(thisArg, [a, b])` — calls now, arguments in an array. The mnemonic that sticks is **A for Array, C for Comma**.',
      '`fn.bind(thisArg, a)` — calls nothing. It returns a **new** function whose `this` is permanently `thisArg` and whose first argument is pre-filled with `a`. Calling the result later appends any further arguments after the preset ones. That partial-application ability is often the real reason to reach for `bind`.',
      'A bound function **cannot be re-bound**: binding it again, or calling it with `call`/`apply`, does not change the receiver. The one exception is `new` — constructing a bound function uses the newly created object as `this` and ignores the bound value, which is specified behaviour and a common follow-up question.',
      '`apply` used to be the way to spread an array into arguments (`Math.max.apply(null, nums)`); spread syntax (`Math.max(...nums)`) has largely replaced that use.',
      'On arrow functions all three are ineffective for `this` — the lexical binding wins. `bind` on an arrow still works for presetting arguments, but the `thisArg` is ignored.',
      'A practical note: `bind` allocates a new function each call, so binding inside a render path or a loop creates a fresh function every time, which can defeat reference-equality checks in UI frameworks.',
    ],
    keyPoints: [
      '`call`: invoke now, comma-separated arguments',
      '`apply`: invoke now, arguments as an array',
      '`bind`: returns a new permanently-bound function, no invocation',
      '`bind` supports partial application of leading arguments',
      'A bound function cannot be re-bound — except by `new`',
      'None of them can change an arrow function\'s `this`',
    ],
    commonMistakes: [
      'Saying `bind` calls the function.',
      'Not knowing `new` overrides a bound `this`.',
    ],
    followUps: [
      'What happens if you `new` a bound function?',
      'Can you `bind` an arrow function?',
      'How would you implement `bind` yourself?',
    ],
  },

  {
    id: 'iv-fn-iife',
    question: 'What is an IIFE, and is there still a reason to use one?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['functions', 'scope', 'modules'],
    relatedLessons: ['l-m28-01'],
    shortAnswer:
      'An Immediately Invoked Function Expression runs as soon as it is defined, creating a private scope. Its historical job was avoiding globals and creating per-iteration scope before block scoping existed — modules and `let` have largely replaced both uses.',
    deepAnswer: [
      'The form is `(function () { ... })()` or `(() => { ... })()`. Wrapping in parentheses turns the function **declaration** into an **expression**, which is what makes it immediately callable.',
      'Historically it solved two problems. First, **avoiding global pollution**: before modules, every top-level `var` and `function` in a script became a global, so libraries wrapped themselves in an IIFE to keep internals private and export deliberately. This is the module pattern, and it is a closure.',
      'Second, **per-iteration scope**: before `let`, an IIFE was the way to capture the current loop value in its own scope.',
      'Both problems are solved better now. **ES modules** have their own scope by default — nothing leaks to global — and `let`/`const` give block scoping. So most historical IIFE use is obsolete.',
      'Where they still legitimately appear: creating a scope for a top-level `await` in a non-module context, running a small setup block without leaking temporaries, and in bundler output where module code is wrapped mechanically. Answering "modules replaced it, but here is where it still shows up" is stronger than either "never use it" or describing it as current best practice.',
    ],
    keyPoints: [
      'Runs immediately; parentheses make it an expression rather than a declaration',
      'Historically: avoid globals (module pattern) and create per-iteration scope',
      'ES modules give scope isolation; `let` gives block scope — both largely replace it',
      'Still seen in bundler output and small scoped setup blocks',
      'The module pattern built on an IIFE is a closure',
    ],
    commonMistakes: [
      'Presenting IIFEs as current best practice for encapsulation.',
      'Not being able to say what replaced them.',
    ],
    followUps: [
      'What replaced the module pattern?',
      'How did an IIFE fix the `var` loop problem?',
      'Why do the wrapping parentheses matter?',
    ],
  },

  {
    id: 'iv-fn-pure-function',
    question: 'What is a pure function, and should all your functions be pure?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['functional', 'functions', 'testing'],
    relatedLessons: ['l-m37-01'],
    shortAnswer:
      'A pure function returns the same output for the same input and has no side effects. No — an application that only had pure functions could not do anything observable. The goal is to **concentrate** side effects at the edges, not eliminate them.',
    deepAnswer: [
      'Two conditions: **deterministic** (same inputs always give the same output) and **no side effects** (it does not mutate anything outside itself, write to the DOM, log, call the network, or read mutable external state).',
      'Note that reading `Date.now()` or `Math.random()` breaks purity too, because the output varies with hidden inputs. That is why injecting a clock or a random source as a parameter makes an otherwise-impure function pure and testable — a technique worth naming, since it is what makes timing and randomness testable at all.',
      'The benefits are concrete: pure functions are trivially testable (no setup, no mocks, no teardown), safely cacheable and memoizable, and easy to reason about in isolation or move between files.',
      'But **the answer to "should everything be pure" is no**, and interviewers ask it to see whether you understand the trade-off or are reciting dogma. A program with no side effects produces no output, saves nothing and renders nothing. Side effects are the **point** of the application.',
      'The useful architecture is a **functional core with an imperative shell**: keep business logic pure and push effects — network, storage, DOM — to the boundary. Then the interesting logic is tested without mocks, and the thin effectful layer is where integration tests earn their keep. That is also the reasoning behind the module split in a well-structured app: pure state derivation separated from rendering and I/O.',
    ],
    keyPoints: [
      'Deterministic and free of side effects',
      '`Date.now()`/`Math.random()` break purity — inject them to restore it',
      'Benefits: easy testing, safe memoization, local reasoning',
      'Not everything can be pure — effects are what makes a program useful',
      'Aim for a pure core with effects concentrated at the edges',
    ],
    commonMistakes: [
      'Claiming all functions should be pure, which is not achievable or desirable.',
      'Forgetting that reading a clock or random source breaks determinism.',
    ],
    followUps: [
      'Is a function that reads `Date.now()` pure? How would you make it testable?',
      'Which functions in a typical app cannot be pure?',
      'How does purity relate to memoization?',
    ],
  },

  {
    id: 'iv-fn-hof',
    question: 'What is a higher-order function? Give real examples.',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['higher-order', 'functions', 'functional'],
    relatedLessons: ['l-m09-01'],
    shortAnswer:
      'A function that takes a function as an argument, returns a function, or both. `map`, `filter` and `addEventListener` take functions; `bind`, `debounce` and `memoize` return them. It works because functions are first-class values.',
    deepAnswer: [
      'The underlying enabler is that functions in JavaScript are **first-class values** — they can be stored in variables, passed as arguments, returned, and held in arrays or objects like any other value.',
      '**Taking a function**: `array.map(fn)`, `filter`, `reduce`, `sort(comparator)`, `addEventListener(type, handler)`, `setTimeout(callback, ms)`, `promise.then(onFulfilled)`.',
      '**Returning a function**: `fn.bind(obj)`, and every decorator-style utility — `debounce(fn, ms)`, `throttle`, `memoize(fn)`, `once(fn)`, `curry(fn)`. These are closures: the returned function holds state or configuration captured from the call that created it.',
      'The practical value is **behaviour parameterisation**. `sortBy(users, u => u.age)` lets one sorting implementation serve any comparison, without the sort knowing anything about users. That is the same idea as dependency injection, expressed with functions.',
      'A good concrete example to offer is a retry wrapper: `withRetry(fetchUser, { attempts: 3 })` returns a function with the same signature as the original but added behaviour. This composition of behaviour without modifying the original is the decorator pattern, and it is why higher-order functions matter beyond `map` and `filter`.',
    ],
    keyPoints: [
      'Takes a function, returns a function, or both',
      'Enabled by functions being first-class values',
      'Takes: `map`, `filter`, `sort`, `addEventListener`, `then`',
      'Returns: `bind`, `debounce`, `memoize`, `once`, `curry`',
      'Enables behaviour parameterisation and decorator-style composition',
    ],
    commonMistakes: [
      'Only listing array methods and missing the "returns a function" half.',
      'Confusing higher-order functions with callbacks — a callback is the argument, not the higher-order function.',
    ],
    followUps: [
      'Write a function that wraps another to add retry behaviour.',
      'Why is `bind` a higher-order function?',
      'How do closures make the "returns a function" case work?',
    ],
  },

  {
    id: 'iv-fn-currying',
    question: 'What is currying, and how does it differ from partial application?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['functional', 'functions', 'closures'],
    relatedLessons: ['l-m37-01'],
    relatedChallenges: ['ch-fn-curry', 'ch-fn-partial'],
    shortAnswer:
      'Currying transforms an n-argument function into a chain of n single-argument functions. Partial application fixes **some** arguments and returns a function taking the rest — it does not require one-at-a-time. Currying is a specific transformation; partial application is the general technique.',
    deepAnswer: [
      '**Currying**: `f(a, b, c)` becomes `f(a)(b)(c)` — each call takes exactly one argument and returns a function expecting the next, until all are supplied.',
      '**Partial application**: `f.bind(null, a)` gives a function that still takes `(b, c)` together. You fixed one argument; you did not change the shape into a chain.',
      'Most JavaScript "curry" utilities are actually flexible hybrids: they accept `f(a)(b)(c)`, `f(a, b)(c)` and `f(a, b, c)` interchangeably, invoking once enough arguments have accumulated. That is convenient and is what a practical implementation looks like, but it is worth acknowledging it is not strict currying.',
      'The practical value is **specialisation**: `const log = curry(logMessage); const warn = log("WARN")` creates a reusable, pre-configured function. It also makes functions more composable in pipelines, since a curried function that has received all but its last argument is a unary function — exactly what `pipe`/`compose` want.',
      'The implementation rests on closures and `fn.length` (the declared arity). Worth knowing: `fn.length` counts only parameters before the first default or rest parameter, so currying a function with defaults does not behave as expected — a good detail to mention.',
      'The honest trade-off: heavy currying can hurt readability for teams unfamiliar with it, and stack traces get noisier. It earns its place in genuinely functional pipelines rather than as a default style.',
    ],
    keyPoints: [
      'Currying: one argument at a time, n functions',
      'Partial application: fix some arguments, return a function for the rest',
      'Practical "curry" utilities accept flexible groupings — not strict currying',
      'Enables specialisation and composability in pipelines',
      'Built on closures and `fn.length`; defaults/rest break the arity count',
    ],
    commonMistakes: [
      'Treating the two terms as synonyms.',
      'Not knowing `fn.length` ignores parameters after a default.',
    ],
    followUps: [
      'How would you implement `curry`?',
      'Why does a default parameter break arity detection?',
      'When is currying not worth it?',
    ],
  },

  {
    id: 'iv-fn-debounce-vs-throttle',
    question: 'What is the difference between debounce and throttle, and when do you use each?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.COMPARISON,
    topicIds: ['performance', 'functions', 'event-loop'],
    relatedLessons: ['l-m43-01'],
    relatedChallenges: ['ch-fn-debounce'],
    shortAnswer:
      'Debounce waits for activity to **stop** and then runs once. Throttle runs at most once per interval **during** continuous activity. Debounce a search box (you want the final query); throttle a scroll or resize handler (you want regular updates while it happens).',
    deepAnswer: [
      '**Debounce**: every new call resets a timer; the function runs only after a quiet period with no calls. If events keep arriving, it never runs. The mental model is "tell me when they have stopped."',
      '**Throttle**: the function runs immediately (or on a leading/trailing edge, depending on the implementation) and then refuses to run again until the interval elapses, regardless of how many calls arrive. The mental model is "at most this often."',
      '**Debounce fits** search-as-you-type (you want the query the user settled on, not every keystroke), autosave after typing pauses, and validating a field once the user stops editing. **Throttle fits** scroll position updates, mouse-move tracking, window resize, and progress reporting — cases where you want periodic feedback **during** the activity and would see nothing at all under debounce.',
      'A concrete way to show you understand: with a 300ms setting and a user typing continuously for 3 seconds, debounce fires **once**, 300ms after the last keystroke. Throttle fires roughly **ten times** across those 3 seconds. Being able to state that difference numerically is a strong signal.',
      'Implementation detail worth mentioning: both are closures over a timer. Making the scheduler injectable rather than calling `setTimeout` directly is what makes them testable without real waiting — otherwise every test has to sleep, which is slow and flaky.',
      'A real gotcha: debouncing a search box is not enough on its own. You also need to handle the out-of-order-response race, where an earlier slow request resolves after a later fast one and overwrites fresher results. Debounce reduces the number of requests; it does not order them.',
    ],
    keyPoints: [
      'Debounce: runs once after activity stops',
      'Throttle: runs at most once per interval during activity',
      'Debounce for search input, autosave, validation-on-pause',
      'Throttle for scroll, resize, mousemove, progress',
      '3s of typing at 300ms: debounce fires once, throttle ~10 times',
      'Inject the timer to make both testable; debounce alone does not fix response races',
    ],
    commonMistakes: [
      'Describing them as the same thing with different names.',
      'Debouncing a scroll handler, which means nothing updates until scrolling stops.',
    ],
    followUps: [
      'Implement debounce so it can be tested without waiting in real time.',
      'Does debouncing a search box fix out-of-order responses?',
      'What are leading and trailing edge options?',
    ],
  },

  {
    id: 'iv-fn-memoize-coding',
    question: 'Implement `memoize`. What are its limitations?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['functions', 'closures', 'performance'],
    relatedLessons: ['l-m43-01'],
    relatedChallenges: ['ch-fn-memoize', 'ch-eng-memo-cache-size'],
    code:
      'function memoize(fn) {\n' +
      '  const cache = new Map();\n' +
      '  return function (...args) {\n' +
      '    const key = args[0];\n' +
      '    if (cache.has(key)) return cache.get(key);\n' +
      '    const result = fn.apply(this, args);\n' +
      '    cache.set(key, result);\n' +
      '    return result;\n' +
      '  };\n' +
      '}',
    shortAnswer:
      'Cache results in a closure keyed by the arguments, returning the cached value on a repeat call. The limitations that matter: it is only correct for pure functions, the key strategy breaks for multiple or object arguments, and an unbounded cache is a memory leak in a long-running process.',
    deepAnswer: [
      '**Approach.** A `Map` in a closure holds results. Check `cache.has(key)` — not `cache.get(key) !== undefined` — so a legitimately cached `undefined` is not recomputed forever.',
      '**Why a `Map` and not an object**: `Map` keys keep their type, so `1` and `"1"` stay distinct, and a key of `"constructor"` is just a key rather than colliding with inherited properties.',
      '**Limitation 1 — purity.** Memoizing an impure function is a bug. If the result depends on time, randomness, external state or I/O, the cache serves stale answers forever. This is the first thing to say.',
      '**Limitation 2 — the key.** Using only the first argument is fine for single-argument functions and silently wrong otherwise. A common fix is `JSON.stringify(args)`, which is slow, sensitive to property order, and fails on cycles and functions. The honest answer is to accept a `keyFn` so the caller decides.',
      '**Limitation 3 — unbounded growth.** A cache that never evicts is a memory leak. Per-user or per-URL keys in a long-running server grow forever. The fix is a bound — LRU or a simple FIFO cap — or a `WeakMap` when the key is an object whose lifetime should drive the entry\'s.',
      '**Complexity.** Lookup is O(1) amortised; the win depends entirely on the cost of `fn` and the hit rate. Memoizing a cheap function can be slower than recomputing it, once you count the hashing and the memory pressure.',
      '**Follow-up worth volunteering**: memoized recursion is where it shines — naive Fibonacci goes from exponential to linear because the recursive calls hit the same wrapper and find their subproblems already solved.',
    ],
    keyPoints: [
      'Closure over a `Map`; check `has`, not `undefined`',
      '`Map` preserves key types and avoids inherited-name collisions',
      'Only valid for pure functions',
      'Key strategy is the hard part — accept a `keyFn`',
      'Unbounded cache is a memory leak — bound it, or use `WeakMap` for object keys',
      'Memoized recursion turns exponential Fibonacci into linear',
    ],
    commonMistakes: [
      'Using `cache[key]` on a plain object, which stringifies keys and collides with prototype names.',
      'Not mentioning that memoizing an impure function is incorrect, not just wasteful.',
    ],
    followUps: [
      'How would you bound the cache size?',
      'When would you use a `WeakMap` here?',
      'Is memoization always a performance win?',
    ],
  },

  {
    id: 'iv-fn-once-coding',
    question: 'Implement `once(fn)` so the wrapped function runs at most one time.',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CODING,
    topicIds: ['functions', 'closures', 'higher-order'],
    relatedChallenges: ['ch-fn-once'],
    code:
      'function once(fn) {\n' +
      '  let called = false;\n' +
      '  let result;\n' +
      '  return function (...args) {\n' +
      '    if (!called) {\n' +
      '      called = true;\n' +
      '      result = fn.apply(this, args);\n' +
      '    }\n' +
      '    return result;\n' +
      '  };\n' +
      '}',
    shortAnswer:
      'Keep two closure variables: a boolean for whether it has run, and the cached result. Guard on the boolean — not on whether the result is defined — so a function returning `undefined`, `null` or `0` is still only called once.',
    deepAnswer: [
      '**Approach.** Two pieces of private state in a closure. The wrapper checks the flag, runs `fn` at most once, caches the result, and returns the cached value on every subsequent call.',
      '**The edge case that matters.** Guarding with `if (result === undefined)` looks equivalent and is wrong: a function that legitimately returns `undefined` would be re-run every time. The same applies to `if (!result)` with a return value of `0`, `null` or `""`. The flag must be separate from the result.',
      '**Ordering.** Setting `called = true` **before** invoking `fn` means a function that throws is not retried. For an initialiser that is usually the desired semantics — you do not want a half-failed setup running again. If retry-on-error were wanted, that is a deliberate different design and worth stating either way.',
      '**`this` and arguments.** Using a `function` rather than an arrow, and `fn.apply(this, args)`, forwards both correctly so the wrapper works on methods.',
      '**Edge cases to raise unprompted**: later arguments are ignored (the first call\'s result is returned regardless), and each call to `once` produces independent state, so two wrappers over the same function do not share it.',
      '**Real uses**: one-time initialisation, ensuring a "submit" handler cannot double-fire, and guaranteeing a cleanup runs exactly once.',
    ],
    keyPoints: [
      'Two closure variables: a `called` flag and the cached result',
      'Guard on the flag, not on the result — `undefined`/`0`/`null` are valid results',
      'Set the flag before invoking so a throw is not retried',
      'Forward `this` and arguments with `apply`',
      'Each wrapper has independent state',
    ],
    commonMistakes: [
      'Guarding with `if (!result)`, which breaks for falsy return values.',
      'Using an arrow function for the wrapper, losing `this` forwarding.',
    ],
    followUps: [
      'What happens if `fn` throws on the first call?',
      'How would you add a `reset`?',
      'Why not guard on whether the result is `undefined`?',
    ],
  },

  {
    id: 'iv-fn-default-params',
    question: 'When are default parameter values evaluated, and what is the danger with mutable defaults?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['functions', 'copying'],
    relatedLessons: ['l-m08-01'],
    relatedChallenges: ['ch-eng-find-the-bug'],
    shortAnswer:
      'Default expressions are evaluated **on every call**, not once at definition. So `function f(list = [])` creates a fresh array each call — unlike Python. The danger is referencing a shared array defined **outside** the function, which every defaulted call then mutates.',
    deepAnswer: [
      'Each time the function is invoked, any parameter that is `undefined` has its default expression evaluated fresh. `function f(list = [])` therefore gives a brand-new array on every defaulted call — this is a genuine difference from Python, where the default is evaluated once at definition and shared.',
      'The trap in JavaScript is different: `const EMPTY = []; function f(list = EMPTY) { list.push(1); }`. Now every defaulted call pushes into the **same** array, because the expression evaluates to the same object each time. The bug looks identical to Python\'s, but the cause is the shared outer binding, not the default mechanism.',
      'Defaults trigger only for `undefined`, **not** for `null`. `f(null)` uses `null`, not the default. That surprises people who expect `??`-like behaviour, and it is a common source of "the default did not apply" confusion.',
      'Later parameters can reference earlier ones — `function f(a, b = a * 2)` is valid. Referencing a **later** parameter throws, because the parameter scope is initialised left to right.',
      '`fn.length` counts only the parameters before the first defaulted one, which matters for currying utilities and any code that inspects arity.',
      'The general lesson is broader than defaults: any mutable value created once and reused across calls is shared state, whether it arrives as a default, a module-level constant, or a field on a singleton.',
    ],
    keyPoints: [
      'Defaults are evaluated on every call, not once at definition',
      '`function f(x = [])` gives a fresh array each call — unlike Python',
      'The real trap is defaulting to a shared outer object',
      'Defaults fire only for `undefined`, not `null`',
      'Later params can reference earlier ones; the reverse throws',
      '`fn.length` stops counting at the first default',
    ],
    commonMistakes: [
      'Assuming JavaScript shares the default object like Python does.',
      'Expecting `f(null)` to use the default.',
    ],
    followUps: [
      'Does passing `null` trigger the default?',
      'What is `fn.length` for `function f(a, b = 1, c)`?',
      'Show me the shared-mutable-default bug.',
    ],
  },

  {
    id: 'iv-fn-arguments-object',
    question: 'What is the `arguments` object, and why prefer rest parameters?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['functions', 'arrow-functions', 'modern-js'],
    relatedLessons: ['l-m08-01'],
    shortAnswer:
      '`arguments` is an array-**like** object holding all arguments in non-arrow functions. It is not a real array, so it has no array methods, and arrow functions do not have one. Rest parameters give a genuine array, work in arrows, and make the signature self-documenting.',
    deepAnswer: [
      '`arguments` exists inside every non-arrow function and contains every argument passed, regardless of the declared parameters. It has `length` and index access but is not an `Array` — no `map`, `filter` or `reduce` — so older code is full of `Array.prototype.slice.call(arguments)`.',
      'Arrow functions have **no** `arguments` binding. A reference inside one resolves to the enclosing function\'s `arguments`, which is a subtle bug source rather than a useful feature.',
      '**Rest parameters** (`function f(...args)`) produce a real array directly, work identically in arrows, and make the variadic intent visible in the signature rather than hidden in the body. They also collect only the arguments **after** the named ones, which is usually what you want.',
      'One historical detail worth knowing: in sloppy mode, `arguments` is **linked** to the named parameters, so reassigning a parameter changes `arguments[0]` and vice versa. Strict mode breaks that link, and since modules are strict this is mostly of archaeological interest — but it explains some very confusing legacy code.',
      'There is a real reason to know `arguments` still exists: you will meet it in older codebases, and `Function.prototype.length` and some framework internals interact with it.',
    ],
    keyPoints: [
      '`arguments` is array-like, not an array — no array methods',
      'Arrow functions have no `arguments` of their own',
      'Rest parameters give a real array and work in arrows',
      'Rest makes the variadic signature explicit',
      'Sloppy mode links `arguments` to named parameters; strict mode does not',
    ],
    commonMistakes: [
      'Calling `arguments` an array.',
      'Using `arguments` inside an arrow function and expecting it to refer to that arrow.',
    ],
    followUps: [
      'What does `arguments` refer to inside an arrow function?',
      'How did people convert `arguments` to an array before rest parameters?',
      'Does `fn.length` count rest parameters?',
    ],
  },

  {
    id: 'iv-fn-scope-chain',
    question: 'What is lexical scope, and how does the scope chain resolve a variable?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['scope', 'execution-context', 'closures'],
    relatedLessons: ['l-m10-01'],
    shortAnswer:
      'Lexical scope means a variable\'s visibility is determined by where the code is **written**, not where it is called. To resolve a name, the engine looks in the current scope, then each enclosing scope outward, up to global — the scope chain — and throws a `ReferenceError` if it is never found.',
    deepAnswer: [
      '"Lexical" means "as written." When the engine creates a function, it records a reference to the environment the function was **defined** in. That link is fixed and does not change based on how or where the function is later called.',
      'Resolving an identifier walks that chain: current scope first, then the enclosing scope, outward to the module or global scope. The first match wins — which is what **shadowing** is: an inner declaration with the same name hides the outer one for that region.',
      'The contrast that makes this concrete is **dynamic scope**, which JavaScript does **not** have for variables: under dynamic scoping a function would see the caller\'s variables. JavaScript reserves that call-site-dependent behaviour for exactly one thing — `this` — which is precisely why `this` feels inconsistent compared to everything else in the language. Framing it that way is a strong answer.',
      'Because the chain is captured at definition, a function returned from another function still resolves names against its original chain. That is the mechanism behind closures — a closure is not a separate feature so much as the visible consequence of lexical scoping plus a function outliving its defining call.',
      'Failing to find a name throws a `ReferenceError` — except on the left of an assignment in sloppy mode, where it would silently create a global. Strict mode throws there too, which is one of its most valuable protections.',
    ],
    keyPoints: [
      'Scope is determined by where code is written, not called',
      'Resolution walks outward: current → enclosing → global; first match wins',
      'Shadowing is an inner name hiding an outer one',
      'JavaScript is lexically scoped for variables; only `this` is call-site dependent',
      'Unresolved name → `ReferenceError` (or a silent global in sloppy-mode assignment)',
      'Closures are the visible consequence of lexical scope plus retained functions',
    ],
    commonMistakes: [
      'Confusing lexical scope with `this`, which is the one dynamically-determined thing.',
      'Describing the scope chain as searching inward rather than outward.',
    ],
    followUps: [
      'Is `this` lexically scoped?',
      'What is shadowing, and when is it a problem?',
      'How does lexical scoping make closures possible?',
    ],
  },

  {
    id: 'iv-fn-shadowing-output',
    question: 'Shadowing across nested blocks — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.OUTPUT,
    topicIds: ['scope', 'variables'],
    relatedLessons: ['l-m10-01'],
    code:
      'let value = "outer";\n' +
      '\n' +
      'function show() {\n' +
      '  console.log(value);\n' +
      '}\n' +
      '\n' +
      '{\n' +
      '  let value = "inner";\n' +
      '  show();\n' +
      '  console.log(value);\n' +
      '}\n' +
      '\n' +
      'show();',
    options: ['outer\ninner\nouter', 'inner\ninner\nouter', 'outer\nouter\nouter', 'inner\ninner\ninner'],
    correct: 0,
    shortAnswer:
      'It prints `outer`, `inner`, `outer`. `show` was **defined** in the outer scope, so it resolves `value` against the outer binding no matter where it is called from. The inner `let value` shadows the name only inside that block.',
    deepAnswer: [
      '`show` captures the scope it was defined in — the module/outer scope. Calling it from inside the block does not change that; JavaScript is lexically scoped, so the call site is irrelevant to variable resolution.',
      'The first `show()` therefore logs `outer`, even though it is called from inside a block where a different `value` is visible.',
      '`console.log(value)` **inside** the block resolves lexically from that block, finds the shadowing `let value = "inner"`, and prints `inner`.',
      'The final `show()` prints `outer` again — nothing was ever mutated; there are simply two different bindings.',
      'This is the cleanest demonstration of "defined, not called." A candidate who answers `inner` for the first line is applying dynamic-scope reasoning, which is the intuition this question exists to correct.',
    ],
    keyPoints: [
      'Functions resolve variables against their **definition** scope',
      'The call site does not affect variable resolution',
      'The inner `let` shadows only within its block',
      'Two separate bindings — nothing is mutated',
    ],
    commonMistakes: [
      'Answering `inner` first, assuming the function sees the caller\'s scope.',
      'Expecting a `ReferenceError` from the shadowing declaration.',
    ],
    followUps: [
      'Would the answer change if `show` were defined inside the block?',
      'What if the inner declaration used `var` instead of `let`?',
      'Which language feature **is** determined by the call site?',
    ],
  },

  {
    id: 'iv-fn-closure-memory',
    question: 'Can closures cause memory leaks?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['closures', 'performance', 'events'],
    relatedLessons: ['l-m43-01', 'l-m32-01'],
    shortAnswer:
      'Yes — a closure keeps its captured variables reachable, so a long-lived closure holding a large object prevents that object being collected. The usual real cause is event listeners or timers that are never removed, keeping their handlers and everything they captured alive.',
    deepAnswer: [
      'Garbage collection frees what is unreachable. A closure holds a reference to its defining environment, so anything captured stays reachable for as long as the closure itself is reachable. That is not a leak by itself — it is the feature working.',
      'It becomes a leak when the closure **outlives its usefulness**. The dominant real-world cases are: an event listener added and never removed (the handler, and everything it closed over, stays alive as long as the element does — and if the element is detached but still referenced by the closure, neither can be collected); a `setInterval` that is never cleared; and a subscription or observer with no teardown.',
      'The practical discipline is that anything that registers should return or provide a way to unregister — `removeEventListener`, `clearInterval`, `observer.disconnect()`, an unsubscribe function. That is why so many well-designed APIs hand you a cleanup function rather than expecting you to reconstruct the arguments later.',
      'A subtlety worth raising: engines may capture the **entire** environment rather than only the variables actually referenced, depending on the implementation and whether `eval` is in play. So a closure that uses one small variable can, in some cases, retain a large sibling it never touches. Do not overstate this — it is implementation-dependent — but it explains surprising heap snapshots.',
      '`WeakMap` and `WeakRef` exist for cases where you want to associate data with an object without keeping it alive. And the honest caveat: you cannot force or observe collection timing, so any answer claiming memory is freed "immediately" is wrong.',
    ],
    keyPoints: [
      'Closures keep captured variables reachable — that is the feature, not the bug',
      'Leaks come from closures outliving their purpose',
      'Main causes: unremoved listeners, uncleared intervals, subscriptions with no teardown',
      'Design APIs to return a cleanup function',
      'Engines may retain more of the environment than the variables actually used',
      'Collection timing is not observable or controllable',
    ],
    commonMistakes: [
      'Claiming closures are inherently leaky and should be avoided.',
      'Asserting that memory is reclaimed immediately once a reference is dropped.',
    ],
    followUps: [
      'How would you find a leak like this in a real app?',
      'What does `WeakMap` help with here?',
      'Why can you not force garbage collection?',
    ],
  },

  {
    id: 'iv-fn-debug-lost-this',
    question: 'This class method breaks when passed as a callback. Why, and what are the fixes?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.DEBUGGING,
    topicIds: ['this', 'classes', 'events'],
    relatedLessons: ['l-m29-01', 'l-m31-01'],
    code:
      'class Timer {\n' +
      '  constructor() {\n' +
      '    this.count = 0;\n' +
      '  }\n' +
      '\n' +
      '  tick() {\n' +
      '    this.count += 1;\n' +
      '  }\n' +
      '\n' +
      '  start() {\n' +
      '    setInterval(this.tick, 1000);\n' +
      '  }\n' +
      '}',
    shortAnswer:
      '`this.tick` is passed as a bare function, so when the timer invokes it there is no receiver — `this` is `undefined` in the strict class body and `this.count += 1` throws. Fix with an arrow wrapper, `bind`, or a class-field arrow.',
    deepAnswer: [
      '**The cause.** `setInterval(this.tick, 1000)` evaluates `this.tick` to the function itself and hands it over. The link to the instance is not part of the function. When the timer later calls it as a plain call, `this` is decided at that call site — and class bodies are always strict, so `this` is `undefined` rather than the global object. Reading `this.count` throws `TypeError: Cannot read properties of undefined`.',
      '**Fix 1 — arrow wrapper:** `setInterval(() => this.tick(), 1000)`. The arrow has no `this` of its own, so `this` resolves lexically to the instance inside `start`. This is usually the clearest fix and needs no extra state.',
      '**Fix 2 — bind:** `setInterval(this.tick.bind(this), 1000)`. Explicit and fine. The caveat is that `bind` returns a **new** function each call, so if you also need to remove the listener or clear a reference later, you must keep that bound reference — `removeEventListener(type, this.handler.bind(this))` famously removes nothing, because it is a different function object.',
      '**Fix 3 — class field arrow:** `tick = () => { this.count += 1; }`. Bound per instance at construction. The trade-off is that it lives on the instance rather than the prototype, so it is allocated once per object rather than shared — usually irrelevant, occasionally not.',
      '**Second bug worth flagging unprompted:** `start` never stores the interval id, so the timer can never be stopped and calling `start` twice leaks a second interval. `this.intervalId = setInterval(...)` plus a `stop()` is the complete fix. Spotting this is often what separates a good answer from a great one.',
      '**Test that catches it:** construct a `Timer`, run `start`, advance a fake clock, and assert `count` incremented — with an injected scheduler so the test does not sleep.',
    ],
    keyPoints: [
      'Passing `this.tick` loses the receiver; `this` is `undefined` in a strict class body',
      'Fix: arrow wrapper, `bind`, or class-field arrow',
      '`bind` returns a new function — keep the reference if you need to remove it later',
      'Class-field arrows are per-instance, not on the prototype',
      'Second bug: the interval id is never stored, so it cannot be cleared',
    ],
    commonMistakes: [
      'Suggesting `bind` in `removeEventListener` without realising it creates a different function.',
      'Fixing `this` but missing the uncleanable interval.',
    ],
    followUps: [
      'Why does `removeEventListener(type, fn.bind(this))` not work?',
      'What is the downside of a class-field arrow?',
      'How would you test this without waiting a real second?',
    ],
  },

  {
    id: 'iv-fn-refactor-nested-conditions',
    question: 'How would you improve this function?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.REFACTORING,
    topicIds: ['clean-code', 'control-flow', 'functions'],
    relatedLessons: ['l-m40-01'],
    code:
      'function getShippingCost(order) {\n' +
      '  if (order) {\n' +
      '    if (order.items && order.items.length > 0) {\n' +
      '      if (order.country === "US") {\n' +
      '        if (order.total > 50) {\n' +
      '          return 0;\n' +
      '        } else {\n' +
      '          return 5;\n' +
      '        }\n' +
      '      } else {\n' +
      '        return 15;\n' +
      '      }\n' +
      '    } else {\n' +
      '      return 0;\n' +
      '    }\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
    shortAnswer:
      'Replace the nested pyramid with early-return guard clauses, so the exceptional cases are handled and dismissed at the top and the real logic sits unindented at the bottom. Also name the magic numbers, and note that three different conditions all silently return 0 — which may be hiding a bug.',
    deepAnswer: [
      '**The main problem is nesting depth.** Four levels of `if`/`else` means the reader has to hold four conditions in their head to understand the final branch. Guard clauses invert this: handle each disqualifying case immediately and return, so by the time you reach the substantive logic every precondition is already established.',
      'A refactored shape: `if (!order) return 0; if (!order.items?.length) return 0; if (order.country !== "US") return INTERNATIONAL_RATE; return order.total > FREE_SHIPPING_THRESHOLD ? 0 : DOMESTIC_RATE;` — same behaviour, one level of indentation, and each rule readable in isolation.',
      '**Magic numbers.** `50`, `5` and `15` are business rules with no names. Extracting `FREE_SHIPPING_THRESHOLD`, `DOMESTIC_RATE` and `INTERNATIONAL_RATE` makes the policy visible and gives one place to change it.',
      '**The observation worth raising unprompted:** three distinct situations — no order at all, an empty order, and a qualifying free-shipping order — all return `0`. Those are semantically different. "No order" is arguably a programming error that should throw; "empty order" returning 0 is defensible; "free shipping earned" is a real business outcome. Collapsing them means a caller cannot distinguish "free" from "invalid", and a future bug in the guard would be invisible. Flagging this is what shows you are reading for **meaning** rather than just reformatting.',
      '**What I would not change without asking:** whether to throw on a missing order, and whether shipping rules should be data rather than code, both depend on context I do not have. Saying so is better than silently imposing an architecture.',
      '**A test I would add:** one case per branch, especially the boundary at exactly 50 — the current `> 50` means an order of exactly 50 pays full shipping, which may or may not be intended and is precisely the kind of off-by-one a test pins down.',
    ],
    keyPoints: [
      'Replace nesting with early-return guard clauses',
      'Extract magic numbers into named constants',
      'Three different cases return 0 — semantically distinct, possibly a bug',
      'Flag the boundary at exactly 50 as needing a test',
      'Do not impose decisions (throwing, data-driven rules) that need business context',
    ],
    commonMistakes: [
      'Only reformatting without noticing the conflated return values.',
      'Rewriting into a "clever" lookup table that is harder to read than the guards.',
    ],
    followUps: [
      'Should a missing `order` throw instead of returning 0?',
      'What test would you write first?',
      'When would you move these rules into data instead of code?',
    ],
  },
];

export default questions;
