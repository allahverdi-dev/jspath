import { useCallback, useEffect, useState } from 'react';
import { CodeEditor } from '../components/code/CodeEditor.jsx';
import { ConsoleOutput } from '../components/code/ConsoleOutput.jsx';
import { Button, Icon, Card, SectionLabel, Input } from '../components/ui/index.jsx';
import { runCode } from '../services/sandbox/index.js';
import { STORAGE_KEYS, readJson, writeJson } from '../services/storage.js';
import { useToast } from '../state/ToastProvider.jsx';
import { useT } from '../i18n/index.jsx';

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
  const t = useT();
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
    const label = name.trim() || t('playground.defaultSnippetName', { number: snippets.length + 1 });
    const next = [{ id: Date.now(), name: label, code, at: new Date().toISOString() }, ...snippets].slice(0, 50);
    setSnippets(next);
    writeJson(STORAGE_KEYS.snippets, next);
    setName('');
    toast.show({ tone: 'success', titleKey: 'playground.snippetSaved', message: label });
  };

  const remove = (id) => {
    const next = snippets.filter((s) => s.id !== id);
    setSnippets(next);
    writeJson(STORAGE_KEYS.snippets, next);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.show({ tone: 'success', titleKey: 'playground.copiedToClipboard' });
    } catch {
      toast.show({ tone: 'error', titleKey: 'playground.couldNotCopy', messageKey: 'playground.clipboardBlocked' });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">{t('playground.title')}</h1>
          <p className="mt-2 font-body-lg text-on-surface-variant">
            {t('playground.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={run} loading={running} icon="play_arrow">{running ? t('learning.running') : t('common.run')}</Button>
          <Button size="sm" variant="secondary" onClick={copy} icon="content_copy">{t('common.copy')}</Button>
          <Button size="sm" variant="ghost" onClick={() => { setCode(STARTER); setResult(null); }} icon="restart_alt">{t('common.reset')}</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <CodeEditor value={code} onChange={setCode} onRun={run} height={440} ariaLabel={t('playground.editorLabel')} />
          <div className="overflow-hidden rounded border border-outline-variant">
            <ConsoleOutput result={result} emptyMessage={t('playground.consoleEmpty')} />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionLabel className="mb-3">{t('playground.saveSnippet')}</SectionLabel>
            <Input
              placeholder={t('playground.snippetName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label={t('playground.snippetName')}
            />
            <Button onClick={save} variant="secondary" size="sm" className="mt-3 w-full" icon="bookmark_add">{t('common.save')}</Button>
          </Card>

          <Card className="p-4">
            <SectionLabel className="mb-3">{t('playground.savedSnippets')}</SectionLabel>
            {snippets.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant">{t('playground.nothingSaved')}</p>
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
                      aria-label={t('playground.deleteSnippet', { name: s.name })}
                    >
                      <Icon name="delete" size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <SectionLabel className="mb-2">{t('playground.notes')}</SectionLabel>
            <ul className="space-y-1.5 font-body-sm text-on-surface-variant">
              <li>{t('playground.noteConsole')}</li>
              <li>{t('playground.noteNoDom')}</li>
              <li>{t('playground.noteTimeout')}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
