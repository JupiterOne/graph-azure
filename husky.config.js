const { hooks } = require('@jupiterone/integration-sdk-dev-tools/config/husky');

module.exports = {
  hooks: {
    'pre-commit': `${hooks['pre-commit']} && yarn precommit`,
    'pre-push': hooks['pre-push'],
  },
};
