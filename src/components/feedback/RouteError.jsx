import { Link } from 'react-router-dom';
import { Button, Icon } from '../ui/index.jsx';

export function RouteError({ error, reset }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-error/30 bg-error/10">
        <Icon name="report" size={28} className="text-error" />
      </div>
      <h1 className="font-heading text-headline-sm text-on-surface">This page ran into a problem</h1>
      <p className="mt-2 font-body-sm text-on-surface-variant">
        The rest of JSPath is unaffected — your progress is safe. You can retry, or head back and
        carry on somewhere else.
      </p>
      {error?.message && (
        <pre className="mt-5 max-w-full overflow-x-auto rounded border border-outline-variant bg-surface-container px-3 py-2 text-left font-mono text-code-sm text-on-surface-variant">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} icon="refresh">Try again</Button>
        <Button as={Link} to="/dashboard" variant="secondary" icon="dashboard">
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
