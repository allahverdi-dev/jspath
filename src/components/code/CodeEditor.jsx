import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { cx, Spinner } from '../ui/index.jsx';
import { useUserState } from '../../state/UserStateProvider.jsx';
import { useTheme } from '../../state/ThemeProvider.jsx';
import { useT } from '../../i18n/index.jsx';

const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.default })),
);
const NATIVE_EDITOR_QUERY = '(max-width: 639px), (pointer: coarse)';

/**
 * The editing surface for exercises, challenges and the playground.
 *
 * Monaco is loaded lazily and only when an editor is actually shown, so no page
 * that merely *displays* code pays for it. If Monaco fails to load — offline, a
 * blocked CDN, a restrictive network — the component falls back to a plain
 * textarea that still supports Tab indentation and Ctrl+Enter to run. Editing
 * never becomes impossible.
 */
export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  height = 320,
  readOnly = false,
  onRun,
  className = '',
  ariaLabel,
}) {
  const { state } = useUserState();
  const { isDark } = useTheme();
  const t = useT();
  const label = ariaLabel ?? t('learning.codeEditorName');
  const [monacoFailed, setMonacoFailed] = useState(false);
  // Native text editing supports phone keyboards, selection and touch scrolling.
  const [mobile, setMobile] = useState(() => window.matchMedia?.(NATIVE_EDITOR_QUERY).matches ?? false);
  const fontSize = state.settings.editorFontSize ?? 14;

  useEffect(() => {
    const query = window.matchMedia?.(NATIVE_EDITOR_QUERY);
    if (!query) return undefined;
    const update = () => setMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Monaco needs its own font-loading grace; a failed load must not hang the page.
  useEffect(() => {
    if (monacoFailed || mobile) return undefined;
    const timer = setTimeout(() => {
      if (!document.querySelector('.monaco-editor')) setMonacoFailed(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [monacoFailed, mobile]);

  if (monacoFailed || mobile) {
    return (
      <PlainEditor
        value={value}
        onChange={onChange}
        height={height}
        readOnly={readOnly}
        onRun={onRun}
        fontSize={mobile ? Math.max(16, fontSize) : fontSize}
        className={className}
        ariaLabel={label}
      />
    );
  }

  return (
    <div className={cx('overflow-hidden rounded border border-outline-variant', className)} style={{ height }}>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center bg-surface-container-lowest">
            <Spinner className="text-on-surface-variant" />
          </div>
        }
      >
        <ErrorCatcher onError={() => setMonacoFailed(true)}>
          <MonacoEditor
            height="100%"
            language={language}
            theme={isDark ? 'vs-dark' : 'light'}
            value={value}
            onChange={(next) => onChange?.(next ?? '')}
            loading={
              <div className="flex h-full items-center justify-center bg-surface-container-lowest">
                <Spinner className="text-on-surface-variant" />
              </div>
            }
            onMount={(editor, monaco) => {
              editor.updateOptions({ ariaLabel: label });
              if (onRun) {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRun());
              }
            }}
            options={{
              readOnly,
              fontSize,
              fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              fontLigatures: false,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              tabSize: 2,
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              overviewRulerLanes: 0,
              wordWrap: 'on',
              bracketPairColorization: { enabled: true },
              smoothScrolling: true,
            }}
          />
        </ErrorCatcher>
      </Suspense>
    </div>
  );
}

/** Textarea fallback with the editing affordances people actually miss. */
function PlainEditor({ value, onChange, height, readOnly, onRun, fontSize, className, ariaLabel }) {
  const t = useT();
  const ref = useRef(null);

  const indent = () => {
    if (readOnly) return;
    const el = ref.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    onChange?.(`${value.slice(0, start)}  ${value.slice(end)}`);
    el.focus();
    requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 2; });
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }
    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      indent();
    }
  };

  return (
    <div className={cx('min-w-0 max-w-full overflow-hidden rounded border border-outline-variant', className)}>
      {!readOnly && <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant bg-surface-container-low px-2 py-1">
        <button type="button" onClick={indent} className="rounded px-3 py-1 font-mono text-code-sm hover:bg-surface-container-high" aria-label={t('learning.insertTwoSpaces')}>{t('learning.indent')}</button>
        <span className="font-mono text-code-sm text-on-surface-variant">{t('learning.codeEditor')}</span>
      </div>}
      <textarea
        ref={ref}
        value={value}
        readOnly={readOnly}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck="false"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        className="thin-scrollbar block w-full resize-none bg-surface-container-lowest px-4 py-3 font-mono leading-[1.6] text-on-surface outline-none"
        style={{ height, fontSize }}
      />
    </div>
  );
}

/** Tiny boundary so a Monaco chunk failure swaps in the fallback editor. */
class ErrorCatcher extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
