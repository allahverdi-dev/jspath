import { useEffect } from 'react';

/**
 * Set the browser tab title for a route, and restore it on the way out.
 *
 * The application otherwise leaves the title alone — a single-page app with one
 * static `<title>` in `index.html`. The legal pages are the first routes that
 * are linked to directly from outside the app and read on their own, so they
 * need to name themselves in a tab, a bookmark and a shared link.
 *
 * This is deliberately the whole of it. Adding a metadata framework to give
 * three static documents a title would be more machinery than the problem.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    const previous = document.title;
    document.title = title;
    return () => { document.title = previous; };
  }, [title]);
}
