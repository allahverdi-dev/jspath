import { SECTION, CALLOUT_TONE, DIFFICULTY, EXERCISE_KIND, QUIZ_KIND } from '../../schema/types.js';

const M = 'm17';

export default [
  /* ================================================================== */
  {
    id: 'l-m17-01',
    slug: 'the-dom-mental-model',
    moduleId: M,
    order: 1,
    title: 'The DOM: A Browser API, Not JavaScript',
    description: 'Why document exists, how HTML becomes a tree of objects, and the distinction every professional keeps in mind.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 16,
    xp: 30,
    topicIds: ['dom'],
    prerequisites: ['l-m14-04'],
    learningObjectives: [
      'Explain that the DOM is a browser API, not a JavaScript language feature',
      'Explain how a browser turns HTML text into a tree of objects',
      'Distinguish nodes from elements',
      'Locate document, window and the browser devtools',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Everything up to this module — variables, functions, arrays, objects, `Date`, `RegExp` — is **JavaScript, the language**. It runs identically in a browser, in Node, in a serverless function, anywhere a JavaScript engine exists.',
          'Starting now, the curriculum moves into **browser JavaScript**: code that runs inside a web page and talks to the page around it. That page access does not come from the language. It comes from objects the **browser** hands to your running script — `document`, `window`, and everything reachable from them. Node has no `document`. A JavaScript engine embedded in a different host has no `document`. `document` exists because a browser decided to expose one.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'The distinction that matters for the rest of this curriculum',
        body: [
          '**ECMAScript** is the language specification: syntax, `Array.prototype.map`, `Promise`, closures, everything in Modules 00–16. **Web APIs** are capabilities a *host environment* — a browser — layers on top: the DOM, timers, `fetch`, storage, and more, covered from here through Module 23 and beyond.',
          'Saying "JavaScript has a DOM" is imprecise in a way that matters. The accurate statement: **JavaScript is the language; the browser exposes the DOM to JavaScript code running inside it.** Node.js exposes a different set of APIs (the file system, for instance) to the same language. The language does not change; what surrounds it does.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'From HTML text to a tree of objects',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'HTML is **markup** — text with angle-bracket tags describing structure. When a browser loads a page, it **parses** that text and builds an in-memory tree of objects representing it: the **Document Object Model**, or DOM. Every tag becomes an object with properties and methods; the nesting of tags becomes the nesting of objects.',
          'The HTML source and the DOM are related but not the same thing. The source is static text you wrote (or the server sent). The DOM is a live, mutable, in-memory structure — and JavaScript can change the DOM without changing the original HTML file at all. Refreshing the page rebuilds the DOM from the original source; any DOM changes JavaScript made are gone.',
        ],
      },
      {
        kind: SECTION.DIAGRAM,
        diagram: 'dom-tree',
        caption: 'Each HTML tag becomes a node in a tree. Nesting in the markup becomes parent–child relationships in the tree.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Nodes versus elements',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Every object in the tree is a **node** — the general term. An **element** is specifically a node that came from a tag, such as `<p>` or `<div>`. Text inside a tag is its own node too — a **text node** — a sibling-like child of the element, not a property of it.',
        ],
      },
      {
        kind: SECTION.TABLE,
        headers: ['Term', 'Meaning', 'Example'],
        rows: [
          ['Node', 'Anything in the tree', 'An element, a text node, a comment'],
          ['Element', 'A node created from a tag', '`<p>`, `<div>`, `<button>`'],
          ['Text node', 'The text content between tags', 'The word "Hello" inside `<p>Hello</p>`'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Why this distinction matters in practice',
        body: [
          'Many DOM methods and properties are element-specific — `querySelector` returns elements, `classList` exists only on elements, `children` gives you only element children. Others work on any node — `parentNode`, `textContent`, `childNodes` (which includes text nodes). Module 18 draws this line precisely; for now, just know the words are not interchangeable, and that a `<p>` with text inside it is actually **two** nodes: the `<p>` element, and a text node as its child.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'document and window',
      },
      {
        kind: SECTION.PROSE,
        body: [
          '`document` is the browser\'s object representing the whole loaded page — the root you use to find anything else in it. `window` is broader still: it represents the browser tab or frame itself, and `document` is one property of `window` among many (`window.document`). Timers, `fetch`, and browser storage — covered in later modules — also hang off `window`, directly or indirectly.',
          'In practice you write `document.querySelector(...)`, not `window.document.querySelector(...)` — `document` is available as a bare global inside browser script, exactly the way `window` is. This module and the next few focus on `document`; `window` reappears once timers and other window-level APIs are introduced.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The browser developer tools',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Every modern browser ships **developer tools** — usually opened with F12 or a right-click "Inspect" — with an **Elements** (or **Inspector**) panel showing the live DOM tree, editable in place; a **Console** panel where you can run JavaScript directly against the current page and see `console.log` output; and a **Network** panel, which becomes essential once Module 23 covers asynchronous requests.',
          'The Elements panel is the single most useful tool for learning the DOM: select an element on the page, watch its node highlighted in the tree, and see exactly which classes, attributes and inline styles it carries. This curriculum\'s in-browser exercises give you a live document to inspect the same way — use it.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'console.log(typeof document !== "undefined" ? "has document" : "no document");',
          '// This code runs in a plain JavaScript engine with no browser host.',
        ].join('\n'),
        options: [
          '"has document"',
          '"no document"',
          'A SyntaxError',
          'It depends on the JavaScript version',
        ],
        correct: 1,
        explanation:
          '`document` is not part of the JavaScript language — it is an object the **browser** provides to scripts it runs. A plain JavaScript engine with no browser (or browser-like) host around it has never heard of `document`, so `typeof document` is `"undefined"` there. This is not a version issue; no version of the ECMAScript specification defines `document` at all. It becomes available the moment that same code runs inside an actual browser page.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-01-a',
        title: 'Language or browser API?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 15,
        topicIds: ['dom'],
        instructions: 'Which of these is part of the JavaScript language itself, not a browser-provided API?',
        options: ['`document.querySelector`', '`Array.prototype.map`', '`window.document`', '`element.classList`'],
        correct: 1,
        hints: [
          'Which of these still works in Node, which has no DOM at all?',
        ],
        solution: '`Array.prototype.map`',
        solutionExplanation:
          '`Array.prototype.map` is defined by the ECMAScript specification — it works identically in Node, in a browser, anywhere JavaScript runs, exactly like every array method from Module 13. `document.querySelector`, `window.document` and `element.classList` all depend on the DOM, which only exists because a browser (or a DOM-emulating library) constructs and exposes it. Run any of the three DOM-dependent options in plain Node and they throw a `ReferenceError` or `TypeError` — the objects simply are not there.',
      },
      {
        id: 'ex-m17-01-b',
        title: 'Node or element?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'In `<p>Hello</p>`, how many nodes are there, and what are they?',
        options: [
          'One node: the `<p>` element',
          'Two nodes: the `<p>` element, and a text node containing "Hello"',
          'One node: a text node containing the whole tag',
          'Zero nodes until JavaScript touches it',
        ],
        correct: 1,
        hints: [
          'Is the text between the tags stored as a property, or as its own node?',
        ],
        solution: 'Two nodes: the `<p>` element, and a text node containing "Hello"',
        solutionExplanation:
          'The `<p>` tag becomes an element node, and the text "Hello" inside it becomes a separate **text node**, which is a *child* of the `<p>` element — not a string property sitting on it. This is why `p.childNodes` includes that text node, while `p.children` (element-only) does not. The tree exists as soon as the browser parses the HTML, well before any JavaScript runs.',
      },
      {
        id: 'ex-m17-01-c',
        title: 'Explain the DOM to a beginner',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'Which explanation is the most accurate?',
        options: [
          '"The DOM is a JavaScript feature that lets you write HTML."',
          '"The DOM is the browser\'s in-memory tree of objects built from the parsed HTML, which JavaScript can read and change through APIs the browser provides."',
          '"The DOM and the HTML source are always identical."',
          '"The DOM only exists after JavaScript creates it."',
        ],
        correct: 1,
        hints: [
          'Which option correctly separates "what builds the DOM" from "what JavaScript is allowed to do to it"?',
        ],
        solution: '"The DOM is the browser\'s in-memory tree of objects built from the parsed HTML, which JavaScript can read and change through APIs the browser provides."',
        solutionExplanation:
          'The browser builds the DOM by parsing HTML, independent of whether any JavaScript runs at all — a static HTML page with no `<script>` tag still has a DOM. JavaScript is one of the things that can subsequently *read and modify* that tree, using APIs the browser exposes, but it did not create the DOM concept and does not "let you write HTML" — you already wrote HTML, and the browser turned it into objects. The DOM and the source can diverge the moment JavaScript changes anything, which is exactly why "always identical" is wrong.',
      },
      {
        id: 'ex-m17-01-d',
        title: 'Where would this code run?',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'A teammate says: "This function uses `document.title`, so it must be run in Node so we can test it quickly." What is wrong with that plan?',
        options: [
          'Nothing — document.title works fine in plain Node',
          'Node has no document object by default, so the function would throw a ReferenceError there',
          'document.title is deprecated',
          'This only works in Chrome',
        ],
        correct: 1,
        hints: [
          'Does Node provide a browser-style document object out of the box?',
        ],
        solution: 'Node has no document object by default, so the function would throw a ReferenceError there',
        solutionExplanation:
          'Plain Node.js has no browser and therefore no `document` — running code that references it throws `ReferenceError: document is not defined`. Testing DOM-dependent code outside a real (or DOM-emulating, like this curriculum\'s own verification tooling uses internally) browser environment requires that environment to be explicitly provided; you cannot assume `document` is simply always there. This is precisely the language-versus-host-API distinction this lesson exists to establish.',
      },
    ],
    quiz: {
      id: 'qz-m17-01',
      questions: [
        {
          id: 'q-m17-01-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'Which statement is accurate?',
          options: [
            'JavaScript has a DOM built into the language',
            'The browser exposes the DOM to JavaScript running inside it; the language itself has no concept of a document',
            'The DOM is a newer version of JavaScript',
            'HTML and the DOM are the same thing',
          ],
          correct: 1,
          optionExplanations: [
            'The DOM comes from the host environment, not the ECMAScript specification.',
            'Correct — this is the core distinction the module opens with.',
            'They are unrelated concepts; the DOM is not a JavaScript version.',
            'The DOM is the browser\'s object representation built from parsed HTML — related, but not identical.',
          ],
          explanation:
            'The DOM is a Web API supplied by the browser (or another DOM-providing host), not a feature of the ECMAScript language. Node runs the exact same JavaScript language with no DOM at all, which is the clearest proof of the distinction.',
        },
        {
          id: 'q-m17-01-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What is the relationship between window and document?',
          options: [
            'They are unrelated objects',
            'document is a property of window',
            'window is a property of document',
            'They are two names for the same object',
          ],
          correct: 1,
          optionExplanations: [
            'They are directly related.',
            'Correct — window.document is the whole loaded page; window is the broader tab/frame object.',
            'This has the relationship backwards.',
            'They represent different scopes — the tab versus the page within it.',
          ],
          explanation:
            '`window` represents the browser tab or frame; `document` — one of its many properties — represents the loaded page itself. `document.querySelector(...)` is shorthand for `window.document.querySelector(...)`, since `document` is available as a bare global.',
        },
        {
          id: 'q-m17-01-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What is the difference between a node and an element?',
          options: [
            'They are exactly the same thing',
            'A node is the general term for anything in the tree; an element is specifically a node created from a tag',
            'An element is a broader category that includes nodes',
            'Only text can be a node',
          ],
          correct: 1,
          optionExplanations: [
            'Every element is a node, but not every node is an element.',
            'Correct — element is a subtype of node.',
            'This has the relationship backwards.',
            'Elements and comments are also nodes, not just text.',
          ],
          explanation:
            'Node is the umbrella term for anything in the DOM tree — elements, text nodes, comments. An element is specifically the kind of node that comes from an HTML tag. This distinction explains why some APIs (like `classList`) exist only on elements while others (like `parentNode`) work on any node.',
        },
        {
          id: 'q-m17-01-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'Changing the DOM with JavaScript also rewrites the original HTML source file.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'The DOM is an in-memory structure, separate from the file it was built from.',
            'Correct — DOM changes are in-memory only; refreshing the page rebuilds from the unchanged source.',
          ],
          explanation:
            'The DOM is a live, in-memory tree built by parsing the HTML source. JavaScript can freely mutate that in-memory tree, but the original HTML text — whether a local file or a server response — is completely untouched. Reloading the page discards every DOM change and rebuilds fresh from that same original source.',
        },
      ],
    },
    summary:
      'The DOM is a **Web API**, provided by the browser to JavaScript code running inside a page — not a feature of the JavaScript language itself. The precise mental model: JavaScript is the language; the browser exposes `document`, `window`, and everything reachable from them, to scripts it runs. A browser builds the DOM by **parsing** HTML text into an in-memory tree of objects, independent of whether any JavaScript runs; changing that tree with JavaScript never rewrites the original source, so refreshing the page rebuilds a fresh DOM from the unchanged HTML. Every object in the tree is a **node**; an **element** is specifically a node built from a tag, and text between tags becomes its own **text node**, a child of the element rather than a property on it. `window` represents the browser tab; `document` — one of its properties — represents the loaded page and is the entry point for nearly everything the rest of this module covers. Browser developer tools, especially the Elements/Inspector panel, are the primary way to see the live DOM tree while learning it.',
    keyTakeaways: [
      'The DOM is a browser API, not a JavaScript language feature',
      'JavaScript is the language; the browser exposes document/window to it',
      'The browser parses HTML into an in-memory tree — the DOM',
      'DOM changes never rewrite the original HTML source',
      'Node = anything in the tree; Element = a node from a tag; text is its own node',
      'window represents the tab; document (a property of window) represents the page',
    ],
    relatedLessons: ['l-m14-04', 'l-m17-02'],
    interviewConnections: [
      'What is the DOM, precisely?',
      'Is the DOM part of the JavaScript language?',
      'What is the difference between a node and an element?',
      'What is the relationship between window and document?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m17-02',
    slug: 'selecting-elements',
    moduleId: M,
    order: 2,
    title: 'Selecting Elements',
    description: 'querySelector, querySelectorAll, and the CSS selectors that make them powerful.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 18,
    xp: 35,
    topicIds: ['dom'],
    prerequisites: ['l-m17-01'],
    learningObjectives: [
      'Select a single element with getElementById and querySelector',
      'Select multiple elements with querySelectorAll',
      'Use CSS selector syntax to target elements precisely',
      'Explain the difference between a static NodeList and a live HTMLCollection',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Before you can change anything in a page, you need to **find** it. Every example in this lesson runs against the same starting markup.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'html',
        caption: 'The markup these examples select from.',
        code: [
          '<div id="app">',
          '  <h1 class="title">Dashboard</h1>',
          '  <p class="note">Loading…</p>',
          '  <ul class="items">',
          '    <li class="item">Apples</li>',
          '    <li class="item featured">Bread</li>',
          '    <li class="item">Milk</li>',
          '  </ul>',
          '</div>',
        ].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'getElementById',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><h1 class="title">Dashboard</h1><p class="note">Loading…</p></div>',
        caption: 'The fastest, oldest way to find one element by its unique id.',
        code: [
          'const app = document.getElementById("app");',
          '',
          'console.log(app.tagName);',
          'console.log(app instanceof HTMLElement);',
          '',
          '// No match returns null, not undefined and not a thrown error',
          'console.log(document.getElementById("nope"));',
        ].join('\n'),
        output: ['DIV', 'true', 'null'].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'No ID prefix, and it always returns null when nothing matches',
        body: [
          'Unlike a CSS selector, `getElementById` takes the raw id — `"app"`, not `"#app"`. It only ever searches by `id`, and an `id` must be unique in a valid document, so it always returns at most one element — or `null`.',
          '`null`, not `undefined`: reading `.tagName` off the result of a failed lookup throws `Cannot read properties of null`, the same one-level-safe, two-levels-fatal pattern from Module 14\'s property access lesson. Always guard a selection you are not certain will succeed.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'querySelector — one match, any CSS selector',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><h1 class="title">Dashboard</h1><ul class="items"><li class="item">Apples</li><li class="item featured">Bread</li><li class="item">Milk</li></ul></div>',
        caption: 'querySelector accepts the full power of CSS selectors.',
        code: [
          'console.log(document.querySelector("#app").tagName);',
          'console.log(document.querySelector(".title").textContent);',
          'console.log(document.querySelector(".item").textContent);',
          'console.log(document.querySelector(".item.featured").textContent);',
          'console.log(document.querySelector("ul > li").textContent);',
          '',
          '// The first match only, even when several elements qualify',
          'console.log(document.querySelector(".item") === document.querySelectorAll(".item")[0]);',
        ].join('\n'),
        output: [
          'DIV',
          'Dashboard',
          'Apples',
          'Bread',
          'Apples',
          'true',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          '`querySelector` takes **any valid CSS selector** — the same syntax you would write in a stylesheet — and returns the **first** matching element in document order, or `null`. `.item.featured` with no space means "one element with both classes"; `ul > li` means "an `li` that is a direct child of a `ul`" — the same selectors CSS itself understands.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'querySelectorAll — every match',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><ul class="items"><li class="item">Apples</li><li class="item featured">Bread</li><li class="item">Milk</li></ul></div>',
        caption: 'Returns a NodeList of every match, in document order.',
        code: [
          'const items = document.querySelectorAll(".item");',
          '',
          'console.log("count:", items.length);',
          'console.log("is a NodeList:", items instanceof NodeList);',
          'console.log("is an Array:", Array.isArray(items));',
          '',
          '// NodeList has forEach, but not map/filter/reduce directly',
          'items.forEach((item) => console.log(item.textContent));',
          '',
          '// No matches: an empty NodeList, not null',
          'console.log("no matches:", document.querySelectorAll(".missing").length);',
        ].join('\n'),
        output: [
          'count: 3',
          'is a NodeList: true',
          'is an Array: false',
          'Apples',
          'Bread',
          'Milk',
          'no matches: 0',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'A NodeList is not an Array, and querySelectorAll never returns null',
        body: [
          'It has `.length` and `.forEach`, which covers a lot of everyday use, but it does **not** have `map`, `filter` or `reduce` directly. Module 18 covers converting one to a real array with `Array.from` when you need those.',
          'Unlike `querySelector`, which returns `null` on no match, `querySelectorAll` always returns a NodeList — empty when nothing matches. `.length` is always safe to read; you never need a null guard before it.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Static versus live: a distinction worth getting right',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><ul class="items"><li class="item">Apples</li><li class="item">Bread</li></ul></div>',
        caption: 'querySelectorAll is a snapshot; getElementsByClassName updates live.',
        code: [
          'const list = document.getElementById("app").querySelector("ul");',
          '',
          'const staticItems = list.querySelectorAll(".item");',
          'const liveItems = list.getElementsByClassName("item");',
          '',
          'console.log("before — static:", staticItems.length, "live:", liveItems.length);',
          '',
          'const newItem = document.createElement("li");',
          'newItem.className = "item";',
          'newItem.textContent = "Milk";',
          'list.appendChild(newItem);',
          '',
          'console.log("after  — static:", staticItems.length, "live:", liveItems.length);',
        ].join('\n'),
        output: [
          'before — static: 2 live: 2',
          'after  — static: 2 live: 3',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          '`querySelectorAll` returns a **static** `NodeList` — a snapshot at the moment you called it. Adding a new matching element afterward does not change that list; you would need to call `querySelectorAll` again.',
          'The older `getElementsByClassName` (and `getElementsByTagName`) return a **live** `HTMLCollection` — it automatically reflects the current DOM, growing or shrinking as matching elements are added or removed, even after you have stored a reference to it.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'querySelector and querySelectorAll are the modern default',
        body: [
          'They accept the full CSS selector language, which the older `getElementById`/`getElementsByClassName`/`getElementsByTagName` family does not — those only match by exactly one criterion each. Reach for `querySelector`/`querySelectorAll` first; know the older methods exist and that theirs is *live*, mainly so a "why did this array-like grow on its own" bug does not surprise you when you eventually meet it in existing code.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          '// document already has: <ul><li class="item">A</li></ul>',
          'const items = document.querySelectorAll(".item");',
          '',
          'const li = document.createElement("li");',
          'li.className = "item";',
          'document.querySelector("ul").appendChild(li);',
          '',
          'console.log(items.length);',
        ].join('\n'),
        options: ['1', '2', '0', 'undefined'],
        correct: 0,
        explanation:
          '`querySelectorAll` returns a **static** snapshot taken at the moment it was called — it does not update when the DOM changes afterward. The new `<li>` was appended to the document after `items` was already captured, so `items` still reflects the one element that existed at query time: length `1`. Calling `document.querySelectorAll(".item")` again afterward would correctly report `2`; the existing `items` variable never will.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-02-a',
        title: 'Predict the static snapshot',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'Given a document with two `.item` elements, what does this print?',
        code: [
          'const items = document.querySelectorAll(".item");',
          'document.querySelector(".item").remove();',
          'console.log(items.length);',
        ].join('\n'),
        options: ['2', '1', '0', 'It throws'],
        correct: 0,
        hints: [
          'Is querySelectorAll\'s result static or live?',
        ],
        solution: '2',
        solutionExplanation:
          '`querySelectorAll` returns a static snapshot captured at call time. Removing an element from the document afterward does not shrink an already-captured `NodeList` — `items` still reports the count from the moment it was created, `2`, even though only one `.item` remains in the actual document.',
      },
      {
        id: 'ex-m17-02-b',
        title: 'Select the featured item',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `getFeaturedText()` returning the text content of the element with both the `item` and `featured` classes, or `null` if there is no such element.',
        html: '<ul id="list"><li class="item">Apples</li><li class="item featured">Bread</li><li class="item">Milk</li></ul>',
        starterCode: [
          'function getFeaturedText() {',
          '  // A single compound class selector, with no space.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'finds the featured item text', body: 'expect(getFeaturedText()).toBe("Bread");' },
          { name: 'returns a string, not an element', body: 'expect(typeof getFeaturedText()).toBe("string");' },
        ],
        hints: [
          '`.item.featured` with no space between the class names means "has both classes".',
          '`document.querySelector(".item.featured")` finds the single matching element.',
          'Read `.textContent` from the result.',
        ],
        solution: [
          'function getFeaturedText() {',
          '  const el = document.querySelector(".item.featured");',
          '  return el ? el.textContent : null;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'The compound selector `.item.featured`, written with no space, requires **both** classes on the same element — a space instead would mean "a `.featured` descendant of a `.item` ancestor", a completely different and unrelated selector. Guarding with `el ? ... : null` protects against a document that has no featured item at all, following the same defensive pattern `getElementById` results always need.',
      },
      {
        id: 'ex-m17-02-c',
        title: 'Count all list items',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `countItems()` returning how many elements have the `item` class.',
        html: '<ul id="list"><li class="item">Apples</li><li class="item featured">Bread</li><li class="item">Milk</li></ul>',
        starterCode: [
          'function countItems() {',
          '  // querySelectorAll gives you everything that matches, at once.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'counts every item', body: 'expect(countItems()).toBe(3);' },
          { name: 'returns a number', body: 'expect(typeof countItems()).toBe("number");' },
        ],
        hints: [
          '`document.querySelectorAll(".item").length` is the count.',
        ],
        solution: [
          'function countItems() {',
          '  return document.querySelectorAll(".item").length;',
          '}',
        ].join('\n'),
        solutionExplanation:
          '`.item` matches every element carrying that class, including the one that also carries `featured` — classes are additive, not exclusive, so an element with two classes still matches a selector for either one alone. `.length` on the resulting `NodeList` is always safe to read immediately, with no null check needed, unlike a single-element `querySelector` result.',
      },
      {
        id: 'ex-m17-02-d',
        title: 'Which method, and why?',
        kind: EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'You need every `<li>` that is a **direct child** of `<ul id="list">`, not nested li elements several levels deeper. Which selector is correct?',
        options: [
          'document.querySelectorAll("#list li")',
          'document.querySelectorAll("#list > li")',
          'document.getElementById("list")',
          'document.querySelector("#list li")',
        ],
        correct: 1,
        hints: [
          'Which combinator means "direct child" rather than "any descendant"?',
        ],
        solution: 'document.querySelectorAll("#list > li")',
        solutionExplanation:
          'The `>` combinator restricts the match to a **direct child** relationship; a plain space (as in `"#list li"`) matches an `<li>` at *any* depth inside `#list`, including one nested inside another list. `getElementById` alone would return only the `<ul>` itself, not its children, and `querySelector` (without "All") would return just the first matching `<li>` rather than every one.',
      },
    ],
    quiz: {
      id: 'qz-m17-02',
      questions: [
        {
          id: 'q-m17-02-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What does document.getElementById return when no element has that id?',
          options: ['undefined', 'null', 'An empty array', 'It throws'],
          correct: 1,
          optionExplanations: [
            'Missing-property access gives undefined; a failed DOM lookup does not.',
            'Correct — the standard "not found" value for a single-element DOM lookup.',
            'This method never returns a collection.',
            'It fails quietly, not loudly.',
          ],
          explanation:
            'A failed `getElementById` (and a failed `querySelector`) both return `null`. Reading a property off that result without a guard throws `Cannot read properties of null`, so checking for `null` before use is essential.',
        },
        {
          id: 'q-m17-02-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What is the key difference between querySelectorAll and getElementsByClassName?',
          options: [
            'They are exact aliases',
            'querySelectorAll returns a static snapshot; getElementsByClassName returns a live collection that updates automatically',
            'getElementsByClassName accepts full CSS selectors; querySelectorAll does not',
            'querySelectorAll only works once per page',
          ],
          correct: 1,
          optionExplanations: [
            'They behave differently once the DOM changes afterward.',
            'Correct — static versus live is the defining difference.',
            'This has the CSS-selector capability backwards.',
            'It can be called as many times as needed.',
          ],
          explanation:
            '`querySelectorAll` captures a static list at call time; later DOM changes do not affect it. `getElementsByClassName` (and `getElementsByTagName`) return a **live** `HTMLCollection` that automatically grows or shrinks as matching elements are added or removed.',
        },
        {
          id: 'q-m17-02-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What does the selector ".item.featured" (no space) match?',
          options: [
            'Any .featured element inside a .item ancestor',
            'An element that has both the "item" and "featured" classes',
            'Two separate elements',
            'This is invalid CSS syntax',
          ],
          correct: 1,
          optionExplanations: [
            'That would require a space: ".item .featured".',
            'Correct — no space means "both classes on the same element".',
            'It describes one compound condition, matching one kind of element.',
            'It is valid, commonly-used CSS.',
          ],
          explanation:
            'Chaining class selectors with no space between them (`.item.featured`) requires an element to have **all** of the listed classes simultaneously. A space between selectors instead describes a descendant relationship — an entirely different, broader match.',
        },
        {
          id: 'q-m17-02-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'A NodeList returned by querySelectorAll has the same methods as a JavaScript Array, such as map and filter.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'A NodeList has forEach and length, but not the full Array method set.',
            'Correct — convert it with Array.from when you need map, filter or reduce.',
          ],
          explanation:
            'A `NodeList` supports `.length` and `.forEach`, which covers many everyday cases, but it is not an `Array` and lacks `map`, `filter`, `reduce` and friends directly. Module 18 covers converting one to a real array with `Array.from(nodeList)` when the full array toolkit is needed.',
        },
      ],
    },
    summary:
      '`getElementById` finds one element by its raw `id` (no `#` prefix) and returns `null` on failure. `querySelector` accepts the full **CSS selector** language and returns the first matching element, or `null`. `querySelectorAll` returns **every** match as a static `NodeList` — a snapshot at call time that does not update as the DOM changes afterward, unlike the older `getElementsByClassName`/`getElementsByTagName`, which return a **live** `HTMLCollection`. A `NodeList` has `.length` and `.forEach` but is not an `Array`; convert with `Array.from` for the full array toolkit. `querySelector`/`querySelectorAll` are the modern default because they accept any CSS selector — compound classes (`.item.featured`, no space, meaning "both classes"), combinators (`#list > li`, meaning "direct child only"), and everything else CSS itself understands — where the older, single-criterion methods cannot express the same queries at all.',
    keyTakeaways: [
      'getElementById: raw id, no #, returns null on failure',
      'querySelector: any CSS selector, first match, returns null on failure',
      'querySelectorAll: every match, static NodeList, never null (can be empty)',
      'getElementsByClassName/TagName return a live HTMLCollection instead',
      'A NodeList has forEach and length, but is not an Array',
      '.a.b (no space) = both classes; parent > child = direct child only',
    ],
    relatedLessons: ['l-m17-01', 'l-m17-03'],
    interviewConnections: [
      'What is the difference between querySelector and getElementById?',
      'What is the difference between a static NodeList and a live HTMLCollection?',
      'Why is querySelectorAll generally preferred over getElementsByClassName?',
      'What does querySelectorAll return when nothing matches?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m17-03',
    slug: 'reading-and-changing-content',
    moduleId: M,
    order: 3,
    title: 'Reading and Changing Content',
    description: 'textContent, innerText and innerHTML — and the security decision buried inside choosing between them.',
    difficulty: DIFFICULTY.MEDIUM,
    estimatedMinutes: 18,
    xp: 40,
    topicIds: ['dom'],
    prerequisites: ['l-m17-02'],
    learningObjectives: [
      'Read and write element content with textContent',
      'Explain how innerText differs from textContent',
      'Explain how innerHTML parses markup rather than inserting text',
      'Explain why innerHTML with untrusted data is a security risk',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Three properties read or change what is inside an element. They look similar and behave very differently — the choice between them is one of the first genuinely consequential decisions in browser JavaScript.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'textContent',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><p id="note">Loading…</p></div>',
        caption: 'Reads and writes plain text — nothing is ever interpreted as markup.',
        code: [
          'const note = document.getElementById("note");',
          '',
          'console.log("before:", note.textContent);',
          '',
          'note.textContent = "Done";',
          'console.log("after :", note.textContent);',
          '',
          '// Setting textContent to a string containing tags inserts it LITERALLY',
          'note.textContent = "<strong>Bold?</strong>";',
          'console.log("as text:", note.textContent);',
          'console.log("children:", note.children.length);',
        ].join('\n'),
        output: [
          'before: Loading…',
          'after : Done',
          'as text: <strong>Bold?</strong>',
          'children: 0',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Whatever string you assign to `textContent` is treated as **literal text**, always — the angle brackets in `"<strong>Bold?</strong>"` display as visible characters on the page, not a bold tag. Reading `textContent` also gives you every bit of nested text as one plain string, ignoring the element structure entirely.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'innerHTML',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><p id="note">Loading…</p></div>',
        caption: 'Parses the assigned string as markup, building real elements.',
        code: [
          'const note = document.getElementById("note");',
          '',
          'note.innerHTML = "<strong>Done</strong>";',
          '',
          'console.log("textContent:", note.textContent);',
          'console.log("children   :", note.children.length);',
          'console.log("first child:", note.children[0].tagName);',
        ].join('\n'),
        output: [
          'textContent: Done',
          'children   : 1',
          'first child: STRONG',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          '`innerHTML` **parses** the string you assign, exactly as if the browser had encountered that markup in the original page — tags become real elements, with real children, real attributes, everything. This is genuinely useful when you actually have markup to insert. It is also where danger lives.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The security problem, explained precisely',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.DANGER,
        title: 'Never assign untrusted data to innerHTML',
        body: [
          'If a string you assign to `innerHTML` came from **outside your control** — a URL parameter, a form field, a comment another user typed, an API response echoing user input — and that string contains `<script>` or an event-handler attribute like `onerror`, the browser will parse and, in many cases, execute it. This is **Cross-Site Scripting (XSS)**, one of the most common and most serious web vulnerabilities, and it happens exactly because `innerHTML` was designed to interpret markup, not because of a bug.',
          '`textContent` has no such risk, because it never interprets its input as anything but literal text — the angle brackets simply display, they are never parsed.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><p id="comment"></p></div>',
        caption: 'The same "malicious" input, handled two different ways.',
        code: [
          'const userInput = \'<img src=x onerror="window.__hit = true">\';',
          '',
          'const safe = document.getElementById("comment");',
          'safe.textContent = userInput;',
          '',
          'console.log("rendered as text:", safe.textContent);',
          'console.log("did the handler fire:", window.__hit === true);',
          'console.log("child elements created:", safe.children.length);',
        ].join('\n'),
        output: [
          'rendered as text: <img src=x onerror="window.__hit = true">',
          'did the handler fire: false',
          'child elements created: 0',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'With `textContent`, the exact same string that would have executed a handler through `innerHTML` is inert — it is nothing but visible text, no image tag was ever created, no `onerror` attribute was ever parsed. This example intentionally does **not** demonstrate the `innerHTML` version executing, for the same reason a security lesson does not hand you working exploit code — but the mechanism is exactly as described: `innerHTML` parses; `textContent` does not.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'The practical rule',
        body: [
          'Rendering **plain text you did not author yourself** — a username, a comment, a search query, anything that ultimately traces back to a user or an external system — use `textContent`. Reach for `innerHTML` only when you are inserting markup **you control and trust**, such as a static template string with no user data spliced in, or content already sanitised by a dedicated library built for that purpose. When in doubt, `textContent` is always the safe default. Module 18 introduces `createElement`, the safest option of all for anything more than plain text.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'innerText — similar name, different (and slower) behaviour',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="app"><p id="note" style="display: block;">Visible <span style="display: none;">Hidden</span> text</p></div>',
        caption: 'innerText is aware of rendered visibility; textContent is not.',
        code: [
          'const note = document.getElementById("note");',
          '',
          'console.log("textContent:", JSON.stringify(note.textContent));',
          'console.log("innerText  :", JSON.stringify(note.innerText));',
        ].join('\n'),
        output: [
          'textContent: "Visible Hidden text"',
          'innerText  : "Visible text"',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Why textContent is still the usual choice',
        body: [
          '`innerText` is aware of CSS-driven visibility — it skips text inside elements hidden with `display: none` — which sounds convenient but has a real cost: reading it forces the browser to compute the page\'s rendered layout, making it noticeably slower than `textContent` when called repeatedly. `textContent` also behaves consistently across older and newer browsers; `innerText`\'s exact behaviour has historically varied more.',
          'Unless you specifically need "what a sighted user would visually see, respecting CSS," prefer `textContent`.',
        ],
      },
      {
        kind: SECTION.TABLE,
        headers: ['Property', 'Input treated as', 'Aware of CSS visibility', 'Risk with untrusted data'],
        rows: [
          ['`textContent`', 'Literal text, always', 'No', 'None'],
          ['`innerText`', 'Literal text, always', '**Yes**', 'None'],
          ['`innerHTML`', '**Parsed markup**', 'No', '**XSS risk**'],
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          '// <p id="msg">old</p>',
          'const p = document.getElementById("msg");',
          'p.textContent = "<b>new</b>";',
          '',
          'console.log(p.children.length, p.textContent);',
        ].join('\n'),
        options: [
          '0 "<b>new</b>"',
          '1 "new"',
          '1 "<b>new</b>"',
          '0 "new"',
        ],
        correct: 0,
        explanation:
          '`textContent` never interprets its input as markup — the string `"<b>new</b>"` is inserted exactly as literal text, angle brackets included, visible on the page as those actual characters. No `<b>` element is created, so `p.children.length` is `0`, and reading `p.textContent` back gives the exact same literal string that was assigned. This is precisely the property\'s safety guarantee: nothing you assign to it is ever parsed.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-03-a',
        title: 'Predict the literal text',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions: 'Given `<p id="x">hi</p>`, what does this print?',
        code: [
          'const p = document.getElementById("x");',
          'p.innerHTML = "<em>hi</em>";',
          'console.log(p.children.length, p.children[0].tagName);',
        ].join('\n'),
        options: ['0 undefined', '1 "EM"', '1 "em"', '0 "EM"'],
        correct: 1,
        hints: [
          'Does innerHTML parse the assigned string, or insert it as text?',
          'Are tag names uppercased or left as written?',
        ],
        solution: '1 "EM"',
        solutionExplanation:
          '`innerHTML` parses its assigned string as real markup, so `<em>hi</em>` becomes an actual `<em>` element — a genuine child, not literal visible text — which is why `children.length` is `1`. HTML tag names are reported in **uppercase** by `tagName` regardless of the case used in the source markup, which is why the answer is `"EM"`, not `"em"`.',
      },
      {
        id: 'ex-m17-03-b',
        title: 'Update a status message safely',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `setStatus(message)` that sets the text of the element with id `"status"` to `message`, treating it as plain text under all circumstances — even if it contains characters that look like markup.',
        html: '<p id="status">Idle</p>',
        starterCode: [
          'function setStatus(message) {',
          '  // Plain text, no matter what the message contains.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'sets a plain message', body: 'setStatus("Saved"); expect(document.getElementById("status").textContent).toBe("Saved");' },
          { name: 'treats markup-like text literally', body: 'setStatus("<b>Alert</b>"); expect(document.getElementById("status").textContent).toBe("<b>Alert</b>"); expect(document.getElementById("status").children.length).toBe(0);' },
        ],
        hints: [
          '`textContent` never interprets its input as markup.',
        ],
        solution: [
          'function setStatus(message) {',
          '  document.getElementById("status").textContent = message;',
          '}',
        ].join('\n'),
        solutionExplanation:
          '`textContent` is the only one of the three content properties that guarantees the assigned value is always treated as literal text, which is exactly the "under all circumstances" requirement — a status message could plausibly contain angle brackets copied from somewhere, and `innerHTML` would silently parse them as markup instead of displaying them.',
      },
      {
        id: 'ex-m17-03-c',
        title: 'Render a trusted heading',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 25,
        topicIds: ['dom'],
        instructions:
          'Write `renderTitle(text)` that sets the content of the element with id `"heading"` to a `<strong>` element wrapping `text`, using a template you control (not user-provided markup). Use `innerHTML`, since the markup itself is fixed and trusted — only `text` is variable.',
        html: '<h1 id="heading"></h1>',
        starterCode: [
          'function renderTitle(text) {',
          '  // The <strong> tags are yours; only the inner text is a variable.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'wraps the text in a strong element', body: 'renderTitle("Dashboard"); const h = document.getElementById("heading"); expect(h.children.length).toBe(1); expect(h.children[0].tagName).toBe("STRONG");' },
          { name: 'the strong element contains the text', body: 'renderTitle("Reports"); expect(document.getElementById("heading").textContent).toBe("Reports");' },
        ],
        hints: [
          '`document.getElementById("heading").innerHTML = `<strong>${text}</strong>`;`',
        ],
        solution: [
          'function renderTitle(text) {',
          '  document.getElementById("heading").innerHTML = `<strong>${text}</strong>`;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'This is exactly the boundary the lesson draws: the `<strong>` markup is a fixed template written by you, the developer, so `innerHTML` is a legitimate choice here — the risk is specifically in interpolating **untrusted** data as markup, not in using `innerHTML` at all. Note that in a real application, `text` here would still need to come from a trusted source; if `text` itself could be user-supplied, this exact code becomes exactly the XSS risk the lesson warns about, since the interpolated value sits directly inside the parsed HTML.',
      },
      {
        id: 'ex-m17-03-d',
        title: 'Spot the vulnerability',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'A comments feature does `commentEl.innerHTML = comment.text;`, where `comment.text` was typed by another user and stored in a database. What is wrong with this?',
        options: [
          'Nothing — innerHTML is always the right choice for displaying comments',
          'A comment containing markup like <img src=x onerror="..."> would be parsed and could execute arbitrary script — a Cross-Site Scripting vulnerability',
          'innerHTML is slower than textContent, which is the only issue',
          'This code would throw an error',
        ],
        correct: 1,
        hints: [
          'Where did comment.text ultimately come from, and does innerHTML interpret its input?',
        ],
        solution: 'A comment containing markup like <img src=x onerror="..."> would be parsed and could execute arbitrary script — a Cross-Site Scripting vulnerability',
        solutionExplanation:
          'The comment text originated from another user and was never sanitised, so assigning it directly to `innerHTML` lets that user\'s input be parsed as real markup by every visitor who views the comment — including any embedded script or event-handler attribute. This is a textbook stored XSS vulnerability. The fix is `textContent`, which would render the exact same string as harmless visible text instead of executable markup.',
      },
    ],
    quiz: {
      id: 'qz-m17-03',
      questions: [
        {
          id: 'q-m17-03-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What is the key difference between textContent and innerHTML?',
          options: [
            'They are interchangeable',
            'textContent always treats its input as literal text; innerHTML parses its input as markup',
            'innerHTML is faster in every case',
            'textContent can only read, never write',
          ],
          correct: 1,
          optionExplanations: [
            'They behave fundamentally differently on write.',
            'Correct — this is the entire security-relevant distinction.',
            'Parsing markup has real overhead of its own.',
            'textContent supports both reading and writing.',
          ],
          explanation:
            '`textContent` never interprets its assigned value as anything but text — angle brackets display literally. `innerHTML` parses the assigned string, building real elements from any markup it contains, which is exactly why untrusted data must never be assigned to it directly.',
        },
        {
          id: 'q-m17-03-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'Why is assigning untrusted user data to innerHTML dangerous?',
          options: [
            'It is not dangerous — this is a myth',
            'The data could contain markup like a script tag or an event-handler attribute that the browser will parse and potentially execute (XSS)',
            'It only causes a visual rendering bug',
            'It is dangerous only in Internet Explorer',
          ],
          correct: 1,
          optionExplanations: [
            'It is a well-established, serious and current vulnerability class.',
            'Correct — Cross-Site Scripting.',
            'The consequence can be arbitrary script execution, not merely a display glitch.',
            'It affects every modern browser identically.',
          ],
          explanation:
            '`innerHTML` parses whatever string it is assigned. If that string came from an untrusted source and contains something like `<img src=x onerror="...">`, the browser parses and can execute the embedded script — Cross-Site Scripting, one of the most common serious web vulnerabilities.',
        },
        {
          id: 'q-m17-03-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What makes innerText different from textContent?',
          options: [
            'innerText is aware of CSS-driven visibility and skips hidden text, and is comparatively slower to read',
            'They are exact synonyms',
            'innerText parses markup; textContent does not',
            'textContent only works on the body element',
          ],
          correct: 0,
          optionExplanations: [
            'Correct — this awareness is what forces a layout computation on read.',
            'They differ in visibility-awareness and performance.',
            'Neither property parses markup — that is what innerHTML does.',
            'textContent works on any element.',
          ],
          explanation:
            '`innerText` respects rendered visibility (skipping `display: none` content) at the cost of triggering a layout computation, making it slower to read than `textContent`, which ignores visibility entirely and is faster and more consistent. Neither property interprets its input as markup — that behaviour belongs only to `innerHTML`.',
        },
        {
          id: 'q-m17-03-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'It is always wrong to use innerHTML, under any circumstances.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'The risk is specific to untrusted data, not the property itself.',
            'Correct — innerHTML is fine for markup you author and control.',
          ],
          explanation:
            '`innerHTML` is a legitimate tool when the markup is a fixed template you wrote yourself, with no untrusted data spliced directly into the parsed HTML. The danger is specific to assigning **untrusted** data to it — the property itself is not inherently unsafe.',
        },
      ],
    },
    summary:
      '`textContent` always treats its assigned value as **literal text** — never parsed, never interpreted as markup — which makes it both the safe default and, since it ignores CSS visibility and layout entirely, the fastest of the three properties. `innerHTML` **parses** the assigned string as real markup, building genuine elements — legitimate when the markup is a fixed template you author and trust, but a serious **Cross-Site Scripting** risk the moment any part of what gets assigned traces back to untrusted user or external data, since a malicious string containing a script tag or event-handler attribute will be parsed and can execute. `innerText` behaves like `textContent` on write but, on read, is aware of rendered visibility — skipping `display: none` content — at the cost of forcing a layout computation, making it slower and generally the less-preferred choice. The professional default: use `textContent` for any text that did not originate as markup you personally wrote, and reach for `innerHTML` only for trusted, developer-authored templates.',
    keyTakeaways: [
      'textContent: always literal text, never parsed — the safe default',
      'innerHTML: parses its input as real markup — genuine XSS risk with untrusted data',
      'innerText: like textContent on write, but visibility-aware (and slower) on read',
      'Never assign user-originated or external data directly to innerHTML',
      'innerHTML is fine for fixed, developer-authored markup templates',
      'When uncertain, textContent is always the safe choice',
    ],
    relatedLessons: ['l-m17-02', 'l-m17-04'],
    interviewConnections: [
      'What is the difference between textContent and innerHTML?',
      'Why is innerHTML a security risk with untrusted data?',
      'What is XSS, and how does textContent prevent it?',
      'What is the difference between innerText and textContent?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m17-04',
    slug: 'attributes-and-dataset',
    moduleId: M,
    order: 4,
    title: 'Attributes and Properties',
    description: 'getAttribute, setAttribute, the property/attribute distinction, and reading data- attributes with dataset.',
    difficulty: DIFFICULTY.MEDIUM,
    estimatedMinutes: 18,
    xp: 40,
    topicIds: ['dom'],
    prerequisites: ['l-m17-03'],
    learningObjectives: [
      'Read, write and remove HTML attributes',
      'Explain the difference between an attribute and its corresponding property',
      'Check for an attribute\'s presence correctly',
      'Read and write custom data using the dataset API',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'An **attribute** is what you write in HTML source — `<img src="cat.jpg">`. A **property** is the corresponding value on the JavaScript element object — `img.src`. For many attributes they stay in sync automatically; for a few, they genuinely diverge, and knowing which is which prevents real bugs.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The attribute methods',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<img id="pic" src="cat.jpg" alt="A cat">',
        caption: 'The four core methods, generic and always string-based.',
        code: [
          'const img = document.getElementById("pic");',
          '',
          'console.log(img.getAttribute("alt"));',
          'console.log(img.hasAttribute("title"));',
          '',
          'img.setAttribute("title", "Click to enlarge");',
          'console.log(img.hasAttribute("title"));',
          'console.log(img.getAttribute("title"));',
          '',
          'img.removeAttribute("title");',
          'console.log(img.hasAttribute("title"));',
          'console.log(img.getAttribute("title"));',
        ].join('\n'),
        output: [
          'A cat',
          'false',
          'true',
          'Click to enlarge',
          'false',
          'null',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'getAttribute always returns a string, or null',
        body: [
          'Every attribute value is text, even for something conceptually numeric or boolean — `getAttribute("disabled")` returns `""` (present, empty string) when the attribute exists at all, not `true`. A missing attribute gives `null`, exactly like a failed element lookup. This uniform string-or-null contract is why `getAttribute`/`setAttribute` work identically for every attribute, standard or custom.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Property versus attribute: where they diverge',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<a id="link" href="/about">About</a>',
        caption: 'The href property is resolved to a full URL; the attribute is exactly what was written.',
        code: [
          'const link = document.getElementById("link");',
          '',
          'console.log("attribute:", link.getAttribute("href"));',
          'console.log("property :", link.href);',
        ].join('\n'),
        output: [
          'attribute: /about',
          'property : http://localhost/about',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'This is not a quirk — it is a genuinely useful distinction, once you know it exists',
        body: [
          'The `href` **attribute** is the literal text from the markup. The `href` **property** is the browser\'s resolved, absolute version — useful precisely because it is already normalised. Confusing the two produces bugs like comparing `link.getAttribute("href") === "https://example.com/about"` and having it silently fail because the attribute was written as a relative path.',
          'A property and its attribute can also diverge over time: the `value` **property** of a text input reflects what the user has typed right now; the `value` **attribute** stays frozen at whatever the HTML originally specified, even after the user edits the field.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<input id="field" value="original">',
        caption: 'The attribute is the starting value; the property is the live value.',
        code: [
          'const field = document.getElementById("field");',
          '',
          'field.value = "typed by the user";',
          '',
          'console.log("property (live) :", field.value);',
          'console.log("attribute (orig):", field.getAttribute("value"));',
        ].join('\n'),
        output: [
          'property (live) : typed by the user',
          'attribute (orig): original',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'In practice: for most everyday work, use the **property** directly (`img.src`, `input.value`, `link.href`) — it is shorter and gives you the live, resolved value. Reach for `getAttribute`/`setAttribute` when you specifically need the raw markup text, or when working with a **custom, non-standard attribute** that has no matching property at all (`aria-*` attributes, for instance, or arbitrary attributes on a custom element).',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'A practical use: ARIA attributes',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<button id="menu-btn" aria-expanded="false">Menu</button>',
        caption: 'Accessibility attributes have no dedicated JS property — use get/setAttribute.',
        code: [
          'const button = document.getElementById("menu-btn");',
          '',
          'function toggleMenu() {',
          '  const isOpen = button.getAttribute("aria-expanded") === "true";',
          '  button.setAttribute("aria-expanded", String(!isOpen));',
          '}',
          '',
          'console.log("before:", button.getAttribute("aria-expanded"));',
          'toggleMenu();',
          'console.log("after :", button.getAttribute("aria-expanded"));',
        ].join('\n'),
        output: ['before: false', 'after : true'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Screen readers rely on `aria-expanded` to announce whether a menu or panel is currently open. Since it is always a string, comparing against the literal string `"true"` — not the boolean `true` — is what makes the comparison correct.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'dataset — custom data, the sanctioned way',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<li id="row" data-user-id="42" data-role="admin">Ada</li>',
        caption: '`data-*` attributes are read and written through `.dataset`, in camelCase.',
        code: [
          'const row = document.getElementById("row");',
          '',
          'console.log(row.dataset.userId);',
          'console.log(row.dataset.role);',
          '',
          'row.dataset.status = "active";',
          'console.log(row.getAttribute("data-status"));',
          '',
          'delete row.dataset.role;',
          'console.log(row.hasAttribute("data-role"));',
        ].join('\n'),
        output: ['42', 'admin', 'active', 'false'].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'The naming conversion is automatic and mechanical',
        body: [
          'An attribute `data-user-id` becomes `dataset.userId` — hyphen-separated becomes camelCase, exactly the reverse of how a JavaScript variable name would convert *to* a CSS-style attribute. `data-*` is the standard, HTML-sanctioned place to attach custom data to an element without inventing your own non-standard attributes, and every value is still a **string** — the same as every other attribute.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          '// <div id="card" data-item-count="3"></div>',
          'const card = document.getElementById("card");',
          '',
          'console.log(card.dataset.itemCount, typeof card.dataset.itemCount);',
        ].join('\n'),
        options: [
          '"3" "string"',
          '3 "number"',
          '"3" "number"',
          '3 "string"',
        ],
        correct: 0,
        explanation:
          'Every value read through `dataset` — like every attribute value — is a **string**, regardless of how numeric it looks. `data-item-count="3"` gives `dataset.itemCount === "3"`, not the number `3`. Converting it to a number, when arithmetic is genuinely needed, requires an explicit `Number(card.dataset.itemCount)` — attributes never do that conversion automatically.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-04-a',
        title: 'Predict the dataset type',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions: 'Given `<div id="x" data-active="true">`, what does this print?',
        code: [
          'const el = document.getElementById("x");',
          'console.log(el.dataset.active === true);',
        ].join('\n'),
        options: ['true', 'false', 'undefined', 'A TypeError'],
        correct: 1,
        hints: [
          'What type does every dataset value have, regardless of what it looks like?',
        ],
        solution: 'false',
        solutionExplanation:
          '`el.dataset.active` is the **string** `"true"`, never the boolean `true` — every dataset value, like every attribute value, is text. Comparing a string to a boolean with `===` is always `false`, since `===` never coerces. The correct comparison is `el.dataset.active === "true"`.',
      },
      {
        id: 'ex-m17-04-b',
        title: 'Read a data attribute',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `getUserId()` returning the `data-user-id` attribute of the element with id `"row"`, converted to a number.',
        html: '<li id="row" data-user-id="42">Ada</li>',
        starterCode: [
          'function getUserId() {',
          '  // dataset values are always strings.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'reads and converts the id', body: 'expect(getUserId()).toBe(42);' },
          { name: 'returns a number, not a string', body: 'expect(typeof getUserId()).toBe("number");' },
        ],
        hints: [
          '`document.getElementById("row").dataset.userId` gives the string "42".',
          'Wrap it in `Number(...)`.',
        ],
        solution: [
          'function getUserId() {',
          '  return Number(document.getElementById("row").dataset.userId);',
          '}',
        ].join('\n'),
        solutionExplanation:
          '`data-user-id` converts to `dataset.userId` in camelCase, and its value is always a string regardless of how numeric it looks. Wrapping it in `Number(...)` performs the explicit conversion Module 03 covered — attributes never do this automatically, and comparing the raw string to a number without converting would fail every strict comparison.',
      },
      {
        id: 'ex-m17-04-c',
        title: 'Toggle an ARIA attribute',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 25,
        topicIds: ['dom'],
        instructions:
          'Write `toggleExpanded()` that flips the `aria-expanded` attribute of the element with id `"panel-btn"` between the strings `"true"` and `"false"`.',
        html: '<button id="panel-btn" aria-expanded="false">Details</button>',
        starterCode: [
          'function toggleExpanded() {',
          '  // Attribute values are strings — compare against the string "true".',
          '}',
        ].join('\n'),
        tests: [
          { name: 'flips false to true', body: 'toggleExpanded(); expect(document.getElementById("panel-btn").getAttribute("aria-expanded")).toBe("true");' },
          { name: 'flips true back to false', body: 'toggleExpanded(); expect(document.getElementById("panel-btn").getAttribute("aria-expanded")).toBe("false");' },
        ],
        hints: [
          'Read the current value, compare it to the string "true", and set the opposite.',
          '`String(!isExpanded)` converts a boolean back to the matching attribute string.',
        ],
        solution: [
          'function toggleExpanded() {',
          '  const btn = document.getElementById("panel-btn");',
          '  const isExpanded = btn.getAttribute("aria-expanded") === "true";',
          '  btn.setAttribute("aria-expanded", String(!isExpanded));',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Comparing against the literal string `"true"` is essential, since `getAttribute` never returns a real boolean. `String(!isExpanded)` converts the flipped boolean back to the exact `"true"`/`"false"` text the attribute needs — `aria-expanded` is read by screen readers as text, not as a JavaScript boolean, so the attribute must always hold one of those two exact strings.',
      },
      {
        id: 'ex-m17-04-d',
        title: 'Property or attribute?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'You need the exact, unresolved href text as it was written in the HTML source — not the browser\'s absolute-URL version. Which do you use?',
        options: [
          'link.href',
          'link.getAttribute("href")',
          'They always return the same thing',
          'link.dataset.href',
        ],
        correct: 1,
        hints: [
          'Which one is resolved to a full URL, and which is the literal source text?',
        ],
        solution: 'link.getAttribute("href")',
        solutionExplanation:
          'The `href` **property** (`link.href`) is the browser\'s resolved, absolute-URL version — convenient for most everyday use, but not what was asked for. `getAttribute("href")` returns exactly the raw text from the markup, unresolved. `dataset` is unrelated — it only exists for custom `data-*` attributes, not standard ones like `href`.',
      },
    ],
    quiz: {
      id: 'qz-m17-04',
      questions: [
        {
          id: 'q-m17-04-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What type does getAttribute always return for an existing attribute?',
          options: ['A string', 'The type that matches the attribute\'s apparent meaning', 'A boolean', 'It varies by browser'],
          correct: 0,
          optionExplanations: [
            'Correct — every attribute value is text, even for numeric- or boolean-looking ones.',
            'Attributes never auto-convert based on their apparent meaning.',
            'Only presence/absence is boolean-like via hasAttribute, not the value itself.',
            'This is standard, consistent behaviour.',
          ],
          explanation:
            'HTML attributes are always text. `getAttribute` returns a string for any present attribute, and `null` if the attribute is absent — never a number or boolean, regardless of what the attribute conceptually represents.',
        },
        {
          id: 'q-m17-04-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'Why can input.value and input.getAttribute("value") give different results?',
          options: [
            'This never happens',
            'The property reflects the live, current value; the attribute stays frozen at the original HTML-specified value',
            'getAttribute always throws for inputs',
            'They are always identical for every element',
          ],
          correct: 1,
          optionExplanations: [
            'It is a well-documented, real distinction.',
            'Correct — a classic example of property/attribute divergence.',
            'getAttribute works fine on inputs.',
            'Several properties genuinely diverge from their attributes.',
          ],
          explanation:
            'The `value` property tracks what the user has actually typed right now. The `value` attribute reflects only what the original HTML specified and does not update as the user edits the field — a clear, practical case where property and attribute genuinely diverge.',
        },
        {
          id: 'q-m17-04-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'How does data-item-count convert when accessed through .dataset?',
          options: [
            '.dataset.item-count',
            '.dataset.itemCount',
            '.dataset["data-item-count"]',
            'It cannot be accessed through dataset',
          ],
          correct: 1,
          optionExplanations: [
            'Hyphenated property access is invalid without brackets, and dataset does not use hyphens anyway.',
            'Correct — hyphen-separated becomes camelCase automatically.',
            'The "data-" prefix is dropped in the conversion.',
            'dataset exists specifically for data-* attributes.',
          ],
          explanation:
            '`dataset` mechanically converts a hyphenated `data-*` attribute name into camelCase, dropping the `data-` prefix: `data-item-count` becomes `dataset.itemCount`. Every value read this way is still a plain string.',
        },
        {
          id: 'q-m17-04-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'aria-expanded should be compared against the boolean true, not the string "true".',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'Attribute values are always strings.',
            'Correct — compare against the string "true", since getAttribute never returns a real boolean.',
          ],
          explanation:
            'Every attribute value, including `aria-expanded`, is text. `getAttribute("aria-expanded") === true` is always `false`, because `===` never coerces types — the correct comparison is against the literal string `"true"`.',
        },
      ],
    },
    summary:
      'An **attribute** is the literal text in the HTML source; a **property** is the corresponding value on the JavaScript element object — for most attributes they stay synchronised automatically, but several genuinely diverge: `href` is resolved to an absolute URL as a property while the attribute stays as written, and `value` on an input reflects the live, user-edited text as a property while the attribute remains frozen at the original markup. `getAttribute`/`setAttribute`/`removeAttribute`/`hasAttribute` are generic, string-based and work identically for standard and custom attributes alike — `getAttribute` always returns a string or `null`, never a boolean, which matters for attributes like `aria-expanded` that must be compared against the literal string `"true"`. `dataset` is the sanctioned way to read and write custom `data-*` attributes, converting hyphenated names to camelCase automatically (`data-user-id` ↔ `dataset.userId`) — every value it returns is still a plain string, needing explicit `Number(...)` conversion when arithmetic is required.',
    keyTakeaways: [
      'Attribute = HTML source text; property = the live JS object value',
      'Most stay synced; href and input.value are notable exceptions that diverge',
      'getAttribute/hasAttribute always deal in strings — never real booleans or numbers',
      'A missing attribute gives null from getAttribute',
      'dataset converts data-item-count to dataset.itemCount automatically',
      'Every dataset and attribute value needs explicit conversion for numbers/booleans',
    ],
    relatedLessons: ['l-m17-03', 'l-m17-05'],
    interviewConnections: [
      'What is the difference between an attribute and a property?',
      'Why might input.value and input.getAttribute("value") differ?',
      'How do you read a custom data attribute?',
      'Why must aria-expanded be compared against a string, not a boolean?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m17-05',
    slug: 'classlist',
    moduleId: M,
    order: 5,
    title: 'Manipulating Classes with classList',
    description: 'add, remove, toggle, contains and replace — the everyday API for driving UI state through CSS classes.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 15,
    xp: 35,
    topicIds: ['dom'],
    prerequisites: ['l-m17-04'],
    learningObjectives: [
      'Use classList to add, remove, toggle and check for classes',
      'Replace one class with another in a single call',
      'Explain why classList is preferred over manipulating className directly',
      'Drive realistic UI state — active navigation, hidden panels, dark mode — through classes',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'A class name is just an attribute — `getAttribute("class")` reads it as one space-separated string. But splitting, checking membership and rejoining that string by hand is exactly the kind of repetitive, error-prone work `classList` exists to replace.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The className string, and why classList is better',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="panel" class="panel active">Content</div>',
        caption: 'className gives you the whole string; classList gives you a structured API.',
        code: [
          'const panel = document.getElementById("panel");',
          '',
          'console.log("className:", panel.className);',
          'console.log("classList:", [...panel.classList]);',
          'console.log("length   :", panel.classList.length);',
        ].join('\n'),
        output: [
          'className: panel active',
          'classList: ["panel", "active"]',
          'length   : 2',
        ].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'add, remove, toggle, contains',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="panel" class="panel">Content</div>',
        caption: 'The four methods that cover almost every real need.',
        code: [
          'const panel = document.getElementById("panel");',
          '',
          'panel.classList.add("active");',
          'console.log("after add   :", panel.className);',
          '',
          'panel.classList.remove("active");',
          'console.log("after remove:", panel.className);',
          '',
          'panel.classList.toggle("active");',
          'console.log("after toggle 1:", panel.className);',
          'panel.classList.toggle("active");',
          'console.log("after toggle 2:", panel.className);',
          '',
          'console.log("contains:", panel.classList.contains("panel"));',
        ].join('\n'),
        output: [
          'after add   : panel active',
          'after remove: panel',
          'after toggle 1: panel active',
          'after toggle 2: panel',
          'contains: true',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: '`add` and `remove` are safely idempotent',
        body: [
          'Calling `add("active")` when the class is already present does nothing — no duplicate, no error. Calling `remove("active")` when it is already absent also does nothing. You never need to check `contains()` before calling either one "just in case"; both are already safe to call unconditionally.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'toggle with a forced state',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="menu" class="menu">Menu</div>',
        caption: 'A second argument to toggle forces add or remove, rather than flipping.',
        code: [
          'const menu = document.getElementById("menu");',
          '',
          '// Force it open, regardless of current state — calling twice changes nothing',
          'menu.classList.toggle("open", true);',
          'console.log("forced open :", menu.classList.contains("open"));',
          'menu.classList.toggle("open", true);',
          'console.log("still open  :", menu.classList.contains("open"));',
          '',
          '// Force it closed',
          'menu.classList.toggle("open", false);',
          'console.log("forced closed:", menu.classList.contains("open"));',
        ].join('\n'),
        output: [
          'forced open : true',
          'still open  : true',
          'forced closed: false',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'This is the version to reach for when the target state is already known',
        body: [
          'A plain `toggle("open")` flips whatever the current state happens to be — correct for a button that always means "switch it", wrong for code that computed a specific desired state (`isMenuOpen`) and wants to guarantee the class matches it. `toggle("open", isMenuOpen)` sets exactly that state, unconditionally and safely, however many times it runs.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'replace',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="status" class="status loading">Please wait</div>',
        caption: 'Swap one class for another in a single call.',
        code: [
          'const status = document.getElementById("status");',
          '',
          'status.classList.replace("loading", "success");',
          'console.log(status.className);',
          'console.log(status.classList.contains("loading"));',
          'console.log(status.classList.contains("success"));',
        ].join('\n'),
        output: ['status success', 'false', 'true'].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Realistic patterns',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<nav><a id="home" class="nav-link active" href="#">Home</a><a id="about" class="nav-link" href="#">About</a></nav>',
        caption: 'Active navigation: exactly one link carries the active class at a time.',
        code: [
          'function setActiveLink(id) {',
          '  document.querySelectorAll(".nav-link").forEach((link) => {',
          '    link.classList.toggle("active", link.id === id);',
          '  });',
          '}',
          '',
          'setActiveLink("about");',
          '',
          'console.log("home  active:", document.getElementById("home").classList.contains("active"));',
          'console.log("about active:", document.getElementById("about").classList.contains("active"));',
        ].join('\n'),
        output: ['home  active: false', 'about active: true'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'The forced-state `toggle` is what makes this loop correct in one pass: each link\'s `active` class is set to exactly `link.id === id` — `true` for the matching link, `false` for every other — without an `if`/`else` branching on whether the class was already present.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<button id="theme-btn">Toggle theme</button><body></body>',
        caption: 'A dark-mode toggle, the pattern nearly every site uses.',
        code: [
          'function toggleDarkMode() {',
          '  document.body.classList.toggle("dark-mode");',
          '  return document.body.classList.contains("dark-mode");',
          '}',
          '',
          'console.log("first call :", toggleDarkMode());',
          'console.log("second call:", toggleDarkMode());',
        ].join('\n'),
        output: ['first call : true', 'second call: false'].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.WARNING,
        title: 'className works too, but it is easy to get wrong by hand',
        body: [
          '`element.className = "panel active"` **replaces the entire string** — any classes you did not explicitly include are gone, including ones added by other code (a library, a framework, a different function). `classList.add`/`remove`/`toggle` only ever touch the specific class named, leaving everything else on the element untouched. That is the real reason `classList` is preferred, beyond mere convenience.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          '// <div id="x" class="a b"></div>',
          'const el = document.getElementById("x");',
          'el.classList.toggle("b", true);',
          'el.classList.toggle("c", false);',
          '',
          'console.log(el.className);',
        ].join('\n'),
        options: ['"a b"', '"a b c"', '"a"', '"a c"'],
        correct: 0,
        explanation:
          'Forced `toggle` with a second argument sets the class to exactly that boolean state, not flipping it. `toggle("b", true)` ensures `"b"` is present — it already was, so nothing visibly changes. `toggle("c", false)` ensures `"c"` is **absent** — it was never present, so this also changes nothing. The final class list is unchanged from the start: `"a b"`.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-05-a',
        title: 'Predict the forced toggle',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['dom'],
        instructions: 'Given `<div id="x" class="visible">`, what does this print?',
        code: [
          'const el = document.getElementById("x");',
          'el.classList.toggle("visible", false);',
          'el.classList.toggle("visible", false);',
          'console.log(el.classList.contains("visible"));',
        ].join('\n'),
        options: ['true', 'false', 'undefined', 'It alternates'],
        correct: 1,
        hints: [
          'Does a forced toggle flip on each call, or always set to the given state?',
        ],
        solution: 'false',
        solutionExplanation:
          'A forced `toggle(name, state)` always sets the class to exactly `state` — it never flips regardless of how many times it is called. Both calls force `"visible"` to be **absent**, so after either call — and certainly after both — `contains("visible")` is `false`. This is precisely what distinguishes forced toggle from plain `toggle(name)`, which would have flipped it back and forth.',
      },
      {
        id: 'ex-m17-05-b',
        title: 'Show or hide a panel',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `setPanelVisible(visible)` that adds the `hidden` class to the element with id `"panel"` when `visible` is `false`, and removes it when `visible` is `true`.',
        html: '<div id="panel">Content</div>',
        starterCode: [
          'function setPanelVisible(visible) {',
          '  // Forced toggle is exactly this shape.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'hides the panel', body: 'setPanelVisible(false); expect(document.getElementById("panel").classList.contains("hidden")).toBe(true);' },
          { name: 'shows the panel', body: 'setPanelVisible(false); setPanelVisible(true); expect(document.getElementById("panel").classList.contains("hidden")).toBe(false);' },
        ],
        hints: [
          '`classList.toggle("hidden", !visible)` sets exactly the right state either way.',
        ],
        solution: [
          'function setPanelVisible(visible) {',
          '  document.getElementById("panel").classList.toggle("hidden", !visible);',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Forced toggle with `!visible` sets the `hidden` class to exactly the opposite of the visibility flag — present when not visible, absent when visible — in one call, regardless of what state the class happened to be in before. This avoids an `if (visible) { remove } else { add }` branch entirely, and it is safe to call repeatedly with the same argument without any change in behaviour.',
      },
      {
        id: 'ex-m17-05-c',
        title: 'Highlight exactly one row',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 25,
        topicIds: ['dom'],
        instructions:
          'Write `selectRow(id)` that adds the `selected` class to the row with the given id and removes it from every other `.row` element, so exactly one row is ever selected.',
        html: '<ul><li id="r1" class="row selected">A</li><li id="r2" class="row">B</li><li id="r3" class="row">C</li></ul>',
        starterCode: [
          'function selectRow(id) {',
          '  // Loop every .row; force each row\'s selected class based on a comparison.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'selects the target row', body: 'selectRow("r2"); expect(document.getElementById("r2").classList.contains("selected")).toBe(true);' },
          { name: 'deselects the previously selected row', body: 'selectRow("r2"); expect(document.getElementById("r1").classList.contains("selected")).toBe(false);' },
          { name: 'leaves other rows unselected', body: 'selectRow("r3"); expect(document.getElementById("r1").classList.contains("selected")).toBe(false); expect(document.getElementById("r2").classList.contains("selected")).toBe(false);' },
        ],
        hints: [
          '`document.querySelectorAll(".row")` gets every row.',
          'For each one, `row.classList.toggle("selected", row.id === id)`.',
        ],
        solution: [
          'function selectRow(id) {',
          '  document.querySelectorAll(".row").forEach((row) => {',
          '    row.classList.toggle("selected", row.id === id);',
          '  });',
          '}',
        ].join('\n'),
        solutionExplanation:
          'The forced toggle sets each row\'s `selected` class to exactly `row.id === id` — `true` only for the matching row, `false` for every other, all in a single unconditional pass. This is the same active-navigation pattern from the lesson, generalised: no branching on the row\'s previous state is needed, because forced toggle already handles both "should be selected" and "should be deselected" identically.',
      },
      {
        id: 'ex-m17-05-d',
        title: 'classList or className?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'An element already has classes added by a third-party library. You need to add your own "highlighted" class without disturbing those. What should you use?',
        options: [
          'element.className = "highlighted"',
          'element.className += " highlighted"',
          'element.classList.add("highlighted")',
          'It does not matter which you use',
        ],
        correct: 2,
        hints: [
          'Which option only ever touches the one class you name?',
        ],
        solution: 'element.classList.add("highlighted")',
        solutionExplanation:
          '`classList.add` touches only the named class, leaving every other class — including ones added by other code — completely untouched. Assigning `className` directly **replaces the entire string**, silently discarding the library\'s classes; even the `+=` variant is fragile, since it needs manual space-handling and duplicate-checking that `classList` already handles correctly for free.',
      },
    ],
    quiz: {
      id: 'qz-m17-05',
      questions: [
        {
          id: 'q-m17-05-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What happens if you call classList.remove("x") on an element that does not have class "x"?',
          options: [
            'It throws an error',
            'Nothing — remove is safely idempotent',
            'It adds "x" instead',
            'It removes all classes',
          ],
          correct: 1,
          optionExplanations: [
            'No error occurs.',
            'Correct — safe to call unconditionally.',
            'remove never adds anything.',
            'Only the named class is ever affected.',
          ],
          explanation:
            '`classList.add` and `classList.remove` are both safely idempotent — calling `remove` on an absent class, or `add` on a present one, does nothing and never errors. You never need a `contains()` guard before calling either.',
        },
        {
          id: 'q-m17-05-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What does classList.toggle("open", isMenuOpen) do differently from classList.toggle("open")?',
          options: [
            'Nothing — they are identical',
            'The two-argument version sets the class to exactly the given boolean state, rather than flipping the current state',
            'The two-argument version always adds the class',
            'The two-argument version throws if the class already exists',
          ],
          correct: 1,
          optionExplanations: [
            'They behave differently whenever the current state does not match the desired one.',
            'Correct — forced toggle sets a known target state instead of flipping blindly.',
            'It can also remove the class, depending on the boolean.',
            'No error is thrown either way.',
          ],
          explanation:
            'Plain `toggle(name)` flips whatever the current state is. `toggle(name, state)` forces the class to match `state` exactly — present if truthy, absent if falsy — safe to call repeatedly with the same arguments without changing behaviour, unlike the flipping version.',
        },
        {
          id: 'q-m17-05-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'Why is classList generally preferred over assigning to className directly?',
          options: [
            'className does not exist in modern browsers',
            'Assigning className replaces the entire class string, silently discarding any classes not explicitly included; classList methods only touch the named class',
            'classList is faster in every measurable case',
            'There is no real difference',
          ],
          correct: 1,
          optionExplanations: [
            'className still exists and works.',
            'Correct — this is the substantive, not merely stylistic, reason.',
            'Performance is not the primary reason.',
            'The behavioural difference is real and consequential.',
          ],
          explanation:
            'Directly assigning `className` replaces the whole string, so any classes added by other code — a library, a different function — are silently lost unless painstakingly preserved by hand. `classList.add`/`remove`/`toggle` only ever affect the one class named, leaving everything else on the element intact.',
        },
        {
          id: 'q-m17-05-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'classList.replace("a", "b") requires two separate calls: remove("a") then add("b").',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'replace does both in a single call.',
            'Correct — replace is a single dedicated method for exactly this swap.',
          ],
          explanation:
            '`classList.replace(old, new)` swaps one class for another in a single call, equivalent to but more direct than separately calling `remove` then `add`.',
        },
      ],
    },
    summary:
      '`classList` provides a structured API — `add`, `remove`, `toggle`, `contains`, `replace` — over the space-separated class string that `className` exposes as a single flat string. `add` and `remove` are safely idempotent, needing no `contains()` guard beforehand. `toggle(name)` flips the current state; `toggle(name, state)` **forces** the class to match a known boolean, present or absent, safe to call repeatedly with identical results — the pattern behind active-navigation and single-selection UI, where each candidate element\'s class is set to exactly `matchesCondition`, no branching needed. `replace(old, new)` swaps one class for another in one call. `classList` is preferred over assigning `className` directly because a direct assignment **replaces the entire string**, silently discarding any classes added by other code; `classList` methods only ever touch the specific class named. This is the standard mechanism for driving UI state — active links, hidden panels, dark mode, validation styling — entirely through CSS classes rather than inline styles.',
    keyTakeaways: [
      'classList.add/remove are safely idempotent — no guard needed',
      'toggle(name) flips; toggle(name, state) forces a known state',
      'replace(old, new) swaps a class in one call',
      'classList only touches the named class; className replaces everything',
      'Forced toggle is the pattern for "exactly one selected" UI',
      'contains() checks membership without mutating anything',
    ],
    relatedLessons: ['l-m17-04', 'l-m17-06'],
    interviewConnections: [
      'What is the difference between classList and className?',
      'What does the second argument to classList.toggle do?',
      'How would you ensure exactly one element in a group has an active class?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m17-06',
    slug: 'inline-styles',
    moduleId: M,
    order: 6,
    title: 'Inline Styles',
    description: 'element.style, camelCase property names, and when a dynamic value genuinely needs to bypass CSS classes.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 14,
    xp: 30,
    topicIds: ['dom'],
    prerequisites: ['l-m17-05'],
    learningObjectives: [
      'Read and set individual CSS properties through element.style',
      'Convert between CSS\'s hyphenated names and JavaScript\'s camelCase',
      'Explain when an inline style is appropriate and when a class is better',
      'Set a CSS custom property from JavaScript',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Every element has a `.style` object — a live view onto its `style="..."` attribute, letting you read and set individual CSS properties directly from JavaScript.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="box" style="width: 100px; color: red;">Box</div>',
        caption: 'Reading and writing individual properties.',
        code: [
          'const box = document.getElementById("box");',
          '',
          'console.log(box.style.width);',
          'console.log(box.style.color);',
          '',
          'box.style.color = "blue";',
          'box.style.width = "200px";',
          '',
          'console.log(box.getAttribute("style"));',
        ].join('\n'),
        output: [
          '100px',
          'red',
          'width: 200px; color: blue;',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.WARNING,
        title: 'A number alone is not a valid CSS value',
        body: [
          '`box.style.width = 200` (a bare number, no unit) is silently ignored by most browsers — CSS length values need a unit. Write `"200px"`, or use `box.style.width = 200 + "px"` when building the value from a variable. This is a common source of "my style change did nothing" bugs.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'camelCase versus hyphenated',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="box">Box</div>',
        caption: 'A hyphenated CSS property becomes camelCase in JavaScript.',
        code: [
          'const box = document.getElementById("box");',
          '',
          'box.style.backgroundColor = "yellow";',
          'box.style.fontSize = "18px";',
          'box.style.borderRadius = "4px";',
          '',
          'console.log(box.getAttribute("style"));',
        ].join('\n'),
        output: ['background-color: yellow; font-size: 18px; border-radius: 4px;'].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'The same conversion rule as dataset, applied to a different name space',
        body: [
          'CSS writes multi-word properties with hyphens: `background-color`. JavaScript identifiers cannot contain hyphens (Module 01\'s identifier rules), so `element.style` exposes each one as camelCase instead: `backgroundColor`. It is a mechanical, completely predictable rename — hyphens vanish, and the letter after each removed hyphen is capitalised.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Removing an inline style',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="box" style="color: red; font-weight: bold;">Box</div>',
        caption: 'Setting a property to an empty string removes it, letting CSS rules take over again.',
        code: [
          'const box = document.getElementById("box");',
          '',
          'box.style.color = "";',
          '',
          'console.log(box.getAttribute("style"));',
        ].join('\n'),
        output: ['font-weight: bold;'].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Class versus inline style — the actual decision',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'Prefer classes for named states; use inline styles only for values a class cannot express in advance',
        body: [
          '"Active", "hidden", "error", "dark mode" are all **states with a name** — a fixed, known set of possible visual treatments. Express them as CSS classes and toggle the class; the actual styling rules live in a stylesheet, easy to find, easy to change without touching JavaScript at all.',
          'An inline style earns its place when the exact value is only known at **runtime** and cannot be enumerated in advance — a progress bar\'s width computed from a percentage, a tooltip positioned at the mouse\'s current coordinates, a user-chosen colour from a picker. There is no finite set of CSS classes that could cover "any width from 0% to 100%".',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="bar" style="width: 0%;"></div>',
        caption: 'A genuinely dynamic value — a progress bar\'s width.',
        code: [
          'function setProgress(percent) {',
          '  document.getElementById("bar").style.width = `${percent}%`;',
          '}',
          '',
          'setProgress(35);',
          'console.log(document.getElementById("bar").style.width);',
          '',
          'setProgress(80);',
          'console.log(document.getElementById("bar").style.width);',
        ].join('\n'),
        output: ['35%', '80%'].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'CSS custom properties',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        needsDom: true,
        html: '<div id="box">Box</div>',
        caption: 'Setting a CSS variable from JavaScript with setProperty.',
        code: [
          'const box = document.getElementById("box");',
          '',
          'box.style.setProperty("--accent-color", "#ff6b35");',
          '',
          'console.log(box.style.getPropertyValue("--accent-color"));',
          'console.log(box.getAttribute("style"));',
        ].join('\n'),
        output: [
          '#ff6b35',
          '--accent-color: #ff6b35;',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'CSS **custom properties** (variables), written `--name`, cannot be set through dot-notation — `box.style["--accent-color"]` does not work reliably, since the name is not a valid JavaScript identifier once you consider the hyphen structure the browser expects. `setProperty`/`getPropertyValue` handle them explicitly. This pattern is common in components that let a stylesheet define most of the visual design, while JavaScript only ever adjusts one specific variable — a genuinely clean separation between "what a theme looks like" (CSS) and "which theme value applies right now" (JavaScript).',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          '// <div id="x" style="color: red;"></div>',
          'const el = document.getElementById("x");',
          'el.style.backgroundColor = "blue";',
          '',
          'console.log(el.getAttribute("style"));',
        ].join('\n'),
        options: [
          '"color: red; background-color: blue;"',
          '"background-color: blue;"',
          '"backgroundColor: blue;"',
          '"color: red; backgroundColor: blue;"',
        ],
        correct: 0,
        explanation:
          'Setting `el.style.backgroundColor` adds that property alongside whatever inline styles already existed — it does not replace them, unlike assigning `className` for classes. The existing `color: red` is preserved, and the new property is added using its correct **hyphenated** CSS name, `background-color` — the camelCase form (`backgroundColor`) is only how JavaScript refers to it; the actual `style` attribute text always uses standard CSS syntax.',
      },
    ],
    exercises: [
      {
        id: 'ex-m17-06-a',
        title: 'Predict the camelCase conversion',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['dom'],
        instructions: 'What JavaScript property name corresponds to the CSS property "border-radius"?',
        options: ['border-radius', 'borderradius', 'borderRadius', 'BorderRadius'],
        correct: 2,
        hints: [
          'Hyphens are removed, and the following letter is capitalised.',
        ],
        solution: 'borderRadius',
        solutionExplanation:
          'The conversion rule is mechanical: remove each hyphen and capitalise the letter that followed it, leaving the very first letter lowercase. `border-radius` becomes `borderRadius` — never `BorderRadius` (capitalised first letter) and never the hyphenated form itself, which is invalid as a JavaScript property accessed by dot notation.',
      },
      {
        id: 'ex-m17-06-b',
        title: 'Set a dynamic progress bar',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `setBarWidth(percent)` setting the width of the element with id `"bar"` to `percent` followed by `%`.',
        html: '<div id="bar" style="width: 0%;"></div>',
        starterCode: [
          'function setBarWidth(percent) {',
          '  // Remember: a CSS length always needs a unit.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'sets the width', body: 'setBarWidth(60); expect(document.getElementById("bar").style.width).toBe("60%");' },
          { name: 'updates on a later call', body: 'setBarWidth(60); setBarWidth(90); expect(document.getElementById("bar").style.width).toBe("90%");' },
        ],
        hints: [
          '`document.getElementById("bar").style.width = `${percent}%`;`',
        ],
        solution: [
          'function setBarWidth(percent) {',
          '  document.getElementById("bar").style.width = `${percent}%`;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'The template literal appends the required `%` unit — assigning a bare number like `60` alone would be silently ignored, since CSS length and percentage values are never unitless. This is exactly the "genuinely dynamic value with no finite set of classes" case the lesson identifies as the legitimate use for an inline style.',
      },
      {
        id: 'ex-m17-06-c',
        title: 'Set a CSS custom property',
        kind: EXERCISE_KIND.DOM_TASK,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 20,
        topicIds: ['dom'],
        instructions:
          'Write `setThemeColor(color)` setting the `--theme-color` custom property on the element with id `"root"`.',
        html: '<div id="root"></div>',
        starterCode: [
          'function setThemeColor(color) {',
          '  // Custom properties need setProperty, not dot notation.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'sets the custom property', body: 'setThemeColor("#123456"); expect(document.getElementById("root").style.getPropertyValue("--theme-color")).toBe("#123456");' },
        ],
        hints: [
          '`element.style.setProperty("--theme-color", color)`',
        ],
        solution: [
          'function setThemeColor(color) {',
          '  document.getElementById("root").style.setProperty("--theme-color", color);',
          '}',
        ].join('\n'),
        solutionExplanation:
          'CSS custom properties keep their literal `--`-prefixed hyphenated name and are set through the explicit `setProperty` method rather than dot notation, because their names are not valid JavaScript identifiers in the way `backgroundColor` is a valid stand-in for `background-color`. `getPropertyValue` is the matching read method.',
      },
      {
        id: 'ex-m17-06-d',
        title: 'Class or inline style?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['dom'],
        instructions:
          'You are building a "dark mode" toggle for a whole page. Should the dark styling be applied with a CSS class, or with inline styles set from JavaScript?',
        options: [
          'Inline styles — set every dark-mode color property individually from JavaScript',
          'A CSS class — toggle a single "dark-mode" class and let a stylesheet define every color it implies',
          'It makes no difference either way',
          'Neither — dark mode must be a browser setting',
        ],
        correct: 1,
        hints: [
          'Is "dark mode" a fixed, named state, or a value only known at runtime?',
        ],
        solution: 'A CSS class — toggle a single "dark-mode" class and let a stylesheet define every color it implies',
        solutionExplanation:
          '"Dark mode" is a named state with a fixed, known set of style rules — exactly what a CSS class is for. Toggling one class and letting a stylesheet define everything it implies keeps the actual colors easy to find and adjust without touching JavaScript, and avoids JavaScript having to know or set every individual property involved. Inline styles are for values that cannot be enumerated in advance, which a full theme is not.',
      },
    ],
    quiz: {
      id: 'qz-m17-06',
      questions: [
        {
          id: 'q-m17-06-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'How does the CSS property font-size map to element.style?',
          options: ['font-size', 'fontsize', 'fontSize', 'FontSize'],
          correct: 2,
          optionExplanations: [
            'Hyphens are not valid in JavaScript property names accessed by dot notation.',
            'The capitalisation at the word boundary is required.',
            'Correct — camelCase, with the hyphen removed and the next letter capitalised.',
            'The very first letter stays lowercase.',
          ],
          explanation:
            'JavaScript identifiers cannot contain hyphens, so `element.style` exposes hyphenated CSS properties in camelCase: `font-size` becomes `fontSize`, `background-color` becomes `backgroundColor`, and so on — a mechanical, fully predictable rename.',
        },
        {
          id: 'q-m17-06-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'What happens if you set element.style.width = 200 (a bare number, no unit)?',
          options: [
            'It works exactly like "200px"',
            'It is silently ignored by most browsers, since a CSS length needs a unit',
            'It throws a TypeError',
            'It sets the width in the current default unit automatically',
          ],
          correct: 1,
          optionExplanations: [
            'A unit is required for this to take effect.',
            'Correct — this is a common source of "nothing happened" bugs.',
            'No error is thrown; it fails silently instead.',
            'There is no automatic unit fallback.',
          ],
          explanation:
            'CSS length and percentage values require an explicit unit. A bare number assigned to a property like `width` is silently ignored rather than throwing, which is precisely what makes this mistake easy to miss — always include the unit, e.g. `"200px"` or a template literal like `` `${n}px` ``.',
        },
        {
          id: 'q-m17-06-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['dom'],
          prompt: 'When is an inline style the right choice over a CSS class?',
          options: [
            'Always — inline styles are simpler',
            'When the exact value is only known at runtime and cannot be enumerated as a fixed set of classes, like a progress bar\'s width',
            'Never — classes should always be used',
            'Only for colors',
          ],
          correct: 1,
          optionExplanations: [
            'Named, fixed states are better expressed as classes.',
            'Correct — a runtime-computed, effectively unbounded value is the right case for an inline style.',
            'There is a legitimate use for inline styles.',
            'The reasoning applies to any genuinely dynamic value, not only color.',
          ],
          explanation:
            'Named states with a fixed set of possibilities ("active", "hidden", "dark mode") belong in CSS classes, kept easy to find and adjust in a stylesheet. A value with no finite enumeration — a percentage computed at runtime, mouse-tracked coordinates — is what genuinely justifies an inline style.',
        },
        {
          id: 'q-m17-06-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['dom'],
          prompt: 'CSS custom properties like --accent-color can be set through element.style.accentColor.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'Custom properties keep their literal hyphenated name and need setProperty.',
            'Correct — use setProperty("--accent-color", value) instead.',
          ],
          explanation:
            'Custom properties are not converted to camelCase the way standard CSS properties are — they must be set and read explicitly with `style.setProperty("--name", value)` and `style.getPropertyValue("--name")`.',
        },
      ],
    },
    summary:
      '`element.style` reads and writes individual CSS properties on an element\'s inline `style` attribute, exposing hyphenated CSS names (`background-color`) as camelCase JavaScript properties (`backgroundColor`) — a mechanical, predictable conversion. A bare number assigned to a length property is silently ignored; CSS values need an explicit unit. Setting a property to an empty string removes it, letting any underlying stylesheet rule apply again. The professional decision between a class and an inline style: named, fixed states ("active", "hidden", "dark mode") belong in CSS classes toggled from JavaScript, keeping the actual styling in a stylesheet; inline styles are justified only when the exact value is known solely at runtime and cannot be enumerated as a finite set of classes — a progress bar\'s width, a computed position. CSS **custom properties** (`--name`) bypass the camelCase conversion entirely and require the explicit `setProperty`/`getPropertyValue` methods, a clean way to let JavaScript adjust one variable while a stylesheet defines everything that variable controls.',
    keyTakeaways: [
      'element.style exposes hyphenated CSS names as camelCase',
      'CSS length/percentage values need an explicit unit — a bare number is ignored',
      'Setting a property to "" removes it, restoring any stylesheet rule',
      'Classes for named, fixed states; inline styles for runtime-only values',
      'Inline styles add to existing ones — they do not replace the whole style attribute',
      'CSS custom properties (--name) need setProperty/getPropertyValue, not dot notation',
    ],
    relatedLessons: ['l-m17-05'],
    interviewConnections: [
      'How do hyphenated CSS properties map to JavaScript property names?',
      'When should you use an inline style instead of a CSS class?',
      'Why does a bare number assigned to style.width not work?',
      'How do you set a CSS custom property from JavaScript?',
    ],
  },
];
