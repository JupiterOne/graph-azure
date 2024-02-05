import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_RM_CDN_ENDPOINTS,
  STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
  STEP_RM_CDN_PROFILE,
  STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
} from './constants';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_CDN_PROFILE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_CDN_PROFILE);

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_PROFILE,
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
  STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
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
  STEP_RM_CDN_ENDPOINTS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_CDN_ENDPOINTS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_ENDPOINTS,
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
  STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
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
