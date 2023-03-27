module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
  },
  globals: {
    React: 'writable',
  },
  plugins: ['simple-import-sort'],
  rules: {},
  settings: {
    react: {
      version: 'detect',
    },
    next: {
      rootDir: __dirname,
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js'],
      rules: {
        'simple-import-sort/imports': 'error',
      },
    },
  ],
};
