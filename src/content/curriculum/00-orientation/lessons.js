import { SECTION, CALLOUT_TONE, DIFFICULTY, EXERCISE_KIND, QUIZ_KIND } from '../../schema/types.js';

const M = 'm00';

export default [
  /* ================================================================== */
  {
    id: 'l-m00-01',
    slug: 'what-is-programming',
    moduleId: M,
    order: 1,
    title: 'What Programming Actually Is',
    description: 'Before any syntax: what a program is, what a computer does with it, and why precision matters more than cleverness.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 10,
    xp: 20,
    topicIds: ['orientation'],
    prerequisites: [],
    learningObjectives: [
      'Explain what a computer program is in plain language',
      'Describe how a computer executes instructions one at a time',
      'Recognise why computers require complete, unambiguous instructions',
      'Identify the three things almost every program does',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'A program is a list of instructions that a computer follows. That is the whole idea. Everything else you will learn — variables, functions, objects, promises — exists to make writing that list practical for problems bigger than a few lines.',
          'The important thing to understand up front is that a computer does not interpret your intent. It does exactly what you wrote, in the order you wrote it, with no judgement about whether that was sensible. A human reading "add the numbers and show the total" fills in dozens of unstated details. A computer fills in none of them.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Instructions run in order',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'When a program runs, the computer starts at the top and works downward, completing one instruction before starting the next. This sounds obvious, but it is the single most useful mental model you have when code misbehaves: at any moment, exactly one line is running, and every line above it has already finished.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Three instructions, executed top to bottom.',
        code: [
          'let total = 10;',
          'total = total + 5;',
          'console.log(total);',
        ].join('\n'),
        output: '15',
        runnable: true,
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Read that as three separate moments in time. First `total` holds 10. Then it holds 15. Then the current value is displayed. Swap lines two and three and the output becomes 10 — not because the computer misunderstood, but because you asked for the value before changing it.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Computers need complete instructions',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Consider asking a person to "sort these names alphabetically". They will handle capital letters, accented characters, and names starting with the same letter without being told. A computer needs each of those decisions specified, because it has no default sense of what you meant.',
          'This is why beginners often feel that programming is unfairly pedantic. It is pedantic — but that pedantry is also what makes programs reliable. A program that works today works identically tomorrow, because nothing about it was left to interpretation.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'The most useful debugging habit you can build now',
        body: [
          'When code does not do what you expected, resist the urge to change things randomly. Instead ask: "what did I actually tell the computer to do, line by line?" Almost every bug is the gap between what you meant and what you wrote. Reading your own code literally, as the machine does, closes that gap faster than any other technique.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'What almost every program does',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Across wildly different applications — a spreadsheet, a game, a banking site — programs tend to do the same three things in a loop.',
        ],
      },
      {
        kind: SECTION.STEPS,
        steps: [
          {
            title: 'Take in data',
            body: 'Something arrives: a keystroke, a click, a file, a response from a server, the current time.',
          },
          {
            title: 'Process it',
            body: 'The program makes decisions, does calculations, filters, sorts, combines, and transforms that data into something more useful.',
          },
          {
            title: 'Produce output',
            body: 'The result is shown on screen, saved to storage, or sent somewhere else.',
          },
        ],
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Keep this shape in mind. When you later build a to-do list, you will be taking in what the user typed, processing it into a list item, and producing HTML on screen. When you build a weather app, you will be taking in a city name, processing a response from a weather service, and producing a forecast. The vocabulary changes; the shape does not.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Programming is a skill, not a talent',
        body: [
          'Nobody reads a chapter about loops and then writes loops fluently. Fluency comes from writing code, getting it wrong, reading the error, and fixing it — many times. JSPath is built around that loop deliberately: every concept is followed by something you have to actually type.',
          'If a concept feels slippery on first reading, that is the normal experience, not a sign that you are unsuited to this.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-01-a',
        title: 'Predict the order of execution',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['orientation'],
        instructions: 'Instructions run top to bottom, one at a time. What does this program display?',
        code: ['let score = 3;', 'console.log(score);', 'score = score + 7;'].join('\n'),
        options: ['3', '10', '7', 'Nothing is displayed'],
        correct: 0,
        hints: [
          'Find the line that displays something, then look only at what happened above it.',
        ],
        solution: '3',
        solutionExplanation:
          'The display instruction runs before the addition. At that moment `score` still holds 3. The last line does change `score` to 10, but nothing displays it afterwards, so 10 is never seen. Order is everything.',
      },
      {
        id: 'ex-m00-01-b',
        title: 'Spot the missing instruction',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['orientation'],
        instructions:
          'A colleague says: "I told the program to calculate the total, but nothing appeared on screen." Which of the three stages of a program is most likely missing?',
        options: [
          'Taking in data — the program never received input',
          'Processing — the calculation never ran',
          'Producing output — the result was calculated but never displayed',
          'The computer misunderstood the intent',
        ],
        correct: 2,
        hints: [
          'They said the calculation happened. What comes after processing?',
        ],
        solution: 'Producing output — the result was calculated but never displayed',
        solutionExplanation:
          'Calculating a value and displaying a value are two separate instructions. This is one of the most common early confusions: the program did its job correctly, but was never told to show the result. A computer never displays anything you did not explicitly ask it to display.',
      },
    ],
    quiz: {
      id: 'qz-m00-01',
      questions: [
        {
          id: 'q-m00-01-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['orientation'],
          prompt: 'What is a computer program?',
          options: [
            'A list of instructions the computer follows in order',
            'A description of what the user wants to achieve',
            'A file that the computer interprets creatively',
            'A set of rules the computer optimises on your behalf',
          ],
          correct: 0,
          optionExplanations: [
            'Correct — and the "in order" part matters as much as the "instructions" part.',
            'A description of intent is a specification, not a program. The computer cannot run intent.',
            'Computers do not interpret creatively. They execute literally, which is what makes programs repeatable.',
            'Engines do optimise internally, but never by changing what your instructions mean.',
          ],
          explanation:
            'A program is an ordered list of instructions. The computer executes them literally and sequentially, filling in nothing that you left unstated.',
        },
        {
          id: 'q-m00-01-2',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['orientation'],
          prompt: 'If a program calculates a value correctly, that value will appear on screen.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'Calculating and displaying are separate instructions — one does not imply the other.',
            'Correct. You must explicitly instruct the program to produce output.',
          ],
          explanation:
            'Processing and output are distinct stages. A value can be computed perfectly and never displayed, because nothing instructed the program to display it.',
        },
      ],
    },
    summary:
      'A program is an ordered list of instructions that a computer executes literally, one at a time, from top to bottom. It fills in nothing you leave unstated, which is why precision matters. Almost every program takes in data, processes it, and produces output — a shape you will recognise in everything you build from here.',
    keyTakeaways: [
      'A program is an ordered list of instructions; order changes behaviour',
      'Computers execute literally and never infer your intent',
      'Most programs follow the shape: input → processing → output',
      'Calculating a value and displaying it are two separate instructions',
    ],
    relatedLessons: ['l-m00-02'],
  },

  /* ================================================================== */
  {
    id: 'l-m00-02',
    slug: 'what-is-javascript',
    moduleId: M,
    order: 2,
    title: 'What JavaScript Is (and Where It Runs)',
    description: 'JavaScript the language, the engines that run it, and the crucial distinction between the language and its host environment.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 14,
    xp: 25,
    topicIds: ['js-runtime', 'orientation'],
    prerequisites: ['l-m00-01'],
    learningObjectives: [
      'Describe what JavaScript is and the role it plays on the web',
      'Explain what a JavaScript engine does',
      'Distinguish the JavaScript language from browser-provided APIs',
      'Explain why the same JavaScript behaves differently in Node.js and the browser',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'JavaScript is a programming language created in 1995 for one narrow purpose: making web pages react to the user. It has since grown into one of the most widely deployed languages in the world, running in every browser, on servers, in mobile apps, and on embedded devices.',
          'It matters for your career for a very practical reason: JavaScript is the only programming language that runs natively in a web browser. If you want to build something interactive on the web, you are going to write JavaScript, or a language that compiles to it.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The engine',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'JavaScript source code is just text. Something has to read that text and actually do what it says. That something is a **JavaScript engine** — a program, written in C++, that parses your code and executes it.',
          'You already have several installed. Chrome and Edge use an engine called V8. Firefox uses SpiderMonkey. Safari uses JavaScriptCore. Node.js — which lets you run JavaScript outside a browser — embeds the same V8 engine that Chrome uses.',
        ],
      },
      {
        kind: SECTION.TABLE,
        headers: ['Environment', 'Engine', 'Typical use'],
        rows: [
          ['Chrome / Edge', 'V8', 'Web pages'],
          ['Firefox', 'SpiderMonkey', 'Web pages'],
          ['Safari', 'JavaScriptCore', 'Web pages'],
          ['Node.js', 'V8', 'Servers, build tools, scripts'],
          ['Deno / Bun', 'V8 / JavaScriptCore', 'Modern server runtimes'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INTERVIEW,
        title: 'Interview relevance',
        body: [
          '"What is a JavaScript engine?" is a common warm-up question. A strong 30-second answer: "An engine is the program that parses and executes JavaScript source. V8 in Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari. Modern engines compile hot code to machine code just-in-time rather than purely interpreting it."',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The language versus the environment',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'This is the single most important distinction in this lesson, and it is one that many self-taught developers never make explicitly. It will save you real confusion later.',
          'The **JavaScript language** — defined by a specification called ECMAScript — gives you things like variables, functions, objects, arrays, `Math`, `JSON`, and Promises. These exist everywhere JavaScript runs.',
          'The **host environment** adds extra capabilities on top. A browser hands you `document`, `alert`, `fetch`, `localStorage` and `window`. Node.js hands you a filesystem module, a process object, and networking. Neither set is part of the JavaScript language itself.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'JavaScript language (works everywhere)',
          code: [
            'const names = ["Ada", "Grace"];',
            'const upper = names.map((n) => n.toUpperCase());',
            'const total = Math.max(3, 9);',
            'JSON.stringify({ ok: true });',
          ].join('\n'),
        },
        right: {
          title: 'Browser environment (browser only)',
          code: [
            'document.querySelector("h1");',
            'localStorage.setItem("k", "v");',
            'fetch("/api/users");',
            'window.innerWidth;',
          ].join('\n'),
        },
        note: 'The left column runs identically in Node.js. The right column throws a ReferenceError there, because Node has no document, no localStorage and no window.',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'So when you read that "JavaScript can manipulate the page", that is loose phrasing. The browser can manipulate the page, and it exposes that ability to JavaScript through the DOM API. Move the same code to Node.js and the ability vanishes — the language is unchanged, the environment is not.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'Common mistake',
        body: [
          'Assuming `document` or `window` exists in every JavaScript context. Code that touches `window` will crash during server-side rendering or in a Node script. When you write reusable logic, keep it free of browser APIs so it can run and be tested anywhere — that separation is also what makes code easy to unit test.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'JavaScript is not Java',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'The name was a marketing decision made in 1995 when Java was popular. The two languages are unrelated in design, syntax and use. Mentioning this is worthwhile only because the naming still confuses newcomers and occasionally search results.',
        ],
      },
      {
        kind: SECTION.TERMS,
        terms: [
          { term: 'ECMAScript', definition: 'The formal specification that defines the JavaScript language. Versions are named by year, e.g. ES2015 (also called ES6), ES2020.' },
          { term: 'Engine', definition: 'The program that parses and executes JavaScript source code, such as V8 or SpiderMonkey.' },
          { term: 'Runtime / host environment', definition: 'The engine plus the extra APIs a platform provides — the browser adds the DOM and fetch; Node.js adds filesystem and process access.' },
          { term: 'API', definition: 'Application Programming Interface — a set of functions and objects one piece of software exposes for another to use.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-02-a',
        title: 'Language or environment?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['js-runtime'],
        instructions:
          'Which of these is part of the JavaScript language itself, and would therefore work unchanged in Node.js?',
        options: [
          'document.querySelector("p")',
          'localStorage.getItem("token")',
          'Math.round(4.7)',
          'window.alert("Hi")',
        ],
        correct: 2,
        hints: [
          'Three of these are capabilities a browser lends to JavaScript. One is built into the language.',
        ],
        solution: 'Math.round(4.7)',
        solutionExplanation:
          '`Math` is defined by the ECMAScript specification, so it exists in every JavaScript environment. `document`, `localStorage` and `window` are supplied by browsers only — running any of them in Node.js throws a ReferenceError.',
      },
      {
        id: 'ex-m00-02-b',
        title: 'Explain the engine',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['js-runtime'],
        instructions: 'Node.js and Chrome both run JavaScript using the V8 engine. Why does `document.title` work in Chrome but throw an error in Node.js?',
        options: [
          'Node.js uses a restricted version of V8 that removes features',
          'V8 executes the language; `document` is supplied by the browser, and Node.js does not supply it',
          '`document` requires an internet connection, which Node.js lacks',
          'Node.js runs an older version of JavaScript',
        ],
        correct: 1,
        hints: [
          'The engine is the same in both. What differs is everything wrapped around it.',
        ],
        solution: 'V8 executes the language; `document` is supplied by the browser, and Node.js does not supply it',
        solutionExplanation:
          'The engine and the host environment are separate layers. V8 provides the language — syntax, objects, `Math`, Promises. The browser wraps V8 and injects the DOM, `fetch` and `localStorage`. Node.js wraps the very same V8 and injects filesystem and networking modules instead. Same engine, different surroundings.',
      },
    ],
    quiz: {
      id: 'qz-m00-02',
      questions: [
        {
          id: 'q-m00-02-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['js-runtime'],
          prompt: 'Which statement is most accurate?',
          options: [
            'The DOM is a core feature of the JavaScript language',
            'The DOM is an API provided by browsers to JavaScript',
            'The DOM is part of the V8 engine',
            'The DOM is defined by the ECMAScript specification',
          ],
          correct: 1,
          optionExplanations: [
            'The language specification never mentions HTML documents.',
            'Correct — the DOM is a browser API, standardised separately by WHATWG.',
            'V8 executes the language; browsers layer the DOM on top of it.',
            'ECMAScript defines the language. The DOM lives in a different standard entirely.',
          ],
          explanation:
            'The DOM is a browser-provided API, not part of the JavaScript language. This is why DOM code fails in Node.js even though Node runs the same V8 engine as Chrome.',
        },
        {
          id: 'q-m00-02-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['js-runtime'],
          prompt: 'What does a JavaScript engine do?',
          options: [
            'It styles the web page',
            'It parses and executes JavaScript source code',
            'It downloads JavaScript files from the server',
            'It converts JavaScript into Java',
          ],
          correct: 1,
          optionExplanations: [
            'Styling is the rendering engine’s job, which is a different component.',
            'Correct — parsing and execution, including just-in-time compilation of hot code.',
            'Fetching resources is handled by the browser’s networking layer.',
            'JavaScript and Java are unrelated languages despite the name.',
          ],
          explanation:
            'An engine reads JavaScript source and executes it, compiling frequently-run code to machine code for speed. Examples: V8, SpiderMonkey, JavaScriptCore.',
        },
        {
          id: 'q-m00-02-3',
          kind: QUIZ_KIND.MULTIPLE,
          topicIds: ['js-runtime'],
          prompt: 'Which of these are part of the JavaScript language rather than a host environment? (Select all that apply.)',
          options: ['JSON', 'fetch', 'Promise', 'localStorage'],
          correct: [0, 2],
          explanation:
            '`JSON` and `Promise` are specified by ECMAScript and exist in every JavaScript environment. `fetch` and `localStorage` are web platform APIs supplied by browsers — Node.js only gained a `fetch` implementation later, as a deliberate addition to its own environment.',
        },
      ],
    },
    summary:
      'JavaScript is a language defined by the ECMAScript specification and executed by an engine such as V8. The engine provides the language; the host environment provides everything else. Browsers add the DOM, fetch and localStorage; Node.js adds filesystem and process access. Keeping this boundary clear explains why identical code behaves differently in different places, and it is the foundation of writing portable, testable JavaScript.',
    keyTakeaways: [
      'JavaScript is the only language that runs natively in browsers',
      'An engine (V8, SpiderMonkey, JavaScriptCore) parses and executes your code',
      'ECMAScript defines the language; the host environment adds APIs',
      'document, window, fetch and localStorage are browser APIs, not JavaScript',
    ],
    relatedLessons: ['l-m00-01', 'l-m00-03'],
    interviewConnections: ['What is a JavaScript engine?', 'Is the DOM part of JavaScript?'],
  },

  /* ================================================================== */
  {
    id: 'l-m00-03',
    slug: 'running-javascript',
    moduleId: M,
    order: 3,
    title: 'Running JavaScript: Console, Script Tags and Files',
    description: 'The three ways you will actually run JavaScript, and when each one is the right tool.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 12,
    xp: 25,
    topicIds: ['devtools', 'js-runtime'],
    prerequisites: ['l-m00-02'],
    learningObjectives: [
      'Open the browser console and execute JavaScript in it',
      'Attach JavaScript to a web page with inline and external script tags',
      'Explain why external files and `defer` are the professional default',
      'Choose the right way to run code for a given task',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'You have three practical ways to run JavaScript, and you will use all three regularly. Knowing which to reach for is a small skill that saves a surprising amount of time.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: '1. The browser console',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Every browser ships with developer tools, and the console inside them is a live JavaScript prompt attached to the current page. Open it with **F12**, or **Ctrl+Shift+J** on Windows and Linux, or **Cmd+Option+J** on macOS.',
          'Type an expression, press Enter, and it runs immediately. This is where you experiment, inspect values, and poke at a page that is misbehaving. It is the fastest feedback loop available to you.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Typed straight into the console.',
        code: [
          '2 + 2',
          '// → 4',
          '',
          '"hello".toUpperCase()',
          '// → "HELLO"',
          '',
          'console.log("Programs can talk back");',
          '// → Programs can talk back',
        ].join('\n'),
        runnable: true,
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'The console shows two different things',
        body: [
          'When you type an expression, the console prints its **return value** automatically. When you call `console.log(...)`, you are explicitly printing something. Inside a real script, only `console.log` produces output — nothing is echoed for you. This trips people up when code that "worked in the console" appears to do nothing in a file.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: '2. A script tag inside HTML',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'To attach behaviour to a page, you write JavaScript inside a `<script>` element. It runs as the browser parses the document.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'html',
        caption: 'Inline script — fine for a quick demonstration.',
        code: [
          '<!doctype html>',
          '<html>',
          '  <body>',
          '    <h1 id="greeting">Hello</h1>',
          '',
          '    <script>',
          '      const heading = document.getElementById("greeting");',
          '      heading.textContent = "Changed by JavaScript";',
          '    </script>',
          '  </body>',
          '</html>',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Notice the script sits **after** the `<h1>`. That matters. Scripts run the moment the browser reaches them, so a script placed in the `<head>` would run before the heading exists, and `getElementById` would return `null`.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: '3. An external JavaScript file',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'For anything beyond a demonstration, put your JavaScript in its own `.js` file and link to it. This keeps structure (HTML), presentation (CSS) and behaviour (JavaScript) separate, lets the browser cache the file, and makes the code reusable across pages.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'html',
        caption: 'The professional default.',
        code: [
          '<!doctype html>',
          '<html>',
          '  <head>',
          '    <script src="app.js" defer></script>',
          '  </head>',
          '  <body>',
          '    <h1 id="greeting">Hello</h1>',
          '  </body>',
          '</html>',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'The `defer` attribute is doing real work here. It tells the browser: start downloading this file now, in parallel with parsing the HTML, but do not execute it until the document is fully parsed. You get the download started early **and** you are guaranteed the elements exist when your code runs.',
        ],
      },
      {
        kind: SECTION.TABLE,
        headers: ['Placement', 'Downloads while parsing?', 'Runs when?', 'Verdict'],
        rows: [
          ['`<script>` in head', 'No — parsing pauses', 'Immediately, before body exists', 'Blocks rendering and breaks DOM access'],
          ['`<script>` at end of body', 'No — parsing pauses', 'After the HTML above it', 'Works, but downloads late'],
          ['`<script defer>` in head', 'Yes', 'After document is parsed', 'Recommended default'],
          ['`<script async>` in head', 'Yes', 'As soon as it downloads', 'Only for independent scripts like analytics'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'Common mistake',
        body: [
          'Loading a script in the `<head>` without `defer`, then getting `null` back from `document.querySelector` and concluding the selector is wrong. The selector is usually fine — the element simply did not exist yet when the code ran. Add `defer`, or move the script to the end of the body.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'And a fourth way: right here',
        body: [
          'JSPath runs JavaScript directly in your browser in a sandboxed frame. Any example marked runnable can be edited and executed on the page, and the Playground gives you a full editor with console output. You do not need to install anything to complete this course.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-03-a',
        title: 'Why is the element null?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['devtools', 'dom'],
        instructions:
          'A script in the `<head>` runs `document.getElementById("total")` and gets `null`, even though a `<div id="total">` exists in the body. What is the cause?',
        options: [
          'The id is misspelled somewhere',
          'The script ran before the browser had parsed the div',
          'getElementById is deprecated and returns null',
          'The div needs a class as well as an id',
        ],
        correct: 1,
        hints: ['Scripts execute the instant the browser reaches them during parsing.'],
        solution: 'The script ran before the browser had parsed the div',
        solutionExplanation:
          'A plain script in the `<head>` executes before the body has been parsed, so the element genuinely does not exist yet and the lookup correctly returns `null`. Adding the `defer` attribute delays execution until parsing completes, which fixes it while still downloading the file early.',
      },
      {
        id: 'ex-m00-03-b',
        title: 'Console output versus return value',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['devtools'],
        instructions:
          'This code is saved in a .js file and loaded by a page — not typed into the console. What appears in the console?',
        code: ['"hello".toUpperCase();', 'console.log("done");'].join('\n'),
        options: ['"HELLO" then done', 'done only', '"HELLO" only', 'Nothing'],
        correct: 1,
        hints: ['Only one of these two lines explicitly prints something.'],
        solution: 'done only',
        solutionExplanation:
          'The console echoes return values only when you type an expression interactively. Inside a script file, an expression whose result is unused produces no output at all. `"hello".toUpperCase()` computes "HELLO" and immediately discards it. Only the explicit `console.log("done")` prints.',
      },
    ],
    quiz: {
      id: 'qz-m00-03',
      questions: [
        {
          id: 'q-m00-03-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['devtools'],
          prompt: 'What does the `defer` attribute do on a script tag?',
          options: [
            'Prevents the script from running until the user interacts with the page',
            'Downloads the script in parallel and runs it after the document is parsed',
            'Runs the script as soon as it finishes downloading, interrupting parsing',
            'Delays the download until the page has finished rendering',
          ],
          correct: 1,
          optionExplanations: [
            'Nothing about `defer` involves user interaction.',
            'Correct — parallel download, execution after parsing. Best of both.',
            'That describes `async`, which is why `async` is unsuitable for DOM code.',
            'The download starts immediately; only execution is deferred.',
          ],
          explanation:
            '`defer` starts the download immediately without blocking HTML parsing, then executes the script once the document has been fully parsed. That combination makes it the sensible default for scripts that touch the DOM.',
        },
        {
          id: 'q-m00-03-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['devtools'],
          prompt: 'Why prefer an external .js file over an inline script?',
          options: [
            'Inline scripts run more slowly',
            'External files can be cached, reused across pages, and keep behaviour separate from markup',
            'Inline scripts cannot access the DOM',
            'External files are required by the JavaScript specification',
          ],
          correct: 1,
          optionExplanations: [
            'Execution speed is essentially identical; the benefits are elsewhere.',
            'Correct — caching, reuse and separation of concerns.',
            'Inline scripts have full DOM access.',
            'The specification says nothing about file organisation.',
          ],
          explanation:
            'External files are cached by the browser, reusable across pages, easier to lint and test, and keep behaviour cleanly separated from structure.',
        },
      ],
    },
    summary:
      'Use the console for quick experiments and inspection, a script tag to attach behaviour to a page, and an external file with `defer` for anything real. The `defer` attribute downloads early but executes after parsing, which avoids the most common beginner bug: querying for elements that do not exist yet. Remember that the console echoes return values interactively, but script files print only what you explicitly log.',
    keyTakeaways: [
      'Open the console with F12 / Ctrl+Shift+J / Cmd+Option+J',
      'Scripts run the moment the browser reaches them during parsing',
      '`defer` downloads in parallel and executes after the document is parsed',
      'Script files print only what you explicitly console.log',
    ],
    relatedLessons: ['l-m00-02', 'l-m00-04'],
  },

  /* ================================================================== */
  {
    id: 'l-m00-04',
    slug: 'syntax-basics',
    moduleId: M,
    order: 4,
    title: 'Syntax: Statements, Expressions, Comments and Semicolons',
    description: 'The grammar of JavaScript — what counts as a statement, what counts as an expression, and where semicolons genuinely matter.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 13,
    xp: 25,
    topicIds: ['syntax'],
    prerequisites: ['l-m00-03'],
    learningObjectives: [
      'Distinguish an expression from a statement',
      'Write single-line and multi-line comments effectively',
      'Explain what Automatic Semicolon Insertion does and where it bites',
      'Recognise that JavaScript is case sensitive and whitespace tolerant',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Every language has a grammar, and JavaScript’s is small enough to summarise in one lesson. Getting these terms straight now makes error messages far easier to read later, because the messages use exactly this vocabulary.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Expressions produce values',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'An **expression** is any piece of code that produces a value. If you can imagine putting it on the right-hand side of an `=`, it is an expression.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Each of these evaluates to a value.',
        code: [
          '2 + 2                 // → 4',
          '"Ada" + " Lovelace"   // → "Ada Lovelace"',
          'age >= 18             // → true or false',
          'Math.max(3, 9)        // → 9',
          'user.name             // → whatever is stored there',
        ].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Statements perform actions',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A **statement** is an instruction that does something. Declaring a variable, running a loop, returning from a function, branching with `if` — these are statements. They do not produce a value you can assign.',
          'The distinction matters practically: you can put an expression almost anywhere a value is expected, but you cannot put a statement there. This is why `const x = if (a) { 1 } else { 2 };` is a syntax error, while the ternary expression `const x = a ? 1 : 2;` works.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'Statement — cannot be assigned',
          code: [
            '// Syntax error:',
            '// const label = if (score > 50) {',
            '//   "pass";',
            '// } else {',
            '//   "fail";',
            '// };',
            '',
            'let label;',
            'if (score > 50) {',
            '  label = "pass";',
            '} else {',
            '  label = "fail";',
            '}',
          ].join('\n'),
        },
        right: {
          title: 'Expression — produces a value',
          code: [
            'const label = score > 50 ? "pass" : "fail";',
          ].join('\n'),
        },
        note: '`if` is a statement, so it cannot appear where a value is expected. The ternary operator is an expression, so it can.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Comments',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Comments are ignored by the engine entirely. They exist for humans reading the code, including you in six months.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        code: [
          '// A single-line comment runs to the end of the line',
          '',
          '/*',
          '  A block comment can span',
          '  as many lines as you like.',
          '*/',
          '',
          'const rate = 0.2; // can also sit after code',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'Comment the why, not the what',
        body: [
          'A comment saying `// add 1 to count` next to `count += 1` is noise — the code already says that. A comment saying `// API pages are 1-indexed, not 0-indexed` is valuable, because it captures a fact the code cannot express. Aim to write code clear enough that most "what" comments become unnecessary.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Semicolons and the rule that actually matters',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'JavaScript has a feature called **Automatic Semicolon Insertion** (ASI). If a statement is missing its terminating semicolon, the engine will usually insert one for you at a line break. This is why omitting semicolons mostly works.',
          'It does not always work, and the failure cases are genuinely confusing. The reliable rule: **ASI never inserts a semicolon if the next line could plausibly continue the current statement.** A line starting with `(`, `[`, `` ` ``, `+`, `-`, `/` or `,` can continue the previous line, so no semicolon is inserted and the two lines are joined.',
        ],
      },
      {
        kind: SECTION.ANNOTATED_CODE,
        language: 'javascript',
        code: [
          'const value = getTotal()',
          '',
          '[1, 2, 3].forEach((n) => console.log(n))',
        ].join('\n'),
        annotations: [
          { line: 1, text: 'No semicolon here, and the next non-blank line starts with `[`.' },
          { line: 3, text: 'ASI does not fire. The engine reads this as `getTotal()[1, 2, 3].forEach(...)` — an index lookup on the return value — which throws a confusing TypeError.' },
        ],
      },
      {
        kind: SECTION.PROSE,
        body: [
          'You have two safe options, and both are used by real teams. Either write semicolons consistently, or omit them consistently and let a formatter such as Prettier handle the edge cases. What causes bugs is doing it inconsistently by hand. JSPath uses semicolons throughout, which is the more common convention in professional codebases.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Case sensitivity and whitespace',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'JavaScript is **case sensitive**. `userName`, `username` and `UserName` are three unrelated identifiers. A surprising share of "my variable is undefined" moments are a capitalisation typo.',
          'Whitespace and indentation, by contrast, carry no meaning to the engine. They exist purely for readability — which is not a small thing, since you will read code far more often than you write it.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'Common mistake',
        body: [
          'Writing `Console.log(...)` with a capital C, or `getElementByID` instead of `getElementById`. Both produce errors that sound alarming but mean only "no such thing exists with that exact spelling". Read the name in the error character by character before assuming anything deeper is wrong.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-04-a',
        title: 'Expression or statement?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['syntax'],
        instructions: 'Which of the following is an expression — something that produces a value?',
        options: [
          'if (ready) { start(); }',
          'let count = 0;',
          'price * quantity',
          'return total;',
        ],
        correct: 2,
        hints: ['Ask: could this go on the right-hand side of an `=` sign?'],
        solution: 'price * quantity',
        solutionExplanation:
          '`price * quantity` evaluates to a number, so it is an expression and could be assigned to a variable. The other three are statements: `if` branches, `let` declares, and `return` exits a function. None of them produces a value you can assign.',
      },
      {
        id: 'ex-m00-04-b',
        title: 'Find the ASI hazard',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['syntax'],
        instructions:
          'Which line, if it followed a line that was missing its semicolon, would fail to get an automatic semicolon inserted?',
        options: [
          'const next = 5;',
          '(function () { run(); })();',
          'let name = "Ada";',
          'return value;',
        ],
        correct: 1,
        hints: ['ASI is skipped when the next line could continue the previous statement. Which opening character does that?'],
        solution: '(function () { run(); })();',
        solutionExplanation:
          'A line starting with `(` can be read as a function call applied to whatever ended the previous line, so the engine joins them instead of inserting a semicolon. The other three start with keywords that cannot continue a previous expression, so ASI fires safely. Lines beginning with `(`, `[`, a backtick, `+`, `-`, `/` or `,` are the hazardous ones.',
      },
    ],
    quiz: {
      id: 'qz-m00-04',
      questions: [
        {
          id: 'q-m00-04-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['syntax'],
          prompt: 'Why is `const x = if (a) { 1 } else { 2 };` a syntax error?',
          options: [
            'Because `if` requires an `else if` branch',
            'Because `if` is a statement, and statements do not produce assignable values',
            'Because `const` cannot be assigned conditionally',
            'Because the braces are unnecessary',
          ],
          correct: 1,
          optionExplanations: [
            '`else if` is entirely optional.',
            'Correct — use the ternary operator when you need an expression.',
            '`const` can be assigned any expression; the problem is that `if` is not one.',
            'Braces are legal here; the structural problem is different.',
          ],
          explanation:
            '`if` is a statement. Assignment requires an expression on the right-hand side. The ternary operator `a ? 1 : 2` is the expression form and works in that position.',
        },
        {
          id: 'q-m00-04-2',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['syntax'],
          prompt: 'Indentation changes how JavaScript executes.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'That is true of Python, but not of JavaScript.',
            'Correct — whitespace is for human readers only; blocks are delimited by braces.',
          ],
          explanation:
            'JavaScript ignores whitespace and indentation when determining behaviour. Blocks are delimited by braces. Indentation still matters enormously for readability, which is why teams enforce it with formatters.',
        },
      ],
    },
    summary:
      'Expressions produce values; statements perform actions — and only expressions can appear where a value is expected. Comments are for explaining why, not restating what. Automatic Semicolon Insertion usually saves you, but never when the next line begins with a character that could continue the current statement, so pick a semicolon convention and hold to it. JavaScript is case sensitive and whitespace-insensitive.',
    keyTakeaways: [
      'An expression produces a value; a statement performs an action',
      '`if` is a statement, the ternary is an expression — that is why one is assignable',
      'ASI fails when the next line starts with ( [ ` + - / or ,',
      'JavaScript is case sensitive; indentation affects readability only',
    ],
    relatedLessons: ['l-m00-03', 'l-m00-05'],
  },

  /* ================================================================== */
  {
    id: 'l-m00-05',
    slug: 'reading-errors',
    moduleId: M,
    order: 5,
    title: 'Reading Error Messages',
    description: 'Errors are the most useful feedback you get. Learn to read them precisely instead of fearing them.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 12,
    xp: 25,
    topicIds: ['devtools', 'errors'],
    prerequisites: ['l-m00-04'],
    learningObjectives: [
      'Identify the four parts of a JavaScript error message',
      'Recognise the most common error types and what each one means',
      'Use the line number and stack trace to locate the real cause',
      'Approach an unfamiliar error with a repeatable method',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'New developers often treat an error as a sign of failure. It is closer to the opposite: an error is the runtime telling you exactly what went wrong and where. Silent wrong behaviour is far harder to fix than a loud, specific crash.',
          'Every JavaScript error carries four pieces of information. Read all four, in order, before changing anything.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'text',
        caption: 'A typical browser console error.',
        code: [
          'Uncaught TypeError: Cannot read properties of null (reading \'textContent\')',
          '    at updateHeading (app.js:12:18)',
          '    at init (app.js:31:3)',
          '    at app.js:40:1',
        ].join('\n'),
      },
      {
        kind: SECTION.STEPS,
        steps: [
          {
            title: 'The error type — TypeError',
            body: 'This tells you the category of failure. A TypeError means a value was not the kind of thing the operation needed.',
          },
          {
            title: 'The message — Cannot read properties of null',
            body: 'The specific problem. Something was `null`, and the code tried to read a property from it. It even names the property: `textContent`.',
          },
          {
            title: 'The location — app.js:12:18',
            body: 'File, line 12, column 18. This is where the failure surfaced. It is not always where the mistake was made, but it is always where to start.',
          },
          {
            title: 'The stack trace — the "at" lines',
            body: 'The chain of calls that led here, most recent first. `updateHeading` was called by `init`, which was called at the top level of app.js. This tells you the path the program took.',
          },
        ],
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Put together, that error says something quite specific: on line 12 of app.js, inside `updateHeading`, we tried to set `.textContent` on something that was `null`. Almost certainly a `querySelector` or `getElementById` did not match anything. That is a precise, actionable diagnosis — and you got it without running a debugger.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The error types you will meet most',
      },
      {
        kind: SECTION.TABLE,
        headers: ['Type', 'Means', 'Typical cause'],
        rows: [
          ['SyntaxError', 'The code could not be parsed at all', 'Missing bracket, brace, quote or comma'],
          ['ReferenceError', 'A name was used that does not exist', 'Typo, or using a variable before it is declared'],
          ['TypeError', 'A value was the wrong kind of thing', 'Calling a non-function, or reading a property of null/undefined'],
          ['RangeError', 'A value was outside its allowed range', 'Infinite recursion, or an invalid array length'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.WARNING,
        title: 'SyntaxError is different from the rest',
        body: [
          'A SyntaxError happens before any of your code runs, because the file could not be parsed. That means nothing in the file executes — not even the lines above the error. If a whole script mysteriously "does nothing", check the console for a SyntaxError first.',
          'The reported line number for a SyntaxError is where the parser gave up, which is often *after* the real mistake. A missing closing brace on line 20 may be reported at line 45. Look upward from the reported line.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The two most common messages, decoded',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'ReferenceError: userName is not defined',
        code: [
          'const userName = "Ada";',
          'console.log(username);',
          '// ReferenceError: username is not defined',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          '"is not defined" means the engine searched every enclosing scope for that exact name and found nothing. Ninety percent of the time it is a capitalisation or spelling difference — here, `username` versus `userName`.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'TypeError: Cannot read properties of undefined',
        code: [
          'const user = { name: "Ada" };',
          'console.log(user.address.city);',
          '// TypeError: Cannot read properties of undefined (reading \'city\')',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Read this one carefully, because the wording points at the right place. `user.address` is `undefined` — the `address` property does not exist. Reading `.city` from `undefined` is the operation that failed. The problem is not `city`; the problem is that `address` was missing. The property named in the parentheses is the one you *tried* to read, not the one that was absent.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'A method that works on any error',
        body: [
          'Read the type. Read the message literally. Open the file at the stated line. Ask what value would have to be there for this to fail. Then log that value on the line above and run it again. This sequence resolves most errors in under a minute, and it works just as well on errors you have never seen before.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-05-a',
        title: 'Diagnose the TypeError',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['errors', 'debugging'],
        instructions:
          'You see: `TypeError: Cannot read properties of undefined (reading \'length\')` on the line `console.log(data.items.length)`. What is most likely wrong?',
        options: [
          '`length` is spelled incorrectly',
          '`data.items` is undefined — the `items` property does not exist on `data`',
          '`data` is undefined',
          '`length` is not available on arrays',
        ],
        correct: 1,
        hints: [
          'The property named in parentheses is the one being read. What must the thing to its left have been?',
        ],
        solution: '`data.items` is undefined — the `items` property does not exist on `data`',
        solutionExplanation:
          'The message says reading `length` failed because the value it was read *from* was undefined. That value is `data.items`. If `data` itself were undefined, the error would have named `items` instead, because the failure would have happened one step earlier. Reading the message precisely tells you exactly which link in the chain broke.',
      },
      {
        id: 'ex-m00-05-b',
        title: 'Why did nothing run?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['errors', 'debugging'],
        instructions:
          'A script file has a `console.log("start")` on line 1, but nothing appears in the console at all — not even "start". Which error type best explains this?',
        options: ['ReferenceError', 'TypeError', 'SyntaxError', 'RangeError'],
        correct: 2,
        hints: ['Which error prevents the file from running at all, rather than stopping partway?'],
        solution: 'SyntaxError',
        solutionExplanation:
          'A SyntaxError occurs at parse time, before execution begins, so no line in the file runs — including line 1. The other three are runtime errors: they stop execution at the point of failure, meaning any logging above that point would still have appeared. "Nothing at all ran" is the signature of a SyntaxError.',
      },
    ],
    quiz: {
      id: 'qz-m00-05',
      questions: [
        {
          id: 'q-m00-05-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['errors'],
          prompt: 'What does a ReferenceError indicate?',
          options: [
            'A value was the wrong type for the operation',
            'A name was used that does not exist in any accessible scope',
            'The code could not be parsed',
            'A number exceeded its allowed range',
          ],
          correct: 1,
          optionExplanations: [
            'That describes a TypeError.',
            'Correct — usually a typo or a variable used before declaration.',
            'That describes a SyntaxError.',
            'That describes a RangeError.',
          ],
          explanation:
            'A ReferenceError means the engine looked through every enclosing scope for that identifier and found nothing. Check spelling and capitalisation first.',
        },
        {
          id: 'q-m00-05-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['errors', 'debugging'],
          prompt: 'In a stack trace, which call is listed first?',
          options: [
            'The first function the program ever called',
            'The most recent call — where the error actually occurred',
            'The function with the most lines',
            'They appear in random order',
          ],
          correct: 1,
          optionExplanations: [
            'That appears last, at the bottom of the trace.',
            'Correct — the trace reads most-recent-first, so the top line is where it broke.',
            'Length has nothing to do with trace order.',
            'The order is strictly defined by the call stack.',
          ],
          explanation:
            'Stack traces read most recent first. The top line is where the error surfaced; each line below is the call that led to it, ending with the outermost caller.',
        },
      ],
    },
    summary:
      'Every error gives you a type, a message, a location and a stack trace — read all four before changing code. TypeError means a value was the wrong kind of thing; ReferenceError means a name does not exist; SyntaxError means the file never ran at all. Read messages literally: the property named in a TypeError is the one you tried to read, which tells you the value to its left was the one missing.',
    keyTakeaways: [
      'Errors have four parts: type, message, location, stack trace',
      'SyntaxError prevents the entire file from running',
      'In "Cannot read properties of undefined (reading \'x\')", the missing value is to the left of x',
      'Stack traces read most-recent-call first',
    ],
    relatedLessons: ['l-m00-04', 'l-m00-06'],
    interviewConnections: ['How do you debug JavaScript?'],
  },

  /* ================================================================== */
  {
    id: 'l-m00-06',
    slug: 'first-program',
    moduleId: M,
    order: 6,
    title: 'Your First JavaScript Program',
    description: 'Put it all together: write, run, break and fix a small program from scratch.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 15,
    xp: 30,
    topicIds: ['orientation', 'syntax', 'devtools'],
    prerequisites: ['l-m00-05'],
    learningObjectives: [
      'Write a small complete program from scratch',
      'Use console.log to inspect what your program is doing',
      'Deliberately break code and predict the resulting error',
      'Describe a program’s behaviour line by line',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Everything so far has been groundwork. Now you write something that runs. The program below is deliberately small, but it contains the full input → processing → output shape from the first lesson, and every line of it is something you can already reason about.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The program',
      },
      {
        kind: SECTION.ANNOTATED_CODE,
        language: 'javascript',
        code: [
          'const pricePerItem = 12.5;',
          'const quantity = 3;',
          '',
          'const subtotal = pricePerItem * quantity;',
          'const tax = subtotal * 0.2;',
          'const total = subtotal + tax;',
          '',
          'console.log("Subtotal:", subtotal);',
          'console.log("Tax:", tax);',
          'console.log("Total:", total);',
        ].join('\n'),
        annotations: [
          { line: 1, text: 'Input: the data the program works with. `const` means this name will not be reassigned.' },
          { line: 4, text: 'Processing begins. The right-hand side is an expression; its value is stored in a new name.' },
          { line: 5, text: 'Each line can use the names defined above it — order matters, exactly as in lesson 1.' },
          { line: 8, text: 'Output. `console.log` accepts several arguments and prints them separated by spaces.' },
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Run it and edit the numbers — the output updates.',
        runnable: true,
        code: [
          'const pricePerItem = 12.5;',
          'const quantity = 3;',
          '',
          'const subtotal = pricePerItem * quantity;',
          'const tax = subtotal * 0.2;',
          'const total = subtotal + tax;',
          '',
          'console.log("Subtotal:", subtotal);',
          'console.log("Tax:", tax);',
          'console.log("Total:", total);',
        ].join('\n'),
        output: ['Subtotal: 37.5', 'Tax: 7.5', 'Total: 45'].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Read it as the machine does',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Walk through it literally. `pricePerItem` becomes 12.5. `quantity` becomes 3. `subtotal` is computed as 37.5 and stored. `tax` is computed from the subtotal that already exists — 7.5. `total` adds the two — 45. Then three separate output instructions run.',
          'Notice that nothing happens twice and nothing happens out of order. If you moved line 4 below line 5, you would get a ReferenceError, because `subtotal` would be used before it was declared. That is the Temporal Dead Zone, which you will meet properly in the scope module.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Break it on purpose',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Deliberately breaking working code is one of the fastest ways to learn, because you get to connect a specific mistake to a specific error message while you already understand what the code was supposed to do.',
        ],
      },
      {
        kind: SECTION.LIST,
        ordered: true,
        items: [
          'Change `console.log` to `Console.log`. Predict the error type before running it. (ReferenceError — `Console` does not exist.)',
          'Delete the closing quote on `"Total:"`. Predict what happens to the *other* two log lines. (SyntaxError — none of them run.)',
          'Change `quantity` to the string `"3"`. Look carefully at the subtotal, then at the total. (Multiplication coerces the string to a number, but addition on strings concatenates — a preview of the coercion module.)',
          'Rename `subtotal` on line 4 to `subTotal` but leave line 5 unchanged. (ReferenceError, naming the exact identifier that is missing.)',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'console.log is a legitimate tool, not a beginner crutch',
        body: [
          'Professional developers log values constantly while working. The habit worth building is logging with a label — `console.log("subtotal:", subtotal)` rather than a bare `console.log(subtotal)` — because once you have four logs running you will not remember which is which. You will learn breakpoint debugging later; logging remains useful alongside it.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'What you can now do',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'You have written a program that stores data, transforms it and reports a result. You can run JavaScript three different ways, you know the difference between the language and the browser, and you can read an error message and act on it rather than guessing.',
          'That is a genuine foundation. The next module makes the one piece you have been using informally — storing values in names — precise.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m00-06-a',
        title: 'Write a receipt calculator',
        kind: EXERCISE_KIND.WRITE_FUNCTION,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 20,
        topicIds: ['orientation', 'syntax'],
        instructions:
          'Write a function `calculateTotal(price, quantity, taxRate)` that returns the final total including tax. For example, `calculateTotal(10, 2, 0.2)` should return 24 — a subtotal of 20 plus 20% tax.',
        starterCode: [
          'function calculateTotal(price, quantity, taxRate) {',
          '  // Multiply to get the subtotal, add the tax, return the result.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'calculateTotal(10, 2, 0.2) returns 24', body: 'expect(calculateTotal(10, 2, 0.2)).toBe(24);' },
          { name: 'calculateTotal(12.5, 3, 0.2) returns 45', body: 'expect(calculateTotal(12.5, 3, 0.2)).toBe(45);' },
          { name: 'a zero tax rate returns the plain subtotal', body: 'expect(calculateTotal(5, 4, 0)).toBe(20);' },
          { name: 'a quantity of zero returns 0', body: 'expect(calculateTotal(9.99, 0, 0.15)).toBe(0);' },
        ],
        hints: [
          'Start by computing the subtotal: price multiplied by quantity.',
          'The tax is the subtotal multiplied by the tax rate — not by the price.',
          'Remember to `return` the result. A function that only calculates returns `undefined`.',
        ],
        solution: [
          'function calculateTotal(price, quantity, taxRate) {',
          '  const subtotal = price * quantity;',
          '  const tax = subtotal * taxRate;',
          '  return subtotal + tax;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Break the calculation into named steps rather than writing one long expression — it reads better and is far easier to debug, because you can log each intermediate value. The most common mistake here is forgetting `return`, which makes the function produce `undefined` even though the arithmetic inside was correct. The second most common is computing tax from `price` instead of `subtotal`, which only shows up when quantity is not 1.',
      },
      {
        id: 'ex-m00-06-b',
        title: 'Predict the broken output',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['orientation', 'errors'],
        instructions: 'What does this program print?',
        code: [
          'const a = 5;',
          'console.log("a is", a);',
          'const b = a * 2;',
          'console.log("b is", B);',
        ].join('\n'),
        options: [
          '"a is 5" then "b is 10"',
          '"a is 5" then a ReferenceError',
          'A SyntaxError, so nothing prints',
          '"a is 5" then "b is undefined"',
        ],
        correct: 1,
        hints: [
          'JavaScript is case sensitive. Look at the last line very carefully.',
          'Is this a parse-time problem or a run-time problem?',
        ],
        solution: '"a is 5" then a ReferenceError',
        solutionExplanation:
          '`B` and `b` are different identifiers. The code parses fine — capitalisation is not a syntax problem — so execution begins and the first log prints normally. The failure happens at run time on the last line, throwing `ReferenceError: B is not defined`. This is exactly why a SyntaxError (nothing prints) and a ReferenceError (output up to the failure point, then a stop) are worth telling apart.',
      },
    ],
    quiz: {
      id: 'qz-m00-06',
      questions: [
        {
          id: 'q-m00-06-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['orientation', 'functions'],
          prompt: 'A function computes a value correctly but the caller receives `undefined`. What is the most likely cause?',
          options: [
            'The function was declared with the wrong name',
            'The function is missing a `return` statement',
            'The values were the wrong type',
            'The function was called before it was declared',
          ],
          correct: 1,
          optionExplanations: [
            'A wrong name would throw a ReferenceError, not return undefined.',
            'Correct — a function with no return produces `undefined`.',
            'Wrong types usually give NaN or a TypeError, not undefined.',
            'Function declarations are hoisted, so this works fine.',
          ],
          explanation:
            'A function that never executes a `return` statement evaluates to `undefined`. Computing a value inside the function is not the same as sending it back to the caller — this is the single most common early mistake with functions.',
        },
        {
          id: 'q-m00-06-2',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['errors', 'devtools'],
          prompt: 'A script prints its first two log lines and then stops. What kind of problem is this?',
          options: [
            'A SyntaxError',
            'A runtime error such as a ReferenceError or TypeError',
            'The file failed to load',
            'A missing defer attribute',
          ],
          correct: 1,
          optionExplanations: [
            'A SyntaxError would prevent even the first line from printing.',
            'Correct — partial output means execution started and then failed.',
            'A file that failed to load would produce no output at all.',
            'A missing `defer` affects DOM timing, not whether logs appear.',
          ],
          explanation:
            'Partial output proves the file parsed and began executing, so the problem is at run time. Whatever line follows the last successful log is where to look.',
        },
      ],
    },
    summary:
      'You have written and run a complete program that takes in data, processes it and produces output. You can trace it line by line the way the engine does, you can predict which error a given mistake will produce, and you can use labelled console.log to see inside a running program. Breaking working code deliberately is a legitimate and fast way to learn — the error you cause is one you already understand the context for.',
    keyTakeaways: [
      'Real programs follow the input → processing → output shape',
      'Each line can only use names declared above it',
      'A function without `return` produces `undefined`',
      'Partial output means a runtime error; no output at all suggests a SyntaxError',
    ],
    relatedLessons: ['l-m00-05'],
  },
];
