import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Prototypes/classes and the browser trio: DOM, events, forms.
 *
 * The compression risk here is different from the language sheets — it is easy
 * to write a DOM reminder that is technically true and quietly insecure. Every
 * sheet below states the trust boundary where one exists.
 */

export default [
  {
    id: 'cs-prototypes',
    slug: 'prototypes-classes',
    title: 'Prototypes & Classes',
    category: C.FUNCTIONS,
    icon: 'account_tree',
    aliases: ['prototype', 'class', 'extends', 'super', 'inheritance', 'instanceof', 'private fields'],
    topicIds: ['prototypes', 'classes'],
    description: 'The chain, the two different "prototypes", and what class syntax actually creates.',
    groups: [
      {
        title: 'The distinction that gets asked',
        kind: G.TABLE,
        columns: ['', 'What it is', 'How to read it'],
        rows: [
          ['`obj.__proto__`', 'the object **this object inherits from**', '`Object.getPrototypeOf(obj)`'],
          ['`Fn.prototype`', 'a plain object that **future instances** will inherit from', 'an ordinary property on the function'],
        ],
        note: 'They are different things. `Fn.prototype` is not `Fn`\'s own prototype — `Object.getPrototypeOf(Fn)` is `Function.prototype`. After `const d = new Dog()`, `Object.getPrototypeOf(d) === Dog.prototype`.',
      },
      {
        title: 'The chain',
        kind: G.SNIPPETS,
        entries: [
          { code: '[]  →  Array.prototype  →  Object.prototype  →  null', description: 'Property lookup walks up until it finds the key or hits `null`.' },
          { code: 'Object.getPrototypeOf([]) === Array.prototype; // true\nObject.getPrototypeOf(Object.prototype);      // null', description: 'The chain always terminates at `null` — that is what ends a failed lookup.' },
          { code: 'const bare = Object.create(null);', description: 'No prototype at all: no `toString`, no `constructor`, **no `__proto__`**. The right container for a dictionary keyed by untrusted data.' },
        ],
      },
      {
        title: 'Reads walk up, writes do not',
        kind: G.SNIPPETS,
        entries: [
          { code: 'Animal.prototype.sound = "generic";\nconst a = new Animal();\n\na.sound = "woof";   // creates an OWN property\nObject.hasOwn(a, "sound"); // true', description: 'Assignment never modifies the prototype — it **shadows** it on the instance, permanently.' },
          { code: 'Animal.prototype.tags = [];\na.tags.push("x");  // mutates the SHARED array ✗', description: 'A mutable value on the prototype is shared by every instance, because `push` mutates rather than assigns. Per-instance state belongs in the constructor or a class field.' },
        ],
      },
      {
        title: 'Class syntax',
        kind: G.SNIPPETS,
        entries: [
          { code: 'class Shape {\n  static count = 0;\n  name = "shape";        // field → per instance\n  #secret = 1;           // private\n\n  constructor(name) { this.name = name; }\n  describe() { … }       // method → on Shape.prototype\n  get upper() { … }\n}', description: 'Methods land on the prototype and are **shared**; fields are created per instance in the constructor.' },
          { code: 'class Circle extends Shape {\n  constructor() {\n    super("circle");     // MUST precede any use of this\n  }\n  describe() { return super.describe() + " (round)"; }\n}', description: 'The base constructor is what creates the instance, so `this` does not exist before `super()`.' },
        ],
      },
      {
        title: 'Field vs method',
        kind: G.TABLE,
        columns: ['', 'Arrow field', 'Prototype method'],
        rows: [
          ['Lives on', 'each **instance**', '`Class.prototype`'],
          ['`this` when detached', '**survives** (lexical)', 'lost — `TypeError`'],
          ['Memory', 'one function **per instance**', 'one, shared'],
          ['`super` override', '**not possible**', 'works'],
          ['Visible to a test spy', 'no', 'yes'],
        ],
        note: 'Default to methods. Use a bound arrow field only where the function is handed to something that calls it detached — an event listener, a `setTimeout`, a framework prop.',
      },
      {
        title: 'Rules',
        kind: G.RULES,
        items: [
          'Class syntax is **sugar over prototypes**, not a separate object model.',
          'Class bodies are always strict mode, and a class is in a **TDZ** until its declaration runs — unlike a function declaration.',
          'A class cannot be called without `new` — it throws a `TypeError`.',
          '`#private` fields are enforced by the language: access from outside is a **`SyntaxError`**, and they are invisible to `Object.keys` and `JSON.stringify`. They are **not inherited** by subclasses.',
          '`instanceof` walks the prototype chain, so it fails across iframes/workers. `Array.isArray` does not.',
          'Avoid `Object.setPrototypeOf` on a live object — it forces a severe engine deoptimisation. Build with `Object.create` instead.',
        ],
      },
    ],
    relatedLessons: ['l-m30-01', 'l-m30-02', 'l-m31-01', 'l-m31-02'],
    relatedReference: ['ref-object-getprototypeof', 'ref-object-create', 'ref-syntax-class', 'ref-syntax-private-fields'],
    relatedChallenges: ['ch-cls-private-state', 'ch-cls-inheritance', 'ch-cls-mixin'],
  },

  {
    id: 'cs-dom',
    slug: 'dom',
    title: 'DOM',
    category: C.BROWSER,
    icon: 'account_tree',
    aliases: ['dom', 'querySelector', 'textContent', 'innerHTML', 'createElement', 'classList'],
    topicIds: ['dom', 'dom-manipulation'],
    description: 'Select, read, change, create and traverse — plus the one line that decides whether your rendering is safe.',
    groups: [
      {
        title: 'Select',
        kind: G.TABLE,
        columns: ['Call', 'Returns', 'Note'],
        rows: [
          ['`getElementById("x")`', 'element or **`null`**', 'bare id, **no `#`**'],
          ['`querySelector(sel)`', 'first match or **`null`**', 'any CSS selector'],
          ['`querySelectorAll(sel)`', '**static** `NodeList`', 'empty list, never `null`'],
          ['`getElementsByClassName(c)`', '**live** `HTMLCollection`', 'updates as the DOM changes'],
          ['`el.closest(sel)`', 'nearest ancestor **or itself**', 'walks up'],
          ['`el.matches(sel)`', 'boolean', 'tests only that element'],
        ],
        note: '`querySelectorAll` is a **snapshot**. `getElementsBy*` are **live** — removing elements while looping forwards over a live collection skips items.',
      },
      {
        title: 'Read and write content',
        kind: G.TABLE,
        columns: ['Property', 'Parses HTML?', 'Use for'],
        rows: [
          ['`textContent`', '**No**', '**untrusted text — the safe default**'],
          ['`innerText`', 'No', 'what the user visibly sees; forces a reflow'],
          ['`innerHTML`', '**Yes**', 'markup **you authored**, never user data'],
        ],
        note: '`innerHTML` is not banned — it is unsafe the moment any part of the string comes from outside your code, including your own database.',
      },
      {
        title: 'Safe rendering',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const li = document.createElement("li");\nli.textContent = user.name;   // inert, always\nlist.append(li);', description: 'Text assigned this way is never parsed, so there is no markup for an attacker to inject.' },
          { code: 'list.innerHTML += `<li>${user.name}</li>`; // ✗', description: 'Injects markup **and** re-parses the whole list, destroying every existing listener.' },
        ],
      },
      {
        title: 'Create and insert',
        kind: G.SNIPPETS,
        entries: [
          { code: 'parent.append(node, "text")   // end, multiple, strings ok\nparent.prepend(node)          // start\nel.before(node) / el.after(node)\nel.replaceWith(node)\nel.remove()', description: 'Strings are inserted as **text**, never parsed. Inserting an existing node **moves** it.' },
          { code: 'const frag = document.createDocumentFragment();\nfor (…) frag.append(buildRow(item));\nlist.replaceChildren(frag);', description: 'Build off-document, insert once — one layout pass. `replaceChildren()` with no arguments empties an element.' },
          { code: 'el.cloneNode()      // shallow — no children!\nel.cloneNode(true)  // deep', description: 'Listeners are **never** cloned, and `id` attributes are duplicated.' },
        ],
      },
      {
        title: 'Attributes, classes, data',
        kind: G.SNIPPETS,
        entries: [
          { code: 'el.classList.add("a", "b");\nel.classList.toggle("open", isOpen);  // force, idempotent\nel.className = "x";                  // ✗ wipes all classes', description: 'Prefer `classList`. The second `toggle` argument sets rather than flips.' },
          { code: 'el.dataset.userId          // from data-user-id\nNumber(el.dataset.count)   // ALWAYS a string', description: '`data-active="false"` reads as the **truthy string** `"false"`.' },
          { code: 'input.value                  // current state ✓\ninput.getAttribute("value")  // original default ✗', description: 'Property = live state, attribute = markup default.' },
        ],
      },
      {
        title: 'Traverse',
        kind: G.RULES,
        items: [
          'Use the `*Element*` forms: `children`, `firstElementChild`, `nextElementSibling`, `parentElement`.',
          'The `Node` forms — `childNodes`, `firstChild`, `nextSibling` — include **whitespace text nodes**, so `firstChild` is usually a newline.',
          '`children` is a **live** `HTMLCollection` with no `forEach`, `map` or `filter`. Spread it: `[...el.children]`.',
          '`el.contains(other)` is **inclusive** — `el.contains(el)` is `true`. `el.isConnected` answers "is it in the document".',
        ],
      },
    ],
    relatedLessons: ['l-m17-02', 'l-m17-03', 'l-m18-02', 'l-m18-06'],
    relatedReference: ['ref-dom-queryselector', 'ref-dom-textcontent', 'ref-dom-innerhtml', 'ref-dom-append', 'ref-dom-classlist'],
    relatedChallenges: ['ch-dom-build-list', 'ch-dom-toggle-class', 'ch-dom-virtual-diff'],
  },

  {
    id: 'cs-events',
    slug: 'events',
    title: 'Events',
    category: C.BROWSER,
    icon: 'touch_app',
    aliases: ['event', 'addEventListener', 'event delegation', 'target currentTarget', 'bubbling', 'preventDefault'],
    topicIds: ['events'],
    description: 'Listen, delegate, cancel and clean up — and the target/currentTarget distinction interviewers always probe.',
    groups: [
      {
        title: 'target vs currentTarget',
        kind: G.TABLE,
        columns: ['', 'What it is'],
        rows: [
          ['`event.target`', 'the **deepest element where the event originated**'],
          ['`event.currentTarget`', 'the element **whose listener is running right now**'],
        ],
        note: 'They are the same for a listener attached directly to the clicked element, and differ whenever the event has propagated — which is exactly the delegation case. `currentTarget` is `null` after dispatch ends, so never read it after an `await`.',
      },
      {
        title: 'Delegation — the canonical shape',
        kind: G.SNIPPETS,
        entries: [
          { code: 'list.addEventListener("click", (event) => {\n  const button = event.target.closest("[data-action=\'delete\']");\n\n  if (!button || !list.contains(button)) {\n    return;\n  }\n\n  remove(button.dataset.id);\n});', description: 'The click may land on an icon or `<span>` **inside** the button, so raw `target` is the wrong element. `closest()` walks up to the real control. `contains()` is needed because `closest` keeps walking past your container to the document root.' },
        ],
      },
      {
        title: 'Why delegate',
        kind: G.RULES,
        items: [
          'One listener instead of N — and it keeps working for rows added **later**.',
          'No per-row cleanup, so no accumulating listeners and no detached-node leak.',
          'Attach it to the nearest **stable** ancestor, not to `document`, so unrelated clicks are not routed through your handler.',
        ],
      },
      {
        title: 'preventDefault vs stopPropagation',
        kind: G.TABLE,
        columns: ['Call', 'Stops the default action', 'Stops propagation', 'Stops sibling listeners'],
        rows: [
          ['`preventDefault()`', '**yes**', 'no', 'no'],
          ['`stopPropagation()`', 'no', '**yes**', 'no'],
          ['`stopImmediatePropagation()`', 'no', '**yes**', '**yes**'],
        ],
        note: 'They are independent — neither implies the other. A link with only `stopPropagation()` still navigates. `preventDefault()` must be called **synchronously**, before any `await`.',
      },
      {
        title: 'Listener options',
        kind: G.SNIPPETS,
        entries: [
          { code: 'el.addEventListener("click", fn, {\n  once: true,      // auto-removes after one call\n  capture: true,   // fires on the way DOWN\n  passive: true,   // promises never to preventDefault\n  signal,          // AbortController cleanup\n});', description: '`passive` lets the browser scroll without waiting for your handler. Calling `preventDefault()` in a passive listener is **ignored**.' },
          { code: 'const c = new AbortController();\nel.addEventListener("scroll", fn, { signal: c.signal });\nc.abort();  // removes every listener using this signal', description: 'The modern cleanup mechanism — no references to track.' },
        ],
      },
      {
        title: 'removeEventListener needs identity',
        kind: G.SNIPPETS,
        entries: [
          { code: 'el.addEventListener("click", () => f());\nel.removeEventListener("click", () => f()); // ✗ removes nothing', description: 'A structurally identical arrow is a **different function object**.' },
          { code: 'el.removeEventListener("click", this.h.bind(this)); // ✗', description: '`bind` returns a new function every call. Store the bound reference once — or use a `signal`.' },
        ],
      },
      {
        title: 'Propagation and traps',
        kind: G.RULES,
        items: [
          'Three phases: **capture** (root → target), **at target**, then **bubble** (target → root). Listeners are bubble-phase unless `capture: true`.',
          '`focus`, `blur`, `mouseenter` and `mouseleave` **do not bubble** — use `focusin`/`focusout`, or `capture: true`.',
          '`addEventListener("click", handler())` calls the function immediately and registers `undefined`. Pass the **reference**.',
          '`dispatchEvent` is **synchronous**, and `bubbles` defaults to **`false`** on a `CustomEvent` you construct. Data belongs in `detail`.',
        ],
      },
    ],
    relatedLessons: ['l-m19-02', 'l-m19-03', 'l-m19-04', 'l-m19-05'],
    relatedReference: ['ref-events-addeventlistener', 'ref-events-target', 'ref-events-preventdefault', 'ref-events-stoppropagation', 'ref-dom-closest'],
    relatedChallenges: ['ch-dom-delegation', 'ch-dom-observer-cleanup', 'ch-dom-keyboard-nav'],
  },

  {
    id: 'cs-forms',
    slug: 'forms',
    title: 'Forms',
    category: C.BROWSER,
    icon: 'edit_note',
    aliases: ['form', 'FormData', 'validation', 'checkValidity', 'submit', 'input value'],
    topicIds: ['forms'],
    description: 'Read values, collect them, validate them — and the line between user experience and security.',
    groups: [
      {
        title: 'The submit handler',
        kind: G.SNIPPETS,
        entries: [
          { code: 'form.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const data = Object.fromEntries(new FormData(form));\n  send(data);\n});', description: 'Listen for **`submit`**, not a button click — Enter in a text field also submits. Constraint validation has already run by then.' },
        ],
      },
      {
        title: 'Reading values',
        kind: G.TABLE,
        columns: ['Control', 'Read', 'Type'],
        rows: [
          ['text / textarea', '`input.value`', '**string**'],
          ['`type="number"`', '`input.valueAsNumber`', 'number, or `NaN` if empty'],
          ['checkbox', '`input.checked`', 'boolean'],
          ['radio group', '`form.elements.name.value`', 'string'],
          ['`<select multiple>`', '`[...select.selectedOptions]`', 'array'],
        ],
        note: '`input.value` is **always a string**, including for `type="number"` — so `a + b` concatenates. `Number("")` is `0`, which is why `valueAsNumber` (giving `NaN`) is the safer numeric read.',
      },
      {
        title: 'FormData',
        kind: G.SNIPPETS,
        entries: [
          { code: 'const data = new FormData(form);\ndata.get("tag")     // FIRST value\ndata.getAll("tag")  // ALL values\ndata.has("agree")', description: 'Collects by **`name`**, never `id`. Controls without a `name`, and disabled controls, are omitted.' },
          { code: 'Object.fromEntries(new FormData(form))', description: '**Two silent losses**: repeated names collapse to the last value, and an unchecked checkbox contributes **nothing at all** — not `false`.' },
          { code: 'fetch(url, { method: "POST", body: formData });', description: 'Sets the multipart content type automatically — the simple path for file uploads.' },
        ],
      },
      {
        title: 'Constraint validation',
        kind: G.TABLE,
        columns: ['Call', 'Does', 'Shows a message?'],
        rows: [
          ['`form.checkValidity()`', 'tests', '**no**'],
          ['`form.reportValidity()`', 'tests **and** focuses the first invalid field', '**yes**'],
          ['`input.setCustomValidity(msg)`', 'marks invalid with your text', 'on report'],
          ['`input.validity`', 'a `ValidityState` saying **which** rule failed', '—'],
        ],
        note: '`setCustomValidity("")` is required to **clear** a custom error — a field with a non-empty custom message stays invalid forever. That is the classic bug with this API.',
      },
      {
        title: 'ValidityState flags',
        kind: G.RULES,
        items: [
          '`valueMissing` — a `required` field is empty.',
          '`typeMismatch` — wrong shape for `type="email"` / `type="url"`.',
          '`patternMismatch` — fails the `pattern` attribute.',
          '`tooShort` / `tooLong`, `rangeUnderflow` / `rangeOverflow`, `stepMismatch`.',
          '`badInput` — the browser could not parse what was typed.',
          '`customError` — you called `setCustomValidity`.',
        ],
      },
      {
        title: 'Client validation is not security',
        kind: G.RULES,
        items: [
          'Everything on this sheet runs **on the user\'s machine** and can be bypassed by sending the request directly.',
          'Client validation is a **user-experience feature**: fast feedback, fewer wasted round-trips.',
          '**The server must revalidate every rule** — types, ranges, business rules **and authorisation**.',
          'A `disabled` or hidden control is not an access control.',
          'Style with `:user-invalid`, not `:invalid` — the latter matches before the user has typed anything.',
        ],
      },
    ],
    relatedLessons: ['l-m20-01', 'l-m20-03', 'l-m20-04', 'l-m20-06'],
    relatedReference: ['ref-form-formdata', 'ref-form-value', 'ref-form-checkvalidity', 'ref-events-preventdefault'],
    relatedChallenges: ['ch-dom-form-values'],
  },
];
