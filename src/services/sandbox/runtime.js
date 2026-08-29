/**
 * The sandbox runtime source.
 *
 * This string is turned into a Blob and loaded as either a Web Worker or a
 * sandboxed iframe. It is written as a string (not an imported module) so the same
 * code can be injected into both hosts without a build step, and so nothing in it
 * can accidentally close over the parent application's scope.
 *
 * Never evaluated in the parent window.
 */

/** Value serialisation + a minimal expect() — shared by both hosts. */
const SHARED = `
var MAX_DEPTH = 4;
var MAX_ITEMS = 100;
var MAX_STRING = 10000;

function typeName(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (v instanceof Error) return 'error';
  if (v instanceof Date) return 'date';
  if (v instanceof Map) return 'map';
  if (v instanceof Set) return 'set';
  if (v instanceof RegExp) return 'regexp';
  return typeof v;
}

/** Produce a readable, depth-limited, cycle-safe rendering of any value. */
function format(value, depth, seen) {
  depth = depth || 0;
  seen = seen || new Set();
  var t = typeName(value);

  if (t === 'string') return depth === 0 ? value : JSON.stringify(value.slice(0, MAX_STRING));
  if (t === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (t === 'bigint') return String(value) + 'n';
  if (t === 'undefined') return 'undefined';
  if (t === 'null') return 'null';
  if (t === 'boolean') return String(value);
  if (t === 'symbol') return value.toString();
  if (t === 'function') return (value.name ? 'ƒ ' + value.name + '()' : 'ƒ ()');
  if (t === 'date') return isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString();
  if (t === 'regexp') return value.toString();
  if (t === 'error') return value.name + ': ' + value.message;

  if (seen.has(value)) return '[Circular]';
  if (depth >= MAX_DEPTH) return t === 'array' ? '[…]' : '{…}';
  seen.add(value);

  try {
    if (t === 'array') {
      var items = [];
      for (var i = 0; i < Math.min(value.length, MAX_ITEMS); i++) {
        items.push(format(value[i], depth + 1, seen));
      }
      if (value.length > MAX_ITEMS) items.push('… ' + (value.length - MAX_ITEMS) + ' more');
      return '[' + items.join(', ') + ']';
    }
    if (t === 'map') {
      var m = [];
      value.forEach(function (v, k) {
        if (m.length < MAX_ITEMS) m.push(format(k, depth + 1, seen) + ' => ' + format(v, depth + 1, seen));
      });
      return 'Map(' + value.size + ') {' + m.join(', ') + '}';
    }
    if (t === 'set') {
      var s = [];
      value.forEach(function (v) {
        if (s.length < MAX_ITEMS) s.push(format(v, depth + 1, seen));
      });
      return 'Set(' + value.size + ') {' + s.join(', ') + '}';
    }
    var keys = Object.keys(value);
    var parts = [];
    for (var j = 0; j < Math.min(keys.length, MAX_ITEMS); j++) {
      parts.push(keys[j] + ': ' + format(value[keys[j]], depth + 1, seen));
    }
    if (keys.length > MAX_ITEMS) parts.push('… ' + (keys.length - MAX_ITEMS) + ' more');
    var ctor = value.constructor && value.constructor.name;
    var prefix = ctor && ctor !== 'Object' ? ctor + ' ' : '';
    return prefix + '{' + parts.join(', ') + '}';
  } finally {
    seen.delete(value);
  }
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    var av = Array.from(a); var bv = Array.from(b);
    return av.every(function (x) { return bv.some(function (y) { return deepEqual(x, y); }); });
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    var ok = true;
    a.forEach(function (v, k) { if (!b.has(k) || !deepEqual(v, b.get(k))) ok = false; });
    return ok;
  }
  var ka = Object.keys(a); var kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(function (k) {
    return Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]);
  });
}

function AssertionError(message) {
  var e = new Error(message);
  e.name = 'AssertionError';
  return e;
}

function expect(actual) {
  var api = {
    toBe: function (expected) {
      if (!Object.is(actual, expected)) {
        throw AssertionError('Expected ' + format(expected, 1) + ' but received ' + format(actual, 1));
      }
    },
    toEqual: function (expected) {
      if (!deepEqual(actual, expected)) {
        throw AssertionError('Expected ' + format(expected, 1) + ' but received ' + format(actual, 1));
      }
    },
    toBeCloseTo: function (expected, precision) {
      var p = precision === undefined ? 2 : precision;
      if (Math.abs(actual - expected) >= Math.pow(10, -p) / 2) {
        throw AssertionError('Expected ' + format(actual, 1) + ' to be close to ' + format(expected, 1));
      }
    },
    toBeTruthy: function () {
      if (!actual) throw AssertionError('Expected a truthy value but received ' + format(actual, 1));
    },
    toBeFalsy: function () {
      if (actual) throw AssertionError('Expected a falsy value but received ' + format(actual, 1));
    },
    toBeNull: function () {
      if (actual !== null) throw AssertionError('Expected null but received ' + format(actual, 1));
    },
    toBeUndefined: function () {
      if (actual !== undefined) throw AssertionError('Expected undefined but received ' + format(actual, 1));
    },
    toBeDefined: function () {
      if (actual === undefined) throw AssertionError('Expected a defined value but received undefined');
    },
    toBeNaN: function () {
      if (!Number.isNaN(actual)) throw AssertionError('Expected NaN but received ' + format(actual, 1));
    },
    toHaveLength: function (n) {
      if (!actual || actual.length !== n) {
        throw AssertionError('Expected length ' + n + ' but received ' + (actual ? actual.length : format(actual, 1)));
      }
    },
    toContain: function (item) {
      var ok = typeof actual === 'string' ? actual.indexOf(item) !== -1
        : Array.isArray(actual) ? actual.some(function (x) { return deepEqual(x, item); })
        : actual instanceof Set ? actual.has(item)
        : false;
      if (!ok) throw AssertionError('Expected ' + format(actual, 1) + ' to contain ' + format(item, 1));
    },
    toMatch: function (re) {
      var r = re instanceof RegExp ? re : new RegExp(re);
      if (!r.test(String(actual))) {
        throw AssertionError('Expected ' + format(actual, 1) + ' to match ' + r);
      }
    },
    toBeInstanceOf: function (Ctor) {
      if (!(actual instanceof Ctor)) {
        throw AssertionError('Expected an instance of ' + (Ctor.name || 'the given class'));
      }
    },
    toBeGreaterThan: function (n) {
      if (!(actual > n)) throw AssertionError('Expected ' + format(actual, 1) + ' to be greater than ' + n);
    },
    toBeLessThan: function (n) {
      if (!(actual < n)) throw AssertionError('Expected ' + format(actual, 1) + ' to be less than ' + n);
    },
    toBeTypeOf: function (t) {
      if (typeof actual !== t) {
        throw AssertionError('Expected typeof to be "' + t + '" but received "' + typeof actual + '"');
      }
    },
    toThrow: function (expected) {
      if (typeof actual !== 'function') throw AssertionError('toThrow() requires a function');
      var threw = false; var err = null;
      try { actual(); } catch (e) { threw = true; err = e; }
      if (!threw) throw AssertionError('Expected the function to throw, but it did not');
      if (expected instanceof RegExp && !expected.test(String(err && err.message))) {
        throw AssertionError('Expected the error message to match ' + expected + ' but got "' + (err && err.message) + '"');
      }
      if (typeof expected === 'string' && String(err && err.message).indexOf(expected) === -1) {
        throw AssertionError('Expected the error message to contain "' + expected + '" but got "' + (err && err.message) + '"');
      }
    }
  };
  api.not = {
    toBe: function (expected) {
      if (Object.is(actual, expected)) throw AssertionError('Expected the value not to be ' + format(expected, 1));
    },
    toEqual: function (expected) {
      if (deepEqual(actual, expected)) throw AssertionError('Expected the value not to equal ' + format(expected, 1));
    },
    toThrow: function () {
      if (typeof actual !== 'function') throw AssertionError('not.toThrow() requires a function');
      try { actual(); } catch (e) { throw AssertionError('Expected no error, but it threw: ' + e.message); }
    },
    toContain: function (item) {
      var has = Array.isArray(actual) ? actual.some(function (x) { return deepEqual(x, item); })
        : typeof actual === 'string' ? actual.indexOf(item) !== -1 : false;
      if (has) throw AssertionError('Expected ' + format(actual, 1) + ' not to contain ' + format(item, 1));
    }
  };
  return api;
}

/**
 * Guard called at the top of every instrumented loop body.
 * Throws once the budget is exhausted, which turns an infinite loop into a
 * catchable error with a useful message instead of a frozen tab.
 */
var __ops = 0;
var __opLimit = 5000000;
var __deadline = 0;
function __guard() {
  if (++__ops > __opLimit) {
    __ops = 0;
    throw new Error('Execution stopped: this looks like an infinite loop (over ' + __opLimit.toLocaleString() + ' iterations).');
  }
  if ((__ops & 4095) === 0 && __deadline && Date.now() > __deadline) {
    throw new Error('Execution stopped: the code ran longer than the time limit.');
  }
}

var __logs = [];
function pushLog(level, args) {
  if (__logs.length >= 500) {
    if (__logs.length === 500) {
      __logs.push({ level: 'warn', text: 'Output truncated after 500 lines.' });
    }
    return;
  }
  var parts = [];
  for (var i = 0; i < args.length; i++) parts.push(format(args[i], 0));
  __logs.push({ level: level, text: parts.join(' ') });
}

var sandboxConsole = {
  log: function () { pushLog('log', arguments); },
  info: function () { pushLog('info', arguments); },
  warn: function () { pushLog('warn', arguments); },
  error: function () { pushLog('error', arguments); },
  debug: function () { pushLog('debug', arguments); },
  table: function () { pushLog('log', arguments); },
  dir: function () { pushLog('log', arguments); },
  trace: function () { pushLog('log', arguments); },
  group: function () { pushLog('log', arguments); },
  groupEnd: function () {},
  time: function () {},
  timeEnd: function () {},
  assert: function (cond) {
    if (!cond) pushLog('error', ['Assertion failed']);
  },
  count: function () {},
  clear: function () { __logs = []; }
};

/** Turn a thrown value into a serialisable, learner-readable shape. */
function describeError(e, offset) {
  if (!(e instanceof Error)) return { name: 'Error', message: String(e), line: null };
  var line = null;
  var match = /<anonymous>:(\\d+):(\\d+)/.exec(e.stack || '');
  if (match) line = Math.max(1, parseInt(match[1], 10) - (offset || 0));
  return {
    name: e.name || 'Error',
    message: e.message,
    line: line,
    stack: String(e.stack || '').split('\\n').slice(0, 6).join('\\n')
  };
}
`;

