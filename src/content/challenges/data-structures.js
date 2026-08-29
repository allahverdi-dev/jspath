import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Data Structures';

export const challenges = [
  {
    id: 'ch-ds-lru',
    slug: 'lru-cache',
    title: 'LRU Cache',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['data-structures', 'classes', 'performance'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'A cache with no eviction policy is a memory leak. Write a class `LRUCache` with a fixed `capacity`, exposing `get(key)`, `set(key, value)` and `size`. When a `set` would exceed the capacity, evict the **least recently used** entry. Both `get` and `set` count as a use, so reading an entry protects it from the next eviction. `get` returns `undefined` for a missing key. Overwriting an existing key updates it without growing the cache.',
    examples: [
      'const c = new LRUCache(2);\nc.set("a", 1); c.set("b", 2);\nc.get("a");        // 1 — "a" is now the most recent\nc.set("c", 3);     // evicts "b", not "a"\nc.get("b");        // undefined',
    ],
    constraints: ['`capacity` is at least 1.', 'Both `get` and `set` mark an entry as recently used.', '`size` never exceeds `capacity`.'],
    starterCode: 'class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  set(key, value) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'stores and retrieves', body: 'const c = new LRUCache(2); c.set("a", 1); expect(c.get("a")).toBe(1);' },
      { name: 'returns undefined for a missing key', body: 'const c = new LRUCache(2); expect(c.get("nope")).toBe(undefined);' },
      { name: 'reports its size', body: 'const c = new LRUCache(3); c.set("a", 1); c.set("b", 2); expect(c.size).toBe(2);' },
      { name: 'never exceeds the capacity', body: 'const c = new LRUCache(2); c.set("a", 1); c.set("b", 2); c.set("c", 3); expect(c.size).toBe(2);' },
      { name: 'evicts the least recently inserted', body: 'const c = new LRUCache(2); c.set("a", 1); c.set("b", 2); c.set("c", 3); expect(c.get("a")).toBe(undefined); expect(c.get("b")).toBe(2);' },
      { name: 'a get protects an entry from eviction', body: 'const c = new LRUCache(2); c.set("a", 1); c.set("b", 2); c.get("a"); c.set("c", 3); expect(c.get("a")).toBe(1); expect(c.get("b")).toBe(undefined);' },
      { name: 'a set on an existing key refreshes it', body: 'const c = new LRUCache(2); c.set("a", 1); c.set("b", 2); c.set("a", 9); c.set("c", 3); expect(c.get("a")).toBe(9); expect(c.get("b")).toBe(undefined);' },
      { name: 'overwriting does not grow the cache', body: 'const c = new LRUCache(2); c.set("a", 1); c.set("a", 2); expect(c.size).toBe(1);' },
      { name: 'a capacity of one holds only the newest', body: 'const c = new LRUCache(1); c.set("a", 1); c.set("b", 2); expect(c.get("a")).toBe(undefined); expect(c.get("b")).toBe(2);' },
      { name: 'stores falsy values', body: 'const c = new LRUCache(2); c.set("a", 0); expect(c.get("a")).toBe(0);' },
      { name: 'a stored undefined is indistinguishable from absence, but does occupy space', body: 'const c = new LRUCache(2); c.set("a", undefined); expect(c.size).toBe(1);' },
      { name: 'keeps number and string keys apart', body: 'const c = new LRUCache(3); c.set(1, "num"); c.set("1", "str"); expect(c.get(1)).toBe("num"); expect(c.get("1")).toBe("str");' },
      {
        name: 'evicts correctly over a long sequence',
        body:
          'const c = new LRUCache(3);\n' +
          'for (const k of ["a", "b", "c"]) c.set(k, k);\n' +
          'c.get("a");\n' +
          'c.set("d", "d");\n' +
          'expect(c.get("b")).toBe(undefined);\n' +
          'expect(c.get("a")).toBe("a");\n' +
          'expect(c.get("c")).toBe("c");\n' +
          'expect(c.get("d")).toBe("d");',
        hidden: true,
      },
      {
        name: 'stays bounded under heavy use',
        body:
          'const c = new LRUCache(50);\n' +
          'for (let i = 0; i < 5000; i += 1) c.set("k" + i, i);\n' +
          'expect(c.size).toBe(50);\n' +
          'expect(c.get("k4999")).toBe(4999);\n' +
          'expect(c.get("k0")).toBe(undefined);',
        hidden: true,
      },
    ],
    hints: [
      'A `Map` iterates in insertion order, and that order is exactly what "least recently used" needs — if you keep it accurate.',
      'To mark an entry as recently used, delete it and set it again. That moves it to the end of the iteration order.',
      '`map.keys().next().value` gives the oldest key, which is the one to evict.',
    ],
    solution:
      'class LRUCache {\n' +
      '  #entries = new Map();\n' +
      '\n' +
      '  #capacity;\n' +
      '\n' +
      '  constructor(capacity) {\n' +
      '    this.#capacity = capacity;\n' +
      '  }\n' +
      '\n' +
      '  get size() {\n' +
      '    return this.#entries.size;\n' +
      '  }\n' +
      '\n' +
      '  get(key) {\n' +
      '    if (!this.#entries.has(key)) return undefined;\n' +
      '    const value = this.#entries.get(key);\n' +
      '    this.#entries.delete(key);\n' +
      '    this.#entries.set(key, value);\n' +
      '    return value;\n' +
      '  }\n' +
      '\n' +
      '  set(key, value) {\n' +
      '    this.#entries.delete(key);\n' +
      '    this.#entries.set(key, value);\n' +
      '    if (this.#entries.size > this.#capacity) {\n' +
      '      const oldest = this.#entries.keys().next().value;\n' +
      '      this.#entries.delete(oldest);\n' +
      '    }\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The trick that makes this short is that `Map` guarantees insertion order, so "oldest entry" is simply "first key in iteration order" — and re-inserting a key moves it to the end. Delete-then-set is what refreshes an entry, and it is also why `set` handles both the new-key and existing-key cases with the same two lines: deleting a key that is not there is harmless, and it prevents an overwrite from growing the size. The unconditional `delete` in `get` is what makes reads count as uses, which is the difference between an LRU cache and a plain FIFO one. Classic implementations use a hash map plus a doubly linked list to get O(1) on every operation; `Map` already provides both the hashing and the ordering, and its delete-and-reinsert is amortised O(1) too.',
  },

  {
    id: 'ch-ds-priority-queue',
    slug: 'a-binary-heap',
    title: 'A Binary Heap',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['data-structures', 'algorithms', 'classes'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'A priority queue keeps a "next most important" item available cheaply. Write a class `MinHeap` with `push(value)`, `pop()` — removing and returning the smallest — `peek()` and `size`. Ordering comes from a `compare(a, b)` function passed to the constructor, defaulting to numeric ascending. `pop` and `peek` on an empty heap return `undefined`. Keeping a sorted array instead would make `push` O(n); a heap makes both operations O(log n).',
    examples: [
      'const h = new MinHeap();\nh.push(5); h.push(1); h.push(3);\nh.pop();   // 1\nh.peek();  // 3',
    ],
    constraints: ['`push` and `pop` must be O(log n) — no re-sorting the whole array.', 'Equal elements may come out in any order.', 'The comparator follows the usual negative/zero/positive convention.'],
    starterCode: 'class MinHeap {\n  constructor(compare = (a, b) => a - b) {\n    // Your code here\n  }\n\n  push(value) {\n    // Your code here\n  }\n\n  pop() {\n    // Your code here\n  }\n\n  peek() {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'pops the smallest', body: 'const h = new MinHeap(); h.push(5); h.push(1); h.push(3); expect(h.pop()).toBe(1);' },
      { name: 'peek does not remove', body: 'const h = new MinHeap(); h.push(2); expect(h.peek()).toBe(2); expect(h.size).toBe(1);' },
      { name: 'reports its size', body: 'const h = new MinHeap(); h.push(1); h.push(2); expect(h.size).toBe(2);' },
      { name: 'pop on an empty heap gives undefined', body: 'expect(new MinHeap().pop()).toBe(undefined);' },
      { name: 'peek on an empty heap gives undefined', body: 'expect(new MinHeap().peek()).toBe(undefined);' },
      { name: 'a single element', body: 'const h = new MinHeap(); h.push(7); expect(h.pop()).toBe(7); expect(h.size).toBe(0);' },
      {
        name: 'drains in sorted order',
        body:
          'const h = new MinHeap();\n' +
          'for (const n of [5, 3, 8, 1, 9, 2, 7]) h.push(n);\n' +
          'const out = [];\n' +
          'while (h.size > 0) out.push(h.pop());\n' +
          'expect(out).toEqual([1, 2, 3, 5, 7, 8, 9]);',
      },
      { name: 'handles duplicates', body: 'const h = new MinHeap(); for (const n of [2, 1, 2, 1]) h.push(n); expect([h.pop(), h.pop(), h.pop(), h.pop()]).toEqual([1, 1, 2, 2]);' },
      { name: 'handles negatives', body: 'const h = new MinHeap(); for (const n of [3, -5, 0]) h.push(n); expect(h.pop()).toBe(-5);' },
      {
        name: 'honours a custom comparator',
        body:
          'const h = new MinHeap((a, b) => b - a);\n' +
          'for (const n of [1, 5, 3]) h.push(n);\n' +
          'expect(h.pop()).toBe(5);',
      },
      {
        name: 'orders objects by a field',
        body:
          'const h = new MinHeap((a, b) => a.priority - b.priority);\n' +
          'h.push({ priority: 3, id: "c" });\n' +
          'h.push({ priority: 1, id: "a" });\n' +
          'expect(h.pop().id).toBe("a");',
      },
      { name: 'interleaved pushes and pops stay correct', body: 'const h = new MinHeap(); h.push(5); h.push(1); expect(h.pop()).toBe(1); h.push(0); h.push(3); expect(h.pop()).toBe(0); expect(h.pop()).toBe(3); expect(h.pop()).toBe(5);' },
      {
        name: 'stays fast on many elements',
        body:
          'const h = new MinHeap();\n' +
          'for (let i = 0; i < 50000; i += 1) h.push((i * 7919) % 50000);\n' +
          'expect(h.size).toBe(50000);\n' +
          'let previous = -1;\n' +
          'let ok = true;\n' +
          'while (h.size > 0) { const n = h.pop(); if (n < previous) ok = false; previous = n; }\n' +
          'expect(ok).toBe(true);',
        hidden: true,
      },
      { name: 'the heap empties completely', body: 'const h = new MinHeap(); for (const n of [3, 1, 2]) h.push(n); h.pop(); h.pop(); h.pop(); expect(h.size).toBe(0); expect(h.pop()).toBe(undefined);', hidden: true },
    ],
    hints: [
      'Store the heap in a plain array. The children of index `i` live at `2i + 1` and `2i + 2`, and its parent at `Math.floor((i - 1) / 2)`.',
      '`push` appends to the end and then "sifts up": while the new element is smaller than its parent, swap them.',
      '`pop` takes index 0, moves the last element into its place, and "sifts down": repeatedly swap with the smaller of its two children until neither is smaller.',
    ],
    solution:
      'class MinHeap {\n' +
      '  #items = [];\n' +
      '\n' +
      '  #compare;\n' +
      '\n' +
      '  constructor(compare = (a, b) => a - b) {\n' +
      '    this.#compare = compare;\n' +
      '  }\n' +
      '\n' +
      '  get size() {\n' +
      '    return this.#items.length;\n' +
      '  }\n' +
      '\n' +
      '  peek() {\n' +
      '    return this.#items[0];\n' +
      '  }\n' +
      '\n' +
      '  push(value) {\n' +
      '    const items = this.#items;\n' +
      '    items.push(value);\n' +
      '    let i = items.length - 1;\n' +
      '    while (i > 0) {\n' +
      '      const parent = Math.floor((i - 1) / 2);\n' +
      '      if (this.#compare(items[i], items[parent]) >= 0) break;\n' +
      '      [items[i], items[parent]] = [items[parent], items[i]];\n' +
      '      i = parent;\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  pop() {\n' +
      '    const items = this.#items;\n' +
      '    if (items.length === 0) return undefined;\n' +
      '    const top = items[0];\n' +
      '    const last = items.pop();\n' +
      '    if (items.length === 0) return top;\n' +
      '    items[0] = last;\n' +
      '\n' +
      '    let i = 0;\n' +
      '    for (;;) {\n' +
      '      const left = 2 * i + 1;\n' +
      '      const right = left + 1;\n' +
      '      let smallest = i;\n' +
      '      if (left < items.length && this.#compare(items[left], items[smallest]) < 0) smallest = left;\n' +
      '      if (right < items.length && this.#compare(items[right], items[smallest]) < 0) smallest = right;\n' +
      '      if (smallest === i) break;\n' +
      '      [items[i], items[smallest]] = [items[smallest], items[i]];\n' +
      '      i = smallest;\n' +
      '    }\n' +
      '    return top;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'A binary heap is a complete tree stored in a flat array, which is why the index arithmetic replaces pointers entirely — no nodes, no links, just `2i + 1` and `2i + 2`. The invariant is weaker than sorting: every parent is no larger than its children, which says nothing about siblings but is enough to guarantee the minimum sits at index 0. Because the tree is complete, its height is log n, so both sifts touch at most that many levels. `pop` moves the *last* element to the root rather than promoting a child, which is what keeps the tree complete; promoting a child would leave a hole in the middle and break the index arithmetic. Comparing against the smaller of the two children during the sift down is essential — swapping with the larger one would leave the heap property violated on the other side.',
  },

  {
    id: 'ch-ds-queue-two-stacks',
    slug: 'a-queue-from-two-stacks',
    title: 'A Queue from Two Stacks',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['data-structures', 'classes', 'algorithms'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Build a first-in-first-out queue using only last-in-first-out stacks. Write a class `Queue` with `enqueue(value)`, `dequeue()`, `peek()` and `size`, holding its data in two arrays used strictly as stacks — `push` and `pop` only, never `shift`, `unshift` or indexing into the middle. `dequeue` and `peek` return `undefined` when empty. Done correctly, every operation is O(1) amortised even though a single `dequeue` may occasionally do O(n) work.',
    examples: [
      'const q = new Queue();\nq.enqueue(1); q.enqueue(2);\nq.dequeue();  // 1\nq.enqueue(3);\nq.dequeue();  // 2',
    ],
    constraints: ['Data lives in two arrays used only via `push` and `pop`.', 'Do not use `shift` or `unshift`.', 'Operations are O(1) amortised.'],
    starterCode: 'class Queue {\n  enqueue(value) {\n    // Your code here\n  }\n\n  dequeue() {\n    // Your code here\n  }\n\n  peek() {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'is first in, first out', body: 'const q = new Queue(); q.enqueue(1); q.enqueue(2); expect(q.dequeue()).toBe(1); expect(q.dequeue()).toBe(2);' },
      { name: 'peek shows the front without removing', body: 'const q = new Queue(); q.enqueue(1); expect(q.peek()).toBe(1); expect(q.size).toBe(1);' },
      { name: 'reports its size', body: 'const q = new Queue(); q.enqueue(1); q.enqueue(2); expect(q.size).toBe(2);' },
      { name: 'dequeue on an empty queue gives undefined', body: 'expect(new Queue().dequeue()).toBe(undefined);' },
      { name: 'peek on an empty queue gives undefined', body: 'expect(new Queue().peek()).toBe(undefined);' },
      { name: 'size drops as items leave', body: 'const q = new Queue(); q.enqueue(1); q.dequeue(); expect(q.size).toBe(0);' },
      {
        name: 'interleaved operations stay in order',
        body:
          'const q = new Queue();\n' +
          'q.enqueue(1); q.enqueue(2);\n' +
          'expect(q.dequeue()).toBe(1);\n' +
          'q.enqueue(3);\n' +
          'expect(q.dequeue()).toBe(2);\n' +
          'expect(q.dequeue()).toBe(3);',
      },
      {
        name: 'refilling after emptying works',
        body:
          'const q = new Queue();\n' +
          'q.enqueue(1);\n' +
          'q.dequeue();\n' +
          'q.enqueue(2); q.enqueue(3);\n' +
          'expect(q.dequeue()).toBe(2);\n' +
          'expect(q.dequeue()).toBe(3);',
      },
      { name: 'handles falsy values', body: 'const q = new Queue(); q.enqueue(0); q.enqueue(false); expect(q.dequeue()).toBe(0); expect(q.dequeue()).toBe(false);' },
      { name: 'peek reflects the front after a dequeue', body: 'const q = new Queue(); q.enqueue(1); q.enqueue(2); q.dequeue(); expect(q.peek()).toBe(2);' },
      {
        name: 'preserves order over many operations',
        body:
          'const q = new Queue();\n' +
          'const out = [];\n' +
          'for (let i = 0; i < 1000; i += 1) {\n' +
          '  q.enqueue(i);\n' +
          '  if (i % 3 === 0) out.push(q.dequeue());\n' +
          '}\n' +
          'while (q.size > 0) out.push(q.dequeue());\n' +
          'expect(out).toEqual(Array.from({ length: 1000 }, (_, i) => i));',
        hidden: true,
      },
      {
        name: 'stays fast on a large workload',
        body:
          'const q = new Queue();\n' +
          'for (let i = 0; i < 100000; i += 1) q.enqueue(i);\n' +
          'let last = -1;\n' +
          'for (let i = 0; i < 100000; i += 1) last = q.dequeue();\n' +
          'expect(last).toBe(99999);\n' +
          'expect(q.size).toBe(0);',
        hidden: true,
      },
    ],
    hints: [
      'Use one stack for arriving items and another for departing ones. Enqueue always pushes onto the inbound stack.',
      'When the outbound stack is empty and something needs to leave, pop everything from the inbound stack onto the outbound one. That reverses the order, turning last-in-first-out into first-in-first-out.',
      'Only transfer when the outbound stack is empty. Transferring on every dequeue would be O(n) every time instead of amortised O(1).',
    ],
    solution:
      'class Queue {\n' +
      '  #inbound = [];\n' +
      '\n' +
      '  #outbound = [];\n' +
      '\n' +
      '  get size() {\n' +
      '    return this.#inbound.length + this.#outbound.length;\n' +
      '  }\n' +
      '\n' +
      '  #transfer() {\n' +
      '    if (this.#outbound.length > 0) return;\n' +
      '    while (this.#inbound.length > 0) {\n' +
      '      this.#outbound.push(this.#inbound.pop());\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  enqueue(value) {\n' +
      '    this.#inbound.push(value);\n' +
      '  }\n' +
      '\n' +
      '  dequeue() {\n' +
      '    this.#transfer();\n' +
      '    return this.#outbound.pop();\n' +
      '  }\n' +
      '\n' +
      '  peek() {\n' +
      '    this.#transfer();\n' +
      '    return this.#outbound[this.#outbound.length - 1];\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'Popping every item from one stack onto another reverses their order, and reversing a last-in-first-out sequence is exactly first-in-first-out — that single observation is the whole construction. The amortised analysis is the interesting part: a single `dequeue` can move n items and cost O(n), but each item is transferred exactly once in its lifetime, so n operations cost O(n) in total and the average is O(1). Transferring only when the outbound stack is empty is what preserves that guarantee; transferring eagerly on every dequeue would make each one O(n). The empty-queue cases need no special handling because `pop` on an empty array already returns `undefined`. This is not merely an interview puzzle — it is how you build an efficient queue on a substrate that only offers stack operations, and why `Array.prototype.shift` (which is O(n) as it reindexes) is worth avoiding in hot loops.',
  },

  {
    id: 'ch-ds-trie',
    slug: 'prefix-tree-autocomplete',
    title: 'Prefix Tree Autocomplete',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['data-structures', 'strings', 'classes'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Scanning every word in a dictionary on each keystroke does not scale. Write a class `Trie` with `insert(word)`, `has(word)` — an exact match — and `startingWith(prefix)`, returning every stored word with that prefix, sorted alphabetically. A trie stores words as a tree of shared character paths, so finding a prefix costs time proportional to the prefix length rather than the dictionary size. An empty prefix returns every word.',
    examples: [
      'const t = new Trie();\nfor (const w of ["car", "cart", "dog"]) t.insert(w);\nt.startingWith("car");  // ["car", "cart"]\nt.has("ca");            // false — a prefix is not a word',
    ],
    constraints: ['Words are lowercase letters.', '`has` is an exact match; a prefix of a stored word is not itself a word unless inserted.', '`startingWith` returns alphabetically sorted results.'],
    starterCode: 'class Trie {\n  insert(word) {\n    // Your code here\n  }\n\n  has(word) {\n    // Your code here\n  }\n\n  startingWith(prefix) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'finds an inserted word', body: 'const t = new Trie(); t.insert("car"); expect(t.has("car")).toBe(true);' },
      { name: 'does not find a word never inserted', body: 'const t = new Trie(); t.insert("car"); expect(t.has("dog")).toBe(false);' },
      { name: 'a prefix is not a word', body: 'const t = new Trie(); t.insert("car"); expect(t.has("ca")).toBe(false);' },
      { name: 'an extension is not a word', body: 'const t = new Trie(); t.insert("car"); expect(t.has("cart")).toBe(false);' },
      { name: 'both a word and its extension can be stored', body: 'const t = new Trie(); t.insert("car"); t.insert("cart"); expect(t.has("car")).toBe(true); expect(t.has("cart")).toBe(true);' },
      { name: 'lists words with a prefix', body: 'const t = new Trie(); for (const w of ["car", "cart", "dog"]) t.insert(w); expect(t.startingWith("car")).toEqual(["car", "cart"]);' },
      { name: 'results are sorted', body: 'const t = new Trie(); for (const w of ["cz", "ca", "cm"]) t.insert(w); expect(t.startingWith("c")).toEqual(["ca", "cm", "cz"]);' },
      { name: 'an empty prefix returns everything', body: 'const t = new Trie(); for (const w of ["b", "a"]) t.insert(w); expect(t.startingWith("")).toEqual(["a", "b"]);' },
      { name: 'an unknown prefix returns nothing', body: 'const t = new Trie(); t.insert("car"); expect(t.startingWith("z")).toEqual([]);' },
      { name: 'an empty trie has nothing', body: 'const t = new Trie(); expect(t.has("a")).toBe(false); expect(t.startingWith("")).toEqual([]);' },
      { name: 'inserting the same word twice does not duplicate it', body: 'const t = new Trie(); t.insert("car"); t.insert("car"); expect(t.startingWith("car")).toEqual(["car"]);' },
      { name: 'a full word is its own prefix match', body: 'const t = new Trie(); t.insert("car"); expect(t.startingWith("car")).toEqual(["car"]);' },
      {
        name: 'handles a larger dictionary',
        body:
          'const t = new Trie();\n' +
          'const words = [];\n' +
          'for (let i = 0; i < 500; i += 1) { const w = "w" + i; words.push(w); t.insert(w); }\n' +
          'expect(t.startingWith("w").length).toBe(500);\n' +
          'expect(t.startingWith("w1").length).toBe(words.filter((w) => w.startsWith("w1")).length);',
        hidden: true,
      },
      { name: 'handles deeply shared prefixes', body: 'const t = new Trie(); t.insert("a".repeat(100)); expect(t.has("a".repeat(100))).toBe(true); expect(t.has("a".repeat(99))).toBe(false);', hidden: true },
    ],
    hints: [
      'Each node holds a `Map` from a character to a child node, plus a flag marking whether a word ends there.',
      'That flag is what distinguishes `has("ca")` from `has("car")` — reaching a node is not the same as a word ending at it.',
      'For `startingWith`, walk down to the prefix node, then collect every word beneath it with a depth-first traversal. Visiting a node\'s children in sorted key order produces sorted output without a final sort.',
    ],
    solution:
      'class Trie {\n' +
      '  #root = { children: new Map(), isWord: false };\n' +
      '\n' +
      '  insert(word) {\n' +
      '    let node = this.#root;\n' +
      '    for (const char of word) {\n' +
      '      if (!node.children.has(char)) {\n' +
      '        node.children.set(char, { children: new Map(), isWord: false });\n' +
      '      }\n' +
      '      node = node.children.get(char);\n' +
      '    }\n' +
      '    node.isWord = true;\n' +
      '  }\n' +
      '\n' +
      '  #find(prefix) {\n' +
      '    let node = this.#root;\n' +
      '    for (const char of prefix) {\n' +
      '      node = node.children.get(char);\n' +
      '      if (node === undefined) return null;\n' +
      '    }\n' +
      '    return node;\n' +
      '  }\n' +
      '\n' +
      '  has(word) {\n' +
      '    const node = this.#find(word);\n' +
      '    return node !== null && node.isWord;\n' +
      '  }\n' +
      '\n' +
      '  startingWith(prefix) {\n' +
      '    const start = this.#find(prefix);\n' +
      '    if (start === null) return [];\n' +
      '    const out = [];\n' +
      '    const walk = (node, built) => {\n' +
      '      if (node.isWord) out.push(built);\n' +
      '      for (const char of [...node.children.keys()].sort()) {\n' +
      '        walk(node.children.get(char), built + char);\n' +
      '      }\n' +
      '    };\n' +
      '    walk(start, prefix);\n' +
      '    return out;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The `isWord` flag is what makes the structure correct rather than merely plausible: a trie node exists for every prefix of every stored word, so reaching a node proves nothing about whether a word ends there. Without the flag, `has("ca")` would return true after inserting `"car"`. Walking children in sorted key order during the traversal is what produces alphabetical output without a separate sort — a depth-first walk that always descends into the smallest character next visits words in lexicographic order by construction. The payoff over a plain word list is in the lookup cost: finding a prefix takes time proportional to the prefix length, independent of how many words are stored, which is why this structure underlies autocomplete and routing tables.',
  },

  {
    id: 'ch-ds-linked-list',
    slug: 'reverse-a-linked-list',
    title: 'Reverse a Linked List',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['data-structures', 'algorithms', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'A singly linked list is a chain of `{ value, next }` nodes ending in `null`. Write `reverseList(head)` reversing the chain **in place** — rewiring the existing nodes rather than building new ones — and returning the new head. Reversing needs only a constant amount of extra memory, however long the list. An empty list (`null`) reverses to `null`.',
    examples: [
      'const list = { value: 1, next: { value: 2, next: { value: 3, next: null } } };\nreverseList(list);\n// 3 -> 2 -> 1',
    ],
    constraints: ['Reuse the existing node objects; do not allocate new ones.', 'Use O(1) extra space — no array of nodes.', 'Return the new head.'],
    starterCode: 'function reverseList(head) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'reverses a three-node list',
        body:
          'const list = { value: 1, next: { value: 2, next: { value: 3, next: null } } };\n' +
          'let node = reverseList(list);\n' +
          'const out = [];\n' +
          'while (node) { out.push(node.value); node = node.next; }\n' +
          'expect(out).toEqual([3, 2, 1]);',
      },
      { name: 'an empty list stays empty', body: 'expect(reverseList(null)).toBe(null);' },
      { name: 'a single node is its own reverse', body: 'const list = { value: 1, next: null }; const out = reverseList(list); expect(out.value).toBe(1); expect(out.next).toBe(null);' },
      { name: 'a two-node list', body: 'const list = { value: 1, next: { value: 2, next: null } }; const out = reverseList(list); expect(out.value).toBe(2); expect(out.next.value).toBe(1); expect(out.next.next).toBe(null);' },
      {
        name: 'the old head becomes the tail',
        body:
          'const tail = { value: 3, next: null };\n' +
          'const head = { value: 1, next: { value: 2, next: tail } };\n' +
          'const out = reverseList(head);\n' +
          'expect(out).toBe(tail);\n' +
          'expect(head.next).toBe(null);',
      },
      {
        name: 'reuses the existing nodes',
        body:
          'const second = { value: 2, next: null };\n' +
          'const first = { value: 1, next: second };\n' +
          'const out = reverseList(first);\n' +
          'expect(out).toBe(second);\n' +
          'expect(out.next).toBe(first);',
      },
      {
        name: 'reversing twice restores the original order',
        body:
          'const build = (values) => values.reduceRight((next, value) => ({ value, next }), null);\n' +
          'const read = (node) => { const out = []; while (node) { out.push(node.value); node = node.next; } return out; };\n' +
          'let list = build([1, 2, 3, 4]);\n' +
          'list = reverseList(list);\n' +
          'list = reverseList(list);\n' +
          'expect(read(list)).toEqual([1, 2, 3, 4]);',
      },
      {
        name: 'the reversed list terminates',
        body:
          'const build = (values) => values.reduceRight((next, value) => ({ value, next }), null);\n' +
          'let node = reverseList(build([1, 2, 3]));\n' +
          'let steps = 0;\n' +
          'while (node && steps < 100) { node = node.next; steps += 1; }\n' +
          'expect(steps).toBe(3);',
      },
      { name: 'preserves falsy values', body: 'const list = { value: 0, next: { value: false, next: null } }; const out = reverseList(list); expect(out.value).toBe(false); expect(out.next.value).toBe(0);' },
      {
        name: 'handles a long list without recursion depth problems',
        body:
          'let head = null;\n' +
          'for (let i = 0; i < 100000; i += 1) head = { value: i, next: head };\n' +
          'const out = reverseList(head);\n' +
          'expect(out.value).toBe(0);',
        hidden: true,
      },
      {
        name: 'every value survives',
        body:
          'const build = (values) => values.reduceRight((next, value) => ({ value, next }), null);\n' +
          'let node = reverseList(build([1, 2, 3, 4, 5]));\n' +
          'const out = [];\n' +
          'while (node) { out.push(node.value); node = node.next; }\n' +
          'expect(out.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);',
        hidden: true,
      },
    ],
    hints: [
      'Walk the list keeping three references: the node before, the node you are on, and the node after.',
      'The "node after" must be saved *before* you overwrite `current.next`, or you lose the rest of the list.',
      'When the walk ends, `current` is `null` and the previous node is the new head.',
    ],
    solution:
      'function reverseList(head) {\n' +
      '  let previous = null;\n' +
      '  let current = head;\n' +
      '  while (current !== null) {\n' +
      '    const next = current.next;\n' +
      '    current.next = previous;\n' +
      '    previous = current;\n' +
      '    current = next;\n' +
      '  }\n' +
      '  return previous;\n' +
      '}\n',
    solutionExplanation:
      'Each iteration flips exactly one link, and the ordering of the four lines is the entire problem. Saving `current.next` first is what makes the rest possible: the moment `current.next` is overwritten, the only reference to the remainder of the list would be gone and everything after this node would be unreachable. The loop ends with `current` at `null` and `previous` on the last node visited, which is the new head. The whole thing uses three references regardless of length, which is why the 100,000-node test runs without trouble — a recursive version would be elegant but would overflow the stack at that depth, and collecting the nodes into an array first would use O(n) memory for no benefit.',
  },

  {
    id: 'ch-ds-tree-depth',
    slug: 'is-the-tree-balanced',
    title: 'Is the Tree Balanced?',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['data-structures', 'recursion', 'algorithms'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'A binary tree node is `{ value, left, right }` with `null` for an absent child. Write `isBalanced(root)` reporting whether every node in the tree has left and right subtrees whose heights differ by at most one. An empty tree is balanced. The naive approach recomputes each subtree\'s height once per ancestor, giving O(n²) — compute the height and the balance verdict in a single traversal instead.',
    examples: [
      'isBalanced({ value: 1, left: leaf, right: leaf });        // true',
      'isBalanced({ value: 1, left: chainOfThree, right: null }); // false',
    ],
    constraints: ['The condition must hold at *every* node, not only the root.', 'An empty tree and a single node are balanced.', 'One test uses a 5,000-node chain; an O(n²) solution will time out.'],
    starterCode: 'function isBalanced(root) {\n  // Your code here\n}\n',
    tests: [
      { name: 'an empty tree is balanced', body: 'expect(isBalanced(null)).toBe(true);' },
      { name: 'a single node is balanced', body: 'expect(isBalanced({ value: 1, left: null, right: null })).toBe(true);' },
      { name: 'a perfect tree is balanced', body: 'const leaf = () => ({ value: 0, left: null, right: null }); expect(isBalanced({ value: 1, left: leaf(), right: leaf() })).toBe(true);' },
      { name: 'a difference of one is allowed', body: 'const leaf = () => ({ value: 0, left: null, right: null }); expect(isBalanced({ value: 1, left: leaf(), right: null })).toBe(true);' },
      {
        name: 'a difference of two is not',
        body:
          'const chain = { value: 1, left: { value: 2, left: null, right: null }, right: null };\n' +
          'expect(isBalanced({ value: 0, left: chain, right: null })).toBe(false);',
      },
      {
        name: 'detects imbalance deep in the tree',
        body:
          'const deepChain = { value: 3, left: { value: 4, left: { value: 5, left: null, right: null }, right: null }, right: null };\n' +
          'const leaf = () => ({ value: 0, left: null, right: null });\n' +
          'const root = { value: 1, left: { value: 2, left: deepChain, right: leaf() }, right: { value: 6, left: leaf(), right: leaf() } };\n' +
          'expect(isBalanced(root)).toBe(false);',
      },
      {
        name: 'a balanced tree of depth three',
        body:
          'const leaf = () => ({ value: 0, left: null, right: null });\n' +
          'const pair = () => ({ value: 0, left: leaf(), right: leaf() });\n' +
          'expect(isBalanced({ value: 1, left: pair(), right: pair() })).toBe(true);',
      },
      {
        name: 'imbalance on the right side is caught too',
        body:
          'const chain = { value: 1, left: null, right: { value: 2, left: null, right: null } };\n' +
          'expect(isBalanced({ value: 0, left: null, right: chain })).toBe(false);',
      },
      {
        name: 'a lopsided but legal tree',
        body:
          'const leaf = () => ({ value: 0, left: null, right: null });\n' +
          'const root = { value: 1, left: { value: 2, left: leaf(), right: null }, right: leaf() };\n' +
          'expect(isBalanced(root)).toBe(true);',
      },
      {
        name: 'stays fast on a long chain',
        body:
          'let node = null;\n' +
          'for (let i = 0; i < 5000; i += 1) node = { value: i, left: node, right: null };\n' +
          'expect(isBalanced(node)).toBe(false);',
        hidden: true,
      },
      {
        name: 'stays fast on a large balanced tree',
        body:
          'const build = (depth) => (depth === 0 ? null : { value: depth, left: build(depth - 1), right: build(depth - 1) });\n' +
          'expect(isBalanced(build(14))).toBe(true);',
        hidden: true,
      },
    ],
    hints: [
      'Write a recursive helper that returns the height of a subtree — and can also report that the subtree is already unbalanced.',
      'Using `-1` as a sentinel height for "unbalanced" lets one return value carry both pieces of information.',
      'Once a subtree reports the sentinel, propagate it up immediately rather than continuing to measure.',
    ],
    solution:
      'function isBalanced(root) {\n' +
      '  function height(node) {\n' +
      '    if (node === null) return 0;\n' +
      '    const left = height(node.left);\n' +
      '    if (left === -1) return -1;\n' +
      '    const right = height(node.right);\n' +
      '    if (right === -1) return -1;\n' +
      '    if (Math.abs(left - right) > 1) return -1;\n' +
      '    return Math.max(left, right) + 1;\n' +
      '  }\n' +
      '  return height(root) !== -1;\n' +
      '}\n',
    solutionExplanation:
      'The single-traversal trick is to overload the return value: a non-negative number is the subtree\'s height, and `-1` means "somewhere below here, the tree is already unbalanced". Because that sentinel propagates upward immediately, each node is visited exactly once and the whole check is O(n) — the naive version, which calls a separate `height` function from every node, re-measures the same subtrees repeatedly and costs O(n²), which is what the 5,000-node chain test would expose. Checking the left subtree before even measuring the right is a small further saving: once the left is known to be unbalanced there is nothing to gain from measuring the right at all. Note the condition is checked at *every* node, which is why a tree can have a balanced root and still fail.',
  },

  {
    id: 'ch-ds-flatten-tree',
    slug: 'flatten-a-category-tree',
    title: 'Flatten a Category Tree',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['data-structures', 'recursion', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Nested category and menu data usually arrives as a tree of `{ id, name, children }` but has to be rendered as a flat list. Write `flattenTree(nodes)` returning one entry per node as `{ id, name, depth, path }`, in depth-first pre-order — a node appears before its descendants. `depth` starts at 0 for top-level nodes, and `path` is the array of ids from the root to that node inclusive. `children` may be missing entirely.',
    examples: [
      'flattenTree([{ id: "a", name: "A", children: [{ id: "b", name: "B" }] }]);\n// [{ id: "a", name: "A", depth: 0, path: ["a"] },\n//  { id: "b", name: "B", depth: 1, path: ["a", "b"] }]',
    ],
    constraints: ['Pre-order: a parent comes before its children.', '`children` may be absent, `null`, or an empty array.', 'Each entry\'s `path` is its own array, not shared with any other entry.'],
    starterCode: 'function flattenTree(nodes) {\n  // Your code here\n}\n',
    tests: [
      { name: 'flattens a single level', body: 'expect(flattenTree([{ id: "a", name: "A" }])).toEqual([{ id: "a", name: "A", depth: 0, path: ["a"] }]);' },
      {
        name: 'flattens a nested node',
        body:
          'expect(flattenTree([{ id: "a", name: "A", children: [{ id: "b", name: "B" }] }])).toEqual([\n' +
          '  { id: "a", name: "A", depth: 0, path: ["a"] },\n' +
          '  { id: "b", name: "B", depth: 1, path: ["a", "b"] },\n' +
          ']);',
      },
      { name: 'an empty input gives an empty result', body: 'expect(flattenTree([])).toEqual([]);' },
      { name: 'handles several roots', body: 'expect(flattenTree([{ id: "a", name: "A" }, { id: "b", name: "B" }]).map((n) => n.id)).toEqual(["a", "b"]);' },
      {
        name: 'is depth-first pre-order',
        body:
          'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B", children: [{ id: "c", name: "C" }] }, { id: "d", name: "D" }] }];\n' +
          'expect(flattenTree(tree).map((n) => n.id)).toEqual(["a", "b", "c", "d"]);',
      },
      {
        name: 'tracks depth correctly',
        body:
          'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B", children: [{ id: "c", name: "C" }] }] }];\n' +
          'expect(flattenTree(tree).map((n) => n.depth)).toEqual([0, 1, 2]);',
      },
      {
        name: 'builds the full path',
        body:
          'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B", children: [{ id: "c", name: "C" }] }] }];\n' +
          'expect(flattenTree(tree)[2].path).toEqual(["a", "b", "c"]);',
      },
      { name: 'handles a missing children key', body: 'expect(flattenTree([{ id: "a", name: "A" }])[0].depth).toBe(0);' },
      { name: 'handles a null children key', body: 'expect(flattenTree([{ id: "a", name: "A", children: null }]).length).toBe(1);' },
      { name: 'handles an empty children array', body: 'expect(flattenTree([{ id: "a", name: "A", children: [] }]).length).toBe(1);' },
      {
        name: 'each path is an independent array',
        body:
          'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B" }, { id: "c", name: "C" }] }];\n' +
          'const out = flattenTree(tree);\n' +
          'expect(out[1].path).toEqual(["a", "b"]);\n' +
          'expect(out[2].path).toEqual(["a", "c"]);',
      },
      { name: 'does not mutate the input', body: 'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B" }] }]; flattenTree(tree); expect(tree[0].children.length).toBe(1); expect(tree[0].depth).toBe(undefined);' },
      {
        name: 'handles a wide and deep tree',
        body:
          'const build = (depth) => (depth === 0 ? [] : [{ id: "n" + depth, name: "N", children: build(depth - 1) }]);\n' +
          'const out = flattenTree(build(50));\n' +
          'expect(out.length).toBe(50);\n' +
          'expect(out[49].depth).toBe(49);\n' +
          'expect(out[49].path.length).toBe(50);',
        hidden: true,
      },
      {
        name: 'siblings do not share a path prefix array',
        body:
          'const tree = [{ id: "a", name: "A", children: [{ id: "b", name: "B", children: [{ id: "x", name: "X" }] }, { id: "c", name: "C" }] }];\n' +
          'const out = flattenTree(tree);\n' +
          'expect(out.map((n) => n.path.join("/"))).toEqual(["a", "a/b", "a/b/x", "a/c"]);',
        hidden: true,
      },
    ],
    hints: [
      'Recurse with two accumulating parameters: the current depth and the path so far.',
      'Push the entry for a node *before* recursing into its children — that is what makes the order pre-order rather than post-order.',
      'Build each child path as a new array (`[...path, node.id]`) rather than pushing onto a shared one, or every entry will end up holding the same mutated array.',
    ],
    solution:
      'function flattenTree(nodes) {\n' +
      '  const out = [];\n' +
      '  const walk = (list, depth, path) => {\n' +
      '    for (const node of list) {\n' +
      '      const here = [...path, node.id];\n' +
      '      out.push({ id: node.id, name: node.name, depth, path: here });\n' +
      '      if (Array.isArray(node.children)) walk(node.children, depth + 1, here);\n' +
      '    }\n' +
      '  };\n' +
      '  walk(nodes, 0, []);\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Pushing before recursing is what produces pre-order, which is the order a rendered tree needs — a parent row must appear above its children. Building `here` as a new array on every node is the detail that matters most: with a single shared array that gets pushed and popped, every entry would end up referencing the same object and, after the walk finished, they would all show the same final path. The `Array.isArray` guard covers all three shapes the specification allows for `children` — missing, `null`, or an empty array — in one condition, since only a real array is worth descending into.',
  },
];

export default challenges;
