import { DIFFICULTY, QUIZ_KIND as K, PLACEMENT_DOMAIN as D } from '../schema/types.js';

/**
 * Browser & DOM — selection, manipulation, events, forms, storage.
 *
 * Nothing here depends on a particular browser's quirks. Every question tests a
 * behaviour defined by the DOM standard and observable everywhere.
 */

export default [
  {
    id: 'pq-dom-01',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.EASY,
    kind: K.SINGLE,
    topicIds: ['dom'],
    prompt: 'What does `document.querySelector(".missing")` return when nothing matches?',
    options: ['`null`', 'An empty NodeList', 'An empty array', 'It throws a DOMException'],
    correct: 0,
    explanation:
      '`querySelector` returns `null` when there is no match, which is why calling a method on the result without checking is such a common crash. `querySelectorAll` is the one that returns an empty NodeList.',
  },
  {
    id: 'pq-dom-02',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['dom-manipulation'],
    prompt: 'You need to display a username that came from your database. Which line is safe?',
    options: [
      '`el.textContent = user.name;`',
      '`el.innerHTML = user.name;`',
      '`el.innerHTML = "<span>" + user.name + "</span>";`',
      '`el.insertAdjacentHTML("beforeend", user.name);`',
    ],
    correct: 0,
    explanation:
      '`textContent` assigns text without parsing it as markup, so injected tags stay inert. Every other option parses the value as HTML. Data being in your own database does not make it trusted — it was typed by a user at some point.',
  },
  {
    id: 'pq-dom-03',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['events'],
    prompt:
      'A click listener is attached to a `<ul>`. The user clicks a `<button>` inside one of its `<li>` elements. Inside the handler, what are `event.target` and `event.currentTarget`?',
    options: [
      '`target` is the `<button>`; `currentTarget` is the `<ul>`',
      '`target` is the `<ul>`; `currentTarget` is the `<button>`',
      'Both are the `<button>`',
      'Both are the `<ul>`',
    ],
    correct: 0,
    explanation:
      '`target` is where the event originated — the deepest element clicked. `currentTarget` is the element whose listener is currently running. That distinction is the whole basis of event delegation.',
  },
  {
    id: 'pq-dom-04',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.MEDIUM,
    kind: K.SINGLE,
    topicIds: ['events', 'dom'],
    prompt: 'Why attach one listener to a container instead of one to each of 500 rows?',
    options: [
      'One listener handles rows added later, and holds a single handler instead of 500',
      'Listeners on a container fire before listeners on children, so it is faster',
      'The browser refuses to attach more than 256 listeners to one page',
      'Child listeners cannot read `event.target`, so delegation is the only option',
    ],
    correct: 0,
    explanation:
      'Delegation relies on bubbling: the event reaches the container whatever row produced it, including rows that did not exist when the listener was attached. The memory saving is real but secondary.',
  },
  {
    id: 'pq-dom-05',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.EASY,
    kind: K.SINGLE,
    topicIds: ['forms', 'events'],
    prompt: 'What does `event.preventDefault()` do in a form `submit` handler?',
    options: [
      'It stops the browser navigating away to submit the form, but the event still bubbles',
      'It stops the event reaching any other listener on ancestor elements',
      'It clears every field in the form',
      'It marks the form invalid so the browser shows its own error messages',
    ],
    correct: 0,
    explanation:
      '`preventDefault` cancels the browser default action only. Stopping propagation is a different method, `stopPropagation` — the two are routinely confused and do unrelated things.',
  },
  {
    id: 'pq-dom-06',
    domain: D.BROWSER_DOM,
    difficulty: DIFFICULTY.HARD,
    kind: K.SINGLE,
    topicIds: ['storage', 'web-apis'],
    prompt: 'Which statement about `localStorage` is accurate?',
    options: [
      'It stores strings only, is synchronous, and is scoped to one origin',
      'It stores any JavaScript value and preserves its type on read',
      'It is asynchronous, so reads never block the main thread',
      'It is shared across every site the user visits in that browser',
    ],
    correct: 0,
    explanation:
      'Values are coerced to strings on write, which is why objects need `JSON.stringify`. The API is synchronous and can block the main thread, and each origin gets its own isolated store.',
  },
];
