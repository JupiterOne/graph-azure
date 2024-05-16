import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import { steps } from './constants';
import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  steps.GALLERIES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(steps.GALLERIES);

    recording = setupAzureRecording(
      {
        name: steps.GALLERIES,
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
  steps.SHARED_IMAGES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(steps.SHARED_IMAGES);

    recording = setupAzureRecording(
      {
        name: steps.SHARED_IMAGES,
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
  steps.SHARED_IMAGE_VERSIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.SHARED_IMAGE_VERSIONS,
    );

    recording = setupAzureRecording(
      {
        name: steps.SHARED_IMAGE_VERSIONS,
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
  steps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: steps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS,
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
    const mappedRelationships = stepResults.collectedRelationships.filter(
      (relationship) => relationship._mapping,
    );
    const directRelationships = stepResults.collectedRelationships.filter(
      (relationship) => relationship._mapping!,
    );
    expect(mappedRelationships.length > 0);
    expect(directRelationships.length > 0);
  },
  100_000,
);

test(
  steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
    );

    recording = setupAzureRecording(
      {
        name: steps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
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
  steps.COMPUTE_VIRTUAL_MACHINE_DISKS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.COMPUTE_VIRTUAL_MACHINE_DISKS,
    );

    recording = setupAzureRecording(
      {
        name: steps.COMPUTE_VIRTUAL_MACHINE_DISKS,
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
  steps.COMPUTE_VIRTUAL_MACHINES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.COMPUTE_VIRTUAL_MACHINES,
    );

    recording = setupAzureRecording(
      {
        name: steps.COMPUTE_VIRTUAL_MACHINES,
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
  300_000,
);

test(
  steps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: steps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
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
  steps.VIRTUAL_MACHINE_EXTENSIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.VIRTUAL_MACHINE_EXTENSIONS,
    );

    recording = setupAzureRecording(
      {
        name: steps.VIRTUAL_MACHINE_EXTENSIONS,
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
  steps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: steps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS,
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
  steps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      steps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: steps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS,
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
    expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
  },
  100_000,
);

test('rm-compute-virtual-machines-scale-sets', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    steps.VIRTUAL_MACHINE_SCALE_SETS,
  );

  recording = setupAzureRecording(
    {
      name: steps.VIRTUAL_MACHINE_SCALE_SETS,
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
}, 100_000);

test('rm-virtual-machines-scale-sets-relationships', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    steps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS,
  );

  recording = setupAzureRecording(
    {
      name: steps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS,
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
}, 100_000);

test('rm-virtual-machines-scale-sets-image-relationships', async () => {
  const stepTestConfig = getStepTestConfigForStep(
    steps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS,
  );

  recording = setupAzureRecording(
    {
      name: steps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS,
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
}, 100_000);
