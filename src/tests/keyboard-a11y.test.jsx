import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Button, Dialog, Toggle, Select, Input, Tabs } from '../components/ui/index.jsx';

/**
 * Keyboard and accessibility behaviour.
 *
 * The browser pane used for manual QA runs hidden, which throttles timers and
 * drops synthesised keystrokes, so keyboard interaction cannot be proven by
 * driving the real app. jsdom does deliver real key events through
 * `userEvent`, so the shared primitives every screen is built from are proven
 * here instead — that is the strongest verification the environment allows.
 */

const mount = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('buttons and links', () => {
  it('activates a button with both Enter and Space', async () => {
    const user = userEvent.setup({ delay: null });
    let clicks = 0;
    mount(<Button onClick={() => { clicks += 1; }}>Run</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Run' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(clicks).toBe(2);
  });

  it('keeps a disabled button out of the tab order', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<><Button disabled>Locked</Button><Button>Open</Button></>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('renders a link when given a destination, so it is keyboard-navigable as a link', () => {
    mount(<Button to="/curriculum">Browse</Button>);
    const link = screen.getByRole('link', { name: 'Browse' });
    expect(link).toHaveAttribute('href', '/curriculum');
  });

  it('does not default to a form submit', () => {
    mount(<Button>Safe</Button>);
    expect(screen.getByRole('button', { name: 'Safe' })).toHaveAttribute('type', 'button');
  });
});

describe('dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open dialog</button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Reset all progress?"
          footer={<button type="button" onClick={() => setOpen(false)}>Cancel</button>}
        >
          <button type="button">Confirm</button>
        </Dialog>
      </>
    );
  }

  it('exposes itself as a modal dialog labelled by its title', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Reset all progress?');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns focus to the control that opened it', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    const opener = screen.getByRole('button', { name: /open dialog/i });
    await user.click(opener);
    await user.keyboard('{Escape}');
    expect(opener).toHaveFocus();
  });

  it('gives every dialog control an accessible name', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    for (const button of screen.getAllByRole('button')) {
      expect((button.getAttribute('aria-label') ?? button.textContent ?? '').trim()).not.toBe('');
    }
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });

  it('keeps Tab inside the dialog rather than escaping to the page behind', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    const dialog = screen.getByRole('dialog');

    // The panel takes focus on open via requestAnimationFrame; start the walk
    // from a control inside it so the trap's wrap-around is what is measured.
    const inside = screen.getByRole('button', { name: 'Confirm' });
    inside.focus();
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement), `tab ${i + 1}`).toBe(true);
    }
  });

  it('locks background scroll while open and restores it after', async () => {
    const user = userEvent.setup({ delay: null });
    mount(<Harness />);
    await user.click(screen.getByRole('button', { name: /open dialog/i }));
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

describe('form primitives', () => {
  it('labels a select and changes with the keyboard', async () => {
    const user = userEvent.setup({ delay: null });
    let value = 'a';
    mount(
      <Select label="Questions" value={value} onChange={(e) => { value = e.target.value; }}>
        <option value="a">Five</option>
        <option value="b">Ten</option>
      </Select>,
    );
    const select = screen.getByLabelText('Questions');
    await user.selectOptions(select, 'b');
    expect(value).toBe('b');
  });

  it('labels an input and accepts typed text', async () => {
    const user = userEvent.setup({ delay: null });
    let value = '';
    mount(<Input label="Search" value={value} onChange={(e) => { value = e.target.value; }} />);
    const input = screen.getByLabelText('Search');
    await user.type(input, 'map');
    expect(input).toHaveFocus();
    expect(value).not.toBe('');
  });

  it('exposes a toggle as a switch with its state and an accessible name', async () => {
    const user = userEvent.setup({ delay: null });
    let on = false;
    const { rerender } = mount(
      <Toggle label="Reduce motion" checked={on} onChange={(next) => { on = next; }} />,
    );
    const toggle = screen.getByRole('switch', { name: /reduce motion/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    toggle.focus();
    await user.keyboard(' ');
    expect(on).toBe(true);

    rerender(<MemoryRouter><Toggle label="Reduce motion" checked onChange={() => {}} /></MemoryRouter>);
    expect(screen.getByRole('switch', { name: /reduce motion/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('exposes the selected tab and roves with the arrow keys', async () => {
    const user = userEvent.setup({ delay: null });
    let active = 'all';
    mount(
      <Tabs
        tabs={[{ value: 'all', label: 'All' }, { value: 'free', label: 'Free' }]}
        value={active}
        onChange={(next) => { active = next; }}
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');

    // The ARIA tabs pattern moves selection with arrows, not Tab/Enter.
    tabs[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(active).toBe('free');

    active = 'free';
    await user.keyboard('{Home}');
    expect(active).toBe('all');
  });
});
