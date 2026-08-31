/**
 * Approved, stable product allocation. These are IDs, never positions or runtime
 * difficulty cutoffs: adding/reordering content cannot move an existing paywall.
 * Arrays remain inspectable for duplicate-ID regression tests; lookups are private.
 *
 * Exercises: paired mastery/application/trade-off tasks in later async, advanced
 * and professional lessons. All foundational modules stay open; each selected
 * four-exercise lesson keeps two Free exercises (usually its coding foundation).
 * Some lessons deliberately keep their sole implementation task Free.
 */
export const PRO_CONTENT_IDS = Object.freeze({
  exercise: Object.freeze([
    // Module m23
    'ex-m23-04-c', 'ex-m23-04-d',
    'ex-m23-05-b', 'ex-m23-05-d',
    // Module m24
    'ex-m24-02-a', 'ex-m24-02-c',
    'ex-m24-03-c', 'ex-m24-03-d',
    'ex-m24-04-c', 'ex-m24-04-d',
    'ex-m24-05-b', 'ex-m24-05-d',
    // Module m25
    'ex-m25-02-c', 'ex-m25-02-d',
    'ex-m25-03-c', 'ex-m25-03-d',
    'ex-m25-04-a', 'ex-m25-04-c',
    // Module m26
    'ex-m26-02-a', 'ex-m26-02-c',
    'ex-m26-03-c', 'ex-m26-03-d',
    'ex-m26-04-c', 'ex-m26-04-d',
    'ex-m26-05-c', 'ex-m26-05-d',
    'ex-m26-06-c', 'ex-m26-06-d',
    // Module m27
    'ex-m27-02-b', 'ex-m27-02-d',
    'ex-m27-03-b', 'ex-m27-03-d',
    'ex-m27-04-c', 'ex-m27-04-d',
    'ex-m27-05-c', 'ex-m27-05-d',
    // Module m28
    'ex-m28-02-b', 'ex-m28-02-d',
    'ex-m28-03-c', 'ex-m28-03-d',
    'ex-m28-04-c', 'ex-m28-04-d',
    'ex-m28-05-c', 'ex-m28-05-d',
    // Module m29
    'ex-m29-01-b', 'ex-m29-01-d',
    'ex-m29-02-c', 'ex-m29-02-d',
    'ex-m29-03-c', 'ex-m29-03-d',
    'ex-m29-04-c', 'ex-m29-04-d',
    'ex-m29-05-a', 'ex-m29-05-c',
    // Module m30
    'ex-m30-01-c', 'ex-m30-01-d',
    'ex-m30-02-c', 'ex-m30-02-d',
    'ex-m30-03-c', 'ex-m30-03-d',
    'ex-m30-04-b', 'ex-m30-04-d',
    // Module m31
    'ex-m31-01-c', 'ex-m31-01-d',
    'ex-m31-02-b', 'ex-m31-02-d',
    'ex-m31-03-c', 'ex-m31-03-d',
    'ex-m31-04-c', 'ex-m31-04-d',
    // Module m32
    'ex-m32-01-c', 'ex-m32-01-d',
    'ex-m32-02-b', 'ex-m32-02-c',
    'ex-m32-03-b', 'ex-m32-03-c',
    'ex-m32-04-b', 'ex-m32-04-d',
    // Module m33
    'ex-m33-01-c', 'ex-m33-01-d',
    'ex-m33-02-b', 'ex-m33-02-c',
    'ex-m33-03-b', 'ex-m33-03-c',
    // Module m34
    'ex-m34-01-c', 'ex-m34-01-d',
    'ex-m34-02-b', 'ex-m34-02-c',
    'ex-m34-03-c', 'ex-m34-03-d',
    'ex-m34-04-c', 'ex-m34-04-d',
    // Module m35
    'ex-m35-01-c', 'ex-m35-01-d',
    'ex-m35-02-b', 'ex-m35-02-c',
    'ex-m35-03-c', 'ex-m35-03-d',
    // Module m36
    'ex-m36-01-c', 'ex-m36-01-d',
    'ex-m36-02-c', 'ex-m36-02-d',
    'ex-m36-03-b', 'ex-m36-03-d',
    // Module m37
    'ex-m37-01-c', 'ex-m37-01-d',
    'ex-m37-02-b', 'ex-m37-02-c',
    'ex-m37-03-b', 'ex-m37-03-d',
    // Module m38
    'ex-m38-01-c', 'ex-m38-01-d',
    'ex-m38-02-b', 'ex-m38-02-c',
    'ex-m38-03-b', 'ex-m38-03-d',
    // Module m39
    'ex-m39-01-b', 'ex-m39-01-d',
    'ex-m39-02-b', 'ex-m39-02-c',
    'ex-m39-03-b', 'ex-m39-03-c',
    // Module m40
    'ex-m40-02-b', 'ex-m40-02-c',
    'ex-m40-03-b', 'ex-m40-03-c',
    // Module m41
    'ex-m41-01-b', 'ex-m41-01-d',
    'ex-m41-02-a', 'ex-m41-02-c',
    'ex-m41-03-b', 'ex-m41-03-c',
    // Module m42
    'ex-m42-01-a', 'ex-m42-01-c',
    'ex-m42-02-b', 'ex-m42-02-c',
    'ex-m42-03-b', 'ex-m42-03-d',
    // Module m43
    'ex-m43-01-c', 'ex-m43-01-d',
    'ex-m43-02-b', 'ex-m43-02-c',
    'ex-m43-03-b', 'ex-m43-03-c',
    // Module m44
    'ex-m44-01-c', 'ex-m44-01-d',
    'ex-m44-02-b', 'ex-m44-02-c',
    // Module m45
    'ex-m45-01-b', 'ex-m45-01-c',
    'ex-m45-02-c', 'ex-m45-02-d',
    'ex-m45-03-b', 'ex-m45-03-d',
    // Module m46
    'ex-m46-01-a', 'ex-m46-01-d',
    'ex-m46-02-a', 'ex-m46-02-c',
    'ex-m46-03-a', 'ex-m46-03-b',
  ]),
});

