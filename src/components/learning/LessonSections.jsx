import { useState } from 'react';
import { CodeBlock, HighlightedCode } from '../code/CodeBlock.jsx';
import { Icon, Badge, cx } from '../ui/index.jsx';
import { SECTION, CALLOUT_TONE } from '../../content/schema/types.js';
import { Diagram } from '../viz/Diagram.jsx';
import { InlineMarkup } from './InlineMarkup.jsx';

const CALLOUT_STYLES = {
  [CALLOUT_TONE.TIP]: { border: 'border-success/40', bg: 'bg-success/5', icon: 'lightbulb', color: 'text-success', label: 'Tip' },
  [CALLOUT_TONE.WARNING]: { border: 'border-warning/40', bg: 'bg-warning/5', icon: 'warning', color: 'text-warning', label: 'Watch out' },
  [CALLOUT_TONE.DANGER]: { border: 'border-error/40', bg: 'bg-error/5', icon: 'dangerous', color: 'text-error', label: 'Danger' },
  [CALLOUT_TONE.INFO]: { border: 'border-info/40', bg: 'bg-info/5', icon: 'info', color: 'text-info', label: 'Note' },
  [CALLOUT_TONE.MISTAKE]: { border: 'border-error/40', bg: 'bg-error/5', icon: 'error', color: 'text-error', label: 'Common mistake' },
  [CALLOUT_TONE.INTERVIEW]: { border: 'border-primary/40', bg: 'bg-primary/5', icon: 'record_voice_over', color: 'text-primary-ink', label: 'Interview' },
};

/** Stable slug for a heading, used by the "on this page" rail. */
export const headingId = (text, i) =>
  `s-${i}-${String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`;

function Prose({ body }) {
  return (
    <div className="prose-jspath max-w-prose">
      {body.map((paragraph, i) => (
        <p key={i}>
          <InlineMarkup text={paragraph} />
        </p>
      ))}
    </div>
  );
}

function Callout({ section }) {
  const style = CALLOUT_STYLES[section.tone] ?? CALLOUT_STYLES[CALLOUT_TONE.INFO];
  return (
    <aside className={cx('rounded-lg border px-5 py-4', style.border, style.bg)}>
      <p className={cx('mb-2 flex items-center gap-2 font-heading text-body-md font-semibold', style.color)}>
        <Icon name={style.icon} size={18} filled />
        {section.title}
      </p>
      <div className="prose-jspath max-w-prose">
        {section.body.map((p, i) => (
          <p key={i}>
            <InlineMarkup text={p} />
          </p>
        ))}
      </div>
    </aside>
  );
}

