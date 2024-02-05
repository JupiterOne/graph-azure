import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { STEP_RM_CDN_ENDPOINTS, STEP_RM_CDN_PROFILE } from './constants';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import { steps as storageSteps } from '../storage/constants';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_CDN_PROFILE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_CDN_PROFILE);

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_PROFILE,
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
  STEP_RM_CDN_ENDPOINTS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_CDN_ENDPOINTS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_CDN_ENDPOINTS,
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
        STEP_RM_CDN_PROFILE,
        storageSteps.STORAGE_ACCOUNTS,
      ],
    });
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);
