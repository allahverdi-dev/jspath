/** JSPath design tokens — see docs/DESIGN-DECISIONS.md
 *  Token *names* come from the Stitch export so exported markup maps 1:1.
 *  Token *values* come from JSPath Core / DESIGN.md prose (the authored intent).
 *  Every colour resolves through a CSS variable so light/dark swap cleanly and
 *  Tailwind opacity modifiers (bg-primary/10) keep working.
 */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const colorTokens = [
  'background', 'on-background',
  'surface', 'surface-dim', 'surface-bright', 'surface-variant',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  'on-surface', 'on-surface-variant',
  'inverse-surface', 'inverse-on-surface',
  'outline', 'outline-variant',
  'primary', 'on-primary', 'primary-ink', 'primary-container', 'on-primary-container',
  'primary-fixed', 'primary-fixed-dim', 'inverse-primary', 'surface-tint',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'success', 'on-success', 'success-container', 'on-success-container',
  'warning', 'on-warning', 'warning-container', 'on-warning-container',
  'info', 'on-info', 'info-container', 'on-info-container',
];

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: Object.fromEntries(colorTokens.map((t) => [t, c(t)])),
      fontFamily: {
        display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Stitch aliases
        'display-lg': ['Geist', 'Inter', 'sans-serif'],
        'headline-md': ['Geist', 'Inter', 'sans-serif'],
        'headline-sm': ['Geist', 'Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-sm': ['Inter', 'sans-serif'],
        'code-md': ['"JetBrains Mono"', 'monospace'],
        'code-sm': ['"JetBrains Mono"', 'monospace'],
        'label-caps': ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-lg': ['clamp(2rem, 1.2rem + 2.6vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['clamp(1.5rem, 1.15rem + 1.1vw, 2rem)', { lineHeight: '1.22', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'title-md': ['1.125rem', { lineHeight: '1.6rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'code-md': ['0.875rem', { lineHeight: '1.375rem' }],
        'code-sm': ['0.75rem', { lineHeight: '1.125rem' }],
        'label-caps': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '0.75rem',
      },
      spacing: {
        'sidebar-width': '280px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
      },
      maxWidth: {
        'container-max': '1440px',
        prose: '72ch',
      },
      transitionDuration: { DEFAULT: '150ms' },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
      },
    },
  },
  plugins: [],
};
