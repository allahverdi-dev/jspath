#!/usr/bin/env node
/**
 * npm run content:verify
 *
 * Runs every authored exercise's and challenge's **reference solution** against its
 * own tests, using the same harness shape as the browser sandbox.
 *
 * The content audit proves that tests *exist*; this proves they actually pass for a
 * correct answer. Without it, a typo in an assertion produces an exercise no learner
 * can ever solve.
 */
import { loadAllContent } from './lib/load-content.mjs';
import { JSDOM } from 'jsdom';

const c = process.stdout.isTTY
  ? { red: (s) => `\x1b[31m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m` }
  : { red: (s) => s, green: (s) => s, dim: (s) => s, bold: (s) => s };

/* A trimmed version of the sandbox's expect(), sufficient for verification. */
function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}

const show = (v) => {
  try { return typeof v === 'string' ? JSON.stringify(v) : JSON.stringify(v) ?? String(v); }
  catch { return String(v); }
};

function expect(actual) {
  const fail = (msg) => { throw new Error(msg); };
  const api = {
    toBe: (e) => { if (!Object.is(actual, e)) fail(`expected ${show(e)}, received ${show(actual)}`); },
    toEqual: (e) => { if (!deepEqual(actual, e)) fail(`expected ${show(e)}, received ${show(actual)}`); },
    toBeCloseTo: (e, p = 2) => { if (Math.abs(actual - e) >= 10 ** -p / 2) fail(`expected ~${e}, received ${actual}`); },
    toBeTruthy: () => { if (!actual) fail(`expected truthy, received ${show(actual)}`); },
    toBeFalsy: () => { if (actual) fail(`expected falsy, received ${show(actual)}`); },
    toBeNull: () => { if (actual !== null) fail(`expected null, received ${show(actual)}`); },
    toBeUndefined: () => { if (actual !== undefined) fail(`expected undefined, received ${show(actual)}`); },
    toBeDefined: () => { if (actual === undefined) fail('expected a defined value'); },
    toBeNaN: () => { if (!Number.isNaN(actual)) fail(`expected NaN, received ${show(actual)}`); },
    toHaveLength: (n) => { if (!actual || actual.length !== n) fail(`expected length ${n}, received ${actual && actual.length}`); },
    toContain: (i) => {
      const ok = typeof actual === 'string' ? actual.includes(i)
        : Array.isArray(actual) ? actual.some((x) => deepEqual(x, i))
        : actual instanceof Set ? actual.has(i) : false;
      if (!ok) fail(`expected ${show(actual)} to contain ${show(i)}`);
    },
    toMatch: (re) => { if (!(re instanceof RegExp ? re : new RegExp(re)).test(String(actual))) fail(`expected ${show(actual)} to match ${re}`); },
    toBeInstanceOf: (C) => { if (!(actual instanceof C)) fail(`expected an instance of ${C.name}`); },
    toBeGreaterThan: (n) => { if (!(actual > n)) fail(`expected ${show(actual)} > ${n}`); },
    toBeLessThan: (n) => { if (!(actual < n)) fail(`expected ${show(actual)} < ${n}`); },
    toBeTypeOf: (t) => { if (typeof actual !== t) fail(`expected typeof "${t}", received "${typeof actual}"`); },
    toThrow: (expected) => {
      if (typeof actual !== 'function') fail('toThrow() requires a function');
      let threw = false; let err = null;
      try { actual(); } catch (e) { threw = true; err = e; }
      if (!threw) fail('expected the function to throw');
      if (expected instanceof RegExp && !expected.test(String(err?.message))) fail(`error message did not match ${expected}`);
      if (typeof expected === 'string' && !String(err?.message).includes(expected)) fail(`error message did not contain "${expected}"`);
    },
  };
  api.not = {
    toBe: (e) => { if (Object.is(actual, e)) fail(`expected not to be ${show(e)}`); },
    toEqual: (e) => { if (deepEqual(actual, e)) fail(`expected not to equal ${show(e)}`); },
    toContain: (i) => {
      const has = Array.isArray(actual) ? actual.some((x) => deepEqual(x, i)) : String(actual).includes(i);
      if (has) fail(`expected not to contain ${show(i)}`);
    },
    toThrow: () => { try { actual(); } catch (e) { fail(`expected no error, threw: ${e.message}`); } },
  };
  return api;
}

const content = await loadAllContent();
const src = (e) => content.sourceOf.get(e) ?? 'unknown file';

const failures = [];
let checked = 0;
let assertions = 0;

/** Hard ceiling on how long one exercise's asynchronous tests may take. */
const ASYNC_BUDGET_MS = 2000;

