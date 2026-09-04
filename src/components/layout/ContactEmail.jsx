import { useState } from 'react';
import { Icon } from '../ui/index.jsx';
import { useT } from '../../i18n/index.jsx';
import { LEGAL_FACTS } from '../../legal/config.js';

/**
 * The contact address, usable without a mail client.
 *
 * `mailto:` is correct HTML and stays — on a machine with a mail handler it is
 * the fastest path. But a browser with no handler registered does nothing at all
 * when the link is clicked, which reads as a broken link rather than a missing
 * OS association. So the address is also plain selectable text, and a copy
 * button puts it on the clipboard.
 *
 * The clipboard is touched only in response to the click. Nothing is requested
 * on mount, no permission is asked for up front, and `navigator.clipboard` is
 * absent in insecure contexts and older browsers — so a failure is reported as
 * "select and copy it manually" rather than swallowed. The address is visible
 * either way, which is the real fallback.
 */
export function ContactEmail({ className = '' }) {
  const t = useT();
  const email = LEGAL_FACTS.email;
  const [state, setState] = useState('idle');

  const copy = async () => {
    try {
      // Only reachable from a user gesture, which is what the API requires.
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      setState('failed');
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <a
        href={`mailto:${email}`}
        className="text-primary-ink underline underline-offset-2 hover:opacity-80"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1 rounded border border-outline-variant px-2 py-0.5 font-body-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
      >
        <Icon name={state === 'copied' ? 'check' : 'content_copy'} size={14} />
        {t('legal.copyEmail')}
      </button>
      {/* Announced rather than only coloured, so the outcome is not visual-only. */}
      <span role="status" aria-live="polite" className="font-body-sm text-on-surface-variant">
        {state === 'copied' && t('legal.emailCopied')}
        {state === 'failed' && t('legal.emailCopyFailed')}
      </span>
    </span>
  );
}
