import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, Tabs, EmptyState, Input, Select, SectionLabel, ProgressBar } from '../components/ui/index.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { interviewQuestions, contentIndex } from '../content/registry.js';
import { weakTopics } from '../features/mastery/masteryEngine.js';
import { INTERVIEW_LEVELS, INTERVIEW_LEVEL_KEY, INTERVIEW_KIND_KEY } from '../content/schema/types.js';
import { useT } from '../i18n/index.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { FEATURE } from '../features/billing/plans.js';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { AdvancedAnalyticsGate } from '../components/billing/AdvancedAnalyticsGate.jsx';

const LEVELS = INTERVIEW_LEVELS;

export default function InterviewPrep() {
  const { state } = useUserState();
  const t = useT();
  const { hasFeature } = useEntitlements();
  const interviewUnlocked = hasFeature(FEATURE.INTERVIEW_PRO);
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');

  const topics = useMemo(() => [...new Set(interviewQuestions.map((q) => q.topic))].sort(), []);
  const kinds = useMemo(() => [...new Set(interviewQuestions.map((q) => q.kind))].sort(), []);
  const weak = useMemo(() => weakTopics(state, contentIndex.topics, contentIndex, { limit: 4 }), [state]);

  const filtered = useMemo(
    () => interviewQuestions.filter((q) => {
      const s = query.trim().toLowerCase();
      if (s && !`${q.question} ${q.topic} ${q.kind}`.toLowerCase().includes(s)) return false;
      if (level !== 'all' && q.level !== level) return false;
      if (topic !== 'all' && q.topic !== topic) return false;
      if (kind !== 'all' && q.kind !== kind) return false;
      return true;
    }),
    [level, topic, kind, query],
  );

  const seen = Object.keys(state.interview).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">{t('interview.title')}</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            {t('interview.subtitle', { seen, total: interviewQuestions.length })}
          </p>
        </div>
        <Button to="/interview/session" size="lg" icon={interviewUnlocked ? 'play_arrow' : 'lock'}>
          {interviewUnlocked ? t('interview.startPracticeSession') : t('interview.proPracticeSession')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-4 space-y-3">
            <Input
              icon="search"
              placeholder={t('interview.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('interview.searchLabel')}
            />
            <Tabs
              tabs={[
                { value: 'all', label: t('interview.allLevels') },
                ...LEVELS.map((l) => ({ value: l, label: t(INTERVIEW_LEVEL_KEY[l]) })),
              ]}
              value={level}
              onChange={setLevel}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label={t('common.topic')} value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">{t('interview.allTopics')}</option>
                {topics.map((name) => <option key={name} value={name} lang="en">{name}</option>)}
              </Select>
              <Select label={t('interview.questionType')} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="all">{t('practice.allTypes')}</option>
                {kinds.map((k) => <option key={k} value={k}>{INTERVIEW_KIND_KEY[k] ? t(INTERVIEW_KIND_KEY[k]) : k}</option>)}
              </Select>
            </div>
          </div>

          <p className="mb-3 font-body-sm text-on-surface-variant">{t('common.questionCount', { count: filtered.length })}</p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={interviewQuestions.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
              title={interviewQuestions.length === 0 ? t('interview.noQuestions') : t('interview.noQuestionsMatch')}
              message={interviewQuestions.length === 0 ? t('interview.noQuestionsBody') : t('practice.tryWidening')}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((q) => {
                const record = state.interview[q.id];
                return (
                  <Card key={q.id} as={Link} to={`/interview/question/${q.id}`} interactive className="flex items-start gap-3 p-4">
                    <Icon
                      name={record ? 'check_circle' : 'radio_button_unchecked'}
                      size={18}
                      filled={Boolean(record)}
                      className={`mt-0.5 shrink-0 ${record ? 'text-success' : 'text-on-surface-variant'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-body-md font-medium text-on-surface"><InlineMarkup text={q.question} /></span>
                      <span className="mt-1 block font-body-sm text-on-surface-variant">{INTERVIEW_KIND_KEY[q.kind] ? t(INTERVIEW_KIND_KEY[q.kind]) : q.kind}</span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        <Badge tone="neutral"><Authored>{q.topic}</Authored></Badge>
                        <Badge tone="info">{INTERVIEW_LEVEL_KEY[q.level] ? t(INTERVIEW_LEVEL_KEY[q.level]) : q.level}</Badge>
                        <ContentAccessBadge kind="interview" id={q.id} />
                      </span>
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <SectionLabel className="mb-3">{t('interview.howToUse')}</SectionLabel>
            <ul className="space-y-2 font-body-sm text-on-surface-variant">
              <li>{t('interview.howToUseOne')}</li>
              <li>{t('interview.howToUseTwo')}</li>
              <li>{t('interview.howToUseThree')}</li>
            </ul>
            <p className="mt-3 font-body-sm text-on-surface-variant">
              {t('interview.noAiGrader')}
            </p>
          </Card>

          {weak.length > 0 && (
            <AdvancedAnalyticsGate>
              <Card className="p-5">
                <SectionLabel className="mb-3">{t('interview.shoreUp')}</SectionLabel>
                <div className="space-y-3">
                  {weak.map((entry) => (
                    <div key={entry.topicId}>
                      <div className="mb-1 flex items-center justify-between font-body-sm">
                        <span className="truncate text-on-surface-variant"><Authored>{entry.label}</Authored></span>
                        <span className="ml-2 font-mono text-on-surface">{Math.round(entry.score * 100)}%</span>
                      </div>
                      <ProgressBar value={entry.score} />
                    </div>
                  ))}
                </div>
              </Card>
            </AdvancedAnalyticsGate>
          )}
        </div>
      </div>
    </div>
  );
}
