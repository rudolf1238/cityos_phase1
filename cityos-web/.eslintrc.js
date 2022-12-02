module.exports = {
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:compat/recommended',
    'plugin:@next/next/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-typescript',
    'prettier',
  ],
  plugins: ['i18next', 'sort-imports-es6-autofix', 'mui-unused-classes'],
  ignorePatterns: ['**/node_modules/**', '**/next-env.d.ts', '**/.next/**', '.eslintrc.js'],
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['tools/**'],
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'i18next/no-literal-string': [
      'warn',
      {
        markupOnly: true,
        ignoreAttribute: [
          'align',
          'alignItems',
          'aria-controls',
          'aria-haspopup',
          'color',
          'component',
          'fontSize',
          'fill',
          'justify',
          'layout',
          'name',
          'objectFit',
          'objectPosition',
          'orientation',
          'pointerEvents',
          'position',
          'severity',
          'size',
          'tabsColor',
          'timeout',
          'variant',
          'xs',
        ],
      },
    ],
    'sort-imports-es6-autofix/sort-imports-es6': 'error',
    'no-void': ['error', { allowAsStatement: true }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': [
      'error',
      {
        paths: ['@material-ui/core'],
        patterns: ['@material-ui/*/*/*', '!@material-ui/core/test-utils/*'],
      },
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'mui-unused-classes/unused-classes': 'error',
    '@typescript-eslint/type-annotation-spacing': 'error',
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    'import/prefer-default-export': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['function-expression', 'arrow-function'],
      },
    ],
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: ['./packages/city-os-abnormal/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-abnormal/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-common/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-common/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-dashboard/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-dashboard/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-map/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-map/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-surveillance/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-surveillance/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-events/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-events/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-automation/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-automation/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-web/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-web/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-indoor/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-indoor/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-sample/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-sample/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['./packages/city-os-esignage/**/*.ts?(x)'],
      parserOptions: {
        project: './packages/city-os-esignage/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['*'],
      rules: {
        'import/prefer-default-export': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
      },
    },
  ],
  settings: {
    next: {
      rootDir: './packages/city-os-web/',
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