function AnnotatedCode({ section }) {
  const [active, setActive] = useState(null);
  const highlighted = active != null ? [section.annotations[active].line] : [];

  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant bg-surface-container-low px-3 py-2">
        <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          Annotated · hover a note to highlight its line
        </span>
      </div>
      <div className="px-4 py-3">
        <HighlightedCode
          code={section.code}
          language={section.language ?? 'javascript'}
          showLineNumbers
          highlightLines={highlighted}
        />
      </div>
      <ol className="divide-y divide-[rgb(var(--c-outline-variant))] border-t border-outline-variant">
        {section.annotations.map((a, i) => (
          <li
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            tabIndex={0}
            className={cx(
              'flex cursor-default items-start gap-3 px-4 py-2.5 transition-colors',
              active === i ? 'bg-primary/5' : 'hover:bg-surface-container',
            )}
          >
            <span className="mt-0.5 shrink-0 rounded bg-surface-container-high px-1.5 py-0.5 font-mono text-code-sm text-on-surface-variant">
              L{a.line}
            </span>
            <span className="font-body-sm leading-6 text-on-surface-variant">
              <InlineMarkup text={a.text} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Comparison({ section }) {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[section.left, section.right].map((side, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant bg-surface-container-low px-3 py-2">
              <span className="font-body-sm font-medium text-on-surface">{side.title}</span>
            </div>
            <div className="px-4 py-3">
              <HighlightedCode code={side.code} language={side.language ?? 'javascript'} />
            </div>
          </div>
        ))}
      </div>
      {section.note && (
        <p className="mt-3 font-body-sm leading-6 text-on-surface-variant">
          <InlineMarkup text={section.note} />
        </p>
      )}
    </div>
  );
}

/** Inline "predict before you read on" checkpoint. */
function Predict({ section }) {
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <p className="mb-3 flex items-center gap-2 font-heading text-body-md font-semibold text-primary-ink">
        <Icon name="psychology" size={18} filled />
        Predict the output before reading on
      </p>

      <div className="mb-4 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest px-4 py-3">
        <HighlightedCode code={section.code} showLineNumbers />
      </div>

      <div className="space-y-2">
        {section.options.map((option, i) => {
          const isCorrect = i === section.correct;
          return (
            <label
              key={i}
              className={cx(
                'flex cursor-pointer items-center gap-3 rounded border px-3 py-2 transition-colors',
                revealed && isCorrect && 'border-success/50 bg-success/10',
                revealed && choice === i && !isCorrect && 'border-error/50 bg-error/10',
                !revealed && choice === i && 'border-primary bg-primary/10',
                !revealed && choice !== i && 'border-outline-variant hover:bg-surface-container',
              )}
            >
              <input
                type="radio"
                name={`predict-${section.code.length}-${section.correct}`}
                checked={choice === i}
                disabled={revealed}
                onChange={() => setChoice(i)}
                className="accent-[rgb(var(--c-primary))]"
              />
              <span className="font-mono text-code-md text-on-surface">{option}</span>
            </label>
          );
        })}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={choice == null}
          className="mt-4 rounded bg-primary px-4 py-2 font-body-sm font-bold text-on-primary transition hover:bg-primary-fixed disabled:opacity-50"
        >
          Reveal answer
        </button>
      ) : (
        <div className="mt-4 rounded border border-outline-variant bg-surface-container px-4 py-3">
          <p className={cx('mb-1 font-body-sm font-bold', choice === section.correct ? 'text-success' : 'text-warning')}>
            {choice === section.correct ? 'Correct.' : `The answer is ${section.options[section.correct]}.`}
          </p>
          <p className="font-body-sm leading-6 text-on-surface-variant">
            <InlineMarkup text={section.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}

function Steps({ section }) {
  return (
    <ol className="space-y-3">
      {section.steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-outline-variant bg-surface-container font-mono text-code-sm font-bold text-on-surface">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-body-md font-semibold text-on-surface">
              <InlineMarkup text={step.title} />
            </p>
            <p className="mt-1 font-body-md leading-7 text-on-surface-variant">
              <InlineMarkup text={step.body} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Table({ section }) {
  return (
    <div className="thin-scrollbar overflow-x-auto rounded-lg border border-outline-variant">
      <table className="w-full border-collapse">
        <thead className="bg-surface-container-low">
          <tr>
            {section.headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="whitespace-nowrap border-b border-outline-variant px-4 py-2.5 text-left font-mono text-label-caps uppercase tracking-wider text-on-surface-variant"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, i) => (
            <tr key={i} className="even:bg-surface-container-low/40">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-outline-variant px-4 py-2.5 align-top font-body-sm text-on-surface-variant">
                  <InlineMarkup text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Terms({ section }) {
  return (
    <dl className="divide-y divide-[rgb(var(--c-outline-variant))] overflow-hidden rounded-lg border border-outline-variant">
      {section.terms.map((t, i) => (
        <div key={i} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-4">
          <dt className="font-mono text-code-md font-semibold text-primary-ink">{t.term}</dt>
          <dd className="font-body-sm leading-6 text-on-surface-variant">
            <InlineMarkup text={t.definition} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function List({ section }) {
  const Tag = section.ordered ? 'ol' : 'ul';
  return (
    <Tag className={cx('max-w-prose space-y-2 pl-6 font-body-md leading-7 text-on-surface-variant', section.ordered ? 'list-decimal' : 'list-disc')}>
      {section.items.map((item, i) => (
        <li key={i}>
          <InlineMarkup text={item} />
        </li>
      ))}
    </Tag>
  );
}

/**
 * Renders one lesson section.
 * An unrecognised kind degrades to prose rather than throwing, so a content
 * mistake can never blank a lesson the learner is halfway through.
 */
export function LessonSection({ section, index, onExerciseRef }) {
  switch (section.kind) {
    case SECTION.HEADING:
      return (
        <h2
          id={headingId(section.text, index)}
          className="scroll-mt-24 border-b border-outline-variant pb-2 font-heading text-headline-sm text-on-surface"
        >
          {section.text}
        </h2>
      );
    case SECTION.PROSE:
      return <Prose body={section.body} />;
    case SECTION.CODE:
      return (
        <CodeBlock
          code={section.code}
          language={section.language}
          caption={section.caption}
          output={section.output}
          runnable={section.runnable}
          needsDom={section.needsDom}
          html={section.html}
        />
      );
    case SECTION.ANNOTATED_CODE:
      return <AnnotatedCode section={section} />;
    case SECTION.CALLOUT:
      return <Callout section={section} />;
    case SECTION.COMPARISON:
      return <Comparison section={section} />;
    case SECTION.PREDICT:
      return <Predict section={section} />;
    case SECTION.STEPS:
      return <Steps section={section} />;
    case SECTION.TABLE:
      return <Table section={section} />;
    case SECTION.TERMS:
      return <Terms section={section} />;
    case SECTION.LIST:
      return <List section={section} />;
    case SECTION.DIAGRAM:
      return <Diagram id={section.diagram} caption={section.caption} />;
    case SECTION.EXERCISE_REF:
      return onExerciseRef?.(section.exerciseId) ?? null;
    default:
      return section.body ? <Prose body={section.body} /> : null;
  }
}

export { Badge };
