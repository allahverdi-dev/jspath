import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getExercise, exercises as allExercises, contentIndex } from '../content/registry.js';
import { ExerciseRunner } from '../features/exercises/ExerciseRunner.jsx';
import { Card, Button, Icon, ProgressBar, EmptyState } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { weakTopics } from '../features/mastery/masteryEngine.js';
import { reviewQueue } from '../features/progress/recommendations.js';
import { Logo } from '../layouts/AppShell.jsx';

const SIZE = { daily: 5, weak: 8, mistakes: 10, random: 10 };

export default function PracticeSession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useUserState();
  const mode = params.get('mode') ?? 'random';

  const [exercises, setExercises] = useState(null);
  const [index, setIndex] = useState(0);
  // Ids rather than a counter: ExerciseRunner calls onSolved on every passing
  // run, so re-running a solved exercise used to inflate the total and let the
  // summary claim more solved than the session contained.
  const [solvedIds, setSolvedIds] = useState(() => new Set());

  const selected = useMemo(() => {
    let pool = allExercises;
    if (mode === 'weak') {
      const weak = weakTopics(state, contentIndex.topics, contentIndex, { limit: 4 }).map((t) => t.topicId);
      pool = allExercises.filter((e) => e.topicIds.some((t) => weak.includes(t)));
    } else if (mode === 'mistakes') {
      const ids = new Set(reviewQueue(state, contentIndex).map((r) => r.refId));
      pool = allExercises.filter((e) => ids.has(e.id));
    } else if (mode === 'daily') {
      pool = allExercises.filter((e) => !state.exercises[e.id]?.solved);
    }
    if (pool.length === 0) pool = allExercises;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, SIZE[mode] ?? 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    if (selected.length === 0) { setExercises([]); return undefined; }
    Promise.all(selected.map((e) => getExercise(e.id)))
      .then((full) => { if (!cancelled) setExercises(full); })
      .catch(() => { if (!cancelled) setExercises([]); });
    return () => { cancelled = true; };
  }, [selected]);

  const titles = { daily: 'Daily practice', weak: 'Weak-topic practice', mistakes: 'Review your mistakes', random: 'Random practice' };

  if (exercises && exercises.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState icon="hourglass_empty" title="Nothing to practise yet" message="There are no exercises available for this session type." action={<Button to="/practice">Back to Practice Hub</Button>} />
      </div>
    );
  }

  const finished = exercises && index >= exercises.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="safe-top sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <button type="button" onClick={() => navigate('/practice')} className="flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
            <Icon name="close" size={18} /> Exit
          </button>
          <Logo size="sm" className="mx-auto hidden sm:flex" />
          {exercises && !finished && (
            <span className="ml-auto font-mono text-code-sm text-on-surface-variant">{index + 1} / {exercises.length}</span>
          )}
        </div>
        {exercises && <ProgressBar value={exercises.length ? index / exercises.length : 0} height={2} label="Session progress" />}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-display text-headline-md text-on-surface">{titles[mode]}</h1>

        {!exercises ? (
          <ContentSkeleton lines={8} />
        ) : finished ? (
          <Card className="p-6 text-center">
            <Icon name="check_circle" size={40} className="mx-auto text-success" filled />
            <h2 className="mt-4 font-heading text-headline-sm text-on-surface">Session complete</h2>
            <p className="mt-2 font-body-md text-on-surface-variant">
              You solved {solvedIds.size} of {exercises.length} exercises in this set.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button as={Link} to="/practice" icon="fitness_center">Back to Practice Hub</Button>
              <Button variant="secondary" onClick={() => { setIndex(0); setSolvedIds(new Set()); }} icon="refresh">Run it again</Button>
            </div>
          </Card>
        ) : (
          <>
            <ExerciseRunner key={exercises[index].id} exercise={exercises[index]} onSolved={(ex) => setSolvedIds((prev) => (prev.has(ex.id) ? prev : new Set(prev).add(ex.id)))} />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIndex((i) => i + 1)} iconRight="arrow_forward">
                {index < exercises.length - 1 ? 'Next exercise' : 'Finish session'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
