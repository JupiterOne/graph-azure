import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { STEP_AZURE_APPLICATION_SECURITY_GROUP } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_AZURE_APPLICATION_SECURITY_GROUP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_APPLICATION_SECURITY_GROUP,
    );

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_APPLICATION_SECURITY_GROUP,
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
