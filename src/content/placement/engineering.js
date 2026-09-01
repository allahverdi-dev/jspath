import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Engineering — error handling, testing, performance, security, complexity.
 *
 * Deliberately the smallest domain. Placement is not an interview certification,
 * and a developer who is solid at JavaScript should not be pushed back to the
 * start of the curriculum because they have never written a unit test.
 *
 * The security question is defensive: it asks what protects an application, not
 * how to attack one.
 */

export default [
  {
    id: 'pq-eng-01',
    domain: D.ENGINEERING,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['errors'],
    prompt: 'Why is `catch (e) { console.log(e); }` around a whole function usually a poor pattern?',
    options: [
      'It swallows every failure, including ones the caller needed to know about, and hides the real cause',
      'A `catch` block cannot log objects, so the error is lost',
      '`try` blocks prevent the engine from optimising the entire file',
      'Errors caught this way are rethrown automatically after the block',
    ],
    correct: 0,
    explanation:
      'Catching broadly turns a loud failure into a silent wrong result. Catch what you can actually handle, at the level that can handle it, and let everything else propagate to a boundary that reports it.',
  },
  {
    id: 'pq-eng-02',
    domain: D.ENGINEERING,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['security'],
    prompt: 'Your form checks the email format in JavaScript before submitting. What has that achieved?',
    options: [
      'Better user experience only — the server must still validate, because the client can be bypassed entirely',
      'The server no longer needs to validate that field',
      'Protection against SQL injection on that field',
      'A guarantee that the value reaching the server matches the pattern',
    ],
    correct: 0,
    explanation:
      'Anything running in the browser is under the user’s control: requests can be sent directly with any payload. Client-side validation is a convenience for honest users and never a security boundary.',
  },
  {
    id: 'pq-eng-03',
    domain: D.ENGINEERING,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['security'],
    prompt:
      'A build tool inlines `VITE_API_KEY` into the frontend bundle. What is true of that value?',
    options: [
      'It is public — anyone can read it from the shipped JavaScript, so it must not be a secret',
      'It is encrypted by the bundler and safe to ship',
      'It is readable only by scripts served from the same origin',
      'It is safe as long as the repository is private',
    ],
    correct: 0,
    explanation:
      'Environment variables inlined at build time become literal strings in the bundle the browser downloads. Anything genuinely secret has to stay on a server the user cannot read.',
  },
  {
    id: 'pq-eng-04',
    domain: D.ENGINEERING,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['algorithms'],
    prompt:
      'You look up a value in an array with `.includes()` once per item, inside a loop over the same array. What is the time complexity?',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'],
    correct: 0,
    explanation:
      '`includes` scans linearly, so an O(n) scan inside an O(n) loop is O(n²). Building a `Set` first makes each lookup O(1) on average and the whole operation O(n).',
  },
  {
    id: 'pq-eng-05',
    domain: D.ENGINEERING,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['testing'],
    prompt: 'What makes a unit test valuable rather than merely present?',
    options: [
      'It fails when the behaviour it describes breaks, and does not fail when unrelated details change',
      'It exercises as many lines as possible so coverage stays high',
      'It asserts on the internal implementation so refactors are caught early',
      'It runs against the real database so it reflects production',
    ],
    correct: 0,
    explanation:
      'A test that never fails proves nothing, and one that fails whenever an implementation detail moves gets deleted or ignored. Coverage measures which lines ran, not whether anything was actually checked.',
  },
];
