import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  STEP_RM_API_MANAGEMENT_APIS,
  STEP_RM_API_MANAGEMENT_SERVICES,
  STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
} from './constants';
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
  STEP_RM_API_MANAGEMENT_SERVICES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_API_MANAGEMENT_SERVICES,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_API_MANAGEMENT_SERVICES,
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
  STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
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
  STEP_RM_API_MANAGEMENT_APIS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_API_MANAGEMENT_APIS,
    );
    recording = setupAzureRecording(
      {
        name: STEP_RM_API_MANAGEMENT_APIS,
        directory: __dirname,
        options: {
          recordFailedRequests: true,
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
