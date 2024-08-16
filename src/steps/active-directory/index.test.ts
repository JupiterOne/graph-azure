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
import { IntegrationConfig, IntegrationStepContext } from '../../types';
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
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_ENTITY_CLASS,
  USER_ENTITY_CLASS,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  GROUP_ENTITY_TYPE,
  GROUP_ENTITY_CLASS,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  STEP_AD_ROLE_DEFINITIONS,
  STEP_AD_ROLE_ASSIGNMENTS,
  STEP_AD_DEVICES,
  STEP_AD_SERVICE_PRINCIPAL_ACCESS,
  STEP_AD_DOMAIN,
  STEP_AD_ACCOUNT_HAS_DOMAIN,
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

    await fetchAccount(context as IntegrationStepContext);

    const accountEntities = context.jobState.collectedEntities;

    expect(accountEntities).toHaveLength(1);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: ACCOUNT_ENTITY_CLASS,
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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchUsers(context as IntegrationStepContext);

    const userEntities = context.jobState.collectedEntities;

    expect(userEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: USER_ENTITY_CLASS,
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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchUserRegistrationDetails(context  as IntegrationStepContext);
    await fetchUsers(context as IntegrationStepContext);

    const userEntities = context.jobState.collectedEntities;

    expect(userEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: USER_ENTITY_CLASS,
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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await expect(fetchUserRegistrationDetails(context as IntegrationStepContext)).resolves.not.toThrow(
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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchGroups(context as IntegrationStepContext);

    const groupEntities = context.jobState.collectedEntities;

    expect(groupEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: GROUP_ENTITY_CLASS,
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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchGroups(context as IntegrationStepContext);
    await fetchUsers(context as IntegrationStepContext);

    const groupEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === GROUP_ENTITY_TYPE,
    );
    expect(groupEntities.length).toBeGreaterThan(0);

    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === USER_ENTITY_TYPE,
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

    await fetchGroupMembers(context as IntegrationStepContext);

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
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchServicePrincipals(context as IntegrationStepContext);

    const servicePrincipalEntities = context.jobState.collectedEntities;

    expect(servicePrincipalEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: SERVICE_PRINCIPAL_ENTITY_CLASS,
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: SERVICE_PRINCIPAL_ENTITY_TYPE },
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
