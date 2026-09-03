import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInterviewQuestion, interviewById, lessonById, moduleById } from '../content/registry.js';
import { Card, Icon, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { InterviewAnswer } from '../features/interview/InterviewAnswer.jsx';
import { ContentLoadState } from '../components/feedback/ContentLoadState.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useT } from '../i18n/index.jsx';

export default function InterviewQuestionPage() {
  const { questionId } = useParams();
  const t = useT();
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setQuestion(null); setError(null);
    if (!interviewById[questionId]) { setError({ messageKey: 'interview.doesNotExist' }); return undefined; }
    getInterviewQuestion(questionId).then((q) => { if (!cancelled) setQuestion(q); }).catch((e) => { if (!cancelled) setError({ message: e.message }); });
    return () => { cancelled = true; };
  }, [questionId]);

  if (error) {
    return <ContentLoadState error={error} kind="interview" backTo="/interview" backLabel={t('interview.interviewPrep')} />;
  }
  if (!question) return <ContentSkeleton lines={8} />;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link to="/interview" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> {t('interview.interviewPrep')}
      </Link>
      <InterviewAnswer question={question} bookmarkable />
      {question.relatedLessons?.length > 0 && (
        <Card className="mt-5 p-5">
          <SectionLabel className="mb-3">{t('interview.learnThisProperly')}</SectionLabel>
          <div className="space-y-2">
            {question.relatedLessons.map((id) => {
              const lesson = lessonById[id];
              if (!lesson) return null;
              const module = moduleById[lesson.moduleId];
              if (!module) return null;
              return (
                <Link key={id} to={`/learn/${module.slug}/${lesson.slug}`} className="block font-body-sm text-on-surface-variant transition hover:text-on-surface">
                  <Icon name="article" size={14} className="mr-1.5 inline" /><Authored>{lesson.title}</Authored>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
