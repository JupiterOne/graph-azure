import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import { FrontDoorStepIds } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('rm-fetch-frontdoors', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    FrontDoorStepIds.FETCH_FRONTDOORS,
  );

  recording = setupAzureRecording({
    name: 'rm-fetch-frontdoors',
    directory: __dirname,
    options: {
      matchRequestsBy: getMatchRequestsBy({
        config: stepTestConfig.instanceConfig,
      }),
    },
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 10_000);
