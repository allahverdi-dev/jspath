import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Algorithms';

export const challenges = [
  {
    id: 'ch-algo-binary-search',
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'loops'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `binarySearch(sorted, target)` returning the index of `target` in an ascending array, or `-1` if it is absent. Halving the search range each step finds an item among a million in about twenty comparisons instead of a million. When the target appears more than once, any of its indices is acceptable. Do not use `indexOf` — implementing the search is the point.',
    examples: ['binarySearch([1, 3, 5, 7], 5);   // 2\nbinarySearch([1, 3, 5, 7], 4);   // -1'],
    constraints: ['The array is sorted ascending.', 'Do not use `indexOf`, `includes`, `find` or `findIndex`.', 'One test uses a million elements and will time out on a linear scan.'],
    starterCode: 'function binarySearch(sorted, target) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds a value in the middle', body: 'expect(binarySearch([1, 3, 5, 7], 5)).toBe(2);' },
      { name: 'finds the first value', body: 'expect(binarySearch([1, 3, 5, 7], 1)).toBe(0);' },
      { name: 'finds the last value', body: 'expect(binarySearch([1, 3, 5, 7], 7)).toBe(3);' },
      { name: 'reports an absent value', body: 'expect(binarySearch([1, 3, 5, 7], 4)).toBe(-1);' },
      { name: 'reports a value below the range', body: 'expect(binarySearch([1, 3, 5], 0)).toBe(-1);' },
      { name: 'reports a value above the range', body: 'expect(binarySearch([1, 3, 5], 9)).toBe(-1);' },
      { name: 'handles an empty array', body: 'expect(binarySearch([], 1)).toBe(-1);' },
      { name: 'handles a single element that matches', body: 'expect(binarySearch([5], 5)).toBe(0);' },
      { name: 'handles a single element that does not match', body: 'expect(binarySearch([5], 3)).toBe(-1);' },
      { name: 'handles an even-length array', body: 'expect(binarySearch([1, 2, 3, 4, 5, 6], 2)).toBe(1);' },
      { name: 'finds every element of a larger array', body: 'const xs = Array.from({ length: 101 }, (_, i) => i * 2); for (let i = 0; i < xs.length; i += 1) expect(binarySearch(xs, xs[i])).toBe(i);' },
      { name: 'returns some index of a repeated value', body: 'const xs = [1, 2, 2, 2, 3]; expect(xs[binarySearch(xs, 2)]).toBe(2);' },
      {
        name: 'stays fast on a million elements',
        body:
          'const xs = Array.from({ length: 1000000 }, (_, i) => i);\n' +
          'expect(binarySearch(xs, 999999)).toBe(999999);\n' +
          'expect(binarySearch(xs, -1)).toBe(-1);',
        hidden: true,
      },
      { name: 'handles negative values', body: 'expect(binarySearch([-5, -1, 0, 4], -1)).toBe(1);', hidden: true },
    ],
    hints: [
      'Keep two bounds, `low` and `high`, and repeatedly examine the element halfway between them.',
      'If the middle element is too small, everything from `low` to the middle can be discarded — move `low` past it. If too large, move `high` back.',
      'Getting the loop condition right matters: `low <= high` is what lets a single remaining element still be examined.',
    ],
    solution:
      'function binarySearch(sorted, target) {\n' +
      '  let low = 0;\n' +
      '  let high = sorted.length - 1;\n' +
      '  while (low <= high) {\n' +
      '    const mid = Math.floor((low + high) / 2);\n' +
      '    if (sorted[mid] === target) return mid;\n' +
      '    if (sorted[mid] < target) low = mid + 1;\n' +
      '    else high = mid - 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n',
    solutionExplanation:
      'Each iteration discards half the remaining range, which is why a million elements need about twenty steps rather than a million — log₂(1,000,000) is under 20. Two details cause almost every buggy binary search. The loop condition must be `<=`, not `<`: when `low` and `high` meet there is still one unexamined element, and `<` would skip it and report a false absence. And the bounds must move *past* the middle (`mid + 1`, `mid - 1`) rather than to it; setting `low = mid` leaves the range the same size when it is already down to two elements, and the loop never ends.',
  },

  {
    id: 'ch-algo-merge-sort',
    slug: 'merge-sort',
    title: 'Merge Sort',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['algorithms', 'recursion', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `mergeSort(items, compare)` returning a new sorted array, without calling `Array.prototype.sort`. `compare(a, b)` returns a negative number, zero, or a positive number in the usual way. The sort must be **stable**: elements the comparator calls equal keep their original relative order. Merge sort achieves this naturally if you resolve ties in favour of the left half.',
    examples: [
      'mergeSort([3, 1, 2], (a, b) => a - b);  // [1, 2, 3]',
      'mergeSort(people, (a, b) => a.age - b.age);\n// people of equal age stay in their original order',
    ],
    constraints: ['Do not call `Array.prototype.sort`.', 'The sort is stable.', 'The input is not modified.'],
    starterCode: 'function mergeSort(items, compare) {\n  // Your code here\n}\n',
    tests: [
      { name: 'sorts numbers', body: 'expect(mergeSort([3, 1, 2], (a, b) => a - b)).toEqual([1, 2, 3]);' },
      { name: 'handles an already-sorted array', body: 'expect(mergeSort([1, 2, 3], (a, b) => a - b)).toEqual([1, 2, 3]);' },
      { name: 'handles a reversed array', body: 'expect(mergeSort([5, 4, 3, 2, 1], (a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);' },
      { name: 'handles an empty array', body: 'expect(mergeSort([], (a, b) => a - b)).toEqual([]);' },
      { name: 'handles a single element', body: 'expect(mergeSort([1], (a, b) => a - b)).toEqual([1]);' },
      { name: 'handles duplicates', body: 'expect(mergeSort([2, 1, 2, 1], (a, b) => a - b)).toEqual([1, 1, 2, 2]);' },
      { name: 'does not mutate the input', body: 'const xs = [3, 1, 2]; mergeSort(xs, (a, b) => a - b); expect(xs).toEqual([3, 1, 2]);' },
      { name: 'returns a new array', body: 'const xs = [1]; expect(mergeSort(xs, (a, b) => a - b)).not.toBe(xs);' },
      { name: 'honours a descending comparator', body: 'expect(mergeSort([1, 3, 2], (a, b) => b - a)).toEqual([3, 2, 1]);' },
      {
        name: 'is stable',
        body:
          'const rows = [{ k: 1, id: "a" }, { k: 0, id: "b" }, { k: 1, id: "c" }, { k: 0, id: "d" }];\n' +
          'expect(mergeSort(rows, (x, y) => x.k - y.k).map((r) => r.id)).toEqual(["b", "d", "a", "c"]);',
      },
      {
        name: 'is stable across many equal keys',
        body:
          'const rows = Array.from({ length: 50 }, (_, i) => ({ k: i % 3, id: i }));\n' +
          'const sorted = mergeSort(rows, (x, y) => x.k - y.k);\n' +
          'const zeros = sorted.filter((r) => r.k === 0).map((r) => r.id);\n' +
          'expect(zeros).toEqual([...zeros].sort((a, b) => a - b));',
      },
      {
        name: 'sorts a large array correctly',
        body:
          'const xs = Array.from({ length: 5000 }, (_, i) => (i * 7919) % 5000);\n' +
          'const out = mergeSort(xs, (a, b) => a - b);\n' +
          'expect(out.length).toBe(5000);\n' +
          'for (let i = 1; i < out.length; i += 1) expect(out[i - 1] <= out[i]).toBe(true);',
        hidden: true,
      },
      { name: 'sorts strings with a comparator', body: 'expect(mergeSort(["pear", "fig", "apple"], (a, b) => (a < b ? -1 : a > b ? 1 : 0))).toEqual(["apple", "fig", "pear"]);', hidden: true },
    ],
    hints: [
      'Split the array in half, sort each half recursively, then merge the two sorted halves into one.',
      'The base case is an array of length 0 or 1, which is already sorted.',
      'In the merge step, take from the left half when `compare(left, right) <= 0`. Using `<=` rather than `<` is precisely what makes the sort stable.',
    ],
    solution:
      'function mergeSort(items, compare) {\n' +
      '  if (items.length <= 1) return [...items];\n' +
      '  const mid = Math.floor(items.length / 2);\n' +
      '  const left = mergeSort(items.slice(0, mid), compare);\n' +
      '  const right = mergeSort(items.slice(mid), compare);\n' +
      '\n' +
      '  const out = [];\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  while (i < left.length && j < right.length) {\n' +
      '    if (compare(left[i], right[j]) <= 0) {\n' +
      '      out.push(left[i]);\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      out.push(right[j]);\n' +
      '      j += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  while (i < left.length) { out.push(left[i]); i += 1; }\n' +
      '  while (j < right.length) { out.push(right[j]); j += 1; }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Merge sort is O(n log n) in every case: the halving gives log n levels and each level merges every element once. The whole stability question comes down to a single character. When the comparator reports a tie, `<= 0` takes from the left half — and because the left half held the earlier elements, equal elements come out in their original order. Changing it to `< 0` would take from the right on a tie and silently reverse equal runs, which the stability tests catch. The two trailing `while` loops drain whichever half still has elements; forgetting them loses the tail of the larger half. Note that `slice` copies, so the input is never touched.',
  },

  {
    id: 'ch-algo-two-sum',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `twoSum(numbers, target)` returning the indices of two distinct positions whose values add to `target`, as `[i, j]` with `i < j`, or `null` if no such pair exists. The obvious nested loop is O(n²); solve it in a single pass instead. When several pairs would work, return the one whose second index is smallest.',
    examples: [
      'twoSum([2, 7, 11, 15], 9);  // [0, 1]',
      'twoSum([3, 3], 6);          // [0, 1]',
      'twoSum([1, 2], 99);         // null',
    ],
    constraints: ['The two indices must be different positions.', 'Return `[i, j]` with `i < j`.', 'One test uses 50,000 numbers and will time out on a nested loop.'],
    starterCode: 'function twoSum(numbers, target) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds a simple pair', body: 'expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);' },
      { name: 'finds a pair later in the array', body: 'expect(twoSum([1, 2, 3, 4], 7)).toEqual([2, 3]);' },
      { name: 'returns null when there is no pair', body: 'expect(twoSum([1, 2], 99)).toBe(null);' },
      { name: 'uses two distinct positions', body: 'expect(twoSum([3, 1], 6)).toBe(null);' },
      { name: 'allows two equal values at different positions', body: 'expect(twoSum([3, 3], 6)).toEqual([0, 1]);' },
      { name: 'handles negatives', body: 'expect(twoSum([-3, 4, 3, 90], 0)).toEqual([0, 2]);' },
      { name: 'handles zero as a target', body: 'expect(twoSum([0, 0], 0)).toEqual([0, 1]);' },
      { name: 'an empty array gives null', body: 'expect(twoSum([], 0)).toBe(null);' },
      { name: 'a single element gives null', body: 'expect(twoSum([5], 5)).toBe(null);' },
      { name: 'returns indices in ascending order', body: 'const out = twoSum([5, 1, 4], 9); expect(out[0]).toBeLessThan(out[1]);' },
      { name: 'prefers the pair that completes earliest', body: 'expect(twoSum([1, 2, 3, 4, 5], 5)).toEqual([1, 2]);' },
      {
        name: 'stays fast on a large array',
        body:
          'const xs = Array.from({ length: 50000 }, (_, i) => i);\n' +
          'expect(twoSum(xs, 99997)).toEqual([49998, 49999]);',
        hidden: true,
      },
      { name: 'handles a pair at the very start', body: 'expect(twoSum([10, 10, 1, 2], 20)).toEqual([0, 1]);', hidden: true },
    ],
    hints: [
      'For each number, the value that would complete the pair is fully determined: `target - value`.',
      'Walk once, and before storing each value ask whether its complement has already been seen. A `Map` from value to index makes that lookup constant-time.',
      'Checking *before* storing is what stops a number pairing with itself, and it also gives you the earliest completing pair for free.',
    ],
    solution:
      'function twoSum(numbers, target) {\n' +
      '  const seen = new Map();\n' +
      '  for (let i = 0; i < numbers.length; i += 1) {\n' +
      '    const need = target - numbers[i];\n' +
      '    if (seen.has(need)) return [seen.get(need), i];\n' +
      '    if (!seen.has(numbers[i])) seen.set(numbers[i], i);\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n',
    solutionExplanation:
      'Trading memory for time is the whole idea: storing what has been seen turns "is there an earlier number that completes this one" from a scan into a lookup, taking the algorithm from O(n²) to O(n). Checking the complement before recording the current value is what makes `[3, 1]` with a target of 6 correctly return `null` — a number never pairs with itself. Because the walk goes left to right and returns on the first completion, the pair found is always the one with the smallest possible second index. Keeping the *earliest* index for a repeated value (the `if (!seen.has(...))` guard) is what makes the tie-breaking deterministic.',
  },

  {
    id: 'ch-algo-kadane',
    slug: 'best-contiguous-run',
    title: 'Best Contiguous Run',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'numbers'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Given daily profit and loss figures, find the best consecutive stretch. Write `bestRun(values)` returning the largest sum obtainable from a **contiguous, non-empty** run of elements. For an all-negative input the answer is the least-negative single element, not zero — the run must contain at least one item. An empty input has no valid run, so return `null`. Solve it in one pass.',
    examples: [
      'bestRun([-2, 1, -3, 4, -1, 2, 1, -5, 4]);  // 6  (the run 4, -1, 2, 1)',
      'bestRun([-3, -1, -7]);                      // -1',
    ],
    constraints: ['The run must be contiguous and contain at least one element.', 'An empty input returns `null`.', 'One test uses 200,000 values; an O(n²) scan will time out.'],
    starterCode: 'function bestRun(values) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds the classic best run', body: 'expect(bestRun([-2, 1, -3, 4, -1, 2, 1, -5, 4])).toBe(6);' },
      { name: 'an all-positive array sums entirely', body: 'expect(bestRun([1, 2, 3])).toBe(6);' },
      { name: 'an all-negative array gives the least-negative element', body: 'expect(bestRun([-3, -1, -7])).toBe(-1);' },
      { name: 'does not return zero for all negatives', body: 'expect(bestRun([-5, -2])).not.toBe(0);' },
      { name: 'handles a single element', body: 'expect(bestRun([7])).toBe(7);' },
      { name: 'handles a single negative element', body: 'expect(bestRun([-7])).toBe(-7);' },
      { name: 'an empty input gives null', body: 'expect(bestRun([])).toBe(null);' },
      { name: 'handles zeros', body: 'expect(bestRun([0, 0])).toBe(0);' },
      { name: 'crosses a small dip', body: 'expect(bestRun([5, -1, 5])).toBe(9);' },
      { name: 'does not cross a large dip', body: 'expect(bestRun([5, -100, 6])).toBe(6);' },
      { name: 'the best run can be at the end', body: 'expect(bestRun([-1, -2, 10])).toBe(10);' },
      {
        name: 'stays fast on a large input',
        body:
          'const xs = Array.from({ length: 200000 }, (_, i) => ((i * 37) % 21) - 10);\n' +
          'const out = bestRun(xs);\n' +
          'expect(typeof out).toBe("number");\n' +
          'expect(out).toBeGreaterThan(0);',
        hidden: true,
      },
      { name: 'handles a two-element array', body: 'expect(bestRun([-1, 5])).toBe(5);', hidden: true },
    ],
    hints: [
      'Walk the array keeping the best sum of a run that *ends at the current position*.',
      'At each element there is only one decision: extend the previous run, or start fresh from this element. Take whichever is larger.',
      'Track the best answer seen anywhere separately from the best run ending here — the overall best may have ended several elements ago.',
    ],
    solution:
      'function bestRun(values) {\n' +
      '  if (values.length === 0) return null;\n' +
      '  let endingHere = values[0];\n' +
      '  let best = values[0];\n' +
      '  for (let i = 1; i < values.length; i += 1) {\n' +
      '    endingHere = Math.max(values[i], endingHere + values[i]);\n' +
      '    best = Math.max(best, endingHere);\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n',
    solutionExplanation:
      'This is Kadane\'s algorithm, and its insight is that the best run ending at each position depends only on the best run ending at the previous one: either the previous run is worth extending, or it has become a liability and the current element starts a new run. That single comparison replaces re-summing every possible run, taking the problem from O(n²) to O(n). Seeding both variables with `values[0]` rather than 0 is what handles the all-negative case correctly — starting `best` at 0 would report 0 for `[-3, -1, -7]`, claiming an empty run that the specification forbids. The two variables have genuinely different jobs: `endingHere` is a rolling state, `best` is a high-water mark, and collapsing them into one loses the answer as soon as a better run is followed by a worse one.',
  },

  {
    id: 'ch-algo-longest-unique',
    slug: 'longest-run-of-distinct-characters',
    title: 'Longest Run of Distinct Characters',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'strings', 'data-structures'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `longestDistinct(text)` returning the length of the longest contiguous stretch of characters in which no character repeats. In `"abcabcbb"` the answer is 3. Checking every possible stretch is O(n²) or worse — solve it in a single pass by expanding a range to the right and pulling its left edge forward only as far as needed when a repeat appears.',
    examples: [
      'longestDistinct("abcabcbb");  // 3   ("abc")',
      'longestDistinct("bbbbb");     // 1   ("b")',
      'longestDistinct("pwwkew");    // 3   ("wke")',
    ],
    constraints: ['Return the length, not the substring.', 'An empty string gives 0.', 'One test uses 100,000 characters; a quadratic solution will time out.'],
    starterCode: 'function longestDistinct(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'the classic case', body: 'expect(longestDistinct("abcabcbb")).toBe(3);' },
      { name: 'all identical characters', body: 'expect(longestDistinct("bbbbb")).toBe(1);' },
      { name: 'the best stretch is in the middle', body: 'expect(longestDistinct("pwwkew")).toBe(3);' },
      { name: 'an all-distinct string', body: 'expect(longestDistinct("abcdef")).toBe(6);' },
      { name: 'an empty string', body: 'expect(longestDistinct("")).toBe(0);' },
      { name: 'a single character', body: 'expect(longestDistinct("a")).toBe(1);' },
      { name: 'a repeat far apart', body: 'expect(longestDistinct("abba")).toBe(2);' },
      { name: 'the left edge must not move backwards', body: 'expect(longestDistinct("tmmzuxt")).toBe(5);' },
      { name: 'handles spaces and punctuation', body: 'expect(longestDistinct("a b!c")).toBe(5);' },
      { name: 'handles digits', body: 'expect(longestDistinct("1231234")).toBe(4);' },
      {
        name: 'stays fast on a long string',
        body:
          'const alphabet = "abcdefghijklmnopqrstuvwxyz";\n' +
          'let s = "";\n' +
          'for (let i = 0; i < 100000; i += 1) s += alphabet[i % 26];\n' +
          'expect(longestDistinct(s)).toBe(26);',
        hidden: true,
      },
      { name: 'a two-character repeat', body: 'expect(longestDistinct("aa")).toBe(1);', hidden: true },
    ],
    hints: [
      'Track the range with two indices. Move the right one forward one character at a time, and record the best length as you go.',
      'Keep a `Map` from each character to the index where you last saw it. When the current character was seen inside the current range, jump the left index to just past that occurrence.',
      'The trap is `"tmmzuxt"`: when the final `t` is reached, its last-seen index is 0, which is *behind* the current left edge. The left edge must never move backwards — use a maximum.',
    ],
    solution:
      'function longestDistinct(text) {\n' +
      '  const lastSeen = new Map();\n' +
      '  let best = 0;\n' +
      '  let start = 0;\n' +
      '  for (let i = 0; i < text.length; i += 1) {\n' +
      '    const char = text[i];\n' +
      '    const previous = lastSeen.get(char);\n' +
      '    if (previous !== undefined && previous >= start) start = previous + 1;\n' +
      '    lastSeen.set(char, i);\n' +
      '    best = Math.max(best, i - start + 1);\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n',
    solutionExplanation:
      'The right edge advances exactly once per character and the left edge only ever moves forward, so each index is visited a bounded number of times and the whole scan is O(n) — that is what makes 100,000 characters instant where checking every stretch would not finish. Storing the *last index* of each character rather than just membership is what allows the left edge to jump straight past a repeat instead of creeping forward one at a time. The `previous >= start` guard is the subtle half, and `"tmmzuxt"` is the case that exposes its absence: the final `t` was last seen at index 0, long before the current range began, so without the guard the left edge would leap backwards and the length would be computed as 7.',
  },

  {
    id: 'ch-algo-brackets',
    slug: 'balanced-brackets',
    title: 'Balanced Brackets',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['algorithms', 'data-structures', 'strings'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `isBalanced(text)` reporting whether the brackets `()`, `[]` and `{}` in a string are correctly matched and nested. Every opening bracket must be closed by the matching kind, in the right order, so `"([)]"` is not balanced even though the counts agree. Characters that are not brackets are ignored entirely.',
    examples: [
      'isBalanced("a(b[c]{d})");  // true',
      'isBalanced("([)]");        // false',
      'isBalanced("(");           // false',
    ],
    constraints: ['Only `()`, `[]` and `{}` are considered.', 'Non-bracket characters are ignored.', 'An empty string is balanced.'],
    starterCode: 'function isBalanced(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a simple balanced pair', body: 'expect(isBalanced("()")).toBe(true);' },
      { name: 'nested brackets', body: 'expect(isBalanced("([{}])")).toBe(true);' },
      { name: 'ignores other characters', body: 'expect(isBalanced("a(b[c]{d})")).toBe(true);' },
      { name: 'an empty string is balanced', body: 'expect(isBalanced("")).toBe(true);' },
      { name: 'a string with no brackets is balanced', body: 'expect(isBalanced("hello")).toBe(true);' },
      { name: 'rejects crossed nesting', body: 'expect(isBalanced("([)]")).toBe(false);' },
      { name: 'rejects an unclosed bracket', body: 'expect(isBalanced("(")).toBe(false);' },
      { name: 'rejects an unopened bracket', body: 'expect(isBalanced(")")).toBe(false);' },
      { name: 'rejects a mismatched kind', body: 'expect(isBalanced("(]")).toBe(false);' },
      { name: 'handles several sequential groups', body: 'expect(isBalanced("()[]{}")).toBe(true);' },
      { name: 'rejects a close before an open', body: 'expect(isBalanced(")(")).toBe(false);' },
      { name: 'handles deep nesting', body: 'expect(isBalanced("(".repeat(500) + ")".repeat(500))).toBe(true);', hidden: true },
      { name: 'rejects one missing close in deep nesting', body: 'expect(isBalanced("(".repeat(500) + ")".repeat(499))).toBe(false);', hidden: true },
    ],
    hints: [
      'A stack is exactly the right structure: push each opening bracket, and on a closing bracket check the most recent one.',
      'A map from closing bracket to its opening partner makes the comparison a lookup instead of a chain of conditions.',
      'There are three ways to fail: a closing bracket with an empty stack, a closing bracket that does not match the top, and a non-empty stack at the end. All three need checking.',
    ],
    solution:
      'function isBalanced(text) {\n' +
      '  const pairs = { ")": "(", "]": "[", "}": "{" };\n' +
      '  const opens = new Set(Object.values(pairs));\n' +
      '  const stack = [];\n' +
      '  for (const char of text) {\n' +
      '    if (opens.has(char)) {\n' +
      '      stack.push(char);\n' +
      '    } else if (Object.hasOwn(pairs, char)) {\n' +
      '      if (stack.pop() !== pairs[char]) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return stack.length === 0;\n' +
      '}\n',
    solutionExplanation:
      'A stack is the natural fit because nesting is last-in-first-out: the bracket that must close next is always the most recently opened one. That single property is what distinguishes this from counting, which would wrongly accept `"([)]"`. The `stack.pop() !== pairs[char]` comparison covers two failures at once — a wrong kind of bracket, and an empty stack, since `pop` on an empty array returns `undefined`, which never equals an opening bracket. The final length check catches the third failure, an unclosed bracket, which no individual character could have detected. Note that non-bracket characters take neither branch and are simply skipped.',
  },

  {
    id: 'ch-algo-group-anagrams',
    slug: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['algorithms', 'strings', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `groupAnagrams(words)` grouping words that are rearrangements of one another. Return an array of groups; each group holds its words in their original input order, and the groups appear in the order their first member appeared. Comparing every word against every other is O(n²) — find a canonical form for each word instead, so that anagrams collide naturally.',
    examples: [
      'groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);\n// [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]',
    ],
    constraints: ['Words are lowercase letters.', 'Group order follows first appearance; word order within a group follows input order.', 'A word with no anagrams forms a group of one.'],
    starterCode: 'function groupAnagrams(words) {\n  // Your code here\n}\n',
    tests: [
      { name: 'groups the classic example', body: 'expect(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])).toEqual([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]);' },
      { name: 'a word with no anagrams gets its own group', body: 'expect(groupAnagrams(["abc", "xyz"])).toEqual([["abc"], ["xyz"]]);' },
      { name: 'an empty input gives no groups', body: 'expect(groupAnagrams([])).toEqual([]);' },
      { name: 'a single word', body: 'expect(groupAnagrams(["solo"])).toEqual([["solo"]]);' },
      { name: 'identical words group together', body: 'expect(groupAnagrams(["ab", "ab"])).toEqual([["ab", "ab"]]);' },
      { name: 'groups appear in first-appearance order', body: 'expect(groupAnagrams(["tan", "eat", "nat"])).toEqual([["tan", "nat"], ["eat"]]);' },
      { name: 'words keep their input order inside a group', body: 'expect(groupAnagrams(["cba", "abc", "bca"])[0]).toEqual(["cba", "abc", "bca"]);' },
      { name: 'letter counts matter, not just the letter set', body: 'expect(groupAnagrams(["aab", "abb"]).length).toBe(2);' },
      { name: 'length matters', body: 'expect(groupAnagrams(["a", "aa"]).length).toBe(2);' },
      { name: 'every word appears exactly once', body: 'const words = ["eat", "tea", "tan", "ate", "nat", "bat"]; expect(groupAnagrams(words).flat().length).toBe(6);' },
      {
        name: 'stays fast on many words',
        body:
          'const words = [];\n' +
          'for (let i = 0; i < 3000; i += 1) words.push(["abc", "bca", "xyz", "zyx", "pqr"][i % 5]);\n' +
          'expect(groupAnagrams(words).length).toBe(3);',
        hidden: true,
      },
      { name: 'handles an empty string as a word', body: 'expect(groupAnagrams(["", ""])).toEqual([["", ""]]);', hidden: true },
    ],
    hints: [
      'Two words are anagrams exactly when they have the same letters with the same counts. Find a string that captures that and is identical for every anagram.',
      'Sorting a word\'s characters gives such a form: `"eat"`, `"tea"` and `"ate"` all become `"aet"`.',
      'Group by that key in a `Map`, which preserves insertion order — so the group ordering requirement needs no extra work.',
    ],
    solution:
      'function groupAnagrams(words) {\n' +
      '  const groups = new Map();\n' +
      '  for (const word of words) {\n' +
      '    const key = [...word].sort().join("");\n' +
      '    const bucket = groups.get(key);\n' +
      '    if (bucket === undefined) groups.set(key, [word]);\n' +
      '    else bucket.push(word);\n' +
      '  }\n' +
      '  return [...groups.values()];\n' +
      '}\n',
    solutionExplanation:
      'The move that matters is choosing a canonical form. Sorting a word\'s letters produces a string that is identical for every anagram and different for everything else, which turns "are these two words anagrams" from a comparison into a lookup — and comparisons between every pair from O(n²) into O(n·k log k), where k is the word length. Both ordering requirements come free from the data structures: `Map` iterates in insertion order, so groups appear in first-appearance order, and pushing appends, so words stay in input order. An alternative key is a 26-slot letter-count string, which avoids the sort and is faster for long words.',
  },

  {
    id: 'ch-algo-levenshtein',
    slug: 'edit-distance',
    title: 'Edit Distance',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'strings', 'recursion'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `editDistance(a, b)` returning the minimum number of single-character insertions, deletions or substitutions needed to turn one string into the other. `"kitten"` becomes `"sitting"` in three edits. This is the measure behind spell-check suggestions and fuzzy search. Solve it with dynamic programming — a plain recursion recomputes the same subproblems exponentially often.',
    examples: [
      'editDistance("kitten", "sitting");  // 3',
      'editDistance("", "abc");            // 3',
      'editDistance("same", "same");       // 0',
    ],
    constraints: ['All three operations cost 1.', 'The function is symmetric: swapping the arguments gives the same answer.', 'One test compares strings of 300 characters; exponential recursion will not finish.'],
    starterCode: 'function editDistance(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'the classic example', body: 'expect(editDistance("kitten", "sitting")).toBe(3);' },
      { name: 'identical strings need no edits', body: 'expect(editDistance("same", "same")).toBe(0);' },
      { name: 'two empty strings', body: 'expect(editDistance("", "")).toBe(0);' },
      { name: 'from empty is all insertions', body: 'expect(editDistance("", "abc")).toBe(3);' },
      { name: 'to empty is all deletions', body: 'expect(editDistance("abc", "")).toBe(3);' },
      { name: 'a single substitution', body: 'expect(editDistance("cat", "bat")).toBe(1);' },
      { name: 'a single insertion', body: 'expect(editDistance("cat", "cart")).toBe(1);' },
      { name: 'a single deletion', body: 'expect(editDistance("cart", "cat")).toBe(1);' },
      { name: 'is symmetric', body: 'expect(editDistance("flaw", "lawn")).toBe(editDistance("lawn", "flaw"));' },
      { name: 'completely different strings of equal length', body: 'expect(editDistance("abc", "xyz")).toBe(3);' },
      { name: 'a transposition costs two', body: 'expect(editDistance("ab", "ba")).toBe(2);' },
      { name: 'a longer pair', body: 'expect(editDistance("intention", "execution")).toBe(5);' },
      {
        name: 'handles long strings without exponential blowup',
        body:
          'const a = "a".repeat(300);\n' +
          'const b = "b".repeat(300);\n' +
          'expect(editDistance(a, b)).toBe(300);\n' +
          'expect(editDistance(a, a.slice(0, 299))).toBe(1);',
        hidden: true,
      },
      { name: 'a repeated-character pair', body: 'expect(editDistance("aaa", "aa")).toBe(1);', hidden: true },
    ],
    hints: [
      'Build a table where entry (i, j) is the distance between the first i characters of `a` and the first j of `b`.',
      'The first row and column are known outright: turning an empty string into a prefix of length n costs n insertions.',
      'For every other cell, the characters either match — in which case it costs the same as the cell diagonally up-left — or the answer is one plus the smallest of the three neighbours above, left, and diagonal.',
    ],
    solution:
      'function editDistance(a, b) {\n' +
      '  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);\n' +
      '\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    const current = new Array(b.length + 1);\n' +
      '    current[0] = i;\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        current[j] = previous[j - 1];\n' +
      '      } else {\n' +
      '        current[j] = 1 + Math.min(previous[j - 1], previous[j], current[j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '    previous = current;\n' +
      '  }\n' +
      '\n' +
      '  return previous[b.length];\n' +
      '}\n',
    solutionExplanation:
      'The recurrence is the whole algorithm: matching characters cost nothing beyond the diagonal cell, and a mismatch is one edit plus the best of three neighbours — diagonal for a substitution, above for a deletion, left for an insertion. Filling the table bottom-up computes each subproblem once, giving O(n×m); the naive recursion recomputes the same pairs over and over and is exponential, which is why the 300-character test would never finish. Only two rows are ever needed at once, so keeping just `previous` and `current` reduces memory from O(n×m) to O(m) — for 300×300 that is 301 numbers instead of 90,601. The initial row is the base case made explicit: turning an empty string into a j-character prefix takes j insertions.',
  },

  {
    id: 'ch-algo-coin-change',
    slug: 'fewest-coins',
    title: 'Fewest Coins',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'numbers'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `fewestCoins(coins, amount)` returning the smallest number of coins that sum exactly to `amount`, or `-1` when no combination does. Coins may be used any number of times. Unlike the everyday coin set, an arbitrary set defeats the greedy "take the largest that fits" approach: with coins of 1, 3 and 4, greedy makes 6 from 4+1+1 while 3+3 is better. Solve it with dynamic programming.',
    examples: [
      'fewestCoins([1, 3, 4], 6);   // 2   (3 + 3, not 4 + 1 + 1)',
      'fewestCoins([2], 3);         // -1',
      'fewestCoins([1, 2, 5], 0);   // 0',
    ],
    constraints: ['Coins are positive integers and may repeat unlimited times.', 'An amount of 0 needs no coins.', 'Return `-1` when the amount cannot be made.'],
    starterCode: 'function fewestCoins(coins, amount) {\n  // Your code here\n}\n',
    tests: [
      { name: 'beats the greedy answer', body: 'expect(fewestCoins([1, 3, 4], 6)).toBe(2);' },
      { name: 'a straightforward case', body: 'expect(fewestCoins([1, 2, 5], 11)).toBe(3);' },
      { name: 'zero needs no coins', body: 'expect(fewestCoins([1, 2, 5], 0)).toBe(0);' },
      { name: 'an impossible amount gives -1', body: 'expect(fewestCoins([2], 3)).toBe(-1);' },
      { name: 'an exact single coin', body: 'expect(fewestCoins([1, 5, 10], 10)).toBe(1);' },
      { name: 'repeated use of one coin', body: 'expect(fewestCoins([3], 9)).toBe(3);' },
      { name: 'no coins and a positive amount', body: 'expect(fewestCoins([], 5)).toBe(-1);' },
      { name: 'no coins and zero', body: 'expect(fewestCoins([], 0)).toBe(0);' },
      { name: 'a coin larger than the amount is unusable', body: 'expect(fewestCoins([7], 3)).toBe(-1);' },
      { name: 'greedy fails again on a larger amount', body: 'expect(fewestCoins([1, 5, 6, 9], 11)).toBe(2);' },
      { name: 'unordered coins still work', body: 'expect(fewestCoins([5, 1, 2], 11)).toBe(3);' },
      {
        name: 'handles a larger amount',
        body:
          'expect(fewestCoins([1, 5, 10, 25], 99)).toBe(9);\n' +
          'expect(fewestCoins([186, 419, 83, 408], 6249)).toBe(20);',
        hidden: true,
      },
      { name: 'duplicated coin values do not break it', body: 'expect(fewestCoins([2, 2, 5], 9)).toBe(3);', hidden: true },
    ],
    hints: [
      'Build up an answer for every amount from 0 to the target, in order. Each one can reuse the answers below it.',
      'The fewest coins for amount n is one plus the smallest answer among `n - coin` for each usable coin.',
      'Use `Infinity` for "not yet reachable" so the comparison works naturally, and convert it to `-1` only at the end.',
    ],
    solution:
      'function fewestCoins(coins, amount) {\n' +
      '  const best = new Array(amount + 1).fill(Infinity);\n' +
      '  best[0] = 0;\n' +
      '  for (let n = 1; n <= amount; n += 1) {\n' +
      '    for (const coin of coins) {\n' +
      '      if (coin <= n && best[n - coin] + 1 < best[n]) {\n' +
      '        best[n] = best[n - coin] + 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return best[amount] === Infinity ? -1 : best[amount];\n' +
      '}\n',
    solutionExplanation:
      'Filling the table from 0 upward means every value `best[n - coin]` is already final by the time it is read, so each amount is solved once — O(amount × coins) rather than the exponential search of trying every combination. `Infinity` as the "unreachable" marker is what lets the comparison stay a plain `<`; using `-1` as the marker would make it the *smallest* value and quietly win every comparison. The greedy alternative is genuinely wrong here rather than merely slower: with coins of 1, 3 and 4 it takes the 4 first and needs three coins for 6, where 3+3 needs two. Greedy happens to be optimal for standard currency denominations, which is exactly why the failure is so easy to overlook.',
  },

  {
    id: 'ch-algo-permutations',
    slug: 'all-permutations',
    title: 'All Permutations',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'recursion', 'arrays'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `permutations(items)` returning every ordering of an array, as an array of arrays. For n distinct items there are n! of them. Produce them in lexicographic order with respect to the input positions: the ordering that keeps the input order comes first, and each successive result differs by swapping later positions before earlier ones. An empty input has exactly one permutation — the empty one.',
    examples: [
      'permutations([1, 2, 3]);\n// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]',
      'permutations([]);  // [[]]',
    ],
    constraints: ['The input is not modified.', 'An empty input yields `[[]]`, one permutation of nothing.', 'Duplicate values are treated as distinct positions, so duplicated results are expected.'],
    starterCode: 'function permutations(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'permutes three items in order', body: 'expect(permutations([1, 2, 3])).toEqual([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]);' },
      { name: 'permutes two items', body: 'expect(permutations([1, 2])).toEqual([[1, 2], [2, 1]]);' },
      { name: 'a single item', body: 'expect(permutations([1])).toEqual([[1]]);' },
      { name: 'an empty input has one permutation', body: 'expect(permutations([])).toEqual([[]]);' },
      { name: 'produces n factorial results', body: 'expect(permutations([1, 2, 3, 4]).length).toBe(24);' },
      { name: 'produces 120 for five items', body: 'expect(permutations([1, 2, 3, 4, 5]).length).toBe(120);' },
      { name: 'every result is a distinct ordering', body: 'const out = permutations([1, 2, 3, 4]); expect(new Set(out.map((p) => p.join(","))).size).toBe(24);' },
      { name: 'every result contains every item', body: 'for (const p of permutations([1, 2, 3])) expect([...p].sort()).toEqual([1, 2, 3]);' },
      { name: 'the first result is the input order', body: 'expect(permutations(["a", "b", "c"])[0]).toEqual(["a", "b", "c"]);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; permutations(xs); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'results are independent arrays', body: 'const out = permutations([1, 2]); out[0][0] = 99; expect(out[1]).toEqual([2, 1]);' },
      { name: 'works with strings', body: 'expect(permutations(["a", "b"])).toEqual([["a", "b"], ["b", "a"]]);', hidden: true },
      { name: 'duplicates produce repeated orderings', body: 'expect(permutations([1, 1]).length).toBe(2);', hidden: true },
    ],
    hints: [
      'Choose each item in turn as the first element, then permute everything that remains and prepend the chosen item to each result.',
      'The base case is an empty input, whose only permutation is the empty array — returning `[[]]` rather than `[]` is what makes the recursion produce anything at all.',
      'Take the remaining items with `slice` on either side of the chosen index, which also keeps the input untouched.',
    ],
    solution:
      'function permutations(items) {\n' +
      '  if (items.length === 0) return [[]];\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < items.length; i += 1) {\n' +
      '    const rest = [...items.slice(0, i), ...items.slice(i + 1)];\n' +
      '    for (const sub of permutations(rest)) {\n' +
      '      out.push([items[i], ...sub]);\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The recursion mirrors the definition: fix each item as the first element, and the rest of the problem is the same problem on a smaller array. Iterating `i` from left to right is what produces lexicographic order with respect to input positions. The base case is the piece most people get wrong — returning `[[]]` rather than `[]` is essential, because the outer loop builds results by prepending onto whatever comes back, and prepending onto an empty list of permutations would produce nothing at all. Building `rest` with two `slice` calls leaves the input untouched, and every result is freshly constructed by the spread, so the arrays never share structure. The output is inherently O(n!) in size, so this is only practical for small inputs — eight items already means 40,320 arrays.',
  },

  {
    id: 'ch-algo-quickselect',
    slug: 'kth-smallest-without-sorting',
    title: 'Kth Smallest Without Sorting',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'arrays', 'recursion'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Write `kthSmallest(values, k)` returning the kth smallest value, one-indexed, so `k = 1` is the minimum. Sorting first gives the answer in O(n log n), but only one value is actually needed — quickselect finds it in linear time on average by partitioning around a pivot and recursing into only the side that can contain the answer. Return `null` when `k` is outside the range. Do not modify the input.',
    examples: [
      'kthSmallest([7, 2, 9, 4], 1);  // 2',
      'kthSmallest([7, 2, 9, 4], 3);  // 7',
      'kthSmallest([1, 2], 5);        // null',
    ],
    constraints: ['`k` is one-indexed.', 'Duplicates count separately, so `[5, 5]` has a 1st and a 2nd smallest, both 5.', 'The input array is not modified.'],
    starterCode: 'function kthSmallest(values, k) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds the minimum', body: 'expect(kthSmallest([7, 2, 9, 4], 1)).toBe(2);' },
      { name: 'finds a middle value', body: 'expect(kthSmallest([7, 2, 9, 4], 3)).toBe(7);' },
      { name: 'finds the maximum', body: 'expect(kthSmallest([7, 2, 9, 4], 4)).toBe(9);' },
      { name: 'a k above the range gives null', body: 'expect(kthSmallest([1, 2], 5)).toBe(null);' },
      { name: 'a k of zero gives null', body: 'expect(kthSmallest([1, 2], 0)).toBe(null);' },
      { name: 'an empty array gives null', body: 'expect(kthSmallest([], 1)).toBe(null);' },
      { name: 'a single element', body: 'expect(kthSmallest([42], 1)).toBe(42);' },
      { name: 'duplicates count separately', body: 'expect(kthSmallest([5, 5], 2)).toBe(5);' },
      { name: 'handles negatives', body: 'expect(kthSmallest([-1, -5, 3], 1)).toBe(-5);' },
      { name: 'does not mutate the input', body: 'const xs = [3, 1, 2]; kthSmallest(xs, 2); expect(xs).toEqual([3, 1, 2]);' },
      {
        name: 'agrees with sorting for every k',
        body:
          'const xs = [9, 3, 7, 1, 8, 2, 5];\n' +
          'const sorted = [...xs].sort((a, b) => a - b);\n' +
          'for (let k = 1; k <= xs.length; k += 1) expect(kthSmallest(xs, k)).toBe(sorted[k - 1]);',
      },
      {
        name: 'handles a large array',
        body:
          'const xs = Array.from({ length: 20000 }, (_, i) => (i * 7919) % 20000);\n' +
          'expect(kthSmallest(xs, 1)).toBe(0);\n' +
          'expect(kthSmallest(xs, 20000)).toBe(19999);\n' +
          'expect(kthSmallest(xs, 10000)).toBe(9999);',
        hidden: true,
      },
      {
        name: 'handles an already-sorted input without degrading',
        body:
          'const xs = Array.from({ length: 20000 }, (_, i) => i);\n' +
          'expect(kthSmallest(xs, 12345)).toBe(12344);',
        hidden: true,
      },
    ],
    hints: [
      'Pick a pivot and split the values into those below it, those equal to it, and those above.',
      'The sizes of those groups tell you which one contains the kth value, so you only recurse into one of the three — and if it is the equal group, the pivot *is* the answer.',
      'Choosing the pivot at random matters: always taking the first element degrades to O(n²) on already-sorted input, which one of the tests uses.',
    ],
    solution:
      'function kthSmallest(values, k) {\n' +
      '  if (k < 1 || k > values.length) return null;\n' +
      '\n' +
      '  function select(list, rank) {\n' +
      '    const pivot = list[Math.floor(Math.random() * list.length)];\n' +
      '    const below = [];\n' +
      '    const equal = [];\n' +
      '    const above = [];\n' +
      '    for (const value of list) {\n' +
      '      if (value < pivot) below.push(value);\n' +
      '      else if (value > pivot) above.push(value);\n' +
      '      else equal.push(value);\n' +
      '    }\n' +
      '    if (rank <= below.length) return select(below, rank);\n' +
      '    if (rank <= below.length + equal.length) return pivot;\n' +
      '    return select(above, rank - below.length - equal.length);\n' +
      '  }\n' +
      '\n' +
      '  return select(values, k);\n' +
      '}\n',
    solutionExplanation:
      'Quickselect is quicksort that throws away half the work: after partitioning, the group sizes reveal which side the answer is in, so only one side is recursed into. Each pass halves the expected input, giving n + n/2 + n/4 + … ≈ 2n comparisons — linear on average, against O(n log n) for sorting the whole array to read one element. The three-way split (below, equal, above) rather than two is what makes duplicates correct: the equal group can be arbitrarily large, and if the rank lands inside it, the pivot is the answer. A random pivot is not decoration — with a fixed first-element pivot, already-sorted input makes every partition maximally lopsided and the algorithm degrades to O(n²), which is exactly what the last hidden test would expose. Note that randomness here affects only the running time, never the result, which is why testing it is still deterministic.',
  },

  {
    id: 'ch-algo-topological',
    slug: 'ordering-dependencies',
    title: 'Ordering Dependencies',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['algorithms', 'data-structures', 'objects'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Build tools, task runners and module loaders all need the same thing: an order in which every item comes after everything it depends on. Write `buildOrder(graph)` where `graph` maps each item to an array of the items it depends on. Return a valid order as an array, or `null` if a cycle makes one impossible. Among the valid orders, break ties by preferring the item that appears earliest among the graph\'s own keys, so the result is deterministic.',
    examples: [
      'buildOrder({ app: ["ui", "core"], ui: ["core"], core: [] });\n// ["core", "ui", "app"]',
      'buildOrder({ a: ["b"], b: ["a"] });  // null',
    ],
    constraints: ['Every item mentioned as a dependency is also a key of the graph.', 'A cycle of any length returns `null`.', 'Ties are broken by the order of the graph\'s keys.'],
    starterCode: 'function buildOrder(graph) {\n  // Your code here\n}\n',
    tests: [
      { name: 'orders a simple chain', body: 'expect(buildOrder({ app: ["ui", "core"], ui: ["core"], core: [] })).toEqual(["core", "ui", "app"]);' },
      { name: 'handles independent items in key order', body: 'expect(buildOrder({ a: [], b: [], c: [] })).toEqual(["a", "b", "c"]);' },
      { name: 'an empty graph gives an empty order', body: 'expect(buildOrder({})).toEqual([]);' },
      { name: 'a single item with no dependencies', body: 'expect(buildOrder({ only: [] })).toEqual(["only"]);' },
      { name: 'detects a two-node cycle', body: 'expect(buildOrder({ a: ["b"], b: ["a"] })).toBe(null);' },
      { name: 'detects a longer cycle', body: 'expect(buildOrder({ a: ["b"], b: ["c"], c: ["a"] })).toBe(null);' },
      { name: 'detects a self-dependency', body: 'expect(buildOrder({ a: ["a"] })).toBe(null);' },
      {
        name: 'every dependency comes before its dependent',
        body:
          'const graph = { d: ["b", "c"], c: ["a"], b: ["a"], a: [] };\n' +
          'const order = buildOrder(graph);\n' +
          'for (const [item, deps] of Object.entries(graph)) {\n' +
          '  for (const dep of deps) expect(order.indexOf(dep)).toBeLessThan(order.indexOf(item));\n' +
          '}',
      },
      { name: 'includes every item exactly once', body: 'const order = buildOrder({ a: [], b: ["a"], c: ["a"] }); expect(order.length).toBe(3); expect(new Set(order).size).toBe(3);' },
      { name: 'handles a diamond', body: 'expect(buildOrder({ top: [], left: ["top"], right: ["top"], bottom: ["left", "right"] })).toEqual(["top", "left", "right", "bottom"]);' },
      { name: 'a cycle in one part invalidates the whole graph', body: 'expect(buildOrder({ ok: [], a: ["b"], b: ["a"] })).toBe(null);' },
      {
        name: 'handles a wider graph',
        body:
          'const graph = { base: [] };\n' +
          'for (let i = 0; i < 100; i += 1) graph["m" + i] = ["base"];\n' +
          'const order = buildOrder(graph);\n' +
          'expect(order.length).toBe(101);\n' +
          'expect(order[0]).toBe("base");',
        hidden: true,
      },
      { name: 'a long chain resolves', body: 'const graph = {}; for (let i = 0; i < 200; i += 1) graph["n" + i] = i === 0 ? [] : ["n" + (i - 1)]; expect(buildOrder(graph)[199]).toBe("n199");', hidden: true },
    ],
    hints: [
      'Count, for each item, how many dependencies it still has outstanding. Items with a count of zero are ready to go.',
      'Repeatedly take a ready item, add it to the order, and decrement the count of everything that depended on it — which may make more items ready.',
      'If you run out of ready items before every item is placed, the ones left over are all waiting on each other. That is the cycle.',
    ],
    solution:
      'function buildOrder(graph) {\n' +
      '  const names = Object.keys(graph);\n' +
      '  const outstanding = new Map();\n' +
      '  const dependents = new Map();\n' +
      '  for (const name of names) {\n' +
      '    outstanding.set(name, graph[name].length);\n' +
      '    dependents.set(name, []);\n' +
      '  }\n' +
      '  for (const name of names) {\n' +
      '    for (const dep of graph[name]) dependents.get(dep).push(name);\n' +
      '  }\n' +
      '\n' +
      '  const order = [];\n' +
      '  const placed = new Set();\n' +
      '  let progress = true;\n' +
      '  while (progress) {\n' +
      '    progress = false;\n' +
      '    for (const name of names) {\n' +
      '      if (placed.has(name) || outstanding.get(name) !== 0) continue;\n' +
      '      placed.add(name);\n' +
      '      order.push(name);\n' +
      '      for (const dependent of dependents.get(name)) {\n' +
      '        outstanding.set(dependent, outstanding.get(dependent) - 1);\n' +
      '      }\n' +
      '      progress = true;\n' +
      '      break;\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  return order.length === names.length ? order : null;\n' +
      '}\n',
    solutionExplanation:
      'This is Kahn\'s algorithm: track how many dependencies each item is still waiting on, repeatedly place an item whose count has reached zero, and decrement its dependents. Cycle detection needs no separate pass — if the loop stops making progress while items remain unplaced, every one of those items is waiting on another unplaced item, which is precisely a cycle. Scanning `names` from the start each round and taking the first ready item is what makes tie-breaking deterministic and matches the "earliest key wins" rule; without that, any of several ready items could be chosen and the output would vary. Building the reverse `dependents` index up front is what lets each placement update its dependents directly instead of rescanning the graph.',
  },
];

export default challenges;
