import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CodeEditor } from '../components/code/CodeEditor.jsx';
import { ThemeProvider } from '../state/ThemeProvider.jsx';
import { ToastProvider } from '../state/ToastProvider.jsx';
import { AuthProvider } from '../state/AuthProvider.jsx';
import { UserStateProvider } from '../state/UserStateProvider.jsx';
import { readJson, writeJson, writeRaw, STORAGE_KEYS, clearAll } from '../services/storage.js';
import { moduleById } from '../content/registry.js';

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <UserStateProvider>
            {ui}
          </UserStateProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
}

describe('CodeEditor component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('triggers fallback to PlainEditor after timeout if Monaco DOM is absent', () => {
    renderWithProviders(
      <CodeEditor value="console.log('test');" onChange={() => {}} ariaLabel="Test editor" />,
    );

    // Fast-forward past the 8000ms grace period
    act(() => {
      vi.advanceTimersByTime(8500);
    });

    // PlainEditor fallback renders a textarea with the given aria-label
    const textarea = screen.getByRole('textbox', { name: 'Test editor' });
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe("console.log('test');");
  });

  it('allows indenting with tab in PlainEditor fallback', () => {
    const handleChange = vi.fn();

    renderWithProviders(
      <CodeEditor value="hello" onChange={handleChange} ariaLabel="Test editor" />,
    );

    act(() => {
      vi.advanceTimersByTime(8500);
    });

    const textarea = screen.getByRole('textbox', { name: 'Test editor' });
    expect(textarea).toBeInTheDocument();

    // Set selection range and fire Tab keydown
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;
    fireEvent.keyDown(textarea, { key: 'Tab' });

    expect(handleChange).toHaveBeenCalledWith('hello  ');
  });
});

describe('Storage service resiliency', () => {
  beforeEach(() => {
    clearAll();
  });

  it('handles writeJson and readJson seamlessly', () => {
    const data = { completedLessons: ['l01', 'l02'], streak: 5 };
    writeJson(STORAGE_KEYS.userState, data);

    const retrieved = readJson(STORAGE_KEYS.userState);
    expect(retrieved).toEqual(data);
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    writeRaw(STORAGE_KEYS.userState, '{corrupted-json-data');
    const fallback = { fallback: true };
    const retrieved = readJson(STORAGE_KEYS.userState, fallback);

    expect(retrieved).toEqual(fallback);
  });
});

describe('Placement scoring logic', () => {
  it('recommends advanced module when all sampled questions are answered correctly', () => {
    const questions = [
      { id: 'q1', correct: 0, moduleId: 'm01' },
      { id: 'q2', correct: 1, moduleId: 'm05' },
      { id: 'q3', correct: 2, moduleId: 'm12' },
    ];
    const answers = { q1: 0, q2: 1, q3: 2 };

    const firstWrong = questions.find((q) => answers[q.id] !== q.correct);
    const recommended = firstWrong ? moduleById[firstWrong.moduleId] : (moduleById.m21 ?? moduleById.m00);

    expect(firstWrong).toBeUndefined();
    expect(recommended.id).toBe('m21');
    expect(recommended.title).toContain('Modern JavaScript');
  });

  it('recommends the first failed module when learner misses a question', () => {
    const questions = [
      { id: 'q1', correct: 0, moduleId: 'm01' },
      { id: 'q2', correct: 1, moduleId: 'm05' },
      { id: 'q3', correct: 2, moduleId: 'm12' },
    ];
    const answers = { q1: 0, q2: 0, q3: 2 }; // q2 is wrong (answered 0, expected 1)

    const firstWrong = questions.find((q) => answers[q.id] !== q.correct);
    const recommended = firstWrong ? moduleById[firstWrong.moduleId] : (moduleById.m21 ?? moduleById.m00);

    expect(firstWrong).toBeDefined();
    expect(recommended.id).toBe('m05');
  });
});
