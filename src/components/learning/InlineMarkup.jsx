import { Fragment, useMemo } from 'react';

/**
 * Minimal inline markup for lesson prose.
 *
 * Content is authored as plain strings, so a full Markdown parser would be
 * overkill and a rendering-time dependency. Three constructs are supported,
 * which covers everything the curriculum actually needs:
 *
 *   ```lang…```  → a fenced code block
 *   ``code``     → inline code that itself contains a backtick
 *   `code`       → inline code
 *   **bold**     → emphasis
 *   [text](url)  → link
 *
 * The fenced form is matched first, so a multi-line block is never mistaken for
 * a run of inline spans. It renders as a block-displayed `<code>` rather than a
 * `<pre>`, because this component is used inside paragraphs and `<pre>` is not
 * valid phrasing content there.
 *
 * Everything is rendered as React elements — no `dangerouslySetInnerHTML`
 * anywhere — so authored content can never inject markup into the page.
 *
 * The output is marked `lang="en"`. Every caller passes authored learning
 * content, which is canonical English inside an interface that may be running in
 * Azerbaijani or Russian; see `Authored.jsx` for why that marking matters. The
 * wrapper uses `display: contents` so it contributes the language and nothing
 * else — no box, no effect on the surrounding layout, which matters because this
 * renders inside paragraphs, list items and table cells alike.
 */

// `` … `` comes before ` … ` so a span that itself contains a backtick — the
// standard Markdown escape, used by the tagged-template content — is matched
// whole instead of being read as two stray delimiters.
const PATTERN = /(```[\s\S]*?```)|(``[\s\S]*?``)|(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;

/* Carries the language without generating a box of its own. */
const CONTENTS = { display: 'contents' };

export function InlineMarkup({ text }) {
  const parts = useMemo(() => {
    const source = String(text ?? '');
    const out = [];
    let last = 0;
    let match;

    PATTERN.lastIndex = 0;
    while ((match = PATTERN.exec(source)) !== null) {
      if (match.index > last) out.push({ type: 'text', value: source.slice(last, match.index) });

      const token = match[0];
      if (token.startsWith('```')) {
        // Drop the fences and an optional language tag on the opening line.
        const body = token.slice(3, -3).replace(/^[a-zA-Z0-9-]*\n/, '');
        out.push({ type: 'block', value: body.replace(/\n$/, '') });
      } else if (token.startsWith('``')) {
        // Markdown trims one padding space on each side of a `` span.
        out.push({ type: 'code', value: token.slice(2, -2).replace(/^ | $/g, '') });
      } else if (token.startsWith('`')) {
        out.push({ type: 'code', value: token.slice(1, -1) });
      } else if (token.startsWith('**')) {
        // Bold may wrap inline code — "**`null`**" is natural to author and
        // reads correctly. Split the emphasised run so the code spans inside it
        // still render as code rather than as literal backticks.
        const inner = token.slice(2, -2);
        const pieces = inner.split(/(`[^`]+`)/).filter(Boolean);
        out.push({
          type: 'bold',
          parts: pieces.map((piece) => (piece.startsWith('`') && piece.endsWith('`') && piece.length > 1
            ? { type: 'code', value: piece.slice(1, -1) }
            : { type: 'text', value: piece })),
        });
      } else {
        const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
        out.push({ type: 'link', value: linkMatch[1], href: linkMatch[2] });
      }
      last = PATTERN.lastIndex;
    }
    if (last < source.length) out.push({ type: 'text', value: source.slice(last) });
    return out;
  }, [text]);

  return (
    <span lang="en" style={CONTENTS}>
      {parts.map((part, i) => {
        if (part.type === 'block') {
          return (
            <code
              key={i}
              className="thin-scrollbar my-2 block overflow-x-auto whitespace-pre rounded-lg border border-outline-variant bg-surface-container p-3 font-mono text-code-sm text-on-surface"
            >
              {part.value}
            </code>
          );
        }
        if (part.type === 'code') {
          return (
            <code
              key={i}
              className="rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 font-mono text-code-sm text-on-surface"
            >
              {part.value}
            </code>
          );
        }
        if (part.type === 'bold') {
          return (
            <strong key={i} className="font-semibold text-on-surface">
              {part.parts.map((piece, j) => (piece.type === 'code' ? (
                <code
                  key={j}
                  className="rounded border border-outline-variant bg-surface-container px-1.5 py-0.5 font-mono text-code-sm text-on-surface"
                >
                  {piece.value}
                </code>
              ) : (
                <Fragment key={j}>{piece.value}</Fragment>
              )))}
            </strong>
          );
        }
        if (part.type === 'link') {
          const external = /^https?:/.test(part.href);
          return (
            <a
              key={i}
              href={part.href}
              className="text-primary-ink underline underline-offset-2 hover:opacity-80"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
            >
              {part.value}
            </a>
          );
        }
        return <Fragment key={i}>{part.value}</Fragment>;
      })}
    </span>
  );
}
