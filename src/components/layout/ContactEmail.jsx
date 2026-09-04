import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/index.jsx';
import { useT } from '../../i18n/index.jsx';
import { LEGAL_FACTS } from '../../legal/config.js';

/**
 * The contact address, usable without a mail client.
 *
 * `mailto:` is correct HTML and stays — on a machine with a mail handler it is
 * the fastest path. But a browser with no handler registered does nothing at all
 * when the link is clicked, which reads as a broken link rather than a missing
 * OS association. So the address is also plain selectable text, and a copy
 * control puts it on the clipboard.
 *
 * The control is icon-only so the address stays the content and the button does
 * not compete with it inside legal prose. It reuses the existing
 * `Button variant="ghost" size="icon"` primitive, which the global
 * coarse-pointer rule already grows to a 44px hit target — the icon is small,
 * the target is not.
 *
 * The clipboard is touched only in response to the click. Nothing is requested
 * on mount, no permission is asked for up front, and `navigator.clipboard` is
 * absent in insecure contexts and older browsers — so a failure is reported as
 * "select and copy it manually" rather than swallowed. The address is visible
 * either way, which is the real fallback.
 */

/** Long enough to notice the tick, short enough not to look stuck. */
const COPIED_RESET_MS = 2000;

export function ContactEmail({ className = '' }) {
  const t = useT();
  const email = LEGAL_FACTS.email;
  const [state, setState] = useState('idle');
  const timerRef = useRef(null);

  // A pending reset must never fire into an unmounted component, and a second
  // click has to restart the countdown rather than race the first one.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const copy = async () => {
    clearTimeout(timerRef.current);
    try {
      // Only reachable from a user gesture, which is what the API requires.
      await navigator.clipboard.writeText(email);
      setState('copied');
      timerRef.current = setTimeout(() => setState('idle'), COPIED_RESET_MS);
    } catch {
      // Left visible: this one is an instruction, not a confirmation.
      setState('failed');
    }
  };

  const copied = state === 'copied';
  const actionLabel = copied ? t('legal.emailCopied') : t('legal.copyEmail');

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1 gap-y-1 ${className}`}>
      <a
        href={`mailto:${email}`}
        className="text-primary-ink underline underline-offset-2 hover:opacity-80"
      >
        {email}
      </a>

      {/*
       * `group` + `focus-within` gives hover *and* keyboard reveal with no
       * dependency and no focus management — the tooltip is decoration, and the
       * button carries its own accessible name.
       */}
      <span className="group relative inline-flex shrink-0 align-middle">
        <Button
          variant="ghost"
          size="icon"
          onClick={copy}
          icon={copied ? 'check' : 'content_copy'}
          aria-label={actionLabel}
        />
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 hidden whitespace-nowrap rounded border border-outline-variant bg-surface-container-highest px-2 py-1 font-body-sm text-on-surface shadow-lg group-hover:block group-focus-within:block"
        >
          {actionLabel}
        </span>
      </span>

      {/*
       * Announced either way. Success is shown visually by the icon and the
       * tooltip, so it stays off-screen here and the prose does not reflow; a
       * failure is an instruction the reader has to be able to see.
       */}
      <span role="status" aria-live="polite" className={copied ? 'sr-only' : 'font-body-sm text-on-surface-variant'}>
        {copied && t('legal.emailCopied')}
        {state === 'failed' && t('legal.emailCopyFailed')}
      </span>
    </span>
  );
}
