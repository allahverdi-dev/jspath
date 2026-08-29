/**
 * Material Symbols wrapper.
 *
 * Icons are decorative by default (`aria-hidden`), because they nearly always sit
 * beside a text label. Pass a `label` only when the icon is the sole meaning
 * carrier, and it becomes an `img` role with an accessible name.
 */
export function Icon({ name, size = 20, className = '', filled = false, weight, label, ...rest }) {
  const style = {
    fontSize: `${size}px`,
    width: `${size}px`,
    height: `${size}px`,
    ...(weight ? { fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}` } : null),
  };
  return (
    <span
      className={`material-symbols-outlined shrink-0 select-none leading-none ${filled ? 'filled' : ''} ${className}`}
      style={style}
      aria-hidden={label ? undefined : 'true'}
      role={label ? 'img' : undefined}
      aria-label={label}
      translate="no"
      {...rest}
    >
      {name}
    </span>
  );
}