/**
 * Loop instrumentation.
 *
 * Inserts a `__guard();` call at the start of each loop body so runaway loops
 * throw instead of hanging. This is a lexical scan, not a full parser: it tracks
 * string, template and comment state so that the word "while" inside a string is
 * never mistaken for a loop.
 */
export const INSTRUMENT_SOURCE = `
function instrument(src) {
  var out = '';
  var i = 0;
  var n = src.length;
  var mode = 'code'; // code | line-comment | block-comment | single | double | template
  var pendingLoop = false;   // saw a loop keyword, waiting for its body
  var parenDepth = 0;

  function startsWord(idx, word) {
    if (src.substr(idx, word.length) !== word) return false;
    var before = idx === 0 ? ' ' : src[idx - 1];
    var after = src[idx + word.length] || ' ';
    return !/[A-Za-z0-9_$]/.test(before) && !/[A-Za-z0-9_$.]/.test(after);
  }

  while (i < n) {
    var ch = src[i];
    var next = src[i + 1];

    if (mode === 'code') {
      if (ch === '/' && next === '/') { mode = 'line-comment'; out += ch; i++; continue; }
      if (ch === '/' && next === '*') { mode = 'block-comment'; out += ch; i++; continue; }
      if (ch === "'") { mode = 'single'; out += ch; i++; continue; }
      if (ch === '"') { mode = 'double'; out += ch; i++; continue; }
      if (ch === '\\u0060') { mode = 'template'; out += ch; i++; continue; }

      if (!pendingLoop && (startsWord(i, 'for') || startsWord(i, 'while'))) {
        pendingLoop = true;
        parenDepth = 0;
        out += ch; i++;
        continue;
      }
      if (startsWord(i, 'do')) {
        // do { ... } while (...)
        var k = i + 2;
        while (k < n && /\\s/.test(src[k])) k++;
        if (src[k] === '{') {
          out += src.slice(i, k + 1) + '__guard();';
          i = k + 1;
          continue;
        }
      }

      if (pendingLoop) {
        if (ch === '(') parenDepth++;
        else if (ch === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            // Header finished. Find the body.
            var j = i + 1;
            while (j < n && /\\s/.test(src[j])) j++;
            if (src[j] === '{') {
              out += src.slice(i, j + 1) + '__guard();';
              i = j + 1;
            } else {
              // Body-less loop, e.g. while (x) x--;  →  wrap in a block.
              out += src.slice(i, j) + '{__guard();';
              var depth = 0; var m = j;
              while (m < n) {
                var cm = src[m];
                if (cm === '(' || cm === '[' || cm === '{') depth++;
                if (cm === ')' || cm === ']' || cm === '}') depth--;
                if (cm === ';' && depth === 0) { m++; break; }
                if (cm === '\\n' && depth === 0) break;
                m++;
              }
              out += src.slice(j, m) + '}';
              i = m;
            }
            pendingLoop = false;
            continue;
          }
        }
      }
      out += ch; i++;
      continue;
    }

    if (mode === 'line-comment') {
      if (ch === '\\n') mode = 'code';
      out += ch; i++; continue;
    }
    if (mode === 'block-comment') {
      if (ch === '*' && next === '/') { mode = 'code'; out += ch + next; i += 2; continue; }
      out += ch; i++; continue;
    }
    if (mode === 'single' || mode === 'double' || mode === 'template') {
      if (ch === '\\\\') { out += ch + (next || ''); i += 2; continue; }
      if (mode === 'single' && ch === "'") mode = 'code';
      else if (mode === 'double' && ch === '"') mode = 'code';
      else if (mode === 'template' && ch === '\\u0060') mode = 'code';
      out += ch; i++; continue;
    }
  }
  return out;
}
`;

