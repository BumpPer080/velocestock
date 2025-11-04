export default {
  testEnvironment: 'node',
  collectCoverageFrom: ['**/routes/**/*.js', '**/models/**/*.js', '!**/node_modules/**'],
  coverageDirectory: './coverage',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.js',
  },
};
