import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { STEP_RM_DNS_RECORD_SETS, STEP_RM_DNS_ZONES } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_DNS_ZONES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_DNS_ZONES);

    recording = setupAzureRecording(
      {
        name: STEP_RM_DNS_ZONES,
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
  STEP_RM_DNS_RECORD_SETS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_DNS_RECORD_SETS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_DNS_RECORD_SETS,
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
