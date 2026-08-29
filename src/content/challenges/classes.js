import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Classes & OOP';

export const challenges = [
  {
    id: 'ch-cls-event-emitter',
    slug: 'an-event-emitter',
    title: 'An Event Emitter',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['classes', 'functions', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write a class `Emitter` with `on(event, listener)`, `off(event, listener)`, `once(event, listener)` and `emit(event, ...args)`. `on` returns a function that removes the listener it added. Listeners for one event run in the order they were registered, and `emit` returns the number of listeners it called. A listener that removes itself — or another listener — during an `emit` must not corrupt the run in progress: the set of listeners called is the set that existed when `emit` began.',
    examples: [
      'const bus = new Emitter();\nconst off = bus.on("save", (id) => log(id));\nbus.emit("save", 7);   // calls the listener, returns 1\noff();\nbus.emit("save", 7);   // returns 0',
    ],
    constraints: ['Listeners run in registration order.', '`emit` returns how many listeners ran.', 'Mutating the listener set during an `emit` does not affect that emit.'],
    starterCode: 'class Emitter {\n  on(event, listener) {\n    // Your code here\n  }\n\n  off(event, listener) {\n    // Your code here\n  }\n\n  once(event, listener) {\n    // Your code here\n  }\n\n  emit(event, ...args) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'calls a registered listener', body: 'const bus = new Emitter(); let hits = 0; bus.on("x", () => { hits += 1; }); bus.emit("x"); expect(hits).toBe(1);' },
      { name: 'passes the arguments through', body: 'const bus = new Emitter(); let seen = null; bus.on("x", (a, b) => { seen = [a, b]; }); bus.emit("x", 1, 2); expect(seen).toEqual([1, 2]);' },
      { name: 'emit returns the listener count', body: 'const bus = new Emitter(); bus.on("x", () => {}); bus.on("x", () => {}); expect(bus.emit("x")).toBe(2);' },
      { name: 'emitting an unknown event returns zero', body: 'expect(new Emitter().emit("nothing")).toBe(0);' },
      { name: 'runs listeners in registration order', body: 'const bus = new Emitter(); const order = []; bus.on("x", () => order.push(1)); bus.on("x", () => order.push(2)); bus.emit("x"); expect(order).toEqual([1, 2]);' },
      { name: 'events are independent', body: 'const bus = new Emitter(); let hits = 0; bus.on("a", () => { hits += 1; }); bus.emit("b"); expect(hits).toBe(0);' },
      { name: 'off removes a listener', body: 'const bus = new Emitter(); let hits = 0; const fn = () => { hits += 1; }; bus.on("x", fn); bus.off("x", fn); bus.emit("x"); expect(hits).toBe(0);' },
      { name: 'the return value of on removes the listener', body: 'const bus = new Emitter(); let hits = 0; const off = bus.on("x", () => { hits += 1; }); off(); bus.emit("x"); expect(hits).toBe(0);' },
      { name: 'off only removes the named listener', body: 'const bus = new Emitter(); let hits = 0; const a = () => { hits += 1; }; const b = () => { hits += 1; }; bus.on("x", a); bus.on("x", b); bus.off("x", a); bus.emit("x"); expect(hits).toBe(1);' },
      { name: 'once runs only the first time', body: 'const bus = new Emitter(); let hits = 0; bus.once("x", () => { hits += 1; }); bus.emit("x"); bus.emit("x"); expect(hits).toBe(1);' },
      { name: 'once receives the arguments', body: 'const bus = new Emitter(); let seen = null; bus.once("x", (v) => { seen = v; }); bus.emit("x", "value"); expect(seen).toBe("value");' },
      {
        name: 'a listener removing itself does not skip the next one',
        body:
          'const bus = new Emitter();\n' +
          'const order = [];\n' +
          'const first = () => { order.push(1); bus.off("x", first); };\n' +
          'bus.on("x", first);\n' +
          'bus.on("x", () => order.push(2));\n' +
          'bus.emit("x");\n' +
          'expect(order).toEqual([1, 2]);',
      },
      {
        name: 'a listener added during an emit does not run in that emit',
        body:
          'const bus = new Emitter();\n' +
          'let added = 0;\n' +
          'bus.on("x", () => { bus.on("x", () => { added += 1; }); });\n' +
          'bus.emit("x");\n' +
          'expect(added).toBe(0);\n' +
          'bus.emit("x");\n' +
          'expect(added).toBe(1);',
        hidden: true,
      },
      { name: 'the same function can be registered twice', body: 'const bus = new Emitter(); let hits = 0; const fn = () => { hits += 1; }; bus.on("x", fn); bus.on("x", fn); bus.emit("x"); expect(hits).toBe(2);', hidden: true },
    ],
    hints: [
      'A `Map` from event name to an array of listeners is the natural store.',
      'In `emit`, iterate over a *copy* of the array. That is what makes adding or removing listeners during the emit safe.',
      '`once` can be built on `on`: register a wrapper that removes itself first and then calls the real listener.',
    ],
    solution:
      'class Emitter {\n' +
      '  #listeners = new Map();\n' +
      '\n' +
      '  on(event, listener) {\n' +
      '    if (!this.#listeners.has(event)) this.#listeners.set(event, []);\n' +
      '    this.#listeners.get(event).push(listener);\n' +
      '    return () => this.off(event, listener);\n' +
      '  }\n' +
      '\n' +
      '  off(event, listener) {\n' +
      '    const list = this.#listeners.get(event);\n' +
      '    if (!list) return;\n' +
      '    const index = list.indexOf(listener);\n' +
      '    if (index !== -1) list.splice(index, 1);\n' +
      '  }\n' +
      '\n' +
      '  once(event, listener) {\n' +
      '    const wrapper = (...args) => {\n' +
      '      this.off(event, wrapper);\n' +
      '      listener(...args);\n' +
      '    };\n' +
      '    return this.on(event, wrapper);\n' +
      '  }\n' +
      '\n' +
      '  emit(event, ...args) {\n' +
      '    const list = this.#listeners.get(event);\n' +
      '    if (!list) return 0;\n' +
      '    const snapshot = [...list];\n' +
      '    for (const listener of snapshot) listener(...args);\n' +
      '    return snapshot.length;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The single most important line is `const snapshot = [...list]`. Iterating the live array while a listener splices itself out shifts every later element down by one, so the next listener is silently skipped — a bug that only appears when a listener unsubscribes itself, which is exactly what `once` does. Copying first fixes both directions: removals during the emit still run (they were in the snapshot) and additions do not (they were not). `once` is built on `on` rather than duplicating its logic, and it removes the wrapper *before* invoking the real listener so that a listener which re-emits the same event does not recurse forever. Using `indexOf` in `off` means the same function registered twice removes only one registration, matching how the DOM behaves.',
  },

  {
    id: 'ch-cls-private-state',
    slug: 'genuinely-private-balance',
    title: 'Genuinely Private Balance',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['classes', 'errors', 'metaprogramming'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write a class `Account` holding a balance that outside code cannot reach or corrupt. Expose `deposit(amount)`, `withdraw(amount)` and a read-only `balance` getter. A deposit or withdrawal of zero or less is invalid — throw a `RangeError`. A withdrawal exceeding the balance throws an `Error` with the message `"insufficient funds"`, leaving the balance untouched. Assigning to `balance` from outside must not change anything. Use a `#private` field, not a naming convention.',
    examples: [
      'const a = new Account(100);\na.deposit(50);\na.balance;        // 150\na.balance = 999;  // ignored — or throws in strict mode\na.balance;        // still 150',
    ],
    constraints: ['The balance is a `#private` field.', '`balance` is a getter with no setter.', 'A failed withdrawal leaves the balance unchanged.'],
    starterCode: 'class Account {\n  constructor(initial = 0) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'starts at the given balance', body: 'expect(new Account(100).balance).toBe(100);' },
      { name: 'starts at zero by default', body: 'expect(new Account().balance).toBe(0);' },
      { name: 'deposits increase the balance', body: 'const a = new Account(100); a.deposit(50); expect(a.balance).toBe(150);' },
      { name: 'withdrawals decrease the balance', body: 'const a = new Account(100); a.withdraw(40); expect(a.balance).toBe(60);' },
      { name: 'rejects a deposit of zero', body: 'expect(() => new Account(10).deposit(0)).toThrow(RangeError);' },
      { name: 'rejects a negative deposit', body: 'expect(() => new Account(10).deposit(-5)).toThrow(RangeError);' },
      { name: 'rejects a negative withdrawal', body: 'expect(() => new Account(10).withdraw(-5)).toThrow(RangeError);' },
      { name: 'rejects an overdraft', body: 'let e = null; try { new Account(10).withdraw(50); } catch (err) { e = err; } expect(e.message).toBe("insufficient funds");' },
      { name: 'a failed withdrawal leaves the balance alone', body: 'const a = new Account(10); try { a.withdraw(50); } catch { /* expected */ } expect(a.balance).toBe(10);' },
      { name: 'withdrawing the exact balance is allowed', body: 'const a = new Account(10); a.withdraw(10); expect(a.balance).toBe(0);' },
      { name: 'assigning to balance does not change it', body: 'const a = new Account(100); try { a.balance = 999; } catch { /* strict mode throws on a setter-less accessor */ } expect(a.balance).toBe(100);' },
      { name: 'the balance is not an own enumerable property', body: 'const a = new Account(100); expect(Object.keys(a)).toEqual([]); expect(JSON.stringify(a)).toBe("{}");' },
      { name: 'two accounts are independent', body: 'const a = new Account(10); const b = new Account(20); a.deposit(5); expect(b.balance).toBe(20);' },
      { name: 'a private field is not reachable by name', body: 'const a = new Account(100); expect(Object.getOwnPropertyNames(a).length).toBe(0); expect(a["#balance"]).toBe(undefined);', hidden: true },
      { name: 'many operations accumulate correctly', body: 'const a = new Account(0); for (let i = 1; i <= 100; i += 1) a.deposit(i); expect(a.balance).toBe(5050);', hidden: true },
    ],
    hints: [
      'A field declared as `#balance` inside the class body is private at the language level — it is not a property and cannot be read from outside at all.',
      'A `get balance()` accessor with no matching setter makes the value readable but not assignable.',
      'Validate before mutating, so a rejected operation cannot leave the balance in a half-changed state.',
    ],
    solution:
      'class Account {\n' +
      '  #balance;\n' +
      '\n' +
      '  constructor(initial = 0) {\n' +
      '    this.#balance = initial;\n' +
      '  }\n' +
      '\n' +
      '  get balance() {\n' +
      '    return this.#balance;\n' +
      '  }\n' +
      '\n' +
      '  deposit(amount) {\n' +
      '    if (amount <= 0) throw new RangeError("amount must be positive");\n' +
      '    this.#balance += amount;\n' +
      '  }\n' +
      '\n' +
      '  withdraw(amount) {\n' +
      '    if (amount <= 0) throw new RangeError("amount must be positive");\n' +
      '    if (amount > this.#balance) throw new Error("insufficient funds");\n' +
      '    this.#balance -= amount;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'A `#` field is genuinely private, not merely conventional: it is not a property at all, so it never appears in `Object.keys`, `getOwnPropertyNames`, `JSON.stringify` or a spread, and there is no string that reads it from outside — `a["#balance"]` looks for an ordinary property with that odd name and finds nothing. That is a real difference from the older `_balance` convention, which any code could reach and any serialiser would leak. The getter without a setter is what makes `balance` read-only; assigning to it is a silent no-op in sloppy mode and a `TypeError` in strict mode, which is why the test tolerates both. Validating before mutating is what guarantees the failed-withdrawal test: every throw happens while the balance is still consistent.',
  },

  {
    id: 'ch-cls-iterable-range',
    slug: 'an-iterable-range',
    title: 'An Iterable Range',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['classes', 'iterators', 'metaprogramming'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write a class `Range` representing the numbers from `start` up to but not including `end`, stepping by `step` (default 1, may be negative). Make it work with `for...of`, spread and destructuring by implementing `Symbol.iterator`. It must be **re-iterable**: looping over the same instance twice gives the same values both times. Add a `length` getter reporting how many values it would produce, computed arithmetically rather than by counting, and a `has(value)` method.',
    examples: [
      'const r = new Range(0, 5);\n[...r];        // [0, 1, 2, 3, 4]\nfor (const n of r) { }   // works again\nr.length;      // 5\nr.has(3);      // true',
    ],
    constraints: ['`end` is exclusive.', 'The instance can be iterated any number of times.', '`length` is computed, not counted.'],
    starterCode: 'class Range {\n  constructor(start, end, step = 1) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'spreads into an array', body: 'expect([...new Range(0, 5)]).toEqual([0, 1, 2, 3, 4]);' },
      { name: 'works with for...of', body: 'const out = []; for (const n of new Range(1, 4)) out.push(n); expect(out).toEqual([1, 2, 3]);' },
      { name: 'the end is exclusive', body: 'expect([...new Range(0, 1)]).toEqual([0]);' },
      { name: 'honours a step', body: 'expect([...new Range(0, 10, 3)]).toEqual([0, 3, 6, 9]);' },
      { name: 'counts down with a negative step', body: 'expect([...new Range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1]);' },
      { name: 'an impossible range is empty', body: 'expect([...new Range(5, 0)]).toEqual([]);' },
      { name: 'is re-iterable', body: 'const r = new Range(0, 3); expect([...r]).toEqual([0, 1, 2]); expect([...r]).toEqual([0, 1, 2]);' },
      { name: 'destructures', body: 'const [first, second] = new Range(10, 20); expect(first).toBe(10); expect(second).toBe(11);' },
      { name: 'reports its length', body: 'expect(new Range(0, 5).length).toBe(5);' },
      { name: 'length accounts for the step', body: 'expect(new Range(0, 10, 3).length).toBe(4);' },
      { name: 'length of an impossible range is zero', body: 'expect(new Range(5, 0).length).toBe(0);' },
      { name: 'length matches what iteration produces', body: 'for (const [a, b, s] of [[0, 5, 1], [0, 10, 3], [5, 0, -1], [0, 9, 3], [2, 2, 1]]) { const r = new Range(a, b, s); expect(r.length).toBe([...r].length); }' },
      { name: 'has reports membership', body: 'const r = new Range(0, 10, 3); expect(r.has(6)).toBe(true); expect(r.has(7)).toBe(false);' },
      { name: 'has excludes the end', body: 'expect(new Range(0, 5).has(5)).toBe(false);' },
      { name: 'has includes the start', body: 'expect(new Range(2, 5).has(2)).toBe(true);' },
      { name: 'length is computed rather than counted', body: 'const r = new Range(0, 10000000); expect(r.length).toBe(10000000);', hidden: true },
      { name: 'works with Array.from', body: 'expect(Array.from(new Range(0, 3))).toEqual([0, 1, 2]);', hidden: true },
    ],
    hints: [
      'Implementing `[Symbol.iterator]()` is what makes an object work with `for...of`, spread, destructuring and `Array.from` — all four go through the same protocol.',
      'A generator method (`*[Symbol.iterator]() {}`) is the shortest way to write it, and because the method is called fresh each time, re-iterability comes for free.',
      'The count is `Math.ceil((end - start) / step)`, clamped at zero — which also works for a negative step, since both parts of the division change sign.',
    ],
    solution:
      'class Range {\n' +
      '  constructor(start, end, step = 1) {\n' +
      '    this.start = start;\n' +
      '    this.end = end;\n' +
      '    this.step = step;\n' +
      '  }\n' +
      '\n' +
      '  get length() {\n' +
      '    return Math.max(0, Math.ceil((this.end - this.start) / this.step));\n' +
      '  }\n' +
      '\n' +
      '  has(value) {\n' +
      '    const offset = value - this.start;\n' +
      '    if (offset % this.step !== 0) return false;\n' +
      '    const index = offset / this.step;\n' +
      '    return index >= 0 && index < this.length;\n' +
      '  }\n' +
      '\n' +
      '  *[Symbol.iterator]() {\n' +
      '    if (this.step > 0) {\n' +
      '      for (let n = this.start; n < this.end; n += this.step) yield n;\n' +
      '    } else {\n' +
      '      for (let n = this.start; n > this.end; n += this.step) yield n;\n' +
      '    }\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'One method unlocks four language features: `for...of`, spread, array destructuring and `Array.from` all look for `Symbol.iterator`. Writing it as a generator method is what makes the object re-iterable — the method runs afresh on each use and returns a new generator, whereas returning a stored iterator object would leave it exhausted after the first loop, a classic bug when adapting generator functions into classes. Computing `length` arithmetically rather than by consuming the iterator is the difference between an instant answer and iterating ten million times, which the hidden test measures. The `Math.ceil` handles a step that does not divide the span evenly — 0 to 10 by 3 yields four values, not three and a third — and `Math.max(0, …)` turns a negative count from an impossible range into an empty one.',
  },

  {
    id: 'ch-cls-observable-store',
    slug: 'an-observable-store',
    title: 'An Observable Store',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['classes', 'design-patterns', 'copying'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write a class `Store` holding an object of state. `getState()` returns the current state, `subscribe(listener)` registers a callback and returns an unsubscribe function, and `update(patch)` shallow-merges a patch and notifies every subscriber with the new state. Two rules make it safe to build on: the state object is **never mutated** — each update produces a new object — and an update that changes nothing notifies nobody, so subscribers are not woken for no reason.',
    examples: [
      'const store = new Store({ count: 0 });\nconst off = store.subscribe((s) => render(s));\nstore.update({ count: 1 });   // notifies\nstore.update({ count: 1 });   // no change, no notification',
    ],
    constraints: ['`update` replaces the state object rather than mutating it.', 'An update whose values all match the current state notifies nobody.', 'Values are compared with `Object.is`.'],
    starterCode: 'class Store {\n  constructor(initial = {}) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'exposes the initial state', body: 'expect(new Store({ a: 1 }).getState()).toEqual({ a: 1 });' },
      { name: 'defaults to an empty state', body: 'expect(new Store().getState()).toEqual({});' },
      { name: 'update merges a patch', body: 'const s = new Store({ a: 1, b: 2 }); s.update({ b: 3 }); expect(s.getState()).toEqual({ a: 1, b: 3 });' },
      { name: 'update adds new keys', body: 'const s = new Store({ a: 1 }); s.update({ b: 2 }); expect(s.getState()).toEqual({ a: 1, b: 2 });' },
      { name: 'the state object is replaced, not mutated', body: 'const s = new Store({ a: 1 }); const before = s.getState(); s.update({ a: 2 }); expect(before).toEqual({ a: 1 }); expect(s.getState()).not.toBe(before);' },
      { name: 'notifies subscribers', body: 'const s = new Store({ a: 1 }); let seen = null; s.subscribe((state) => { seen = state; }); s.update({ a: 2 }); expect(seen).toEqual({ a: 2 });' },
      { name: 'notifies every subscriber', body: 'const s = new Store({ a: 1 }); let hits = 0; s.subscribe(() => { hits += 1; }); s.subscribe(() => { hits += 1; }); s.update({ a: 2 }); expect(hits).toBe(2);' },
      { name: 'does not notify on subscribe', body: 'const s = new Store({ a: 1 }); let hits = 0; s.subscribe(() => { hits += 1; }); expect(hits).toBe(0);' },
      { name: 'an update that changes nothing notifies nobody', body: 'const s = new Store({ a: 1 }); let hits = 0; s.subscribe(() => { hits += 1; }); s.update({ a: 1 }); expect(hits).toBe(0);' },
      { name: 'an empty patch notifies nobody', body: 'const s = new Store({ a: 1 }); let hits = 0; s.subscribe(() => { hits += 1; }); s.update({}); expect(hits).toBe(0);' },
      { name: 'a no-op update does not replace the state object', body: 'const s = new Store({ a: 1 }); const before = s.getState(); s.update({ a: 1 }); expect(s.getState()).toBe(before);' },
      { name: 'a partly-changing patch does notify', body: 'const s = new Store({ a: 1, b: 2 }); let hits = 0; s.subscribe(() => { hits += 1; }); s.update({ a: 1, b: 3 }); expect(hits).toBe(1);' },
      { name: 'unsubscribe stops notifications', body: 'const s = new Store({ a: 1 }); let hits = 0; const off = s.subscribe(() => { hits += 1; }); off(); s.update({ a: 2 }); expect(hits).toBe(0);' },
      { name: 'unsubscribe removes only that listener', body: 'const s = new Store({ a: 1 }); let hits = 0; const off = s.subscribe(() => { hits += 1; }); s.subscribe(() => { hits += 1; }); off(); s.update({ a: 2 }); expect(hits).toBe(1);' },
      { name: 'treats NaN as unchanged', body: 'const s = new Store({ a: NaN }); let hits = 0; s.subscribe(() => { hits += 1; }); s.update({ a: NaN }); expect(hits).toBe(0);', hidden: true },
      { name: 'a distinct object with equal contents counts as a change', body: 'const s = new Store({ a: { x: 1 } }); let hits = 0; s.subscribe(() => { hits += 1; }); s.update({ a: { x: 1 } }); expect(hits).toBe(1);', hidden: true },
    ],
    hints: [
      'Compare each patch key against the current state before deciding to do anything at all. If every value already matches, return early.',
      '`Object.is` is the right comparison: it treats `NaN` as equal to itself, and it correctly reports two distinct objects as different.',
      'Build the new state with a spread rather than assigning into the existing object, so anything holding the old reference keeps seeing the old values.',
    ],
    solution:
      'class Store {\n' +
      '  #state;\n' +
      '\n' +
      '  #listeners = new Set();\n' +
      '\n' +
      '  constructor(initial = {}) {\n' +
      '    this.#state = { ...initial };\n' +
      '  }\n' +
      '\n' +
      '  getState() {\n' +
      '    return this.#state;\n' +
      '  }\n' +
      '\n' +
      '  subscribe(listener) {\n' +
      '    this.#listeners.add(listener);\n' +
      '    return () => this.#listeners.delete(listener);\n' +
      '  }\n' +
      '\n' +
      '  update(patch) {\n' +
      '    const changed = Object.keys(patch).some((key) => !Object.is(this.#state[key], patch[key]));\n' +
      '    if (!changed) return;\n' +
      '    this.#state = { ...this.#state, ...patch };\n' +
      '    for (const listener of [...this.#listeners]) listener(this.#state);\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The two invariants reinforce each other. Because the state object is replaced rather than mutated, any consumer can compare the object it last saw against the current one with `===` and know instantly whether anything changed — that identity check is what lets a UI skip re-rendering whole subtrees. And because a no-op update returns before replacing the object, that identity stays stable when nothing actually happened, which the "does not replace the state object" test pins down. `Object.is` is chosen deliberately: it treats `NaN` as unchanged, where `===` would report a spurious change on every update, and it reports two structurally identical objects as different, which is the correct answer for a shallow store that cannot know whether their contents matter. Iterating a copy of the listener set means a subscriber that unsubscribes during a notification cannot disturb the run in progress.',
  },

  {
    id: 'ch-cls-result',
    slug: 'a-result-type',
    title: 'A Result Type',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['classes', 'errors', 'design-patterns'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Exceptions are invisible in a function signature, so callers forget to handle them. Write a class `Result` making success and failure explicit values. Provide static factories `Result.ok(value)` and `Result.err(error)`, the boolean getters `isOk` and `isErr`, `unwrap()` returning the value or throwing the error, `unwrapOr(fallback)`, and `map(fn)` which transforms a success and passes a failure through untouched. Add `Result.from(fn)` running a function and capturing a thrown error as a failure.',
    examples: [
      'Result.ok(2).map((n) => n * 3).unwrap();     // 6',
      'Result.err(new Error("no")).map(f).unwrapOr(0);  // 0 — f never ran',
      'Result.from(() => JSON.parse("{bad")).isErr;     // true',
    ],
    constraints: ['`map` does not run its callback on a failure.', '`unwrap` throws the stored error for a failure.', '`Result.from` captures a thrown error rather than letting it escape.'],
    starterCode: 'class Result {\n  static ok(value) {\n    // Your code here\n  }\n\n  static err(error) {\n    // Your code here\n  }\n\n  static from(fn) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'ok is ok', body: 'expect(Result.ok(1).isOk).toBe(true); expect(Result.ok(1).isErr).toBe(false);' },
      { name: 'err is err', body: 'const r = Result.err(new Error("x")); expect(r.isErr).toBe(true); expect(r.isOk).toBe(false);' },
      { name: 'unwrap returns the value', body: 'expect(Result.ok(42).unwrap()).toBe(42);' },
      { name: 'unwrap throws the stored error', body: 'const e = new Error("boom"); let caught = null; try { Result.err(e).unwrap(); } catch (err) { caught = err; } expect(caught).toBe(e);' },
      { name: 'unwrapOr returns the value on success', body: 'expect(Result.ok(1).unwrapOr(99)).toBe(1);' },
      { name: 'unwrapOr returns the fallback on failure', body: 'expect(Result.err(new Error("x")).unwrapOr(99)).toBe(99);' },
      { name: 'unwrapOr does not mask a falsy success value', body: 'expect(Result.ok(0).unwrapOr(99)).toBe(0);' },
      { name: 'map transforms a success', body: 'expect(Result.ok(2).map((n) => n * 3).unwrap()).toBe(6);' },
      { name: 'map passes a failure through', body: 'const e = new Error("x"); expect(Result.err(e).map((n) => n * 3).isErr).toBe(true);' },
      { name: 'map does not run its callback on a failure', body: 'let ran = 0; Result.err(new Error("x")).map(() => { ran += 1; }); expect(ran).toBe(0);' },
      { name: 'map preserves the original error', body: 'const e = new Error("x"); let caught = null; try { Result.err(e).map((n) => n).unwrap(); } catch (err) { caught = err; } expect(caught).toBe(e);' },
      { name: 'map chains', body: 'expect(Result.ok(1).map((n) => n + 1).map((n) => n * 10).unwrap()).toBe(20);' },
      { name: 'from captures a success', body: 'expect(Result.from(() => 5).unwrap()).toBe(5);' },
      { name: 'from captures a thrown error', body: 'const r = Result.from(() => { throw new Error("boom"); }); expect(r.isErr).toBe(true); expect(r.unwrapOr("fallback")).toBe("fallback");' },
      { name: 'from does not let the error escape', body: 'expect(() => Result.from(() => { throw new Error("boom"); })).not.toThrow();' },
      { name: 'from handles a real parse failure', body: 'expect(Result.from(() => JSON.parse("{bad")).isErr).toBe(true); expect(Result.from(() => JSON.parse("{}")).isOk).toBe(true);' },
      { name: 'map returns a Result, not a bare value', body: 'expect(Result.ok(1).map((n) => n) instanceof Result).toBe(true);', hidden: true },
      { name: 'a success holding undefined is still a success', body: 'const r = Result.ok(undefined); expect(r.isOk).toBe(true); expect(r.unwrap()).toBe(undefined);', hidden: true },
    ],
    hints: [
      'Store two things: a flag for which case this is, and the value or error. A private constructor plus static factories keeps the two cases from being mixed up.',
      '`map` on a failure should return a `Result` too — the same failure — so that chains keep working without any branching at the call site.',
      '`Result.from` is a `try`/`catch` around the call, returning `ok` or `err` accordingly.',
    ],
    solution:
      'class Result {\n' +
      '  #ok;\n' +
      '\n' +
      '  #value;\n' +
      '\n' +
      '  #error;\n' +
      '\n' +
      '  constructor(ok, value, error) {\n' +
      '    this.#ok = ok;\n' +
      '    this.#value = value;\n' +
      '    this.#error = error;\n' +
      '  }\n' +
      '\n' +
      '  static ok(value) {\n' +
      '    return new Result(true, value, undefined);\n' +
      '  }\n' +
      '\n' +
      '  static err(error) {\n' +
      '    return new Result(false, undefined, error);\n' +
      '  }\n' +
      '\n' +
      '  static from(fn) {\n' +
      '    try {\n' +
      '      return Result.ok(fn());\n' +
      '    } catch (error) {\n' +
      '      return Result.err(error);\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  get isOk() {\n' +
      '    return this.#ok;\n' +
      '  }\n' +
      '\n' +
      '  get isErr() {\n' +
      '    return !this.#ok;\n' +
      '  }\n' +
      '\n' +
      '  unwrap() {\n' +
      '    if (!this.#ok) throw this.#error;\n' +
      '    return this.#value;\n' +
      '  }\n' +
      '\n' +
      '  unwrapOr(fallback) {\n' +
      '    return this.#ok ? this.#value : fallback;\n' +
      '  }\n' +
      '\n' +
      '  map(fn) {\n' +
      '    return this.#ok ? Result.ok(fn(this.#value)) : this;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The point of this pattern is that failure becomes a value the type system and the reader can both see, rather than an invisible second exit hidden in the function body. `map` returning `this` for a failure is what makes chains work without branching: a failure flows through any number of `map` calls untouched, and only the final `unwrap` or `unwrapOr` has to deal with it — the same short-circuiting idea as optional chaining. Storing the ok flag separately from the value is what keeps `Result.ok(undefined)` a genuine success; inferring success from "is there a value" would misclassify it. `unwrapOr` uses the flag rather than `??` for exactly the same reason, which is what makes `Result.ok(0).unwrapOr(99)` correctly return 0.',
  },

  {
    id: 'ch-cls-inheritance',
    slug: 'a-shape-hierarchy',
    title: 'A Shape Hierarchy',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['classes', 'prototypes', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write a base class `Shape` and two subclasses. `Shape` takes a `name`, exposes it read-only, and declares an `area()` method that throws a `TypeError` — a bare shape has no area, and a subclass that forgets to implement it should fail loudly rather than silently returning `undefined`. `Rectangle(width, height)` and `Circle(radius)` implement `area()`. Every shape has a `describe()` returning `"<name> with area <area rounded to 2 places>"`, defined once on `Shape` and inherited unchanged.',
    examples: [
      'new Rectangle(3, 4).describe();   // "rectangle with area 12"',
      'new Circle(1).describe();         // "circle with area 3.14"',
      'new Shape("blob").area();         // throws TypeError',
    ],
    constraints: ['`describe` is defined only on `Shape`.', '`Shape.prototype.area` throws a `TypeError`.', 'The area is rounded to two decimal places, with trailing zeros dropped.'],
    starterCode: 'class Shape {\n  constructor(name) {\n    // Your code here\n  }\n}\n\nclass Rectangle extends Shape {\n  // Your code here\n}\n\nclass Circle extends Shape {\n  // Your code here\n}\n',
    tests: [
      { name: 'a rectangle knows its area', body: 'expect(new Rectangle(3, 4).area()).toBe(12);' },
      { name: 'a circle knows its area', body: 'expect(new Circle(2).area()).toBeCloseTo(Math.PI * 4, 10);' },
      { name: 'a bare shape refuses to have an area', body: 'expect(() => new Shape("blob").area()).toThrow(TypeError);' },
      { name: 'describe reads well for a rectangle', body: 'expect(new Rectangle(3, 4).describe()).toBe("rectangle with area 12");' },
      { name: 'describe rounds to two places', body: 'expect(new Circle(1).describe()).toBe("circle with area 3.14");' },
      { name: 'describe drops trailing zeros', body: 'expect(new Rectangle(2, 5).describe()).toBe("rectangle with area 10");' },
      { name: 'describe is defined only on Shape', body: 'expect(Object.hasOwn(Rectangle.prototype, "describe")).toBe(false); expect(Object.hasOwn(Shape.prototype, "describe")).toBe(true);' },
      { name: 'subclasses are instances of Shape', body: 'expect(new Rectangle(1, 1) instanceof Shape).toBe(true); expect(new Circle(1) instanceof Shape).toBe(true);' },
      { name: 'a rectangle is not a circle', body: 'expect(new Rectangle(1, 1) instanceof Circle).toBe(false);' },
      { name: 'the name is set by the subclass', body: 'expect(new Rectangle(1, 1).name).toBe("rectangle"); expect(new Circle(1).name).toBe("circle");' },
      { name: 'the name is read-only', body: 'const r = new Rectangle(1, 1); try { r.name = "changed"; } catch { /* strict mode throws */ } expect(r.name).toBe("rectangle");' },
      { name: 'describe works polymorphically over a mixed list', body: 'const shapes = [new Rectangle(2, 2), new Circle(1)]; expect(shapes.map((s) => s.describe())).toEqual(["rectangle with area 4", "circle with area 3.14"]);' },
      { name: 'a zero-sized rectangle has zero area', body: 'expect(new Rectangle(0, 5).area()).toBe(0);', hidden: true },
      { name: 'the prototype chain is intact', body: 'expect(Object.getPrototypeOf(Rectangle.prototype)).toBe(Shape.prototype);', hidden: true },
    ],
    hints: [
      'A subclass constructor must call `super(...)` before touching `this` — that is what runs the base constructor and creates the instance.',
      '`describe` calls `this.area()`, and `this` refers to the actual instance, so the subclass override is what runs. That is polymorphism, and it is why `describe` only needs to exist once.',
      'For the rounding, `Number(x.toFixed(2))` gives two places and drops a trailing `.00` when the value stringifies.',
    ],
    solution:
      'class Shape {\n' +
      '  #name;\n' +
      '\n' +
      '  constructor(name) {\n' +
      '    this.#name = name;\n' +
      '  }\n' +
      '\n' +
      '  get name() {\n' +
      '    return this.#name;\n' +
      '  }\n' +
      '\n' +
      '  area() {\n' +
      '    throw new TypeError(this.#name + " does not implement area()");\n' +
      '  }\n' +
      '\n' +
      '  describe() {\n' +
      '    return this.name + " with area " + Number(this.area().toFixed(2));\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'class Rectangle extends Shape {\n' +
      '  constructor(width, height) {\n' +
      '    super("rectangle");\n' +
      '    this.width = width;\n' +
      '    this.height = height;\n' +
      '  }\n' +
      '\n' +
      '  area() {\n' +
      '    return this.width * this.height;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'class Circle extends Shape {\n' +
      '  constructor(radius) {\n' +
      '    super("circle");\n' +
      '    this.radius = radius;\n' +
      '  }\n' +
      '\n' +
      '  area() {\n' +
      '    return Math.PI * this.radius ** 2;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      '`describe` is written once and works for every subclass because `this.area()` is resolved at call time against the actual instance — the method found is the subclass override, not the base one. That is the whole payoff of the hierarchy, and the mixed-list test demonstrates it. The throwing `area` on the base makes the contract explicit: JavaScript has no abstract methods, so a subclass that forgets to implement it would otherwise inherit a method returning `undefined` and produce `"blob with area NaN"` rather than an error pointing at the real problem. Note that `super(...)` must come before any use of `this` in a derived constructor — the specification leaves `this` uninitialised until `super` returns, and touching it earlier throws a `ReferenceError`.',
  },

  {
    id: 'ch-cls-mixin',
    slug: 'composing-behaviour-with-mixins',
    title: 'Composing Behaviour with Mixins',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['classes', 'prototypes', 'design-patterns'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'JavaScript has single inheritance, so a class cannot extend two bases. Mixins work around that: a mixin is a function taking a base class and returning a subclass with extra behaviour, so they can be stacked. Write `Serializable(Base)` adding a `toJSON()` that returns a shallow copy of the instance\'s own enumerable properties, and `Timestamped(Base)` adding a `createdAt` property set at construction from an injected clock and a `age(now)` method. Both must call through to the base constructor so any combination works.',
    examples: [
      'class Note {}\nclass Rich extends Serializable(Timestamped(Note)) {}\nconst n = new Rich({ now: () => 1000 });\nn.age(1500);  // 500',
    ],
    constraints: ['A mixin takes a class and returns a class.', 'Both mixins forward their constructor arguments to the base.', 'Order of application must not break either mixin.'],
    starterCode: 'function Serializable(Base) {\n  // Your code here\n}\n\nfunction Timestamped(Base) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'Serializable adds toJSON',
        body:
          'class Note { constructor() { this.title = "t"; } }\n' +
          'class S extends Serializable(Note) {}\n' +
          'expect(new S().toJSON()).toEqual({ title: "t" });',
      },
      {
        name: 'toJSON copies own enumerable properties',
        body:
          'class Note { constructor() { this.a = 1; this.b = 2; } }\n' +
          'class S extends Serializable(Note) {}\n' +
          'expect(Object.keys(new S().toJSON()).sort()).toEqual(["a", "b"]);',
      },
      {
        name: 'toJSON returns a copy, not the instance',
        body:
          'class Note { constructor() { this.a = 1; } }\n' +
          'class S extends Serializable(Note) {}\n' +
          'const n = new S();\n' +
          'expect(n.toJSON()).not.toBe(n);',
      },
      {
        name: 'JSON.stringify picks up toJSON',
        body:
          'class Note { constructor() { this.a = 1; } }\n' +
          'class S extends Serializable(Note) {}\n' +
          'expect(JSON.stringify(new S())).toBe(\'{"a":1}\');',
      },
      {
        name: 'Timestamped records the injected time',
        body:
          'class Note {}\n' +
          'class T extends Timestamped(Note) {}\n' +
          'expect(new T({ now: () => 1000 }).createdAt).toBe(1000);',
      },
      {
        name: 'age measures against the given time',
        body:
          'class Note {}\n' +
          'class T extends Timestamped(Note) {}\n' +
          'expect(new T({ now: () => 1000 }).age(1500)).toBe(500);',
      },
      {
        name: 'the two mixins stack',
        body:
          'class Note {}\n' +
          'class Rich extends Serializable(Timestamped(Note)) {}\n' +
          'const n = new Rich({ now: () => 1000 });\n' +
          'expect(n.age(1500)).toBe(500);\n' +
          'expect(typeof n.toJSON).toBe("function");',
      },
      {
        name: 'they stack in the other order too',
        body:
          'class Note {}\n' +
          'class Rich extends Timestamped(Serializable(Note)) {}\n' +
          'const n = new Rich({ now: () => 2000 });\n' +
          'expect(n.age(2001)).toBe(1);\n' +
          'expect(typeof n.toJSON).toBe("function");',
      },
      {
        name: 'the base constructor still runs',
        body:
          'let ran = 0;\n' +
          'class Note { constructor() { ran += 1; } }\n' +
          'class Rich extends Serializable(Timestamped(Note)) {}\n' +
          'new Rich({ now: () => 0 });\n' +
          'expect(ran).toBe(1);',
      },
      {
        name: 'constructor arguments reach the base',
        body:
          'class Note { constructor(options) { this.title = options.title; } }\n' +
          'class Rich extends Timestamped(Note) {}\n' +
          'expect(new Rich({ title: "hello", now: () => 0 }).title).toBe("hello");',
      },
      {
        name: 'instances are still instances of the original base',
        body:
          'class Note {}\n' +
          'class Rich extends Serializable(Timestamped(Note)) {}\n' +
          'expect(new Rich({ now: () => 0 }) instanceof Note).toBe(true);',
      },
      {
        name: 'a mixin does not modify the base class',
        body:
          'class Note {}\n' +
          'Serializable(Note);\n' +
          'expect(Object.hasOwn(Note.prototype, "toJSON")).toBe(false);',
      },
      {
        name: 'toJSON includes createdAt when stacked',
        body:
          'class Note {}\n' +
          'class Rich extends Serializable(Timestamped(Note)) {}\n' +
          'expect(new Rich({ now: () => 42 }).toJSON().createdAt).toBe(42);',
        hidden: true,
      },
      {
        name: 'the same mixin can be applied to different bases',
        body:
          'class A {}\n' +
          'class B {}\n' +
          'class SA extends Serializable(A) {}\n' +
          'class SB extends Serializable(B) {}\n' +
          'expect(typeof new SA().toJSON).toBe("function");\n' +
          'expect(typeof new SB().toJSON).toBe("function");\n' +
          'expect(new SA() instanceof B).toBe(false);',
        hidden: true,
      },
    ],
    hints: [
      'A mixin returns an anonymous class expression: `return class extends Base { ... }`.',
      'Its constructor should take a rest parameter and pass it straight to `super(...args)`, so it works whatever the base expects.',
      '`Object.assign({}, this)` copies own enumerable properties, which is exactly what `toJSON` needs — and note that private `#` fields are not copied, by design.',
    ],
    solution:
      'function Serializable(Base) {\n' +
      '  return class extends Base {\n' +
      '    toJSON() {\n' +
      '      return { ...this };\n' +
      '    }\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'function Timestamped(Base) {\n' +
      '  return class extends Base {\n' +
      '    constructor(...args) {\n' +
      '      super(...args);\n' +
      '      const options = args[0] ?? {};\n' +
      '      this.createdAt = options.now ? options.now() : 0;\n' +
      '    }\n' +
      '\n' +
      '    age(now) {\n' +
      '      return now - this.createdAt;\n' +
      '    }\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'A mixin is a class *factory*, and that is what makes it composable: because each one takes a base and returns a subclass, `Serializable(Timestamped(Note))` builds a genuine prototype chain — Note, then Timestamped, then Serializable — so `instanceof Note` still holds and every constructor in the chain runs. Forwarding `...args` to `super` unchanged is what makes the order of application irrelevant, since no mixin needs to know what the base expects. The alternative approach, copying methods onto an existing prototype with `Object.assign`, modifies the base class for every other user of it and provides no way to call the overridden version; the test that the base prototype is untouched exists to rule that out. Note that `{ ...this }` copies own enumerable properties only, so private `#` fields stay private through serialisation — usually what you want, but worth knowing rather than discovering.',
  },

  {
    id: 'ch-cls-validated-temperature',
    slug: 'getters-setters-and-invariants',
    title: 'Getters, Setters and Invariants',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['classes', 'objects', 'errors'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write a class `Temperature` storing a single value in kelvin and exposing it three ways. `kelvin`, `celsius` and `fahrenheit` are each readable and writable; setting any one of them updates the others, because there is only one underlying value. Nothing can be colder than absolute zero, so a value below 0 K — through any of the three properties — throws a `RangeError` and leaves the temperature unchanged.',
    examples: [
      'const t = new Temperature(273.15);\nt.celsius;        // 0\nt.fahrenheit = 212;\nt.celsius;        // 100\nt.celsius = -300; // throws RangeError',
    ],
    constraints: ['One stored value in kelvin; the other two are computed.', 'Setting any property validates against absolute zero.', 'A rejected assignment leaves the temperature unchanged.'],
    starterCode: 'class Temperature {\n  constructor(kelvin = 273.15) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'reads kelvin', body: 'expect(new Temperature(300).kelvin).toBe(300);' },
      { name: 'converts to celsius', body: 'expect(new Temperature(273.15).celsius).toBeCloseTo(0, 10);' },
      { name: 'converts to fahrenheit', body: 'expect(new Temperature(273.15).fahrenheit).toBeCloseTo(32, 10);' },
      { name: 'defaults to freezing point', body: 'expect(new Temperature().celsius).toBeCloseTo(0, 10);' },
      { name: 'setting celsius updates kelvin', body: 'const t = new Temperature(); t.celsius = 100; expect(t.kelvin).toBeCloseTo(373.15, 10);' },
      { name: 'setting fahrenheit updates celsius', body: 'const t = new Temperature(); t.fahrenheit = 212; expect(t.celsius).toBeCloseTo(100, 10);' },
      { name: 'setting kelvin updates fahrenheit', body: 'const t = new Temperature(); t.kelvin = 373.15; expect(t.fahrenheit).toBeCloseTo(212, 10);' },
      { name: 'boiling point round-trips', body: 'const t = new Temperature(); t.celsius = 100; expect(t.fahrenheit).toBeCloseTo(212, 10); expect(t.kelvin).toBeCloseTo(373.15, 10);' },
      { name: 'rejects a negative kelvin', body: 'expect(() => { new Temperature().kelvin = -1; }).toThrow(RangeError);' },
      { name: 'rejects a celsius below absolute zero', body: 'expect(() => { new Temperature().celsius = -300; }).toThrow(RangeError);' },
      { name: 'rejects a fahrenheit below absolute zero', body: 'expect(() => { new Temperature().fahrenheit = -500; }).toThrow(RangeError);' },
      { name: 'allows exactly absolute zero', body: 'const t = new Temperature(); t.kelvin = 0; expect(t.kelvin).toBe(0); expect(t.celsius).toBeCloseTo(-273.15, 10);' },
      { name: 'a rejected assignment leaves the value unchanged', body: 'const t = new Temperature(300); try { t.celsius = -300; } catch { /* expected */ } expect(t.kelvin).toBe(300);' },
      { name: 'the constructor rejects a negative kelvin', body: 'expect(() => new Temperature(-1)).toThrow(RangeError);', hidden: true },
      { name: 'absolute zero in celsius is allowed', body: 'const t = new Temperature(); t.celsius = -273.15; expect(t.kelvin).toBeCloseTo(0, 10);', hidden: true },
    ],
    hints: [
      'Store only kelvin. The other two properties are getters that convert on read and setters that convert on write.',
      'Route every write through a single private setter that validates once — then the rule cannot be forgotten in one of the three places.',
      'The conversions: `C = K - 273.15` and `F = C × 9/5 + 32`.',
    ],
    solution:
      'class Temperature {\n' +
      '  #kelvin;\n' +
      '\n' +
      '  constructor(kelvin = 273.15) {\n' +
      '    this.#set(kelvin);\n' +
      '  }\n' +
      '\n' +
      '  #set(kelvin) {\n' +
      '    if (kelvin < 0) throw new RangeError("temperature cannot be below absolute zero");\n' +
      '    this.#kelvin = kelvin;\n' +
      '  }\n' +
      '\n' +
      '  get kelvin() {\n' +
      '    return this.#kelvin;\n' +
      '  }\n' +
      '\n' +
      '  set kelvin(value) {\n' +
      '    this.#set(value);\n' +
      '  }\n' +
      '\n' +
      '  get celsius() {\n' +
      '    return this.#kelvin - 273.15;\n' +
      '  }\n' +
      '\n' +
      '  set celsius(value) {\n' +
      '    this.#set(value + 273.15);\n' +
      '  }\n' +
      '\n' +
      '  get fahrenheit() {\n' +
      '    return this.celsius * (9 / 5) + 32;\n' +
      '  }\n' +
      '\n' +
      '  set fahrenheit(value) {\n' +
      '    this.celsius = (value - 32) * (5 / 9);\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'Keeping one stored value and deriving the rest is what makes the three views impossible to desynchronise — there is no second copy to fall out of date. Funnelling every write through the private `#set` means the absolute-zero rule is written once and cannot be skipped by whichever setter someone adds next, and because validation happens before assignment, a rejected write leaves the object exactly as it was. The `fahrenheit` setter delegates to the `celsius` setter rather than converting to kelvin itself, so each conversion formula appears in exactly one place. Getters and setters are what let this present as three plain properties despite the work behind them; the caller writes `t.celsius = 100` and never sees the conversion or the check.',
  },
];

export default challenges;
