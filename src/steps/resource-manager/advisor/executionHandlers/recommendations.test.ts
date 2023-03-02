import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  setupAzureRecording,
  getMatchRequestsBy,
  mutateSubscriptionAndDirectory,
} from '../../../../../test/helpers/recording';
import { AdvisorSteps } from '../constants';
import { getStepTestConfigForStep } from '../../../../../test/integrationInstanceConfig';
import { getConfigForTest } from '../../security/__tests__/utils';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test('rm-advisor-recommendations', async () => {
  const stepTestConfig = getStepTestConfigForStep(AdvisorSteps.RECOMMENDATIONS);

  recording = setupAzureRecording({
    name: AdvisorSteps.RECOMMENDATIONS,
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

test('rm-advisor-assessment-recommendation-relationships', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
  );

  recording = setupAzureRecording(
    {
      name: AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 1000_000);

test('rm-advisor-resource-recommendation-relationships', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
  );
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );
  recording = setupAzureRecording(
    {
      name: AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
      directory: __dirname,
      mutateEntry: (entry) => {
        if (![200, 401].includes(entry.response.status)) {
          throw new Error(
            `${AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP} should only receive 200 and 401 response codes - got ${entry.response.status}`,
          );
        }
        return mutateSubscriptionAndDirectory(
          entry,
          stepTestConfig.instanceConfig,
        );
      },
      options: {
        recordFailedRequests: true,
        matchRequestsBy: {
          ...getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 1000_000);
