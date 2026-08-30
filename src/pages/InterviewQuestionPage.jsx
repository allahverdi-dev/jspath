import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInterviewQuestion, interviewById, lessonById, moduleById } from '../content/registry.js';
import { Card, Button, Icon, EmptyState, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { InterviewAnswer } from '../features/interview/InterviewAnswer.jsx';

export default function InterviewQuestionPage() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setQuestion(null); setError(null);
    if (!interviewById[questionId]) { setError(new Error('That question does not exist.')); return undefined; }
    getInterviewQuestion(questionId).then((q) => { if (!cancelled) setQuestion(q); }).catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [questionId]);

  if (error) {
    return <EmptyState icon="search_off" title="Question not found" message={error.message} action={<Button to="/interview" icon="record_voice_over">Interview prep</Button>} />;
  }
  if (!question) return <ContentSkeleton lines={8} />;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link to="/interview" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> Interview prep
      </Link>
      <InterviewAnswer question={question} bookmarkable />
      {question.relatedLessons?.length > 0 && (
        <Card className="mt-5 p-5">
          <SectionLabel className="mb-3">Learn this properly</SectionLabel>
          <div className="space-y-2">
            {question.relatedLessons.map((id) => {
              const lesson = lessonById[id];
              if (!lesson) return null;
              const module = moduleById[lesson.moduleId];
              if (!module) return null;
              return (
                <Link key={id} to={`/learn/${module.slug}/${lesson.slug}`} className="block font-body-sm text-on-surface-variant transition hover:text-on-surface">
                  <Icon name="article" size={14} className="mr-1.5 inline" />{lesson.title}
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
