module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['airbnb', 'plugin:react/jsx-runtime', 'plugin:react/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/extensions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-alert': 'off',
  },
};