/** The execution core, shared by worker and iframe hosts. */
const EXECUTE = `
function execute(payload) {
  __logs = [];
  __ops = 0;
  __opLimit = payload.opLimit || 5000000;
  __deadline = Date.now() + (payload.timeout || 4000);

  var userCode;
  try {
    userCode = instrument(payload.code);
  } catch (e) {
    userCode = payload.code; // instrumentation must never block a run
  }

  var tests = payload.tests || [];
  var results = [];
  var runtimeError = null;

  // Asynchronous support. Test bodies are wrapped in async functions so they may
  // use await; a body that returns a promise is settled before results are read,
  // instead of being reported as passed the moment it was merely started.
  var pending = [];

  // Timers are wrapped so the run knows whether asynchronous work is still
  // outstanding, and so anything the code leaves behind (notably an uncleared
  // setInterval) is torn down rather than leaking past the run.
  var __liveTimers = 0;
  var __timeoutIds = [];
  var __intervalIds = [];

  function __setTimeout(fn, ms) {
    // A non-callable handler has no observable effect in a browser; mirror that
    // rather than throwing, so demonstrating setTimeout(fn(), 0) stays truthful.
    if (typeof fn !== 'function') return -1;
    __liveTimers += 1;
    var id = setTimeout(function () {
      __liveTimers -= 1;
      try { fn(); } catch (e) { if (!runtimeError) runtimeError = describeError(e, 0); }
    }, ms);
    __timeoutIds.push(id);
    return id;
  }

  function __clearTimeout(id) {
    if (__timeoutIds.indexOf(id) !== -1) __liveTimers -= 1;
    clearTimeout(id);
  }

  function __setInterval(fn, ms) {
    if (typeof fn !== 'function') return -1;
    var id = setInterval(function () {
      try { fn(); } catch (e) { if (!runtimeError) runtimeError = describeError(e, 0); }
    }, ms);
    __intervalIds.push(id);
    return id;
  }

  function __clearInterval(id) { clearInterval(id); }

  function __releaseTimers() {
    for (var i = 0; i < __timeoutIds.length; i++) clearTimeout(__timeoutIds[i]);
    for (var j = 0; j < __intervalIds.length; j++) clearInterval(__intervalIds[j]);
  }

  var harness = '"use strict";\\n' + userCode + '\\n';
  for (var i = 0; i < tests.length; i++) {
    harness += '__run(' + i + ', async function () {' + tests[i].body + '\\n});\\n';
  }

  function __record(index, error) {
    var t = tests[index];
    if (!error) {
      results.push({ name: t.name, passed: true, hidden: !!t.hidden });
      return;
    }
    results.push({
      name: t.name,
      passed: false,
      hidden: !!t.hidden,
      message: error && error.message ? error.message : String(error)
    });
  }

  function __run(index, fn) {
    var value;
    try {
      value = fn();
    } catch (e) {
      __record(index, e);
      return;
    }
    if (value && typeof value.then === 'function') {
      pending.push(value.then(
        function () { __record(index, null); },
        function (e) { __record(index, e || new Error('rejected')); }
      ));
      return;
    }
    __record(index, null);
  }

  /**
   * Waits for asynchronous work started by the run: pending test promises, then
   * repeated macrotask ticks while timers are still outstanding. Bounded by the
   * run's own deadline so a runaway interval cannot stall the host.
   */
  function __settle() {
    return Promise.all(pending).then(function () {
      return new Promise(function (done) {
        function tick() {
          if (__liveTimers <= 0 || Date.now() > __deadline) { done(); return; }
          setTimeout(tick, 1);
        }
        // One turn first, so a zero-delay timer scheduled by the code can run.
        setTimeout(tick, 0);
      });
    });
  }

  // Offset lines added by the harness preamble so reported line numbers line up
  // with what the learner sees in the editor.
  var LINE_OFFSET = 2;

  function __finish() {
    __releaseTimers();
    return {
      logs: __logs,
      error: runtimeError,
      tests: results,
      passed: results.length > 0 && results.every(function (r) { return r.passed; })
    };
  }

  try {
    var fn = new Function(
      'expect', '__run', 'console', '__guard',
      'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      harness
    );
    fn(
      expect, __run, sandboxConsole, __guard,
      __setTimeout, __clearTimeout, __setInterval, __clearInterval
    );
  } catch (e) {
    runtimeError = describeError(e, LINE_OFFSET);
    // Tests that never ran are reported as errored rather than silently missing.
    for (var k = results.length; k < tests.length; k++) {
      results.push({
        name: tests[k].name,
        passed: false,
        hidden: !!tests[k].hidden,
        message: 'Did not run — the code threw before reaching this test.'
      });
    }
    return __finish();
  }

  // Synchronous runs settle immediately; anything asynchronous is waited for so
  // its output and test results are real rather than merely started.
  if (pending.length === 0 && __liveTimers <= 0) return __finish();

  return __settle().then(__finish);
}
`;

