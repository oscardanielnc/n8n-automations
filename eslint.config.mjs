import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The dependency rules of the architecture live here, not in good intentions (development standard §3, §10).
const apiModules = ['runs', 'vigia', 'server'];
const webFeatures = ['home', 'errors'];

export default tseslint.config(
  { ignores: ['**/dist/**', '**/storybook-static/**', '**/node_modules/**', '**/*.config.*', '**/.storybook/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'import-x': importX },
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: ['apps/*/tsconfig.json', 'packages/*/tsconfig.json'], noWarnOnMultipleProjects: true })],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    files: ['apps/api/src/**/*.ts'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: 'apps/api/src',
          zones: [
            // domain: no framework, no outer layer
            ...apiModules.map((m) => ({
              target: `modules/${m}/domain`,
              from: [`modules/${m}/application`, `modules/${m}/infrastructure`, `modules/${m}/presentation`, 'shared/infrastructure', 'shared/presentation'],
              message: 'domain depends on nothing outside itself',
            })),
            // application: never infrastructure or presentation
            ...apiModules.map((m) => ({
              target: `modules/${m}/application`,
              from: [`modules/${m}/infrastructure`, `modules/${m}/presentation`, 'shared/infrastructure'],
              message: 'use cases talk to ports, never to adapters',
            })),
            // modules never reach into another module (overview composes them through exported use cases)
            ...apiModules.map((m) => ({
              target: `modules/${m}`,
              from: apiModules.filter((o) => o !== m).map((o) => `modules/${o}`),
              message: 'modules do not import each other; compose them in modules/overview',
            })),
          ],
        },
      ],
    },
  },
  {
    files: ['apps/api/src/modules/*/domain/**/*.ts', 'apps/api/src/shared/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['@nestjs/*', 'express', 'jose'], message: 'domain has no framework imports' }] }],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: 'apps/web/src',
          zones: [
            // shared → features → app
            { target: ['components', 'lib'], from: ['features', 'app'], message: 'shared code never imports a feature or the app' },
            ...webFeatures.map((f) => ({
              target: `features/${f}`,
              from: ['app', ...webFeatures.filter((o) => o !== f).map((o) => `features/${o}`)],
              message: 'a feature never imports another feature or the app',
            })),
          ],
        },
      ],
    },
  },
  {
    files: ['packages/ui/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['@panel/contracts', 'react-router', '@tanstack/*'], message: 'the design system knows nothing about data or routing' }] }],
    },
  },
);
