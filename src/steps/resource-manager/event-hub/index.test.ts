import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION, EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION, STEP_AZURE_CONSUMER_GROUP, STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION, STEP_AZURE_EVENT_HUB, STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION, STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION, STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION, STEP_EVENT_HUB_CLUSTER, STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION, STEP_EVENT_HUB_KEYS, STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION, STEP_EVENT_HUB_NAMESPACE } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_EVENT_HUB_KEYS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_EVENT_HUB_KEYS);

    recording = setupAzureRecording(
      {
        name: STEP_EVENT_HUB_KEYS,
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
  STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
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
  STEP_EVENT_HUB_NAMESPACE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_EVENT_HUB_NAMESPACE,
    );

    recording = setupAzureRecording(
      {
        name: STEP_EVENT_HUB_NAMESPACE,
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
  EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
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
  STEP_AZURE_EVENT_HUB,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_EVENT_HUB,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EVENT_HUB,
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
  EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
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
  STEP_EVENT_HUB_CLUSTER,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_EVENT_HUB_CLUSTER,
    );

    recording = setupAzureRecording(
      {
        name: STEP_EVENT_HUB_CLUSTER,
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
  STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
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
  STEP_AZURE_CONSUMER_GROUP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_CONSUMER_GROUP,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_CONSUMER_GROUP,
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
  STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
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
  STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
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
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
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
  STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION,
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
