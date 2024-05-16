import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import { STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test(
  STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
        directory: __dirname,
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  1000_000,
);