/** Worker host: receives a message, runs, posts the result back. */
export const WORKER_SOURCE = `${SHARED}
${INSTRUMENT_SOURCE}
${EXECUTE}
self.onmessage = function (event) {
  var payload = event.data;
  var result;
  try {
    result = execute(payload);
  } catch (e) {
    result = { logs: [], error: { name: 'Error', message: String(e && e.message || e), line: null }, tests: [], passed: false };
  }
  // execute() returns a promise when the run scheduled asynchronous work.
  Promise.resolve(result).then(function (settled) {
    settled.id = payload.id;
    self.postMessage(settled);
  });
};
`;

/**
 * Iframe host: same core, but with a real `document` so DOM exercises work.
 * The frame is loaded with `sandbox="allow-scripts"` and no `allow-same-origin`,
 * so it has an opaque origin and cannot reach the parent document or its storage.
 */
export const FRAME_SOURCE = `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body>
<div id="app"></div>
<script>
${SHARED}
${INSTRUMENT_SOURCE}
${EXECUTE}
window.addEventListener('message', function (event) {
  var payload = event.data;
  if (!payload || payload.__jspath !== true) return;
  document.getElementById('app').innerHTML = payload.html || '';
  var result;
  try {
    result = execute(payload);
  } catch (e) {
    result = { logs: [], error: { name: 'Error', message: String(e && e.message || e), line: null }, tests: [], passed: false };
  }
  // execute() returns a promise when the run scheduled asynchronous work, so the
  // rendered HTML is read after that work has finished changing the document.
  Promise.resolve(result).then(function (settled) {
    settled.id = payload.id;
    settled.__jspath = true;
    settled.html = document.getElementById('app').innerHTML;
    (event.source || parent).postMessage(settled, '*');
  });
});
(parent).postMessage({ __jspathReady: true }, '*');
<${''}/script>
</body></html>`;
