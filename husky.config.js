const { hooks } = require('@jupiterone/integration-sdk-dev-tools/config/husky');

module.exports = {
  hooks: {
    'pre-commit': `yarn j1-integration document && git add docs/jupiterone.md && lint-staged && yarn precommit`,
    'pre-push': hooks['pre-push'],
  },
};
