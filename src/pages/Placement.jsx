import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { modules, moduleById } from '../content/registry.js';
import PLACEMENT_QUESTIONS from '../content/placement/index.js';
import {
  PLACEMENT_DOMAIN_LABEL,
  PLACEMENT_LEVEL_LABEL,
  QUIZ_KIND,
} from '../content/schema/types.js';
import {
  placeLearner,
  toStoredPlacement,
  MASTERY_THRESHOLD,
  WEAK_THRESHOLD,
} from '../features/placement/placementEngine.js';
import { Card, Button, Icon, ProgressBar, SectionLabel, cx } from '../components/ui/index.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';

/**
 * The placement assessment.
 *
 * It answers one question — "where should I start?" — and nothing else. It is
 * free for everyone including guests, it never locks or skips any curriculum,
 * and it never marks anything complete: the result is a recommendation backed by
 * the learner's own answers, and they remain free to ignore it.
 *
 * Answers are not revealed during the assessment. Teaching the answer after each
 * question would make every later question measure recall of the last minute
 * rather than what the learner actually knew when they arrived.
 */

const STAGE = { INTRO: 'intro', QUESTIONS: 'questions', RESULT: 'result' };

function Shell({ children, progress, progressLabel }) {
  return (
    <div className="safe-page safe-top safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link
          to="/dashboard"
          className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface"
        >
          Skip
        </Link>
      </header>
      {progress !== undefined && (
        <ProgressBar value={progress} height={2} label={progressLabel} />
      )}
      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        {children}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Intro
 * ------------------------------------------------------------------ */

function Intro({ total, onStart, previous }) {
  return (
    <>
      <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
        Placement assessment
      </p>
      <h1 className="mt-2 font-display text-headline-md text-on-surface">
        Find out where to start
      </h1>
      <p className="mt-3 font-body-md leading-7 text-on-surface-variant">
        Answer {total} JavaScript questions so JSPath can recommend where to begin. This does not
        lock or skip any curriculum — every module stays open to you either way.
      </p>

      <ul className="mt-6 space-y-3">
        {[
          ['schedule', `${total} multiple-choice questions, roughly 15 minutes.`],
          ['visibility_off', 'Answers are not revealed as you go, so the result means something.'],
          ['edit', 'You can go back and change any answer before you submit.'],
          ['lock_open', 'Free for everyone. Nothing here requires an account or a subscription.'],
        ].map(([icon, text]) => (
          <li key={icon} className="flex items-start gap-3">
            <Icon name={icon} size={18} className="mt-0.5 shrink-0 text-on-surface-variant" />
            <span className="font-body-sm leading-6 text-on-surface-variant">{text}</span>
          </li>
        ))}
      </ul>

      {previous && (
        <Card className="mt-6 p-4">
          <SectionLabel className="mb-1">Your last result</SectionLabel>
          <p className="font-body-sm text-on-surface-variant">
            {PLACEMENT_LEVEL_LABEL[previous.level]} — {previous.correctCount} of{' '}
            {previous.totalCount} correct. Retaking replaces it; your curriculum progress is
            untouched.
          </p>
        </Card>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={onStart} size="lg" iconRight="arrow_forward">
          {previous ? 'Retake the assessment' : 'Start the assessment'}
        </Button>
        <Button to="/curriculum" variant="secondary" size="lg" icon="school">
          Browse the curriculum
        </Button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Questions
 * ------------------------------------------------------------------ */

function QuestionStage({ questions, answers, index, onAnswer, onMove, onSubmit }) {
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const selected = answers[question.id];
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;

  const toggleMulti = (i) => {
    const current = Array.isArray(selected) ? selected : [];
    onAnswer(question.id, current.includes(i) ? current.filter((x) => x !== i) : [...current, i]);
  };

  const isMulti = question.kind === QUIZ_KIND.MULTIPLE;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          Question {index + 1} of {questions.length}
        </p>
        <p className="font-body-sm text-on-surface-variant">{answeredCount} answered</p>
      </div>

      <h1 className="mt-3 font-heading text-title-md leading-8 text-on-surface">
        <InlineMarkup text={question.prompt} />
      </h1>

      {question.code && (
        <pre className="thin-scrollbar mt-4 max-w-full overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-mono text-code-md text-on-surface">
          {question.code}
        </pre>
      )}

      {isMulti && (
        <p className="mt-3 font-body-sm text-on-surface-variant">Select every option that applies.</p>
      )}

      <div className="mt-6 space-y-2" role={isMulti ? 'group' : 'radiogroup'} aria-label="Answer options">
        {question.options.map((option, i) => {
          const active = isMulti ? Array.isArray(selected) && selected.includes(i) : selected === i;
          return (
            <button
              key={i}
              type="button"
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={active}
              onClick={() => (isMulti ? toggleMulti(i) : onAnswer(question.id, i))}
              className={cx(
                'flex w-full items-start gap-3 rounded border px-4 py-3 text-left font-body-md transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-on-surface'
                  : 'border-outline-variant bg-surface-container-low text-on-surface hover:border-primary hover:bg-primary/5',
              )}
            >
              <Icon
                name={
                  active
                    ? (isMulti ? 'check_box' : 'radio_button_checked')
                    : (isMulti ? 'check_box_outline_blank' : 'radio_button_unchecked')
                }
                size={20}
                className={cx('mt-0.5 shrink-0', active ? 'text-primary-ink' : 'text-on-surface-variant')}
              />
              <span className="min-w-0 flex-1 break-words">
                <InlineMarkup text={option} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => onMove(index - 1)}
          disabled={index === 0}
          icon="arrow_back"
        >
          Previous
        </Button>
        {isLast ? (
          <Button onClick={onSubmit} iconRight="check">
            Submit and see my result
          </Button>
        ) : (
          <Button onClick={() => onMove(index + 1)} iconRight="arrow_forward">
            Next
          </Button>
        )}
        {selected === undefined && (
          <span className="font-body-sm text-on-surface-variant">
            You can skip this and come back to it.
          </span>
        )}
      </div>

      <p className="mt-6 font-body-sm text-on-surface-variant">
        <Icon name="info" size={14} className="mr-1.5 inline" />
        Answers are not revealed during the assessment — that is what keeps the result honest.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Result
 * ------------------------------------------------------------------ */

const pct = (n) => Math.round(n * 100);

function DomainBar({ entry }) {
  const label = PLACEMENT_DOMAIN_LABEL[entry.domain] ?? entry.domain;
  const tone =
    entry.score >= MASTERY_THRESHOLD ? 'strong' : entry.score >= WEAK_THRESHOLD ? 'mixed' : 'gap';
  const toneLabel = { strong: 'Strong', mixed: 'Mixed', gap: 'Focus area' }[tone];
  const toneClass = {
    strong: 'bg-success text-on-success',
    mixed: 'bg-surface-container-high text-on-surface',
    gap: 'bg-error text-on-error',
  }[tone];

  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-body-md text-on-surface">{label}</span>
        <span className="flex items-center gap-2">
          {/* The badge repeats the bar in words, so the result never relies on colour alone. */}
          <span className={cx('rounded px-2 py-0.5 font-mono text-label-caps uppercase', toneClass)}>
            {toneLabel}
          </span>
          <span className="font-mono text-code-sm text-on-surface-variant">
            {entry.correct}/{entry.total}
          </span>
        </span>
      </div>
      <ProgressBar
        value={entry.score}
        height={6}
        className="mt-2"
        label={`${label}: ${pct(entry.score)} percent, ${toneLabel}`}
      />
    </li>
  );
}

function Result({ result, onRetake }) {
  const navigate = useNavigate();
  const { actions } = useUserState();
  const recommended = moduleById[result.recommendedModuleId];

  // Every sentence below is derived from the learner's own answers. There is no
  // "readiness" figure and no analysis that the assessment did not actually do.
  const label = (d) => PLACEMENT_DOMAIN_LABEL[d] ?? d;
  const list = (items) =>
    items.length <= 1
      ? items.map(label).join('')
      : `${items.slice(0, -1).map(label).join(', ')} and ${label(items[items.length - 1])}`;

  // Only the domain the recommendation actually turns on is named as the gap.
  // Listing every weak area here would imply the earliest one was all of them.
  const target = result.recommendedDomain;
  const targetIsGap = result.gaps.includes(target);

  const why = result.recommendationReason
    ? `You scored ${pct(result.score)}% overall and ${result.recommendationReason}.`
    : result.strengths.length
      ? `${list(result.strengths)} ${result.strengths.length === 1 ? 'came' : 'came'} out strong, but ${label(target)} is the earliest area where the answers ${targetIsGap ? 'showed real gaps' : 'were inconsistent'}.`
      : `${label(target)} is the earliest area where the answers ${targetIsGap ? 'showed real gaps' : 'were inconsistent'}, so it is the natural place to begin.`;

  return (
    <>
      <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
        Your result
      </p>
      <h1 className="mt-2 font-display text-headline-md text-on-surface">
        {PLACEMENT_LEVEL_LABEL[result.level]}
      </h1>
      <p className="mt-3 font-body-md leading-7 text-on-surface-variant">
        You answered {result.correctCount} of {result.totalCount} questions correctly
        ({pct(result.score)}% weighted by difficulty). This is a starting point, not a verdict —
        nothing is locked and you can begin anywhere you like.
      </p>

      {recommended && (
        <div className="mt-6 rounded border border-primary/30 bg-primary/5 p-5">
          <SectionLabel className="mb-1">Recommended start</SectionLabel>
          <p className="font-heading text-title-md text-on-surface">
            Module {String(recommended.order).padStart(2, '0')} — {recommended.title}
          </p>
          <p className="mt-2 font-body-sm leading-6 text-on-surface-variant">
            <span className="font-semibold text-on-surface">Why: </span>
            {why}
          </p>
          <Button
            to={`/curriculum/${recommended.slug}`}
            className="mt-4"
            iconRight="arrow_forward"
            onClick={() => actions.updateProfile({ onboarded: true })}
          >
            Start here
          </Button>
        </div>
      )}

      <Card className="mt-6 p-5">
        <SectionLabel className="mb-4">How each area went</SectionLabel>
        <ul className="space-y-4">
          {result.breakdown.map((entry) => (
            <DomainBar key={entry.domain} entry={entry} />
          ))}
        </ul>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/curriculum" variant="secondary" icon="school">
          Browse the whole curriculum
        </Button>
        <Button variant="secondary" onClick={onRetake} icon="refresh">
          Retake assessment
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            actions.updateProfile({ onboarded: true });
            navigate('/dashboard');
          }}
        >
          Go to dashboard
        </Button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function Placement() {
  const { state, actions } = useUserState();
  const questions = PLACEMENT_QUESTIONS;

  const [stage, setStage] = useState(STAGE.INTRO);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const previous = state.placement ?? null;

  const move = (next) => setIndex(Math.min(questions.length - 1, Math.max(0, next)));

  // Keyed by question id, so changing an answer replaces it rather than adding a
  // second one — a question can never be scored twice.
  const answer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const submit = () => {
    const placed = placeLearner({ questions, answers, modules });
    setResult(placed);
    // Persisted through the existing user-state path, which handles guests via
    // local storage and signed-in learners via the normal sync. Placement writes
    // one key and never touches lesson, exercise or challenge progress.
    actions.savePlacement(toStoredPlacement(placed));
    setStage(STAGE.RESULT);
  };

  const retake = () => {
    // A clean attempt: previous answers are discarded rather than merged.
    setAnswers({});
    setIndex(0);
    setResult(null);
    setStage(STAGE.QUESTIONS);
  };

  const progress = useMemo(() => {
    if (stage === STAGE.INTRO) return 0;
    if (stage === STAGE.RESULT) return 1;
    return index / questions.length;
  }, [stage, index, questions.length]);

  return (
    <Shell progress={progress} progressLabel="Placement progress">
      {stage === STAGE.INTRO && (
        <Intro
          total={questions.length}
          previous={previous}
          onStart={() => {
            setAnswers({});
            setIndex(0);
            setStage(STAGE.QUESTIONS);
          }}
        />
      )}

      {stage === STAGE.QUESTIONS && (
        <QuestionStage
          questions={questions}
          answers={answers}
          index={index}
          onAnswer={answer}
          onMove={move}
          onSubmit={submit}
        />
      )}

      {stage === STAGE.RESULT && result && <Result result={result} onRetake={retake} />}
    </Shell>
  );
}