async function verify(item, kind) {
  if (!Array.isArray(item.tests) || item.tests.length === 0) return;
  if (typeof item.solution !== 'string') return;
  checked += 1;

  const logs = [];
  const sandboxConsole = {
    log: (...a) => logs.push(a.join(' ')), info() {}, warn() {}, error() {},
    debug() {}, table() {}, dir() {}, trace() {}, group() {}, groupEnd() {},
    time() {}, timeEnd() {}, assert() {}, count() {}, clear() {},
  };

  const results = [];
  const pending = [];

  // Mirrors `__run` in src/services/sandbox/runtime.js: test bodies are wrapped
  // in async functions so they may use await, and a body returning a promise is
  // settled before results are read rather than counted as passed the instant it
  // was started — which would be a false green check for async exercises.
  const run = (index, fn) => {
    assertions += 1;
    const record = (error) => {
      if (!error) { results.push({ name: item.tests[index].name, passed: true }); return; }
      results.push({ name: item.tests[index].name, passed: false, message: error.message ?? String(error) });
    };

    let value;
    try { value = fn(); } catch (e) { record(e); return; }

    if (value && typeof value.then === 'function') {
      pending.push(value.then(() => record(null), (e) => record(e ?? new Error('rejected'))));
      return;
    }
    record(null);
  };

  let harness = '"use strict";\n' + item.solution + '\n';
  item.tests.forEach((t, i) => { harness += `__run(${i}, async function () {${t.body}\n});\n`; });

  const needsDom = item.needsDom === true || item.kind === 'domTask';

  try {
    if (needsDom) {
      // Mirrors the browser frame sandbox's contract: starter/solution code and
      // tests run against a real document with the exercise's `html` already
      // injected into a #app container — same shape as FRAME_SOURCE in
      // src/services/sandbox/runtime.js, so behavioural DOM exercises are
      // verified against real DOM APIs rather than skipped or string-matched.
      // Evaluating inside `dom.window` (rather than passing document/window as
      // plain Function parameters) puts every DOM global — HTMLElement,
      // NodeList, Node, Element — into scope exactly as a real browser would.
      const dom = new JSDOM(`<!doctype html><html><body><div id="app">${item.html ?? ''}</div></body></html>`, {
        url: 'http://localhost/',
        // jsdom's window.eval is a no-op against the window's own globals
        // unless script execution is explicitly enabled — safe here since the
        // only "script" ever run is this exercise's own authored solution code.
        runScripts: 'dangerously',
      });
      dom.window.console = sandboxConsole;
      dom.window.expect = expect;
      dom.window.__run = run;
      dom.window.eval(harness);
    } else {
      // eslint-disable-next-line no-new-func
      new Function('expect', '__run', 'console', harness)(expect, run, sandboxConsole);
    }
  } catch (e) {
    failures.push({ id: item.id, kind, file: src(item), error: `solution threw before tests ran: ${e.message}` });
    return;
  }

  if (pending.length > 0) {
    // Bounded so a test awaiting something that never settles is reported rather
    // than hanging the run — a hang is indistinguishable from a pass otherwise.
    const timedOut = Symbol('timeout');
    const outcome = await Promise.race([
      Promise.all(pending).then(() => null),
      new Promise((r) => setTimeout(() => r(timedOut), ASYNC_BUDGET_MS)),
    ]);

    if (outcome === timedOut) {
      failures.push({
        id: item.id,
        kind,
        file: src(item),
        error: `  ✗ asynchronous tests did not settle within ${ASYNC_BUDGET_MS}ms`,
      });
      return;
    }
  }

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    failures.push({
      id: item.id,
      kind,
      file: src(item),
      error: failed.map((f) => `  ✗ ${f.name}\n      ${f.message}`).join('\n'),
    });
  }
}

for (const ex of content.exercises) await verify(ex, 'exercise');
for (const ch of content.challenges) await verify(ch, 'challenge');

console.log('');
console.log(c.bold('  Reference solution verification'));
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));
console.log(`  Items with tests   : ${checked}`);
console.log(`  Assertions run     : ${assertions}`);
console.log(`  Failing items      : ${failures.length === 0 ? c.green('0') : c.red(String(failures.length))}`);
console.log('');

if (failures.length > 0) {
  for (const f of failures) {
    console.log(c.red(`  ${f.kind} ${f.id}`));
    console.log(c.dim(`    ${f.file}`));
    console.log(c.red(f.error));
    console.log('');
  }
  console.log(c.red(`  FAILED — ${failures.length} reference solution(s) do not pass their own tests.`));
  console.log('');
  process.exit(1);
}

console.log(c.green('  Every reference solution passes its own tests.'));
console.log('');
