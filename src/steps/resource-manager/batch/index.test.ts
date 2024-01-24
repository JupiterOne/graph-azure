import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  STEP_RM_BATCH_ACCOUNT,
  STEP_RM_BATCH_APPLICATION,
  STEP_RM_BATCH_CERTIFICATE,
  STEP_RM_BATCH_POOL,
} from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_BATCH_ACCOUNT,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_BATCH_ACCOUNT);

    recording = setupAzureRecording(
      {
        name: STEP_RM_BATCH_ACCOUNT,
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
  STEP_RM_BATCH_POOL,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_BATCH_POOL);

    recording = setupAzureRecording(
      {
        name: STEP_RM_BATCH_POOL,
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
  STEP_RM_BATCH_APPLICATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_BATCH_APPLICATION);

    recording = setupAzureRecording(
      {
        name: STEP_RM_BATCH_APPLICATION,
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
  STEP_RM_BATCH_CERTIFICATE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_BATCH_CERTIFICATE);

    recording = setupAzureRecording(
      {
        name: STEP_RM_BATCH_CERTIFICATE,
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
