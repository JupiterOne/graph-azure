import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { ConditionalAccessSteps } from '../../constants';
import { getStepTestConfigForStep } from '../../../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test(
  ConditionalAccessSteps.CONDITIONAL_ACCESS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      ConditionalAccessSteps.CONDITIONAL_ACCESS,
    );

    recording = setupAzureRecording({
      name: ConditionalAccessSteps.CONDITIONAL_ACCESS,
      directory: __dirname,
      options: {
        recordFailedRequests: true,
        matchRequestsBy: getMatchRequestsBy({
          config: stepTestConfig.instanceConfig,
        }),
      },
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
