import { useMemo, useState, useCallback } from 'react';
import { tokenize, TOKEN_CLASS } from './highlight.js';
import { Icon, cx } from '../ui/index.jsx';
import { ConsoleOutput } from './ConsoleOutput.jsx';
import { runCode } from '../../services/sandbox/index.js';
import { useT } from '../../i18n/index.jsx';

/** Split highlighted tokens into per-line arrays so gutters stay aligned. */
function useHighlightedLines(code, language) {
  return useMemo(() => {
    const tokens = tokenize(code, language);
    const lines = [[]];
    for (const token of tokens) {
      const pieces = token.value.split('\n');
      pieces.forEach((piece, i) => {
        if (i > 0) lines.push([]);
        if (piece) lines[lines.length - 1].push({ type: token.type, value: piece });
      });
    }
    return lines;
  }, [code, language]);
}

export function HighlightedCode({ code, language = 'javascript', showLineNumbers = false, highlightLines = [], className = '' }) {
  const lines = useHighlightedLines(code, language);
  const gutterWidth = String(lines.length).length;
  const t = useT();

  return (
    <pre lang="en" tabIndex={0} aria-label={t('learning.codeSample')} className={cx('thin-scrollbar min-w-0 max-w-full overflow-x-auto font-mono text-code-md leading-[1.6]', className)}>
      <code className="block">
        {lines.map((tokens, i) => (
          <span
            key={i}
            className={cx('block', highlightLines.includes(i + 1) && 'bg-primary/10 -mx-4 px-4')}
          >
            {showLineNumbers && (
              <span
                className="mr-4 inline-block select-none text-right text-on-surface-variant/50"
                style={{ width: `${gutterWidth}ch` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
            )}
            {tokens.length === 0 ? (
              <span> </span>
            ) : (
              tokens.map((t, j) => (
                <span key={j} className={TOKEN_CLASS[t.type] ?? ''}>
                  {t.value}
                </span>
              ))
            )}
          </span>
        ))}
      </code>
    </pre>
  );
}

/**
 * A code sample in a lesson.
 *
 * When `runnable` is set the snippet becomes editable and executes in the sandbox,
 * so "runnable" in the content is a real promise rather than decoration. `output`
 * is shown as the expected result until the learner runs it themselves.
 */
export function CodeBlock({
  code,
  language = 'javascript',
  caption,
  output,
  runnable = false,
  needsDom = false,
  html = '',
  showLineNumbers = true,
  highlightLines,
  className = '',
}) {
  const t = useT();
  const [source, setSource] = useState(code);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const dirty = source !== code;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [source]);

  const run = useCallback(async () => {
    setRunning(true);
    const res = await runCode(source, { timeout: 4000, needsDom, html });
    setResult(res);
    setRunning(false);
  }, [source, needsDom, html]);

  const reset = useCallback(() => {
    setSource(code);
    setResult(null);
    setEditing(false);
  }, [code]);

  return (
    <figure className={cx('min-w-0 max-w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant bg-surface-container-low px-3 py-2">
        <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          {language === 'html' ? 'HTML' : language === 'text' ? 'OUTPUT' : 'JAVASCRIPT'}
        </span>
        {dirty && (
          <span className="font-mono text-code-sm text-primary-ink">{t('learning.edited')}</span>
        )}

        <div className="ml-auto flex max-w-full flex-wrap items-center gap-1">
          {runnable && (
            <>
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="flex items-center gap-1 rounded px-2 py-1 font-mono text-code-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                aria-pressed={editing}
              >
                <Icon name={editing ? 'visibility' : 'edit'} size={14} />
                {editing ? t('learning.view') : t('learning.edit')}
              </button>
              {(dirty || result) && (
                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-1 rounded px-2 py-1 font-mono text-code-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                >
                  <Icon name="restart_alt" size={14} />
                  {t('common.reset')}
                </button>
              )}
              <button
                type="button"
                onClick={run}
                disabled={running}
                className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 font-mono text-code-sm font-bold text-on-primary transition hover:bg-primary-fixed disabled:opacity-60"
              >
                <Icon name="play_arrow" size={14} filled />
                {running ? t('learning.running') : t('common.run')}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1 rounded px-2 py-1 font-mono text-code-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name={copied ? 'check' : 'content_copy'} size={14} />
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={t('learning.editableCodeSample')}
          className="thin-scrollbar block w-full resize-y bg-surface-container-lowest px-4 py-3 font-mono text-code-md leading-[1.6] text-on-surface outline-none"
          rows={Math.min(24, source.split('\n').length + 1)}
        />
      ) : (
        <div className="px-4 py-3">
          <HighlightedCode
            code={source}
            language={language}
            showLineNumbers={showLineNumbers}
            highlightLines={highlightLines}
          />
        </div>
      )}

      {/* Expected output, shown until the learner produces their own. */}
      {output && !result && (
        <div className="border-t border-outline-variant bg-surface-container-low px-4 py-2.5">
          <p className="mb-1 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
            {t('learning.expectedOutput')}
          </p>
          <pre className="thin-scrollbar overflow-x-auto font-mono text-code-md text-on-surface-variant">{output}</pre>
        </div>
      )}

      {result && (
        <div className="border-t border-outline-variant">
          <ConsoleOutput result={result} />
        </div>
      )}

      {caption && (
        <figcaption className="border-t border-outline-variant px-4 py-2 font-body-sm text-on-surface-variant">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
