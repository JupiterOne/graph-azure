import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  setupAzureRecording,
  getMatchRequestsBy,
  mutateSubscriptionAndDirectory,
} from '../../../../../test/helpers/recording';
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

  recording = setupAzureRecording({
    name: steps.SUBSCRIPTION,
    directory: __dirname,
    mutateEntry: (entry) =>
      mutateSubscriptionAndDirectory(entry, stepTestConfig.instanceConfig),
    options: {
      matchRequestsBy: getMatchRequestsBy({
        config: stepTestConfig.instanceConfig,
      }),
    },
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);
