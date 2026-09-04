module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules', 'src/content/generated', 'coverage'],
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
  overrides: [
    {
      files: ['scripts/**/*.mjs', 'vite.config.js', '*.cjs'],
      env: { node: true, browser: false },
    },
    {
      // Supabase Edge Functions run in Deno, not the browser or Node.
      files: ['supabase/functions/**/*.{js,ts}'],
      env: { browser: false, node: false },
      globals: { Deno: 'readonly', crypto: 'readonly', fetch: 'readonly', Response: 'readonly', Request: 'readonly', TextEncoder: 'readonly' },
    },
    {
      files: ['src/**/*.{test,spec}.{js,jsx}', 'src/tests/**'],
      env: { node: true },
      globals: { describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly', vi: 'readonly' },
    },
  ],
};
