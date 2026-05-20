import { nextJsConfig } from '@workspace/eslint-config/next-js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.source/**',
      'public/**',
      'registry/**',
      'scripts/**',
    ],
  },
  ...nextJsConfig,
  {
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['tw'] }],
    },
  },
];
