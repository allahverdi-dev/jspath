import { useState } from 'react';
import { Icon, cx } from '../ui/index.jsx';

/**
 * Visual explanations for the concepts that are genuinely hard to grasp from
 * prose alone. Built from HTML/CSS/SVG against the design tokens, so they are
 * responsive, theme-aware, readable by screen readers, and carry no image weight.
 *
 * Register a diagram here and reference it from content with
 * `{ kind: SECTION.DIAGRAM, diagram: 'event-loop' }`.
 */

/* ------------------------------------------------------------------ *
 * Shared primitives
 * ------------------------------------------------------------------ */

function Frame({ label, children, className = '', tone = 'default' }) {
  const tones = {
    default: 'border-outline-variant bg-surface-container',
    primary: 'border-primary/40 bg-primary/5',
    info: 'border-info/40 bg-info/5',
    success: 'border-success/40 bg-success/5',
    warning: 'border-warning/40 bg-warning/5',
    error: 'border-error/40 bg-error/5',
  };
  return (
    <div className={cx('rounded border px-3 py-2', tones[tone], className)}>
      {label && (
        <p className="mb-1 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{label}</p>
      )}
      {children}
    </div>
  );
}

const Mono = ({ children, className = '' }) => (
  <span className={cx('font-mono text-code-md text-on-surface', className)}>{children}</span>
);

