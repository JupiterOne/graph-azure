import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  STEP_ACCESS_PACKAGE,
  STEP_ACCESS_PACKAGE_ASSIGNMENT,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
  STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_RESOURCE,
  STEP_AZURE_APPLICATION,
  STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP,
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
} from './constants';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

test(
  STEP_ACCESS_PACKAGE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_ACCESS_PACKAGE);

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
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

test(
  STEP_ACCESS_PACKAGE_RESOURCE,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_RESOURCE,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_RESOURCE,
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

test(
  STEP_AZURE_APPLICATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_APPLICATION,
    );

    recording = setupAzureRecording({
      name: STEP_AZURE_APPLICATION,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
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
  200_000,
);

test(
  STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP,
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
  200_000,
);

test(
  STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
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

test(
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
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

test(
  STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
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

test(
  STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
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

test(
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    );

    recording = setupAzureRecording({
      name: STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
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
