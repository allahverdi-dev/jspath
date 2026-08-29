import { useCallback, useEffect, useState } from 'react';
import { CodeEditor } from '../components/code/CodeEditor.jsx';
import { ConsoleOutput } from '../components/code/ConsoleOutput.jsx';
import { Button, Icon, Card, SectionLabel, Input } from '../components/ui/index.jsx';
import { runCode } from '../services/sandbox/index.js';
import { STORAGE_KEYS, readJson, writeJson } from '../services/storage.js';
import { useToast } from '../state/ToastProvider.jsx';

const STARTER = [
  '// Welcome to the JSPath playground.',
  '// Everything here runs in a sandboxed worker, isolated from the page.',
  '',
  'const languages = [',
  "  { name: 'JavaScript', year: 1995 },",
  "  { name: 'Python', year: 1991 },",
  "  { name: 'Rust', year: 2010 },",
  '];',
  '',
  'const names = languages',
  '  .filter((l) => l.year < 2000)',
  '  .map((l) => l.name);',
  '',
  'console.log(names);',
  "console.log('Total:', languages.length);",
].join('\n');

export default function Playground() {
  const toast = useToast();
  const [code, setCode] = useState(() => readJson(STORAGE_KEYS.playground, STARTER));
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [snippets, setSnippets] = useState(() => readJson(STORAGE_KEYS.snippets, []));
  const [name, setName] = useState('');

  /* Draft is persisted so a refresh never loses work. */
  useEffect(() => {
    const timer = setTimeout(() => writeJson(STORAGE_KEYS.playground, code), 600);
    return () => clearTimeout(timer);
  }, [code]);

  const run = useCallback(async () => {
    setRunning(true);
    const res = await runCode(code, { timeout: 6000 });
    setResult(res);
    setRunning(false);
  }, [code]);

  const save = () => {
    const label = name.trim() || `Snippet ${snippets.length + 1}`;
    const next = [{ id: Date.now(), name: label, code, at: new Date().toISOString() }, ...snippets].slice(0, 50);
    setSnippets(next);
    writeJson(STORAGE_KEYS.snippets, next);
    setName('');
    toast.show({ tone: 'success', title: 'Snippet saved', message: label });
  };

  const remove = (id) => {
    const next = snippets.filter((s) => s.id !== id);
    setSnippets(next);
    writeJson(STORAGE_KEYS.snippets, next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.show({ tone: 'success', title: 'Copied to clipboard' });
    } catch {
      toast.show({ tone: 'error', title: 'Could not copy', message: 'Your browser blocked clipboard access.' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">Playground</h1>
          <p className="mt-2 font-body-lg text-on-surface-variant">
            A scratchpad for trying things out. Runs in an isolated worker — infinite loops are
            interrupted rather than freezing the page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={run} loading={running} icon="play_arrow">{running ? 'Running' : 'Run'}</Button>
          <Button variant="secondary" onClick={copy} icon="content_copy">Copy</Button>
          <Button variant="ghost" onClick={() => { setCode(STARTER); setResult(null); }} icon="restart_alt">Reset</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <CodeEditor value={code} onChange={setCode} onRun={run} height={440} ariaLabel="Playground code editor" />
          <div className="overflow-hidden rounded border border-outline-variant">
            <ConsoleOutput result={result} emptyMessage="Press Run (or Ctrl/⌘ + Enter) to execute your code." />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionLabel className="mb-3">Save this snippet</SectionLabel>
            <Input placeholder="Snippet name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Snippet name" />
            <Button onClick={save} variant="secondary" size="sm" className="mt-3 w-full" icon="bookmark_add">Save</Button>
          </Card>

          <Card className="p-4">
            <SectionLabel className="mb-3">Saved snippets</SectionLabel>
            {snippets.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant">Nothing saved yet. Snippets are stored in this browser.</p>
            ) : (
              <ul className="space-y-1">
                {snippets.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setCode(s.code); setResult(null); }}
                      className="min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left font-body-sm text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
                    >
                      {s.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
                      className="rounded p-1 text-on-surface-variant transition hover:text-error"
                      aria-label={`Delete ${s.name}`}
                    >
                      <Icon name="delete" size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <SectionLabel className="mb-2">Notes</SectionLabel>
            <ul className="space-y-1.5 font-body-sm text-on-surface-variant">
              <li>• <code className="font-mono">console.log</code> output appears below the editor.</li>
              <li>• There is no DOM here — the worker has no <code className="font-mono">document</code>.</li>
              <li>• Execution stops after 6 seconds or ~5M loop iterations.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
