import { useCallback, useEffect, useMemo, useState } from 'react';
import { CodeEditor } from '../../components/code/CodeEditor.jsx';
import { CodeBlock, HighlightedCode } from '../../components/code/CodeBlock.jsx';
import { ConsoleOutput } from '../../components/code/ConsoleOutput.jsx';
import { Button, Icon, Badge, DifficultyBadge, Disclosure, cx } from '../../components/ui/index.jsx';
import { runCode } from '../../services/sandbox/index.js';
import { useUserState } from '../../state/UserStateProvider.jsx';
import { EXERCISE_KIND } from '../../content/schema/types.js';
import { useT } from '../../i18n/index.jsx';
import { ContentGate, ProPreview } from '../../components/billing/FeatureGate.jsx';
import { InlineMarkup } from '../../components/learning/InlineMarkup.jsx';
import { Authored } from '../../components/learning/Authored.jsx';

const CHOICE_KINDS = [
  EXERCISE_KIND.PREDICT_OUTPUT,
  EXERCISE_KIND.CONCEPTUAL,
  EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
];

/* Kind tokens are stable content data; only the chip wording is per-language. */
const KIND_KEY = Object.fromEntries(
  Object.values(EXERCISE_KIND).map((value) => [value, `exerciseKind.${value}`]),
);

/**
 * The exercise engine.
 *
 * Feedback is progressive by design: a failed run names which assertions passed
 * and which did not, then offers a conceptual hint, then a stronger hint, and only
 * reveals the worked solution once the learner deliberately asks for it. Nothing
 * ever just says "Wrong."
 */
export function ExerciseRunner(props) {
  const t = useT();
  return (
    <ContentGate kind="exercise" id={props.exercise.id} fallback={
      <ProPreview title={props.exercise.title} message={t('billing.lockedExerciseInline')} />
    }>
      <AccessibleExerciseRunner key={props.exercise.id} {...props} />
    </ContentGate>
  );
}

