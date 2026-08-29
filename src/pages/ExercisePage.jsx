import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExercise, exerciseById, lessonById, moduleById } from '../content/registry.js';
import { ExerciseRunner } from '../features/exercises/ExerciseRunner.jsx';
import { Button, Icon, EmptyState, Card } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [error, setError] = useState(null);
  const meta = exerciseById[exerciseId];

  useEffect(() => {
    let cancelled = false;
    setExercise(null);
    setError(null);
    getExercise(exerciseId)
      .then((e) => { if (!cancelled) setExercise(e); })
      .catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [exerciseId]);

  if (error) {
    return (
      <EmptyState
        icon="search_off"
        title="Exercise not found"
        message={error.message}
        action={<Button to="/practice" icon="fitness_center">Back to practice</Button>}
      />
    );
  }
  if (!exercise) return <ContentSkeleton lines={8} />;

  const lesson = meta?.lessonId ? lessonById[meta.lessonId] : null;
  const module = lesson ? moduleById[lesson.moduleId] : null;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link to="/practice" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Practice Hub
      </Link>
      <ExerciseRunner exercise={exercise} />
      {lesson && module && (
        <Card className="mt-5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            This exercise belongs to{' '}
            <Link to={`/learn/${module.slug}/${lesson.slug}`} className="text-primary-ink underline underline-offset-2">
              {lesson.title}
            </Link>
            . Revisit the lesson if you would like to review the concept first.
          </p>
        </Card>
      )}
    </div>
  );
}
