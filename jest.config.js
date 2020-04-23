const { defaults } = require("jest-config");

process.env.ENABLE_GRAPH_OBJECT_SCHEMA_VALIDATION = 1;

module.exports = {
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/**/index.ts",
    "!src/initializeContext.ts",
    "!src/converters/*.ts",
  ],
  setupFiles: ["dotenv/config", "cross-fetch/polyfill"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    "src/azure/AzureClient*.ts": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "src/azure/resource-manager": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "src/jupiterone/": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    "src/utils/": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
