import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import {
  mutateSubscriptionAndDirectory,
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import {
  STEP_RM_KEYVAULT_VAULTS,
  KeyVaultStepIds,
  STEP_RM_KEYVAULT_KEYS,
  STEP_RM_KEYVAULT_SECRETS,
} from './constants';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test(
  STEP_RM_KEYVAULT_VAULTS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_KEYVAULT_VAULTS);

    recording = setupAzureRecording(
      {
        name: STEP_RM_KEYVAULT_VAULTS,
        directory: __dirname,
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  500_000,
);

test.only(
  STEP_RM_KEYVAULT_KEYS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_KEYVAULT_KEYS);
    recording = setupAzureRecording(
      {
        name: STEP_RM_KEYVAULT_KEYS,
        directory: __dirname,
        mutateEntry: (entry) => {
          if (![200, 401].includes(entry.response.status)) {
            throw new Error(
              `${STEP_RM_KEYVAULT_KEYS} should only receive 200 and 401 response codes - got ${entry.response.status}`,
            );
          }
          return mutateSubscriptionAndDirectory(
            entry,
            stepTestConfig.instanceConfig,
          );
        },
        options: {
          recordFailedRequests: true,
          matchRequestsBy: {
            ...getMatchRequestsBy({
              config: stepTestConfig.instanceConfig,
            }),
          },
          logLevel: 'info',
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  500_000,
);

test(
  STEP_RM_KEYVAULT_SECRETS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_RM_KEYVAULT_SECRETS);
    recording = setupAzureRecording(
      {
        name: STEP_RM_KEYVAULT_SECRETS,
        directory: __dirname,
        mutateEntry: (entry) => {
          if (![200, 401].includes(entry.response.status)) {
            throw new Error(
              `${STEP_RM_KEYVAULT_SECRETS} should only receive 200 and 401 response codes - got ${entry.response.status}`,
            );
          }
          return mutateSubscriptionAndDirectory(
            entry,
            stepTestConfig.instanceConfig,
          );
        },
        options: {
          recordFailedRequests: true,
          matchRequestsBy: {
            ...getMatchRequestsBy({
              config: stepTestConfig.instanceConfig,
            }),
          },
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  500_000,
);

test(
  KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
    );

    recording = setupAzureRecording(
      {
        name: KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
        directory: __dirname,
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults.collectedRelationships.length).toBeGreaterThan(0);
  },
  500_000,
);