export const FREE_SAMPLE_CONTENT_IDS = Object.freeze({
  // 4 beginner, 4 easy, 4 medium, 2 hard, 1 expert; 14 distinct categories.
  challenge: Object.freeze([
    'ch-beg-initials', 'ch-arr-chunk', 'ch-dom-build-list', 'ch-fn-private-state',
    'ch-str-word-frequency', 'ch-obj-pick-omit', 'ch-algo-binary-search', 'ch-cls-validated-temperature',
    'ch-async-all', 'ch-adv-take', 'ch-rx-parse-log', 'ch-eng-parse-safely',
    'ch-ds-lru', 'ch-async-map-limit', 'ch-exp-state-machine',
  ]),
  // DOM/state → accessible validation → persistence → async APIs → substantial board.
  project: Object.freeze([
    'pr-counter-app', 'pr-form-validator', 'pr-todo-application',
    'pr-weather-application', 'pr-kanban-board',
  ]),
  // Real junior/junior+/intermediate/advanced levels and multiple question formats.
  interview: Object.freeze([
    'iv-fund-var-let-const', 'iv-fund-eq-vs-strict-eq', 'iv-fund-truthy-falsy',
    'iv-core-error-handling-basics', 'iv-fn-closure', 'iv-fn-this-rules',
    'iv-arr-map-vs-foreach', 'iv-arr-debug-shallow-copy',
    'iv-proto-prototypal-inheritance', 'iv-proto-private-fields',
    'iv-async-ordering-basic-output', 'iv-as-abort', 'iv-dom-event-delegation',
    'iv-bp-modal-focus', 'iv-dom-xss', 'iv-adv-modules', 'iv-adv-generators',
    'iv-code-debounce', 'iv-algo-two-sum', 'iv-adv-testing-pyramid',
    'iv-perf-long-tasks', 'iv-arch-state-management', 'iv-http-status-codes',
    'iv-refactor-parameter-list', 'iv-lang-safe-integers',
  ]),
});
