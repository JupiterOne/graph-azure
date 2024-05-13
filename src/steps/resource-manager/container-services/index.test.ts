import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  ContainerServiceMappedRelationships,
  STEP_RM_CONTAINER_SERVICES_CLUSTERS,
  Steps,
} from './constants';
import { getConfigForTest } from '../security/__tests__/utils';

let recording: Recording | undefined;
afterEach(async () => {
  if (recording) await recording.stop();
});

test('rm-container-services-clusters', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    STEP_RM_CONTAINER_SERVICES_CLUSTERS,
  );
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );

  recording = setupAzureRecording(
    {
      directory: __dirname,
      name: 'rm-container-services-clusters',
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
}, 100_000);

test('rm-maintenance-configurations', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    Steps.MAINTENANCE_CONFIGURATION,
  );
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );

  recording = setupAzureRecording(
    {
      directory: __dirname,
      name: 'rm-maintenance-configurations',
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
}, 100_000);

test('rm-access-role', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.ACCESS_ROLE);
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );

  recording = setupAzureRecording(
    {
      directory: __dirname,
      name: 'rm-access-role',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: stepTestConfig.instanceConfig,
        }),
        recordFailedRequests: true,
      },
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  const mappedRelationship = stepResults.collectedRelationships.filter(
    (r) =>
      r._type ===
      ContainerServiceMappedRelationships
        .TRUSTED_ACCESS_ROLE_IS_KUBERNETES_CLUSTER._type,
  );
  expect(mappedRelationship.length).toBeGreaterThan(0);
}, 100_000);

test('rm-kubernetes-service', async () => {
  const stepTestConfig = getStepTestConfigForStep(Steps.KUBERNETES_SERVICE);
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );

  recording = setupAzureRecording(
    {
      directory: __dirname,
      name: 'rm-kubernetes-service',
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
}, 100_000);

test('rm-kubernetes-service-contains-access-role-relationship', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE,
  );
  stepTestConfig.instanceConfig = getConfigForTest(
    stepTestConfig.instanceConfig,
  );

  recording = setupAzureRecording(
    {
      directory: __dirname,
      name: 'rm-kubernetes-service-contains-access-role-relationship',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: stepTestConfig.instanceConfig,
        }),
        recordFailedRequests: true,
      },
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);
