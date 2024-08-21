import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../../test/helpers/recording';
import {
  configFromEnv,
  getStepTestConfigForStep,
} from '../../../../../test/integrationInstanceConfig';
import { steps } from '../constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test('rm-subscription-usage-details', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.USAGE_DETAILS);

  recording = setupAzureRecording(
    {
      name: steps.USAGE_DETAILS,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          options: {
            url: { query: false },
          },
        }),
      },
    },
    stepTestConfig.instanceConfig,
  );

  await executeStepWithDependencies(stepTestConfig);
}, 100_000);
