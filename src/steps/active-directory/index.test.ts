import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';

import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../test/helpers/recording';
import {
  configFromEnv,
  getStepTestConfigForStep,
} from '../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../types';
import {
  fetchAccount,
  fetchGroupMembers,
  fetchGroups,
  fetchUsers,
  fetchServicePrincipals,
  fetchUserRegistrationDetails,
} from './index';
import { createMockAzureStepExecutionContext } from '../../../test/createMockAzureStepExecutionContext';
import {
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  STEP_AD_ROLE_DEFINITIONS,
  STEP_AD_ROLE_ASSIGNMENTS,
  STEP_AD_DEVICES,
  STEP_AD_SERVICE_PRINCIPAL_ACCESS,
  STEP_AD_DOMAIN,
  STEP_AD_ACCOUNT_HAS_DOMAIN,
  ADEntities,
} from './constants';
import { getMockAccountEntity } from '../../../test/helpers/getMockEntity';
import { IntegrationProviderAuthorizationError } from '@jupiterone/integration-sdk-core';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('ad-account', () => {
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-account',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
    });

    await fetchAccount(context);

    const accountEntities = context.jobState.collectedEntities;

    expect(accountEntities).toHaveLength(1);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ADEntities.ACCOUNT._class,
    });

    expect(context.jobState.collectedRelationships).toHaveLength(0);
  });
});

describe('ad-users', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    return { accountEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-users',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await fetchUsers(context);

    const userEntities = context.jobState.collectedEntities;

    expect(userEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ADEntities.USER._class,
    });

    const accountUserRelationships = context.jobState.collectedRelationships;

    expect(accountUserRelationships.length).toBe(userEntities.length);
    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: ACCOUNT_USER_RELATIONSHIP_TYPE },
        },
      },
    });
  });
});

/* TODO record this test for user registration details using valid Tenant. */
/* See https://github.com/JupiterOne/graph-azure/issues/378 */
describe.skip('ad-user-registration-details', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    return { accountEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-user-registration-details',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await fetchUserRegistrationDetails(context);
    await fetchUsers(context);

    const userEntities = context.jobState.collectedEntities;

    expect(userEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ADEntities.USER._class,
      schema: {
        properties: {
          isMfaRegistered: { type: 'boolean' },
        },
      },
    });
  });

  test('403', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-user-registration-details-403',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await expect(fetchUserRegistrationDetails(context)).resolves.not.toThrow(
      IntegrationProviderAuthorizationError,
    );
  });
});

describe('ad-groups', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    return { accountEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-groups',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await fetchGroups(context);

    const groupEntities = context.jobState.collectedEntities;

    expect(groupEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ADEntities.USER_GROUP._class,
    });

    const accountGroupRelationships = context.jobState.collectedRelationships;

    expect(accountGroupRelationships.length).toBe(groupEntities.length);
    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: ACCOUNT_GROUP_RELATIONSHIP_TYPE },
        },
      },
    });
  });
});

describe('ad-domain', () => {
  test(STEP_AD_DOMAIN, async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AD_DOMAIN);

    recording = setupAzureRecording(
      {
        name: STEP_AD_DOMAIN,
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
  });
});

describe('ad-account-domain', () => {
  test(STEP_AD_ACCOUNT_HAS_DOMAIN, async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AD_ACCOUNT_HAS_DOMAIN);

    recording = setupAzureRecording(
      {
        name: STEP_AD_ACCOUNT_HAS_DOMAIN,
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
  });
});

describe('ad-group-members', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await fetchGroups(context);
    await fetchUsers(context);

    const groupEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ADEntities.USER_GROUP._type,
    );
    expect(groupEntities.length).toBeGreaterThan(0);

    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ADEntities.ACCOUNT._type,
    );
    expect(userEntities.length).toBeGreaterThan(0);

    return { groupEntities, userEntities };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-group-members',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { groupEntities, userEntities } = await getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...groupEntities, ...userEntities],
    });

    await fetchGroupMembers(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const groupMemberRelationships = context.jobState.collectedRelationships;

    expect(groupMemberRelationships.length).toBeGreaterThan(0);
    expect(groupMemberRelationships).toMatchDirectRelationshipSchema({});
  });
});

describe('ad-service-principals', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    return { accountEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'ad-service-principals',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [accountEntity],
      setData: {
        [ADEntities.ACCOUNT._type]: accountEntity,
      },
    });

    await fetchServicePrincipals(context);

    const servicePrincipalEntities = context.jobState.collectedEntities;

    expect(servicePrincipalEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ADEntities.SERVICE_PRINCIPAL._class,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: ADEntities.SERVICE_PRINCIPAL._type },
          userType: { const: 'service' },
          function: { type: 'array' },
          username: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          appDisplayName: { type: ['string', 'null'] },
          appId: { type: 'string' },
          servicePrincipalType: {
            type: 'string',
            enum: ['Application', 'SocialIdp', 'ManagedIdentity'],
          },
          servicePrincipalNames: {
            type: 'array',
            items: { type: 'string' },
          },
          _rawData: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    });

    expect(context.jobState.collectedRelationships).toHaveLength(0);

    // /* TODO add account -> service principal relationships. */
    // /* See https://github.com/JupiterOne/graph-azure/issues/380 */
    // const accountServicePrincipalRelationships = context.jobState.collectedRelationships;

    // expect(accountServicePrincipalRelationships.length).toBe(servicePrincipalEntities.length);
    // expect(accountServicePrincipalRelationships).toMatchDirectRelationshipSchema({
    //   schema: {
    //     properties: {
    //       _type: { const: ACCOUNT_SERVICE_PRINCIAL_RELATIONSHIP_TYPE }
    //     }
    //   }
    // })
  });

  test('ad-role-definitions', async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AD_ROLE_DEFINITIONS);

    recording = setupAzureRecording({
      name: STEP_AD_ROLE_DEFINITIONS,
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: stepTestConfig.instanceConfig,
        }),
      },
    });

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  }, 100_000);

  test('ad-role-assignments', async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AD_ROLE_ASSIGNMENTS);

    recording = setupAzureRecording({
      name: STEP_AD_ROLE_ASSIGNMENTS,
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
  }, 100_000);

  test('ad-devices', async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AD_DEVICES);

    recording = setupAzureRecording({
      name: STEP_AD_DEVICES,
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
  }, 100_000);

  test(
    STEP_AD_SERVICE_PRINCIPAL_ACCESS,
    async () => {
      const stepTestConfig = getStepTestConfigForStep(
        STEP_AD_SERVICE_PRINCIPAL_ACCESS,
      );

      recording = setupAzureRecording({
        name: STEP_AD_SERVICE_PRINCIPAL_ACCESS,
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
    100_0000,
  );
});
