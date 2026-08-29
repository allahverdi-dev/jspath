import { SECTION, CALLOUT_TONE, DIFFICULTY, EXERCISE_KIND, QUIZ_KIND } from '../../schema/types.js';

const M = 'm01';

export default [
  /* ================================================================== */
  {
    id: 'l-m01-01',
    slug: 'values-and-variables',
    moduleId: M,
    order: 1,
    title: 'Values, and Why We Give Them Names',
    description: 'What a value actually is, what a variable actually is, and the mental model that will still be correct when you reach objects.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 14,
    xp: 25,
    topicIds: ['variables', 'types'],
    prerequisites: ['l-m00-06'],
    learningObjectives: [
      'Describe what a value is and give examples of several kinds',
      'Explain what a variable is using the name-to-value binding model',
      'Declare a variable and read it back',
      'Explain why the "box" metaphor breaks down later, and what to use instead',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'In the previous module you wrote a program that calculated a total. You used names like `subtotal` and `total` without much explanation. This module makes that precise, because variables are the single most-used feature of the language and a shaky mental model here causes confusion for months afterwards.',
          'We start with the thing being named: the value.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'A value is a piece of data',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A **value** is a single piece of data that your program can work with. The number `42` is a value. The text `"Hello"` is a value. `true` is a value. An array of three names is a value. A function is a value.',
          'Values can be written directly into your code. When you write them literally like this, they are called **literals** — the word simply means "written out in full, exactly as it is".',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Six literals. Each one is a value written directly into the source.',
        code: [
          '42',
          '3.14',
          '"Ada Lovelace"',
          'true',
          '[1, 2, 3]',
          '{ name: "Ada", born: 1815 }',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A value on its own does nothing, though. If you write `42` on a line by itself, JavaScript computes the number 42, does nothing with it, and moves on. The value is produced and immediately thrown away.',
          'To do anything useful you need to keep hold of a value so you can refer to it later. That is what a variable is for.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'A variable is a name bound to a value',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A **variable** is a name that refers to a value. Once the name exists, writing the name anywhere in your code gives you the value it currently refers to.',
        ],
      },
      {
        kind: SECTION.ANNOTATED_CODE,
        language: 'javascript',
        code: ['let greeting = "Hello";'].join('\n'),
        annotations: [
          { line: 1, text: '`let` is the **declaration keyword**. It tells JavaScript to create a new variable name in the current scope.' },
          { line: 1, text: '`greeting` is the **identifier** — the name you chose. You will use this name everywhere else to refer to the value.' },
          { line: 1, text: '`=` is the **assignment operator**. It does not mean "equals" in the mathematical sense. It means "make the name on the left refer to the value on the right".' },
          { line: 1, text: '`"Hello"` is the **value**. Everything to the right of `=` is evaluated first, and the result is what the name ends up referring to.' },
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.WARNING,
        title: '`=` is not equality',
        body: [
          'This trips up almost everyone who has done any mathematics. In `x = 5`, JavaScript is not stating a fact or asking a question — it is performing an action: "point the name `x` at the value `5`".',
          'The line `count = count + 1` is nonsense as an equation, but perfectly sensible as an instruction: work out `count + 1`, then make `count` refer to that new result. Comparison — actually asking whether two things are equal — uses `===`, which you will meet in the operators module.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Using a variable',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Once declared, the name can be used anywhere a value could be used. JavaScript replaces the name with whatever value it currently refers to, then carries on.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'Edit the values and run it — the output follows whatever the names refer to.',
        code: [
          'let firstName = "Ada";',
          'let lastName = "Lovelace";',
          'let birthYear = 1815;',
          '',
          'let fullName = firstName + " " + lastName;',
          'let age = 1852 - birthYear;',
          '',
          'console.log(fullName);',
          'console.log("Lived to about", age);',
        ].join('\n'),
        output: ['Ada Lovelace', 'Lived to about 37'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Read line 5 carefully. The right-hand side is evaluated first: `firstName` becomes `"Ada"`, `lastName` becomes `"Lovelace"`, and the three pieces are joined into `"Ada Lovelace"`. Only then is that result bound to the new name `fullName`.',
          'This is the general rule and it never changes: **the right-hand side is fully evaluated before the assignment happens.**',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The mental model that stays correct',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'You will often see variables described as boxes that hold values. It is an appealing picture and it works fine for numbers and text — but it quietly breaks the moment you reach objects and arrays, and people then have to unlearn it.',
          'Use this instead: **a variable is a label attached to a value.** The label is not the value. Two labels can be attached to the same value. Moving a label does not change the value it used to point at.',
        ],
      },
      {
        kind: SECTION.DIAGRAM,
        diagram: 'value-vs-reference',
        caption: 'You will meet the right-hand column properly in the Data Types module. For now, notice that the label model describes both cases correctly, while the box model only describes the left one.',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'Why this matters now rather than later',
        body: [
          'When you eventually write `const list = [1, 2, 3]` and then successfully do `list.push(4)`, the box model will make that look like a contradiction — you were told `const` means unchangeable, so how did the box change?',
          'With the label model there is no puzzle: `const` freezes the **label**, not the value it points at. You will see exactly this in lesson 3 of this module.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Reading a name that does not exist',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'If you use a name that was never declared, JavaScript searches for it, fails to find it, and throws a `ReferenceError`. You met this error in the orientation module; now you know precisely what it means — there is no label with that name.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        code: [
          'let city = "Cairo";',
          'console.log(citty);',
          '// ReferenceError: citty is not defined',
        ].join('\n'),
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'let a = 10;',
          'let b = a;',
          'a = 99;',
          '',
          'console.log(b);',
        ].join('\n'),
        options: ['10', '99', 'undefined', 'ReferenceError'],
        correct: 0,
        explanation:
          'On line 2 the right-hand side `a` is evaluated first, producing the value 10, and `b` is bound to that value. Line 3 then re-points the label `a` at 99. It does not touch `b` at all — `b` was attached to the value 10, not to the label `a`. So `b` is still 10. Assignment copies the value, never the connection to another name.',
      },
      {
        kind: SECTION.TERMS,
        terms: [
          { term: 'Value', definition: 'A single piece of data the program can work with — a number, a string, a boolean, an object, a function.' },
          { term: 'Literal', definition: 'A value written directly in the source code, such as `42` or `"Hello"`.' },
          { term: 'Variable', definition: 'A name that refers to a value. Using the name gives you the value it currently refers to.' },
          { term: 'Identifier', definition: 'The name itself — `greeting`, `total`, `userName`.' },
          { term: 'Declaration', definition: 'The statement that creates the name, using `let`, `const` or `var`.' },
          { term: 'Assignment', definition: 'Making a name refer to a value, using the `=` operator.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m01-01-a',
        title: 'Which of these is a value?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables', 'types'],
        instructions: 'A value is a piece of data. Which of these is a value rather than something else?',
        options: [
          'let',
          '=',
          '"Lovelace"',
          'console.log',
        ],
        correct: 2,
        hints: [
          'Two of these are parts of the language grammar. One of them is a function. Only one is a piece of data written out in full.',
        ],
        solution: '"Lovelace"',
        solutionExplanation:
          '`"Lovelace"` is a string literal — a value written directly into the source. `let` is a declaration keyword and `=` is an operator; both are grammar, not data. `console.log` is interesting: it is a function, and functions *are* values in JavaScript, but here the answer being asked for is the literal, which is the one piece of data written out in full.',
      },
      {
        id: 'ex-m01-01-b',
        title: 'Predict the value after reassignment',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables'],
        instructions: 'Work through this line by line. What is printed?',
        code: [
          'let price = 20;',
          'let discounted = price - 5;',
          'price = 100;',
          '',
          'console.log(discounted);',
        ].join('\n'),
        options: ['95', '15', '20', '100'],
        correct: 1,
        hints: [
          'When does line 2 run, and what did `price` refer to at that exact moment?',
          'Does changing `price` afterwards reach back and recompute anything?',
        ],
        solution: '15',
        solutionExplanation:
          'Line 2 runs while `price` still refers to 20, so `20 - 5` produces 15 and `discounted` is bound to that. Line 3 re-points `price` at 100, but `discounted` was attached to the value 15 — not to a live link back to `price`. Nothing recomputes. This is the single most important difference between a variable and a spreadsheet cell: a spreadsheet formula updates automatically, a JavaScript assignment does not.',
      },
      {
        id: 'ex-m01-01-c',
        title: 'Introduce yourself',
        kind: EXERCISE_KIND.WRITE_FUNCTION,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 15,
        topicIds: ['variables'],
        instructions:
          'Write a function `introduce(name, city)` that returns a sentence in exactly this form: `"My name is Ada and I live in London."` Declare at least one variable inside the function to build the sentence before returning it.',
        starterCode: [
          'function introduce(name, city) {',
          '  // Build the sentence in a variable, then return that variable.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'introduce("Ada", "London") returns the full sentence', body: 'expect(introduce("Ada", "London")).toBe("My name is Ada and I live in London.");' },
          { name: 'works with different arguments', body: 'expect(introduce("Grace", "New York")).toBe("My name is Grace and I live in New York.");' },
          { name: 'ends with a full stop', body: 'expect(introduce("Alan", "Cambridge").endsWith(".")).toBe(true);' },
          { name: 'does not hard-code a single name', body: 'expect(introduce("Zed", "Oslo")).toContain("Zed");', hidden: true },
        ],
        hints: [
          'Join pieces of text together with the `+` operator.',
          'Do not forget the spaces. `"My name is " + name` needs a space before the closing quote.',
          'Building the sentence into a variable first, then returning that variable, is easier to read and easier to debug than one long expression.',
        ],
        solution: [
          'function introduce(name, city) {',
          '  const sentence = "My name is " + name + " and I live in " + city + ".";',
          '  return sentence;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'The pieces of fixed text carry their own spaces so the joined result reads correctly — missing a space inside the quotes is the most common failure here, and it produces `"My name isAda"`. Storing the result in `sentence` before returning costs nothing and makes the value inspectable with `console.log` while you are debugging. In the strings module you will meet template literals, which make this far more readable.',
      },
    ],
    quiz: {
      id: 'qz-m01-01',
      questions: [
        {
          id: 'q-m01-01-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'What does the `=` operator do in JavaScript?',
          options: [
            'It checks whether two values are equal',
            'It makes the name on the left refer to the value on the right',
            'It creates a permanent link between two variables',
            'It compares the left and right sides and returns true or false',
          ],
          correct: 1,
          optionExplanations: [
            'That is `===`. A single `=` performs an action rather than asking a question.',
            'Correct — the right side is evaluated first, then the name is bound to the result.',
            'No link is created. The name is bound to the resulting value, and later changes to the other name have no effect.',
            'Assignment does produce a value, but it does not compare anything.',
          ],
          explanation:
            '`=` is assignment: evaluate the right-hand side, then make the identifier on the left refer to that result. Comparison is a different operator entirely (`===`).',
        },
        {
          id: 'q-m01-01-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables'],
          prompt: 'What is printed?',
          code: [
            'let total = 5;',
            'let doubled = total * 2;',
            'total = 50;',
            'console.log(doubled);',
          ].join('\n'),
          options: ['10', '100', '50', 'undefined'],
          correct: 0,
          optionExplanations: [
            'Correct — `doubled` was bound to 10 while `total` still referred to 5.',
            'This would be true only if `doubled` re-evaluated when `total` changed. Assignments do not work that way.',
            '`total` is 50 at the end, but the code prints `doubled`, not `total`.',
            '`doubled` was initialised on line 2, so it definitely has a value.',
          ],
          explanation:
            'Line 2 evaluates `total * 2` at that moment, giving 10, and binds `doubled` to 10. Reassigning `total` afterwards does not reach back and recompute `doubled`. Variables hold values, not live formulas.',
        },
        {
          id: 'q-m01-01-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'Why is the "variable is a box holding a value" metaphor avoided in this course?',
          options: [
            'Because boxes are a Python concept, not a JavaScript one',
            'Because it suggests a variable stores the value itself, which becomes misleading once two names refer to the same object',
            'Because variables cannot hold values at all',
            'Because it only applies to `var`, not to `let` and `const`',
          ],
          correct: 1,
          optionExplanations: [
            'The metaphor is not language-specific; the problem is accuracy, not origin.',
            'Correct — the label model describes both primitives and objects correctly.',
            'Variables certainly refer to values; the question is how to picture that relationship.',
            'The declaration keyword makes no difference to this point.',
          ],
          explanation:
            'The box picture implies each variable contains its own copy of a value. That holds for numbers and strings, but with objects two names can refer to the same underlying value, and changing it through one name is visible through the other. Thinking of a variable as a label attached to a value stays correct in both cases.',
        },
      ],
    },
    summary:
      'A value is a piece of data; a literal is a value written directly in your source. A variable is a name bound to a value — a label attached to it, not a box containing it. The `=` operator performs an action rather than stating a fact: it fully evaluates the right-hand side, then makes the left-hand name refer to that result. Because the value is what gets bound, copying one variable into another copies the value at that instant and creates no ongoing link between the two names.',
    keyTakeaways: [
      'A value is data; a variable is a name that refers to a value',
      '`=` means "point this name at this value", not "these are equal"',
      'The right-hand side is fully evaluated before the assignment happens',
      'Copying a variable copies the value, creating no link between the two names',
      'Think "label attached to a value", not "box containing a value"',
    ],
    relatedLessons: ['l-m00-06', 'l-m01-02'],
    interviewConnections: [
      'What is the difference between a value and a variable?',
      'What does the assignment operator actually do?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m01-02',
    slug: 'let-declaration-assignment',
    moduleId: M,
    order: 2,
    title: 'let: Declaration, Initialization and Reassignment',
    description: 'The three distinct operations people blur together — creating a name, giving it a first value, and giving it a new one.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 15,
    xp: 25,
    topicIds: ['variables'],
    prerequisites: ['l-m01-01'],
    learningObjectives: [
      'Distinguish declaration, initialization and reassignment precisely',
      'Explain what an uninitialized `let` variable evaluates to',
      'Declare and reassign variables with `let`',
      'Explain why redeclaring a `let` in the same scope is an error',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'Three separate things happen around a variable, and beginners routinely merge them into one idea. Keeping them apart makes error messages far easier to read, and it is the foundation for understanding hoisting and the Temporal Dead Zone later in the course.',
        ],
      },
      {
        kind: SECTION.STEPS,
        steps: [
          {
            title: 'Declaration — creating the name',
            body: 'You tell JavaScript that a name exists in this scope. `let score;` declares `score` and nothing else. No value has been supplied yet.',
          },
          {
            title: 'Initialization — the first value',
            body: 'You give the name its first value. `score = 0;` initializes it. Most of the time you do this on the same line as the declaration, which is why the two look like one step.',
          },
          {
            title: 'Reassignment — a later value',
            body: 'You point the existing name at a different value. `score = 10;` reassigns. The name already existed; only what it refers to has changed.',
          },
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'The three operations written out separately so each one is visible.',
        runnable: true,
        code: [
          'let score;              // declaration',
          'console.log(score);     // undefined — declared, not yet initialized',
          '',
          'score = 0;              // initialization',
          'console.log(score);     // 0',
          '',
          'score = 10;             // reassignment',
          'console.log(score);     // 10',
        ].join('\n'),
        output: ['undefined', '0', '10'].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Declared but not initialized is `undefined`',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A `let` variable that has been declared but never given a value evaluates to `undefined`. This is a real value that JavaScript uses to mean "nothing has been supplied here yet". It is not an error, and it is not the same as the variable not existing.',
          'That distinction matters when you are reading errors. `undefined` means the name exists and holds nothing. A `ReferenceError` means the name does not exist at all.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'Declared, no value — `undefined`',
          code: [
            'let result;',
            'console.log(result);',
            '// undefined',
            '',
            '// The name exists.',
            '// It just holds nothing yet.',
          ].join('\n'),
        },
        right: {
          title: 'Never declared — ReferenceError',
          code: [
            'console.log(outcome);',
            '// ReferenceError:',
            '// outcome is not defined',
            '',
            '// There is no such name',
            '// anywhere in scope.',
          ].join('\n'),
        },
        note: 'Two very different situations that beginners often describe with the same phrase, "it is undefined". Being precise here saves real debugging time.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Declaring in one step',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'In practice you almost always declare and initialize together. Splitting them is only worth doing when the value genuinely is not known yet — for example when it depends on a branch.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'A legitimate reason to separate declaration from initialization.',
        code: [
          'let shippingCost;',
          '',
          'if (orderTotal > 50) {',
          '  shippingCost = 0;',
          '} else {',
          '  shippingCost = 4.99;',
          '}',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'There is usually a tidier way',
        body: [
          'The example above is correct and readable, and you will see it in real codebases. Once you have met the ternary operator you will often write `const shippingCost = orderTotal > 50 ? 0 : 4.99;` instead, which has the advantage that the value can never be accidentally left unset or reassigned later.',
          'Reach for a split declaration when the logic genuinely needs several branches, not as a default habit.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Reassignment, and reading the old value',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Because the right-hand side is evaluated before the assignment, a variable can safely appear on both sides of `=`. The old value is read first, the new value is computed from it, and only then is the name re-pointed.',
        ],
      },
      {
        kind: SECTION.ANNOTATED_CODE,
        language: 'javascript',
        code: [
          'let visits = 7;',
          'visits = visits + 1;',
          'visits += 1;',
          'visits++;',
        ].join('\n'),
        annotations: [
          { line: 2, text: 'Read `visits` (7), add 1 to get 8, then bind `visits` to 8. The read always happens before the write.' },
          { line: 3, text: 'The compound assignment operator `+=` does exactly the same thing in fewer characters. This is the form you will usually see.' },
          { line: 4, text: 'The increment operator `++` adds exactly 1. Convenient in loops; you will meet its subtleties in the operators module.' },
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'You cannot redeclare a `let` in the same scope',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Declaring the same name twice with `let` in the same scope is a `SyntaxError`. Because it is a syntax error, it is caught before your program runs at all — nothing in the file executes.',
          'This is a deliberate safety feature. Accidentally reusing a name for two different purposes is a genuine source of bugs, and the language would rather stop you than let it slide.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        code: [
          'let user = "Ada";',
          'let user = "Grace";',
          '// SyntaxError: Identifier \'user\' has already been declared',
          '',
          '// If you meant to change the value, do not redeclare:',
          '// user = "Grace";   ← correct',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'Common mistake: writing `let` again when you meant to reassign',
        body: [
          'A very common beginner slip is to write `let count = count + 1;` inside a loop or a branch, having already declared `count` above. The fix is to drop the keyword — `count = count + 1;`. The keyword creates a name; you only need it once.',
          'The mirror-image mistake is forgetting the keyword on the *first* use. In strict mode — which every module and every modern build uses — assigning to a name that was never declared throws a `ReferenceError` rather than silently creating a global variable.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'let stock = 3;',
          '',
          'function sell() {',
          '  stock = stock - 1;',
          '  return stock;',
          '}',
          '',
          'sell();',
          'sell();',
          'console.log(stock);',
        ].join('\n'),
        options: ['3', '2', '1', 'undefined'],
        correct: 2,
        explanation:
          'Each call reads the current value of `stock`, subtracts one, and re-points the same name at the result. The first call leaves it at 2, the second at 1. There is only ever one `stock` name here — the function reassigns the outer variable rather than creating its own, because it never declares one. In the scope module you will see exactly why that lookup reaches outward.',
      },
    ],
    exercises: [
      {
        id: 'ex-m01-02-a',
        title: 'Name the operation',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables'],
        instructions: 'Given that `let temperature = 20;` appeared earlier, what does the line `temperature = 25;` perform?',
        options: [
          'A declaration',
          'An initialization',
          'A reassignment',
          'A redeclaration',
        ],
        correct: 2,
        hints: [
          'Does this line create a new name, or change what an existing name refers to?',
        ],
        solution: 'A reassignment',
        solutionExplanation:
          'The name `temperature` already exists and already has a value, so this is reassignment. It is not a declaration because there is no `let` keyword creating a name, and it is not initialization because that term describes the *first* value a variable receives. A redeclaration would require a second `let`, which would be a SyntaxError.',
      },
      {
        id: 'ex-m01-02-b',
        title: 'Predict the uninitialized value',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables'],
        instructions: 'What does this print?',
        code: [
          'let winner;',
          'console.log(winner);',
        ].join('\n'),
        options: ['undefined', 'null', '""', 'ReferenceError'],
        correct: 0,
        hints: [
          'The name was declared. Does it exist?',
          'What value does JavaScript use to mean "declared but nothing supplied yet"?',
        ],
        solution: 'undefined',
        solutionExplanation:
          'The declaration created the name, so there is no ReferenceError — the name definitely exists. Since no value was supplied, it holds `undefined`, which is JavaScript\'s way of saying "nothing has been put here yet". `null` is different: it is a value a programmer assigns deliberately to mean "intentionally empty", and JavaScript never produces it automatically for an uninitialized variable.',
      },
      {
        id: 'ex-m01-02-c',
        title: 'Fix the redeclaration bug',
        kind: EXERCISE_KIND.FIX_BUG,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 15,
        topicIds: ['variables'],
        instructions:
          'This function is meant to add a bonus to a score and return the result, but it does not run at all. Find the problem and fix it so `applyBonus(10, 5)` returns 15. Do not change the function signature.',
        starterCode: [
          'function applyBonus(score, bonus) {',
          '  let total = score;',
          '  let total = total + bonus;',
          '  return total;',
          '}',
        ].join('\n'),
        tests: [
          { name: 'applyBonus(10, 5) returns 15', body: 'expect(applyBonus(10, 5)).toBe(15);' },
          { name: 'applyBonus(0, 0) returns 0', body: 'expect(applyBonus(0, 0)).toBe(0);' },
          { name: 'handles negative bonuses', body: 'expect(applyBonus(10, -3)).toBe(7);' },
          { name: 'works with decimals', body: 'expect(applyBonus(1.5, 2.25)).toBe(3.75);', hidden: true },
        ],
        hints: [
          'Read the error the file produces before assuming the arithmetic is wrong.',
          'The name `total` is declared twice in the same scope. Which of the two lines actually needs the keyword?',
          'The second line wants to *change* `total`, not create it.',
        ],
        solution: [
          'function applyBonus(score, bonus) {',
          '  let total = score;',
          '  total = total + bonus;',
          '  return total;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Declaring `total` twice with `let` in the same scope is a SyntaxError, which is why nothing ran — not even the first line. Removing the second `let` turns the line into a reassignment, which is what was intended. Note that this specific function would be cleaner still as `return score + bonus;`, but the exercise is about recognising the redeclaration error when you see it in someone else\'s code.',
      },
      {
        id: 'ex-m01-02-d',
        title: 'Build a running total',
        kind: EXERCISE_KIND.WRITE_FUNCTION,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['variables'],
        instructions:
          'Write a function `sumThree(a, b, c)` that returns the sum of its three arguments. Build the answer up in a single variable using reassignment — declare it once, then add each argument to it in turn. Do not write `return a + b + c;` directly, as the point is to practise reassignment.',
        starterCode: [
          'function sumThree(a, b, c) {',
          '  let total = 0;',
          '  // Add each argument to total in turn, then return it.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'sumThree(1, 2, 3) returns 6', body: 'expect(sumThree(1, 2, 3)).toBe(6);' },
          { name: 'sumThree(0, 0, 0) returns 0', body: 'expect(sumThree(0, 0, 0)).toBe(0);' },
          { name: 'handles negative numbers', body: 'expect(sumThree(-5, 10, -2)).toBe(3);' },
          { name: 'handles decimals', body: 'expect(sumThree(0.5, 0.25, 0.25)).toBe(1);' },
          { name: 'returns a number, not a string', body: 'expect(typeof sumThree(1, 2, 3)).toBe("number");', hidden: true },
        ],
        hints: [
          '`total = total + a;` reads the old value, adds, and stores the result back.',
          'The shorter form `total += a;` does exactly the same thing.',
          'Remember to `return total;` at the end — computing it is not the same as sending it back.',
        ],
        solution: [
          'function sumThree(a, b, c) {',
          '  let total = 0;',
          '  total += a;',
          '  total += b;',
          '  total += c;',
          '  return total;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Starting at 0 and accumulating is the accumulator pattern, and you will see it constantly — it is exactly what `reduce` does internally when you reach array methods. `total` must be `let` rather than `const` precisely because it is reassigned on every line. The hidden test guards against building a string by accident: if `total` had started as `""` instead of `0`, every `+=` would concatenate and `sumThree(1, 2, 3)` would return `"123"`.',
      },
    ],
    quiz: {
      id: 'qz-m01-02',
      questions: [
        {
          id: 'q-m01-02-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'What is the difference between a variable holding `undefined` and a variable that was never declared?',
          options: [
            'There is no difference; both throw a ReferenceError when read',
            'The first exists and holds no value; the second does not exist, and reading it throws a ReferenceError',
            'The first throws an error; the second returns undefined',
            'Both return undefined, but only one can be reassigned',
          ],
          correct: 1,
          optionExplanations: [
            'Reading a declared-but-uninitialized variable is perfectly legal and returns `undefined`.',
            'Correct — and telling these apart makes error messages much easier to act on.',
            'This has the two cases the wrong way round.',
            'The undeclared name cannot be read at all, so it never "returns" anything.',
          ],
          explanation:
            'A declared variable with no value evaluates to `undefined` — the name exists in scope, it simply holds nothing. An undeclared name does not exist anywhere in the scope chain, so reading it throws `ReferenceError: x is not defined`.',
        },
        {
          id: 'q-m01-02-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables'],
          prompt: 'What happens when this file runs?',
          code: [
            'console.log("starting");',
            'let mode = "dark";',
            'let mode = "light";',
            'console.log(mode);',
          ].join('\n'),
          options: [
            'It prints "starting" then "light"',
            'It prints "starting" then throws',
            'It throws a SyntaxError and prints nothing at all',
            'It prints "starting" then "dark"',
          ],
          correct: 2,
          optionExplanations: [
            'Redeclaring a `let` in the same scope is never allowed, so this cannot succeed.',
            'This would be the answer for a runtime error, but a redeclaration is caught earlier than that.',
            'Correct — a SyntaxError is raised at parse time, before any line executes.',
            'Nothing executes, so no value is printed.',
          ],
          explanation:
            'Redeclaring `let mode` in the same scope is a SyntaxError. Syntax errors are found while parsing the file, before execution begins, so even the `console.log("starting")` on line 1 never runs. "No output at all" is the signature of a SyntaxError, as you saw in the orientation module.',
        },
        {
          id: 'q-m01-02-3',
          kind: QUIZ_KIND.MULTIPLE,
          topicIds: ['variables'],
          prompt: 'Which of these are legal after `let count = 0;` has already run? (Select all that apply.)',
          options: [
            'count = 5;',
            'count += 1;',
            'let count = 5;',
            'count = count * 2;',
          ],
          correct: [0, 1, 3],
          explanation:
            'Reassignment in any form is fine — plain assignment, compound assignment, and assignment that reads the old value first all work, because `let` permits reassignment. Only `let count = 5;` fails: it attempts to declare a name that already exists in this scope, which is a SyntaxError.',
        },
      ],
    },
    summary:
      'Declaration creates a name, initialization gives it its first value, and reassignment points an existing name at a new value. Keeping the three apart makes errors readable: a declared-but-uninitialized `let` evaluates to `undefined`, while an undeclared name throws a ReferenceError. Because the right-hand side is evaluated before the assignment, a variable can safely appear on both sides of `=`. Redeclaring a `let` in the same scope is a SyntaxError, caught before any code runs — so if a whole file produces no output, look for one.',
    keyTakeaways: [
      'Declaration creates the name; initialization supplies the first value; reassignment changes it',
      'A declared-but-uninitialized `let` is `undefined`, not an error',
      'An undeclared name throws ReferenceError — a different situation entirely',
      '`total = total + 1` works because the old value is read before the new one is stored',
      'Redeclaring a `let` in the same scope is a SyntaxError, so nothing in the file runs',
    ],
    relatedLessons: ['l-m01-01', 'l-m01-03'],
    interviewConnections: [
      'What is the difference between declaration and initialization?',
      'What is the value of a declared but uninitialized variable?',
      'What happens if you declare the same `let` variable twice?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m01-03',
    slug: 'const-and-mutation',
    moduleId: M,
    order: 3,
    title: 'const, and What It Actually Protects',
    description: 'The most misunderstood keyword in modern JavaScript: const freezes the binding, not the value.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 16,
    xp: 30,
    topicIds: ['variables', 'objects'],
    prerequisites: ['l-m01-02'],
    learningObjectives: [
      'Declare variables with `const` and explain exactly what it prevents',
      'Explain why a `const` object can still be modified',
      'Distinguish reassignment from mutation with confidence',
      'Explain why `const` must be initialized at the point of declaration',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          '`const` declares a variable whose **binding** cannot be changed. Once the name refers to a value, it will refer to that same value for the rest of its life.',
          'That single sentence contains the whole lesson — but the word "binding" is doing a lot of work, and misreading it is responsible for one of the most common confusions in JavaScript. We will take it slowly.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The basic behaviour',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Reassigning a const is a TypeError.',
        code: [
          'const taxRate = 0.2;',
          'console.log(taxRate);   // 0.2',
          '',
          'taxRate = 0.25;',
          '// TypeError: Assignment to constant variable.',
        ].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Notice this is a `TypeError` at run time, not a `SyntaxError`. The file parses fine and begins executing; the failure happens on the line that attempts the reassignment. So unlike the redeclaration error from the previous lesson, everything above line 4 does run and does print.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: '`const` must be initialized immediately',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Because a `const` binding can never be changed after it is made, it has exactly one chance to be given a value — at the moment of declaration. Leaving it out is a `SyntaxError`.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'let — may be initialized later',
          code: [
            'let winner;',
            'winner = "Ada";',
            '',
            '// Fine. The binding is',
            '// allowed to change.',
          ].join('\n'),
        },
        right: {
          title: 'const — must be initialized now',
          code: [
            'const winner;',
            '// SyntaxError:',
            '// Missing initializer in',
            '// const declaration',
          ].join('\n'),
        },
        note: 'There would be no later opportunity to supply the value, so the language refuses the declaration outright rather than creating a permanently useless name.',
      },
      {
        kind: SECTION.HEADING,
        text: 'The part everyone gets wrong',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Here is the code that makes people believe `const` is broken.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'This runs without any error at all. Run it and see.',
        code: [
          'const user = { name: "Ada", role: "engineer" };',
          '',
          'user.role = "director";   // allowed',
          'user.active = true;       // allowed',
          'delete user.role;         // allowed',
          '',
          'console.log(user);',
          '',
          'const scores = [10, 20];',
          'scores.push(30);          // allowed',
          'scores[0] = 99;           // allowed',
          'console.log(scores);',
        ].join('\n'),
        output: ['{name: "Ada", active: true}', '[99, 20, 30]'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Every one of those lines is legal. The object was declared with `const`, and yet its contents changed completely.',
          'This is not a flaw and it is not an inconsistency. Recall the model from lesson 1: **a variable is a label attached to a value.** `const` puts a lock on the *label*, guaranteeing it will never be moved to point at something else. It says nothing whatsoever about the value on the other end of that label.',
        ],
      },
      {
        kind: SECTION.DIAGRAM,
        diagram: 'value-vs-reference',
        caption: 'A `const` object variable permanently points at one particular object. That object itself is still an ordinary, changeable object.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Reassignment versus mutation',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Two different operations that look superficially similar. Getting the vocabulary right makes this permanently clear.',
          '**Reassignment** changes which value a name refers to. It touches the label. `const` forbids it.',
          '**Mutation** changes the contents of a value that is already being referred to. It touches the thing at the far end of the label. `const` has no opinion about it.',
        ],
      },
      {
        kind: SECTION.TABLE,
        headers: ['Code', 'Operation', 'Allowed on a `const`?'],
        rows: [
          ['`user = {}`', 'Reassignment — points the label at a new object', 'No — TypeError'],
          ['`user.name = "Grace"`', 'Mutation — changes a property of the existing object', 'Yes'],
          ['`list = [1, 2]`', 'Reassignment — points the label at a new array', 'No — TypeError'],
          ['`list.push(4)`', 'Mutation — changes the existing array', 'Yes'],
          ['`list[0] = 9`', 'Mutation — changes an element of the existing array', 'Yes'],
          ['`count = count + 1`', 'Reassignment — a new number value', 'No — TypeError'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Why numbers and strings seem "properly" constant',
        body: [
          'You may notice that `const total = 5` really does feel unchangeable, while `const user = {}` does not. There is no special rule for numbers — the difference is that numbers, strings and booleans are **immutable values** in JavaScript. There is simply no operation that modifies the number 5 into something else.',
          'So with a primitive, reassignment is the *only* way to change anything, and `const` blocks it — giving the appearance of a fully constant value. With an object, mutation is also available, and `const` does not block that. You will meet this properly in the Data Types module.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'const config = { theme: "dark" };',
          '',
          'config.theme = "light";',
          'console.log(config.theme);',
          '',
          'config = { theme: "dark" };',
          'console.log("done");',
        ].join('\n'),
        options: [
          'Prints "light", then "done"',
          'Prints "light", then throws a TypeError',
          'Throws a TypeError immediately, printing nothing',
          'Prints "dark", then "done"',
        ],
        correct: 1,
        explanation:
          'Line 3 mutates a property of the existing object, which `const` permits, so line 4 prints `"light"`. Line 6 attempts to point the `config` label at a brand-new object — that is reassignment, and it throws `TypeError: Assignment to constant variable.` Because this is a runtime error rather than a syntax error, everything above it ran normally and its output was already printed.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Making a value genuinely unchangeable',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'If you actually want to prevent mutation, `const` is the wrong tool. `Object.freeze()` is the one that operates on the value.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'Object.freeze prevents mutation. In strict mode — which modules use — it throws rather than failing silently.',
        code: [
          'const settings = Object.freeze({ theme: "dark", fontSize: 14 });',
          '',
          'try {',
          '  settings.theme = "light";',
          '} catch (error) {',
          '  console.log(error.name + ":", error.message);',
          '}',
          '',
          'console.log(settings.theme);',
        ].join('\n'),
        output: ['TypeError: Cannot assign to read only property \'theme\' of object \'#<Object>\'', 'dark'].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.WARNING,
        title: '`Object.freeze` is shallow',
        body: [
          'Freezing an object protects its own properties, but not objects nested inside it. `Object.freeze({ user: { name: "Ada" } })` still allows `obj.user.name = "Grace"`.',
          'Deep immutability requires freezing recursively, or using a library built for it. This shallow-versus-deep distinction returns repeatedly — with copying, with equality, and with cloning — so it is worth noticing the pattern now.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The professional default',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'The convention across virtually every modern JavaScript codebase is: **use `const` by default, and switch to `let` only when you actually need to reassign.**',
          'The benefit is not about preventing bugs through enforcement — it is about communication. When a reader sees `const`, they know that name will mean the same thing for the rest of the block, and they can stop tracking it. Every `let` is a small signal that says "watch this one, it changes". Reserving `let` for the cases that genuinely change makes those cases stand out.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m01-03-a',
        title: 'Reassignment or mutation?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables', 'objects'],
        instructions: 'Given `const cart = ["apple"];`, which one of these lines throws a TypeError?',
        options: [
          'cart.push("banana");',
          'cart[0] = "pear";',
          'cart = ["banana"];',
          'cart.length = 0;',
        ],
        correct: 2,
        hints: [
          'Which line moves the label, and which lines change the thing the label points at?',
          '`const` only objects to the label being moved.',
        ],
        solution: 'cart = ["banana"];',
        solutionExplanation:
          'Only that line is reassignment — it attempts to point `cart` at a brand-new array, which the `const` binding forbids. The other three all mutate the existing array: `push` appends to it, index assignment replaces an element, and setting `length` to 0 empties it in place. All three are legal on a `const` because the label never moves.',
      },
      {
        id: 'ex-m01-03-b',
        title: 'Predict the const behaviour',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables', 'objects'],
        instructions: 'What does this print?',
        code: [
          'const totals = [1, 2, 3];',
          'totals.push(4);',
          'totals[0] = 100;',
          'console.log(totals.length, totals[0]);',
        ].join('\n'),
        options: ['4 100', '3 1', '4 1', 'TypeError'],
        correct: 0,
        hints: [
          'Does either line move the `totals` label to a different array?',
          'If not, both operations are mutations, and both are allowed.',
        ],
        solution: '4 100',
        solutionExplanation:
          'Both lines mutate the same array that `totals` has referred to since it was declared. `push(4)` makes the length 4, and the index assignment replaces the first element with 100. Neither line reassigns `totals`, so `const` never objects. The array is a changeable value; the binding to it is what is constant.',
      },
      {
        id: 'ex-m01-03-c',
        title: 'Choose the right keyword',
        kind: EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables'],
        instructions:
          'You need a variable that accumulates a running total inside a loop, and a second variable holding a tax rate that never changes. Which declarations are correct?',
        options: [
          'const runningTotal = 0; const TAX_RATE = 0.2;',
          'let runningTotal = 0; const TAX_RATE = 0.2;',
          'let runningTotal = 0; let TAX_RATE = 0.2;',
          'const runningTotal = 0; let TAX_RATE = 0.2;',
        ],
        correct: 1,
        hints: [
          'Which of the two variables gets reassigned?',
          'The default is `const`; `let` is the exception you reach for when reassignment is genuinely needed.',
        ],
        solution: 'let runningTotal = 0; const TAX_RATE = 0.2;',
        solutionExplanation:
          '`runningTotal` is reassigned on every pass of the loop, so it must be `let` — `const` would throw a TypeError on the first `+=`. `TAX_RATE` is a number that never changes, so `const` is correct and also communicates that intent to anyone reading the code. The other combinations either break at run time or use `let` for something that never varies, which makes readers track a value unnecessarily.',
      },
      {
        id: 'ex-m01-03-d',
        title: 'Update without reassigning',
        kind: EXERCISE_KIND.WRITE_FUNCTION,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['variables', 'objects'],
        instructions:
          'Write a function `promote(employee)` that takes an object with a `level` property, increases that level by 1, and returns the same object. The parameter must not be reassigned — mutate the object that was passed in.',
        starterCode: [
          'function promote(employee) {',
          '  // Increase employee.level by 1, then return employee.',
          '}',
        ].join('\n'),
        tests: [
          { name: 'raises the level by one', body: 'expect(promote({ level: 1 }).level).toBe(2);' },
          { name: 'returns the very same object, not a copy', body: 'const e = { level: 3 }; expect(promote(e)).toBe(e);' },
          { name: 'the caller sees the change', body: 'const e = { level: 5 }; promote(e); expect(e.level).toBe(6);' },
          { name: 'leaves other properties alone', body: 'const e = { name: "Ada", level: 2 }; promote(e); expect(e.name).toBe("Ada");', hidden: true },
        ],
        hints: [
          '`employee.level = employee.level + 1;` mutates the property in place.',
          'The shorter `employee.level += 1;` does the same thing.',
          'Return `employee` itself. Building and returning a new object would fail the "very same object" test.',
        ],
        solution: [
          'function promote(employee) {',
          '  employee.level += 1;',
          '  return employee;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Because objects are passed by reference, mutating a property inside the function is visible to the caller — which is exactly what the third test checks. The second test uses `toBe`, which compares identity rather than contents, so returning `{ ...employee, level: employee.level + 1 }` would fail it even though the contents would look right. That distinction between "equal contents" and "the same object" is central to the Data Types module. Worth noting: mutating a caller\'s object is convenient but is a side effect, and in the Functional JavaScript module you will see why returning a new object is often the safer design.',
      },
    ],
    quiz: {
      id: 'qz-m01-03',
      questions: [
        {
          id: 'q-m01-03-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'What exactly does `const` prevent?',
          options: [
            'Any change to the value it refers to',
            'Rebinding the name to a different value',
            'Adding new properties to an object',
            'The variable being read outside its block',
          ],
          correct: 1,
          optionExplanations: [
            'This is the common misconception. The contents of an object or array can still change freely.',
            'Correct — `const` locks the binding between name and value, and nothing more.',
            'Adding a property is mutation, which `const` permits. `Object.freeze` is what prevents that.',
            'Block scoping applies equally to `let`, so it is not what distinguishes `const`.',
          ],
          explanation:
            '`const` freezes the binding: the name will refer to the same value forever. It places no restriction on that value, which is why a `const` object can still be mutated. To make a value itself unchangeable you need `Object.freeze`.',
        },
        {
          id: 'q-m01-03-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables', 'objects'],
          prompt: 'Does this throw, and what ends up on screen?',
          code: [
            'const person = { name: "Ada" };',
            'person.name = "Grace";',
            'console.log(person.name);',
          ].join('\n'),
          options: ['Ada', 'Grace', 'TypeError', 'undefined'],
          correct: 1,
          optionExplanations: [
            'The property was genuinely changed on line 2, so the original value is gone.',
            'Correct — mutating a property of a `const` object is entirely legal.',
            'A TypeError would require reassigning `person` itself, which never happens here.',
            'The property exists and holds a string.',
          ],
          explanation:
            'Line 2 mutates the `name` property of the object that `person` refers to. The `person` binding itself is untouched — it still points at the same object — so `const` raises no objection and the new property value is printed.',
        },
        {
          id: 'q-m01-03-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'Why is `const winner;` a SyntaxError?',
          options: [
            'Because `const` variables must have names in capital letters',
            'Because a const binding can never be changed, so there would be no later chance to supply a value',
            'Because `const` may only be used with objects and arrays',
            'Because `undefined` is not a valid value for any variable',
          ],
          correct: 1,
          optionExplanations: [
            'Capitalisation is a naming convention for certain constants, never a language rule.',
            'Correct — the one opportunity to bind a value is at declaration.',
            '`const` works with every type of value, including numbers and strings.',
            '`undefined` is a perfectly valid value; a `let` variable holds it routinely.',
          ],
          explanation:
            'A `const` binding is fixed the moment it is created, so the declaration is the only opportunity to supply a value. Rather than create a name permanently stuck at `undefined`, the language rejects the declaration at parse time.',
        },
        {
          id: 'q-m01-03-4',
          kind: QUIZ_KIND.MULTIPLE,
          topicIds: ['variables', 'objects'],
          prompt: 'Given `const data = { items: [] };`, which of these throw? (Select all that apply.)',
          options: [
            'data.items.push("a");',
            'data = { items: ["a"] };',
            'data.items = ["a"];',
            'data.count = 0;',
          ],
          correct: [1],
          explanation:
            'Only reassigning `data` itself throws, because that moves the binding. Pushing into the nested array, replacing the `items` property, and adding a brand-new `count` property are all mutations of the object `data` already refers to, and `const` permits every one of them.',
        },
      ],
    },
    summary:
      '`const` freezes the binding between a name and a value — it guarantees the name will never be pointed at something else. It says nothing about the value itself, which is why a `const` object can have properties added, changed and deleted, and a `const` array can be pushed to and reordered. Reassignment moves the label and is forbidden; mutation changes the thing the label points at and is allowed. Because the binding is fixed at creation, `const` must be initialized immediately. To make a value genuinely unchangeable you need `Object.freeze`, which is shallow. The professional default is `const` everywhere, with `let` reserved for the values that genuinely change.',
    keyTakeaways: [
      '`const` locks the binding, not the value',
      'A `const` object or array can still be mutated — that is not a bug',
      'Reassignment moves the label; mutation changes what it points at',
      'Reassigning a `const` throws a TypeError at run time, so earlier lines still run',
      '`const` must be initialized at declaration, or it is a SyntaxError',
      '`Object.freeze` prevents mutation, and it is shallow',
    ],
    relatedLessons: ['l-m01-02', 'l-m01-04'],
    interviewConnections: [
      'Does `const` make a value immutable?',
      'Why can you push to a `const` array?',
      'What is the difference between reassignment and mutation?',
      'How would you make an object genuinely read-only?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m01-04',
    slug: 'var-and-why-to-avoid-it',
    moduleId: M,
    order: 4,
    title: 'var, and Why Modern Code Avoids It',
    description: 'The original declaration keyword: what it does differently, the bugs that caused, and why you still need to recognise it.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 16,
    xp: 30,
    topicIds: ['variables', 'scope', 'hoisting'],
    prerequisites: ['l-m01-03'],
    learningObjectives: [
      'Describe the three concrete ways `var` differs from `let` and `const`',
      'Explain what function scope means and how it differs from block scope',
      'Predict the output of classic `var` puzzles',
      'Explain why `var` still appears in interviews and older code',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'From 1995 until 2015, `var` was the only way to declare a variable in JavaScript. `let` and `const` arrived with ES2015 specifically to fix problems `var` had caused for two decades.',
          'You should not write `var` in new code. You should absolutely be able to read it, because it appears throughout older codebases, in a great deal of tutorial material still online, and — very reliably — in interview questions designed to test whether you understand scope.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Difference 1: `var` is function scoped, not block scoped',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A **block** is any pair of curly braces — the body of an `if`, a `for`, a `while`, or a bare `{ }`. `let` and `const` are confined to the block they are declared in. `var` ignores blocks entirely and is confined only to the enclosing **function**.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'let — confined to the block',
          code: [
            'function check() {',
            '  if (true) {',
            '    let secret = "hidden";',
            '  }',
            '  console.log(secret);',
            '}',
            '',
            '// ReferenceError:',
            '// secret is not defined',
          ].join('\n'),
        },
        right: {
          title: 'var — escapes the block',
          code: [
            'function check() {',
            '  if (true) {',
            '    var secret = "hidden";',
            '  }',
            '  console.log(secret);',
            '}',
            '',
            '// "hidden"',
            '// It leaked out of the if.',
          ].join('\n'),
        },
        note: 'The `var` version is not an error — that is precisely the problem. A variable intended to be temporary quietly remains available across the whole function, where it can be read or overwritten by unrelated code.',
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'Run this to see both behaviours side by side.',
        code: [
          'function demo() {',
          '  if (true) {',
          '    var functionScoped = "I escape the block";',
          '    let blockScoped = "I stay inside";',
          '    console.log("inside :", blockScoped);',
          '  }',
          '',
          '  console.log("outside:", functionScoped);',
          '',
          '  try {',
          '    console.log(blockScoped);',
          '  } catch (error) {',
          '    console.log("outside:", error.name, "-", error.message);',
          '  }',
          '}',
          '',
          'demo();',
        ].join('\n'),
        output: [
          'inside : I stay inside',
          'outside: I escape the block',
          'outside: ReferenceError - blockScoped is not defined',
        ].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Difference 2: `var` can be redeclared silently',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Declaring the same `let` twice in one scope is a SyntaxError that stops the file. Declaring the same `var` twice is simply allowed, and the second declaration quietly wins.',
          'In a fifteen-line file that is harmless. In a six-hundred-line function written by three people over two years, it means one developer can silently destroy another\'s variable and nothing will warn anybody.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        code: [
          'var total = 100;',
          '// ... two hundred lines of unrelated code ...',
          'var total = 0;        // no error, no warning',
          '',
          'console.log(total);   // 0 — the earlier value is gone',
        ].join('\n'),
      },
      {
        kind: SECTION.HEADING,
        text: 'Difference 3: `var` is hoisted and pre-set to `undefined`',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Before a function body runs, JavaScript processes its declarations. For a `var`, the name is created **and immediately given the value `undefined`**. The assignment stays where you wrote it, but the name exists from the very start of the function.',
          'The practical consequence: reading a `var` before its declaration line is legal and gives you `undefined` rather than an error.',
        ],
      },
      {
        kind: SECTION.ANNOTATED_CODE,
        language: 'javascript',
        code: [
          'console.log(count);',
          'var count = 5;',
          'console.log(count);',
        ].join('\n'),
        annotations: [
          { line: 1, text: 'Prints `undefined`. The name `count` already exists — it was created and pre-set before this line ran — but the assignment on line 2 has not happened yet.' },
          { line: 2, text: 'The assignment happens here, at the point you actually wrote it. Only the declaration moved; the value did not.' },
          { line: 3, text: 'Prints `5`, as expected.' },
        ],
      },
      {
        kind: SECTION.PROSE,
        body: [
          '`let` and `const` are also hoisted — the name is created early — but they are deliberately left **uninitialized**. Touching one before its declaration line throws a `ReferenceError` instead of silently handing you `undefined`. That gap between creation and initialization is called the **Temporal Dead Zone**, and it exists precisely to turn this silent `var` behaviour into a loud, findable error.',
        ],
      },
      {
        kind: SECTION.DIAGRAM,
        diagram: 'hoisting-tdz',
        caption: 'Both are hoisted. The difference is whether the name arrives pre-set to `undefined` or deliberately unusable. Module 10 covers this in full.',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'The most common misstatement about hoisting',
        body: [
          'People frequently say "`var` is hoisted and `let` is not". That is wrong, and interviewers listen for it.',
          'Both are hoisted — the binding is created before the code runs in either case. What differs is initialization: `var` bindings are initialized to `undefined`, while `let` and `const` bindings stay uninitialized until execution reaches the declaration. Saying "let is not hoisted" cannot explain why the TDZ produces a `ReferenceError` rather than the "is not defined" you would get for a name that truly did not exist.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The classic loop puzzle',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'This is the single most-asked `var` interview question, and it brings the block-scoping difference together with something you will meet properly in the Closures module.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'Run it. The var version prints 3 three times; the let version counts up.',
        code: [
          'console.log("with var:");',
          'for (var i = 0; i < 3; i++) {',
          '  setTimeout(function () {',
          '    console.log(i);',
          '  }, 0);',
          '}',
          '',
          'setTimeout(function () {',
          '  console.log("with let:");',
          '  for (let j = 0; j < 3; j++) {',
          '    setTimeout(function () {',
          '      console.log(j);',
          '    }, 0);',
          '  }',
          '}, 10);',
        ].join('\n'),
        output: ['with var:', '3', '3', '3', 'with let:', '0', '1', '2'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'With `var` there is exactly **one** `i` for the whole function, because `var` ignores the loop block. All three scheduled functions refer to that same single variable. By the time they run — after the loop has finished — `i` holds 3, so every one of them prints 3.',
          'With `let` the language creates a **fresh binding for each iteration**. Each scheduled function refers to its own separate `j`, holding the value that iteration had, so they print 0, 1 and 2.',
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INTERVIEW,
        title: 'A 30-second answer worth rehearsing',
        body: [
          '"`var` is function scoped, so the loop shares a single `i`. The callbacks all close over that one variable and run after the loop ends, when it is 3. `let` creates a new binding per iteration, so each callback closes over its own copy and you get 0, 1, 2. Before `let` existed, the fix was an IIFE to create a new scope per iteration."',
          'If you are asked to fix the `var` version without changing it to `let`, the classic answer is wrapping the body in an immediately-invoked function that takes `i` as a parameter.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'function tally() {',
          '  for (var i = 0; i < 3; i++) {',
          '    // counting',
          '  }',
          '  return i;',
          '}',
          '',
          'console.log(tally());',
        ].join('\n'),
        options: ['0', '2', '3', 'ReferenceError'],
        correct: 2,
        explanation:
          'Because `var i` is function scoped rather than block scoped, `i` is still alive after the loop finishes — this would be a ReferenceError with `let`. The loop exits when the condition `i < 3` first fails, which happens once `i` has been incremented to 3. So the function returns 3. Real code has genuinely relied on this leak to read a loop counter afterwards, which is exactly the kind of fragile pattern block scoping removed.',
      },
      {
        kind: SECTION.HEADING,
        text: 'A summary you can act on',
      },
      {
        kind: SECTION.TABLE,
        headers: ['Behaviour', '`var`', '`let`', '`const`'],
        rows: [
          ['Scope', 'Function', 'Block', 'Block'],
          ['Redeclaration in same scope', 'Allowed, silently', 'SyntaxError', 'SyntaxError'],
          ['Reassignment', 'Allowed', 'Allowed', 'TypeError'],
          ['Hoisted', 'Yes', 'Yes', 'Yes'],
          ['Initialized when hoisted', 'Yes, to `undefined`', 'No — TDZ', 'No — TDZ'],
          ['Reading before declaration', '`undefined`', 'ReferenceError', 'ReferenceError'],
          ['Must be initialized at declaration', 'No', 'No', 'Yes'],
          ['Fresh binding per loop iteration', 'No', 'Yes', 'Yes'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Is `var` ever the right choice today?',
        body: [
          'In new code, essentially never. Every behaviour it offers is either replicated by `let` or is a behaviour you do not want.',
          'That does not make it worthless knowledge. You will read it in older files, you will be asked about it in interviews, and understanding *why* it was replaced teaches you more about scope than simply being told the modern rule.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m01-04-a',
        title: 'Predict the leaked variable',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables', 'scope'],
        instructions: 'What does this print?',
        code: [
          'function run() {',
          '  if (true) {',
          '    var message = "hello";',
          '  }',
          '  return message;',
          '}',
          '',
          'console.log(run());',
        ].join('\n'),
        options: ['hello', 'undefined', 'ReferenceError', 'SyntaxError'],
        correct: 0,
        hints: [
          'Which kind of scope does `var` respect — the block, or the function?',
          'If it ignores the `if` block, is `message` still alive on line 5?',
        ],
        solution: 'hello',
        solutionExplanation:
          '`var` is function scoped, so the `if` block does not contain it. The variable belongs to `run` as a whole and is perfectly alive on line 5, returning `"hello"`. Change `var` to `let` and this becomes a ReferenceError, because `let` would confine `message` to the `if` block.',
      },
      {
        id: 'ex-m01-04-b',
        title: 'Predict the hoisted value',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables', 'hoisting'],
        instructions: 'What does this print?',
        code: [
          'console.log(a);',
          'var a = 1;',
        ].join('\n'),
        options: ['undefined', '1', 'ReferenceError', 'null'],
        correct: 0,
        hints: [
          'The declaration is processed before the code runs. Is the assignment processed early too?',
          '`var` bindings are created *and initialized* — to what value?',
        ],
        solution: 'undefined',
        solutionExplanation:
          'The `var a` declaration is hoisted to the top of the scope and initialized to `undefined` before any line executes. The assignment `= 1` stays exactly where it was written, on line 2. So line 1 reads a name that exists but holds `undefined`. Replace `var` with `let` and line 1 throws a ReferenceError instead, because a `let` binding is hoisted without being initialized — that is the Temporal Dead Zone.',
      },
      {
        id: 'ex-m01-04-c',
        title: 'Spot the silent redeclaration',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables'],
        instructions:
          'A colleague reports that `total` mysteriously becomes 0 halfway through a long function, with no error anywhere. Which cause is most consistent with those symptoms?',
        options: [
          'A `let total` was redeclared later in the same scope',
          'A `var total` was redeclared later in the same function',
          'A `const total` was reassigned later',
          'The variable was never declared at all',
        ],
        correct: 1,
        hints: [
          'The key clue is "no error anywhere". Which of these fails silently?',
        ],
        solution: 'A `var total` was redeclared later in the same function',
        solutionExplanation:
          'Only `var` allows a silent redeclaration — the second declaration simply overwrites the first with no warning, which exactly matches "no error anywhere". A repeated `let` would be a SyntaxError and the file would not run at all. Reassigning a `const` throws a TypeError. An undeclared variable throws a ReferenceError in strict mode. This silent-overwrite behaviour is one of the main reasons `let` and `const` were introduced.',
      },
      {
        id: 'ex-m01-04-d',
        title: 'Convert legacy code to modern declarations',
        kind: EXERCISE_KIND.REFACTOR,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 20,
        topicIds: ['variables', 'scope'],
        instructions:
          'Rewrite this function using `let` and `const` instead of `var`, choosing the right keyword for each variable. The behaviour must stay identical: `buildLabel(["a", "b"])` should return `"1. a | 2. b"`. Use `const` wherever a variable is never reassigned.',
        starterCode: [
          'function buildLabel(items) {',
          '  var separator = " | ";',
          '  var output = "";',
          '  for (var i = 0; i < items.length; i++) {',
          '    var line = (i + 1) + ". " + items[i];',
          '    output = output + line;',
          '    if (i < items.length - 1) {',
          '      output = output + separator;',
          '    }',
          '  }',
          '  return output;',
          '}',
        ].join('\n'),
        tests: [
          { name: 'joins two items correctly', body: 'expect(buildLabel(["a", "b"])).toBe("1. a | 2. b");' },
          { name: 'handles a single item with no separator', body: 'expect(buildLabel(["only"])).toBe("1. only");' },
          { name: 'returns an empty string for an empty array', body: 'expect(buildLabel([])).toBe("");' },
          { name: 'numbers three items in order', body: 'expect(buildLabel(["x", "y", "z"])).toBe("1. x | 2. y | 3. z");' },
          { name: 'no var remains in the source', body: 'expect(/\\bvar\\b/.test(buildLabel.toString())).toBe(false);', hidden: true },
        ],
        hints: [
          '`separator` is set once and never changed — that is a `const`.',
          '`output` is reassigned on nearly every pass, so it needs `let`.',
          'The loop counter `i` is reassigned by `i++`, so it must be `let`, not `const`.',
          '`line` is created fresh on each iteration and never reassigned within that iteration — `const` works there, and it is now correctly scoped to the block.',
        ],
        solution: [
          'function buildLabel(items) {',
          '  const separator = " | ";',
          '  let output = "";',
          '  for (let i = 0; i < items.length; i++) {',
          '    const line = (i + 1) + ". " + items[i];',
          '    output = output + line;',
          '    if (i < items.length - 1) {',
          '      output = output + separator;',
          '    }',
          '  }',
          '  return output;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Each keyword is chosen from how the variable is actually used. `separator` never changes, so `const` both prevents accidents and tells the reader it is fixed. `output` is rebuilt repeatedly, so it must be `let`. The counter `i` is reassigned by `i++` every pass, so `const` would throw — `let` is required. `line` is interesting: a `const` inside a loop body is fine, because each iteration creates a brand-new binding rather than reassigning the previous one. The refactor also silently fixes a latent bug: `line` and `i` are now confined to the loop instead of leaking into the whole function.',
      },
    ],
    quiz: {
      id: 'qz-m01-04',
      questions: [
        {
          id: 'q-m01-04-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables', 'scope'],
          prompt: 'What kind of scope does `var` use?',
          options: [
            'Block scope — confined to the nearest curly braces',
            'Function scope — confined to the nearest enclosing function',
            'Global scope always',
            'Module scope',
          ],
          correct: 1,
          optionExplanations: [
            'That describes `let` and `const`.',
            'Correct — which is why a `var` inside an `if` block is still visible after it.',
            'A `var` inside a function is local to that function, not global.',
            'Module scope applies to top-level declarations of any kind, and is not what distinguishes `var`.',
          ],
          explanation:
            '`var` is function scoped: it ignores blocks such as `if` and `for` bodies and belongs to the nearest enclosing function. That is the root cause of variables leaking out of the blocks they were meant to be confined to.',
        },
        {
          id: 'q-m01-04-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables', 'scope', 'closures'],
          prompt: 'What is printed, and in what order?',
          code: [
            'for (var i = 0; i < 3; i++) {',
            '  setTimeout(() => console.log(i), 0);',
            '}',
          ].join('\n'),
          options: ['0 1 2', '3 3 3', '0 0 0', '1 2 3'],
          correct: 1,
          optionExplanations: [
            'That is what you get with `let`, which creates a fresh binding each iteration.',
            'Correct — one shared `i`, read after the loop has already finished.',
            'The callbacks run after the loop completes, so they never see the starting value.',
            'The loop stops once `i` reaches 3; it is never 1, 2, 3 at read time.',
          ],
          explanation:
            '`var i` is function scoped, so all three iterations share a single variable. The scheduled callbacks do not run until the synchronous loop has finished, at which point `i` is 3. Every callback reads that same variable and prints 3. Switching to `let i` gives 0, 1, 2, because `let` creates a separate binding per iteration.',
        },
        {
          id: 'q-m01-04-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables', 'hoisting'],
          prompt: 'Which statement about hoisting is accurate?',
          options: [
            '`var` is hoisted; `let` and `const` are not',
            'All three are hoisted, but only `var` is initialized to `undefined`',
            'Nothing is hoisted in modern JavaScript',
            'Only function declarations are hoisted',
          ],
          correct: 1,
          optionExplanations: [
            'This is the common misstatement. It cannot explain why the TDZ throws a ReferenceError rather than "is not defined".',
            'Correct — the difference is initialization, not hoisting itself.',
            'Hoisting is a consequence of how scopes are created, and it has not changed.',
            'Function declarations are hoisted, but so are variable declarations of all three kinds.',
          ],
          explanation:
            'All three declaration forms create their binding before the code runs. `var` bindings are additionally initialized to `undefined`, which is why reading one early is legal. `let` and `const` bindings remain uninitialized until execution reaches the declaration — the Temporal Dead Zone — so reading one early throws.',
        },
        {
          id: 'q-m01-04-4',
          kind: QUIZ_KIND.TRUE_FALSE,
          topicIds: ['variables'],
          prompt: 'Declaring `var name = "a";` twice in the same function is a SyntaxError.',
          options: ['True', 'False'],
          correct: 1,
          optionExplanations: [
            'That is the behaviour of `let` and `const`, not `var`.',
            'Correct — `var` permits silent redeclaration, and the later one simply wins.',
          ],
          explanation:
            '`var` allows redeclaration in the same scope with no error and no warning; the second declaration overwrites the first. This silent overwriting in long functions was one of the main motivations for introducing `let` and `const`, which make it a SyntaxError.',
        },
      ],
    },
    summary:
      '`var` differs from `let` and `const` in three concrete ways: it is function scoped rather than block scoped, so it leaks out of `if` and `for` blocks; it can be redeclared silently in the same scope, overwriting earlier values with no warning; and it is hoisted *and initialized to `undefined`*, so reading it before its declaration line returns `undefined` instead of throwing. All three declaration forms are hoisted — the real difference is initialization, and saying "let is not hoisted" is the misstatement interviewers listen for. The classic loop puzzle follows directly from function scoping: one shared `i` means all callbacks print 3, while `let` creates a fresh binding per iteration and prints 0, 1, 2. Do not write `var` in new code, but do learn to read it.',
    keyTakeaways: [
      '`var` is function scoped; `let` and `const` are block scoped',
      '`var` can be silently redeclared, destroying an earlier value with no warning',
      'All declarations are hoisted — only `var` is initialized to `undefined`',
      'Reading a `let` before its declaration throws: the Temporal Dead Zone',
      'The `var` loop puzzle prints 3 3 3 because one variable is shared',
      'Read `var` fluently; do not write it',
    ],
    relatedLessons: ['l-m01-03', 'l-m01-06'],
    interviewConnections: [
      'What is the difference between var, let and const?',
      'What is hoisting? Are let and const hoisted?',
      'What is the Temporal Dead Zone?',
      'Why does a var loop with setTimeout print 3 3 3?',
      'How would you fix that loop without using let?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m01-05',
    slug: 'naming-variables',
    moduleId: M,
    order: 5,
    title: 'Naming Variables Well',
    description: 'The syntax rules the engine enforces, the conventions professionals follow, and why naming is a real engineering skill.',
    difficulty: DIFFICULTY.BEGINNER,
    estimatedMinutes: 13,
    xp: 25,
    topicIds: ['variables', 'clean-code'],
    prerequisites: ['l-m01-04'],
    learningObjectives: [
      'State the rules that make an identifier legal or illegal',
      'Apply camelCase and the other conventions used across professional JavaScript',
      'Recognise reserved words and why they cannot be used as names',
      'Choose names that make code readable without comments',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'There are two separate sets of rules for naming. The first is enforced by JavaScript itself — break these and your code will not run. The second is convention: not enforced by anything, but followed so consistently that ignoring it marks code as unprofessional and makes it harder for others to read.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The rules JavaScript enforces',
      },
      {
        kind: SECTION.LIST,
        ordered: true,
        items: [
          'A name may contain letters, digits, `$` and `_`.',
          'A name may **not begin with a digit**. `total2` is fine; `2total` is a SyntaxError.',
          'A name may not contain spaces or hyphens. `user name` and `user-name` are both invalid — the hyphen is read as subtraction.',
          'Names are **case sensitive**. `userName`, `username` and `UserName` are three unrelated identifiers.',
          'A name may not be a reserved word such as `let`, `const`, `class`, `return`, `function`, `new`, `this`, `typeof` or `if`.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        caption: 'Legal on the left, illegal on the right.',
        code: [
          '// Legal',
          'let total;',
          'let _private;',
          'let $element;',
          'let user2;',
          'let camelCaseName;',
          '',
          '// Illegal',
          '// let 2fast;        SyntaxError — starts with a digit',
          '// let user name;    SyntaxError — contains a space',
          '// let user-name;    SyntaxError — read as user minus name',
          '// let class;        SyntaxError — reserved word',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Technically legal, but do not',
        body: [
          'JavaScript actually permits a much wider range of characters than most people expect — `let café = 1;` and even `let 你好 = 1;` are valid, because the specification allows Unicode letters.',
          'Stick to plain ASCII in real code. Non-ASCII identifiers cause problems with fonts, terminals, search, and colleagues who cannot easily type them.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Reserved words',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Reserved words are identifiers the language has claimed for its own grammar. Using one as a variable name is a SyntaxError, because the parser cannot tell whether you meant your variable or the language construct.',
          'You do not need to memorise the list. If a name is reserved, you will find out immediately and unambiguously the first time you run the file.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        language_note: 'reference',
        caption: 'The reserved words, for reference. You will meet nearly all of them during this course.',
        code: [
          'break     case      catch     class     const     continue',
          'debugger  default   delete    do        else      export',
          'extends   finally   for       function  if        import',
          'in        instanceof let      new       return    super',
          'switch    this      throw     try       typeof    var',
          'void      while     with      yield     enum      static',
        ].join('\n'),
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.MISTAKE,
        title: 'Names that are legal but will hurt you',
        body: [
          'Some very tempting names are not reserved words, but shadow something important. `let name = "Ada"` at the top level of a browser script collides with the built-in `window.name`. Naming a variable `undefined`, `NaN` or `Infinity` is legal in a local scope and produces genuinely baffling bugs.',
          'Likewise, avoid naming things after built-ins you might want: `let Array = []` or `let String = "x"` will make later code that uses `Array.from` or `String(value)` fail in a way that is very hard to spot.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The conventions professionals follow',
      },
      {
        kind: SECTION.TABLE,
        headers: ['Thing being named', 'Convention', 'Example'],
        rows: [
          ['Variables and functions', 'camelCase', '`userName`, `calculateTotal`'],
          ['Classes and constructors', 'PascalCase', '`UserAccount`, `HttpClient`'],
          ['True constants known before run time', 'UPPER_SNAKE_CASE', '`MAX_RETRIES`, `API_BASE_URL`'],
          ['Private by convention', 'leading underscore', '`_internalCache`'],
          ['Booleans', 'is / has / can / should prefix', '`isActive`, `hasPermission`, `canEdit`'],
          ['Arrays and collections', 'plural nouns', '`users`, `orderIds`'],
          ['Functions', 'verb phrases', '`fetchUser`, `formatDate`, `validateEmail`'],
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'UPPER_SNAKE_CASE is narrower than people think',
        body: [
          'The convention is not "everything declared with `const`" — if it were, most of a modern codebase would be shouting, since `const` is the default keyword.',
          'Reserve it for values that are genuinely fixed and known before the program runs: `const MAX_UPLOAD_MB = 25`. A `const user = await fetchUser()` is still `const`, but it is an ordinary camelCase variable because its value is determined at run time.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Naming is an engineering skill',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A good name removes the need for a comment. Compare these two versions of identical logic.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'Needs a comment to survive',
          code: [
            '// d = days since signup',
            '// f = eligible for free trial',
            'const d = 14;',
            'let f = false;',
            '',
            'if (u.s === 1 && d < 30) {',
            '  f = true;',
            '}',
          ].join('\n'),
        },
        right: {
          title: 'Explains itself',
          code: [
            'const TRIAL_WINDOW_DAYS = 30;',
            'const daysSinceSignup = 14;',
            '',
            'const isEligibleForTrial =',
            '  user.isActive &&',
            '  daysSinceSignup < TRIAL_WINDOW_DAYS;',
          ].join('\n'),
        },
        note: 'The right-hand version is longer to type and dramatically faster to read — and you read code far more often than you write it. The magic number 30 also became a named constant, so its meaning travels with it.',
      },
      {
        kind: SECTION.LIST,
        items: [
          '**Say what it holds, not what type it is.** `userList` is weaker than `users`; the plural already implies a collection.',
          '**Avoid single letters** except for genuinely conventional cases: `i` in a short loop, `x`/`y` for coordinates, `e` for an event.',
          '**Do not abbreviate to save typing.** `calculateMonthlyRevenue` beats `calcMnthRev`. Your editor autocompletes; your reader does not.',
          '**Length should match scope.** A variable used across 200 lines earns a long descriptive name. One used on the very next line can be short.',
          '**Be consistent within a codebase.** If it is `fetchUser` in one file, do not write `getCustomer` for the same operation elsewhere.',
          '**Name booleans as questions.** `isValid` reads correctly in `if (isValid)`; a bare `valid` does not.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'let userName = "Ada";',
          'let username = "Grace";',
          '',
          'console.log(userName);',
        ].join('\n'),
        options: ['Ada', 'Grace', 'SyntaxError', 'undefined'],
        correct: 0,
        explanation:
          'JavaScript is case sensitive, so `userName` and `username` are two entirely unrelated variables. There is no redeclaration here and therefore no error — line 4 prints the value bound to `userName`, which is `"Ada"`. This is exactly why inconsistent capitalisation is such an effective source of bugs: the code runs perfectly and simply uses the wrong variable.',
      },
    ],
    exercises: [
      {
        id: 'ex-m01-05-a',
        title: 'Which name is illegal?',
        kind: EXERCISE_KIND.CONCEPTUAL,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables'],
        instructions: 'Which of these is not a legal JavaScript identifier?',
        options: [
          '_count',
          '$price',
          'total2',
          '2total',
        ],
        correct: 3,
        hints: [
          'Three of these start with a character that is allowed at the beginning of a name.',
        ],
        solution: '2total',
        solutionExplanation:
          'An identifier may contain digits but may not begin with one, so `2total` is a SyntaxError. Both `_` and `$` are explicitly permitted as starting characters — `$` is common in code that works with jQuery or DOM elements, and `_` is often used to signal that something is internal by convention.',
      },
      {
        id: 'ex-m01-05-b',
        title: 'Pick the professional name',
        kind: EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
        difficulty: DIFFICULTY.BEGINNER,
        xp: 10,
        topicIds: ['variables', 'clean-code'],
        instructions:
          'You need a variable holding whether the current user has confirmed their email address. Which name best follows professional convention?',
        options: [
          'const emailConfirmed = true;',
          'const isEmailConfirmed = true;',
          'const EMAIL_CONFIRMED = true;',
          'const flag = true;',
        ],
        correct: 1,
        hints: [
          'How should a boolean be named so that `if (name)` reads as a sentence?',
          'Is this value fixed before the program runs, or does it depend on the user?',
        ],
        solution: 'const isEmailConfirmed = true;',
        solutionExplanation:
          'Booleans are conventionally prefixed with `is`, `has`, `can` or `should` so that conditions read naturally: `if (isEmailConfirmed)`. `emailConfirmed` is acceptable but weaker — it could be mistaken for a date or a count. UPPER_SNAKE_CASE is wrong here because the value depends on a particular user at run time, not on a fixed configuration value. `flag` says nothing at all about what is being flagged.',
      },
      {
        id: 'ex-m01-05-c',
        title: 'Rename for readability',
        kind: EXERCISE_KIND.REFACTOR,
        difficulty: DIFFICULTY.EASY,
        xp: 20,
        topicIds: ['variables', 'clean-code'],
        instructions:
          'Rewrite this function with names that explain themselves, and turn the magic number into a named constant. The behaviour must not change: it returns the final price after applying a 15% discount when the quantity is 10 or more. Keep the function name `finalPrice` and its two parameters.',
        starterCode: [
          'function finalPrice(p, q) {',
          '  let t = p * q;',
          '  if (q >= 10) {',
          '    t = t * 0.85;',
          '  }',
          '  return t;',
          '}',
        ].join('\n'),
        tests: [
          { name: 'no discount below the threshold', body: 'expect(finalPrice(10, 5)).toBe(50);' },
          { name: 'applies the discount at exactly 10', body: 'expect(finalPrice(10, 10)).toBe(85);' },
          { name: 'applies the discount above the threshold', body: 'expect(finalPrice(20, 20)).toBe(340);' },
          { name: 'handles a quantity of zero', body: 'expect(finalPrice(10, 0)).toBe(0);' },
          { name: 'uses a descriptive name for the subtotal', body: 'expect(/\\b(subtotal|total|price)\\w*\\b/i.test(finalPrice.toString())).toBe(true);', hidden: true },
        ],
        hints: [
          '`p` is a unit price and `q` is a quantity — but the parameter names are yours to improve too.',
          '10 is a threshold. 0.85 is the result of a 15% discount. Both deserve names.',
          'Multiplying by `0.85` is clearer written as `1 - BULK_DISCOUNT_RATE` with the rate named as `0.15`.',
        ],
        solution: [
          'function finalPrice(unitPrice, quantity) {',
          '  const BULK_THRESHOLD = 10;',
          '  const BULK_DISCOUNT_RATE = 0.15;',
          '',
          '  let subtotal = unitPrice * quantity;',
          '',
          '  if (quantity >= BULK_THRESHOLD) {',
          '    subtotal = subtotal * (1 - BULK_DISCOUNT_RATE);',
          '  }',
          '',
          '  return subtotal;',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Every name now states what it holds, and the two magic numbers have become named constants — so when the business changes the threshold to 20, there is exactly one obvious line to edit. Writing `1 - BULK_DISCOUNT_RATE` rather than the pre-computed `0.85` keeps the discount percentage visible in the code instead of hidden inside arithmetic. `subtotal` remains `let` because it is genuinely reassigned; the two constants are `const` and shouted, because they are fixed values known before the program runs.',
      },
    ],
    quiz: {
      id: 'qz-m01-05',
      questions: [
        {
          id: 'q-m01-05-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'Why is `let user-name = "Ada";` a SyntaxError?',
          options: [
            'Because identifiers may not contain more than one word',
            'Because the hyphen is parsed as the subtraction operator',
            'Because `user` is a reserved word',
            'Because identifiers must use camelCase',
          ],
          correct: 1,
          optionExplanations: [
            'Multi-word names are fine — they simply have to be joined, as in camelCase.',
            'Correct — the parser reads `user - name`, which cannot be a declaration target.',
            '`user` is not reserved; you can declare it freely.',
            'camelCase is a convention, not a rule the parser enforces.',
          ],
          explanation:
            'A hyphen is the subtraction operator, so the parser sees `user - name` where it expected a single identifier. This is why JavaScript joins words with camelCase rather than the kebab-case used in CSS and HTML attributes.',
        },
        {
          id: 'q-m01-05-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables'],
          prompt: 'What does this print?',
          code: [
            'const Total = 10;',
            'const total = 20;',
            'console.log(Total + total);',
          ].join('\n'),
          options: ['30', '20', '40', 'SyntaxError — duplicate declaration'],
          correct: 0,
          optionExplanations: [
            'Correct — the two names differ only in case, so they are separate variables.',
            'Both variables exist and both are added.',
            'That would require both names to hold 20.',
            'Case-sensitive names are never duplicates, so there is no redeclaration.',
          ],
          explanation:
            'JavaScript identifiers are case sensitive, so `Total` and `total` are two distinct variables holding 10 and 20. There is no redeclaration and no error; the sum is 30. This is also why accidental capitalisation differences produce code that runs but uses the wrong value.',
        },
        {
          id: 'q-m01-05-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables', 'clean-code'],
          prompt: 'When is UPPER_SNAKE_CASE the right convention?',
          options: [
            'For every variable declared with `const`',
            'For fixed configuration values known before the program runs, such as `MAX_RETRIES`',
            'For all boolean variables',
            'For every variable at the top level of a file',
          ],
          correct: 1,
          optionExplanations: [
            '`const` is the default keyword in modern code, so this would leave most of a codebase shouting.',
            'Correct — it marks genuine fixed constants, not merely non-reassigned bindings.',
            'Booleans use camelCase with an `is`/`has` prefix.',
            'Position in the file has no bearing on the naming convention.',
          ],
          explanation:
            'UPPER_SNAKE_CASE signals a genuine constant: a fixed value, known before run time, that configures behaviour. A `const` whose value is computed at run time — such as a fetched user — is an ordinary camelCase variable that simply happens not to be reassigned.',
        },
      ],
    },
    summary:
      'Identifiers may contain letters, digits, `$` and `_`, may not begin with a digit, may not contain spaces or hyphens, are case sensitive, and may not be reserved words — break any of these and you get a SyntaxError. Beyond those rules, convention does the heavy lifting: camelCase for variables and functions, PascalCase for classes, UPPER_SNAKE_CASE for fixed configuration constants, `is`/`has` prefixes for booleans, plural nouns for collections and verb phrases for functions. Good naming is a genuine engineering skill, because a name that states its meaning removes the need for a comment, and magic numbers turned into named constants make later changes obvious rather than risky.',
    keyTakeaways: [
      'Names may not start with a digit or contain spaces or hyphens',
      'Identifiers are case sensitive — `userName` and `username` are unrelated',
      'Reserved words cannot be used as identifiers',
      'camelCase for variables, PascalCase for classes, UPPER_SNAKE_CASE for fixed constants',
      'Prefix booleans with is/has/can/should so conditions read as sentences',
      'A good name removes the need for a comment; name your magic numbers',
    ],
    relatedLessons: ['l-m01-04', 'l-m01-06'],
    interviewConnections: [
      'What makes a variable name invalid in JavaScript?',
      'What naming conventions do you follow, and why?',
    ],
  },

  /* ================================================================== */
  {
    id: 'l-m01-06',
    slug: 'choosing-and-lifecycle',
    moduleId: M,
    order: 6,
    title: 'Choosing a Keyword, and a Variable’s Lifecycle',
    description: 'Bringing the module together: a decision rule you can apply every time, and what actually happens to a variable from creation to disposal.',
    difficulty: DIFFICULTY.EASY,
    estimatedMinutes: 15,
    xp: 30,
    topicIds: ['variables', 'scope', 'clean-code'],
    prerequisites: ['l-m01-05'],
    learningObjectives: [
      'Apply a consistent rule for choosing between `const` and `let`',
      'Describe the four phases of a variable’s lifecycle',
      'Explain why declaring variables close to their use improves code',
      'Justify the const-by-default convention to another developer',
    ],
    sections: [
      {
        kind: SECTION.PROSE,
        body: [
          'You now know what each keyword does. This lesson turns that into something you can apply without thinking about it, and then looks at what happens to a variable over its lifetime — which is the bridge into the scope module.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The decision rule',
      },
      {
        kind: SECTION.STEPS,
        steps: [
          {
            title: 'Start with `const`',
            body: 'Always. This is the default for every new variable you write, regardless of what kind of value it holds.',
          },
          {
            title: 'Does this name need to be reassigned?',
            body: 'Not "does the value change" — does the *name* need to point at something different later? A loop counter does. An accumulator does. An object whose properties you edit does not.',
          },
          {
            title: 'If yes, change it to `let`',
            body: 'Your editor or linter will tell you immediately if you got this wrong: assigning to a `const` throws a TypeError at run time, and most linters flag it before you even save.',
          },
          {
            title: 'Never reach for `var`',
            body: 'There is no situation in new code where `var` is the better choice. Every behaviour it offers is either matched by `let` or is a behaviour you actively do not want.',
          },
        ],
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.TIP,
        title: 'The question to ask is about the name, not the value',
        body: [
          'This is where people go wrong. They see `user.name = "Grace"` and think "the value changed, so it should be `let`". But the name `user` never moved — it still refers to the same object. `const` is correct.',
          'Ask: **"will this identifier ever appear on the left of a bare `=` again?"** If no, it is `const`. Property assignments like `user.name =` and index assignments like `list[0] =` do not count, because the identifier is not the assignment target.',
        ],
      },
      {
        kind: SECTION.CODE,
        language: 'javascript',
        runnable: true,
        caption: 'Every choice below follows from the rule. Run it to confirm the behaviour.',
        code: [
          'const TAX_RATE = 0.2;              // fixed config, never changes',
          'const items = ["pen", "book"];    // the name never moves...',
          'items.push("lamp");               // ...even though the array grows',
          '',
          'let total = 0;                    // reassigned on every pass',
          'for (const item of items) {       // fresh binding each iteration',
          '  total += item.length;',
          '}',
          '',
          'const withTax = total * (1 + TAX_RATE);',
          '',
          'console.log("items:", items);',
          'console.log("total:", total);',
          'console.log("withTax:", withTax);',
        ].join('\n'),
        output: ['items: ["pen", "book", "lamp"]', 'total: 11', 'withTax: 13.2'].join('\n'),
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Notice line 6: `for (const item of items)`. That surprises people, because the loop obviously runs three times with three different values. It works because `for...of` creates a **brand-new binding on each iteration** rather than reassigning one. Nothing is ever reassigned, so `const` is correct — and it prevents you accidentally overwriting `item` inside the loop body.',
          'A classic `for (let i = 0; ...; i++)` loop is different: `i++` genuinely reassigns the same binding, so it must be `let`.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'The lifecycle of a variable',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'Every variable passes through the same four phases. You have already met each one individually; seeing them in sequence makes the scope module much easier.',
        ],
      },
      {
        kind: SECTION.STEPS,
        steps: [
          {
            title: '1. Creation (binding)',
            body: 'When execution enters a scope, JavaScript creates bindings for every declaration in it — before running a single line. This is hoisting. A `var` binding is created *and* set to `undefined`; a `let` or `const` binding is created but deliberately left uninitialized.',
          },
          {
            title: '2. Initialization',
            body: 'When execution reaches the declaration line, the binding receives its value. For `let` and `const` this is also the moment the Temporal Dead Zone ends and the name becomes usable.',
          },
          {
            title: '3. Use',
            body: 'The name can now be read, and — if it is `let` or `var` — reassigned. Lookups start in the current scope and walk outward through the scope chain until the name is found.',
          },
          {
            title: '4. Disposal',
            body: 'When the scope exits, its bindings are no longer reachable and the garbage collector may reclaim them. The important exception is a closure: if an inner function still refers to a variable, that variable survives after its scope has finished.',
          },
        ],
      },
      {
        kind: SECTION.DIAGRAM,
        diagram: 'hoisting-tdz',
        caption: 'Phases 1 and 2 for `var` versus `let`. The gap between creation and initialization is the Temporal Dead Zone.',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INFO,
        title: 'Where this is heading',
        body: [
          'Phase 4 is the seed of closures — one of the most-tested topics in JavaScript interviews. A variable normally disappears when its scope ends, but if a function created inside that scope still refers to it, the variable is kept alive for as long as that function exists.',
          'You do not need to understand closures yet. Module 10 covers scope properly and Module 32 covers closures in depth. Simply notice now that "the scope ended" and "the variable is gone" are not always the same thing.',
        ],
      },
      {
        kind: SECTION.HEADING,
        text: 'Declare close to first use',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'A habit inherited from older languages is declaring every variable at the top of a function. With `var` that was arguably honest, since the declarations were hoisted there anyway. With block-scoped `let` and `const` it is actively harmful: it widens each variable\'s reach far beyond where it is needed, and forces the reader to hold more in their head.',
        ],
      },
      {
        kind: SECTION.COMPARISON,
        left: {
          title: 'Declared far from use',
          code: [
            'function report(orders) {',
            '  let total;',
            '  let average;',
            '  let label;',
            '',
            '  total = orders.length;',
            '',
            '  // 20 lines of other work',
            '',
            '  average = sum / total;',
            '  label = `Avg ${average}`;',
            '  return label;',
            '}',
          ].join('\n'),
        },
        right: {
          title: 'Declared where it is needed',
          code: [
            'function report(orders) {',
            '  const total = orders.length;',
            '',
            '  // 20 lines of other work',
            '',
            '  const average = sum / total;',
            '  return `Avg ${average}`;',
            '}',
          ].join('\n'),
        },
        note: 'The right-hand version can use `const` throughout, because each name is bound exactly once at the point its value is known. Fewer names are alive at any moment, and none of them can be `undefined` by accident.',
      },
      {
        kind: SECTION.HEADING,
        text: 'Why teams enforce const-by-default',
      },
      {
        kind: SECTION.PROSE,
        body: [
          'The value of this convention is not primarily bug prevention — it is **reducing what a reader has to track**.',
          'When you scan a function and see `const`, you learn something permanent: that name means the same thing from here to the end of the block. You can stop watching it. Every `let` is a small signal saying "this one changes, keep an eye on it". If everything is `let`, that signal carries no information and you have to trace every variable manually.',
          'This is also why most professional linter configurations enable a rule that reports any `let` which is never actually reassigned.',
        ],
      },
      {
        kind: SECTION.PREDICT,
        code: [
          'const settings = { theme: "dark" };',
          '',
          'function applyTheme(config) {',
          '  config.theme = "light";',
          '  config = { theme: "blue" };',
          '  return config.theme;',
          '}',
          '',
          'console.log(applyTheme(settings), settings.theme);',
        ].join('\n'),
        options: ['blue light', 'blue dark', 'light light', 'TypeError'],
        correct: 0,
        explanation:
          'The parameter `config` is an ordinary reassignable binding — the caller\'s `const` applies only to the caller\'s own `settings` name, not to the parameter. So line 5 is legal and re-points `config` at a new object. Line 4 ran first and mutated the *original* object, which is why `settings.theme` is now `"light"`. Line 5 then points `config` locally at `{ theme: "blue" }`, and that is what gets returned. The caller\'s `settings` still refers to the original, mutated object. The output is `blue light`.',
      },
      {
        kind: SECTION.CALLOUT,
        tone: CALLOUT_TONE.INTERVIEW,
        title: 'A complete answer to "var vs let vs const"',
        body: [
          '"`var` is function scoped and can be silently redeclared; `let` and `const` are block scoped and cannot. All three are hoisted, but only `var` is initialized to `undefined` — `let` and `const` sit in the Temporal Dead Zone until their declaration line, so reading them early throws. `const` additionally fixes the binding, which means the name cannot be reassigned; it does not freeze the value, so a `const` object can still be mutated. In practice I use `const` by default and `let` only when a name genuinely needs reassignment."',
          'That single paragraph covers scope, hoisting, the TDZ, the binding-versus-value distinction and a practical convention — which is essentially the whole of this module.',
        ],
      },
    ],
    exercises: [
      {
        id: 'ex-m01-06-a',
        title: 'Choose the keyword for each case',
        kind: EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
        difficulty: DIFFICULTY.EASY,
        xp: 10,
        topicIds: ['variables'],
        instructions:
          'You have an array of results that you will push into repeatedly, and a counter that you will increment in a classic `for` loop. Which pair of declarations is correct?',
        options: [
          'let results = []; const i = 0;',
          'const results = []; let i = 0;',
          'let results = []; let i = 0;',
          'const results = []; const i = 0;',
        ],
        correct: 1,
        hints: [
          'Does pushing into an array move the array\'s name to a different value?',
          'Does `i++` reassign the identifier `i`?',
        ],
        solution: 'const results = []; let i = 0;',
        solutionExplanation:
          'Pushing mutates the array but never re-points the `results` name, so `const` is correct and communicates that the name is stable. The loop counter is genuinely reassigned by `i++`, so it must be `let` — `const` would throw a TypeError on the first increment. This pairing catches out a lot of people, because it feels backwards: the thing that visibly changes is `const`, and the thing that looks like a simple number is `let`.',
      },
      {
        id: 'ex-m01-06-b',
        title: 'Predict the parameter reassignment',
        kind: EXERCISE_KIND.PREDICT_OUTPUT,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 15,
        topicIds: ['variables'],
        instructions: 'What does this print?',
        code: [
          'const numbers = [1, 2];',
          '',
          'function replace(list) {',
          '  list = [9, 9, 9];',
          '  return list.length;',
          '}',
          '',
          'console.log(replace(numbers), numbers.length);',
        ].join('\n'),
        options: ['3 2', '3 3', '2 2', 'TypeError'],
        correct: 0,
        hints: [
          'Does reassigning a parameter affect the caller\'s variable?',
          'The parameter is its own binding; it starts out referring to the same array, but re-pointing it is purely local.',
        ],
        solution: '3 2',
        solutionExplanation:
          'The parameter `list` is a separate binding that initially refers to the same array as `numbers`. Reassigning `list` re-points only that local name at a brand-new array, so the function returns 3. The caller\'s `numbers` still refers to the original two-element array, so `numbers.length` is 2. Had the function instead written `list.push(9)`, it would have mutated the shared array and the caller *would* have seen the change. There is no TypeError because the `const` applies to `numbers`, not to the parameter.',
      },
      {
        id: 'ex-m01-06-c',
        title: 'Tighten the declarations',
        kind: EXERCISE_KIND.REFACTOR,
        difficulty: DIFFICULTY.MEDIUM,
        xp: 20,
        topicIds: ['variables', 'clean-code'],
        instructions:
          'Rewrite this function so that every variable uses the narrowest correct keyword and is declared close to where it is first used. Behaviour must be unchanged: `describe(["a", "bb"])` returns `"2 items, 3 characters"`. Do not use `var`.',
        starterCode: [
          'function describe(items) {',
          '  var count;',
          '  var characters;',
          '  var i;',
          '',
          '  count = items.length;',
          '  characters = 0;',
          '',
          '  for (i = 0; i < items.length; i++) {',
          '    characters = characters + items[i].length;',
          '  }',
          '',
          '  return count + " items, " + characters + " characters";',
          '}',
        ].join('\n'),
        tests: [
          { name: 'describe(["a", "bb"]) is correct', body: 'expect(describe(["a", "bb"])).toBe("2 items, 3 characters");' },
          { name: 'handles an empty array', body: 'expect(describe([])).toBe("0 items, 0 characters");' },
          { name: 'handles a single item', body: 'expect(describe(["hello"])).toBe("1 items, 5 characters");' },
          { name: 'handles longer input', body: 'expect(describe(["ab", "cd", "ef"])).toBe("3 items, 6 characters");' },
          { name: 'contains no var declarations', body: 'expect(/\\bvar\\b/.test(describe.toString())).toBe(false);', hidden: true },
        ],
        hints: [
          '`count` is set once from `items.length` and never changed — declare it with `const` at the point it is computed.',
          '`characters` is reassigned inside the loop, so it needs `let`.',
          'The counter `i` belongs in the `for` header, declared with `let`, not at the top of the function.',
          'A `for...of` loop removes the counter entirely and lets you use `const` for each element.',
        ],
        solution: [
          'function describe(items) {',
          '  const count = items.length;',
          '  let characters = 0;',
          '',
          '  for (const item of items) {',
          '    characters += item.length;',
          '  }',
          '',
          '  return count + " items, " + characters + " characters";',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Each declaration now sits where its value becomes known, and each uses the narrowest keyword that works. `count` never changes, so `const`. `characters` accumulates, so `let`. The counter disappeared entirely by switching to `for...of`, which creates a fresh `item` binding on every iteration — that is why `const item` is legal despite the value differing each pass. The refactor also removes three variables that were previously `undefined` for the first few lines of the function, which is one fewer thing for a reader to track. A classic `for (let i = 0; ...)` loop would also be a correct answer.',
      },
      {
        id: 'ex-m01-06-d',
        title: 'Fix the const misuse',
        kind: EXERCISE_KIND.FIX_BUG,
        difficulty: DIFFICULTY.EASY,
        xp: 15,
        topicIds: ['variables'],
        instructions:
          'This function throws when called. Fix it by changing only the declaration keywords — do not restructure the logic. `countdown(3)` should return the string `"3, 2, 1, liftoff"`.',
        starterCode: [
          'function countdown(from) {',
          '  const parts = [];',
          '  const current = from;',
          '',
          '  while (current > 0) {',
          '    parts.push(current);',
          '    current = current - 1;',
          '  }',
          '',
          '  parts.push("liftoff");',
          '  return parts.join(", ");',
          '}',
        ].join('\n'),
        tests: [
          { name: 'countdown(3) is correct', body: 'expect(countdown(3)).toBe("3, 2, 1, liftoff");' },
          { name: 'countdown(1) is correct', body: 'expect(countdown(1)).toBe("1, liftoff");' },
          { name: 'countdown(0) returns just liftoff', body: 'expect(countdown(0)).toBe("liftoff");' },
          { name: 'countdown(5) is correct', body: 'expect(countdown(5)).toBe("5, 4, 3, 2, 1, liftoff");', hidden: true },
        ],
        hints: [
          'Read the error message. Which line does it point at, and what is it complaining about?',
          'One of the two `const` declarations is reassigned. Which one?',
          '`parts` is only ever pushed into — that is mutation, so its `const` is correct and should stay.',
        ],
        solution: [
          'function countdown(from) {',
          '  const parts = [];',
          '  let current = from;',
          '',
          '  while (current > 0) {',
          '    parts.push(current);',
          '    current = current - 1;',
          '  }',
          '',
          '  parts.push("liftoff");',
          '  return parts.join(", ");',
          '}',
        ].join('\n'),
        solutionExplanation:
          'Only `current` needed to change. It is reassigned on every pass of the loop, so `const` threw `TypeError: Assignment to constant variable.` on the first iteration. `parts` stays `const` because it is only ever mutated by `push` — the name never moves to a different array. This is the module\'s central distinction in a single function: one variable needs `let` because its *binding* changes, the other keeps `const` because only its *contents* change.',
      },
    ],
    quiz: {
      id: 'qz-m01-06',
      questions: [
        {
          id: 'q-m01-06-1',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables'],
          prompt: 'What question should you ask to decide between `const` and `let`?',
          options: [
            'Will the value ever change in any way?',
            'Will this identifier ever appear on the left of a bare `=` again?',
            'Is the value a primitive or an object?',
            'Is the variable declared inside a function?',
          ],
          correct: 1,
          optionExplanations: [
            'This is the misleading version — a `const` object\'s contents change all the time.',
            'Correct — the question is about rebinding the name, not about the value changing.',
            'The type of value is irrelevant to the choice of keyword.',
            'Location has no bearing on whether reassignment is needed.',
          ],
          explanation:
            'The choice is about the binding. If the identifier itself is never the target of a later assignment, `const` is correct — even if the object or array it refers to is modified extensively.',
        },
        {
          id: 'q-m01-06-2',
          kind: QUIZ_KIND.OUTPUT,
          topicIds: ['variables'],
          prompt: 'Does this run, and what does it print?',
          code: [
            'const letters = ["a", "b", "c"];',
            'let joined = "";',
            '',
            'for (const letter of letters) {',
            '  joined += letter;',
            '}',
            '',
            'console.log(joined);',
          ].join('\n'),
          options: [
            'TypeError — `letter` is const and changes each iteration',
            'It prints "abc"',
            'TypeError — `joined` cannot be reassigned',
            'It prints "c"',
          ],
          correct: 1,
          optionExplanations: [
            '`for...of` creates a fresh binding per iteration rather than reassigning one, so `const` is legal.',
            'Correct — the loop is valid and the accumulator builds up "abc".',
            '`joined` is `let`, so reassignment via `+=` is exactly what it is for.',
            '`+=` appends rather than replaces, so all three letters accumulate.',
          ],
          explanation:
            '`for...of` binds a brand-new `letter` on every iteration, so nothing is ever reassigned and `const` is correct. `joined` is `let` because `+=` genuinely rebinds it each pass. The result is "abc".',
        },
        {
          id: 'q-m01-06-3',
          kind: QUIZ_KIND.SINGLE,
          topicIds: ['variables', 'scope'],
          prompt: 'Why is declaring all variables at the top of a function discouraged in modern JavaScript?',
          options: [
            'Because it is slower at run time',
            'Because it widens each variable’s reach unnecessarily and often forces `let` where `const` would do',
            'Because `let` and `const` cannot be declared at the top of a function',
            'Because hoisting moves them back down anyway',
          ],
          correct: 1,
          optionExplanations: [
            'There is no meaningful performance difference.',
            'Correct — declaring at first use narrows scope and enables `const`.',
            'They can be declared anywhere; the point is that doing so at the top is rarely the best place.',
            'Hoisting moves declarations conceptually to the top of the scope, never downward.',
          ],
          explanation:
            'Top-of-function declarations were a sensible habit with function-scoped `var`. With block scoping, declaring at the point of first use keeps each name alive for the shortest span, lets you bind it once with `const`, and avoids a stretch of code where the variable exists but is still `undefined`.',
        },
        {
          id: 'q-m01-06-4',
          kind: QUIZ_KIND.MULTIPLE,
          topicIds: ['variables', 'hoisting', 'scope'],
          prompt: 'Which statements about the variable lifecycle are correct? (Select all that apply.)',
          options: [
            'Bindings are created when execution enters the scope, before any line runs',
            '`let` bindings are initialized to `undefined` when created',
            'A variable may outlive its scope if an inner function still refers to it',
            'The Temporal Dead Zone ends when execution reaches the declaration line',
          ],
          correct: [0, 2, 3],
          explanation:
            'Bindings for every declaration in a scope are created on entry — that is hoisting. `let` bindings are created uninitialized, not set to `undefined`; only `var` gets that treatment, which is the whole reason the TDZ exists. The TDZ ends at the declaration line, when the binding finally receives its value. And a variable captured by an inner function survives its scope, which is the mechanism behind closures.',
        },
      ],
    },
    summary:
      'Use `const` by default and switch to `let` only when the identifier itself must be reassigned — a question about the binding, not about whether the value changes, which is why a heavily mutated `const` array is still correct. `for...of` creates a fresh binding per iteration, so `const item` works, while a classic `for` loop\'s `i++` genuinely rebinds and needs `let`. Every variable passes through creation, initialization, use and disposal: bindings are created on scope entry before any line runs, `var` is initialized to `undefined` while `let` and `const` wait in the Temporal Dead Zone, and a variable captured by an inner function can outlive its scope entirely. Declaring names at first use rather than at the top of a function narrows their reach and usually lets you use `const`.',
    keyTakeaways: [
      'Default to `const`; use `let` only when the name is reassigned',
      'Ask "will this identifier be on the left of a bare `=` again?"',
      '`for...of` allows `const` because each iteration creates a new binding',
      'Lifecycle: creation → initialization → use → disposal',
      'A variable captured by an inner function outlives its scope — the seed of closures',
      'Declare variables at first use, not at the top of the function',
    ],
    relatedLessons: ['l-m01-03', 'l-m01-04', 'l-m01-05'],
    interviewConnections: [
      'What is the difference between var, let and const?',
      'When would you choose let over const?',
      'Why can you use const in a for...of loop?',
      'What happens to a variable when its scope ends?',
    ],
  },
];
