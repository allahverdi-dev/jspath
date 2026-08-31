import { Link } from 'react-router-dom';
import { Button, Icon, Card, Badge, SectionLabel } from '../components/ui/index.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { contentStats } from '../content/registry.js';
import { HighlightedCode } from '../components/code/CodeBlock.jsx';

const FEATURES = [
  { icon: 'school', title: 'A real curriculum', body: 'Structured modules from your first line of code to prototypes, the event loop and performance — in a deliberate teaching order.' },
  { icon: 'fitness_center', title: 'Practice that checks itself', body: 'Exercises run against real assertions in a sandbox. Feedback tells you which case failed and why, not just “wrong”.' },
  { icon: 'psychology', title: 'Honest mastery', body: 'Clicking “complete” does not make you a master. Topic scores come from solved exercises and quiz accuracy, and decay if you leave them.' },
  { icon: 'record_voice_over', title: 'Interview preparation', body: 'A 30-second answer for the room and a deeper explanation for understanding, with key-point checklists you can score yourself against.' },
  { icon: 'terminal', title: 'Code that actually runs', body: 'Every runnable example executes in an isolated worker. Infinite loops are interrupted rather than freezing your tab.' },
  { icon: 'lock_open', title: 'Start free, no account needed', body: 'Core learning works as a guest and is saved in your browser. Create an account for sync, or choose Pro for advanced guided experiences.' },
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
  return (
    <div className="safe-page safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="safe-top sticky top-0 z-30 border-b border-outline-variant bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-container-max items-center px-4 lg:px-8">
          <Link to="/"><Logo /></Link>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-2 sm:flex">
            <Button to="/curriculum" variant="ghost" size="sm">Curriculum</Button>
            <Button to="/pricing" variant="ghost" size="sm">Pricing</Button>
            <Button to="/login" variant="secondary" size="sm">Log in</Button>
            <Button to="/dashboard" size="sm">Start learning</Button>
          </nav>
          <details className="relative ml-auto sm:hidden">
            <summary className="touch-target flex cursor-pointer list-none items-center gap-2 rounded border border-outline-variant px-3 py-2 font-body-sm">
              <Icon name="menu" size={20} /> Menu
            </summary>
            <nav aria-label="Mobile main" className="absolute right-0 top-full mt-2 grid w-56 max-w-[calc(100vw-2rem)] gap-2 rounded-lg border border-outline-variant bg-surface p-3 shadow-xl">
              <Button to="/curriculum" variant="ghost">Curriculum</Button>
              <Button to="/pricing" variant="ghost">Pricing</Button>
              <Button to="/login" variant="secondary">Log in</Button>
              <Button to="/dashboard">Start learning</Button>
            </nav>
          </details>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto w-full max-w-container-max px-4 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge tone="primary" className="mb-5">Start free · No account required</Badge>
              <h1 className="font-display text-display-lg text-on-surface">
                Learn JavaScript properly.
              </h1>
              <p className="mt-5 max-w-xl font-body-lg leading-8 text-on-surface-variant">
                A structured path from absolute beginner to professional JavaScript — with lessons
                that teach rather than define, exercises that check your work, and interview
                preparation that expects you to explain yourself.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/onboarding/level" size="lg" iconRight="arrow_forward">Start from zero</Button>
                <Button to="/curriculum" variant="secondary" size="lg" icon="school">Browse the curriculum</Button>
              </div>
              <p className="mt-6 font-body-sm text-on-surface-variant">
                {contentStats.modules} modules · {contentStats.lessons} lessons ·{' '}
                {contentStats.exercises} exercises · {Math.round(contentStats.totalMinutes / 60)} hours
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
            <SectionLabel>What makes it different</SectionLabel>
            <h2 className="mt-3 font-display text-headline-md text-on-surface">
              Built to teach, not to look like a course
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-6">
                  <Icon name={f.icon} size={24} className="text-primary-ink" />
                  <h3 className="mt-4 font-heading text-title-md text-on-surface">{f.title}</h3>
                  <p className="mt-2 font-body-sm leading-6 text-on-surface-variant">{f.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-container-max px-4 py-16 text-center lg:px-8 lg:py-24">
          <h2 className="font-display text-headline-md text-on-surface">Start where you are</h2>
          <p className="mx-auto mt-3 max-w-xl font-body-lg text-on-surface-variant">
            Never written code? Begin at Module 00. Already comfortable? Take the placement check and
            jump in. Core learning stays available without an account, with Pro for advanced guided practice.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/onboarding/level" size="lg" iconRight="arrow_forward">Get started</Button>
            <Button to="/playground" variant="secondary" size="lg" icon="terminal">Try the playground</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto flex w-full max-w-container-max flex-wrap items-center gap-4 px-4 py-8 lg:px-8">
          <Logo size="sm" />
          <p className="font-body-sm text-on-surface-variant">A JavaScript learning platform with a generous free path.</p>
          <nav className="ml-auto flex flex-wrap gap-4 font-body-sm text-on-surface-variant">
            <Link to="/curriculum" className="hover:text-on-surface">Curriculum</Link>
            <Link to="/cheat-sheets" className="hover:text-on-surface">Cheat sheets</Link>
            <Link to="/interview" className="hover:text-on-surface">Interview prep</Link>
            <Link to="/reference" className="hover:text-on-surface">Reference</Link>
            <Link to="/pricing" className="hover:text-on-surface">Pricing</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
