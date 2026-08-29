/**
 * Public sandbox API.
 *
 * `runCode()` executes learner code away from the application:
 *
 *  - **Worker host** (default). A Web Worker has no DOM and no access to the page.
 *    Crucially it can be *terminated*, so a runaway loop that defeats the injected
 *    guard is still killed by the wall-clock timeout rather than freezing the tab.
 *  - **Frame host** (`needsDom: true`). A sandboxed iframe with
 *    `sandbox="allow-scripts"` and deliberately no `allow-same-origin`, giving it
 *    an opaque origin — it cannot touch the parent document, cookies or storage.
 *
 * `eval()` is never called in the parent window.
 */
import { WORKER_SOURCE, FRAME_SOURCE } from './runtime.js';

const DEFAULT_TIMEOUT = 4000;

let workerUrl = null;
function getWorkerUrl() {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
  }
  return workerUrl;
}

let seq = 0;
const nextId = () => `run-${++seq}`;

/**
 * A worker is created per run and terminated afterwards. That costs a few
 * milliseconds but guarantees no state leaks between runs — a learner's previous
 * global assignment can never affect the next attempt, which would otherwise make
 * test results maddeningly non-reproducible.
 */
function runInWorker(payload, timeout) {
  return new Promise((resolve) => {
    let worker;
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { worker?.terminate(); } catch { /* already gone */ }
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        logs: [],
        tests: (payload.tests ?? []).map((t) => ({
          name: t.name,
          passed: false,
          hidden: !!t.hidden,
          message: 'Did not finish — execution timed out.',
        })),
        passed: false,
        timedOut: true,
        error: {
          name: 'TimeoutError',
          message: `Execution stopped after ${timeout}ms. This usually means an infinite loop or a promise that never settles.`,
          line: null,
        },
      });
    }, timeout + 250);

    try {
      worker = new Worker(getWorkerUrl());
    } catch (e) {
      finish({
        logs: [],
        tests: [],
        passed: false,
        error: { name: 'SandboxError', message: `Could not start the sandbox: ${e.message}`, line: null },
      });
      return;
    }

    worker.onmessage = (event) => finish(event.data);
    worker.onerror = (event) => {
      event.preventDefault?.();
      finish({
        logs: [],
        tests: [],
        passed: false,
        error: { name: 'Error', message: event.message || 'The sandbox crashed.', line: event.lineno ?? null },
      });
    };
    worker.postMessage(payload);
  });
}

/* ------------------------------------------------------------------ *
 * Frame host — used only when code needs a document
 * ------------------------------------------------------------------ */

let framePromise = null;

function getFrame() {
  if (framePromise) return framePromise;
  framePromise = new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('title', 'JSPath code sandbox');
    frame.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;';
    frame.srcdoc = FRAME_SOURCE;

    const onReady = (event) => {
      if (event.source !== frame.contentWindow || !event.data?.__jspathReady) return;
      window.removeEventListener('message', onReady);
      resolve(frame);
    };
    window.addEventListener('message', onReady);

    frame.onerror = () => reject(new Error('Could not create the DOM sandbox.'));
    document.body.appendChild(frame);

    setTimeout(() => {
      window.removeEventListener('message', onReady);
      reject(new Error('The DOM sandbox did not start in time.'));
    }, 5000);
  }).catch((e) => {
    framePromise = null;
    throw e;
  });
  return framePromise;
}

function runInFrame(payload, timeout) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(result);
    };

    const onMessage = (event) => {
      if (!event.data?.__jspath || event.data.id !== payload.id) return;
      finish(event.data);
    };

    const timer = setTimeout(() => {
      // A hung frame cannot be terminated, so it is discarded and rebuilt.
      framePromise = null;
      finish({
        logs: [],
        tests: [],
        passed: false,
        timedOut: true,
        error: {
          name: 'TimeoutError',
          message: `Execution stopped after ${timeout}ms.`,
          line: null,
        },
      });
    }, timeout + 500);

    window.addEventListener('message', onMessage);
    getFrame()
      .then((frame) => frame.contentWindow.postMessage({ ...payload, __jspath: true }, '*'))
      .catch((e) =>
        finish({
          logs: [],
          tests: [],
          passed: false,
          error: { name: 'SandboxError', message: e.message, line: null },
        }),
      );
  });
}

/**
 * Run learner code.
 *
 * @param {string} code
 * @param {object} options
 * @param {Array<{name:string, body:string, hidden?:boolean}>} [options.tests]
 * @param {boolean} [options.needsDom]  run in the iframe host with a document
 * @param {string}  [options.html]      initial markup for DOM exercises
 * @param {number}  [options.timeout]
 * @returns {Promise<{logs:Array, tests:Array, passed:boolean, error:object|null}>}
 */
export async function runCode(code, options = {}) {
  const { tests = [], needsDom = false, html = '', timeout = DEFAULT_TIMEOUT, opLimit } = options;
  const payload = { id: nextId(), code, tests, html, timeout, opLimit };

  if (needsDom && typeof document !== 'undefined') {
    return runInFrame(payload, timeout);
  }
  if (typeof Worker === 'undefined') {
    return {
      logs: [],
      tests: [],
      passed: false,
      error: {
        name: 'SandboxError',
        message: 'This browser does not support Web Workers, so code cannot be run safely.',
        line: null,
      },
    };
  }
  return runInWorker(payload, timeout);
}

/** Release the shared frame and blob URL. Called on teardown in tests. */
export function disposeSandbox() {
  if (workerUrl) {
    URL.revokeObjectURL(workerUrl);
    workerUrl = null;
  }
  framePromise = null;
}
