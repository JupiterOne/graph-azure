import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { ConditionalAccessSteps, TIME_OUT } from '../../constants';
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
  ConditionalAccessSteps.CONDITIONAL_ACCESS_AUTH_CONTEXT,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      ConditionalAccessSteps.CONDITIONAL_ACCESS_AUTH_CONTEXT,
    );

    recording = setupAzureRecording({
      name: ConditionalAccessSteps.CONDITIONAL_ACCESS_AUTH_CONTEXT,
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
  TIME_OUT,
);
