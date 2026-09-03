import { Link } from 'react-router-dom';
import { Button, Icon, Card, Badge, SectionLabel, Skeleton } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { contentStats } from '../content/registry.js';
import { HighlightedCode } from '../components/code/CodeBlock.jsx';
import { useT } from '../i18n/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';

/* Feature ids are stable; the copy comes from the dictionaries. */
const FEATURES = [
  { id: 'curriculum', icon: 'school' },
  { id: 'practice', icon: 'fitness_center' },
  { id: 'mastery', icon: 'psychology' },
  { id: 'interview', icon: 'record_voice_over' },
  { id: 'runs', icon: 'terminal' },
  { id: 'free', icon: 'lock_open' },
];

const SAMPLE = [
  'const orders = [',
  "  { id: 1, total: 42, status: 'paid' },",
  "  { id: 2, total: 17, status: 'pending' },",
  "  { id: 3, total: 99, status: 'paid' },",
  '];',
  '',
  'const revenue = orders',
  "  .filter((o) => o.status === 'paid')",
  '  .reduce((sum, o) => sum + o.total, 0);',
  '',
  'console.log(revenue); // 141',
].join('\n');

export default function Landing() {
  const t = useT();
  const { isAuthenticated, loading: authLoading } = useAuth();

  /*
   * The landing page is the one screen a signed-in learner can reach that has no
   * app shell, so it was the only place still asking them to "Log in" after they
   * already had. `loading` is true only while the stored session is being
   * restored; rendering a placeholder of the same size for that moment avoids
   * showing a guest CTA and then swapping it, which is what makes a valid session
   * look broken. Nothing else on the page waits for auth.
   */
  const authNav = (size) => {
    if (authLoading) return <Skeleton className={size === 'sm' ? 'h-8 w-44' : 'h-10 w-full'} />;
    if (isAuthenticated) {
      return (
        <>
          <Button to="/dashboard" size={size} iconRight="arrow_forward">{t('nav.dashboard')}</Button>
          <Button to="/profile" variant="ghost" size={size} icon="person">{t('nav.profile')}</Button>
        </>
      );
    }
    return (
      <>
        <Button to="/login" variant="secondary" size={size}>{t('auth.logIn')}</Button>
        <Button to="/dashboard" size={size}>{t('dashboard.startLearning')}</Button>
      </>
    );
  };

  /* Signed-in learners are resuming, not starting. */
  const primaryCta = (labelKey) => {
    if (authLoading) return <Skeleton className="h-11 w-52" />;
    return isAuthenticated
      ? <Button to="/dashboard" size="lg" iconRight="arrow_forward">{t('dashboard.continueLearning')}</Button>
      : <Button to="/onboarding/level" size="lg" iconRight="arrow_forward">{t(labelKey)}</Button>;
  };

  return (
    <div className="safe-page safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>

      <header className="safe-top sticky top-0 z-30 border-b border-outline-variant bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-container-max items-center px-4 lg:px-8">
          <Link to="/"><Logo /></Link>
          <nav aria-label={t('nav.main')} className="ml-auto hidden items-center gap-2 sm:flex">
            <Button to="/curriculum" variant="ghost" size="sm">{t('learning.curriculum')}</Button>
            <Button to="/pricing" variant="ghost" size="sm">{t('nav.pricing')}</Button>
            {authNav('sm')}
          </nav>
          <details className="relative ml-auto sm:hidden">
            <summary className="touch-target flex cursor-pointer list-none items-center gap-2 rounded border border-outline-variant px-3 py-2 font-body-sm">
              <Icon name="menu" size={20} /> {t('nav.menu')}
            </summary>
            <nav aria-label={t('nav.mobileMain')} className="absolute right-0 top-full mt-2 grid w-56 max-w-[calc(100vw-2rem)] gap-2 rounded-lg border border-outline-variant bg-surface p-3 shadow-xl">
              <Button to="/curriculum" variant="ghost">{t('learning.curriculum')}</Button>
              <Button to="/pricing" variant="ghost">{t('nav.pricing')}</Button>
              {authNav('md')}
            </nav>
          </details>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto w-full max-w-container-max px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge tone="primary" className="mb-5">{t('landing.startFreeBadge')}</Badge>
              <h1 className="font-display text-display-lg text-on-surface">
                {t('landing.headline')}
              </h1>
              <p className="mt-5 max-w-xl font-body-lg leading-8 text-on-surface-variant">
                {t('landing.subheadline')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryCta('landing.startFromZero')}
                <Button to="/curriculum" variant="secondary" size="lg" icon="school">{t('learning.browseCurriculum')}</Button>
              </div>
              <p className="mt-6 font-body-sm text-on-surface-variant">
                {[
                  t('common.moduleCount', { count: contentStats.modules }),
                  t('common.lessonCount', { count: contentStats.lessons }),
                  t('common.exerciseCount', { count: contentStats.exercises }),
                  t('common.hourCount', { count: Math.round(contentStats.totalMinutes / 60) }),
                ].join(' · ')}
              </p>
            </div>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-2 font-mono text-code-sm text-on-surface-variant">revenue.js</span>
              </div>
              <div className="bg-surface-container-lowest px-4 py-4">
                <HighlightedCode code={SAMPLE} showLineNumbers />
              </div>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-outline-variant bg-surface-container-lowest">
          <div className="mx-auto w-full max-w-container-max px-4 py-16 lg:px-8 lg:py-20">
            <SectionLabel>{t('landing.differentLabel')}</SectionLabel>
            <h2 className="mt-3 font-display text-headline-md text-on-surface">
              {t('landing.differentHeading')}
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.id} className="p-6">
                  <Icon name={f.icon} size={24} className="text-primary-ink" />
                  <h3 className="mt-4 font-heading text-title-md text-on-surface">{t('landing.feature.' + f.id + '.title')}</h3>
                  <p className="mt-2 font-body-sm leading-6 text-on-surface-variant">{t('landing.feature.' + f.id + '.body')}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-container-max px-4 py-16 text-center lg:px-8 lg:py-24">
          <h2 className="font-display text-headline-md text-on-surface">{t('landing.ctaHeading')}</h2>
          <p className="mx-auto mt-3 max-w-xl font-body-lg text-on-surface-variant">
            {t('landing.ctaBody')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primaryCta('landing.getStarted')}
            <Button to="/playground" variant="secondary" size="lg" icon="terminal">{t('landing.tryPlayground')}</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto flex w-full max-w-container-max flex-wrap items-center gap-4 px-4 py-8 lg:px-8">
          <Logo size="sm" />
          <p className="font-body-sm text-on-surface-variant">{t('landing.footerTagline')}</p>
          <nav className="ml-auto flex flex-wrap gap-4 font-body-sm text-on-surface-variant">
            <Link to="/curriculum" className="hover:text-on-surface">{t('learning.curriculum')}</Link>
            <Link to="/cheat-sheets" className="hover:text-on-surface">{t('cheatSheets.short')}</Link>
            <Link to="/interview" className="hover:text-on-surface">{t('interview.interviewPrep')}</Link>
            <Link to="/reference" className="hover:text-on-surface">{t('reference.short')}</Link>
            <Link to="/pricing" className="hover:text-on-surface">{t('nav.pricing')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
