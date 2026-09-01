import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Functions, objects, scope, closures and `this`.
 *
 * These five are where compressed explanations most often become false, so the
 * wording here is deliberately precise: bindings rather than snapshots, call
 * site rather than "the object", TDZ rather than "not hoisted".
 */

export default [
  {
    id: 'cs-objects',
    slug: 'objects',
    title: 'Objects',
    category: C.FUNCTIONS,
    icon: 'data_object',
    aliases: ['object', 'destructuring', 'spread object', 'Object.keys', 'freeze', 'shallow copy'],
    topicIds: ['objects', 'object-utilities', 'copying'],
    description: 'Access, iterate, copy and lock down — and the shallow-versus-deep line that causes most shared-state bugs.',
    groups: [
      {
        title: 'Access',
        kind: G.SNIPPETS,
        entries: [
          { code: 'user.name          // dot: fixed, known key\nuser["name"]       // bracket: any string\nuser[key]          // bracket: dynamic key', description: 'Bracket notation is required for computed and non-identifier keys.' },
          { code: 'const { name, age = 0, id: userId } = user;\nconst { a: { b } } = nested;   // binds b only', description: 'Rename with `:`, default with `=`. Defaults fire **only for `undefined`**, never `null`.' },
          { code: 'const { password, ...safe } = user;', description: 'Object rest — the idiomatic way to omit a key.' },
          { code: 'user?.profile?.city\nuser.save?.()', description: 'Short-circuits to `undefined` for `null`/`undefined` only.' },
        ],
      },
      {
        title: 'Iterate',
        kind: G.TABLE,
        columns: ['Call', 'Returns', 'Includes'],
        rows: [
          ['`Object.keys(o)`', '`string[]`', 'own, enumerable, string keys'],
          ['`Object.values(o)`', 'values', 'same filter'],
          ['`Object.entries(o)`', '`[key, value][]`', 'same filter'],
          ['`Object.fromEntries(p)`', 'object', 'inverse of `entries`'],
          ['`for...in`', 'keys', '**also inherited** — rarely what you want'],
          ['`Reflect.ownKeys(o)`', 'keys', 'includes symbols and non-enumerables'],
        ],
        note: 'Key order is specified: integer-like keys first in ascending order, then string keys in insertion order. An object keyed by numeric ids comes back **sorted**, not in insertion order — use a `Map` if order matters.',
      },
      {
        title: 'Copy and merge — all shallow',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const merged = { ...defaults, ...options };', description: 'Later wins. Does not mutate anything — prefer this over `Object.assign`.' },
          { code: 'Object.assign(target, source);  // MUTATES target\nObject.assign({}, a, b);        // safe', description: '`Object.assign(defaults, options)` corrupts a shared `defaults` object.' },
          { code: 'const copy = { ...original };\ncopy.nested === original.nested;  // true', description: 'Shallow: nested objects are **shared**. This is the "my state changed even though I copied it" bug.' },
          { code: 'structuredClone(data)', description: 'Real deep copy — cycles, `Map`, `Set`, `Date`. Throws on functions; **loses class prototypes**.' },
        ],
      },
      {
        title: 'Existence checks',
        kind: G.TABLE,
        columns: ['Check', 'Own?', 'Inherited?', 'Present but `undefined`?'],
        rows: [
          ['`Object.hasOwn(o, k)`', '✓', '✗', 'reports `true`'],
          ['`"k" in o`', '✓', '**✓**', 'reports `true`'],
          ['`o.k !== undefined`', '✓', '✓', '**reports `false`** ✗'],
        ],
        note: '`Object.hasOwn` replaces `o.hasOwnProperty(k)`, which breaks on `Object.create(null)` objects and can be shadowed by a data property of the same name.',
      },
      {
        title: 'Locking down',
        kind: G.RULES,
        items: [
          '`Object.freeze(o)` — no add, delete or change. **Shallow: `o.nested.x = 1` still works.**',
          '`Object.seal(o)` — change existing values, but no add or delete.',
          '`Object.preventExtensions(o)` — no add; change and delete still allowed.',
          'All three fail **silently in sloppy mode** and throw a `TypeError` in strict mode. Modules and class bodies are always strict.',
          'There is no `unfreeze`.',
        ],
      },
      {
        title: 'Traps',
        kind: G.RULES,
        items: [
          'Property keys are always strings or symbols — `{ 1: "a" }` stores the key `"1"`.',
          'Objects compare by **reference**: `{a:1} === {a:1}` is `false`. There is no built-in structural equality.',
          '`JSON.stringify` is not a safe equality or hashing function — key order and `undefined` handling are not canonical.',
          'For keys that come from **data** rather than from your code, use a `Map` — a plain object inherits `constructor`, `toString` and `__proto__`.',
        ],
      },
    ],
    relatedLessons: ['l-m14-05', 'l-m15-01', 'l-m15-04'],
    relatedReference: ['ref-object-entries', 'ref-object-assign', 'ref-object-freeze', 'ref-object-hasown', 'ref-structuredclone'],
    relatedChallenges: ['ch-obj-pick-omit', 'ch-obj-deep-merge', 'ch-obj-invert'],
  },

  {
    id: 'cs-functions',
    slug: 'functions',
    title: 'Functions',
    category: C.FUNCTIONS,
    icon: 'function',
    aliases: ['function', 'arrow function', 'callback', 'higher order', 'parameters', 'default parameters'],
    topicIds: ['functions', 'arrow-functions', 'higher-order'],
    description: 'Declarations, expressions and arrows — how they differ, what parameters really do, and where arrows are wrong.',
    groups: [
      {
        title: 'Three ways to write one',
        kind: G.TABLE,
        columns: ['', 'Declaration', 'Expression', 'Arrow'],
        rows: [
          ['Syntax', '`function f() {}`', '`const f = function () {}`', '`const f = () => {}`'],
          ['Usable before its line', '**yes**', 'no — `TypeError`', 'no — TDZ'],
          ['Own `this`', 'yes (call site)', 'yes (call site)', '**no — lexical**'],
          ['Own `arguments`', 'yes', 'yes', '**no**'],
          ['`new`-able', 'yes', 'yes', '**no**'],
          ['Can be a method', 'yes', 'yes', '**no**'],
        ],
      },
      {
        title: 'Arrow bodies',
        kind: G.SNIPPETS,
        entries: [
          { code: '(a, b) => a + b        // implicit return\nn => n * 2             // one parameter, no parens\n() => ({ ok: true })   // object literal needs parens', description: 'Without the parentheses the braces are parsed as a block and the result is `undefined`.' },
          { code: 'const f = (n) => { n * 2; };\nf(4); // undefined ✗', description: 'A block body needs an explicit `return`.' },
        ],
      },
      {
        title: 'Parameters',
        kind: G.SNIPPETS,
        entries: [
          { code: 'function f(a, b = a * 2) {}', description: 'Defaults are evaluated **per call**, left to right, and may reference earlier parameters — never later ones.' },
          { code: 'function push(item, list = []) {}', description: 'A fresh array each call. Unlike Python, mutable defaults are **not** shared.' },
          { code: 'f(undefined)  // default applies\nf(null)       // default does NOT apply', description: 'Defaults fire only for `undefined`.' },
          { code: 'function sum(label, ...numbers) {}', description: 'Rest gives a **real array**, must be last, and is excluded from `fn.length`.' },
          { code: 'const opts = ({ retries = 3 } = {}) => retries;\nopts(); // 3', description: 'The trailing `= {}` is what lets it be called with no arguments.' },
        ],
      },
      {
        title: 'Higher-order',
        kind: G.SNIPPETS,
        entries: [
          { code: 'arr.map(fn)                  // takes a function\nconst debounced = debounce(fn);  // returns one', description: 'Functions are first-class values: store, pass, return them.' },
          { code: 'function once(fn) {\n  let called = false, result;\n  return (...args) => {\n    if (!called) { called = true; result = fn(...args); }\n    return result;\n  };\n}', description: 'A closure over `called` — the standard decorator shape.' },
        ],
      },
      {
        title: 'Return',
        kind: G.RULES,
        items: [
          'No `return` means the function returns `undefined`. `console.log` is **not** a return.',
          'A `return` inside a `finally` block **overrides** the pending return and swallows an in-flight exception.',
          'A function can only return one value — return an object or array to return several.',
          '`fn.length` counts parameters **before** the first default or rest parameter.',
        ],
      },
      {
        title: 'Where an arrow is wrong',
        kind: G.RULES,
        items: [
          'Object methods and prototype methods — the caller is supposed to supply `this`.',
          'Anything needing `new`, `arguments`, or a `prototype`.',
          'Anything that must be reboundable — `call`, `apply` and `bind` cannot override a lexical `this`.',
          'Arrows are **right** for callbacks inside a method: `setTimeout(() => this.tick(), 1000)`.',
        ],
      },
    ],
    relatedLessons: ['l-m08-05', 'l-m09-02', 'l-m09-03'],
    relatedReference: ['ref-syntax-arrow', 'ref-syntax-defaultparams', 'ref-syntax-rest', 'ref-function-bind'],
    relatedChallenges: ['ch-fn-once', 'ch-fn-curry', 'ch-fn-pipe'],
  },

  {
    id: 'cs-scope',
    slug: 'scope-hoisting-tdz',
    title: 'Scope, Hoisting & the TDZ',
    category: C.LANGUAGE,
    icon: 'layers',
    aliases: ['scope', 'hoisting', 'tdz', 'temporal dead zone', 'shadowing', 'scope chain'],
    topicIds: ['scope', 'hoisting', 'execution-context'],
    description: 'What is created when a scope is entered, what can be read before its line, and why the TDZ exists.',
    groups: [
      {
        title: 'Kinds of scope',
        kind: G.RULES,
        items: [
          '**Global** — outside every function and block. In a module, top-level `this` is `undefined`, not the global object.',
          '**Function** — `var`, parameters, and the function body.',
          '**Block** — any `{ }`. Holds `let`, `const`, `class`, and function declarations in strict mode.',
          '**Lexical**: scope is decided by where code is *written*, not by where it is called from. The one exception is `this`.',
          '**Scope chain**: an unresolved name is looked up outward through enclosing scopes, then fails with a `ReferenceError`.',
        ],
      },
      {
        title: 'What happens when a scope is entered',
        kind: G.TABLE,
        columns: ['Declared with', 'Binding created', 'Initial value', 'Read before its line'],
        rows: [
          ['`function f(){}`', 'yes', 'the **whole function**', '✓ works'],
          ['`var x`', 'yes', '`undefined`', '`undefined` — no error'],
          ['`let x`', 'yes', '*none*', '**`ReferenceError`** (TDZ)'],
          ['`const x`', 'yes', '*none*', '**`ReferenceError`** (TDZ)'],
          ['`class X {}`', 'yes', '*none*', '**`ReferenceError`** (TDZ)'],
        ],
        note: 'All of them participate in declaration instantiation. `let` and `const` simply cannot be **accessed** until their declaration executes — that window is the temporal dead zone. Nothing is physically moved to the top of the file.',
      },
      {
        title: 'The TDZ in practice',
        kind: G.SNIPPETS,
        entries: [
          { code: 'console.log(typeof neverDeclared); // "undefined"\nconsole.log(typeof later);         // ReferenceError\nlet later = 1;', description: '`typeof` is safe for names that do not exist at all — **not** for a `let` in its TDZ.' },
          { code: 'console.log(v); // undefined — no error\nvar v = 1;', description: 'Exactly the silent behaviour the TDZ was designed to replace with a loud one.' },
        ],
      },
      {
        title: 'Shadowing',
        kind: G.SNIPPETS,
        entries: [
          { code: 'let x = "outer";\n{\n  let x = "inner"; // shadows, does not overwrite\n}', description: 'A new binding in the inner scope. The outer one is untouched.' },
          { code: '{\n  console.log(x); // ReferenceError, not "outer"\n  let x = 1;\n}', description: 'The inner binding already exists — it is simply in its TDZ.' },
        ],
      },
      {
        title: 'Interview notes',
        kind: G.RULES,
        items: [
          'Say "`let` and `const` are hoisted but uninitialised", not "`let` is not hoisted" — the binding exists, which is exactly why shadowing throws.',
          'Function **declarations** are usable before their line in their scope. Function **expressions** assigned to a `var` are not — calling one early is a `TypeError`, not a `ReferenceError`.',
          'Assigning to an undeclared name creates a global in sloppy mode and throws in strict mode.',
          '`for (let i …)` creates a **fresh binding per iteration**; `for (var i …)` creates one shared binding.',
        ],
      },
    ],
    relatedLessons: ['l-m10-01', 'l-m10-03', 'l-m10-04'],
    relatedReference: ['ref-globalthis', 'ref-syntax-class'],
    relatedChallenges: ['ch-fn-once'],
  },

  {
    id: 'cs-closures',
    slug: 'closures',
    title: 'Closures',
    category: C.LANGUAGE,
    icon: 'lock',
    aliases: ['closure', 'private state', 'factory function', 'loop closure', 'stale closure'],
    topicIds: ['closures', 'functions'],
    description: 'One idea, four uses, two traps — including the loop bug and what closures actually keep alive.',
    groups: [
      {
        title: 'The mental model',
        kind: G.RULES,
        items: [
          'A closure is a **function together with the lexical environment it was created in**.',
          'It captures the **binding**, not a copy of the value — so later changes are visible.',
          'Every call to an outer function creates a **new** environment, so each returned function gets its own state.',
          'The captured variable is genuinely private: it is not a property and cannot be read from outside.',
        ],
      },
      {
        title: 'Private state',
        kind: G.SNIPPETS,
        entries: [
          { code: 'function makeCounter() {\n  let count = 0;\n  return {\n    inc: () => ++count,\n    get: () => count,\n  };\n}\n\nconst c = makeCounter();\nc.inc();\nc.get();     // 1\nc.count;     // undefined — truly private', description: 'The factory pattern: independent state per call, no `this`, nothing to bind.' },
        ],
      },
      {
        title: 'The loop trap',
        kind: G.SNIPPETS,
        entries: [
          { code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}\n// 3, 3, 3', description: 'One shared `i`. By the time the callbacks run, the loop has finished and `i` is `3`.' },
          { code: 'for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}\n// 0, 1, 2', description: '`let` creates a fresh binding per iteration — the built-in version of the old IIFE workaround.' },
        ],
      },
      {
        title: 'The stale-closure trap',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const count = getCount();          // read once ✗\nbtn.onclick = () => log(count);\n\nbtn.onclick = () => log(getCount()); // read on click ✓', description: 'Capture the **source**, not a snapshot. This is exactly the React stale-closure problem.' },
        ],
      },
      {
        title: 'Memory — stated accurately',
        kind: G.RULES,
        items: [
          'A closure keeps its captured environment reachable for as long as the function itself is reachable.',
          'So a **long-lived** closure — an uncleared listener, timer or subscription — can retain data that would otherwise be collected.',
          'Do **not** say "closures cause memory leaks". The leak is an uncleaned-up reference; the closure is only how the reference is held.',
          'The fix is teardown: `removeEventListener`, `clearInterval`, or an `AbortController` signal.',
        ],
      },
      {
        title: 'Where you already use them',
        kind: G.RULES,
        items: [
          '`debounce` / `throttle` — the pending timer id lives in the closure.',
          '`memoize` — the cache lives in the closure.',
          '`once` — the `called` flag lives in the closure.',
          'Module pattern, event handlers, and every callback that reads an outer variable.',
        ],
      },
    ],
    relatedLessons: ['l-m32-01', 'l-m32-02', 'l-m32-03'],
    relatedReference: ['ref-syntax-arrow', 'ref-settimeout'],
    relatedChallenges: ['ch-fn-memoize', 'ch-fn-debounce', 'ch-fn-partial'],
  },

  {
    id: 'cs-this',
    slug: 'this-call-apply-bind',
    title: 'this, call, apply & bind',
    category: C.FUNCTIONS,
    icon: 'my_location',
    aliases: ['this', 'call apply bind', 'binding', 'lost this', 'lexical this'],
    topicIds: ['this', 'functions'],
    description: 'One rule, six call shapes, and the three methods that change what `this` is — or cannot.',
    groups: [
      {
        title: 'The rule',
        kind: G.RULES,
        items: [
          'For a **normal function**, `this` is decided by **how the function is called**, not where it is defined.',
          'For an **arrow function**, there is no own `this` at all — it resolves lexically to the enclosing scope, permanently.',
          'Read the call site, then apply the table below.',
        ],
      },
      {
        title: 'What `this` is, by call shape',
        kind: G.TABLE,
        columns: ['Call shape', '`this` is'],
        rows: [
          ['`obj.method()`', '`obj` — the receiver before the dot'],
          ['`fn()` (plain call)', '`undefined` in strict mode; the global object in sloppy mode'],
          ['`new Fn()`', 'the newly created instance'],
          ['`fn.call(x)` / `fn.apply(x)`', '`x`'],
          ['`fn.bind(x)()`', '`x` — fixed permanently at bind time'],
          ['arrow function', 'the enclosing scope’s `this` — **unaffected by all of the above**'],
          ['`el.addEventListener("c", fn)`', '`el`, if `fn` is a normal function'],
          ['class method', 'the instance — but **only if called on it**'],
        ],
      },
      {
        title: 'call / apply / bind',
        kind: G.TABLE,
        columns: ['', 'Invokes now?', 'Arguments', 'Returns'],
        rows: [
          ['`call`', '**yes**', 'individually: `fn.call(o, a, b)`', 'the call result'],
          ['`apply`', '**yes**', 'as an array: `fn.apply(o, [a, b])`', 'the call result'],
          ['`bind`', '**no**', 'pre-filled: `fn.bind(o, a)`', 'a **new function**'],
        ],
        note: '**a**pply takes an **a**rray. `bind` is the only one that does not invoke.',
      },
      {
        title: 'The classic bug',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const inc = counter.inc;\ninc(); // TypeError: cannot read "n" of undefined', description: 'Assigning a method copies the function; the object does not travel with it.' },
          { code: 'const inc = counter.inc.bind(counter);   // ✓\nsetTimeout(() => counter.inc(), 100);    // ✓', description: 'Bind it, or wrap it in an arrow that calls it as a method.' },
          { code: 'el.removeEventListener("click", this.h.bind(this)); // ✗', description: '`bind` returns a **new** function every call, so this removes nothing. Store the bound reference once.' },
        ],
      },
      {
        title: 'Never say',
        kind: G.RULES,
        items: [
          '✗ "`this` refers to the object" — it refers to whatever the call site supplies, which is often nothing.',
          '✗ "arrow functions bind `this` to their object" — they have **no** `this` and inherit the enclosing one.',
          '✗ "`bind` calls the function" — it returns a new one.',
          'A function that appears to ignore `bind` is almost always an arrow. Rebinding an already-bound function also cannot change the receiver — the first bind wins.',
        ],
      },
    ],
    relatedLessons: ['l-m29-01', 'l-m29-02', 'l-m29-03'],
    relatedReference: ['ref-function-call', 'ref-function-apply', 'ref-function-bind', 'ref-syntax-arrow'],
    relatedChallenges: ['ch-cls-event-emitter'],
  },
];
