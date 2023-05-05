import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import { STEP_RM_CONTAINER_SERVICES_CLUSTERS } from './constants';

let recording: Recording | undefined;
afterEach(async () => {
  if (recording) await recording.stop();
});

test('rm-container-services-cluster', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    STEP_RM_CONTAINER_SERVICES_CLUSTERS,
  );
  recording = setupAzureRecording({
    directory: __dirname,
    name: 'rm-container-services-cluster',
    options: {
      matchRequestsBy: getMatchRequestsBy({
        config: stepTestConfig.instanceConfig,
      }),
    },
  });

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);
