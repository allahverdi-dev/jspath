# Responsive QA

## Scope

Mobile layout hardening, August 2026. Existing routes, learning state, authentication and billing behavior are preserved. No deployment or backend changes are part of this work.

Shared fixes cover shrinking grid/flex columns, long identifiers, local code/table scrolling, wrapping action groups, touch targets, readable form text, safe-area insets and viewport-bounded overlays. Small screens and coarse-pointer devices use the controlled native code editor; desktop keeps Monaco. The native editor supports touch indentation and keyboard run shortcuts.

## Browser checks

Checked in the in-app Chromium browser against the local Vite application. Root overflow was measured by comparing `document.documentElement.scrollWidth` with `clientWidth`; a desktop scrollbar can reduce the latter by 15px. Local scrolling inside code, tables and tab lists is intentional.

All measured pages below fit their viewport without root horizontal overflow.

- 320 × 740: landing, dashboard, curriculum, practice, challenges, projects, playground, interview, reference, cheat sheets, pricing, profile, settings, achievements, my learning, bookmarks, search, login, signup, onboarding level/goals/placement.
- 320 × 740 detail samples: curriculum orientation; first orientation lesson; exercises `ex-m00-01-a` and `ex-m00-01-b`; `array-from` reference; objects cheat sheet; daily practice session; interview session; `iv-adv-modules` interview question; word-frequency challenge; counter-app project.
- Widths 360, 390, 430, 768, 1024 and 1440 at height 820: landing, dashboard, practice, interview, reference and playground.
- 667 × 375 landscape: landing, playground, interview, orientation lesson, array-from reference and objects cheat sheet.
- 320 × 360 short viewport: search and settings confirmation dialog remain within the viewport, with internally scrolling content and accessible close/cancel controls. Progress reset was **not** confirmed.

Interaction checks: mobile drawer open/close and body scroll lock; search input/results/close; expanded interview answer and started interview session; editing/running a reference sample with all toolbar actions visible; native Playground editor and successful console output. No progress reset, purchase, authentication or snippet-save action was performed.

Initial 320px overflow examples: landing 440px, practice 350px, interview 3419px, reference 344px (available content width 305px). These now fit the available width.

## Regression coverage

`src/tests/mobile-ui.test.jsx` checks search focus/scroll restoration, modal Tab/Escape behavior and rerender stability, immediate native phone editing, touch indentation, readable editor font size, read-only behavior and labelled switch operation.

Verification commands:

```sh
npm run lint
npm test
npm run build
npm run content:audit
npm run content:verify
npm run content:examples
```

The test suite contains 94 passing tests. Content verification reports zero broken references, zero failing reference solutions (4561 assertions), and zero example-output mismatches. The production build retains its existing large-content-chunk warning; existing React Router future-flag and test `act` warnings are unrelated to responsive layout.

## Physical-device release check

Viewport testing is not a guarantee for every phone/browser combination. Before release, smoke-test current iOS Safari and Android Chrome on hardware: software keyboard open/close, portrait/landscape rotation, notch/home-indicator safe areas, pinch/text zoom, native code selection/indentation and horizontal swiping inside code/tables. No zoom restriction or global horizontal-overflow hiding was added.
