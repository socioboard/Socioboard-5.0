// Architecture boundaries (docs/architecture.md, docs/backend/README.md).
// Run with `pnpm deps:check`; CI fails on any violation.

const SERVER_PACKAGES = '^packages/(core|db|providers|billing)/';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular imports make module wiring order-dependent.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'module-public-surface-only',
      severity: 'error',
      comment:
        'A core module may import another module only through its index.ts, never its internals.',
      from: { path: '^packages/core/src/modules/([^/]+)/' },
      to: {
        path: '^packages/core/src/modules/([^/]+)/.+',
        pathNot: ['^packages/core/src/modules/$1/', '^packages/core/src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'platform-not-to-modules',
      severity: 'error',
      comment: 'Shared platform code sits below feature modules and must not depend on them.',
      from: { path: '^packages/core/src/platform/' },
      to: { path: '^packages/core/src/modules/' },
    },
    {
      name: 'packages-not-to-apps',
      severity: 'error',
      comment: 'Packages are libraries; only apps wire things together.',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'apps-not-to-each-other',
      severity: 'error',
      comment: 'Apps share code through packages, never by importing each other.',
      from: { path: '^apps/([^/]+)/' },
      to: { path: '^apps/', pathNot: '^apps/$1/' },
    },
    {
      name: 'web-features-through-index',
      severity: 'error',
      comment:
        'Web features use each other only through features/<area>/index.ts (docs/frontend/README.md).',
      from: { path: '^apps/web/src/features/([^/]+)/' },
      to: {
        path: '^apps/web/src/features/',
        pathNot: ['^apps/web/src/features/$1/', '^apps/web/src/features/[^/]+/index[.]ts$'],
      },
    },
    {
      name: 'web-outside-features-through-index',
      severity: 'error',
      comment: 'Routes and lib reach a feature only through its index.ts.',
      from: { path: '^apps/web/src/', pathNot: '^apps/web/src/features/' },
      to: { path: '^apps/web/src/features/', pathNot: '^apps/web/src/features/[^/]+/index[.]ts$' },
    },
    {
      name: 'web-no-server-code',
      severity: 'error',
      comment: 'The browser bundle may use contracts and ui only (no db, secrets or providers).',
      from: { path: '^(apps/web|packages/ui)/' },
      to: { path: SERVER_PACKAGES },
    },
    {
      name: 'contracts-standalone',
      severity: 'error',
      comment:
        'Contracts are shared with the browser, so they depend on no other workspace package.',
      from: { path: '^packages/contracts/' },
      to: { path: '^packages/(?!contracts/)' },
    },
    {
      name: 'providers-standalone',
      severity: 'error',
      comment: 'Network adapters talk to external APIs only; core calls them, not the reverse.',
      from: { path: '^packages/providers/' },
      to: { path: '^packages/(core|db|billing|ui|emails)/' },
    },
    {
      name: 'no-deep-package-imports',
      severity: 'error',
      comment: 'Import a workspace package by name (@socioboard/x), not by path into its src.',
      from: { path: '^(apps|packages)/([^/]+)/' },
      to: {
        path: '^packages/([^/]+)/src/.+',
        pathNot: ['^packages/$2/', '^packages/[^/]+/src/index\\.tsx?$'],
      },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment: 'Runtime code must not import devDependencies (tests and src/testing may).',
      from: {
        path: '^(apps|packages)/[^/]+/src/',
        pathNot: '__tests__|\\.test\\.tsx?$|/src/testing/',
      },
      // A library's peer (react in packages/ui) is also a devDependency so its tests run; allowed.
      to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only', 'npm-peer'] },
    },
    {
      name: 'testing-only-from-tests',
      severity: 'error',
      comment: 'Test utilities (src/testing) are for tests only, never production code.',
      from: { pathNot: '(__tests__/|\\.test\\.tsx?$|/src/testing/)' },
      to: { path: '/src/testing/' },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Every import must resolve; an unresolved one usually means a missing dependency.',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'no-undeclared-package',
      severity: 'error',
      comment:
        "Import only packages listed in the importing workspace's own package.json. Exception: " +
        'vitest, the one test runner, is a root devDependency shared by every package.',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'], pathNot: '/node_modules/vitest/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|\\.turbo|generated)/' },
    tsPreCompilationDeps: true,
    // Check each workspace against its own package.json, not the root's.
    combinedDependencies: false,
    tsConfig: { fileName: 'tsconfig.depcruise.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json'],
    },
  },
};