function Arrow({ direction = 'down', label }) {
  const rotate = { down: '', up: 'rotate-180', right: '-rotate-90', left: 'rotate-90' }[direction];
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <Icon name="arrow_downward" size={18} className={cx('text-on-surface-variant', rotate)} />
      {label && <span className="font-body-sm text-on-surface-variant">{label}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Scope chain
 * ------------------------------------------------------------------ */

function ScopeChain() {
  const [lookup, setLookup] = useState(null);

  const scopes = [
    { name: 'Global scope', vars: ['appName'], tone: 'default' },
    { name: 'outer() function scope', vars: ['count'], tone: 'info' },
    { name: 'inner() function scope', vars: ['message'], tone: 'primary' },
  ];

  const foundAt = lookup ? scopes.findIndex((s) => s.vars.includes(lookup)) : -1;

  return (
    <div>
      <p className="mb-3 font-body-sm text-on-surface-variant">
        Click a variable to see where JavaScript finds it. Lookup always starts in the innermost
        scope and walks outward — never inward.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {['message', 'count', 'appName', 'missing'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setLookup(v === lookup ? null : v)}
            className={cx(
              'rounded border px-2.5 py-1 font-mono text-code-sm transition-colors',
              lookup === v
                ? 'border-primary bg-primary/10 text-primary-ink'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="space-y-0">
        {scopes.map((scope, i) => {
          const searched = lookup && (foundAt === -1 || i >= foundAt);
          const found = lookup && i === foundAt;
          return (
            <div key={scope.name} style={{ marginLeft: `${(scopes.length - 1 - i) * 0}px` }}>
              <div
                className={cx(
                  'rounded border px-4 py-3 transition-colors',
                  found
                    ? 'border-success bg-success/10'
                    : searched
                      ? 'border-warning/50 bg-warning/5'
                      : 'border-outline-variant bg-surface-container',
                  i > 0 && 'mt-0',
                )}
                style={{ marginLeft: `${i * 20}px` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body-sm font-semibold text-on-surface">{scope.name}</span>
                  {found && (
                    <span className="flex items-center gap-1 font-mono text-code-sm text-success">
                      <Icon name="check_circle" size={13} filled /> found here
                    </span>
                  )}
                  {searched && !found && (
                    <span className="font-mono text-code-sm text-warning">not here → keep looking outward</span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {scope.vars.map((v) => (
                    <Mono key={v} className={cx('rounded bg-surface-container-high px-1.5 py-0.5', lookup === v && 'ring-1 ring-success')}>
                      {v}
                    </Mono>
                  ))}
                </div>
              </div>
              {i < scopes.length - 1 && (
                <div className="py-1" style={{ marginLeft: `${i * 20 + 16}px` }}>
                  <Icon name="arrow_upward" size={16} className="text-on-surface-variant" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lookup === 'missing' && (
        <p className="mt-3 rounded border border-error/40 bg-error/5 px-3 py-2 font-body-sm text-error">
          Every scope was searched and nothing matched → <Mono className="text-error">ReferenceError: missing is not defined</Mono>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Call stack
 * ------------------------------------------------------------------ */

function CallStack() {
  const steps = [
    { label: 'Script starts', frames: ['global'] },
    { label: 'first() is called', frames: ['global', 'first()'] },
    { label: 'second() is called from first()', frames: ['global', 'first()', 'second()'] },
    { label: 'third() is called from second()', frames: ['global', 'first()', 'second()', 'third()'] },
    { label: 'third() returns — its frame is popped', frames: ['global', 'first()', 'second()'] },
    { label: 'second() returns', frames: ['global', 'first()'] },
    { label: 'first() returns — stack is empty again', frames: ['global'] },
  ];
  const [step, setStep] = useState(0);
  const current = steps[step];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded border border-outline-variant px-2 py-1 text-on-surface-variant transition hover:bg-surface-container disabled:opacity-40"
          aria-label="Previous step"
        >
          <Icon name="arrow_back" size={16} />
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="rounded border border-outline-variant px-2 py-1 text-on-surface-variant transition hover:bg-surface-container disabled:opacity-40"
          aria-label="Next step"
        >
          <Icon name="arrow_forward" size={16} />
        </button>
        <span className="font-body-sm text-on-surface">{current.label}</span>
        <span className="ml-auto font-mono text-code-sm text-on-surface-variant">
          {step + 1}/{steps.length}
        </span>
      </div>

      <div className="flex min-h-[13rem] flex-col-reverse justify-start gap-1.5 rounded border border-outline-variant bg-surface-container p-3">
        {current.frames.map((frame, i) => (
          <div
            key={`${frame}-${i}`}
            className={cx(
              'rounded border px-3 py-2 font-mono text-code-md transition-colors',
              i === current.frames.length - 1 && i > 0
                ? 'border-primary bg-primary/10 text-primary-ink'
                : 'border-outline-variant bg-surface-container-high text-on-surface-variant',
            )}
          >
            {frame}
            {i === current.frames.length - 1 && i > 0 && (
              <span className="ml-2 font-body-sm text-on-surface-variant">← currently running</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
        Stack grows upward · last in, first out
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Event loop
 * ------------------------------------------------------------------ */

function EventLoop() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
      <div className="space-y-3">
        <Frame label="Call stack" tone="primary">
          <p className="font-body-sm text-on-surface-variant">
            Runs one thing at a time. While anything is here, nothing else can run.
          </p>
        </Frame>
        <Frame label="Web APIs / host">
          <p className="font-body-sm text-on-surface-variant">
            <Mono>setTimeout</Mono>, <Mono>fetch</Mono>, DOM events. The browser handles these
            outside the stack.
          </p>
        </Frame>
      </div>

      <div className="flex items-center justify-center lg:flex-col">
        <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary/50 bg-primary/10">
          <Icon name="sync" size={22} className="text-primary-ink" />
        </div>
        <p className="ml-2 max-w-[8rem] font-mono text-label-caps uppercase tracking-wider text-on-surface-variant lg:ml-0 lg:mt-2 lg:text-center">
          Event loop
        </p>
      </div>

      <div className="space-y-3">
        <Frame label="Microtask queue — drained first, completely" tone="success">
          <p className="font-body-sm text-on-surface-variant">
            <Mono>.then()</Mono>, <Mono>await</Mono> continuations, <Mono>queueMicrotask</Mono>
          </p>
        </Frame>
        <Frame label="Task (macrotask) queue — one per tick" tone="warning">
          <p className="font-body-sm text-on-surface-variant">
            <Mono>setTimeout</Mono>, <Mono>setInterval</Mono>, I/O, UI events
          </p>
        </Frame>
        <div className="rounded border border-outline-variant bg-surface-container-low px-3 py-2">
          <p className="font-body-sm text-on-surface-variant">
            <strong className="text-on-surface">The rule:</strong> when the stack empties, the loop
            drains <em>every</em> microtask, then takes <em>one</em> task. That is why a resolved
            promise always runs before a <Mono>setTimeout(…, 0)</Mono>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Prototype chain
 * ------------------------------------------------------------------ */

function PrototypeChain() {
  const links = [
    { name: 'dog', detail: '{ name: "Rex" }', note: 'Own properties live here', tone: 'primary' },
    { name: 'Dog.prototype', detail: '{ bark() }', note: 'Methods shared by all Dogs', tone: 'info' },
    { name: 'Animal.prototype', detail: '{ eat() }', note: 'Inherited from the parent class', tone: 'info' },
    { name: 'Object.prototype', detail: '{ toString(), hasOwnProperty() }', note: 'The root of almost everything', tone: 'default' },
    { name: 'null', detail: '', note: 'End of the chain — lookup stops and returns undefined', tone: 'default' },
  ];

  return (
    <div>
      <p className="mb-3 font-body-sm text-on-surface-variant">
        Reading <Mono>dog.eat</Mono> walks this chain until a match is found.
      </p>
      {links.map((link, i) => (
        <div key={link.name}>
          <Frame tone={link.tone}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Mono className="font-semibold">{link.name}</Mono>
              {link.detail && <Mono className="text-on-surface-variant">{link.detail}</Mono>}
            </div>
            <p className="mt-1 font-body-sm text-on-surface-variant">{link.note}</p>
          </Frame>
          {i < links.length - 1 && (
            <div className="flex items-center gap-2 py-1 pl-4">
              <Icon name="arrow_downward" size={16} className="text-on-surface-variant" />
              <Mono className="text-code-sm text-on-surface-variant">[[Prototype]]</Mono>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Promise states
 * ------------------------------------------------------------------ */

function PromiseStates() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Frame label="Pending" tone="warning">
          <p className="font-body-sm text-on-surface-variant">The starting state. No value yet, no error yet.</p>
        </Frame>
        <Frame label="Fulfilled" tone="success">
          <p className="font-body-sm text-on-surface-variant">
            <Mono>resolve(value)</Mono> was called. <Mono>.then()</Mono> handlers run.
          </p>
        </Frame>
        <Frame label="Rejected" tone="error">
          <p className="font-body-sm text-on-surface-variant">
            <Mono>reject(error)</Mono> was called or something threw. <Mono>.catch()</Mono> handlers run.
          </p>
        </Frame>
      </div>
      <p className="mt-3 rounded border border-outline-variant bg-surface-container px-3 py-2 font-body-sm text-on-surface-variant">
        <strong className="text-on-surface">Settling is permanent.</strong> A promise moves out of
        pending exactly once. Calling <Mono>resolve</Mono> twice, or <Mono>reject</Mono> after
        <Mono> resolve</Mono>, has no effect — which is what makes promises safe to hand around.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Event propagation
 * ------------------------------------------------------------------ */

function EventPropagation() {
  const [phase, setPhase] = useState('bubble');
  const nodes = ['window', 'document', 'body', 'div.card', 'button'];
  const ordered = phase === 'capture' ? nodes : [...nodes].reverse();

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {[
          { id: 'capture', label: '1. Capturing (down)' },
          { id: 'bubble', label: '3. Bubbling (up)' },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPhase(p.id)}
            className={cx(
              'rounded border px-3 py-1.5 font-body-sm transition-colors',
              phase === p.id
                ? 'border-primary bg-primary/10 text-primary-ink'
                : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {ordered.map((node, i) => {
          const isTarget = node === 'button';
          return (
            <div key={node}>
              <div
                className={cx(
                  'flex items-center gap-2 rounded border px-3 py-2',
                  isTarget ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container',
                )}
                style={{ marginLeft: `${(phase === 'capture' ? i : ordered.length - 1 - i) * 16}px` }}
              >
                <Mono className={isTarget ? 'text-primary-ink' : ''}>{node}</Mono>
                {isTarget && (
                  <span className="font-mono text-label-caps uppercase tracking-wider text-primary-ink">
                    2. target — event.target
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 font-body-sm leading-6 text-on-surface-variant">
        Listeners are added in the bubbling phase by default. Pass <Mono>{'{ capture: true }'}</Mono> to
        listen on the way down. <Mono>event.target</Mono> is always the element that was actually
        clicked; <Mono>event.currentTarget</Mono> is the element whose listener is running — which is
        exactly what makes event delegation work.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Value vs reference
 * ------------------------------------------------------------------ */

function ValueVsReference() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 font-body-sm font-semibold text-on-surface">Primitives copy the value</p>
        <div className="rounded border border-outline-variant bg-surface-container p-3">
          <Mono className="mb-2 block text-code-sm text-on-surface-variant">
            let a = 1;<br />let b = a;<br />b = 2;
          </Mono>
          <div className="flex gap-2">
            <Frame label="a" tone="info" className="flex-1"><Mono>1</Mono></Frame>
            <Frame label="b" tone="info" className="flex-1"><Mono>2</Mono></Frame>
          </div>
          <p className="mt-2 font-body-sm text-on-surface-variant">Two independent boxes. Changing b cannot affect a.</p>
        </div>
      </div>

      <div>
        <p className="mb-2 font-body-sm font-semibold text-on-surface">Objects copy the reference</p>
        <div className="rounded border border-outline-variant bg-surface-container p-3">
          <Mono className="mb-2 block text-code-sm text-on-surface-variant">
            let a = {'{ n: 1 }'};<br />let b = a;<br />b.n = 2;
          </Mono>
          <div className="flex items-center gap-2">
            <Frame label="a" tone="warning" className="flex-1"><Mono className="text-code-sm">→ ref</Mono></Frame>
            <Frame label="b" tone="warning" className="flex-1"><Mono className="text-code-sm">→ ref</Mono></Frame>
          </div>
          <Arrow label="both point to the same object" />
          <Frame tone="primary"><Mono>{'{ n: 2 }'}</Mono></Frame>
          <p className="mt-2 font-body-sm text-on-surface-variant">
            One object, two names. <Mono>a.n</Mono> is now 2 as well.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Hoisting & TDZ
 * ------------------------------------------------------------------ */

function HoistingTdz() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded border border-outline-variant bg-surface-container p-3">
        <p className="mb-2 font-body-sm font-semibold text-on-surface">var — initialised to undefined</p>
        <Mono className="block text-code-sm leading-6 text-on-surface-variant">
          console.log(x); <span className="text-warning">{'// undefined'}</span><br />
          var x = 5;
        </Mono>
        <p className="mt-2 font-body-sm text-on-surface-variant">
          The declaration is hoisted <em>and</em> pre-set to <Mono>undefined</Mono>, so reading it
          early is legal but almost never what you wanted.
        </p>
      </div>

      <div className="rounded border border-error/40 bg-error/5 p-3">
        <p className="mb-2 font-body-sm font-semibold text-on-surface">let / const — Temporal Dead Zone</p>
        <Mono className="block text-code-sm leading-6 text-on-surface-variant">
          console.log(y); <span className="text-error">{'// ReferenceError'}</span><br />
          let y = 5;
        </Mono>
        <p className="mt-2 font-body-sm text-on-surface-variant">
          The binding <em>is</em> hoisted, but it is uninitialised. Touching it before the
          declaration line throws — deliberately, to turn a silent bug into a loud one.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Closure
 * ------------------------------------------------------------------ */

function ClosureDiagram() {
  return (
    <div>
      <div className="rounded border border-outline-variant bg-surface-container p-4">
        <Mono className="block text-code-sm leading-6 text-on-surface-variant">
          function makeCounter() {'{'}<br />
          &nbsp;&nbsp;<span className="text-primary-ink">let count = 0;</span><br />
          &nbsp;&nbsp;return function increment() {'{'}<br />
          &nbsp;&nbsp;&nbsp;&nbsp;count += 1;<br />
          &nbsp;&nbsp;&nbsp;&nbsp;return count;<br />
          &nbsp;&nbsp;{'}'};<br />
          {'}'}
        </Mono>
      </div>

      <Arrow label="makeCounter() has returned — but its variable survives" />

      <div className="grid gap-3 sm:grid-cols-2">
        <Frame label="makeCounter scope — normally discarded" tone="primary">
          <Mono>count = 0</Mono>
          <p className="mt-1 font-body-sm text-on-surface-variant">
            Kept alive because the returned function still refers to it.
          </p>
        </Frame>
        <Frame label="The returned increment function" tone="info">
          <Mono>[[Scopes]] → count</Mono>
          <p className="mt-1 font-body-sm text-on-surface-variant">
            Holds a live reference, not a copy. Each call updates the same variable.
          </p>
        </Frame>
      </div>

      <p className="mt-3 rounded border border-outline-variant bg-surface-container-low px-3 py-2 font-body-sm text-on-surface-variant">
        Calling <Mono>makeCounter()</Mono> twice creates <strong className="text-on-surface">two
        separate</strong> retained scopes, so the two counters never interfere.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * DOM tree
 * ------------------------------------------------------------------ */

function DomTree() {
  const tree = [
    { depth: 0, label: 'document', tone: 'primary' },
    { depth: 1, label: 'html', tone: 'default' },
    { depth: 2, label: 'head', tone: 'default' },
    { depth: 3, label: 'title', tone: 'default' },
    { depth: 2, label: 'body', tone: 'info' },
    { depth: 3, label: 'h1#title', tone: 'default' },
    { depth: 3, label: 'ul.list', tone: 'default' },
    { depth: 4, label: 'li', tone: 'default' },
    { depth: 4, label: 'li', tone: 'default' },
  ];
  return (
    <div>
      <div className="space-y-1">
        {tree.map((node, i) => (
          <div key={i} style={{ marginLeft: `${node.depth * 20}px` }}>
            <Frame tone={node.tone} className="inline-block">
              <Mono className="text-code-sm">{node.label}</Mono>
            </Frame>
          </div>
        ))}
      </div>
      <p className="mt-3 font-body-sm leading-6 text-on-surface-variant">
        Every element is a node with a parent, children and siblings. This tree is built by the
        browser from your HTML — it is not the HTML text itself, which is why changing the DOM does
        not change the source file.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const DIAGRAMS = {
  'scope-chain': { title: 'How the scope chain resolves a name', Component: ScopeChain },
  'call-stack': { title: 'The call stack, step by step', Component: CallStack },
  'event-loop': { title: 'The event loop, task and microtask queues', Component: EventLoop },
  'prototype-chain': { title: 'The prototype chain', Component: PrototypeChain },
  'promise-states': { title: 'Promise states', Component: PromiseStates },
  'event-propagation': { title: 'Event capturing, targeting and bubbling', Component: EventPropagation },
  'value-vs-reference': { title: 'Value vs reference', Component: ValueVsReference },
  'hoisting-tdz': { title: 'Hoisting and the Temporal Dead Zone', Component: HoistingTdz },
  closure: { title: 'How a closure retains its scope', Component: ClosureDiagram },
  'dom-tree': { title: 'The DOM as a tree', Component: DomTree },
};

export const DIAGRAM_IDS = Object.keys(DIAGRAMS);

export function Diagram({ id, caption }) {
  const entry = DIAGRAMS[id];
  if (!entry) return null;
  const { title, Component } = entry;

  return (
    <figure className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
      <figcaption className="mb-4 flex items-center gap-2">
        <Icon name="insights" size={16} className="text-on-surface-variant" />
        <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{title}</span>
      </figcaption>
      <Component />
      {caption && <p className="mt-4 font-body-sm text-on-surface-variant">{caption}</p>}
    </figure>
  );
}
