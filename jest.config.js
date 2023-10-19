module.exports = {
  ...require('@jupiterone/integration-sdk-dev-tools/config/jest'),
  setupFiles: ['<rootDir>/globalSetup.ts', 'cross-fetch/polyfill'],
  testTimeout: 20_000,
};
