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
test('rm-subscription-locations', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.LOCATIONS);

  recording = setupAzureRecording(
    {
      name: steps.LOCATIONS,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const { collectedRelationships } = await executeStepWithDependencies(
    stepTestConfig,
  );
  expect(collectedRelationships.length).toBeGreaterThan(0);
}, 100_000);
