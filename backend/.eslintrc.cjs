module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  rules: {
    'no-underscore-dangle': ['off'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'import/extensions': 'off',
    'object-curly-newline': 'off',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
