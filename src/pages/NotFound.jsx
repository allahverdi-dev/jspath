import { Button } from '../components/ui/index.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-code-md text-on-surface-variant">404</p>
      <h1 className="mt-3 font-display text-display-lg text-on-surface">Page not found</h1>
      <p className="mt-3 max-w-md font-body-lg text-on-surface-variant">
        That route does not exist. It may have been renamed, or the link may be wrong.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/dashboard" icon="dashboard">Go to dashboard</Button>
        <Button to="/curriculum" variant="secondary" icon="school">Browse curriculum</Button>
      </div>
    </div>
  );
}
