import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLesson, lessons as allLessons, moduleById } from '../content/registry.js';
import { Card, Button, Icon, ProgressBar, EmptyState, SectionLabel, cx } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';

/**
 * Optional placement check.
 *
 * Questions are sampled from lesson quizzes spread across the curriculum, so the
 * check always reflects the material that actually exists. The result only
 * *recommends* a starting module — it never labels the learner or locks anything.
 */
export default function Placement() {
  const navigate = useNavigate();
  const { actions } = useUserState();
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const withQuiz = allLessons.filter((l) => l.quizQuestionCount > 0);
    // Spread the sample evenly across the curriculum rather than clustering.
    const step = Math.max(1, Math.floor(withQuiz.length / 10));
    const sample = withQuiz.filter((_, i) => i % step === 0).slice(0, 10);

    Promise.all(sample.map((l) => getLesson(l.id)))
      .then((full) => {
        if (cancelled) return;
        setQuestions(
          full
            .map((lesson) => {
              const q = lesson.quiz?.questions?.[0];
              return q ? { ...q, moduleId: lesson.moduleId, lessonTitle: lesson.title } : null;
            })
            .filter(Boolean),
        );
      })
      .catch(() => { if (!cancelled) setQuestions([]); });
    return () => { cancelled = true; };
  }, []);

  if (!questions) return <div className="mx-auto max-w-2xl px-4 py-20"><ContentSkeleton lines={8} /></div>;

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon="hourglass_empty"
          title="Placement check unavailable"
          message="There is not yet enough quiz content in this build to place you reliably. Start from Module 00 and skip ahead wherever you are already comfortable."
          action={<Button to="/curriculum" icon="school">Browse the curriculum</Button>}
        />
      </div>
    );
  }

  const question = questions[index];

  const answer = (optionIndex) => {
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);
    if (index < questions.length - 1) setIndex((i) => i + 1);
    else setDone(true);
  };

  if (done) {
    const correct = questions.filter((q) => {
      const a = answers[q.id];
      return Array.isArray(q.correct) ? false : a === q.correct;
    });
    const ratio = correct.length / questions.length;

    // Recommend the first module where the learner got a question wrong.
    const firstWrong = questions.find((q) => answers[q.id] !== q.correct);
    const recommended = firstWrong ? moduleById[firstWrong.moduleId] : moduleById.m00;

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="p-6">
          <h1 className="font-display text-headline-md text-on-surface">
            {correct.length} of {questions.length} correct
          </h1>
          <ProgressBar value={ratio} className="mt-4" height={6} label="Placement score" />
          <p className="mt-5 font-body-md leading-7 text-on-surface-variant">
            This is a short sample, not a verdict — ten questions cannot measure everything you know.
            It is enough to suggest a sensible place to begin.
          </p>

          {recommended && (
            <div className="mt-6 rounded border border-primary/30 bg-primary/5 p-5">
              <SectionLabel className="mb-1">Suggested starting point</SectionLabel>
              <p className="font-heading text-title-md text-on-surface">
                Module {String(recommended.order).padStart(2, '0')} — {recommended.title}
              </p>
              <p className="mt-1 font-body-sm text-on-surface-variant">{recommended.description}</p>
              <Button to={`/curriculum/${recommended.slug}`} className="mt-4" iconRight="arrow_forward">
                Start here
              </Button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to="/curriculum" variant="secondary" icon="school">See the whole curriculum</Button>
            <Button
              variant="ghost"
              onClick={() => { actions.updateProfile({ onboarded: true }); navigate('/dashboard'); }}
            >
              Go to dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="flex items-center px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
        <Link to="/dashboard" className="ml-auto font-body-sm text-on-surface-variant transition hover:text-on-surface">Skip</Link>
      </header>
      <ProgressBar value={index / questions.length} height={2} label="Placement progress" />

      <main id="main-content" className="mx-auto w-full max-w-2xl px-4 py-10">
        <p className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          Question {index + 1} of {questions.length}
        </p>
        <h1 className="mt-3 font-heading text-title-md leading-8 text-on-surface">{question.prompt}</h1>

        {question.code && (
          <pre className="thin-scrollbar mt-4 overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-mono text-code-md text-on-surface">
            {question.code}
          </pre>
        )}

        <div className="mt-6 space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              className={cx(
                'w-full rounded border border-outline-variant bg-surface-container-low px-4 py-3 text-left font-body-md text-on-surface transition-colors hover:border-primary hover:bg-primary/5',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="mt-6 font-body-sm text-on-surface-variant">
          <Icon name="info" size={14} className="mr-1.5 inline" />
          Answers are not revealed during the check — that keeps the result meaningful.
        </p>
      </main>
    </div>
  );
}
