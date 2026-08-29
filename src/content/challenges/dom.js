import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'DOM & Events';

export const challenges = [
  {
    id: 'ch-dom-build-list',
    slug: 'build-a-list-from-data',
    title: 'Build a List from Data',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['dom', 'dom-manipulation', 'arrays'],
    xp: XP[DIFFICULTY.BEGINNER],
    needsDom: true,
    prompt:
      'Write `renderList(container, items)` that fills a container element with one `<li>` per item, wrapped in a single `<ul>`. Each item is a string and must be inserted as **text**, not parsed as markup — an item containing `<b>` should display those characters literally. Calling the function again replaces whatever was there before rather than appending to it.',
    examples: [
      'const box = document.createElement("div");\nrenderList(box, ["a", "b"]);\nbox.innerHTML;  // "<ul><li>a</li><li>b</li></ul>"',
    ],
    constraints: ['Exactly one `<ul>` inside the container.', 'Item text is inserted as text, never as markup.', 'Re-rendering replaces the previous content.'],
    starterCode: 'function renderList(container, items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'creates a ul', body: 'const box = document.createElement("div"); renderList(box, ["a"]); expect(box.querySelectorAll("ul").length).toBe(1);' },
      { name: 'creates one li per item', body: 'const box = document.createElement("div"); renderList(box, ["a", "b", "c"]); expect(box.querySelectorAll("li").length).toBe(3);' },
      { name: 'puts the text in the items', body: 'const box = document.createElement("div"); renderList(box, ["a", "b"]); expect([...box.querySelectorAll("li")].map((li) => li.textContent)).toEqual(["a", "b"]);' },
      { name: 'the items are inside the ul', body: 'const box = document.createElement("div"); renderList(box, ["a"]); expect(box.querySelector("ul").children.length).toBe(1);' },
      { name: 'an empty list still creates the ul', body: 'const box = document.createElement("div"); renderList(box, []); expect(box.querySelectorAll("ul").length).toBe(1); expect(box.querySelectorAll("li").length).toBe(0);' },
      { name: 'clears previous content', body: 'const box = document.createElement("div"); box.innerHTML = "<p>old</p>"; renderList(box, ["a"]); expect(box.querySelectorAll("p").length).toBe(0);' },
      { name: 're-rendering does not append', body: 'const box = document.createElement("div"); renderList(box, ["a", "b"]); renderList(box, ["c"]); expect(box.querySelectorAll("li").length).toBe(1);' },
      { name: 'inserts markup characters as text', body: 'const box = document.createElement("div"); renderList(box, ["<b>bold</b>"]); expect(box.querySelectorAll("b").length).toBe(0); expect(box.querySelector("li").textContent).toBe("<b>bold</b>");' },
      { name: 'does not execute an injected script tag', body: 'const box = document.createElement("div"); renderList(box, ["<img src=x onerror=\'window.__hacked = true\'>"]); expect(window.__hacked).toBe(undefined);', hidden: true },
      { name: 'handles many items', body: 'const box = document.createElement("div"); renderList(box, Array.from({ length: 100 }, (_, i) => String(i))); expect(box.querySelectorAll("li").length).toBe(100); expect(box.querySelectorAll("li")[99].textContent).toBe("99");', hidden: true },
    ],
    hints: [
      '`createElement` makes the elements and `appendChild` puts them in place. Build the `<ul>` first, then add the items to it.',
      'Setting `textContent` inserts a string as text. Setting `innerHTML` parses it as markup, which is what the injection test is checking against.',
      'To clear the container, `replaceChildren()` with no arguments removes everything — or set `textContent` to an empty string.',
    ],
    solution:
      'function renderList(container, items) {\n' +
      '  const list = document.createElement("ul");\n' +
      '  for (const item of items) {\n' +
      '    const li = document.createElement("li");\n' +
      '    li.textContent = item;\n' +
      '    list.appendChild(li);\n' +
      '  }\n' +
      '  container.replaceChildren(list);\n' +
      '}\n',
    solutionExplanation:
      'The choice between `textContent` and `innerHTML` is the whole security story of this challenge. `textContent` treats its input as a string of characters, so `"<b>bold</b>"` shows up as those exact characters and the injected `<img onerror=...>` never becomes an element that could run anything. `innerHTML` would parse both, and the second one would execute. `replaceChildren(list)` clears and inserts in one call, which is what makes re-rendering idempotent; building the `<ul>` fully before attaching it also means the browser lays the page out once rather than after every item.',
  },

  {
    id: 'ch-dom-delegation',
    slug: 'event-delegation',
    title: 'Event Delegation',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['events', 'dom', 'dom-manipulation'],
    xp: XP[DIFFICULTY.MEDIUM],
    needsDom: true,
    prompt:
      'Attaching a listener to every row breaks as soon as rows are added dynamically. Write `delegate(root, selector, type, handler)` attaching a **single** listener to `root` that runs `handler(event, matchedElement)` whenever the event originated inside an element matching `selector` within `root`. It must work for elements added after the delegation was set up. Return a function that removes the listener.',
    examples: [
      'delegate(table, "button.delete", "click", (e, btn) => remove(btn.dataset.id));\n// works for rows added later, with one listener instead of hundreds',
    ],
    constraints: ['Exactly one listener is added to `root`.', 'The handler receives the matched element, which may be an ancestor of the actual target.', 'Events from non-matching elements are ignored.'],
    starterCode: 'function delegate(root, selector, type, handler) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'runs the handler for a matching element',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'>x</button>";\n' +
          'let hits = 0;\n' +
          'delegate(root, ".go", "click", () => { hits += 1; });\n' +
          'root.querySelector(".go").click();\n' +
          'expect(hits).toBe(1);',
      },
      {
        name: 'ignores non-matching elements',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'>x</button><button class=\'no\'>y</button>";\n' +
          'let hits = 0;\n' +
          'delegate(root, ".go", "click", () => { hits += 1; });\n' +
          'root.querySelector(".no").click();\n' +
          'expect(hits).toBe(0);',
      },
      {
        name: 'works for elements added later',
        body:
          'const root = document.createElement("div");\n' +
          'let hits = 0;\n' +
          'delegate(root, ".go", "click", () => { hits += 1; });\n' +
          'root.innerHTML = "<button class=\'go\'>later</button>";\n' +
          'root.querySelector(".go").click();\n' +
          'expect(hits).toBe(1);',
      },
      {
        name: 'passes the matched element, not the deepest target',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'><span>inner</span></button>";\n' +
          'let matched = null;\n' +
          'delegate(root, ".go", "click", (e, el) => { matched = el; });\n' +
          'root.querySelector("span").click();\n' +
          'expect(matched.className).toBe("go");',
      },
      {
        name: 'passes the event object',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'>x</button>";\n' +
          'let seenType = null;\n' +
          'delegate(root, ".go", "click", (e) => { seenType = e.type; });\n' +
          'root.querySelector(".go").click();\n' +
          'expect(seenType).toBe("click");',
      },
      {
        name: 'adds only one listener',
        body:
          'const root = document.createElement("div");\n' +
          'let added = 0;\n' +
          'const original = root.addEventListener.bind(root);\n' +
          'root.addEventListener = (...args) => { added += 1; return original(...args); };\n' +
          'delegate(root, ".go", "click", () => {});\n' +
          'expect(added).toBe(1);',
      },
      {
        name: 'the returned function removes the listener',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'>x</button>";\n' +
          'let hits = 0;\n' +
          'const off = delegate(root, ".go", "click", () => { hits += 1; });\n' +
          'root.querySelector(".go").click();\n' +
          'off();\n' +
          'root.querySelector(".go").click();\n' +
          'expect(hits).toBe(1);',
      },
      {
        name: 'handles several matching elements with one listener',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button class=\'go\'>a</button><button class=\'go\'>b</button>";\n' +
          'const clicked = [];\n' +
          'delegate(root, ".go", "click", (e, el) => { clicked.push(el.textContent); });\n' +
          'root.querySelectorAll(".go").forEach((b) => b.click());\n' +
          'expect(clicked).toEqual(["a", "b"]);',
      },
      {
        name: 'does not match outside the root',
        body:
          'const outer = document.createElement("div");\n' +
          'const root = document.createElement("div");\n' +
          'outer.appendChild(root);\n' +
          'outer.innerHTML += "";\n' +
          'const inside = document.createElement("button");\n' +
          'inside.className = "go";\n' +
          'root.appendChild(inside);\n' +
          'let hits = 0;\n' +
          'delegate(root, ".go", "click", () => { hits += 1; });\n' +
          'inside.click();\n' +
          'expect(hits).toBe(1);',
        hidden: true,
      },
      {
        name: 'works with a different event type',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<input class=\'f\'>";\n' +
          'let hits = 0;\n' +
          'delegate(root, ".f", "input", () => { hits += 1; });\n' +
          'root.querySelector(".f").dispatchEvent(new Event("input", { bubbles: true }));\n' +
          'expect(hits).toBe(1);',
        hidden: true,
      },
    ],
    hints: [
      'One listener on `root` sees events from all its descendants, because most events bubble up through their ancestors.',
      '`event.target` is the deepest element the event started on. `Element.prototype.closest(selector)` walks up from there to find the nearest matching ancestor.',
      '`closest` can walk past `root` itself, so check that whatever it found is actually contained in `root` before calling the handler.',
    ],
    solution:
      'function delegate(root, selector, type, handler) {\n' +
      '  const listener = (event) => {\n' +
      '    const match = event.target.closest(selector);\n' +
      '    if (match && root.contains(match)) handler(event, match);\n' +
      '  };\n' +
      '  root.addEventListener(type, listener);\n' +
      '  return () => root.removeEventListener(type, listener);\n' +
      '}\n',
    solutionExplanation:
      'Delegation works because events bubble: a click on a deeply nested `<span>` also fires on every ancestor, so one listener on the container sees everything. That is why it keeps working for elements added later — the listener was never attached to them in the first place. `closest` is the piece that makes the match correct rather than approximate: clicking the `<span>` inside a button should count as clicking the button, and `event.target` alone would report the span. The `root.contains(match)` guard matters because `closest` keeps walking above `root` and could match an ancestor outside the delegated region. Returning the remover closes over the same `listener` reference, which is required — `removeEventListener` matches on identity, so a re-created function would silently remove nothing.',
  },

  {
    id: 'ch-dom-form-values',
    slug: 'reading-a-form',
    title: 'Reading a Form',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['forms', 'dom', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    needsDom: true,
    prompt:
      'Write `readForm(form)` collecting a form\'s current values into an object keyed by input name. A text input contributes its string value. A checkbox contributes `true` or `false`, not `"on"`. A group of radio buttons sharing a name contributes the value of the checked one, or `null` if none is checked. Several checkboxes sharing a name contribute an array of the checked values. Inputs with no `name` are skipped.',
    examples: [
      'readForm(form);\n// { email: "a@b.c", subscribe: true, plan: "pro", tags: ["x", "y"] }',
    ],
    constraints: ['A checkbox alone in its name gives a boolean.', 'Several checkboxes sharing a name give an array of the checked values.', 'A radio group with nothing checked gives `null`.'],
    starterCode: 'function readForm(form) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'reads a text input',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input name=\'email\' value=\'a@b.c\'>";\n' +
          'expect(readForm(f)).toEqual({ email: "a@b.c" });',
      },
      {
        name: 'reads several text inputs',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input name=\'a\' value=\'1\'><input name=\'b\' value=\'2\'>";\n' +
          'expect(readForm(f)).toEqual({ a: "1", b: "2" });',
      },
      {
        name: 'a lone checkbox gives a boolean',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'checkbox\' name=\'sub\' checked>";\n' +
          'expect(readForm(f)).toEqual({ sub: true });',
      },
      {
        name: 'an unchecked checkbox gives false, not absence',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'checkbox\' name=\'sub\'>";\n' +
          'expect(readForm(f)).toEqual({ sub: false });',
      },
      {
        name: 'a checkbox never gives the string on',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'checkbox\' name=\'sub\' checked>";\n' +
          'expect(readForm(f).sub).not.toBe("on");',
      },
      {
        name: 'a radio group gives the checked value',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'radio\' name=\'plan\' value=\'free\'><input type=\'radio\' name=\'plan\' value=\'pro\' checked>";\n' +
          'expect(readForm(f)).toEqual({ plan: "pro" });',
      },
      {
        name: 'an unchecked radio group gives null',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'radio\' name=\'plan\' value=\'free\'><input type=\'radio\' name=\'plan\' value=\'pro\'>";\n' +
          'expect(readForm(f)).toEqual({ plan: null });',
      },
      {
        name: 'several checkboxes sharing a name give an array',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'checkbox\' name=\'tags\' value=\'x\' checked><input type=\'checkbox\' name=\'tags\' value=\'y\' checked><input type=\'checkbox\' name=\'tags\' value=\'z\'>";\n' +
          'expect(readForm(f)).toEqual({ tags: ["x", "y"] });',
      },
      {
        name: 'a checkbox group with none checked gives an empty array',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input type=\'checkbox\' name=\'tags\' value=\'x\'><input type=\'checkbox\' name=\'tags\' value=\'y\'>";\n' +
          'expect(readForm(f)).toEqual({ tags: [] });',
      },
      {
        name: 'skips inputs with no name',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<input value=\'ignored\'><input name=\'a\' value=\'1\'>";\n' +
          'expect(readForm(f)).toEqual({ a: "1" });',
      },
      {
        name: 'reads a select',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<select name=\'s\'><option value=\'1\'>one</option><option value=\'2\' selected>two</option></select>";\n' +
          'expect(readForm(f)).toEqual({ s: "2" });',
        hidden: true,
      },
      {
        name: 'reads a textarea',
        body:
          'const f = document.createElement("form");\n' +
          'f.innerHTML = "<textarea name=\'t\'>hello</textarea>";\n' +
          'expect(readForm(f)).toEqual({ t: "hello" });',
        hidden: true,
      },
    ],
    hints: [
      '`form.elements` gives every field, and each has `name`, `type`, `value` and (for checkables) `checked`.',
      'Decide a field\'s treatment from its `type`, and — for checkboxes — from whether another field shares its name.',
      'Count how many controls share each name in a first pass, so the second pass knows whether a checkbox is alone or part of a group.',
    ],
    solution:
      'function readForm(form) {\n' +
      '  const fields = [...form.elements].filter((el) => el.name);\n' +
      '  const nameCounts = new Map();\n' +
      '  for (const el of fields) nameCounts.set(el.name, (nameCounts.get(el.name) ?? 0) + 1);\n' +
      '\n' +
      '  const out = {};\n' +
      '  for (const el of fields) {\n' +
      '    if (el.type === "radio") {\n' +
      '      if (!Object.hasOwn(out, el.name)) out[el.name] = null;\n' +
      '      if (el.checked) out[el.name] = el.value;\n' +
      '    } else if (el.type === "checkbox") {\n' +
      '      if (nameCounts.get(el.name) > 1) {\n' +
      '        if (!Object.hasOwn(out, el.name)) out[el.name] = [];\n' +
      '        if (el.checked) out[el.name].push(el.value);\n' +
      '      } else {\n' +
      '        out[el.name] = el.checked;\n' +
      '      }\n' +
      '    } else {\n' +
      '      out[el.name] = el.value;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The counting pass is what lets a single checkbox and a checkbox group behave differently, since nothing on the element itself says which it is. Radios and checkboxes both need their key seeded before the checked test — otherwise a group with nothing selected would be missing entirely rather than reporting `null` or `[]`, and a caller could not distinguish "nothing chosen" from "field not on the form". The reason a checkbox needs special handling at all is that its `value` defaults to the string `"on"` when no `value` attribute is given, which is almost never what you want; `checked` is the meaningful property. Note that `FormData` handles much of this natively, but it omits unchecked boxes entirely and stringifies everything, which is exactly the behaviour this function exists to improve on.',
  },

  {
    id: 'ch-dom-toggle-class',
    slug: 'a-tab-switcher',
    title: 'A Tab Switcher',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['dom-manipulation', 'events', 'dom'],
    xp: XP[DIFFICULTY.MEDIUM],
    needsDom: true,
    prompt:
      'Write `setupTabs(root)` wiring up a tab strip. `root` holds buttons with `data-tab="name"` and panels with `data-panel="name"`. Clicking a button must show only its panel (hiding the others by setting `hidden`) and mark only that button with the class `active`. Set the accessible state too: the selected button gets `aria-selected="true"` and the others `"false"`. On setup, select the first tab. Return a `select(name)` function so the tab can also be changed from code.',
    examples: [
      'const select = setupTabs(root);\nselect("settings");   // shows the settings panel',
    ],
    constraints: ['Exactly one panel is visible at a time.', 'Exactly one button has the `active` class.', '`aria-selected` is kept in sync on every button.'],
    starterCode: 'function setupTabs(root) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'selects the first tab on setup',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'expect(root.querySelector("[data-panel=\'a\']").hidden).toBe(false);\n' +
          'expect(root.querySelector("[data-panel=\'b\']").hidden).toBe(true);',
      },
      {
        name: 'marks the first button active on setup',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'expect(root.querySelector("[data-tab=\'a\']").classList.contains("active")).toBe(true);\n' +
          'expect(root.querySelector("[data-tab=\'b\']").classList.contains("active")).toBe(false);',
      },
      {
        name: 'clicking a tab shows its panel',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'root.querySelector("[data-tab=\'b\']").click();\n' +
          'expect(root.querySelector("[data-panel=\'b\']").hidden).toBe(false);\n' +
          'expect(root.querySelector("[data-panel=\'a\']").hidden).toBe(true);',
      },
      {
        name: 'clicking moves the active class',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'root.querySelector("[data-tab=\'b\']").click();\n' +
          'expect(root.querySelectorAll(".active").length).toBe(1);\n' +
          'expect(root.querySelector(".active").dataset.tab).toBe("b");',
      },
      {
        name: 'keeps aria-selected in sync',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'root.querySelector("[data-tab=\'b\']").click();\n' +
          'expect(root.querySelector("[data-tab=\'b\']").getAttribute("aria-selected")).toBe("true");\n' +
          'expect(root.querySelector("[data-tab=\'a\']").getAttribute("aria-selected")).toBe("false");',
      },
      {
        name: 'the returned function selects a tab',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'const select = setupTabs(root);\n' +
          'select("b");\n' +
          'expect(root.querySelector("[data-panel=\'b\']").hidden).toBe(false);',
      },
      {
        name: 'clicking the already-active tab changes nothing',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'root.querySelector("[data-tab=\'a\']").click();\n' +
          'root.querySelector("[data-tab=\'a\']").click();\n' +
          'expect(root.querySelectorAll(".active").length).toBe(1);\n' +
          'expect(root.querySelector("[data-panel=\'a\']").hidden).toBe(false);',
      },
      {
        name: 'exactly one panel is ever visible',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><button data-tab=\'c\'>C</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div><div data-panel=\'c\'></div>";\n' +
          'setupTabs(root);\n' +
          'for (const name of ["c", "b", "a", "c"]) {\n' +
          '  root.querySelector("[data-tab=\'" + name + "\']").click();\n' +
          '  expect([...root.querySelectorAll("[data-panel]")].filter((p) => !p.hidden).length).toBe(1);\n' +
          '}',
      },
      {
        name: 'switching back and forth stays consistent',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'a\'>A</button><button data-tab=\'b\'>B</button><div data-panel=\'a\'></div><div data-panel=\'b\'></div>";\n' +
          'setupTabs(root);\n' +
          'const b = root.querySelector("[data-tab=\'b\']");\n' +
          'const a = root.querySelector("[data-tab=\'a\']");\n' +
          'b.click(); a.click(); b.click();\n' +
          'expect(root.querySelector("[data-panel=\'b\']").hidden).toBe(false);\n' +
          'expect(root.querySelectorAll(".active").length).toBe(1);',
        hidden: true,
      },
      {
        name: 'handles a single tab',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button data-tab=\'only\'>O</button><div data-panel=\'only\'></div>";\n' +
          'setupTabs(root);\n' +
          'expect(root.querySelector("[data-panel=\'only\']").hidden).toBe(false);\n' +
          'expect(root.querySelector("[data-tab=\'only\']").classList.contains("active")).toBe(true);',
        hidden: true,
      },
    ],
    hints: [
      'Write one `select(name)` function that sets the correct state on *every* button and panel, then call it from the click handlers and once at setup.',
      'Setting the state on all of them each time — rather than only toggling the two that changed — is what makes repeated clicks safe.',
      '`el.hidden = boolean` and `el.classList.toggle("active", boolean)` both take the desired state directly, so no `if` is needed.',
    ],
    solution:
      'function setupTabs(root) {\n' +
      '  const buttons = [...root.querySelectorAll("[data-tab]")];\n' +
      '  const panels = [...root.querySelectorAll("[data-panel]")];\n' +
      '\n' +
      '  function select(name) {\n' +
      '    for (const button of buttons) {\n' +
      '      const on = button.dataset.tab === name;\n' +
      '      button.classList.toggle("active", on);\n' +
      '      button.setAttribute("aria-selected", String(on));\n' +
      '    }\n' +
      '    for (const panel of panels) {\n' +
      '      panel.hidden = panel.dataset.panel !== name;\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  for (const button of buttons) {\n' +
      '    button.addEventListener("click", () => select(button.dataset.tab));\n' +
      '  }\n' +
      '\n' +
      '  if (buttons.length > 0) select(buttons[0].dataset.tab);\n' +
      '  return select;\n' +
      '}\n',
    solutionExplanation:
      'The design decision that makes this robust is that `select` sets the full state of every element rather than toggling only what changed. A toggle-based version passes the first test and then drifts: clicking the already-active tab flips it off, and the "exactly one panel visible" invariant quietly breaks. Deriving each element\'s state from a comparison against `name` means the invariant holds by construction, whatever sequence of clicks arrives. `classList.toggle(cls, force)` and `el.hidden = bool` both accept the desired state as a value, which is why there is not a single `if` in the state update. Keeping `aria-selected` in sync is not decoration — without it a screen reader announces every tab as unselected, however the visuals look.',
  },

  {
    id: 'ch-dom-scroll-spy',
    slug: 'find-the-visible-section',
    title: 'Find the Visible Section',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['dom', 'algorithms', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    needsDom: true,
    prompt:
      'A "scroll spy" highlights the table-of-contents entry for whatever section you are currently reading. The tricky part is not the scrolling — it is picking the right section. Write `activeSection(offsets, scrollTop)` taking an array of `{ id, top }` describing each section\'s distance from the top of the document, sorted ascending, and the current scroll position. Return the `id` of the last section whose `top` is at or above `scrollTop`. Before the first section starts, return the first section\'s id; with no sections at all, return `null`.',
    examples: [
      'const offsets = [{ id: "a", top: 0 }, { id: "b", top: 500 }, { id: "c", top: 1200 }];\nactiveSection(offsets, 600);   // "b"\nactiveSection(offsets, 1200);  // "c"',
    ],
    constraints: ['`offsets` is sorted by `top` ascending.', 'A section becomes active exactly when `scrollTop` reaches its `top`.', 'Pure computation — this function does not touch the DOM.'],
    starterCode: 'function activeSection(offsets, scrollTop) {\n  // Your code here\n}\n',
    tests: [
      { name: 'picks the section you are inside', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }, { id: "c", top: 1200 }]; expect(activeSection(o, 600)).toBe("b");' },
      { name: 'the boundary is inclusive', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }]; expect(activeSection(o, 500)).toBe("b");' },
      { name: 'one pixel before the boundary keeps the previous section', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }]; expect(activeSection(o, 499)).toBe("a");' },
      { name: 'picks the last section when scrolled to the bottom', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }, { id: "c", top: 1200 }]; expect(activeSection(o, 9999)).toBe("c");' },
      { name: 'picks the first section at the very top', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }]; expect(activeSection(o, 0)).toBe("a");' },
      { name: 'returns the first section above the first offset', body: 'const o = [{ id: "a", top: 100 }, { id: "b", top: 500 }]; expect(activeSection(o, 0)).toBe("a");' },
      { name: 'handles a negative scroll position', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }]; expect(activeSection(o, -50)).toBe("a");' },
      { name: 'no sections gives null', body: 'expect(activeSection([], 100)).toBe(null);' },
      { name: 'a single section is always active', body: 'const o = [{ id: "only", top: 0 }]; expect(activeSection(o, 0)).toBe("only"); expect(activeSection(o, 5000)).toBe("only");' },
      { name: 'handles adjacent sections at the same offset', body: 'const o = [{ id: "a", top: 0 }, { id: "b", top: 500 }, { id: "c", top: 500 }]; expect(activeSection(o, 500)).toBe("c");', hidden: true },
      { name: 'stays fast on many sections', body: 'const o = Array.from({ length: 5000 }, (_, i) => ({ id: "s" + i, top: i * 100 })); expect(activeSection(o, 250000)).toBe("s2500");', hidden: true },
    ],
    hints: [
      'Walk the sections and remember the last one whose `top` is at or below `scrollTop` — that is the one you are inside.',
      'Because the array is sorted, you can also stop at the first section that starts *below* the scroll position.',
      'Handle the two edges deliberately: an empty array, and a scroll position above every section.',
    ],
    solution:
      'function activeSection(offsets, scrollTop) {\n' +
      '  if (offsets.length === 0) return null;\n' +
      '  let active = offsets[0].id;\n' +
      '  for (const section of offsets) {\n' +
      '    if (section.top > scrollTop) break;\n' +
      '    active = section.id;\n' +
      '  }\n' +
      '  return active;\n' +
      '}\n',
    solutionExplanation:
      'Seeding `active` with the first section handles the "scrolled above everything" case without a separate branch — if the loop breaks immediately, the first section is already the answer. The comparison is `>` rather than `>=`, which is what makes the boundary inclusive: at exactly `top`, the section is considered active, matching the intuition that reaching a heading means you are reading it. Breaking out early relies on the sorted precondition and keeps the common case cheap. Note the deliberate separation of concerns: this function takes numbers and returns an id, touching nothing in the document, which is why it can be tested exhaustively without simulating a scroll at all.',
  },

  {
    id: 'ch-dom-observer-cleanup',
    slug: 'observing-with-cleanup',
    title: 'Observing with Cleanup',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['dom', 'web-apis', 'events'],
    xp: XP[DIFFICULTY.HARD],
    needsDom: true,
    prompt:
      'Write `watchText(element, onChange)` calling `onChange(newText)` whenever the element\'s text content changes because of a DOM mutation, and returning a `stop()` function that disconnects the observer. `stop()` must be safe to call more than once, and no callback may fire after it. Do not call `onChange` for a mutation that leaves the text identical to what it was — a re-render that changes nothing should be silent.',
    examples: [
      'const stop = watchText(node, (text) => render(text));\nnode.textContent = "new";  // onChange("new") fires\nstop();\nnode.textContent = "later"; // nothing fires',
    ],
    constraints: ['Use `MutationObserver` with `characterData`, `childList` and `subtree`.', 'No callback fires after `stop()`.', 'Identical text does not trigger a callback.'],
    starterCode: 'function watchText(element, onChange) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'fires when the text changes',
        body:
          'const el = document.createElement("div");\n' +
          'el.textContent = "a";\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.textContent = "b";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual(["b"]);',
      },
      {
        name: 'reports the new text',
        body:
          'const el = document.createElement("div");\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.textContent = "hello";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen[seen.length - 1]).toBe("hello");',
      },
      {
        name: 'does not fire for identical text',
        body:
          'const el = document.createElement("div");\n' +
          'el.textContent = "same";\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.textContent = "same";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual([]);',
      },
      {
        name: 'does not fire before anything changes',
        body:
          'const el = document.createElement("div");\n' +
          'el.textContent = "a";\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual([]);',
      },
      {
        name: 'stop prevents further callbacks',
        body:
          'const el = document.createElement("div");\n' +
          'const seen = [];\n' +
          'const stop = watchText(el, (t) => seen.push(t));\n' +
          'stop();\n' +
          'el.textContent = "after";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual([]);',
      },
      {
        name: 'stop is safe to call twice',
        body:
          'const el = document.createElement("div");\n' +
          'const stop = watchText(el, () => {});\n' +
          'stop();\n' +
          'expect(() => stop()).not.toThrow();',
      },
      {
        name: 'observes nested changes',
        body:
          'const el = document.createElement("div");\n' +
          'el.innerHTML = "<span>a</span>";\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.querySelector("span").textContent = "b";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual(["b"]);',
      },
      {
        name: 'observes an appended child',
        body:
          'const el = document.createElement("div");\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.appendChild(document.createTextNode("added"));\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual(["added"]);',
      },
      {
        name: 'two watchers on separate elements do not interfere',
        body:
          'const a = document.createElement("div");\n' +
          'const b = document.createElement("div");\n' +
          'const seenA = [];\n' +
          'const seenB = [];\n' +
          'watchText(a, (t) => seenA.push(t));\n' +
          'watchText(b, (t) => seenB.push(t));\n' +
          'a.textContent = "only a";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seenA).toEqual(["only a"]);\n' +
          'expect(seenB).toEqual([]);',
      },
      {
        name: 'reports each distinct change once',
        body:
          'const el = document.createElement("div");\n' +
          'const seen = [];\n' +
          'watchText(el, (t) => seen.push(t));\n' +
          'el.textContent = "one";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'el.textContent = "two";\n' +
          'await new Promise((r) => setTimeout(r, 10));\n' +
          'expect(seen).toEqual(["one", "two"]);',
        hidden: true,
      },
      {
        name: 'returns a function',
        body:
          'const el = document.createElement("div");\n' +
          'expect(typeof watchText(el, () => {})).toBe("function");',
        hidden: true,
      },
    ],
    hints: [
      '`new MutationObserver(callback)` then `observer.observe(element, options)`. The options decide what counts as a change.',
      'Text can change either by editing a text node (`characterData`) or by adding and removing nodes (`childList`), and either can happen deep inside — so `subtree: true` is needed as well.',
      'Keep the last reported text in a closure variable and compare before calling back. Note that a MutationObserver may deliver several mutation records for one change, so the comparison also collapses those into one callback.',
    ],
    solution:
      'function watchText(element, onChange) {\n' +
      '  let last = element.textContent;\n' +
      '  let stopped = false;\n' +
      '\n' +
      '  const observer = new MutationObserver(() => {\n' +
      '    if (stopped) return;\n' +
      '    const text = element.textContent;\n' +
      '    if (text === last) return;\n' +
      '    last = text;\n' +
      '    onChange(text);\n' +
      '  });\n' +
      '\n' +
      '  observer.observe(element, { characterData: true, childList: true, subtree: true });\n' +
      '\n' +
      '  return function stop() {\n' +
      '    if (stopped) return;\n' +
      '    stopped = true;\n' +
      '    observer.disconnect();\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'Three observer options are needed because "the text changed" has three underlying causes: editing an existing text node is `characterData`, adding or removing nodes is `childList`, and either can happen at any depth, which is what `subtree` covers. Omit `subtree` and the nested-span test fails silently. The `last` comparison serves two purposes — it satisfies the "identical text is silent" rule, and it collapses the several mutation records a single change can produce into one callback. The `stopped` flag alongside `disconnect()` is belt and braces worth having: records already queued before `disconnect` can still reach the callback, so the flag is what actually guarantees no callback after `stop()`. Returning a cleanup function rather than exposing the observer is the pattern that makes this composable with any component lifecycle.',
  },

  {
    id: 'ch-dom-virtual-diff',
    slug: 'update-a-list-in-place',
    title: 'Update a List in Place',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['dom-manipulation', 'dom', 'performance'],
    xp: XP[DIFFICULTY.HARD],
    needsDom: true,
    prompt:
      'Re-rendering a list by clearing and rebuilding it destroys focus, scroll position and any state living on the existing nodes. Write `syncList(container, items, createNode)` where each item is `{ id, label }`. Reuse the existing child element for any id already present — updating its `textContent` only if the label changed — create nodes only for new ids, remove nodes whose ids are gone, and end with the children in the same order as `items`. Each node carries its id in `dataset.id`.',
    examples: [
      'syncList(ul, [{ id: "a", label: "A" }], make);\nconst node = ul.firstChild;\nsyncList(ul, [{ id: "a", label: "A2" }], make);\nul.firstChild === node;  // true — reused, not rebuilt',
    ],
    constraints: ['A node for an id that survives must be the same element object afterwards.', 'Children end in item order.', '`createNode(item)` returns a fresh element with `dataset.id` already set.'],
    starterCode: 'function syncList(container, items, createNode) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'creates nodes for a first render',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'expect([...ul.children].map((n) => n.textContent)).toEqual(["A", "B"]);',
      },
      {
        name: 'reuses the node for an unchanged id',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'const node = ul.firstChild;\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'expect(ul.firstChild).toBe(node);',
      },
      {
        name: 'reuses the node when only the label changed',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'const node = ul.firstChild;\n' +
          'syncList(ul, [{ id: "a", label: "A2" }], make);\n' +
          'expect(ul.firstChild).toBe(node);\n' +
          'expect(node.textContent).toBe("A2");',
      },
      {
        name: 'removes nodes for departed ids',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'syncList(ul, [{ id: "b", label: "B" }], make);\n' +
          'expect([...ul.children].map((n) => n.dataset.id)).toEqual(["b"]);',
      },
      {
        name: 'adds nodes for new ids',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'expect(ul.children.length).toBe(2);',
      },
      {
        name: 'reorders without recreating',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'const nodeA = ul.querySelector("[data-id=\'a\']");\n' +
          'syncList(ul, [{ id: "b", label: "B" }, { id: "a", label: "A" }], make);\n' +
          'expect([...ul.children].map((n) => n.dataset.id)).toEqual(["b", "a"]);\n' +
          'expect(ul.querySelector("[data-id=\'a\']")).toBe(nodeA);',
      },
      {
        name: 'only creates nodes that are genuinely new',
        body:
          'const ul = document.createElement("ul");\n' +
          'let created = 0;\n' +
          'const make = (item) => { created += 1; const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }], make);\n' +
          'expect(created).toBe(3);',
      },
      {
        name: 'an empty list clears the container',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'syncList(ul, [], make);\n' +
          'expect(ul.children.length).toBe(0);',
      },
      {
        name: 'preserves state living on a reused node',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }], make);\n' +
          'ul.firstChild.dataset.custom = "kept";\n' +
          'syncList(ul, [{ id: "a", label: "A2" }], make);\n' +
          'expect(ul.firstChild.dataset.custom).toBe("kept");',
      },
      {
        name: 'handles a full replacement',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'syncList(ul, [{ id: "a", label: "A" }, { id: "b", label: "B" }], make);\n' +
          'syncList(ul, [{ id: "x", label: "X" }, { id: "y", label: "Y" }], make);\n' +
          'expect([...ul.children].map((n) => n.dataset.id)).toEqual(["x", "y"]);',
        hidden: true,
      },
      {
        name: 'handles a longer list with insertions in the middle',
        body:
          'const ul = document.createElement("ul");\n' +
          'const make = (item) => { const li = document.createElement("li"); li.dataset.id = item.id; li.textContent = item.label; return li; };\n' +
          'const first = Array.from({ length: 10 }, (_, i) => ({ id: "i" + i, label: String(i) }));\n' +
          'syncList(ul, first, make);\n' +
          'const kept = ul.querySelector("[data-id=\'i5\']");\n' +
          'const second = [...first.slice(0, 5), { id: "new", label: "N" }, ...first.slice(5)];\n' +
          'syncList(ul, second, make);\n' +
          'expect(ul.children.length).toBe(11);\n' +
          'expect(ul.querySelector("[data-id=\'i5\']")).toBe(kept);\n' +
          'expect([...ul.children].map((n) => n.dataset.id)[5]).toBe("new");',
        hidden: true,
      },
    ],
    hints: [
      'Index the existing children by their `dataset.id` in a `Map` first, so looking one up is not a repeated scan.',
      'Walk `items` in order, taking the existing node or creating one, and append each to the container in turn. Appending a node that is already in the document *moves* it rather than copying it — that is what makes reordering free.',
      'After the walk, anything still in your index that was not used is a departed node to remove.',
    ],
    solution:
      'function syncList(container, items, createNode) {\n' +
      '  const existing = new Map();\n' +
      '  for (const child of container.children) existing.set(child.dataset.id, child);\n' +
      '\n' +
      '  const used = new Set();\n' +
      '  for (const item of items) {\n' +
      '    let node = existing.get(item.id);\n' +
      '    if (node) {\n' +
      '      if (node.textContent !== item.label) node.textContent = item.label;\n' +
      '    } else {\n' +
      '      node = createNode(item);\n' +
      '    }\n' +
      '    used.add(item.id);\n' +
      '    container.appendChild(node);\n' +
      '  }\n' +
      '\n' +
      '  for (const [id, node] of existing) {\n' +
      '    if (!used.has(id)) node.remove();\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The key idea is that `appendChild` on a node already in the tree *moves* it rather than cloning it, so walking the items in order and appending each one leaves the container in exactly the right order — reordering costs nothing extra and never recreates a node. Keying by `dataset.id` is what makes reuse possible at all; matching by position instead is the classic bug that makes a list look right while the wrong row keeps the focus. Guarding the `textContent` write behind a comparison avoids touching the DOM when nothing changed, which matters because assigning `textContent` replaces the text node even when the string is identical. Snapshotting `container.children` into a `Map` before mutating is essential: `children` is a live collection, and iterating it while appending would shift under you.',
  },

  {
    id: 'ch-dom-keyboard-nav',
    slug: 'keyboard-navigable-menu',
    title: 'Keyboard-Navigable Menu',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['events', 'dom', 'forms'],
    xp: XP[DIFFICULTY.MEDIUM],
    needsDom: true,
    prompt:
      'A menu that only works with a mouse is unusable for a large number of people. Write `setupMenu(root)` giving a list of `[role="menuitem"]` elements arrow-key navigation. `ArrowDown` moves to the next item and `ArrowUp` to the previous, both wrapping around the ends. `Home` and `End` jump to the first and last. The focused item is the only one with `tabindex="0"`; every other item has `tabindex="-1"`, so the whole menu is a single tab stop. Handled keys must have their default prevented; other keys must not.',
    examples: [
      'setupMenu(menu);\n// ArrowDown from the last item wraps to the first',
    ],
    constraints: ['Exactly one item has `tabindex="0"` at any time.', 'Arrow navigation wraps at both ends.', 'Only handled keys call `preventDefault`.'],
    starterCode: 'function setupMenu(root) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'gives the first item tabindex zero on setup',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button>";\n' +
          'setupMenu(root);\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items.map((i) => i.getAttribute("tabindex"))).toEqual(["0", "-1"]);',
      },
      {
        name: 'ArrowDown moves to the next item',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items.map((i) => i.getAttribute("tabindex"))).toEqual(["-1", "0"]);',
      },
      {
        name: 'ArrowDown wraps from the last to the first',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items.map((i) => i.getAttribute("tabindex"))).toEqual(["0", "-1"]);',
      },
      {
        name: 'ArrowUp wraps from the first to the last',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button><button role=\'menuitem\'>c</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items.map((i) => i.getAttribute("tabindex"))).toEqual(["-1", "-1", "0"]);',
      },
      {
        name: 'End jumps to the last item',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button><button role=\'menuitem\'>c</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items[2].getAttribute("tabindex")).toBe("0");',
      },
      {
        name: 'Home jumps to the first item',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button><button role=\'menuitem\'>c</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));\n' +
          'const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
          'expect(items[0].getAttribute("tabindex")).toBe("0");',
      },
      {
        name: 'exactly one item is ever tabbable',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button><button role=\'menuitem\'>b</button><button role=\'menuitem\'>c</button>";\n' +
          'setupMenu(root);\n' +
          'for (const key of ["ArrowDown", "ArrowDown", "ArrowUp", "End", "Home", "ArrowUp"]) {\n' +
          '  root.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));\n' +
          '  expect(root.querySelectorAll("[tabindex=\'0\']").length).toBe(1);\n' +
          '}',
      },
      {
        name: 'prevents the default for a handled key',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button>";\n' +
          'setupMenu(root);\n' +
          'const e = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });\n' +
          'root.dispatchEvent(e);\n' +
          'expect(e.defaultPrevented).toBe(true);',
      },
      {
        name: 'leaves an unhandled key alone',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>a</button>";\n' +
          'setupMenu(root);\n' +
          'const e = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });\n' +
          'root.dispatchEvent(e);\n' +
          'expect(e.defaultPrevented).toBe(false);',
      },
      {
        name: 'a single item wraps to itself',
        body:
          'const root = document.createElement("div");\n' +
          'root.innerHTML = "<button role=\'menuitem\'>only</button>";\n' +
          'setupMenu(root);\n' +
          'root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));\n' +
          'expect(root.querySelector("[role=\'menuitem\']").getAttribute("tabindex")).toBe("0");',
        hidden: true,
      },
      {
        name: 'an empty menu does not throw',
        body:
          'const root = document.createElement("div");\n' +
          'expect(() => setupMenu(root)).not.toThrow();\n' +
          'expect(() => root.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }))).not.toThrow();',
        hidden: true,
      },
    ],
    hints: [
      'Track the active index in a closure variable and write one function that applies the tabindex state to every item from it.',
      'Wrapping is modular arithmetic. Remember that `-1 % n` is `-1` in JavaScript, so add `n` before taking the remainder again.',
      'Decide the new index in a `switch` or lookup, and call `preventDefault` only in the branches that actually handled the key.',
    ],
    solution:
      'function setupMenu(root) {\n' +
      '  const items = [...root.querySelectorAll("[role=\'menuitem\']")];\n' +
      '  if (items.length === 0) return;\n' +
      '  let active = 0;\n' +
      '\n' +
      '  function apply() {\n' +
      '    items.forEach((item, i) => {\n' +
      '      item.setAttribute("tabindex", i === active ? "0" : "-1");\n' +
      '    });\n' +
      '    items[active].focus();\n' +
      '  }\n' +
      '\n' +
      '  root.addEventListener("keydown", (event) => {\n' +
      '    const n = items.length;\n' +
      '    let next = active;\n' +
      '    if (event.key === "ArrowDown") next = (active + 1) % n;\n' +
      '    else if (event.key === "ArrowUp") next = (active - 1 + n) % n;\n' +
      '    else if (event.key === "Home") next = 0;\n' +
      '    else if (event.key === "End") next = n - 1;\n' +
      '    else return;\n' +
      '\n' +
      '    event.preventDefault();\n' +
      '    active = next;\n' +
      '    apply();\n' +
      '  });\n' +
      '\n' +
      '  items.forEach((item, i) => {\n' +
      '    item.setAttribute("tabindex", i === 0 ? "0" : "-1");\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'The single-tab-stop pattern — one item at `tabindex="0"` and the rest at `-1` — is what makes a composite control behave correctly for keyboard users: Tab moves past the whole menu rather than through every item, and the arrow keys move within it. Applying the attribute to every item on each change, rather than toggling two of them, keeps the "exactly one tabbable" invariant true by construction under any sequence of keys. The early `return` for unhandled keys is what keeps `preventDefault` from swallowing ordinary typing — a menu that blocks every keystroke breaks type-ahead and browser shortcuts. `(active - 1 + n) % n` is the standard fix for JavaScript\'s remainder keeping the sign of its left operand: without the `+ n`, ArrowUp from the first item would compute `-1` and index off the end.',
  },
];

export default challenges;
