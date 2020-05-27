module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testMatch: ['<rootDir>/src/**/*.test.{js,ts}'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  setupFiles: ['dotenv/config', 'cross-fetch/polyfill'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
