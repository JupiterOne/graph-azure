import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import {
  STEP_RM_EVENT_GRID_DOMAINS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
  STEP_RM_EVENT_GRID_TOPICS,
  STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
} from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_EVENT_GRID_DOMAINS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_EVENT_GRID_DOMAINS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_EVENT_GRID_DOMAINS,
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
  1000_000,
);

test(
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
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
  1000_000,
);
test(
  STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
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
  1000_000,
);
test(
  STEP_RM_EVENT_GRID_TOPICS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_EVENT_GRID_TOPICS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_EVENT_GRID_TOPICS,
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
  1000_000,
);
test(
  STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
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
  1000_000,
);
