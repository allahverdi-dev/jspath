import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * RegExp, Map/Set, modern syntax and modules.
 *
 * The Map/Set sheet deliberately avoids the "Map is faster than Object" claim —
 * the real reasons to choose one are key type, ordering and prototype safety,
 * which are decidable facts rather than a benchmark.
 */

export default [
  {
    id: 'cs-regexp',
    slug: 'regexp',
    title: 'Regular Expressions',
    category: C.ENGINEERING,
    icon: 'pattern',
    aliases: ['regex', 'regexp', 'pattern', 'match', 'test', 'capture group', 'flags'],
    topicIds: ['regex', 'strings'],
    description: 'Character classes, quantifiers, groups and flags in four tables — plus which method to call.',
    groups: [
      {
        title: 'Character classes',
        kind: G.TABLE,
        columns: ['Pattern', 'Matches', 'Negation'],
        rows: [
          ['`\\d`', 'a digit `0-9`', '`\\D`'],
          ['`\\w`', 'word char `[A-Za-z0-9_]`', '`\\W`'],
          ['`\\s`', 'whitespace', '`\\S`'],
          ['`.`', 'any char **except newline**', '— (use the `s` flag)'],
          ['`[abc]`', 'one of a, b, c', '`[^abc]`'],
          ['`[a-z]`', 'a range', '`[^a-z]`'],
        ],
      },
      {
        title: 'Anchors & boundaries',
        kind: G.TABLE,
        columns: ['Pattern', 'Means'],
        rows: [
          ['`^`', 'start of string — or of a **line** with the `m` flag'],
          ['`$`', 'end of string — or of a line with `m`'],
          ['`\\b`', 'word boundary'],
          ['`\\B`', 'not a word boundary'],
        ],
      },
      {
        title: 'Quantifiers',
        kind: G.TABLE,
        columns: ['Pattern', 'Repeats', 'Lazy form'],
        rows: [
          ['`*`', '0 or more', '`*?`'],
          ['`+`', '1 or more', '`+?`'],
          ['`?`', '0 or 1 (optional)', '`??`'],
          ['`{n}`', 'exactly n', '—'],
          ['`{n,}`', 'n or more', '`{n,}?`'],
          ['`{n,m}`', 'between n and m', '`{n,m}?`'],
        ],
        note: 'Quantifiers are **greedy** by default — they take as much as possible and back off. A trailing `?` makes them lazy. Nested quantifiers like `(a+)+` can backtrack catastrophically on hostile input.',
      },
      {
        title: 'Groups, alternation, flags',
        kind: G.TABLE,
        columns: ['Syntax', 'Means'],
        rows: [
          ['`(…)`', 'capturing group → `m[1]`'],
          ['`(?:…)`', 'group **without** capturing'],
          ['`(?<name>…)`', 'named group → `m.groups.name`'],
          ['`a|b`', 'alternation'],
          ['`(?=…)` / `(?!…)`', 'lookahead / negative lookahead'],
          ['`g`', 'global — find **all** matches'],
          ['`i`', 'case-insensitive'],
          ['`m`', 'multiline: `^`/`$` match line breaks'],
          ['`s`', 'dotAll: `.` matches newline'],
          ['`u`', 'full Unicode / code-point semantics'],
        ],
      },
      {
        title: 'Which method',
        kind: G.TABLE,
        columns: ['Call', 'Returns', 'Use for'],
        rows: [
          ['`re.test(s)`', 'boolean', '"does it match?"'],
          ['`s.match(re)`', 'match array or **`null`**', 'one rich match (no `g`)'],
          ['`s.match(/…/g)`', 'strings only — **groups lost**', 'all matched text'],
          ['`s.matchAll(/…/g)`', 'iterator of **full** matches', 'all matches **with** groups'],
          ['`s.search(re)`', 'index or `-1`', 'position only'],
          ['`s.replace(re, x)`', 'new string', 'rewriting'],
          ['`re.exec(s)`', 'match array or `null`', 'manual iteration — prefer `matchAll`'],
        ],
      },
      {
        title: 'Traps',
        kind: G.RULES,
        items: [
          'A **`/g` regex is stateful**: `test` and `exec` advance `lastIndex`, so repeated `re.test(s)` alternates `true`/`false`. Never add `g` to a regex used only with `test`, and never share a `/g` regex between call sites.',
          '`s.match(re)` returns **`null`**, not `[]`, when nothing matches — check before iterating.',
          'In a `new RegExp("…")` string, every backslash must be doubled: `"\\\\d"`.',
          '**Escape user input** before interpolating it into a pattern — otherwise `(` throws and `.*` becomes a wildcard.',
          '`$&`, `$1` and `$<name>` are special in a `replace` replacement **string** — use a replacer function for untrusted text.',
          'There is no correct "perfect email regex". Validate roughly with `type="email"`, then confirm by sending a message.',
        ],
      },
    ],
    relatedLessons: ['l-m16-05', 'l-m16-06', 'l-m16-07'],
    relatedReference: ['ref-regexp-ctor', 'ref-regexp-test', 'ref-regexp-exec', 'ref-string-matchall', 'ref-string-replace'],
    relatedChallenges: ['ch-rx-parse-log', 'ch-rx-extract-links', 'ch-rx-escape-and-highlight'],
  },

  {
    id: 'cs-map-set',
    slug: 'map-set',
    title: 'Map & Set',
    category: C.DATA,
    icon: 'account_tree',
    aliases: ['map', 'set', 'weakmap', 'weakset', 'dedupe', 'map vs object'],
    topicIds: ['data-structures'],
    description: 'Keyed collections and unique values — when to pick them over an object or array, and what "weak" really means.',
    groups: [
      {
        title: 'Map',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const m = new Map([["a", 1]]);\nm.set("b", 2).set("c", 3);   // returns the MAP → chainable\nm.get("a");                  // 1, or undefined\nm.has("a");                  // presence test\nm.delete("a");               // true if it existed\nm.size;                      // property, NOT a method\nm.clear();', description: '`set` returns the map; `delete` returns a boolean; `size` is a read-only getter.' },
          { code: 'for (const [key, value] of m) { … }\nm.forEach((value, key) => { … });   // VALUE first!', description: '`for...of` yields `[key, value]`; `forEach` passes `(value, key)` — the reverse.' },
        ],
      },
      {
        title: 'Map vs plain object',
        kind: G.TABLE,
        columns: ['', '`Map`', 'Object'],
        rows: [
          ['Key types', '**any value**', 'string / symbol only'],
          ['`1` vs `"1"`', '**distinct**', 'same key'],
          ['Iteration order', '**insertion**', 'integer-like keys sort first'],
          ['Inherited keys', '**none**', 'from `Object.prototype`'],
          ['Size', '`m.size`', '`Object.keys(o).length`'],
          ['JSON', '**serialises as `{}`**', 'native'],
        ],
        note: 'Choose by **key origin**: keys that come from **data** want a `Map`; a fixed shape written in your code wants an object. Do not choose on a performance claim — pick on key type, ordering and prototype safety.',
      },
      {
        title: 'Set',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const s = new Set([1, 1, 2]);\ns.add(3).add(1);   // returns the SET; duplicate is a no-op\ns.has(2);          // O(1)\ns.size;            // 3', description: 'Membership testing is the point: `Set.has` is O(1) where `array.includes` is O(n).' },
          { code: '[...new Set(array)]  // dedupe, keeps first-occurrence order', description: 'The standard deduplication idiom.' },
          { code: 'new Set([{a:1}, {a:1}]).size;  // 2', description: 'Objects compare **by reference** — a `Set` does not deduplicate structurally. Key a `Map` by an id instead.' },
        ],
      },
      {
        title: 'Key equality: SameValueZero',
        kind: G.RULES,
        items: [
          '`===` with one change: **`NaN` equals itself**, so `new Set([NaN, NaN]).size` is `1`.',
          '`0` and `-0` are the **same** key.',
          'No coercion: `1` and `"1"` are different keys.',
          'Objects match by reference only.',
          '(`Object.is` differs on exactly one point — it treats `0` and `-0` as different.)',
        ],
      },
      {
        title: 'WeakMap & WeakSet',
        kind: G.RULES,
        items: [
          'Keys **must be objects** — a primitive throws a `TypeError`.',
          'Keys are held **weakly**: an entry does not stop its key being collected. That is the entire purpose — associating data with an object you do not own, without keeping it alive.',
          '**Not iterable, no `size`, no `clear`.** Only `get`, `set`, `has`, `delete`. This is required by the specification, because iteration would make collection timing observable.',
          'So you **cannot** test that an entry was collected, and nothing guarantees **when** — or whether — it happens. Never write code or a test that depends on it.',
          'Typical uses: per-object caches, private instance state, "already processed" marks.',
        ],
      },
      {
        title: 'Converting',
        kind: G.SNIPPETS,
        entries: [
          { code: 'new Map(Object.entries(obj));   // object → Map\nObject.fromEntries(map);        // Map → object (keys stringified)\n[...map];                       // → [[k, v], …]\n[...set];                       // → array', description: '`Object.fromEntries` stringifies keys and drops duplicates that differed only by type.' },
        ],
      },
    ],
    relatedLessons: ['l-m34-01', 'l-m34-02', 'l-m34-03'],
    relatedReference: ['ref-map-ctor', 'ref-map-get', 'ref-set-ctor', 'ref-weakmap', 'ref-map-size'],
    relatedChallenges: ['ch-ds-lru', 'ch-adv-default-map', 'ch-arr-intersection'],
  },

  {
    id: 'cs-modern-syntax',
    slug: 'modern-javascript',
    title: 'Modern JavaScript Syntax',
    category: C.LANGUAGE,
    icon: 'auto_awesome',
    aliases: ['modern javascript', 'es6', 'destructuring', 'spread', 'optional chaining', 'nullish', 'template literal'],
    topicIds: ['modern-js', 'destructuring', 'operators'],
    description: 'The syntax that shows up in every codebase — destructuring, spread/rest, `?.`, `??` and logical assignment.',
    groups: [
      {
        title: 'Template literals',
        kind: G.SNIPPETS,
        entries: [
          { code: '`${user.name} has ${n} item${n === 1 ? "" : "s"}`', description: 'Any expression inside `${}`, real line breaks, no `\\n` escapes.' },
          { code: 'tag`Hello ${name}`', description: 'A tagged template receives the literal parts and the values **separately**, which is what allows safe escaping. A plain template literal escapes **nothing**.' },
        ],
      },
      {
        title: 'Destructuring',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const { name, age = 0, id: userId } = user;\nconst [first, , third = 9, ...rest] = arr;\nconst { password, ...safe } = user;', description: 'Rename with `:`, default with `=`, skip with an elision, collect with `...`.' },
          { code: 'const { a } = null;        // TypeError ✗\nconst { a } = maybe ?? {}; // ✓', description: 'Destructuring `null`/`undefined` throws.' },
          { code: 'const { x = 1 } = { x: null };  // x is null, NOT 1', description: 'Defaults fire **only for `undefined`** — the trap when destructuring JSON, which has `null` but no `undefined`.' },
        ],
      },
      {
        title: 'Spread vs rest — same `...`',
        kind: G.TABLE,
        columns: ['', 'Spread', 'Rest'],
        rows: [
          ['Direction', '**expands** out of', '**collects** into'],
          ['Where', 'right side / call', 'left side / parameters'],
          ['Example', '`f(...args)`, `[...a]`', '`function f(...args)`'],
          ['Result', 'individual values', 'always a **real array**'],
        ],
        note: 'Both copies are **shallow**. `{...obj}` gives a new top-level object whose nested objects are still shared. `[...obj]` throws for a plain object — only `{...obj}` works there.',
      },
      {
        title: 'Optional chaining `?.`',
        kind: G.SNIPPETS,
        entries: [
          { code: 'user?.profile?.city    // undefined if any link is nullish\nuser.save?.()          // skips the call if absent\nlist?.[index]', description: 'Short-circuits on **`null`/`undefined` only** — and always to `undefined`, never `null`.' },
          { code: 'config.count?.()   // TypeError if count is a number', description: 'It guards **absence**, not wrong types. A present-but-not-callable value still throws.' },
        ],
      },
      {
        title: '`??` vs `||`',
        kind: G.TABLE,
        columns: ['`value`', '`value ?? "d"`', '`value \\|\\| "d"`'],
        rows: [
          ['`0`', '**`0`**', '`"d"` ✗'],
          ['`""`', '**`""`**', '`"d"` ✗'],
          ['`false`', '**`false`**', '`"d"` ✗'],
          ['`NaN`', '**`NaN`**', '`"d"`'],
          ['`null`', '`"d"`', '`"d"`'],
          ['`undefined`', '`"d"`', '`"d"`'],
        ],
        note: '`??` falls back only on **nullish**; `||` falls back on every **falsy** value. For configuration and API values `??` is the right default. Mixing `??` with `&&`/`||` unparenthesised is a **`SyntaxError`**, deliberately.',
      },
      {
        title: 'Logical assignment',
        kind: G.SNIPPETS,
        entries: [
          { code: 'a ??= b;   // assign only if a is null/undefined\na ||= b;   // assign only if a is falsy\na &&= b;   // assign only if a is truthy', description: '`a ??= b` is `a ?? (a = b)` — when no assignment is needed **no write happens at all**, so setters and proxy traps do not fire.' },
          { code: '(groups[key] ??= []).push(item);', description: 'The idiomatic "initialise if absent" for building a grouped structure.' },
        ],
      },
    ],
    relatedLessons: ['l-m21-02', 'l-m21-03', 'l-m21-04'],
    relatedReference: ['ref-syntax-destructuring', 'ref-syntax-spread', 'ref-syntax-optional-chaining', 'ref-syntax-nullish', 'ref-syntax-logical-assignment'],
    relatedChallenges: ['ch-obj-pick-omit', 'ch-adv-tagged-template'],
  },

  {
    id: 'cs-modules',
    slug: 'modules',
    title: 'Modules',
    category: C.LANGUAGE,
    icon: 'inventory_2',
    aliases: ['modules', 'import', 'export', 'esm', 'dynamic import', 'code splitting'],
    topicIds: ['modules'],
    description: 'Import and export forms, module scope, and the dynamic import that powers code splitting.',
    groups: [
      {
        title: 'Export',
        kind: G.SNIPPETS,
        entries: [
          { code: 'export const VERSION = "1.0";\nexport function slugify(s) { … }\nexport { a, b as renamed };', description: '**Named exports** — the importer must use the exact name, so a rename is a visible error rather than a silent `undefined`.' },
          { code: 'export default function () { … }', description: 'One per module; the importer picks any name. Flexible, but harder to grep — many style guides prefer named exports.' },
          { code: 'export { slugify } from "./utils.js";\nexport * from "./format.js";', description: 'Re-export to give a feature folder one curated public surface.' },
        ],
      },
      {
        title: 'Import',
        kind: G.SNIPPETS,
        entries: [
          { code: 'import defaultThing from "./mod.js";\nimport { named, other as alias } from "./mod.js";\nimport * as ns from "./mod.js";\nimport "./side-effect.js";', description: 'Default, named, aliased, namespace, and side-effect-only forms.' },
          { code: 'const { createEditor } = await import("./editor.js");', description: '**Dynamic import** — returns a promise for the **namespace object**, so a default export is at `.default`.' },
        ],
      },
      {
        title: 'Static vs dynamic',
        kind: G.TABLE,
        columns: ['', '`import …`', '`import()`'],
        rows: [
          ['Specifier', 'string **literal** only', 'any expression'],
          ['Resolved', 'before execution', 'at runtime'],
          ['Returns', 'bindings', 'a **promise**'],
          ['Hoisted', '**yes**', 'no — it is an expression'],
          ['Tree-shakeable', '**yes**', 'per chunk'],
          ['Works in a classic script', 'no', 'yes'],
        ],
      },
      {
        title: 'Module scope',
        kind: G.RULES,
        items: [
          'Every module has **its own scope** — top-level `const` is not global.',
          'Modules are **always strict mode**, and top-level `this` is `undefined`, not the global object.',
          'A module is **evaluated once** per specifier, however many files import it — which is what makes a module-level `const` a singleton.',
          'Imported bindings are **live and read-only**: reassigning one is a `TypeError`; a reassignment inside the exporting module **is** visible.',
          'In the browser you need `<script type="module">`, and specifiers need a full path **including the `.js` extension** unless an import map is present.',
          'Circular imports do not fail outright but can expose a **partially-initialised** binding. A cycle plus top-level `await` can deadlock.',
        ],
      },
      {
        title: 'Code splitting',
        kind: G.RULES,
        items: [
          'Each `import()` becomes a separate chunk, fetched only when that line runs.',
          'Split by **route** first, then by heavy conditional feature — an editor, a chart, a PDF viewer.',
          'Keep a **literal prefix** in a computed specifier (`./drivers/${name}.js`) so the bundler can still find the candidates.',
          'Handle the rejection: a chunk can fail to load after a deploy replaces the old files.',
          'Tree shaking needs static ESM **and** `"sideEffects": false` in `package.json` — without it a bundler must keep modules that might do work at import time.',
        ],
      },
    ],
    relatedLessons: ['l-m28-02', 'l-m28-03', 'l-m28-04'],
    relatedReference: ['ref-syntax-import', 'ref-syntax-export', 'ref-syntax-dynamic-import'],
    relatedChallenges: [],
  },
];
