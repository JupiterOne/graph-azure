import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  STEP_RM_CONTAINER_REGISTRIES,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './constants';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import { steps as storageSteps } from '../storage/constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_CONTAINER_REGISTRIES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_CONTAINER_REGISTRIES,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_CONTAINER_REGISTRIES,
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
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
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
