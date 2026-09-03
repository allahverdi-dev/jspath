/**
 * The boundary between translated product chrome and authored English content.
 *
 * The interface is available in English, Azerbaijani and Russian, and
 * `I18nProvider` sets `<html lang>` to match. The learning content inside it is
 * authored English and stays that way deliberately — which means that, without
 * marking, every lesson title and paragraph claims to be Azerbaijani or Russian.
 * Two things go wrong when it does:
 *
 *  - **Casing.** `text-transform: uppercase` is language-sensitive. Under
 *    `lang="az"` the module chip renders the authored word "Orientation" as
 *    "ORİENTATİON", because Azerbaijani (like Turkish) uppercases `i` to `İ`.
 *    The source text is corrupted by presentation.
 *  - **Speech.** A screen reader announces English prose with Azerbaijani or
 *    Russian phonetics, which is close to unusable.
 *
 * `lang` is inherited, so this is applied at the *string*, not at a page region:
 * marking a whole panel English would relabel the translated buttons and headings
 * inside it, which is the same bug pointing the other way.
 *
 * Use `Authored` for plain authored strings, and `InlineMarkup` — which carries
 * the same marking — for authored prose that may contain code or emphasis.
 */
export function Authored({ children, as: Tag = 'span', className }) {
  return <Tag lang="en" className={className}>{children}</Tag>;
}
