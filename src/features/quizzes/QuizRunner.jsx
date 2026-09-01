import { useMemo, useState } from 'react';
import { HighlightedCode } from '../../components/code/CodeBlock.jsx';
import { Button, Icon, Badge, ProgressBar, cx } from '../../components/ui/index.jsx';
import { useUserState } from '../../state/UserStateProvider.jsx';
import { QUIZ_KIND } from '../../content/schema/types.js';
import { QUIZ_PASS_THRESHOLD } from '../progress/progressEngine.js';
import { InlineMarkup } from '../../components/learning/InlineMarkup.jsx';

/**
 * The quiz engine.
 *
 * Answers are checked one question at a time and the explanation appears
 * immediately, because a quiz here is a diagnostic instrument rather than an exam.
 * Where the content supplies per-option rationales, the learner sees why the
 * option they chose was wrong — not merely that it was.
 */
export function QuizRunner({ quiz, onComplete, title = 'Check your understanding' }) {
  const { actions } = useUserState();
  const questions = useMemo(() => quiz.questions ?? [], [quiz.questions]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answer = answers[question?.id];
  const isRevealed = Boolean(revealed[question?.id]);
  const isMulti = question?.kind === QUIZ_KIND.MULTIPLE;

  const isCorrect = useMemo(() => {
    if (!question || answer == null) return false;
    if (isMulti) {
      const chosen = [...(answer ?? [])].sort();
      const correct = [...question.correct].sort();
      return chosen.length === correct.length && chosen.every((v, i) => v === correct[i]);
    }
    return answer === question.correct;
  }, [question, answer, isMulti]);

  const score = useMemo(
    () =>
      questions.reduce((n, q) => {
        const a = answers[q.id];
        if (a == null) return n;
        if (q.kind === QUIZ_KIND.MULTIPLE) {
          const chosen = [...(a ?? [])].sort();
          const correct = [...q.correct].sort();
          return n + (chosen.length === correct.length && chosen.every((v, i) => v === correct[i]) ? 1 : 0);
        }
        return n + (a === q.correct ? 1 : 0);
      }, 0),
    [questions, answers],
  );

  const select = (optionIndex) => {
    if (isRevealed) return;
    setAnswers((prev) => {
      if (!isMulti) return { ...prev, [question.id]: optionIndex };
      const current = prev[question.id] ?? [];
      const next = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      return { ...prev, [question.id]: next };
    });
  };

  const check = () => setRevealed((r) => ({ ...r, [question.id]: true }));

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    const wrongQuestionIds = questions
      .filter((q) => {
        const a = answers[q.id];
        if (a == null) return true;
        if (q.kind === QUIZ_KIND.MULTIPLE) {
          const chosen = [...(a ?? [])].sort();
          const correct = [...q.correct].sort();
          return !(chosen.length === correct.length && chosen.every((v, i) => v === correct[i]));
        }
        return a !== q.correct;
      })
      .map((q) => q.id);

    actions.recordQuiz(quiz, { score, total: questions.length, wrongQuestionIds });
    setFinished(true);
    onComplete?.({ score, total: questions.length, wrongQuestionIds });
  };

  const restart = () => {
    setAnswers({});
    setRevealed({});
    setIndex(0);
    setFinished(false);
  };

  if (questions.length === 0) return null;

  /* ---------------- Results ---------------- */
  if (finished) {
    const ratio = score / questions.length;
    const passed = ratio >= QUIZ_PASS_THRESHOLD;
    const missed = questions.filter((q) => {
      const a = answers[q.id];
      if (a == null) return true;
      if (q.kind === QUIZ_KIND.MULTIPLE) {
        const chosen = [...(a ?? [])].sort();
        const correct = [...q.correct].sort();
        return !(chosen.length === correct.length && chosen.every((v, i) => v === correct[i]));
      }
      return a !== q.correct;
    });

    return (
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6">
        <div className="flex items-center gap-4">
          <div
            className={cx(
              'grid h-14 w-14 shrink-0 place-items-center rounded-full',
              passed ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
            )}
          >
            <Icon name={passed ? 'check_circle' : 'refresh'} size={28} filled />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-title-md text-on-surface">
              {score} out of {questions.length} correct
            </h3>
            <p className="mt-0.5 font-body-sm text-on-surface-variant">
              {passed
                ? 'Solid understanding — you can move on with confidence.'
                : 'Worth another pass. Reviewing the explanations below is the fastest way to close the gap.'}
            </p>
          </div>
        </div>

        <ProgressBar value={ratio} className="mt-5" tone={passed ? 'success' : 'primary'} label="Quiz score" />

        {missed.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
              Review these
            </p>
            <div className="space-y-3">
              {missed.map((q) => (
                <div key={q.id} className="rounded border border-outline-variant bg-surface-container px-4 py-3">
                  <p className="font-body-sm font-medium text-on-surface"><InlineMarkup text={q.prompt} /></p>
                  <p className="mt-1.5 font-body-sm text-success">
                    Correct answer:{' '}
                    {q.kind === QUIZ_KIND.MULTIPLE
                      ? q.correct.map((i) => q.options[i]).join(', ')
                      : q.options[q.correct]}
                  </p>
                  <p className="mt-1.5 font-body-sm leading-6 text-on-surface-variant">{q.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button variant="secondary" className="mt-6" onClick={restart} icon="refresh">
          Retake quiz
        </Button>
      </div>
    );
  }

  /* ---------------- Question ---------------- */
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-heading text-title-md text-on-surface">{title}</h3>
        <span className="shrink-0 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          {index + 1} / {questions.length}
        </span>
      </div>

      <ProgressBar value={(index + (isRevealed ? 1 : 0)) / questions.length} className="mb-6" label="Quiz progress" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {isMulti && <Badge tone="info">Select all that apply</Badge>}
        {question.kind === QUIZ_KIND.OUTPUT && <Badge tone="warning">Predict the output</Badge>}
      </div>

      <p className="mb-4 font-body-lg leading-7 text-on-surface"><InlineMarkup text={question.prompt} /></p>

      {question.code && (
        <div className="mb-5 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest px-4 py-3">
          <HighlightedCode code={question.code} showLineNumbers />
        </div>
      )}

      <fieldset className="space-y-2">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options.map((option, i) => {
          const chosen = isMulti ? (answer ?? []).includes(i) : answer === i;
          const correct = isMulti ? question.correct.includes(i) : i === question.correct;
          return (
            <label
              key={i}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded border px-3.5 py-3 transition-colors',
                isRevealed && correct && 'border-success/50 bg-success/10',
                isRevealed && chosen && !correct && 'border-error/50 bg-error/10',
                isRevealed && !correct && !chosen && 'border-outline-variant opacity-60',
                !isRevealed && chosen && 'border-primary bg-primary/5',
                !isRevealed && !chosen && 'border-outline-variant hover:bg-surface-container',
              )}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={`quiz-${quiz.id}-${question.id}`}
                checked={chosen}
                disabled={isRevealed}
                onChange={() => select(i)}
                className="mt-0.5 accent-[rgb(var(--c-primary))]"
              />
              <span className="min-w-0 flex-1">
                <span className="font-body-md text-on-surface"><InlineMarkup text={option} /></span>
                {/* Distractor rationale: why this specific option is wrong. */}
                {isRevealed && question.optionExplanations?.[i] && (
                  <span
                    className={cx(
                      'mt-1 block font-body-sm',
                      correct ? 'text-success' : 'text-on-surface-variant',
                    )}
                  >
                    {question.optionExplanations[i]}
                  </span>
                )}
              </span>
              {isRevealed && correct && <Icon name="check_circle" size={18} className="shrink-0 text-success" filled />}
              {isRevealed && chosen && !correct && <Icon name="cancel" size={18} className="shrink-0 text-error" filled />}
            </label>
          );
        })}
      </fieldset>

      {isRevealed && (
        <div
          className={cx(
            'mt-4 rounded border px-4 py-3',
            isCorrect ? 'border-success/40 bg-success/10' : 'border-info/40 bg-info/10',
          )}
          role="status"
        >
          <p className={cx('mb-1 flex items-center gap-2 font-body-sm font-bold', isCorrect ? 'text-success' : 'text-info')}>
            <Icon name={isCorrect ? 'check_circle' : 'school'} size={16} filled />
            {isCorrect ? 'Correct' : 'Here’s why'}
          </p>
          <p className="font-body-sm leading-6 text-on-surface-variant">{question.explanation}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!isRevealed ? (
          <Button
            onClick={check}
            disabled={answer == null || (isMulti && answer.length === 0)}
            icon="check"
          >
            Check answer
          </Button>
        ) : (
          <Button onClick={next} iconRight={index < questions.length - 1 ? 'arrow_forward' : 'flag'}>
            {index < questions.length - 1 ? 'Next question' : 'Finish quiz'}
          </Button>
        )}
        {index > 0 && !isRevealed && (
          <Button variant="ghost" onClick={() => setIndex((i) => i - 1)} icon="arrow_back">
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
