import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Junior-level essentials — the questions that open a first or second
 * JavaScript interview. They are short, but the bar is still precision: a
 * vague answer to an easy question reads worse than a vague answer to a hard
 * one, because the interviewer knows you should know this cold.
 */

const TOPIC = 'Core Language';

export const questions = [
  {
    id: 'iv-core-let-vs-const-choice',
    question: 'Do you reach for `let` or `const` by default, and why?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.SCENARIO,
    topicIds: ['variables', 'clean-code'],
    relatedLessons: ['l-m01-01'],
    shortAnswer:
      '`const` by default, `let` only when the binding genuinely needs to be reassigned. It communicates intent — a reader can see at a glance that the name will not change — and it removes a whole category of accidental reassignment bugs.',
    deepAnswer: [
      'The value is communicative rather than performance-related. `const` tells the reader "this name refers to the same thing for its whole life," which is one less thing to track while reading a function.',
      'It also catches real mistakes: an accidental reassignment becomes a `TypeError` at the point of the error rather than a wrong value discovered later.',
      'The important caveat to state unprompted: `const` prevents **rebinding**, not mutation. `const items = []; items.push(1)` is perfectly legal. Candidates who claim `const` makes data immutable are revealing a real misunderstanding.',
      'In a `for...of` loop, `const` is usually correct because a fresh binding is created per iteration. A classic counted `for (let i = 0; ...)` needs `let` because `i` is reassigned.',
    ],
    keyPoints: [
      '`const` by default; `let` only when reassigning',
      'Communicates that the binding is stable',
      'Turns accidental reassignment into an immediate error',
      '`const` blocks rebinding, not mutation of the value',
      '`for...of` can use `const`; a counted `for` needs `let`',
    ],
    commonMistakes: ['Claiming `const` makes the value immutable.', 'Claiming a performance benefit that does not meaningfully exist.'],
    followUps: ['Can you mutate a `const` object?', 'Why can `for...of` use `const`?'],
  },

  {
    id: 'iv-core-loop-choice',
    question: 'How do you choose between `for`, `for...of`, `for...in` and `forEach`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['loops', 'arrays', 'objects'],
    relatedLessons: ['l-m11-01'],
    shortAnswer:
      '`for...of` for array values, `for...in` only for object keys (never arrays), `forEach` for side effects when you will not need to break, and a counted `for` when you need the index or to control the step. Prefer `map`/`filter`/`reduce` when you are transforming rather than iterating.',
    deepAnswer: [
      '**`for...of`** iterates values of any iterable and supports `break`, `continue` and `await`. It is the default for arrays.',
      '**`for...in`** iterates enumerable **string keys, including inherited ones**, in an order that puts integer-like keys first. On an array it gives you `"0"`, `"1"` as strings and can pick up inherited properties, so it is the wrong tool there. Use it for plain objects, and pair it with `Object.hasOwn` if the prototype might carry anything.',
      '**`forEach`** is for effects. It cannot break, and `return` only exits the current callback.',
      '**Counted `for`** when you need the index arithmetic, a non-unit step, or to iterate backwards — which is the correct way to remove elements while looping.',
      'The wider point: if the loop is building a new array or a single value, `map`, `filter` or `reduce` says so more clearly than any loop.',
    ],
    keyPoints: [
      '`for...of`: values, supports `break` and `await`',
      '`for...in`: object keys including inherited — never for arrays',
      '`forEach`: side effects, cannot break',
      'Counted `for`: index arithmetic, custom step, backwards removal',
      'Transforming? Use `map`/`filter`/`reduce`',
    ],
    commonMistakes: ['Using `for...in` on an array.', 'Trying to `break` out of `forEach`.'],
    followUps: ['Why is `for...in` wrong for arrays?', 'How do you stop a `forEach` early?'],
  },

  {
    id: 'iv-core-ternary',
    question: 'When is a ternary better than an `if`, and when is it worse?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.SCENARIO,
    topicIds: ['control-flow', 'clean-code'],
    relatedLessons: ['l-m07-01'],
    shortAnswer:
      'Better when you are choosing between two **values** and want an expression — assigning, or inlining in JSX or a template. Worse when the branches contain statements or side effects, or when nesting makes the reader parse precedence.',
    deepAnswer: [
      'A ternary is an expression, so it produces a value. That is its advantage: `const label = count === 1 ? "item" : "items"` is a single assignment with no reassignment and no `let`.',
      'It gets worse the moment the branches do work rather than produce values. Side effects inside a ternary hide control flow in something that reads like data.',
      'Nested ternaries are the main readability hazard. Two levels are usually still readable when formatted one condition per line; three is generally a sign the logic wants an early-return `if` chain, a lookup object, or a named function.',
      'The judgement to state: a ternary should be readable as a sentence. If you need to count parentheses to know what it does, use an `if`.',
    ],
    keyPoints: [
      'Ternary is an expression — good for choosing a value',
      'Enables `const` instead of `let` plus reassignment',
      'Bad when branches have side effects',
      'Deep nesting is a signal to switch to guards or a lookup',
    ],
    commonMistakes: ['Nesting three or more ternaries for "compactness".'],
    followUps: ['How would you rewrite a three-level nested ternary?'],
  },

  {
    id: 'iv-core-switch',
    question: 'What are the pitfalls of `switch`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['control-flow'],
    relatedLessons: ['l-m07-01'],
    shortAnswer:
      'Missing `break` causes fall-through into the next case; cases compare with strict equality so `"1"` will not match `1`; and `let`/`const` declared in one case are scoped to the whole switch block unless you add braces.',
    deepAnswer: [
      '**Fall-through** is the classic bug: without `break` (or `return`), execution continues into subsequent cases. It is occasionally intentional for grouping several labels, and when it is, a comment saying so prevents the next reader "fixing" it.',
      '**Strict comparison**: matching uses `===`, so a numeric-looking string from a form input will not match a number case. This surprises people who expect `switch` to be lenient.',
      '**Block scoping**: the whole switch body is one block, so `case "a": const x = 1;` and `case "b": const x = 2;` is a redeclaration error. Wrapping each case body in `{ }` fixes it.',
      'For simple value-to-value mapping, an object lookup is often clearer and has no fall-through risk: `const label = LABELS[status] ?? "Unknown"`.',
    ],
    keyPoints: [
      'Missing `break` falls through — comment it when intentional',
      'Matching is strict (`===`)',
      'One shared block scope unless each case is braced',
      'An object lookup is often clearer for value mapping',
    ],
    commonMistakes: ['Expecting `switch` to coerce like `==`.'],
    followUps: ['When would you use an object lookup instead?'],
  },

  {
    id: 'iv-core-string-immutable',
    question: 'Are strings mutable in JavaScript?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['strings', 'types'],
    relatedLessons: ['l-m05-01'],
    shortAnswer:
      'No. Strings are primitives and immutable — `str[0] = "X"` does nothing in sloppy mode and throws in strict mode. Every string method returns a **new** string rather than modifying the original.',
    deepAnswer: [
      'Assigning to an index silently fails in sloppy mode and throws a `TypeError` in strict mode, which includes all module code.',
      'Because methods return new strings, forgetting to use the return value is a common bug: `str.toUpperCase();` on its own line does nothing observable.',
      'Repeated concatenation in a large loop creates many intermediate strings. Engines optimise this well with rope representations, so it is rarely the real bottleneck — but building an array and calling `join("")` is the conventional answer when it genuinely matters.',
      'The reason `"abc".toUpperCase()` works at all despite strings being primitives is that the engine wraps the primitive in a temporary `String` object for the call and discards it — which is also why assigning a property to a string does not stick.',
    ],
    keyPoints: [
      'Immutable; index assignment throws in strict mode',
      'Methods return new strings — use the return value',
      'Method calls work via a temporary object wrapper',
      '`join("")` over an array when concatenation genuinely matters',
    ],
    commonMistakes: ['Calling a string method and discarding the result.'],
    followUps: ['Why can you call methods on a primitive?'],
  },

  {
    id: 'iv-core-array-copy',
    question: 'How do you copy an array, and what does that copy actually give you?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['arrays', 'copying'],
    relatedLessons: ['l-m12-01'],
    shortAnswer:
      '`[...arr]`, `arr.slice()` or `Array.from(arr)` all give a new array — but a **shallow** one. The elements are the same references, so nested objects are still shared with the original.',
    deepAnswer: [
      'All three produce a genuinely new array object, so `push` and `splice` on the copy do not affect the original.',
      'The elements themselves are copied by value for primitives and by reference for objects. So `copy[0].name = "x"` changes the original\'s first object too — the array is copied, its contents are not.',
      'For a deep copy use `structuredClone(arr)`, which handles nesting, `Date`, `Map`, `Set` and cycles but cannot clone functions.',
      'The usual better answer is not to deep copy at all: build the changed structure with new objects along the path you are modifying, and leave untouched branches shared.',
    ],
    keyPoints: [
      '`[...arr]`, `slice()`, `Array.from()` all give a new array',
      'Shallow — nested objects remain shared',
      '`structuredClone` for a deep copy; cannot clone functions',
      'Often better: build new objects along the changed path',
    ],
    commonMistakes: ['Calling spread a deep copy.'],
    followUps: ['How would you copy an array of objects safely?'],
  },

  {
    id: 'iv-core-includes-indexof',
    question: 'What is the difference between `includes` and `indexOf`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['array-methods', 'arrays'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      '`includes` returns a boolean and uses SameValueZero, so it finds `NaN`. `indexOf` returns an index or `-1` and uses strict equality, so `[NaN].indexOf(NaN)` is `-1`. Use `includes` for a membership test, `indexOf` when you need the position.',
    deepAnswer: [
      'The `NaN` difference is the interesting one and a frequent follow-up: `[NaN].includes(NaN)` is `true` while `[NaN].indexOf(NaN)` is `-1`, because they use different equality algorithms.',
      '`includes` also reads better for a membership test — `if (roles.includes("admin"))` versus `if (roles.indexOf("admin") !== -1)`, where forgetting the `!== -1` gives a bug, since index `0` is falsy.',
      'Both are O(n) linear scans. For repeated membership checks over a large collection, build a `Set` once and use `has`, which is roughly O(1).',
      'Both exist on strings too, where `includes` is a substring test.',
    ],
    keyPoints: [
      '`includes` → boolean, SameValueZero, finds `NaN`',
      '`indexOf` → index or `-1`, strict equality, misses `NaN`',
      '`indexOf(...) !== -1` is error-prone because index 0 is falsy',
      'Both O(n); use a `Set` for repeated lookups',
    ],
    commonMistakes: ['Writing `if (arr.indexOf(x))` and breaking on index 0.'],
    followUps: ['Why does `indexOf` fail to find `NaN`?'],
  },

  {
    id: 'iv-core-push-concat',
    question: 'What is the difference between `push` and `concat`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['array-methods', 'copying'],
    relatedLessons: ['l-m13-01'],
    shortAnswer:
      '`push` mutates the array in place and returns the new **length**. `concat` returns a new array and leaves the original untouched. Use `push` for a local array you own, `concat` or spread when the array is shared state.',
    deepAnswer: [
      '`push` returning the length rather than the array trips people up when they try to chain it.',
      '`concat` (or `[...arr, item]`) produces a new array, which is what you want for state a framework compares by reference — mutating in place leaves the reference identical and the re-render may never fire.',
      '`concat` flattens one level of array arguments: `[1].concat([2, 3])` gives `[1, 2, 3]`, whereas `[...[1], [2, 3]]` gives `[1, [2, 3]]`. Worth knowing when you mean to append an array as a single element.',
      'In a hot loop building a large array, `push` into a local array is far better than repeatedly spreading, which is O(n²).',
    ],
    keyPoints: [
      '`push` mutates and returns the new length',
      '`concat`/spread return a new array',
      '`concat` flattens one level of array arguments',
      'Repeated spreading to append is O(n²)',
    ],
    commonMistakes: ['Chaining off `push` and getting a number.', 'Spreading in a loop to build a large array.'],
    followUps: ['Why is spreading in a loop quadratic?'],
  },

  {
    id: 'iv-core-object-keys-values-entries',
    question: 'How do you iterate an object\'s properties?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['objects', 'object-utilities'],
    relatedLessons: ['l-m15-01'],
    shortAnswer:
      '`Object.keys`, `Object.values` and `Object.entries` return arrays of own enumerable properties, so you can use array methods on them. `for...in` also walks inherited properties, which is usually not what you want.',
    deepAnswer: [
      '`Object.entries(obj)` plus destructuring is the most common idiom: `for (const [key, value] of Object.entries(obj))`.',
      'All three include only **own enumerable** properties, which is the safe default — inherited names never appear.',
      '`for...in` includes inherited enumerable properties, so it needs an `Object.hasOwn` guard to be safe on objects whose prototype may carry anything.',
      'Key order is worth knowing: integer-like keys come first in ascending numeric order, then string keys in insertion order, then symbols. If ordering matters to you, a `Map` is the honest choice.',
      '`Object.fromEntries` is the inverse and makes transform-and-rebuild pipelines readable.',
    ],
    keyPoints: [
      '`keys`/`values`/`entries` — own enumerable only',
      '`for...in` includes inherited — guard with `Object.hasOwn`',
      'Integer-like keys are ordered first, numerically',
      '`Object.fromEntries` rebuilds an object from pairs',
    ],
    commonMistakes: ['Using `for...in` without a `hasOwn` guard on untrusted objects.'],
    followUps: ['What order do object keys iterate in?'],
  },

  {
    id: 'iv-core-arrow-shorthand',
    question: 'What are the syntax rules for arrow functions?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['arrow-functions', 'functions'],
    relatedLessons: ['l-m09-01'],
    shortAnswer:
      'A concise body returns its expression implicitly; a braced body needs an explicit `return`. Returning an object literal needs parentheses — `() => ({ a: 1 })` — or the braces are parsed as a block.',
    deepAnswer: [
      '`(a, b) => a + b` returns implicitly. `(a, b) => { a + b; }` returns `undefined`, because the braces make it a statement body with no `return`. That silent difference is the most common arrow bug.',
      'Returning an object literal is the other trap: `() => { a: 1 }` parses the braces as a block containing a label, and returns `undefined`. Wrapping in parentheses — `() => ({ a: 1 })` — makes it an expression.',
      'A single parameter can omit its parentheses, though many style guides require them for consistency and because adding a default or a type later needs them anyway.',
      'The behavioural differences matter more than the syntax: no own `this`, no `arguments`, cannot be constructed, no `prototype`.',
    ],
    keyPoints: [
      'Concise body returns implicitly; braced body needs `return`',
      '`() => ({ ... })` to return an object literal',
      'Single parameter may omit parentheses',
      'No own `this`, `arguments`, or `prototype`',
    ],
    commonMistakes: ['Adding braces and losing the implicit return.'],
    followUps: ['Why do you need parentheses to return an object?'],
  },

  {
    id: 'iv-core-error-handling-basics',
    question: 'How do you handle errors in synchronous code, and what should you avoid?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['errors', 'control-flow'],
    relatedLessons: ['l-m22-01'],
    shortAnswer:
      '`try`/`catch`/`finally`, keeping the `try` block as small as the code that can actually throw. Avoid catching and silently continuing, and avoid catching so broadly that unrelated bugs are reported as the expected failure.',
    deepAnswer: [
      'Keep the `try` tight. Wrapping thirty lines means a typo in rendering logic is caught by a handler written for a parse failure, and reported as one.',
      '**Never swallow.** `catch (e) {}` — or catching and only logging while continuing as if nothing happened — hides failures from callers who then act on incomplete data. Either handle it meaningfully, or rethrow.',
      '**Throw `Error` objects, not strings.** A string has no stack trace. And in a `catch`, remember the caught value is not guaranteed to be an `Error` — anything can be thrown — so `error.message` may be `undefined`.',
      '`finally` runs on both paths and is the right place for cleanup. A `return` inside `finally` overrides a pending return **and discards a pending throw**, which is almost never intended.',
      'Prefer specific error types with structured fields so callers can branch on data rather than parsing messages.',
    ],
    keyPoints: [
      'Keep the `try` block narrow',
      'Never swallow — handle meaningfully or rethrow',
      'Throw `Error` objects; a caught value may not be one',
      '`return` inside `finally` discards a pending throw',
      'Specific error types with structured fields',
    ],
    commonMistakes: ['Empty catch blocks.', 'Throwing strings.'],
    followUps: ['What does a `return` inside `finally` do?'],
  },

  {
    id: 'iv-core-function-args-mismatch',
    question: 'What happens if you call a function with the wrong number of arguments?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['functions'],
    relatedLessons: ['l-m08-01'],
    shortAnswer:
      'Nothing throws. Missing parameters are `undefined`; extra arguments are ignored (though still available via `arguments` in a non-arrow function). Default parameters fill in for `undefined` only — not for `null`.',
    deepAnswer: [
      'JavaScript does not check arity, which is why a typo in a call site produces a downstream `undefined` rather than an immediate error. That is a large part of the argument for TypeScript.',
      'Defaults trigger on `undefined` specifically. Passing `null` explicitly uses `null`, which catches people who expect `??`-like behaviour.',
      'Extra arguments are silently dropped by the parameter list, but a non-arrow function can still see them in `arguments`, and a rest parameter captures them deliberately.',
      'This is the mechanism behind the `["1","2","3"].map(parseInt)` trap: `map` passes `(value, index, array)` and `parseInt` accepts a second radix argument, so the index becomes the radix.',
    ],
    keyPoints: [
      'No arity checking — missing params are `undefined`',
      'Extra arguments are ignored by the parameter list',
      'Defaults fire for `undefined`, not `null`',
      'Explains the `map(parseInt)` trap',
    ],
    commonMistakes: ['Expecting a default to apply for `null`.'],
    followUps: ['Why does `map(parseInt)` misbehave?'],
  },

  {
    id: 'iv-core-dom-selection',
    question: 'How do you get a reference to an element and change its text?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.BROWSER,
    topicIds: ['dom', 'dom-manipulation'],
    relatedLessons: ['l-m17-01'],
    shortAnswer:
      '`document.querySelector(selector)` returns the first match or `null`; set `element.textContent` to change its text. Check for `null` before using the result — a missing element is the most common cause of "cannot read properties of null".',
    deepAnswer: [
      '`querySelector` accepts any CSS selector and works on `document` or on any element for a scoped search. `getElementById` is marginally faster and returns `null` the same way.',
      'The `null` case matters: if the script runs before the element exists — a `<script>` in `<head>` without `defer`, or an element rendered later — the selector returns `null` and the next property access throws.',
      'Use `textContent` for text, not `innerHTML`, unless you specifically intend to parse markup. `textContent` cannot execute anything and is faster.',
      'Cache the reference rather than re-querying inside a loop or an event handler that fires often.',
    ],
    keyPoints: [
      '`querySelector` → first match or `null`',
      'Guard for `null` — script order is the usual cause',
      '`textContent` for text; avoid `innerHTML`',
      'Cache the reference rather than re-querying',
    ],
    commonMistakes: ['Not checking for `null` and blaming the selector syntax.'],
    followUps: ['Why might a selector return `null` even though the element is in the HTML?'],
  },

  {
    id: 'iv-core-add-event-listener',
    question: 'What are the arguments to `addEventListener`, and why prefer it over `onclick`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.BROWSER,
    topicIds: ['events', 'dom'],
    relatedLessons: ['l-m19-01'],
    shortAnswer:
      '`addEventListener(type, handler, options)`. It allows multiple handlers for the same event, supports capture, `once` and `passive` options, and can be removed cleanly — whereas assigning `onclick` allows only one handler and silently overwrites any previous one.',
    deepAnswer: [
      'The overwrite problem is the main reason: `element.onclick = fn` replaces whatever was there, so two independent pieces of code cannot both listen.',
      'The options object is genuinely useful: `{ once: true }` auto-removes after the first call, `{ passive: true }` promises not to call `preventDefault` so the browser can scroll without waiting, and `{ signal }` lets an `AbortController` remove the listener along with others.',
      '`removeEventListener` matches on type, the **same function reference**, and matching capture setting. Passing a fresh arrow or a new `.bind(this)` removes nothing — the single most common listener bug.',
      'In the handler, `this` is the element for a regular function (equivalent to `event.currentTarget`) and lexical for an arrow, which is why `currentTarget` is the more reliable choice.',
    ],
    keyPoints: [
      '`(type, handler, options)`; multiple handlers allowed',
      '`onclick` allows only one and overwrites silently',
      'Options: `once`, `passive`, `capture`, `signal`',
      'Removal needs the identical function reference',
    ],
    commonMistakes: ['Removing with a new inline arrow or fresh `bind`.'],
    followUps: ['What does `{ passive: true }` do?'],
  },

  {
    id: 'iv-core-what-is-api',
    question: 'What happens when your code calls a REST API?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.HTTP,
    topicIds: ['http', 'async-foundations'],
    relatedLessons: ['l-m26-01'],
    shortAnswer:
      'You send an HTTP request with a method, URL, headers and optionally a body; the server responds with a status code, headers and a body — usually JSON. In the browser this is asynchronous, so you get a promise rather than the data directly.',
    deepAnswer: [
      'The request carries a method describing intent (`GET` to read, `POST` to create), headers such as `Content-Type` and `Authorization`, and a body for methods that send data.',
      'The response carries a status code — 2xx success, 4xx caller error, 5xx server error — plus headers and a body. `fetch` resolves for **all** of these, so `response.ok` must be checked; only a network-level failure rejects.',
      'Reading the body is itself asynchronous: `response.json()` returns a promise because the body may still be streaming.',
      'Because it is asynchronous, the surrounding UI needs explicit loading, success and error states rather than assuming the data is present.',
    ],
    keyPoints: [
      'Method, URL, headers, optional body → status, headers, body',
      '`fetch` resolves on 4xx/5xx — check `response.ok`',
      'Reading the body (`.json()`) is also asynchronous',
      'The UI needs loading, success and error states',
    ],
    commonMistakes: ['Assuming a 404 rejects the fetch promise.'],
    followUps: ['What does `response.ok` actually check?'],
  },

  {
    id: 'iv-core-debug-approach',
    question: 'Walk me through how you debug a piece of JavaScript that is not working.',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.DEBUGGING,
    topicIds: ['debugging', 'errors', 'devtools'],
    relatedLessons: ['l-m22-01'],
    shortAnswer:
      'Read the actual error and stack trace first, reproduce it reliably, then narrow where the expectation diverges from reality using breakpoints or targeted logging — changing one thing at a time.',
    deepAnswer: [
      'Start with the error message and stack trace. A surprising number of people scroll past it; it usually names the file, line and the operation that failed.',
      'Reproduce reliably before changing anything, otherwise you cannot tell whether a change fixed it or the symptom just moved.',
      'Then narrow. A breakpoint in DevTools lets you inspect every variable in scope and step through, which is more informative than logging one value at a time. Conditional breakpoints are useful inside loops.',
      'Logging is still fine — `console.log({ user, items })` with an object literal keeps the names attached, and `console.table` is good for arrays of objects.',
      'Change one thing at a time and check the result. Changing three and seeing it work teaches you nothing about which mattered.',
      'Finish by adding a test that fails on the old behaviour, so the bug cannot come back silently.',
    ],
    keyPoints: [
      'Read the error and stack trace first',
      'Reproduce reliably before changing anything',
      'Breakpoints show all state; conditional breakpoints for loops',
      '`console.log({ x, y })` keeps names attached',
      'One change at a time; finish with a regression test',
    ],
    commonMistakes: ['Guessing and changing several things at once.'],
    followUps: ['When is a breakpoint better than a log?'],
  },

  {
    id: 'iv-core-scope-basics',
    question: 'What is the difference between global, function and block scope?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['scope', 'variables'],
    relatedLessons: ['l-m10-01'],
    shortAnswer:
      'Global is accessible everywhere; function scope is created by every function and is what `var` respects; block scope is any `{ }` and is what `let` and `const` respect. Inner scopes can read outer ones, not the reverse.',
    deepAnswer: [
      'Each function call creates a new scope. Blocks — `if`, `for`, or a bare `{ }` — create a scope for `let`, `const` and `class`, but not for `var`.',
      'That difference is exactly why a `var` declared inside an `if` is visible throughout the whole function, which is almost never what the author intended.',
      'Lookup goes outward: current scope, then enclosing, up to global. The first match wins, so an inner declaration shadows an outer one of the same name.',
      'Globals are worth minimising — they can be read or overwritten by any code, including third-party scripts, and they make code hard to test in isolation. In an ES module, top-level declarations are module-scoped rather than global, which removes most of the problem by default.',
    ],
    keyPoints: [
      'Function scope for `var`; block scope for `let`/`const`',
      'Lookup goes outward; first match wins (shadowing)',
      'A `var` in an `if` leaks to the whole function',
      'Module top-level declarations are not global',
    ],
    commonMistakes: ['Believing `var` is block-scoped.'],
    followUps: ['Why are globals a problem?'],
  },

  {
    id: 'iv-core-callback',
    question: 'What is a callback function?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['functions', 'higher-order', 'async-foundations'],
    relatedLessons: ['l-m09-01'],
    shortAnswer:
      'A function passed to another function to be called later. Callbacks are not inherently asynchronous — `map`\'s callback runs synchronously; `setTimeout`\'s runs later. That distinction is worth being precise about.',
    deepAnswer: [
      'It works because functions are first-class values that can be passed like any other argument.',
      '**Synchronous callbacks** run during the call: `map`, `filter`, `sort`\'s comparator. **Asynchronous callbacks** are stored and invoked later by the host: `setTimeout`, event listeners, older I/O APIs.',
      'The error-first convention in older Node-style APIs is `(error, value) => {}`, where `error` is `null` on success — worth recognising even though promises have largely replaced it.',
      'The problems that pushed the ecosystem toward promises were not just nesting: a callback API can invoke your callback twice or never, and its timing can vary between synchronous and asynchronous depending on cache state — both of which promises make impossible.',
    ],
    keyPoints: [
      'A function passed to be called later',
      'Not inherently async — `map`\'s callback is synchronous',
      'Error-first `(error, value)` is the Node convention',
      'Promises guarantee single settlement and consistent async timing',
    ],
    commonMistakes: ['Equating "callback" with "asynchronous".'],
    followUps: ['Give an example of a synchronous callback.'],
  },

  {
    id: 'iv-core-truthy-check-arrays',
    question: 'Why does `if (items)` not tell you whether an array has elements?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['booleans', 'arrays', 'coercion'],
    relatedLessons: ['l-m03-01'],
    shortAnswer:
      'An empty array is an object, and every object is truthy — so `if ([])` is always true. Test `items.length` (or `items?.length`) when you want to know whether there is anything in it.',
    deepAnswer: [
      'Truthiness is about the value\'s type, not its contents. `[]` and `{}` are objects, and objects are always truthy regardless of what is inside them.',
      'So `if (items)` only tells you the variable is not `null`, `undefined` or another falsy value — which is a useful check, just a different one.',
      '`if (items.length)` throws if `items` is `null`; `if (items?.length)` handles both concerns in one expression, which is usually what you want.',
      'The same reasoning explains `"0"` being truthy (a non-empty string) while the number `0` is falsy, and it is why `filter(Boolean)` removes exactly the falsy values.',
    ],
    keyPoints: [
      'All objects are truthy, including `[]` and `{}`',
      '`if (items)` checks existence, not emptiness',
      '`items?.length` covers both safely',
      '`"0"` is truthy; `0` is falsy',
    ],
    commonMistakes: ['Using `if (arr)` to test emptiness.'],
    followUps: ['Is `{}` truthy?'],
  },

  {
    id: 'iv-core-async-defer',
    question: 'What is the difference between `async` and `defer` on a script tag?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.BROWSER,
    topicIds: ['dom', 'performance', 'js-runtime'],
    relatedLessons: ['l-m01-01'],
    shortAnswer:
      'Both download the script without blocking HTML parsing. `defer` executes after parsing completes, in document order. `async` executes as soon as it downloads, in unpredictable order. A plain `<script>` blocks parsing entirely.',
    deepAnswer: [
      'A plain `<script>` in `<head>` stops HTML parsing while it downloads and runs, which delays first render — the historical reason for putting scripts at the end of `<body>`.',
      '`defer` downloads in parallel and runs after the document is parsed, **preserving document order**. That makes it the right default for application code with dependencies between files.',
      '`async` downloads in parallel and runs the moment it is ready, possibly before other scripts that appear earlier. Suitable for genuinely independent third-party scripts like analytics.',
      '`type="module"` is deferred by default, so modern module code already behaves like `defer`.',
      'This also explains a common junior bug: a script in `<head>` without `defer` runs before the elements exist, so `querySelector` returns `null`.',
    ],
    keyPoints: [
      'Plain script blocks parsing',
      '`defer`: after parsing, in document order — good default',
      '`async`: as soon as downloaded, order not guaranteed',
      '`type="module"` is deferred by default',
      'Explains `querySelector` returning `null` in a head script',
    ],
    commonMistakes: ['Using `async` for scripts that depend on each other.'],
    followUps: ['Why might `querySelector` return `null` in a head script?'],
  },

  {
    id: 'iv-core-semicolons',
    question: 'Are semicolons required in JavaScript?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['syntax'],
    relatedLessons: ['l-m01-01'],
    shortAnswer:
      'Not usually — Automatic Semicolon Insertion adds them. But ASI has failure cases, notably a line starting with `(` or `[`, and `return` followed by a newline, which silently returns `undefined`.',
    deepAnswer: [
      'ASI inserts semicolons at line breaks where the code would otherwise be a syntax error, which covers most code.',
      'The dangerous case is a line **starting** with `(` or `[`, which ASI treats as a continuation of the previous line — so the previous line gets called or indexed instead of ending. Codebases that omit semicolons handle this by prefixing such lines with a leading semicolon.',
      '`return` followed by a newline is the worst case: a semicolon is inserted immediately after `return`, so the function returns `undefined` and the intended expression becomes unreachable. No error is raised.',
      'The practical answer: pick a style, enforce it with Prettier and a lint rule, and stop thinking about it. Both styles work; inconsistency is what causes problems.',
    ],
    keyPoints: [
      'ASI handles most cases',
      'Lines starting with `(` or `[` continue the previous line',
      '`return` + newline silently returns `undefined`',
      'Enforce a consistent style with tooling',
    ],
    commonMistakes: ['Putting the return value on the line after `return`.'],
    followUps: ['Why does a line starting with `[` break?'],
  },

  {
    id: 'iv-core-null-check',
    question: 'How do you safely check whether a value is "missing"?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['types', 'operators', 'booleans'],
    relatedLessons: ['l-m03-01'],
    shortAnswer:
      '`value == null` is true for exactly `null` and `undefined` and nothing else — the one idiomatic use of loose equality. Use `??` to supply a default for those two cases without swallowing `0`, `""` or `false`.',
    deepAnswer: [
      '`value == null` is a deliberate exception to the "always use `===`" rule, because loose equality treats `null` and `undefined` as equal to each other and to nothing else. Writing `value === null || value === undefined` is equivalent and clearer to some readers; both are defensible.',
      '`if (!value)` is the check to avoid when `0`, `""` or `false` are legitimate values — it treats them as missing.',
      'For a property that might be missing versus present-but-`undefined`, use `Object.hasOwn(obj, key)`; neither a nullish check nor optional chaining can distinguish those.',
      '`??` and `?.` both use the nullish definition, which is what makes them compose well with this style of check.',
    ],
    keyPoints: [
      '`value == null` matches exactly `null` and `undefined`',
      '`!value` also catches `0`, `""`, `false`, `NaN`',
      '`Object.hasOwn` distinguishes missing from `undefined`',
      '`??` and `?.` use the same nullish definition',
    ],
    commonMistakes: ['Using `!value` where `0` is valid.'],
    followUps: ['How do you tell a missing key from one holding `undefined`?'],
  },

  {
    id: 'iv-core-array-length',
    question: 'What happens if you set `array.length` directly?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['arrays'],
    relatedLessons: ['l-m12-01'],
    shortAnswer:
      'It is writable. Setting it smaller truncates the array destructively; setting it larger creates a sparse array with holes, not `undefined` values — and holes are skipped by most array methods.',
    deepAnswer: [
      '`arr.length = 0` is an old idiom for emptying an array in place. It works, but `arr.splice(0)` or reassigning to `[]` is usually clearer about intent.',
      'Setting a larger length creates **holes**. A hole is not the same as an element holding `undefined`: `map`, `filter` and `forEach` skip holes, while `Array.from` and spread convert them to `undefined`.',
      'That is why `new Array(3).map((_, i) => i)` gives three holes rather than `[0, 1, 2]`, and why `Array.from({ length: 3 }, (_, i) => i)` is the correct idiom for generating a sequence.',
      'Assigning past the end (`arr[10] = 1` on a length-2 array) also creates holes, which is a subtler way to end up with a sparse array by accident.',
    ],
    keyPoints: [
      '`length` is writable; shrinking truncates destructively',
      'Growing creates holes, not `undefined` values',
      'Most array methods skip holes',
      '`Array.from({ length: n }, fn)` is the correct generator idiom',
    ],
    commonMistakes: ['Expecting `new Array(3).map(...)` to work.'],
    followUps: ['What is the difference between a hole and `undefined`?'],
  },

  {
    id: 'iv-core-immediately-visible-bug',
    question: 'What is wrong with this function?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.DEBUGGING,
    topicIds: ['functions', 'array-methods'],
    relatedLessons: ['l-m13-01'],
    code:
      'function getActiveNames(users) {\n' +
      '  users.filter((user) => user.isActive)\n' +
      '    .map((user) => user.name);\n' +
      '}',
    shortAnswer:
      'The function never returns anything, so it always yields `undefined`. `filter` and `map` return new arrays, but nothing captures or returns the result. Add `return` before `users.filter(...)`.',
    deepAnswer: [
      'Both `filter` and `map` are non-mutating — they build and return new arrays and leave `users` untouched. Calling them and discarding the result does nothing observable.',
      'Because there is no `return`, the function returns `undefined`, and the caller typically fails later with "cannot read properties of undefined" somewhere unrelated — which is what makes a missing return expensive to trace.',
      'The fix is one word: `return users.filter(...).map(...)`.',
      'This is a good argument for the concise arrow body in small helpers: `const getActiveNames = (users) => users.filter(...).map(...)` cannot have this bug, because there are no braces to forget a `return` inside.',
      'A test asserting the returned array catches it immediately; a test that only checks it does not throw would pass.',
    ],
    keyPoints: [
      'No `return` — the function yields `undefined`',
      '`filter`/`map` return new arrays and do not mutate',
      'The failure surfaces later, far from the cause',
      'A concise arrow body eliminates this class of bug',
    ],
    commonMistakes: ['Assuming `map` mutates the original array.'],
    followUps: ['Why does the error usually appear somewhere else?'],
  },

  {
    id: 'iv-core-two-arrays-equal',
    question: 'Why does `[1,2] === [1,2]` return `false`, and how would you compare them?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['arrays', 'objects', 'operators'],
    relatedLessons: ['l-m14-01'],
    shortAnswer:
      'Objects — including arrays — compare by **reference**, not contents. Two separately-created arrays are two different objects. To compare contents, compare element by element, or use a deep-equality helper.',
    deepAnswer: [
      '`===` on objects asks "are these the same object in memory?" Two array literals create two objects, so the answer is `false` even though the contents match.',
      'For flat arrays, `a.length === b.length && a.every((v, i) => v === b[i])` is enough.',
      '`JSON.stringify(a) === JSON.stringify(b)` is the tempting shortcut and is unreliable: it depends on key order for objects, and it mangles `undefined`, `Date`, `Map`, `Set` and `NaN`.',
      'A proper deep equal must handle nested structures, `NaN` (which is not `===` itself), `Date` by time value, and distinguish arrays from objects with numeric keys. That is why it is a common interview implementation question rather than a one-liner.',
    ],
    keyPoints: [
      'Objects and arrays compare by reference',
      'Flat compare: length plus element-wise `every`',
      '`JSON.stringify` comparison is order-sensitive and lossy',
      'Deep equality must handle `NaN`, `Date`, and array-vs-object',
    ],
    commonMistakes: ['Using `JSON.stringify` comparison as a general solution.'],
    followUps: ['Why is the JSON comparison unreliable?'],
  },

  {
    id: 'iv-core-what-is-dom',
    question: 'What is the DOM?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.BROWSER,
    topicIds: ['dom', 'js-runtime'],
    relatedLessons: ['l-m17-01'],
    shortAnswer:
      'A tree of objects representing the parsed HTML document, exposed to JavaScript so it can be read and modified. It is a browser API, not part of the JavaScript language — which is why the same JavaScript runs in Node without a DOM.',
    deepAnswer: [
      'The browser parses HTML into a tree of nodes and exposes that tree as objects. Changing those objects changes what is rendered.',
      'The distinction that matters: the DOM is provided by the **host environment**, not by the language. `document` does not exist in Node, and `Array` is not part of the DOM. That framing explains why the same code needs jsdom to run DOM tests outside a browser.',
      'The HTML source and the live DOM are not the same thing — the DOM reflects the current state after scripts have run, which is why "view source" and the Elements panel can differ.',
      'DOM operations are comparatively expensive because they can trigger style recalculation, layout and paint, which is why batching changes and minimising layout-forcing reads matters for performance.',
    ],
    keyPoints: [
      'A tree of objects representing the parsed document',
      'A browser API, not part of the JavaScript language',
      'The live DOM differs from the original HTML source',
      'Operations can trigger layout and paint, so batching matters',
    ],
    commonMistakes: ['Describing the DOM as part of JavaScript itself.'],
    followUps: ['Why does `document` not exist in Node?'],
  },

  {
    id: 'iv-core-git-workflow',
    question: 'Walk me through your workflow for shipping a small change.',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.SCENARIO,
    topicIds: ['tooling'],
    relatedLessons: ['l-m45-01'],
    shortAnswer:
      'Branch from main, make a focused change, run the tests and linter locally, commit with a message explaining **why**, open a pull request with context for the reviewer, address feedback, and merge once it is green and approved.',
    deepAnswer: [
      'Work on a branch rather than main, so the change can be reviewed and reverted as a unit.',
      'Keep the change focused. Mixing a refactor with a feature makes review much harder and is one of the most common reasons a PR sits unreviewed.',
      'Run the checks locally first — tests, lint, type check — rather than using CI as the first feedback loop.',
      'Commit messages should explain **why**, not restate the diff. "Fix crash when cart is empty" is useful; "update cart.js" is not. The reader is usually you, six months later, running `git blame` on a confusing line.',
      'A PR description with the problem, the approach, and anything you were unsure about makes review faster and better. Screenshots for UI changes, and a note on how you tested it.',
      'After merging, verify it actually works in the deployed environment rather than assuming.',
    ],
    keyPoints: [
      'Branch; keep the change focused',
      'Run tests and lint locally before pushing',
      'Commit messages explain why, not what',
      'PR description gives the reviewer context',
      'Verify after deploy',
    ],
    commonMistakes: ['Mixing unrelated changes into one PR.'],
    followUps: ['What makes a pull request easy to review?'],
  },

  {
    id: 'iv-core-why-tests',
    question: 'Why write automated tests at all?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.TESTING,
    topicIds: ['testing'],
    relatedLessons: ['l-m42-01'],
    shortAnswer:
      'They let you change code confidently. Manual checking does not scale and is not repeatable; a test suite tells you within seconds whether a change broke something, which is what makes refactoring possible at all.',
    deepAnswer: [
      'The primary value is **enabling change**, not catching the original bug. Without tests, every refactor is a gamble, so refactoring stops happening and the code decays.',
      'They also document intent: a well-named test states what the code is supposed to do more reliably than a comment, because it fails when it goes out of date.',
      'And they shorten the feedback loop. Finding a bug in a test run costs seconds; finding it in production costs an incident.',
      'The caveat worth stating: tests have a cost, and badly written ones have negative value. A test coupled to implementation fails on harmless refactors, which discourages exactly the behaviour tests are supposed to enable. Testing behaviour rather than implementation is what makes the investment pay off.',
    ],
    keyPoints: [
      'Primary value: confidence to change code',
      'Tests document intent and cannot silently go stale',
      'Feedback in seconds rather than in production',
      'Badly written, implementation-coupled tests have negative value',
    ],
    commonMistakes: ['Justifying tests purely by coverage percentage.'],
    followUps: ['When does a test have negative value?'],
  },

  {
    id: 'iv-core-var-hoisting-function',
    question: 'Can you call a function before it is defined?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['hoisting', 'functions'],
    relatedLessons: ['l-m08-01'],
    shortAnswer:
      'A function **declaration**, yes — it is hoisted and fully initialised before any code runs. A function **expression** assigned to `const` or `let`, no — the binding is in the TDZ and calling it throws a `ReferenceError`.',
    deepAnswer: [
      '`function greet() {}` is created when the scope is entered, so calling it on an earlier line works. This is the only form of hoisting where the value, not just the binding, is available early.',
      '`const greet = function () {}` or an arrow follows the variable\'s rules: the binding exists but is uninitialised until that line runs, so an earlier call throws `ReferenceError: Cannot access \'greet\' before initialization`.',
      '`var greet = function () {}` gives a different error — `TypeError: greet is not a function` — because the binding holds `undefined` rather than being uninitialised. Being able to distinguish those two errors is a good signal.',
      'Class declarations behave like `let`: hoisted but in the TDZ.',
    ],
    keyPoints: [
      'Declarations: hoisted and initialised — callable early',
      '`const`/`let` expressions: TDZ → `ReferenceError`',
      '`var` expressions: `undefined` → `TypeError: not a function`',
      'Classes behave like `let`',
    ],
    commonMistakes: ['Treating all functions as hoisted.'],
    followUps: ['What error does the `var` version give, and why is it different?'],
  },

  {
    id: 'iv-core-event-object',
    question: 'What is the event object, and what is it useful for?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.BROWSER,
    topicIds: ['events', 'dom'],
    relatedLessons: ['l-m19-01'],
    shortAnswer:
      'The object the browser passes to every handler, describing what happened. The most-used members are `target` (where it originated), `currentTarget` (where the listener is), `preventDefault()` and `stopPropagation()`, plus type-specific details like `key` or `clientX`.',
    deepAnswer: [
      '`target` versus `currentTarget` is the distinction that matters, and it is what makes event delegation work: `target` is the deepest element involved, `currentTarget` is the element whose listener is running.',
      '`preventDefault()` cancels the browser\'s default action — following a link, submitting a form, checking a checkbox. It does **not** stop the event propagating.',
      '`stopPropagation()` stops the event travelling further up (or down) the tree. It should be used sparingly, because it can silently break a delegated handler on an ancestor.',
      'Type-specific properties are worth knowing: `event.key` for keyboard events (preferred over the deprecated `keyCode`), `clientX`/`clientY` for pointer position, and `event.dataTransfer` for drag events.',
    ],
    keyPoints: [
      '`target` = origin; `currentTarget` = listener\'s element',
      '`preventDefault` cancels the default action only',
      '`stopPropagation` halts travel — can break ancestor delegation',
      '`event.key` rather than the deprecated `keyCode`',
    ],
    commonMistakes: ['Conflating `preventDefault` with `stopPropagation`.'],
    followUps: ['Which do you use in a delegated handler, and why?'],
  },

  {
    id: 'iv-core-form-submit',
    question: 'How do you handle a form submission without the page reloading?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.BROWSER,
    topicIds: ['forms', 'events', 'dom'],
    relatedLessons: ['l-m20-01'],
    shortAnswer:
      'Listen for the `submit` event on the `<form>` and call `event.preventDefault()`. Listen on the form rather than the button, so keyboard submission with Enter is handled too.',
    deepAnswer: [
      'The default action of a `submit` event is a full page navigation. `preventDefault()` cancels it so you can handle the data in JavaScript.',
      'Listening on the **form**, not the submit button, is the detail that matters: pressing Enter in a text field submits the form without ever clicking the button, so a click handler on the button misses it entirely — and that path is how many keyboard users submit.',
      'Keep the form a real `<form>` with a real submit button rather than a `<div>` with a click handler: you get Enter submission, native validation and correct semantics for assistive technology for free.',
      '`new FormData(form)` collects the values, though it omits unchecked checkboxes and stringifies everything, so reading `form.elements` directly is often better when you need typed or boolean values.',
    ],
    keyPoints: [
      'Listen for `submit` on the form; call `preventDefault()`',
      'Listening on the button misses Enter-key submission',
      'A real `<form>` gives validation and semantics free',
      '`FormData` omits unchecked checkboxes and stringifies values',
    ],
    commonMistakes: ['Attaching a click handler to the submit button instead.'],
    followUps: ['Why does listening on the button miss some submissions?'],
  },

  {
    id: 'iv-core-async-why',
    question: 'Why does JavaScript need asynchronous programming at all?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['async-foundations', 'event-loop'],
    relatedLessons: ['l-m23-01'],
    shortAnswer:
      'Because there is a single thread shared with rendering and user input. If a network request blocked that thread, the page would freeze — nothing would paint, scroll or respond — until it finished.',
    deepAnswer: [
      'The main thread runs your JavaScript, style calculation, layout, painting and event handling. Anything that occupies it blocks all of those.',
      'A network request can take hundreds of milliseconds or seconds. Blocking for that long would make the page completely unresponsive, so I/O is handed to the host environment and your callback is scheduled for when it completes.',
      'This is why `alert()` and a long synchronous loop freeze the tab — they hold the thread. The asynchronous model exists specifically to avoid that.',
      'It also explains why "make it async" does not help a slow **computation**: `await` does not move work off the thread. For CPU-bound work you need a Web Worker, which is a genuinely separate thread.',
    ],
    keyPoints: [
      'One thread shared with rendering and input',
      'Blocking I/O would freeze the page entirely',
      'I/O is delegated to the host; callbacks are scheduled',
      '`async` does not help CPU-bound work — that needs a Worker',
    ],
    commonMistakes: ['Believing `async` moves work to another thread.'],
    followUps: ['Does wrapping a slow loop in a promise stop it blocking?'],
  },

  {
    id: 'iv-core-const-object-mutation-output',
    question: 'Mutating versus reassigning a `const` — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.OUTPUT,
    topicIds: ['variables', 'objects', 'errors'],
    relatedLessons: ['l-m01-01'],
    code:
      'const config = { debug: false };\n' +
      'config.debug = true;\n' +
      'console.log(config.debug);\n' +
      '\n' +
      'try {\n' +
      '  config = { debug: false };\n' +
      '} catch (error) {\n' +
      '  console.log(error.constructor.name);\n' +
      '}',
    options: ['true\nTypeError', 'true\nReferenceError', 'false\nTypeError', 'true\nSyntaxError'],
    correct: 0,
    shortAnswer:
      '`true`, then `TypeError`. `const` prevents reassigning the binding, not mutating the object it points to — so the property change succeeds, and the reassignment throws.',
    deepAnswer: [
      '`config.debug = true` mutates the existing object. The binding still points at the same object, so `const` has nothing to object to, and the log prints `true`.',
      '`config = { ... }` attempts to point the binding at a **different** object. That is exactly what `const` forbids, and it throws `TypeError: Assignment to constant variable`.',
      'The error type is worth getting right: it is a `TypeError`, not a `ReferenceError` (which is for unresolvable names) and not a `SyntaxError` (the code parses fine — the failure is at runtime).',
      'If you genuinely want the object protected, `Object.freeze(config)` prevents property changes — but only at the top level, since freezing is shallow.',
    ],
    keyPoints: [
      '`const` blocks rebinding, not mutation',
      'Property assignment on a `const` object succeeds',
      'Reassignment throws a `TypeError`, not a `ReferenceError`',
      '`Object.freeze` blocks mutation, but only shallowly',
    ],
    commonMistakes: ['Expecting the property assignment to throw.'],
    followUps: ['How would you actually prevent the mutation?'],
  },

  {
    id: 'iv-core-string-methods-output',
    question: 'String methods and immutability — what does this print?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.OUTPUT,
    topicIds: ['strings', 'types'],
    relatedLessons: ['l-m05-01'],
    code:
      'let name = "ada";\n' +
      'name.toUpperCase();\n' +
      'console.log(name);\n' +
      '\n' +
      'name = name.toUpperCase();\n' +
      'console.log(name);\n' +
      'console.log("  pad  ".trim().length);',
    options: ['ada\nADA\n3', 'ADA\nADA\n3', 'ada\nADA\n7', 'ADA\nADA\n7'],
    correct: 0,
    shortAnswer:
      '`ada`, `ADA`, `3`. Strings are immutable, so `toUpperCase()` returns a new string and discarding it changes nothing. Only the assignment on line 5 has any effect. `trim()` removes both leading and trailing whitespace, leaving `"pad"`.',
    deepAnswer: [
      'Line 2 calls `toUpperCase()` and throws the result away. Because strings cannot be modified in place, the original `name` is untouched, so line 3 prints `ada`. This is one of the most common junior bugs.',
      'Line 5 assigns the returned string back, so line 6 prints `ADA`.',
      '`"  pad  ".trim()` gives `"pad"`, whose length is `3`. `trimStart` and `trimEnd` exist if you only want one side.',
      'The general rule to state: every string method returns a new string. If you are not using the return value, the call did nothing.',
    ],
    keyPoints: [
      'Strings are immutable — methods return new strings',
      'Discarding the return value means the call did nothing',
      '`trim` removes whitespace from both ends',
      '`trimStart`/`trimEnd` for one side',
    ],
    commonMistakes: ['Expecting `toUpperCase()` to modify the variable.'],
    followUps: ['Which other methods return new values rather than mutating?'],
  },
];

export default questions;
