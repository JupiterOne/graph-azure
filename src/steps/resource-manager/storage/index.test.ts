import {
  executeStepWithDependencies,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import { steps } from './constants';

let recording: Recording | undefined;

afterEach(async () => {
  await recording?.stop();
});

test('rm-storage-resources', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.STORAGE_ACCOUNTS);

  recording = setupAzureRecording(
    {
      name: steps.STORAGE_ACCOUNTS,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 100_000);

test('rm-storage-containers', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.STORAGE_CONTAINERS);

  recording = setupAzureRecording(
    {
      name: steps.STORAGE_CONTAINERS,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 500_000);

test('rm-storage-file-shares', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.STORAGE_FILE_SHARES);

  recording = setupAzureRecording(
    {
      name: steps.STORAGE_FILE_SHARES,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 200_000);

test('rm-storage-queues', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.STORAGE_QUEUES);

  recording = setupAzureRecording(
    {
      name: steps.STORAGE_QUEUES,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 200_000);

test('rm-storage-tables', async () => {
  const stepTestConfig = getStepTestConfigForStep(steps.STORAGE_TABLES);

  recording = setupAzureRecording(
    {
      name: steps.STORAGE_TABLES,
      directory: __dirname,
    },
    stepTestConfig.instanceConfig,
  );

  const stepResults = await executeStepWithDependencies(stepTestConfig);
  expect(stepResults).toMatchStepMetadata(stepTestConfig);
}, 200_000);
