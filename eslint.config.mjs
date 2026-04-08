
import baseConfig from 'eslint-config-vshift/configs/base.mjs';


export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
        log: 'off',
      },
    },
    rules: {},
  },
  {
    files: [
      '**/*.js',
      '**/*.jsx',
    ],
  },
  {
    ignores: [
      'pnpm-lock.yaml',
      'dist',
      'pub',
    ],
  },
];

