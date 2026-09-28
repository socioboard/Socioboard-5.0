import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/src/generated/**',
      '**/routeTree.gen.ts',
      '**/ladle-build/**',
    ],
  },

  js.configs.recommended,

  // TypeScript: type-aware rules catch unhandled promises in routes and jobs.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  // Node processes and tooling.
  {
    files: [
      'apps/api/**',
      'apps/worker/**',
      'packages/{core,db,providers,billing,contracts}/**',
      '*.js',
    ],
    languageOptions: { globals: globals.node },
  },

  // React code.
  {
    files: ['apps/web/**/*.{ts,tsx}', 'packages/{ui,emails}/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // TanStack Router signals "not found" and redirects by throwing its own objects.
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            { from: 'package', package: '@tanstack/router-core', name: 'NotFoundError' },
            { from: 'package', package: '@tanstack/router-core', name: 'Redirect' },
          ],
        },
      ],
    },
  },

  // Route files export a Route object next to their component (the router's code splitting
  // handles hot reload there), and the ui package pairs providers with their hooks on purpose.
  {
    files: ['apps/web/src/routes/**/*.tsx', 'packages/ui/src/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Must stay last: turns off rules that Prettier handles.
  prettier,
);
