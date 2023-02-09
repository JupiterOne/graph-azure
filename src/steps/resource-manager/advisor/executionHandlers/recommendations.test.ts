import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../../test/helpers/recording';
import { AdvisorSteps } from '../constants';
import { getStepTestConfigForStep } from '../../../../../test/integrationInstanceConfig';

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

// test('rm-advisor-assessment-recommendation-relationships', async () => {
//   const stepTestConfig = getStepTestConfigForStep(
//     AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
//   );

//   recording = setupAzureRecording({
//     name: AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
//     directory: __dirname,
//     options: {
//       matchRequestsBy: getMatchRequestsBy({
//         config: stepTestConfig.instanceConfig,
//       }),
//     },
//   });

//   const stepResults = await executeStepWithDependencies(stepTestConfig);
//   expect(stepResults).toMatchStepMetadata(stepTestConfig);
// }, 10_000);

// test('rm-advisor-resource-recommendation-relationships', async () => {
//   const stepTestConfig = getStepTestConfigForStep(
//     AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
//   );

//   recording = setupAzureRecording({
//     name: AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
//     directory: __dirname,
//     options: {
//       matchRequestsBy: getMatchRequestsBy({
//         config: stepTestConfig.instanceConfig,
//       }),
//     },
//   });

//   const stepResults = await executeStepWithDependencies(stepTestConfig);
//   expect(stepResults).toMatchStepMetadata(stepTestConfig);
// }, 10_000);
