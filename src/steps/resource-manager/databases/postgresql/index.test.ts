import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../../test/helpers/recording';
import { steps } from './constants';
import { STEP_AD_ACCOUNT } from '../../../active-directory/constants';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../../resources/constants';
import { steps as storageSteps } from '../../storage/constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  steps.SERVERS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(steps.SERVERS);

    recording = setupAzureRecording(
      {
        name: steps.SERVERS,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies({
      ...stepTestConfig,
      dependencyStepIds: [
        STEP_AD_ACCOUNT,
        STEP_RM_RESOURCES_RESOURCE_GROUPS,
        storageSteps.STORAGE_ACCOUNTS,
      ],
    });
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  steps.DATABASES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(steps.DATABASES);

    recording = setupAzureRecording(
      {
        name: steps.DATABASES,
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
  steps.SERVER_FIREWALL_RULES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.SERVER_FIREWALL_RULES,
    );

    recording = setupAzureRecording(
      {
        name: steps.SERVER_FIREWALL_RULES,
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
