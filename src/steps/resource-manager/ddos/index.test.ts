import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { DdosSteps } from './constant';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  DdosSteps.PROTECTION_PLAN,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(DdosSteps.PROTECTION_PLAN);

    recording = setupAzureRecording(
      {
        name: DdosSteps.PROTECTION_PLAN,
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
  DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP,
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
  DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP,
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
  DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP,
    );

    recording = setupAzureRecording(
      {
        name: DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP,
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
