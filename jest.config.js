module.exports = {
  ...require('@jupiterone/integration-sdk-dev-tools/config/jest'),
  setupFiles: ['cross-fetch/polyfill'],
};
