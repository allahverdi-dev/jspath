import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Language-core cheat sheets.
 *
 * These are revision aids, not lessons: every claim is compressed to the
 * shortest form that is still *true*. Where a short form would be false — "let
 * is not hoisted", "const objects cannot change" — the longer accurate wording
 * wins.
 */

export default [
  {
    id: 'cs-fundamentals',
    slug: 'fundamentals-types-coercion',
    title: 'Fundamentals, Types & Coercion',
    category: C.LANGUAGE,
    icon: 'foundation',
    aliases: ['types', 'primitives', 'falsy', 'coercion', 'var let const', 'equality', 'typeof'],
    topicIds: ['variables', 'types', 'coercion', 'operators', 'control-flow'],
    description: 'Declarations, the seven primitives, falsy values, equality, and the coercion traps that actually cost time.',
    groups: [
      {
        title: 'Declare',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const API_URL = "https://api.example.com";', description: '`const` by default — the binding cannot be reassigned.' },
          { code: 'let count = 0;\ncount += 1;', description: '`let` only when the value genuinely changes.' },
          { code: 'var legacy = 1; // function-scoped, avoid in new code', description: 'Read it in old code; do not write it.' },
        ],
      },
      {
        title: 'var / let / const',
        kind: G.TABLE,
        columns: ['', '`var`', '`let`', '`const`'],
        rows: [
          ['Scope', 'function', 'block', 'block'],
          ['Reassign', 'yes', 'yes', '**no**'],
          ['Redeclare in scope', 'yes', 'no', 'no'],
          ['Before initialisation', '`undefined`', '**TDZ — throws**', '**TDZ — throws**'],
          ['Use it?', 'no', 'when reassigning', '**default**'],
        ],
        note: 'All three are created when the scope is entered. `let` and `const` simply cannot be *read* until their declaration runs — that is the temporal dead zone, not an absence of hoisting.',
      },
      {
        title: 'The seven primitives',
        kind: G.RULES,
        items: [
          '`string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`',
          'Everything else is an object — including arrays and functions.',
          'Primitives are compared **by value**; objects **by reference**.',
          '`typeof null === "object"` is a preserved bug from the first implementation. Test with `value === null`.',
          '`typeof` returns `"function"` for anything callable, and `"object"` for arrays — use `Array.isArray()`.',
        ],
      },
      {
        title: 'Falsy — exactly eight',
        kind: G.SNIPPETS,
        entries: [
          { code: 'false\n0\n-0\n0n\n""\nnull\nundefined\nNaN', description: '**Everything else is truthy**, including `[]`, `{}`, `"0"` and `"false"`.' },
          { code: 'if (arr.length === 0) { /* empty */ }', description: '`if (arr)` is always true — an empty array is truthy.' },
        ],
      },
      {
        title: 'Equality',
        kind: G.TABLE,
        columns: ['Expression', 'Result', 'Why'],
        rows: [
          ['`0 == "0"`', '`true`', '`==` converts the string to a number'],
          ['`0 === "0"`', '`false`', 'different types, no conversion'],
          ['`null == undefined`', '`true`', 'special-cased: they equal each other and nothing else'],
          ['`null === undefined`', '`false`', 'different types'],
          ['`null == 0`', '`false`', 'no numeric conversion for `==`'],
          ['`null >= 0`', '`true`', 'relational operators **do** convert `null` to `0`'],
          ['`NaN === NaN`', '`false`', 'use `Number.isNaN(x)`'],
          ['`Object.is(0, -0)`', '`false`', '`===` says `true`; `Object.is` separates them'],
        ],
        note: 'Use `===`. The `null == undefined` check is the one idiomatic exception, and `value == null` is a compact "is it nullish" test.',
      },
      {
        title: 'Convert on purpose',
        kind: G.SNIPPETS,
        entries: [
          { code: 'Number("42")     // 42\nNumber("12abc")  // NaN\nNumber("")       // 0  ← trap\nNumber(null)     // 0  ← trap', description: 'All-or-nothing. Check for empty input **before** converting a form field.' },
          { code: 'parseInt("42px", 10) // 42 — partial parse\nparseFloat("3.14 is pi") // 3.14', description: 'Always pass the radix. Never `["10","10"].map(parseInt)` — the index becomes the radix.' },
          { code: 'String(null)      // "null"\nString(Symbol("x")) // "Symbol(x)"', description: '`String()` handles every value; `value.toString()` throws on `null`/`undefined`.' },
          { code: 'Boolean("false")  // true\n!!value           // same conversion', description: 'Only the eight falsy values become `false`.' },
        ],
      },
      {
        title: 'The overloaded `+`',
        kind: G.SNIPPETS,
        entries: [
          { code: '1 + "2"   // "12"   concatenates\n"3" - 1   // 2      converts\n[] + {}   // "[object Object]"', description: '`+` concatenates if either side becomes a string. Every other arithmetic operator converts to number.' },
        ],
      },
      {
        title: 'Common traps',
        kind: G.RULES,
        items: [
          '`const` blocks **reassignment of the binding**, not mutation of the object it points at. `const a = []; a.push(1)` is legal.',
          '`0.1 + 0.2 !== 0.3` — all numbers are IEEE-754 doubles. Compare with a tolerance; store money as integer cents.',
          'Integers above `Number.MAX_SAFE_INTEGER` (2^53 − 1) stop being distinguishable. Use `BigInt`, and keep large ids as strings.',
          '`typeof undeclaredName` is `"undefined"` and does not throw — but a `let` in its TDZ **does** throw, even through `typeof`.',
        ],
      },
    ],
    relatedLessons: ['l-m01-06', 'l-m02-01', 'l-m03-05'],
    relatedReference: ['ref-number-ctor', 'ref-boolean', 'ref-object-is', 'ref-number-isnan'],
    relatedChallenges: ['ch-beg-remove-falsy', 'ch-fund-round-to'],
  },

  {
    id: 'cs-strings',
    slug: 'strings',
    title: 'Strings',
    category: C.DATA,
    icon: 'text_fields',
    aliases: ['string methods', 'slice substring', 'replace', 'split join', 'template literal'],
    topicIds: ['strings'],
    description: 'Search, extract, transform and split — organised by what you are trying to do, with the return values people forget.',
    groups: [
      {
        title: 'Search',
        kind: G.TABLE,
        columns: ['Method', 'Returns', 'Note'],
        rows: [
          ['`includes(s)`', '`boolean`', 'the plain "is it in there" test'],
          ['`startsWith(s)`', '`boolean`', 'second argument is a **start** index'],
          ['`endsWith(s)`', '`boolean`', 'second argument is an **end** index'],
          ['`indexOf(s)`', 'index or **`-1`**', '`-1` is truthy — test `!== -1`'],
          ['`lastIndexOf(s)`', 'index or `-1`', 'searches backwards, index still from the start'],
        ],
      },
      {
        title: 'Extract',
        kind: G.SNIPPETS,
        entries: [
          { code: '"javascript".slice(0, 4)   // "java"\n"javascript".slice(-6)     // "script"\n"javascript".slice(4, 1)   // ""', description: '**Use `slice`.** Negative indices count from the end; a reversed range gives `""`.' },
          { code: '"javascript".substring(4, 1) // "ava" — swaps!\n"javascript".substring(-6)   // whole string', description: '`substring` clamps negatives to `0` and silently swaps reversed arguments — it can hide a bug.' },
          { code: '"abc".at(-1)  // "c"\n"abc"[-1]     // undefined', description: '`at()` supports negative indices; bracket access does not.' },
        ],
      },
      {
        title: 'Transform — all return new strings',
        kind: G.SNIPPETS,
        entries: [
          { code: '"a-b-c".replace("-", "+")     // "a+b-c"  ← first only\n"a-b-c".replaceAll("-", "+")  // "a+b+c"', description: 'A **string** pattern in `replace` matches once. `replaceAll` or a `/g` regex replaces every match.' },
          { code: '"  hi  ".trim()       // "hi"\n"  hi  ".trimStart()  // "hi  "', description: 'Trim before validating — `"   "` has a non-zero `length`.' },
          { code: '"7".padStart(3, "0")  // "007"', description: 'Never truncates. Combine with `slice` for a fixed width.' },
          { code: 'name.toLowerCase() === other.toLowerCase()', description: 'Case-insensitive compare. For accents, `localeCompare(b, undefined, { sensitivity: "base" })`.' },
        ],
      },
      {
        title: 'Split and join',
        kind: G.SNIPPETS,
        entries: [
          { code: '"a,b,c".split(",")   // ["a", "b", "c"]\n["a","b"].join("-")  // "a-b"', description: 'Inverse operations. `join` turns `null`/`undefined` into **empty strings**, not `"null"`.' },
          { code: '"".split(",")        // [""]  ← length 1, not 0\n"a,b,c".split(",", 2) // ["a","b"] — "c" is lost', description: '`limit` discards the remainder. To split on the first separator only, use `indexOf` plus two `slice`s.' },
          { code: '[..."ab🙂"].length   // 3\n"ab🙂".split("").length // 4', description: '`split("")` cuts by UTF-16 code unit and breaks emoji. Spread iterates code points.' },
        ],
      },
      {
        title: 'Regex-aware methods',
        kind: G.TABLE,
        columns: ['Method', 'Without `/g`', 'With `/g`'],
        rows: [
          ['`match`', 'rich match array or **`null`**', 'flat array of strings — **groups lost**'],
          ['`matchAll`', '**throws**', 'iterator of full match arrays'],
          ['`search`', 'index or `-1`', '`g` ignored'],
          ['`replace`', 'first match', 'every match'],
        ],
        note: '`match` returns `null` when nothing matches — check before iterating. Prefer `matchAll` when you need every match *and* its capture groups.',
      },
      {
        title: 'Remember',
        kind: G.RULES,
        items: [
          'Strings are **immutable** — every method returns a new string. `s.toUpperCase()` alone does nothing.',
          '`length` counts UTF-16 code units, so an emoji counts as 2.',
          '`$&`, `$1` and `$<name>` are special inside a `replace` replacement string — use a replacer **function** for untrusted text.',
          'A template literal escapes nothing. It is exactly as unsafe as concatenation when the result reaches `innerHTML`.',
        ],
      },
    ],
    relatedLessons: ['l-m05-04', 'l-m05-05', 'l-m05-06'],
    relatedReference: ['ref-string-slice', 'ref-string-replace', 'ref-string-split', 'ref-string-includes'],
    relatedChallenges: ['ch-str-slugify', 'ch-str-truncate', 'ch-str-word-frequency'],
  },

  {
    id: 'cs-arrays',
    slug: 'arrays',
    title: 'Arrays',
    category: C.DATA,
    icon: 'data_array',
    aliases: ['array', 'mutation', 'splice slice', 'push pop', 'copy array'],
    topicIds: ['arrays', 'copying'],
    description: 'Create, access, add, remove and copy — with the mutation matrix that decides which method is safe to use on shared state.',
    groups: [
      {
        title: 'Mutation matrix',
        kind: G.TABLE,
        columns: ['Method', 'Mutates', 'Returns'],
        rows: [
          ['`push(x)`', '**Yes**', 'new `length`'],
          ['`pop()`', '**Yes**', 'removed element, or `undefined`'],
          ['`shift()`', '**Yes**', 'removed first element — **O(n)**'],
          ['`unshift(x)`', '**Yes**', 'new `length` — **O(n)**'],
          ['`splice(i, n)`', '**Yes**', 'array of **removed** elements'],
          ['`sort(fn)`', '**Yes**', 'the **same** array'],
          ['`reverse()`', '**Yes**', 'the **same** array'],
          ['`fill(v)`', '**Yes**', 'the same array'],
          ['`slice(a, b)`', 'No', 'new array (shallow copy)'],
          ['`concat(x)`', 'No', 'new array'],
          ['`map(fn)`', 'No', 'new array, **same length**'],
          ['`filter(fn)`', 'No', 'new array, possibly empty'],
          ['`flat(d)`', 'No', 'new array'],
          ['`toSorted(fn)`', 'No', 'new sorted array (ES2023)'],
          ['`with(i, v)`', 'No', 'new array with one element replaced'],
        ],
      },
      {
        title: 'Create',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const a = [1, 2, 3];\nArray.from({ length: 3 }, (_, i) => i); // [0, 1, 2]', description: 'The `length` + map form is the idiomatic range.' },
          { code: 'Array(3)          // 3 holes, NOT [undefined × 3]\nArray(3).fill(0)  // [0, 0, 0]\nArray(3).map(() => 0) // still holes ✗', description: 'Holes are skipped by `map`, `forEach`, `filter` and `reduce`.' },
          { code: 'Array(2).fill([])  // same array twice ✗\nArray.from({ length: 2 }, () => []) // distinct ✓', description: '`fill` stores **one reference**; `Array.from` calls the factory per element.' },
        ],
      },
      {
        title: 'Access',
        kind: G.SNIPPETS,
        entries: [
          { code: 'arr[0]\narr.at(-1)     // last element\narr[-1]        // undefined ✗', description: 'Bracket access with a negative index reads a property that does not exist.' },
          { code: 'const [first, ...rest] = arr;\nconst [a, , c] = arr;   // elision skips index 1', description: 'Destructuring works on any iterable.' },
        ],
      },
      {
        title: 'Copy — all shallow',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const copy = [...arr];      // or arr.slice()\ncopy[0] === arr[0];         // true — same objects inside', description: 'A new array, the **same element references**.' },
          { code: 'const deep = structuredClone(data);', description: 'Handles nested objects, cycles, `Map`, `Set`, `Date`. Throws on functions; **does not preserve class prototypes**.' },
        ],
      },
      {
        title: 'Add and remove immutably',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const added   = [...arr, item];\nconst removed = arr.filter((x) => x.id !== id);\nconst updated = arr.with(index, next);', description: 'The patterns to use when other code holds a reference to the array.' },
        ],
      },
      {
        title: 'Traps',
        kind: G.RULES,
        items: [
          '`sort()` with **no comparator sorts as strings** — `[1, 10, 2].sort()` is `[1, 10, 2]`. Use `(a, b) => a - b`.',
          '`sort` and `reverse` return the **same array**, so `const sorted = arr.sort()` leaves `arr` sorted too.',
          '`splice` returns what was **removed**, not the resulting array. `slice` is the non-mutating one — one letter apart.',
          'Removing while looping forwards skips elements. Use `filter`, or iterate backwards.',
          '`arr.length` is writable: `arr.length = 0` empties it in place.',
          '`[] + []` is `""` and `[] == false` is `true`. Never compare arrays with `==` or `===` for contents.',
        ],
      },
    ],
    relatedLessons: ['l-m12-02', 'l-m12-03', 'l-m34-04'],
    relatedReference: ['ref-array-splice', 'ref-array-slice', 'ref-array-sort', 'ref-array-push', 'ref-structuredclone'],
    relatedChallenges: ['ch-arr-chunk', 'ch-arr-rotate', 'ch-arr-partition'],
  },

  {
    id: 'cs-array-methods',
    slug: 'array-methods',
    title: 'Array Methods',
    category: C.DATA,
    icon: 'checklist',
    aliases: ['array methods', 'map filter reduce', 'forEach', 'find some every', 'which array method'],
    topicIds: ['array-methods', 'functional'],
    description: 'Pick the right iteration method in one glance — what each returns, when it short-circuits, and the callback traps.',
    groups: [
      {
        title: 'Choose by what you need',
        kind: G.TABLE,
        columns: ['I need…', 'Use', 'Returns'],
        rows: [
          ['each item, no result', '`forEach`', '`undefined`'],
          ['a transformed array', '`map`', 'new array, **same length**'],
          ['a subset', '`filter`', 'new array, possibly empty'],
          ['**one matching value**', '`find`', 'the element or `undefined`'],
          ['**one matching index**', '`findIndex`', 'index or `-1`'],
          ['the **last** match', '`findLast` / `findLastIndex`', 'element / index'],
          ['"is there any?"', '`some`', 'boolean — `false` for `[]`'],
          ['"are they all?"', '`every`', 'boolean — **`true` for `[]`**'],
          ['one accumulated value', '`reduce`', 'the accumulator'],
          ['map then flatten one level', '`flatMap`', 'new array'],
          ['membership', '`includes`', 'boolean — finds `NaN`'],
        ],
      },
      {
        title: 'Every callback gets three arguments',
        kind: G.SNIPPETS,
        entries: [
          { code: 'arr.map((element, index, array) => …)', description: 'This is why `["10","10"].map(parseInt)` breaks — the index becomes the radix.' },
          { code: 'arr.map((x) => { x * 2 });   // [undefined, …] ✗\narr.map((x) => x * 2);       // ✓', description: 'A block body needs an explicit `return`.' },
        ],
      },
      {
        title: 'reduce',
        kind: G.SNIPPETS,
        entries: [
          { code: 'arr.reduce((acc, cur, i, array) => next, initialValue)', description: '**Always pass `initialValue`.** It fixes the accumulator type and prevents the empty-array throw.' },
          { code: '[].reduce((a, b) => a + b);     // TypeError ✗\n[].reduce((a, b) => a + b, 0);  // 0 ✓', description: 'Empty array with no initial value throws.' },
          { code: '[5].reduce((a, b) => a + b);    // 5 — callback never runs', description: 'Without an initial value the first element *is* the accumulator, so a one-element array skips the callback entirely.' },
          { code: 'items.reduce((acc, x) => {\n  (acc[x.role] ??= []).push(x.name);\n  return acc;\n}, {});', description: 'Grouping. Mutate the local accumulator — **never** `{ ...acc }` each pass, which makes it O(n²).' },
        ],
      },
      {
        title: 'Short-circuiting',
        kind: G.RULES,
        items: [
          '`find`, `findIndex`, `some` and `every` stop as soon as the answer is known.',
          '`map`, `filter`, `forEach` and `reduce` always visit every element.',
          '`forEach` **cannot be exited early** — `return` ends only that callback and `break` is a syntax error. Use `for...of`, or `some` returning `true`.',
          '`filter(...)[0]` scans the whole array and allocates — `find` is the right tool.',
        ],
      },
      {
        title: 'Async traps',
        kind: G.SNIPPETS,
        entries: [
          { code: 'arr.forEach(async (x) => await work(x)); // ✗ waits for nothing', description: '`forEach` discards the promise each callback returns.' },
          { code: 'for (const x of arr) await work(x);      // sequential ✓\nawait Promise.all(arr.map(work));        // concurrent ✓', description: 'Choose deliberately: sequential for dependent work, `Promise.all` for independent work.' },
        ],
      },
      {
        title: 'Chaining',
        kind: G.SNIPPETS,
        entries: [
          { code: 'users\n  .filter((u) => u.active)\n  .map((u) => u.name)\n  .sort((a, b) => a.localeCompare(b));', description: 'Two passes instead of one — almost always the right trade for readability. Collapse into `reduce` only when a profile says so.' },
          { code: '[0, 1, "", "a", null].filter(Boolean); // [1, "a"]', description: 'Removes all falsy values — including `0` and `""`, which are often real data.' },
        ],
      },
    ],
    relatedLessons: ['l-m13-05', 'l-m13-07', 'l-m13-02'],
    relatedReference: ['ref-array-map', 'ref-array-filter', 'ref-array-reduce', 'ref-array-find', 'ref-array-foreach'],
    relatedChallenges: ['ch-arr-group-by', 'ch-arr-zip', 'ch-arr-intersection'],
  },
];
