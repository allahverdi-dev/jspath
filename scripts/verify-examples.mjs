#!/usr/bin/env node
/**
 * npm run content:examples
 *
 * Executes every runnable lesson example that documents an `output`, using the
 * *real sandbox formatter*, and checks the documented output matches what the
 * learner will actually see.
 *
 * Node's console and the sandbox's console format values differently (quoting of
 * strings inside objects, array rendering), so comparing against `node` output by
 * hand is not sufficient — this loads the actual runtime source used in the browser.
 *
 * Examples that touch `document`/`window` run against a real jsdom document (the
 * same #app-container convention as the browser's iframe sandbox), not skipped —
 * see `usesDom` below. Only storage/network/timing-dependent examples are skipped,
 * since those genuinely cannot be made deterministic here.
 *
 * It also verifies **interview output-prediction questions** (`kind: 'output'`):
 * the question's `code` is executed the same way, and the option it declares
 * `correct` must be exactly what the code really prints. Without this, an output
 * question could ship with a plausible-looking but wrong "correct" answer and
 * nothing would catch it — the schema alone cannot know what code prints.
 */
import { loadAllContent } from './lib/load-content.mjs';
import { SECTION } from '../src/content/schema/types.js';
import * as runtime from '../src/services/sandbox/runtime.js';
import { JSDOM } from 'jsdom';

const c = process.stdout.isTTY
  ? { red: (s) => `\x1b[31m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m` }
  : { red: (s) => s, green: (s) => s, dim: (s) => s, bold: (s) => s, yellow: (s) => s };

/* Rebuild the sandbox's console from the real runtime source. */
const SHARED = runtime.WORKER_SOURCE.slice(0, runtime.WORKER_SOURCE.indexOf('function instrument'));
const factory = new Function(`${SHARED}\nreturn { sandboxConsole: sandboxConsole, getLogs: function () { return __logs; }, reset: function () { __logs = []; } };`);

const content = await loadAllContent();
const src = (e) => content.sourceOf.get(e) ?? 'unknown file';

/**
 * An example that leaves a rejection unowned would otherwise crash this process
 * with a raw stack trace instead of being reported. Capture it so the run
 * finishes and the offending snippet is named like any other failure.
 */
let pendingUnhandled = null;
process.on('unhandledRejection', (reason) => {
  pendingUnhandled = reason instanceof Error ? reason : new Error(String(reason));
});

const failures = [];
let checked = 0;
let skipped = 0;

/**
 * Examples that touch storage, the network or timing genuinely cannot be verified
 * deterministically in this harness. Examples that only touch `document`/`window`
 * are DOM examples — those ARE verified, against a real jsdom document, rather
 * than skipped, so Module 17+ content gets the same behavioural guarantee as
 * plain-JavaScript examples instead of an unchecked pass.
 *
 * `innerText` is a further, narrower exception: jsdom has no layout engine, so
 * `.innerText` is always `undefined` there even though it works correctly in
 * every real browser. This is a gap in the verification environment, not in the
 * content, so examples that rely on it stay runnable for real users but are
 * skipped here rather than made to fail against an environment that cannot
 * support the API at all.
 */
