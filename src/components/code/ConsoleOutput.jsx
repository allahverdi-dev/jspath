import { Icon, cx } from '../ui/index.jsx';

const LEVEL_STYLES = {
  log: 'text-on-surface',
  info: 'text-info',
  debug: 'text-on-surface-variant',
  warn: 'text-warning',
  error: 'text-error',
};

const LEVEL_ICONS = {
  warn: 'warning',
  error: 'error',
  info: 'info',
};

/**
 * Renders the result of a sandbox run: captured console output, then any runtime
 * error. Errors carry the line number the sandbox recovered from the stack, which
 * is mapped back to the learner's own line numbering.
 */
export function ConsoleOutput({ result, emptyMessage = 'No output. Use console.log() to print a value.', className = '' }) {
  const logs = result?.logs ?? [];
  const error = result?.error;

  return (
    <div className={cx('bg-surface-container-lowest', className)}>
      <div className="flex items-center gap-2 border-b border-outline-variant px-4 py-1.5">
        <Icon name="terminal" size={13} className="text-on-surface-variant" />
        <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">Console</span>
        {result?.timedOut && (
          <span className="ml-auto font-mono text-code-sm text-warning">timed out</span>
        )}
      </div>

      <div className="thin-scrollbar max-h-72 overflow-y-auto px-4 py-2.5 font-mono text-code-md">
        {logs.length === 0 && !error && (
          <p className="text-on-surface-variant/70">{emptyMessage}</p>
        )}

        {logs.map((line, i) => (
          <div key={i} className={cx('flex items-start gap-2 py-0.5', LEVEL_STYLES[line.level] ?? LEVEL_STYLES.log)}>
            {LEVEL_ICONS[line.level] && <Icon name={LEVEL_ICONS[line.level]} size={13} className="mt-1 shrink-0" />}
            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words">{line.text}</pre>
          </div>
        ))}

        {error && (
          <div className="mt-2 rounded border border-error/30 bg-error/5 px-3 py-2">
            <p className="flex items-center gap-1.5 font-bold text-error">
              <Icon name="error" size={14} filled />
              {error.name}
              {error.line != null && (
                <span className="font-normal text-on-surface-variant">· line {error.line}</span>
              )}
            </p>
            <pre className="mt-1 whitespace-pre-wrap break-words text-on-surface-variant">{error.message}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
