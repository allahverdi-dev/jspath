import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dialog, Toggle } from '../components/ui/index.jsx';
import { SearchOverlay } from '../features/search/SearchOverlay.jsx';
import { CodeEditor } from '../components/code/CodeEditor.jsx';

vi.mock('../state/UserStateProvider.jsx', () => ({ useUserState: () => ({ state: { settings: { editorFontSize: 12 } } }) }));
vi.mock('../state/ThemeProvider.jsx', () => ({ useTheme: () => ({ isDark: true }) }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

function SearchExample() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Open search</button><SearchOverlay open={open} onClose={() => setOpen(false)} /></>;
}

describe('Mobile overlays', () => {
  it('closes search with a visible button and restores scroll and trigger focus', () => {
    vi.useFakeTimers();
    render(<MemoryRouter><SearchExample /></MemoryRouter>);
    const trigger = screen.getByRole('button', { name: 'Open search' });
    trigger.focus();
    fireEvent.click(trigger);
    act(() => vi.advanceTimersByTime(30));
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(trigger).toHaveFocus();
  });

  it('traps Tab in the dialog and closes with Escape without refocusing on rerender', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 44, height: 44 }]);
    const close = vi.fn();
    const view = render(<Dialog open onClose={close} title="Example"><input aria-label="Name" data-autofocus /><button>Last action</button></Dialog>);
    act(() => vi.advanceTimersByTime(30));
    expect(screen.getByRole('textbox')).toHaveFocus();
    const last = screen.getByRole('button', { name: 'Last action' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    view.rerender(<Dialog open onClose={() => close()} title="Example"><input aria-label="Name" data-autofocus /><button>Last action</button></Dialog>);
    act(() => vi.advanceTimersByTime(30));
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });
});

describe('Phone editing and touch controls', () => {
  function mobileViewport() {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  }

  it('provides native editing immediately, readable text and touch indentation', () => {
    mobileViewport();
    const change = vi.fn();
    const run = vi.fn();
    render(<CodeEditor value="hello" onChange={change} onRun={run} />);
    const editor = screen.getByRole('textbox', { name: 'Code editor' });
    expect(editor).toHaveStyle({ fontSize: '16px' });
    expect(editor).toHaveAttribute('autocapitalize', 'off');
    expect(editor).toHaveAttribute('autocorrect', 'off');
    editor.setSelectionRange(5, 5);
    fireEvent.click(screen.getByRole('button', { name: 'Insert two spaces' }));
    expect(change).toHaveBeenCalledWith('hello  ');
    fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });
    expect(run).toHaveBeenCalledOnce();
  });

  it('does not modify a read-only phone editor through Tab', () => {
    mobileViewport();
    const change = vi.fn();
    render(<CodeEditor value="hello" onChange={change} readOnly />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Tab' });
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Insert two spaces' })).not.toBeInTheDocument();
  });

  it('keeps the enlarged switch labelled and operable', () => {
    const change = vi.fn();
    render(<Toggle label="Sound" checked={false} onChange={change} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Sound' }));
    expect(change).toHaveBeenCalledWith(true);
  });
});