function shouldSkip(code) {
  if (/\blocalStorage\b|\binnerText\b/.test(code)) return true;

  // `fetch` would reach the real network, which must never happen during
  // verification. An example that *defines its own* fetch shadows the global and
  // is therefore deterministic and safe to run — that is how Module 26 verifies
  // fetch behaviour without a network. Anything calling the global is skipped.
  //
  // The test is for an actual CALL (`fetch(`) rather than the bare word, so that
  // prose mentioning fetch in a comment or a string does not silently drop an
  // otherwise-verifiable example into the skipped pile. Any real invocation —
  // `fetch(`, `window.fetch(`, `globalThis.fetch(` — still matches and is skipped
  // unless the example shadows the global with its own definition.
  if (/\bfetch\s*\(/.test(code) && !/(?:const|let|var|function)\s+fetch\b/.test(code)) return true;

  return false;
}

function usesDom(code) {
  return /\bdocument\b|\bwindow\b/.test(code);
}

/** Runs that schedule work need draining before their output is complete. */
function usesAsync(code) {
  return /setTimeout|setInterval|queueMicrotask|MutationObserver|\bPromise\b|\basync\b|\bawait\b|\.then\(/.test(code);
}

/** Hard ceiling on how long one example's asynchronous work may take. */
const ASYNC_BUDGET_MS = 2000;

/**
 * Wraps the timer functions so the drain loop knows whether work is still
 * outstanding, and so anything the example leaves behind (an uncleared interval,
 * a long timeout) is torn down rather than keeping the process alive. This
 * mirrors what `execute()` in src/services/sandbox/runtime.js does for the real
 * sandbox, so verified ordering is the ordering a learner actually sees.
 */
function makeTimerHarness() {
  let live = 0;
  const timeouts = new Set();
  const intervals = new Set();

  const api = {
    setTimeout(fn, ms, ...args) {
      // Browsers tolerate a non-callable handler (it is stringified and has no
      // observable effect); Node throws. Match the browser so an example that
      // demonstrates the `setTimeout(fn(), 0)` mistake behaves as a learner sees it.
      if (typeof fn !== 'function') return -1;
      live += 1;
      const id = setTimeout(() => {
        live -= 1;
        timeouts.delete(id);
        fn(...args);
      }, ms);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) {
      if (timeouts.delete(id)) live -= 1;
      clearTimeout(id);
    },
    setInterval(fn, ms, ...args) {
      if (typeof fn !== 'function') return -1;
      live += 1;
      const id = setInterval(() => fn(...args), ms);
      intervals.add(id);
      return id;
    },
    clearInterval(id) {
      if (intervals.delete(id)) live -= 1;
      clearInterval(id);
    },
  };

  return {
    api,
    isLive: () => live > 0,
    release() {
      for (const id of timeouts) clearTimeout(id);
      for (const id of intervals) clearInterval(id);
    },
  };
}

/** Drains microtasks, then macrotask ticks while timers remain, within budget. */
async function drain(isLive) {
  const deadline = Date.now() + ASYNC_BUDGET_MS;
  await Promise.resolve();

  await new Promise((done) => {
    const tick = () => {
      if (!isLive() || Date.now() > deadline) {
        done();
        return;
      }
      setTimeout(tick, 1);
    };
    // One turn first, so a zero-delay timer the code scheduled can run.
    setTimeout(tick, 0);
  });

  return Date.now() <= deadline;
}

/**
 * Execute one authored snippet exactly as the learner sandbox would and report
 * what it printed. Shared by lesson examples and interview output-prediction
 * questions so both are verified by the same runner — there is one definition
 * of "what this code actually prints", not two that could drift.
 */
async function runSnippet(code, { html = '' } = {}) {
  const api = factory();
  api.reset();

  const timers = usesAsync(code) ? makeTimerHarness() : null;
  let settledInBudget = true;
  let threw = null;

  try {
    if (usesDom(code)) {
      const dom = new JSDOM(`<!doctype html><html><body><div id="app">${html}</div></body></html>`, {
        url: 'http://localhost/',
        runScripts: 'dangerously',
      });
      dom.window.console = api.sandboxConsole;
      if (timers) Object.assign(dom.window, timers.api);
      dom.window.eval(`"use strict";\n${code}`);
    } else if (timers) {
      new Function(
        'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
        `"use strict";\n${code}`,
      )(
        api.sandboxConsole,
        timers.api.setTimeout, timers.api.clearTimeout,
        timers.api.setInterval, timers.api.clearInterval,
      );
    } else {
      new Function('console', `"use strict";\n${code}`)(api.sandboxConsole);
    }

    if (timers) {
      settledInBudget = await drain(timers.isLive);
      timers.release();
    }
  } catch (e) {
    threw = e;
    if (timers) timers.release();
  }

  // A rejection nobody owned is the snippet's defect, not the harness's. Report
  // it as a failure rather than letting it crash the run or pass silently.
  if (pendingUnhandled && !threw) threw = pendingUnhandled;
  pendingUnhandled = null;

  return { actual: api.getLogs().map((l) => l.text).join('\n'), threw, settledInBudget };
}

for (const lesson of content.lessons) {
  for (const [index, section] of (lesson.sections ?? []).entries()) {
    if (section.kind !== SECTION.CODE) continue;
    if (!section.output || !section.runnable) continue;
    if ((section.language ?? 'javascript') !== 'javascript') continue;

    if (shouldSkip(section.code)) {
      skipped += 1;
      continue;
    }

    checked += 1;
    const api = factory();
    api.reset();

    const isAsync = usesAsync(section.code);
    const timers = isAsync ? makeTimerHarness() : null;
    let settledInBudget = true;

    let threw = null;
    try {
      if (usesDom(section.code)) {
        // Mirrors the browser frame sandbox's #app container convention
        // (src/services/sandbox/runtime.js FRAME_SOURCE) — a fresh document per
        // example, seeded with the section's own `html`, so DOM state never
        // leaks between examples and matches what CodeBlock actually renders.
        // `url` gives the document a real base URI so relative-URL properties
        // (e.g. an anchor's resolved `.href`) resolve the same way a real page
        // would, and eval'ing inside `dom.window` (rather than passing document/
        // window as plain Function parameters) puts every DOM global —
        // HTMLElement, NodeList, Node, Element — into scope exactly as a real
        // browser would, instead of only the two names explicitly threaded through.
        const dom = new JSDOM(`<!doctype html><html><body><div id="app">${section.html ?? ''}</div></body></html>`, {
          url: 'http://localhost/',
          // jsdom's window.eval is a no-op against the window's own globals
          // unless script execution is explicitly enabled — safe here since the
          // only "script" ever run is this lesson's own authored example code.
          runScripts: 'dangerously',
        });
        dom.window.console = api.sandboxConsole;
        if (timers) Object.assign(dom.window, timers.api);
        dom.window.eval(`"use strict";\n${section.code}`);
      } else if (timers) {
        new Function(
          'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
          `"use strict";\n${section.code}`,
        )(
          api.sandboxConsole,
          timers.api.setTimeout, timers.api.clearTimeout,
          timers.api.setInterval, timers.api.clearInterval,
        );
      } else {
        new Function('console', `"use strict";\n${section.code}`)(api.sandboxConsole);
      }

      if (timers) {
        settledInBudget = await drain(timers.isLive);
        timers.release();
      }
    } catch (e) {
      threw = e;
      if (timers) timers.release();
    }

    if (!threw && !settledInBudget) {
      failures.push({
        lesson: lesson.id,
        index,
        file: src(lesson),
        reason: `asynchronous work did not settle within ${ASYNC_BUDGET_MS}ms — output cannot be verified honestly`,
        expected: String(section.output),
        actual: api.getLogs().map((l) => l.text).join('\n'),
      });
      continue;
    }

    const actual = api.getLogs().map((l) => l.text).join('\n');
    const expected = String(section.output);

    if (threw) {
      failures.push({
        lesson: lesson.id,
        index,
        file: src(lesson),
        reason: `threw ${threw.name}: ${threw.message}`,
        expected,
        actual,
      });
    } else if (actual !== expected) {
      failures.push({ lesson: lesson.id, index, file: src(lesson), reason: 'output mismatch', expected, actual });
    }
  }
}

/* ------------------------------------------------------------------ *
 * Interview output-prediction questions
 *
 * The option marked `correct` must be exactly what the code prints. This is
 * the check that makes an output question trustworthy: the schema can confirm
 * the index is in range, but only running the code can confirm the answer is
 * right. A question whose distractors are plausible and whose "correct" answer
 * is subtly wrong is worse than no question at all.
 * ------------------------------------------------------------------ */
let interviewChecked = 0;
let interviewSkipped = 0;

for (const q of content.interview) {
  if (q.kind !== 'output' || typeof q.code !== 'string') continue;

  if (shouldSkip(q.code)) {
    interviewSkipped += 1;
    continue;
  }

  interviewChecked += 1;
  const expected = String(q.options[q.correct]);
  const { actual, threw, settledInBudget } = await runSnippet(q.code, { html: q.html });

  if (threw) {
    failures.push({
      lesson: q.id,
      index: 'code',
      file: src(q),
      reason: `threw ${threw.name}: ${threw.message}`,
      expected,
      actual,
    });
  } else if (!settledInBudget) {
    failures.push({
      lesson: q.id,
      index: 'code',
      file: src(q),
      reason: `asynchronous work did not settle within ${ASYNC_BUDGET_MS}ms — output cannot be verified honestly`,
      expected,
      actual,
    });
  } else if (actual !== expected) {
    failures.push({
      lesson: q.id,
      index: 'code',
      file: src(q),
      reason: `the option marked correct is not what this code prints`,
      expected,
      actual,
    });
  }
}

/* ------------------------------------------------------------------ *
 * Reference examples.
 *
 * A reference article is only worth reading if its examples are true. Any
 * example that documents an `output` and is not explicitly marked
 * `runnable: false` is executed here and its output compared exactly — the same
 * guarantee lesson examples get.
 *
 * Entries for APIs the sandbox genuinely cannot host (storage, network,
 * permission-gated and layout-dependent APIs, module syntax) set
 * `runnable: false` and are counted as illustrative rather than quietly passing.
 * ------------------------------------------------------------------ */
let referenceChecked = 0;
let referenceIllustrative = 0;
let referenceSkipped = 0;

for (const r of content.references) {
  for (const [index, ex] of (r.examples ?? []).entries()) {
    if (ex.runnable === false) { referenceIllustrative += 1; continue; }
    if (typeof ex.output !== 'string' || ex.output.length === 0) continue;
    if (shouldSkip(ex.code)) { referenceSkipped += 1; continue; }

    referenceChecked += 1;
    const { actual, threw, settledInBudget } = await runSnippet(ex.code, { html: ex.html });

    if (threw) {
      failures.push({
        lesson: r.id, index, file: src(r),
        reason: `threw ${threw.name}: ${threw.message}`,
        expected: ex.output, actual,
      });
    } else if (!settledInBudget) {
      failures.push({
        lesson: r.id, index, file: src(r),
        reason: `asynchronous work did not settle within ${ASYNC_BUDGET_MS}ms`,
        expected: ex.output, actual,
      });
    } else if (actual !== ex.output) {
      failures.push({
        lesson: r.id, index, file: src(r),
        reason: 'the documented output is not what this example prints',
        expected: ex.output, actual,
      });
    }
  }
}

console.log('');
console.log(c.bold('  Runnable example verification'));
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));
console.log(`  Examples checked   : ${checked}`);
console.log(`  Skipped (browser)  : ${skipped}`);
console.log(`  Interview output Qs: ${interviewChecked}${interviewSkipped > 0 ? ` (${interviewSkipped} skipped)` : ''}`);
console.log(`  Reference examples : ${referenceChecked} verified, ${referenceIllustrative} illustrative${referenceSkipped > 0 ? `, ${referenceSkipped} skipped` : ''}`);
console.log(`  Mismatches         : ${failures.length === 0 ? c.green('0') : c.red(String(failures.length))}`);
console.log('');

if (failures.length > 0) {
  for (const f of failures) {
    console.log(c.red(`  ${f.lesson} section[${f.index}] — ${f.reason}`));
    console.log(c.dim(`    ${f.file}`));
    console.log(c.yellow('    documented:'));
    for (const line of f.expected.split('\n')) console.log(`      ${line}`);
    console.log(c.yellow('    actual:'));
    for (const line of f.actual.split('\n')) console.log(`      ${line}`);
    console.log('');
  }
  console.log(c.red(`  FAILED — ${failures.length} item(s) do not produce their documented output.`));
  console.log('');
  process.exit(1);
}

console.log(c.green('  Every runnable example produces its documented output.'));
if (interviewChecked > 0) {
  console.log(c.green(`  Every output-prediction question's correct option is its real output.`));
}
if (referenceChecked > 0) {
  console.log(c.green('  Every runnable reference example produces its documented output.'));
}
console.log('');
