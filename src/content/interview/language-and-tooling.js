import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Language mechanics and everyday tooling — the questions that come up once an
 * interviewer has established you can write JavaScript and starts probing how
 * well you understand the machinery around it.
 *
 * Nothing here overlaps the fundamentals or functions banks: these are the
 * adjacent topics (engine phases, error taxonomy, integer limits, tagged
 * templates, source maps, version ranges) that candidates routinely have a
 * blind spot in, plus a set of small utility implementations that appear in
 * real codebases rather than in puzzle collections.
 */

const LANG = 'Language Mechanics';
const TOOLING = 'Tooling & Workflow';
const UTIL = 'Utility Implementations';

export const questions = [
  {
    id: 'iv-lang-expression-vs-statement',
    question: 'What is the difference between an expression and a statement?',
    topic: LANG,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['syntax', 'control-flow'],
    relatedLessons: ['l-m00-04'],
    shortAnswer:
      'An expression produces a value; a statement performs an action. The distinction decides where you are allowed to put things — you can interpolate an expression into a template literal or pass it as an argument, but you cannot do that with an `if` or a `for`.',
    deepAnswer: [
      'Expressions evaluate to a value: `2 + 2`, `user.name`, `fn()`, `a ? b : c`, `[...items]`. Statements do something: `if`, `for`, `while`, `return`, `throw`, a `let` declaration.',
      'The practical consequence is about **placement**. Anywhere a value is expected — a template literal `${...}`, an argument, the right side of an assignment, an array element — only an expression fits. This is exactly why the ternary is used for conditional values and `if` is not: `` `${isAdmin ? "Admin" : "User"}` `` works, and an `if` there is a syntax error.',
      'It is also why `&&` gets used for conditional rendering in JSX-style code (`{isOpen && <Panel />}`) — an expression is required in that position, so a short-circuit stands in for an `if`.',
      'Some constructs come in both forms. A **function declaration** is a statement and is hoisted with its body; a **function expression** produces a value and is not. Same for classes.',
      'Expression statements are the overlap: a line like `doThing();` is an expression used as a statement, its value discarded. That is why `a === b;` on its own is legal but useless, and why linters have a `no-unused-expressions` rule.',
      'The parser resolves ambiguity by position, which produces one genuinely confusing case: a `{` at the start of a statement is a block, not an object literal. `{ a: 1 }` on its own line is a block containing a label — which is why an arrow returning an object needs parentheses: `() => ({ a: 1 })`.',
      'Arrow functions make the distinction visible in one more place: a concise body must be an expression, so anything needing statements requires a braced body and an explicit `return`.',
    ],
    keyPoints: [
      'An expression yields a value; a statement performs an action',
      'Only expressions fit in template holes, arguments and assignments',
      'Ternary and `&&` stand in for `if` where an expression is required',
      'Function/class declarations are statements; the expression forms are values',
      'A leading `{` parses as a block — hence `() => ({ ... })`',
      'A concise arrow body must be an expression',
    ],
    commonMistakes: [
      'Trying to put an `if` inside a template literal.',
      'Returning an object from a concise arrow without parentheses.',
    ],
    followUps: ['Why does an arrow returning an object need parentheses?', 'Where does the difference show up in JSX?'],
  },

  {
    id: 'iv-lang-globalthis',
    question: 'What is `globalThis`, and why does polluting the global scope matter?',
    topic: LANG,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['scope', 'js-runtime', 'modules'],
    relatedLessons: ['l-m10-01'],
    shortAnswer:
      '`globalThis` is the portable reference to the global object — `window` in a browser, `global` in Node, `self` in a worker. Globals matter because every script on the page shares that one namespace, so collisions, accidental overwrites and untraceable coupling all become possible.',
    deepAnswer: [
      'Before `globalThis` there was no single expression that worked everywhere, so libraries shipped a small dance of `typeof window !== "undefined" ? window : global`. `globalThis` replaced all of it.',
      'The reason to care about globals is shared mutable state at the widest possible scope. Two scripts using the same name silently overwrite each other; any code can change any global at any time, so a wrong value has no traceable origin; and tests leak state into one another because nothing resets between them.',
      'A specific browser hazard: any element with an `id` becomes a property of `window`. `<div id="config">` makes a global `config`, which can shadow or collide with a variable you expected to own. It is a real source of "this worked until someone added an id".',
      'The mechanics differ by declaration. In a classic script, a top-level `var` or function declaration **becomes a property of the global object**; `let`, `const` and `class` do not — they live in a separate global lexical scope. So `var x = 1; window.x` is `1`, while `let y = 1; window.y` is `undefined`.',
      'Modules fix this structurally: every module has its own scope, so a top-level `const` in a module is never global. Using `type="module"` (or any bundler) means you have to work to create a global rather than doing it by accident.',
      'The legitimate uses are narrow — a feature-detection check (`typeof globalThis.IntersectionObserver === "function"`), a deliberate single global namespace for a script-tag library, or a debugging hook you intend to remove. Anything else should be an import.',
      'Where accidental globals still bite: forgetting `const` inside a non-strict function creates one silently. Strict mode — which modules enable automatically — turns that into a `ReferenceError`, which is one of the strongest arguments for it.',
    ],
    keyPoints: [
      '`globalThis` works in browsers, Node and workers alike',
      'Globals are shared mutable state at the widest scope — collisions and untraceable writes',
      'Element `id`s become properties of `window`',
      'Top-level `var` attaches to the global object; `let`/`const` do not',
      'Modules give every file its own scope, preventing accidental globals',
      'Strict mode turns an undeclared assignment into a `ReferenceError`',
    ],
    commonMistakes: [
      'Assuming `let` at the top level of a script creates a `window` property.',
      'Relying on `window` in code that also runs in Node or a worker.',
    ],
    followUps: ['Why does a top-level `let` not appear on `window`?', 'How does strict mode prevent accidental globals?'],
  },

  {
    id: 'iv-lang-error-types',
    question: 'What are the built-in error types, and when does the runtime throw each one?',
    topic: LANG,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['errors', 'debugging'],
    relatedLessons: ['l-m22-02', 'l-m00-05'],
    shortAnswer:
      'The ones worth recognising on sight are `TypeError` (a value is not the type the operation needs), `ReferenceError` (the name does not resolve), `SyntaxError` (the code could not be parsed), and `RangeError` (a value is outside a legal range). Knowing which one you got usually tells you where to look before you read the message.',
    deepAnswer: [
      '**`TypeError`** — an operation on the wrong kind of value. "Cannot read properties of undefined", "x is not a function", calling `new` on an arrow, mutating a frozen object in strict mode. Overwhelmingly the most common, and it almost always means something upstream returned `undefined` or `null` when you expected data.',
      '**`ReferenceError`** — the identifier does not resolve. Either a typo, a missing import, or a temporal-dead-zone access on a `let`/`const` before its declaration. The TDZ case is the one people misdiagnose, because the name is visibly right there in the file.',
      '**`SyntaxError`** — thrown at parse time, so no code in the file runs at all. Also thrown at runtime by `JSON.parse` on malformed input, which is the one case where you can catch it.',
      '**`RangeError`** — a legal type but an illegal value: `new Array(-1)`, `toFixed(101)`, an invalid radix, and stack overflow from unbounded recursion.',
      'The others are narrower: `URIError` from bad `decodeURIComponent` input, `EvalError` which is effectively historical, and `AggregateError`, which `Promise.any` throws with an `errors` array when every input rejected.',
      '`DOMException` is worth naming separately because it is not an ECMAScript error at all — it comes from web APIs, and `AbortError` (a cancelled `fetch`) is the instance you handle most often. It has a `name` rather than a distinct class per case, which is why cancellation checks read `err.name === "AbortError"`.',
      'Every error carries `name`, `message` and a non-standard-but-universal `stack`. Since ES2022 there is also `cause`, so wrapping an error can preserve the original: `new Error("Loading failed", { cause: err })`. Using it is what keeps a rethrown error debuggable.',
      'For your own errors, subclass `Error` rather than throwing strings or plain objects. A thrown string has no stack, and `instanceof` checks and error-reporting tools both depend on a real `Error`.',
    ],
    keyPoints: [
      '`TypeError`: wrong kind of value — usually an unexpected `undefined` upstream',
      '`ReferenceError`: unresolved name, including a TDZ access',
      '`SyntaxError`: parse failure, or `JSON.parse` on bad input',
      '`RangeError`: legal type, illegal value — including stack overflow',
      '`AggregateError` from `Promise.any`; `DOMException`/`AbortError` from web APIs',
      'Use `cause` when rethrowing; always throw an `Error`, never a string',
    ],
    commonMistakes: [
      'Throwing strings, which lose the stack and break `instanceof`.',
      'Reading a TDZ `ReferenceError` as a missing declaration.',
    ],
    followUps: ['Which errors can you actually catch at parse time?', 'What does `cause` preserve that a rethrow loses?'],
  },

  {
    id: 'iv-lang-safe-integers',
    question: 'What is `Number.MAX_SAFE_INTEGER`, and when do you need `BigInt`?',
    topic: LANG,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['numbers', 'types'],
    relatedLessons: ['l-m06-01'],
    shortAnswer:
      '`2**53 - 1` — the largest integer for which every whole number below it is exactly representable as a double. Above it, integers start rounding to even neighbours and comparisons silently lie. `BigInt` gives arbitrary-precision integers for ids, currency in minor units, and anything from a 64-bit backend.',
    deepAnswer: [
      'A double has 53 bits of significand. Every integer up to `2**53 - 1` (9,007,199,254,740,991) has an exact representation; beyond that the gaps between representable values exceed one, so odd numbers round.',
      'The consequence is silent, which is what makes it dangerous: `9007199254740993` is stored as `9007199254740992`, and `9007199254740992 === 9007199254740993` evaluates to `true`. No error, no warning, just a wrong answer.',
      '`Number.isSafeInteger(x)` is the check. `Number.MIN_SAFE_INTEGER` is the negative bound.',
      'Where this actually bites front-end developers: a backend using 64-bit integer ids — Twitter snowflake ids, Postgres `bigint`, Discord ids. `JSON.parse` produces a `Number`, so the id is corrupted before your code ever sees it. The standard fix is for the API to serialise such ids as **strings**; if it does not, you need a JSON parser that can emit `BigInt`, because by the time you have a `Number` the information is gone.',
      '`BigInt` — literal `123n`, or `BigInt(value)` — is arbitrary precision. The constraints to state: you cannot mix it with `Number` in arithmetic (`1n + 1` throws `TypeError`), `Math` methods do not accept it, division truncates rather than producing a fraction, and `JSON.stringify` throws on it unless you supply a replacer.',
      'It is also slower than `Number` and uses more memory, so it is a deliberate choice for a specific field, not a default numeric type.',
      'For money, `BigInt` is one valid approach but usually overkill: integer cents in a regular `Number` is exact up to about 90 trillion dollars, which is enough for nearly every application.',
    ],
    keyPoints: [
      '`2**53 - 1`; above it, integers round and comparisons silently lie',
      'Check with `Number.isSafeInteger`',
      '64-bit backend ids are corrupted by `JSON.parse` — have the API send strings',
      '`BigInt` is arbitrary precision but cannot mix with `Number`',
      '`JSON.stringify` throws on `BigInt` without a replacer',
      'Integer cents in a `Number` is usually sufficient for money',
    ],
    commonMistakes: [
      'Assuming a large id survives `JSON.parse` intact.',
      'Mixing `BigInt` and `Number` in arithmetic.',
    ],
    followUps: ['Why must the fix be on the API side?', 'What does `BigInt` division do with a remainder?'],
  },

  {
    id: 'iv-lang-tagged-templates',
    question: 'What is a tagged template literal, and what does it make possible?',
    topic: LANG,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['strings', 'functions', 'security'],
    relatedLessons: ['l-m05-02'],
    shortAnswer:
      'A function invoked with a template literal, receiving the literal string parts and the interpolated values as **separate** arguments. That separation is the whole point: the tag can treat the static parts as trusted and the interpolated parts as data, which is what makes safe escaping possible.',
    deepAnswer: [
      'The call shape:\n\n```js\nfunction tag(strings, ...values) {\n  // strings: the literal chunks, plus strings.raw for un-escaped text\n  // values:  the ${...} results, in order\n}\n\ntag`Hello ${name}, you have ${count} messages`;\n```\n\n`strings` always has exactly one more element than `values`, including empty strings at the ends when the template starts or finishes with an interpolation.',
      'The security value follows directly. Ordinary concatenation flattens everything into one indistinguishable string, so a function receiving it cannot tell which characters the developer wrote and which came from a user. A tag can, so it can escape only the values:\n\n```js\nconst html = (strings, ...values) =>\n  strings.reduce((out, part, i) => out + part + (i < values.length ? escape(values[i]) : ""), "");\n```\n\nThis is the mechanism behind SQL-injection-safe query tags and safe-HTML tags, and it is why "use a tagged template" is a structural fix rather than a discipline.',
      '`strings.raw` gives the text before escape processing, so `\\n` arrives as a backslash and an `n`. `String.raw` is the built-in tag that uses it, which is what makes `String.raw\\`C:\\Users\\`\\` behave.',
      'Other real uses: `styled-components` and similar CSS-in-JS libraries, `graphql` tags that let tooling parse and validate queries at build time, and internationalisation tags that map a message to a translation while keeping the interpolation points.',
      'One performance detail sometimes asked: the `strings` array is cached per call site and is frozen, so a tag can use it as a `WeakMap` key to memoize per-template work — parsing a query or compiling a template once rather than on every call.',
      'The caveat to volunteer: an **untagged** template literal escapes nothing. It is exactly as unsafe as concatenation if the result reaches `innerHTML`, and the syntactic similarity leads people to assume otherwise.',
    ],
    keyPoints: [
      'The tag receives literal parts and interpolated values separately',
      '`strings.length === values.length + 1`, with empty strings at the edges',
      'The separation is what allows escaping only the untrusted values',
      '`strings.raw` and `String.raw` expose the un-escaped text',
      'Used by CSS-in-JS, GraphQL tooling and i18n; the strings array is cached per call site',
      'An untagged template escapes nothing',
    ],
    commonMistakes: [
      'Believing a plain template literal sanitises interpolated values.',
      'Assuming `strings` and `values` have the same length.',
    ],
    followUps: ['How does the caching of `strings` enable memoization?', 'Why is a tag structurally safer than an escape call?'],
  },

  {
    id: 'iv-tool-source-maps',
    question: 'What is a source map, and when does it mislead you?',
    topic: TOOLING,
    level: L.JUNIOR_PLUS,
    kind: K.CONCEPT,
    topicIds: ['tooling', 'debugging'],
    relatedLessons: ['l-m45-02', 'l-m22-05'],
    shortAnswer:
      'A file mapping positions in the built bundle back to positions in your original source, so DevTools can show you readable code and accurate stack traces for minified output. It misleads when it is stale, when heavy optimisation has moved code, or when it is missing in production and every frame points at `bundle.min.js:1`.',
    deepAnswer: [
      'Bundling, minification and transpilation all mean the code the browser runs is not the code you wrote. A source map is a JSON file of position mappings plus, optionally, the original sources inline. A `//# sourceMappingURL=` comment at the end of the bundle points at it.',
      'What it buys you: readable code in the Sources panel, breakpoints on your own lines, and — critically — error-reporting tools that can symbolicate a production stack trace into original file names and line numbers. Without that, a production error report is close to useless.',
      'Where it misleads. A **stale** map — rebuilt bundle, cached map — shows you confidently wrong lines, which is worse than no map. Aggressive optimisation (inlining, dead-code elimination, minifier variable renaming) can map a frame to a plausible but not-quite-right position. And variable **names** are often not recoverable, so the debugger shows minified identifiers even when the lines are right.',
      'The deployment question is a real one: shipping maps publicly exposes your original source. The usual answer is to generate them, upload them to your error-reporting service, and not serve them from the public origin — or to serve them only to authenticated internal users. `hidden-source-map` in webpack (and equivalents elsewhere) generates the map without the referencing comment for exactly this.',
      'Debug builds are a different case: `eval-source-map` and similar dev-only settings trade bundle size for accuracy and rebuild speed, so development and production maps can behave differently. A bug that only reproduces in production is one of the cases where map quality matters most and is often worst.',
      'A related practical detail: async stack traces used to break across `await` boundaries, so a frame would end at the promise rather than the originating call. Modern DevTools stitch them together, but a trace that stops abruptly at an async boundary in an older environment is a tooling artefact, not evidence about the code.',
    ],
    keyPoints: [
      'Maps built output positions back to original source positions',
      'Enables readable debugging and symbolicated production stack traces',
      'A stale map is worse than none — confidently wrong lines',
      'Names are often unrecoverable even when positions are right',
      'Do not serve maps publicly; upload them to the error reporter instead',
      'Dev and production map settings differ, so accuracy differs',
    ],
    commonMistakes: [
      'Publishing source maps to a public origin without deciding to.',
      'Trusting a stale map instead of rebuilding.',
    ],
    followUps: ['How would you get production stack traces without exposing source?', 'Why can a map be right about lines but wrong about names?'],
  },

  {
    id: 'iv-tool-semver',
    question: 'What does `"^1.4.2"` in `package.json` actually allow, and why does it matter?',
    topic: TOOLING,
    level: L.JUNIOR,
    kind: K.CONCEPT,
    topicIds: ['tooling', 'modules'],
    relatedLessons: ['l-m45-01'],
    shortAnswer:
      'A caret allows any release that does not change the leftmost non-zero version segment — so `^1.4.2` accepts `1.9.0` but not `2.0.0`. It matters because a fresh `npm install` can therefore pull code nobody on the team has reviewed, which is why the lockfile is what actually determines your build.',
    deepAnswer: [
      'Semantic versioning is `MAJOR.MINOR.PATCH`: major for breaking changes, minor for backwards-compatible additions, patch for backwards-compatible fixes. It is a **promise by the maintainer**, not something the registry enforces.',
      '`^1.4.2` allows `>=1.4.2 <2.0.0`. `~1.4.2` allows `>=1.4.2 <1.5.0` — patches only. An exact `1.4.2` pins. And the special case people forget: for `0.x` versions the caret behaves like a tilde, because `0.x` is explicitly "anything may break" — `^0.4.2` allows `<0.5.0`, not `<1.0.0`.',
      'The consequence is that two developers running `npm install` at different times can get different trees. That is why the **lockfile** matters: it records the exact resolved versions and integrity hashes for the entire transitive graph, and it must be committed.',
      '`npm ci` is the command that respects it properly — it installs strictly from the lockfile, fails if the lockfile and `package.json` disagree, and deletes `node_modules` first. `npm install` may update the lockfile. CI should always use `npm ci`, or builds are not reproducible.',
      'The supply-chain angle: a caret range means a compromised patch release is pulled automatically by the next install. That is the concrete reason to pin, to review dependency update pull requests rather than auto-merging them, and in higher-risk setups to delay adopting brand-new versions.',
      'Where semver breaks down in practice: maintainers ship breaking changes in minors by accident, "backwards compatible" is a judgement call, and a change to a peer dependency or a TypeScript type can break you without any runtime change. So a version range is a useful default, not a guarantee — which is what the lockfile plus a test suite are actually for.',
      'One more field worth knowing: `engines` declares the Node versions a package supports, and `peerDependencies` declares something the consumer must provide rather than something to install — the usual source of "two copies of React" bugs when it is misused.',
    ],
    keyPoints: [
      '`^` allows changes below the leftmost non-zero segment; `~` allows patches only',
      '`^0.4.2` behaves like `~` — `0.x` promises nothing',
      'Commit the lockfile; it, not `package.json`, determines the build',
      'Use `npm ci` in CI for a reproducible install',
      'Ranges auto-adopt new code — a supply-chain exposure',
      'Semver is a maintainer promise, not an enforced guarantee',
    ],
    commonMistakes: [
      'Treating `^0.x` as allowing minor bumps to `0.9`.',
      'Using `npm install` in CI and getting non-reproducible builds.',
    ],
    followUps: ['Why is `0.x` treated specially?', 'What does `peerDependencies` change?'],
  },

  {
    id: 'iv-lang-engine-pipeline',
    question: 'What does a JavaScript engine do between reading your source and running it?',
    topic: LANG,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['js-runtime', 'performance'],
    relatedLessons: ['l-m00-02'],
    shortAnswer:
      'Parse the text into an AST, compile that to bytecode, and start interpreting immediately. A profiler watches which functions run hot and hands those to an optimising compiler, which produces fast machine code based on assumptions about the types it has observed — and deoptimises back to bytecode if an assumption is violated.',
    deepAnswer: [
      '**Parse.** The source is tokenised and parsed into an abstract syntax tree. Engines use lazy parsing: a function body is only pre-parsed until it is first called, which is why enormous bundles cost start-up time even for code that never runs.',
      '**Compile to bytecode.** V8\'s interpreter (Ignition) executes bytecode straight away. Starting fast matters more than running fast for code that executes once — most of a page\'s JavaScript.',
      '**Profile and optimise.** A profiler records how often functions run and what types flow through them. Hot functions go to the optimising compiler (TurboFan), which generates machine code specialised to those observed types — it can assume `x` is always a small integer and skip the checks a general implementation needs.',
      '**Deoptimise.** Those assumptions are guarded. Pass a string to a function that has only ever seen numbers and the optimised code bails out back to bytecode, discarding the specialised version. Repeatedly changing an object\'s shape, or mixing types in a hot function, causes this.',
      '**Hidden classes and inline caches** are the mechanism underneath. Objects created with the same properties in the same order share an internal shape, which lets property access compile to a fixed offset. Adding properties in a different order, or adding them later, creates different shapes and forces slower lookups. This is the concrete reason "initialise all properties in the constructor, in a consistent order" is real advice rather than folklore.',
      'What this means for how you write code, stated carefully: keep object shapes consistent, keep function parameter types consistent, and do not try to outsmart the engine beyond that. The optimiser changes between versions, micro-benchmarks do not reflect real call sites, and readable code that the engine can specialise beats clever code that defeats it.',
      'The honest bottom line for front-end work: engine-level effects are almost never the bottleneck. Bundle size, network waterfalls, layout and long tasks dominate by orders of magnitude. Knowing this pipeline matters for reading a profile and for understanding why parse time scales with bundle size — not for hand-tuning loops.',
    ],
    keyPoints: [
      'Parse → AST → bytecode → interpret immediately; optimise only what runs hot',
      'Lazy parsing means bundle size costs start-up time even for unused code',
      'Optimised code is specialised to observed types and guarded',
      'Type or shape changes trigger deoptimisation',
      'Hidden classes and inline caches reward consistent object shapes',
      'Engine effects rarely dominate — bundle size and layout usually do',
    ],
    commonMistakes: [
      'Describing JavaScript as purely interpreted.',
      'Micro-optimising for a JIT whose behaviour varies by version.',
    ],
    followUps: ['What causes a deoptimisation?', 'Why does bundle size affect parse time even for unused code?'],
  },

  {
    id: 'iv-lang-regex-when',
    question: 'When is a regular expression the right tool, and when is it the wrong one?',
    topic: LANG,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['regex', 'strings', 'clean-code'],
    relatedLessons: ['l-m16-05', 'l-m16-07'],
    shortAnswer:
      'Right for recognising a pattern in flat text — extracting, splitting, validating a simple shape. Wrong for anything with nested or recursive structure (HTML, JSON, source code), and wrong when a plain string method or a real parser expresses the intent more clearly.',
    deepAnswer: [
      'Where regexes earn their place: pulling structured fragments out of a log line, splitting on a variable delimiter, normalising whitespace, and validating a format that genuinely is a flat pattern — a postcode, a hex colour, a slug.',
      'Where they do not: parsing HTML or XML, matching balanced brackets, or anything else with arbitrary nesting. A regular language cannot count nesting depth, so these are not "hard" regexes — they are impossible ones. Use `DOMParser`, `JSON.parse`, or a real parser.',
      'Email is the case worth naming specifically. The full RFC 5322 grammar is famously impractical as a regex, and every "email regex" in circulation rejects valid addresses. Use `type="email"` for the cheap client-side check, a permissive "has an @ with something either side" test if you must, and confirm deliverability by sending a verification link — which is the only check that actually answers the question you care about.',
      'Prefer the plain string method when one exists. `str.includes("x")` is clearer and faster than `/x/.test(str)`; `startsWith`, `endsWith`, `split` and `replaceAll` cover a lot of what regexes get used for.',
      'When a regex is justified but complex, make it readable: name it as a constant, use the `x`-style layout of composing smaller sources, and use **named groups** — `(?<year>\\d{4})` — so `match.groups.year` replaces an unexplained `match[1]`. A comment stating an example input and the intended match is worth more than the pattern itself.',
      'Two mechanical traps to know. A regex literal with the `g` flag is **stateful**: it carries `lastIndex` between calls, so reusing one across `test()` calls alternates between true and false. Either create it fresh, drop `g` when testing, or reset `lastIndex`. And `String.prototype.replaceAll` throws if given a non-global regex, which is the mirror image of the same confusion.',
      'Test them against real data rather than by reading. A regex that looks right and is subtly wrong is one of the easier ways to ship a data-corruption bug.',
    ],
    keyPoints: [
      'Good for flat patterns: extracting, splitting, validating a simple shape',
      'Impossible, not merely hard, for nested structure — use a real parser',
      'Email cannot be validated by regex; send a verification link',
      'Prefer `includes`/`startsWith`/`split` when they express the intent',
      'Name the constant and use named groups; comment an example input',
      'A `/g/` regex is stateful via `lastIndex`; `replaceAll` rejects a non-global one',
    ],
    commonMistakes: [
      'Parsing HTML with a regex.',
      'Reusing a `/g` regex across `test()` calls and getting alternating results.',
    ],
    followUps: ['Why can a regex not match balanced brackets?', 'What does `lastIndex` do to a reused regex?'],
  },

  {
    id: 'iv-lang-redos',
    question: 'What is catastrophic backtracking, and how do you keep a regex from hanging your app?',
    topic: LANG,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['regex', 'security', 'performance'],
    relatedLessons: ['l-m16-06', 'l-m44-02'],
    shortAnswer:
      'Some patterns can match a given piece of input in exponentially many ways, so on a non-matching string the engine tries all of them and the match takes effectively forever. Because JavaScript is single-threaded, that freezes the whole page — which is why it is a denial-of-service risk, not just a slow function.',
    deepAnswer: [
      'The cause is ambiguity in the pattern: nested or adjacent quantifiers that can divide the same input in many different ways, such as a repeated group that is itself repeatable. When the overall match then fails, the engine backtracks through every one of those divisions before giving up, and the number of divisions grows exponentially with input length.',
      'The reason it matters more in JavaScript than elsewhere is the single thread. A regex runs to completion with no interruption, so a pathological match blocks rendering, input and every timer — the tab simply stops responding. On a server it takes the request thread with it.',
      'The risk becomes a **vulnerability** when the input is user-controlled, which covers form fields, query parameters, uploaded content and API responses. That is the ReDoS class, and the defence is entirely about the pattern and the input, never about detecting an attacker.',
      'How to avoid it, in order of usefulness:\n\n- **Prefer a non-regex solution** for validation that a string method or a parser can express.\n- **Keep patterns unambiguous**: avoid nesting one quantifier inside another, and make alternatives mutually exclusive so there is only one way to match.\n- **Anchor** the pattern with `^` and `$` so the engine does not retry at every starting position.\n- **Bound the input**: check `value.length` against a sensible maximum before matching. This alone converts an exponential blow-up into a bounded cost and is the cheapest mitigation available.\n- **Do not build patterns from user input** — and if you must include user text, escape it so it is treated as literal characters.',
      'Tooling helps: the `eslint-plugin-regexp` and `eslint-plugin-security` rules flag suspicious constructs, and static analysers such as `recheck` can prove a pattern safe. Adding one of those to CI catches this at review time rather than in production.',
      'Where the platform is heading: modern engines have optimisations for some cases, and V8 has a linear-time backtracking-free engine that applies to patterns not using backreferences or lookbehind — but coverage is partial, so it is not something to rely on.',
      'If a pattern must be complex and the input cannot be bounded, run it somewhere it cannot take the main thread down: a Web Worker in the browser, or a separate process with a timeout on the server.',
    ],
    keyPoints: [
      'Ambiguous quantifiers let the engine divide input many ways; failure explores them all',
      'Single-threaded execution means the whole page freezes — a denial-of-service risk',
      'User-controlled input turns it into the ReDoS vulnerability class',
      'Bound the input length first; anchor and de-ambiguate the pattern',
      'Never build a pattern from unescaped user input',
      'Lint with `eslint-plugin-regexp`; isolate unavoidable heavy matching in a worker',
    ],
    commonMistakes: [
      'Treating it as a performance nuisance rather than a denial-of-service risk.',
      'Interpolating user input into a pattern without escaping it.',
    ],
    followUps: ['Why does bounding input length help so much?', 'Which patterns are inherently ambiguous?'],
  },

  {
    id: 'iv-util-chunk',
    question: 'Implement `chunk(array, size)` that splits an array into groups.',
    topic: UTIL,
    level: L.JUNIOR,
    kind: K.CODING,
    topicIds: ['arrays', 'array-methods'],
    relatedLessons: ['l-m12-03'],
    code: [
      'chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]',
      'chunk([1, 2, 3], 5);       // [[1, 2, 3]]',
      'chunk([], 2);              // []',
    ].join('\n'),
    shortAnswer:
      'Step through the array in increments of `size`, taking a `slice` each time. Validate that `size` is a positive integer first — otherwise a zero or negative size produces an infinite loop, which is the failure mode the question is really probing.',
    deepAnswer: [
      'The implementation:\n\n```js\nfunction chunk(array, size) {\n  if (!Number.isInteger(size) || size < 1) {\n    throw new RangeError("size must be a positive integer");\n  }\n\n  const out = [];\n  for (let i = 0; i < array.length; i += size) {\n    out.push(array.slice(i, i + size));\n  }\n  return out;\n}\n```',
      '`slice` handles the final partial group without a special case, because it clamps to the array length rather than erroring. That is why this is shorter than an index-arithmetic version.',
      'The guard is the point of the exercise. `size = 0` makes `i += 0` loop forever and allocate until the tab dies — a validation gap that becomes a denial of service if `size` ever comes from user input or a query parameter. A negative size does the same. Throwing early is better than returning something arbitrary, because a caller passing `0` has a bug.',
      'Edge cases the tests should cover: an empty array returns `[]` not `[[]]`; a size larger than the array returns one group; and a size exactly dividing the length produces no trailing empty group.',
      'The chunks are **shallow** slices — the element references are shared with the original array. Mutating an object inside a chunk mutates it in the source too. Worth stating, because "chunk" sounds like it copies.',
      'Complexity is O(n) in total elements copied, with O(n) extra space. A generator variant avoids materialising every group at once, which matters for a very large array:\n\n```js\nfunction* chunks(array, size) {\n  for (let i = 0; i < array.length; i += size) yield array.slice(i, i + size);\n}\n```',
      'Where it actually gets used: batching API requests to respect a payload limit, paginating a rendered list, and splitting work into pieces that yield to the event loop between batches.',
    ],
    keyPoints: [
      'Step by `size` and `slice`; the final partial group needs no special case',
      'Validate `size` — zero or negative loops forever',
      'Empty input returns `[]`, not `[[]]`',
      'Chunks are shallow — element references are shared',
      'O(n) time and space; a generator avoids materialising all groups',
    ],
    commonMistakes: [
      'Omitting the size guard and allowing an infinite loop.',
      'Returning `[[]]` for an empty array.',
    ],
    followUps: ['Why is the zero case a denial-of-service risk?', 'When would the generator version be worth it?'],
  },

  {
    id: 'iv-util-pick-omit',
    question: 'Implement `pick(object, keys)` and `omit(object, keys)`.',
    topic: UTIL,
    level: L.JUNIOR_PLUS,
    kind: K.CODING,
    topicIds: ['objects', 'object-utilities'],
    relatedLessons: ['l-m14-06', 'l-m15-02'],
    code: [
      'pick({ id: 1, name: "Ada", secret: "x" }, ["id", "name"]);',
      '// { id: 1, name: "Ada" }',
      '',
      'omit({ id: 1, name: "Ada", secret: "x" }, ["secret"]);',
      '// { id: 1, name: "Ada" }',
    ].join('\n'),
    shortAnswer:
      'For `pick`, iterate the requested keys and copy only those that are **own** properties. For `omit`, iterate the object\'s own keys and skip the excluded set. The important detail is `Object.hasOwn` — without it, `pick` can copy inherited properties the caller never stored.',
    deepAnswer: [
      'The implementations:\n\n```js\nfunction pick(object, keys) {\n  const out = {};\n  for (const key of keys) {\n    if (Object.hasOwn(object, key)) out[key] = object[key];\n  }\n  return out;\n}\n\nfunction omit(object, keys) {\n  const excluded = new Set(keys);\n  const out = {};\n  for (const key of Object.keys(object)) {\n    if (!excluded.has(key)) out[key] = object[key];\n  }\n  return out;\n}\n```',
      '`Object.hasOwn` rather than `key in object` matters for `pick`: `in` walks the prototype chain, so `pick(obj, ["toString"])` would copy a function nobody stored. It also means a key that is absent stays absent rather than becoming an explicit `undefined` — the difference between `{}` and `{ a: undefined }`, which `JSON.stringify` and deep-equality checks treat differently.',
      'The `Set` in `omit` makes the exclusion check O(1), so the whole thing is O(n) rather than O(n × k) with `keys.includes`. For two or three keys it is irrelevant; for a large exclusion list it is not.',
      'Both are **shallow**: nested objects are shared with the source. `omit(user, ["password"])` produces a new top-level object, but any nested object inside it is the same reference.',
      'The security use is worth raising unprompted, because it is why these functions exist in most codebases. `pick` is an **allowlist** and `omit` is a **denylist**, and for shaping data that leaves your system — an API response, a log line, an analytics event — the allowlist is the safe choice. With `omit`, a new field added to the model is included by default, which is how tokens and password hashes end up in responses.',
      'Two details a thorough answer adds: neither copies symbol keys, since `Object.keys` excludes them (`Reflect.ownKeys` would include them); and neither preserves getters — the getter is invoked and the resulting value copied, which changes behaviour for a computed property.',
      'In real code, prefer destructuring for a fixed known shape (`const { password, ...safe } = user`) and reach for these only when the key list is dynamic.',
    ],
    keyPoints: [
      '`Object.hasOwn` in `pick` — `in` would copy inherited properties',
      'Absent keys stay absent rather than becoming explicit `undefined`',
      'Use a `Set` for the exclusion check to keep `omit` O(n)',
      'Both are shallow — nested objects stay shared',
      '`pick` is an allowlist and is the safe default for outbound data',
      'Symbol keys and getters are not preserved',
    ],
    commonMistakes: [
      'Using `in` and silently copying prototype members.',
      'Using `omit` to strip secrets, so new fields leak by default.',
    ],
    followUps: ['Why is an allowlist safer for API responses?', 'What happens to a getter when you copy it?'],
  },

  {
    id: 'iv-util-query-string',
    question: 'How do you read and build a URL query string correctly?',
    topic: UTIL,
    level: L.JUNIOR_PLUS,
    kind: K.CODING,
    topicIds: ['web-apis', 'http', 'strings'],
    relatedLessons: ['l-m27-03'],
    code: [
      'const params = new URLSearchParams(location.search);',
      'params.get("q");',
      'params.getAll("tag");',
      '',
      'const next = new URLSearchParams({ q: "a b", page: "2" });',
      'next.toString(); // "q=a+b&page=2"',
    ].join('\n'),
    shortAnswer:
      'Use `URLSearchParams` and `URL`, never string splitting. They handle percent-encoding, `+` for spaces, repeated keys and empty values correctly — all of which hand-rolled parsers get wrong, sometimes in ways that become security bugs.',
    deepAnswer: [
      'Reading:\n\n```js\nconst params = new URLSearchParams(location.search);\nconst q = params.get("q");           // null when absent\nconst tags = params.getAll("tag");   // [] when absent\nconst page = Number(params.get("page") ?? 1);\n```\n\n`get` returns `null` for a missing key and `""` for `?q=`, which are different states and often need different handling — "no search" versus "an empty search".',
      'Writing, without mutating the current URL:\n\n```js\nconst url = new URL(location.href);\nurl.searchParams.set("page", String(page));\nurl.searchParams.delete("cursor");\nhistory.replaceState(null, "", url);\n```\n\n`set` replaces every existing occurrence; `append` adds another. Choosing the wrong one is how a filter accumulates duplicate values on each interaction.',
      'The encoding cases that break hand-written parsers: `&` and `=` inside a value, `+` meaning a space in the query component (but a literal plus in a path), non-ASCII characters, and a genuinely empty value. `split("&").map(p => p.split("="))` mishandles most of these.',
      'Ordering and duplicates are part of the format, not an accident. `?tag=a&tag=b` is valid and means two values — which is why a naive object-shaped parser loses data and why `getAll` exists.',
      'The security angle is worth raising: a value read from the query string is untrusted input from the user, exactly like a form field. It must never be interpolated into HTML, and a `redirect` or `next` parameter must be validated against an allowlist of paths rather than followed — an unvalidated redirect target is a real vulnerability class.',
      'And never put anything sensitive in a query string. URLs are logged by servers, proxies and analytics, kept in browser history, and sent in the `Referer` header to other origins.',
      'For Node or a non-browser context the same API is available (`node:url`), so this is portable rather than browser-only.',
    ],
    keyPoints: [
      '`URLSearchParams`/`URL` handle encoding, `+`, repeated keys and empty values',
      '`get` returns `null` when absent, `""` when present-but-empty',
      '`set` replaces, `append` adds — the wrong one accumulates duplicates',
      'Repeated keys are valid; use `getAll` rather than an object',
      'Query values are untrusted input; validate redirect targets against an allowlist',
      'Never put sensitive data in a URL — logs, history and `Referer` leak it',
    ],
    commonMistakes: [
      'Splitting on `&` and `=` and mangling encoded values.',
      'Treating a present-but-empty parameter the same as an absent one.',
    ],
    followUps: ['Why is an unvalidated redirect parameter dangerous?', 'When would `append` be correct?'],
  },

  {
    id: 'iv-util-deep-get',
    question: 'Implement `deepGet(object, path, fallback)` for safe nested access.',
    topic: UTIL,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['objects', 'clean-code'],
    relatedLessons: ['l-m15-05', 'l-m14-03'],
    code: [
      'deepGet(data, "user.address.city", "unknown");',
      'deepGet(data, ["items", 0, "id"]);',
    ].join('\n'),
    shortAnswer:
      'Split the path into segments and reduce over them, bailing out to the fallback the moment a segment resolves to `null` or `undefined`. Then say the important part: with optional chaining in the language, this is rarely worth having unless the path is genuinely dynamic.',
    deepAnswer: [
      'The implementation:\n\n```js\nfunction deepGet(object, path, fallback) {\n  const segments = Array.isArray(path) ? path : String(path).split(".");\n  let current = object;\n\n  for (const segment of segments) {\n    if (current === null || current === undefined) return fallback;\n    current = current[segment];\n  }\n\n  return current === undefined ? fallback : current;\n}\n```',
      'The final `undefined` check rather than a falsy check is deliberate: a stored `null`, `0`, `""` or `false` is a real value and must be returned, not replaced by the fallback. Using `||` there is the classic bug.',
      'Accepting an array path as well as a dotted string matters because keys can contain dots. `deepGet(config, ["hosts", "api.example.com", "port"])` is unambiguous where the string form is not — a limitation worth naming rather than pretending away.',
      'The honest framing an interviewer is looking for: `object?.user?.address?.city ?? "unknown"` does this natively, is faster, and is statically analysable by type checkers and refactoring tools. A string path is opaque — nothing can verify it, rename it, or tell you it is wrong until it silently returns the fallback in production.',
      'So the justified uses are narrow: a path that genuinely comes from data (a column definition in a configurable table, a form-field mapping, a translation key), or a generic library that cannot know the shape. If the path is a literal in the source, use optional chaining.',
      'The failure mode of these helpers is that they make missing data invisible. `deepGet(response, "user.name", "")` renders an empty string whether the field is legitimately absent or the API changed shape. That is the same critique as over-applied optional chaining: distinguish "absent is expected" from "this should have been there", and validate the payload at the boundary instead of defending at every read.',
      'A `deepSet` counterpart is the more dangerous sibling: writing a path taken from untrusted input is how prototype pollution happens, so it must reject `__proto__`, `constructor` and `prototype` segments.',
    ],
    keyPoints: [
      'Reduce over segments; bail out on `null`/`undefined`',
      'Fall back only on `undefined` — never on falsy values',
      'Accept an array path; keys can contain dots',
      'Optional chaining is better whenever the path is a literal',
      'String paths are opaque to type checkers and refactoring tools',
      'A `deepSet` must reject `__proto__`/`constructor`/`prototype`',
    ],
    commonMistakes: [
      'Using `||` for the fallback and destroying `0`, `""` and `false`.',
      'Reaching for a path helper where optional chaining would do.',
    ],
    followUps: ['When is a dynamic path genuinely justified?', 'Why is `deepSet` more dangerous than `deepGet`?'],
  },

  {
    id: 'iv-util-relative-time',
    question: 'Implement a "3 minutes ago" formatter. What would you get wrong by hand?',
    topic: UTIL,
    level: L.JUNIOR_PLUS,
    kind: K.CODING,
    topicIds: ['dates', 'web-apis'],
    relatedLessons: ['l-m16-04'],
    code: [
      'formatRelative(new Date("2024-01-01T11:57:00Z"), new Date("2024-01-01T12:00:00Z"));',
      '// "3 minutes ago"',
    ].join('\n'),
    shortAnswer:
      'Compute the difference, pick the largest unit that fits, and hand the number to `Intl.RelativeTimeFormat` rather than building the string yourself. Pass "now" in as a parameter — a function that reads the clock internally cannot be tested deterministically.',
    deepAnswer: [
      'The implementation:\n\n```js\nconst UNITS = [\n  ["year", 31536000],\n  ["month", 2592000],\n  ["week", 604800],\n  ["day", 86400],\n  ["hour", 3600],\n  ["minute", 60],\n  ["second", 1],\n];\n\nfunction formatRelative(date, now = new Date(), locale = undefined) {\n  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);\n  const absolute = Math.abs(seconds);\n\n  const [unit, size] = UNITS.find(([, s]) => absolute >= s) ?? ["second", 1];\n  const value = Math.round(seconds / size);\n\n  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(value, unit);\n}\n```',
      'Keeping the sign on `seconds` is what makes past and future both work — a negative value gives "3 minutes ago", a positive one "in 3 minutes". Taking the absolute value too early is the usual bug, producing "ago" for scheduled events.',
      '`Intl.RelativeTimeFormat` is the reason not to hand-roll this. It handles pluralisation rules that are far more complex than "add an s" — Polish has three plural forms, Arabic six — and `numeric: "auto"` gives "yesterday" and "last week" instead of "1 day ago", which is what users expect.',
      'The testability point is the one interviewers press on. A function calling `new Date()` internally produces a different answer every run, so tests either sleep, mock globals, or assert loosely. Passing `now` as a parameter makes it a pure function of its inputs and the test a one-liner with two fixed dates.',
      'Where hand-rolling goes wrong beyond plurals: a "month" is not 30 days, so long intervals drift; daylight-saving transitions mean a day is not always 86,400 seconds; and rounding at boundaries produces "60 minutes ago" instead of "1 hour ago" if you truncate per unit instead of choosing the unit first.',
      'The design decision to raise: relative time is friendly but imprecise, and it goes stale on screen. The usual pattern is relative text with the absolute timestamp in a `title` or a `<time datetime>` attribute, so hovering or assistive technology gives the exact value. And a list of relative timestamps needs re-rendering on an interval or it silently becomes wrong.',
    ],
    keyPoints: [
      'Pick the largest fitting unit, then round within it',
      'Keep the sign so future times read "in 3 minutes"',
      '`Intl.RelativeTimeFormat` handles plural rules and "yesterday"',
      'Inject `now` — a function reading the clock cannot be tested cleanly',
      'Months and days are not fixed lengths; DST breaks naive arithmetic',
      'Pair relative text with an absolute timestamp in `<time datetime>`',
    ],
    commonMistakes: [
      'Taking the absolute difference first and losing past/future.',
      'Building plurals by appending "s".',
    ],
    followUps: ['Why does injecting `now` matter for tests?', 'What does `numeric: "auto"` change?'],
  },

  {
    id: 'iv-refactor-parameter-list',
    question: 'This function takes seven positional parameters. How would you improve the signature?',
    topic: TOOLING,
    level: L.JUNIOR_PLUS,
    kind: K.REFACTORING,
    topicIds: ['functions', 'clean-code'],
    relatedLessons: ['l-m08-05', 'l-m40-02'],
    code: [
      'function createUser(name, email, age, isAdmin, sendWelcome, theme, referrer) {',
      '  // ...',
      '}',
      '',
      'createUser("Ada", "ada@example.com", 36, false, true, "dark", null);',
    ].join('\n'),
    shortAnswer:
      'Take an options object with destructuring and defaults. The call site becomes self-documenting, order stops mattering, and adding a parameter is no longer a breaking change — and the run of unlabelled booleans, which nobody can read, disappears.',
    deepAnswer: [
      'The refactor:\n\n```js\nfunction createUser({\n  name,\n  email,\n  age,\n  isAdmin = false,\n  sendWelcome = true,\n  theme = "system",\n  referrer = null,\n}) {\n  // ...\n}\n\ncreateUser({ name: "Ada", email: "ada@example.com", age: 36, theme: "dark" });\n```\n\nThe call site now says what each value means, optional fields can be omitted in any combination, and a reviewer can tell at a glance that this user is not an admin without counting argument positions.',
      'The specific problem being solved is **boolean blindness**. `createUser("Ada", "ada@example.com", 36, false, true, ...)` is unreadable at the call site, and swapping the two booleans is a bug no type system without named parameters will catch. Named properties make the swap impossible.',
      'Keep the genuinely required, always-present arguments positional if there are one or two: `createUser(name, options)` reads better than putting everything in one bag. The rule of thumb is that positional works up to about three arguments, and options objects are better beyond that or whenever several arguments share a type.',
      'The compatibility benefit is real: adding an eighth option is additive, whereas adding an eighth positional parameter forces every caller to be considered.',
      'Two details to get right. Give the parameter a default of `{}` if every field is optional, or `createUser()` throws on destructuring `undefined`. And validate required fields explicitly, since destructuring a missing key just gives `undefined` rather than an error.',
      'The deeper question an interviewer may push to: a function with seven parameters often has more than one responsibility. `sendWelcome` in particular is a flag argument that selects behaviour — it may belong as a separate `sendWelcomeEmail(user)` call, so that creating a user and notifying them are composable rather than entangled.',
      'The costs, stated honestly: an options object allocates, it makes it slightly easier to pass a typo\'d key that is silently ignored, and it can hide a growing parameter list rather than prompting you to split the function.',
    ],
    keyPoints: [
      'Destructured options object: self-documenting call sites, order-independent',
      'Eliminates boolean blindness and adjacent-argument swaps',
      'Adding an option is additive rather than breaking',
      'Default the parameter to `{}` or a no-argument call throws',
      'Keep one or two required arguments positional',
      'A flag argument often signals a second responsibility to extract',
    ],
    commonMistakes: [
      'Forgetting the `= {}` default and breaking no-argument calls.',
      'Moving everything into an object without questioning the flag arguments.',
    ],
    followUps: ['Why is `sendWelcome` suspicious as a parameter?', 'When is positional still better?'],
  },

  {
    id: 'iv-refactor-lookup-table',
    question: 'How would you refactor a long `if`/`else if` chain that maps a value to behaviour?',
    topic: TOOLING,
    level: L.JUNIOR_PLUS,
    kind: K.REFACTORING,
    topicIds: ['control-flow', 'design-patterns', 'clean-code'],
    relatedLessons: ['l-m41-02', 'l-m07-03'],
    code: [
      'function getShippingCost(method, weight) {',
      '  if (method === "standard") return weight * 1.5;',
      '  else if (method === "express") return weight * 3 + 5;',
      '  else if (method === "overnight") return weight * 6 + 15;',
      '  else if (method === "pickup") return 0;',
      '  else throw new Error("Unknown method");',
      '}',
    ].join('\n'),
    shortAnswer:
      'Replace the chain with a lookup from the value to a handler function. Each case becomes a named entry, adding one is a data change rather than a control-flow change, and the dispatch shrinks to a single lookup with an explicit default.',
    deepAnswer: [
      'The refactor:\n\n```js\nconst SHIPPING = new Map([\n  ["standard",  (weight) => weight * 1.5],\n  ["express",   (weight) => weight * 3 + 5],\n  ["overnight", (weight) => weight * 6 + 15],\n  ["pickup",    () => 0],\n]);\n\nfunction getShippingCost(method, weight) {\n  const rate = SHIPPING.get(method);\n  if (!rate) throw new RangeError(`Unknown shipping method: ${method}`);\n  return rate(weight);\n}\n```',
      'What this buys: the rates become **data** that can be read at a glance, unit-tested individually, or eventually loaded from configuration; adding a method touches one line and no branching; and the dispatch logic exists in exactly one place.',
      'A `Map` rather than a plain object is the safer default here because the key comes from outside the function. With a plain object, a `method` of `"constructor"` or `"toString"` finds an inherited function and takes the wrong branch. `Object.create(null)` is the alternative if you want object syntax.',
      'Keep the explicit unknown-value error. Silently returning `undefined` or a zero cost for an unrecognised method is worse than the original chain — the whole point of the `else throw` was to make an unknown case loud, and the refactor must preserve it.',
      'When **not** to do this: if the branches test different things (`if (user.isAdmin) ... else if (weight > 50) ...`) rather than one value, a lookup does not apply and forcing it produces something worse. This pattern fits single-value dispatch specifically.',
      'The next step up, when each case needs several related behaviours rather than one function, is the strategy pattern — a map from key to an object of methods. And when the branching is on the **type** of a thing you own, polymorphism replaces the map entirely.',
      'A `switch` is the middle ground and is perfectly reasonable for a handful of cases; it is clearer than a chain and does not require the indirection of a map. The lookup wins when the set is large, is genuinely data, or is likely to be extended.',
    ],
    keyPoints: [
      'Map the value to a handler; dispatch becomes one lookup',
      'Cases become data — readable, testable, extensible without new branches',
      'Use a `Map` (or `Object.create(null)`) for keys that come from outside',
      'Preserve an explicit error for unknown values',
      'Only applies to single-value dispatch, not to unrelated conditions',
      'Strategy objects or polymorphism are the next steps up; `switch` is fine for a few cases',
    ],
    commonMistakes: [
      'Using a plain object and taking the wrong branch on an inherited key.',
      'Losing the unknown-value error and returning `undefined` silently.',
    ],
    followUps: ['When would you keep the `switch` instead?', 'How does this become the strategy pattern?'],
  },
];

export default questions;
