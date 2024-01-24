import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { steps as AuthorizationSteps } from './constants';
import { steps as SubscriptionSteps } from '../subscriptions/constants';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  AuthorizationSteps.ROLE_ASSIGNMENTS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.ROLE_ASSIGNMENTS,
    );

    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.ROLE_ASSIGNMENTS,
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
  10_000,
);

test(
  AuthorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS,
    );
    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS,
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
    const mappedRelationships = stepResults.collectedRelationships;

    expect(mappedRelationships.length > 0);
  },
  10_000,
);
test(
  AuthorizationSteps.ROLE_ASSIGNMENT_SCOPES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.ROLE_ASSIGNMENT_SCOPES,
    );
    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.ROLE_ASSIGNMENT_SCOPES,
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

    const stepResults = await executeStepWithDependencies({
      ...stepTestConfig,
      dependencyStepIds: [
        AuthorizationSteps.ROLE_ASSIGNMENTS,
        SubscriptionSteps.SUBSCRIPTION,
      ],
    });

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
  AuthorizationSteps.ROLE_DEFINITIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.ROLE_DEFINITIONS,
    );
    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.ROLE_DEFINITIONS,
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
  10_000,
);

test(
  AuthorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS,
    );
    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS,
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
  10_000,
);

test(
  AuthorizationSteps.CLASSIC_ADMINS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      AuthorizationSteps.CLASSIC_ADMINS,
    );
    recording = setupAzureRecording(
      {
        name: AuthorizationSteps.CLASSIC_ADMINS,
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
    const mappedRelationships = stepResults.collectedRelationships;

    expect(mappedRelationships.length > 0);
  },
  10_000,
);
