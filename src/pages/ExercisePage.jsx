import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExercise, exerciseById, lessonById, moduleById } from '../content/registry.js';
import { ExerciseRunner } from '../features/exercises/ExerciseRunner.jsx';
import { Icon, Card } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { ContentLoadState } from '../components/feedback/ContentLoadState.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useT } from '../i18n/index.jsx';

export default function ExercisePage() {
  const { exerciseId } = useParams();
  const t = useT();
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
    return <ContentLoadState error={error} kind="exercise" backTo="/practice" backLabel={t('nav.backToPractice')} />;
  }
  if (!exercise) return <ContentSkeleton lines={8} />;

  const lesson = meta?.lessonId ? lessonById[meta.lessonId] : null;
  const module = lesson ? moduleById[lesson.moduleId] : null;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link to="/practice" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> {t('practice.title')}
      </Link>
      <ExerciseRunner exercise={exercise} />
      {lesson && module && (
        <Card className="mt-5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            {t('learning.exerciseBelongsPrefix')}{' '}
            <Link to={`/learn/${module.slug}/${lesson.slug}`} className="text-primary-ink underline underline-offset-2">
              <Authored>{lesson.title}</Authored>
            </Link>
            {t('learning.exerciseBelongsSuffix')}
          </p>
        </Card>
      )}
    </div>
  );
}
