import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { AppServiceSteps } from './constants';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  AppServiceSteps.APPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(AppServiceSteps.APPS);

    recording = setupAzureRecording(
      {
        name: AppServiceSteps.APPS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  AppServiceSteps.APP_SERVICE_PLANS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AppServiceSteps.APP_SERVICE_PLANS,
    );
    recording = setupAzureRecording(
      {
        name: AppServiceSteps.APP_SERVICE_PLANS,
        directory: __dirname,
        options: {
          recordFailedRequests: true,
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
test(
  AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS,
    );
    recording = setupAzureRecording(
      {
        name: AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS,
        directory: __dirname,
        options: {
          recordFailedRequests: true,
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
