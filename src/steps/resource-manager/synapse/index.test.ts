import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { SYNAPSE_STEPS } from './constant';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

const {
  SYNAPSE_SERVICE,
  SYNAPSE_WORKSPACES,
  SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
  SYNAPSE_SQL_POOL,
  SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
  SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
  SYNAPSE_KEYS,
  SYNAPSE_SERVICE_KEY_RELATIONSHIP,
  SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
  SYNAPSE_DATA_MASKING_POLICY,
  SYNAPSE_DATA_MASKING_RULE,
  SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
  KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
  SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP,
} = SYNAPSE_STEPS;

test(
  SYNAPSE_SERVICE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(SYNAPSE_SERVICE);

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SERVICE,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_WORKSPACES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(SYNAPSE_WORKSPACES);

    recording = setupAzureRecording(
      {
        name: SYNAPSE_WORKSPACES,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SQL_POOL,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(SYNAPSE_SQL_POOL);

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SQL_POOL,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_KEYS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(SYNAPSE_KEYS);

    recording = setupAzureRecording(
      {
        name: SYNAPSE_KEYS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SERVICE_KEY_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_SERVICE_KEY_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SERVICE_KEY_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_DATA_MASKING_POLICY,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_DATA_MASKING_POLICY,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_DATA_MASKING_POLICY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_DATA_MASKING_RULE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(SYNAPSE_DATA_MASKING_RULE);

    recording = setupAzureRecording(
      {
        name: SYNAPSE_DATA_MASKING_RULE,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
