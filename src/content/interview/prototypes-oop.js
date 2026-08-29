import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Prototypes, classes and object-oriented JavaScript.
 *
 * The distinction that matters throughout: an object's internal prototype
 * (`[[Prototype]]`, read with `Object.getPrototypeOf`) is not the same thing as
 * a constructor function's `.prototype` property. Conflating them is the single
 * most common way this topic goes wrong.
 */

const TOPIC = 'Prototypes & Classes';

export const questions = [
  {
    id: 'iv-proto-prototypal-inheritance',
    question: 'What is prototypal inheritance?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['prototypes', 'objects'],
    relatedLessons: ['l-m30-01'],
    shortAnswer:
      'Every object has an internal link to another object — its prototype. When a property is not found on an object, the engine follows that link, and keeps following it up the chain until it finds the property or reaches `null`. Objects inherit directly from other objects; there are no classes underneath.',
    deepAnswer: [
      'Each object has an internal slot, written `[[Prototype]]` in the specification and read with `Object.getPrototypeOf(obj)`. Property lookup checks the object itself, then its prototype, then that object\'s prototype, and so on until `null` ends the chain.',
      'Writes behave differently from reads, and this asymmetry matters: assigning `obj.x = 1` creates an **own** property on `obj` even if `x` exists on the prototype. It shadows rather than modifies the inherited one. Only reads walk the chain.',
      'The distinction to state precisely: **`.prototype` is a property of constructor functions**, not of ordinary objects. It is the object that will **become** the `[[Prototype]]` of instances created with `new`. So `user.__proto__ === User.prototype` — the instance\'s internal prototype is the constructor\'s `.prototype` object. Saying "every object has a `.prototype` property" is simply false.',
      '`Object.create(proto)` is the most direct expression of the model: it makes a new object whose prototype is exactly what you passed. `Object.create(null)` makes an object with no prototype at all — useful as a dictionary, since it has no inherited `toString` or `constructor` to collide with data keys.',
      '**Why it matters practically**: methods live on the prototype and are therefore shared by every instance, rather than duplicated per object. A thousand instances share one function object.',
      'The trade-off worth naming: a long chain makes lookups marginally slower, and mutating a prototype after objects exist (`Object.setPrototypeOf`) deoptimises badly in engines — it is legal and almost always a mistake.',
    ],
    keyPoints: [
      'Objects link to other objects via `[[Prototype]]`; lookup walks the chain to `null`',
      'Reads walk the chain; writes create an own property that shadows',
      '`.prototype` belongs to constructor functions, not to ordinary objects',
      '`Object.getPrototypeOf(instance) === Constructor.prototype`',
      '`Object.create(null)` gives a prototype-less dictionary',
      'Methods on the prototype are shared, not copied per instance',
    ],
    commonMistakes: [
      '"Every object has a `.prototype` property." Only functions do.',
      'Believing assignment modifies the inherited property rather than shadowing it.',
    ],
    followUps: [
      'Why is `Object.getPrototypeOf(user) === User.prototype` true?',
      'What is the difference between an own and an inherited property?',
      'When would you use `Object.create(null)`?',
    ],
  },

  {
    id: 'iv-proto-getprototypeof-output',
    question: 'Prototype identity — what does this print?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.OUTPUT,
    topicIds: ['prototypes', 'classes', 'objects'],
    relatedLessons: ['l-m30-01'],
    code:
      'class User {\n' +
      '  constructor(name) {\n' +
      '    this.name = name;\n' +
      '  }\n' +
      '  greet() {\n' +
      '    return "hi";\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'const user = new User("Ada");\n' +
      '\n' +
      'console.log(Object.getPrototypeOf(user) === User.prototype);\n' +
      'console.log(Object.hasOwn(user, "greet"));\n' +
      'console.log(Object.hasOwn(user, "name"));\n' +
      'console.log(user.greet === User.prototype.greet);',
    options: ['true\nfalse\ntrue\ntrue', 'true\ntrue\ntrue\ntrue', 'false\nfalse\ntrue\ntrue', 'true\nfalse\ntrue\nfalse'],
    correct: 0,
    shortAnswer:
      '`true`, `false`, `true`, `true`. The instance\'s internal prototype **is** `User.prototype`. `greet` lives on the prototype, so it is not an own property — but it is found by lookup, and it is the same function object. `name` is assigned in the constructor, so it is own.',
    deepAnswer: [
      '**Line 1** — `new User(...)` sets the instance\'s `[[Prototype]]` to `User.prototype`. They are the same object, so `===` is `true`. This is the identity that defines the relationship.',
      '**Line 2** — `greet` is defined in the class body, which puts it on `User.prototype`, not on the instance. `Object.hasOwn(user, "greet")` is therefore `false`. Accessing `user.greet` still works because lookup walks the chain.',
      '**Line 3** — `this.name = name` in the constructor creates an **own** property on the instance, so this is `true`. That is the general rule: constructor assignments are per-instance; class-body methods are shared on the prototype.',
      '**Line 4** — `user.greet` resolves through the chain to the very same function object stored on the prototype, so identity holds. This is why a thousand instances cost one function, not a thousand.',
      'The contrast worth volunteering: a **class field** written as `greet = () => "hi"` would be created per instance in the constructor, making `hasOwn(user, "greet")` `true` and `user.greet === User.prototype.greet` `false` — because `User.prototype.greet` would not exist at all. That is the real trade-off behind class-field arrows.',
    ],
    keyPoints: [
      'An instance\'s `[[Prototype]]` is the constructor\'s `.prototype`',
      'Class-body methods live on the prototype — not own properties',
      'Constructor assignments create own properties',
      'All instances share one function object per method',
      'Class-field arrows are per-instance and are not on the prototype',
    ],
    commonMistakes: [
      'Expecting `hasOwn(user, "greet")` to be true because `user.greet()` works.',
      'Not knowing class fields behave differently from class methods.',
    ],
    followUps: [
      'How would the answer change if `greet` were a class field arrow?',
      'Where do static methods live?',
      'Why does the shared-function behaviour matter for memory?',
    ],
  },

  {
    id: 'iv-proto-class-sugar',
    question: 'Are JavaScript classes "just syntactic sugar" over prototypes?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['classes', 'prototypes'],
    relatedLessons: ['l-m31-01'],
    shortAnswer:
      'Mostly, but not entirely. Classes do use the prototype system underneath, yet they add real semantics that constructor functions do not have: they are not callable without `new`, their bodies are always strict, class fields and `#private` members exist, and `super` works properly.',
    deepAnswer: [
      '**What is genuinely sugar**: methods in a class body go on `Constructor.prototype`, `extends` sets up the prototype chain, and instances are created with the same `new` machinery. `typeof MyClass` is `"function"`.',
      '**What is not sugar** — and this is the substance of the answer:',
      '**Calling without `new` throws.** `MyClass()` is a `TypeError`. A constructor function called without `new` silently runs with the wrong `this`, which is a whole bug class classes eliminate.',
      '**Class bodies are always strict**, regardless of the surrounding code.',
      '**Class declarations are in the TDZ** — unlike function declarations, you cannot use a class before its declaration executes.',
      '**`#private` fields are genuinely private** at the language level. They are not properties, so they never appear in `Object.keys`, `JSON.stringify` or a spread, and there is no string that reaches them. The old `_name` convention was only a convention.',
      '**`super` works properly** in derived classes. Emulating `super` with constructor functions requires `Parent.call(this)` plus manual prototype wiring, and it never handles built-in subclassing correctly.',
      '**Subclassing built-ins works** — extending `Array` or `Error` behaves correctly with classes and does not with ES5 constructor functions, because `new.target` and the `[[Construct]]` protocol are involved.',
      'The right framing: classes are a genuine language feature **implemented on** the prototype system, not a cosmetic wrapper. And they do not replace prototypes — understanding the chain is still what explains method lookup, `instanceof` and `hasOwn` behaviour.',
    ],
    keyPoints: [
      'Methods still go on `.prototype`; `typeof` is `"function"`',
      'Cannot be called without `new` — throws',
      'Class bodies are always strict; declarations are in the TDZ',
      '`#private` fields are truly private, not a convention',
      '`super` and built-in subclassing work correctly',
      'A real feature built on prototypes, not a cosmetic wrapper',
    ],
    commonMistakes: [
      'Answering a flat "yes, just sugar" with no exceptions.',
      'Claiming classes replaced prototypes.',
    ],
    followUps: [
      'What happens if you call a class without `new`?',
      'How are `#private` fields different from a `_name` convention?',
      'Why did subclassing `Array` not work with ES5 constructor functions?',
    ],
  },

  {
    id: 'iv-proto-instanceof',
    question: 'How does `instanceof` work, and when does it fail?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['prototypes', 'classes', 'types'],
    relatedLessons: ['l-m30-01'],
    shortAnswer:
      'It walks the object\'s prototype chain looking for the constructor\'s `.prototype` object. It fails across execution contexts — an array from an iframe is not `instanceof` your `Array` — and it can be overridden entirely via `Symbol.hasInstance`.',
    deepAnswer: [
      '`obj instanceof Fn` checks whether `Fn.prototype` appears anywhere in `obj`\'s prototype chain. It is a chain-membership test, not a type check — which is why it correctly reports `true` for a subclass instance against a parent class.',
      '**Cross-realm failure** is the classic gotcha. An array created in an iframe, a worker, or a different Node VM context has a **different** `Array.prototype`, so `arr instanceof Array` is `false` even though it is genuinely an array. This is exactly why `Array.isArray` exists — it checks the internal slot rather than the chain, and works across realms.',
      '**It can be lied to.** `Symbol.hasInstance` lets a class define what `instanceof` means for it, so the operator can return anything. That is powerful and worth using sparingly, since readers reasonably expect prototype-chain semantics.',
      '**It does not work on primitives.** `"abc" instanceof String` is `false`, because a primitive string has no prototype chain of its own — only a `String` object wrapper would match.',
      '**Better alternatives depending on the question**: `Array.isArray` for arrays; `typeof` for primitives and functions; `Object.prototype.toString.call(x)` for a built-in tag (which `Symbol.toStringTag` can also customise); and duck typing — checking for the method you actually need — when you care about capability rather than lineage.',
      'For custom errors, a common robust pattern is a `name` or a discriminant property alongside `instanceof`, because bundling and realm boundaries make chain checks fragile in ways plain data is not.',
    ],
    keyPoints: [
      'Walks the prototype chain for the constructor\'s `.prototype`',
      'Fails cross-realm — iframe arrays are not `instanceof Array`',
      '`Array.isArray` works across realms; use it for arrays',
      'Overridable via `Symbol.hasInstance`',
      'Returns `false` for primitives',
      'Duck typing is often the better check for capability',
    ],
    commonMistakes: [
      'Using `instanceof Array` where `Array.isArray` is correct.',
      'Expecting `"abc" instanceof String` to be true.',
    ],
    followUps: [
      'Why does an iframe array fail `instanceof Array`?',
      'How would you make a custom error type reliably detectable?',
      'What does `Symbol.hasInstance` let you do?',
    ],
  },

  {
    id: 'iv-proto-composition-inheritance',
    question: 'When would you choose composition over inheritance?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['design-patterns', 'classes', 'clean-code'],
    relatedLessons: ['l-m41-01'],
    shortAnswer:
      'Almost always — inheritance is right only for a genuine, stable "is-a" relationship where the subclass is substitutable for the parent. Composition is more flexible because behaviour can be mixed independently, and it avoids the deep hierarchies that make change expensive.',
    deepAnswer: [
      '**Inheritance couples tightly.** A subclass depends on its parent\'s implementation, not just its interface, so a change in the parent can silently break every descendant — the fragile base class problem. It is also single: a class can extend one parent, so orthogonal behaviours force awkward hierarchies.',
      '**The classic failure** is a hierarchy that models a taxonomy rather than behaviour. `Bird extends Animal` seems fine until `Penguin extends Bird` inherits `fly()`. The fix is composition: a `CanFly` behaviour that only flying birds have.',
      '**The test to apply** is the Liskov substitution principle: can every instance of the subclass be used wherever the parent is expected, without surprising the caller? If a subclass has to throw on an inherited method, or override it to do nothing, the relationship is wrong.',
      '**Composition in JavaScript** is straightforward because functions and objects are first-class: pass collaborators in, use factory functions returning objects with the behaviours they need, or use mixins — functions taking a base class and returning an extended one, which composes where single inheritance cannot.',
      '**Where inheritance genuinely fits**: a small, stable hierarchy with real substitutability — custom `Error` subclasses, framework base components, an abstract interface with a couple of implementations. One or two levels deep is usually the practical limit.',
      'The honest position is not "inheritance is bad" — it is that inheritance is a strong, permanent coupling that should be paid for by a real is-a relationship, and composition is the lighter default when in doubt.',
    ],
    keyPoints: [
      'Inheritance couples subclasses to the parent implementation',
      'Fragile base class: a parent change breaks descendants',
      'Only one parent — orthogonal behaviours do not fit',
      'Apply Liskov: is the subclass truly substitutable?',
      'Composition: inject collaborators, factory functions, mixins',
      'Inheritance suits small stable hierarchies — errors, framework bases',
    ],
    commonMistakes: [
      'Declaring inheritance universally bad rather than explaining the trade-off.',
      'Not being able to name a concrete failure case.',
    ],
    followUps: [
      'Give me a concrete hierarchy that goes wrong.',
      'How do mixins work in JavaScript?',
      'When is inheritance clearly the right choice?',
    ],
  },

  {
    id: 'iv-proto-private-fields',
    question: 'How do `#private` class fields differ from closure-based privacy and the `_name` convention?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.COMPARISON,
    topicIds: ['classes', 'closures', 'objects'],
    relatedLessons: ['l-m31-01'],
    relatedChallenges: ['ch-cls-private-state', 'ch-fn-private-state'],
    shortAnswer:
      '`#private` is enforced by the language and shared across all instances of the class via prototype methods. Closure privacy is also real but costs a function per instance. `_name` is only a convention — anything can read it, and it appears in serialisation.',
    deepAnswer: [
      '**`_name`** is documentation, nothing more. It shows up in `Object.keys`, `JSON.stringify` and a spread, and any code can read or write it. It communicates intent and enforces nothing.',
      '**`#private` fields** are enforced by syntax. They are not properties at all: they never appear in `Object.keys`, `getOwnPropertyNames`, `JSON.stringify` or a spread, and there is no string that reaches them — `obj["#x"]` looks for an ordinary property with that odd name. Accessing one from outside the class body is a **syntax error**, caught before the code runs.',
      'Crucially, prototype methods can still access `#private` fields of any instance of the same class, so `equals(other) { return this.#id === other.#id; }` works. That is something closure privacy cannot do without exposing an accessor.',
      '**Closure privacy** — a variable captured by functions returned from a factory — is genuinely private too, and predates classes. Its cost is that every instance gets its own copy of every method, because the methods must close over that instance\'s variables. With `#private`, methods live once on the prototype.',
      '**Trade-offs worth naming**: `#private` fields cannot be accessed by subclasses (they are private to the declaring class, not protected), and they are awkward with some serialisation and testing approaches — testing private behaviour usually means testing it through the public interface, which is arguably correct anyway.',
      '`WeakMap`-based privacy is the third historical approach: a module-level `WeakMap` keyed by instance. It works, allows cross-instance access, and is what transpilers targeted before `#` was supported.',
    ],
    keyPoints: [
      '`_name`: convention only; visible everywhere',
      '`#private`: language-enforced, not a property, syntax error to access outside',
      'Prototype methods can read `#private` on other instances of the same class',
      'Closure privacy is real but duplicates methods per instance',
      '`#private` is private, not protected — subclasses cannot access it',
      '`WeakMap` keyed by instance is the third approach',
    ],
    commonMistakes: [
      'Believing `_name` provides any enforcement.',
      'Assuming subclasses can access a parent\'s `#private` fields.',
    ],
    followUps: [
      'Can a subclass read a parent\'s `#private` field?',
      'What is the memory cost of closure-based privacy?',
      'How did people do this before `#` existed?',
    ],
  },

  {
    id: 'iv-proto-super',
    question: 'What does `super` do, and why must you call it before using `this`?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CONCEPT,
    topicIds: ['classes', 'prototypes', 'this'],
    relatedLessons: ['l-m31-01'],
    shortAnswer:
      '`super(...)` calls the parent constructor; `super.method()` calls a parent method. In a derived constructor `this` is **uninitialised** until `super()` returns — the parent is what actually creates the instance — so touching `this` first throws a `ReferenceError`.',
    deepAnswer: [
      'In a derived class the instance is not created by the subclass. The chain of `super()` calls runs up to the base constructor, which allocates the object; only then does `this` become available in the derived constructor. That is why the specification leaves `this` in a TDZ-like state until `super()` returns, and why touching it early throws a `ReferenceError` rather than giving `undefined`.',
      'If a derived class defines no constructor at all, an implicit `constructor(...args) { super(...args); }` is supplied — which is why subclasses without constructors work fine.',
      '`super.method()` inside a method calls the parent implementation, using the **current** `this`. That is what makes an override able to extend rather than replace behaviour.',
      '**Class fields interact with this**: field initialisers in a derived class run **after** `super()` returns, which occasionally surprises people when a parent constructor calls an overridden method that depends on a not-yet-initialised subclass field. That ordering is worth knowing because the resulting `undefined` is hard to trace.',
      '`super` is lexically bound to the class where it is written — it is resolved via the method\'s home object, not via the call site — so extracting a method that uses `super` and calling it elsewhere still refers to the right parent.',
      'Arrow functions have no `super` of their own, so an arrow inside a method sees the enclosing method\'s `super`, which is usually the desired behaviour.',
    ],
    keyPoints: [
      'The base constructor creates the instance; `this` is unavailable until `super()` returns',
      'Touching `this` before `super()` throws a `ReferenceError`',
      'A missing derived constructor gets an implicit one forwarding arguments',
      '`super.method()` calls the parent implementation with the current `this`',
      'Derived class fields initialise **after** `super()` returns',
      '`super` binds lexically via the method\'s home object',
    ],
    commonMistakes: [
      'Explaining it as a style rule rather than as "the parent creates the object".',
      'Not knowing derived field initialisers run after `super()`.',
    ],
    followUps: [
      'What happens if a parent constructor calls an overridden method?',
      'Is `super()` required if the subclass has no constructor?',
      'Does an arrow function inside a method have its own `super`?',
    ],
  },

  {
    id: 'iv-proto-static',
    question: 'What are static members for, and where do they live?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['classes', 'prototypes'],
    relatedLessons: ['l-m31-01'],
    relatedChallenges: ['ch-cls-result'],
    shortAnswer:
      'Static members belong to the constructor itself rather than to instances, so they live on the class object, not on `.prototype`. They are for factory methods, constants and utilities that relate to the type but do not need an instance.',
    deepAnswer: [
      'A `static` method is a property of the class object: `User.fromJson(...)`, not `user.fromJson(...)`. Instances cannot see it, because it is not on the prototype chain they inherit from.',
      '**The most valuable use is named factory methods.** A constructor can only have one signature; static factories give you several well-named ways to build an instance — `Result.ok(value)` and `Result.err(error)`, or `User.fromJson(json)` and `User.guest()`. That reads far better than a constructor with a mode flag.',
      '**Static fields** hold constants and configuration: `static MAX_RETRIES = 3`. **Static blocks** (`static { ... }`) run once at class definition time for more involved setup.',
      '**Statics are inherited by subclasses** through the constructor\'s own prototype chain — `Child.someStatic` resolves to the parent\'s if the child does not define it. That surprises people who assume static means "not inherited".',
      '**`this` inside a static method** refers to the class itself, which is what makes `static create() { return new this(); }` work polymorphically in subclasses.',
      '**`static #private`** members exist too, useful for a private instance registry or counter.',
      'The judgement worth offering: a class that is **only** static methods is usually better as a module of exported functions. Statics earn their place when they are genuinely tied to the type — constructing it, or a constant that belongs to it.',
    ],
    keyPoints: [
      'Live on the class object, not on `.prototype`; instances cannot see them',
      'Best use: named factory methods for multiple construction paths',
      'Static fields for constants; static blocks for one-time setup',
      'Statics are inherited by subclasses',
      '`this` in a static method is the class — enables `new this()`',
      'An all-static class is usually better as a module of functions',
    ],
    commonMistakes: [
      'Thinking statics are not inherited.',
      'Using a static-only class where plain exported functions are simpler.',
    ],
    followUps: [
      'What does `this` refer to inside a static method?',
      'Why are named factory methods better than a constructor flag?',
      'When is an all-static class the wrong design?',
    ],
  },

  {
    id: 'iv-proto-getters-setters',
    question: 'When are getters and setters worth using, and what are the risks?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CONCEPT,
    topicIds: ['classes', 'objects', 'metaprogramming'],
    relatedLessons: ['l-m31-01'],
    relatedChallenges: ['ch-cls-validated-temperature'],
    shortAnswer:
      'They let a computed or validated value be accessed like a plain property, which is right for derived values and for enforcing an invariant on write. The risk is hiding expensive or side-effecting work behind syntax that looks free.',
    deepAnswer: [
      '**Good uses.** A **derived value** that should never fall out of sync — `get fullName() { return this.first + " " + this.last; }` cannot become stale the way a duplicated field can. A **validated setter** that enforces an invariant in one place, so no code path can bypass it. And a **read-only view** — a getter with no setter — over private state.',
      '**The main risk is violating the reader\'s expectations.** Property access looks free. A getter that performs a network call, a deep clone, or an O(n) computation inside a render loop will be called far more often than its author imagined, because nothing at the call site suggests cost. If it is expensive, a method named `computeX()` is more honest.',
      '**Second risk: hidden side effects.** A setter that triggers a re-render or a save makes `obj.x = 1` do something the reader cannot see. That is sometimes exactly the design (reactive frameworks do it deliberately), but it should be a considered decision, not an accident.',
      '**Practical gotchas**: a getter with no setter fails silently in sloppy mode and throws in strict mode; getters are invoked by object spread, so `{ ...obj }` runs every getter and copies the **values**, not the accessors; and `JSON.stringify` also invokes them.',
      'Defining them on a prototype or class body shares one accessor across instances, which is preferable to defining them per object with `Object.defineProperty` in a constructor.',
      'The judgement to state: getters should be cheap and pure enough that a reader can treat them as data. When they cannot be, use a method.',
    ],
    keyPoints: [
      'Good for derived values, validated writes, and read-only views',
      'Risk: property syntax hides cost — keep getters cheap',
      'Risk: setters with side effects surprise readers',
      'Spread and `JSON.stringify` invoke getters and copy the values',
      'Getter with no setter: silent no-op in sloppy mode, throws in strict',
    ],
    commonMistakes: [
      'Putting expensive work in a getter.',
      'Not knowing that spreading an object invokes its getters.',
    ],
    followUps: [
      'What happens when you spread an object with getters?',
      'When would you use a method instead?',
      'How do you make a property read-only?',
    ],
  },

  {
    id: 'iv-proto-mixins-coding',
    question: 'How do you share behaviour across classes that cannot share a parent?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.CODING,
    topicIds: ['classes', 'prototypes', 'design-patterns'],
    relatedChallenges: ['ch-cls-mixin'],
    code:
      'const Serializable = (Base) => class extends Base {\n' +
      '  toJSON() {\n' +
      '    return { ...this };\n' +
      '  }\n' +
      '};\n' +
      '\n' +
      'const Timestamped = (Base) => class extends Base {\n' +
      '  constructor(...args) {\n' +
      '    super(...args);\n' +
      '    this.createdAt = Date.now();\n' +
      '  }\n' +
      '};\n' +
      '\n' +
      'class Note extends Serializable(Timestamped(Object)) {}',
    shortAnswer:
      'Mixins: functions that take a base class and return a subclass extending it. Because each returns a class, they compose — `A(B(Base))` builds a real prototype chain, so `instanceof` still works and every constructor runs.',
    deepAnswer: [
      '**The approach.** A mixin is a class factory: `(Base) => class extends Base { ... }`. Applying several nests them, producing a genuine chain rather than a flat copy of methods.',
      '**Why this beats `Object.assign` onto a prototype.** Copying methods mutates the target class for every other user of it, gives no way to call the overridden version (no `super`), and creates no `instanceof` relationship. The factory approach preserves all three.',
      '**Forwarding `...args` to `super`** is what makes order of application irrelevant — no mixin needs to know what the base constructor expects.',
      '**Trade-offs worth raising.** The prototype chain gets deeper, which is a minor lookup cost and a real readability cost — stack traces show anonymous classes, and it can be hard to find where a method actually came from. Name collisions between mixins are resolved silently by application order, which is a genuine hazard as the number grows.',
      '**The alternative I would usually reach for first is plain composition**: give the object a collaborator and delegate, or export standalone functions taking the object as a parameter. That avoids the chain entirely and is easier to test. Mixins earn their place when the behaviour genuinely needs to participate in the class\'s own `this` and override chain.',
      '**Detail in this example**: `{ ...this }` copies own enumerable properties, so `#private` fields are excluded — which is usually the desired serialisation behaviour but is worth stating rather than discovering.',
    ],
    keyPoints: [
      'A mixin is a function taking a base class and returning a subclass',
      'Composing them builds a real prototype chain — `instanceof` and `super` work',
      'Forward `...args` to `super` so application order does not matter',
      'Better than `Object.assign` onto a prototype, which breaks `super` and mutates the base',
      'Costs: deeper chains, anonymous classes in traces, silent name collisions',
      'Plain composition/delegation is often the simpler first choice',
    ],
    commonMistakes: [
      'Copying methods onto a prototype and losing `super` and `instanceof`.',
      'Not forwarding constructor arguments, breaking composability.',
    ],
    followUps: [
      'What breaks if you use `Object.assign` instead?',
      'How do you resolve a name collision between two mixins?',
      'When would plain composition be better?',
    ],
  },

  {
    id: 'iv-proto-this-binding-debug',
    question: 'Why does `this` become `undefined` here, and what are the trade-offs of each fix?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.DEBUGGING,
    topicIds: ['this', 'classes', 'events'],
    relatedLessons: ['l-m29-01'],
    relatedChallenges: ['ch-fn-bind'],
    code:
      'class Counter {\n' +
      '  count = 0;\n' +
      '\n' +
      '  increment() {\n' +
      '    this.count += 1;\n' +
      '  }\n' +
      '\n' +
      '  attach(button) {\n' +
      '    button.addEventListener("click", this.increment);\n' +
      '  }\n' +
      '}',
    shortAnswer:
      '`this.increment` is passed as a bare function, so on click the DOM invokes it with `this` set to the element — but class bodies are strict and the method was extracted, so `this` is the button, not the instance, and `this.count` is `undefined`. Fix with an arrow wrapper, `bind`, or a class-field arrow.',
    deepAnswer: [
      '**The cause.** Passing `this.increment` copies the function without any link to the instance. `addEventListener` invokes the handler with `this` set to the element the listener is attached to — so `this.count += 1` operates on the button, creating a stray `NaN` property on the DOM node rather than updating the counter. (If it were invoked as a plain call rather than as a listener, strict mode would make `this` `undefined` and it would throw instead — either way the instance is not what you get.)',
      '**Fix 1 — arrow wrapper**: `button.addEventListener("click", () => this.increment())`. Clearest, and `this` resolves lexically. Downside: you must keep the arrow reference if you ever need `removeEventListener`.',
      '**Fix 2 — `bind` in the constructor**: `this.increment = this.increment.bind(this)`. Explicit and gives a stable reference you can remove later. Downside: an extra function per instance and a line of ceremony.',
      '**Fix 3 — class-field arrow**: `increment = () => { this.count += 1; }`. Bound automatically per instance. Downsides: it lives on the instance rather than the prototype, so it is allocated per object and is not shared; it cannot be called via `super`; and it is harder to stub in tests since it is not on the prototype.',
      '**The removal trap worth volunteering**: `removeEventListener("click", this.increment.bind(this))` removes nothing, because `bind` returns a **new** function each time and removal matches on identity. Whatever fix you choose, the reference passed to add and remove must be the same object — or use `AbortController` with a signal, which sidesteps the problem.',
      '**Test that catches it**: attach to a fake element, dispatch a click, and assert `counter.count === 1`. Testing only that `increment()` works directly would pass against the broken code.',
    ],
    keyPoints: [
      'Passing a method as a callback loses the receiver',
      'A DOM listener sets `this` to the element',
      'Fixes: arrow wrapper, constructor `bind`, or class-field arrow',
      'Class-field arrows are per-instance, not on the prototype, harder to stub',
      '`removeEventListener` needs the identical function reference',
      'Test by dispatching a real event, not by calling the method directly',
    ],
    commonMistakes: [
      'Fixing `this` but then failing to remove the listener because of a fresh `bind`.',
      'Only testing the method directly, which does not exercise the bug.',
    ],
    followUps: [
      'Why does removing with a fresh `bind` fail?',
      'What is the memory trade-off of class-field arrows?',
      'How would `AbortController` help here?',
    ],
  },

  {
    id: 'iv-proto-error-subclass',
    question: 'How do you create a custom error type, and what goes wrong if you get it slightly wrong?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.CODING,
    topicIds: ['errors', 'classes', 'prototypes'],
    relatedLessons: ['l-m22-01'],
    relatedChallenges: ['ch-eng-error-chain'],
    code:
      'class ValidationError extends Error {\n' +
      '  constructor(message, field, options) {\n' +
      '    super(message, options);\n' +
      '    this.name = "ValidationError";\n' +
      '    this.field = field;\n' +
      '  }\n' +
      '}',
    shortAnswer:
      'Extend `Error`, call `super(message)`, and set `name` explicitly — otherwise it reports as `"Error"` in logs. Pass `options` through so `{ cause }` works. Add structured fields like `field` so callers can branch on data rather than parsing the message.',
    deepAnswer: [
      '**Why set `name`.** Without it, `error.name` is inherited as `"Error"` and `String(error)` prints `Error: message`, so logs and error reporters group your validation failures with everything else. Setting it explicitly is one line and makes triage possible.',
      '**Why forward `options`.** `new Error(message, { cause })` is standard, and forwarding it lets `new ValidationError(msg, field, { cause: originalError })` preserve the underlying failure. Dropping the second argument silently discards the cause chain.',
      '**Why structured fields beat message parsing.** A caller that needs to know **which** field failed should read `error.field`, not run a regex over the message. Message text is for humans and changes freely; data is a contract.',
      '**What goes wrong if you get it wrong.** Historically, extending built-ins with ES5 constructor functions broke `instanceof` because the returned object had the wrong prototype — the `Object.setPrototypeOf(this, new.target.prototype)` workaround exists for that, and is still needed when transpiling class syntax down to ES5. With native classes it works correctly.',
      '**`instanceof` across bundles** can still be fragile if two copies of the module are loaded, giving two distinct class objects. When that risk is real, a discriminant field — `error.code = "VALIDATION"` — is more robust than a chain check.',
      '**`Error.captureStackTrace(this, ValidationError)`** in V8 trims the constructor frame from the stack, which makes traces cleaner. It is non-standard, so guard for its existence.',
      'The broader habit worth stating: throw the most specific error you can, attach the data a caller needs to act on, and preserve the original as `cause`.',
    ],
    keyPoints: [
      'Set `name` explicitly or it reports as `"Error"`',
      'Forward the options argument so `{ cause }` is preserved',
      'Attach structured fields; never make callers parse the message',
      'Native classes fix the old ES5 `instanceof` breakage',
      'Two module copies can break `instanceof` — a `code` field is more robust',
      '`Error.captureStackTrace` (V8-only) cleans the trace',
    ],
    commonMistakes: [
      'Forgetting `this.name`, so custom errors are indistinguishable in logs.',
      'Encoding structured data in the message string.',
    ],
    followUps: [
      'Why might `instanceof` fail for an error across bundles?',
      'What does the `cause` option give you?',
      'How would a caller decide whether to retry based on this error?',
    ],
  },
];

export default questions;
