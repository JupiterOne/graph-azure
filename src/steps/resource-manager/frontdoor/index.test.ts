import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import {
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
  recording = setupAzureRecording({
    name: 'rm-fetch-frontdoors',
    directory: __dirname,
  });

  const stepTestConfig = getStepTestConfigForStep(
    FrontDoorStepIds.FETCH_FRONTDOORS,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  console.log(stepResults.collectedEntities);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 10_000);
