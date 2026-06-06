import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

// eslint-config-next handles React, React Hooks, Next.js, and import rules.
// eslint-config-next/typescript adds @typescript-eslint/recommended on top.
// Custom rules below enforce Airbnb-level code quality without the peer-dep conflicts
// that eslint-config-airbnb-flat introduces in ESLint 9 flat-config setups.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // ── Airbnb-style quality rules ──────────────────────────────────────
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'object-shorthand': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],

      // ── TypeScript strictness ────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ── Next.js / React relaxations ──────────────────────────────────────
      'react/react-in-jsx-scope': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'no-use-before-define': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);

export default eslintConfig;
