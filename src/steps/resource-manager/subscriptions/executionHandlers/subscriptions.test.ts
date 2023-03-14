import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../../test/integrationInstanceConfig';
import { steps } from '../constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test('rm-subscription', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.SUBSCRIPTION);

  recording = setupAzureRecording(
    {
      name: steps.SUBSCRIPTION,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);

test('rm-subscription-diagnostic-settings', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    steps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS,
  );

  recording = setupAzureRecording(
    {
      name: steps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);