function AccessibleExerciseRunner({ exercise, onSolved, compact = false }) {
  const { state, actions } = useUserState();
  const t = useT();
  const record = state.exercises[exercise.id];
  const isChoice = CHOICE_KINDS.includes(exercise.kind);

  const [code, setCode] = useState(exercise.starterCode ?? '');
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setCode(record?.lastCode ?? exercise.starterCode ?? '');
    setSelected(null);
    setResult(null);
    setChecked(false);
    setHintsShown(0);
    setSolutionShown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const solved = Boolean(record?.solved);

  /* --- Choice-based exercises --- */
  const submitChoice = useCallback(() => {
    if (selected == null) return;
    const passed = selected === exercise.correct;
    setChecked(true);
    actions.recordExercise(exercise, { passed });
    if (passed) onSolved?.(exercise);
  }, [selected, exercise, actions, onSolved]);

  /* --- Code exercises --- */
  const run = useCallback(async () => {
    setRunning(true);
    const res = await runCode(code, {
      tests: exercise.tests ?? [],
      needsDom: exercise.kind === EXERCISE_KIND.DOM_TASK || exercise.needsDom,
      html: exercise.html ?? '',
      timeout: exercise.timeout ?? 4000,
    });
    setResult(res);
    setChecked(true);
    setRunning(false);
    actions.recordExercise(exercise, { passed: res.passed, code });
    if (res.passed) onSolved?.(exercise);
  }, [code, exercise, actions, onSolved]);

  const reset = useCallback(() => {
    setCode(exercise.starterCode ?? '');
    setResult(null);
    setChecked(false);
  }, [exercise.starterCode]);

  const passedCount = result?.tests?.filter((t) => t.passed).length ?? 0;
  const totalTests = result?.tests?.length ?? 0;

  const feedback = useMemo(() => {
    if (!checked) return null;
    if (isChoice) {
      return selected === exercise.correct
        ? { tone: 'success', title: t('learning.correctShort') }
        : { tone: 'error', title: t('learning.notQuite') };
    }
    if (result?.passed) return { tone: 'success', title: t('learning.allTestsPassed') };
    // The error *name* is a JavaScript identifier (TypeError, ReferenceError) and
    // stays as it is; only the sentence around it is translated.
    if (result?.error) return { tone: 'error', title: t('learning.runFailed', { error: result.error.name }) };
    return { tone: 'error', title: t('learning.testsPassedCount', { passed: passedCount, total: totalTests }) };
  }, [checked, isChoice, selected, exercise.correct, result, passedCount, totalTests, t]);

  return (
    <div className={cx('rounded-lg border border-outline-variant bg-surface-container-low', compact ? 'p-4' : 'p-5')}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone="neutral" icon="fitness_center">{KIND_KEY[exercise.kind] ? t(KIND_KEY[exercise.kind]) : t('learning.exercise')}</Badge>
            <DifficultyBadge difficulty={exercise.difficulty} />
            <Badge tone="primary">{t('common.xpPlus', { count: exercise.xp })}</Badge>
            {solved && <Badge tone="success" icon="check_circle">{t('learning.solved')}</Badge>}
          </div>
          <h3 className="font-heading text-title-md text-on-surface"><Authored>{exercise.title}</Authored></h3>
        </div>
      </div>

      <p className="mb-4 font-body-md leading-7 text-on-surface-variant"><InlineMarkup text={exercise.instructions} /></p>

      {/* The code being reasoned about, for predict/fix exercises */}
      {exercise.code && (
        <div className="mb-4">
          <CodeBlock code={exercise.code} showLineNumbers language={exercise.language ?? 'javascript'} />
        </div>
      )}

      {isChoice ? (
        <fieldset className="space-y-2">
          <legend className="sr-only">{t('learning.chooseAnswer')}</legend>
          {exercise.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === exercise.correct;
            const reveal = checked;
            return (
              <label
                key={i}
                className={cx(
                  'flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 transition-colors',
                  reveal && isCorrect && 'border-success/50 bg-success/10',
                  reveal && isSelected && !isCorrect && 'border-error/50 bg-error/10',
                  !reveal && isSelected && 'border-primary bg-primary/5',
                  !reveal && !isSelected && 'border-outline-variant hover:bg-surface-container',
                  reveal && !isCorrect && !isSelected && 'border-outline-variant opacity-60',
                )}
              >
                <input
                  type="radio"
                  name={`exercise-${exercise.id}`}
                  checked={isSelected}
                  disabled={checked && selected === exercise.correct}
                  onChange={() => setSelected(i)}
                  className="mt-1 accent-[rgb(var(--c-primary))]"
                />
                <span className="min-w-0 flex-1 font-mono text-code-md text-on-surface"><Authored>{option}</Authored></span>
                {reveal && isCorrect && <Icon name="check_circle" size={18} className="text-success" filled />}
                {reveal && isSelected && !isCorrect && <Icon name="cancel" size={18} className="text-error" filled />}
              </label>
            );
          })}
        </fieldset>
      ) : (
        <CodeEditor
          value={code}
          onChange={setCode}
          onRun={run}
          height={compact ? 220 : 300}
          ariaLabel={t('learning.editorFor', { title: exercise.title })}
        />
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isChoice ? (
          <Button onClick={submitChoice} disabled={selected == null || (checked && selected === exercise.correct)} icon="check">
            {t('learning.checkAnswer')}
          </Button>
        ) : (
          <>
            <Button onClick={run} loading={running} icon="play_arrow">
              {running ? t('learning.running') : t('learning.runTests')}
            </Button>
            <Button variant="ghost" size="md" onClick={reset} icon="restart_alt">{t('common.reset')}</Button>
          </>
        )}

        {exercise.hints?.length > 0 && hintsShown < exercise.hints.length && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => setHintsShown((n) => n + 1)}
            icon="lightbulb"
            className="ml-auto"
          >
            {hintsShown === 0 ? t('learning.needHint') : t('learning.anotherHint')}
          </Button>
        )}
      </div>

      {/* Progressive feedback */}
      {feedback && (
        <div
          className={cx(
            'mt-4 rounded border px-4 py-3',
            feedback.tone === 'success' ? 'border-success/40 bg-success/10' : 'border-error/40 bg-error/10',
          )}
          role="status"
        >
          <p className={cx('flex items-center gap-2 font-body-sm font-bold', feedback.tone === 'success' ? 'text-success' : 'text-error')}>
            <Icon name={feedback.tone === 'success' ? 'check_circle' : 'info'} size={16} filled />
            {feedback.title}
          </p>

          {/* Per-assertion results tell the learner exactly what is not yet right. */}
          {!isChoice && result?.tests?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.tests.map((t, i) => (
                <li key={i} className="flex items-start gap-2 font-body-sm">
                  <Icon
                    name={t.passed ? 'check' : 'close'}
                    size={15}
                    className={cx('mt-0.5 shrink-0', t.passed ? 'text-success' : 'text-error')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={t.passed ? 'text-on-surface-variant' : 'text-on-surface'}><Authored>{t.name}</Authored></span>
                    {!t.passed && t.message && (
                      <span className="mt-0.5 block font-mono text-code-sm text-on-surface-variant">{t.message}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isChoice && checked && (
            <p className="mt-2 font-body-sm text-on-surface-variant">
              {selected === exercise.correct
                ? exercise.solutionExplanation
                : t('learning.readHintThenRetry')}
            </p>
          )}
        </div>
      )}

      {/* Console output from the learner's own run */}
      {!isChoice && result && (result.logs?.length > 0 || result.error) && (
        <div className="mt-4 overflow-hidden rounded border border-outline-variant">
          <ConsoleOutput result={result} />
        </div>
      )}

      {/* Hints, revealed one at a time */}
      {hintsShown > 0 && (
        <div className="mt-4 space-y-2">
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded border border-warning/30 bg-warning/5 px-3 py-2.5">
              <Icon name="lightbulb" size={16} className="mt-0.5 shrink-0 text-warning" filled />
              <p className="font-body-sm text-on-surface-variant">
                <span className="font-semibold text-on-surface">{t('learning.hintNumber', { number: i + 1 })} </span>
                {hint}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Solution — never shown until deliberately requested */}
      {!isChoice && (
        <div className="mt-4">
          {solutionShown ? (
            <Disclosure title={t('learning.workedSolution')} icon="key" defaultOpen>
              <div className="overflow-hidden rounded border border-outline-variant">
                <div className="px-4 py-3">
                  <HighlightedCode code={exercise.solution} showLineNumbers />
                </div>
              </div>
              <p className="mt-3 font-body-md leading-7 text-on-surface-variant">{exercise.solutionExplanation}</p>
            </Disclosure>
          ) : (
            <button
              type="button"
              onClick={() => setSolutionShown(true)}
              className="font-body-sm text-on-surface-variant underline underline-offset-2 transition hover:text-on-surface"
            >
              {solved ? t('learning.showWorkedSolution') : t('learning.showSolution')}
            </button>
          )}
        </div>
      )}

      {isChoice && checked && selected !== exercise.correct && (
        <div className="mt-4">
          {solutionShown ? (
            <div className="rounded border border-outline-variant bg-surface-container px-4 py-3">
              <p className="mb-1 font-body-sm font-bold text-on-surface">{t('learning.answerIs', { answer: exercise.solution })}</p>
              <p className="font-body-sm leading-6 text-on-surface-variant">{exercise.solutionExplanation}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSolutionShown(true)}
              className="font-body-sm text-on-surface-variant underline underline-offset-2 transition hover:text-on-surface"
            >
              {t('learning.showExplanation')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
