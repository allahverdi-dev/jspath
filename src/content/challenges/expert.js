import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Expert Builds';
const XP_E = XP[DIFFICULTY.EXPERT];

export const challenges = [
  {
    id: 'ch-exp-signals',
    slug: 'reactive-signals',
    title: 'Reactive Signals',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['design-patterns', 'closures', 'metaprogramming'],
    xp: XP_E,
    prompt:
      'Build the core of a fine-grained reactivity system. `signal(initial)` returns `[read, write]`. `effect(fn)` runs `fn` immediately and re-runs it whenever any signal it **read during that run** changes — dependencies are discovered automatically, never declared. `computed(fn)` returns a read function whose value is derived and which is itself a dependency others can track. Two rules make this usable rather than a toy: writing a value equal to the current one notifies nobody, and an effect that stops reading a signal on a later run must stop being subscribed to it.',
    examples: [
      'const [count, setCount] = signal(0);\nconst doubled = computed(() => count() * 2);\neffect(() => log(doubled()));   // logs 0\nsetCount(5);                    // logs 10',
    ],
    constraints: ['Dependencies are tracked automatically at read time.', 'Setting an equal value (by `Object.is`) notifies nobody.', 'Dependencies are recomputed on every run, so stale ones are dropped.'],
    starterCode:
      'function signal(initial) {\n  // Your code here\n}\n\nfunction effect(fn) {\n  // Your code here\n}\n\nfunction computed(fn) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a signal reads its initial value', body: 'const [count] = signal(5); expect(count()).toBe(5);' },
      { name: 'writing changes the value', body: 'const [count, setCount] = signal(0); setCount(3); expect(count()).toBe(3);' },
      { name: 'an effect runs immediately', body: 'let runs = 0; effect(() => { runs += 1; }); expect(runs).toBe(1);' },
      { name: 'an effect re-runs on change', body: 'const [count, setCount] = signal(0); let seen = null; effect(() => { seen = count(); }); setCount(7); expect(seen).toBe(7);' },
      { name: 'an effect does not re-run for an unrelated signal', body: 'const [a] = signal(0); const [, setB] = signal(0); let runs = 0; effect(() => { a(); runs += 1; }); setB(1); expect(runs).toBe(1);' },
      { name: 'setting an equal value notifies nobody', body: 'const [count, setCount] = signal(1); let runs = 0; effect(() => { count(); runs += 1; }); setCount(1); expect(runs).toBe(1);' },
      { name: 'NaN counts as equal to itself', body: 'const [v, setV] = signal(NaN); let runs = 0; effect(() => { v(); runs += 1; }); setV(NaN); expect(runs).toBe(1);' },
      { name: 'an effect tracks several signals', body: 'const [a, setA] = signal(1); const [b, setB] = signal(2); let sum = 0; effect(() => { sum = a() + b(); }); setA(10); expect(sum).toBe(12); setB(20); expect(sum).toBe(30);' },
      { name: 'computed derives a value', body: 'const [count, setCount] = signal(2); const doubled = computed(() => count() * 2); expect(doubled()).toBe(4); setCount(5); expect(doubled()).toBe(10);' },
      { name: 'an effect tracks a computed', body: 'const [count, setCount] = signal(1); const doubled = computed(() => count() * 2); let seen = null; effect(() => { seen = doubled(); }); setCount(4); expect(seen).toBe(8);' },
      { name: 'computeds chain', body: 'const [n, setN] = signal(1); const a = computed(() => n() + 1); const b = computed(() => a() * 10); expect(b()).toBe(20); setN(2); expect(b()).toBe(30);' },
      {
        name: 'stale dependencies are dropped',
        body:
          'const [useA, setUseA] = signal(true);\n' +
          'const [a, setA] = signal(1);\n' +
          'const [b, setB] = signal(2);\n' +
          'let runs = 0;\n' +
          'effect(() => { runs += 1; if (useA()) a(); else b(); });\n' +
          'expect(runs).toBe(1);\n' +
          'setUseA(false);\n' +
          'expect(runs).toBe(2);\n' +
          'setA(99);\n' +
          'expect(runs).toBe(2);\n' +
          'setB(99);\n' +
          'expect(runs).toBe(3);',
      },
      { name: 'several effects on one signal all run', body: 'const [c, setC] = signal(0); let x = 0; let y = 0; effect(() => { x = c(); }); effect(() => { y = c() * 2; }); setC(3); expect(x).toBe(3); expect(y).toBe(6);' },
      { name: 'a computed recomputes only when a dependency changes', body: 'let computations = 0; const [n, setN] = signal(1); const c = computed(() => { computations += 1; return n() * 2; }); c(); c(); c(); expect(computations).toBe(1); setN(2); expect(c()).toBe(4); expect(computations).toBe(2);' },
      { name: 'reading outside an effect tracks nothing', body: 'const [c, setC] = signal(0); c(); let runs = 0; effect(() => { runs += 1; }); setC(1); expect(runs).toBe(1);', hidden: true },
      { name: 'an effect reading the same signal twice subscribes once', body: 'const [c, setC] = signal(0); let runs = 0; effect(() => { c(); c(); runs += 1; }); setC(1); expect(runs).toBe(2);', hidden: true },
    ],
    hints: [
      'Keep one module-level variable holding the effect currently running. A signal read consults it: if something is running, register that runner as a subscriber.',
      'On each run, clear the effect\'s previous subscriptions first, set it as the current runner, call the function, then restore the previous runner. Restoring matters for nested effects and computeds.',
      '`computed` is a function that runs its body inside a tracking context and, when its own dependencies change, notifies its own subscribers. The simplest correct version recomputes on read while still registering itself as a dependency of whoever is reading.',
    ],
    solution:
      'let currentRunner = null;\n' +
      '\n' +
      'function signal(initial) {\n' +
      '  let value = initial;\n' +
      '  const subscribers = new Set();\n' +
      '\n' +
      '  const read = () => {\n' +
      '    if (currentRunner !== null) {\n' +
      '      subscribers.add(currentRunner);\n' +
      '      currentRunner.sources.add(subscribers);\n' +
      '    }\n' +
      '    return value;\n' +
      '  };\n' +
      '\n' +
      '  const write = (next) => {\n' +
      '    if (Object.is(next, value)) return;\n' +
      '    value = next;\n' +
      '    for (const runner of [...subscribers]) runner.run();\n' +
      '  };\n' +
      '\n' +
      '  return [read, write];\n' +
      '}\n' +
      '\n' +
      'function createRunner(fn) {\n' +
      '  const runner = {\n' +
      '    sources: new Set(),\n' +
      '    run() {\n' +
      '      for (const subscribers of runner.sources) subscribers.delete(runner);\n' +
      '      runner.sources.clear();\n' +
      '      const previous = currentRunner;\n' +
      '      currentRunner = runner;\n' +
      '      try {\n' +
      '        return fn();\n' +
      '      } finally {\n' +
      '        currentRunner = previous;\n' +
      '      }\n' +
      '    },\n' +
      '  };\n' +
      '  return runner;\n' +
      '}\n' +
      '\n' +
      'function effect(fn) {\n' +
      '  const runner = createRunner(fn);\n' +
      '  runner.run();\n' +
      '  return runner;\n' +
      '}\n' +
      '\n' +
      'function computed(fn) {\n' +
      '  const [read, write] = signal(undefined);\n' +
      '  let started = false;\n' +
      '  return () => {\n' +
      '    if (!started) {\n' +
      '      started = true;\n' +
      '      effect(() => write(fn()));\n' +
      '    }\n' +
      '    return read();\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'The whole system rests on one module-level variable. A signal read has no idea who is reading it — it simply checks whether *something* is currently running and, if so, records that runner as a subscriber. That is what makes dependencies automatic: there is no list to declare and no way for the list to drift out of sync with the code.\n\nClearing the previous subscriptions at the *start* of each run is what the stale-dependency test measures. An effect that branches on a flag reads different signals on different runs; without the clear it would stay subscribed to signals it no longer touches and re-run for changes it does not care about. Because dependencies are rebuilt from scratch every run, the subscription set always matches what the code actually read this time.\n\nSaving and restoring `currentRunner` around the call, rather than setting it to `null` afterwards, is what allows nesting: a computed read inside an effect must return the outer effect as the current runner when it finishes, or the effect would stop tracking everything read after that point. The `finally` guarantees the restore even if the body throws — otherwise one exception would leave the whole system permanently tracking a dead runner.\n\n`computed` is built from the two primitives rather than being a third one: an internal signal holds the cached value, and an internal effect recomputes it whenever the derivation\'s own dependencies change. That gives memoisation for free — reading a computed ten times runs the body once — and it makes the computed itself a signal that other effects can subscribe to, so a change propagates down a chain of derivations automatically. The obvious shortcut of having `computed` run its body inside a fresh tracking scope on every read is subtly broken: it replaces the current runner, so the signals read inside get attributed to the throwaway scope and the *outer* effect never subscribes to anything at all.',
  },

  {
    id: 'ch-exp-produce',
    slug: 'immutable-updates-with-a-draft',
    title: 'Immutable Updates with a Draft',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['metaprogramming', 'copying', 'design-patterns'],
    xp: XP_E,
    prompt:
      'Immutable updates are correct but painful to write by hand. Build `produce(base, recipe)`: it hands the recipe a **draft** that can be mutated with ordinary assignment, and returns a new state reflecting those changes — while leaving `base` completely untouched. The parts of the tree the recipe never touched must be the *same object references* as in `base`; only the path to a change is copied. A recipe that changes nothing returns `base` itself.',
    examples: [
      'const next = produce(state, (draft) => {\n  draft.user.name = "Ada";\n});\nnext !== state;                // true\nnext.settings === state.settings; // true — untouched branch is shared',
    ],
    constraints: ['`base` is never modified, at any depth.', 'Untouched branches keep their original references.', 'A recipe that changes nothing returns `base` itself.'],
    starterCode: 'function produce(base, recipe) {\n  // Your code here\n}\n',
    tests: [
      { name: 'applies a shallow change', body: 'expect(produce({ a: 1 }, (d) => { d.a = 2; })).toEqual({ a: 2 });' },
      { name: 'does not modify the base', body: 'const base = { a: 1 }; produce(base, (d) => { d.a = 2; }); expect(base.a).toBe(1);' },
      { name: 'applies a nested change', body: 'expect(produce({ user: { name: "x" } }, (d) => { d.user.name = "Ada"; })).toEqual({ user: { name: "Ada" } });' },
      { name: 'does not modify a nested base', body: 'const base = { user: { name: "x" } }; produce(base, (d) => { d.user.name = "Ada"; }); expect(base.user.name).toBe("x");' },
      { name: 'shares untouched branches', body: 'const base = { user: { name: "x" }, settings: { theme: "dark" } }; const next = produce(base, (d) => { d.user.name = "Ada"; }); expect(next.settings).toBe(base.settings);' },
      { name: 'copies the path to a change', body: 'const base = { user: { name: "x" } }; const next = produce(base, (d) => { d.user.name = "Ada"; }); expect(next).not.toBe(base); expect(next.user).not.toBe(base.user);' },
      { name: 'a no-op recipe returns the base', body: 'const base = { a: 1 }; expect(produce(base, () => {})).toBe(base);' },
      { name: 'reading without writing does not copy', body: 'const base = { a: { b: 1 } }; expect(produce(base, (d) => { const x = d.a.b; })).toBe(base);' },
      { name: 'adds a new key', body: 'expect(produce({ a: 1 }, (d) => { d.b = 2; })).toEqual({ a: 1, b: 2 });' },
      { name: 'deletes a key', body: 'expect(produce({ a: 1, b: 2 }, (d) => { delete d.a; })).toEqual({ b: 2 });' },
      { name: 'mutates an array', body: 'const base = { xs: [1, 2] }; const next = produce(base, (d) => { d.xs.push(3); }); expect(next.xs).toEqual([1, 2, 3]); expect(base.xs).toEqual([1, 2]);' },
      { name: 'the result array is a real array', body: 'const next = produce({ xs: [1] }, (d) => { d.xs.push(2); }); expect(Array.isArray(next.xs)).toBe(true);' },
      { name: 'handles three levels deep', body: 'const base = { a: { b: { c: 1 } } }; const next = produce(base, (d) => { d.a.b.c = 2; }); expect(next.a.b.c).toBe(2); expect(base.a.b.c).toBe(1);' },
      { name: 'shares a sibling three levels down', body: 'const base = { a: { b: { c: 1 }, keep: { x: 1 } } }; const next = produce(base, (d) => { d.a.b.c = 2; }); expect(next.a.keep).toBe(base.a.keep);' },
      { name: 'setting the same value still produces a change', body: 'const base = { a: 1 }; const next = produce(base, (d) => { d.a = 1; }); expect(next).toEqual({ a: 1 });', hidden: true },
      { name: 'several changes in one recipe', body: 'const base = { a: 1, b: { c: 2 } }; const next = produce(base, (d) => { d.a = 9; d.b.c = 8; }); expect(next).toEqual({ a: 9, b: { c: 8 } }); expect(base).toEqual({ a: 1, b: { c: 2 } });', hidden: true },
    ],
    hints: [
      'Wrap the base in a `Proxy`. The `set` and `deleteProperty` traps mark the node as modified and write into a lazily created shallow copy.',
      'The `get` trap must return a *draft* for nested objects, not the raw object — otherwise a nested assignment would reach the base directly. Cache those child drafts so repeated reads give the same one.',
      'At the end, walk the drafts: a node with no modifications anywhere beneath it returns its original object, which is what produces the structural sharing.',
    ],
    solution:
      'function produce(base, recipe) {\n' +
      '  const isDraftable = (v) => typeof v === "object" && v !== null;\n' +
      '\n' +
      '  function createDraft(source) {\n' +
      '    const state = { source, copy: null, children: new Map(), modified: false };\n' +
      '\n' +
      '    const target = () => state.copy ?? state.source;\n' +
      '    const ensureCopy = () => {\n' +
      '      if (state.copy === null) {\n' +
      '        state.copy = Array.isArray(state.source) ? state.source.slice() : { ...state.source };\n' +
      '      }\n' +
      '      state.modified = true;\n' +
      '      return state.copy;\n' +
      '    };\n' +
      '\n' +
      '    const proxy = new Proxy(state.source, {\n' +
      '      get(_t, key) {\n' +
      '        const value = target()[key];\n' +
      '        if (!isDraftable(value)) return value;\n' +
      '        if (!state.children.has(key)) state.children.set(key, createDraft(value));\n' +
      '        return state.children.get(key).proxy;\n' +
      '      },\n' +
      '      set(_t, key, value) {\n' +
      '        ensureCopy()[key] = value;\n' +
      '        state.children.delete(key);\n' +
      '        return true;\n' +
      '      },\n' +
      '      deleteProperty(_t, key) {\n' +
      '        delete ensureCopy()[key];\n' +
      '        state.children.delete(key);\n' +
      '        return true;\n' +
      '      },\n' +
      '      has(_t, key) {\n' +
      '        return key in target();\n' +
      '      },\n' +
      '      ownKeys() {\n' +
      '        return Reflect.ownKeys(target());\n' +
      '      },\n' +
      '      getOwnPropertyDescriptor(_t, key) {\n' +
      '        return Reflect.getOwnPropertyDescriptor(target(), key);\n' +
      '      },\n' +
      '    });\n' +
      '\n' +
      '    state.proxy = proxy;\n' +
      '    return state;\n' +
      '  }\n' +
      '\n' +
      '  function finalize(state) {\n' +
      '    let result = state.copy;\n' +
      '    for (const [key, child] of state.children) {\n' +
      '      const finalized = finalize(child);\n' +
      '      if (finalized !== child.source) {\n' +
      '        if (result === null) {\n' +
      '          result = Array.isArray(state.source) ? state.source.slice() : { ...state.source };\n' +
      '        }\n' +
      '        result[key] = finalized;\n' +
      '      }\n' +
      '    }\n' +
      '    return result ?? state.source;\n' +
      '  }\n' +
      '\n' +
      '  if (!isDraftable(base)) return base;\n' +
      '  const root = createDraft(base);\n' +
      '  recipe(root.proxy);\n' +
      '  return finalize(root);\n' +
      '}\n',
    solutionExplanation:
      'This is copy-on-write, and the laziness is the whole point. A draft holds a reference to the original and nothing else until something is written; only then is a shallow copy made. A node whose copy is still `null` and whose children all finalise to their own sources has not changed, so `finalize` returns the original object — which is exactly what produces structural sharing, and why the untouched `settings` branch comes back as the same reference.\n\nThe `get` trap returning a nested *draft* rather than the raw value is what makes deep assignment work. Without it, `draft.user.name = "Ada"` would read the real `user` object out of the base and write straight into it, mutating the caller\'s state — the bug this whole design exists to prevent. Caching child drafts in a `Map` means repeated reads of the same key give the same draft, so two changes to the same subtree share one copy rather than each making their own.\n\n`finalize` is recursive because a change deep in the tree has to propagate copies back up: the parent of a changed node must itself be copied so it can point at the new child, and so on to the root. That is precisely the "only the path to a change is copied" requirement, and it is why comparing an old and new state with `===` at any node correctly tells you whether that subtree changed. The `ownKeys` and `getOwnPropertyDescriptor` traps are what keep `Object.keys`, spread and `toEqual` seeing the copy rather than the stale original once a write has happened.',
  },

  {
    id: 'ch-exp-expression-parser',
    slug: 'a-recursive-descent-parser',
    title: 'A Recursive Descent Parser',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['algorithms', 'recursion', 'errors'],
    xp: XP_E,
    prompt:
      'Write `evaluate(expression)` parsing and evaluating an arithmetic expression string with correct precedence and associativity. Support `+ - * / ^`, parentheses, unary minus, decimals and arbitrary whitespace. `*` and `/` bind tighter than `+` and `-`; `^` binds tighter still and is **right**-associative, so `2^3^2` is 512, not 64. Unary minus binds tighter than `*` but looser than `^`, so `-2^2` is -4. Throw a `SyntaxError` for anything malformed.',
    examples: [
      'evaluate("1 + 2 * 3");    // 7',
      'evaluate("(1 + 2) * 3");  // 9',
      'evaluate("2^3^2");        // 512',
      'evaluate("-2^2");         // -4',
    ],
    constraints: ['`^` is right-associative; the other operators are left-associative.', 'Unary minus binds looser than `^`.', 'Malformed input throws a `SyntaxError`.'],
    starterCode: 'function evaluate(expression) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a single number', body: 'expect(evaluate("42")).toBe(42);' },
      { name: 'addition', body: 'expect(evaluate("1 + 2")).toBe(3);' },
      { name: 'precedence', body: 'expect(evaluate("1 + 2 * 3")).toBe(7);' },
      { name: 'parentheses override precedence', body: 'expect(evaluate("(1 + 2) * 3")).toBe(9);' },
      { name: 'subtraction is left-associative', body: 'expect(evaluate("10 - 3 - 2")).toBe(5);' },
      { name: 'division is left-associative', body: 'expect(evaluate("100 / 5 / 2")).toBe(10);' },
      { name: 'exponentiation is right-associative', body: 'expect(evaluate("2^3^2")).toBe(512);' },
      { name: 'unary minus', body: 'expect(evaluate("-5 + 2")).toBe(-3);' },
      { name: 'unary minus binds looser than exponentiation', body: 'expect(evaluate("-2^2")).toBe(-4);' },
      { name: 'unary minus inside parentheses', body: 'expect(evaluate("(-2)^2")).toBe(4);' },
      { name: 'decimals', body: 'expect(evaluate("1.5 * 2")).toBe(3);' },
      { name: 'ignores whitespace', body: 'expect(evaluate("  1   +   2  ")).toBe(3);' },
      { name: 'no whitespace at all', body: 'expect(evaluate("1+2*3")).toBe(7);' },
      { name: 'nested parentheses', body: 'expect(evaluate("((1 + 2) * (3 + 4))")).toBe(21);' },
      { name: 'a longer expression', body: 'expect(evaluate("2 * (3 + 4) - 10 / 5")).toBe(12);' },
      { name: 'rejects an unclosed parenthesis', body: 'expect(() => evaluate("(1 + 2")).toThrow(SyntaxError);' },
      { name: 'rejects a trailing operator', body: 'expect(() => evaluate("1 +")).toThrow(SyntaxError);' },
      { name: 'rejects an empty expression', body: 'expect(() => evaluate("")).toThrow(SyntaxError);' },
      { name: 'rejects trailing junk', body: 'expect(() => evaluate("1 2")).toThrow(SyntaxError);' },
      { name: 'rejects an unknown character', body: 'expect(() => evaluate("1 $ 2")).toThrow(SyntaxError);' },
      { name: 'double negation', body: 'expect(evaluate("--3")).toBe(3);', hidden: true },
      { name: 'deep nesting', body: 'expect(evaluate("(".repeat(50) + "1" + ")".repeat(50))).toBe(1);', hidden: true },
    ],
    hints: [
      'Tokenise first — numbers, operators, parentheses — then parse the token list. Mixing the two makes both harder.',
      'One function per precedence level, each calling the next tighter one: `parseSum` calls `parseProduct`, which calls `parseUnary`, which calls `parsePower`, which calls `parseAtom`.',
      'Left associativity is a `while` loop at that level; right associativity is a recursive call to the *same* level. That single difference is what makes `^` group to the right.',
    ],
    solution:
      'function evaluate(expression) {\n' +
      '  const tokens = [];\n' +
      '  const pattern = /\\s*(\\d+(?:\\.\\d+)?|[-+*/^()])/y;\n' +
      '  let at = 0;\n' +
      '  while (at < expression.length) {\n' +
      '    pattern.lastIndex = at;\n' +
      '    const match = pattern.exec(expression);\n' +
      '    if (match === null) {\n' +
      '      if (expression.slice(at).trim() === "") break;\n' +
      '      throw new SyntaxError("unexpected character at " + at);\n' +
      '    }\n' +
      '    tokens.push(match[1]);\n' +
      '    at = pattern.lastIndex;\n' +
      '  }\n' +
      '\n' +
      '  let i = 0;\n' +
      '  const peek = () => tokens[i];\n' +
      '  const eat = (token) => {\n' +
      '    if (tokens[i] !== token) throw new SyntaxError("expected " + token);\n' +
      '    i += 1;\n' +
      '  };\n' +
      '\n' +
      '  function parseSum() {\n' +
      '    let left = parseProduct();\n' +
      '    while (peek() === "+" || peek() === "-") {\n' +
      '      const op = tokens[i];\n' +
      '      i += 1;\n' +
      '      const right = parseProduct();\n' +
      '      left = op === "+" ? left + right : left - right;\n' +
      '    }\n' +
      '    return left;\n' +
      '  }\n' +
      '\n' +
      '  function parseProduct() {\n' +
      '    let left = parseUnary();\n' +
      '    while (peek() === "*" || peek() === "/") {\n' +
      '      const op = tokens[i];\n' +
      '      i += 1;\n' +
      '      const right = parseUnary();\n' +
      '      left = op === "*" ? left * right : left / right;\n' +
      '    }\n' +
      '    return left;\n' +
      '  }\n' +
      '\n' +
      '  function parseUnary() {\n' +
      '    if (peek() === "-") {\n' +
      '      i += 1;\n' +
      '      return -parseUnary();\n' +
      '    }\n' +
      '    return parsePower();\n' +
      '  }\n' +
      '\n' +
      '  function parsePower() {\n' +
      '    const base = parseAtom();\n' +
      '    if (peek() === "^") {\n' +
      '      i += 1;\n' +
      '      return base ** parseUnary();\n' +
      '    }\n' +
      '    return base;\n' +
      '  }\n' +
      '\n' +
      '  function parseAtom() {\n' +
      '    const token = peek();\n' +
      '    if (token === undefined) throw new SyntaxError("unexpected end of expression");\n' +
      '    if (token === "(") {\n' +
      '      i += 1;\n' +
      '      const value = parseSum();\n' +
      '      eat(")");\n' +
      '      return value;\n' +
      '    }\n' +
      '    if (/^\\d/.test(token)) {\n' +
      '      i += 1;\n' +
      '      return Number(token);\n' +
      '    }\n' +
      '    throw new SyntaxError("unexpected token " + token);\n' +
      '  }\n' +
      '\n' +
      '  if (tokens.length === 0) throw new SyntaxError("empty expression");\n' +
      '  const result = parseSum();\n' +
      '  if (i !== tokens.length) throw new SyntaxError("unexpected trailing input");\n' +
      '  return result;\n' +
      '}\n',
    solutionExplanation:
      'Recursive descent turns a precedence table directly into a call graph: one function per level, each handling its own operators and delegating everything tighter-binding to the next. The grammar is visible in the code, which is why this technique is what most hand-written parsers — including several JavaScript engines\' — actually use.\n\nAssociativity is the elegant part. Left associativity is a `while` loop that folds each new operand into an accumulator, so `10 - 3 - 2` groups as `(10 - 3) - 2`. Right associativity is a recursive call back into the *same or looser* level, so `2^3^2` parses the right-hand side as a whole power expression and groups as `2^(3^2)` = 512. That one structural difference is the entire distinction, and getting it backwards is the classic bug.\n\nThe `-2^2` case is worth tracing. `parseUnary` sees the minus, consumes it, and recurses into `parseUnary`, which reaches `parsePower` and parses `2^2` as a unit before the negation applies — giving -4, matching how mathematics and JavaScript itself treat it. Placing unary minus *above* `parsePower` in the call chain is what produces that. The sticky `y` flag on the tokeniser anchors each match at the current position, so an unknown character fails immediately rather than being skipped over, and the final `i !== tokens.length` check is what rejects `"1 2"` — the parse succeeded but did not consume everything, which is always a syntax error.',
  },

  {
    id: 'ch-exp-glob',
    slug: 'a-glob-matcher',
    title: 'A Glob Matcher',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['algorithms', 'strings', 'recursion'],
    xp: XP_E,
    prompt:
      'Write `matchGlob(pattern, path)` implementing the path-matching rules build tools use. `*` matches any run of characters **within one segment**, `?` matches exactly one such character, and `**` matches any number of whole segments including none. Segments are separated by `/`. So `src/*.js` matches `src/a.js` but not `src/lib/a.js`, while `src/**/*.js` matches both. Solve it without translating to a regex — the segment logic is the exercise.',
    examples: [
      'matchGlob("src/*.js", "src/a.js");        // true',
      'matchGlob("src/*.js", "src/lib/a.js");    // false',
      'matchGlob("src/**/*.js", "src/lib/a.js"); // true',
    ],
    constraints: ['`*` and `?` never cross a `/`.', '`**` matches zero or more whole segments.', 'Do not build a regular expression from the pattern.'],
    starterCode: 'function matchGlob(pattern, path) {\n  // Your code here\n}\n',
    tests: [
      { name: 'an exact match', body: 'expect(matchGlob("src/a.js", "src/a.js")).toBe(true);' },
      { name: 'a non-match', body: 'expect(matchGlob("src/a.js", "src/b.js")).toBe(false);' },
      { name: 'star within a segment', body: 'expect(matchGlob("src/*.js", "src/a.js")).toBe(true);' },
      { name: 'star does not cross a slash', body: 'expect(matchGlob("src/*.js", "src/lib/a.js")).toBe(false);' },
      { name: 'star matches an empty run', body: 'expect(matchGlob("src/*.js", "src/.js")).toBe(true);' },
      { name: 'star respects the extension', body: 'expect(matchGlob("src/*.js", "src/a.ts")).toBe(false);' },
      { name: 'question mark matches one character', body: 'expect(matchGlob("a?c", "abc")).toBe(true);' },
      { name: 'question mark does not match two', body: 'expect(matchGlob("a?c", "abbc")).toBe(false);' },
      { name: 'question mark does not match zero', body: 'expect(matchGlob("a?c", "ac")).toBe(false);' },
      { name: 'question mark does not cross a slash', body: 'expect(matchGlob("a?c", "a/c")).toBe(false);' },
      { name: 'double star crosses segments', body: 'expect(matchGlob("src/**/*.js", "src/lib/a.js")).toBe(true);' },
      { name: 'double star matches deeply', body: 'expect(matchGlob("src/**/*.js", "src/a/b/c/d.js")).toBe(true);' },
      { name: 'double star matches zero segments', body: 'expect(matchGlob("src/**/a.js", "src/a.js")).toBe(true);' },
      { name: 'a leading double star', body: 'expect(matchGlob("**/a.js", "x/y/a.js")).toBe(true); expect(matchGlob("**/a.js", "a.js")).toBe(true);' },
      { name: 'a trailing double star matches everything below', body: 'expect(matchGlob("src/**", "src/a/b.js")).toBe(true); expect(matchGlob("src/**", "src")).toBe(true);' },
      { name: 'double star still respects the rest of the pattern', body: 'expect(matchGlob("src/**/*.js", "src/lib/a.ts")).toBe(false);' },
      { name: 'a bare double star matches anything', body: 'expect(matchGlob("**", "a/b/c")).toBe(true);' },
      { name: 'more path than pattern is a non-match', body: 'expect(matchGlob("a/b", "a/b/c")).toBe(false);' },
      { name: 'more pattern than path is a non-match', body: 'expect(matchGlob("a/b/c", "a/b")).toBe(false);' },
      { name: 'several stars in one segment', body: 'expect(matchGlob("*-*.js", "one-two.js")).toBe(true);', hidden: true },
      { name: 'backtracking is required and works', body: 'expect(matchGlob("*abc", "abcabc")).toBe(true); expect(matchGlob("a*b*c", "axxbyyc")).toBe(true);', hidden: true },
    ],
    hints: [
      'Split both the pattern and the path on `/` and match segment lists against each other recursively.',
      'A `**` segment tries every possibility: match zero path segments and continue, or consume one path segment and try `**` again.',
      'Within a segment, `*` needs the same treatment on characters — try matching zero characters, or one more. That recursion is what handles `"*abc"` against `"abcabc"`.',
    ],
    solution:
      'function matchGlob(pattern, path) {\n' +
      '  function matchSegment(p, s, pi = 0, si = 0) {\n' +
      '    if (pi === p.length) return si === s.length;\n' +
      '    const char = p[pi];\n' +
      '    if (char === "*") {\n' +
      '      if (matchSegment(p, s, pi + 1, si)) return true;\n' +
      '      return si < s.length && matchSegment(p, s, pi, si + 1);\n' +
      '    }\n' +
      '    if (si === s.length) return false;\n' +
      '    if (char === "?" || char === s[si]) return matchSegment(p, s, pi + 1, si + 1);\n' +
      '    return false;\n' +
      '  }\n' +
      '\n' +
      '  function matchParts(pp, sp, pi = 0, si = 0) {\n' +
      '    if (pi === pp.length) return si === sp.length;\n' +
      '    if (pp[pi] === "**") {\n' +
      '      if (matchParts(pp, sp, pi + 1, si)) return true;\n' +
      '      return si < sp.length && matchParts(pp, sp, pi, si + 1);\n' +
      '    }\n' +
      '    if (si === sp.length) return false;\n' +
      '    if (!matchSegment(pp[pi], sp[si])) return false;\n' +
      '    return matchParts(pp, sp, pi + 1, si + 1);\n' +
      '  }\n' +
      '\n' +
      '  return matchParts(pattern.split("/"), path.split("/"));\n' +
      '}\n',
    solutionExplanation:
      'The two functions have the same shape at different scales, which is what makes the segment rules fall out cleanly: `matchParts` walks segments and `matchSegment` walks characters, and neither can affect the other because the split on `/` happened first. That is precisely why `*` cannot cross a slash — it never sees one.\n\nBoth wildcards need backtracking, and both express it the same way: try consuming nothing and continuing, and if that fails, consume one more unit and try again. `"*abc"` against `"abcabc"` is the case that requires it — the greedy first attempt of matching everything fails, and only by backing off does the match succeed. Writing this as "match as much as possible" without the retry is the classic broken glob.\n\nThe base cases are where correctness lives. Pattern exhausted means "match only if the input is exhausted too", which is what rejects a path longer than its pattern. Input exhausted with pattern remaining fails, *except* that `**` is checked before that test — which is what lets `src/**/a.js` match `src/a.js` with zero segments in between, and `src/**` match `src` itself.',
  },

  {
    id: 'ch-exp-array-diff',
    slug: 'diffing-two-sequences',
    title: 'Diffing Two Sequences',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'recursion'],
    xp: XP_E,
    prompt:
      'Write `diffSequences(before, after)` producing the minimal edit script that turns one array into the other, as operations `{ type: "keep" | "add" | "remove", value }` in order. Minimal means the fewest add and remove operations — which is the same as keeping the **longest common subsequence**. This is the algorithm behind `git diff` and behind list reconciliation in UI frameworks. Where several minimal scripts exist, emit removals before additions at the same position.',
    examples: [
      'diffSequences(["a", "b", "c"], ["a", "c", "d"]);\n// keep a, remove b, keep c, add d',
    ],
    constraints: ['The number of add and remove operations must be minimal.', 'Applying the script to `before` must produce `after`.', 'At a given position, removals come before additions.'],
    starterCode: 'function diffSequences(before, after) {\n  // Your code here\n}\n',
    tests: [
      { name: 'identical sequences are all keeps', body: 'expect(diffSequences(["a", "b"], ["a", "b"])).toEqual([{ type: "keep", value: "a" }, { type: "keep", value: "b" }]);' },
      { name: 'an appended element', body: 'expect(diffSequences(["a"], ["a", "b"])).toEqual([{ type: "keep", value: "a" }, { type: "add", value: "b" }]);' },
      { name: 'a removed element', body: 'expect(diffSequences(["a", "b"], ["a"])).toEqual([{ type: "keep", value: "a" }, { type: "remove", value: "b" }]);' },
      { name: 'a replacement', body: 'expect(diffSequences(["a"], ["b"])).toEqual([{ type: "remove", value: "a" }, { type: "add", value: "b" }]);' },
      { name: 'a change in the middle', body: 'expect(diffSequences(["a", "b", "c"], ["a", "c", "d"]).map((o) => o.type + o.value)).toEqual(["keepa", "removeb", "keepc", "addd"]);' },
      { name: 'an empty before is all additions', body: 'expect(diffSequences([], ["a", "b"]).every((o) => o.type === "add")).toBe(true);' },
      { name: 'an empty after is all removals', body: 'expect(diffSequences(["a", "b"], []).every((o) => o.type === "remove")).toBe(true);' },
      { name: 'two empty sequences give an empty script', body: 'expect(diffSequences([], [])).toEqual([]);' },
      { name: 'applying the script reproduces after', body: 'const b = ["a", "b", "c", "d"]; const a = ["b", "x", "d"]; const out = diffSequences(b, a).filter((o) => o.type !== "remove").map((o) => o.value); expect(out).toEqual(a);' },
      { name: 'the kept and removed operations reproduce before', body: 'const b = ["a", "b", "c", "d"]; const a = ["b", "x", "d"]; const out = diffSequences(b, a).filter((o) => o.type !== "add").map((o) => o.value); expect(out).toEqual(b);' },
      { name: 'keeps the longest common subsequence', body: 'const out = diffSequences(["a", "b", "c", "d", "e"], ["a", "c", "e"]); expect(out.filter((o) => o.type === "keep").map((o) => o.value)).toEqual(["a", "c", "e"]);' },
      { name: 'the edit count is minimal', body: 'const out = diffSequences(["a", "b", "c"], ["a", "c"]); expect(out.filter((o) => o.type !== "keep").length).toBe(1);' },
      { name: 'a reversed sequence shares only one element', body: 'const out = diffSequences(["a", "b", "c"], ["c", "b", "a"]); expect(out.filter((o) => o.type === "keep").length).toBe(1);' },
      { name: 'removals precede additions at a position', body: 'const out = diffSequences(["a"], ["b"]); expect(out[0].type).toBe("remove"); expect(out[1].type).toBe("add");' },
      { name: 'works with numbers', body: 'const out = diffSequences([1, 2, 3], [1, 3]); expect(out.map((o) => o.type)).toEqual(["keep", "remove", "keep"]);', hidden: true },
      {
        name: 'handles a longer pair without exponential blowup',
        body:
          'const b = Array.from({ length: 200 }, (_, i) => i);\n' +
          'const a = b.filter((n) => n % 3 !== 0);\n' +
          'const out = diffSequences(b, a);\n' +
          'expect(out.filter((o) => o.type !== "keep").length).toBe(67);\n' +
          'expect(out.filter((o) => o.type !== "remove").map((o) => o.value)).toEqual(a);',
        hidden: true,
      },
    ],
    hints: [
      'First find the length of the longest common subsequence with a dynamic-programming table: `lcs[i][j]` is the LCS length of the first i of `before` and the first j of `after`.',
      'Matching elements extend the diagonal by one; otherwise take the better of skipping one element from either side.',
      'Then walk the table backwards from the bottom-right to reconstruct the script, and reverse it at the end. Which branch you prefer on a tie is what fixes the removals-before-additions ordering.',
    ],
    solution:
      'function diffSequences(before, after) {\n' +
      '  const n = before.length;\n' +
      '  const m = after.length;\n' +
      '  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));\n' +
      '\n' +
      '  for (let i = n - 1; i >= 0; i -= 1) {\n' +
      '    for (let j = m - 1; j >= 0; j -= 1) {\n' +
      '      lcs[i][j] = before[i] === after[j]\n' +
      '        ? lcs[i + 1][j + 1] + 1\n' +
      '        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  const script = [];\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  while (i < n && j < m) {\n' +
      '    if (before[i] === after[j]) {\n' +
      '      script.push({ type: "keep", value: before[i] });\n' +
      '      i += 1;\n' +
      '      j += 1;\n' +
      '    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {\n' +
      '      script.push({ type: "remove", value: before[i] });\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      script.push({ type: "add", value: after[j] });\n' +
      '      j += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  while (i < n) {\n' +
      '    script.push({ type: "remove", value: before[i] });\n' +
      '    i += 1;\n' +
      '  }\n' +
      '  while (j < m) {\n' +
      '    script.push({ type: "add", value: after[j] });\n' +
      '    j += 1;\n' +
      '  }\n' +
      '  return script;\n' +
      '}\n',
    solutionExplanation:
      'A minimal edit script and a longest common subsequence are two views of the same thing: every element not in the LCS must be either removed or added, so maximising what is kept minimises what is edited. The table is filled from the bottom-right so that `lcs[i][j]` always means "the LCS of the remaining suffixes", which is what lets the reconstruction walk *forwards* and emit operations in order — filling it the other way round would produce the script backwards and need reversing.\n\nThe tie-break is the `>=` in the middle branch. When removing and adding lead to equally good outcomes, preferring the removal is what produces the specified ordering, and it is why `["a"] → ["b"]` comes out as remove-then-add rather than the reverse. Both are minimal; only one is deterministic.\n\nThe cost is O(n×m) in time and space, which is why the 200-element test finishes instantly where the exponential "try every subsequence" approach would not. Real diff tools use Myers\' algorithm, which is O((n+m)·d) where d is the size of the difference — dramatically better when two large files are nearly identical, which is the common case.',
  },

  {
    id: 'ch-exp-router',
    slug: 'a-route-matcher',
    title: 'A Route Matcher',
    difficulty: DIFFICULTY.EXPERT,
    category: CATEGORY,
    topicIds: ['algorithms', 'strings', 'objects'],
    xp: XP_E,
    prompt:
      'Build the matching core of a router. `createRouter(routes)` takes patterns like `/users/:id`, `/files/*rest` and `/` mapped to handlers, and returns `match(path)` giving `{ handler, params }` or `null`. A `:name` segment captures one segment; a `*name` captures the remainder including slashes and may only appear last. Specificity decides ties regardless of declaration order: a literal segment beats a parameter, which beats a wildcard. Values are percent-decoded.',
    examples: [
      'const match = createRouter({ "/users/new": a, "/users/:id": b, "/files/*rest": c });\nmatch("/users/new");        // { handler: a, params: {} }\nmatch("/users/42");         // { handler: b, params: { id: "42" } }\nmatch("/files/a/b.txt");    // { handler: c, params: { rest: "a/b.txt" } }',
    ],
    constraints: ['A literal beats a parameter beats a wildcard, whatever the declaration order.', 'A wildcard captures the rest of the path, including slashes.', 'Captured values are percent-decoded.'],
    starterCode: 'function createRouter(routes) {\n  // Your code here\n}\n',
    tests: [
      { name: 'matches a literal route', body: 'const m = createRouter({ "/about": "A" }); expect(m("/about").handler).toBe("A");' },
      { name: 'matches the root', body: 'const m = createRouter({ "/": "root" }); expect(m("/").handler).toBe("root");' },
      { name: 'returns null for no match', body: 'const m = createRouter({ "/about": "A" }); expect(m("/nope")).toBe(null);' },
      { name: 'captures a parameter', body: 'const m = createRouter({ "/users/:id": "U" }); expect(m("/users/42").params).toEqual({ id: "42" });' },
      { name: 'captures several parameters', body: 'const m = createRouter({ "/a/:x/b/:y": "R" }); expect(m("/a/1/b/2").params).toEqual({ x: "1", y: "2" });' },
      { name: 'a literal beats a parameter', body: 'const m = createRouter({ "/users/:id": "P", "/users/new": "L" }); expect(m("/users/new").handler).toBe("L");' },
      { name: 'declaration order does not matter', body: 'const m = createRouter({ "/users/new": "L", "/users/:id": "P" }); expect(m("/users/new").handler).toBe("L"); expect(m("/users/42").handler).toBe("P");' },
      { name: 'a parameter still matches other values', body: 'const m = createRouter({ "/users/:id": "P", "/users/new": "L" }); expect(m("/users/42").handler).toBe("P");' },
      { name: 'captures a wildcard', body: 'const m = createRouter({ "/files/*rest": "W" }); expect(m("/files/a/b.txt").params).toEqual({ rest: "a/b.txt" });' },
      { name: 'a parameter beats a wildcard', body: 'const m = createRouter({ "/files/*rest": "W", "/files/:name": "P" }); expect(m("/files/a.txt").handler).toBe("P");' },
      { name: 'a wildcard matches a deeper path', body: 'const m = createRouter({ "/files/*rest": "W", "/files/:name": "P" }); expect(m("/files/a/b").handler).toBe("W");' },
      { name: 'a wildcard can match an empty remainder', body: 'const m = createRouter({ "/files/*rest": "W" }); expect(m("/files/").params).toEqual({ rest: "" });' },
      { name: 'params is empty for a literal route', body: 'const m = createRouter({ "/about": "A" }); expect(m("/about").params).toEqual({});' },
      { name: 'a shorter path does not match a longer pattern', body: 'const m = createRouter({ "/a/b/c": "R" }); expect(m("/a/b")).toBe(null);' },
      { name: 'a longer path does not match a shorter pattern', body: 'const m = createRouter({ "/a/b": "R" }); expect(m("/a/b/c")).toBe(null);' },
      { name: 'percent-decodes a captured value', body: 'const m = createRouter({ "/users/:name": "U" }); expect(m("/users/ada%20lovelace").params).toEqual({ name: "ada lovelace" });' },
      { name: 'a parameter does not cross a slash', body: 'const m = createRouter({ "/users/:id": "U" }); expect(m("/users/a/b")).toBe(null);' },
      { name: 'specificity is compared segment by segment', body: 'const m = createRouter({ "/:a/:b": "PP", "/x/:b": "LP", "/:a/y": "PL" }); expect(m("/x/y").handler).toBe("LP");', hidden: true },
      { name: 'handles many routes', body: 'const routes = {}; for (let i = 0; i < 100; i += 1) routes["/r" + i + "/:id"] = "H" + i; const m = createRouter(routes); expect(m("/r50/7").handler).toBe("H50"); expect(m("/r50/7").params).toEqual({ id: "7" });', hidden: true },
    ],
    hints: [
      'Pre-split every pattern into segments once, at creation time, recording for each segment whether it is a literal, a parameter or a wildcard.',
      'Collect *every* pattern that matches, then choose between them — trying to pick the best one during matching leads to order-dependent bugs.',
      'Score a match segment by segment: give a literal a higher value than a parameter and a parameter a higher value than a wildcard, then compare the score arrays left to right so an earlier segment always outranks a later one.',
    ],
    solution:
      'function createRouter(routes) {\n' +
      '  const compiled = Object.entries(routes).map(([pattern, handler]) => ({\n' +
      '    handler,\n' +
      '    segments: pattern.split("/").filter((s) => s !== ""),\n' +
      '  }));\n' +
      '\n' +
      '  const LITERAL = 3;\n' +
      '  const PARAM = 2;\n' +
      '  const WILD = 1;\n' +
      '\n' +
      '  function tryMatch(route, parts, rawPath) {\n' +
      '    const params = {};\n' +
      '    const score = [];\n' +
      '    for (let i = 0; i < route.segments.length; i += 1) {\n' +
      '      const segment = route.segments[i];\n' +
      '      if (segment.startsWith("*")) {\n' +
      '        const rest = parts.slice(i).join("/");\n' +
      '        params[segment.slice(1)] = decodeURIComponent(rest);\n' +
      '        score.push(WILD);\n' +
      '        return { handler: route.handler, params, score };\n' +
      '      }\n' +
      '      if (i >= parts.length) return null;\n' +
      '      if (segment.startsWith(":")) {\n' +
      '        params[segment.slice(1)] = decodeURIComponent(parts[i]);\n' +
      '        score.push(PARAM);\n' +
      '      } else {\n' +
      '        if (segment !== parts[i]) return null;\n' +
      '        score.push(LITERAL);\n' +
      '      }\n' +
      '    }\n' +
      '    if (parts.length !== route.segments.length) return null;\n' +
      '    return { handler: route.handler, params, score };\n' +
      '  }\n' +
      '\n' +
      '  return function match(path) {\n' +
      '    const parts = path.split("/").filter((s) => s !== "");\n' +
      '    let best = null;\n' +
      '    for (const route of compiled) {\n' +
      '      const found = tryMatch(route, parts, path);\n' +
      '      if (found === null) continue;\n' +
      '      if (best === null) {\n' +
      '        best = found;\n' +
      '        continue;\n' +
      '      }\n' +
      '      const length = Math.max(found.score.length, best.score.length);\n' +
      '      for (let i = 0; i < length; i += 1) {\n' +
      '        const a = found.score[i] ?? 0;\n' +
      '        const b = best.score[i] ?? 0;\n' +
      '        if (a !== b) {\n' +
      '          if (a > b) best = found;\n' +
      '          break;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    if (best === null) return null;\n' +
      '    return { handler: best.handler, params: best.params };\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'Collecting every match and then ranking them is what makes the result independent of declaration order — the alternative, returning the first pattern that matches, means adding a route can silently break an existing one, which is a genuinely common router bug. Comparing the score arrays left to right rather than summing them is what makes specificity behave the way people expect: `/x/:b` beats `/:a/y` because the *first* segment is where they differ, and a literal there outranks a parameter no matter what follows.\n\nThe wildcard returns immediately from the segment loop, since it consumes everything remaining; that is also why an empty remainder is a legitimate match with a captured value of `""`. The exact-length check at the end is what stops a three-segment path matching a two-segment pattern — without it, `/a/b/c` would satisfy `/a/b` by matching only a prefix.\n\nSplitting the patterns once at creation rather than on every call is the reason this stays cheap with a hundred routes: matching a path costs one pass over the pre-split segment lists rather than re-parsing every pattern string on every navigation.',
  },
];

export default challenges;
